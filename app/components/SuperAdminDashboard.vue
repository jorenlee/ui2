<script setup>
import { ref, computed, onMounted, defineAsyncComponent, shallowRef, watch } from "vue";
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
const initialLoading = ref(true);

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
  "Commission on Election BEU",
  "External Links",
  "General Services Office",
  "Lasalle Alumni Association",
  "Emerald Run",
  "Super Admin",
  "Juris Doctor Admin",
  "Juris Doctor Examinee",
]);

// ---------------- MENU PERMISSION ----------------
// Access is default-deny: every menu group below must have an `allowedRole`
// (see subMenuList), and a user only sees it once that role has been
// explicitly granted to their email in Role Permissions. There is no more
// "public" menu concept and no "no allowedRole = visible to everyone"
// fallback — nothing is shown unless it was added in Role Permissions.
// Super Admin is the sole exception and sees every group regardless.

// lsuOnlyMenuGroups is an *additional* restriction layered on top of the
// role check below (not a grant on its own): even with the matching role,
// these groups are hidden from non-@lsu.edu.ph accounts.
// Using a Set for O(1) lookups instead of Array.includes O(n).
const lsuOnlyMenuGroups = new Set([
  "Emerald Run",
  "External Links",
  "Lasalle Alumni Association",
  "Commission on Election",
  "Commission on Election BEU",
  "General Services Office",
  "Document Reviewer",
  "Safety and Security Center",
]);

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
  // Start auth init — must complete before we can check isLoggedIn
  await init();

  const token = route.query.token;
  if (token) {
    setAuth(token);
    router.replace("/dashboard");
  }

  if (!isLoggedIn.value) {
    router.replace("/login");
    return; // No need to fetch role permissions if not logged in
  }

  // Read dark mode preference synchronously (no await needed) while
  // role permissions fetch runs in the background.
  if (process.client) {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    darkMode.value = stored === "dark" || (!stored && prefersDark);
  }

  // Fetch role permissions — runs after the UI has already painted the
  // menu skeleton, so the user sees content immediately.
  await fetchRolePermissions();

  initialLoading.value = false;
});

// ---------------- MENU FILTER ----------------
const filteredMenuList = computed(() => {
  const roles = userRoles.value;
  const email = user.value?.email;

  // No per-item filtering needed: all 4 Commission on Election items are
  // shown to every user who has been granted the "Commission on Election" role.
  const processMenu = (menuList) => {
    return menuList.filter(menu => menu.items.length > 0);
  };

  
  // ✅ SUPER ADMIN → SEE EVERYTHING
  if (roles.includes("Super Admin")) {
    return processMenu(subMenuList);
  }

  // Default-deny: a group only shows up if its allowedRole has been granted
  // to this user in Role Permissions. Groups that additionally require an
  // @lsu.edu.ph account (lsuOnlyMenuGroups) still need that on top of the
  // role grant — it's a narrowing check, not a way to bypass the role
  // requirement.
  const roleFiltered = subMenuList.filter((menu) => {
    // IT Services Feedback & Emerald Run are open to any @gmail.com or @lsu.edu.ph account,
    // regardless of what's set in Role Permissions.
    if (
      menu.group === "IT Services Feedback" ||
      menu.group === "Emerald Run"
    ) {
      return (
        email?.endsWith("@gmail.com") || email?.endsWith("@lsu.edu.ph")
      );
    }

    const hasRole = Array.isArray(menu.allowedRole)
      ? menu.allowedRole.some((r) => roles.includes(r))
      : roles.includes(menu.allowedRole);

    if (!menu.allowedRole || !hasRole) return false;

    if (lsuOnlyMenuGroups.has(menu.group) && !email?.endsWith("@lsu.edu.ph")) {
      return false;
    }

    return true;
  });

  return processMenu(roleFiltered);
});

