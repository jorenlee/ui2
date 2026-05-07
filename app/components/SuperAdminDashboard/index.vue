<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const { user, isLoggedIn, logout, setAuth, init } = useAuth();

// ---------------- STATE ----------------
const rolePermissions = ref([]);
const darkMode = ref(false);
const currentView = ref("Menu");

const openGroups = ref([
  "Content Management",
  "Open Educational Resources",
  "Library Management",
  "NPCC IT Services",
  "University Registrar",
  "Campus Pass",
  "Document Reviewer",
  "IT Services Feedback",
  "Safety and Security Center",
  "Human Resource",
  "Office of The Chancellor",
  "Commission on Election",
  "External Links",
  "General Services Office",
  "Lasalle Alumni Association",
  "Animo Run",
  "Super Admin",
]);

// ---------------- MENU PERMISSION ----------------
const publicMenuGroups = [
  "IT Services Feedback",
  "Animo Run",
  "External Links",
  "Lasalle Alumni Association",
];

const lsuOnlyMenuGroups = [
  "Commission on Election",
  "General Services Office",
  "Document Reviewer",
  "Safety and Security Center",
];

// ---------------- API ----------------
const api = (url) => $fetch(`${endpoint}${url}`);

// ---------------- FETCH ROLE PERMISSIONS ----------------
const fetchRolePermissions = async () => {
  try {
    rolePermissions.value = await api("/api/cits/role-permissions/list/");
  } catch (err) {
    console.error("Role permission error:", err);
  }
};

// ---------------- USER ROLES ----------------
const userRoles = computed(() => {
  if (!user.value?.email) return [];

  return (
    rolePermissions.value.find((r) => r.email === user.value.email)
      ?.role_filter_permissions || []
  );
});

const userRole = computed(() => {
  if (userRoles.value.includes("Super Admin")) return "Super Admin";
  return userRoles.value[0] || null;
});

// ---------------- AUTH ----------------
const isUserAuthenticated = computed(() => isLoggedIn.value);

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

// ---------------- MOUNT ----------------
onMounted(async () => {
  await init();

  const token = route.query.token;
  if (token) {
    setAuth(token);
    router.replace("/dashboard");
  }

  if (!isLoggedIn.value) router.replace("/login");

  await fetchRolePermissions();

  if (process.client) {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    darkMode.value = stored === "dark" || (!stored && prefersDark);
  }
});

