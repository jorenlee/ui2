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

// Filtered info based on selected filters
const filteredInfo = computed(() => {
  let filtered = info.value;

  // Filter by SDG - exact match only
  if (selectedSDG.value) {
    filtered = filtered.filter((item) => {
      if (!item.filters) return false;
      const filters = item.filters.toLowerCase();

      // Extract SDG number from selectedSDG (e.g., "sdg1" -> "1")
      const selectedSdgNum = selectedSDG.value.replace("sdg", "");

      // Check for exact SDG matches only
      const exactPatterns = [
        `sdg${selectedSdgNum}`,
        `sdg ${selectedSdgNum}`,
        `sdg-${selectedSdgNum}`,
        `sdg_${selectedSdgNum}`,
        `goal${selectedSdgNum}`,
        `goal ${selectedSdgNum}`,
        `sdg${selectedSdgNum.padStart(2, "0")}`,
      ];

      return exactPatterns.some((pattern) => {
        // Use word boundaries to ensure exact matches
        const regex = new RegExp(`\\b${pattern}\\b`, "i");
        return regex.test(filters);
      });
    });
  }

  // Filter by year (using date field)
  if (selectedYear.value) {
    filtered = filtered.filter((item) => {
      if (!item.date) return false;
      return moment(item.date).year() === parseInt(selectedYear.value);
    });
  }

  // Filter by month (using date field)
  if (selectedMonth.value) {
    filtered = filtered.filter((item) => {
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
const itemsPerPage = 32;

// Group items by semantic sections using `filters` field
const groupedSections = computed(() => {
  const data = filteredInfo.value || [];
  const low = (s) => (s || "").toLowerCase();

  const isIn = (item, keywords) => {
    const f = low(item.filters);
    return keywords.some((kw) => f.includes(kw));
  };

  return {
    newsHighlight: data.filter((i) =>
      isIn(i, ["news highlight", "news-highlight"])
    ),
    announcements: data.filter((i) => isIn(i, ["announcement"])),
    research: data.filter((i) => isIn(i, ["research"])),
    sustainability: data.filter((i) =>
      isIn(i, ["sustainability", "social action", "social-action"])
    ),
    educational: data.filter((i) =>
      isIn(i, ["educational", "technology", "tech", "npcc"])
    ),
    others: data.filter((i) => {
      const f = low(i.filters);
      return !(
        f.includes("news highlight") ||
        f.includes("news-highlight") ||
        f.includes("announcement") ||
        f.includes("research") ||
        f.includes("sustainability") ||
        f.includes("social action") ||
        f.includes("educational") ||
        f.includes("technology") ||
        f.includes("tech") ||
        f.includes("npcc")
      );
    }),
  };
});

// Reset page when filters change
watch([selectedSDG, selectedYear, selectedMonth], () => {
  currentPage.value = 1;
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
        <div class="relative z-10 lg:px-10 mx-auto">
          <!-- Filters -->
          <div class="bg-white rounded-lg shadow-sm px-4 mb-3 pt-3 pb-2">
            <div class="lg:flex items-center gap-x-2">
              <div class="w-full flex">
                <div class="w-fit lg:mb-0 mb-3">
                  Date Filter
                  <label class="block text-sm font-medium text-gray-700"
                    >Filter by Month</label
                  >
                  <select
                    v-model="selectedMonth"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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

                <div class="mt-5">
                  <button
                    @click="clearFilters"
                    class="lg:w-fit w-full whitespace-nowrap px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              <a
                href="/news-updates/list"
                class="text-sm text-green-600 hover:underline float-right mt-2"
              >
                View All
              </a>
            </div>
          </div>

          <!-- GROUPED CONTENT -->
          <div v-if="filteredInfo.length" class="space-y-6">
            <!-- Top -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <!-- Latest -->
              <div class="lg:col-span-2 bg-white rounded-lg p-4">
                <h4 class="font-semibold text-sm mb-2">
                  Latest (News Highlight)
                </h4>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <!-- Side cards -->
                  <div class="order-2 lg:order-1 flex flex-col gap-3">
                    <div
                      v-for="item in (
                        groupedSections.newsHighlight || []
                      ).slice(1, 4)"
                      :key="item.id"
                      class="group bg-white rounded-md overflow-hidden border hover:shadow-md transition"
                    >
                      <a :href="'/news-updates/' + item.id" class="flex h-24">
                        <div class="w-1/3 h-full overflow-hidden">
                          <img
                            v-if="item.files && item.files.length"
                            :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${item.files[0]}`"
                            class="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div class="p-2 w-2/3 flex flex-col justify-between">
                          <div>
                            <div class="text-xs text-gray-500">{{ moment(item.date || item.created_at).format('MMM DD') }}</div>
                            <div class="font-medium text-sm line-clamp-2">{{ item.title }}</div>
                          </div>
                          <div>
                            <div class="flex items-center gap-2 mt-2 mb-2">
                              <div v-for="badge in getSdgBadges(item).slice(0,3)" :key="badge.number" class="inline-flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm" :style="{ backgroundColor: badge.color }">SDG {{ badge.number }}</span>
                              </div>
                              <span v-if="getSdgBadges(item).length > 3" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">+{{ getSdgBadges(item).length - 3 }} more</span>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                              <div class="text-xs text-gray-500">{{ item.filters }}</div>
                              <div class="text-xs text-green-600 font-medium">Read More <i class="fas fa-arrow-right ml-1"></i></div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  <!-- Main highlight -->
                  <div class="order-1 lg:order-2 lg:col-span-3">
                    <div
                      v-if="
                        groupedSections.newsHighlight &&
                        groupedSections.newsHighlight[0]
                      "
                      class="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition"
                    >
                      <a
                        :href="
                          '/news-updates/' + groupedSections.newsHighlight[0].id
                        "
                        class="block"
                      >
                        <div class="relative h-64 overflow-hidden">
                          <img
                            v-if="
                              groupedSections.newsHighlight[0].files?.length
                            "
                            :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${groupedSections.newsHighlight[0].files[0]}`"
                            class="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div
                            class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                          ></div>
                        </div>
                        <div class="p-4">
                          <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-gray-400">
                              {{
                                getCategoryLabel(
                                  groupedSections.newsHighlight[0]
                                )
                              }}
                            </div>
                            <div class="text-xs text-gray-400">
                              {{
                                moment(
                                  groupedSections.newsHighlight[0].date ||
                                    groupedSections.newsHighlight[0].created_at
                                ).format("MMM DD")
                              }}
                            </div>
                          </div>
                          <h3 class="text-xl font-bold mb-2">
                            {{ groupedSections.newsHighlight[0].title }}
                          </h3>
                          <div class="flex items-center gap-2 mb-2">
                            <div
                              v-for="badge in getSdgBadges(
                                groupedSections.newsHighlight[0]
                              ).slice(0, 1)"
                              :key="badge.number"
                              class="inline-flex items-center"
                            >
                              <span
                                class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm"
                                :style="{ backgroundColor: badge.color }"
                                >SDG {{ badge.number }}</span
                              >
                            </div>
                          </div>
                        </div>
                      </a>
                      <div class="px-4 pb-4 flex items-center justify-between">
                        <div class="text-xs text-green-600 font-medium">
                          Read More <i class="fas fa-arrow-right ml-1"></i>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500">
                      No highlight available.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Announcements -->
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-semibold text-sm mb-2">Announcements</h4>
                <div
                  v-if="groupedSections.announcements?.length"
                  class="space-y-3"
                >
                  <div
                    v-for="a in (groupedSections.announcements || []).slice(
                      0,
                      3
                    )"
                    :key="a.id"
                    class="border rounded-md p-3"
                  >
                    <div class="flex items-start gap-3">
                      <div class="w-1/4 h-20 overflow-hidden rounded-md">
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
                      <div class="flex-1">
                        <div class="flex items-start justify-between mb-1">
                          <div
                            class="text-xs uppercase text-gray-600 font-medium"
                          >
                            {{ getCategoryLabel(a) }}
                          </div>
                          <div class="text-xs text-gray-400">
                            {{
                              moment(a.date || a.created_at).format("MMM DD")
                            }}
                          </div>
                        </div>
                        <a
                          :href="'/news-updates/' + a.id"
                          class="block font-semibold text-lg text-gray-900 mb-1"
                          >{{ a.title }}</a
                        >
                        <div class="flex items-center gap-2 mb-2">
                          <div v-for="badge in getSdgBadges(a).slice(0,3)" :key="badge.number" class="inline-flex items-center">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm" :style="{ backgroundColor: badge.color }">SDG {{ badge.number }}</span>
                          </div>
                          <span v-if="getSdgBadges(a).length > 3" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">+{{ getSdgBadges(a).length - 3 }} more</span>
                        </div>

                        <div
                          class="flex items-center justify-between pt-2 border-t border-gray-100"
                        >
                          <div class="flex items-center text-xs text-gray-500">
                            <i class="fas fa-calendar mr-1"></i
                            >{{
                              moment(a.date || a.created_at).format(
                                "MMMM DD, YYYY"
                              )
                            }}
                          </div>
                          <div
                            class="flex items-center text-xs text-green-600 font-medium"
                          >
                            Read More<i class="fas fa-arrow-right ml-1"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">
                  No announcements.
                </div>
              </div>
            </div>

            <!-- Research & Sustainability -->
            <div class="  gap-4">
              <div class="bg-white rounded-lg p-4">
                <h4 class="font-semibold mb-3">Research</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div
                    v-for="r in (groupedSections.research || []).slice(0, 6)"
                    :key="r.id"
                    class="group bg-gray-50 rounded-md overflow-hidden border hover:shadow-sm transition"
                  >
                    <a :href="'/news-updates/' + r.id" class="block">
                      <div class="flex h-24">
                        <div class="w-1/3 h-full overflow-hidden">
                          <img
                            v-if="r.files?.length"
                            :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${r.files[0]}`"
                            class="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div
                            v-else
                            class="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400"
                          >
                            No Image
                          </div>
                        </div>
                        <div class="p-2 w-2/3 flex flex-col justify-between">
                          <div class="font-medium text-sm line-clamp-2">{{ r.title }}</div>
                          <div>
                            <div class="flex items-center gap-2 mb-2">
                              <div v-for="badge in getSdgBadges(r).slice(0,3)" :key="badge.number" class="inline-flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm" :style="{ backgroundColor: badge.color }">SDG {{ badge.number }}</span>
                              </div>
                              <span v-if="getSdgBadges(r).length > 3" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">+{{ getSdgBadges(r).length - 3 }} more</span>
                            </div>
                            <div class="flex items-center justify-between">
                              <div class="text-xs text-gray-400">{{ moment(r.date || r.created_at).format('MMM DD') }}</div>
                              <div class="text-xs text-green-600 font-medium">Read More <i class="fas fa-arrow-right ml-1"></i></div>
                            </div>
                            <div class="text-xs text-gray-500 mt-1">{{ r.filters }}</div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg p-4">
                <h4 class="font-semibold mb-3">
                  Sustainability (Social Action)
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    v-for="s in (groupedSections.sustainability || []).slice(
                      0,
                      8
                    )"
                    :key="s.id"
                    class="group bg-gray-50 rounded-md overflow-hidden border hover:shadow-sm transition"
                  >
                    <a :href="'/news-updates/' + s.id" class="block">
                      <div class="flex h-20">
                        <div class="w-1/3 h-full overflow-hidden">
                          <img
                            v-if="s.files?.length"
                            :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${s.files[0]}`"
                            class="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div
                            v-else
                            class="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400"
                          >
                            No Image
                          </div>
                        </div>
                        <div class="p-1 w-2/3 flex flex-col justify-between">
                          <div class="text-sm line-clamp-2">{{ s.title }}</div>
                          <div>
                            <div class="flex items-center gap-2 mb-2">
                              <div v-for="badge in getSdgBadges(s).slice(0,3)" :key="badge.number" class="inline-flex items-center">
                                <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm" :style="{ backgroundColor: badge.color }"> {{ badge.number }}</span>
                              </div>
                              <span v-if="getSdgBadges(s).length > 3" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">+{{ getSdgBadges(s).length - 3 }} more</span>
                            </div>
                            <div class="flex items-center justify-between">
                              <div class="text-xs text-gray-400">{{ moment(s.date || s.created_at).format('MMM DD') }}</div>
                              <div class="text-xs text-green-600 font-medium">Read More <i class="fas fa-arrow-right ml-1"></i></div>
                            </div>
                          
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <!-- Educational -->
            <div class="bg-white rounded-lg p-4">
              <h4 class="font-semibold mb-3">
                Educational and Technology (etc, npcc)
              </h4>
              <div class="grid lg:grid-cols-4 grid-cols-2 gap-4">
                <div
                  v-for="e in (groupedSections.educational || []).slice(0, 8)"
                  :key="e.id"
                  class="group bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  <a :href="'/news-updates/' + e.id" class="block">
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

                    <div class="p-3">
                      <div class="font-medium text-sm line-clamp-2">{{ e.title }}</div>
                      <div>
                        <div class="flex items-center gap-2 mt-2 mb-2">
                          <div v-for="badge in getSdgBadges(e).slice(0,3)" :key="badge.number" class="inline-flex items-center">
                            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white shadow-sm" :style="{ backgroundColor: badge.color }">SDG {{ badge.number }}</span>
                          </div>
                          <span v-if="getSdgBadges(e).length > 3" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600">+{{ getSdgBadges(e).length - 3 }} more</span>
                        </div>
                        <div class="flex items-center justify-between">
                          <div class="text-xs text-gray-400">{{ moment(e.date || e.created_at).format('MMM DD') }}</div>
                          <div class="text-xs text-green-600 font-medium">Read More <i class="fas fa-arrow-right ml-1"></i></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">{{ e.filters }}</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination and footer parts stay exactly the same below -->
          <!-- (Keep the rest of your file unchanged) -->
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
