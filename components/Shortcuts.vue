<script setup>
const majorComponents = ref([
  {
    name: "Enrollment",
    link: "/enrollment",
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/btn-1-apply-now.png",
  },
  {
    name: "Scholarships",
    link: "/scholarships",
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/btn-2-apply-for-scholarships.png",
  },
  {
    name: "My.LSU",
    link: "https://my.lsu.edu.ph/index.jsp",
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/btn-4-my-lsu.png",
  },
  {
    name: "Library",
    link: "/library",
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/btn-3-programs.png",
  },
  {
    name: "Canvas",
    link: "https://lsu.instructure.com/login/canvas",
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/Logo_Canvas_Red_Horizontal.png", // desktop
    image_mobile:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/Logo_Canvas_Red_Vertical.png", // mobile
    hideLabel: true,
  },
  {
    name: "FAQs",
    link: "/faqs",
    icon: "fa fa-question-circle",
  },
]);
</script>

<template>
  <div class="font-montserrat">
    <div class="w-full lg:py-4 z-30">
      <div
        class="grid grid-cols-2 sm:grid-cols-3 bg-white rounded-2xl lg:flex lg:justify-evenly lg:items-center gap-1 sm:gap-2 lg:gap-0.5 text-center border-4 border-gray-50 shadow-xl lg:w-11/12 mx-auto"
      >
        <a
          v-for="(item, index) in majorComponents"
          :key="index"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col lg:flex-row justify-center items-center rounded-md lg:rounded-none py-3 lg:py-2.5 px-2 lg:px-3 hover:bg-gray-100 transition-all duration-200 text-center lg:w-1/5 w-full h-auto shadow-md lg:shadow-none"
        >
          <!-- IMAGE (handles Canvas special case) -->
          <div v-if="item.image">
            <!-- Mobile (Canvas vertical) -->
            <img
              v-if="item.name === 'Canvas'"
              :src="item.image_mobile"
              alt="Canvas Mobile"
              class="block lg:hidden w-16 h-auto mx-auto object-contain"
            />
            <!-- Desktop (Canvas horizontal) -->
            <img
              v-if="item.name === 'Canvas'"
              :src="item.image"
              alt="Canvas Desktop"
              class="hidden lg:block h-6 w-auto mx-auto object-contain"
            />
            <!-- Normal images (non-Canvas) -->
            <img
              v-else
              :src="item.image"
              :alt="item.name"
              class="w-10 h-10 lg:w-8 lg:h-8 mx-auto object-contain"
            />
          </div>

          <!-- ICON (if no image) -->
          <div v-else-if="item.icon">
            <i
              :class="[
                item.icon,
                'text-4xl lasalle-green-text my-auto mx-auto lg:mr-2',
              ]"
            ></i>
          </div>

          <!-- LABEL -->
          <span
            v-if="!item.hideLabel"
            class="mt-1 lg:mt-0 font-semibold lasalle-green-text uppercase text-sm lg:text-base lg:ml-2 text-center lg:text-left"
          >
            {{ item.name }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lasalle-green-text {
  color: #014421;
}
</style>
