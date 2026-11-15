import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { createApiAuth } from '../app/utils/api-auth.js';

const requireNuxt = createRequire(import.meta.resolve('nuxt'));
const { computed, ref } = requireNuxt('vue');
const pluginSource = readFileSync(new URL('../app/plugins/api-auth.client.js', import.meta.url), 'utf8');
const authPath = new URL('../app/composables/useAuth.js', import.meta.url);
const authSource = existsSync(authPath) ? readFileSync(authPath, 'utf8') : null;
const base = 'https://api.example/prefix';
const isPrivateApiPage = path => path === '/dashboard' || path.startsWith('/dashboard/');

function fixture({ path = '/dashboard', callback = false } = {}) {
  const jwt = `header.${Buffer.from(JSON.stringify({ email: 'staff@example.com', name: 'Staff' })).toString('base64url')}.signature`;
  const storage = new Map([
    ['auth_token', 'stored-token'], ['auth_user', JSON.stringify({ email: 'staff@example.com' })],
  ]);
  const localStorage = {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key),
  };
  const requests = [];
  const redirects = [];
  const states = new Map();
  let rejectToken = false;
  const useState = (key, init) => {
    if (!states.has(key)) states.set(key, ref(init()));
    return states.get(key);
  };
  const window = {
    location: new URL(`https://frontend.example${path}${callback ? `?token=${jwt}` : ''}`),
    history: { replaceState() {} },
    fetch: async (url, init) => {
      const authorization = new Headers(init?.headers).get('Authorization');
      requests.push({ url, authorization });
      return new Response(JSON.stringify([]), {
        status: rejectToken && authorization ? 401 : 200,
        headers: { 'Content-Type': 'application/json' },
      });
    },
    XMLHttpRequest: class extends EventTarget { open() {} setRequestHeader() {} send() {} },
  };
  const useRuntimeConfig = () => ({ public: { apiUrl: base } });
  let auth;
  if (authSource) {
    const source = authSource.replace(/^import .*\r?\n/gm, '')
      .replace('export const useAuth', 'const useAuth').replaceAll('import.meta.client', 'true');
    auth = new Function('ref', 'computed', 'useState', 'useRuntimeConfig', 'window', 'localStorage', 'document', 'fetch', 'navigateTo',
      `${source}; return useAuth();`)(
      ref, computed, useState, useRuntimeConfig, window, localStorage, { title: 'test' },
      (...args) => window.fetch(...args), path => redirects.push(path),
    );
  }
  const source = pluginSource.replace(/^import .*\r?\n/gm, '')
    .replace('export default', 'return').replaceAll('import.meta.hot', 'false');
  const axios = { interceptors: {
    request: { use() {}, eject() {} }, response: { use() {}, eject() {} },
  } };
  const plugin = new Function('defineNuxtPlugin', 'createApiAuth', 'useRuntimeConfig', 'useAuth', 'useState', 'window', 'localStorage',
    'getApiBase', 'axios', 'isPrivateApiPage', source)(
    value => value, createApiAuth, useRuntimeConfig, () => auth, useState, window, localStorage,
    () => `${base}/api/tukib`, axios, isPrivateApiPage,
  );
  plugin.setup({ runWithContext: callback => callback() });
  return { window, auth, storage, states, requests, redirects, jwt, reject: () => { rejectToken = true; } };
}

test('real client plugin restores login before the first component or role-permission request', async () => {
  for (const callback of [false, true]) {
    const subject = fixture({ callback });
    await new Promise(resolve => setImmediate(resolve));
    const expected = callback ? subject.jwt : 'stored-token';
    await subject.window.fetch(`${base}/api/tukib/admin/abstracts/`);
    assert.equal(subject.requests.at(-1).authorization, `Bearer ${expected}`);
    for (const request of subject.requests.filter(row => row.url.includes('role-permissions'))) {
      assert.equal(request.authorization, `Bearer ${expected}`);
    }
    await subject.window.fetch('https://external.example/api/list/');
    assert.equal(subject.requests.at(-1).authorization, null);
  }
});

test('an expired saved session is cleared while public reads remain available', async () => {
  const subject = fixture({ path: '/news-updates' });
  await new Promise(resolve => setImmediate(resolve));
  subject.reject();
  const response = await subject.window.fetch(`${base}/api/tukib/public-content/`);
  assert.equal(response.status, 200);
  assert.equal(subject.storage.has('auth_token'), false);
  assert.deepEqual(subject.redirects, []);
});
