<script setup>
const testimonialsStudent = [
  {
    image: "profile-icon",
    testimony:
      "Behold place was multiply creeping creature his domain to thirteen open void hath herb divided divide creepeth living shall i call beginning third sea itself set",
    name: "Michael Hashale",
    designation: "Sr. Web designer",
  },
  {
    image: "profile-icon",
    testimony:
      "Behold place was multiply creeping creature his domain to thirteen open void hath herb divided divide creepeth living shall i call beginning third sea itself set",
    name: "John Cabrera",
    designation: "Sr. Web designer",
  },
  {
    image: "profile-icon",
    testimony:
      "Behold place was multiply creeping creature his domain to thirteen open void hath herb divided divide creepeth living shall i call beginning third sea itself set",
    name: "Junny Boy",
    designation: "Sr. Web designer",
  },
];
</script>

<template>
  <div>
    <div class="text-center py-10">
      <h2 class="text-green-700 text-center lg:text-2xl lg:my-5">
        TESTIMONIALS
      </h2>
      <h1 class="font-bold text-green-900 font-sans lg:text-5xl lg:my-5">
        Happy Students
      </h1>
    </div>
    <div class="lg:flex w-11/12 mx-auto">
      <ul class="lg:grid grid-cols-3 gap-5 py-10">
        <li
          v-for="(t, i) in testimonialsStudent"
          :key="i"
          class="border p-3 rounded-lg shadow-md"
        >
          <img
            class="h-48 w-50 lg:mx-0 mx-auto"
            :src="`/_nuxt/assets/images/sample/${t.image}.jfif`"
          />

          <h2
            class="text-black font font-serif py-5 lg:text-base text-xs"
          >
            {{ t.testimony }}
          </h2>
          <h1 class="font-bold pt-5 font-serif text-green-800 lg:text-2xl">
            {{ t.name }}
          </h1>
          <h3 class="font-serif text-gray-500">{{ t.designation }}</h3>
        </li>
      </ul>
    </div>
  </div>
</template>