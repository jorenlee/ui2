

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useRoute } from "vue-router";
import moment from 'moment';

const route = useRoute();
const id = route.params.id;

const sdgsCategory = [
  { title: "No Poverty", id: "no-poverty", color: "#e5243b", category: "Society" },
  { title: "Zero Hunger", id: "zero-hunger", color: "#dda63a", category: "Society" },
  { title: "Good Health and Well-Being", id: "good-health-and-well-being", color: "#4c9f38", category: "Society" },
  { title: "Quality Education", id: "quality-education", color: "#c5192d", category: "Society" },
  { title: "Gender Equality", id: "gender-equality", color: "#ff3a21", category: "Society" },
  { title: "Clean Water and Sanitation", id: "clean-water-and-sanitation", color: "#26bde2", category: "Biosphere" },
  { title: "Affordable and Clean Energy", id: "affordable-and-clean-energy", color: "#fcc30b", category: "Society" },
  { title: "Decent Work and Economic Growth", id: "decent-work-and-economic-growth", color: "#a21942", category: "Economy" },
  { title: "Industry, Innovation, and Infrastructure", id: "industry-innovation-and-infrastructure", color: "#fd6925", category: "Economy" },
  { title: "Reduced Inequalities", id: "reduced-inequalities", color: "#dd1367", category: "Economy" },
  { title: "Sustainable Cities and Communities", id: "sustainable-cities-and-communities", color: "#fd9d24", category: "Society" },
  { title: "Responsible Consumption and Production", id: "responsible-consumption-and-production", color: "#bf8b2e", category: "Economy" },
  { title: "Climate Action", id: "climate-action", color: "#3f7e44", category: "Biosphere" },
  { title: "Life Below Water", id: "life-below-water", color: "#0a97d9", category: "Biosphere" },
  { title: "Life on Land", id: "life-on-land", color: "#56c02b", category: "Biosphere" },
  { title: "Peace, Justice, and Strong Institutions", id: "peace-justice-and-strong-institutions", color: "#00689d", category: "Society" },
  { title: "Partnerships for the Goals", id: "partnerships-for-the-goals", color: "#19486a", category: "Society" },
];

const sdg = sdgsCategory.find((s) => s.id === id);
if (!sdg) {
  throw createError({
    statusCode: 404,
    message: "SDG Not Found",
  });
}

// Compute prev / next SDG
const currentIndex = computed(() => sdgsCategory.findIndex((s) => s.id === sdg.id));
const prevSdg = computed(() => currentIndex.value > 0 ? sdgsCategory[currentIndex.value - 1] : sdgsCategory[sdgsCategory.length - 1]);
const nextSdg = computed(() => currentIndex.value < sdgsCategory.length - 1 ? sdgsCategory[currentIndex.value + 1] : sdgsCategory[0]);

