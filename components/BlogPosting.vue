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

// SDG Colors mapping
const sdgColors = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a"
};

// Add computed property for SDG badges
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
        class="grid lg:grid-cols-4 grid-cols-1 gap-6 w-11/12 mx-auto"
      >
        <div
          v-for="(j, i) in highlightedNews.slice(0, 4)"
          :key="i"
          class="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
          <a :href="'news-updates/' + j.id" class="block">
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
              
              <!-- Play button overlay for videos -->
              <div 
                v-if="hasVideoContent(j)"
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
              >
                <div class="bg-red-600 rounded-full p-3 shadow-lg">
                  <i class="fas fa-play text-white text-xl ml-1"></i>
                </div>
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
