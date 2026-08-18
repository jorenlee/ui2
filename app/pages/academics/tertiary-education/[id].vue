<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import moment from "moment";
import tertiaryJSON from "./tertiary.json";

const route = useRoute();
const itemId = route.params.id;
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const item = ref(null);
const loading = ref(true);
const errorMsg = ref("");

// Image modal state
const selectedImage = ref(null);
const showImageModal = ref(false);

const openImageModal = (url) => {
  selectedImage.value = url;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  selectedImage.value = null;
};

const isImageFile = (filename) => {
  if (!filename) return false;
  const ext = filename.toLowerCase().split(".").pop();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext);
};

const getFileUrl = (filename) => {
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${filename}`;
};

const imageFiles = computed(() => {
  if (!item.value || !item.value.files || !Array.isArray(item.value.files)) {
    return [];
  }
  return item.value.files.filter((file) => isImageFile(file));
});

const formattedDate = computed(() => {
  if (!item.value || !item.value.date) return "";
  return moment(item.value.date).format("MMMM D, YYYY");
});

// Program Abbreviation Extractor
const programAbbr = computed(() => {
  if (!item.value) return "";
  if (item.value.abbr) return item.value.abbr;
  const match = (item.value.title || "").match(/\(([A-Z0-9-]+)\)/i);
  return match ? match[1] : "";
});

// Program Clean Title (without parentheses abbr)
const programCleanTitle = computed(() => {
  if (!item.value || !item.value.title) return "";
  return item.value.title.replace(/\s*\([^)]*\)/g, "").trim();
});

// Section Parser
const extractListItems = (text) => {
  if (!text) return null;
  const regex = /(\d+[\.\)]\s+[\s\S]+?)(?=\d+[\.\)]\s+|$)/g;
  const matches = text.match(regex);
  if (matches && matches.length > 1) {
    return matches.map((m) => m.replace(/^\d+[\.\)]\s*/, "").trim());
  }
  return null;
};

const extractIntroText = (text) => {
  if (!text) return "";
  const match = text.match(/^([\s\S]+?)(?=\d+[\.\)]\s+)/);
  return match ? match[1].trim() : text;
};

const parsedSections = computed(() => {
  if (!item.value) return [];
  const rawText = item.value.descriptions || item.value.description || "";
  if (!rawText) return [];

  // Match bold markers like **Program Description ** or **Program Outcomes **
  const sectionHeaderRegex = /\*\*\s*([^*:]+?)\s*:?\s*\*\*/g;
  const matches = [...rawText.matchAll(sectionHeaderRegex)];

  if (matches.length === 0) {
    return [
      {
        id: "section-overview",
        title: "Program Overview",
        icon: "fa-book-open",
        bodyText: rawText,
        items: null,
        isRawHtml: rawText.includes("<") && rawText.includes(">"),
      },
    ];
  }

  const sections = [];
  for (let i = 0; i < matches.length; i++) {
    const title = matches[i][1].trim();
    const startPos = matches[i].index + matches[i][0].length;
    const endPos = i < matches.length - 1 ? matches[i + 1].index : rawText.length;
    const sectionBody = rawText.substring(startPos, endPos).trim();

    let icon = "fa-circle-info";
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("description") || lowerTitle.includes("overview")) icon = "fa-book-open";
    else if (lowerTitle.includes("objective") || lowerTitle.includes("goal")) icon = "fa-bullseye";
    else if (lowerTitle.includes("outcome") || lowerTitle.includes("competenc")) icon = "fa-award";
    else if (lowerTitle.includes("career") || lowerTitle.includes("opportunity")) icon = "fa-briefcase";
    else if (lowerTitle.includes("curriculum") || lowerTitle.includes("course")) icon = "fa-graduation-cap";

    const listItems = extractListItems(sectionBody);
    const introText = listItems ? extractIntroText(sectionBody) : sectionBody;

    sections.push({
      id: `section-${i}`,
      title: title,
      icon: icon,
      bodyText: introText,
      items: listItems,
      isRawHtml: false,
    });
  }

  // Leading text before first marker
  if (matches[0].index > 0) {
    const leading = rawText.substring(0, matches[0].index).trim();
    if (leading) {
      sections.unshift({
        id: "section-intro",
        title: "Program Overview",
        icon: "fa-book-open",
        bodyText: leading,
        items: null,
        isRawHtml: false,
      });
    }
  }

  return sections;
});

const fetchProgramDetails = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    // 1. Fetch directly by ID from CMS
    const res = await $fetch(`${endpoint.value}/api/cms/content/${itemId}/`).catch(() => null);
    if (res && (res.title || res.id)) {
      item.value = res;
    } else {
      // 2. Search in CMS content list
      const listRes = await $fetch(`${endpoint.value}/api/cms/content/list/`).catch(() => null);
      if (Array.isArray(listRes)) {
        const found = listRes.find(
          (c) =>
            String(c.id) === String(itemId) ||
            String(c.content_id) === String(itemId) ||
            (c.title && c.title.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(String(itemId).toLowerCase())) ||
            (c.filters && c.filters.toLowerCase().includes(String(itemId).toLowerCase()))
        );
        if (found) {
          item.value = found;
        }
      }
    }

    // 3. Fallback to static tertiary.json
    if (!item.value) {
      let staticFound = null;
      tertiaryJSON.tertiary.forEach((t) => {
        if (t.under_grad) {
          t.under_grad.forEach((tu) => {
            if (tu.list) {
              tu.list.forEach((col) => {
                if (col.link === itemId || col.abbr?.toLowerCase() === String(itemId).toLowerCase()) {
                  staticFound = {
                    title: col.title,
                    descriptions: `Program descriptions and curriculum for ${col.title}.`,
                    isCollege: true,
                    programs: col.programs,
                    collegeAbbr: col.abbr,
                  };
                } else if (col.programs) {
                  const matchP = col.programs.find(
                    (p) =>
                      p.abbr?.toLowerCase() === String(itemId).toLowerCase() ||
                      p.link === itemId ||
                      p.title?.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(String(itemId).toLowerCase())
                  );
                  if (matchP) {
                    staticFound = {
                      title: matchP.title,
                      descriptions: matchP.description || matchP.goalDescription || `Degree program offering under ${col.title}.`,
                      abbr: matchP.abbr,
                      collegeTitle: col.title,
                    };
                  }
                }
              });
            }
          });
        }
      });
      if (staticFound) {
        item.value = staticFound;
      }
    }
  } catch (err) {
    console.error("Error fetching program detail:", err);
    errorMsg.value = "Failed to load program details.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchProgramDetails();
});

useHead(() => ({
  title: item.value?.title ? `${item.value.title} | LSU Tertiary Education` : "Program Details | LSU",
}));
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col font-sans">
    <Header />

    <!-- ── HERO BANNER ── -->
    <div class="relative overflow-hidden bg-gradient-to-r from-green-950 via-green-900 to-green-950 text-white shadow-inner">
      <div class="max-w-[1280px] mx-auto px-[5%] py-6 lg:py-8 relative z-10">
        <div class="flex flex-wrap items-center gap-3 mb-2">
          <span class="bg-green-700/80 text-white text-[0.65rem] font-mono font-bold px-3 py-1 rounded border border-green-500/30 uppercase tracking-widest shadow-sm">
            LASALLIAN TERTIARY EDUCATION
          </span>
          <span v-if="programAbbr" class="bg-yellow-500/90 text-gray-950 text-[0.65rem] font-mono font-bold px-2.5 py-1 rounded shadow-sm">
            {{ programAbbr }}
          </span>
        </div>
        <h1 class="text-xl lg:text-3xl font-extrabold text-white tracking-wide uppercase leading-tight max-w-4xl">
          {{ programCleanTitle || item?.title || 'Degree Program Details' }}
        </h1>
        <p v-if="programAbbr && programCleanTitle" class="mt-1 text-green-200 text-xs font-semibold tracking-wider uppercase">
          {{ item?.title }}
        </p>
      </div>
    </div>

    <!-- ── BREADCRUMB ── -->
    <nav class="bg-white border-b border-gray-200 px-[5%] shadow-sm">
      <div class="max-w-[1280px] mx-auto">
        <ul class="flex items-center flex-wrap gap-x-1.5 h-11 text-[0.75rem] text-gray-500 overflow-x-auto whitespace-nowrap list-none m-0 p-0">
          <li class="flex items-center gap-1.5">
            <NuxtLink to="/" class="text-green-900 no-underline capitalize hover:underline font-medium">
              <i class="fas fa-home text-xs mr-1 text-green-800"></i>Home
            </NuxtLink>
          </li>
          <li class="flex items-center gap-1.5">
            <i class="fas fa-chevron-right text-[0.55rem] text-gray-400"></i>
            <NuxtLink to="/academics/tertiary-education" class="text-green-900 no-underline capitalize hover:underline font-medium">Academics</NuxtLink>
          </li>
          <li class="flex items-center gap-1.5">
            <i class="fas fa-chevron-right text-[0.55rem] text-gray-400"></i>
            <NuxtLink to="/academics/tertiary-education" class="text-green-900 no-underline capitalize hover:underline font-medium">Tertiary Education</NuxtLink>
          </li>
          <li class="flex items-center gap-1.5">
            <i class="fas fa-chevron-right text-[0.55rem] text-gray-400"></i>
            <span class="capitalize text-gray-400 truncate max-w-[240px] font-semibold">{{ item?.title || 'Program' }}</span>
          </li>
        </ul>
      </div>
    </nav>

    <!-- ── MAIN CONTENT ── -->
    <div class="max-w-[1280px] mx-auto px-[5%] pt-8 pb-16 flex-1 w-full">

      <!-- Back Navigation Button -->
      <div class="mb-6">
        <NuxtLink to="/academics/tertiary-education" class="inline-flex items-center gap-2 text-xs font-bold text-green-900 uppercase tracking-wider hover:text-green-700 transition-colors bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:shadow">
          <i class="fas fa-arrow-left text-green-800"></i> Back to All Programs
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-sm">
        <i class="fas fa-circle-notch fa-spin text-green-900 text-4xl mb-4"></i>
        <p class="text-gray-700 text-sm font-bold uppercase tracking-wider">Loading Program Specifications...</p>
      </div>

      <!-- Error / Not Found State -->
      <div v-else-if="!item && !loading" class="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
        <i class="fas fa-graduation-cap text-gray-300 text-6xl mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Program Details Unavailable</h2>
        <p class="text-gray-600 text-sm mb-6 max-w-md mx-auto">The requested degree program specifications could not be loaded or located at this time.</p>
        <NuxtLink to="/academics/tertiary-education" class="inline-flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-800 transition-all shadow">
          <i class="fas fa-th-list"></i> Browse All Programs
        </NuxtLink>
      </div>

      <!-- Main Program Detail Layout -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <!-- LEFT COLUMN: Program Content Sections (8 Cols) -->
        <div class="lg:col-span-8 space-y-6">

          <!-- Header Card -->
          <div class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm border-l-4 border-l-green-900">
            <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
              <div>
                <span class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-green-900 block mb-1">PROGRAM DEGREE</span>
                <h2 class="text-xl lg:text-2xl font-extrabold text-gray-900 leading-snug">
                  {{ item.title }}
                </h2>
              </div>
              <span v-if="programAbbr" class="text-sm font-mono font-bold bg-green-50 text-green-900 px-3 py-1.5 border border-green-200 rounded-lg shrink-0">
                {{ programAbbr }}
              </span>
            </div>

            <!-- Meta Badges -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span v-if="item.authors" class="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 font-medium">
                <i class="fas fa-university text-green-900"></i> {{ item.authors }}
              </span>
              <span v-if="formattedDate" class="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 font-medium">
                <i class="fas fa-calendar-alt text-gray-500"></i> Updated: {{ formattedDate }}
              </span>
            </div>
          </div>

          <!-- Structured Sections -->
          <div v-for="section in parsedSections" :key="section.id" class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm transition-all hover:border-gray-300">
            <!-- Section Title -->
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div class="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-900 text-sm shrink-0">
                <i class="fas" :class="section.icon"></i>
              </div>
              <h3 class="text-lg lg:text-xl font-extrabold text-gray-900 tracking-wide uppercase">
                {{ section.title }}
              </h3>
            </div>

            <!-- Raw HTML fallback if overview html -->
            <div v-if="section.isRawHtml" class="prose max-w-none text-gray-700 text-sm leading-relaxed" v-html="section.bodyText"></div>

            <!-- Parsed Content Body -->
            <div v-else class="space-y-4">
              <!-- Body Text / Paragraph -->
              <p v-if="section.bodyText" class="text-gray-700 text-sm lg:text-base leading-relaxed text-justify">
                {{ section.bodyText }}
              </p>

              <!-- Numbered List Items Card Grid -->
              <div v-if="section.items && section.items.length > 0" class="mt-6 space-y-3">
                <div
                  v-for="(itemText, idx) in section.items"
                  :key="idx"
                  class="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200/80 transition-all hover:bg-green-50/30 hover:border-green-300 group"
                >
                  <span class="w-7 h-7 rounded-full bg-green-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-green-800">
                    {{ idx + 1 }}
                  </span>
                  <p class="text-gray-800 text-sm leading-relaxed group-hover:text-green-950 font-medium">
                    {{ itemText }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Static College Offerings Fallback -->
          <div v-if="item.isCollege && item.programs && item.programs.length > 0" class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            <h3 class="text-lg font-bold uppercase tracking-wider text-green-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <i class="fas fa-list-check text-green-800"></i> Available Programs under {{ item.title }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="(p, pIdx) in item.programs" :key="pIdx" class="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between hover:border-green-300 hover:bg-green-50/20 transition-all">
                <span class="text-xs font-semibold text-gray-900 leading-snug">{{ p.title }}</span>
                <span v-if="p.abbr" class="text-[0.65rem] font-mono font-bold bg-green-100 text-green-900 px-2 py-0.5 rounded border border-green-200 shrink-0 ml-2">{{ p.abbr }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT COLUMN: Sidebar (4 Cols) -->
        <div class="lg:col-span-4 space-y-6 sticky top-6">

          <!-- Image Spotlight Card -->
          <div v-if="imageFiles.length > 0" class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-gray-400 mb-3 flex items-center justify-between">
              <span class="flex items-center gap-2"><i class="fas fa-image text-green-900"></i> PROGRAM SPOTLIGHT</span>
              <span class="text-[0.6rem] text-gray-400 font-normal">Click image to enlarge</span>
            </div>

            <div class="space-y-4">
              <div
                v-for="(file, idx) in imageFiles"
                :key="idx"
                class="relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-b from-gray-100 via-gray-50 to-white p-3 group cursor-pointer shadow-inner flex items-center justify-center"
                @click="openImageModal(getFileUrl(file))"
              >
                <img
                  :src="getFileUrl(file)"
                  :alt="item.title"
                  class="w-full max-h-[360px] h-auto object-contain transition-all duration-300 group-hover:scale-105 filter drop-shadow-md"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 rounded-xl backdrop-blur-[1px]">
                  <i class="fas fa-search-plus text-base"></i> View Full Image
                </div>
              </div>
            </div>
          </div>

          <!-- Admissions & Enrollment Action Card -->
          <div class="bg-gradient-to-br from-green-950 to-green-900 text-white rounded-xl p-6 shadow-md border border-green-800">
            <div class="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-400 text-lg mb-4">
              <i class="fas fa-user-graduate"></i>
            </div>
            <h4 class="text-lg font-extrabold uppercase tracking-wide mb-2 text-white">
              Enroll at La Salle
            </h4>
            <p class="text-xs text-white/75 leading-relaxed mb-6">
              Take the next step in your academic journey. Inquire now or check admission requirements for {{ programAbbr || 'this program' }}.
            </p>
            <div class="space-y-2.5">
              <a
                href="/admissions"
                class="block text-center w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow"
              >
                Apply for Admission
              </a>
              <NuxtLink
                to="/academics/tertiary-education"
                class="block text-center w-full py-2.5 px-4 border border-white/30 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
              >
                Browse All Programs
              </NuxtLink>
            </div>
          </div>

          <!-- Quick Program Info Card -->
          <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h4 class="text-xs font-bold tracking-[0.15em] uppercase text-gray-500 border-b border-gray-100 pb-2">
              PROGRAM METADATA
            </h4>
            <div class="space-y-3 text-xs">
              <div class="flex justify-between items-center py-1 border-b border-dashed border-gray-100">
                <span class="text-gray-500 font-medium">Unit / Department:</span>
                <span class="text-gray-900 font-bold">{{ item.authors || 'Higher Education' }}</span>
              </div>
              <div v-if="programAbbr" class="flex justify-between items-center py-1 border-b border-dashed border-gray-100">
                <span class="text-gray-500 font-medium">Code:</span>
                <span class="text-green-900 font-bold font-mono">{{ programAbbr }}</span>
              </div>
              <div class="flex justify-between items-center py-1 border-b border-dashed border-gray-100">
                <span class="text-gray-500 font-medium">Level:</span>
                <span class="text-gray-900 font-bold">Undergraduate</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="text-gray-500 font-medium">Status:</span>
                <span class="text-green-700 font-bold flex items-center gap-1">
                  <i class="fas fa-check-circle text-xs"></i> Active
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      @click="closeImageModal"
    >
      <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" @click.stop>
        <button
          @click="closeImageModal"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold focus:outline-none"
        >
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedImage" :alt="item?.title" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
/* Scoped styles for rich text typography if fallback HTML is present */
.prose :deep(p) {
  margin-bottom: 1rem;
  line-height: 1.7;
}
.prose :deep(h1), .prose :deep(h2), .prose :deep(h3) {
  color: #14532d;
  font-weight: 800;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
</style>
