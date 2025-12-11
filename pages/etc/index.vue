<script setup>
const menuList = [
  { label: "Main Page", link: "/etc" }
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
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
           Educational Technology Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li><a href="/" class="mr-1"> Home </a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
            <a href="/etc" class="mr-1"> Educational Technology Center </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">

      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- MAIN CONTENT -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify h-screen">


 
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
