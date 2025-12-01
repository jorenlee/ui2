<script setup>
const studentBlog = [
  {
    image: "study-1",
    title: "Dry Beginning Sea Over Tree",
    description:
      "Which whose darkness saying were life unto fish wherein all fish of together called",
  },
  {
    image: "study-2",
    title: "All Beginning Air Two Likeness",
    description:
      "Which whose darkness saying were life unto fish wherein all fish of together called",
  },
  {
    image: "study-3",
    title: "Form Day Seasons Sea Hand",
    description:
      "Which whose darkness saying were life unto fish wherein all fish of together called",
  },
];
</script>

<template>
  <div>
    <div class="text-center py-10">
      <h2 class="text-green-700 text-center lg:text-2xl lg:my-5">Our Blog</h2>

      <h1 class="font-bold text-green-900 font-sans lg:text-5xl lg:my-5">
        Student Blog
      </h1>
    </div>

    <div class="lg:flex w-11/12 mx-auto">
      <ul class="lg:grid grid-cols-3 gap-5 py-10">
        <li
          v-for="(b, i) in studentBlog"
          :key="i"
          class="border p-3 rounded-lg shadow-md pb-20"
        >
          <img
            class="h-48 w-full rounded-lg"
            :src="`https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/sample/${b.image}.jpg`"
          />

          <h1
            class="font-bold pt-5 font-serif text-green-800 lg:text-2xl lg:py-5"
          >
            {{ b.title }}
          </h1>
          <p class="font-serif text-gray-500 lg:text-base text-xs">
            {{ b.description }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
