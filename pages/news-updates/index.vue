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

// Scroll to top button
const showScrollButton = ref(false);

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

const selectedDate = ref(""); // YYYY-MM-DD

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
  1: "#e5243b", // No Poverty
  2: "#dda63a", // Zero Hunger
  3: "#4c9f38", // Good Health and Well-being
  4: "#c5192d", // Quality Education
  5: "#ff3a21", // Gender Equality
  6: "#26bde2", // Clean Water and Sanitation
  7: "#fcc30b", // Affordable and Clean Energy
  8: "#a21942", // Decent Work and Economic Growth
  9: "#fd6925", // Industry, Innovation and Infrastructure
  10: "#dd1367", // Reduced Inequalities
  11: "#fd9d24", // Sustainable Cities and Communities
  12: "#bf8b2e", // Responsible Consumption and Production
  13: "#3f7e44", // Climate Action
  14: "#0a97d9", // Life Below Water
  15: "#56c02b", // Life on Land
  16: "#00689d", // Peace, Justice and Strong Institutions
  17: "#19486a", // Partnerships for the Goals
};

// Helper function to get SDG color
const getSdgColor = (sdgNumber) => {
  return sdgColors[sdgNumber] || "#6b7280"; // Default gray if not found
};

const availableMonths = computed(() => {
  if (!selectedYear.value) return [];
  const months = info.value
    .filter(
      (item) =>
        item.date && moment(item.date).year() === parseInt(selectedYear.value)
    )
    .map((item) => moment(item.date).month());
  return [...new Set(months)].sort((a, b) => a - b);
});

const filteredInfo = computed(() => {
  let filtered = info.value;

  // SDG filter (unchanged)
  if (selectedSDG.value) {
    filtered = filtered.filter((item) => {
      if (!item.filters) return false;
      const filters = item.filters.toLowerCase();
      const selectedSdgNum = selectedSDG.value.replace("sdg", "");
      const exactPatterns = [
        `sdg${selectedSdgNum}`,
        `sdg ${selectedSdgNum}`,
        `sdg-${selectedSdgNum}`,
        `sdg_${selectedSdgNum}`,
        `goal${selectedSdgNum}`,
        `goal ${selectedSdgNum}`,
        `sdg${selectedSdgNum.padStart(2, "0")}`,
      ];
      return exactPatterns.some((p) =>
        new RegExp(`\\b${p}\\b`, "i").test(filters)
      );
    });
  }

  // Year
  if (selectedYear.value) {
    filtered = filtered.filter(
      (item) =>
        item.date && moment(item.date).year() === parseInt(selectedYear.value)
    );
  }

  // Month
  if (selectedMonth.value) {
    filtered = filtered.filter(
      (item) =>
        item.date && moment(item.date).month() === parseInt(selectedMonth.value)
    );
  }

  // 🔹 Exact Date (YYYY-MM-DD)
  if (selectedDate.value) {
    filtered = filtered.filter((item) => {
      if (!item.date) return false;
      return moment(item.date).format("YYYY-MM-DD") === selectedDate.value;
    });
  }

  return filtered.sort((a, b) => {
    const aD = moment(a.date);
    const bD = moment(b.date);
    if (!aD.isValid() && !bD.isValid()) return 0;
    if (!aD.isValid()) return 1;
    if (!bD.isValid()) return -1;
    return bD.valueOf() - aD.valueOf();
  });
});

// Clear filters
const clearFilters = () => {
  selectedSDG.value = "";
  selectedYear.value = "";
  selectedMonth.value = "";
  selectedDate.value = "";
};

watch([selectedSDG, selectedYear, selectedMonth, selectedDate], () => {
  currentPage.value = 1;
});

// Add computed property for SDG badges - exact matches only
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
        color: getSdgColor(i),
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
        link.includes("facebook.com/reel")
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

