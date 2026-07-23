<script setup>
import { ref, onMounted, computed } from "vue";

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
const cmsData = ref([]);
const searchQuery = ref("");
const categorySelection = ref("All");

const sdgsCategory = [
  {
    title: "No Poverty",
    id: "no-poverty",
    color: "#e5243b",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Zero Hunger",
    id: "zero-hunger",
    color: "#dda63a",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Good Health and Well-Being",
    id: "good-health-and-well-being",
    color: "#4c9f38",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Quality Education",
    id: "quality-education",
    color: "#c5192d",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Gender Equality",
    id: "gender-equality",
    color: "#ff3a21",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Clean Water and Sanitation",
    id: "clean-water-and-sanitation",
    color: "#26bde2",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Affordable and Clean Energy",
    id: "affordable-and-clean-energy",
    color: "#fcc30b",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Decent Work and Economic Growth",
    id: "decent-work-and-economic-growth",
    color: "#a21942",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Industry, Innovation, and Infrastructure",
    id: "industry-innovation-and-infrastructure",
    color: "#fd6925",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Reduced Inequalities",
    id: "reduced-inequalities",
    color: "#dd1367",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Sustainable Cities and Communities",
    id: "sustainable-cities-and-communities",
    color: "#fd9d24",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Responsible Consumption and Production",
    id: "responsible-consumption-and-production",
    color: "#bf8b2e",
    events: "",
    targets: "",
    actions: "",
    category: "Economy"
  },
  {
    title: "Climate Action",
    id: "climate-action",
    color: "#3f7e44",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Life Below Water",
    id: "life-below-water",
    color: "#0a97d9",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Life on Land",
    id: "life-on-land",
    color: "#56c02b",
    events: "",
    targets: "",
    actions: "",
    category: "Biosphere"
  },
  {
    title: "Peace, Justice, and Strong Institutions",
    id: "peace-justice-and-strong-institutions",
    color: "#00689d",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
  {
    title: "Partnerships for the Goals",
    id: "partnerships-for-the-goals",
    color: "#19486a",
    events: "",
    targets: "",
    actions: "",
    category: "Society"
  },
];

// Computed property to count related news for each SDG
const sdgsWithRelatedCount = computed(() => {
  return sdgsCategory.map((sdg, index) => {
    const sdgNumber = index + 1;
    const relatedCount = cmsData.value.filter(item => {
      if (!item?.filters) return false;
      const filters = item.filters.toLowerCase();
      
      const patterns = [
        `\\bsdg${sdgNumber}\\b`,
        `\\bsdg ${sdgNumber}\\b`, 
        `\\bsdg-${sdgNumber}\\b`,
        `\\bsdg_${sdgNumber}\\b`,
        `\\bgoal ${sdgNumber}\\b`,
        `\\bgoal${sdgNumber}\\b`,
        `\\bsdg${sdgNumber.toString().padStart(2, '0')}\\b`
      ];
      
      return patterns.some(pattern => {
        const regex = new RegExp(pattern, 'i');
        return regex.test(filters);
      });
    }).length;
    
    return {
      ...sdg,
      number: sdgNumber,
      related: relatedCount
    };
  });
});

const categoryInfoMap = {
  All: {
    title: "17 Sustainable Development Goals",
    description: "The United Nations global framework for peace, prosperity, people, and the planet.",
    icon: "fas fa-globe"
  },
  Society: {
    title: "Society Dimension",
    description: "Advancing human rights, quality education, community wellbeing, gender equality, and social justice.",
    icon: "fas fa-users"
  },
  Economy: {
    title: "Economy Dimension",
    description: "Promoting inclusive growth, innovation, sustainable infrastructure, and responsible consumption.",
    icon: "fas fa-chart-line"
  },
  Biosphere: {
    title: "Biosphere Dimension",
    description: "Safeguarding aquatic systems, terrestrial ecosystems, clean water, and combating climate change.",
    icon: "fas fa-leaf"
  }
};

const categoryCounts = computed(() => {
  const counts = { All: sdgsCategory.length, Society: 0, Economy: 0, Biosphere: 0 };
  sdgsCategory.forEach(sdg => {
    if (counts[sdg.category] !== undefined) {
      counts[sdg.category]++;
    }
  });
  return counts;
});

const filteredSdgs = computed(() => {
  return sdgsWithRelatedCount.value.filter(sdg => {
    const matchesCategory = categorySelection.value === "All" || sdg.category === categorySelection.value;
    const query = searchQuery.value.trim().toLowerCase();
    const matchesSearch = !query || 
      sdg.title.toLowerCase().includes(query) || 
      `goal ${sdg.number}`.includes(query) || 
      `sdg${sdg.number}`.includes(query);
      
    return matchesCategory && matchesSearch;
  });
});

const totalRelatedInitiatives = computed(() => {
  return sdgsWithRelatedCount.value.reduce((acc, curr) => acc + curr.related, 0);
});

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    cmsData.value = Array.isArray(res) ? res : [];
  } catch (error) {
    cmsData.value = [];
  }
});
</script>

