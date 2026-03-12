<template>
  <div class="py-5">
    <h1 class="text-2xl font-bold mb-10">
      Vehicle Reservation Selection
    </h1>

    <!-- VEHICLE SECTION -->
    <h2 class="text-lg font-semibold mb-4">Select Vehicle</h2>

    <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 mb-12">
      <div
        v-for="vehicle in vehicles"
        :key="vehicle.name"
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
                :src="vehicle.banner"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Title -->
            <div class="uppercase flex items-center justify-center h-20 bg-green-600 text-white font-semibold text-center px-3">
              {{ vehicle.name }}
            </div>

          </div>

          <!-- BACK -->
          <div
            class="absolute w-full h-full bg-white border flex flex-col items-center justify-center gap-3 shadow-lg rotate-y-180 backface-hidden"
          >
            <p class="text-sm text-gray-600 text-center px-3">
              Reserve this vehicle
            </p>

            <button
              @click.stop="selectVehicle(vehicle.name)"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Select
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- DRIVER SECTION -->
    <h2 class="text-lg font-semibold mb-4">Select Driver</h2>

    <div class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="driver in drivers"
        :key="driver.name"
        class="group perspective"
      >
        <div
          class="relative h-48 w-full duration-500 transform-style preserve-3d group-hover:rotate-y-180"
        >

          <!-- FRONT -->
          <div class="absolute w-full h-full bg-white shadow-lg backface-hidden flex flex-col items-center justify-center">

            <!-- Profile Image -->
            <div class="w-20 h-20 rounded-full overflow-hidden mb-3 border">
              <img
                :src="driver.image"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Driver Name -->
            <div class="text-center font-semibold capitalize px-2">
              {{ driver.name }}
            </div>

          </div>

          <!-- BACK -->
          <div
            class="absolute w-full h-full bg-white border shadow-lg flex flex-col items-center justify-center gap-3 rotate-y-180 backface-hidden"
          >
            <p class="text-sm text-gray-600 text-center">
              Assign this driver
            </p>

            <button
              @click.stop="selectDriver(driver.name)"
              class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Select
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- RESULTS -->
    <div v-if="selectedVehicle || selectedDriver" class="mt-10 space-y-2 text-lg font-medium">

      <div v-if="selectedVehicle">
        Selected Vehicle:
        <span class="text-green-600 capitalize">
          {{ selectedVehicle }}
        </span>
      </div>

      <div v-if="selectedDriver">
        Selected Driver:
        <span class="text-green-600 capitalize">
          {{ selectedDriver }}
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"

const selectedVehicle = ref(null)
const selectedDriver = ref(null)

const vehicles = [
  { name: "bus", banner: "/img/LSUbanner.png" },
  { name: "urvan", banner: "/img/LSUbanner.png" },
  { name: "altis", banner: "/img/LSUbanner.png" },
  { name: "grandia", banner: "/img/LSUbanner.png" },
  { name: "autozam", banner: "/img/LSUbanner.png" },
  { name: "revo", banner: "/img/LSUbanner.png" },
  { name: "bajaj", banner: "/img/LSUbanner.png" },
  { name: "ipv", banner: "/img/LSUbanner.png" },
  { name: "commuter", banner: "/img/LSUbanner.png" }
]

const drivers = [
  { name: "elmer banac", image: "/img/LSUbanner.png" },
  { name: "brian patadilla", image: "/img/LSUbanner.png" },
  { name: "armando torred", image: "/img/LSUbanner.png" },
  { name: "jeoffrey oro", image: "/img/LSUbanner.png" }
]

const selectVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
}

const selectDriver = (driver) => {
  selectedDriver.value = driver
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