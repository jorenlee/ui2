<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// ================= CLOCK =================
const currentTime = ref("");
const currentDate = ref("");
let clockInterval = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  currentDate.value = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);

  // ================= WEATHER WIDGET LOADER =================
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src =
    "https://www.weatherapi.com/weather/widget.ashx?loc=1856398&wid=2&tu=1&div=weatherapi-weather-widget-4";
  script.async = true;
  document.body.appendChild(script);
});

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval);
});

// ================= USER NAME + INITIALS =================
const userEmail = computed(() => userStore.user?.email || "User");
const userInitials = computed(() => {
  const parts = userEmail.value.split("@")[0].split(".");
  return (
    (parts[0]?.charAt(0) || "U") + (parts[1]?.charAt(0) || "S")
  ).toUpperCase();
});

const currentHour = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
});

// ================= DASHBOARD STATS =================
const stats = [
  { label: "Total Content", value: "0", icon: "fa-file-text", color: "bg-blue-500" },
  { label: "Appointments", value: "0", icon: "fa-calendar-check", color: "bg-green-500" },
  { label: "Available Books", value: "0", icon: "fa-book", color: "bg-purple-500" },
  { label: "Scheduled Events", value: "0", icon: "fa-clock", color: "bg-orange-500" },
];

// ================= QUICK ACTIONS =================
const quickActions = [
  { label: "Create Content", icon: "fa-plus-circle", view: "form", color: "text-blue-600" },
  { label: "View Contents", icon: "fa-list", view: "list", color: "text-green-600" },
  { label: "Appointments", icon: "fa-calendar", view: "appointments", color: "text-purple-600" },
  { label: "Available Books", icon: "fa-book", view: "books", color: "text-orange-600" },
];

// ================= RECENT ACTIVITIES =================
const recentActivities = [
  { action: "Content Created", description: "New article published", time: "2 hours ago", icon: "fa-check-circle", color: "text-green-500" },
  { action: "Appointment Scheduled", description: "Library appointment booked", time: "4 hours ago", icon: "fa-calendar", color: "text-blue-500" },
  { action: "Book Added", description: "New book available", time: "1 day ago", icon: "fa-book", color: "text-purple-500" },
];


useHead({
  script: [
    {
      src: "https://app3.weatherwidget.org/js/?id=ww_25924b6c5e46a",
      async: true
    }
  ]
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="p-3 lg:p-8">

      <!-- ================= WELCOME HEADER ================= -->
      <div class="bg-gradient-to-r from-green-600 to-green-800 rounded-lg shadow-lg p-8 text-white mb-8">
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">





          <!-- GREETING -->
          <div class="w-fit mx-auto">
            <h1 class="text-4xl font-bold mb-2 white">{{ currentHour }}! 👋</h1>
            <p class="text-green-100 text-lg whitespace-nowrap">
              Welcome back,
              <span class="font-semibold">{{ userEmail.split("@")[0] }}</span>
            </p>
            <p class="text-green-100 text-sm mt-1">
              {{ currentDate }}
            </p>
          </div>





                          <!-- WEATHER WIDGET (NUXT COMPATIBLE) -->
          <div class="w-full">
            <div id="weatherapi-weather-widget-4"></div>
            <noscript>
              <a href="https://www.weatherapi.com/weather/q/ozamiz-1856398" alt="Hour by hour Ozamiz weather">
                10 day hour by hour Ozamiz weather
              </a>
            </noscript>
          </div>



          <!-- CLOCK CARD -->
          <div class="w-fit flex">
            <div class="bg-white bg-opacity-20 backdrop-blur rounded-lg p-6 border border-white border-opacity-20 whitespace-nowrap">
              <div class="flex flex-col items-center justify-center gap-3">
                <i class="fa fa-clock text-xl text-white"></i>
                <div class="text-center">
                  <p class="text-green-100 text-xs font-medium uppercase tracking-wide mb-1">
                    Current Time
                  </p>
                  <p class="text-white text-3xl font-bold font-mono leading-none">
                    {{ currentTime }}
                  </p>
                </div>
              </div>


              <div class="flex mx-auto w-fit mt-3">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span class="text-4xl font-bold text-green-600">{{ userInitials }}</span>
            </div>
          </div>
            </div>

            
          
          </div>

          <!-- USER AVATAR -->
          
        </div>
      </div>




      <!-- ================= HIDDEN DASHBOARD CONTENT ================= -->
      <div class="hidden">

        <!-- STATS -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-gray-600 font-semibold">{{ stat.label }}</h3>
              <div :class="[stat.color, 'rounded-lg p-3 text-white']">
                <i :class="['fa', stat.icon]"></i>
              </div>
            </div>
            <p class="text-3xl font-bold text-gray-900">{{ stat.value }}</p>
            <p class="text-sm text-gray-500 mt-2">Last 30 days</p>
          </div>
        </div>

        <!-- QUICK ACTIONS -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              v-for="action in quickActions"
              :key="action.label"
              class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all text-left border-l-4 border-transparent hover:border-green-600"
            >
              <div class="flex items-center gap-4">
                <i :class="['fa text-3xl', action.icon, action.color]"></i>
                <div>
                  <p class="font-semibold text-gray-800">{{ action.label }}</p>
                  <p class="text-xs text-gray-500">Click to access</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- RECENT ACTIVITIES -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                v-for="(activity, index) in recentActivities"
                :key="index"
                class="border-b last:border-b-0 p-6 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 pt-1">
                    <i :class="['fa text-xl', activity.icon, activity.color]"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{{ activity.action }}</h3>
                    <p class="text-sm text-gray-600">{{ activity.description }}</p>
                  </div>
                  <div class="text-xs text-gray-500 whitespace-nowrap">
                    {{ activity.time }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- SYSTEM STATUS -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold text-gray-800 mb-4">System Status</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">API Status</span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <i class="fa fa-circle text-xs mr-2"></i>
                  Online
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Database</span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <i class="fa fa-circle text-xs mr-2"></i>
                  Connected
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Storage</span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <i class="fa fa-circle text-xs mr-2"></i>
                  Available
                </span>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t">
              <p class="text-xs text-gray-500 mb-2">Last Updated</p>
              <p class="text-sm font-semibold text-gray-700">
                {{ currentTime }}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>

  .scheme_42 .weatherapi-weather-cover {
    background-color: transparent !important;
  }

  .weatherapi-weather-more-weather-link {
    display: none !important;
  }

  .weatherapi-weather-more-weather-link a {
    display: none !important;
  }
</style>