// Add helper function to extract category from filters or use default
const getCategoryLabel = (item) => {
  if (!item.filters) return "News";

  const filters = item.filters.toLowerCase();

  // Check for explicit category keywords first
  if (filters.includes("announcement")) return "Announcement";
  if (filters.includes("event")) return "Event";
  if (filters.includes("news highlight")) return "News Highlight";
  if (filters.includes("news")) return "News";

  // If only SDGs, count them and return SDG label
  const sdgMatches = filters.match(/sdg\d+/gi) || [];
  if (sdgMatches.length > 0) {
    return `${sdgMatches.length} SDG${sdgMatches.length > 1 ? "s" : ""}`;
  }

  return "News"; // Default fallback
};

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
  }

  // Add scroll event listener
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Pagination
const currentPage = ref(1);

// Group items by semantic sections using `filters` field
const groupedSections = computed(() => {
  const data = filteredInfo.value || [];
  const low = (s) => (s || "").toLowerCase();

  const isIn = (item, keywords) => {
    const f = low(item.filters);
    return keywords.some((kw) => f.includes(kw));
  };

  // helper: sort array by date descending (latest first)
  const sortByDateDesc = (arr) => {
    return (arr || []).slice().sort((a, b) => {
      const aD = moment(a?.date || a?.created_at);
      const bD = moment(b?.date || b?.created_at);
      if (!aD.isValid() && !bD.isValid()) return 0;
      if (!aD.isValid()) return 1;
      if (!bD.isValid()) return -1;
      return bD.valueOf() - aD.valueOf();
    });
  };

  const newsHighlight = sortByDateDesc(
    data.filter((i) => isIn(i, ["news highlight", "news-highlight"]))
  );
  const announcements = sortByDateDesc(
    data.filter((i) => isIn(i, ["announcement"]))
  );
  const research = sortByDateDesc(data.filter((i) => isIn(i, ["research"])));
  const sustainability = sortByDateDesc(
    data.filter((i) =>
      isIn(i, ["sustainability", "social action", "social-action"])
    )
  );
  const educational = sortByDateDesc(
    data.filter((i) =>
      isIn(i, [
        "educational",
        "technology",
        "tech",
        "npcc",
        "ict",
        "information and communications technology",
        "educational technology center",
      ])
    )
  );
  const library = sortByDateDesc(
    data.filter((i) => isIn(i, ["library", "learning resource"]))
  );

  return {
    newsHighlight,
    announcements,
    research,
    sustainability,
    educational,
    library,
  };
});

// Highlight carousel state: index + computed active item 🔧
const highlightIndex = ref(0);
const activeHighlight = computed(() => {
  const arr = groupedSections.value.newsHighlight || [];
  if (!arr.length) return null;
  if (highlightIndex.value >= arr.length) highlightIndex.value = 0;
  return arr[highlightIndex.value];
});

const setHighlightById = (id) => {
  const arr = groupedSections.value.newsHighlight || [];
  const idx = arr.findIndex((i) => i.id === id);
  if (idx >= 0) {
    highlightIndex.value = idx;
    // ensure the selected item is visible in the side list
    nextTick(() => scrollToActiveInSide());
  }
};

const nextHighlight = () => {
  const arr = groupedSections.value.newsHighlight || [];
  if (!arr.length) return;
  highlightIndex.value = (highlightIndex.value + 1) % arr.length;
};

const prevHighlight = () => {
  const arr = groupedSections.value.newsHighlight || [];
  if (!arr.length) return;
  highlightIndex.value = (highlightIndex.value - 1 + arr.length) % arr.length;
};

// Side list helpers
const sideListRef = ref(null);

// Show up to 3 cards that follow the active highlight (circular)
const visibleSideItems = computed(() => {
  const arr = groupedSections.value.newsHighlight || [];
  const len = arr.length;
  if (len <= 1) return [];
  const max = Math.min(3, len - 1); // don't repeat the active item
  const start = (highlightIndex.value + 1) % len;
  const out = [];
  for (let i = 0; i < max; i++) {
    out.push(arr[(start + i) % len]);
  }
  return out;
});

