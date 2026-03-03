<script setup>
const userStore = useUserStore();
const router = useRouter();

const handleOnError = (error) => {
  console.error("Google Login Error:", error);
};

const handleOnSuccess = async (event) => {
  try {
    const userInfo = event.claims;

    if (!userInfo?.email) {
      console.error("No email found in response:", userInfo);
      return;
    }

    userStore.setToken(event.credential, userInfo.email);
    console.log("User info:", userInfo);
    router.push("/procurement/dashboard");
  } catch (error) {
    console.error("Login error:", error);
  }
};
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
            <ClientOnly>
              <GoogleLoginButton
                :options="{ theme: 'filled_blue', size: 'large', text: 'signin_with' }"
                @success="handleOnSuccess"
                @error="handleOnError"
                class="mx-auto mt-7"
              />
            </ClientOnly>
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
