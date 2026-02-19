<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

// ---------------- DARK MODE ----------------
const darkMode = ref(false);

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  if (process.client) {
    localStorage.setItem("theme", darkMode.value ? "dark" : "light");
    // Add smooth transition class to body
    document.documentElement.classList.add("theme-transition");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  }
};

onMounted(() => {
  if (process.client) {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    darkMode.value = storedTheme === "dark" || (!storedTheme && prefersDark);
  }
});

// ---------------- PROPS ----------------
const props = defineProps({
  superAdminEmails: { type: Array, required: true },
  npccMenuEmails: { type: Array, required: true },
  ochAdminEmails: { type: Array, required: true },
  contentWritersEmails: { type: Array, required: true },
  hrMenuEmails: { type: Array, required: true },
  libraryMenuEmails: { type: Array, required: true },
  registrarMenuEmails: { type: Array, required: true },
  campusPassAdminEmails: { type: Array, required: true },
  drsAdminEmails: { type: Array, required: true },
});

// ---------------- STATE ----------------
definePageMeta({ middleware: "cms-auth" });
const router = useRouter();
const userStore = useUserStore();
const currentView = ref("Menu");
const openGroups = ref([
  "Content Management",
  "Human Resource",
  "Library Management",
  "Office of The Chancellor",
  "NPCC IT Services",
  "University Registrar",
  "Campus Pass",
  "Document Reviewer",
  "External Links",
]);

// ---------------- AUTH & COMPUTED ----------------
const isUserAuthenticated = computed(() => userStore.isLoggedIn);

const rolesByEmail = computed(() => ({
  superAdmin: props.superAdminEmails,
  hr: props.hrMenuEmails,
  library: props.libraryMenuEmails,
  contentWriter: props.contentWritersEmails,
  och: props.ochAdminEmails,
  npcc: props.npccMenuEmails,
  registrar: props.registrarMenuEmails,
  campusPass: props.campusPassAdminEmails,
  drs: props.drsAdminEmails,
}));

const userRole = computed(() => {
  const email = userStore.user?.email;
  if (!email) return null;

  for (const [role, emails] of Object.entries(rolesByEmail.value)) {
    if (emails.includes(email)) return role;
  }
  return null;
});

// ---------------- METHODS ----------------
const toggleGroup = (groupName) => {
  const index = openGroups.value.indexOf(groupName);
  index > -1
    ? openGroups.value.splice(index, 1)
    : openGroups.value.push(groupName);
};

const logOut = () => {
  userStore.removeToken();
  router.push("/cms/login");
};

const handleContentSubmitted = () => {
  currentView.value = "list";
};

// ---------------- LIFECYCLE ----------------
onMounted(() => {
  if (!userStore.isLoggedIn) router.replace("/cms/login");
});

// Only run watcher on client-side to avoid SSR issues with localStorage
if (process.client) {
  watch(
    () => userStore.user?.email,
    (newEmail) => {
      if (!newEmail || !userRole.value) logOut();
    },
    { immediate: true },
  );
}
// ---------------- MENU ----------------
const subMenuList = [
  {
    group: "Content Management",
    allowedEmails: props.contentWritersEmails,
    items: [
      { label: "Content Form", icon: "fa-list", type: "button", view: "form" },
      {
        label: "All Contents Lists",
        icon: "fa-list-alt",
        type: "button",
        view: "list",
      },
    ],
  },
  {
    group: "NPCC IT Services",
    allowedEmails: props.npccMenuEmails,
    items: [
      {
        label: "NPCC Management",
        icon: "fa-cogs",
        type: "button",
        view: "npcc",
      },
    ],
  },
  {
    group: "Human Resource",
    allowedEmails: props.hrMenuEmails,
    items: [
      {
        label: "Job Vacancies",
        icon: "fa-list-alt",
        type: "button",
        view: "hr-job-vacancy-list",
      },
      {
        label: "Raffle Draw",
        icon: "fa-list-alt",
        type: "button",
        view: "hr-raffle",
      },
    ],
  },
  {
    group: "Library Management",
    allowedEmails: props.libraryMenuEmails,
    items: [
      {
        label: "Appointment Lists",
        icon: "fa-list-alt",
        type: "button",
        view: "appointments",
      },
      {
        label: "Available Books",
        icon: "fa-book",
        type: "button",
        view: "books",
      },
      {
        label: "Set Schedules",
        icon: "fa-calendar",
        type: "button",
        view: "schedules",
      },
    ],
  },
  {
    group: "Office of The Chancellor",
    allowedEmails: props.ochAdminEmails,
    items: [
      {
        label: "University Calendar",
        icon: "fa-calendar",
        type: "button",
        view: "university-calendar",
      },
    ],
  },
  {
    group: "University Registrar",
    allowedEmails: props.registrarMenuEmails,
    items: [
      {
        label: "University Registrar",
        icon: "fa-university",
        type: "button",
        view: "registrar",
      },
    ],
  },
  {
    group: "Campus Pass",
    allowedEmails: props.campusPassAdminEmails,
    items: [
      {
        label: "Campus Pass Management",
        icon: "fa-id-card",
        type: "button",
        view: "campusPass",
      },
    ],
  },
  {
    group: "Document Reviewer",
    allowedEmails: props.drsAdminEmails,
    items: [
      {
        label: "Document Reviewer System",
        icon: "fa-file-alt",
        type: "button",
        view: "drs",
      },
    ],
  },
  {
    group: "External Links",
    items: [
      { label: "LSU Home Page", icon: "fa-globe", type: "link", to: "/" },
    ],
  },
];
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
  return subMenuList.filter(
    (menu) =>
      role === "superAdmin" ||
      !menu.allowedEmails ||
      menu.allowedEmails.includes(email),
  );
});