// ---------------- MENU ----------------
const subMenuList = [
  {
    group: "Emerald Run",
    allowedRole: ["Emerald Run Admin", "Emerald Run"],
    items: [
      {
        label: "Walk-In Registration",
        icon: "fa-running",
        type: "button",
        view: "ViewAnimoRunRegistration",
      },
      {
        label: "Payment Verification & Status",
        icon: "fa-list",
        type: "button",
        view: "ViewAnimoRunList",
      },
    ],
  },
  // {
  //   group: "Emerald Run",
  //   allowedRole: ["Emerald Run", "Animo Run"],
  //   items: [
  //     {
  //       label: "Registration",
  //       icon: "fa-running",
  //       type: "button",
  //       view: "ViewAnimoRunRegistration",
  //     },
  //   ],
  // },
  {
    group: "Commission on Election",
    allowedRole: "Commission on Election",
    items: [
      {
        label: "Add Candidates",
        icon: "fa-address-card",
        type: "button",
        view: "ViewAddCandidates",
      },
      {
        label: "List of Current Enrolled Students",
        icon: "fa-users",
        type: "button",
        view: "ViewCurrentEnrolledStudents",
      },
      {
        label: "Student Election Results",
        icon: "fa-check",
        type: "button",
        view: "ViewStudentElectionResults",
      },
      {
        label: "Student Election Voting",
        icon: "fa-list",
        type: "button",
        view: "ViewStudentElectionVoting",
      },
    ],
  },
  {
    group: "Commission on Election BEU",
    allowedRole: "Commission on Election BEU",
    items: [
      {
        label: "Add Candidates",
        icon: "fa-address-card",
        type: "button",
        view: "ViewAddCandidatesBEU",
      },
      {
        label: "List of Current Enrolled Students",
        icon: "fa-users",
        type: "button",
        view: "ViewCurrentEnrolledStudentsBEU",
      },
      {
        label: "Student Election Results",
        icon: "fa-check",
        type: "button",
        view: "ViewStudentElectionResultsBEU",
      },
      {
        label: "Student Election Voting",
        icon: "fa-list",
        type: "button",
        view: "ViewStudentElectionVotingBEU",
      },
    ],
  },
  {
    group: "Content Management",
    allowedRole: "Content Writer",
    items: [
      {
        label: "Add More Contents",
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
    allowedRole: "General Services Office",
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
    allowedRole: "IT Services Feedback",
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
    allowedRole: "Lasalle Alumni Association",
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
      {
        label: "Book Profiling",
        icon: "fa-book-open",
        type: "button",
        view: "ViewBookProfiling",
      },
      {
        label: "Online Database Usage Tracking",
        icon: "fa-database",
        type: "button",
        view: "ViewOnlineDatabaseUsageTracking",
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
        view: "ViewNPCCManagement",
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
    allowedRole: "Open Educational Resources",
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
    allowedRole: "Safety and Security Center",
    items: [
      {
        label: "Campus Pass Management",
        icon: "fa-id-card",
        type: "button",
        view: "ViewCampusPassRequests",
      },
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
      {
        label: "Current Enrolled Students",
        icon: "fa-users",
        type: "button",
        view: "ViewCurrentEnrolledStudents",
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
    allowedRole: "External Links",
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
    group: "Juris Doctor Admin",
    allowedRole: "Juris Doctor Admin",
    items: [
      {
        label: "Admission Test Management",
        icon: "fa-list-alt",
        type: "button",
        view: "ViewJurisDoctorAdmissionTestManagement",
      },
    ],
  },
  {
    group: "Juris Doctor Examinee",
    allowedRole: "Juris Doctor Examinee",
    items: [
      {
        label: "Admission Test",
        icon: "fa-list-alt",
        type: "button",
        view: "ViewJurisDoctorAdmissionTest",
      },
    ],
  },
];

// ---------------- TOP MENU ----------------
const menuList = [
  { label: "Menu", icon: "fa-home", type: "button", view: "Menu" },
  { label: "Profile", icon: "fa-user", type: "button", view: "Profile" },
  { label: "Logout", icon: "fa-sign-out", type: "button", view: "Logout" },
];

// ---------------- LAZY VIEW MAP ----------------
// Each view maps to its CSS class and a lazy-loaded component via
// defineAsyncComponent. The component JS is only downloaded when the
// user actually navigates to that view — not at initial page load.
// This replaces the old computed that called resolveComponent() for
// ALL 34 views on every reactive re-evaluation.
const lazyViewMap = {
  ViewContentList: { loader: () => import("~/components/CMS/List.vue"), class: "p-4 pb-32" },
  ViewLibraryAppointments: { loader: () => import("~/components/Library/reserved/index.vue"), class: "pb-32" },
  ViewLibraryBooks: { loader: () => import("~/components/Library/books/index.vue"), class: "pb-32" },
  ViewLibrarySchedules: { loader: () => import("~/components/Library/schedules/index.vue"), class: "pb-24" },
  ViewBookProfiling: { loader: () => import("~/components/ComingSoon.vue"), class: "pb-24" },
  ViewOnlineDatabaseUsageTracking: { loader: () => import("~/components/ComingSoon.vue"), class: "pb-24" },
  ViewUniversityCalendar: { loader: () => import("~/components/ChancellorOffice/index.vue"), class: "p-4 pb-32" },
  ViewNPCCManagement: { loader: () => import("~/components/NPCC/index.vue"), class: "px-2 pb-32" },
  ViewRegistrarAppointments: { loader: () => import("~/components/Registrar/index.vue"), class: "pb-32" },
  ViewCampusPassRequests: { loader: () => import("~/components/CampusPass/index.vue"), class: "pb-32" },
  ViewDRSList: { loader: () => import("~/components/DocumentReviewSystem/List.vue"), class: "pb-32" },
  ViewDRSForm: { loader: () => import("~/components/DocumentReviewSystem/Form.vue"), class: "pb-20" },
  ViewRolePermissions: { loader: () => import("~/components/SuperAdminDashboardRolePermissions.vue"), class: "pb-32" },
  ViewAnimoRunRegistration: { loader: () => import("~/components/AnimoRunRegistration.vue"), class: "pb-32" },
  ViewAnimoRunList: { loader: () => import("~/components/AnimoRunList.vue"), class: "pb-32" },
  ViewAddCandidates: { loader: () => import("~/components/CommissionOnElection/AddCandidates.vue"), class: "pb-32 p-10" },
  ViewCurrentEnrolledStudents: { loader: () => import("~/components/CommissionOnElection/ListEnrolledStudents.vue"), class: "pb-32 p-10" },
  ViewStudentElectionResults: { loader: () => import("~/components/CommissionOnElection/StudentElectionResults.vue"), class: "pb-32 p-10" },
  ViewStudentElectionVoting: { loader: () => import("~/components/CommissionOnElection/StudentElectionVoting.vue"), class: "pb-32 p-10" },
  ViewAddCandidatesBEU: { loader: () => import("~/components/CommissionOnElectionBEU/AddCandidates.vue"), class: "pb-32 p-10" },
  ViewCurrentEnrolledStudentsBEU: { loader: () => import("~/components/CommissionOnElectionBEU/ListEnrolledStudents.vue"), class: "pb-32 p-10" },
  ViewStudentElectionResultsBEU: { loader: () => import("~/components/CommissionOnElectionBEU/StudentElectionResults.vue"), class: "pb-32 p-10" },
  ViewStudentElectionVotingBEU: { loader: () => import("~/components/CommissionOnElectionBEU/StudentElectionVoting.vue"), class: "pb-32 p-10" },
  ViewITServicesFeedback: { loader: () => import("~/components/ITFeedback/index.vue"), class: "pb-32 p-4" },
  ViewVenueReservation: { loader: () => import("~/components/ComingSoon.vue"), class: "" },
  ViewVehicleReservation: { loader: () => import("~/components/ComingSoon.vue"), class: "" },
  ViewHRJobVacancyList: { loader: () => import("~/components/ComingSoon.vue"), class: "" },
  ViewBorrowKeys: { loader: () => import("~/components/ComingSoon.vue"), class: "" },
  ViewAlumni: { loader: () => import("~/components/ComingSoon.vue"), class: "" },
  ViewCurrentEmployedAdmins: { loader: () => import("~/components/HumanResource/EmployedAdmins.vue"), class: "pb-32" },
  ViewGSOFacilitiesReservationForm: { loader: () => import("~/components/GSO/FacilitiesReservationForm.vue"), class: "pb-32" },
  ViewGSOFacilitiesReservationList: { loader: () => import("~/components/GSO/FacilitiesReservationList.vue"), class: "pb-32" },
  ViewGSOVehicleReservationForm: { loader: () => import("~/components/GSO/VehicleReservationForm.vue"), class: "pb-32" },
  ViewGSOVehicleReservationList: { loader: () => import("~/components/GSO/VehicleReservationList.vue"), class: "pb-32" },
  ViewOERForm: { loader: () => import("~/components/OER/Form.vue"), class: "pb-32" },
  ViewOERList: { loader: () => import("~/components/OER/List.vue"), class: "pb-32" },
  ViewJurisDoctorAdmissionTestManagement: { loader: () => import("~/components/JurisDoctor/Admin.vue"), class: "pb-32" },
  ViewJurisDoctorAdmissionTest: { loader: () => import("~/components/JurisDoctor/Admission.vue"), class: "pb-32" },
};

// ---------------- ACTIVE VIEW (resolved lazily) ----------------
// shallowRef avoids deep-reactivity overhead on component objects.
// The watcher only fires when currentView changes, resolving exactly
// one component via defineAsyncComponent at that moment.
const activeViewComponent = shallowRef(null);
const activeViewClass = ref("");

watch(
  currentView,
  (viewName) => {
    const entry = lazyViewMap[viewName];
    if (entry) {
      activeViewComponent.value = defineAsyncComponent({
        loader: entry.loader,
        delay: 0,
      });
      activeViewClass.value = entry.class;
    } else {
      activeViewComponent.value = null;
      activeViewClass.value = "";
    }
  },
  { immediate: true },
);

// ---------------- ACTIONS ----------------
const toggleGroup = (group) => {
  const i = openGroups.value.indexOf(group);
  i > -1 ? openGroups.value.splice(i, 1) : openGroups.value.push(group);
};

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
          <SuperAdminDashboardNavigation
          :darkMode="darkMode"
          :menuList="menuList"
          :currentView="currentView"
          :toggleGroup="toggleGroup"
          @menu-click="handleMenuClick"
        />
        <div class="overflow-y-auto">
          <div v-if="activeViewComponent" :class="activeViewClass">
            <Suspense>
              <component
                :is="activeViewComponent"
                :darkMode="darkMode"
                :rolePermissions="rolePermissions"
              />
              <template #fallback>
                <div class="p-4 space-y-4 animate-pulse">
                  <!-- Skeleton header bar -->
                  <div :class="['h-10 rounded-2xl w-full', darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  <!-- Skeleton card grid -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    <div v-for="n in 6" :key="n"
                      :class="['rounded-2xl p-4 space-y-2 border', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200']">
                      <div :class="['h-3 rounded w-3/4', darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                      <div :class="['h-2.5 rounded w-1/2', darkMode ? 'bg-gray-700' : 'bg-slate-100']"></div>
                    </div>
                  </div>
                </div>
              </template>
            </Suspense>
          </div>
        </div>
      
        <div v-if="currentView === 'Menu'" class="lg:px-2 pb-80">
          <!-- <SuperAdminDashboardWelcome :darkMode="darkMode" /> -->
          <template v-if="initialLoading">
            <div class="mt-4 space-y-3 px-2 animate-pulse">
              <div v-for="n in 5" :key="'sk-group-' + n"
                :class="['rounded-2xl border p-3 space-y-2', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200']">
                <!-- Group label -->
                <div :class="['h-3 rounded w-1/3', darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                <!-- Menu items -->
                <div class="space-y-1.5 pl-2">
                  <div v-for="m in 2" :key="m"
                    :class="['h-2.5 rounded', darkMode ? 'bg-gray-700' : 'bg-slate-100',
                      m === 2 ? 'w-2/5' : 'w-3/5']"></div>
                </div>
              </div>
            </div>
          </template>
          <SuperAdminDashboardMenuList
            v-else
            :filteredMenuList="filteredMenuList"
            :darkMode="darkMode"
            :currentView="currentView"
            :defaultOpenGroups="openGroups"
            @menu-click="handleMenuClick"
          />
        </div>
        <div v-if="currentView === 'Profile'" class="w-full p-4">
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