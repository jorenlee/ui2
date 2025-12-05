<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/social-actions/social-actions.jpg"
          class="align-top w-full h-36 object-cover lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Social Concerns Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/social-actions" class="mr-1"> Social Actions </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Sidebar -->
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <div>
          <ul class="w-full">
            <li class="w-full">
              <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
                Social Concerns Center
              </span>
              <ul>
                <li class="">
                  <a href="/social-actions" 
                   class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    About SCC
                  </a>
                </li>
                <li class="">
                  <a href="/social-actions/scc-programs-framework"
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800 hover:text-white"
                  >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    SCC Programs Framework
                  </a>
                </li>
                <li class="">
                  <a href="/social-actions/activities" 
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 hover:text-white text-xs cursor-pointer bg-green-800 text-white"
                >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Activities
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <!-- Main Content -->
      <div class="justify-center lg:w-9/12 mx-auto lg:my-5 my-3">
        <div class="bg-white shadow-lg rounded-lg overflow-hidden">
          <!-- Header -->
          <div class="bg-green-800 text-white px-6 py-1">
            <h1 class="text-xl font-bold">SCC in Action</h1>
          </div>

          <!-- Activities Grid -->
          <div class="">
            <!-- <div class="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
             
              <div class="bg-blue-100 rounded-lg p-6 flex items-center justify-center border-2 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-blue-400 mb-3"></i>
                  <p class="text-sm text-blue-600 font-semibold">Community Outreach Program</p>
                </div>
              </div>

        
              <div class="bg-green-100 rounded-lg p-6 flex items-center justify-center border-2 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-green-400 mb-3"></i>
                  <p class="text-sm text-green-600 font-semibold">Environmental Awareness Campaign</p>
                </div>
              </div>

          
              <div class="bg-purple-100 rounded-lg p-6 flex items-center justify-center border-2 border-purple-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-purple-400 mb-3"></i>
                  <p class="text-sm text-purple-600 font-semibold">Youth Leadership Training</p>
                </div>
              </div>

         
              <div class="bg-orange-100 rounded-lg p-6 flex items-center justify-center border-2 border-orange-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-orange-400 mb-3"></i>
                  <p class="text-sm text-orange-600 font-semibold">Disaster Response Training</p>
                </div>
              </div>

           
              <div class="bg-red-100 rounded-lg p-6 flex items-center justify-center border-2 border-red-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-red-400 mb-3"></i>
                  <p class="text-sm text-red-600 font-semibold">Educational Support Program</p>
                </div>
              </div>

        
              <div class="bg-indigo-100 rounded-lg p-6 flex items-center justify-center border-2 border-indigo-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-indigo-400 mb-3"></i>
                  <p class="text-sm text-indigo-600 font-semibold">Volunteer Formation Workshop</p>
                </div>
              </div>

   
              <div class="bg-pink-100 rounded-lg p-6 flex items-center justify-center border-2 border-pink-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-pink-400 mb-3"></i>
                  <p class="text-sm text-pink-600 font-semibold">Community Partnership Forum</p>
                </div>
              </div>

              <div class="bg-teal-100 rounded-lg p-6 flex items-center justify-center border-2 border-teal-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-teal-400 mb-3"></i>
                  <p class="text-sm text-teal-600 font-semibold">Social Advocacy Campaign</p>
                </div>
              </div>

           
              <div class="bg-yellow-100 rounded-lg p-6 flex items-center justify-center border-2 border-yellow-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-yellow-400 mb-3"></i>
                  <p class="text-sm text-yellow-600 font-semibold">Poverty Alleviation Initiative</p>
                </div>
              </div>
            </div> -->

            <!-- Description Section -->
            <div class="p-4 bg-gray-50 rounded-lg">
              <h3 class="text-lg font-bold text-green-800 mb-3">About Our Activities</h3>
              <p class="text-sm leading-relaxed text-gray-700">
                The Social Concerns Center organizes various activities throughout the year to promote social awareness, 
                community engagement, and sustainable development. These activities are aligned with our five program 
                frameworks: AMIGO (Partnership), ABAG (Disaster Response), ABANSIN (Advocacy), ALAGAD (Community-based), 
                and ABAY (Education and Youth-at-Risk).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<style scoped>
</style>