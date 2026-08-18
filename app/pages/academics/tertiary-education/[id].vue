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

// Program / College Abbreviation Extractor
const programAbbr = computed(() => {
  if (!item.value) return "";
  if (item.value.abbr) return item.value.abbr;
  if (item.value.collegeAbbr) return item.value.collegeAbbr;
  const match = (item.value.title || "").match(/\(([A-Z0-9-]+)\)/i);
  if (match) return match[1];
  const firstWord = (item.value.title || "").split(" ")[0];
  if (firstWord && firstWord === firstWord.toUpperCase() && firstWord.length <= 6) return firstWord;
  return "";
});

// Program Clean Title (without parentheses abbr)
const programCleanTitle = computed(() => {
  if (!item.value || !item.value.title) return "";
  return item.value.title.replace(/\s*\([^)]*\)/g, "").trim();
});

// SDG Colors Mapping
const sdgColors = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a",
};

const sdgBadges = computed(() => {
  if (!item.value?.filters) return [];
  const filters = item.value.filters.toLowerCase();
  const badges = [];
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`, `\\bsdg ${i}\\b`, `\\bsdg-${i}\\b`, `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`, `\\bgoal${i}\\b`, `\\bsdg${i.toString().padStart(2, "0")}\\b`,
    ];
    if (patterns.some((pattern) => new RegExp(pattern, "i").test(filters))) {
      badges.push({ number: i, color: sdgColors[i] || "#14532d" });
    }
  }
  return badges;
});

// Check if content represents a College VMG or College Info item
const isCollegeContent = computed(() => {
  if (!item.value) return false;
  if (item.value.isCollege) return true;
  const title = (item.value.title || "").toLowerCase();
  const filters = (item.value.filters || "").toLowerCase();
  return (
    title.includes("college") ||
    title.includes("vision") ||
    title.includes("mission") ||
    title.includes("vmg") ||
    filters.includes("college") ||
    filters.includes("vision") ||
    filters.includes("mission")
  );
});

// Section Parser
const extractListItems = (text) => {
  if (!text) return null;
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const listItems = [];
  for (const line of lines) {
    const match = line.match(/^(?:\d+[\.\)]|[-•*])\s*(.+)/);
    if (match) {
      listItems.push(match[1].trim());
    }
  }
  return listItems.length > 0 ? listItems : null;
};

const extractIntroText = (text) => {
  if (!text) return "";
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const nonListLines = [];
  for (const line of lines) {
    if (/^(?:\d+[\.\)]|[-•*])\s*/.test(line)) {
      break;
    }
    nonListLines.push(line);
  }
  return nonListLines.join("\n").trim();
};

const parsedSections = computed(() => {
  if (!item.value) return [];
  const rawText = item.value.descriptions || item.value.description || "";
  if (!rawText) return [];

  // Match bold markers like **Program Description**, **Goal**, **General Objectives**, **Vision**, **Mission**
  const sectionHeaderRegex = /\*\*\s*([^*:]+?)\s*:?\s*\*\*/g;
  const matches = [...rawText.matchAll(sectionHeaderRegex)];

  if (matches.length === 0) {
    const listItems = extractListItems(rawText);
    const introText = listItems ? extractIntroText(rawText) : rawText;
    return [
      {
        id: "section-overview",
        title: isCollegeContent.value ? "College Overview & Goals" : "Program Overview",
        icon: isCollegeContent.value ? "fa-university" : "fa-book-open",
        bodyText: introText,
        items: listItems,
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
    if (lowerTitle.includes("vision")) icon = "fa-eye";
    else if (lowerTitle.includes("mission")) icon = "fa-compass";
    else if (lowerTitle.includes("objective") || lowerTitle.includes("goal")) icon = "fa-bullseye";
    else if (lowerTitle.includes("description") || lowerTitle.includes("overview")) icon = "fa-book-open";
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
      isRawHtml: sectionBody.includes("<") && sectionBody.includes(">"),
    });
  }

  // Leading text before first marker
  if (matches[0].index > 0) {
    const leading = rawText.substring(0, matches[0].index).trim();
    if (leading) {
      sections.unshift({
        id: "section-intro",
        title: isCollegeContent.value ? "College Overview" : "Overview",
        icon: "fa-book-open",
        bodyText: leading,
        items: null,
        isRawHtml: leading.includes("<") && leading.includes(">"),
      });
    }
  }

  return sections;
});

// CMS-driven programs under the matched college (populated during fetch)
const collegePrograms = ref([]);
const collegeProgramsLoading = ref(false);

const isBachelorProgram = (cmsItem) => {
  if (!cmsItem || !cmsItem.title) return false;
  const t = cmsItem.title.trim().toLowerCase();
  const f = (cmsItem.filters || "").toLowerCase();
  return (
    t.includes("bachelor") ||
    t.startsWith("bs ") ||
    t.startsWith("bsit") ||
    t.startsWith("bscs") ||
    t.startsWith("ba ") ||
    t.includes("bachelor of") ||
    f.includes("programs")
  );
};

// Resolve route for a CMS program item
const getProgramRoute = (p) => {
  if (p.id) return `/academics/tertiary-education/${p.id}`;
  if (p.content_id) return `/academics/tertiary-education/${p.content_id}`;
  return `/academics/tertiary-education`;
};

// Check if a program card is the currently viewed page
const isCurrentProgram = (p) => {
  const currentId = String(itemId).toLowerCase();
  return (
    String(p.id || "") === String(itemId) ||
    String(p.content_id || "") === String(itemId) ||
    (p.abbr || "").toLowerCase() === currentId
  );
};

// Resolve the college abbreviation for any CMS item (VMG OR individual program)
const resolveCollegeAbbr = (cmsItem, cmsId) => {
  const pageFilters = (cmsItem?.filters || "").toLowerCase();
  const pageTitle = (cmsItem?.title || "").toLowerCase();
  const cleanId = String(cmsId).toLowerCase();

  let matchedAbbr = "";
  tertiaryJSON.tertiary.forEach((t) => {
    if (t.under_grad) {
      t.under_grad.forEach((tu) => {
        if (tu.list) {
          tu.list.forEach((col) => {
            if (matchedAbbr) return; // already found
            const cAbbr = (col.abbr || "").toLowerCase();
            const cTitle = (col.title || "").toLowerCase();

            // Direct match: this page IS the college VMG
            if (cleanId === cAbbr || cleanId.includes(cAbbr) || pageTitle.includes(cAbbr) || pageFilters.includes(cAbbr) || pageTitle.includes(cTitle)) {
              matchedAbbr = cAbbr;
              return;
            }

            // Indirect match: this page is a program UNDER this college
            if (col.programs) {
              const inCollege = col.programs.some((p) => {
                const pAbbr = (p.abbr || "").toLowerCase();
                const pLink = (p.link || "").toLowerCase();
                const pSlug = (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return pAbbr === cleanId || pLink === cleanId || pSlug === cleanId || pSlug.includes(cleanId) || cleanId.includes(pAbbr);
              });
              if (inCollege) matchedAbbr = cAbbr;
            }
          });
        }
      });
    }
  });

  // Also check pageFilters directly for college abbr keywords
  if (!matchedAbbr) {
    const abbrList = ["ccsea", "cas", "cbe", "che", "ced", "cn", "crim", "ctaf"];
    for (const a of abbrList) {
      if (pageFilters.includes(a) || cleanId.includes(a)) {
        matchedAbbr = a;
        break;
      }
    }
  }

  return matchedAbbr;
};

// Fetch CMS programs for the college this page belongs to (works for ALL pages)
const fetchCollegeProgramsFromCMS = async (cmsListRes) => {
  collegeProgramsLoading.value = true;
  try {
    const list = cmsListRes || await $fetch(`${endpoint.value}/api/cms/content/list/`).catch(() => null);
    if (!Array.isArray(list)) return;

    const matchedAbbr = resolveCollegeAbbr(item.value, itemId);
    if (!matchedAbbr) return;

    // Filter CMS list: items that match the college abbr AND are bachelor programs
    const matched = list.filter((cmsItem) => {
      if (!cmsItem) return false;
      const f = (cmsItem.filters || "").toLowerCase();
      const t2 = (cmsItem.title || "").toLowerCase();
      const d = (cmsItem.descriptions || cmsItem.description || "").toLowerCase();
      const matchesCollege = f.includes(matchedAbbr) || t2.includes(matchedAbbr) || d.includes(matchedAbbr);
      return matchesCollege && isBachelorProgram(cmsItem);
    });

    collegePrograms.value = matched.map((cmsItem) => ({
      id: cmsItem.id,
      content_id: cmsItem.content_id,
      title: cmsItem.title,
      abbr: (() => {
        const m = (cmsItem.title || "").match(/\(([A-Z0-9-]{2,8})\)/i);
        return m ? m[1] : "";
      })(),
      filters: cmsItem.filters || "",
    }));
  } finally {
    collegeProgramsLoading.value = false;
  }
};

const fetchProgramDetails = async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const cleanId = String(itemId).toLowerCase().trim();

    // ── Fire BOTH requests in parallel ──────────────────────────────────────
    const [res, listRes] = await Promise.all([
      $fetch(`${endpoint.value}/api/cms/content/${itemId}/`).catch(() => null),
      $fetch(`${endpoint.value}/api/cms/content/list/`).catch(() => null),
    ]);

    // 1. Direct CMS hit by numeric id
    if (res && (res.title || res.id)) {
      item.value = res;
    } else if (Array.isArray(listRes)) {
      // 2. Search the list by id / slug / filters
      const found = listRes.find((c) => {
        if (!c) return false;
        const cId = String(c.id || "").toLowerCase();
        const cContentId = String(c.content_id || "").toLowerCase();
        const cTitle = (c.title || "").toLowerCase();
        const cFilters = (c.filters || "").toLowerCase();
        const titleSlug = cTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        return (
          cId === cleanId ||
          cContentId === cleanId ||
          titleSlug === cleanId ||
          titleSlug.includes(cleanId) ||
          cleanId.includes(titleSlug) ||
          cFilters.includes(cleanId)
        );
      });

      if (found) {
        item.value = found;
      } else {
        // 3. College VMG fallback (e.g. /ccsea → "CCSEA Vision Mission Goal")
        const collegeVmg = listRes.find((c) => {
          if (!c) return false;
          const cFilters = (c.filters || "").toLowerCase();
          const cTitle = (c.title || "").toLowerCase();
          const matchesAbbr =
            cFilters.includes(cleanId) ||
            cTitle.includes(cleanId) ||
            cleanId.includes(cTitle);
          const isVmg =
            cTitle.includes("vision") ||
            cTitle.includes("mission") ||
            cTitle.includes("goal") ||
            cFilters.includes("vision") ||
            cFilters.includes("college");
          return matchesAbbr && isVmg;
        });
        if (collegeVmg) item.value = collegeVmg;
      }
    }

    // 4. Synchronous static JSON fallback (no extra network cost)
    if (!item.value) {
      let staticFound = null;
      tertiaryJSON.tertiary.forEach((t) => {
        if (t.under_grad) {
          t.under_grad.forEach((tu) => {
            if (tu.list) {
              tu.list.forEach((col) => {
                const cAbbr = (col.abbr || "").toLowerCase();
                const cLink = (col.link || "").toLowerCase();

                if (cleanId === cLink || cleanId === cAbbr || cleanId.includes(cAbbr)) {
                  staticFound = {
                    title: `${col.abbr} Vision, Mission & Goals`,
                    descriptions: `**College Overview**\n${col.title} (${col.abbr})\n\n**Goal**\nThe ${col.title} aims to provide high quality education with strong foundation of technical and professional expertise.\n\n**General Objectives**\n1. Prepare the students to be globally competent with high-level technical expertise.\n2. Develop students' effective communication and leadership skills.\n3. Instill a deep sense of environmental, social, and ethical responsibility.\n4. Promote passion for life-long learning and research.`,
                    isCollege: true,
                    programs: col.programs,
                    collegeAbbr: col.abbr,
                    authors: col.title,
                  };
                } else if (!staticFound && col.programs) {
                  const matchP = col.programs.find(
                    (p) =>
                      p.abbr?.toLowerCase() === cleanId ||
                      p.link === cleanId ||
                      (p.title && p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(cleanId))
                  );
                  if (matchP) {
                    staticFound = {
                      title: matchP.title,
                      descriptions: matchP.description || matchP.goalDescription || `Degree program offering under ${col.title}.`,
                      abbr: matchP.abbr,
                      collegeTitle: col.title,
                      authors: col.title,
                    };
                  }
                }
              });
            }
          });
        }
      });
      if (staticFound) item.value = staticFound;
    }

    // 5. Populate college programs grid for ALL pages (reuses already-fetched listRes)
    if (item.value) {
      fetchCollegeProgramsFromCMS(listRes || null); // intentionally not awaited — loads in background
    }
  } catch (err) {
    console.error("Error fetching program/college detail:", err);
    errorMsg.value = "Failed to load details.";
  } finally {
    loading.value = false;  // page content shows immediately; programs grid loads in background
  }
};

