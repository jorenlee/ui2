<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";

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
const { user, isLoggedIn, logout } = useAuth();
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
  "IT Services Feedback",
  "Commission on Election",
  "External Links",
  "General Services Office",
  "Animo Run",
]);

// ---------------- AUTH & COMPUTED ----------------
const isUserAuthenticated = computed(() => isLoggedIn.value);

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
  const email = user.value?.email;
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
  logout();
};

const handleContentSubmitted = () => {
  currentView.value = "list";
};

// ---------------- LIFECYCLE ----------------
onMounted(() => {
  if (!isLoggedIn.value) router.replace("/login");
});

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
        label: "Human Resource Analytics",
        icon: "fa-list-alt",
        type: "button",
        view: "hr-job-vacancy-list",
      },
      // {
      //   label: "Raffle Draw",
      //   icon: "fa-list-alt",
      //   type: "button",
      //   view: "hr-raffle",
      // },
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
    group: "IT Services Feedback",
    items: [
      {
        label: "IT Services Feedback",
        icon: "fa-list",
        type: "button",
        view: "itServicesFeedback",
      },
    ],
  },
  {
    group: "Animo Run",
    items: [
      {
        label: "Registration",
        icon: "fa-running",
        type: "button",
        view: "animoRunRegistration",
      },
      {
        label: "Status Checking",
        icon: "fa-list",
        type: "button",
        view: "animoRunStatus",
      },
    ],
  },
  {
    group: "Commission on Election",
    items: [
      {
        label: "Student Election Results",
        icon: "fa-check",
        type: "button",
        view: "LSUCommissionOnElectionResults",
      },
      {
        label: "Student Election Voting",
        icon: "fa-list",
        type: "button",
        view: "LSUCommissionOnElectionVoting",
      },
    ],
  },
  {
    group: "General Services Office",
    items: [
      {
        label: "Venue Reservation",
        icon: "fa-building",
        type: "button",
        view: "VenueReservation",
      },
      {
        label: "Vehicle Reservation",
        icon: "fa-car",
        type: "button",
        view: "VehicleReservation",
      },
    ],
  },
    {
    group: "External Links",
    items: [
      {
        label: "LSU Home Page",
        icon: "fa-home",
        type: "button",
        view: "externalLinks",
      },
    ],
  }
];



const menuList = [
  { label: "Menu", icon: "fa-bars", type: "button", view: "Menu" },
  { label: "Search", icon: "fa-search", type: "button", view: "Search" },
  { label: "Profile", icon: "fa-user", type: "button", view: "Profile" },
  { label: "Logout", icon: "fa-sign-out", type: "button", view: "Logout" },
];

// Public menu groups accessible to all authenticated users
const publicMenuGroups = [
  "IT Services Feedback",
  "Animo Run",
  "Commission on Election",
  "General Services Office",
  "External Links"
];

const filteredMenuList = computed(() => {
  const role = userRole.value;
  const email = user.value?.email;

  return subMenuList.filter((menu) => {
    // Allow public menu groups for all authenticated users
    if (publicMenuGroups.includes(menu.group)) {
      return true;
    }

    // For non-public groups, check role and email permissions
    if (!role) return false;

    return (
      role === "superAdmin" ||
      !menu.allowedEmails ||
      menu.allowedEmails.includes(email)
    );
  });
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
    <ToggleDarkLightMode :darkMode="darkMode" @toggle-dark-mode="toggleDarkMode" />
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
        class="w-full px-3"
        :class="
          darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-600'
        ">
        <!-- CONTENT AREA -->
        <div class="overflow-y-auto">
          <div v-if="currentView === 'Profile'" class="w-full p-4">
            <SuperAdminDashboardWelcome :darkMode="darkMode" />
          </div>
          <div v-if="currentView === 'Menu'" class="lg:px-6 pt-6 pb-80">
            <SuperAdminDashboardWelcome :darkMode="darkMode" />
            <SuperAdminDashboardMenuList
              :filteredMenuList="filteredMenuList"
              :darkMode="darkMode"
              :currentView="currentView"
              :defaultOpenGroups="openGroups"
              @menu-click="handleMenuClick"
            />
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
          <div v-else-if="currentView === 'itServicesFeedback'" class="pb-32">
            <!-- <SuperAdminDashboardExternalLinks :darkMode="darkMode" /> -->
            <UniversityPortalITServicesList :darkMode="darkMode" />
          </div>
        </div>
        <SuperAdminDashboardNavigation
          :darkMode="darkMode"
          :menuList="menuList"
          :currentView="currentView"
          :toggleGroup="toggleGroup"
          @menu-click="handleMenuClick"
        />
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