<template>
  <div class="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col justify-between">
    <div>
      <Header />

      <!-- Modern Hero Banner Section -->
      <section class="relative bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white overflow-hidden py-14 sm:py-20 px-4 sm:px-6">
        <!-- Background Overlay Decorative Shapes -->
        <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div class="max-w-7xl mx-auto relative z-10">
          <!-- Breadcrumbs -->
          <nav class="mb-6">
            <ul class="inline-flex items-center space-x-2 bg-emerald-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-emerald-700/40 text-xs text-emerald-200">
              <li>
                <NuxtLink to="/" class="hover:text-white transition-colors flex items-center gap-1.5">
                  <i class="fas fa-home text-[10px]"></i> Home
                </NuxtLink>
              </li>
              <li class="text-emerald-500"><i class="fas fa-chevron-right text-[8px]"></i></li>
              <li class="font-semibold text-white">Sustainability</li>
            </ul>
          </nav>

          <div class="max-w-3xl">
            <span class="inline-block px-3 py-1 bg-emerald-800/80 text-emerald-300 text-xs font-semibold uppercase tracking-widest rounded-md mb-3 border border-emerald-700/50">
              Campus Sustainability
            </span>
            <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
              Sustainable Development <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">Goals</span>
            </h1>
            <p class="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              La Salle University is committed to fostering global transformation through research, education, community engagement, and sustainable campus operations.
            </p>
          </div>
        </div>
      </section>

      <!-- Institutional Partnership Card -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-20">
        <div class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 border border-slate-200/80">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-8">
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
                alt="La Salle University Logo"
                class="h-12 sm:h-14 object-contain"
              />
              <div class="hidden sm:block w-px h-12 bg-slate-200"></div>
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
                alt="UN SDGs Logo"
                class="h-12 sm:h-14 object-contain"
              />
            </div>
            
            <div class="text-center md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
              <p class="text-xs uppercase tracking-wider font-bold text-emerald-800 mb-1">
                Institutional Alignment
              </p>
              <p class="text-slate-600 text-sm font-medium max-w-md">
                Supporting the UN 2030 Agenda for Sustainable Development
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Controls & SDG Grid Section -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <!-- Interactive Controls (Category Segmented Control + Search) -->
        <div class="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <!-- Segmented Filter Pills -->
          <div class="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
            <div class="inline-flex p-1.5 bg-slate-200/70 backdrop-blur-md rounded-2xl border border-slate-300/50 shadow-inner min-w-full sm:min-w-0">
              <button
                @click="categorySelection = 'All'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer"
                :class="categorySelection === 'All' ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-950/20' : 'text-slate-700 hover:text-emerald-800 hover:bg-white/60'"
              >
                <span>All Goals</span>
                <span 
                  class="px-2 py-0.5 text-[11px] rounded-full transition-colors"
                  :class="categorySelection === 'All' ? 'bg-white/20 text-white' : 'bg-slate-300/80 text-slate-700'"
                >
                  {{ categoryCounts.All }}
                </span>
              </button>

              <button
                @click="categorySelection = 'Society'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer"
                :class="categorySelection === 'Society' ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-950/20' : 'text-slate-700 hover:text-emerald-800 hover:bg-white/60'"
              >
                <i class="fas fa-users text-xs"></i>
                <span>Society</span>
                <span 
                  class="px-2 py-0.5 text-[11px] rounded-full transition-colors"
                  :class="categorySelection === 'Society' ? 'bg-white/20 text-white' : 'bg-slate-300/80 text-slate-700'"
                >
                  {{ categoryCounts.Society }}
                </span>
              </button>

              <button
                @click="categorySelection = 'Economy'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer"
                :class="categorySelection === 'Economy' ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-950/20' : 'text-slate-700 hover:text-emerald-800 hover:bg-white/60'"
              >
                <i class="fas fa-chart-line text-xs"></i>
                <span>Economy</span>
                <span 
                  class="px-2 py-0.5 text-[11px] rounded-full transition-colors"
                  :class="categorySelection === 'Economy' ? 'bg-white/20 text-white' : 'bg-slate-300/80 text-slate-700'"
                >
                  {{ categoryCounts.Economy }}
                </span>
              </button>

              <button
                @click="categorySelection = 'Biosphere'"
                class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer"
                :class="categorySelection === 'Biosphere' ? 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md shadow-emerald-950/20' : 'text-slate-700 hover:text-emerald-800 hover:bg-white/60'"
              >
                <i class="fas fa-leaf text-xs"></i>
                <span>Biosphere</span>
                <span 
                  class="px-2 py-0.5 text-[11px] rounded-full transition-colors"
                  :class="categorySelection === 'Biosphere' ? 'bg-white/20 text-white' : 'bg-slate-300/80 text-slate-700'"
                >
                  {{ categoryCounts.Biosphere }}
                </span>
              </button>
            </div>
          </div>

          <!-- Instant Search Box -->
          <div class="relative w-full lg:w-72">
            <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search SDG title or goal..."
              class="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent shadow-sm transition-all"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        </div>

        <!-- Active Dimension Context Info Banner -->
        <div class="mb-8 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <i :class="categoryInfoMap[categorySelection].icon + ' text-lg'"></i>
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-base">
                {{ categoryInfoMap[categorySelection].title }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600">
                {{ categoryInfoMap[categorySelection].description }}
              </p>
            </div>
          </div>

          <div class="shrink-0 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg">
            Showing {{ filteredSdgs.length }} Goal{{ filteredSdgs.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- SDGs Interactive Grid -->
        <div v-if="filteredSdgs.length > 0">
          <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            <li
              v-for="j in filteredSdgs"
              :key="j.id"
              class="flip-card aspect-square w-full"
            >
              <div class="flip-card-inner rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
                <!-- Front Side -->
                <div
                  class="flip-card-front rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-0.5 bg-white cursor-pointer"
                  :style="{ backgroundColor: j.color }"
                >
                  <NuxtLink :to="`/sdgs/${j.id}`" class="w-full h-full block group relative">
                    <img
                      :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${j.number}.png`"
                      :alt="j.title"
                      class="sdg-img w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <!-- Subtle Hover Glass Overlay -->
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </NuxtLink>
                </div>

                <!-- Back Side -->
                <div
                  class="flip-card-back rounded-2xl overflow-hidden flex flex-col justify-between p-4 text-center cursor-pointer shadow-inner border border-white/20"
                  :style="{ backgroundColor: j.color }"
                >
                  <NuxtLink :to="`/sdgs/${j.id}`" class="w-full h-full flex flex-col justify-between text-white">
                    <div>
                      <span class="inline-block px-2.5 py-0.5 bg-black/20 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-wider text-white/90 mb-1">
                        Goal {{ j.number }}
                      </span>
                      <h4 class="text-xs font-bold leading-snug line-clamp-2 px-1 text-white">
                        {{ j.title }}
                      </h4>
                    </div>

                    <div class="my-auto py-2">
                      <div class="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-xl text-white">
                        <span class="text-xl font-extrabold leading-none">{{ j.related || 0 }}</span>
                        <span class="text-[11px] font-medium leading-tight">Initiative{{ j.related === 1 ? '' : 's' }}</span>
                      </div>
                    </div>

                    <div class="pt-1">
                      <span class="inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4 text-white hover:text-white/80 transition-colors">
                        Explore <i class="fas fa-arrow-right text-[10px]"></i>
                      </span>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <!-- Empty Filter State -->
        <div v-else class="text-center py-16 bg-white rounded-3xl border border-slate-200/80 shadow-sm px-4">
          <div class="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fas fa-search-minus"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">No Sustainable Development Goals Found</h3>
          <p class="text-slate-500 text-sm max-w-md mx-auto mb-6">
            We couldn't find any goals matching "{{ searchQuery }}". Try adjusting your search term or category filter.
          </p>
          <button
            @click="searchQuery = ''; categorySelection = 'All'"
            class="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm rounded-xl transition-all shadow-md"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <!-- Institutional Metrics Bar -->
      <section class="border-t border-slate-200/60 bg-white py-10 px-4 sm:px-6">
        <div class="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p class="text-3xl font-extrabold text-emerald-800 mb-0.5">17</p>
            <p class="text-xs text-slate-600 font-medium">UN Global Goals</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p class="text-3xl font-extrabold text-emerald-800 mb-0.5">3</p>
            <p class="text-xs text-slate-600 font-medium">Core Dimensions</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p class="text-3xl font-extrabold text-emerald-800 mb-0.5">{{ totalRelatedInitiatives }}</p>
            <p class="text-xs text-slate-600 font-medium">Mapped Initiatives</p>
          </div>
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <p class="text-3xl font-extrabold text-emerald-800 mb-0.5">100%</p>
            <p class="text-xs text-slate-600 font-medium">Institutional Commitment</p>
          </div>
        </div>
      </section>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.flip-card {
  perspective: 1000px;
}
.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.flip-card:hover .flip-card-inner {
  transform: rotateY(180deg);
}
.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.sdg-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.flip-card-back {
  transform: rotateY(180deg);
}
</style>

