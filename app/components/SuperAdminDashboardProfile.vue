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
  <div class="mb-6">
    <!-- HEADER -->
    <div class="relative overflow-hidden lg:py-3 lg:px-10 px-4 py-2 mb-4" :class="[
      darkMode ? 'bg-green-950 text-white' : 'bg-green-600 text-white',
    ]">
      <div class="relative z-10 lg:flex items-center justify-between gap-8">
        
        <div class="w-full lg:w-3/12">
          <div class="flex items-center gap-3 text-white/90">
            <!-- Avatar -->
            <div
              class="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30">
              <span class="text-2xl lg:text-3xl font-bold">
                <img :src="userProfileImage" :alt="userInitials"
                  class="lg:w-20 lg:h-20 rounded-2xl border-white/30" /></span>
            </div>
            <div>
              <p class="font-semibold text-sm lg:text-base uppercase">
                {{ userName }}
                <!-- SUPER ADMIN -->
              </p>
              <p class="text-xs text-white/80">
                {{ userEmail }}
                <!-- lsu.edu.ph | www.lsu.edu.ph -->
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>