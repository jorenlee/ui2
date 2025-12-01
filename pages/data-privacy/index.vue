<script setup>
  const info = ref(
    [{
      link: "/data-privacy/website-notice",
      title: "LSU Website Notice",
      active: false
    }, {
      link: "https://docs.google.com/document/d/1SCfXJY8BKor6-_t3ffAFGAR67cpZQTa-/edit",
      title: "LSU Privacy Policy",
      active: false
    }, {
      link: "https://docs.google.com/document/d/1aVCsOp15mBTzpYOMJheT7EUK5ePg1MYzkvDBPZpW94g/edit?tab=t.0",
      title: "LSU Privacy Statement",
      active: false
    }, {
      link: "https://drive.google.com/drive/folders/1-rUQpacYC1eqG4myXwKb1UKDc_8V4pJ6",
      title: "LSU Privacy Notices",
      active: false
    }, {
      link: "https://docs.google.com/document/d/1LsBHezVAYctOL7NgYRXX1vb75qUFVkSM/edit",
      title: "LSU Data Privacy Forms",
      active: false
    }, {
      link: "/directory",
      title: "LSU Privacy Contact Details",
      active: false
    }, ])
</script>
<template>
  <div class="bg-gray-50 font-montserrat">
    <Header />
    <div class="text-center  lg:pt-28 pt-20 lg:pb-5 pb-4 text-white lg:bg-green-800 bg-green-950 border-b-4 border-green-600">
      <img class="lg:w-20 w-14 mx-auto mb-2" src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-logo.png" />
      <h1 class="capitalize  text-lg">la salle university</h1>
      <h1 class=" text-lg tracking-widest font-semibold uppercase lg:flex block mx-auto lg:w-fit">
        <span class="lg:flex block text-[18px] leading-[20px] tracking-normal">Data Privacy</span>
      </h1>
    </div>
    <div class="lg:flex ">
      <div class="w-full">
        <div class="lg:bg-white bg-green-900 lg:pb-10 pb-7 lg:text-green-800 text-white">
          <p class=" lg:w-10/12 w-10/12 mx-auto lg:text-base text-xs lg:pt-8 pt-5 pb-5 text-center tracking-tighter">La Salle University - Ozamiz upholds the Republic Act No. 10173 known as "Data Privacy Act of 2012" which declares the policy of the State to protect the fundamental human right of privacy while ensuring free flow of information to promote innovation and growth. </p>
          <div class="bg-yellow-300 lg:h-1 h-0.5 lg:w-6/12 w-9/12 mx-auto"></div>
          <h1 class="lg:text-4xl text-center lg:w-10/12 w-8/12 mx-auto  font-semibold lg:pt-8 pt-5 lg:pb-5 pb-3 tracking-widest">NPC Certificate of Registration and Seal</h1>
          <div class="lg:flex items-center lg:w-10/12 w-11/12 mx-auto border bg-white border-green-950 shadow-lg">
            <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/NPCCert.png" class="lg:w-8/12 lg:border-r-4 mx-auto lg:border-b-0 border-b-4" />
            <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/NPCSeal.png" class="lg:w-[250px] w-[150px] mx-auto px-5 lg:my-0 my-3" />
          </div>
        </div>
      </div>
      <div class="lg:w-4/12  bg-green-950">
        <div class="">
          <div class="w-11/12 mx-auto lg:py-10 py-5">
            <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-white.png" class="lg:w-5/12 w-4/12 mx-auto" />
          </div>
        </div>
        <div class=" lg:pb-10 pb-5">
          <ul class=" gap-10 w-10/12 mx-auto">
            <li v-for="(j,i) in info" :key="i">
              <a :href="j.link" target="_blank" class="w-full flex items-center cursor-pointer lg:mb-5 mb-3 rounded-full text-green-950 hover:text-white bg-white hover:bg-green-800 lg:py-2 py-1 px-3 hover:font-bold">
                <span class="lg:py-0 py-0.5 bg-green-800 hover:bg-white rounded-full lg:px-2 px-2 text-white hover:text-green-800">
                  <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </span>
                <span class="lg:ml-5 ml-4 lg:text-sm text-xs">
                  {{ j.title }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>
<style></style>