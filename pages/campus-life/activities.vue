<script setup>
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
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Campus Life
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/campus-life" class="mr-1"> Campus Life </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <div>
          <ul class="w-full">
            <li class="w-full">
              <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
                Campus Life
              </span>
              <ul>
                <li class="">
                  <a href="/campus-life/lasallian-mission-center" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Lasallian Mission Center
                  </a>
                </li>
                <li class="">
                  <a href="/campus-life/lasallian-formation-center" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Lasallian Formation Center
                  </a>
                </li>
                <li class="">
                  <a href="/campus-life/student-activities-center" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Student Activities Center
                  </a>
                </li>
                <!-- <li class="">
                  <a href="/campus-life/activities" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Activities
                  </a>
                </li> -->
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div class="justify-center lg:w-9/12 mx-auto lg:my-5 my-3">
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
       
          <div class="bg-green-800 text-white px-6 py-1">
            <h1 class="text-xl font-bold">Activities</h1>
          </div>

    
          <div class="">
           
            
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<style scoped>
</style>
