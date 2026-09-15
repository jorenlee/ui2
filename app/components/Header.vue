<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import moment from "moment";

const menuDetails = ref(false);
const isScrolled = ref(false);
const showSearchModal = ref(false);
const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const allContent = ref([]);
const openMobile = ref(null);
const activeTab = ref("all"); // 'all' | 'academics' | 'news'
let searchTimeout = null;

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const closeMenu = () => {
  menuDetails.value = false;
  openMobile.value = null;
};

const toggleMobile = (label) => {
  openMobile.value = openMobile.value === label ? null : label;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const openSearchModal = () => {
  showSearchModal.value = true;
  document.body.style.overflow = "hidden";
  loadContent();
};

const closeSearchModal = () => {
  showSearchModal.value = false;
  searchQuery.value = "";
  searchResults.value = [];
  activeTab.value = "all";
  document.body.style.overflow = "auto";
};

const clearSearch = () => {
  searchQuery.value = "";
  searchResults.value = [];
};

const quickSearch = (term) => {
  searchQuery.value = term;
  performSearch();
};

const loadContent = async () => {
  if (allContent.value.length === 0) {
    try {
      const res = await $fetch(endpoint.value + "/api/cms/content/list/");
      allContent.value = Array.isArray(res) ? res : [];
    } catch (error) {
      console.error("Error loading content:", error);
    }
  }
};

// Check if an item is related to Courses, Academic Degree Programs, or College VMG / Overview
const isAcademicCourseItem = (item) => {
  if (!item) return false;
  if (item.isCollege) return true;

  const title = (item.title || "").trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();
  const authors = (item.authors || item.author || "").toLowerCase();
  const descriptions = (item.descriptions || item.description || "").toLowerCase();
  const category = (item.category || "").toLowerCase();

  // 1. Check known college abbreviations
  const collegeAbbrs = ["sgs", "cas", "cba", "ccje", "ccsea", "con", "cte", "cthm", "cmls"];
  const matchesCollegeAbbr = collegeAbbrs.some((abbr) => {
    const regex = new RegExp(`(^|[^a-zA-Z0-9])${abbr}([^a-zA-Z0-9]|$)`, "i");
    return regex.test(filters) || regex.test(authors) || regex.test(title);
  });

  // 2. Check known college titles
  const collegeTitles = [
    "school of graduate studies",
    "graduate studies",
    "college of arts and sciences",
    "college of business and accountancy",
    "college of criminal justice education",
    "college of computer studies, engineering, and architecture",
    "college of computer studies, engineering and architecture",
    "college of computer studies",
    "college of nursing",
    "college of teacher education",
    "college of tourism and hospitality management",
    "college of medical laboratory science",
  ];
  const matchesCollegeTitle = collegeTitles.some((ct) =>
    title.includes(ct) || filters.includes(ct) || authors.includes(ct)
  );

  // 3. Degree keywords in title
  const isDegreeTitle =
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs-") ||
    title.startsWith("bs.") ||
    title.startsWith("ba ") ||
    title.startsWith("ba-") ||
    title.startsWith("ba.") ||
    title.startsWith("bee") ||
    title.startsWith("bpe") ||
    title.startsWith("btle") ||
    title.startsWith("blis") ||
    title.startsWith("master of") ||
    title.startsWith("master in") ||
    title.startsWith("master's in") ||
    title.startsWith("master's of") ||
    title.includes("master of arts") ||
    title.includes("master of science") ||
    title.includes("master in education") ||
    title.includes("master in business") ||
    title.includes("master in public") ||
    title.startsWith("doctor of") ||
    title.startsWith("doctor in") ||
    title.startsWith("doctorate") ||
    title.includes("doctor of philosophy") ||
    title.includes("juris doctor") ||
    title === "jd" ||
    /\bjd\b/i.test(title) ||
    title.includes("associate in") ||
    title.includes("diploma in") ||
    /\b(ph\.?d\.?|dba|edd|mba|mpa|maed|med|msn|mit|msit|mscs)\b/i.test(title);

  // 4. College VMG / Overview
  const isVmgOrOverview =
    (matchesCollegeAbbr || matchesCollegeTitle || filters.includes("heu") || filters.includes("higher education")) &&
    (
      title.includes("vision") ||
      title.includes("mission") ||
      title.includes("goal") ||
      title.includes("vmg") ||
      title.includes("vmgo") ||
      title.includes("objectives") ||
      filters.includes("vmg") ||
      filters.includes("vmgo") ||
      descriptions.includes("**vision**") ||
      descriptions.includes("**mission**")
    );

  // 5. Higher Education Unit context
  const isHigherEducationUnit =
    filters.includes("higher education unit") ||
    authors.includes("higher education unit") ||
    filters.includes("tertiary") ||
    category.includes("programs") ||
    filters.includes("programs");

  // 6. News/announcements exclusion keywords
  const isGeneralNews =
    filters.includes("news") ||
    filters.includes("announcement") ||
    filters.includes("event") ||
    filters.includes("highlights") ||
    filters.includes("hero carousel") ||
    title.includes("passer") ||
    title.includes("licensure") ||
    title.includes("examination") ||
    title.includes("congratulations") ||
    title.includes("webinar") ||
    title.includes("seminar") ||
    title.includes("workshop") ||
    title.includes("hiring") ||
    title.includes("job opportunity");

  if (isDegreeTitle || isVmgOrOverview || (matchesCollegeTitle && !isGeneralNews)) {
    return true;
  }

  if (isHigherEducationUnit && !isGeneralNews) {
    return true;
  }

  return false;
};

// Route destination resolution: courses/colleges -> /academics/tertiary-education/${id}, news -> /news-updates/${id}
const getDestinationUrl = (item) => {
  if (!item) return "/";
  const itemId = item.id || item.content_id;
  if (isAcademicCourseItem(item)) {
    return `/academics/tertiary-education/${itemId}`;
  }
  return `/news-updates/${itemId}`;
};

// Category metadata helper for badging and icons
const getItemCategory = (item) => {
  if (isAcademicCourseItem(item)) {
    const title = (item.title || "").toLowerCase();
    const filters = (item.filters || "").toLowerCase();
    if (
      title.includes("graduate") ||
      title.includes("master") ||
      title.includes("doctor") ||
      title.includes("juris") ||
      filters.includes("sgs")
    ) {
      return {
        label: "Graduate Studies",
        bg: "bg-purple-100 text-purple-800 border-purple-200",
        icon: "fa-graduation-cap",
        targetText: "View Program",
      };
    }
    if (
      title.includes("vision") ||
      title.includes("mission") ||
      title.includes("college") ||
      filters.includes("vmg") ||
      filters.includes("vmgo")
    ) {
      return {
        label: "College & Department",
        bg: "bg-teal-100 text-teal-800 border-teal-200",
        icon: "fa-university",
        targetText: "View College",
      };
    }
    return {
      label: "Degree Program",
      bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: "fa-book-open",
      targetText: "View Course",
    };
  }
  return {
    label: "News & Updates",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "fa-newspaper",
    targetText: "Read Article",
  };
};

const performSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    searchLoading.value = false;
    return;
  }

  searchLoading.value = true;

  searchTimeout = setTimeout(() => {
    const query = searchQuery.value.toLowerCase().trim();
    const queryTerms = query.split(/\s+/).filter(Boolean);

    const scored = allContent.value
      .map((item) => {
        const title = (item.title || "").toLowerCase();
        const authors = (item.authors || "").toLowerCase();
        const descriptions = (item.descriptions || item.description || "").toLowerCase();
        const filters = (item.filters || "").toLowerCase();
        const contentId = String(item.content_id || item.id || "").toLowerCase();

        let score = 0;

        // Exact & prefix matches
        if (title === query) score += 120;
        else if (title.startsWith(query)) score += 70;
        else if (title.includes(query)) score += 40;

        if (filters.includes(query)) score += 35;
        if (authors.includes(query)) score += 30;
        if (contentId === query) score += 50;
        if (descriptions.includes(query)) score += 10;

        // Multi-term match bonus
        let matchedTerms = 0;
        for (const term of queryTerms) {
          const inTitle = title.includes(term);
          const inFilters = filters.includes(term);
          const inAuthors = authors.includes(term);
          const inDesc = descriptions.includes(term);
          const inId = contentId.includes(term);

          if (inTitle) score += 20;
          if (inFilters) score += 12;
          if (inAuthors) score += 10;
          if (inDesc) score += 5;
          if (inId) score += 15;

          if (inTitle || inFilters || inAuthors || inDesc || inId) {
            matchedTerms++;
          }
        }

        const matchesAllTerms = matchedTerms === queryTerms.length;

        // Boost college / course items if query has academic terms or college acronyms
        const isAcademic = isAcademicCourseItem(item);
        if (isAcademic) {
          const academicKeywords = ["sgs", "cas", "cba", "ccje", "ccsea", "con", "cte", "cthm", "cmls", "course", "program", "degree", "master", "doctor", "bachelor", "bs", "ba"];
          if (academicKeywords.some((k) => queryTerms.includes(k) || query.includes(k))) {
            score += 30;
          }
        }

        return { item, score, matchesAllTerms };
      })
      .filter((res) => res.score > 0 || res.matchesAllTerms)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);

    searchResults.value = scored.slice(0, 30);
    searchLoading.value = false;
  }, 200);
};

