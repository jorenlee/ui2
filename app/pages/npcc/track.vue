<script setup>
const menuList = [
  { label: "About NPCC", link: "/npcc" },
  { label: "Request For Tech Support ", link: "/npcc/request" },
  { label: "Track Request", link: "/npcc/track" },
];
</script>

<template>
  <div class="bg-gray-50">
    <Header />

    <!-- Banner -->
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div></div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h2
            class="font-bold uppercase text-white lg:text-xl text-sm w-11/12 mx-auto lg:my-12 my-6"
          >
            Network, Programs and Computerization Center
          </h2>
        </div>

        <div class="shadow-lg text-green-700">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/npcc" class="mx-2 hover:underline lg:h-10">NPCC</a>
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white bg-white h-full">
              <div
                class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
              >
                <a href="/login" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-user" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Admin Login</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- Main Content -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify">
        <div class="bg-white p-6 shadow rounded-lg">
          <!-- ADMISSION TITLE -->
          <h2 class="lasalle-green-text font-bold text-xl">Track Request</h2>
          <UniversityLogin title="Student Login" routeURL="/central/dashboard" />
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green-text {
  color: #0b6b40; /* LSU green */
}
</style>
