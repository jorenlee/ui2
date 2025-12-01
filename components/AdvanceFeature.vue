<script setup>
const advanceEducators = [
  {
    icon: "",
    title: "Learn Anywhere",
    description:
      "There earth face earth behold she star so made void two given and also our",
  },

  {
    icon: "",
    title: "Expert Teacher",
    description:
      "There earth face earth behold she star so made void two given and also our",
  },
];
</script>

<template>
  <div class="w-11/12 mx-auto lg:grid grid-cols-2 gap-5 py-20">
    <div>
      <h2 class="text-green-700 text-mg font-bold lg:flex text-center">
        <span class="lg:block hidden">_______</span>

        <span>ADVANCE FEATURE</span>
      </h2>
      <h1 class="font-bold text-green-900 font-sans lg:text-5xl text-base py-5">
        Our Advance Educator<br />Learning System
      </h1>
      <p
        class="text-black font font-serif py-5 lg:text-base text-xs"
      >
        Fifth saying upon divide divide rule for deep their female all hath
        brind mid Days and <br />
        beast greater grass signs abundantly have greater also use over face
        earth days years<br />under brought moveth she star
      </p>
      <ul class="lg:grid grid-cols-2 gap-5">
        <li v-for="(a, i) in advanceEducators" :key="i">
          <h1 class="font-bold lg:text-2xl py-5 text-green-700 font-serif">
            {{ a.title }}
          </h1>
          <p class="text-black font font-serif lg:text-base text-xs">
            {{ a.description }}
          </p>
        </li>
      </ul>
    </div>
    <div class="py-10">
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/sample/advancEducator.jpg"
      />
    </div>
  </div>
</template>
