<script setup>
// import VueSocialSharing from "vue-social-sharing";
const router = useRouter();

import { useUserStore } from "@/stores/user";
const userStore = useUserStore();

import { MdPreview } from 'md-editor-v3';
import './lib/preview.css';
const endpoint = ref(userStore.mainDevServer);
const procurements = ref(0);
procurements.value = await $fetch(endpoint.value + "/api/procurements/list").catch((error) => error.data) || 0;
const displayID = ref();

// const procurement = ref();

const getID = async (id) => {
  displayID.value = id;
  router.push("/procurement/details/" + id);
}


const goToDetail = (id) => {
  router.push("/procurement/" + id);
};
useHead({
  script: [
    {
      src: "/messenger/procurement/procurement.js",
      tagPosition: "bodyClose",
      defer: true,
    },
    {
      src: "/messenger/procurement/fb.sdk-procurement.js",
      tagPosition: "bodyClose",
      defer: true,
    },
  ],
});



</script>

<template>
<div class="bg-gray-50">
  <Header />
  <div>
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full lg:h-36 h-28 object-none lg:hidden block" />
        <div class="lg:pt-10 pt-5 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-base w-11/12 mx-auto">
            LSU Central Procurement Unit
          </h1>
        </div>
        <div class="shadow-lg">
          <div class="w-11/12 mx-auto flex justify-between">
            <ul class="flex lasalle-green-text capitalize text-xs pt-2.5 pb-3">
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="https://fb.com/lsu.cpu" class="mr-1"> Procurement </a>
              </li>
            </ul>
            <ul class="flex hover:text-green-800 text-white">
                <li class="px-3 h-full flex items-center capitalize text-xs ">
                  <a href="/procurement/login" class="flex items-center">
                    <span class="">Admin Login</span>
                  </a>
                </li>
                <li class="bg-green-800 px-3 h-full flex items-center capitalize text-xs ">
                  <a href="/procurement/login" class="flex items-center">
                    <i class="fa fa-user text-white" aria-hidden="true"></i>  
                  </a>
                </li>
              </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="flex mx-auto">
      <div class="w-11/12 mx-auto lg:py-8 py-4">
        <h1 class="text-green-800 text-xl text-center uppercase font-bold lg:mb-5 mb-3 ">Bid Announcement</h1>
        <div class="md:flex" v-if="procurements" :class="procurements.length > 2 ? 'md:grid grid-cols-3 justify-between gap-x-10 gap-y-5': 'md:flex gap-10 justify-center'">
          <!--<div @click="getID(p.id)"
            class=" hover:bg-green-900 bg-white hover:text-white text-green-900 py-1 px-3 capitalize text-xs justify-between flex items-center lg:w-3/12"
            v-for="(p, i) in procurements" :key="i">
            <div>
              <img :src="p.banner_image" />
              <div class="w-full flex items-center pt-1.5">
                <span class="w-full flex">{{ p.title }}</span>
                <i class="fa fa-caret-right text-2xl"></i>
              </div>
            </div>
          </div>-->
          
            <div class="border-y-2 border-green-600 shadow-xl px-2 py-2 h-auto lg:mb-0 mb-5 relative pb-14"
            :class="procurements.length > 2 ? 'w-full': 'lg:w-4/12'"
             v-for="(p, i) in procurements" :key="i"
            >
                <div class="border-b-2">
                  <a :href="p.document_file" target="_blank" class=" bg-green-700 hover:bg-white border hover:text-green-700  
                  cursor-pointer px-2  block text-white w-full text-center pr-2 py-1 mx-auto"><i class="fa fa-file-pdf cursor-pointer"></i> Preview Document </a>

                  <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/procurement.png" class="h-10 mx-auto my-10"/>
                </div>
                <p class="text-center text-xs capitalize mb-5 w-full lg:w-10/12 mx-auto">{{ (p.title)}}</p>
              <div class="flex">
                <p class="font-light flex whitespace-nowrap">Nature of Project : <i class="fa fa-briefcase mx-2 mt-1"></i> </p>
                <p class="font-bold truncate hover:overflow-visible hover:text-wrap"> {{ p.nature_of_project }}</p>
              </div>
      
                <p class="font-light"> Submission Date : <i class="fa fa-calendar-times text-red-700 mr-2" aria-hidden="true">

                </i><span class="font-bold"> {{ p.deadline }}</span></p>

      
               <div class="flex items-center w-full justify-between mt-10 absolute bottom-2">
                <p class="px-2 py-1 shadow-lg  
                w-fit uppercase text-xs"
                
                :class="
                      {
                        'border-green-900 px-2 py-1 text-white bg-green-900': p.bid_status === 'completed',
                        'border-green-900 px-2 py-1 text-white bg-red-500': p.bid_status === 'on hold',
                        'border-green-900 px-2 py-1 text-white bg-yellow-500': p.bid_status === 'ongoing',
                        'border-purple-800 px-2 py-1 text-white bg-purple-800': p.bid_status === 'announcement'
                      }"
                
                >{{ p.bid_status }}</p>
                 <p class="text-right text-xs mr-5">{{ p.date_posted }}</p>
               </div>
            </div>
            <!-- <div class="border-y-2 border-green-600 shadow-lg px-2 py-2 h-auto w-full">
              <div class="py-10 px-2 border-b-2">
                <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/procurement.png" class="h-10 mx-auto"/>
              </div>
              <p class="text-center font-bold">Title</p>
              <p>Nature of Project</p>
    
              <p>deadline of submission</p>
              <p class="font-bold bg-green-700 hover:bg-white border hover:text-green-700 cursor-pointer px-2 text-white w-fit mr-0 ml-auto pr-2"><i class="fa fa-download  cursor-pointer"></i> Document </p>
             <div class="flex items-center w-full justify-between mt-10">
              <p class="bg-red-500 text-white px-2 py-1 shadow-lg  w-fit uppercase text-xs">on hold</p>
               <p class="text-right text-xs">10/2/2024</p>
             </div>
            </div>
            <div class="border-y-2 border-green-600 shadow-lg px-2 py-2 h-auto w-full">
              <div class="py-10 px-2 border-b-2">
                <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/procurement.png" class="h-10 mx-auto"/>
              </div>
              <p class="text-center font-bold">Title</p>
              <p>Nature of Project</p>
    
              <p>deadline of submission</p>
              <p class="font-bold bg-green-700 hover:bg-white border hover:text-green-700 cursor-pointer px-2 text-white w-fit mr-0 ml-auto pr-2"><i class="fa fa-download  cursor-pointer"></i> Document </p>
             <div class="flex items-center w-full justify-between mt-10">
              <p class="bg-green-500 text-white px-2 py-1 shadow-lg  w-fit uppercase text-xs">Completed</p>
               <p class="text-right text-xs">10/2/2024</p>
             </div>
            </div> -->
        </div>
      </div>
    </div>
  </div>
  <div>
    <div id="fb-root"></div>
    <div id="fb-customer-chat-procurement" class="fb-customerchat"></div>
  </div>
  <ProcurementFooter />
</div>
</template>

<style scoped>
.bg-green-10 {
  background-color: #003613;
}
</style>