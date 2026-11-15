/** Attach the current sign-in token only to the configured Django API. */
export function createApiAuth({ apiUrl, pageUrl, getToken, onUnauthorized }) {
  let apiBase;
  try {
    if (apiUrl) apiBase = new URL(apiUrl, pageUrl);
  } catch {
    // Missing/invalid configuration must never send a token to another host.
  }
  const apiPath = apiBase && `${apiBase.pathname.replace(/\/+$/, '')}/api/`;

  function authorizationFor(input) {
    if (!apiBase) return null;
    let url;
    try {
      url = new URL(input instanceof Request ? input.url : input, pageUrl);
    } catch {
      return null;
    }
    if (url.origin !== apiBase.origin || !url.pathname.startsWith(apiPath)) return null;
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

  return { wrapFetch, installAxios };
}
