/** Attach the current sign-in token only to the configured Django API. */
export function createApiAuth({ apiUrl, pageUrl, getToken, onUnauthorized }) {
  let apiBase;
  try {
    if (apiUrl) apiBase = new URL(apiUrl, pageUrl);
  } catch {
    // Missing/invalid configuration must never send a token to another host.
  }
  const basePath = apiBase?.pathname.replace(/\/+$/, '');
  const apiPath = apiBase && (/\/api(?:\/|$)/.test(basePath) ? `${basePath}/` : `${basePath}/api/`);

  function authorizationFor(input) {
    if (!apiBase) return null;
    let url;
    try {
      url = new URL(input instanceof Request ? input.url : input, pageUrl);
    } catch {
      return null;
    }
    if (url.origin !== apiBase.origin || !(url.pathname === apiPath.slice(0, -1) || url.pathname.startsWith(apiPath))) return null;
    const token = getToken();
    return token ? `Bearer ${token}` : null;
  }

  function wrapFetch(originalFetch) {
    return async (input, options) => {
      const authorization = authorizationFor(input);
      if (!authorization) return originalFetch(input, options);

      const headers = new Headers(options?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (!headers.has('Authorization')) headers.set('Authorization', authorization);
      const response = await originalFetch(input, { ...options, headers });
      // A late response for an old token must not log out a newly signed-in user.
      if (response.status === 401 && headers.get('Authorization') === authorizationFor(input)) {
        onUnauthorized?.();
        // An expired login must not block an otherwise public read. Retry once
        // anonymously after clearing the session; never replay a submission.
        const method = (options?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
        if (!getToken() && (method === 'GET' || method === 'HEAD')) {
          headers.delete('Authorization');
          return originalFetch(input, { ...options, headers });
        }
      }
      return response;
    };
  }

  function installAxios(axios) {
    const interceptor = axios.interceptors.request.use((options) => {
      const authorization = authorizationFor(axios.getUri(options));
      if (authorization && !options.headers.has('Authorization')) {
        options.headers.set('Authorization', authorization);
      }
      return options;
    });
    const checkResponse = (response) => {
      const options = response?.config;
      if (response?.status === 401 && options) {
        const authorization = authorizationFor(axios.getUri(options));
        if (authorization && options.headers.get('Authorization') === authorization) {
          onUnauthorized?.();
        }
      }
    };
    const responseInterceptor = axios.interceptors.response.use(
      (response) => { checkResponse(response); return response; },
      (error) => { checkResponse(error.response); return Promise.reject(error); },
    );
    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }

  // Keep upload progress support while authenticating native XHR uploads.
  function installXHR(XMLHttpRequest) {
    const prototype = XMLHttpRequest.prototype;
    const originalOpen = prototype.open;
    const originalSetHeader = prototype.setRequestHeader;
    const originalSend = prototype.send;
    const requests = new WeakMap();
    function open(method, url, ...args) {
      const result = originalOpen.call(this, method, url, ...args);
      requests.set(this, { url, authorization: null });
      return result;
    }
    function setRequestHeader(name, value) {
      const result = originalSetHeader.call(this, name, value);
      const request = requests.get(this);
      if (request && name.toLowerCase() === 'authorization') request.authorization = value;
      return result;
    }
    function send(body) {
      const request = requests.get(this);
      const authorization = request && authorizationFor(request.url);
      if (authorization) {
        if (request.authorization === null) {
          originalSetHeader.call(this, 'Authorization', authorization);
          request.authorization = authorization;
        }
        this.addEventListener('loadend', () => {
          if (this.status === 401 && request.authorization === authorizationFor(request.url)) onUnauthorized?.();
        }, { once: true });
      }
      return originalSend.call(this, body);
    }
    prototype.open = open;
    prototype.setRequestHeader = setRequestHeader;
    prototype.send = send;
    return () => {
      if (prototype.open === open) prototype.open = originalOpen;
      if (prototype.setRequestHeader === setRequestHeader) prototype.setRequestHeader = originalSetHeader;
      if (prototype.send === send) prototype.send = originalSend;
    };
  }

  return { wrapFetch, installAxios, installXHR };
}
