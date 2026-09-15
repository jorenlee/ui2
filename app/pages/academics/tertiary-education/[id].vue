<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import moment from "moment";

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

// Detect PAASCU Accreditation Level and Information
const paascuInfo = computed(() => {
  if (!item.value) return null;
  const authors = item.value.authors || item.value.author || "";
  const filters = item.value.filters || item.value.filter || "";
  const title = item.value.title || "";
  const descriptions = item.value.descriptions || item.value.description || "";
  const combined = `${authors} ${filters} ${title} ${descriptions}`;

  const hasPaascu =
    /paascu/i.test(combined) ||
    (item.value.files && Array.isArray(item.value.files) && item.value.files.some((f) => /paascu/i.test(f)));

  if (!hasPaascu) return null;

  // Extract level if specified (e.g. "PAASCU LEVEL 3", "PAASCU LEVEL III", "PAASCU LEVEL 2", "PAASCU LEVEL 1")
  let level = "";
  const levelMatch = combined.match(/paascu\s+(?:level\s*[:\-]?\s*([0-9IVXLCDM]+)|(accredited|reaccredited|candidate))/i);
  if (levelMatch) {
    if (levelMatch[1]) {
      const romanOrNum = levelMatch[1].toUpperCase();
      const numMap = {
        "1": "Level I",
        "2": "Level II",
        "3": "Level III",
        "4": "Level IV",
        "I": "Level I",
        "II": "Level II",
        "III": "Level III",
        "IV": "Level IV",
      };
      level = numMap[romanOrNum] || `Level ${romanOrNum}`;
    } else if (levelMatch[2]) {
      level = levelMatch[2].toLowerCase() === "reaccredited" ? "Re-accredited" : "Accredited";
    }
  }

  if (!level) {
    level = "Accredited";
  }

  // Find dedicated PAASCU image file if uploaded in CMS files
  let paascuFile = null;
  if (item.value.files && Array.isArray(item.value.files)) {
    paascuFile = item.value.files.find((f) => isImageFile(f) && /paascu/i.test(f));
  }

  const imageUrl = paascuFile
    ? getFileUrl(paascuFile)
    : "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PAASCU-Reaccredited.png";

  return {
    isAccredited: true,
    level,
    titleBadge: level.toLowerCase().includes("level") ? `PAASCU ${level.toUpperCase()}` : "PAASCU ACCREDITED",
    statusBadge: level.toLowerCase().includes("level") ? `${level} Accredited` : "Accredited Program",
    imageUrl,
    paascuFileName: paascuFile,
  };
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
  if (item.value.isCollege === true) return true;
  const title = (item.value.title || "").trim().toLowerCase();

  // If title begins with or contains an academic degree program, it is NOT college content
  if (
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs-") ||
    title.startsWith("ba ") ||
    title.startsWith("ba-") ||
    title.startsWith("bee") ||
    title.startsWith("bpe") ||
    title.startsWith("btle") ||
    title.startsWith("blis") ||
    title.startsWith("doctor") ||
    title.startsWith("master") ||
    title.includes("juris doctor")
  ) {
    return false;
  }

  return (
    title.includes("college of") ||
    title.includes("school of") ||
    title.includes("vision, mission") ||
    title.includes("vmg") ||
    title.endsWith("vision mission goals") ||
    title.endsWith("overview")
  );
});

// Academic Level Extracted from CMS Content Filters & Metadata
const programLevel = computed(() => {
  if (!item.value) return "Tertiary Education";
  const filters = (item.value.filters || "").toLowerCase();
  const title = (item.value.title || "").toLowerCase();
  const authors = (item.value.authors || "").toLowerCase();

  // 1. Direct match in filters
  if (
    filters.includes("graduate level") ||
    filters.includes("graduate studies") ||
    filters.includes("postgraduate") ||
    filters.includes("post-graduate") ||
    filters.includes("doctorate level") ||
    filters.includes("master level")
  ) {
    return "Graduate Level";
  }
  if (
    filters.includes("undergraduate level") ||
    filters.includes("undergraduate") ||
    filters.includes("bachelor level") ||
    filters.includes("baccalaureate")
  ) {
    return "Undergraduate";
  }
  if (
    filters.includes("basic education") ||
    filters.includes("senior high") ||
    filters.includes("junior high") ||
    filters.includes("elementary")
  ) {
    return "Basic Education";
  }

  // 2. Keyword check on title & college context
  const isGrad =
    title.includes("master") ||
    title.includes("doctor") ||
    title.includes("juris doctor") ||
    title.includes("school of graduate") ||
    title.includes("graduate studies") ||
    authors.includes("sgs") ||
    filters.includes("sgs") ||
    /\b(ph\.?d\.?|dba|edd|mba|mpa|maed|med|msn|mit|msit|mscs)\b/i.test(title);

  if (isGrad) return "Graduate Level";

  const isUndergrad =
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs-") ||
    title.startsWith("ba ") ||
    title.startsWith("ba-") ||
    title.startsWith("bee") ||
    title.startsWith("bpe") ||
    title.startsWith("btle") ||
    title.startsWith("blis");

  if (isUndergrad) return "Undergraduate";

  if (isCollegeContent.value) {
    if (title.includes("graduate") || filters.includes("sgs")) return "Graduate Level";
    return "Tertiary Education";
  }

  return "Undergraduate";
});

// Program publication / verification status from CMS Content Filters
const programStatus = computed(() => {
  if (!item.value) return { text: "Active", isPublished: true, isVerified: false };
  const filters = (item.value.filters || "").toLowerCase();

  const isVerified = filters.includes("verified");
  const isApproved = filters.includes("approved");
  const isPublished = filters.includes("published");

  if (isPublished || isApproved || isVerified || filters.includes("active")) {
    let label = "Active";
    if (isPublished && isVerified) label = "Published & Verified";
    else if (isPublished) label = "Published";
    else if (isVerified) label = "Verified";
    return { text: label, isPublished: true, isVerified };
  }
  if (filters.includes("draft")) {
    return { text: "Draft", isPublished: false, isVerified: false };
  }
  if (filters.includes("archived")) {
    return { text: "Archived", isPublished: false, isVerified: false };
  }
  return { text: "Active", isPublished: true, isVerified: false };
});

// Parsed general filter tags from CMS
const parsedFilterTags = computed(() => {
  if (!item.value?.filters) return [];
  return item.value.filters
    .split(",")
    .map((t) => t.trim())
    .filter((t) => {
      if (!t) return false;
      // Exclude SDGs (handled separately)
      return !/^(sdg\s*\d+|goal\s*\d+|sdg-\d+|sdg_\d+)$/i.test(t);
    });
});

// Inline Markdown and text formatter (handles bold, italics, linebreaks)
const formatInlineMarkdown = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />');
};

// Section Block Parser: distinguishes between paragraphs, numbered lists, and bullet lists
const parseSectionBlocks = (rawText) => {
  if (!rawText) return [];
  const clean = rawText.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  const lines = clean.split("\n");
  const blocks = [];
  let currentList = null; // { type: 'bullet' | 'number', items: [] }
  let currentParagraph = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join("\n").trim();
      if (text) {
        blocks.push({ type: "paragraph", text });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList && currentList.items.length > 0) {
      blocks.push(currentList);
      currentList = null;
    }
  };

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    // Check for bullet list item: starts with -, *, •, +
    const bulletMatch = trimmed.match(/^[-*•+]\s+(.+)/);
    // Check for numbered list item: starts with 1., 1), (1), etc.
    const numberMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)/) || trimmed.match(/^\((\d+)\)\s+(.+)/);

    if (bulletMatch) {
      flushParagraph();
      if (currentList && currentList.type !== "bullet") {
        flushList();
      }
      if (!currentList) {
        currentList = { type: "bullet", items: [] };
      }
      currentList.items.push({
        text: bulletMatch[1].trim(),
      });
    } else if (numberMatch) {
      flushParagraph();
      if (currentList && currentList.type !== "number") {
        flushList();
      }
      if (!currentList) {
        currentList = { type: "number", items: [] };
      }
      currentList.items.push({
        num: numberMatch[1],
        text: numberMatch[2].trim(),
      });
    } else {
      if (currentList) {
        flushList();
      }
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();
  flushList();

  return blocks;
};

