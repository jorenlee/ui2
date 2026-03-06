<script setup>
import { ref, computed, watch, onMounted, resolveComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
import userRolesConfig from "@/user-roles-config.json";

const router = useRouter();
const route = useRoute();
const { user, isLoggedIn, logout, setAuth, init } = useAuth();

// ---------------- PROCESS ROLES FROM JSON ----------------
const superAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("superAdmin"))
  .map((user) => user.email);

const npccMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("npccMenu"))
  .map((user) => user.email);

const ochAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("ochAdmin"))
  .map((user) => user.email);

const contentWritersEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("contentWriter"))
  .map((user) => user.email);

const hrMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("hrMenu"))
  .map((user) => user.email);

const libraryMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("libraryMenu"))
  .map((user) => user.email);

const registrarMenuEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("registrarMenu"))
  .map((user) => user.email);

const campusPassAdminEmails = userRolesConfig.userRoles
  .filter((user) => user.roles.includes("campusPassAdmin"))
  .map((user) => user.email);

// ---------------- AUTH & COMPUTED ----------------
const isUserAuthenticated = computed(() => isLoggedIn.value);

const rolesByEmail = computed(() => ({
  superAdmin: superAdminEmails,
  hr: hrMenuEmails,
  library: libraryMenuEmails,
  contentWriter: contentWritersEmails,
  och: ochAdminEmails,
  npcc: npccMenuEmails,
  registrar: registrarMenuEmails,
  campusPass: campusPassAdminEmails,
}));

// ---------------- DARK MODE ----------------
const darkMode = ref(false);

const toggleDarkMode = () => {
  darkMode.value = !darkMode.value;
  if (process.client) {
    localStorage.setItem("theme", darkMode.value ? "dark" : "light");
    document.documentElement.classList.add("theme-transition");
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  }
};

onMounted(() => {
  if (process.client) {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    darkMode.value = storedTheme === "dark" || (!storedTheme && prefersDark);
  }
});

// ---------------- HANDLE TOKEN FROM URL ----------------
onMounted(() => {
  init();
  const token = route.query.token;

  if (token && typeof token === "string") {
    setAuth(token);
    router.replace("/dashboard");
  } else if (!isLoggedIn.value) {
    router.replace("/login");
  }
});

// ---------------- STATE ----------------
definePageMeta({ middleware: "cms-auth" });

const currentView = ref("Menu");
const openGroups = ref([
  "Content Management",
  "Human Resource",
  "Library Management",
  "Office of The Chancellor",
  "NPCC IT Services",
  "University Registrar",
  "Campus Pass",
  "Document Reviewer System",
  "IT Services Feedback",
  "Commission on Election",
  "External Links",
  "General Services Office",
  "Animo Run",
  "Safety and Security Center",
  "Lasalle Alumni Association",
]);

// Public menu groups accessible to all authenticated users
const publicMenuGroups = [
  "IT Services Feedback",
  "Animo Run",
  "External Links",
  "Lasalle Alumni Association",
];

// LSU-only menu groups (only @lsu.edu.ph domain)
const lsuOnlyMenuGroups = [
  "Commission on Election",
  "General Services Office",
  "Document Reviewer System",
  "Safety and Security Center",
];

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

// ---------------- VIEW CONFIGURATION ----------------
const currentViewConfig = computed(() => {
  const config = {
    form: {
      component: resolveComponent("SuperAdminDashboardCmsForm"),
      class: "p-4 pb-52",
      props: { onContentSubmitted: handleContentSubmitted },
    },
    list: {
      component: resolveComponent("SuperAdminDashboardCmsList"),
      class: "p-4 pb-32",
    },
    appointments: {
      component: resolveComponent("SuperAdminDashboardServicesLibraryReserved"),
      class: "pb-32",
    },
    books: {
      component: resolveComponent("SuperAdminDashboardServicesLibraryBooks"),
      class: "pb-32",
    },
    schedules: {
      component: resolveComponent(
        "SuperAdminDashboardServicesLibrarySchedules",
      ),
      class: "pb-24",
    },
    hrJobVacancyList: { component: resolveComponent("ComingSoon"), class: "" },
    hrRaffle: {
      component: resolveComponent("SuperAdminDashboardServicesHrRaffle"),
      class: "p-4 pb-32",
    },
    universityCalendar: {
      component: resolveComponent("SuperAdminDashboardChancellorOffice"),
      class: "p-4 pb-32",
    },
    npcc: {
      component: resolveComponent("SuperAdminDashboardServicesIt"),
      class: "px-2 pb-32",
    },
    registrar: {
      component: resolveComponent("SuperAdminDashboardServicesRegistrar"),
      class: "pb-32",
    },
    campusPass: {
      component: resolveComponent("SuperAdminDashboardServicesCampusPass"),
      class: "pb-32",
    },
    drsList: {
      component: resolveComponent("SuperAdminDashboardServicesDrsList"),
      class: "pb-32",
    },
    drsForm: {
      component: resolveComponent("SuperAdminDashboardServicesDrsForm"),
      class: "pb-20",
    },
    ITServicesFeedback: {
      component: resolveComponent("UniversityPortalITServicesList"),
      class: "pb-32",
    },
    BorrowOfficeKeys: { component: resolveComponent("ComingSoon"), class: "" },
    VehicleReservation: {
      component: resolveComponent("ComingSoon"),
      class: "",
    },
    VenueReservation: { component: resolveComponent("ComingSoon"), class: "" },
    LSUCommissionOnElectionVoting: {
      component: resolveComponent("ComingSoon"),
      class: "",
    },
    LSUCommissionOnElectionResults: {
      component: resolveComponent("ComingSoon"),
      class: "",
    },
    AnimoRunStatus: { component: resolveComponent("ComingSoon"), class: "" },
    AnimoRunRegistration: {
      component: resolveComponent("ComingSoon"),
      class: "",
    },
  };
  return config[currentView.value];
});

