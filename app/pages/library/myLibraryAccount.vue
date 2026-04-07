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
                class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto mb-5"
              >
                MY LIBRARY ACCOUNT
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
                  <a href="/library/myLibraryAccount" class="mr-1">
                    My Library Account
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="mx-auto pt-5">
        <div class="lg:w-6/12 w-11/12 px-10 mx-auto py-5">
          <h1 class="text-center lasalle-green-text text-lg mt-5 font-bold">
            My Library Account
          </h1>
        </div>
      </div>
      <div class="text-center mb-5 ml-10 mr-10">
        <p class="mx-auto lg:w-9/12">
          MyLibrary Account allows you to store your personal library and to
          perform a quick search within it. The MyLibrary Account Members can
          access their loan records online by using your username and password
          to access your library account details.
        </p>
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