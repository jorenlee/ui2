<script setup>
import { useUserStore } from "@/stores/user";
import { useTokenClient } from "vue3-google-signin";

const userStore = useUserStore();
const router = useRouter();

const handleOnError = (errorResponse) => {
  console.error("Google Login Error:", errorResponse);
};

const handleOnSuccess = async (response) => {
  try {
    const userInfo = await $fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + response.access_token
    );

    if (!userInfo?.email) {
      console.error("No email found in response:", userInfo);
      return;
    }

    userStore.setToken(response.access_token, userInfo.email);
    console.log("CCC User info:", userInfo);

    // ✅ Redirect to CCC Dashboard
    router.push("/ccc/dashboard");
  } catch (error) {
    console.error("Login error:", error);
  }
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});
</script>

<template>
  <div class="lg:bg-gray-50">
    <div class="lg:h-screen flex items-center">
      <div class="lg:w-7/12 py-5 w-11/12 mx-auto">
        <div>
          <div
            class="lg:flex md:w-fit w-full mx-auto gap-10 items-center lg:py-14 py-8 md:px-10 px-7 lg:px-16 shadow bg-white my-auto
             lg:order-1 order-2 text-center rounded-2xl"
          >
            <img
              class="w-24 lg:mx-0 mx-auto h-auto block lg:mb-0 mb-5"
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/circleLSULogo.jpg"
              alt="LSU Logo"
            />

            <div>
              <!-- Back to CCC Homepage -->
              <a
                href="/ccc"
                class="gap-1 lg:w-auto md:w-fit w-full mx-auto lg:mt-0 mt-5 lg:flex hidden"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h1 class="font-bold text-sm text-green-900">
                  Back to CCC Homepage
                </h1>
              </a>

              <!-- CCC Login Button -->
              <button
                :disabled="!isReady"
                @click="login"
                class="h-fit pl-12 pr-3 py-3 bg-[#003613] rounded-lg text-sm text-white text-center font-semibold lg:w-auto w-full
                login-with-google-btn block mx-auto uppercase mt-2 tracking-widest"
              >
                CCC Admin Login
              </button>

              <!-- Back to CCC Homepage (Mobile) -->
              <a
                href="/ccc"
                class="gap-1 lg:w-auto md:w-fit w-full mx-auto lg:mt-0 mt-5 lg:hidden flex shadow-xl py-3 px-3.5 rounded-lg justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h1 class="font-bold text-sm text-green-900">
                  Back to CCC Homepage
                </h1>
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
