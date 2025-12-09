<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const router = useRouter();
const userStore = useUserStore();
// const endpoint = ref(userStore.mainDevServer);

// Sidebar and view toggle
const toggleSideBarMenu = ref(false);
const currentView = ref("list"); // "form" or "list"
const isUserAuthenticated = ref(false);

const logOut = () => {
  userStore.removeToken();
  router.push("/cms/login");
};

// Handle form submission success - switch to list view
const handleContentSubmitted = () => {
  currentView.value = "list";
};

const profileImageUrl = computed(() => {
  const email = userStore.user.email;
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG`;
});

// Watch for user email changes
watch(
  () => userStore.user?.email,
  (newEmail) => {
    if (newEmail) {
      isUserAuthenticated.value = true;
    } else {
      isUserAuthenticated.value = false;
      router.push("/cms/login");
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Show main content only if authenticated -->
    <div v-if="isUserAuthenticated" class="flex flex-1">
      <!-- SIDEBAR -->
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 w-full flex overflow-hidden z-40 lg:block lg:static absolute h-full"
        v-show="toggleSideBarMenu"
      >
        <div class="w-full">
          <div
            class="flex items-center text-white bg-green-900 lg:py-[16px] py-[8px]"
          >
            <div class="flex items-center w-full px-2">
              <i class="fa fa-user mx-2" aria-hidden="true"></i>
              <h1 class="text-sm">{{ userStore.user.email }}</h1>
            </div>
            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="w-10 px-1.5 lg:hidden flex"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div class="">
            <div class="w-fit mx-auto mt-5 mb-3">
              <img
                :src="profileImageUrl"
                class="lg:w-24 w-20 mx-auto"
              />
            </div>
            <div class="text-center">
              <h1 class="font-bold text-green-800 text-2xl">Dashboard</h1>
            </div>
            <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
              <!-- REPLACE href links with button toggles -->
              <button
                @click="currentView = 'form'"
                :class=" [
                  'text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left transition-colors',
                  currentView === 'form'
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-black hover:text-white'
                ]"
              >
                <i class="fa fa-list mr-3" aria-hidden="true"></i>
                Content Form
              </button>
              <button
                @click="currentView = 'list'"
                :class=" [
                  'text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left transition-colors',
                  currentView === 'list'
                    ? 'bg-black text-white'
                    : 'text-black hover:bg-black hover:text-white'
                ]"
              >
                <i class="fa fa-list-alt mr-3" aria-hidden="true"></i>
                All Contents Lists
              </button>
              <a
                href="/"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
              >
                <i class="fa fa-globe mr-3" aria-hidden="true"></i>
                LSU HOME PAGE
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full">
        <!-- Fixed Header -->
        <div class="bg-green-800 w-full z-50">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="w-auto flex items-center lg:px-1.5"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
              <p
                class="text-white whitespace-nowrap lg:ml-5 ml-3 font-bold uppercase lg:text-sm text-xs"
              >
                LSU Content Management System
              </p>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <!-- MAIN CONTENT AREA - conditionally render based on currentView -->
        <div class="flex-1 bg-gray-50 overflow-y-auto">
          <!-- FORM VIEW - render component without props, listen for contentSubmitted -->
          <div v-if="currentView === 'form'">
            <SuperAdminDashboardCmsForm @contentSubmitted="handleContentSubmitted" />
          </div>

          <!-- LIST VIEW -->
          <div v-else-if="currentView === 'list'">
            <SuperAdminDashboardCmsList />
          </div>
        </div>

        <!-- Footer at bottom -->
        <DashboardFooter />
      </div>
    </div>

    <!-- Show loading/unauthorized message if not authenticated -->
    <div v-else class="flex items-center justify-center h-screen bg-gray-50">
      <div class="text-center">
        <i class="fa fa-lock text-4xl text-gray-400 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
        <p class="text-gray-600 mb-6">Please log in to access the dashboard.</p>
        <NuxtLink 
          to="/cms/login" 
          class="inline-block bg-green-800 hover:bg-green-900 text-white px-6 py-2 rounded-lg font-bold transition-colors"
        >
          <i class="fa fa-sign-in mr-2"></i>Go to Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu {
  @apply hover:bg-green-800 hover:text-white text-green-800 px-3 py-1 rounded;
}
</style>