const filteredSearchResults = computed(() => {
  if (activeTab.value === "all") return searchResults.value;
  if (activeTab.value === "academics") {
    return searchResults.value.filter((item) => isAcademicCourseItem(item));
  }
  if (activeTab.value === "news") {
    return searchResults.value.filter((item) => !isAcademicCourseItem(item));
  }
  return searchResults.value;
});

const counts = computed(() => {
  const total = searchResults.value.length;
  const academics = searchResults.value.filter((item) => isAcademicCourseItem(item)).length;
  const news = total - academics;
  return { total, academics, news };
});

const goToArticle = (item) => {
  const url = typeof item === "object" ? getDestinationUrl(item) : `/news-updates/${item}`;
  closeSearchModal();
  window.location.href = url;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

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

    if (
      patterns.some((pattern) => {
        const regex = new RegExp(pattern, "i");
        return regex.test(filters);
      })
    ) {
      badges.push({ number: i });
    }
  }

  return badges;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showSearchModal.value) {
      closeSearchModal();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

/* -------------------- NAV DATA -------------------- */
const desktopNav = [
  {
    label: "Academics",
    href: "#",
    children: [
      { label: "Tertiary Education", href: "/academics/tertiary-education" },
      { label: "Basic Education", href: "/academics/basic-education" },
      { label: "Career and Counseling Center", href: "/ccc" },
    ],
  },
  { label: "Administration", href: "/administration" },
  {
    label: "Research",
    href: "/research",
    children: [
      {
        label: "Institutional Research & Publication Office",
        href: "/research",
      },
      { label: "Research Publications", href: "/research/publications" },
      { label: "E-journals", href: "/research/e-journals" },
    ],
  },
  { label: "Sustainability", href: "/sdgs" },
  { label: "Social Actions", href: "/social-actions" },
  {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      {
        label: "Lasallian Mission Center",
        href: "/campus-life/lasallian-mission-center",
      },
      {
        label: "Lasallian Formation Center",
        href: "/campus-life/lasallian-formation-center",
      },
      {
        label: "Student Activities Center",
        href: "/campus-life/student-activities-center",
      },
      { label: "Activities", href: "/campus-life/activities" },
    ],
  },
  { label: "Campus Dev", href: "/campus/dev" },
  {
    label: "Services",
    href: "#",
    children: [
      { label: "Campus Pass", href: "/campus-pass" },
      { label: "Safety and Security", href: "/safety-security" },
      { label: "Registrar", href: "/registrar" },
      { label: "Procurement", href: "/procurement" },
      { label: "Library", href: "/library" },
      { label: "Student Affairs", href: "/social-media" },
      { label: "Human Resource", href: "/hr" },
      { label: "Document Reviewer", href: "/drs" },
      { label: "News and Updates", href: "/news-updates" },
      { label: "IT Services", href: "/npcc" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "LSU", href: "/about" },
      { label: "The Founder's Life", href: "/about/founders-life" },
      { label: "Vocations", href: "/about/vocations" },
      { label: "Contact", href: "/about/contact" },
      { label: "The Hymn", href: "/about/hymn" },
      { label: "Lasallian Prayer", href: "/about/lasallian-prayer" },
    ],
  },
];
</script>

