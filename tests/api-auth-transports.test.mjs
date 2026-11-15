import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApiAuth } from '../app/utils/api-auth.js';

const base = 'https://apipdp.lsu.edu.ph/buang_ka_eyy';
const pageUrl = 'https://tukib.lsu.edu.ph/dashboard';
const options = { apiUrl: base, pageUrl, getToken: () => 'current-token' };

class UploadRequest extends EventTarget {
  open(method, url) { this.method = method; this.url = url; this.headers = new Headers(); }
  setRequestHeader(key, value) { this.headers.append(key, value); }
  send(body) { this.body = body; }
  finish(status) { this.status = status; this.dispatchEvent(new Event('loadend')); }
}

test('API URL configuration accepts root, deployment prefix, and module base', async () => {
  for (const apiUrl of [base, `${base}/`, `${base}/api`, `${base}/api/tukib/`]) {
    const request = createApiAuth({ ...options, apiUrl }).wrapFetch(async (url, init) => {
      assert.equal(init.headers.get('Authorization'), 'Bearer current-token');
      return new Response('{}');
    });
    await request(`${base}/api/tukib/admin/abstracts/`);
  }
});

test('module credentials do not leak to sibling modules or prefix lookalikes', async () => {
  const request = createApiAuth({ ...options, apiUrl: `${base}/api/tukib` }).wrapFetch(async (url, init) => {
    assert.equal(new Headers(init?.headers).has('Authorization'), false);
    return new Response('{}');
  });
  for (const path of ['/api/animorun/list/', '/api/tukib-other/', '/api/tukib/../../outside/']) {
    await request(`${base}${path}`);
  }
});

test('native uploads send the current token without changing multipart or progress handling', () => {
  let token = 'first-token';
  const remove = createApiAuth({ ...options, getToken: () => token }).installXHR(UploadRequest);
  try {
    const xhr = new UploadRequest();
    const body = new FormData();
    body.append('video_file', new Blob(['video']), 'presentation.mp4');
    xhr.open('POST', `${base}/api/tukib/submit-presentation/`, true);
    token = 'new-token';
    xhr.send(body);
    assert.equal(xhr.body, body);
    assert.equal(xhr.headers.get('Authorization'), 'Bearer new-token');
    assert.equal(xhr.headers.has('Content-Type'), false);

    xhr.open('POST', 'https://storage.example/upload');
    xhr.send(body);
    assert.equal(xhr.headers.has('Authorization'), false);
  } finally { remove(); }
});

test('XHR respects explicit credentials and only logs out a rejected current session', () => {
  let token = 'current-token';
  let logouts = 0;
  const remove = createApiAuth({ ...options, getToken: () => token, onUnauthorized: () => { logouts++; } }).installXHR(UploadRequest);
  try {
    const request = (authorization) => {
      const xhr = new UploadRequest();
      xhr.open('POST', `${base}/api/tukib/submit-presentation/`);
      if (authorization) xhr.setRequestHeader('authorization', authorization);
      xhr.send(new FormData());
      return xhr;
    };
    const explicit = request('Token custom-token');
    assert.equal(explicit.headers.get('Authorization'), 'Token custom-token');
    explicit.finish(401);
    assert.equal(logouts, 0);
    request().finish(403);
    assert.equal(logouts, 0);
    const old = request();
    token = 'new-token';
    old.finish(401);
    assert.equal(logouts, 0);
    request().finish(401);
    assert.equal(logouts, 1);
  } finally { remove(); }
  const xhr = new UploadRequest();
  xhr.open('POST', `${base}/api/tukib/submit-presentation/`);
  xhr.send();
  assert.equal(xhr.headers.has('Authorization'), false);
});

test('all HTTP methods attach credentials, retain request data, and track login changes', async () => {
  let token = 'current-token';
  const request = createApiAuth({ ...options, getToken: () => token }).wrapFetch(async (url, init) => {
    assert.equal(init.headers.get('Authorization'), token ? `Bearer ${token}` : null);
    return new Response('{}');
  });
  for (const method of ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']) {
    await request(`${base}/api/animorun/rankings/`, { method });
  }
  token = 'new-login';
  await request(`${base}/api/animorun/rankings/`);
  token = null;
  await request(`${base}/api/animorun/rankings/`, { headers: new Headers() });
});

test('an expired login retries public reads once anonymously, without replaying writes', async () => {
  for (const method of ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']) {
    let token = 'expired';
    const calls = [];
    const request = createApiAuth({
      ...options, getToken: () => token, onUnauthorized: () => { token = null; },
    }).wrapFetch(async (url, init) => {
      const authorization = init.headers.get('Authorization');
      calls.push(authorization);
      return new Response(null, { status: authorization ? 401 : 200 });
    });
    const response = await request(`${base}/api/animorun/slot-count/`, { method });
    const safeRead = method === 'GET' || method === 'HEAD';
    assert.deepEqual(calls, safeRead ? ['Bearer expired', null] : ['Bearer expired']);
    assert.equal(response.status, safeRead ? 200 : 401);
  }
});
