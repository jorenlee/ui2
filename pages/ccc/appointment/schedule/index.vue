<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div>
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Career and Counseling Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex text-white-text capitalize w-11/12 mx-auto text-xs">
            <li><a href="/" class="mr-1">Home</a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/ccc" class="mr-1">Career and Counseling Center</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Sidebar -->
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <ul class="w-full">
          <li class="w-full">
        
            <ul>
              <li>
                <a
                  href="/ccc"
                 class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-white text-green-800 text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Career & Counseling Center
                </a>
              </li>

              <li>
                <a
                  href="/ccc/team"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-white text-green-800 text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  CCC Team
                </a>
              </li>
               <li>
                <a
                  href="/ccc/appointment/schedule"
                         
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-green-800 text-white text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Schedule an Appointment or Referral
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Main Content -->
      <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3 shadow-lg">
        <div class="">
          <!-- Contact / QR Section -->
          <div class="">
            <h2
              class="text-lg lg:text-xl font-bold text-white bg-green-700 px-2 py-1 mb-3 text-center"
            >
              Getting In Touch With Us
            </h2>
            <div class="text-xs mb-6 text-center p-3">
              <p class="mb-4">
                Scan the QR codes below to schedule an appointment or referral.
              </p>
              <div class="lg:flex justify-center lg:gap-x-10 gap-x-3 lg:px-10 px-5">
                <div class="text-center">
                  <img
                    src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/ccc/Appointment%20Scheduling.png"
                    alt="Appointment QR"
                    class="mx-auto border rounded-lg shadow"
                  />
            
                </div>
                <div class="text-center">
                  <img
                    src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/ccc/Referral.png"
                    alt="Referral QR"
                    class="mx-auto border rounded-lg shadow"
                  />
                
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
