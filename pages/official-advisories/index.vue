<script setup>
const COA = ref(false)
const dummy = ref([
  {
    hoverImageBanner: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/official-advisories/427661988_886176246635852_4161646045530657217_n.jpg",
    link: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/official-advisories/427661988_886176246635852_4161646045530657217_n.jpg",
  },
])

</script>

<template>
  <div class="">
    <Header />
    <div class="">
      <div class="relative">
        <!-- <Banner /> -->
        <div class="bg-green-950 h-[150px]">
           
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Official Advisory
          </h1>
        </div>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex flex-wrap lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="#" class="mr-1"> Official Advisory </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a class="hover:underline mr-1" href="#"> A.Y 2023 - 2024 </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="h-full mb-10">
        <div class="">
            <h1
                class="text-center tracking-loose uppercase lg:mb-2 mt-5 mb-3 mx-auto font-bold w-11/12 lg:text-4xl leading-6 text-lg lg:pt-10 pt-4 text-green-800 lg:pb-1 pb-2">
                    Official Advisory
            </h1>
            <ul class="lg:gap-10 gap-2 lg:grid-cols-3 grid-cols-2 grid w-11/12 mx-auto">
                <li v-for="(v, i) in dummy" :key="i" class="shadow-xl border-4 border-white hover:border-green-900 hover:rounded-xl">
                    <a :href="v.link" target="_blank" class="hover:rounded-lg">
                        <img :src="v.hoverImageBanner" class="hover:rounded-lg"/>
                    </a>
                </li>
            </ul>
        </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.lasalle-green-header {
  background: #73f373;
}
</style>
