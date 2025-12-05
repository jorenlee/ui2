<script setup>

  import volumesJSON from "./volumes.json";



  const volumes = ref(volumesJSON.volumes);



</script>

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
        <div>

        </div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
           <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Institutional Research and Publication Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about" class="mr-1"> About </a>
            </li>
            <!-- <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about-lsu" class="mr-1">  </a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>

    <!-- <div>
      <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSUOrganizationalChart.png" 
      class="lg:w-8/12 w-11/12 mx-auto my-5"/>
    </div> -->

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
  <div class="shadow lg:w-3/12 my-5 bg-white">
      <div>
        <ul class="w-full">
          <li class="w-full">
            <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
            La Salle University
            </span>
            <ul>
              <li class="">
                  <a href="/research" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    About IRPC
                  </a>
                </li>
                <li class="">
                  <a href="/research/publications" 
                  
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 hover:text-white text-xs cursor-pointer bg-green-800 text-white"
                  
                  
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Publications
                  </a>
                </li>
                <li class="">
                  <a href="/library/subrscribedElectronicResources" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800 hover:text-white">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    E-Journals
                  </a>
                </li>
             
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
   <div>

       <div class="shadow-xl rounded-3xl lg:w-11/12 mx-auto">
        <h1
          class="text-base text-green-900 mt-5 mb-3 w-full text-center mx-auto font-bold pt-10 pb-5 uppercase"
        >
          Research Volumes
        </h1>
        <ul
          class="gap-2 mb-10 pb-10 mx-auto w-full justify-left grid lg:grid-cols-3 grid-cols-2 text-sm"
        >
          <li
            class="flex shadow py-2 px-3 rounded-lg mb-4 text-green-900 font-semibold lg:mx-7 mx-4"
            v-for="(v, i) in volumes"
            :key="i"
          >
            <i class="mr-5 fa fa-download mt-1" aria-hidden="true"></i>
            <a :href="v.file" download target="_blank" class="">{{ v.title }}</a>
          </li>
        </ul>
      </div>
   </div>
    </div>
</div>
    <Footer />
  </div>
</template>

<style scoped>
/* a {
    border: 1px solid #969696;
    border-bottom: none;
  }
  a:hover {
    border: 1px solid #969696;
    border-bottom: none;
    background: #00cc00;
    color: #000;
  }
  a.active {
    background: #005e00;
    color: white !important;
    border-color: none !important;
  } */
</style>
