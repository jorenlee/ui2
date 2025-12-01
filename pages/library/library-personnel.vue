<script setup>
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div>
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
              LIBRARY PERSONNEL AND THEIR DESIGNATION
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
                <a href="/library" class="mr-1">
                  Library Personnel and their Designation
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="block m-auto w-fit text-center gap-10">
        <h2 class="text-center lasalle-green-text text-lg mt-10 font-bold">
          LMC Organizational Chart for A.Y. 2021-2022
        </h2>
        <h1 class="text-center lasalle-green-text text-lg mb-10 mt-5">
          Meet your Librarians!
        </h1>
      </div>
      <div class="m-auto w-fit text-center grid grid-cols-1">
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Mugot,M.jpg"
          alt="MONALIZA C. MUGOT, RL, MLIS, Ph.D."
          class="rounded-lg w-54 h-80 mx-auto"
        />
        <h3
          class="lasalle-green-text text-center font-bold mt-4 lg:w-full w-10/12 mx-auto"
        >
          DR. MONALIZA C. MUGOT, RL, MLIS, Ph.D.
        </h3>
        <p class="text-red-800">Director, Libraries and Media Centers</p>
      </div>
      <div>
        <div
          class="block m-auto text-center lg:grid lg:grid-cols-3 gap-2 mt-10 w-11/12"
        >
          <div class="lg:mb-0 mb-10">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Bejec,M.jpg"
              class="rounded-lg w-54 h-80 mx-auto"
            />
            <h3 class="lasalle-green-text text-center font-bold mt-4">
              MS. MARILYN C. BEJEC, RL, MLIS
            </h3>
            <p class="text-red-900 w-10/12 mx-auto">
              Head, Virtual Circulation Assistance (VICA)
            </p>
          </div>
          <div class="lg:mb-0 mb-10">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Sumaylo,J.jpg"
              class="rounded-lg w-54 h-80 mx-auto"
            />
            <h3 class="lasalle-green-text text-center font-bold mt-4">
              MS. JOSALYN T. SUMAYLO, RL, MLIS
            </h3>
            <p class="text-red-900">Assistant, Digitization Project</p>
          </div>
          <div class="lg:mb-0 mb-10">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Lumacad,L.C.jpg"
              class="rounded-lg w-54 h-80 mx-auto"
            />
            <h3 class="lasalle-green-text text-center font-bold mt-4">
              MS. LYNN CRYSTAL A. LUMACAD, RL, MLIS (36 Units)
            </h3>
            <p class="text-red-900">Librarian Help Online</p>
          </div>
        </div>
      </div>
      <div>
        <div
          class="block m-auto text-center w-8/12 lg:grid lg:grid-cols-2 gap-2 mt-10"
        >
          <div class="lg:mb-0 mb-10">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Gudmalin,J.K.jpg"
              class="rounded-lg w-54 h-80 mx-auto"
            />
            <h3 class="lasalle-green-text text-center font-bold mt-4">
              MS. JANE KAREN A. GUDMALIN, Staff
            </h3>
            <p class="text-red-900">
              Assistant, Virtual Circulation Assistance (VICA)
            </p>
          </div>
          <div class="lg:mb-0 mb-10">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Ebarle,A.J.jpg"
              class="rounded-lg w-54 h-80 mx-auto"
            />
            <h3 class="lasalle-green-text text-center font-bold mt-4">
              MS. APPLE JANE P. EBARLE, RL
            </h3>
            <p class="text-red-900">Head, Digitization Project</p>
          </div>
        </div>
      </div>
      <div>
        <div class="block m-auto w-fit text-center gap-10 mt-32 mb-5">
          <h1 class="lasalle-green-text font-bold">
            "When in doubt, go to the library."
          </h1>
          <span class="block m-auto w-fit text-center">- J.K. Rowling</span>
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