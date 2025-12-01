<script setup>
const info = ref([
  {
    banner_image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/proquest.png",
    // description: "Search three databases containing scholarly journals, books, videos and audio, dissertation & theses, newspapers and more. Use this link, username and password to access ProQuest Central.",
    url: "https://search.proquest.com/",
    username: "DLSOZA",
    password: "Monday1!(case sensitive)",
  },
  {
    banner_image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/gale cengage.png",
    // description: "Gale provides hundreds of products, such as Gale Academic OneFile, Biography and Genealogy Master Index, General OneFile, General Reference Center, Sabin Americano (based on Sabin's Bibliotheca Americana) and World History Collections. Use this link and password to access Gale Cengage:",
    url: "http://infotrac.gale.com/itweb/phlsu",
    username: "LSUOZAMIZ",
    password: "almighty",
  },
  {
    banner_image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/pej.png",
    // description: "Philippine E-Journals (PEJ) provides searching 3 databases containing scholarly journals, books, videos & audio, dissertations & theses, newspapers & more. Use this link, username and password below to access the PEJ:",
    url: "https://ejournals.ph/",
    username: "lsuopej",
    password: "lsuopej",
  },
  {
    banner_image: "https://cdn.magzter.com/images/logo/magzter_logo_header.svg",
    // description: "",
    url: "https://www.magzter.com/",
    username: "N/A",
    password: "N/A",
  },
  {
    banner_image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/elsevier-non-solus-new-grey.png",
    description: "Science Direct",
    url: "https://www.sciencedirect.com/",
    username: "N/A",
    password: "N/A",
  },
]);
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
      <div>
        <div>
          <h2 class="font-bold text-center mb-5 mt-5 lasalle-green-text">
            Subscribed Electronic Resources
          </h2>
        </div>
        <div>
          <ul class="w-10/12 mx-auto gap-5 mb-5 grid lg:grid-cols-3">
            <li
              class="border border-[#34881f] text-lg w-full py-20 px-5"
              v-for="(i, index) in info"
            >
              <p class="flex items-center h-full">
                <a :href="i.url" class="font-bold break-words">
                  <img :src="i.banner_image" class="w-full h-auto" />
                </a>
              </p>

              <div class="w-full">
                <p
                  v-if="i.description"
                  class="text-center w-full font-bold"
                  :class="
                    i.description === 'Science Direct' ? 'text-orange-600' : ''
                  "
                >
                  {{ i.description }}
                </p>
                <p v-if="i.username !== 'N/A'">
                  Username: <a class="font-bold">{{ i.username }}</a>
                </p>
                <p v-if="i.username !== 'N/A'">
                  Password: <a class="font-bold">{{ i.password }}</a>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="text-center text-sm italic font-semibold text-gray-900 mb-10">
        <h1 class="text-green-600">"When in doubt, go to the library."</h1>
        <span>- J.K. Rowling</span>
      </div>
    </div>
    <Footer />
  </div>
</template>
