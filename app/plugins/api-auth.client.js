import axios from 'axios';
import { createApiAuth } from '~/utils/api-auth';

export default defineNuxtPlugin({
  name: 'api-auth',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig();
    const auth = useAuth();
    auth.init();
    // Child components mount before the dashboard's onMounted callback.
    // Save the OAuth result before any of them request protected data.
    const pageUrl = new URL(window.location.href);
    const callbackToken = pageUrl.searchParams.get('token');
    if (pageUrl.pathname.replace(/\/$/, '') === '/dashboard' && callbackToken) {
      auth.setAuth(callbackToken);
    }

    const apiAuth = createApiAuth({
      apiUrl: config.public.apiUrl,
      pageUrl: window.location.href,
      getToken: () => auth.token.value,
      onUnauthorized: () => nuxtApp.runWithContext(() => auth.logout()),
    });
    const originalFetch = window.fetch;
    // Nuxt/ofetch uses the browser's fetch at request time. This also covers
    // existing native fetch calls without changing each dashboard component.
    const authenticatedFetch = apiAuth.wrapFetch(originalFetch.bind(window));
    window.fetch = authenticatedFetch;
    const removeAxiosInterceptor = apiAuth.installAxios(axios);

    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        if (window.fetch === authenticatedFetch) window.fetch = originalFetch;
        removeAxiosInterceptor();
      });
    }
  },
});