const scrollToActiveInSide = () => {
  const el = sideListRef.value;
  if (!el || !activeHighlight.value) return;
  const activeEl = el.querySelector(`[data-id="${activeHighlight.value.id}"]`);
  if (activeEl) {
    activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }

  // If active isn't currently in DOM (because visible items are neighbors), make the container scroll to top so the newly rendered neighbors are visible
  el.scrollTo({ top: 0, behavior: "smooth" });
};

const sidePrev = () => {
  prevHighlight();
  nextTick(() => scrollToActiveInSide());
};
const sideNext = () => {
  nextHighlight();
  nextTick(() => scrollToActiveInSide());
};

// fallback manual scroll helper (kept for completeness)
const scrollSide = (dir = 1) => {
  const el = sideListRef.value;
  if (!el) return;
  const amount = el.clientHeight || 300;
  el.scrollBy({ top: dir * (amount / 2), behavior: "smooth" });
};

// reset highlight when source list changes
watch(
  () => groupedSections.value.newsHighlight,
  (newList) => {
    if (!newList || !newList.length) {
      highlightIndex.value = 0;
    } else {
      if (highlightIndex.value >= newList.length) highlightIndex.value = 0;
    }
  }
);

// Reset page when filters change
watch([selectedSDG, selectedYear, selectedMonth], () => {
  currentPage.value = 1;
});
</script>

