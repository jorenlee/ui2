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
                class="font-bold uppercase text-white lg:text-lg w-11/12 mx-auto mb-5"
              >
                Electronic Resources Services
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
                  <a href="/library/electronicResourcesServices" class="mr-1">
                    Electronic Resources Services
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="py-5">
        <h1 class="text-center lasalle-green-text text-lg mt-5 font-bold">
          Electronic Resources Services
        </h1>
      </div>
      <div class="mx-auto w-9/12">
        <h1 class="mb-5">
          E-resources form one of many formats that the Library collects to
          support its universal collections. Types of e-resources:
        </h1>
        <ul class="space-y-3 ml-10 mb-5 list-disc">
          <h2 class="font-bold text-black lg:ml-10">1. Online e-resources</h2>
          <li class="lg:ml-20">Web sites</li>
          <li class="lg:ml-20">Online databases</li>
          <li class="lg:ml-20">E-journals</li>
          <li class="lg:ml-20">E-books</li>
        </ul>
        <ul class="space-y-3 ml-10 mb-5 list-disc">
          <h2 class="font-bold text-black lg:ml-10">2. Other e-resources</h2>
          <li class="lg:ml-20">CD ROM</li>
          <li class="lg:ml-20">Other portable computer databases</li>
        </ul>
      </div>
    </div>
    <Footer />
  </div>
</template>