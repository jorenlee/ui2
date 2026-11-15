import { isPrivateApiPage } from '~/utils/private-api-pages';

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server || !isPrivateApiPage(to.path)) return;
  if (!useAuth().isLoggedIn.value) return navigateTo('/login');
});