<template>
  <div class="">
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
                <a href="/news-updates" class="mx-2 hover:underline lg:h-10"
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

    <div class="lg:flex mx-auto">
      <div class="w-full lg:py-5 relative">
        <div class="relative z-10 px-2 mx-auto">
          <!-- Loading state -->
          <div v-if="loading" class="flex items-center justify-center py-20">
            <div class="flex flex-col items-center">
              <svg
                class="animate-spin h-10 w-10 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <div class="mt-4 text-green-600 font-medium">
                Loading news & updates...
              </div>
            </div>
          </div>

          <!-- GROUPED CONTENT -->
          <div v-else-if="filteredInfo.length">
            <!-- Top -->
            <div class="grid grid-cols-1 lg:grid-cols-6">
              <!-- Latest -->
              <div class="lg:col-span-4 bg-white lg:px-4">
                <h4
                  class="font-bold lg:text-xl text-sm lg:my-2 lg:text-left text-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
                >
                  Latest News Highlight
                </h4>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <!-- Side cards with up/down arrows -->
                  <div class="order-2 lg:order-1">
                    <div
                      ref="sideListRef"
                      class="overflow-y-hidden max-h-[100vh]"
                    >
                      <transition-group
                        name="slide"
                        tag="div"
                        class="flex flex-col gap-3"
                      >
                        <div
                          v-for="item in visibleSideItems"
                          :key="item.id"
                          :data-id="item.id"
                          :class="[
                            'group bg-white overflow-hidden border-b hover:shadow-md transition',
                            item.id === activeHighlight?.id
                              ? 'ring-2 ring-green-500'
                              : '',
                          ]"
                        >
                          <div
                            class="flex h-54 card-improved cursor-pointer py-[5px] px-1"
                            @click="setHighlightById(item.id)"
                          >
                            <div class="w-1/3 flex items-center">
                              <img
                                v-if="item.files && item.files.length"
                                :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${item.files[0]}`"
                                class="w-full h-full object-cover group-hover:scale-105 transition"
                              />
                            </div>
                            <div
                              class="px-2 w-2/3 flex flex-col justify-between pb-2"
                            >
                              <div>
                                <div class="text-xs text-gray-500">
                                  {{
                                    moment(item.date || item.created_at).format(
                                      "MMM DD"
                                    )
                                  }}
                                </div>
                                <div class="font-medium text-sm line-clamp-1">
                                  {{ item.title }}
                                </div>
                                <!-- Description -->
                                <div
                                  v-if="item.descriptions"
                                  class="text-xs text-gray-600 line-clamp-2 mb-5"
                                >
                                  {{ item.descriptions.substring(0, 120)
                                  }}{{
                                    item.descriptions.length > 120 ? "..." : ""
                                  }}
                                </div>
                              </div>
                              <div
                                class="flex items-center gap-1 flex-wrap mb-2"
                              >
                                <div
                                  v-for="badge in getSdgBadges(item).slice(
                                    0,
                                    3
                                  )"
                                  :key="badge.number"
                                  class="inline-flex items-center whitespace-nowrap text-[10px]"
                                >
                                  <span
                                    class="inline-flex items-center px-2 py-1 rounded font-bold text-white shadow-sm"
                                    :style="{ backgroundColor: badge.color }"
                                    >{{ badge.number }}</span
                                  >
                                </div>
                                <span
                                  v-if="getSdgBadges(item).length > 3"
                                  class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                                  >+{{
                                    getSdgBadges(item).length - 3
                                  }}
                                  more</span
                                >
                              </div>

                              <div>
                                <div
                                  class="flex items-center justify-between text-xs"
                                >
                                  <a
                                    :href="'/news-updates/' + item.id"
                                    @click.stop
                                    class="text-xs text-green-600 font-medium"
                                    >Read More
                                    <i class="fas fa-arrow-right ml-1"></i
                                  ></a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </transition-group>
                    </div>
                  </div>

                  <!-- Main highlight -->
                  <div class="order-1 lg:order-2 lg:col-span-2">
                    <div
                      v-if="activeHighlight"
                      class="group bg-white overflow-hidden border-b transition"
                    >
                      <div class="block cursor-pointer">
                        <div
                          class="relative h-48 sm:h-64 overflow-hidden card-improved"
                          @click="nextHighlight"
                        >
                          <img
                            v-if="activeHighlight.files?.length"
                            :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${activeHighlight.files[0]}`"
                            class="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div
                            class="absolute inset-0 bg-gradient-to-t from-green/10 to-transparent"
                          ></div>
                        </div>
                        <div class="lg:p-4">
                          <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-gray-400">
                              {{ getCategoryLabel(activeHighlight) }}
                            </div>
                            <div class="text-xs text-gray-400">
                              {{
                                moment(
                                  activeHighlight?.date ||
                                    activeHighlight?.created_at
                                ).format("MMM DD")
                              }}
                            </div>
                          </div>
                          <h3 class="lg:text-xl text-xs font-bold">
                            {{ activeHighlight?.title }}
                          </h3>
                          <!-- Description -->
                          <div
                            v-if="activeHighlight.descriptions"
                            class="lg:text-sm text-[10px] text-gray-600 line-clamp-3"
                          >
                            {{ activeHighlight.descriptions.substring(0, 300)
                            }}{{
                              activeHighlight.descriptions.length > 300
                                ? "..."
                                : ""
                            }}
                          </div>
                        </div>
                        <div
                          class="flex items-center gap-1 flex-wrap mb-2 lg:px-4 pt-2"
                        >
                          <div
                            v-for="badge in (
                              getSdgBadges(activeHighlight) || []
                            ).slice(0, 3)"
                            :key="badge.number"
                            class="inline-flex items-center whitespace-nowrap text-[10px]"
                          >
                            <span
                              class="inline-flex items-center px-2 py-1 rounded font-bold text-white shadow-sm"
                              :style="{ backgroundColor: badge.color }"
                            >
                              {{ badge.number }}
                            </span>
                          </div>

                          <span
                            v-if="
                              activeHighlight &&
                              getSdgBadges(activeHighlight).length > 3
                            "
                            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                          >
                            +{{ getSdgBadges(activeHighlight).length - 3 }} more
                          </span>
                        </div>
                      </div>
                      <div
                        class="lg:px-4 pb-4 flex items-center justify-between"
                      >
                        <a
                          :href="'/news-updates/' + activeHighlight.id"
                          class="text-xs text-green-600 font-medium"
                          >Read More <i class="fas fa-arrow-right ml-1"></i
                        ></a>
                        <div class="flex items-center gap-2">
                          <button
                            @click.stop.prevent="prevHighlight"
                            class="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white"
                          >
                            <i class="fas fa-chevron-left"></i>
                          </button>
                          <div class="flex items-center gap-2 px-2">
                            <button
                              v-for="(h, i) in groupedSections.newsHighlight"
                              :key="h.id"
                              @click="highlightIndex = i"
                              :class="[
                                'w-2 h-2 rounded-full',
                                i === highlightIndex
                                  ? 'bg-green-600'
                                  : 'bg-gray-300',
                              ]"
                            ></button>
                          </div>
                          <button
                            @click.stop.prevent="nextHighlight"
                            class="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white"
                          >
                            <i class="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500">
                      <div v-if="selectedDate">
                        No available for
                        {{ moment(selectedDate).format("MMMM DD, YYYY") }}.
                      </div>
                      <div v-else>No highlight available.</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Announcements -->
              <div class="lg:col-span-2 bg-white lg:px-4 lg:border-l">
                <h4
                  class="font-bold lg:text-xl text-sm lg:my-2 lg:text-left text-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
                >
                  Announcements
                </h4>
                <div
                  v-if="
                    groupedSections.announcements &&
                    groupedSections.announcements[0]
                  "
                  class="space-y-3"
                >
                  <div
                    v-for="a in (groupedSections.announcements || []).slice(
                      0,
                      3
                    )"
                    :key="a.id"
                    class="border-b p-3"
                  >
                    <div class="flex gap-3 h-32">
                      <!-- Image Section -->
                      <div
                        class="w-1/4 h-full overflow-hidden rounded-md flex-shrink-0"
                      >
                        <img
                          v-if="a.files?.length"
                          :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${a.files[0]}`"
                          class="w-full h-full object-cover"
                        />
                        <div
                          v-else
                          class="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400"
                        >
                          No Image
                        </div>
                      </div>

                      <!-- Content Section -->
                      <div class="flex-1 flex flex-col h-full">
                        <!-- Top Info: Category + Date -->
                        <div
                          class="flex items-start justify-between text-xs uppercase text-gray-600 font-medium mb-1"
                        >
                          <div>{{ getCategoryLabel(a) }}</div>
                          <div class="text-gray-400">
                            {{
                              moment(a.date || a.created_at).format("MMM DD")
                            }}
                          </div>
                        </div>

                        <!-- Title -->
                        <a
                          :href="'/news-updates/' + a.id"
                          class="block font-semibold lg:text-base text-xs text-gray-900 mb-1 line-clamp-2"
                        >
                          {{ a.title }}
                        </a>

                        <!-- SDG Badges Section -->
                        <div class="flex items-center gap-1 flex-wrap mb-2">
                          <div
                            v-for="badge in getSdgBadges(a).slice(0, 3)"
                            :key="badge.number"
                            class="inline-flex items-center whitespace-nowrap text-[10px]"
                          >
                            <span
                              class="inline-flex items-center px-2 py-1 rounded font-bold text-white shadow-sm"
                              :style="{ backgroundColor: badge.color }"
                            >
                              {{ badge.number }}
                            </span>
                          </div>

                          <span
                            v-if="getSdgBadges(a).length > 3"
                            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                          >
                            +{{ getSdgBadges(a).length - 3 }} more
                          </span>
                        </div>

                        <!-- Footer (sticks to bottom) -->
                        <div
                          class="mt-auto flex items-center justify-between pt-2 border-t border-gray-100"
                        >
                          <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-calendar mr-1"></i>
                            {{
                              moment(a.date || a.created_at).format(
                                "MMMM DD, YYYY"
                              )
                            }}
                          </div>
                          <div
                            class="flex items-center text-xs text-green-600 font-medium"
                          >
                            Read More <i class="fas fa-arrow-right ml-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">
                  <div v-if="selectedDate">
                    No available for
                    {{ moment(selectedDate).format("MMMM DD, YYYY") }}.
                  </div>
                  <div v-else>No announcements.</div>
                </div>
              </div>
            </div>

            <!-- Research & Sustainability -->
            <div class="lg:flex gap-x-2 border-y py-3 border-t-gray-300 mt-3">
              <div class="lg:w-4/12 w-full bg-white lg:p-4">
                <h4
                  class="font-bold lg:text-xl text-sm lg:my-2 lg:text-left text-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
                >
                  Research
                </h4>
                <div
                  class=""
                  v-if="groupedSections.research && groupedSections.research[0]"
                >
                  <div
                    v-for="r in (groupedSections.research || []).slice(0, 6)"
                    :key="r.id"
                    class="group overflow-hidden border-b hover:shadow-sm transition mb-3 card-improved"
                  >
                    <a :href="'/news-updates/' + r.id" class="block">
                      <div class="">
                        <div class="w-full lg:h-4/6 overflow-hidden">
                          <img
                            v-if="r.files?.length"
                            :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${r.files[0]}`"
                            class="w-full lg:h-4/6 h-full object-cover group-hover:scale-105 transition"
                          />
                          <div
                            v-else
                            class="w-full lg:h-4/6 h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400"
                          >
                            No Image
                          </div>
                        </div>
                        <div class="p-2 w-full flex flex-col justify-between">
                          <div
                            class="font-medium lg:text-sm text-xs mb-2 line-clamp-2"
                          >
                            {{ r.title }}
                          </div>
                          <div>
                            <div
                              class="flex whitespace-nowrap items-center gap-2 mb-2"
                            >
                              <div
                                v-for="badge in getSdgBadges(r).slice(0, 3)"
                                :key="badge.number"
                                class="inline-flex items-center"
                              >
                                <span
                                  class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm"
                                  :style="{ backgroundColor: badge.color }"
                                  >SDG {{ badge.number }}</span
                                >
                              </div>
                              <span
                                v-if="getSdgBadges(r).length > 3"
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                                >+{{ getSdgBadges(r).length - 3 }} more</span
                              >
                            </div>
                            <div class="flex items-center justify-between">
                              <div class="text-xs text-gray-400">
                                {{
                                  moment(r.date || r.created_at).format(
                                    "MMM DD"
                                  )
                                }}
                              </div>
                              <div class="text-xs text-green-600 font-medium">
                                Read More
                                <i class="fas fa-arrow-right ml-1"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                <div v-else class="text-sm text-gray-500">
                  <div v-if="selectedDate">
                    No available for
                    {{ moment(selectedDate).format("MMMM DD, YYYY") }}.
                  </div>
                </div>
              </div>

              <div class="w-full bg-white lg:p-4 lg:border-l lg:pl-5">
                <div>
                  <h4
                    class="font-bold lg:text-xl text-sm lg:my-2 lg:text-left text-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
                  >
                    Social Action
                  </h4>
                  <div
                    v-if="
                      groupedSections.sustainability &&
                      groupedSections.sustainability[0]
                    "
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    <div
                      v-for="s in (groupedSections.sustainability || []).slice(
                        0,
                        8
                      )"
                      :key="s.id"
                      class="group overflow-hidden border-b hover:shadow-sm transition card-improved"
                    >
                      <a
                        :href="'/news-updates/' + s.id"
                        class="block group rounded-lg overflow-hidden transition-shadow duration-300 bg-white"
                      >
                        <div class="flex h-44">
                          <!-- Image Section -->
                          <div class="w-6/12 h-full overflow-hidden">
                            <img
                              v-if="s.files?.length"
                              :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${s.files[0]}`"
                              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              alt="news image"
                            />
                            <div
                              v-else
                              class="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400"
                            >
                              No Image
                            </div>
                          </div>

                          <!-- Description Section -->
                          <div class="p-2 w-2/3 flex flex-col h-full">
                            <!-- Title -->
                            <div class="mb-2">
                              <div
                                class="lg:text-sm text-xs line-clamp-4 leading-tight text-gray-800 font-semibold"
                              >
                                {{ s.title }}
                              </div>
                            </div>

                            <!-- Spacer to push SDG + Footer to bottom -->
                            <div class="flex-1"></div>

                            <!-- SDG Badges Section -->
                            <div class="flex items-center gap-1 flex-wrap mb-2">
                              <div
                                v-for="badge in getSdgBadges(s).slice(0, 3)"
                                :key="badge.number"
                                class="inline-flex items-center whitespace-nowrap text-[10px]"
                              >
                                <span
                                  class="inline-flex items-center px-2 py-1 rounded font-bold text-white shadow-sm"
                                  :style="{ backgroundColor: badge.color }"
                                >
                                  {{ badge.number }}
                                </span>
                              </div>

                              <span
                                v-if="getSdgBadges(s).length > 3"
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                              >
                                +{{ getSdgBadges(s).length - 3 }} more
                              </span>
                            </div>

                            <!-- Footer (Date + Read More) -->
                            <div
                              class="flex items-center justify-between text-xs text-gray-500"
                            >
                              <div>
                                {{
                                  moment(s.date || s.created_at).format(
                                    "MMM DD"
                                  )
                                }}
                              </div>
                              <div
                                class="text-green-600 font-medium flex items-center gap-1"
                              >
                                Read More <i class="fas fa-arrow-right"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-500">
                    <div v-if="selectedDate">
                      No available for
                      {{ moment(selectedDate).format("MMMM DD, YYYY") }}.
                    </div>
                  </div>
                </div>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h4
                     class="w-full font-bold lg:text-xl text-sm lg:my-2 lg:text-left text-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
                  >
                      Learning Resource Center
                    </h4>
                  </div>
                  <div
                    v-if="groupedSections.library"
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                  >
                    <div
                      v-for="lib in (groupedSections.library || []).slice(0, 6)"
                      :key="lib.id"
                      class="group overflow-hidden border-b hover:shadow-sm transition card-improved"
                    >
                      <a
                        :href="'/news-updates/' + lib.id"
                        class="block group rounded-lg overflow-hidden transition-shadow duration-300 bg-white"
                      >
                        <div class="flex h-44">
                          <!-- Image Section -->
                          <div class="w-6/12 h-full overflow-hidden">
                            <img
                              v-if="lib.files?.length"
                              :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${lib.files[0]}`"
                              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              alt="library resource"
                            />
                            <div
                              v-else
                              class="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400"
                            >
                              No Image
                            </div>
                          </div>

                          <!-- Description Section -->
                          <div class="p-2 w-2/3 flex flex-col h-full">
                            <!-- Author -->
                            <div class="mb-1">
                              <div class="text-xs text-gray-500 font-medium">
                                Learning Resource Center
                              </div>
                            </div>

                            <!-- Title -->
                            <div class="mb-2">
                              <div
                                class="lg:text-sm text-xs line-clamp-3 leading-tight text-gray-800 font-semibold"
                              >
                                {{ lib.title }}
                              </div>
                            </div>

                            <!-- Spacer to push keywords + Footer to bottom -->
                            <div class="flex-1"></div>

                            <!-- SDG Badges Section -->
                            <div class="flex items-center gap-1 flex-wrap mb-2">
                              <div
                                v-for="badge in getSdgBadges(lib).slice(0, 3)"
                                :key="badge.number"
                                class="inline-flex items-center whitespace-nowrap text-[10px]"
                              >
                                <span
                                  class="inline-flex items-center px-2 py-1 rounded font-bold text-white shadow-sm"
                                  :style="{ backgroundColor: badge.color }"
                                >
                                  {{ badge.number }}
                                </span>
                              </div>

                              <span
                                v-if="getSdgBadges(lib).length > 3"
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                              >
                                +{{ getSdgBadges(lib).length - 3 }} more
                              </span>
                            </div>

                            <!-- Footer (Date + Read More) -->
                            <div
                              class="flex items-center justify-between text-xs text-gray-500"
                            >
                              <div>
                                {{
                                  moment(lib.date || lib.created_at).format(
                                    "MMM DD"
                                  )
                                }}
                              </div>
                              <div
                                class="text-green-600 font-medium flex items-center gap-1"
                              >
                                Read More <i class="fas fa-arrow-right"></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-500">
                    <div v-if="selectedDate">
                      No library resources available for
                      {{ moment(selectedDate).format("MMMM DD, YYYY") }}.
                    </div>
                    <div v-else>No library resources available.</div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Educational -->
            <div class="bg-white lg:p-4 border-b">
              <h4
                class="font-bold lg:text-xl text-sm lg:my-2 lg:text-left text-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
              >
                Educational and Technology
              </h4>
              <div
                class="grid lg:grid-cols-4 gap-4"
                v-if="
                  groupedSections.educational && groupedSections.educational[0]
                "
              >
                <div
                  v-for="e in (groupedSections.educational || []).slice(0, 8)"
                  :key="e.id"
                  class="group bg-white transition overflow-hidden flex flex-col h-full border-b"
                >
                  <a :href="'/news-updates/' + e.id" class="block h-full">
                    <!-- Image -->
                    <div class="h-28 relative overflow-hidden">
                      <img
                        v-if="e.files && e.files.length > 0"
                        :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${e.files[0]}`"
                        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
                        v-if="hasVideoContent(e)"
                        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30"
                      >
                        <div class="bg-red-600 rounded-full p-2 shadow-lg">
                          <i class="fas fa-play text-white text-sm ml-0.5"></i>
                        </div>
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="lg:p-3 pb-2 flex flex-col flex-1">
                      <!-- Title -->
                      <div
                        class="font-medium lg:text-sm text-[10px] line-clamp-2 my-1"
                      >
                        {{ e.title }}
                      </div>

                      <!-- Description -->
                      <div
                        v-if="e.descriptions"
                        class="lg:text-sm text-[9px] text-gray-600 line-clamp-3"
                      >
                        {{ e.descriptions.substring(0, 120)
                        }}{{ e.descriptions.length > 120 ? "..." : "" }}
                      </div>

                      <!-- Push everything below to bottom -->
                      <div class="mt-auto">
                        <!-- SDGs -->
                        <div
                          class="flex items-center lg:gap-2 gap-x-1 mt-3 mb-2 flex-wrap"
                        >
                          <div
                            v-for="badge in getSdgBadges(e).slice(0, 3)"
                            :key="badge.number"
                            class="inline-flex items-center"
                          >
                            <span
                              class="inline-flex items-center lg:px-2 px-1 py-1 rounded lg:text-xs text-[9px] min-w-5 font-bold text-white shadow-sm text-center justify-center"
                              :style="{ backgroundColor: badge.color }"
                            >
                              <span class="lg:flex hidden">SDG</span>
                              {{ badge.number }}
                            </span>
                          </div>
                          <span
                            v-if="getSdgBadges(e).length > 3"
                            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                          >
                            +{{ getSdgBadges(e).length - 3 }} more
                          </span>
                        </div>

                        <!-- Footer -->
                        <div class="flex items-center justify-between">
                          <div class="lg:text-xs text-[10px] text-gray-400">
                            {{
                              moment(e.date || e.created_at).format("MMM DD")
                            }}
                          </div>
                          <div
                            class="lg:text-xs text-[10px] text-green-600 font-medium"
                          >
                            Read More <i class="fas fa-arrow-right ml-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <div v-else class="text-sm text-gray-500">
                <div v-if="selectedDate">
                  No available for
                  {{ moment(selectedDate).format("MMMM DD, YYYY") }}.
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="bg-white rounded-xl mb-2 px-4 py-3">
              <div
                class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
              >
                <a
                  href="/news-updates/list"
                  class="text-sm text-green-600 hover:underline font-bold text-center flex w-full justify-center"
                >
                  View All
                </a>
              </div>
            </div>
          </div>
          <div v-else class="text-xs text-center text-gray-300">
            No news and updates posted yet.
          </div>
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

/* Card improvements for mobile/touch */
.card-improved {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.card-improved:active {
  transform: translateY(2px) scale(0.998);
}
.card-improved img {
  -webkit-user-drag: none;
  user-select: none;
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
