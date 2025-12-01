<script setup>
const lists = [
  {
    icon: "fa-thumbs-up",
    title: "Better Future",
    description:
      "Set have great you male grasses yielding yielding first their to called deep abundantly Set have great you male",
  },
  {
    icon: "fa-thumbs-up",
    title: "Qualified Trainers",
    description:
      "Set have great you male grasses yielding yielding first their to called deep abundantly Set have great you male",
  },
  {
    icon: "fa-thumbs-up",
    title: "Job Oppurtunity",
    description:
      "Set have great you male grasses yielding yielding first their to called deep abundantly Set have great you male",
  },
];
</script>

<template>
  <div class="lg:flex w-11/12 mx-auto lg:my-20">
    <div>
      <h1 class="font-bold text-green-900 lg:text-5xl">Awesome Feature</h1>
      <p class="my-9 lg:text-2xl">
        Set have great you male grass yielding an yielding first their you're
        have called the abundantly fruit were man
      </p>
      <button
        class="bg-green-500 hover:bg-green-700 lg:px-6 lg:py-4 px-3 py-2 text-white rounded-full font-bold lg:text-base text-xs"
      >
        Read More
      </button>
    </div>
    <div>
      <ul class="lg:grid grid-cols-3 gap-5">
        <li v-for="(l, i) in lists" :key="i" class="border p-3">
          <i class="fa fa-thumbs-up h-10 w-10" aria-hidden="true"></i>

          <h1
            class="text-green-900 lg:text-2xl text-center font-bold font-serif"
          >
            {{ l.title }}
          </h1>
          <p class="lg:my-9 text-center lg:text-1xl">
            {{ l.description }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>
<style scoped></style>
