<script setup>
import administratorsJSON from "./administrators2024-2025-academic.json";

const administrators = ref(administratorsJSON.administrators);
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
            Administration
            <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2025-2026</span>
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/administration" class="mr-1"> Administration </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/administration" class="mr-1"> Chancellor & Deans </a>
            </li>
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
    
  <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3 overflow-x-auto">
      <div class="text-sm text-left text-gray-500 shadow-3xl">
        <!-- <div
          class="2xl:text-base lg:text-sm uppercase py-1 text-green-800 bg-white shadow-lg border-2 border-green-900 font-bold 2xl:py-1 lg:px-6 px-2 whitespace-nowrap text-center"
        >
          Designation
        </div> -->
        <div>
          <div
            class="lg:border-none border"
            v-for="(a, i) in administrators"
            :key="i"
          >
            <div
              v-if="a.headOffice"
              @click="a.toggleOPR = !a.toggleOPR"
              :class="
                a.headOffice ? 'bg-green-900 text-white 2xl:py-0.5' : 'bg-gray-100 text-gray-900'
              "
            >
              <h1
                class="lg:px-6 px-2 lg:py-1 lg:font-bold capitalize lg:text-left text-center 2xl:text-base lg:text-xs"
              >
                {{ a.offices }}
              </h1>
            </div>

            <div
              v-if="a.acadOffice"
              :class="
                a.acadOffice ? 'bg-sky-800 text-white 2xl:py-0.5' : 'bg-gray-100 text-gray-900'
              "
            >
              <h1
               class="lg:px-6 px-2 py-1 lg:font-bold capitalize lg:text-left text-center 2xl:text-base lg:text-xs"
              >
                {{ a.offices }}
              </h1>
            </div>

            <div
              class="bg-white text-black border-b lg:flex lg:py-0 py-2"
              v-for="(aa, i) in a.admins"
              :key="i"
            >
              <h1
                class="2xl:pt-1 2xl:pb-1 lg:py-1 lg:px-6 px-2 lg:text-left text-center font-bold text-black lg:w-1/3 lg:ml-0 lg:order-2 order-1 2xl:text-base lg:text-xs"
              >
                {{ aa.name }}
              </h1>
              <h1
                class="lg:flex 2xl:pt-1 2xl:pb-1 lg:py-1 lg:px-6 px-2 text-gray-900 text-center lg:text-left lg:border-r-4 lg:w-2/3 lg:ml-0 lg:order-1 order-2 2xl:text-base lg:text-xs"
              >
                <span class="lg:order-2 order-1">{{ aa.designation }}</span>
                <span class="lg:w-2/12 lg:flex block pr-3 lg:order-1 order-2"> {{ aa.officeAbbr }} </span> 
              </h1>
            </div>
          </div>
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
