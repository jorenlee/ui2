<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import moment from "moment";

const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

// Filter states
const selectedSDG = ref("");
const selectedYear = ref("");
const selectedMonth = ref("");

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// SDG options for filter
const sdgOptions = ref([
  { value: "sdg1", label: "SDG 1 - No Poverty" },
  { value: "sdg2", label: "SDG 2 - Zero Hunger" },
  { value: "sdg3", label: "SDG 3 - Good Health" },
  { value: "sdg4", label: "SDG 4 - Quality Education" },
  { value: "sdg5", label: "SDG 5 - Gender Equality" },
  { value: "sdg6", label: "SDG 6 - Clean Water" },
  { value: "sdg7", label: "SDG 7 - Affordable Energy" },
  { value: "sdg8", label: "SDG 8 - Decent Work" },
  { value: "sdg9", label: "SDG 9 - Industry Innovation" },
  { value: "sdg10", label: "SDG 10 - Reduced Inequalities" },
  { value: "sdg11", label: "SDG 11 - Sustainable Cities" },
  { value: "sdg12", label: "SDG 12 - Responsible Consumption" },
  { value: "sdg13", label: "SDG 13 - Climate Action" },
  { value: "sdg14", label: "SDG 14 - Life Below Water" },
  { value: "sdg15", label: "SDG 15 - Life on Land" },
  { value: "sdg16", label: "SDG 16 - Peace and Justice" },
  { value: "sdg17", label: "SDG 17 - Partnerships" }
]);

// Get available years and months from data
const availableYears = computed(() => {
  const years = info.value
    .filter(item => item.date) // Only items with date field
    .map(item => moment(item.date).year());
  return [...new Set(years)].sort((a, b) => b - a);
});

const availableMonths = computed(() => {
  if (!selectedYear.value) return [];
  const months = info.value
    .filter(item => item.date && moment(item.date).year() === parseInt(selectedYear.value))
    .map(item => moment(item.date).month());
  return [...new Set(months)].sort((a, b) => a - b);
});

// Filtered info based on selected filters
const filteredInfo = computed(() => {
  let filtered = info.value;

  // Filter by SDG
  if (selectedSDG.value) {
    filtered = filtered.filter(item => {
      if (!item.filters) return false;
      return item.filters.toLowerCase().includes(selectedSDG.value);
    });
  }

  // Filter by year (using date field)
  if (selectedYear.value) {
    filtered = filtered.filter(item => {
      if (!item.date) return false;
      return moment(item.date).year() === parseInt(selectedYear.value);
    });
  }

  // Filter by month (using date field)
  if (selectedMonth.value) {
    filtered = filtered.filter(item => {
      if (!item.date) return false;
      return moment(item.date).month() === parseInt(selectedMonth.value);
    });
  }

  // Sort by date field (latest to oldest)
  return filtered.sort((a, b) => {
    const dateA = moment(a.date);
    const dateB = moment(b.date);
    
    // Handle invalid dates by putting them at the end
    if (!dateA.isValid() && !dateB.isValid()) return 0;
    if (!dateA.isValid()) return 1;
    if (!dateB.isValid()) return -1;
    
    // Sort latest to oldest (descending)
    return dateB.valueOf() - dateA.valueOf();
  });
});

// Clear filters
const clearFilters = () => {
  selectedSDG.value = "";
  selectedYear.value = "";
  selectedMonth.value = "";
};

