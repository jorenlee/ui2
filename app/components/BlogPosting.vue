<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import _ from "lodash";
import moment from "moment";

const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

// Carousel state
const currentSlide = ref(0);
const itemsPerSlide = ref(4); // Default for desktop

const highlightedNews = computed(() => {
  const excludedFilters = [
    "bot",
    "programs",
    "organizational chart",
    "college",
    "oer",
    "human resource center",
    "human resource",
  ];

  return info.value
    .filter((item) => {
      if (!item?.filters) return false;

      const filters = item.filters.toLowerCase();

      // must be Published
      if (!filters.includes("published")) return false;

      // exclude unwanted filters
      return !excludedFilters.some((word) => filters.includes(word));
    })
    .sort((a, b) => {
      const dateA = moment(a.date);
      const dateB = moment(b.date);

      if (!dateA.isValid() && !dateB.isValid()) return 0;
      if (!dateA.isValid()) return 1;
      if (!dateB.isValid()) return -1;

      // latest to oldest
      return dateB.valueOf() - dateA.valueOf();
    });
});

// SDG Colors mapping
const sdgColors = {
  1: "#e5243b",
  2: "#dda63a",
  3: "#4c9f38",
  4: "#c5192d",
  5: "#ff3a21",
  6: "#26bde2",
  7: "#fcc30b",
  8: "#a21942",
  9: "#fd6925",
  10: "#dd1367",
  11: "#fd9d24",
  12: "#bf8b2e",
  13: "#3f7e44",
  14: "#0a97d9",
  15: "#56c02b",
  16: "#00689d",
  17: "#19486a",
};

