<script setup>
import { ref } from "vue";

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
    link: "/mylsu",
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
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/Logo_Canvas_Red_Horizontal.png",
    image_mobile:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/Logo_Canvas_Red_Vertical.png",
    hideLabel: true,
  },
  {
    name: "FAQs",
    link: "/faqs",
    icon: "fa fa-question-circle text-emerald-800",
  },
]);
</script>

<template>
  <div class="font-sans mx-auto sm:px-6">
    <div class="w-full z-30">
      <div
        class="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:justify-evenly lg:items-center gap-2 lg:gap-1 p-2 lg:p-3 bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-slate-200/80 shadow-2xl shadow-emerald-950/10"
      >
        <a
          v-for="(item, index) in majorComponents"
          :key="index"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col lg:flex-row justify-center items-center rounded-xl py-3 lg:py-2.5 px-3 hover:bg-emerald-50/80 hover:text-emerald-900 transition-all duration-300 hover:-translate-y-0.5 text-center lg:w-1/6 w-full group lg:shadow-none shadow-md hover:border-emerald-100/80"
        >
          <!-- IMAGE (handles Canvas special case) -->
          <div v-if="item.image" class="shrink-0 transition-transform duration-300 group-hover:scale-110">
            <!-- Mobile (Canvas vertical) -->
            <img
              v-if="item.name === 'Canvas'"
              :src="item.image_mobile"
              alt="Canvas Mobile"
              class="block lg:hidden w-14 h-auto mx-auto object-contain"
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
              class="w-8 h-8 lg:w-7 lg:h-7 mx-auto object-contain"
            />
          </div>

          <!-- ICON (if no image) -->
          <div v-else-if="item.icon" class="shrink-0 transition-transform duration-300 group-hover:scale-110">
            <i
              :class="[
                item.icon,
                'text-2xl lg:text-xl my-auto mx-auto lg:mr-2',
              ]"
            ></i>
          </div>

          <!-- LABEL -->
          <span
            v-if="!item.hideLabel"
            class="mt-1.5 lg:mt-0 font-bold uppercase text-xs lg:text-xs tracking-wider lg:ml-2 text-center lg:text-left text-slate-800 group-hover:text-emerald-900"
          >
            {{ item.name }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
