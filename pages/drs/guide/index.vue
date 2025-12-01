<script setup></script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <div class="shadow-lg text-green-700 pt-[60px] lg:pt-[70px]">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2">
              <div>
                <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/drs" class="mx-2 hover:underline lg:h-10">Document Review Sheet</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/drs/guide" class="mx-2 hover:underline lg:h-10">Demo Guide</a>
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white bg-white h-full">
              <div class="hover:bg-green-800 border-x bg-white hover:text-white 
                text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r">
                <a href="/drs/guide" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-video-camera" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Demo Guide</span>
                </a>
              </div>
              <div class="hover:bg-green-800 border-x bg-white hover:text-white 
                text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r">
                <a href="/drs/track" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-universal-access" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Track</span>
                </a>
              </div>
              <div class="hover:bg-green-800 border-x bg-white hover:text-white 
                text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full">
                <a href="/drs/login" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-user " aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Admin Login</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="">
      <div class="header py-5">
        <h1 class="text-center lg:mb-5 my-3 font-bold lg:text-lg text-xs">
          DRS Demo Guide
        </h1>

        <div
          class="lg:w-6/12 w-11/12 mx-auto border-4 border-green-800 shadow-lg"
        >
          <video width="100%" height="100%" controls>
            <source
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/drs-demo.mp4?fbclid=IwZXh0bgNhZW0CMTEAAR1fBG8mT5ZbOX2wb350hspzuYDTXbeYSTxyygCQrJwunlAMr7-flIae8YY_aem_eGDIOcgGf1wwFypNd8z7TA"
              type="video/mp4"
            />
            <source
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/drs-demo.mp4?fbclid=IwZXh0bgNhZW0CMTEAAR1fBG8mT5ZbOX2wb350hspzuYDTXbeYSTxyygCQrJwunlAMr7-flIae8YY_aem_eGDIOcgGf1wwFypNd8z7TA"
              type="video/ogg"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
<style scoped>
input[type="radio"] {
  margin: 3px auto auto auto;
}

.error {
  color: red;
}

input[type="file"] {
  display: none;
}
</style>
