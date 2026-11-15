import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import moment from 'moment';

const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const vueRequire = createRequire(nuxtRequire.resolve('vue'));
const Vue = vueRequire('vue');
const { parse, compileScript } = vueRequire('@vue/compiler-sfc');
const VueSSR = vueRequire('@vue/server-renderer');
const { renderToString } = VueSSR;
const { descriptor } = parse(readFileSync(new URL('../app/components/BlogPosting.vue', import.meta.url), 'utf8'));
const compile = ssr => compileScript(descriptor, {
  id: 'blog-hydration', inlineTemplate: true, templateOptions: { ssr },
}).content
  .replace(/import \{([^}]+)\} from ["']vue["'];?/g, (_, bindings) =>
    `const {${bindings.replace(/\bas\b/g, ':')}} = Vue;`)
  .replace(/import \{([^}]+)\} from ["']vue\/server-renderer["'];?/g, (_, bindings) =>
    `const {${bindings.replace(/\bas\b/g, ':')}} = VueSSR;`)
  .replace(/^import .* from ["'](?:moment|lodash)["'];?\r?$/gm, '')
  .replace('export default', 'return');
const compiled = { server: compile(true), client: compile(false) };

const news = [{ id: 1, title: 'Server news', filters: 'News, Published', date: '2026-11-16', files: [], links: [] }];
const cachedNews = [{ ...news[0], id: 2, title: 'Browser-only cached news' }];

async function render({ client = false, rows = news, pending = false, browserCache = cachedNews, initialCache = [] } = {}) {
  let cacheReads = 0;
  const storage = {
    getItem() { cacheReads++; return JSON.stringify(browserCache); },
    setItem() {},
  };
  const useAsyncData = (key, handler, options) => {
    const data = Vue.ref(client && !pending ? rows : options.default());
    const status = Vue.ref(client && !pending ? 'success' : 'pending');
    const isPending = Vue.ref(status.value === 'pending');
    if (!client && !pending) {
      // Nuxt resolves its server prefetch after setup, when ordinary SSR
      // watchers no longer run. The template must use this data directly.
      Vue.onServerPrefetch(() => {
        data.value = rows;
        status.value = 'success';
        isPending.value = false;
      });
    }
    return { data, status, pending: isPending, error: Vue.ref(null) };
  };
  const component = new Function(
    'Vue', 'VueSSR', 'moment', 'useRuntimeConfig', 'useState', 'useAsyncData', 'useHead', 'process', 'sessionStorage', 'Image',
    compiled[client ? 'client' : 'server'],
  )(
    Vue, VueSSR, moment, () => ({ public: { apiUrl: 'https://example.test' } }),
    () => Vue.ref(initialCache), useAsyncData, () => {}, { client }, storage,
    client ? class {} : undefined,
  );
  const html = await renderToString(Vue.createSSRApp(component));
  return {
    html: html.replace(/ data-v-blog-hydration/g, '')
      .replace(/class="([^"]*)"/g, (_, classes) => `class="${classes.split(/\s+/).filter(Boolean).sort().join(' ')}"`)
      .replace(/<!--[\s\S]*?-->/g, comment => /<!--\[|<!--\]/.test(comment) ? comment : '<!---->'),
    cacheReads,
  };
}

function assertSameMarkup(client, server) {
  const firstDifference = [...client].findIndex((character, index) => character !== server[index]);
  assert.ok(client === server, `Markup differs near ${firstDifference}: client ${client.slice(firstDifference, firstDifference + 150)}; server ${server.slice(firstDifference, firstDifference + 150)}`);
}

test('server-prefetched articles match the first client render', async () => {
  const server = await render();
  const client = await render({ client: true });
  assert.match(server.html, /Server news/);
  assertSameMarkup(client.html, server.html);
  assert.equal(client.cacheReads, 0);
});

test('a successful empty response stays empty during hydration despite older browser cache', async () => {
  const server = await render({ rows: [] });
  const client = await render({ client: true, rows: [] });
  assert.match(server.html, /No news posted yet/);
  assertSameMarkup(client.html, server.html);
  assert.equal(client.cacheReads, 0);
});

test('pending server and client renders both show skeletons before browser cache restoration', async () => {
  const server = await render({ pending: true });
  const client = await render({ client: true, pending: true });
  assert.match(server.html, /skeleton-box/);
  assertSameMarkup(client.html, server.html);
  assert.equal(client.cacheReads, 0);
});

test('server rendering cached news never tries to construct browser Image objects', async () => {
  const server = await render({ initialCache: news });
  assert.match(server.html, /Server news/);
});
