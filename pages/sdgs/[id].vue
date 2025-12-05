

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from 'moment';

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

// SDG Colors mapping
const sdgColors = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a"
};

// Add computed property for SDG badges - exact matches only
const getSdgBadges = (item) => {
  if (!item?.filters) return [];
  
  const filters = item.filters.toLowerCase();
  const badges = [];
  
  // Check for exact SDG mentions using word boundaries
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`, `\\bsdg ${i}\\b`, `\\bsdg-${i}\\b`, `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`, `\\bgoal${i}\\b`, `\\bsdg${i.toString().padStart(2, '0')}\\b`
    ];
    
    if (patterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(filters);
    })) {
      badges.push({ 
        number: i,
        color: sdgColors[i] || "#6b7280"
      });
    }
  }
  
  return badges;
};

// Helper function to check if item has video content
const hasVideoContent = (item) => {
  // Check for video files
  if (item.files && item.files.some(file => isVideoFile(file))) {
    return true;
  }
  
  // Check for video links
  if (item.links && item.links.some(link => 
    link.includes('youtube.com') || 
    link.includes('youtu.be') || 
    link.includes('facebook.com/reel')
  )) {
    return true;
  }
  
  return false;
};

// Helper function to check if file is video
const isVideoFile = (filename) => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  return videoExtensions.some(ext => filename.toLowerCase().includes(ext));
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
      
      // Check for exact SDG matches using word boundaries
      const patterns = [
        `\\bsdg${sdgNum}\\b`,
        `\\bsdg ${sdgNum}\\b`,
        `\\bsdg-${sdgNum}\\b`,
        `\\bsdg_${sdgNum}\\b`,
        `\\bgoal ${sdgNum}\\b`,
        `\\bgoal${sdgNum}\\b`,
        `\\bsdg${sdgNum.toString().padStart(2, '0')}\\b`
      ];
      
      return patterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(filters);
      });
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
        class="grid lg:grid-cols-3 grid-cols-2 justify-center lg:gap-x-8 gap-2 w-11/12 mx-auto"
      >
        <div
          v-for="(j, i) in info"
          :key="i"
          class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <a :href="'/news-updates/' + j.id" class="block">
            <!-- Image Section -->
            <div class="relative h-48 overflow-hidden">
              <img
                v-if="j.files && j.files.length > 0"
                :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${j.files[0]}`"
                class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                alt="News thumbnail"
              />
              <div
                v-else
                class="w-full h-full bg-gray-200 flex items-center justify-center"
              >
                <img 
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Default%20Img.jpg" 
                  class="w-full h-full object-cover"
                  alt="Default thumbnail"
                />
              </div>
            </div>

            <!-- Content Section -->
            <div class="p-4">
              <!-- Category/Type Badge -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-500 uppercase tracking-wide">
                  {{ j.category || 'News' }}
                </span>
                <span class="text-xs text-gray-400">
                  {{ moment(j.date || j.created_at).format("MMM DD") }}
                </span>
              </div>

              <!-- Title -->
              <h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                {{ j.title }}
              </h3>

              <!-- Description Preview -->
              <p 
                v-if="j.descriptions" 
                class="text-sm text-gray-600 mb-3 line-clamp-2"
              >
                {{ j.descriptions.substring(0, 100) }}{{ j.descriptions.length > 100 ? '...' : '' }}
              </p>

              <!-- SDG Badges -->
              <div v-if="getSdgBadges(j).length" class="mb-3">
                <div class="flex flex-wrap gap-1">
                  <div v-for="badge in getSdgBadges(j).slice(0, 2)" :key="badge.number" class="inline-flex items-center">
                    <span 
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm"
                      :style="{ backgroundColor: badge.color }"
                    >
                      SDG {{ badge.number }}
                    </span>
                  </div>
                  <span 
                    v-if="getSdgBadges(j).length > 2"
                    class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                  >
                    +{{ getSdgBadges(j).length - 2 }} more
                  </span>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex items-center text-xs text-gray-500">
                  <i class="fas fa-calendar mr-1"></i>
                  {{ moment(j.date || j.created_at).format("MMM DD, YYYY") }}
                </div>
                <div class="flex items-center text-xs text-green-600 font-medium">
                  Read More
                  <i class="fas fa-arrow-right ml-1"></i>
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

<style scoped>
/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