<template>
  <div
    class="z-50 w-full font-montserrat border-b-4 border-green-800 transition-all duration-300"
    :class="
      isScrolled ? 'bg-white backdrop-blur-md shadow-lg fixed' : ''
    "
  >
    <div class="px-3">
      <div class="flex justify-between items-center">
        <!-- Logo + Search -->
        <div class="flex items-center gap-4">
          <a href="/" class="flex items-center hover:opacity-90 transition">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/lsu-logotype-green.png"
              class="transition-all duration-300"
              :class="isScrolled ? 'w-48' : 'lg:w-60 w-48'"
              alt="La Salle University"
            />
          </a>
          <!-- Search Button -->
          <button
            @click="openSearchModal"
            aria-label="Search"
            class="group flex items-center gap-2 rounded-full bg-green-900 pl-3 px-1.5 py-2 text-white shadow-xl transition hover:bg-green-800"
          >
            <i class="fa fa-search text-xl"></i>
            <input
              readonly
              placeholder="Search..."
              class="w-0 opacity-0 bg-transparent text-sm placeholder-green-200 outline-none transition-all duration-300 group-hover:w-32 group-hover:opacity-100"
            />
          </button>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden lg:block">
          <ul class="flex items-center gap-1">
            <li
              class="relative group"
              v-for="item in desktopNav"
              :key="item.label"
            >
              <a
                :href="item.href || '#'"
                class="block whitespace-nowrap px-2 text-sm font-medium text-green-900 transition hover:bg-green-700 hover:text-white"
                :class="isScrolled ? 'lg:py-5 py-6' : 'lg:py-7 py-6'"
              >
                {{ item.label }}
              </a>

              <ul
                v-if="item.children"
                class="invisible absolute right-0 top-full z-50 min-w-[220px] border-t-4 border-green-900 bg-white shadow-xl opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              >
                <li v-for="child in item.children" :key="child.label">
                  <a
                    :href="child.href"
                    class="block border-b border-gray-100 px-5 py-3 text-sm text-gray-800 transition hover:bg-green-50 hover:text-green-900"
                  >
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <!-- Mobile Toggle -->
        <button
          @click="menuDetails = !menuDetails"
          class="lg:hidden p-2 text-green-900 transition hover:text-green-700"
          aria-label="Toggle menu"
        >
          <i
            class="fas text-3xl"
            :class="menuDetails ? 'fa-xmark' : 'fa-bars'"
          ></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu (Accordion) -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-screen opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="max-h-screen opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="menuDetails"
        class="fixed left-0 z-30 w-full overflow-y-auto border-t-2 border-green-800 bg-white shadow-2xl"
        :style="isScrolled
          ? 'top: 50px; max-height: calc(100vh - 50px)'
          : 'top: 52px; max-height: calc(100vh - 52px)'"
      >
        <ul class="pb-20">
          <li v-for="item in desktopNav" :key="item.label" class="border-b">
            <button
              v-if="item.children"
              @click="toggleMobile(item.label)"
              class="flex w-full items-center justify-between bg-gray-100 px-5 py-4 font-bold text-green-950"
            >
              <span>{{ item.label }}</span>
              <i
                class="fas text-xs transition-transform duration-200"
                :class="openMobile === item.label ? 'fa-chevron-up' : 'fa-chevron-down'"
              ></i>
            </button>

            <a
              v-else
              :href="item.href"
              class="block px-5 py-4 text-green-900 transition hover:bg-green-50"
            >
              {{ item.label }}
            </a>

            <ul
              v-if="item.children"
              v-show="openMobile === item.label"
              class="bg-[#f7faf7]"
            >
              <li v-for="child in item.children" :key="child.label">
                <a
                  :href="child.href"
                  class="block border-b border-gray-100 px-8 py-3 text-sm text-gray-700 transition hover:bg-white hover:text-green-900"
                >
                  {{ child.label }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </transition>
  </div>

  

  <!-- Universal Search Modal -->
  <div
    v-if="showSearchModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    @click="closeSearchModal"
  >
    <div
      class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all border border-gray-100 flex flex-col max-h-[90vh]"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gradient-to-r from-green-900 to-green-950 text-white">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white shadow-inner">
            <i class="fa fa-magnifying-glass text-lg"></i>
          </div>
          <div>
            <h3 class="text-base font-bold tracking-tight text-white">
              Universal Search
            </h3>
            <p class="text-xs text-green-200">
              Degree programs, colleges, news, updates, and announcements
            </p>
          </div>
        </div>
        <button
          @click="closeSearchModal"
          class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          aria-label="Close search"
        >
          <i class="fa fa-times text-sm"></i>
        </button>
      </div>

      <!-- Search Input Area -->
      <div class="border-b border-gray-100 bg-gray-50/50 p-4">
        <div class="relative flex items-center">
          <i
            class="fa fa-search absolute left-4 text-base text-gray-400 pointer-events-none"
          ></i>
          <input
            v-model="searchQuery"
            @input="performSearch"
            autofocus
            placeholder="Search courses, degree programs, colleges, news, announcements..."
            class="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 text-gray-400 hover:text-gray-600 p-1"
            title="Clear search"
          >
            <i class="fa fa-circle-xmark text-base"></i>
          </button>
        </div>

        <!-- Filter Tabs (When results exist) -->
        <div
          v-if="searchResults.length > 0"
          class="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-gray-200/60"
        >
          <span class="text-[0.7rem] font-bold text-gray-400 uppercase tracking-wider mr-1">Filter:</span>
          <button
            @click="activeTab = 'all'"
            class="px-3 py-1 rounded-full text-xs font-semibold transition"
            :class="
              activeTab === 'all'
                ? 'bg-green-900 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            "
          >
            All ({{ counts.total }})
          </button>
          <button
            @click="activeTab = 'academics'"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition"
            :class="
              activeTab === 'academics'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            "
          >
            <i class="fas fa-graduation-cap text-[0.7rem]"></i>
            Courses & Colleges ({{ counts.academics }})
          </button>
          <button
            @click="activeTab = 'news'"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition"
            :class="
              activeTab === 'news'
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            "
          >
            <i class="fas fa-newspaper text-[0.7rem]"></i>
            News & Updates ({{ counts.news }})
          </button>
        </div>
      </div>

      <!-- Results Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
        <!-- Loading State -->
        <div v-if="searchLoading" class="py-12 text-center">
          <div class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
            <i class="fa fa-spinner fa-spin text-xl"></i>
          </div>
          <p class="mt-3 text-sm font-medium text-gray-700">Searching through LSU records...</p>
        </div>

        <!-- Empty Query State / Quick Search Suggestions -->
        <div v-else-if="!searchQuery.trim()" class="py-8 px-4 text-center">
          <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-800 mb-3">
            <i class="fa fa-compass text-2xl"></i>
          </div>
          <h4 class="text-sm font-bold text-gray-800">What are you looking for?</h4>
          <p class="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            Type a program title, college abbreviation (e.g. Animo Run, SDGs, EdTech), degree course, or news topic.
          </p>

          <div class="mt-4 flex flex-wrap justify-center gap-1.5 max-w-lg mx-auto">
            <button
              v-for="tag in ['School of Graduate Studies', 'Animo Run', 'SDGs', 'EdTech', 'Nursing']"
              :key="tag"
              @click="quickSearch(tag)"
              class="px-2.5 py-1 text-xs font-medium text-green-900 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200/60 transition"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- No Results State -->
        <div
          v-else-if="filteredSearchResults.length === 0"
          class="py-12 text-center"
        >
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
            <i class="fa fa-magnifying-glass text-xl"></i>
          </div>
          <h4 class="text-sm font-bold text-gray-800">No results found</h4>
          <p class="mt-1 text-xs text-gray-500">
            We couldn't find anything matching "<span class="font-semibold text-gray-700">{{ searchQuery }}</span>"
            <span v-if="activeTab !== 'all'"> in this category</span>.
          </p>
          <button
            v-if="activeTab !== 'all'"
            @click="activeTab = 'all'"
            class="mt-3 text-xs font-bold text-green-800 hover:underline"
          >
            Show all categories
          </button>
        </div>

        <!-- Search Results List -->
        <div v-else class="space-y-2.5">
          <div
            v-for="item in filteredSearchResults"
            :key="item.id || item.content_id"
            @click="goToArticle(item)"
            class="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all duration-150 hover:border-green-600 hover:bg-green-50/30 hover:shadow-sm"
          >
            <!-- Header Badges -->
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span
                class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider border"
                :class="getItemCategory(item).bg"
              >
                <i :class="['fas', getItemCategory(item).icon, 'text-[0.65rem]']"></i>
                {{ getItemCategory(item).label }}
              </span>

              <span v-if="item.date" class="text-[0.7rem] text-gray-400 font-medium">
                {{ formatDate(item.date) }}
              </span>
            </div>

            <!-- Title -->
            <h4 class="text-sm font-bold text-green-950 group-hover:text-green-800 transition-colors leading-snug">
              {{ item.title }}
            </h4>

            <!-- Unit / Authors -->
            <p v-if="item.authors" class="mt-1 text-xs font-medium text-gray-600 flex items-center gap-1.5">
              <i class="fas fa-university text-green-800 text-[0.7rem]"></i>
              {{ item.authors }}
            </p>

            <!-- Description / Snippet -->
            <p v-if="item.descriptions || item.description" class="mt-1.5 line-clamp-2 text-xs text-gray-500 leading-relaxed">
              {{ item.descriptions || item.description }}
            </p>

            <!-- Card Footer: SDGs & Action -->
            <div class="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
              <div class="flex flex-wrap items-center gap-1">
                <span
                  v-for="badge in getSdgBadges(item).slice(0, 3)"
                  :key="badge.number"
                  class="rounded-md bg-green-100 px-1.5 py-0.5 text-[0.65rem] font-bold text-green-900 border border-green-200"
                >
                  SDG {{ badge.number }}
                </span>
              </div>

              <span class="inline-flex items-center gap-1 text-xs font-bold text-green-800 group-hover:translate-x-0.5 transition-transform">
                {{ getItemCategory(item).targetText }}
                <i class="fas fa-arrow-right text-[0.65rem]"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-gray-100 bg-gray-50 px-6 py-2.5 flex items-center justify-between text-[0.7rem] text-gray-500">
        <!-- <span class="hidden sm:inline">
          Tip: Courses and College pages route automatically to <strong class="text-green-900 font-semibold">/academics/tertiary-education/</strong>
        </span> -->
        <span class="text-gray-400 ml-auto">
          Press <kbd class="px-1.5 py-0.5 text-[0.65rem] font-semibold text-gray-800 bg-white border border-gray-300 rounded shadow-xs">ESC</kbd> to exit
        </span>
      </div>
    </div>
  </div>
</template>