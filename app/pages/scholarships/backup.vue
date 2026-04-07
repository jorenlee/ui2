<script setup>
const arrayData = [
  [
    {
      image:
        "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/newsupdates/n1.jpg",
      link:
        "https://www.facebook.com/lsu.edu.ph/posts/pfbid02uqmtVSEBV2nu6qXkMcMJva1DbH5c3XXyvgu1qRZCRysNf2pFehnt3QPT2iGwUDzCl",
      highlight: false,
    },
    {
      image:
        "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/newsupdates/n2.png",
      link:
        "https://www.facebook.com/lsu.edu.ph/posts/pfbid0Cyv76mNwJA8DnyeuMnA45aQ6ahqr4vEYY3WfUvuSBgchJoYmkGmNVWaxoMvPUiTpl",
      highlight: false,
    },
    {
      image:
        "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/newsupdates/n3.png",
      link:
        "https://www.facebook.com/lsu.edu.ph/posts/pfbid02maZUk8T7oLcsao1y5VF7ThDGKYiCfgDLhVFsUqhVTq8UCCw5acJEtJP1a87KQkdwl",
      highlight: true,
    },
  ],
  [
    {
      image:
        "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/newsupdates/n1.jpg",
      link:
        "https://www.facebook.com/lsu.edu.ph/posts/pfbid02uqmtVSEBV2nu6qXkMcMJva1DbH5c3XXyvgu1qRZCRysNf2pFehnt3QPT2iGwUDzCl",
      highlight: true,
    },
    {
      image:
        "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/newsupdates/n2.png",
      link:
        "https://www.facebook.com/lsu.edu.ph/posts/pfbid0Cyv76mNwJA8DnyeuMnA45aQ6ahqr4vEYY3WfUvuSBgchJoYmkGmNVWaxoMvPUiTpl",
      highlight: false,
    },
    {
      image:
        "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/newsupdates/n3.png",
      link:
        "https://www.facebook.com/lsu.edu.ph/posts/pfbid02maZUk8T7oLcsao1y5VF7ThDGKYiCfgDLhVFsUqhVTq8UCCw5acJEtJP1a87KQkdwl",
      highlight: false,
    },
  ],
];
</script>

<template>
  <div>
    <Header />
    <div class="">
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
              scholarships
            </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/scholarships" class="mr-1"> scholarships </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="flex w-11/12 mx-auto py-10">
        <div class="w-3/12"></div>
        <div class="w-9/12 py-2">
          <div class="-m-1 flex flex-wrap md:-m-2">
            <div class="flex w-1/2 flex-wrap" v-for="(i, k) in arrayData" :key="k">
              <div
                class="p-1 md:p-2"
                :class="l.highlight ? 'w-full' : 'w-1/2'"
                v-for="(l, j) in i"
                :key="j"
              >
                <img
                  alt="gallery"
                  class="block h-full w-full rounded-lg object-cover object-center"
                  :src="l.image"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style></style>
