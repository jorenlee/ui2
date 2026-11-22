import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const nuxtRequire = createRequire(import.meta.resolve('nuxt'));
const vueRequire = createRequire(nuxtRequire.resolve('vue'));
const Vue = vueRequire('vue');
const { parse, compileScript, compileTemplate } = vueRequire('@vue/compiler-sfc');
const filename = new URL('../app/pages/library/LRCBookThru/index.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: 'library-test' }).content
  .replace(/^import .+;\r?$/gm, '')
  .replace('export default', 'return');
const moment = nuxtRequire('moment');
const lodash = nuxtRequire('lodash');
const scheduleJSON = JSON.parse(readFileSync(new URL('../app/pages/library/LRCBookThru/schedule.json', import.meta.url)));

function page(fetch) {
  const mounted = [];
  const unmounted = [];
  const timers = [];
  const calls = [];
  const scope = Vue.effectScope();
  const component = new Function(
    'Vue', 'scheduleJSON', 'VueDatePicker', 'moment', '_', 'useRuntimeConfig', '$fetch',
    'window', 'setInterval', 'clearInterval', 'setTimeout', 'console',
    `const { ref, watch, watchEffect, onMounted, onBeforeUnmount } = Vue;\n${compiled}`,
  )(
    { ...Vue, onMounted: fn => mounted.push(fn), onBeforeUnmount: fn => unmounted.push(fn) },
    scheduleJSON, {}, moment, lodash, () => ({ public: { apiUrl: 'https://example.com' } }),
    async (url, options) => { calls.push({ url, options }); return fetch(url, options); },
    { scrollTo() {} },
    (fn, delay) => { const timer = { fn, delay, active: true }; timers.push(timer); return timer; },
    timer => { if (timer) timer.active = false; }, () => 0, { error() {}, warn() {} },
  );
  const state = scope.run(() => component.setup({}, { expose() {} }));
  return {
    state, calls, timers,
    mount: () => mounted[0](),
    dispose() { unmounted.forEach(fn => fn()); scope.stop(); },
  };
}

function fillBooking(state) {
  state.schedule.value.date = '12-01-2026';
  state.pickedTime.value = { _12_hour_format_from: '08:00 AM', _12_hour_format_to: '08:20 AM' };
  Object.assign(state.info.value, {
    borrower_category: 'Student', id_number: '123', firstname: 'Library', lastname: 'Borrower',
    email: 'borrower@example.com',
    books: [{ book_title: 'Book', book_author: 'Author', book_call_number: 'QA001' }],
  });
}

test('Book Thru template compiles', () => {
  const result = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'library-test' });
  assert.deepEqual(result.errors, []);
});

test('anonymous initial reads load schedules and catalog and polling stops after a 401', async () => {
  let reject = false;
  const subject = page(async () => {
    if (reject) throw { statusCode: 401 };
    return [];
  });
  try {
    await subject.mount();
    assert.deepEqual(subject.calls.map(call => new URL(call.url).pathname), [
      '/api/library/schedule/booking/list/', '/api/library/reports/book/list/',
    ]);
    assert.equal(subject.state.isLoading.value, false);
    const poll = subject.timers.find(timer => timer.delay === 10000);
    assert.ok(poll?.active);
    reject = true;
    await subject.state.fetchSchedulesSilently();
    assert.equal(poll.active, false);
  } finally { subject.dispose(); }
});

test('failed initial load does not start repeated network requests', async () => {
  const subject = page(async () => { throw { statusCode: 401 }; });
  try {
    await subject.mount();
    assert.equal(subject.state.isLoading.value, false);
    assert.equal(subject.timers.some(timer => timer.delay === 10000), false);
    assert.equal(subject.state.toaster.value.type, 'error');
  } finally { subject.dispose(); }
});

test('selecting and removing a book stays local and leaves catalog copies intact', () => {
  const subject = page(async () => { throw new Error('Unexpected request'); });
  try {
    const book = { title: 'Book', author: 'Author', call_number: 'QA001', number_of_copies: 2 };
    subject.state.limitCounter.value = 15;
    subject.state.addBooks(book);
    assert.equal(subject.state.info.value.books.length, 1);
    subject.state.removeRow(subject.state.info.value.books[0]);
    assert.equal(subject.state.info.value.books.length, 0);
    assert.equal(book.number_of_copies, 2);
    assert.equal(subject.calls.length, 0);
  } finally { subject.dispose(); }
});

test('booking submits and emails without requesting staff edit endpoints', async () => {
  const subject = page(async () => ({ status: 'created' }));
  try {
    fillBooking(subject.state);
    await subject.state.submitForm();
    assert.deepEqual(subject.calls.map(call => [new URL(call.url).pathname, call.options.method]), [
      ['/api/library/booking/create/', 'POST'], ['/api/library/submit-appointment-to-gmail/', 'POST'],
    ]);
    assert.equal(subject.state.submissionForm.value, false);
    assert.equal(subject.state.isSubmitting.value, false);
  } finally { subject.dispose(); }
});

test('a stale slot reports the API error, refreshes availability and keeps the form', async () => {
  const subject = page(async (url, options) => {
    if (options?.method === 'POST') throw { data: { booking_time: ['Choose another time.'] } };
    return [];
  });
  try {
    fillBooking(subject.state);
    await subject.state.submitForm();
    assert.equal(subject.state.toaster.value.message, 'Choose another time.');
    assert.equal(subject.state.submissionForm.value, true);
    assert.equal(subject.state.isSubmitting.value, false);
    assert.equal(subject.calls.filter(call => call.options?.method === 'POST').length, 1);
    assert.equal(subject.calls.length, 3);
  } finally { subject.dispose(); }
});
