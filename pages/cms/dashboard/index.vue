<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

/* ---- AUTH GUARD ---- */
onMounted(() => {
  if (!userStore.isLoggedIn) {
    router.replace("/cms/login");
  }
});

/* ---- STATE ---- */
const isUserAuthenticated = computed(() => userStore.isLoggedIn);

definePageMeta({
  middleware: "cms-auth",
});

// ---------------- STATE ----------------
const router = useRouter();
const userStore = useUserStore();

const toggleSideBarMenu = ref(false);
const currentView = ref("profile");

const openGroups = ref([
  "Content Management",
  "Human Resource",
  "Library Management",
  "Office of The Chancellor",
  "NPCC IT Services",
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

const handleContentSubmitted = () => {
  currentView.value = "list";
};

const profileImageUrl =
  "https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/LSU%20Seal.PNG";

// ---------------- ROLES ----------------
const superAdminEmails = [
  "jorenleeluna24@gmail.com",
  "michaeljohn.puertogalera@lsu.edu.ph",
  "jason.yap@lsu.edu.ph",
];

const npccMenuEmails = [
  "michaeljohn.puertogalera@lsu.edu.ph",
  "jorenlee.luna@lsu.edu.ph",
  "jason.yap@lsu.edu.ph",
  "johny14_gonzaga@lsu.edu.ph",
  "rommel.rosal@lsu.edu.ph",
  "denzelroy.suarez@lsu.edu.ph",
  "giovanni.morales@lsu.edu.ph",
];

const ochAdminEmails = ["och@lsu.edu.ph"];

const contentWritersEmails = [
  "monaliza.mugot@lsu.edu.ph",
  "jackjun.caupayan@lsu.edu.ph",
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
  "joed.layna@lsu.edu.ph",
  "jumelah.padilla@lsu.edu.ph",
  "carmela.buenbrazo2@lsu.edu.ph",
  "macristina.llauder@lsu.edu.ph",
  "markjohn.dalagan@lsu.edu.ph",
  "menchie.grana@lsu.edu.ph",
  "meredith.embuscado@lsu.edu.ph",
  "naiza.amba@lsu.edu.ph",
  "roselyn.tuastomban@lsu.edu.ph",
  "tednudgent.tacan@lsu.edu.ph",
  "xie.medrano@lsu.edu.ph",
  "jenny.licanda@lsu.edu.ph",
  "edm@lsu.edu.ph",
  "israelgallogo@lsu.edu.ph",
];
const hrMenuEmails = ["hr@lsu.edu.ph", "npc@lsu.edu.ph"];
const libraryMenuEmails = [
  "monaliza.mugot@lsu.edu.ph",
  "marilyn.bejec@lsu.edu.ph",
  "applejane.ebarle@lsu.edu.ph",
  "janekaren.gudmalin@lsu.edu.ph",
  "macy.beniola@lsu.edu.ph",
  "lynn.lumacad@lsu.edu.ph",
  "zosette.salas@lsu.edu.ph",
];

const rolesByEmail = {
  superAdmin: superAdminEmails,
  hr: hrMenuEmails,
  library: libraryMenuEmails,
  contentWriter: contentWritersEmails,
  och: ochAdminEmails,
  npcc: npccMenuEmails,
};

// ---------------- DETERMINE ROLE ----------------
const userRole = computed(() => {
  const email = userStore.user?.email;
  if (!email) return null;
  if (rolesByEmail.superAdmin.includes(email)) return "superAdmin";
  if (rolesByEmail.hr.includes(email)) return "hr";
  if (rolesByEmail.library.includes(email)) return "library";
  if (rolesByEmail.contentWriter.includes(email)) return "contentWriter";
  if (rolesByEmail.och.includes(email)) return "och";
  if (rolesByEmail.npcc.includes(email)) return "npcc";
  return null;
});

// ---------------- WATCH EMAIL ----------------
watch(
  () => userStore.user?.email,
  (newEmail) => {
    if (!newEmail || !userRole.value) {
      isUserAuthenticated.value = false;
      logOut();
    } else {
      isUserAuthenticated.value = true;
    }
  },
  { immediate: true },
);

// ---------------- MENU ----------------
const subMenuList = [

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
    group: "Human Resource",
    allowedEmails: hrMenuEmails,
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
    group: "Office of The Chancellor",
    allowedEmails: ochAdminEmails,
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
    group: "External Links",
    items: [
      { label: "LSU Home Page", icon: "fa-globe", type: "link", to: "/" },
    ],
  },
];


const menuList = [
  {
    label: "Dashboard",
    icon: "fa-home",
    type: "button",
    view: "Dashboard",
  },
  { label: "Profile", icon: "fa-user", type: "button", view: "profile" },
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

const navigateTo = (url) => router.push(url);
</script>

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

<template>
  <div class="h-screen flex flex-col">
    <!-- AUTHENTICATED VIEW -->
    <div v-if="isUserAuthenticated">
      <!-- MAIN CONTENT -->
      <div class="w-full flex flex-col mb-32">
        <!-- HEADER -->
        <div class="bg-green-900 w-full z-50">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div class="w-auto flex items-center lg:px-1.5">
              <!-- PROFILE IMAGE -->
              <div class="w-fit mx-auto">
                <img :src="profileImageUrl" class="w-10 mx-auto" />
              </div>
              <p
                class="text-white whitespace-nowrap lg:ml-5 ml-3 font-bold uppercase lg:text-sm text-xs"
              >
                LSU Central
              </p>
            </div>
            <button
              @click="logOut"
              class="flex items-center hover:font-bold pt-1"
            >
              <i class="fa fa-sign-out text-white text-xl"></i>
              <p class="text-xs text-white p-1.5 lg:flex hidden">Log Out</p>
            </button>
          </div>
        </div>

        <!-- CONTENT AREA -->
        <div class="overflow-y-auto">
          <div class="w-full p-4" v-if="currentView === 'profile'">
            <SuperAdminDashboardWelcome />
          </div>

          <div class="p-4" v-if="currentView === 'Dashboard'">
            <div class="grid grid-cols-1 lg:grid-cols-6 gap-4">
              <!-- MENU CARDS -->
              <div
                v-for="menu in filteredMenuList"
                :key="menu.label || menu.group"
                class="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <!-- GROUP CARD -->
                <template v-if="menu.group">
                  <button
                    class="w-full flex flex-col items-center justify-center p-4 text-center text-sm font-semibold text-gray-700 hover:text-green-700 transition-colors"
                    @click="toggleGroup(menu.group)"
                  >
                    <div
                      class="w-12 h-12 flex items-center justify-center rounded-full bg-green-50 group-hover:bg-green-100 transition-colors mb-2"
                    >
                      <i class="fa fa-folder-open text-lg text-green-600"></i>
                    </div>
                    <span class="text-xs truncate">{{ menu.group }}</span>
                    <i
                      class="fa fa-chevron-down mt-1 text-xs transition-transform duration-300"
                      :class="{ 'rotate-180': openGroups.includes(menu.group) }"
                    ></i>
                  </button>

                  <transition name="slide-fade">
                    <ul
                      v-if="openGroups.includes(menu.group)"
                      class="mt-2 space-y-1 px-4 pb-3"
                    >
                      <li
                        v-for="item in menu.items"
                        :key="item.label"
                        class="flex items-center gap-2 px-2 py-1 rounded hover:bg-green-50 text-gray-700 text-sm transition-colors"
                        :class="
                          currentView === item.view
                            ? 'bg-green-100 text-green-700 font-semibold'
                            : ''
                        "
                        @click="
                          item.type === 'button'
                            ? (currentView = item.view)
                            : navigateTo(item.to)
                        "
                      >
                        <i :class="['fa', item.icon, 'text-sm']"></i>
                        <span class="truncate">{{ item.label }}</span>
                      </li>
                    </ul>
                  </transition>
                </template>

                <!-- STANDALONE BUTTON CARD -->
                <template v-else>
                  <div
                    class="flex flex-col items-center justify-center p-4 text-center text-sm font-semibold text-gray-700 hover:text-green-700 transition-colors"
                    @click="
                      menu.type === 'button'
                        ? (currentView = menu.view)
                        : navigateTo(menu.to)
                    "
                  >
                    <div
                      class="w-12 h-12 flex items-center justify-center rounded-full bg-green-50 group-hover:bg-green-100 transition-colors mb-2"
                    >
                      <i
                        :class="['fa', menu.icon, 'text-lg text-green-600']"
                      ></i>
                    </div>
                    <span class="truncate">{{ menu.label }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <div class="p-4" v-else-if="currentView === 'form'">
            <SuperAdminDashboardCmsForm
              @contentSubmitted="handleContentSubmitted"
            />
          </div>
          <div class="p-4" v-else-if="currentView === 'list'">
            <SuperAdminDashboardCmsList />
          </div>
          <div class="p-4" v-else-if="currentView === 'appointments'">
            <SuperAdminDashboardServicesLibraryReserved />
          </div>
          <div class="p-4" v-else-if="currentView === 'books'">
            <SuperAdminDashboardServicesLibraryBooks />
          </div>
          <div class="p-4" v-else-if="currentView === 'schedules'">
            <SuperAdminDashboardServicesLibrarySchedules />
          </div>
          <div class="p-4" v-else-if="currentView === 'hr-job-vacancy-list'">
            <SuperAdminDashboardServicesHr />
          </div>
          <div class="p-4" v-else-if="currentView === 'hr-raffle'">
            <SuperAdminDashboardServicesHrRaffle />
          </div>
          <div class="p-4" v-else-if="currentView === 'university-calendar'">
            <SuperAdminDashboardChancellorOffice />
          </div>
          <div class="p-4" v-else-if="currentView === 'npcc'">
            <SuperAdminDashboardServicesIt />
          </div>
        </div>

        <div>
          <!-- BOTTOM NAV -->
          <nav
            class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg rounded-t-2xl"
          >
            <div class="flex justify-evenly items-center p-1">
              <!-- HOME -->

              <div class="flex justify-center">
                <!-- Display only the first menu item as a card/button -->
                <div
                  v-if="menuList[0]"
                  class="bg-white hover:shadow-lg px-3 rounded-lg transition-shadow"
                >
                  <button
                    @click="
                      menuList[0].type === 'button'
                        ? (currentView = menuList[0].view)
                        : navigateTo(menuList[0].to)
                    "
                    class="flex flex-col items-center text-xs p-1"
                    :class="
                      currentView === menuList[0].view
                        ? 'text-green-900'
                        : 'text-gray-400'
                    "
                  >
                    <div
                      class="w-10 h-10 flex items-center justify-center rounded-xl"
                      :class="
                        currentView === menuList[0].view ? 'bg-green-100' : ''
                      "
                    >
                      <i :class="['fa', menuList[0].icon, 'text-lg']"></i>
                    </div>
                    <span>{{ menuList[0].label }}</span>
                  </button>
                </div>
              </div>

              <!-- RESEARCH -->
              <button
                @click="active = 'Research'"
                class="flex flex-col items-center text-xs"
                :class="
                  active === 'Research' ? 'text-green-900' : 'text-gray-400'
                "
              >
                <div
                  class="w-10 h-10 flex items-center justify-center rounded-xl"
                  :class="active === 'Research' ? 'bg-green-100' : ''"
                >
                  <i class="fa fa-search text-lg"></i>
                </div>
                Search
              </button>

              <div class="flex justify-center">
                <!-- Display only the first menu item as a card/button -->
                <div
                  v-if="menuList[1]"
                  class="bg-white hover:shadow-lg px-3 rounded-lg transition-shadow"
                >
                  <button
                    @click="
                      menuList[0].type === 'button'
                        ? (currentView = menuList[1].view)
                        : navigateTo(menuList[1].to)
                    "
                    class="flex flex-col items-center text-xs p-1"
                    :class="
                      currentView === menuList[0].view
                        ? 'text-green-900'
                        : 'text-green-800'
                    "
                  >
                    <div
                      class="w-10 h-10 flex items-center justify-center rounded-xl"
                      :class="
                        currentView === menuList[1].view ? 'bg-green-100' : ''
                      "
                    >
                      <i :class="['fa', menuList[1].icon, 'text-lg']"></i>
                    </div>
                    <span>{{ menuList[1].label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- <div
            class="flex items-center text-white bg-green-900 lg:py-[16px] py-[8px]"
          >
            <div class="flex items-center w-full px-2">
              <i class="fa fa-user mx-2" aria-hidden="true"></i>
              <h1 class="text-sm">{{ userStore.user.email }}</h1>
            </div>
           
          </div> -->

            <DashboardFooter />
          </nav>
        </div>
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
