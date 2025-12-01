<script setup>
const router = useRouter();

import { useUserStore } from "@/stores/user";
const userStore = useUserStore();

import { MdPreview } from 'md-editor-v3';
import './lib/preview.css';
const endpoint = ref(userStore.mainDevServer);
const procurements = await $fetch(endpoint.value + "/api/procurements/list").catch((error) => error.data)



const displayID = ref();

const procurement = ref();

const getID = async (id) => {
  displayID.value = id;
  procurement.value = await $fetch(endpoint.value + "/api/procurements/" + displayID + "/").catch((error) => error.data)
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
            class="align-top w-full h-36 object-none lg:hidden block" />
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
              LSU Central Procurement Unit
            </h1>
          </div>
          <div class="shadow-lg">
            <div class="w-11/12 mx-auto flex">
              <ul class="flex pt-2.5 pb-3 w-full lasalle-green-text capitalize mx-auto text-xs">
                <li>
                  <a href="/" class="mr-1"> Home </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="https://fb.com/lsu.cpu" class="mr-1"> Procurement </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="flex w-11/12 mx-auto">
        <div class="w-3/12 border-r pr-3 mr-10">
          <ul class="mx-auto mt-10">
            <li @click="getID(i)"
              class="border hover:bg-green-900 bg-white hover:text-white text-green-900 py-1 px-3 capitalize text-xs justify-between flex items-center"
              v-for="(p, i) in procurements" :key="i">
              <span>{{ p.title }}</span>
              <span><i class="fa fa-caret-right text-2xl"></i></span>
            </li>
          </ul>



        </div>
        <div class="w-9/12 lg:py-8 py-4 mx-auto">
          <ul class="lg:grid lg:grid-cols-3 text-center gap-10">
            <!-- <li v-for="post in procurements" :key="post.id"> -->
            <!-- class="rounded-lg w-full shadow-md hover:shadow-xl relative lg:mb-0 mb-5" -->
            <!-- <div v-if="post.open_for_bids"> -->
            <!-- <button @click="goToDetail(post.id)">
                <div class="rounded-lg">
                  <img class="h-52 w-full object-cover" :src="post.banner_image" />
                </div>
              </button> -->
            <!-- <div class="flex p-2 shadow rounded-b-lg border-t-4 h-14 border-green-900"> -->
            <!-- <div class="my-auto font-bold text-base text-left uppercase w-full">
                  {{ post.title }}
                </div> -->
            <div class="w-fit flex">
              <!-- <div
                    class="shadow-lg absolute top-0 right-0 bg-green-900 text-white py-1 px-3"
                  >
                    <div class="font-medium text-sm">Starts at</div>
                    <div class="font-semibold text-lg">
                      {{ post.project_ceiling_budget }}
                    </div>
                  </div> -->

              <div class="mr-0 ml-auto flex items-center gap-3">
                <!-- <button @click="goToDetail(post.id)">
                      <i
                        class="fa fa-eye text-green-700 rounded-lg uppercase text-xl hover:text-3xl"
                        aria-hidden="true"
                      ></i>
                    </button> -->

                <!-- <a
                      href="https://www.facebook.com/lsu.cpu"
                      class="flex gap-2 bg-blue-900 hover:bg-gray-600 text-white px-2 font-base text-sm rounded-lg"
                    >
                      <i
                        class="fab fa-2x fa-facebook text-base py-1"
                        aria-hidden="true"
                      ></i>
                      <span class="py-1">Share</span>
                    </a> -->

                <!-- <ShareNetwork
                      network="facebook"
                      url="https://news.vuejs.org/issues/180"
                      title="Say hi to Vite! A brand new, extremely fast development setup for Vue."
                      description="This week, I’d like to introduce you to 'Vite', which means 'Fast'. It’s a brand new development setup created by Evan You."
                      quote="The hot reload is so fast it\'s near instant. - Evan You"
                      hashtags="vuejs,vite"
                    >
                      <div
                        class="flex gap-2 bg-blue-900 hover:bg-gray-600 text-white px-2 font-base text-sm rounded-lg"
                      >
                        <i
                          class="fab fa-2x fa-facebook text-base py-1"
                          aria-hidden="true"
                        ></i>
                        <span class="py-1">Share</span>
                      </div>
                    </ShareNetwork> -->
              </div>
            </div>
            <!-- </div> -->
            <!-- </div> -->
            <!-- </li> -->
          </ul>
          <!-- <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/procurement.jpg"
          class="lg:w-8/12 w-11/12 mx-auto"
        /> -->

          <h1 class="text-green-800 text-xl text-center uppercase font-bold mb-5">Bid Announcement</h1>
          <!-- <div class="mx-auto w-11/12 shadow lg:p-10 p-4 lg:mt-7 mt-5 text-sm">
            <p class="mb-5 lg:mt-10 font-bold">Dear Prospect Bidders,</p>
            <p>We are pleased to invite you to participate in our upcoming projects. Below are the links to the formal
              invitation to bid, along with instructions and other requirements:</p>
            <p class="lg:ml-20 ml-10">Project: COMPUTER UNITS, ACCESSORIES AND PRINTER</p>
            <p class="lg:ml-20 ml-10">Invitation to Bid:</p>
            <a class="block lg:ml-[200px] ml-[70px] text-green-800 font-bold"
              href="https://drive.google.com/file/d/1ep0tM6rLjwNtYKfRFX7vfdFU0ptYb7wq/view?fbclid=IwAR31Qm9_4Qqw4Ibyr88xn1CtzEUWl1uOHUZBA3i17dgVeCzbq1FLaSHwHK4">
              PAGE1
            </a>
            <a class="block lg:ml-[200px] ml-[70px] text-green-800 font-bold"
              href="https://drive.google.com/file/d/1MPqp0tFHYI-sYE2JDsFPaiTreW-5jc2M/view?fbclid=IwAR2H5NIxx1tgrBcjHRQ9-HpiL5L1sNwDGKQuLnl9zaK-0NSImOT1w-sf274">
              PAGE2
            </a>
            <p class="mb-10">Please carefully review the provided documents for project details.</p>
            <p class="text-red-800">DEADLINE FOR SUBMISSION: DECEMBER 6, 2023</p>
            <p class="mb-10">For inquiries or clarifications, kindly email us <a href="#"
                class="text-green-700">procurement@lsu.edu.ph</a>
              Thank you for your interest, and we look forward to receiving your bids.</p>
            <p class="font-bold">Sincerely,</p>
            <p class="lg:mb-10 font-bold">LSU Central Procurement Office</p>
          </div> -->
          <!-- <div class="flex gap-10">
            <MdPreview :modelValue="procurement.specifications" class="shadow-lg rounded-2xl break-normal" />
            <img :src="procurement.banner_image" class="" />
          </div> -->
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