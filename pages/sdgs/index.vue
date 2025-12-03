<script setup>
const sdgsCategory = [
  {
    title: "No Poverty",
    id: "no-poverty",
    color: "#ce3a43",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Zero Hunger",
    id: "zero-hunger",
    color: "#d4a850",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Good Health and Well-Being",
    id: "good-health-and-well-being",
    color: "#6a9e52",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Quality Education",
    id: "quality-education",
    color: "#b33335",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Gender Equality",
    id: "gender-equality",
    color: "#d84f39",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Clean Water and Sanitation",
    id: "clean-water-and-sanitation",
    color: "#6abbe1",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Affordable and Clean Energy",
    id: "affordable-and-clean-energy",
    color: "#f2c548",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Decent Work and Economic Growth",
    id: "decent-work-and-economic-growth",
    color: "#922a45",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Industry, Innovation, and Infrastructure",
    id: "industry-innovation-and-infrastructure",
    color: "#de723f",
    events: "",
    targets: "",
    actions: "",
     category: "Economy"
  },
  {
    title: "Reduced Inequalities",
    id: "reduced-inequalities",
    color: "#c93281",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Sustainable Cities and Communities",
    id: "sustainable-cities-and-communities",
    color: "#e9a047",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Responsible Consumption and Production",
    id: "responsible-consumption-and-production",
    color: "#b78e40",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Climate Action",
    id: "climate-action",
    color: "#557d4c",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Life Below Water",
    id: "life-below-water",
    color: "#5394ce",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Life on Land",
    id: "life-on-land",
    color: "#7bb758",
    events: "",
    targets: "",
    actions: "",
     category: "Biosphere"
  },
  {
    title: "Peace, Justice, and Strong Institutions",
    id: "peace-justice-and-strong-institutions",
    color: "#39689a",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Partnerships for the Goals",
    id: "partnerships-for-the-goals",
    color: "#294868",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
];


const categorySelection = ref("Economy");
</script>

<template>
  <div class="bg-white min-h-screen">
    <Header />

    <!-- Banner Section -->
    <div class="relative">
      <Banner />
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="align-top w-full h-36 object-cover lg:hidden block"
      />
      <div
        class="absolute top-1/2 left-0 w-full text-center -translate-y-1/2 mt-5"
      >
        <h1
          class="font-bold uppercase text-white lg:text-2xl text-lg text-left w-11/12 mx-auto"
        >
          Sustainability
        </h1>
      </div>
      <div class="pt-2.5 pb-3 shadow-lg">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li><a href="/" class="mr-1">Home</a></li>
          <li>
            <i class="fas fa-caret-right mr-1"></i
            ><a href="/sdgs">Sustainability</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Logos -->
    <div class="w-11/12 mx-auto py-2">
      <div class="lg:flex items-center gap-x-5 w-fit mx-auto">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
          class="lg:w-52 w-32 mx-auto"
        />
        <div class="w-0.5 h-[130px] bg-black lg:flex hidden"></div>
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
          class="lg:w-52 w-52 lg:py-0 py-2"
        />
      </div>

      <div
        class="text-green-900 lg:text-2xl text-sm text-center lg:mt-2 mb-3 font-roboto font-semibold w-10/12 mx-auto"
      >
        La Salle University supports the Sustainable Development Goals.
      </div>
    </div>

    <div>
      <!-- <div>
        <ul class="w-11/12 mx-auto flex mb-10 gap-x-3">
          <li
            class="w-6/12 mx-auto rounded-lg bg-green-900 text-white py-3 text-center"
          >
            Dimensions
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-green-900 text-white py-3 text-center"
          >
            Areas / Domains
          </li>

          <li
            class="w-6/12 mx-auto rounded-lg bg-green-900 text-white py-3 text-center"
          >
            Levels
          </li>
        </ul>
      </div> -->


      <!-- Areas and Domains -->
      <!-- <div>
        <ul class="w-11/12 mx-auto flex mb-10 gap-x-3">
          <li
            class="w-6/12 mx-auto rounded-lg bg-yellow-600 text-white py-3 text-center"
          >
            People
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-yellow-600 text-white py-3 text-center"
          >
            Planet
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-yellow-600 text-white py-3 text-center"
          >
            Prosperity
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-yellow-600 text-white py-3 text-center"
          >
            Peace
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-yellow-600 text-white py-3 text-center"
          >
            Partnerships
          </li>
        </ul>
      </div> -->
      <!-- Levels -->
      <!-- <div>
        <ul class="w-11/12 mx-auto flex mb-10 gap-x-3">
          <li
            class="w-6/12 mx-auto rounded-lg bg-red-600 text-white py-3 text-center"
          >
            Global
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-red-600 text-white py-3 text-center"
          >
            National
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-red-600 text-white py-3 text-center"
          >
            Local
          </li>
          <li
            class="w-6/12 mx-auto rounded-lg bg-red-600 text-white py-3 text-center"
          >
            Institutional
          </li>
        </ul>
      </div> -->
    </div>

    
      <!-- Dimensions -->
      <div>
        <ul class="flex">
          <li
            class="lg:w-6/12 w-full mx-auto uppercase cursor-pointer  hover:bg-white bg-blue-400 hover:text-blue-600 border border-blue-300 shadow-lg text-white py-1 text-center"
            :class="categorySelection === 'Economy' ? 'underline': ''"
            @click="categorySelection = 'Economy'"
          >
            Economy
          </li>
          <li
            class="lg:w-6/12 w-full mx-auto uppercase cursor-pointer  hover:bg-white bg-blue-400 hover:text-blue-600 border border-blue-300 shadow-lg text-white py-1 text-center"
             :class="categorySelection === 'Society' ? 'underline': ''"
             @click="categorySelection = 'Society'"
          >
            Society
          </li>

          <li
            class="lg:w-6/12 w-full mx-auto uppercase cursor-pointer  hover:bg-white bg-blue-400 hover:text-blue-600 border border-blue-300 shadow-lg text-white py-1 text-center"
             :class="categorySelection === 'Biosphere' ? 'underline': ''"
             @click="categorySelection = 'Biosphere'"
          >
            Biosphere
          </li>
        </ul>
      </div>

<div class="w-full bg-blue-50 py-10">
  <!-- SDGs Flip Cards -->
    <div class="lg:flex justify-center px-2 lg:px-5 mx-auto gap-x-2 w-fit ">
      <ul class="grid lg:grid-cols-6 grid-cols-3 gap-y-5 gap-x-2">
        <li
          v-for="(j, i) in sdgsCategory"
          :key="i"
          class="flip-card w-[130px] h-[130px] lg:mx-3 mx-auto"
          :class="j.category === categorySelection ? '':'hidden'"
        >
          <div class="flip-card-inner">
            <!-- Front -->
            <div
              class="flip-card-front w-full h-full flex items-center justify-center"
              :style="{ backgroundColor: j.color }"
            >
              <NuxtLink :to="`/sdgs/${j.id}`" class="w-full h-full">
                <img
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${
                    i + 1
                  }.png`"
                  class="sdg-img"
                />
              </NuxtLink>
            </div>

            <!-- Back -->
            <div
              class="flip-card-back w-full h-full flex flex-col items-center justify-center text-center"
              :style="{ backgroundColor: j.color }"
            >
              <NuxtLink :to="`/sdgs/${j.id}`" class="w-full h-full">
                <div class="text-white py-2 text-lg font-bold">
                  Goal {{ i + 1 }}
                </div>

                <div
                  class="flex items-center justify-center text-white gap-x-2"
                >
                  <p class="text-sm font-semibold">
                    <span class="text-2xl">{{ j.events || "0" }}</span>
                    <span class="text-xs flex">Event</span>
                  </p>
                  <p class="text-sm font-semibold">
                    <span class="text-2xl">{{ j.targets || "0" }}</span>
                    <span class="text-xs flex">Target</span>
                  </p>
                  <p class="text-sm font-semibold">
                    <span class="text-2xl">{{ j.actions || "0" }}</span>
                    <span class="text-xs flex">Actions</span>
                  </p>
                </div>

                <div
                  class="w-fit ml-auto underline pt-3 text-white px-2 py-1 hover:font-bold"
                >
                  More Info
                </div>
              </NuxtLink>
            </div>
          </div>
        </li>
      </ul>
    </div>

</div>

  
    <div>

    </div>

    <Footer />
  </div>
</template>

<style scoped>
.flip-card {
  perspective: 1000px;
}
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}
.sdg-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.flip-card-back {
  transform: rotateY(180deg);
}
</style>