// Add computed property for SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];

  const filters = item.filters.toLowerCase();
  const badges = [];

  // Check for exact SDG mentions using word boundaries
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`,
      `\\bsdg ${i}\\b`,
      `\\bsdg-${i}\\b`,
      `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`,
      `\\bgoal${i}\\b`,
      `\\bsdg${i.toString().padStart(2, "0")}\\b`,
    ];

    if (
      patterns.some((pattern) => {
        const regex = new RegExp(pattern, "i");
        return regex.test(filters);
      })
    ) {
      badges.push({
        number: i,
        color: sdgColors[i] || "#6b7280",
      });
    }
  }

  return badges;
};

// Helper function to check if item has video content
const hasVideoContent = (item) => {
  // Check for video files
  if (item.files && item.files.some((file) => isVideoFile(file))) {
    return true;
  }

  // Check for video links
  if (
    item.links &&
    item.links.some(
      (link) =>
        link.includes("youtube.com") ||
        link.includes("youtu.be") ||
        link.includes("facebook.com/reel"),
    )
  ) {
    return true;
  }

  return false;
};

// Add helper function to extract category from filters or use default
const getCategoryLabel = (item) => {
  if (!item.filters) return "News";

  const filters = item.filters.toLowerCase();

  // Check for explicit category keywords first
  if (filters.includes("news highlight")) return "News Highlight";
  if (filters.includes("announcement")) return "Announcement";
  if (filters.includes("event")) return "Event";
  if (filters.includes("news")) return "News";
  // If only SDGs, count them and return SDG label
  const sdgMatches = filters.match(/sdg\d+/gi) || [];
  if (sdgMatches.length > 0) {
    return `${sdgMatches.length} SDG${sdgMatches.length > 1 ? "s" : ""}`;
  }

  return "News"; // Default fallback
};

// Helper function to check if file is video
const isVideoFile = (filename) => {
  const videoExtensions = [
    ".mp4",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".mkv",
  ];
  return videoExtensions.some((ext) => filename.toLowerCase().includes(ext));
};

// Carousel navigation functions
const totalSlides = computed(() => {
  return Math.ceil(highlightedNews.value.length / itemsPerSlide.value);
});

const canGoPrev = computed(() => currentSlide.value > 0);
const canGoNext = computed(() => currentSlide.value < totalSlides.value - 1);

const nextSlide = () => {
  if (canGoNext.value) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (canGoPrev.value) {
    currentSlide.value--;
  }
};

const visibleNews = computed(() => {
  const start = currentSlide.value * itemsPerSlide.value;
  const end = start + itemsPerSlide.value;
  return highlightedNews.value.slice(start, end);
});

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
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
    itemsPerSlide.value = 2; // Show 2 items on mobile
  } else {
    itemsPerSlide.value = 4; // Show 4 items on desktop
  }
});
</script>

<template>
  <div class="w-full bg-[#ffffff] lg:pt-10 pb-5 py-5 relative">
    <!-- Background Image -->
    <div
      class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
    ></div>
    <!-- style="
        background-image: url('https://lsu-media-styles.sgp1.digitaloceanspaces.com/481668685_1139543031299171_4009940609016510904_n.jpg');
      " -->
    <div class="absolute inset-0 bg-[#fffafadf]"></div>
    <!-- Dark overlay -->

    <!-- Content -->
    <div class="relative z-10 mx-auto">
      <div class="flex justify-between">
        <div class="lg:mb-8 mb-3 w-fit mx-auto">
          <!-- Title -->
          <h2
            class="text-left text-green-800 lg:text-3xl text-xl font-bold tracking-wide drop-shadow-lg"
          >
            News and Updates
          </h2>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center py-20 lg:w-11/12 mx-auto"
      >
        <div class="relative">
          <!-- Spinner -->
          <div
            class="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"
          ></div>
          <!-- Pulse effect -->
          <div
            class="absolute inset-0 w-16 h-16 border-4 border-green-300 rounded-full animate-ping opacity-20"
          ></div>
        </div>
        <p class="mt-6 text-green-700 font-semibold text-lg animate-pulse">
          Loading News & Updates...
        </p>
        <p class="mt-2 text-gray-500 text-sm">
          Please wait while we fetch the latest content
        </p>
      </div>

      <!-- Carousel Container -->
      <div
        v-else-if="highlightedNews.length"
        class="lg:px-10 px-2"
      >
        <!-- Left Arrow -->
        <button
          v-if="canGoPrev"
          @click="prevSlide"
          class="absolute lg:top-1/2 -top-3 lg:-translate-y-1/2 z-20 bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-12 h-12 flex items-center justify-center lg:shadow-xl transition-all duration-300 hover:scale-110 left-3"
          aria-label="Previous slide"
        >
          <i class="fas fa-chevron-left text-xl"></i>
        </button>

        <!-- Right Arrow -->
        <button
          v-if="canGoNext"
          @click="nextSlide"
          class="absolute lg:top-1/2 -top-3 lg:-translate-y-1/2 z-20 bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-12 h-12 flex items-center justify-center lg:shadow-xl transition-all duration-300 hover:scale-110 right-3"
          aria-label="Next slide"
        >
          <i class="fas fa-chevron-right text-xl"></i>
        </button>

        <!-- News Grid -->
        <div
          class="grid lg:grid-cols-4 grid-cols-1 lg:gap-3 gap-2 transition-all duration-500"
        >
          <div
            v-for="(j, i) in visibleNews"
            :key="j.id || i"
            class="bg-white border-2 rounded-lg border-green-50 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <a :href="'news-updates/' + j.id" class="block">
              <!-- Image Section -->
              <div class="relative overflow-hidden">
                <img
                  v-if="j.files && j.files.length > 0"
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${j.files[0]}`"
                  class="w-full lg:h-[300px] h-[100px] object-cover transition-transform duration-300 hover:scale-110"
                  alt="News thumbnail"
                />
                <div
                  v-else
                  class="w-full lg:h-[300px] h-[100px] bg-gray-200 flex items-center justify-center"
                >
                  <img
                    src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png"
                    class="w-full lg:h-[300px] h-[100px] object-cover"
                    alt="Default thumbnail"
                  />
                </div>

                <!-- Play button overlay for videos -->
                <div
                  v-if="hasVideoContent(j)"
                  class="absolute inset-0 flex items-center justify-center bg-[#ffffff] bg-opacity-30"
                >
                  <div class="bg-green-600 rounded-lg px-5 py-1 shadow-lg">
                    <i class="fas fa-play text-white text-xl ml-1"></i>
                  </div>
                </div>
              </div>

              <!-- Content Section -->
              <div class="lg:p-3 p-1">
                <!-- Category/Type Badge -->
                <div class="flex items-center justify-between lg:mb-1">
                  <div
                    class="inline-block py-1 lg:text-xs text-[10px] rounded-full uppercase tracking-wide text-[#1d1d1d]"
                  >
                    <div
                      class="whitespace-nowrap tracking-tighter font-semibold"
                      v-for="(item, i) in j.filters
                        .split(',')
                        .map((v) => v.trim())
                        .filter((v) =>
                          [
                            'announcements',
                            'news highlight',
                            'news',
                            'events',
                            'announcement',
                            'news highlights',
                            'news',
                            'event',
                          ].includes(v.toLowerCase()),
                        )"
                      :key="i"
                      :class="[
                        'capitalize text-[10px] inline-block px-2 py-1 rounded-full mr-2 mb-2',
                        item.toLowerCase() === 'announcements' &&
                          'bg-yellow-100 text-yellow-800',
                        item.toLowerCase() === 'news' &&
                          'bg-pink-100 text-pink-800',
                        item.toLowerCase() === 'news highlight' &&
                          'bg-red-100 text-red-800',
                        item.toLowerCase() === 'events' &&
                          'bg-green-100 text-green-800',
                        item.toLowerCase() === 'announcement' &&
                          'bg-yellow-100 text-yellow-800',
                        item.toLowerCase() === 'new' &&
                          'bg-pink-100 text-pink-800',
                        item.toLowerCase() === 'news highlights' &&
                          'bg-red-100 text-red-800',
                        item.toLowerCase() === 'event' &&
                          'bg-green-100 text-green-800',
                      ]"
                    >
                      {{ item }}
                    </div>
                  </div>

                  <div class="flex items-center]">
                    <!-- SDG Badges -->
                    <span v-if="getSdgBadges(j).length" class="">
                      <span class="flex items-center flex-wrap gap-1">
                        <span
                          v-for="badge in getSdgBadges(j).slice(0, 2)"
                          :key="badge.number"
                          class="inline-flex items-center"
                        >
                          <span
                            class="inline-flex items-center px-1 py-0.5 min-w-4 justify-center rounded font-bold text-[#ffffff] shadow-sm text-[10px]"
                            :style="{ backgroundColor: badge.color }"
                          >
                            {{ badge.number }}
                          </span>
                        </span>
                        <span
                          v-if="getSdgBadges(j).length > 2"
                          class="inline-flex items-center px-2 py-1 rounded font-medium bg-gray-200 text-gray-600 text-[10px]"
                        >
                          +{{ getSdgBadges(j).length - 2 }} more
                        </span>
                      </span>
                    </span>
                  </div>
                </div>

                <!-- Title -->
              <div class="flex items-center  lg:mb-2">
                  <h3
                  class="lg:text-sm text-xs font-bold text-[#1d1d1d] line-clamp-1 leading-0"
                >
                  {{ j.title }}
                </h3>

              </div>
                <!-- Description Preview -->
                <p
                  v-if="j.descriptions"
                  class="lg:text-xs text-[10px] text-[#1d1d1d] mb-3 line-clamp-2 font-montserrat"
                >
                  {{ j.descriptions.substring(0, 100)
                  }}{{ j.descriptions.length > 100 ? "..." : "" }}
                </p>

                <!-- Footer -->
                <div
                  class="flex items-center justify-between pt-2 lg:pb-0 pb-1 border-t border-gray-100"
                >
                  <div
                    class="flex items-center lg:text-xs text-[10px] text-[#1d1d1d]"
                  >
                    <i class="fas fa-calendar mr-1"></i>
                    {{ moment(j.date || j.created_at).format("MMM DD, YYYY") }}
                  </div>
                  <div
                    class="flex items-center lg:text-xs text-[10px] text-[#1d1d1d] font-medium"
                  >
                    Read More
                    <i class="fas fa-arrow-right ml-1"></i>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-gray-400 py-10 w-11/12 mx-auto">
        No news posted yet.
      </div>

      <!-- More Button -->
      <div
        class="w-11/12 mx-auto lg:mt-10 mt-5"
        v-if="highlightedNews.length && !loading"
      >
        <a
          href="/news-updates/list"
          class="group relative flex flex-col items-center justify-center w-full max-w-xs mx-auto px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          <!-- Animated background effect -->
          <div
            class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
          ></div>

          <!-- Content -->
          <div class="relative z-10 flex items-center gap-x-5">
            <div class="lg:text-lg text-xs font-bold tracking-wide">
              View More News
              <!-- Animated icon -->
            </div>

            <div class="animate-bounce">
              <i
                class="fa fa-angle-double-down text-2xl mt-2"
                aria-hidden="true"
              ></i>
            </div>
            <!-- <div class="flex items-center gap-2 text-sm font-medium opacity-90">
              <span>See all updates</span>
              <i class="fas fa-arrow-right group-hover:translate-x-1 transition-transform duration-300"></i>
        
            </div> -->
          </div>
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
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);

  /* Floating effect */
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.glass-effect:hover {
  transform: translateY(-15px);
  box-shadow:
    0 12px 40px 0 rgba(31, 38, 135, 0.5),
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
  text-shadow:
    -1px -1px 0 white,
    1px -1px 0 white,
    -1px 1px 0 white,
    1px 1px 0 white,
    -2px -2px 0 white,
    2px -2px 0 white,
    -2px 2px 0 white,
    2px 2px 0 white;
}

/* Custom text shadow for enhanced depth and floating effect */
.custom-text-shadow {
  text-shadow:
    /* Primary dark shadows for depth */
    0 4px 8px rgba(138, 125, 125, 0.8),
    0 6px 12px rgba(0, 0, 0, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.3),
    /* Secondary gray shadows for floating effect */ 0 12px 24px
      rgba(128, 128, 128, 0.5),
    0 16px 32px rgba(128, 128, 128, 0.3),
    0 20px 40px rgba(128, 128, 128, 0.2),
    0 24px 48px rgba(128, 128, 128, 0.1),
    /* Subtle glow effect for prominence */ 0 0 10px rgba(255, 255, 255, 0.4),
    0 0 20px rgba(255, 255, 255, 0.2),
    0 0 30px rgba(255, 255, 255, 0.1),
    /* Sharp definition shadows for clarity */ 1px 1px 2px rgba(0, 0, 0, 0.9),
    2px 2px 4px rgba(0, 0, 0, 0.8),
    3px 3px 6px rgba(0, 0, 0, 0.6),
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
