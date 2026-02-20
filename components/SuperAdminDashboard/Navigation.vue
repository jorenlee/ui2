<template>
    <div>
         <nav
          class="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t shadow-2xl z-40"
          :class="[
            darkMode ? 'bg-gray-800/95 text-white border-gray-700' : 'bg-white/95 text-gray-900 border-gray-200',
          ]"
        >
          <div class="flex justify-evenly items-center px-4 mx-auto">
            <button
              v-for="(menu, index) in menuList"
              :key="index"
              @click="handleMenuClick(menu)"
              class="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 relative group"
              :class="
                currentView === menu.view
                  ? darkMode ? 'text-green-400' : 'text-green-600'
                  : darkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-600 hover:text-green-600'
              "
            >
              <!-- Active Indicator -->
              <div
                v-if="currentView === menu.view"
                class="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              ></div>

              <!-- Icon Container -->
              <div
                class="relative lg:w-8 lg:h-8 w-7 h-7 flex items-center justify-center rounded-2xl transition-all duration-300"
                :class="
                  currentView === menu.view
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30 scale-110'
                    : darkMode
                      ? 'bg-gray-700 group-hover:bg-green-900/30 group-hover:scale-105'
                      : 'bg-gray-100 group-hover:bg-green-50 group-hover:scale-105'
                "
              >
                <i
                  :class="[
                    'fa',
                    menu.icon,
                    'lg:text-xl text-base transition-colors',
                    currentView === menu.view
                      ? 'text-white'
                      : darkMode
                        ? 'text-gray-300 group-hover:text-green-400'
                        : 'text-gray-600 group-hover:text-green-600',
                  ]"
                ></i>
              </div>

              <!-- Label -->
              <span
                class="text-[10px] transition-colors"
                :class="
                  currentView === menu.view
                    ? darkMode ? 'text-green-400' : 'text-green-600'
                    : darkMode ? 'text-gray-400 group-hover:text-green-400' : 'text-gray-600 group-hover:text-green-600'
                "
              >
                {{ menu.label }}
              </span>
            </button>
          </div>
          <DashboardFooter :darkMode="darkMode" />
        </nav>


    </div>
</template>

<script setup>
const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
  menuList: {
    type: Array,
    required: true,
  },
  currentView: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["menu-click"]);

const handleMenuClick = (menu) => {
  emit("menu-click", menu);
};
</script>