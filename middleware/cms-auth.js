import { useAuth } from "@/composables/useAuth";

export default defineNuxtRouteMiddleware(() => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn.value) {
    return navigateTo("/cms/login");
  }
});
