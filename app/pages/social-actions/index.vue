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
                  <a href="/social-actions" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 hover:text-white text-xs cursor-pointer bg-green-800 text-white">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    About SCC
                  </a>
                </li>
                <li class="">
                  <a href="/social-actions/scc-programs-framework" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    SCC Programs Framework
                  </a>
                </li>
                <li class="">
                  <a href="/social-actions/activities" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800 hover:text-white">
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
          <!-- <div class="bg-green-800 text-white px-6 py-4">
            <h1 class="text-2xl font-bold">Social Concerns Center</h1>
          </div> -->

          <!-- Introduction -->
          <div class="p-6 border-b">
            <p class="text-sm leading-relaxed mb-4">
              The Social Concerns Center of the Lasallian Mission Unit serves as the social arm of La Salle University. Its primary goal is to enhance the quality of life of the people in the community through various programs and interventions. The center works in collaboration with its students, Lasallian partners, alumni, and partners institutions/agencies to provide support services.
            </p>
            <p class="text-sm leading-relaxed">
              The center's programs and services are anchored on the Lasallian Guiding Principles and Lasallian Reflection Framework. This manual serves as a guide for community extension and provides direction for the implementation of programs. The center intends to update this manual regularly to ensure that it remains relevant and appropriate to address the current needs of the community.
            </p>
          </div>

          <!-- Vision, Mission, Goals Grid -->
          <div class="grid lg:grid-cols-2 gap-0 border-b">
            <!-- Left Column - Text Content -->
            <div class="p-6 space-y-6">
              <!-- Vision -->
              <div>
                <h2 class="text-lg font-bold text-green-800 mb-3">Vision</h2>
                <p class="text-sm leading-relaxed">
                  The Social Concerns Center (SCC), inspired by the charism of Saint John Baptist de La Salle, works towards a socially responsive La Salle Community, as genuine witnessing of love for God and humanity.
                </p>
              </div>

              <!-- Mission -->
              <div>
                <h2 class="text-lg font-bold text-green-800 mb-3">Mission</h2>
                <p class="text-sm leading-relaxed">
                  Guided by the Principles of Lasallian Social Development, the Social Concerns Center (SCC) seeks to enkindle in all members of the Lasallian Community a compassionate spirit in addressing contemporary social issues.
                </p>
              </div>

              <!-- Goals -->
              <div>
                <h2 class="text-lg font-bold text-green-800 mb-3">Goals</h2>
                <p class="text-sm leading-relaxed mb-3">
                  The Social Concerns Center (SCC) aims to create a community of socially responsible individuals through programs that:
                </p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• heighten social awareness</li>
                  <li>• effect social transformation</li>
                  <li>• facilitate solidarity work with organizations and institution</li>
                </ul>
              </div>
            </div>

            <!-- Right Column - Image Placeholders -->
            <!-- <div class="p-6 flex flex-col justify-center space-y-4">
              <div class="bg-blue-100 rounded-lg p-8 flex items-center justify-center border-2 border-blue-200">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-blue-400 mb-2"></i>
                  <p class="text-xs text-blue-600">Vision Image</p>
                </div>
              </div>
              <div class="bg-blue-100 rounded-lg p-8 flex items-center justify-center border-2 border-blue-200">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-blue-400 mb-2"></i>
                  <p class="text-xs text-blue-600">Mission Image</p>
                </div>
              </div>
              <div class="bg-blue-100 rounded-lg p-8 flex items-center justify-center border-2 border-blue-200">
                <div class="text-center">
                  <i class="fas fa-image text-4xl text-blue-400 mb-2"></i>
                  <p class="text-xs text-blue-600">Goals Image</p>
                </div>
              </div>
            </div> -->

            <div>
                <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/social-actions/social-actions.jpg"/>
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
