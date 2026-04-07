<template>
  <div class="py-5">
    <h1 class="text-2xl font-bold mb-6">
      Facilities Reservation Selection
    </h1>

    <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
      <div
        v-for="facility in facilities"
        :key="facility.name"
        class="group perspective"
      >
        <div
          class="relative h-48 w-full duration-500 transform-style preserve-3d group-hover:rotate-y-180"
        >

          <!-- FRONT -->
          <div class="absolute w-full h-full overflow-hidden shadow-lg backface-hidden bg-white">

            <!-- Banner -->
            <div class="h-28 w-full">
              <img
                :src="facility.banner"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Title -->
            <div class="flex items-center justify-center h-20 bg-green-600 text-white font-semibold text-center px-3">
              {{ facility.name }}
            </div>

          </div>

          <!-- BACK -->
          <div
            class="absolute w-full h-full bg-white border flex flex-col items-center justify-center gap-3 shadow-lg rotate-y-180 backface-hidden"
          >
            <p class="text-sm text-gray-600 text-center px-3">
              Reserve this facility
            </p>

            <button
              @click.stop="selectFacility(facility.name)"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Select
            </button>
          </div>

        </div>
      </div>
    </div>

    <div v-if="selected" class="mt-8 text-lg font-medium">
      Selected Facility:
      <span class="text-green-600">{{ selected }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const selected = ref(null)

const facilities = [
  { name: "SC Lobby-Facade", banner: "/img/LSUbanner.png" },
  { name: "SC Grounds", banner: "/img/LSUbanner.png" },
  { name: "LS Lobby-Access Road", banner: "/img/LSUbanner.png" },
  { name: "SB Lobby", banner: "/img/LSUbanner.png" },
  { name: "SB Grounds", banner: "/img/LSUbanner.png" },
  { name: "BVM Lobby-Access Road", banner: "/img/LSUbanner.png" },
  { name: "SJ Lobby", banner: "/img/LSUbanner.png" },
  { name: "SJ Grounds", banner: "/img/LSUbanner.png" },
  { name: "Seminar Room", banner: "/img/LSUbanner.png" },
  { name: "Miguel Center", banner: "/img/LSUbanner.png" },
  { name: "The Forum", banner: "/img/LSUbanner.png" },
  { name: "Waling-waling", banner: "/img/LSUbanner.png" },
  { name: "Our Lady of the Star Chapel", banner: "/img/LSUbanner.png" },
  { name: "Theatre-in-the-woods", banner: "/img/LSUbanner.png" },
  { name: "BVM Auditorium", banner: "/img/LSUbanner.png" },
  { name: "Arts Center", banner: "/img/LSUbanner.png" },
  { name: "IS Covered Court", banner: "/img/LSUbanner.png" },
  { name: "Deportivo", banner: "/img/LSUbanner.png" },
  { name: "Field & Track Oval", banner: "/img/LSUbanner.png" },
  { name: "La Ferme DLS", banner: "/img/LSUbanner.png" },
  { name: "BJDFSC Function Hall", banner: "/img/LSUbanner.png" }
]

const selectFacility = (facility) => {
  selected.value = facility
}
</script>

<style scoped>
.perspective {
  perspective: 1000px;
}

.transform-style {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.group:hover .group-hover\:rotate-y-180 {
  transform: rotateY(180deg);
}
</style>