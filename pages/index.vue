<script setup>
const display = ref("desktop");

import { ref, onMounted } from "vue";

onMounted(() =>
  nextTick(() => {
    if (window.innerWidth < 800) {
      display.value = "mobile";
    }
  })
);
</script>

<template>
  <div class="font-montserrat">
    <Header />
    <div class="relative">
      <!-- <Slider /> -->
      <div class="bg-[#e3e3e3] relative">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
          class="absolute left-1/2 -translate-x-1/2 lg:top-24 top-16 lg:w-4/12 w-6/12"
        />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LANDSCAPE%20CROPPED.jpg"
          class="lg:pt-3 pt-14 mx-auto w-full"
        />
      </div>
      <Shortcuts class="lg:-mt-1 2xl-shadow lg:absolute bottom-0 w-full" />
    </div>

    <!-- <div v-if="display === 'mobile'">
      <SliderMobile />
    </div> -->
    <div class="lg:relative block z-0">
      <div class=""></div>
      <BlogPosting />
      <!-- <a href="https://drive.google.com/drive/folders/1F29IJ8LNDYJ8ElYvDwWDjsqI9NmAj5Y7?fbclid=IwY2xjawOMRIRleHRuA2FlbQIxMABicmlkETFIOWZPbWtCSXJreTcxWlhjc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHuqxEsKN2qFstVGA0sT5OgjH0MZpaaIvR9qqgmuEvh-9i-FRNG252cSFsFfI_aem_5T6KSJaDAR26zcAYCWywFg" class="w-10/12 mx-auto" target="_blank">
        <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Panagsadya%20(2).png" class="w-full" />
       </a>   -->
      <NewsAndUpdates />
    </div>
    <FAQs />
    <NetworkLogo />
    <!-- <TingogMagazine /> -->
    <Footer />
  </div>
</template>

<style scoped></style>