onMounted(async () => {
  await fetchProgramDetails();
});

useHead(() => ({
  title: item.value?.title ? `${item.value.title} | LSU Tertiary Education` : "Program / College Details | LSU",
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
        <h1 class="text-xl lg:text-3xl font-extrabold text-white tracking-wide uppercase leading-tight max-w-8xl">
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
                <span class="text-[0.65rem] font-bold tracking-[0.2em] uppercase text-green-900 block mb-1">
                  {{ isCollegeContent ? 'COLLEGE VISION, MISSION & GOALS' : 'PROGRAM DEGREE' }}
                </span>
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

            <!-- SDG Badges -->
            <div v-if="sdgBadges.length > 0" class="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
              <span class="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 mr-1">SDGs:</span>
              <span
                v-for="sdg in sdgBadges"
                :key="sdg.number"
                class="text-[0.65rem] font-bold text-white px-2 py-0.5 rounded shadow-xs"
                :style="{ backgroundColor: sdg.color }"
              >
                SDG {{ sdg.number }}
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

          <!-- Programs Offered (shown on ALL pages — college VMG and individual programs) -->
          <div v-if="collegeProgramsLoading || collegePrograms.length > 0" class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <h3 class="text-lg font-bold uppercase tracking-wider text-green-900 flex items-center gap-2">
                <i class="fas fa-graduation-cap text-green-800"></i>
                Degree Programs Offered
              </h3>
              <span v-if="programAbbr" class="text-[0.65rem] font-bold text-green-900 bg-green-50 border border-green-200 px-2 py-1 rounded font-mono">
                {{ programAbbr }}
              </span>
            </div>

            <!-- Loading skeleton -->
            <div v-if="collegeProgramsLoading" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="n in 6" :key="n" class="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>

            <!-- CMS Programs Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NuxtLink
                v-for="(p, pIdx) in collegePrograms"
                :key="pIdx"
                :to="getProgramRoute(p)"
                :class="[
                  'group flex items-center justify-between p-4 rounded-xl border transition-all no-underline cursor-pointer',
                  isCurrentProgram(p)
                    ? 'bg-green-900 border-green-700 shadow-md ring-2 ring-green-500/40 pointer-events-none'
                    : 'bg-gray-50 border-gray-200 hover:border-green-700 hover:bg-green-50/40 hover:shadow-md'
                ]"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isCurrentProgram(p) ? 'bg-white/20' : 'bg-green-900/10 group-hover:bg-green-900'
                  ]">
                    <i :class="[
                      'fas fa-book-open text-xs transition-colors',
                      isCurrentProgram(p) ? 'text-white' : 'text-green-900 group-hover:text-white'
                    ]"></i>
                  </div>
                  <span :class="[
                    'text-xs font-semibold leading-snug transition-colors',
                    isCurrentProgram(p) ? 'text-white' : 'text-gray-900 group-hover:text-green-900'
                  ]">{{ p.title }}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-2">
                  <span v-if="p.abbr" :class="[
                    'text-[0.6rem] font-mono font-bold px-2 py-0.5 rounded border',
                    isCurrentProgram(p) ? 'bg-white/20 text-white border-white/30' : 'bg-green-100 text-green-900 border-green-200'
                  ]">
                    {{ p.abbr }}
                  </span>
                  <i v-if="!isCurrentProgram(p)" class="fas fa-chevron-right text-[0.6rem] text-gray-400 group-hover:text-green-700 transition-colors"></i>
                  <i v-else class="fas fa-circle-dot text-[0.6rem] text-green-300"></i>
                </div>
              </NuxtLink>
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
