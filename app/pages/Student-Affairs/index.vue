<script setup></script>

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
        <div></div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Student Affairs
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/social-media" class="mr-1"> Student Affairs </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="">
      <div class="h-2/3 bg-green-50 lg:py-20 py-5 lg:px-5">
        <div
          class="grid lg:grid-cols-5 grid-cols-2  items-center text-center lg:w-fit w-11/12 mx-auto lg:gap-x-20 gap-x-3 z-20"
        >
          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/lsuETC"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/ETC.png"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>

          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/lsucso"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/CSO.png"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>
          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/lsuusg"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/USG.png"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>

          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/lsu.swc"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/Sports.png"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>

          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/lsuozamizstudentaffairs"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/SAC.jpg"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>

          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/artsandculturecenter"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/ACC.jpg"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>
          <div class="my-5">
            <a
              target="_blank"
              href="https://www.facebook.com/lsutingog"
              class="w-full border-gray-50 shadow-lg rounded-full text-green-950 hover:text-white"
            >
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/LSUTingog.jpg"
                class="lg:w-[70px] w-[70px] mx-auto rounded-full hover:border-2 border-green-800 shadow-lg"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>
