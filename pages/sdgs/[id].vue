

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const id = route.params.id;

const sdgsCategory = [
  { title: "No Poverty", id: "no-poverty", color: "#ce3a43" },
  { title: "Zero Hunger", id: "zero-hunger", color: "#d4a850" },
  {
    title: "Good Health and Well-Being",
    id: "good-health-and-well-being",
    color: "#6a9e52",
  },
  { title: "Quality Education", id: "quality-education", color: "#b33335" },
  { title: "Gender Equality", id: "gender-equality", color: "#d84f39" },
  {
    title: "Clean Water and Sanitation",
    id: "clean-water-and-sanitation",
    color: "#6abbe1",
  },
  {
    title: "Affordable and Clean Energy",
    id: "affordable-and-clean-energy",
    color: "#f2c548",
  },
  {
    title: "Decent Work and Economic Growth",
    id: "decent-work-and-economic-growth",
    color: "#922a45",
  },
  {
    title: "Industry, Innovation, and Infrastructure",
    id: "industry-innovation-and-infrastructure",
    color: "#de723f",
  },
  {
    title: "Reduced Inequalities",
    id: "reduced-inequalities",
    color: "#c93281",
  },
  {
    title: "Sustainable Cities and Communities",
    id: "sustainable-cities-and-communities",
    color: "#e9a047",
  },
  {
    title: "Responsible Consumption and Production",
    id: "responsible-consumption-and-production",
    color: "#b78e40",
  },
  { title: "Climate Action", id: "climate-action", color: "#557d4c" },
  { title: "Life Below Water", id: "life-below-water", color: "#5394ce" },
  { title: "Life on Land", id: "life-on-land", color: "#7bb758" },
  {
    title: "Peace, Justice, and Strong Institutions",
    id: "peace-justice-and-strong-institutions",
    color: "#39689a",
  },
  {
    title: "Partnerships for the Goals",
    id: "partnerships-for-the-goals",
    color: "#294868",
  },
];

const sdg = sdgsCategory.find((s) => s.id === id);
if (!sdg) {
  throw createError({
    statusCode: 404,
    message: "SDG Not Found",
  });
}

// News fetching
const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// Get current SDG number for filtering
const currentSdgNumber = computed(() => {
  return sdgsCategory.indexOf(sdg) + 1;
});

// Add computed property for SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];
  
  const filters = item.filters.toLowerCase();
  const badges = [];
  
  // Check for SDG mentions
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `sdg${i}`,
      `sdg ${i}`,
      `sdg-${i}`,
      `sdg_${i}`,
      `goal ${i}`,
      `goal${i}`,
      `sdg${i.toString().padStart(2, '0')}`
    ];
    
    if (patterns.some(pattern => filters.includes(pattern))) {
      badges.push({ number: i });
    }
  }
  
  return badges;
};

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    const allItems = Array.isArray(res) ? res : [];
    
    // Filter items for current SDG
    const sdgNum = currentSdgNumber.value;
    info.value = allItems.filter(item => {
      if (!item?.filters) return false;
      const filters = item.filters.toLowerCase();
      
      // Check for various SDG formats
      const patterns = [
        `sdg${sdgNum}`,
        `sdg ${sdgNum}`,
        `sdg-${sdgNum}`,
        `sdg_${sdgNum}`,
        `goal ${sdgNum}`,
        `goal${sdgNum}`,
        `sdg${sdgNum.toString().padStart(2, '0')}`
      ];
      
      return patterns.some(pattern => filters.includes(pattern));
    });
    
    console.log(`Filtered ${info.value.length} items for SDG ${sdgNum}`);
  } catch (error) {
    console.error("Error fetching list:", error);
    errorMsg.value = "Failed to load news & updates.";
  } finally {
    loading.value = false;
  }

  await nextTick();
  if (window.innerWidth < 800) {
    display.value = "mobile";
  }
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <Header />

    <!-- Banner -->
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

    <!-- Layout -->
    <div class="lg:flex w-11/12 mx-auto py-5 gap-6">
      <!-- Side Menu -->

  
        <div class="shadow lg:w-3/12  bg-white">
          <div>
            <ul class="w-full">
              <li class="w-full">
                <span
                  class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 lg:text-base text-sm"
                >
                  Sustainable Development Goals
                </span>
                <ul>
                  <li v-for="(item, i) in sdgsCategory" :key="i">
                    <a
                      :href="`/sdgs/${item.id}`"
                      class="whitespace-nowrap lg:pr-2 items-center green-800-white px-2 py-3 font-bold flex border-b lg:pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                      :class="{ 'bg-green-200': item.id === sdg.id }"
                    >
                      <span class="px-3 font-bold"> {{ i + 1 }}</span>
                      {{ item.title }}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      

      <!-- SDG Content -->
      <main class="lg:w-3/4 w-full">
        <h1 class="text-3xl font-bold mb-4 text-center" :style="{ color: sdg.color }">
          {{ sdg.title }}
        </h1>

        <img
          :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${
            sdgsCategory.indexOf(sdg) + 1
          }.png`"
          class="w-44 mb-5 mx-auto"
        />

        <p class="text-lg text-gray-700 mb-10">
          <strong>{{ sdg.title }}</strong
          >
        </p>

         <div
    
        class="grid lg:grid-cols-4 grid-cols-2 justify-center lg:gap-x-8 gap-2 w-11/12 mx-auto"
      >
        <div
          v-for="(j, i) in info"
          :key="i"
          class="w-full shadow-green-900 rounded bg-white text-green-900 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
        >
          <a class="relative overflow-hidden" :href="'news-updates/' + j.id">
            <!-- Title -->
            <div
              class="lg:min-h-[70px] lg:px-3 lg:py-3 py-2 tracking-tighter leading-tight px-1 text-center font-semibold flex items-center justify-center lg:text-xs text-[9px]"
            >
              {{ j.title }}
            </div>
            
            <!-- SDG Badges -->
           
            <!-- Image -->
            <div class="border-t-4 border-t-[#ffffff] w-full">
              <img
                v-if="j.files && j.files.length > 0"
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${j.files[0]}`"
                class="w-full lg:h-[220px] transition-transform duration-500 hover:scale-110"
                alt="News thumbnail"
              />
              <div
                v-else
                class="w-full lg:h-[220px] bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <i class="fa fa-image text-4xl"></i>
              </div>
            </div>

             <div v-if="getSdgBadges(j).length" class="px-2 pb-2">
              <div class="flex flex-wrap gap-1 justify-center">
                <div v-for="badge in getSdgBadges(j)" :key="badge.number" class="inline-flex items-center">
                  <span 
                    class="inline-flex items-center px-0.5 py-1 rounded-full text-[8px] font-medium bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm"
                  >
                    <i class="fas fa-leaf mr-1"></i>
                    SDG {{ badge.number }}
                  </span>
                </div>
              </div>
            </div>

          </a>
        </div>
      </div>

        <p
          v-if="!info.length && !loading"
          class="text-center text-gray-400 mt-10"
        >
          {{ errorMsg || `No news available for ${sdg.title}.` }}
        </p>
      </main>
    </div>

    <Footer />
  </div>
</template>
