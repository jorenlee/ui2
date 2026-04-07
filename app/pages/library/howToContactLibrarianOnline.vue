<script setup>
</script>

<template>
  <div>
    <Header />
    <div>
      <div class="bg-gray-50">
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
                Contact the librarian online
              </h1>
            </div>
            <div class="pt-2.5 pb-3 shadow-lg">
              <ul
                class="lg:flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
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
                  <a href="/library/new-normal" class="mr-1">
                    Online Library Services
                  </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/library/howToContactLibrarianOnline" class="mr-1">
                    Contact the librarian online
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div class="mb-5">
          <h1 class="text-center lasalle-green-text text-lg mt-5 font-bold">
            How to contact the librarian online?
          </h1>
        </div>
        <div class="mx-auto w-7/12 mb-5">
          <ul class="space-y-4 list-disc">
            <h2>You can ask VIRA</h2>
            <li class="ml-10">
              Via Chat
              <a href="https://lsu.edu.ph/offices/library/vira"
                >https://lsu.edu.ph/offices/library/vira</a
              >
            </li>
            <li class="ml-10">
              Via Facebook Page or Messenger<a
                href="https://www.facebook.com/lsu.lib"
              >
                https://www.facebook.com/lsu.lib</a
              >
            </li>
            <li class="ml-10">Via Email library.helpdesk@lsu.edu.ph</li>
            <li class="ml-10">
              Via Text or Call 09190053779 / (088) 521-0342 loc 135
            </li>
          </ul>
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