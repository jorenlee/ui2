<template>
  <div>
    <!-- DARK MODE TOGGLE - Fixed Position -->
    <div class="fixed lg:bottom-3 bottom-52 lg:left-4 lg:right-auto right-2 z-[60]">
      <button
        @click="toggleDarkMode"
        class="group relative flex items-center gap-3 lg:px-5 px-3 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
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
        <div class="lg:flex hidden flex-col items-start">
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
  </div>
</template>

<script setup>
const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-dark-mode"]);

const toggleDarkMode = () => {
  emit("toggle-dark-mode");
};
</script>
