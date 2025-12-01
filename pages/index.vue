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


    <div class="lg:relative block z-0">
      <div class=""></div>
      <BlogPosting />

                      <Slider class="lg:flex hidden"/>

    <div v-if="display === 'mobile'">
      <SliderMobile />
    </div>



      <a href="/sdgs" class="lg:bg-gray-50 bg-white lg:py-20 lg:border block px-10">
        <div class="w-fit mx-auto lg:py-10 py-5">
          <div class="lg:flex items-center gap-x-5 w-fit mx-auto">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
              class="lg:w-80 w-32 mx-auto"
            />
            <div class="w-0.5 h-[200px] bg-black lg:flex hidden"></div>
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
              class="w-80 lg:py-0 py-5"
            />
          </div>
          <div
            class="text-green-900 lg:text-2xl text-xs text-center lg:mt-8 font-roboto font-semibold"
          >
            La Salle University supports the Sustainable Development Goals.
          </div>
        </div>
      </a>
      <!-- <a href="https://drive.google.com/drive/folders/1F29IJ8LNDYJ8ElYvDwWDjsqI9NmAj5Y7?fbclid=IwY2xjawOMRIRleHRuA2FlbQIxMABicmlkETFIOWZPbWtCSXJreTcxWlhjc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHuqxEsKN2qFstVGA0sT5OgjH0MZpaaIvR9qqgmuEvh-9i-FRNG252cSFsFfI_aem_5T6KSJaDAR26zcAYCWywFg" class="w-10/12 mx-auto" target="_blank">
        <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Panagsadya%20(2).png" class="w-full" />
       </a>   -->

    <NetworkLogo class="py-10" />
      

      <NewsAndUpdates />




    </div>


        <FAQs />
    <!-- <TingogMagazine /> -->
    <Footer />
  </div>
</template>

<style scoped></style>
