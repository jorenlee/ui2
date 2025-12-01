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
    router.push("/library/dashboard");
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
  <div class="bg-white">
    <div class="lg:h-screen flex items-center">
      <div class="lg:w-4/12 py-5 w-11/12 mx-auto">
        <div class="">
          <a href="/library" class="flex my-3 gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h1 class="font-bold text-sm text-green-900">Back to Library</h1>
          </a>
          <div class="py-7 px-4 lg:shadow-xl my-auto lg:order-1 order-2 text-center rounded-2xl">
            <img class="lg:w-32 w-44 h-auto mx-auto block" 
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSULRC.jpg" />
            <p class="text-2xl font-bold lasalle-green-text"> Learning Resource Center </p>
            <button :disabled="!isReady" @click="() => login()" 
              class="lg:w-fit w-10/12 pl-20 pr-10 py-2.5 bg-[#083408] hover:bg-white rounded-lg text-sm text-white hover:text-[#083408] text-center font-semibold login-with-google-btn block mx-auto uppercase lg:mt-7 mt-14 tracking-widest whitespace-nowrap hover:shadow-xl border-2 border-[#083408]"> Admin Login </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
</style>
