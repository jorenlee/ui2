<script setup>

const userStore = useUserStore();
import { useRouter } from "vue-router";

const router = useRouter();
/* ---- AUTH GUARD ---- */
onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.replace("/central/login");
  }
});

const currentView = ref("Menu");

definePageMeta({
  middleware: "central-auth",
});

const logOut = () => {
  userStore.removeToken();
  router.push("/central/login");
};

const menuList = [
  { label: "Menu", icon: "fa-bars", type: "button", view: "Menu" },
  { label: "Search", icon: "fa-search", type: "button", view: "Search" },
  { label: "Profile", icon: "fa-user", type: "button", view: "Profile" },
  { label: "Logout", icon: "fa-sign-out", type: "button", view: "Logout" },
];

const filteredMenuList = computed(() => {
  const role = userRole.value;
  const email = userStore.user?.email;
  if (!role) return [];
  return subMenuList.filter((menu) => {
    if (role === "superAdmin") return true;
    if (menu.allowedEmails) return menu.allowedEmails.includes(email);
    return true;
  });
});
</script>

<template>
  <div class="">
    <!-- <UniversityDashboard /> -->

    <div
      v-if="currentView === 'Logout'"
      class="p-4 flex flex-col items-center justify-center gap-4 h-screen"
    >
      <!-- Card -->
      <div
        class="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 text-center shadow-lg lg:-mt-32"
      >
        <!-- Icon -->
        <div
          class="mx-auto mb-3 w-12 h-12 flex items-center justify-center rounded-full bg-red-500/10 text-red-400"
        >
          <i class="fa fa-sign-out text-2xl"></i>
        </div>

        <!-- Text -->
        <h3 class="text-base font-semibold text-white">Logout Confirmation</h3>
        <p class="text-sm text-black mt-1">
          Are you sure you want to log out of your account?
        </p>

        <!-- Actions -->
        <div class="mt-5 flex gap-3 justify-center">
          <!-- Cancel -->
          <button
            @click="currentView = 'Profile'"
            class="px-4 py-2 text-sm rounded-lg border hover:bg-black hover:text-white text-black transition"
          >
            Cancel
          </button>

          <!-- Logout -->
          <button
            @click="logOut"
            class="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2"
          >
            <i class="fa fa-sign-out"></i>
            Logout
          </button>
        </div>
      </div>
    </div>

    <div class="w-full p-4" v-if="currentView === 'Profile'">
      <SuperAdminDashboardWelcome />
    </div>

    <!-- Menu -->
    <div v-else-if="currentView === 'Menu'" class="px-4 pt-4 pb-32 text-green-900">
      <div>
        <UniversityPortalITServicesList />
      </div>
    </div>

    <div>
      <!-- BOTTOM NAV -->
      <nav
        class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg rounded-t-2xl"
      >
        <div class="flex justify-evenly items-center">
          <div
            v-for="(menu, index) in menuList"
            :key="index"
            class="flex justify-center"
          >
            <div
              v-if="menu"
              class="bg-white hover:shadow-lg px-3 rounded-lg transition-shadow"
            >
              <button
                @click="
                  menu.type === 'button'
                    ? (currentView = menu.view)
                    : navigateTo(menu.to)
                "
                class="flex flex-col items-center text-[10px] p-1"
                :class="
                  currentView === menu.view
                    ? 'text-green-700'
                    : 'text-green-900'
                "
              >
                <div
                  class="w-5 h-5 flex items-center justify-center rounded-xl"
                  :class="currentView === menu.view ? 'bg-green-100' : ''"
                >
                  <i :class="['fa', menu.icon, 'text-xs']"></i>
                </div>
                <span>{{ menu.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <DashboardFooter />
      </nav>
    </div>
  </div>
</template>
