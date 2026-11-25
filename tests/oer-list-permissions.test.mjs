import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const vueRequire = createRequire(nuxtRequire.resolve('vue'));
const Vue = vueRequire('vue');
const { renderToString } = vueRequire('@vue/server-renderer');
const { parse, compileScript, compileTemplate } = vueRequire('@vue/compiler-sfc');
const filename = new URL('../app/components/OER/List.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: 'oer-list-test' }).content
  .replace(/^import .+;\r?$/gm, '').replace('export default', 'return');
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'oer-list-test' });
assert.deepEqual(template.errors, []);
const render = new Function('Vue', template.code
  .replace(/import \{([^}]+)\} from ["']vue["'];?/g, (_, bindings) => `const {${bindings.replace(/\bas\b/g, ':')}} = Vue;`)
  .replace('export function render', 'return function render'))(Vue);
const resource = { id: 1, title: 'Lesson', tracking_id: 'OER1', type_of_entry: 'Document', logs: [] };
const permission = (roles, email = 'user@lsu.edu.ph') => ({ email, role_filter_permissions: roles });

function subject(records = [], fetch = async () => [], account = { email: 'user@lsu.edu.ph' }) {
  const scope = Vue.effectScope();
  const calls = [];
  const props = Vue.reactive({ rolePermissions: records });
  const user = Vue.ref(account);
  const component = new Function('Vue', 'moment', 'useRuntimeConfig', 'useAuth', '$fetch', 'setTimeout', 'clearTimeout',
    `const { ref, computed, onMounted, defineAsyncComponent, watch } = Vue;\n${compiled}`)(
    { ...Vue, onMounted() {} }, nuxtRequire('moment'),
    () => ({ public: { apiUrl: 'https://example.com' } }), () => ({ user }),
    async (url, options) => { calls.push({ url, options }); return fetch(url, options); }, () => 0, () => {},
  );
  const state = scope.run(() => component.setup(props, { expose() {}, emit() {} }));
  state.oerList.value = [{ ...resource, logs: [] }];
  return { state, props, user, calls, dispose: () => scope.stop(), html() {
    const app = Vue.createSSRApp({ setup: () => ({ ...state }), render });
    app.component('OERForm', { render: () => null });
    return renderToString(app);
  } };
}

test('only matching Role Permissions admins see actions and selection controls', async () => {
  for (const [records, account, allowed] of [
    [[permission(['Super Admin'])], { email: 'USER@lsu.edu.ph' }, true],
    [[permission(['OER Admin'])], { email: 'user@lsu.edu.ph' }, true],
    [[permission(['Employee']), permission(['OER Admin'])], { email: 'user@lsu.edu.ph' }, true],
    [[permission(['SuperAdmin'])], { email: 'user@lsu.edu.ph' }, true],
    [[permission(['Open Educational Resources', 'Employee'])], { email: 'user@lsu.edu.ph' }, false],
    [[permission(['OER Admin'], 'someoneelse@lsu.edu.ph')], { email: 'user@lsu.edu.ph' }, false],
    [[], { email: 'user@lsu.edu.ph', role: 'Super Admin', is_superadmin: true }, false],
    [[permission(['Super Admin'])], null, false],
  ]) {
    const page = subject(records, undefined, account);
    try {
      assert.equal(page.state.canManageResources.value, allowed);
      const html = await page.html();
      assert.equal(html.includes('>Action</th>'), allowed);
      assert.equal(html.includes('title="Delete resource"'), allowed);
      assert.equal(html.includes('type="checkbox"'), allowed);
      assert.equal(html.includes('title="Approved resources are displayed on /oer"'), allowed);
      assert.ok(html.includes('Lesson'));
    } finally { page.dispose(); }
  }
});

test('fallback fetch checks current email, stays hidden during loading, and fails closed', async () => {
  let resolve;
  const page = subject([], () => new Promise(done => { resolve = done; }));
  try {
    const pending = page.state.fetchRolePermissions();
    assert.equal(page.state.canManageResources.value, false);
    assert.equal(page.calls[0].url, 'https://example.com/api/cits/role-permissions/list/?email=user%40lsu.edu.ph');
    resolve([permission(['OER Admin'])]);
    await pending;
    assert.equal(page.state.canManageResources.value, true);
  } finally { page.dispose(); }
  const failed = subject([], async () => { throw new Error('Unavailable'); });
  try {
    await failed.state.fetchRolePermissions();
    assert.equal(failed.state.canManageResources.value, false);
  } finally { failed.dispose(); }
});

test('ordinary users cannot invoke details, selection, or deletion handlers', async () => {
  const page = subject([permission(['Open Educational Resources'])]);
  try {
    page.state.openDetail(resource);
    page.state.toggleSelectAll();
    page.state.selectedIds.value = [1];
    await page.state.deleteSelected();
    await page.state.deleteSingle(resource);
    await page.state.updateStatus(resource, 'Approved');
    assert.equal(page.calls.length, 0);
    assert.equal(page.state.showDetailModal.value, false);
    assert.equal(page.state.confirmModal.value.show, false);
  } finally { page.dispose(); }
});

test('admin status selector saves approval and immediately updates count, filters, and details', async () => {
  const page = subject([permission(['OER Admin'])], async () => ({
    status: 'updated', resource: { ...resource, status: 'Approved', logs: [{ status_update: 'Approved', status_update_by: 'user@lsu.edu.ph' }] },
  }));
  try {
    const item = page.state.oerList.value[0];
    page.state.openDetail(item);
    await page.state.updateStatus(item, 'Approved');
    assert.equal(page.calls.length, 1);
    assert.equal(page.calls[0].url, 'https://example.com/api/oer/1/status/');
    assert.deepEqual(page.calls[0].options, { method: 'PATCH', body: { status: 'Approved' } });
    assert.equal(page.state.getLatestStatus(item), 'Approved');
    assert.equal(page.state.stats.value.approved, 1);
    assert.equal(page.state.selectedResource.value.logs[0].status_update, 'Approved');
    assert.match(page.state.toast.value.message, /available on \/oer/);
    page.state.selectedStatusFilter.value = 'Checking';
    assert.equal(page.state.filteredList.value.length, 0);
    page.state.selectedStatusFilter.value = 'Approved';
    assert.equal(page.state.filteredList.value.length, 1);
  } finally { page.dispose(); }
});

test('failed status save restores the displayed status and keeps the previous history', async () => {
  const page = subject([permission(['Super Admin'])], async () => { throw new Error('Offline'); });
  try {
    const item = page.state.oerList.value[0];
    const event = { target: { value: 'Approved' } };
    await page.state.updateStatus(item, 'Approved', event);
    assert.equal(page.state.getLatestStatus(item), 'Submitted');
    assert.equal(event.target.value, 'Submitted');
    assert.deepEqual(page.state.savingStatusIds.value, []);
    assert.equal(page.state.toast.value.type, 'error');
  } finally { page.dispose(); }
});

test('status changes prevent duplicate saves and the filter offers exactly three statuses', async () => {
  let resolve;
  const page = subject([permission(['OER Admin'])], () => new Promise(done => { resolve = done; }));
  try {
    const item = page.state.oerList.value[0];
    assert.deepEqual(page.state.resourceStatuses, ['Submitted', 'Checking', 'Approved']);
    const pending = page.state.updateStatus(item, 'Checking');
    await page.state.updateStatus(item, 'Approved');
    assert.equal(page.calls.length, 1);
    assert.deepEqual(page.state.savingStatusIds.value, [1]);
    resolve({ status: 'updated', resource: { ...resource, status: 'Checking', logs: [{ status_update: 'Checking' }] } });
    await pending;
    assert.deepEqual(page.state.savingStatusIds.value, []);
    assert.equal(page.state.getLatestStatus(item), 'Checking');
  } finally { page.dispose(); }
});

test('legacy review and publication statuses map safely to the three current statuses', () => {
  const page = subject();
  try {
    for (const [legacy, expected] of [
      ['Published', 'Approved'], ['Approved / Published', 'Approved'],
      ['Under Review', 'Checking'], ['Not approved', 'Checking'], ['Submitted', 'Submitted'],
    ]) {
      assert.equal(page.state.getLatestStatus({ logs: [{ status_update: legacy }] }), expected);
    }
  } finally { page.dispose(); }
});

test('revoking a role clears admin state and cancels pending deletion', async () => {
  const page = subject([permission(['OER Admin'])]);
  try {
    page.state.openDetail(resource);
    page.state.toggleSelectAll();
    const deletion = page.state.deleteSingle(resource);
    assert.equal(page.state.confirmModal.value.show, true);
    page.props.rolePermissions = [permission(['Open Educational Resources'])];
    await Vue.nextTick();
    await deletion;
    assert.equal(page.state.showDetailModal.value, false);
    assert.deepEqual(page.state.selectedIds.value, []);
    assert.equal(page.calls.length, 0);
    assert.equal(page.state.tableColumnCount.value, 8);
  } finally { page.dispose(); }
});
