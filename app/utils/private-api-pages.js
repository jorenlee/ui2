// These legacy pages request private data during setup. Render them in the
// browser, where the saved sign-in token is available before their first read.
export const PRIVATE_API_PAGES = [
  '/dashboard', '/cits/dashboard', '/registrar/dashboard',
  '/procurement/dashboard', '/donation/dashboard',
  '/investiture/donation/dashboard', '/campus-pass/guard',
];

export function isPrivateApiPage(path) {
  return PRIVATE_API_PAGES.some(prefix => path === prefix || path.startsWith(`${prefix}/`));
}
