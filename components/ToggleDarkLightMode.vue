<template>
  <div class="flex items-center gap-2">
    <!-- Moon Icon -->
    <i class="fa fa-moon text-gray-600 dark:text-gray-300"></i>

    <!-- Switch -->
    <label class="switch">
      <input type="checkbox" v-model="darkMode" @change="toggleDarkMode" />
      <span class="slider round"></span>
    </label>

    <!-- Sun Icon -->
    <i class="fa fa-sun text-yellow-500"></i>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const darkMode = ref(false);

onMounted(() => {
  const storedTheme = localStorage.getItem("theme");

  if (storedTheme === "dark") {
    darkMode.value = true;
    document.documentElement.classList.add("dark");
  } else {
    darkMode.value = false;
    document.documentElement.classList.remove("dark");
  }
});

const toggleDarkMode = () => {
  if (darkMode.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};
</script>

<style scoped>
/* Switch Styling */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  transition: 0.4s;
  border-radius: 999px;
}

.slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(22px);
}
</style>
