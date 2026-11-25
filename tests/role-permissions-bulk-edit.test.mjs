import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const vueRequire = createRequire(nuxtRequire.resolve('vue'));
const Vue = vueRequire('vue');
const { parse, compileScript, compileTemplate } = vueRequire('@vue/compiler-sfc');
const filename = new URL('../app/components/SuperAdminDashboardRolePermissions.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: 'roles-test' }).content
  .replace(/^import .+;\r?$/gm, '').replace('export default', 'return');

function component(items, fetch = async () => { throw new Error('Unexpected request'); }) {
  const calls = [];
  const emitted = [];
  const scope = Vue.effectScope();
  const subject = new Function('Vue', 'useRuntimeConfig', '$fetch', 'setTimeout',
    `const { ref, onMounted, onUnmounted, computed, watch, nextTick } = Vue;\n${compiled}`)(
    { ...Vue, onMounted() {}, onUnmounted() {} },
    () => ({ public: { apiUrl: 'https://example.com/prefix' } }),
    async (url, options) => { calls.push({ url, options }); return fetch(url, options); }, () => 0,
  );
  return {
    state: scope.run(() => subject.setup({ rolePermissions: items }, {
      expose() {}, emit: (...args) => emitted.push(args),
    })), calls, emitted, dispose: () => scope.stop(),
  };
}

const users = () => [
  { id: 1, fullname: 'First User', email: 'first@example.com', lsu_idnumber: 'LSU001', role_filter_permissions: ['Employee'] },
  { id: 2, fullname: 'Second User', email: 'second@example.com', lsu_idnumber: 'LSU002', role_filter_permissions: ['Employee', 'Library Menu'] },
  { id: 3, fullname: 'Other User', email: 'other@example.com', role_filter_permissions: ['Library Menu'] },
];

test('RolePermissions template compiles', () => {
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'roles-test' }).errors, []);
});

test('bulk editing uses all selected filtered users across pages and preserves identity', async () => {
  const subject = component(users(), async () => ({
    status: 'updated', count: 2, items: [
      { id: 1, role_filter_permissions: ['Employee', 'Open Educational Resources'], updated_at: 'Now' },
      { id: 2, role_filter_permissions: ['Employee', 'Library Menu', 'Open Educational Resources'], updated_at: 'Now' },
    ],
  }));
  try {
    const state = subject.state;
    state.activeRoleFilter.value = 'Employee';
    state.pageSize.value = 1;
    state.toggleSelectAllPage();
    assert.equal(state.selectedIds.value.length, 1);
    state.selectAllFiltered();
    assert.equal(state.selectedIds.value.length, 2);
    await state.openBulkEditModal();
    state.bulkEditRoles.value = ['Open Educational Resources'];
    await state.performBulkEdit();
    assert.equal(subject.calls.length, 1);
    assert.equal(subject.calls[0].url, 'https://example.com/prefix/api/cits/role-permissions/bulk-update/');
    assert.equal(subject.calls[0].options.method, 'POST');
    assert.deepEqual([...subject.calls[0].options.body.ids].sort(), [1, 2]);
    assert.equal(subject.calls[0].options.body.operation, 'add');
    assert.deepEqual(subject.calls[0].options.body.roles, ['Open Educational Resources']);
    const first = state.listItems.value.find(item => item.id === 1);
    assert.equal(first.email, 'first@example.com');
    assert.equal(first.fullname, 'First User');
    assert.equal(first.lsu_idnumber, 'LSU001');
    assert.deepEqual(state.listItems.value.find(item => item.id === 3).role_filter_permissions, ['Library Menu']);
    assert.equal(state.selectedIds.value.length, 0);
    assert.equal(state.showBulkEditModal.value, false);
    assert.equal(subject.emitted[0][0], 'update:rolePermissions');
    state.activeRoleFilter.value = '';
    state.debouncedSearchQuery.value = 'open educational';
    assert.equal(state.filteredList.value.length, 2);
  } finally { subject.dispose(); }
});

test('failed saves keep selected users and role choices for retry without local changes', async () => {
  const subject = component(users(), async () => { throw { data: { message: 'Please refresh the list.' } }; });
  try {
    const state = subject.state;
    state.toggleSelectItem(1);
    await state.openBulkEditModal();
    state.bulkEditOperation.value = 'remove';
    state.bulkEditRoles.value = ['Employee'];
    await state.performBulkEdit();
    assert.equal(state.bulkEditError.value, 'Please refresh the list.');
    assert.equal(state.showBulkEditModal.value, true);
    assert.equal(state.isBulkEditing.value, false);
    assert.deepEqual(state.selectedIds.value, [1]);
    assert.deepEqual(state.bulkEditRoles.value, ['Employee']);
    assert.deepEqual(state.listItems.value[0].role_filter_permissions, ['Employee']);
    assert.equal(subject.emitted.length, 0);
  } finally { subject.dispose(); }
});

test('empty role choices and cancelling never submit; reopening resets choices', async () => {
  const subject = component(users());
  try {
    const state = subject.state;
    state.toggleSelectItem(2);
    await state.openBulkEditModal();
    await state.performBulkEdit();
    state.bulkEditRoles.value = ['Employee'];
    state.bulkEditOperation.value = 'replace';
    state.closeBulkEditModal();
    assert.equal(subject.calls.length, 0);
    assert.deepEqual(state.selectedIds.value, [2]);
    await state.openBulkEditModal();
    assert.equal(state.bulkEditOperation.value, 'add');
    assert.deepEqual(state.bulkEditRoles.value, []);
  } finally { subject.dispose(); }
});

test('saving locks the modal and prevents duplicate requests', async () => {
  let resolve;
  const subject = component(users(), () => new Promise(done => { resolve = done; }));
  try {
    const state = subject.state;
    state.toggleSelectItem(1);
    await state.openBulkEditModal();
    state.bulkEditRoles.value = ['Employee'];
    const pending = state.performBulkEdit();
    state.closeBulkEditModal();
    await state.performBulkEdit();
    assert.equal(subject.calls.length, 1);
    assert.equal(state.showBulkEditModal.value, true);
    assert.equal(state.isBulkEditing.value, true);
    resolve({ status: 'updated', count: 1, items: [{ id: 1, role_filter_permissions: ['Employee'], updated_at: 'Now' }] });
    await pending;
    assert.equal(state.isBulkEditing.value, false);
  } finally { subject.dispose(); }
});
