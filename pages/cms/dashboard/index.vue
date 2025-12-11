<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const router = useRouter();
const userStore = useUserStore();

// Sidebar and view toggle
const toggleSideBarMenu = ref(false);
const currentView = ref("welcome");
const isUserAuthenticated = ref(false);

// Initialize openGroups with all groups expanded by default
const openGroups = ref([
  "Content Management",
  "Library Management",
  "External Links",
]);

const toggleGroup = (groupName) => {
  if (openGroups.value.includes(groupName)) {
    openGroups.value = openGroups.value.filter((g) => g !== groupName);
  } else {
    openGroups.value.push(groupName);
  }
};

const logOut = () => {
  userStore.removeToken();
  router.push("/cms/login");
};

// Handle form submission success - switch to list view
const handleContentSubmitted = () => {
  currentView.value = "list";
};

const profileImageUrl = computed(() => {
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG`;
});

// Allowed emails for SSO
const allowedEmails = [
  "wenny.caseros@lsu.edu.ph",
  "mariaalexandra.benitez@lsu.edu.ph",
  "alexander.diaz@lsu.edu.ph",
  "carmelona.jumalon@lsu.edu.ph",
  "carmelona2.jumalon@lsu.edu.ph",
  "carousel.tagaylo@lsu.edu.ph",
  "carlvincent.codera@lsu.edu.ph",
  "cherrylyn.sanipa@lsu.edu.ph",
  "dean.lopez@lsu.edu.ph",
  "esmael.larubis@lsu.edu.ph",
  "israelgallogo@lsu.edu.ph",
  "jeanelyn.potestas@lsu.edu.ph",
  "jenel.cruz@lsu.edu.ph",
  "jerusalem.andrada@lsu.edu.ph",
  "jorenlee.luna@lsu.edu.ph",
  "joed.layna@lsu.edu.ph",
  "jumelah.padilla@lsu.edu.ph",
  "carmela.buenbrazo2@lsu.edu.ph",
  "macristina.llauder@lsu.edu.ph",
  "markjohn.dalagan@lsu.edu.ph",
  "menchie.grana@lsu.edu.ph",
  "meredith.embuscado@lsu.edu.ph",
  "michaeljohn.puertogalera@lsu.edu.ph",
  "naiza.amba@lsu.edu.ph",
  "roselyn.tuastomban@lsu.edu.ph",
  "tednudgent.tacan@lsu.edu.ph",
  "xie.medrano@lsu.edu.ph",
  "jenny.licanda@lsu.edu.ph",
  "monaliza.mugot@lsu.edu.ph",
  "marilyn.bejec@lsu.edu.ph",
  "applejane.ebarle@lsu.edu.ph",
  "janekaren.gudmalin@lsu.edu.ph",
  "macy.beniola@lsu.edu.ph",
  "lynn.lumacad@lsu.edu.ph",
  "zosette.salas@lsu.edu.ph",
  "jorenleeluna24@gmail.com",
  "jason.yap@lsu.edu.ph",
  "npc@lsu.edu.ph",
  "dev@lsu.edu.ph",
  "hr@lsu.edu.ph",
];

// Emails allowed to see HR menu
const hrMenuEmails = ["hr@lsu.edu.ph", "npc@lsu.edu.ph", "jorenleeluna24@gmail.com"];

// Watch for user email changes and restrict SSO login
watch(
  () => userStore.user?.email,
  (newEmail) => {
    if (newEmail && allowedEmails.includes(newEmail)) {
      isUserAuthenticated.value = true;
    } else {
      isUserAuthenticated.value = false;
      logOut();
    }
  },
  { immediate: true }
);

// Sidebar menu list
const menuList = [
  {
    label: "Dashboard Home",
    icon: "fa-home",
    type: "button",
    view: "welcome",
  },
  {
    group: "Content Management",
    items: [
      { label: "Content Form", icon: "fa-list", type: "button", view: "form" },
      { label: "All Contents Lists", icon: "fa-list-alt", type: "button", view: "list" },
    ],
  },
  {
    group: "Human Resource",
    items: [
      { label: "Job Vacancies", icon: "fa-list-alt", type: "button", view: "hr-job-vacancy-list" },
    ],
  },
  {
    group: "Library Management",
    items: [
      { label: "Appointment Lists", icon: "fa-list-alt", type: "button", view: "appointments" },
      { label: "Available Books", icon: "fa-book", type: "button", view: "books" },
      { label: "Set Schedules", icon: "fa-calendar", type: "button", view: "schedules" },
    ],
  },
  {
    group: "External Links",
    items: [
      { label: "LSU Home Page", icon: "fa-globe", type: "link", to: "/" },
    ],
  },
];

// Filter menu based on HR access
const filteredMenuList = computed(() => {
  return menuList.filter((menu) => {
    if (menu.group === "Human Resource") {
      return hrMenuEmails.includes(userStore.user?.email);
    }
    return true; // keep all other menus
  });
});

// Navigation for link-type menu items
const navigateTo = (url) => {
  router.push(url);
};
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
        <div class="w-full overflow-y-auto">
          <div class="flex items-center text-white bg-green-900 lg:py-[16px] py-[8px]">
            <div class="flex items-center w-full px-2">
              <i class="fa fa-user mx-2" aria-hidden="true"></i>
              <h1 class="text-sm">{{ userStore.user.email }}</h1>
            </div>
            <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5 lg:hidden flex">
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div class="">
            <div class="w-fit mx-auto mt-5 mb-3">
              <img :src="profileImageUrl" class="lg:w-24 w-20 mx-auto" />
            </div>

            <div class="text-[10px] mt-2 px-4">
              <div
                v-for="menu in filteredMenuList"
                :key="menu.label || menu.group"
                class="border-b py-2"
              >
                <!-- Collapsible groups -->
                <template v-if="menu.group">
                  <button
                    class="w-full flex items-center justify-between text-left font-bold text-gray-700 capitalize hover:text-green-700 transition-colors"
                    @click="toggleGroup(menu.group)"
                  >
                    <span>{{ menu.group }}</span>
                    <i
                      class="fa fa-chevron-down transition-transform duration-300"
                      :class="{ 'rotate-180': openGroups.includes(menu.group) }"
                    ></i>
                  </button>

                  <!-- Submenu -->
                  <transition name="slide-fade">
                    <ul
                      v-if="openGroups.includes(menu.group)"
                      class="pl-4 mt-2 space-y-1"
                    >
                      <li
                        v-for="item in menu.items"
                        :key="item.label"
                        :class="[
                          'flex items-center gap-2 cursor-pointer px-2 rounded transition-colors',
                          currentView === item.view
                            ? 'bg-green-100 text-green-700 font-semibold'
                            : 'hover:bg-gray-200 text-gray-700',
                        ]"
                        @click="
                          item.type === 'button'
                            ? (currentView = item.view)
                            : navigateTo(item.to)
                        "
                      >
                        <i :class="['fa', item.icon]"></i>
                        <span>{{ item.label }}</span>
                      </li>
                    </ul>
                  </transition>
                </template>

                <!-- Standalone buttons -->
                <template v-else>
                  <li
                    class="flex items-center gap-2 cursor-pointer px-0.5 font-bold rounded transition-colors hover:bg-gray-200 text-gray-700"
                    @click="
                      menu.type === 'button'
                        ? (currentView = menu.view)
                        : navigateTo(menu.to)
                    "
                  >
                    <i :class="['fa', menu.icon]"></i>
                    <span>{{ menu.label }}</span>
                  </li>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full">
        <!-- Fixed Header -->
        <div class="bg-green-800 w-full z-50">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-auto flex items-center lg:px-1.5">
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
              <p class="text-white whitespace-nowrap lg:ml-5 ml-3 font-bold uppercase lg:text-sm text-xs">
                LSU Central
              </p>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <!-- MAIN CONTENT AREA -->
        <div class="flex-1 bg-gray-50 overflow-y-auto">
          <div v-if="currentView === 'welcome'"><SuperAdminDashboardWelcome /></div>
          <div v-else-if="currentView === 'form'"><SuperAdminDashboardCmsForm @contentSubmitted="handleContentSubmitted" /></div>
          <div v-else-if="currentView === 'list'"><SuperAdminDashboardCmsList /></div>
          <div v-else-if="currentView === 'appointments'"><SuperAdminDashboardServicesLibraryReserved /></div>
          <div v-else-if="currentView === 'books'"><SuperAdminDashboardServicesLibraryBooks /></div>
          <div v-else-if="currentView === 'schedules'"><SuperAdminDashboardServicesLibrarySchedules /></div>
          <div v-else-if="currentView === 'hr-job-vacancy-list'"><SuperAdminDashboardServicesHr /></div>
        </div>

        <!-- Footer -->
        <DashboardFooter />
      </div>
    </div>

    <!-- Unauthorized view -->
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
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
