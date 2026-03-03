<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  title: { type: String, required: true },
  routeURL: { type: String, required: true },
});

const router = useRouter();
const { isLoggedIn, setAuth, init } = useAuth();
const isLoading = ref(false);

/* AUTO REDIRECT IF LOGGED IN */
onMounted(() => {
  init();

  if (isLoggedIn.value) {
    router.replace(props.routeURL);
  }

  // Check if we're returning from OAuth callback with token
  checkForToken();
});

/* CHECK FOR TOKEN IN URL */
const checkForToken = () => {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (token) {
    isLoading.value = true;

    try {
      setAuth(token);

      // Clean up URL and redirect to /dashboard
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace('/dashboard');
    } catch (error) {
      console.error("Token decode error:", error);
      isLoading.value = false;
      // Clean up URL and redirect to home on error
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace('/');
    }
  }

  // Check for error
  const error = urlParams.get('error');
  if (error) {
    console.error("OAuth error:", error);
    // Clean up URL and redirect to home
    window.history.replaceState({}, document.title, window.location.pathname);
    router.replace('/');
  }
};

/* GOOGLE LOGIN - REDIRECT TO FULL PAGE */
const handleGoogleLogin = () => {
  isLoading.value = true;

  // Redirect to server-side OAuth endpoint
  // This will redirect to Google's login page and then to /dashboard
  window.location.href = '/api/auth/google';
};
</script>


<template>
  <div class="">
    <div class="h-screen flex items-center">
      <div class="lg:w-5/12 py-5 w-11/12 mx-auto">
        <div class="">
          <div class="">
            <img
              class="w-44 mx-auto mb-10"
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-green.png"
            />
            <div class="">
              <!-- Custom Google Login Button -->
              <button
                @click="handleGoogleLogin"
                :disabled="isLoading"
                class="w-full max-w-sm mx-auto mb-4 px-6 py-3 bg-green-900 border-2 border-green-800 rounded-lg flex items-center justify-center gap-3 text-center font-semibold text-sm text-white hover:bg-green-950 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fill-rule="evenodd">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </g>
                </svg>
                <span v-if="!isLoading">LOGIN WITH GOOGLE</span>
                <span v-else>Loading...</span>
              </button>

              <a
                href="/"
                class="w-full max-w-sm whitespace-nowrap border-2 border-green-800 mx-auto px-5 rounded-lg py-2.5 shadow-md hover:shadow-lg flex items-center justify-center gap-x-3 text-center font-bold text-sm text-green-900 hover:bg-green-50 transition-all"
              >
                <i class="fa fa-home"></i>Back to LSU Homepage
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>
