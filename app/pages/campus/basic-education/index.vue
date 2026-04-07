<script setup>
const menuList = [
  { label: "Campus Development", link: "/campus/dev" },
  { label: "Campus Tour", link: "/campus/tour" },
  { label: "Basic Education", link: "/campus/basic-education" }
];

const videos = [
  {
    title: "Senior High School Campus Tour",
    url: "https://www.youtube.com/embed/snR2xuatn1I"
  },
  {
    title: "Basic Education Campus Tour",
    url: "https://www.youtube.com/embed/Z3gDlBH3W0w"
  }
];
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="relative">
      <Banner />
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="align-top w-full h-36 object-none lg:hidden block"
      />
      <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
        <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
          Campus Development
        </h1>
      </div>
      <div class="pt-2.5 pb-3 shadow-lg">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li>
            <a href="/" class="mr-1"> Home </a>
          </li>
          <li>
            <i class="fas fa-caret-right mr-1"></i>
            <a href="/campus/basic-education" class="mr-1"> Basic Education Campus </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- Video Section -->
      <div class="lg:w-full mx-auto lg:my-5 my-3 lg:flex gap-5">
        <div
          v-for="(video, index) in videos"
          :key="index"
          class="bg-white shadow-lg rounded-lg overflow-hidden w-full"
        >
          <div class="relative" style="padding-top: 56.25%;">
            <iframe
              class="absolute top-0 left-0 w-full h-full"
              :src="video.url"
              title="Campus Tour Video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <div class="p-4">
            <h2 class="font-bold text-lg lasalle-green-text mb-2">{{ video.title }}</h2>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green-text {
  color: #0b6b40; /* LSU green */
}
</style>
