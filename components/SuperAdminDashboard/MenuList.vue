<template>
  <!-- Modern Grid Layout with Better Spacing -->
  <div
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6"
  >
    <div
      v-for="menu in filteredMenuList"
      :key="menu.label || menu.group"
      class=" hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
      :class="
        darkMode
          ? 'bg-gray-800 border-gray-700 hover:border-green-500'
          : 'bg-white border-gray-100'
      "
    >
      <template v-if="menu.group">
        <!-- Group Header with Gradient Background -->
        <button
          class="w-full flex font-semibold transition-all relative overflow-hidden px-3"
          :class="
            darkMode
              ? 'text-gray-200 hover:text-green-400'
              : 'text-gray-800 hover:text-green-700'
          "
          @click="toggleGroup(menu.group)"
        >
          <!-- Gradient Background on Hover -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            :class="
              darkMode
                ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30'
                : 'bg-gradient-to-br from-green-50 to-emerald-50'
            "
          ></div>

          <div class="flex items-center">
            <!-- Icon with Modern Design -->
             <!-- bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg -->
            <div
              class="relative w-10 h-10 flex items-center justify-center rounded-2xl  group-hover:scale-110 transition-transform duration-300 "
            >
              <i class="fa fa-folder-open text-xl text-green-700"></i>
            </div>

            <!-- Group Name -->
            <div class="relative text-xs truncate w-full pr-1">
              {{ menu.group }}
            </div>

            <!-- Chevron Indicator -->
            <div>
              <i
                class="relative fa fa-chevron-down text-xs transition-transform duration-300"
                :class="[
                  { 'rotate-180': openGroups.includes(menu.group) },
                  darkMode ? 'text-gray-500' : 'text-gray-400',
                ]"
              ></i>
            </div>
          </div>
        </button>

        <!-- Expandable Menu Items -->
        <transition name="slide-fade">
          <div
            v-if="openGroups.includes(menu.group)"
            class="border-t"
            :class="
              darkMode
                ? 'border-gray-700 bg-gray-900/50'
                : 'border-gray-100 bg-gray-50'
            "
          >
            <ul class="">
              <li
                v-for="item in menu.items"
                :key="item.label"
                class="flex items-center gap-3 px-3 py-1 rounded-lg text-xs transition-all cursor-pointer group/item"
                :class="[
                  currentView === item.view
                    ? 'bg-green-500 text-white shadow-md'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:shadow-sm'
                      : 'text-gray-700 hover:bg-white hover:shadow-sm',
                ]"
                @click="handleMenuClick(item)"
              >
                <div
                  class="px-2 flex items-center justify-left rounded-lg transition-colors"
                  :class="
                    currentView === item.view
                      ? 'bg-white/20'
                      : 'group-hover/item:bg-green-200'
                  "
                >
                  <i
                    :class="[
                      'fa',
                      item.icon,
                      'text-lg',
                      currentView === item.view
                        ? 'text-white'
                        : 'text-green-600',
                    ]"
                  ></i>
                </div>
                <span class="truncate font-medium">{{ item.label }}</span>
              </li>
            </ul>
          </div>
        </transition>
      </template>

      <!-- Non-Group Menu Items -->
      <template v-else>
        <div
          class="flex flex-col items-center justify-center p-6 text-center font-semibold transition-all cursor-pointer relative overflow-hidden"
          :class="
            darkMode
              ? 'text-gray-200 hover:text-green-400'
              : 'text-gray-800 hover:text-green-700'
          "
          @click="handleMenuClick(menu)"
        >
          <!-- Gradient Background on Hover -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            :class="
              darkMode
                ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30'
                : 'bg-gradient-to-br from-green-50 to-emerald-50'
            "
          ></div>

          <!-- Icon with Modern Design -->
          <div
            class="relative w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 group-hover:scale-110 transition-transform duration-300 mb-3 shadow-lg"
          >
            <i :class="['fa', menu.icon, 'text-2xl text-white']"></i>
          </div>

          <!-- Label -->
          <span class="relative text-sm font-bold truncate w-full px-2">{{
            menu.label
          }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  filteredMenuList: {
    type: Array,
    required: true,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  currentView: {
    type: String,
    default: "",
  },
  defaultOpenGroups: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["menu-click"]);

const openGroups = ref([...props.defaultOpenGroups]);

const toggleGroup = (group) => {
  const index = openGroups.value.indexOf(group);
  if (index > -1) {
    openGroups.value.splice(index, 1);
  } else {
    openGroups.value.push(group);
  }
};

const handleMenuClick = (menu) => {
  emit("menu-click", menu);
};
</script>

<style scoped></style>
