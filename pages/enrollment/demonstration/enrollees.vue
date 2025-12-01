<script setup>
</script>


<template>
<div>
  <Header />
  <div class="min-h-screen">
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block" />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            ENROLLMENT VIDEO GUIDE
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/enrollment" class="mr-1"> Enrollment </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/enrollment" class="mr-1"> Demonstration </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div>
      <div class="w-11/12 mx-auto my-5">
        <video width="10000" height="240" controls>
          <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/enrollment.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
  <Footer />
</div>
</template>

<style></style>
