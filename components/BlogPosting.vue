<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import moment from "moment";

const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// Computed property to filter and sort highlighted news
const highlightedNews = computed(() => {
  return info.value
    .filter(item => {
      // Only show items that have "highlight" in the filters field
      if (!item?.filters) return false;
      return item.filters.toLowerCase().includes('highlight');
    })
    .sort((a, b) => {
      // Sort by date field (latest to oldest)
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
  <div class="w-full bg-[#ffffff] lg:pt-10 pb-5 py-5 relative">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
      style="
        background-image: url('https://lsu-media-styles.sgp1.digitaloceanspaces.com/481668685_1139543031299171_4009940609016510904_n.jpg');
      "
    ></div>
    <div class="absolute inset-0 bg-[#363636df]"></div>
    <!-- Dark overlay -->

    <!-- Content -->
    <div class="relative z-10 mx-auto">
      <div class="flex justify-between">
        <div class="lg:mb-8 mb-3 w-fit mx-auto">
          <!-- Title -->
          <h2
            class="text-left text-white lg:text-3xl text-xl font-bold tracking-wide drop-shadow-lg"
          >
            News and Updates
          </h2>
        </div>
      </div>

      <div
        v-if="highlightedNews.length"
        class="grid lg:grid-cols-4 grid-cols-2 justify-center lg:gap-x-8 gap-2 w-11/12 mx-auto"
      >
        <div
          v-for="(j, i) in highlightedNews.slice(0, 4)"
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
      <div v-else class="text-gray-400 py-10 w-11/12 mx-auto">No news posted yet.</div>

      <div class="w-11/12 mx-auto lg:mt-10 mt-5" v-if="highlightedNews.length">
        <a
          href="/news-updates"
          class="ml-auto mr-0 block w-fit whitespace-nowrap text-white text-lg rounded-xl mt-30 italic hover:font-bold hover:text-xl"
        >
          More
          <i class="fa fa-angle-double-right italic" aria-hidden="true"></i>
        </a>
      </div>
    </div>
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
