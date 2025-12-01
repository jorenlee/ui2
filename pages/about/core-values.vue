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
        <div>

        </div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            About
            <!-- <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2024-2025</span> -->
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about" class="mr-1"> About </a>
            </li>
            <!-- <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about-lsu" class="mr-1">  </a>
            </li> -->
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
            <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
            La Salle University
            </span>
            <ul>
              <li class="">
                <a href="/about" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer ">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Mission and Vision
                </a>
              </li>
              <li class="">
                <a href="/about/core-values" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer ">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Core Values

                </a>
              </li>
              <li class="">
                <a href="/about/strategic-intents" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800  hover:text-white">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Strategic Intent
                 
                </a>
              </li>
              <li class="">
                <a href="/about" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Educational Policy
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
      <div>
 
        <div class="block mx-auto lg:w-11/12">
          <div class="lg:flex lg:gap-10 lg:w-full w-11/12 mx-auto">
         

           

            <div class="w-full mx-auto lg:mb-10 mb-12">
              <div class="w-full">
                <div class="">
                  <div class="lg:text-xl text-lg">
                    <p
                      class="font-bold mb-4 lg:text-center text-white px-2 lasalle-green"
                    >
                      Core Values
                    </p>
                    <div class="lg:w-11/12 mx-auto">
                      <h1 class="text-lg font-semibold">Faith</h1>
                      <p class="text-xs text-justify mb-3">
                        We see life through the lens of God's compassionate love
                        and His desire for all, especially the poor, to possess
                        fullness of life.
                      </p>
                      <h1 class="text-lg font-semibold">Service</h1>
                      <p class="text-xs text-justify mb-3">
                        We are creative and open to new ideas; committed to
                        innovation and the pursuit of excellence in our work.
                        Through our minstry, we build a just and sustainable
                        society.
                      </p>
                      <h1 class="text-lg font-semibold">Communion</h1>
                      <p class="text-xs text-justify">
                        We collaborate and welcome diversity. We build
                        supportive communities of faith and service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
