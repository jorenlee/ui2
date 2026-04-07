<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div>
      <div class="pb-10">
        <div class="">
          <div class="relative">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
              class="align-top w-full h-auto lg:object-fill lg:block hidden"
            />
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
              class="align-top w-full h-36 object-none lg:hidden block"
            />
            <div
              class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full"
            >
              <h1
                class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
              >
                LIBRARY AND INFORMATION SERVICES MONTH
              </h1>
            </div>
            <div class="pt-2.5 pb-3 shadow-lg">
              <ul
                class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
              >
                <li>
                  <a href="/" class="mr-1"> Home </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/library" class="mr-1">
                    Libraries and Media Centers
                  </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a
                    href="/library"
                    class="mr-1"
                  >
                    Library and Information Services Month
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:w-6/12 w-11/12 mx-auto pt-10">
        <div class="">
          <div class="border-y-4 border-green-900 shadow-lg">
            <div class="text-center">
              <h1
                class="lasalle-green text-white py-2 font-bold text-md uppercase"
              >
                Coming Soon...
              </h1>
            </div>
            <div class="mx-auto w-fit my-5">
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Picture12.png"
                class="w-80 h-80"
              />
            </div>
          </div>
        </div>
        <div
          class="mt-10 mb-5 text-center text-sm italic font-semibold text-gray-900"
        >
          <h1 class="lasalle-green-text">
            "When in doubt, go to the library."
          </h1>
          <span>- J.K. Rowling</span>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.sub-header {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMC/LMCSpaceBanner.png");
  background-position: center;
  background-size: 100% 100%;
}
@media only screen and (max-width: 1023px) {
  .sub-header {
    background: #087830;
  }
}
@media only screen and (max-width: 2560px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 1440px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 1024px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 768px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 425px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 375px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 320px) {
  .sub-header {
    height: 170px;
  }
}
</style>