const navigateTo = (url) => router.push(url);
const handleMenuClick = (menu) => {
  menu.type === "button"
    ? (currentView.value = menu.view)
    : navigateTo(menu.to);
};
</script>

<template>
  <div
    :class="[
      darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900',
      'min-h-screen transition-colors duration-300',
    ]"
  >
    <!-- DARK MODE TOGGLE - Fixed Position -->
    <div class="fixed bottom-4 right-4 z-50">
      <button
        @click="toggleDarkMode"
        class="group relative flex items-center gap-3 px-5 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        :class="
          darkMode
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white hover:shadow-gray-700/50 border border-gray-600'
            : 'bg-gradient-to-r from-white to-gray-50 text-gray-900 hover:shadow-xl border border-gray-200'
        "
      >
        <!-- Icon Container with Rotation Animation -->
        <div class="relative w-6 h-6 flex items-center justify-center">
          <!-- Sun Icon (shown in light mode) -->
          <transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 rotate-180 scale-0"
            enter-to-class="opacity-100 rotate-0 scale-100"
            leave-active-class="transition-all duration-300"
            leave-from-class="opacity-100 rotate-0 scale-100"
            leave-to-class="opacity-0 -rotate-180 scale-0"
          >
            <i
              v-if="!darkMode"
              class="fa fa-sun absolute text-yellow-500 text-xl"
            ></i>
          </transition>

          <!-- Moon Icon (shown in dark mode) -->
          <transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 -rotate-180 scale-0"
            enter-to-class="opacity-100 rotate-0 scale-100"
            leave-active-class="transition-all duration-300"
            leave-from-class="opacity-100 rotate-0 scale-100"
            leave-to-class="opacity-0 rotate-180 scale-0"
          >
            <i
              v-if="darkMode"
              class="fa fa-moon absolute text-blue-300 text-xl"
            ></i>
          </transition>
        </div>

        <!-- Informative Label Text -->
        <div class="flex flex-col items-start">
          <span class="font-semibold text-sm whitespace-nowrap">
            {{ darkMode ? "Dark Mode" : "Light Mode" }}
          </span>
          <span class="text-xs opacity-75 whitespace-nowrap">
            {{ darkMode ? "Toggle Light" : "Toggle Dark" }}
          </span>
        </div>

        <!-- Glow Effect on Hover -->
        <div
          class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          :class="darkMode ? 'bg-blue-500/10' : 'bg-yellow-500/10'"
        ></div>
      </button>
    </div>
    <!-- LOGOUT CONFIRMATION -->
    <div
      v-if="currentView === 'Logout'"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <div
        class="w-full rounded-3xl p-8 text-center shadow-2xl transform transition-all max-w-md"
        :class="darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'"
      >
        <!-- Icon with Animation -->
        <div
          class="mx-auto mb-6 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30"
        >
          <i class="fa fa-sign-out text-3xl text-white"></i>
        </div>

        <!-- Title -->
        <h3
          class="text-2xl font-bold mb-2"
          :class="darkMode ? 'text-gray-100' : 'text-gray-900'"
        >
          Logout Confirmation
        </h3>

        <!-- Description -->
        <p class="mb-8" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
          Are you sure you want to log out of your account?
        </p>

        <!-- Actions -->
        <div class="flex gap-3 justify-center">
          <button
            @click="currentView = 'Profile'"
            class="flex-1 px-6 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-300"
            :class="
              darkMode
                ? 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-300'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700'
            "
          >
            Cancel
          </button>
          <button
            @click="logOut"
            class="flex-1 px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i class="fa fa-sign-out"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
    <div v-if="isUserAuthenticated">
      <!-- MAIN CONTENT -->
      <div
        class="w-full"
        :class="
          darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-600'
        "
      >
        <!-- CONTENT AREA -->
        <div class="overflow-y-auto">
          <div v-if="currentView === 'Profile'" class="w-full p-4">
            <SuperAdminDashboardWelcome :darkMode="darkMode" />
          </div>
          <div v-if="currentView === 'Menu'" class="lg:px-6 pt-6 pb-80">
            <SuperAdminDashboardWelcome :darkMode="darkMode" />

            <!-- Modern Grid Layout with Better Spacing -->
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6"
            >
              <div
                v-for="menu in filteredMenuList"
                :key="menu.label || menu.group"
                class="rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border overflow-hidden"
                :class="
                  darkMode
                    ? 'bg-gray-800 border-gray-700 hover:border-green-500'
                    : 'bg-white border-gray-100'
                "
              >
                <template v-if="menu.group">
                  <!-- Group Header with Gradient Background -->
                  <button
                    class="w-full flex flex-col items-center justify-center p-6 text-center font-semibold transition-all relative overflow-hidden"
                    :class="
                      darkMode
                        ? 'text-gray-200 hover:text-green-400'
                        : 'text-gray-800 hover:text-green-700'
                    "
                    @click="toggleGroup(menu.group)"
                  >
                    <!-- Gradient Background on Hover -->
                    <div
                      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      :class="
                        darkMode
                          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30'
                          : 'bg-gradient-to-br from-green-50 to-emerald-50'
                      "
                    ></div>

                    <!-- Icon with Modern Design -->
                    <div
                      class="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300 mb-3 shadow-lg"
                    >
                      <i class="fa fa-folder-open text-2xl text-white"></i>
                    </div>

                    <!-- Group Name -->
                    <span
                      class="relative text-sm font-bold truncate w-full px-2"
                      >{{ menu.group }}</span
                    >

                    <!-- Chevron Indicator -->
                    <i
                      class="relative fa fa-chevron-down mt-2 text-xs transition-transform duration-300"
                      :class="[
                        { 'rotate-180': openGroups.includes(menu.group) },
                        darkMode ? 'text-gray-500' : 'text-gray-400',
                      ]"
                    ></i>
                  </button>

                  <!-- Expandable Menu Items -->
                  <transition name="slide-fade">
                    <div
                      v-if="openGroups.includes(menu.group)"
                      class="border-t"
                      :class="
                        darkMode
                          ? 'border-gray-700 bg-gray-900/50'
                          : 'border-gray-100 bg-gray-50'
                      "
                    >
                      <ul class="space-y-1 p-3">
                        <li
                          v-for="item in menu.items"
                          :key="item.label"
                          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer group/item"
                          :class="[
                            currentView === item.view
                              ? 'bg-green-500 text-white shadow-md'
                              : darkMode
                                ? 'text-gray-300 hover:bg-gray-800 hover:shadow-sm'
                                : 'text-gray-700 hover:bg-white hover:shadow-sm',
                          ]"
                          @click="handleMenuClick(item)"
                        >
                          <div
                            class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
                            :class="
                              currentView === item.view
                                ? 'bg-white/20'
                                : 'bg-green-100 group-hover/item:bg-green-200'
                            "
                          >
                            <i
                              :class="[
                                'fa',
                                item.icon,
                                'text-lg',
                                currentView === item.view
                                  ? 'text-white'
                                  : 'text-green-600',
                              ]"
                            ></i>
                          </div>
                          <span class="truncate font-medium">{{
                            item.label
                          }}</span>
                        </li>
                      </ul>
                    </div>
                  </transition>
                </template>

                <!-- Non-Group Menu Items -->
                <template v-else>
                  <div
                    class="flex flex-col items-center justify-center p-6 text-center font-semibold transition-all cursor-pointer relative overflow-hidden"
                    :class="
                      darkMode
                        ? 'text-gray-200 hover:text-green-400'
                        : 'text-gray-800 hover:text-green-700'
                    "
                    @click="handleMenuClick(menu)"
                  >
                    <!-- Gradient Background on Hover -->
                    <div
                      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      :class="
                        darkMode
                          ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30'
                          : 'bg-gradient-to-br from-green-50 to-emerald-50'
                      "
                    ></div>

                    <!-- Icon with Modern Design -->
                    <div
                      class="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300 mb-3 shadow-lg"
                    >
                      <i :class="['fa', menu.icon, 'text-2xl text-white']"></i>
                    </div>

                    <!-- Label -->
                    <span
                      class="relative text-sm font-bold truncate w-full px-2"
                      >{{ menu.label }}</span
                    >
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div v-else-if="currentView === 'form'" class="p-4 pb-52">
            <SuperAdminDashboardCmsForm @contentSubmitted="handleContentSubmitted" :darkMode="darkMode"/>
          </div>
          <div v-else-if="currentView === 'list'" class="p-4 pb-32">
            <SuperAdminDashboardCmsList :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'appointments'" class="pb-32">
            <SuperAdminDashboardServicesLibraryReserved :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'books'" class="pb-32">
            <SuperAdminDashboardServicesLibraryBooks :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'schedules'" class="pb-24">
            <SuperAdminDashboardServicesLibrarySchedules :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'hr-job-vacancy-list'" class="p-4 pb-32">
            <SuperAdminDashboardServicesHr :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'hr-raffle'" class="p-4 pb-32">
            <SuperAdminDashboardServicesHrRaffle :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'university-calendar'" class="p-4 pb-32">
            <SuperAdminDashboardChancellorOffice :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'npcc'" class="px-2 pb-32">
            <SuperAdminDashboardServicesIt :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'registrar'" class="pb-32">
            <SuperAdminDashboardServicesRegistrar :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'campusPass'" class="pb-32">
            <SuperAdminDashboardServicesCampusPass :darkMode="darkMode" />
          </div>
          <div v-else-if="currentView === 'drs'" class="pb-32">
            <SuperAdminDashboardServicesDrs :darkMode="darkMode" />
          </div>
        </div>
        <nav
          class="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t border-gray-200 shadow-2xl"
          :class="[
            darkMode ? 'bg-gray-800 text-white' : 'bg-white/95 text-gray-900',
          ]"
        >
          <div class="flex justify-evenly items-center px-4 mx-auto">
            <button
              v-for="(menu, index) in menuList"
              :key="index"
              @click="handleMenuClick(menu)"
              class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative group"
              :class="
                currentView === menu.view
                  ? 'text-green-600'
                  : 'text-gray-600 hover:text-green-600'
              "
            >
              <!-- Active Indicator -->
              <div
                v-if="currentView === menu.view"
                class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              ></div>

              <!-- Icon Container -->
              <div
                class="relative lg:w-8 lg:h-8 w-7 h-7 flex items-center justify-center rounded-2xl transition-all duration-300"
                :class="
                  currentView === menu.view
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 scale-110'
                    : 'bg-gray-100 group-hover:bg-green-50 group-hover:scale-105'
                "
              >
                <i
                  :class="[
                    'fa',
                    menu.icon,
                    'lg:text-xl text-base transition-colors',
                    currentView === menu.view
                      ? 'text-white'
                      : 'text-gray-600 group-hover:text-green-600',
                  ]"
                ></i>
              </div>

              <!-- Label -->
              <span
                class="text-[10px] transition-colors"
                :class="
                  currentView === menu.view
                    ? 'text-green-600'
                    : 'text-gray-600 group-hover:text-green-600'
                "
              >
                {{ menu.label }}
              </span>
            </button>
          </div>
          <DashboardFooter :darkMode="darkMode" />
        </nav>
      </div>
    </div>
    <!-- UNAUTHORIZED VIEW -->
    <div v-else class="flex items-center justify-center h-screen bg-gray-50">
      <div class="text-center">
        <i class="fa fa-lock text-4xl text-gray-400 mb-4"></i>
        <h1 class="text-2xl font-bold text-gray-800 mb-2">
          Unauthorized Access
        </h1>
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
/* Slide Fade Animation for Menu Groups */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Smooth Theme Transition */
:global(.theme-transition),
:global(.theme-transition *) {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease !important;
}
</style>
