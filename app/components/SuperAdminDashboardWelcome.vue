<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  darkMode: Boolean,
});

/* ================= AUTH ================= */
const { user, init } = useAuth();

onMounted(() => {
  init();
});

/* ================= CLOCK ================= */
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
});

onBeforeUnmount(() => {
  if (clockInterval) clearInterval(clockInterval);
});

/* ================= USER DATA ================= */
const userEmail = computed(() => user.value?.email || "user@email.com");
const userName = computed(() => user.value?.name || userEmail.value);
const userPicture = computed(() => user.value?.image);

/* ================= INITIALS ================= */
const userInitials = computed(() => {
  if (!user.value?.name) return "?";
  return user.value.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

/* ================= PROFILE IMAGE ================= */
const userProfileImage = computed(() => {
  if (userPicture.value) return userPicture.value;

  const email = userEmail.value.toLowerCase().trim();

  // Try Google avatar via unavatar
  if (email.includes("@gmail.com") || email.includes("@lsu.edu.ph")) {
    return `https://unavatar.io/${email}`;
  }

  // Fallback avatar
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    userInitials.value,
  )}&background=10b981&color=fff&size=128&bold=true`;
});

/* ================= GREETING ================= */
const currentHour = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
});
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="relative overflow-hidden shadow-2xl px-5 py-3" :class="[
      darkMode ? 'bg-green-950 text-white' : 'bg-green-900 text-white',
    ]">
      <div class="relative z-10 lg:flex items-center gap-x-8">
        <div class="w-full gap-4">
            <h1 class="text-xl lg:text-2xl font-bold">
              {{ currentHour }}!
            </h1>
            <p class="text-white/90 text-xs lg:text-base">
              Welcome back to your dashboard
            </p>
        </div>
        <!-- CLOCK -->
        <div class="w-auto lg:block hidden">
          <div class="flex items-center gap-2 text-white/80 w-fit lg:mx-auto">
            <i class="fa fa-calendar text-sm"></i>
            <span class="text-xs lg:text-sm whitespace-nowrap">{{ currentDate }}</span>
          </div>
          <div class="text-xs lg:text-xl font-bold font-mono whitespace-nowrap">
            <i class="fa fa-clock text-sm"></i>  {{ currentTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>