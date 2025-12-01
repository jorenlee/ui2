<script setup>
const sdgsCategory = [
  {
    title: "No Poverty",
    link: "/sdgs/no-poverty",
    color: "#ce3a43",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Zero Hunger",
    link: "/sdgs/zero-hunger",
    color: "#d4a850",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Good Health and Well-Being",
    link: "/sdgs/good-health-and-well-being",
    color: "#6a9e52",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Quality Education",
    link: "/sdgs/quality-education",
    color: "#b33335",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Gender Equality",
    link: "/sdgs/gender-equality",
    color: "#d84f39",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Clean Water and Sanitation",
    link: "/sdgs/clean-water-and-sanitation",
    color: "#6abbe1",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Affordable and Clean Energy",
    link: "/sdgs/affordable-and-clean-energy",
    color: "#f2c548",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Decent Work and Economic Growth",
    link: "/sdgs/decent-work-and-economic-growth",
    color: "#922a45",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Industry, Innovation, and Infrastructure",
    link: "/sdgs/industry-innovation-and-infrastructure",
    color: "#de723f",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Reduced Inequalities",
    link: "/sdgs/reduced-inequalities",
    color: "#c93281",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Sustainable Cities and Communities",
    link: "/sdgs/sustainable-cities-and-communities",
    color: "#e9a047",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Responsible Consumption and Production",
    link: "/sdgs/responsible-consumption-and-production",
    color: "#b78e40",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Climate Action",
    link: "/sdgs/climate-action",
    color: "#557d4c",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Life Below Water",
    link: "/sdgs/life-below-water",
    color: "#5394ce",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Life on Land",
    link: "/sdgs/life-on-land",
    color: "#7bb758",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Peace, Justice, and Strong Institutions",
    link: "/sdgs/peace-justice-and-strong-institutions",
    color: "#39689a",
    events: "",
    targets: "",
    activities: "",
  },
  {
    title: "Partnerships for the Goals",
    link: "/sdgs/partnerships-for-the-goals",
    color: "#294868",
    events: "",
    targets: "",
    activities: "",
  },
];
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
      <div class="absolute top-1/2 left-0 w-full text-center -translate-y-1/2 mt-5">
        <h1
          class="font-bold uppercase text-white lg:text-2xl text-lg  text-left w-11/12 mx-auto"
        >
          Sustainability
        </h1>
      </div>
      <div class="pt-2.5 pb-3 shadow-lg">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li><a href="/" class="mr-1">Home</a></li>
          <li>
            <i class="fas fa-caret-right mr-1"></i
            ><a href="/sdgs" class="mr-1">Sustainability</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Logos & Text -->
    <div class="w-fit mx-auto my-10">
      <div class="flex items-center gap-x-5">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
          class="w-80"
        />
        <div class="w-0.5 h-[200px] bg-black"></div>
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
          class="w-80"
        />
      </div>
      <div
        class="text-green-900 text-2xl text-center my-8 font-roboto font-semibold"
      >
        La Salle University supports the Sustainable Development Goals.
      </div>
    </div>

    <!-- SDGs Flip Cards -->
    <div class="flex justify-center px-2 lg:px-5 mx-auto mb-10">
      <ul class="grid grid-cols-9 gap-y-5">
        <li
          v-for="(j, i) in sdgsCategory"
          :key="i"
          class="flip-card w-[130px] h-[130px] mx-10"
        >
          <div class="flip-card-inner">
            <!-- Front -->
            <div
              class="flip-card-front w-full h-full flex items-center justify-center"
              :style="{ backgroundColor: j.color }"
            >
              <a :href="j.link" class="w-full h-full">
                <img
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${
                    i + 1
                  }.png`"
                  class="sdg-img"
                  :alt="j.title"
                />
              </a>
            </div>

            <!-- Back -->
            <div
              class="flip-card-back w-full h-full flex flex-col items-center justify-center text-center"
              :style="{ backgroundColor: j.color }"
            >
              <a :href="j.link" class="w-full h-full">
                <div class="text-white py-2 w-fit text-lg font-bold px-3">
                  Goal {{ i + 1 }}
                </div>
                <div
                  class="flex items-center justify-center text-white gap-x-2"
                >
                  <p class="text-sm font-semibold">
                    <span class="text-2xl">{{ j.events || "0" }}</span>
                    <span class="text-xs -mt-2 flex"> Event </span>
                  </p>
                  <p class="text-sm font-semibold">
                    <span class="text-2xl">{{ j.targets || "0" }}</span>
                    <span class="text-xs -mt-2 flex"> Target </span>
                  </p>

                  <p class="text-sm font-semibold">
                    <span class="text-2xl">{{ j.actions || "0" }}</span>
                    <span class="text-xs -mt-2 flex"> Actions </span>
                  </p>
                  <!-- <p class="text-sm font-semibold">
                     <span class="text-2xl">{{ j.activities || 'N/A' }}</span>
                    <span class="text-xs -mt-2 flex">
                  Publication
                </span> 
                  
                </p> -->
                </div>

                <div
                  class="w-fit ml-auto underline pt-3 text-white px-2 py-1 hover:font-bold"
                >
                  More Info
                </div>
              </a>
            </div>
          </div>
        </li>
      </ul>
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
  display: block;
  padding: 0;
  margin: 0;
}

.flip-card-back {
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
