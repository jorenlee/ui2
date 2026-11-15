import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import axios from 'axios';
import { createApiAuth } from '../app/utils/api-auth.js';

// Resolve the actual ofetch version used by Nuxt, including pnpm installs.
const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const { $fetch } = await import(pathToFileURL(nuxtRequire.resolve('ofetch')).href);
const apiUrl = 'https://apipdp.lsu.edu.ph/buang_ka_eyy';
const pageUrl = 'https://lsu.edu.ph/dashboard';
const options = { apiUrl, pageUrl, getToken: () => 'signed-in-jwt' };
const echo = async (input, init) => new Response(JSON.stringify({
  authorization: new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined)).get('Authorization'),
}), { headers: { 'Content-Type': 'application/json' } });

test('the existing Nuxt/ofetch instance and native fetch both send the current JWT', async () => {
  const originalFetch = globalThis.fetch;
  let token = 'first-login';
  const auth = createApiAuth({ ...options, getToken: () => token });
  globalThis.fetch = auth.wrapFetch(echo);
  try {
    for (const path of [
      '/api/animorun/my-registration/?email=user%40lsu.edu.ph',
      '/api/cits/role-permissions/list/?email=user%40lsu.edu.ph',
      '/api/cits/request-ticket/list/', '/api/animorun/slot-count/',
      '/api/animorun/list/', '/api/animorun/batch/list/',
      '/api/animorun/failed-notifications/',
    ]) {
      assert.equal((await $fetch(`${apiUrl}${path}`)).authorization, 'Bearer first-login');
    }
    token = 'new-login';
    assert.equal((await $fetch(`${apiUrl}/api/animorun/list/`)).authorization, 'Bearer new-login');
    assert.equal((await (await fetch(`${apiUrl}/api/cits/role-permissions/list/`)).json()).authorization, 'Bearer new-login');
    token = null;
    assert.equal((await $fetch(`${apiUrl}/api/animorun/list/`)).authorization, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('credentials stay within the configured API origin and path prefix', async () => {
  const fetch = createApiAuth(options).wrapFetch(echo);
  for (const url of [
    'https://apipdp.lsu.edu.ph.attacker.example/buang_ka_eyy/api/list/',
    'https://other.example/buang_ka_eyy/api/list/',
    'http://apipdp.lsu.edu.ph/buang_ka_eyy/api/list/',
    'https://apipdp.lsu.edu.ph/api/list/',
    'https://apipdp.lsu.edu.ph/buang_ka_eyy/administrator/',
    'https://apipdp.lsu.edu.ph/buang_ka_eyy/api/../../outside/',
    '/api/auth/google',
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  ]) {
    assert.equal((await (await fetch(url)).json()).authorization, null, url);
  }
  for (const apiUrl of [undefined, '', 'http://[invalid']) {
    const safeFetch = createApiAuth({ ...options, apiUrl }).wrapFetch(echo);
    assert.equal((await (await safeFetch(`${options.apiUrl}/api/list/`)).json()).authorization, null);
  }
});

test('local and relative API URLs work without changing caller credentials', async () => {
  const fetch = createApiAuth({ ...options, apiUrl: '/', pageUrl: 'http://localhost:8000/dashboard' }).wrapFetch(echo);
  assert.equal((await (await fetch('/api/list/')).json()).authorization, 'Bearer signed-in-jwt');
  const productionFetch = createApiAuth(options).wrapFetch(echo);
  const request = new Request(`${apiUrl}/api/list/`, { headers: { Authorization: 'Token django-token' } });
  assert.equal((await (await productionFetch(request)).json()).authorization, 'Token django-token');
  assert.equal((await (await productionFetch(request, {
    headers: [['Authorization', 'Bearer explicit-token']],
  })).json()).authorization, 'Bearer explicit-token');
});

test('uploads retain their body, content type handling and abort signal', async () => {
  const body = new FormData();
  body.append('file', new Blob(['image bytes']), 'upload.png');
  const controller = new AbortController();
  const fetch = createApiAuth(options).wrapFetch(async (url, init) => {
    assert.equal(init.body, body);
    assert.equal(init.method, 'POST');
    assert.equal(init.signal, controller.signal);
    assert.equal(init.headers.has('Content-Type'), false);
    assert.equal(init.headers.get('Authorization'), 'Bearer signed-in-jwt');
    return new Response('{}');
  });
  await fetch(`${apiUrl}/api/animorun/upload/`, { method: 'POST', body, signal: controller.signal });
});

test('only rejection of the current sign-in token ends the session', async () => {
  let token = 'expired-jwt';
  let logouts = 0;
  const auth = createApiAuth({ ...options, getToken: () => token, onUnauthorized: () => { logouts++; token = null; } });
  const fetch = auth.wrapFetch(async () => new Response('{}', { status: 401 }));
  await fetch(`${apiUrl}/api/list/`, { headers: { Authorization: 'Token different-credential' } });
  assert.equal(logouts, 0);
  await fetch(`${apiUrl}/api/list/`);
  await fetch(`${apiUrl}/api/list/`);
  assert.equal(logouts, 1);
  token = 'old-jwt';
  const delayedFetch = auth.wrapFetch(async () => { token = 'new-jwt'; return new Response('{}', { status: 401 }); });
  await delayedFetch(`${apiUrl}/api/list/`);
  assert.equal(logouts, 1);
  await auth.wrapFetch(async () => new Response('{}', { status: 403 }))(`${apiUrl}/api/list/`);
  assert.equal(logouts, 1);
});

test('Axios adds API credentials and preserves explicit credentials and external calls', async () => {
  const client = axios.create({ adapter: async (config) => ({
    data: config.headers.get('Authorization'), status: 200, headers: {}, config,
  }) });
  const remove = createApiAuth(options).installAxios(client);
  assert.equal((await client.get(`${apiUrl}/api/list/`)).data, 'Bearer signed-in-jwt');
  assert.equal((await client.get('list/', { baseURL: `${apiUrl}/api/` })).data, 'Bearer signed-in-jwt');
  assert.equal((await client.get(`${apiUrl}/api/list/`, { headers: { Authorization: 'Token explicit' } })).data, 'Token explicit');
  assert.equal((await client.get('https://other.example/api/list/')).data, undefined);
  remove();
  assert.equal((await client.get(`${apiUrl}/api/list/`)).data, undefined);
});
