<template>
  <div class="mb-6">
    <div
      class="rounded-3xl shadow-lg p-6"
      :class="[
        darkMode
          ? 'bg-gray-800 border border-gray-700'
          : 'bg-white border border-gray-100',
      ]"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center"
          :class="[
            darkMode
              ? 'bg-green-900/30 text-green-400'
              : 'bg-green-100 text-green-600',
          ]"
        >
          <i class="fa fa-folder text-2xl"></i>
        </div>
        <div>
          <h2
            class="text-xl font-bold"
            :class="darkMode ? 'text-gray-100' : 'text-gray-900'"
          >
            External Links
          </h2>
          <p
            class="text-sm"
            :class="darkMode ? 'text-gray-400' : 'text-gray-600'"
          >
            Quick access to external resources
          </p>
        </div>
      </div>

      <!-- Links Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- LSU Home Page -->
        <a
          href="/"
          target="_blank"
          class="group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:scale-105"
          :class="[
            darkMode
              ? 'bg-gray-700 hover:bg-green-900/30 border border-gray-600 hover:border-green-500'
              : 'bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300',
          ]"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
            :class="[
              darkMode
                ? 'bg-gray-600 group-hover:bg-green-600 text-gray-300 group-hover:text-white'
                : 'bg-white group-hover:bg-green-600 text-gray-600 group-hover:text-white',
            ]"
          >
            <i class="fa fa-globe text-xl"></i>
          </div>
          <div class="flex-1">
            <h3
              class="font-semibold text-sm mb-1"
              :class="[
                darkMode
                  ? 'text-gray-200 group-hover:text-green-400'
                  : 'text-gray-900 group-hover:text-green-700',
              ]"
            >
              LSU Home Page
            </h3>
            <p
              class="text-xs"
              :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
            >
              Visit main website
            </p>
          </div>
          <i
            class="fa fa-external-link-alt text-xs transition-all"
            :class="[
              darkMode
                ? 'text-gray-500 group-hover:text-green-400'
                : 'text-gray-400 group-hover:text-green-600',
            ]"
          ></i>
        </a>
      </div>
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
</script>