const parsedSections = computed(() => {
  if (!item.value) return [];
  const rawText = item.value.descriptions || item.value.description || "";
  if (!rawText) return [];

  // Match bold markers like **Program Description**, **Goal**, **General Objectives**, **Vision**, **Mission**
  const sectionHeaderRegex = /\*\*\s*([^*:]+?)\s*:?\s*\*\*/g;
  const matches = [...rawText.matchAll(sectionHeaderRegex)];

  if (matches.length === 0) {
    return [
      {
        id: "section-overview",
        title: isCollegeContent.value ? "College Overview & Goals" : "Program Overview",
        icon: isCollegeContent.value ? "fa-university" : "fa-book-open",
        blocks: parseSectionBlocks(rawText),
        isRawHtml: rawText.includes("<") && rawText.includes(">"),
        rawContent: rawText,
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

    sections.push({
      id: `section-${i}`,
      title: title,
      icon: icon,
      blocks: parseSectionBlocks(sectionBody),
      isRawHtml: sectionBody.includes("<") && sectionBody.includes(">"),
      rawContent: sectionBody,
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
        blocks: parseSectionBlocks(leading),
        isRawHtml: leading.includes("<") && leading.includes(">"),
        rawContent: leading,
      });
    }
  }

  return sections;
});

// CMS-driven programs under the matched college (populated during fetch)
const collegePrograms = ref([]);
const collegeProgramsLoading = ref(false);

// Exclude non-course items (News, Exams, Passers, Announcements)
const isNewsOrExamOrAnnouncement = (cmsItem) => {
  if (!cmsItem || !cmsItem.title) return true;
  const title = (cmsItem.title || "").trim().toLowerCase();
  const filters = (cmsItem.filters || cmsItem.filter || "").toLowerCase();

  const excludedPatterns = [
    /\b(exam|examination|licensure|passer|passers|board|topnotcher|topnotch|pnle|cele|cle|cpale|let|nle|ple)\b/i,
    /\b(news|announcement|advisory|memorandum|memo|event|activity|activities|highlight|highlights|carousel|hero)\b/i,
    /\b(webinar|seminar|workshop|symposium|conference|training|orientation|hiring|vacancy|vacancies|job)\b/i,
    /\b(congratulations|congrats|tribute|celebration|ceremony|schedule|calendar|deadline|guidelines)\b/i,
    /\b(donation|blessing|investiture|commencement|alumni|reunion|moa|mou|signing|turnover)\b/i,
  ];

  return excludedPatterns.some((pattern) => pattern.test(title) || pattern.test(filters));
};

const isCollegeVmgItem = (cmsItem) => {
  if (!cmsItem || !cmsItem.title) return false;
  const t = cmsItem.title.trim().toLowerCase();
  if (
    t.includes("bachelor") ||
    t.startsWith("bs ") ||
    t.startsWith("bs-") ||
    t.startsWith("ba ") ||
    t.startsWith("ba-") ||
    t.startsWith("bee") ||
    t.startsWith("bpe") ||
    t.startsWith("btle") ||
    t.startsWith("blis") ||
    t.startsWith("doctor") ||
    t.startsWith("master") ||
    t.includes("juris doctor")
  ) {
    return false;
  }
  return (
    t.includes("vision, mission") ||
    t.includes("vision and mission") ||
    t.includes("vision & mission") ||
    t.includes("vmg") ||
    t.includes("college overview") ||
    t.includes("school of graduate studies") ||
    t.includes("college of ")
  );
};

const isBachelorProgram = (cmsItem) => {
  if (!cmsItem || !cmsItem.title) return false;
  if (isNewsOrExamOrAnnouncement(cmsItem)) return false;
  if (isCollegeVmgItem(cmsItem)) return false;
  const t = cmsItem.title.trim().toLowerCase();
  return (
    t.includes("bachelor") ||
    t.startsWith("bs ") ||
    t.startsWith("bs-") ||
    t.startsWith("ba ") ||
    t.startsWith("ba-") ||
    t.startsWith("bee") ||
    t.startsWith("bpe") ||
    t.startsWith("btle") ||
    t.startsWith("btled") ||
    t.startsWith("blis") ||
    t.startsWith("bsc") ||
    t.startsWith("bsa") ||
    t.includes("doctor") ||
    t.includes("master") ||
    t.includes("juris doctor") ||
    t.includes("associate in") ||
    t.includes("diploma in")
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
  const t = (cmsItem?.title || "").trim().toLowerCase();
  const f = (cmsItem?.filters || cmsItem?.filter || "").toLowerCase();
  const a = (cmsItem?.authors || cmsItem?.author || "").toLowerCase();
  const cleanId = String(cmsId || "").toLowerCase().trim();

  // 1. Direct ID matching
  const knownAbbrs = ["cas", "cba", "ccje", "ccsea", "con", "cte", "cthm", "cmls", "sgs"];
  for (const k of knownAbbrs) {
    if (cleanId === k || cleanId === `lsu-${k}`) return k.toUpperCase();
  }

  // 2. CTE (College of Teacher Education) - check BEFORE CAS because of "English Language" or "Science" majors in education
  if (
    t.includes("secondary education") ||
    t.includes("elementary education") ||
    t.includes("special needs education") ||
    t.includes("teacher education") ||
    t.includes("livelihood education") ||
    t.includes("physical education") ||
    t.includes("library and information") ||
    /\b(beed|bsed|bped|btled|btle|blis|bsn-ed|bee-gen|bse-)\b/i.test(t) ||
    /\b(cte|lsu-cte)\b/i.test(f) ||
    /\b(college of teacher education)\b/i.test(a)
  ) {
    return "CTE";
  }

  // 3. CCSEA (Computer Studies, Engineering & Architecture)
  if (
    t.includes("computer studies") ||
    t.includes("computer science") ||
    t.includes("information technology") ||
    t.includes("civil engineering") ||
    t.includes("architecture") ||
    t.includes("electrical engineering") ||
    /\b(ccsea|ccs|lsu-ccsea|bscs|bsit|bsce|bsarch|bsee)\b/i.test(t) ||
    /\b(ccsea|ccs|lsu-ccsea)\b/i.test(f) ||
    /\b(college of computer studies|ccsea)\b/i.test(a)
  ) {
    return "CCSEA";
  }

  // 4. CON (College of Nursing)
  if (
    (t.includes("nursing") || /\bbsn\b/i.test(t) || /\b(con|lsu-con)\b/i.test(f) || /\b(college of nursing|con)\b/i.test(a)) &&
    !t.includes("special needs")
  ) {
    return "CON";
  }

  // 5. CMLS (College of Medical Laboratory Science)
  if (
    t.includes("medical laboratory") ||
    t.includes("medical technology") ||
    t.includes("medtech") ||
    /\bbsmls\b/i.test(t) ||
    /\b(cmls|lsu-cmls)\b/i.test(f) ||
    /\b(college of medical laboratory|cmls)\b/i.test(a)
  ) {
    return "CMLS";
  }

  // 6. CTHM (College of Tourism and Hospitality Management)
  if (
    t.includes("hospitality management") ||
    t.includes("tourism management") ||
    t.includes("hospitality") ||
    t.includes("tourism") ||
    /\b(bshm|bstm|cthm|lsu-cthm)\b/i.test(t) ||
    /\b(cthm|lsu-cthm)\b/i.test(f) ||
    /\b(college of tourism|cthm)\b/i.test(a)
  ) {
    return "CTHM";
  }

  // 7. CCJE (College of Criminal Justice Education)
  if (
    t.includes("criminology") ||
    t.includes("criminal justice") ||
    /\b(ccje|lsu-ccje|bsc)\b/i.test(t) ||
    /\b(ccje|lsu-ccje)\b/i.test(f) ||
    /\b(college of criminal justice|ccje)\b/i.test(a)
  ) {
    return "CCJE";
  }

  // 8. CBA (College of Business and Accountancy)
  if (
    t.includes("accountancy") ||
    t.includes("accounting") ||
    t.includes("business administration") ||
    t.includes("financial management") ||
    t.includes("marketing management") ||
    t.includes("office administration") ||
    t.includes("agribusiness") ||
    /\b(bsa|bsais|bsba|bsoa|bsab|cba|lsu-cba)\b/i.test(t) ||
    /\b(cba|lsu-cba)\b/i.test(f) ||
    /\b(college of business|cba)\b/i.test(a)
  ) {
    return "CBA";
  }

  // 9. CAS (College of Arts and Sciences)
  if (
    t.includes("political science") ||
    t.includes("social work") ||
    t.includes("psychology") ||
    t.includes("communication") ||
    t.includes("philosophy") ||
    (t.includes("english language") && !t.includes("education")) ||
    /\b(bapolsc|baels|bacomm|baphilo|bspsych|bssw|cas|lsu-cas)\b/i.test(t) ||
    /\b(cas|lsu-cas)\b/i.test(f) ||
    /\b(college of arts and sciences|cas)\b/i.test(a)
  ) {
    return "CAS";
  }

  // 10. SGS (School of Graduate Studies)
  if (
    t.includes("graduate studies") ||
    t.includes("doctor") ||
    t.includes("master") ||
    t.includes("juris doctor") ||
    /\b(sgs|lsu-sgs|phd|dba|mba|mpa|maed|med|msn|mit|msit|mscs)\b/i.test(t) ||
    /\b(sgs|lsu-sgs)\b/i.test(f) ||
    /\b(school of graduate|sgs)\b/i.test(a)
  ) {
    return "SGS";
  }

  return "";
};

// Known college details mapping (abbreviation -> title, logo, CDN url)
const collegeMeta = {
  cas: {
    abbr: "CAS",
    title: "College of Arts and Sciences",
    logoFile: "cas.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cas.png",
  },
  cba: {
    abbr: "CBA",
    title: "College of Business and Accountancy",
    logoFile: "cba.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cba.png",
  },
  ccje: {
    abbr: "CCJE",
    title: "College of Criminal Justice Education",
    logoFile: "CCJE.jpg",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/CCJE.jpg",
  },
  ccsea: {
    abbr: "CCSEA",
    title: "College of Computer Studies, Engineering and Architecture",
    logoFile: "ccsea.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/ccsea.png",
  },
  con: {
    abbr: "CON",
    title: "College of Nursing",
    logoFile: "con-lsu.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/con-lsu.png",
  },
  cte: {
    abbr: "CTE",
    title: "College of Teacher Education",
    logoFile: "cte.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cte.png",
  },
  cthm: {
    abbr: "CTHM",
    title: "College of Tourism and Hospitality Management",
    logoFile: "cthm.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cthm.png",
  },
  cmls: {
    abbr: "CMLS",
    title: "College of Medical Laboratory Science",
    logoFile: "cmls.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cmls.png",
  },
  sgs: {
    abbr: "SGS",
    title: "School of Graduate Studies",
    logoFile: "sgs.png",
    cdnUrl: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/sgs.png",
  },
};

// Dedicated College / Department Logo Detector
const collegeLogoInfo = computed(() => {
  if (!item.value) return null;
  const matchedAbbr = resolveCollegeAbbr(item.value, itemId);
  const college = matchedAbbr ? collegeMeta[matchedAbbr.toLowerCase()] : null;

  // 1. Check if uploaded files contain the official college logo/seal by identifying "logo" or "seal" in the file string
  let uploadedLogo = null;
  if (item.value.files && Array.isArray(item.value.files)) {
    uploadedLogo = item.value.files.find((f) => {
      if (!isImageFile(f)) return false;
      const lowerF = f.toLowerCase();
      // Exclude PAASCU logo
      if (/paascu/i.test(lowerF)) return false;

      // Identify "logo" or "seal" string word in the image filename provided
      return lowerF.includes("logo") || lowerF.includes("seal");
    });
  }

  // If no logo image is provided in the uploaded files, hide the logo display
  if (!uploadedLogo) {
    return null;
  }

  return {
    logoUrl: getFileUrl(uploadedLogo),
    abbr: college?.abbr || programAbbr.value || "LSU",
    title: college?.title || item.value.authors || "College Department",
    uploadedFileName: uploadedLogo,
  };
});

// Non-Logo, Non-PAASCU spotlight images for the general Program Spotlight gallery
const regularSpotlightImages = computed(() => {
  const logoFile = collegeLogoInfo.value?.uploadedFileName;
  const paascuFile = paascuInfo.value?.paascuFileName;

  return imageFiles.value.filter((file) => {
    if (logoFile && file === logoFile) return false;
    if (paascuFile && file === paascuFile) return false;
    const lower = file.toLowerCase();
    if (/paascu/i.test(lower)) return false;
    if (lower.includes("logo") || lower.includes("seal")) return false;
    return true;
  });
});

// News, Events & Announcements for the college / department
const collegeNewsEvents = ref([]);
const collegeNewsLoading = ref(false);

const getNewsCategory = (newsItem) => {
  const f = (newsItem?.filters || "").toLowerCase();
  const t = (newsItem?.title || "").toLowerCase();
  if (f.includes("event") || t.includes("event") || f.includes("activity") || f.includes("webinar") || f.includes("workshop") || f.includes("seminar") || f.includes("conference")) {
    return { label: "Event", icon: "fa-calendar-check", bg: "bg-blue-50 text-blue-800 border-blue-200" };
  }
  if (f.includes("announcement") || t.includes("announcement") || f.includes("advisory") || f.includes("notice") || f.includes("memorandum")) {
    return { label: "Announcement", icon: "fa-bullhorn", bg: "bg-amber-50 text-amber-800 border-amber-200" };
  }
  if (f.includes("highlight") || t.includes("highlight") || f.includes("feature")) {
    return { label: "News Highlight", icon: "fa-star", bg: "bg-yellow-50 text-yellow-800 border-yellow-200" };
  }
  if (f.includes("achievement") || t.includes("award") || f.includes("passer") || f.includes("board exam") || f.includes("topnotcher") || f.includes("champion")) {
    return { label: "Achievement", icon: "fa-trophy", bg: "bg-purple-50 text-purple-800 border-purple-200" };
  }
  return { label: "News & Update", icon: "fa-newspaper", bg: "bg-green-50 text-green-900 border-green-200" };
};

const getNewsSdgBadges = (newsItem) => {
  if (!newsItem?.filters) return [];
  const filters = newsItem.filters.toLowerCase();
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
};

// Filter to ensure ONLY actual news, events, and announcements are included (excludes courses, degree programs, and college VMG pages)
const isAcademicCourseOrVmgContent = (cmsItem) => {
  if (!cmsItem || !cmsItem.title) return true;
  const t = cmsItem.title.trim().toLowerCase();
  const f = (cmsItem.filters || cmsItem.filter || "").toLowerCase();
  const d = (cmsItem.descriptions || cmsItem.description || "").toLowerCase();

  // 1. Exclude if recognized as degree/undergrad program
  if (isBachelorProgram(cmsItem)) return true;

  // 2. Additional graduate/doctoral/master/program degree titles
  if (
    t.startsWith("master") ||
    t.startsWith("doctor") ||
    t.startsWith("bachelor") ||
    t.startsWith("bs ") ||
    t.startsWith("ba ") ||
    t.includes("juris doctor") ||
    t.includes("degree program") ||
    t.includes("curriculum") ||
    /\b(ph\.?d|dba|edd|mba|mpa|maed|med|msn|mit|msit|mscs)\b/i.test(t)
  ) {
    return true;
  }

  // 3. College VMG or Department overview items (e.g. "School of Graduate Studies", "College of Arts and Sciences", etc.)
  const knownColleges = [
    "school of graduate studies",
    "sgs",
    "college of arts and sciences",
    "cas",
    "college of business and accountancy",
    "cba",
    "college of criminal justice education",
    "ccje",
    "college of computer studies, engineering, and architecture",
    "college of computer studies, engineering and architecture",
    "college of computer studies",
    "ccsea",
    "college of nursing",
    "con",
    "college of teacher education",
    "cte",
    "college of tourism and hospitality management",
    "cthm",
    "college of medical laboratory science",
    "cmls"
  ];
  if (knownColleges.some((c) => t === c || t === `${c} vision mission goal` || t === `${c} vmg` || t === `${c} overview`)) {
    return true;
  }

  // 4. Check if title contains Vision, Mission, Goals, Objectives, VMG
  if (
    t.includes("vision, mission") ||
    t.includes("vision and mission") ||
    t.includes("vision & mission") ||
    t.includes("vision, mission & goals") ||
    t.includes("vision, mission, and goals") ||
    t.includes("vmg") ||
    t.includes("goals & objectives") ||
    t.includes("college overview") ||
    t.includes("college vision") ||
    t.includes("about the college")
  ) {
    return true;
  }

  // 5. Check if descriptions contain Vision/Mission/Goals or Program Description markdown structures
  if (
    (d.includes("**vision**") && d.includes("**mission**")) ||
    (d.includes("vision:") && d.includes("mission:")) ||
    d.includes("**program description**") ||
    d.includes("**educational objectives**") ||
    d.includes("**career opportunities**") ||
    d.includes("**program educational objectives**")
  ) {
    return true;
  }

  // 6. If filter tags indicate it's a program/curriculum rather than news
  if ((f.includes("programs") || f.includes("tertiary") || f.includes("curriculum")) && !f.includes("news") && !f.includes("event") && !f.includes("announcement") && !f.includes("highlight")) {
    return true;
  }

  return false;
};

// Check if a CMS item is published (is_published: true or filters contains "published")
const isCmsPublished = (cmsItem) => {
  if (!cmsItem) return false;
  if (cmsItem.is_published === true) return true;
  const filters = (cmsItem.filters || cmsItem.filter || "").toLowerCase();
  return filters.includes("published");
};

// Check if a CMS news/event item is genuinely related to a specific college or degree program
const isNewsRelatedToCollegeOrProgram = (cmsItem, matchedCollegeAbbr, currentItem) => {
  if (!cmsItem) return false;

  const title = (cmsItem.title || "").toLowerCase();
  const rawFilters = (cmsItem.filters || cmsItem.filter || "").toLowerCase();
  const authors = (cmsItem.authors || cmsItem.author || "").toLowerCase();
  const descriptions = (cmsItem.descriptions || cmsItem.description || "").toLowerCase();

  // Clean filter tags array
  const filterTags = rawFilters
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const colAbbr = (matchedCollegeAbbr || "").toLowerCase().trim();
  const progAbbr = (currentItem?.abbr || programAbbr.value || "").toLowerCase().trim();
  const progTitle = (currentItem?.title || "").toLowerCase().trim();

  // 1. College of Nursing (CON) / Nursing Program (BSN)
  if (colAbbr === "con" || progAbbr === "bsn" || progTitle.includes("nursing")) {
    const hasExplicitNursingTerm =
      title.includes("nursing") ||
      title.includes("nurse") ||
      title.includes("nurses") ||
      title.includes("bsn") ||
      title.includes("college of nursing") ||
      authors.includes("college of nursing") ||
      authors.includes("nursing") ||
      authors.includes("dean of nursing") ||
      filterTags.includes("nursing") ||
      filterTags.includes("bsn") ||
      filterTags.includes("college of nursing") ||
      filterTags.includes("lsu-con") ||
      filterTags.includes("lsu con");

    const descriptionNursingMatch =
      descriptions.includes("college of nursing") ||
      descriptions.includes("nursing student") ||
      descriptions.includes("nursing board") ||
      descriptions.includes("nursing licensure") ||
      descriptions.includes("bs in nursing") ||
      descriptions.includes("bachelor of science in nursing");

    // Strictly reject generic "CON" words (conference, convention, TechZONED CON, youth con, pros and cons) if not about nursing
    const isGenericConOrConference =
      title.includes("techzoned") ||
      title.includes("tech zoned") ||
      title.includes("conference") ||
      title.includes("convention") ||
      title.includes("workshop") ||
      title.includes("con 20") ||
      title.includes("con 19");

    if (isGenericConOrConference && !hasExplicitNursingTerm && !descriptionNursingMatch) {
      return false;
    }

    if (filterTags.includes("con") && !isGenericConOrConference) {
      return true;
    }

    return hasExplicitNursingTerm || descriptionNursingMatch;
  }

  // 2. College of Arts and Sciences (CAS)
  if (colAbbr === "cas" || progTitle.includes("arts and sciences")) {
    const casKeywords = [
      "college of arts and sciences", "arts and sciences", "lsu-cas",
      "political science", "bapolsc", "english language", "baels",
      "communication", "bacomm", "philosophy", "baphilo",
      "psychology", "bspsych", "social work", "bssw"
    ];
    if (filterTags.some((t) => t === "cas" || t === "lsu-cas" || t === "arts and sciences" || casKeywords.includes(t))) return true;
    if (authors.includes("college of arts and sciences") || authors.includes("cas")) return true;
    if (casKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bcas\b/i.test(title) && !title.includes("in case") && !title.includes("broadcast") && !title.includes("cascade")) return true;
    return false;
  }

  // 3. College of Business and Accountancy (CBA)
  if (colAbbr === "cba" || progTitle.includes("business and accountancy") || progTitle.includes("business administration")) {
    const cbaKeywords = [
      "college of business and accountancy", "business and accountancy", "lsu-cba",
      "accountancy", "accounting", "bsa", "bsais", "bsba", "bsba-fm", "bsba-mm",
      "financial management", "marketing management", "office administration", "bsoa", "agribusiness", "bsab"
    ];
    if (filterTags.some((t) => t === "cba" || t === "lsu-cba" || t === "business and accountancy" || cbaKeywords.includes(t))) return true;
    if (authors.includes("college of business and accountancy") || authors.includes("cba")) return true;
    if (cbaKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bcba\b/i.test(title)) return true;
    return false;
  }

  // 4. College of Criminal Justice Education (CCJE)
  if (colAbbr === "ccje" || progTitle.includes("criminal justice") || progTitle.includes("criminology")) {
    const ccjeKeywords = [
      "college of criminal justice education", "criminal justice education", "lsu-ccje",
      "criminology", "criminologist", "criminologists", "criminal justice", "bsc"
    ];
    if (filterTags.some((t) => t === "ccje" || t === "lsu-ccje" || ccjeKeywords.includes(t))) return true;
    if (authors.includes("college of criminal justice education") || authors.includes("ccje")) return true;
    if (ccjeKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bccje\b/i.test(title)) return true;
    return false;
  }

  // 5. College of Computer Studies, Engineering and Architecture (CCSEA)
  if (colAbbr === "ccsea" || progTitle.includes("computer studies") || progTitle.includes("engineering")) {
    const ccseaKeywords = [
      "college of computer studies", "ccsea", "lsu-ccsea", "ccs",
      "civil engineering", "bsce", "architecture", "bsarch",
      "electrical engineering", "bsee", "computer science", "bscs",
      "information technology", "bsit", "engineering and architecture"
    ];
    if (filterTags.some((t) => t === "ccsea" || t === "lsu-ccsea" || t === "ccs" || ccseaKeywords.includes(t))) return true;
    if (authors.includes("ccsea") || authors.includes("computer studies") || authors.includes("college of computer studies")) return true;
    if (ccseaKeywords.some((k) => k !== "ccs" && k !== "ccsea" && (title.includes(k) || descriptions.includes(k)))) return true;
    if (/\bccsea\b/i.test(title)) return true;
    return false;
  }

  // 6. College of Teacher Education (CTE)
  if (colAbbr === "cte" || progTitle.includes("teacher education") || progTitle.includes("education")) {
    const cteKeywords = [
      "college of teacher education", "teacher education", "lsu-cte",
      "beed", "bsed", "bped", "btled", "blis",
      "elementary education", "secondary education", "physical education",
      "library and information science", "let passer", "licensure examination for teachers"
    ];
    if (filterTags.some((t) => t === "cte" || t === "lsu-cte" || t === "teacher education" || cteKeywords.includes(t))) return true;
    if (authors.includes("college of teacher education") || authors.includes("cte")) return true;
    if (cteKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bcte\b/i.test(title)) return true;
    return false;
  }

  // 7. College of Tourism and Hospitality Management (CTHM)
  if (colAbbr === "cthm" || progTitle.includes("tourism") || progTitle.includes("hospitality")) {
    const cthmKeywords = [
      "college of tourism and hospitality management", "tourism and hospitality management",
      "cthm", "lsu-cthm", "bshm", "bstm", "hospitality management", "tourism management",
      "hospitality", "tourism"
    ];
    if (filterTags.some((t) => t === "cthm" || t === "lsu-cthm" || cthmKeywords.includes(t))) return true;
    if (authors.includes("college of tourism and hospitality management") || authors.includes("cthm")) return true;
    if (cthmKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bcthm\b/i.test(title)) return true;
    return false;
  }

  // 8. College of Medical Laboratory Science (CMLS)
  if (colAbbr === "cmls" || progTitle.includes("medical laboratory") || progTitle.includes("medtech")) {
    const cmlsKeywords = [
      "college of medical laboratory science", "medical laboratory science", "lsu-cmls",
      "bsmls", "medtech", "medical technology", "medical technologist"
    ];
    if (filterTags.some((t) => t === "cmls" || t === "lsu-cmls" || cmlsKeywords.includes(t))) return true;
    if (authors.includes("college of medical laboratory science") || authors.includes("cmls")) return true;
    if (cmlsKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bcmls\b/i.test(title)) return true;
    return false;
  }

  // 9. School of Graduate Studies (SGS)
  if (colAbbr === "sgs" || progTitle.includes("graduate studies") || progTitle.includes("master") || progTitle.includes("doctor")) {
    const sgsKeywords = [
      "school of graduate studies", "graduate studies", "graduate school", "lsu-sgs",
      "mba", "mpa", "maed", "med", "msn", "mit", "msit", "mscs", "phd", "dba", "edd",
      "juris doctor"
    ];
    if (filterTags.some((t) => t === "sgs" || t === "lsu-sgs" || t === "graduate studies" || sgsKeywords.includes(t))) return true;
    if (authors.includes("school of graduate studies") || authors.includes("sgs")) return true;
    if (sgsKeywords.some((k) => title.includes(k) || descriptions.includes(k))) return true;
    if (/\bsgs\b/i.test(title)) return true;
    return false;
  }

  // 10. General Program Title & Abbreviation Match (for any specific program)
  if (progAbbr && progAbbr.length >= 2) {
    if (filterTags.includes(progAbbr)) return true;
    const regexProg = new RegExp(`(^|[^a-zA-Z0-9])${progAbbr}([^a-zA-Z0-9]|$)`, "i");
    if (regexProg.test(title) || regexProg.test(authors)) return true;
  }

  return false;
};

// ── Shared CMS Content Composable with Caching & De-duplication ──
const { cachedList, fetchCmsList, getCachedItem } = useCmsContent();

// Synchronously populate college programs and news/events grids from published list
const populateCollegeProgramsAndNews = (publishedList) => {
  if (!Array.isArray(publishedList) || !item.value) return;

  const matchedAbbr = resolveCollegeAbbr(item.value, itemId);
  if (!matchedAbbr) {
    collegePrograms.value = [];
    collegeNewsEvents.value = [];
    collegeProgramsLoading.value = false;
    collegeNewsLoading.value = false;
    return;
  }

  // 1. Programs Offered Under College
  const matchedProgs = publishedList.filter((cmsItem) => {
    if (!cmsItem || !cmsItem.title) return false;
    if (!isBachelorProgram(cmsItem)) return false;
    const colForProg = resolveCollegeAbbr(cmsItem, cmsItem.id || cmsItem.content_id);
    return colForProg.toUpperCase() === matchedAbbr.toUpperCase();
  });

  collegePrograms.value = matchedProgs.map((cmsItem) => ({
    id: cmsItem.id,
    content_id: cmsItem.content_id,
    title: cmsItem.title,
    abbr: (() => {
      const m = (cmsItem.title || "").match(/\(([A-Z0-9-]{2,8})\)/i);
      return m ? m[1] : "";
    })(),
    filters: cmsItem.filters || "",
  }));
  collegeProgramsLoading.value = false;

  // 2. News & Events Strictly Related to College / Program
  const nonProgramItems = publishedList.filter((cmsItem) => {
    if (!cmsItem || !cmsItem.title) return false;
    const cId = String(cmsItem.id || "");
    const cContentId = String(cmsItem.content_id || "");
    if (cId === String(itemId) || cContentId === String(itemId)) return false;
    if (isAcademicCourseOrVmgContent(cmsItem)) return false;
    return true;
  });

  const matchedNews = nonProgramItems.filter((cmsItem) => {
    return isNewsRelatedToCollegeOrProgram(cmsItem, matchedAbbr, item.value);
  });

  matchedNews.sort((x, y) => {
    const dateX = new Date(x.date || x.created_at || 0).getTime();
    const dateY = new Date(y.date || y.created_at || 0).getTime();
    return dateY - dateX;
  });

  collegeNewsEvents.value = matchedNews.slice(0, 6);
  collegeNewsLoading.value = false;
};

// ── Check if data is already in memory cache and initialize INSTANTLY (0ms!) ──
const checkAndApplyFromCache = (idToLookup) => {
  const cleanId = String(idToLookup || itemId).toLowerCase().trim();
  const cached = getCachedItem(cleanId);
  if (cached) {
    item.value = cached;
    loading.value = false;
    if (cachedList.value) {
      populateCollegeProgramsAndNews(cachedList.value.filter(isCmsPublished));
    }
    return true;
  }
  return false;
};

checkAndApplyFromCache(itemId);

const fetchProgramDetails = async () => {
  const cleanId = String(itemId).toLowerCase().trim();

  // If already loaded from cache, do background refresh without showing loading skeleton
  if (!item.value) {
    loading.value = true;
    collegeProgramsLoading.value = true;
    collegeNewsLoading.value = true;
  }
  errorMsg.value = "";

  try {
    const isNumericId = /^\d+$/.test(cleanId);

    // ── Fire requests in parallel ──────────────────────────────────────
    const [res, listRes] = await Promise.all([
      isNumericId ? $fetch(`${endpoint.value}/api/cms/content/${itemId}/`).catch(() => null) : null,
      fetchCmsList(),
    ]);

    const publishedList = Array.isArray(listRes) ? listRes.filter(isCmsPublished) : [];

    // 1. Direct CMS hit by numeric id (must be published)
    if (res && (res.title || res.id) && isCmsPublished(res)) {
      item.value = res;
    } else if (publishedList.length > 0) {
      // 2. Search the published list by id / slug / filters
      const found = getCachedItem(cleanId) || publishedList.find((c) => {
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
        const collegeVmg = publishedList.find((c) => {
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

    // 4. College info fallback if ID directly matches college abbreviation / slug
    if (!item.value) {
      const matchedCollegeAbbr = resolveCollegeAbbr(null, cleanId);
      if (matchedCollegeAbbr && collegeMeta[matchedCollegeAbbr]) {
        const c = collegeMeta[matchedCollegeAbbr];
        item.value = {
          title: `${c.abbr} Vision, Mission & Goals`,
          descriptions: `**College Overview**\n${c.title} (${c.abbr})\n\n**Goal**\nThe ${c.title} is dedicated to excellence in teaching, research, and community engagement.\n\n**General Objectives**\n1. Prepare students with high-level professional competence and critical thinking.\n2. Foster ethical leadership, social responsibility, and Lasallian values.\n3. Promote sustainable innovation and lifelong learning.`,
          isCollege: true,
          collegeAbbr: c.abbr,
          authors: c.title,
        };
      }
    }

    // 5. Populate college programs and news/events grids
    if (item.value && publishedList.length > 0) {
      populateCollegeProgramsAndNews(publishedList);
    }
  } catch (err) {
    console.error("Error fetching program/college detail:", err);
    if (!item.value) {
      errorMsg.value = "Failed to load details.";
    }
  } finally {
    loading.value = false;
    collegeProgramsLoading.value = false;
    collegeNewsLoading.value = false;
  }
};

// Initiate fetch immediately at script setup time
fetchProgramDetails();

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      checkAndApplyFromCache(newId);
      await fetchProgramDetails();
    }
  }
);

useHead(() => ({
  title: item.value?.title ? `${item.value.title} | LSU Tertiary Education` : "Program / College Details | LSU",
}));
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col font-sans">
    <Header />

    <!-- ── HERO BANNER ── -->
    <div
      class="relative overflow-hidden bg-gradient-to-r from-green-950 via-green-900 to-green-950 text-white shadow-inner">
      <div class="mx-auto w-11/12 py-6 lg:py-8 relative z-10">
        <div class="flex flex-wrap items-center gap-3 mb-2">
          <span
            class="bg-green-700/80 text-white text-[0.65rem] font-mono font-bold px-3 py-1 rounded border border-green-500/30 uppercase tracking-widest shadow-sm">
            LASALLIAN TERTIARY EDUCATION
          </span>
          <span v-if="programAbbr"
            class="bg-yellow-500/90 text-gray-950 text-[0.65rem] font-mono font-bold px-2.5 py-1 rounded shadow-sm">
            {{ programAbbr }}
          </span>
        </div>
        <h1 class="text-xl lg:text-3xl font-extrabold text-white tracking-wide uppercase leading-tight max-w-8xl">
          {{ programCleanTitle || item?.title || 'Degree Program Details' }}
        </h1>
        <p v-if="programAbbr && programCleanTitle"
          class="mt-1 text-green-200 text-xs font-semibold tracking-wider uppercase">
          {{ item?.title }}
        </p>
      </div>
    </div>

    <!-- ── BREADCRUMB ── -->
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="w-11/12 mx-auto">
        <ul
          class="flex items-center flex-wrap gap-x-1.5 h-11 text-[0.75rem] text-gray-500 overflow-x-auto whitespace-nowrap list-none m-0 p-0">
          <li class="flex items-center gap-1.5">
            <NuxtLink to="/" class="text-green-900 no-underline capitalize hover:underline font-medium">
              <i class="fas fa-home text-xs mr-1 text-green-800"></i>Home
            </NuxtLink>
          </li>
          <li class="flex items-center gap-1.5">
            <i class="fas fa-chevron-right text-[0.55rem] text-gray-400"></i>
            <NuxtLink to="/academics/tertiary-education"
              class="text-green-900 no-underline capitalize hover:underline font-medium">Academics</NuxtLink>
          </li>
          <li class="flex items-center gap-1.5">
            <i class="fas fa-chevron-right text-[0.55rem] text-gray-400"></i>
            <NuxtLink to="/academics/tertiary-education"
              class="text-green-900 no-underline capitalize hover:underline font-medium">Tertiary Education</NuxtLink>
          </li>
          <li class="flex items-center gap-1.5">
            <i class="fas fa-chevron-right text-[0.55rem] text-gray-400"></i>
            <span class="capitalize text-gray-400 truncate max-w-[240px] font-semibold">{{ item?.title || 'Program'
            }}</span>
          </li>
        </ul>
      </div>
    </nav>

    <!-- ── MAIN CONTENT ── -->
    <div class="mx-auto lg:w-11/12 pt-8 pb-16 flex-1 w-full">

      <!-- Back Navigation Button -->
      <div class="mb-6">
        <NuxtLink to="/academics/tertiary-education"
          class="inline-flex items-center gap-2 text-xs font-bold text-green-900 uppercase tracking-wider hover:text-green-700 transition-colors bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:shadow">
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
        <p class="text-gray-600 text-sm mb-6 max-w-md mx-auto">The requested degree program specifications could not be
          loaded or located at this time.</p>
        <NuxtLink to="/academics/tertiary-education"
          class="inline-flex items-center gap-2 px-6 py-3 bg-green-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-800 transition-all shadow">
          <i class="fas fa-th-list"></i> Browse All Programs
        </NuxtLink>
      </div>

      <!-- Main Program Detail Layout (2/4 Main Content, 1/4 News Updates, 1/4 PAASCU & Spotlight Columns) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

        <!-- ── COLUMN 1: MAIN CONTENT (2/4 = 6/12 Columns) ── -->
        <div class="lg:col-span-7 space-y-6">

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
              <span v-if="programAbbr"
                class="text-sm font-mono font-bold bg-green-50 text-green-900 px-3 py-1.5 border border-green-200 rounded-lg shrink-0">
                {{ programAbbr }}
              </span>
            </div>




            <!-- Meta Badges -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span v-if="paascuInfo"
                class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold shadow-xs">
                <i class="fas fa-award text-emerald-700"></i> {{ paascuInfo.titleBadge }}
              </span>
              <span v-if="item.authors"
                class="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 font-medium">
                <i class="fas fa-university text-green-900"></i> {{ item.authors }}
              </span>
              <span v-if="formattedDate"
                class="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 font-medium">
                <i class="fas fa-calendar-alt text-gray-500"></i> Updated: {{ formattedDate }}
              </span>
            </div>










            <!-- SDG Badges -->
            <div v-if="sdgBadges.length > 0"
              class="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-gray-100">
              <span class="text-[0.65rem] font-bold uppercase tracking-wider text-gray-400 mr-1">SDGs:</span>
              <span v-for="sdg in sdgBadges" :key="sdg.number"
                class="text-[0.65rem] font-bold text-white px-2 py-0.5 rounded shadow-xs"
                :style="{ backgroundColor: sdg.color }">
                SDG {{ sdg.number }}
              </span>
            </div>
          </div>


          <!-- Structured Sections -->
          <div v-for="section in parsedSections" :key="section.id"
            class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm transition-all hover:border-gray-300">
            <!-- Section Title -->
            <div class="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div
                class="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-900 text-sm shrink-0">
                <i class="fas" :class="section.icon"></i>
              </div>
              <h3 class="text-lg lg:text-xl font-extrabold text-gray-900 tracking-wide uppercase">
                {{ section.title }}
              </h3>
            </div>

            <!-- Raw HTML fallback if overview html -->
            <div v-if="section.isRawHtml" class="prose max-w-none text-gray-700 text-sm leading-relaxed"
              v-html="section.rawContent"></div>

            <!-- Parsed Content Body with Paragraphs, Numbered Lists, and Bullet Lists -->
            <div v-else class="space-y-4">
              <div v-for="(block, bIdx) in section.blocks" :key="bIdx">
                <!-- Paragraph Block -->
                <p v-if="block.type === 'paragraph'"
                  class="text-gray-700 text-sm lg:text-base leading-relaxed text-justify"
                  v-html="formatInlineMarkdown(block.text)"></p>

                <!-- Numbered List Block -->
                <div v-else-if="block.type === 'number'" class="mt-3 space-y-2.5">
                  <div v-for="(item, idx) in block.items" :key="idx"
                    class="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl bg-gray-50 border border-gray-200/80 transition-all hover:bg-green-50/40 hover:border-green-300 group shadow-xs">
                    <span
                      class="w-7 h-7 rounded-full bg-green-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:bg-green-800 transition-colors">
                      {{ item.num || (idx + 1) }}
                    </span>
                    <div
                      class="text-gray-800 text-sm leading-relaxed group-hover:text-green-950 font-medium pt-0.5 flex-1"
                      v-html="formatInlineMarkdown(item.text)"></div>
                  </div>
                </div>

                <!-- Bullet List Block -->
                <div v-else-if="block.type === 'bullet'" class="mt-3 space-y-2.5">
                  <div v-for="(item, idx) in block.items" :key="idx"
                    class="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl bg-gray-50/90 border border-gray-200/80 transition-all hover:bg-green-50/40 hover:border-green-300 group shadow-xs">
                    <span
                      class="w-6 h-6 rounded-full bg-green-100 text-green-900 border border-green-300/80 flex items-center justify-center shrink-0 mt-0.5 shadow-xs group-hover:bg-green-900 group-hover:text-white transition-all">
                      <i class="fas fa-check text-[10px]"></i>
                    </span>
                    <div
                      class="text-gray-800 text-sm leading-relaxed group-hover:text-green-950 font-medium pt-0.5 flex-1"
                      v-html="formatInlineMarkdown(item.text)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>




          <div v-if="(collegeLogoInfo && collegeLogoInfo.logoUrl) || paascuInfo" class="lg:flex gap-x-2">


            <!-- ── Official College / Department Logo Card ── -->
            <div v-if="collegeLogoInfo && collegeLogoInfo.logoUrl"
              class="w-full bg-white border-2 border-green-800/20 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:border-green-800/40 hover:shadow-md">
              <!-- Card Header -->
              <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div class="flex items-center gap-2">
                  <span
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-green-900 text-white text-xs shadow-xs">
                    <i class="fas fa-landmark"></i>
                  </span>
                  <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-green-950">
                    COLLEGE SEAL & LOGO
                  </span>
                </div>
                <span v-if="collegeLogoInfo.abbr"
                  class="text-[0.6rem] font-bold font-mono px-2 py-0.5 rounded-full bg-green-50 text-green-900 border border-green-200">
                  {{ collegeLogoInfo.abbr }}
                </span>
              </div>

              <!-- Logo Display Area -->
              <div class="flex flex-col items-center text-center">
                <div
                  class="relative rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 p-4 shadow-inner cursor-pointer group hover:border-green-600 hover:shadow-md transition-all max-w-[220px] w-full flex items-center justify-center min-h-[160px]"
                  @click="openImageModal(collegeLogoInfo.logoUrl)" title="Click to view high-resolution College Seal">
                  <img :src="collegeLogoInfo.logoUrl" :alt="collegeLogoInfo.title"
                    class="max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter" />
                  <div
                    class="absolute inset-0 bg-green-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.65rem] font-bold gap-1 rounded-2xl backdrop-blur-xs">
                    <i class="fas fa-search-plus text-xs"></i> View Full Seal
                  </div>
                </div>

                <!-- College Name & Info -->
                <h5 class="mt-3 text-xs font-extrabold text-gray-900 leading-snug uppercase tracking-wide">
                  {{ collegeLogoInfo.title }}
                </h5>
                <p class="mt-1 text-[0.68rem] text-gray-500 font-medium">
                  Official Department Seal • La Salle University
                </p>
              </div>
            </div>


            <!-- ── PAASCU Course Program Accreditation Spotlight Card ── -->
            <div v-if="paascuInfo"
              class="w-full bg-gradient-to-b from-emerald-50/80 via-white to-white border-2 border-emerald-600/30 rounded-xl p-5 shadow-sm space-y-3.5 relative overflow-hidden transition-all hover:border-emerald-600/50 hover:shadow-md">
              <div
                class="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl pointer-events-none">
              </div>

              <!-- Card Header -->
              <div class="flex items-center justify-between border-b border-emerald-100/80 pb-2.5">
                <div class="flex items-center gap-2">
                  <span
                    class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-xs shadow-xs">
                    <i class="fas fa-award"></i>
                  </span>
                  <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-emerald-950">
                    PAASCU ACCREDITED
                  </span>
                </div>
                <span
                  class="text-[0.6rem] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs">
                  {{ paascuInfo.statusBadge }}
                </span>
              </div>

              <!-- PAASCU Logo Spotlight Area -->
              <div class="flex flex-col items-center text-center">
                <div
                  class="relative rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs cursor-pointer group hover:border-emerald-500 hover:shadow transition-all max-w-[210px] w-full flex items-center justify-center min-h-[120px]"
                  @click="openImageModal(paascuInfo.imageUrl)" title="Click to view PAASCU Accreditation Seal">
                  <img :src="paascuInfo.imageUrl" alt="PAASCU Accredited Seal"
                    class="max-h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs" />
                  <div
                    class="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.65rem] font-bold gap-1 rounded-xl backdrop-blur-xs">
                    <i class="fas fa-search-plus text-xs"></i> View Full Seal
                  </div>
                </div>

                <!-- Title & Accreditation Text -->
                <h5 class="mt-3 text-xs font-extrabold text-emerald-950 uppercase tracking-wide">
                  {{ paascuInfo.titleBadge }}
                </h5>
                <p class="mt-1 text-[0.7rem] text-gray-600 leading-snug">
                  Philippine Accrediting Association of Schools, Colleges and Universities
                </p>
                <div
                  class="mt-2.5 flex items-center justify-center gap-1.5 text-[0.65rem] text-emerald-900 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-lg font-semibold w-full">
                  <i class="fas fa-certificate text-emerald-700"></i>
                  <span>Quality Assured & FAAP Certified</span>
                </div>
              </div>
            </div>

          </div>




          <!-- Programs Offered (shown on ALL pages — college VMG and individual programs) -->
          <div v-if="collegeProgramsLoading || collegePrograms.length > 0"
            class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm">
            <div class="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <h3 class="text-lg font-bold uppercase tracking-wider text-green-900 flex items-center gap-2">
                <i class="fas fa-graduation-cap text-green-800"></i>
                Degree Programs Offered
              </h3>
              <span v-if="programAbbr"
                class="text-[0.65rem] font-bold text-green-900 bg-green-50 border border-green-200 px-2 py-1 rounded font-mono">
                {{ programAbbr }}
              </span>
            </div>

            <!-- Loading skeleton -->
            <div v-if="collegeProgramsLoading" class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div v-for="n in 6" :key="n" class="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>

            <!-- CMS Programs Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <NuxtLink v-for="(p, pIdx) in collegePrograms" :key="pIdx" :to="getProgramRoute(p)" :class="[
                'group flex items-center justify-between p-4 rounded-xl border transition-all no-underline cursor-pointer',
                isCurrentProgram(p)
                  ? 'bg-green-900 border-green-700 shadow-md ring-2 ring-green-500/40 pointer-events-none'
                  : 'bg-gray-50 border-gray-200 hover:border-green-700 hover:bg-green-50/40 hover:shadow-md'
              ]">
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
                  <i v-if="!isCurrentProgram(p)"
                    class="fas fa-chevron-right text-[0.6rem] text-gray-400 group-hover:text-green-700 transition-colors"></i>
                  <i v-else class="fas fa-circle-dot text-[0.6rem] text-green-300"></i>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- ── Program & Campus Media Gallery Section ── -->
          <div v-if="imageFiles.length > 0"
            class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-900 text-sm shrink-0">
                  <i class="fas fa-images"></i>
                </div>
                <div>
                  <h3 class="text-lg font-bold uppercase tracking-wider text-green-900 leading-tight">
                    Program & Campus Gallery
                  </h3>
                  <p class="text-xs text-gray-500">
                    Visual highlights, college seals, student models, and campus facilities
                  </p>
                </div>
              </div>
              <span class="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {{ imageFiles.length }} {{ imageFiles.length === 1 ? 'Media File' : 'Media Files' }}
              </span>
            </div>

            <!-- Gallery Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="(file, gIdx) in imageFiles" :key="gIdx"
                class="group relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-b from-gray-50 via-white to-gray-50 p-4 shadow-xs hover:shadow-md hover:border-green-600 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px]"
                @click="openImageModal(getFileUrl(file))">
                <img :src="getFileUrl(file)" :alt="`${item.title} Media ${gIdx + 1}`"
                  class="max-h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs" />
                <div
                  class="absolute inset-0 bg-green-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-2 rounded-xl backdrop-blur-xs p-3 text-center">
                  <i class="fas fa-search-plus text-lg"></i>
                  <span>View High-Resolution</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- ── COLUMN 2: NEWS & UPDATES (1/4 = 3/12 Columns) ── -->
        <div class="lg:col-span-5 space-y-6">

          <!-- Admissions & Enrollment Action Card -->
          <div
            class="bg-gradient-to-br from-green-950 to-green-900 text-white rounded-xl p-6 shadow-md border border-green-800">

            <h4 class="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide mb-2 text-white">
              <span
                class="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-400 text-lg">
                <i class="fas fa-user-graduate"></i>
              </span> Enroll at La Salle
            </h4>
            <p class="text-xs text-white/75 leading-relaxed mb-6">
              Take the next step in your academic journey. Inquire now or check admission requirements for {{
                programAbbr || 'this program' }}.
            </p>
            <div class="space-y-2.5">
              <a href="/enrollment"
                class="block text-center w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors shadow">
                Apply for Admission
              </a>
              <NuxtLink to="/academics/tertiary-education"
                class="block text-center w-full py-2.5 px-4 border border-white/30 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">
                Browse All Programs
              </NuxtLink>
            </div>
          </div>

          <!-- Events & Announcements Card Container -->
          <div
            class="bg-white border-2 border-green-800/20 rounded-xl p-5 shadow-sm space-y-4 transition-all hover:border-green-800/40 hover:shadow-md">

            <!-- Section Header -->
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div class="flex items-center gap-2">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-green-900 text-white text-xs shadow-xs">
                  <i class="fas fa-bullhorn"></i>
                </span>
                <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-green-950">
                  {{ (collegeLogoInfo?.abbr || programAbbr) ? `${collegeLogoInfo?.abbr || programAbbr} UPDATES` : 'NEWS & EVENTS' }}
                </span>
              </div>
              <NuxtLink to="/news-updates/list"
                class="text-[0.65rem] font-bold text-green-900 hover:text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 transition-colors inline-flex items-center gap-1">
                <span>View All</span>
                <i class="fas fa-arrow-right text-[0.55rem]"></i>
              </NuxtLink>
            </div>



            <!-- Loading Skeleton -->
            <div v-if="collegeNewsLoading" class="space-y-3">
              <div v-for="n in 3" :key="n" class="h-44 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>

            <!-- News & Events Vertical Feed -->


            <div v-else-if="collegeNewsEvents.length > 0" class="lg:grid grid-cols-2 gap-2">
              <NuxtLink v-for="(news, nIdx) in collegeNewsEvents" :key="news.id || nIdx"
                :to="`/news-updates/${news.id || news.content_id}`"
                class="group bg-gray-50/60 rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-green-600 hover:bg-white transition-all flex flex-col no-underline">
                <!-- Thumbnail Image -->
                <div class="relative h-[350px] w-full overflow-hidden bg-gray-100">
                  <img v-if="news.files && news.files.length > 0 && isImageFile(news.files[0])"
                    :src="getFileUrl(news.files[0])" :alt="news.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div v-else
                    class="w-full h-full bg-gradient-to-br from-green-950 via-green-900 to-green-800 flex flex-col items-center justify-center text-white p-3 text-center">
                    <i class="fas fa-newspaper text-2xl text-white/40 mb-1"></i>
                    <span class="text-[0.6rem] font-bold text-white/70 uppercase tracking-wider">La Salle
                      University</span>
                  </div>

                  <!-- Category Tag Badge -->
                  <div class="absolute top-2 left-2">
                    <span
                      class="inline-flex items-center gap-1 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border shadow-xs"
                      :class="getNewsCategory(news).bg">
                      <i class="fas text-[0.55rem]" :class="getNewsCategory(news).icon"></i>
                      {{ getNewsCategory(news).label }}
                    </span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <!-- Date & Author -->
                    <div class="flex items-center justify-between text-[0.68rem] text-gray-500 mb-1.5 font-medium">
                      <span v-if="news.date || news.created_at" class="flex items-center gap-1">
                        <i class="fas fa-calendar-alt text-gray-400"></i>
                        {{ moment(news.date || news.created_at).format("MMM D, YYYY") }}
                      </span>
                      <span v-if="news.authors" class="truncate max-w-[90px] text-gray-400">
                        {{ news.authors }}
                      </span>
                    </div>

                    <!-- Title -->
                    <h4
                      class="text-xs font-extrabold text-gray-900 group-hover:text-green-900 transition-colors line-clamp-2 leading-snug mb-1.5">
                      {{ news.title }}
                    </h4>

                    <!-- Excerpt -->
                    <p v-if="news.descriptions || news.description"
                      class="text-[0.7rem] text-gray-600 line-clamp-2 leading-relaxed mb-2">
                      {{ (news.descriptions || news.description).replace(/<[^>]*>?/gm, '').substring(0, 85) }}...
                    </p>
                  </div>

                  <!-- Action Footer -->
                  <div class="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                    <div class="flex items-center gap-1 flex-wrap">
                      <span v-for="sdg in getNewsSdgBadges(news).slice(0, 2)" :key="sdg.number"
                        class="text-[0.55rem] font-bold text-white px-1.5 py-0.2 rounded"
                        :style="{ backgroundColor: sdg.color }">
                        SDG {{ sdg.number }}
                      </span>
                    </div>
                    <span
                      class="text-[0.68rem] font-bold text-green-900 group-hover:text-green-700 inline-flex items-center gap-1 shrink-0 ml-auto">
                      Read <i
                        class="fas fa-arrow-right text-[0.6rem] transition-transform group-hover:translate-x-0.5"></i>
                    </span>
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Empty State Fallback -->
            <div v-else class="text-center py-6 text-gray-500 text-xs">
              <i class="fas fa-calendar-alt text-gray-300 text-3xl mb-2"></i>
              <p class="font-medium">No recent news or events posted for this department.</p>
              <NuxtLink to="/news-updates/list" class="mt-2 inline-block text-xs font-bold text-green-900 underline">
                Browse all LSU news
              </NuxtLink>
            </div>

          </div>

        </div>



      </div>
    </div>

    <!-- Image Lightbox Modal -->
    <div v-if="showImageModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      @click="closeImageModal">
      <div class="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" @click.stop>
        <button @click="closeImageModal"
          class="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
        <img :src="selectedImage" :alt="item?.title"
          class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
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

.prose :deep(h1),
.prose :deep(h2),
.prose :deep(h3) {
  color: #14532d;
  font-weight: 800;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}
</style>
