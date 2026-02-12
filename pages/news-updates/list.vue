<script setup>
import {
  ref,
  onMounted,
  nextTick,
  computed,
  watch,
  onBeforeUnmount,
} from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

// Filter states
const selectedSDG = ref("");
const selectedYear = ref("");
const selectedMonth = ref("");
const selectedType = ref("");

// Scroll to top button
const showScrollButton = ref(false);

const userStore = useUserStore();
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

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
  { value: "sdg17", label: "SDG 17 - Partnerships" },
]);

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

// Content Type filter
const contentTypeOptions = [
  { value: "", label: "All Contents" },
  { value: "news highlight", label: "News Highlight" },
  { value: "news", label: "News" },
  { value: "event", label: "Events" },
  { value: "announcement", label: "Announcements" },
];

const clearFilters = () => {
  selectedSDG.value = "";
  selectedYear.value = "";
  selectedMonth.value = "";
  selectedType.value = "";
};

// Reset page when filters change
const currentPage = ref(1);
watch([selectedSDG, selectedYear, selectedMonth, selectedType], () => {
  currentPage.value = 1;
});

// Helper function to get SDG color
const getSdgColor = (sdgNumber) => {
  return sdgColors[sdgNumber] || "#6b7280"; // Default gray if not found
};

// Get available years and months from data
const availableYears = computed(() => {
  const years = info.value
    .filter((item) => item.date)
    .map((item) => moment(item.date).year());
  return [...new Set(years)].sort((a, b) => b - a);
});

const availableMonths = computed(() => {
  if (!selectedYear.value) return [];
  const months = info.value
    .filter(
      (item) =>
        item.date && moment(item.date).year() === parseInt(selectedYear.value),
    )
    .map((item) => moment(item.date).month());
  return [...new Set(months)].sort((a, b) => a - b);
});

// Excluded filters and must be Published
const excludedFilters = [
  "bot",
  "programs",
  "organizational chart",
  "college",
  "oer",
];

// Filtered info based on all filters
const filteredInfo = computed(() => {
  let filtered = info.value;

  filtered = filtered.filter((item) => {
    if (!item?.filters) return false;

    const filters = item.filters.toLowerCase();

    // Must be published
    if (!filters.includes("published")) return false;

    // Exclude unwanted filters
    for (const excl of excludedFilters) {
      if (filters.includes(excl)) return false;
    }

    return true;
  });

  // Filter by SDG
  if (selectedSDG.value) {
    const selectedSdgNum = selectedSDG.value.replace("sdg", "");
    filtered = filtered.filter((item) => {
      const filters = item.filters.toLowerCase();
      const exactPatterns = [
        `sdg${selectedSdgNum}`,
        `sdg ${selectedSdgNum}`,
        `sdg-${selectedSdgNum}`,
        `sdg_${selectedSdgNum}`,
        `goal${selectedSdgNum}`,
        `goal ${selectedSdgNum}`,
        `sdg${selectedSdgNum.padStart(2, "0")}`,
      ];
      return exactPatterns.some(
        (pattern) => new RegExp(`\\b${pattern}\\b`, "i").test(filters),
      );
    });
  }

  // Filter by year
  if (selectedYear.value) {
    filtered = filtered.filter(
      (item) =>
        item.date &&
        moment(item.date).year() === parseInt(selectedYear.value),
    );
  }

  // Filter by month
  if (selectedMonth.value) {
    filtered = filtered.filter(
      (item) =>
        item.date &&
        moment(item.date).month() === parseInt(selectedMonth.value),
    );
  }

  // Filter by Content Type
  if (selectedType.value) {
    filtered = filtered.filter((item) => {
      const label = getCategoryLabel(item).toLowerCase();
      if (selectedType.value === "event") return label.includes("event");
      if (selectedType.value === "announcement")
        return label.includes("announcement");
      if (selectedType.value === "news highlight")
        return label.includes("news highlight");
      if (selectedType.value === "news") return label.includes("news");
      return true;
    });
  }

  // Sort latest to oldest
  return filtered.sort((a, b) => {
    const dateA = moment(a.date);
    const dateB = moment(b.date);
    if (!dateA.isValid() && !dateB.isValid()) return 0;
    if (!dateA.isValid()) return 1;
    if (!dateB.isValid()) return -1;
    return dateB.valueOf() - dateA.valueOf();
  });
});

// SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];
  const filters = item.filters.toLowerCase();
  const badges = [];
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
    if (patterns.some((pattern) => new RegExp(pattern, "i").test(filters))) {
      badges.push({ number: i, color: getSdgColor(i) });
    }
  }
  return badges;
};

