import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const vueRequire = createRequire(nuxtRequire.resolve('vue'));
const Vue = vueRequire('vue');
const { parse, compileScript } = vueRequire('@vue/compiler-sfc');
const { renderToString } = vueRequire('@vue/server-renderer');
const source = readFileSync(new URL('../app/components/SuperAdminDashboard.vue', import.meta.url), 'utf8');
const { descriptor } = parse(source);
const compiled = compileScript(descriptor, { id: 'dashboard-test', inlineTemplate: true }).content
  .replace(/import \{([^}]+)\} from ["']vue["'];?/g, (_, bindings) =>
    `const {${bindings.replace(/\bas\b/g, ':')}} = Vue;`)
  .replace(/^import .* from ["'](?:vue-router|~\/components\/AnimoRunList.vue)["'];?\r?$/gm, '')
  .replace('export default', 'return');

function dashboard(initialToken = null, callbackToken) {
  const token = Vue.ref(initialToken);
  const redirects = [];
  const auth = {
    user: Vue.ref({ email: 'runner@example.com' }),
    isLoggedIn: Vue.computed(() => !!token.value),
    init() {},
    setAuth(value) { token.value = value; },
    logout() { token.value = null; },
  };
  const component = new Function(
    'Vue', 'useRouter', 'useRoute', 'useRuntimeConfig', 'useAuth', '$fetch', 'AnimoRunList', compiled,
  )(
    Vue, () => ({ replace: path => redirects.push(path) }),
    () => ({ query: { token: callbackToken } }),
    () => ({ public: { apiUrl: 'https://example.com' } }),
    () => auth, async () => [], {},
  );
  function configure(app) {
    for (const [, name] of compiled.matchAll(/_resolveComponent\("([^"]+)"\)/g)) {
      app.component(name, { inheritAttrs: false, render: () => Vue.h('span') });
    }
    // The navigation's existing menuList binding is outside this regression.
    app.config.globalProperties.menuList = [];
    return app;
  }
  return { component, configure, auth, redirects };
}

function mount(subject) {
  const node = (type, text = '') => ({ type, text, children: [], parent: null });
  const remove = child => {
    const siblings = child.parent.children;
    siblings.splice(siblings.indexOf(child), 1);
    child.parent = null;
  };
  const renderer = Vue.createRenderer({
    createElement: type => node(type),
    createText: text => node('text', text),
    createComment: text => node('comment', text),
    insert(child, parent, anchor) {
      if (child.parent) remove(child);
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
      child.parent = parent;
    },
    remove,
    setText(child, text) { child.text = text; },
    setElementText(child, text) { child.text = text; child.children = []; },
    patchProp() {},
    parentNode: child => child.parent,
    nextSibling(child) {
      const siblings = child.parent?.children ?? [];
      return siblings[siblings.indexOf(child) + 1] ?? null;
    },
  });
  const root = node('root');
  const app = subject.configure(renderer.createApp(subject.component));
  app.mount(root);
  return { app, root };
}

test('server and first client render match when the auth plugin has already restored login', async () => {
  const server = dashboard();
  const client = dashboard('stored-token');
  const serverHtml = await renderToString(server.configure(Vue.createSSRApp(server.component)));
  const clientHtml = await renderToString(client.configure(Vue.createSSRApp(client.component)));
  assert.equal(clientHtml, serverHtml);
  assert.match(serverHtml, /<!--v-if-->/);
});

test('authenticated content appears after mounting and disappears on logout', async () => {
  const subject = dashboard('stored-token');
  const { app, root } = mount(subject);
  await Vue.nextTick();
  assert.equal(root.children[0].children[0].type, 'div');
  assert.deepEqual(subject.redirects, []);
  subject.auth.logout();
  await Vue.nextTick();
  assert.equal(root.children[0].children[0].type, 'comment');
  app.unmount();
});

test('logged-out visitors stay hidden and redirect to login', async () => {
  const subject = dashboard();
  const { app, root } = mount(subject);
  await Vue.nextTick();
  assert.equal(root.children[0].children[0].type, 'comment');
  assert.deepEqual(subject.redirects, ['/login']);
  app.unmount();
});

test('OAuth callbacks still authenticate and open the dashboard after mounting', async () => {
  const subject = dashboard(null, 'callback-token');
  const { app, root } = mount(subject);
  await Vue.nextTick();
  assert.equal(subject.auth.isLoggedIn.value, true);
  assert.equal(root.children[0].children[0].type, 'div');
  assert.deepEqual(subject.redirects, ['/dashboard']);
  app.unmount();
});
