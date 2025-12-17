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
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Network, Programs and Computerization Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li><a href="/" class="mr-1"> Home </a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/npcc" class="mr-1">
                Network, Programs and Computerization Center
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto"></div>

    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green-text {
  color: #0b6b40;
  /* LSU green */
}
</style>
