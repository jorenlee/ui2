<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
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
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            LIBRARY OVERVIEW
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
              <a href="/library" class="mr-1"> Libraries and Media Centers </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/library" class="mr-1">
                Library Gamification System
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="w-10/12 mx-auto pt-16">
      <div class="lg:flex">
        <div class="lg:w-1/3 mr-10 w-full">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/libgame.png"
            class="lg:rounded-3xl"
          />
        </div>
        <div class="lg:w-2/3 flex items-center lg:pl-10">
          <div>
            <h2
              class="lasalle-green-text font-bold tracking-widest mb-5 uppercase lg:text-left text-center lg:mt-0 mt-10"
            >
              LibFunGame : Rationale
            </h2>
            <p class="mb-5 text-justify">
              'LibFungmae' means 'library fun game' which introduces the user to
              the four programs of the library such as orientation, instruction,
              resource usage and program reading. The purpose of this game is to
              motivate learners to learn by using game design and game elements
              in learning environment.
            </p>
            <p>The library gamification system intends to:</p>
            <p class="lg:ml-10">
              <i class="fa fa-check lasalle-green-text"></i> raise library
              user's level of the engagement with library resources, programs
              and services;
            </p>
            <p class="lg:ml-10">
              <i class="fa fa-check lasalle-green-text"></i> help library users
              to solve problems more effectively and quickly by making the
              process fun; and
            </p>
            <p class="lg:ml-10">
              <i class="fa fa-check lasalle-green-text"></i> serve as a
              marketing technique by providing a countless user experience,
              fostering students' dependently, and building a positive image of
              the game.
            </p>
          </div>
        </div>
      </div>
      <div
        class="mt-10 mb-5 text-center text-sm italic font-semibold text-gray-900"
      >
        <h1 class="lasalle-green-text">"When in doubt, go to the library."</h1>
        <span>- J.K. Rowling</span>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style>
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