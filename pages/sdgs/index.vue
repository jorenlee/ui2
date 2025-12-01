<script setup>
    const sdgsCategory = [{
        title: "No Poverty",
        link: "/sdgs/no-poverty",
        icon: "",
        banner: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGs/1.jpg",
        description: "",
        color: "#ce3a43",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Zero Hunger",
        link: "/sdgs/zero-hunger",
        icon: "",
        banner: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGs/2.jpg",
        description: "",
        color: "#d4a850",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Good Health and Well-Being",
        link: "/sdgs/good-health-and-well-being",
        icon: "",
        description: "",
        color: "#6a9e52",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Quality Education",
        link: "/sdgs/quality-education",
        icon: "",
        description: "",
        color: "#b33335",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Gender Equality",
        link: "/sdgs/gender-equality",
        icon: "",
        description: "",
        color: "#d84f39",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Clean Water and Sanitation",
        link: "/sdgs/clean-water-and-sanitation",
        icon: "",
        description: "",
        color: "#6abbe1",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Affordable and Clean Energy",
        link: "/sdgs/affordable-and-clean-energy",
        icon: "",
        description: "",
        color: "#f2c548",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Decent Work and Economic Growth",
        link: "/sdgs/decent-work-and-economic-growth",
        icon: "",
        description: "",
        color: "#922a45",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Industry, Innovation, and Infrastructure",
        link: "/sdgs/industry-innovation-and-infrastructure",
        icon: "",
        description: "",
        color: "#de723f",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Reduced Inequalities",
        link: "/sdgs/reduced-inequalities",
        icon: "",
        description: "",
        color: "#c93281",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Sustainable Cities and Communities",
        link: "/sdgs/sustainable-cities-and-communities",
        icon: "",
        description: "",
        color: "#e9a047",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Responsible Consumption and Production",
        link: "/sdgs/responsible-consumption-and-production",
        icon: "",
        description: "",
        color: "#b78e40",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Climate Action",
        link: "/sdgs/climate-action",
        icon: "",
        description: "",
        color: "#557d4c",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Life Below Water",
        link: "/sdgs/life-below-water",
        icon: "",
        description: "",
        color: "#5394ce",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Life on Land",
        link: "/sdgs/life-on-land",
        icon: "",
        description: "",
        color: "#7bb758",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Peace, Justice, and Strong Institutions",
        link: "/sdgs/peace-justice-and-strong-institutions",
        icon: "",
        description: "",
        color: "#39689a",
        events: "",
        targets: "",
        activities: "",
    },
    {
        title: "Partnerships for the Goals",
        link: "/sdgs/partnerships-for-the-goals",
        icon: "",
        description: "",
        color: "#294868",
        events: "",
        targets: "",
        activities: "",
    }]
</script>

<template>
  <div class="bg-white">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div></div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            sustainability
            <!-- <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2024-2025</span> -->
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
              <a href="/sdgs" class="mr-1"> sustainability </a>
            </li>
            <!-- <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about-lsu" class="mr-1">  </a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>

    <!-- <div>
      <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSUOrganizationalChart.png" 
      class="lg:w-8/12 w-11/12 mx-auto my-5"/>
    </div> -->
    <div class="w-fit mx-auto my-10">
       <div class="flex items-center gap-x-5">
        <div class="">
         <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png" class="w-80"/>
       </div>
       <div class="flex w-0.5 h-[200px] bg-black">
        
       </div>
       <div>
        <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png" class="w-80"/>
       </div>
       </div>
       <div class=" text-green-900 text-2xl text-center my-8 font-roboto font-semibold">
        <p>La Salle University supports the Sustainable Development Goals.</p>
       </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- <div class="shadow lg:w-3/12 my-5 bg-white">
        <div>
          <ul class="w-full">
            <li class="w-full">
              <span
                class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base"
              >
                Category
              </span>
              <ul>
                <li class="" v-for="(j,i) in sdgsCategory">
  
                  <a
                    href="/about"
                    class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-2 font-bold flex border-b pl-5 hover:bg-green-800  hover:text-white text-xs cursor-pointer
                    bg-white text-green-700"
                    
                    >
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                   {{ i + 1 }} {{ j.title }}
                  </a>
                </li>
               
              </ul>
            </li>
          </ul>
        </div>
      </div> -->
      <div class="justify-center w-full mx-auto lg:my-5 my-3">
        <div>
          <ul class="grid grid-cols-9 gap-4 w-8/12 mx-auto">
            <li v-for="(j,i) in sdgsCategory" 
                class="w-full h-full border"
                :style="j.color"
                >
              <a :href="j.link" class="w-full h-full hover:opacity-70 hover:scale-125">
                <img :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${i+1}.png`" class="w-full h-full" />
              </a>
              <!-- <p class="text-center font-bold py-2 text-xs">{{ j.title }}</p> -->
              <p>{{ j.description }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
/* a {
    border: 1px solid #969696;
    border-bottom: none;
  }
  a:hover {
    border: 1px solid #969696;
    border-bottom: none;
    background: #00cc00;
    color: #000;
  }
  a.active {
    background: #005e00;
    color: white !important;
    border-color: none !important;
  } */
</style>
