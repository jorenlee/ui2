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
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/about.jpg"
              class="align-top w-full h-auto lg:object-fill lg:block hidden"
            />
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
              class="align-top w-full h-36 object-none lg:hidden block"
            />
            <div class="absolute top-1/2 transform -translate-y-1/2 w-full">
              <h1
                class="flex items-center font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
              >
                Subscribed Electronic Resources
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
                  <a
                    href="/library/subrscribedElectronicResources"
                    class="mr-1"
                  >
                    Subscribed Electronic Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <LibraryElectronicResources />
    </div>
    <Footer />
  </div>
</template>
