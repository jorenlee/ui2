<script setup>
import { ref } from "vue";

const container = ref(null);
const image = ref(null);
const scale = 2;

function handleMouseMove(e) {
  if (!container.value || !image.value) return;

  const rect = container.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const xPercent = x / rect.width;
  const yPercent = y / rect.height;

  image.value.style.transformOrigin = `${xPercent * 100}% ${yPercent * 100}%`;
  image.value.style.transform = `scale(${scale})`;
}

function handleMouseLeave() {
  if (!image.value) return;

  image.value.style.transformOrigin = "0 0";
  image.value.style.transform = "scale(1)";
}
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div>
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
          alt="Green tones gradient background"
        />
        <div></div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Administration
            <span class="lg:text-base text-xs lg:mt-5 ml-5"
              >A.Y. 2025-2026</span
            >
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li><a href="/" class="mr-1">Home</a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/administration" class="mr-1">Administration</a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/administration" class="mr-1">Organizational Chart</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="shadow lg:w-3/12 lg:my-5 mt-2 mb-1 bg-white">
        <div>
          <ul class="w-full">
            <li class="w-full">
              <span
                class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base"
              >
                LSU Administration
              </span>
              <ul>
                <li>
                  <a
                    href="/administration"
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer bg-gray-300"
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Organizational Chart
                  </a>
                </li>
                <li>
                  <a
                    href="/administration/bot"
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Board of Trustees and Officers
                  </a>
                </li>
                <li>
                  <a
                    href="/administration/op-ovp"
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800 hover:text-white"
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    President and Vice Presidents
                  </a>
                </li>
                <li>
                  <a
                    href="/administration/oc-cd"
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Chancellor and Deans
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <!-- Zoom container -->
      <div
        ref="container"
        id="zoom-container"
        class="zoom-container justify-center lg:w-10/12 mx-auto lg:my-5 shadow"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <img
          ref="image"
          id="zoom-image"
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSU-Organizational-Chart.png"
          class="lg:p-5 p-1 zoom-hover"
          alt="LSU Organizational Chart"
        />
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.zoom-container {
  display: inline-block;
  overflow: hidden;
  position: relative;
  width: fit-content;
}

.zoom-container img {
  display: block;
  transition: transform 0.3s ease;
  transform-origin: 0 0;
}
</style>