// Helper functions for video detection
const hasVideoContent = (item) => {
  if (item.files && item.files.some((file) => isVideoFile(file))) return true;
  if (
    item.links &&
    item.links.some(
      (link) =>
        link.includes("youtube.com") ||
        link.includes("youtu.be") ||
        link.includes("facebook.com/reel"),
    )
  )
    return true;
  return false;
};

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

// Extract category label
const getCategoryLabel = (item) => {
  if (!item.filters) return "News";
  const filters = item.filters.toLowerCase();
  if (filters.includes("announcement")) return "Announcement";
  if (filters.includes("event")) return "Event";
  if (filters.includes("news highlight")) return "News Highlight";
  if (filters.includes("news")) return "News";
  const sdgMatches = filters.match(/sdg\d+/gi) || [];
  if (sdgMatches.length > 0)
    return `${sdgMatches.length} SDG${sdgMatches.length > 1 ? "s" : ""}`;
  return "News";
};

// Fetch data
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
  if (window.innerWidth < 800) display.value = "mobile";

  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Pagination
const itemsPerPage = 32;
const maxVisiblePages = 5;

const totalPages = computed(() =>
  Math.ceil(filteredInfo.value.length / itemsPerPage),
);

const paginatedInfo = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  return filteredInfo.value.slice(startIndex, startIndex + itemsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  let startPage = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2),
  );
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) pages.push(i);
  return pages;
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
                <a href="/cms/login" class="flex items-center w-fit mx-auto">
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
      <div class="w-full py-5 relative">
        <!-- Background Image -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        ></div>

        <!-- Dark overlay -->

        <!-- Content -->
        <div class="relative z-10 lg:px-10 mx-auto">
          <!-- Filters Section -->
          <div class="bg-white rounded-lg shadow-sm px-4 mb-3 pt-3 pb-2">
            <div class="lg:flex items-center gap-x-2">
              <!-- Month Filter -->
              <div class="w-full lg:mb-0 mb-3">
                <label class="block text-sm font-medium text-gray-700"
                  >Filter by Month</label
                >
                <select
                  v-model="selectedMonth"
                  :disabled="!selectedYear"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm disabled:bg-gray-100"
                >
                  <option value="">All Months</option>
                  <option
                    v-for="month in availableMonths"
                    :key="month"
                    :value="month"
                  >
                    {{ moment().month(month).format("MMMM") }}
                  </option>
                </select>
              </div>

              <!-- Year Filter -->
              <div class="w-full lg:mb-0 mb-3">
                <label class="block text-sm font-medium text-gray-700"
                  >Filter by Year</label
                >
                <select
                  v-model="selectedYear"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">All Years</option>
                  <option
                    v-for="year in availableYears"
                    :key="year"
                    :value="year"
                  >
                    {{ year }}
                  </option>
                </select>
              </div>

              <!-- SDG Filter -->
              <div class="w-full lg:mb-0 mb-3">
                <label class="block text-sm font-medium text-gray-700"
                  >Filter by SDG</label
                >
                <select
                  v-model="selectedSDG"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">All SDGs</option>
                  <option
                    v-for="sdg in sdgOptions"
                    :key="sdg.value"
                    :value="sdg.value"
                  >
                    {{ sdg.label }}
                  </option>
                </select>
              </div>

              <!-- Content Type Filter -->
              <div class="w-full lg:mb-0 mb-3">
                <label class="block text-sm font-medium text-gray-700">
                  Filter by Content Type
                </label>
                <select
                  v-model="selectedType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option
                    v-for="opt in contentTypeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </option>
                </select>
              </div>

              <!-- Clear Filters Button -->
              <div class="mt-5">
                <button
                  @click="clearFilters"
                  class="lg:w-fit w-full whitespace-nowrap px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                >
                  Clear Filters
                </button>
              </div>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="flex justify-center mt-[20px]">
                <div class="flex items-center space-x-1">
                  <!-- Previous Button -->
                  <button
                    :disabled="currentPage === 1"
                    @click="currentPage--"
                    class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors flex items-center"
                  >
                    <i class="fas fa-chevron-left mr-1"></i>
                    <span class="hidden sm:inline">Previous</span>
                  </button>

                  <!-- Page Numbers -->
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="currentPage = page"
                    class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    :class="
                      currentPage === page
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                    "
                  >
                    {{ page }}
                  </button>

                  <!-- Next Button -->
                  <button
                    :disabled="currentPage === totalPages"
                    @click="currentPage++"
                    class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors flex items-center"
                  >
                    <span class="hidden sm:inline">Next</span>
                    <i class="fas fa-chevron-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Results Count -->
            <div class="py-5 text-center text-sm text-gray-600">
              Showing {{ Math.min(itemsPerPage, paginatedInfo.length) }} of
              {{ filteredInfo.length }} news items
              <span v-if="totalPages > 1"
                >(Page {{ currentPage }} of {{ totalPages }})</span
              >
            </div>
          </div>

          <!-- Pagination Info -->
          <!-- <div
            v-if="totalPages > 1"
            class="text-center text-sm text-gray-500 mb-6"
          >
            Page {{ currentPage }} of {{ totalPages }} ({{
              filteredInfo.length
            }}
            total items)
          </div> -->

          <!-- News Cards -->
          <div
            v-if="paginatedInfo.length"
            class="grid lg:grid-cols-4 grid-cols-1 gap-6"
          >
            <div
              v-for="(j, i) in paginatedInfo"
              :key="j.id"
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
                      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png"
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
                  <!-- Category/Type Badge with Date -->
                  <div class="flex items-center justify-between mb-3">
                    <span
                      class="inline-block py-1 text-xs rounded-full uppercase tracking-wide font-light"
                    >
                      {{ getCategoryLabel(j) }}
                    </span>
                    <span class="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {{ moment(j.date || j.created_at).format("MMM DD") }}
                    </span>
                  </div>

                  <!-- Title -->
                  <h3
                    class="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight"
                  >
                    {{ j.title }}
                  </h3>

                  <!-- Description Preview -->
                  <p
                    v-if="j.descriptions"
                    class="text-sm text-gray-600 mb-3 line-clamp-3"
                  >
                    {{ j.descriptions.substring(0, 120)
                    }}{{ j.descriptions.length > 120 ? "..." : "" }}
                  </p>

                  <!-- SDG Badges -->
                  <div v-if="getSdgBadges(j).length" class="mb-3">
                    <div class="flex flex-wrap gap-1">
                      <div
                        v-for="badge in getSdgBadges(j).slice(0, 3)"
                        :key="badge.number"
                        class="inline-flex items-center"
                      >
                        <span
                          class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm"
                          :style="{ backgroundColor: badge.color }"
                        >
                          SDG {{ badge.number }}
                        </span>
                      </div>
                      <span
                        v-if="getSdgBadges(j).length > 3"
                        class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                      >
                        +{{ getSdgBadges(j).length - 3 }} more
                      </span>
                    </div>
                  </div>

                  <div>
                    <span
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
                        'uppercase font-bold inline-block px-2 py-1 rounded-full text-xs mr-2 mb-2',
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
                    </span>
                  </div>

                  <!-- Footer -->
                  <div
                    class="flex items-center justify-between pt-2 border-t border-gray-100"
                  >
                    <div class="flex items-center text-xs text-gray-500">
                      <i class="fas fa-calendar mr-1"></i>
                      {{
                        moment(j.date || j.created_at).format("MMMM DD, YYYY")
                      }}
                    </div>
                    <div
                      class="flex items-center text-xs text-green-600 font-medium"
                    >
                      Read More
                      <i class="fas fa-arrow-right ml-1"></i>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center mt-8 mb-6">
            <div class="flex items-center space-x-1">
              <!-- Previous Button -->
              <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors flex items-center"
              >
                <i class="fas fa-chevron-left mr-1"></i>
                <span class="hidden sm:inline">Previous</span>
              </button>

              <!-- Page Numbers -->
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="
                  currentPage === page
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                "
              >
                {{ page }}
              </button>

              <!-- Next Button -->
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors flex items-center"
              >
                <span class="hidden sm:inline">Next</span>
                <i class="fas fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>

          <!-- Pagination Info -->
          <div
            v-if="totalPages > 1"
            class="text-center text-sm text-gray-500 mb-6"
          >
            Page {{ currentPage }} of {{ totalPages }} ({{
              filteredInfo.length
            }}
            total items)
          </div>

          <!-- Empty State -->
          <div
            v-else-if="paginatedInfo.length === 0 && filteredInfo.length === 0"
            class="text-gray-400 py-10 text-center"
          >
            <div
              v-if="selectedSDG || selectedYear || selectedMonth"
              class="text-center py-12"
            >
              <div class="text-gray-500 text-lg">
                <i class="fa fa-search mb-4 text-4xl"></i>
                <p>No news found matching your filters.</p>
                <button
                  @click="clearFilters"
                  class="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            <div v-else>No news posted yet.</div>
          </div>
        </div>
      </div>
    </div>
    <Footer />

    <!-- Floating Scroll to Top Button -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-75 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-75 translate-y-4"
    >
      <button
        v-show="showScrollButton"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <i class="fas fa-chevron-up text-lg group-hover:animate-bounce"></i>
      </button>
    </Transition>
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