// ---------------- MENU FILTER ----------------
const filteredMenuList = computed(() => {
  const roles = userRoles.value;
  const email = user.value?.email;

  // ✅ SUPER ADMIN → SEE EVERYTHING
  if (roles.includes("Super Admin")) {
    return subMenuList;
  }

  return subMenuList.filter((menu) => {
    // Public menus
    if (publicMenuGroups.includes(menu.group)) return true;

    // LSU only menus
    if (lsuOnlyMenuGroups.includes(menu.group)) {
      return email?.endsWith("@lsu.edu.ph");
    }

    // No role restriction
    if (!menu.allowedRole) return true;

    // Check user roles
    return roles.includes(menu.allowedRole);
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
        view: "ViewAnimoRunRegistration",
      },
      {
        label: "Status Checking",
        icon: "fa-list",
        type: "button",
        view: "ViewAnimoRunList",
      },
    ],
  },

  {
    group: "Campus Pass",
    allowedRole: "Campus Pass Admin",
    items: [
      {
        label: "Campus Pass Management",
        icon: "fa-id-card",
        type: "button",
        view: "ViewCampusPassRequests",
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
        view: "ViewCOEResults",
      },
      {
        label: "Student Election Voting",
        icon: "fa-list",
        type: "button",
        view: "ViewCOEVoting",
      },
    ],
  },

  {
    group: "Content Management",
    allowedRole: "Content Writer",
    items: [
      {
        label: "Content Form",
        icon: "fa-list",
        type: "button",
        view: "ViewContentForm",
      },
      {
        label: "All Contents Lists",
        icon: "fa-list-alt",
        type: "button",
        view: "ViewContentList",
      },
    ],
  },
  {
    group: "Document Reviewer",
    allowedRole: "DRS Admin",
    items: [
      {
        label: "DRS List",
        icon: "fa-list",
        type: "button",
        view: "ViewDRSList",
      },
      {
        label: "DRS Form",
        icon: "fa-file",
        type: "button",
        view: "ViewDRSForm",
      },
    ],
  },
  {
    group: "General Services Office",
    items: [
      {
        label: "Facilities Reservation Form",
        icon: "fa-building",
        type: "button",
        view: "ViewGSOFacilitiesReservationForm",
      },
      {
        label: "Facilities Reservation List",
        icon: "fa-list",
        type: "button",
        view: "ViewGSOFacilitiesReservationList",
      },
      {
        label: "Vehicle Reservation Form",
        icon: "fa-car",
        type: "button",
        view: "ViewGSOVehicleReservationForm",
      },
      {
        label: "Vehicle Reservation List",
        icon: "fa-list",
        type: "button",
        view: "ViewGSOVehicleReservationList",
      },
    ],
  },
  {
    group: "Human Resource",
    allowedRole: "HR Menu",
    items: [
      {
        label: "Current Employed Admins",
        icon: "fa-list-alt",
        type: "button",
        view: "ViewCurrentEmployedAdmins",
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
        view: "ViewITServicesFeedback",
      },
    ],
  },
  {
    group: "Lasalle Alumni Association",
    items: [
      {
        label: "Lasalle Alumni Association",
        icon: "fa-graduation-cap",
        type: "button",
        view: "ViewAlumni",
      },
    ],
  },
  {
    group: "Library Management",
    allowedRole: "Library Menu",
    items: [
      {
        label: "Appointment Lists",
        icon: "fa-list-alt",
        type: "button",
        view: "ViewLibraryAppointments",
      },
      {
        label: "Available Books",
        icon: "fa-book",
        type: "button",
        view: "ViewLibraryBooks",
      },
      {
        label: "Set Schedules",
        icon: "fa-calendar",
        type: "button",
        view: "ViewLibrarySchedules",
      },
    ],
  },
  {
    group: "NPCC IT Services",
    allowedRole: "NPCC Menu",
    items: [
      {
        label: "NPCC Management",
        icon: "fa-cogs",
        type: "button",
        view: "ViewITTicketsRequests",
      },
    ],
  },
  {
    group: "Office of The Chancellor",
    allowedRole: "OCH Admin",
    items: [
      {
        label: "University Calendar",
        icon: "fa-calendar",
        type: "button",
        view: "ViewUniversityCalendar",
      },
    ],
  },
  {
    group: "Open Educational Resources",
    items: [
      {
        label: "OER Form",
        icon: "fa-book",
        type: "button",
        view: "ViewOERForm",
      },
      {
        label: "OER List",
        icon: "fa-book-open",
        type: "button",
        view: "ViewOERList",
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
        view: "ViewBorrowKeys",
      },
    ],
  },
  {
    group: "University Registrar",
    allowedRole: "Registrar Menu",
    items: [
      {
        label: "University Registrar",
        icon: "fa-university",
        type: "button",
        view: "ViewRegistrarAppointments",
      },
    ],
  },
  {
    group: "Super Admin",
    allowedRole: "Super Admin",
    items: [
      {
        label: "Role Permissions",
        icon: "fa-user-shield",
        type: "button",
        view: "ViewRolePermissions",
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

// ---------------- TOP MENU ----------------
const menuList = [
  { label: "Menu", icon: "fa-bars", type: "button", view: "Menu" },
  { label: "Settings", icon: "fa-cog", type: "button", view: "Settings" },
  { label: "Logout", icon: "fa-sign-out", type: "button", view: "Logout" },
];

// ---------------- VIEW CONFIG ----------------
const currentViewConfig = computed(() => {
  const views = {
    ViewContentForm: {
      component: resolveComponent("SuperAdminDashboardServicesCMSForm"),
      class: "p-4 pb-52",
      props: { onContentSubmitted: handleContentSubmitted },
    },
    ViewContentList: {
      component: resolveComponent("SuperAdminDashboardServicesCMSList"),
      class: "p-4 pb-32",
    },
    ViewLibraryAppointments: {
      component: resolveComponent("SuperAdminDashboardServicesLibraryReserved"),
      class: "pb-32",
    },
    ViewLibraryBooks: {
      component: resolveComponent("SuperAdminDashboardServicesLibraryBooks"),
      class: "pb-32",
    },
    ViewLibrarySchedules: {
      component: resolveComponent(
        "SuperAdminDashboardServicesLibrarySchedules",
      ),
      class: "pb-24",
    },
    ViewUniversityCalendar: {
      component: resolveComponent(
        "SuperAdminDashboardServicesChancellorOffice",
      ),
      class: "p-4 pb-32",
    },
    ViewITTicketsRequests: {
      component: resolveComponent("SuperAdminDashboardServicesIt"),
      class: "px-2 pb-32",
    },
    ViewRegistrarAppointments: {
      component: resolveComponent("SuperAdminDashboardServicesRegistrar"),
      class: "pb-32",
    },
    ViewCampusPassRequests: {
      component: resolveComponent("SuperAdminDashboardServicesCampusPass"),
      class: "pb-32",
    },
    ViewDRSList: {
      component: resolveComponent("SuperAdminDashboardServicesDrsList"),
      class: "pb-32",
    },
    ViewDRSForm: {
      component: resolveComponent("SuperAdminDashboardServicesDrsForm"),
      class: "pb-20",
    },
    ViewITServicesFeedback: {
      component: resolveComponent("UniversityPortalITServicesList"),
      class: "pb-32",
    },
    ViewRolePermissions: {
      component: resolveComponent("SuperAdminDashboardRolePermissions"),
      class: "pb-32",
    },
    ViewAnimoRunRegistration: {
      component: resolveComponent("AnimoRunRegistration"),
      class: "pb-32",
    },
    ViewAnimoRunList: {
      component: resolveComponent("AnimoRunList"),
      class: "pb-32",
    },
    ViewCOEResults: { component: resolveComponent("ComingSoon") },
    ViewCOEVoting: { component: resolveComponent("ComingSoon") },
    ViewVenueReservation: { component: resolveComponent("ComingSoon") },
    ViewVehicleReservation: { component: resolveComponent("ComingSoon") },
    ViewHRJobVacancyList: { component: resolveComponent("ComingSoon") },
    ViewBorrowKeys: { component: resolveComponent("ComingSoon") },
    ViewAlumni: { component: resolveComponent("ComingSoon") },
    ViewCurrentEmployedAdmins: {
      component: resolveComponent(
        "SuperAdminDashboardServicesHrEmployedAdmins",
      ),
      class: "pb-32",
    },
    ViewGSOFacilitiesReservationForm: {
      component: resolveComponent("GSOFacilitiesReservationForm"),
      class: "pb-32",
    },
    ViewGSOFacilitiesReservationList: {
      component: resolveComponent("GSOFacilitiesReservationForm"),
      class: "pb-32",
    },
    ViewGSOVehicleReservationForm: {
      component: resolveComponent("GSOVehicleReservationForm"),
      class: "pb-32",
    },
    ViewGSOVehicleReservationList: {
      component: resolveComponent("GSOVehicleReservationForm"),
      class: "pb-32",
    },
    ViewOERForm: {
      component: resolveComponent("SuperAdminDashboardServicesOERForm"),
      class: "pb-32",
    },
    ViewOERList: {
      component: resolveComponent("SuperAdminDashboardServicesOERList"),
      class: "pb-32",
    },
  };

  return views[currentView.value];
});

// ---------------- ACTIONS ----------------
const toggleGroup = (group) => {
  const i = openGroups.value.indexOf(group);
  i > -1 ? openGroups.value.splice(i, 1) : openGroups.value.push(group);
};

const handleContentSubmitted = () => (currentView.value = "list");

const handleMenuClick = (menu) => {
  if (menu.type === "button") currentView.value = menu.view;
  else if (menu.type === "link") window.open(menu.view, "_blank");
};

const logOut = () => logout();
</script>

<template>
  <div
    :class="darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-600'"
  >
    <div v-if="isUserAuthenticated">
      <div class="w-full">
        <div class="overflow-y-auto">
          <div v-if="currentViewConfig" :class="currentViewConfig.class">
            <component
              :is="currentViewConfig.component"
              :darkMode="darkMode"
              :rolePermissions="rolePermissions"
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
:global(.theme-transition),
:global(.theme-transition *) {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease !important;
}
</style>
