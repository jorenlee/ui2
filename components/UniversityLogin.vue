<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useTokenClient } from "vue3-google-signin";

/* =========================
   PROPS
========================= */
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  routeURL: {
    type: String,
    required: true,
  },
});

const userStore = useUserStore();
const router = useRouter();

/* ---- AUTO REDIRECT IF LOGGED IN ---- */
onMounted(() => {
  if (userStore.isLoggedIn) {
    router.replace(props.routeURL);
  }
});

/* ---- GOOGLE LOGIN HANDLERS ---- */
const handleOnError = (errorResponse) => {
  console.error("Google Login Error:", errorResponse);
};

const handleOnSuccess = async (response) => {
  try {
    const userInfo = await $fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${response.access_token}`
    );

    if (!userInfo?.email) return;

    userStore.setToken(response.access_token, userInfo.email);

    // 🔥 DYNAMIC ROUTE HERE
    router.replace(props.routeURL);
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
              <button
                :disabled="!isReady"
                @click="login"
                class="w-64 pl-14 pr-5 py-2.5 bg-[#083408] hover:bg-white rounded-lg hover:shadow-xl text-sm text-white hover:text-[#083408] text-center font-semibold login-with-google-btn block mx-auto uppercase mt-3 tracking-widest whitespace-nowrap  border-2 border-[#083408] cursor-pointer mb-4"
              >
                {{ title }}
              </button>

              <a
                href="/"
                class="w-64 whitespace-nowrap border mx-auto px-5 rounded-lg py-2.5 shadow-xl flex items-center justify-center gap-x-3 text-center font-bold text-sm text-green-900"
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
