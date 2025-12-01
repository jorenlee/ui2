<script setup>
const popularCourse = [
  {
    image: "web1",
    title: "Web Development",
    description:
      "Which whose darkness saying were life unto fish wherein all fish of together called",
  },
  {
    image: "UX-UI-Design",
    title: "Web UX/UI Design",
    description:
      "Which whose darkness saying were life unto fish wherein all fish of together called",
  },
  {
    image: "WordPress-Development",
    title: "Wordpress Development",
    description:
      "Which whose darkness saying were life unto fish wherein all fish of together called",
  },
];
</script>

<template>
  <div class="text-center lg:py-10 py-3">
    <h1
      class="text-green-700 text-center lg:text-2xl lg:my-5 text-base lg:py-5"
    >
      POPULAR COURSES
    </h1>
    <h1 class="font-bold text-green-900 font-sans lg:text-6xl lg:my-5">
      Special Courses
    </h1>
  </div>

  <div>
    <div class="lg:flex w-11/12 mx-auto">
      <ul class="lg:grid grid-cols-3 gap-5 py-10">
        <li
          v-for="(p, i) in popularCourse"
          :key="i"
          class="border p-3 rounded-lg shadow-md"
        >
          <img
            class="h-48 w-full rounded-lg"
            :src="`https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/sample/${p.image}.jpg`"
          />

          <h1
            class="text-green-900 lg:text-2xl text-center font-bold font-serif py-4"
          >
            {{ p.title }}
          </h1>
          <p class="lg:my-9 text-center lg:text-1xl lg:text-base text-xs">
            {{ p.description }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
