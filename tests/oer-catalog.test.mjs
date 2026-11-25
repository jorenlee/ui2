import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const vueRequire = createRequire(nuxtRequire.resolve('vue'));
const Vue = vueRequire('vue');
const { parse, compileScript, compileTemplate, compileStyle } = vueRequire('@vue/compiler-sfc');
const filename = new URL('../app/pages/oer/index.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: 'oer-test' }).content
  .replace(/^import .+;\r?$/gm, '').replace('export default', 'return');

function page(fetch) {
  const mounted = [];
  const calls = [];
  const scope = Vue.effectScope();
  const component = new Function('Vue', 'useRuntimeConfig', 'useHead', '$fetch',
    `const { computed, onMounted, ref, watch } = Vue;\n${compiled}`)(
    { ...Vue, onMounted: fn => mounted.push(fn) },
    () => ({ public: { apiUrl: 'https://example.com/prefix/' } }), () => {},
    async url => { calls.push(url); return fetch(url); },
  );
  return {
    state: scope.run(() => component.setup({}, { expose() {} })), calls,
    mount: () => mounted[0](), dispose: () => scope.stop(),
  };
}

test('OER page template and scoped styles compile', () => {
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'oer-test' }).errors, []);
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, filename: filename.pathname, id: 'oer-test', scoped: true }).errors, []);
});

test('public catalog searches across metadata and combines format filters', async () => {
  const subject = page(async () => [
    { id: 1, title: 'Java Basics', author_and_affiliation: 'Ana Cruz', keywords: 'programming', type_of_entry: 'Google Doc' },
    { id: 2, title: 'Java Exercises', subject_areas: 'Programming', type_of_entry: 'Document' },
    { id: 3, title: null, description_abstract: null, type_of_entry: 'Video' },
  ]);
  try {
    await subject.mount();
    assert.deepEqual(subject.calls, ['https://example.com/prefix/api/oer/catalog/']);
    subject.state.searchQuery.value = '  JAVA programming  ';
    assert.equal(subject.state.filteredResources.value.length, 2);
    subject.state.selectedFormat.value = 'Google Doc';
    assert.equal(subject.state.filteredResources.value[0].id, 1);
    subject.state.searchQuery.value = 'Cruz';
    assert.equal(subject.state.filteredResources.value.length, 1);
    subject.state.searchQuery.value = 'missing';
    assert.equal(subject.state.filteredResources.value.length, 0);
    subject.state.clearFilters();
    assert.equal(subject.state.filteredResources.value.length, 3);
  } finally { subject.dispose(); }
});

test('links preserve signed query strings and reject unsafe schemes', () => {
  const subject = page(async () => []);
  try {
    assert.deepEqual(subject.state.resourceLinks({
      google_doc_link: 'javascript:alert(1)', video_links: 'data:text/html,unsafe',
      resource_files: [null, { name: 'Lesson.pdf', url: 'https://example.com/a.pdf?signature=keep#page=2' },
        { name: 'Duplicate', url: 'https://example.com/a.pdf?signature=keep#page=2' }],
    }), [{ name: 'Lesson.pdf', url: 'https://example.com/a.pdf?signature=keep#page=2' }]);
  } finally { subject.dispose(); }
});

test('catalog supports retry after errors and resets visible results when searching', async () => {
  let unavailable = true;
  const subject = page(async () => {
    if (unavailable) throw new Error('Offline');
    return Array.from({ length: 15 }, (_, id) => ({ id, title: `Lesson ${id}` }));
  });
  try {
    await subject.mount();
    assert.equal(subject.state.loadError.value, true);
    assert.equal(subject.state.isLoading.value, false);
    unavailable = false;
    await subject.state.fetchResources();
    assert.equal(subject.state.loadError.value, false);
    assert.equal(subject.state.visibleResources.value.length, 9);
    subject.state.visibleCount.value += 9;
    assert.equal(subject.state.visibleResources.value.length, 15);
    subject.state.searchQuery.value = 'Lesson';
    await Vue.nextTick();
    assert.equal(subject.state.visibleResources.value.length, 9);
  } finally { subject.dispose(); }
});
