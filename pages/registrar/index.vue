<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="">
        <div class="relative">
        <div class="bg-green-700 lg:h-[200px] h-[150px]">
          <div class="lg:pt-10 pt-5 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1
              class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
            >
              REGISTRAR
            </h1>
            <p class="text-xs w-11/12 mx-auto text-white">
              University Registrar
            </p>
          </div>
        </div>
          <!-- <div class="pt-2.5 pb-3 shadow-lg">
            <ul
              class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
            >
              <li>
                <a href="/registrar" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/" class="mr-1">University Registrar</a>
              </li>
            </ul>
          </div> -->
          
        <div class="shadow-lg text-green-700">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/registrar" class="mr-2 hover:underline lg:h-10"
                  >Home</a
                >
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a
                  href="/registrar/heu/appointment"
                  class="mx-2 hover:underline lg:h-10"
                  >HEU Appointment</a
                >
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white bg-white h-full">
              <div
                class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r"
              >
                <a href="/registrar" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-video-camera" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Demo Guide</span>
                </a>
              </div>
              <div
                class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r"
              >
                <a
                  href="/registrar/track"
                  class="flex items-center w-fit mx-auto"
                >
                  <i class="fa fa-universal-access" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Track</span>
                </a>
              </div>
              <div
                class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
              >
                <a href="/registrar/login" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-user" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Admin Login</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div class="mt-5 w-11/12 lg:flex mx-auto bg-white mb-5 shadow-md">
        <div class="w-full items-center lg:flex lg:my-10">
          <div class="mx-auto lg:mt-0 lg:flex lg:gap-10 py-2">
            <!-- <p class="text-xs font-bold text-green-700 py-20">Coming Soon ...</p> -->
            <!-- href="/registrar/appointment" -->
            <!-- href="https://registrar.lsu.edu.ph/appointment/" -->
             <!-- href="https://docs.google.com/forms/d/e/1FAIpQLScKiPI6dmHSdvE6FDtP93QElwu_JOOl_GNyUVdL2c6x_HllYg/viewform" -->
            <a
              href="/registrar/heu/appointment"
              class="rounded-lg lg:py-2.5 p-2 lg:my-6 my-6 lg:w-80 w-10/12 justify-center mx-auto flex shadow-xl bg-white text-green-800 lg:text-sm text-xs font-bold lg:whitespace-nowrap"
            >
              <i
                class="fa fa-calendar-check mr-5 text-3xl"
                aria-hidden="true"
              ></i>
              <h1 class="my-auto whitespace-nowrap">Book Request Form</h1>
            </a>
            <!-- href="/registrar/track-appointment-status" -->
            <!-- <a
              href="/registrar/track-appointment-status"
              class="rounded-lg lg:py-2.5 p-2 lg:my-6 my-6 lg:w-80 justify-center mx-auto flex shadow-xl bg-white text-green-800 lg:text-sm text-xs font-bold lg:whitespace-nowrap"
            >
              <i class="fa fa-search mr-5 text-3xl" aria-hidden="true"></i>
              <h1 class="my-auto whitespace-nowrap">
                Track Appointment Status
              </h1>
            </a> -->
            <!-- href="/registrar/login" -->
            <!-- <a
              href="/registrar/login"
              class="rounded-lg lg:py-2.5 p-2 lg:my-6 my-6 lg:w-80 justify-center mx-auto flex shadow-xl bg-white text-green-800 lg:text-sm text-xs font-bold lg:whitespace-nowrap"
            >
              <i class="fa fa-user mr-5 text-3xl" aria-hidden="true"></i>
              <h1 class="my-auto whitespace-nowrap">Admin Login</h1>
            </a> -->
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>


<style scoped>
</style>