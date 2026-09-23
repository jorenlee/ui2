<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from "vue";
import _ from "lodash";
import moment from "moment";

const display = ref("desktop");
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

// In-memory cache across client route transitions
const cachedNews = useState("blog_posting_content_cache", () => []);
const info = ref(cachedNews.value && cachedNews.value.length ? [...cachedNews.value] : []);
const loading = ref(info.value.length === 0);
const errorMsg = ref("");

// Immediate client-side sessionStorage check for 0ms instant display on repeat visits / reloads
if (process.client && info.value.length === 0) {
  try {
    const local = sessionStorage.getItem("lsu_blog_posting_cache");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        info.value = parsed;
        cachedNews.value = parsed;
        loading.value = false;
      }
    }
  } catch (e) {
    // sessionStorage unavailable
  }
}

// Carousel state
const currentSlide = ref(0);
const itemsPerSlide = ref(5); // Default for desktop
const isHovered = ref(false);
let autoScrollTimer = null;

const highlightedNews = computed(() => {
  const excludedFilters = [
    "bot",
    "programs",
    "organizational chart",
    "oer",
    "human resource center",
    "human resource",
    "hero carousel",
    "downloads",
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
  if (item.files && item.files.some((file) => isVideoFile(file))) {
    return true;
  }

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
  } else {
    currentSlide.value = 0; // Seamless loop to start
  }
};

const prevSlide = () => {
  if (canGoPrev.value) {
    currentSlide.value--;
  } else {
    currentSlide.value = Math.max(0, totalSlides.value - 1); // Seamless loop to end
  }
};

const goToFirst = () => {
  currentSlide.value = 0;
};

const goToLast = () => {
  currentSlide.value = Math.max(0, totalSlides.value - 1);
};

// Auto scroll timer (10 seconds interval)
const startAutoScroll = () => {
  stopAutoScroll();
  autoScrollTimer = setInterval(() => {
    if (!isHovered.value && totalSlides.value > 1) {
      nextSlide();
    }
  }, 10000);
};

const stopAutoScroll = () => {
  if (autoScrollTimer) {
    clearInterval(autoScrollTimer);
    autoScrollTimer = null;
  }
};

const visibleNews = computed(() => {
  const start = currentSlide.value * itemsPerSlide.value;
  const end = start + itemsPerSlide.value;
  return highlightedNews.value.slice(start, end);
});

// Safe image URL resolver
const getImageUrl = (item) => {
  if (!item?.files || !item.files.length) {
    return "https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png";
  }
  let file = item.files[0];
  if (typeof file === "object" && file !== null) {
    file = file.url || file.name || file.path || "";
  }
  if (typeof file === "string" && file.trim()) {
    if (file.startsWith("http://") || file.startsWith("https://")) {
      return file;
    }
    return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file.trim()}`;
  }
  return "https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png";
};

const handleImageError = (e) => {
  if (e.target.src !== "https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png") {
    e.target.src = "https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png";
  }
};

// Preconnect CDN domain for faster image connections
useHead({
  link: [
    { rel: 'preconnect', href: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com' },
    { rel: 'dns-prefetch', href: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com' }
  ]
});

// Background image preloader for instant slide transitions
const preloadImages = () => {
  if (!highlightedNews.value || !highlightedNews.value.length) return;

  // Preload default image
  const defaultImg = new Image();
  defaultImg.src = "https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png";

  // Preload all news thumbnails into browser HTTP cache
  highlightedNews.value.forEach((item) => {
    const url = getImageUrl(item);
    if (url) {
      const img = new Image();
      img.src = url;
    }
  });
};

// Reset to first slide when data is first loaded
watch(info, (newVal, oldVal) => {
  if (!oldVal || oldVal.length === 0) {
    currentSlide.value = 0;
  }
});

// Early setup-level fetch for faster initial load & SSR support
const { data: rawInfo, pending: fetchPending, error: fetchError } = useAsyncData(
  "blog-posting-content-fast",
  async () => {
    try {
      const res = await $fetch(
        `${endpoint.value}/api/cms/content/fast/?filters=published&exclude=bot,programs,organizational chart,oer,human resource center,human resource,hero carousel&limit=60`
      );
      return Array.isArray(res) ? res : [];
    } catch (fastError) {
      console.warn("Fast endpoint failed, falling back to list endpoint:", fastError);
      const fallback = await $fetch(`${endpoint.value}/api/cms/content/list/`);
      return Array.isArray(fallback) ? fallback : [];
    }
  },
  {
    lazy: true,
    default: () => (cachedNews.value && cachedNews.value.length ? cachedNews.value : []),
  }
);

// Synchronize fetched data into state and cache
watch(
  rawInfo,
  (newData) => {
    if (Array.isArray(newData) && newData.length > 0) {
      info.value = newData;
      cachedNews.value = newData;
      loading.value = false;
      preloadImages();
      if (process.client) {
        try {
          sessionStorage.setItem("lsu_blog_posting_cache", JSON.stringify(newData));
        } catch (e) {}
      }
    }
  },
  { immediate: true }
);

watch(fetchPending, (isPending) => {
  if (!isPending) {
    loading.value = false;
  }
});

watch(fetchError, (err) => {
  if (err && info.value.length === 0) {
    errorMsg.value = "Failed to load news & updates.";
    loading.value = false;
  }
});

onMounted(async () => {
  await nextTick();

  if (window.innerWidth < 800) {
    display.value = "mobile";
    itemsPerSlide.value = 2; // Show 2 items on mobile
  } else {
    itemsPerSlide.value = 5; // Show 5 items on desktop
  }

  if (info.value.length > 0) {
    preloadImages();
  }

  startAutoScroll();
});

onBeforeUnmount(() => {
  stopAutoScroll();
});
</script>

<template>
  <div class="w-full bg-[#ffffff] lg:pt-10 pb-5 py-5 relative">
    <!-- Background Image -->
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"></div>

    <!-- Content -->
    <div class="relative z-10 mx-auto">
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:mb-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 id="news-and-updates-title" class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            News & <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700">Updates</span>
          </h2>
          <p class="text-slate-500 text-xs sm:text-sm mt-1">Discover recent campus announcements, achievements, and
            stories.</p>
        </div>

        <a href="/news-updates"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs sm:text-sm rounded-xl border border-emerald-200/80 transition-colors shrink-0">
          <span>Explore All Articles</span>
          <i class="fas fa-arrow-right text-xs"></i>
        </a>
      </div>

      <!-- Skeleton Loading State (Fast fetch speed skeleton with zero layout shift) -->
      <div v-if="loading" class="lg:px-4 px-4">
        <!-- Desktop Skeleton Grid (5 Cards + Navigation Buttons) -->
        <div class="lg:flex hidden items-center gap-2">
          <!-- Left arrows skeleton placeholder -->
          <div class="flex flex-col gap-2 shrink-0">
            <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 shadow-sm animate-pulse flex items-center justify-center">
              <div class="w-3.5 h-3.5 rounded bg-slate-200"></div>
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 shadow-sm animate-pulse flex items-center justify-center">
              <div class="w-3.5 h-3.5 rounded bg-slate-200"></div>
            </div>
          </div>

          <!-- News Grid (desktop: 5 skeleton cards) -->
          <div class="grid grid-cols-5 gap-3 flex-1">
            <div
              v-for="n in 5"
              :key="'desktop-skel-' + n"
              class="bg-white border-2 border-green-50 shadow-lg overflow-hidden flex flex-col justify-between"
            >
              <!-- Card Image skeleton with shimmer -->
              <div class="relative overflow-hidden bg-slate-200 min-h-[160px] lg:min-h-[320px] skeleton-box">
                <div class="skeleton-shimmer"></div>
              </div>

              <!-- Card Content skeleton -->
              <div class="lg:p-3 p-2 flex flex-col justify-between flex-1">
                <!-- Badges skeleton -->
                <div class="flex items-center justify-between lg:mb-2 mb-1.5">
                  <div class="h-4 bg-slate-200 rounded-full w-20 relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                  <div class="flex gap-1">
                    <div class="h-4 w-4 bg-slate-200 rounded relative overflow-hidden skeleton-box">
                      <div class="skeleton-shimmer"></div>
                    </div>
                    <div class="h-4 w-4 bg-slate-200 rounded relative overflow-hidden skeleton-box">
                      <div class="skeleton-shimmer"></div>
                    </div>
                  </div>
                </div>

                <!-- Title skeleton -->
                <div class="space-y-1.5 lg:mb-2 mb-1">
                  <div class="h-4 bg-slate-300 rounded w-4/5 relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                  <div class="h-3.5 bg-slate-200 rounded w-3/5 relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                </div>

                <!-- Description skeleton -->
                <div class="space-y-1.5 mb-3 hidden sm:block">
                  <div class="h-2.5 bg-slate-100 rounded w-full relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                  <div class="h-2.5 bg-slate-100 rounded w-4/5 relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                </div>

                <!-- Footer skeleton -->
                <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div class="h-3 bg-slate-200 rounded w-20 relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                  <div class="h-3 bg-slate-200 rounded w-16 relative overflow-hidden skeleton-box">
                    <div class="skeleton-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right arrows skeleton placeholder -->
          <div class="flex flex-col gap-2 shrink-0">
            <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 shadow-sm animate-pulse flex items-center justify-center">
              <div class="w-3.5 h-3.5 rounded bg-slate-200"></div>
            </div>
            <div class="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/60 shadow-sm animate-pulse flex items-center justify-center">
              <div class="w-3.5 h-3.5 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>

        <!-- Mobile Skeleton Grid (2 Cards matching mobile view) -->
        <div class="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="n in 2"
            :key="'mobile-skel-' + n"
            class="bg-white border-2 border-green-50 shadow-lg overflow-hidden"
          >
            <div class="relative overflow-hidden bg-slate-200 min-h-[160px] skeleton-box">
              <div class="skeleton-shimmer"></div>
            </div>
            <div class="p-2 space-y-2">
              <div class="h-3.5 bg-slate-300 rounded w-3/4 relative overflow-hidden skeleton-box">
                <div class="skeleton-shimmer"></div>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                <div class="h-3 bg-slate-200 rounded w-20 relative overflow-hidden skeleton-box">
                  <div class="skeleton-shimmer"></div>
                </div>
                <div class="h-3 bg-slate-200 rounded w-14 relative overflow-hidden skeleton-box">
                  <div class="skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Carousel Container -->
      <div v-else-if="highlightedNews.length" class="lg:px-4 px-4" @mouseenter="isHovered = true"
        @mouseleave="isHovered = false">

        <!-- Desktop: flex row [<< <] [grid] [> >>] -->
        <div class="lg:flex hidden items-center gap-2">

          <!-- Left arrows: << and < stacked -->
          <div class="flex flex-col gap-2 shrink-0">
            <button @click="goToFirst"
              class="bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 border border-green-100"
             
              aria-label="First slide" title="First Slide">
              <i class="fas fa-angle-double-left"></i>
            </button>
            <button @click="prevSlide"
              class="bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 border border-green-100"
             
              aria-label="Previous slide" title="Previous Slide">
              <i class="fas fa-chevron-left"></i>
            </button>
          </div>

          <!-- News Grid (desktop) -->
          <div class="grid grid-cols-5 gap-3 transition-all duration-500 flex-1">
          <div v-for="(j, i) in visibleNews" :key="j.id || i"
            class="bg-white border-2 border-green-50 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <a :href="'news-updates/' + j.id" class="block">
              <!-- Image Section -->
              <div class="relative overflow-hidden bg-slate-100 min-h-[160px] lg:min-h-[320px]">
                <img :src="getImageUrl(j)"
                  class="w-full lg:h-[320px] h-auto object-cover transition-transform duration-300 hover:scale-110"
                  alt="News thumbnail" loading="eager" fetchpriority="high" decoding="async"
                  @error="handleImageError" />

                <!-- Play button overlay for videos -->
                <div v-if="hasVideoContent(j)"
                  class="absolute inset-0 flex items-center justify-center bg-[#ffffff] bg-opacity-30">
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
                    class="inline-block py-1 lg:text-xs text-[10px] rounded-full uppercase tracking-wide text-[#1d1d1d]">
                    <div class="whitespace-nowrap tracking-tighter font-semibold" v-for="(item, i) in j.filters
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
                      )" :key="i" :class="[
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
                        ]">
                      {{ item }}
                    </div>
                  </div>

                  <div class="flex items-center]">
                    <!-- SDG Badges -->
                    <span v-if="getSdgBadges(j).length" class="">
                      <span class="flex items-center flex-wrap gap-1">
                        <span v-for="badge in getSdgBadges(j).slice(0, 2)" :key="badge.number"
                          class="inline-flex items-center">
                          <span
                            class="inline-flex items-center px-1 py-0.5 min-w-4 justify-center rounded font-bold text-[#ffffff] shadow-sm text-[10px]"
                            :style="{ backgroundColor: badge.color }">
                            {{ badge.number }}
                          </span>
                        </span>
                        <span v-if="getSdgBadges(j).length > 2"
                          class="inline-flex items-center px-2 py-1 rounded font-medium bg-gray-200 text-gray-600 text-[10px]">
                          +{{ getSdgBadges(j).length - 2 }} more
                        </span>
                      </span>
                    </span>
                  </div>
                </div>

                <!-- Title -->
                <div class="flex items-center  lg:mb-2">
                  <h3 class="lg:text-sm text-xs font-bold text-[#1d1d1d] line-clamp-1 leading-0">
                    {{ j.title }}
                  </h3>

                </div>
                <!-- Description Preview -->
                <p v-if="j.descriptions"
                  class="lg:text-xs text-[10px] text-[#1d1d1d] mb-3 line-clamp-2 font-montserrat">
                  {{ j.descriptions.substring(0, 100)
                  }}{{ j.descriptions.length > 100 ? "..." : "" }}
                </p>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-2 lg:pb-0 pb-1 border-t border-gray-100">
                  <div class="flex items-center lg:text-xs text-[10px] text-[#1d1d1d]">
                    <i class="fas fa-calendar mr-1"></i>
                    {{ moment(j.date || j.created_at).format("MMM DD, YYYY") }}
                  </div>
                  <div class="flex items-center lg:text-xs text-[10px] text-[#1d1d1d] font-medium">
                    Read More
                    <i class="fas fa-arrow-right ml-1"></i>
                  </div>
                </div>
              </div>
            </a>
          </div><!-- end card item -->
        </div><!-- end desktop grid -->

          <!-- Right arrows: > and >> stacked -->
          <div class="flex flex-col gap-2 shrink-0">
            <button @click="nextSlide"
              class="bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 border border-green-100"
              aria-label="Next slide" title="Next Slide">
              <i class="fas fa-chevron-right"></i>
            </button>
            <button @click="goToLast"
              class="bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 border border-green-100"
              aria-label="Last slide" title="Last Slide">
              <i class="fas fa-angle-double-right"></i>
            </button>
          </div>

        </div><!-- end desktop flex row -->

        <!-- Mobile Grid -->
        <div class="lg:hidden grid grid-cols-1 gap-2 transition-all duration-500">
          <div v-for="(j, i) in visibleNews" :key="'mob-' + (j.id || i)"
            class="bg-white border-2 border-green-50 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
            <a :href="'news-updates/' + j.id" class="block">
              <div class="relative overflow-hidden bg-slate-100 min-h-[160px]">
                <img :src="getImageUrl(j)"
                  class="w-full h-auto object-cover"
                  alt="News thumbnail" loading="eager" @error="handleImageError" />
              </div>
              <div class="p-2">
                <h3 class="text-xs font-bold text-[#1d1d1d] line-clamp-1">{{ j.title }}</h3>
                <div class="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                  <span class="text-[10px] text-[#1d1d1d]">
                    <i class="fas fa-calendar mr-1"></i>{{ moment(j.date || j.created_at).format("MMM DD, YYYY") }}
                  </span>
                  <span class="text-[10px] text-[#1d1d1d] font-medium">Read More <i class="fas fa-arrow-right ml-1"></i></span>
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
      <div class="w-11/12 mx-auto lg:my-10 my-5" v-if="highlightedNews.length && !loading">
        <a href="/news-updates/list"
          class="group relative flex flex-col items-center justify-center w-full max-w-xs mx-auto px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <!-- Animated background effect -->
          <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

          <!-- Content -->
          <div class="relative z-10 flex items-center gap-x-5">
            <div class="lg:text-lg text-xs font-bold tracking-wide">
              View More News
              <!-- Animated icon -->
            </div>

            <div class="animate-bounce">
              <i class="fa fa-angle-double-down text-2xl mt-2" aria-hidden="true"></i>
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
/* Fast fetch skeleton shimmer effects */
.skeleton-box {
  background-color: #f1f5f9;
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.2s infinite ease-in-out;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

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
  background: radial-gradient(circle at center,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.8) 100%);
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
    /* Secondary gray shadows for floating effect */
    0 12px 24px rgba(128, 128, 128, 0.5),
    0 16px 32px rgba(128, 128, 128, 0.3),
    0 20px 40px rgba(128, 128, 128, 0.2),
    0 24px 48px rgba(128, 128, 128, 0.1),
    /* Subtle glow effect for prominence */
    0 0 10px rgba(255, 255, 255, 0.4),
    0 0 20px rgba(255, 255, 255, 0.2),
    0 0 30px rgba(255, 255, 255, 0.1),
    /* Sharp definition shadows for clarity */
    1px 1px 2px rgba(0, 0, 0, 0.9),
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