// ---------------- LIFECYCLE ----------------
onMounted(() => {
  if (!isLoggedIn.value) router.replace("/login");
});

// ---------------- MENU ----------------
const subMenuList = [
  {
    group: "Animo Run",
    items: [
      {
        label: "Registration",
        icon: "fa-running",
        type: "button",
        view: "AnimoRunRegistration",
      },
      {
        label: "Status Checking",
        icon: "fa-list",
        type: "button",
        view: "AnimoRunStatus",
      },
    ],
  },
  {
    group: "Campus Pass",
    allowedEmails: campusPassAdminEmails,
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
    group: "Content Management",
    allowedEmails: contentWritersEmails,
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
    group: "Document Reviewer System",
    items: [
      {
        label: "DRS List",
        icon: "fa-list",
        type: "button",
        view: "drsList",
      },
      {
        label: "DRS Form",
        icon: "fa-file-alt",
        type: "button",
        view: "drsForm",
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
    group: "Human Resource",
    allowedEmails: hrMenuEmails,
    items: [
      {
        label: "Human Resource Analytics",
        icon: "fa-list-alt",
        type: "button",
        view: "hrJobVacancyList",
      },
      // {
      //   label: "Raffle Draw",
      //   icon: "fa-list-alt",
      //   type: "button",
      //   view: "hrRaffle",
      // },
    ],
  },

  {
    group: "IT Services Feedback",
    items: [
      {
        label: "IT Services Feedback",
        icon: "fa-list",
        type: "button",
        view: "ITServicesFeedback",
      },
    ],
  },
  {
    group: "Library Management",
    allowedEmails: libraryMenuEmails,
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
    group: "NPCC IT Services",
    allowedEmails: npccMenuEmails,
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
    group: "Office of The Chancellor",
    allowedEmails: ochAdminEmails,
    items: [
      {
        label: "University Calendar",
        icon: "fa-calendar",
        type: "button",
        view: "universityCalendar",
      },
    ],
  },
  {
    group: "Safety and Security Center",
    items: [
      {
        label: "Borrow Office Keys",
        icon: "fa-key",
        type: "button",
        view: "BorrowOfficeKeys",
      },
    ],
  },
  {
    group: "University Registrar",
    allowedEmails: registrarMenuEmails,
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
    group: "External Links",
    items: [
      {
        label: "LSU Home Page",
        icon: "fa-home",
        type: "link",
        view: "https://lsu.edu.ph",
      },
    ],
  },
];

const menuList = [
  { label: "Menu", icon: "fa-bars", type: "button", view: "Menu" },
  { label: "Settings", icon: "fa-cog", type: "button", view: "Settings" },
  { label: "Logout", icon: "fa-sign-out", type: "button", view: "Logout" },
];

const filteredMenuList = computed(() => {
  const role = userRole.value;
  const email = user.value?.email;

  return subMenuList.filter((menu) => {
    // Allow public menu groups for all authenticated users
    if (publicMenuGroups.includes(menu.group)) {
      return true;
    }

    // LSU-only menu groups (only @lsu.edu.ph domain)
    if (lsuOnlyMenuGroups.includes(menu.group)) {
      return email?.endsWith("@lsu.edu.ph");
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
  if (menu.type === "button") {
    currentView.value = menu.view;
  } else if (menu.type === "link") {
    // Open external link in new tab
    window.open(menu.view, "_blank");
  } else {
    navigateTo(menu.to);
  }
};
</script>

<template>
  <div
    :class="darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-600'"
  >
    <!-- LOGOUT CONFIRMATION -->
    <div v-if="isUserAuthenticated">
      <!-- MAIN CONTENT -->
      <div class="w-full">
        <!-- CONTENT AREA -->
        <div class="overflow-y-auto">
          <!-- Dynamic Component Rendering -->
          <div v-if="currentViewConfig" :class="currentViewConfig.class">
            <component
              :is="currentViewConfig.component"
              :darkMode="darkMode"
              v-bind="currentViewConfig.props || {}"
            />
          </div>
        </div>
        <div v-if="currentView === 'Menu'" class="lg:px-6 px-3 pt-2 pb-80">
          <SuperAdminDashboardWelcome :darkMode="darkMode" />
          <SuperAdminDashboardMenuList
            :filteredMenuList="filteredMenuList"
            :darkMode="darkMode"
            :currentView="currentView"
            :defaultOpenGroups="openGroups"
            @menu-click="handleMenuClick"
          />
        </div>
        <div v-if="currentView === 'Settings'" class="w-full p-4">
          <SuperAdminDashboardWelcome :darkMode="darkMode" />
          <ToggleDarkLightMode
            :darkMode="darkMode"
            @toggle-dark-mode="toggleDarkMode"
          />
        </div>
        <div v-if="currentView === 'Logout'">
          <Logout
            :darkMode="darkMode"
            @confirm="logOut"
            @cancel="currentView = 'Menu'"
          />
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
/* Smooth Theme Transition */
:global(.theme-transition),
:global(.theme-transition *) {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease !important;
}
</style>