// Add computed property for SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];
  
  const filters = item.filters.toLowerCase();
  const badges = [];
  
  // Check for SDG mentions
  for (let i = 1; i <= 17; i++) {
    if (filters.includes(`sdg${i}`) || filters.includes(`sdg ${i}`)) {
      badges.push({ number: i });
    }
  }
  
  return badges;
};

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    // console.log("res", res);
    info.value = Array.isArray(res) ? res : [];
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
  <div class="bg-gray-50">
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
            New and Updates
          </h1>
        </div>

        <div class="shadow-lg text-green-700">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/new-updates" class="mx-2 hover:underline lg:h-10"
                  >News and Updates</a
                >
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white bg-white h-full">
              <div
                class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
              >
                <a
                  href="/cms/login"
                  class="flex items-center w-fit mx-auto"
                >
                  <i class="fa fa-user" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Contribute</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="w-full lg:py-10 py-5 relative">
        <!-- Background Image -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        ></div>

        <!-- Dark overlay -->

        <!-- Content -->
        <div class="relative z-10 lg:px-10 mx-auto">
          <!-- Filters Section -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6 w-11/12 mx-auto">
            <h3 class="text-lg font-semibold text-green-800 mb-4">Filter News & Updates</h3>
            
            <div class="grid lg:grid-cols-4 grid-cols-1 gap-4">
             

              <!-- Month Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
                <select 
                  v-model="selectedMonth" 
                  :disabled="!selectedYear"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">All Months</option>
                  <option v-for="month in availableMonths" :key="month" :value="month">
                    {{ moment().month(month).format('MMMM') }}
                  </option>
                </select>
              </div>


              
              <!-- Year Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Filter by Year</label>
                <select 
                  v-model="selectedYear" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">All Years</option>
                  <option v-for="year in availableYears" :key="year" :value="year">
                    {{ year }}
                  </option>
                </select>
              </div>


               <!-- SDG Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Filter by SDG</label>
                <select 
                  v-model="selectedSDG" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">All SDGs</option>
                  <option v-for="sdg in sdgOptions" :key="sdg.value" :value="sdg.value">
                    {{ sdg.label }}
                  </option>
                </select>
              </div>


              <!-- Clear Filters Button -->
              <div class="flex items-end">
                <button 
                  @click="clearFilters"
                  class="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            <!-- Results Count -->
            <div class="mt-4 text-sm text-gray-600">
              Showing {{ filteredInfo.length }} of {{ info.length }} news items
            </div>
          </div>

          <!-- News Cards -->
          <div
            v-if="filteredInfo.length"
            class="grid lg:grid-cols-4 grid-cols-2 justify-center lg:gap-x-8 gap-2 w-11/12 mx-auto"
          >
            <div
              v-for="(j, i) in filteredInfo"
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

          <!-- Empty State -->
          <div v-else class="text-gray-400 py-10">No news posted yet.</div>

          <!-- Pagination Dots -->
          <!-- <div class="flex justify-center gap-2 mt-6">
        <span
          v-for="n in 2"
          :key="n"
          class="w-3 h-3 rounded-full bg-green-700 opacity-50 hover:opacity-100 transition-opacity"
        ></span>
      </div> -->
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.bg {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.glass-effect {
  /* Glassmorphism effect */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);

  /* Floating effect */
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.glass-effect:hover {
  transform: translateY(-15px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* Modal Styles */
.modal-overlay {
  animation: modalFadeIn 0.3s ease-out;
}

.modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(5px);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Prevent body scroll when modal is open */
.modal-open {
  overflow: hidden;
}

/* Enhanced modal backdrop */
.modal-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  pointer-events: none;
}

/* Text stroke styles */
.font-peace-sans {
  font-family: "Peace Sans", "font-peace-sans", sans-serif;
}

.text-stroke-white {
  -webkit-text-stroke: 2px white;
  -webkit-text-fill-color: #ffffff;
  paint-order: stroke fill;
  text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white,
    1px 1px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white,
    2px 2px 0 white;
}

/* Custom text shadow for enhanced depth and floating effect */
.custom-text-shadow {
  text-shadow:
    /* Primary dark shadows for depth */ 0 4px 8px
      rgba(138, 125, 125, 0.8),
    0 6px 12px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.3),
    /* Secondary gray shadows for floating effect */ 0 12px 24px
      rgba(128, 128, 128, 0.5),
    0 16px 32px rgba(128, 128, 128, 0.3), 0 20px 40px rgba(128, 128, 128, 0.2),
    0 24px 48px rgba(128, 128, 128, 0.1),
    /* Subtle glow effect for prominence */ 0 0 10px rgba(255, 255, 255, 0.4),
    0 0 20px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1),
    /* Sharp definition shadows for clarity */ 1px 1px 2px rgba(0, 0, 0, 0.9),
    2px 2px 4px rgba(0, 0, 0, 0.8), 3px 3px 6px rgba(0, 0, 0, 0.6),
    4px 4px 8px rgba(0, 0, 0, 0.4);

  /* Additional effects */
  font-weight: 100 !important;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
}
</style>
