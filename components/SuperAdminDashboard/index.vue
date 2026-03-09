<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

// ---------------- AUTH ----------------
const { user, isLoggedIn, logout, setAuth, init } = useAuth();

const rolePermissions = ref([]);
const darkMode = ref(false);

// ---------------- AUTH CHECK ----------------
const isUserAuthenticated = computed(() => isLoggedIn.value);

// ---------------- FETCH ROLE PERMISSIONS ----------------
const fetchRolePermissions = async () => {
  try {
    rolePermissions.value = await $fetch(endpoint + "/api/cits/role-permissions/list/");
  } catch (error) {
    console.error("Error loading role permissions:", error);
  }
};

// ---------------- BUILD ROLE MAP ----------------
const rolesByEmail = computed(() => {
  const roles = {
    npccMenu: [],
    ochAdmin: [],
    contentWriter: [],
    hrMenu: [],
    libraryMenu: [],
    registrarMenu: [],
    campusPassAdmin: [],
    drsAdmin: [],
    superAdminPermission: [],
  };

  rolePermissions.value.forEach((item) => {
    item.role_filter_permissions?.forEach((role) => {
      if (roles[role]) {
        roles[role].push(item.email);
      }
    });
  });

  return roles;
});

// ---------------- DERIVED EMAIL LISTS ----------------
const campusPassAdminEmails = computed(() => rolesByEmail.value.campusPassAdmin);
const contentWritersEmails = computed(() => rolesByEmail.value.contentWriter);
const hrMenuEmails = computed(() => rolesByEmail.value.hrMenu);
const libraryMenuEmails = computed(() => rolesByEmail.value.libraryMenu);
const npccMenuEmails = computed(() => rolesByEmail.value.npccMenu);
const ochAdminEmails = computed(() => rolesByEmail.value.ochAdmin);
const registrarMenuEmails = computed(() => rolesByEmail.value.registrarMenu);
const superAdminPermissionEmails = computed(() => rolesByEmail.value.superAdminRolePermissions);

// ---------------- CURRENT USER ROLES ----------------
const userRoles = computed(() => {
  if (!user.value?.email) return [];
  const record = rolePermissions.value.find(r => r.email === user.value.email);
  return record?.role_filter_permissions || [];
});

// ---------------- MAIN USER ROLE ----------------
const userRole = computed(() => {
  if (userRoles.value.includes("Super Admin")) return "Super Admin";
  if (userRoles.value.length > 0) return userRoles.value[0];
  return null;
});

// ---------------- DARK MODE ----------------
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

// ---------------- PAGE META ----------------
definePageMeta({
  middleware: "cms-auth",
});

// ---------------- HANDLE TOKEN FROM URL ----------------
onMounted(async () => {
  await init();

  const token = route.query.token;
  if (token && typeof token === "string") {
    setAuth(token);
    router.replace("/dashboard");
  }

  if (!isLoggedIn.value) router.replace("/login");

  await fetchRolePermissions();

  if (process.client) {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    darkMode.value = storedTheme === "dark" || (!storedTheme && prefersDark);
  }
});

const filteredMenuList = computed(() => {
  const role = userRole.value;
  const email = user.value?.email;

  return subMenuList.filter(menu => {
    if (publicMenuGroups.includes(menu.group)) return true;
    if (lsuOnlyMenuGroups.includes(menu.group)) return email?.endsWith("@lsu.edu.ph");
    if (!role) return false;
    return role === "Super Admin" || !menu.allowedEmails || menu.allowedEmails.includes(email);
  });
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
  {
    group: "Lasalle Alumni Association",
    items: [
      {
        label: "Lasalle Alumni Association",
        icon: "fa-graduation-cap",
        type: "link",
        view: "https://lasallealumni.ph/",
      },
    ],
  },
  {
    group: "Super Admin",
    allowedEmails: superAdminPermissionEmails,
    items: [
      {
        label: "Role Permissions",
        icon: "fa-user-shield",
        type: "button",
        view: "RolePermissions",
      },
    ],
  },
];

const menuList = [
  { label: "Menu", icon: "fa-bars", type: "button", view: "Menu" },
  { label: "Settings", icon: "fa-cog", type: "button", view: "Settings" },
  { label: "Logout", icon: "fa-sign-out", type: "button", view: "Logout" },
];

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
  "Super Admin",
]);

const logOut = () => {
  logout();
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
    RolePermissions: {
      component: resolveComponent("SuperAdminDashboardRolePermissions"),
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

// ---------------- METHODS ----------------
const toggleGroup = (groupName) => {
  const index = openGroups.value.indexOf(groupName);
  index > -1
    ? openGroups.value.splice(index, 1)
    : openGroups.value.push(groupName);
};

const handleContentSubmitted = () => {
  currentView.value = "list";
};

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
  <div :class="darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-600'">
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
        <SuperAdminDashboardNavigation
          :darkMode="darkMode"
          :menuList="menuList"
          :currentView="currentView"
          :toggleGroup="toggleGroup"
          @menu-click="handleMenuClick"
        />
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
