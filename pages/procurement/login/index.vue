<script setup>

import { useUserStore } from "@/stores/user";
import { useTokenClient } from "vue3-google-signin";
const userStore = useUserStore();

const router = useRouter();

const handleOnError = (errorResponse) => {
  // console.log("Error: ", errorResponse);
};

const handleOnSuccess = async (response) => {
  try {
    const userInfo = await $fetch("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + response.access_token);
    
    if (!userInfo?.email) {
      console.error("No email found in response:", userInfo);
      return;
    }
    
    userStore.setToken(response.access_token, userInfo.email);
    console.log("User info:", userInfo);
    router.push("/procurement/dashboard");
  } catch (error) {
    console.error("Login error:", error);
  }
};

const { isReady, login } = useTokenClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
  // other options
});

</script>

<template>
  <div class="lg:bg-gray-50">
    <div class="lg:h-screen flex items-center">
      <div class="lg:w-4/12 py-5 w-11/12 mx-auto">
        <div class="">
          <a href="/" class="flex my-3 gap-3">
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
              Back to LSU Homepage
            </h1>
          </a>

          <div
            class="py-7 px-4 shadow bg-white my-auto lg:order-1 order-2 text-center rounded-2xl"
          >
            <img
              class="w-24 h-auto mx-auto block"
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/procurement.png"
            />
            <p class="text-2xl font-bold lasalle-green-text">
              LSU Central Procurement Unit
            </p>
            <button
            :disabled="!isReady" @click="login"
              class="lg:w-6/12 w-10/12 pl-12 pr-3 py-3 bg-green-10 rounded-lg text-sm text-white text-center font-semibold login-with-google-btn block mx-auto uppercase mt-7 tracking-widest"
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .bg-green-10 {
    background-color: #003613;
  }
</style>
