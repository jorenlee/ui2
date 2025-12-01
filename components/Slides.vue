<script setup>
const slides = ref([
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/cteResults1.png",
    imageMobile:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/cteResults-mobile1.png",
    title: "Slide 1",
    link: "/",
    status:"active"
  },
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/canvas-banner-2324.jpg",
    imageMobile:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/canvas-banner-2324-Mobile.jpg",
    title: "Slide 2",
    link: "/",
    status:""
  },
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/lsudirectory.jpg",
    imageMobile:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/lsudirectory-Mobile.jpg",
    title: "Slide 3",
    link: "https://lsu.edu.ph/directory/",
    status:""
  }
]);
</script>

<template>
  <div>
    <div id="default-carousel" class="relative w-full" data-carousel="static">
      <!-- Carousel wrapper -->
      <div
        class="relative custom-height md:h-[400px] h-[179px] overflow-hidden bg-white -ml-1"
      >
        <!-- Item 1 -->
        <!-- <div class="hidden duration-[1500ms] ease-in-out" data-carousel-item>
          <img
            src="~/assets/inv1.jpg"
            class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 lg:block hidden"
            alt="..."
          />
        </div> -->
        <!-- transition data-interval="10000"  duration-[900ms] ease-in-out  -->
        <div class="hidden" :data-carousel-item="s.status" v-for="(s, i) in slides" :key="i">
          <a :href="s.link">
            <img
              :src="s.image"
              class="absolute w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 lg:block hidden"
              alt="..."
            />
            <img
              :src="s.imageMobile"
              class="absolute w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 lg:hidden block"
              alt="..."
            />
          </a>
        </div>
      </div>
      <!-- Slider indicators -->
      <div
        class="absolute z-30 flex space-x-3 -translate-x-1/2 lg:bottom-5 bottom-1 left-1/2"
      >
        <button
          v-for="(s, i) in slides"
          :key="i"
          type="button"
          class="w-3 h-3 rounded-full border-2 border-white"
          aria-current="true"
          :aria-label="s.title"
          :data-carousel-slide-to="i"
        ></button>
      </div>
      <!-- Slider controls -->
      <button
        type="button"
        class="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        data-carousel-prev
      >
        <span
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
        >
          <svg
            class="w-4 h-4 text-white dark:text-gray-800"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 1 1 5l4 4"
            />
          </svg>
          <span class="sr-only">Previous</span>
        </span>
      </button>
      <button
        type="button"
        class="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
        data-carousel-next
      >
        <span
          class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
        >
          <svg
            class="w-4 h-4 text-white dark:text-gray-800"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 9 4-4-4-4"
            />
          </svg>
          <span class="sr-only">Next</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style>
.bg-slider {
  background: #ffffff;
}
@media only screen and (min-width: 320px) {
  .custom-height {
    height: 180px;
  }
}
@media only screen and (min-width: 350px) {
  .custom-height {
    height: 200px;
  }
}
@media only screen and (min-width: 375px) {
  .custom-height {
    height: 200px;
  }
}
@media only screen and (min-width: 425px) {
  .custom-height {
    height: 230px;
  }
}
@media only screen and (min-width: 490px) {
  .custom-height {
    height: 260px;
  }
}
@media only screen and (min-width: 768px) {
  .custom-height {
    height: 390px;
  }
}
@media only screen and (min-width: 1200px) {
  .custom-height {
    height: 500px;
      
  }
}
@media only screen and (min-width: 1440px) {
  .custom-height {
    height: 525px;
  }
}
@media only screen and (min-width: 1500px) {
  .custom-height {
    height: 550px;

  }
}
@media only screen and (min-width: 1600px) {
  .custom-height {
    height: 650px;

  }
}
@media only screen and (min-width: 1700px) {
  .custom-height {
    height: 700px;
    
  }
}
@media only screen and (min-width: 1800px) {
  .custom-height {
    height: 800px;
    
  }
}
@media only screen and (min-width: 2560px) {
  .custom-height {
    height: 950px;
  }
}
</style>