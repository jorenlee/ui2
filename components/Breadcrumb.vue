<template>
  <div class="lg:pt-20 pt-14">
    <div class="relative">
      <div class="shadow-lg text-green-700">
        <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
          <!-- Breadcrumb Navigation -->
          <div
            class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
          >
            <div>
              <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
            </div>
            <div v-for="(item, index) in breadcrumbItems" :key="index">
              <i class="fas fa-caret-right"></i>
              <a
                :href="item.url"
                class="mx-2 hover:underline lg:h-10"
                :class="{ 'font-semibold': index === breadcrumbItems.length - 1 }"
              >
                {{ item.label }}
              </a>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            v-if="actionButtons && actionButtons.length > 0"
            class="flex hover:text-green-800 text-white bg-white h-full"
          >
            <div
              v-for="(button, index) in actionButtons"
              :key="index"
              class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
              :class="{ 'border-r': index < actionButtons.length - 1 }"
            >
              <a :href="button.url" class="flex items-center w-fit mx-auto">
                <i :class="button.icon" aria-hidden="true"></i>
                <span class="ml-3 whitespace-nowrap">{{ button.label }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  // Array of breadcrumb items
  // Example: [{ label: 'Document Review Sheet', url: '/drs' }]
  breadcrumbItems: {
    type: Array,
    required: true,
    default: () => [],
  },

  // Array of action buttons (optional)
  // Example: [{ label: 'Demo Guide', url: '/drs/guide', icon: 'fa fa-video-camera' }]
  actionButtons: {
    type: Array,
    required: false,
    default: () => [],
  },
});
</script>