// News fetching
const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

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

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    const allItems = Array.isArray(res) ? res : [];
    
    // Filter items for current SDG
    const sdgNum = currentSdgNumber.value;
    info.value = allItems.filter(item => {
      if (!item?.filters) return false;
      const filters = item.filters.toLowerCase();
      
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
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
    <div>
      <Header />

      <!-- Banner Header -->
      <section class="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden py-12 sm:py-16 px-4 sm:px-6">
        <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div class="max-w-7xl mx-auto relative z-10">
          <nav class="mb-4">
            <ul class="inline-flex flex-wrap items-center gap-2 bg-emerald-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-700/40 text-xs text-emerald-200">
              <li>
                <NuxtLink to="/" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fas fa-home text-[10px]"></i> Home
                </NuxtLink>
              </li>
              <li class="text-emerald-500"><i class="fas fa-chevron-right text-[8px]"></i></li>
              <li>
                <NuxtLink to="/sdgs" class="hover:text-white transition-colors">
                  Sustainability
                </NuxtLink>
              </li>
              <li class="text-emerald-500"><i class="fas fa-chevron-right text-[8px]"></i></li>
              <li class="font-semibold text-white">Goal {{ currentSdgNumber }}</li>
            </ul>
          </nav>

          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span 
                class="inline-block px-3 py-1 text-white text-xs font-bold uppercase tracking-widest rounded-md mb-2 shadow-sm"
                :style="{ backgroundColor: sdg.color }"
              >
                UN SDG Goal {{ currentSdgNumber }} • {{ sdg.category }}
              </span>
              <h1 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {{ sdg.title }}
              </h1>
            </div>

            <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-white">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm" :style="{ backgroundColor: sdg.color }">
                {{ currentSdgNumber }}
              </div>
              <div>
                <p class="text-xs text-emerald-200 font-medium">Mapped Initiatives</p>
                <p class="text-lg font-bold leading-none">{{ info.length }} Article{{ info.length === 1 ? '' : 's' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Layout -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Sidebar Navigation -->
          <aside class="lg:col-span-4 xl:col-span-3">
            <div class="sticky top-6 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm">
              <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h2 class="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <i class="fas fa-th-large text-emerald-700"></i> Sustainable Development Goals
                </h2>
                <NuxtLink to="/sdgs" class="text-xs text-emerald-800 font-semibold hover:underline">
                  Grid
                </NuxtLink>
              </div>

              <div class="max-h-[calc(100vh-220px)] overflow-y-auto pr-1 space-y-1 custom-scrollbar">
                <NuxtLink
                  v-for="(item, i) in sdgsCategory"
                  :key="item.id"
                  :to="`/sdgs/${item.id}`"
                  class="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group"
                  :class="item.id === sdg.id 
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-950/20' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-emerald-900'"
                >
                  <span 
                    class="w-6 h-6 rounded-lg text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-xs"
                    :style="{ backgroundColor: item.color }"
                  >
                    {{ i + 1 }}
                  </span>
                  <span class="truncate leading-tight">{{ item.title }}</span>
                </NuxtLink>
              </div>
            </div>
          </aside>

          <!-- Main Content Area -->
          <main class="lg:col-span-8 xl:col-span-9">
            <!-- Goal Header Hero Card -->
            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-8">
              <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div class="w-32 h-32 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-2 bg-white flex items-center justify-center">
                  <img
                    :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${currentSdgNumber}.png`"
                    :alt="sdg.title"
                    class="w-full h-full object-contain"
                  />
                </div>

                <div class="flex-1 text-center sm:text-left">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" :style="{ backgroundColor: sdg.color + '20', color: sdg.color }">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: sdg.color }"></span>
                    <span>SDG Goal {{ currentSdgNumber }}</span>
                  </div>

                  <h2 class="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    {{ sdg.title }}
                  </h2>
                  <p class="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
                    La Salle University actively aligns its academic curricula, research outputs, and community outreach programs to advance Sustainable Development Goal {{ currentSdgNumber }}.
                  </p>

                  <div class="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span class="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                      Pillar: <strong class="text-slate-900">{{ sdg.category }}</strong>
                    </span>
                    <span class="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                      Mapped Articles: <strong class="text-emerald-900">{{ info.length }}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Articles Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
                <span>Campus Initiatives & News</span>
                <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                  {{ info.length }}
                </span>
              </h3>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="n in 3" :key="n" class="bg-white rounded-2xl h-80 animate-pulse p-4 border border-slate-100">
                <div class="bg-slate-200 h-44 rounded-xl mb-4"></div>
                <div class="bg-slate-200 h-4 rounded w-3/4 mb-2"></div>
                <div class="bg-slate-200 h-4 rounded w-1/2"></div>
              </div>
            </div>

            <!-- Content Grid -->
            <div v-else-if="info.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="(j, i) in info"
                :key="i"
                class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <NuxtLink :to="'/news-updates/' + j.id" class="block flex-1 flex flex-col">
                  <!-- Image Section -->
                  <div class="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      v-if="j.files && j.files.length > 0"
                      :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${j.files[0]}`"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      :alt="j.title"
                    />
                    <img 
                      v-else
                      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU-Default.png" 
                      class="w-full h-full object-cover"
                      alt="Default thumbnail"
                    />

                    <!-- Category Badge -->
                    <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-emerald-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs">
                      {{ j.category || 'Initiative' }}
                    </span>
                  </div>

                  <!-- Content Section -->
                  <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p class="text-xs text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                        <i class="far fa-calendar-alt"></i>
                        {{ moment(j.date || j.created_at).format("MMM DD, YYYY") }}
                      </p>

                      <h4 class="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                        {{ j.title }}
                      </h4>

                      <p v-if="j.descriptions" class="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                        {{ j.descriptions }}
                      </p>
                    </div>

                    <!-- SDG Cross-Reference Badges -->
                    <div v-if="getSdgBadges(j).length" class="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      <span 
                        v-for="badge in getSdgBadges(j).slice(0, 3)" 
                        :key="badge.number" 
                        class="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                        :style="{ backgroundColor: badge.color }"
                      >
                        SDG {{ badge.number }}
                      </span>
                      <span 
                        v-if="getSdgBadges(j).length > 3"
                        class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                      >
                        +{{ getSdgBadges(j).length - 3 }}
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm px-4">
              <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4 text-2xl">
                <i class="fas fa-folder-open"></i>
              </div>
              <h4 class="text-base font-bold text-slate-800 mb-1">No Articles Currently Filed</h4>
              <p class="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
                There are currently no campus news articles or updates tagged under Goal {{ currentSdgNumber }} ({{ sdg.title }}).
              </p>
              <NuxtLink
                to="/sdgs"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md"
              >
                <i class="fas fa-arrow-left text-xs"></i> Return to All Goals
              </NuxtLink>
            </div>

            <!-- Pagination / Prev-Next SDG Controls -->
            <div class="mt-10 pt-6 border-t border-slate-200/80 flex items-center justify-between gap-4">
              <NuxtLink
                :to="`/sdgs/${prevSdg.id}`"
                class="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 rounded-2xl text-slate-700 hover:text-emerald-900 transition-all shadow-xs group"
              >
                <i class="fas fa-chevron-left text-xs group-hover:-translate-x-1 transition-transform"></i>
                <div class="text-left hidden sm:block">
                  <p class="text-[10px] text-slate-400 font-semibold uppercase">Previous</p>
                  <p class="text-xs font-bold text-slate-800 truncate max-w-[140px]">{{ prevSdg.title }}</p>
                </div>
              </NuxtLink>

              <NuxtLink
                :to="`/sdgs/${nextSdg.id}`"
                class="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 rounded-2xl text-slate-700 hover:text-emerald-900 transition-all shadow-xs group"
              >
                <div class="text-right hidden sm:block">
                  <p class="text-[10px] text-slate-400 font-semibold uppercase">Next</p>
                  <p class="text-xs font-bold text-slate-800 truncate max-w-[140px]">{{ nextSdg.title }}</p>
                </div>
                <i class="fas fa-chevron-right text-xs group-hover:translate-x-1 transition-transform"></i>
              </NuxtLink>
            </div>
          </main>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

