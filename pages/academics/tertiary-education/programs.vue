<script setup>
import tertiaryJSON from "./tertiary.json";
const tertiary = ref(tertiaryJSON.tertiary);

// console.log("tertiary", tertiary._rawValue[0].under_grad[0].list[0].programs[0].abbr);
</script>

<template>
  <div class="mx-auto">
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
            PROGRAMS
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/" class="mr-1">tertiary</a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/" class="mr-1">programs</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="py-5">
      <h1 class="font-bold py-5 text-green-700 text-3xl ml-20">{{ tertiary.title }}</h1>

      <div class=" "><p class="text-justify ml-80"></p></div>

      <div class="py-5">
        <h1 class="font-bold text-green-800 ml-40 text-2xl">Vision</h1>
        <p class="text-justify ml-60">{{ tertiary.vision }}</p>
      </div>

      <div>
        <h1 class="font-bold text-green-800 ml-40 text-2xl">Mission</h1>
        <p class="text-justify ml-60">{{ tertiary.mission }}</p>
      </div>

      <div>
        <h1 class="font-bold text-green-800 ml-40 text-2xl">This program aims to:</h1>

        <ul class="text-center ml-60">
          <li v-for="(tertiaryGoals, i) in tertiary.goals" :key="i">
            {{ tertiaryGoals }}
          </li>
        </ul>
      </div>

      <div>
        <h1 class="font-bold text-green-800 ml-40 text-2xl">Objectives:</h1>
        <ul>
          <li v-for="(tertiaryObj, i) in tertiary.Objectives" :key="i">
            {{ tertiaryObj }}
          </li>
        </ul>
      </div>
    </div>

    <Footer />
  </div>
</template>
