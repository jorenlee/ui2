import { useAuth } from "@/composables/useAuth";

export default defineNuxtRouteMiddleware(() => {
  const userStore = useUserStore();

  if (!userStore.isLoggedIn) {
    return navigateTo("/cms/login");
  }
});
