<script setup>
const menuList = [
  { label: "Campus Development", link: "/campus/dev" },
  { label: "Campus Tour", link: "/campus/tour" },
  { label: "Basic Education", link: "/campus/basic-education" }
];
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
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
              <a href="/campus/tour" class="mr-1"> Campus Tour </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- Video Section -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3">
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <div class="relative" style="padding-top: 56.25%;">
            <iframe
              class="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/6Wi9s0s-Tzs"
              title="Campus University College Tour"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <div class="p-4">
            <h2 class="font-bold text-lg lasalle-green-text mb-2">
              Main Campus University College Tour
            </h2>
            <p class="text-sm text-gray-600">
              Explore our campus and facilities through this guided video tour.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green-text {
  color: #0b6b40; /* Adjust to match LSU green */
}
</style>
