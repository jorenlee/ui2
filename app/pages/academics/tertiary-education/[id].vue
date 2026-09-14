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
    t.startsWith("bs") ||
    t.startsWith("ba ") ||
    t.startsWith("ba") ||
    t.startsWith("bee") ||
    t.startsWith("bpe") ||
    t.startsWith("btle") ||
    t.startsWith("blis") ||
    t.includes("doctor") ||
    t.includes("master") ||
    t.includes("juris doctor") ||
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
  const pageAuthors = (cmsItem?.authors || cmsItem?.author || "").toLowerCase();
  const pageTitle = (cmsItem?.title || "").toLowerCase();
  const cleanId = String(cmsId || "").toLowerCase();

  let matchedAbbr = "";
  tertiaryJSON.tertiary.forEach((t) => {
    if (t.under_grad) {
      t.under_grad.forEach((tu) => {
        if (tu.list) {
          tu.list.forEach((col) => {
            if (matchedAbbr) return; // already found
            const cAbbr = (col.abbr || "").toLowerCase();
            const cTitle = (col.title || "").toLowerCase();

            // Word-boundary check for abbreviation or full title in page filters / title / authors
            const regexAbbr = new RegExp(`(^|[^a-zA-Z0-9])${cAbbr}([^a-zA-Z0-9]|$)`, "i");
            const matchesAbbr = regexAbbr.test(pageFilters) || regexAbbr.test(pageTitle) || regexAbbr.test(pageAuthors) || cleanId === cAbbr;
            const matchesTitle = cTitle && (pageTitle.includes(cTitle) || pageFilters.includes(cTitle) || pageAuthors.includes(cTitle));

            // Direct match: this page IS the college VMG
            if (matchesAbbr || matchesTitle) {
              matchedAbbr = cAbbr;
              return;
            }

            // Indirect match: this page is a program UNDER this college
            if (col.programs) {
              const inCollege = col.programs.some((p) => {
                const pAbbr = (p.abbr || "").toLowerCase();
                const pLink = (p.link || "").toLowerCase();
                const pTitle = (p.title || "").toLowerCase();
                const pSlug = pTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                return (
                  (pAbbr && (pAbbr === cleanId || new RegExp(`(^|[^a-zA-Z0-9])${pAbbr}([^a-zA-Z0-9]|$)`, "i").test(pageTitle))) ||
                  (pLink && pLink === cleanId) ||
                  (pSlug && (pSlug === cleanId || pageTitle.includes(pTitle) || pTitle.includes(pageTitle)))
                );
              });
              if (inCollege) matchedAbbr = cAbbr;
            }
          });
        }
      });
    }

    if (t.grad_stud) {
      t.grad_stud.forEach((tg) => {
        if (tg.list) {
          tg.list.forEach((col) => {
            if (matchedAbbr) return;
            const cAbbr = (col.abbr || "").toLowerCase();
            const cTitle = (col.title || "").toLowerCase();
            const regexAbbr = new RegExp(`(^|[^a-zA-Z0-9])${cAbbr}([^a-zA-Z0-9]|$)`, "i");
            if (
              regexAbbr.test(pageFilters) ||
              regexAbbr.test(pageTitle) ||
              regexAbbr.test(pageAuthors) ||
              (cTitle && pageTitle.includes(cTitle)) ||
              (cTitle && pageFilters.includes(cTitle)) ||
              (cTitle && pageAuthors.includes(cTitle)) ||
              cleanId === cAbbr
            ) {
              matchedAbbr = cAbbr;
              return;
            }

            if (col.category) {
              col.category.forEach((cat) => {
                if (cat.programs) {
                  const inCat = cat.programs.some((p) => {
                    const pTitle = (p.title || "").toLowerCase();
                    const pSlug = pTitle.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                    return pSlug === cleanId || pageTitle.includes(pTitle) || pTitle.includes(pageTitle);
                  });
                  if (inCat) matchedAbbr = cAbbr;
                }
              });
            }
          });
        }
      });
    }
  });

  // Also check pageFilters and pageAuthors directly for known college abbreviations
  if (!matchedAbbr) {
    const abbrList = ["cas", "cba", "ccje", "ccsea", "con", "cte", "cthm", "cmls", "sgs"];
    for (const a of abbrList) {
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${a}([^a-zA-Z0-9]|$)`, "i");
      if (regex.test(pageFilters) || regex.test(pageTitle) || regex.test(pageAuthors) || cleanId === a) {
        matchedAbbr = a;
        break;
      }
    }
  }

  return matchedAbbr;
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

  // 1. Check if uploaded files contain the official college logo/seal
  let uploadedLogo = null;
  if (item.value.files && Array.isArray(item.value.files)) {
    uploadedLogo = item.value.files.find((f) => {
      if (!isImageFile(f)) return false;
      const lowerF = f.toLowerCase();
      // Exclude PAASCU logo
      if (/paascu/i.test(lowerF)) return false;

      // Match file against college abbreviation, logo name, or seal keywords
      if (matchedAbbr && new RegExp(`(^|[^a-zA-Z0-9])${matchedAbbr}([^a-zA-Z0-9]|$)`, "i").test(lowerF)) {
        return true;
      }
      if (college && college.logoFile && lowerF.includes(college.logoFile.toLowerCase().replace(/\.[^.]+$/, ""))) {
        return true;
      }
      if (lowerF.includes("seal") || lowerF.includes("logo") || lowerF.includes("department")) {
        return true;
      }
      return false;
    });
  }

  const logoUrl = uploadedLogo
    ? getFileUrl(uploadedLogo)
    : college?.cdnUrl || null;

  if (!logoUrl && !college) return null;

  return {
    logoUrl,
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
    if (/paascu/i.test(file)) return false;
    if (collegeLogoInfo.value?.abbr) {
      const abbr = collegeLogoInfo.value.abbr.toLowerCase();
      if (new RegExp(`(^|[^a-zA-Z0-9])${abbr}([^a-zA-Z0-9]|$)`, "i").test(file.toLowerCase())) {
        return false;
      }
    }
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

// Fetch News, Events & Announcements from CMS for the college
const fetchCollegeNewsFromCMS = async (cmsListRes) => {
  collegeNewsLoading.value = true;
  try {
    const list = cmsListRes || await $fetch(`${endpoint.value}/api/cms/content/list/`).catch(() => null);
    if (!Array.isArray(list)) return;

    const matchedAbbr = resolveCollegeAbbr(item.value, itemId);
    const college = matchedAbbr ? collegeMeta[matchedAbbr.toLowerCase()] : null;
    const currentAbbr = (programAbbr.value || matchedAbbr || "").toLowerCase();
    const collegeTitle = (college?.title || "").toLowerCase();

    const regexAbbr = matchedAbbr ? new RegExp(`(^|[^a-zA-Z0-9])${matchedAbbr}([^a-zA-Z0-9]|$)`, "i") : null;

    // Filter out degree programs and VMG items
    const nonProgramItems = list.filter((cmsItem) => {
      if (!cmsItem || !cmsItem.title) return false;
      const cId = String(cmsItem.id || "");
      const cContentId = String(cmsItem.content_id || "");
      if (cId === String(itemId) || cContentId === String(itemId)) return false;

      if (isBachelorProgram(cmsItem)) return false;

      const t = (cmsItem.title || "").toLowerCase();
      if ((t.includes("vision") && t.includes("mission")) || t.includes("vmg") || t.includes("goals & objectives")) return false;

      return true;
    });

    // College-specific match
    const matched = nonProgramItems.filter((cmsItem) => {
      const f = (cmsItem.filters || "").toLowerCase();
      const t = (cmsItem.title || "").toLowerCase();
      const a = (cmsItem.authors || cmsItem.author || "").toLowerCase();
      const d = (cmsItem.descriptions || cmsItem.description || "").toLowerCase();

      if (regexAbbr && (regexAbbr.test(f) || regexAbbr.test(t) || regexAbbr.test(a) || regexAbbr.test(d))) return true;
      if (collegeTitle && (t.includes(collegeTitle) || f.includes(collegeTitle) || a.includes(collegeTitle))) return true;

      if (currentAbbr && currentAbbr.length >= 2) {
        const regexProg = new RegExp(`(^|[^a-zA-Z0-9])${currentAbbr}([^a-zA-Z0-9]|$)`, "i");
        if (regexProg.test(f) || regexProg.test(t) || regexProg.test(a)) return true;
      }

      return false;
    });

    matched.sort((x, y) => {
      const dateX = new Date(x.date || x.created_at || 0).getTime();
      const dateY = new Date(y.date || y.created_at || 0).getTime();
      return dateY - dateX;
    });

    if (matched.length > 0) {
      collegeNewsEvents.value = matched.slice(0, 6);
    } else {
      // Fallback to recent university-wide academic news, events, or announcements
      const general = nonProgramItems.filter((cmsItem) => {
        const f = (cmsItem.filters || "").toLowerCase();
        const t = (cmsItem.title || "").toLowerCase();
        return (
          f.includes("event") || f.includes("announcement") || f.includes("academic") ||
          f.includes("news") || t.includes("event") || t.includes("announcement")
        );
      });
      general.sort((x, y) => {
        const dateX = new Date(x.date || x.created_at || 0).getTime();
        const dateY = new Date(y.date || y.created_at || 0).getTime();
        return dateY - dateX;
      });
      collegeNewsEvents.value = general.slice(0, 3);
    }
  } finally {
    collegeNewsLoading.value = false;
  }
};

// Fetch CMS programs for the college this page belongs to (works for ALL pages)
const fetchCollegeProgramsFromCMS = async (cmsListRes) => {
  collegeProgramsLoading.value = true;
  try {
    const list = cmsListRes || await $fetch(`${endpoint.value}/api/cms/content/list/`).catch(() => null);
    if (!Array.isArray(list)) return;

    const matchedAbbr = resolveCollegeAbbr(item.value, itemId);
    if (!matchedAbbr) return;

    const regexMatchedAbbr = new RegExp(`(^|[^a-zA-Z0-9])${matchedAbbr}([^a-zA-Z0-9]|$)`, "i");

    // Filter CMS list: items that match the college abbr AND are bachelor/degree programs
    const matched = list.filter((cmsItem) => {
      if (!cmsItem) return false;
      const f = (cmsItem.filters || "").toLowerCase();
      const t2 = (cmsItem.title || "").toLowerCase();
      const matchesCollege = regexMatchedAbbr.test(f) || regexMatchedAbbr.test(t2);
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

    // 5. Populate college programs and news/events grids for ALL pages (reuses already-fetched listRes)
    if (item.value) {
      fetchCollegeProgramsFromCMS(listRes || null); // intentionally not awaited — loads in background
      fetchCollegeNewsFromCMS(listRes || null);     // intentionally not awaited — loads in background
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
      <div class="mx-auto w-11/12 py-6 lg:py-8 relative z-10">
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
    <nav class="bg-white border-b border-gray-200 shadow-sm">
      <div class="w-11/12 mx-auto">
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
    <div class="mx-auto lg:w-11/12 pt-8 pb-16 flex-1 w-full">

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
              <span v-if="programAbbr" class="text-sm font-mono font-bold bg-green-50 text-green-900 px-3 py-1.5 border border-green-200 rounded-lg shrink-0">
                {{ programAbbr }}
              </span>
            </div>


            

            <!-- Meta Badges -->
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span v-if="paascuInfo" class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full font-bold shadow-xs">
                <i class="fas fa-award text-emerald-700"></i> {{ paascuInfo.titleBadge }}
              </span>
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


<div class="lg:flex gap-x-2">


          <!-- ── Official College / Department Logo Card ── -->
          <div
            v-if="collegeLogoInfo && collegeLogoInfo.logoUrl"
            class="w-full bg-white border-2 border-green-800/20 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:border-green-800/40 hover:shadow-md"
          >
            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-900 text-white text-xs shadow-xs">
                  <i class="fas fa-landmark"></i>
                </span>
                <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-green-950">
                  COLLEGE SEAL & LOGO
                </span>
              </div>
              <span v-if="collegeLogoInfo.abbr" class="text-[0.6rem] font-bold font-mono px-2 py-0.5 rounded-full bg-green-50 text-green-900 border border-green-200">
                {{ collegeLogoInfo.abbr }}
              </span>
            </div>

            <!-- Logo Display Area -->
            <div class="flex flex-col items-center text-center">
              <div
                class="relative rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 p-4 shadow-inner cursor-pointer group hover:border-green-600 hover:shadow-md transition-all max-w-[220px] w-full flex items-center justify-center min-h-[160px]"
                @click="openImageModal(collegeLogoInfo.logoUrl)"
                title="Click to view high-resolution College Seal"
              >
                <img
                  :src="collegeLogoInfo.logoUrl"
                  :alt="collegeLogoInfo.title"
                  class="max-h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter"
                />
                <div class="absolute inset-0 bg-green-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.65rem] font-bold gap-1 rounded-2xl backdrop-blur-xs">
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
          <div
            v-if="paascuInfo"
            class="w-full bg-gradient-to-b from-emerald-50/80 via-white to-white border-2 border-emerald-600/30 rounded-xl p-5 shadow-sm space-y-3.5 relative overflow-hidden transition-all hover:border-emerald-600/50 hover:shadow-md"
          >
            <div class="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl pointer-events-none"></div>

            <!-- Card Header -->
            <div class="flex items-center justify-between border-b border-emerald-100/80 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-white text-xs shadow-xs">
                  <i class="fas fa-award"></i>
                </span>
                <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-emerald-950">
                  PAASCU ACCREDITED
                </span>
              </div>
              <span class="text-[0.6rem] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-700 text-white shadow-xs">
                {{ paascuInfo.statusBadge }}
              </span>
            </div>

            <!-- PAASCU Logo Spotlight Area -->
            <div class="flex flex-col items-center text-center">
              <div
                class="relative rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-xs cursor-pointer group hover:border-emerald-500 hover:shadow transition-all max-w-[210px] w-full flex items-center justify-center min-h-[120px]"
                @click="openImageModal(paascuInfo.imageUrl)"
                title="Click to view PAASCU Accreditation Seal"
              >
                <img
                  :src="paascuInfo.imageUrl"
                  alt="PAASCU Accredited Seal"
                  class="max-h-24 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs"
                />
                <div class="absolute inset-0 bg-emerald-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[0.65rem] font-bold gap-1 rounded-xl backdrop-blur-xs">
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
              <div class="mt-2.5 flex items-center justify-center gap-1.5 text-[0.65rem] text-emerald-900 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-lg font-semibold w-full">
                <i class="fas fa-certificate text-emerald-700"></i>
                <span>Quality Assured & FAAP Certified</span>
              </div>
            </div>
          </div>

</div>
          <!-- ── Student Model & Program Spotlight Card ── -->
          <div v-if="regularSpotlightImages.length > 0" class="bg-white border-2 border-green-800/20 rounded-xl p-5 shadow-sm space-y-3 relative overflow-hidden transition-all hover:border-green-800/40 hover:shadow-md">
            <div class="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-900 text-white text-xs shadow-xs">
                  <i class="fas fa-user-graduate"></i>
                </span>
                <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-green-950">
                  PROGRAM SPOTLIGHT
                </span>
              </div>
              <span class="text-[0.6rem] text-gray-400 font-normal">Click to enlarge</span>
            </div>

            <div class="space-y-4">
              <div
                v-for="(file, idx) in regularSpotlightImages"
                :key="idx"
                class="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50 p-4 group cursor-pointer shadow-inner flex items-center justify-center min-h-[160px] hover:border-green-600 transition-all"
                @click="openImageModal(getFileUrl(file))"
              >
                <img
                  :src="getFileUrl(file)"
                  :alt="item.title"
                  class="w-full max-h-[320px] h-auto object-contain transition-all duration-300 group-hover:scale-105 filter drop-shadow-md"
                />
                <div class="absolute inset-0 bg-green-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2 rounded-2xl backdrop-blur-xs">
                  <i class="fas fa-search-plus text-base"></i> View Full Image
                </div>
              </div>
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

          <!-- ── Program & Campus Media Gallery Section ── -->
          <div v-if="imageFiles.length > 0" class="bg-white border border-gray-200 rounded-xl p-6 lg:p-8 shadow-sm space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-green-900 text-sm shrink-0">
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
              <div
                v-for="(file, gIdx) in imageFiles"
                :key="gIdx"
                class="group relative rounded-xl overflow-hidden border border-gray-200 bg-gradient-to-b from-gray-50 via-white to-gray-50 p-4 shadow-xs hover:shadow-md hover:border-green-600 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[180px]"
                @click="openImageModal(getFileUrl(file))"
              >
                <img
                  :src="getFileUrl(file)"
                  :alt="`${item.title} Media ${gIdx + 1}`"
                  class="max-h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-xs"
                />
                <div class="absolute inset-0 bg-green-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-2 rounded-xl backdrop-blur-xs p-3 text-center">
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
          <div class="bg-gradient-to-br from-green-950 to-green-900 text-white rounded-xl p-6 shadow-md border border-green-800">
          
            <h4 class="flex items-center gap-2 text-lg font-extrabold uppercase tracking-wide mb-2 text-white">
               <span class="w-10 h-10 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-400 text-lg">
              <i class="fas fa-user-graduate"></i>
            </span> Enroll at La Salle
            </h4>
            <p class="text-xs text-white/75 leading-relaxed mb-6">
              Take the next step in your academic journey. Inquire now or check admission requirements for {{ programAbbr || 'this program' }}.
            </p>
            <div class="space-y-2.5">
              <a
                href="/enrollment"
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

          <!-- Events & Announcements Card Container -->
          <div class="bg-white border-2 border-green-800/20 rounded-xl p-5 shadow-sm space-y-4 transition-all hover:border-green-800/40 hover:shadow-md">
            
            <!-- Section Header -->
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="flex h-6 w-6 items-center justify-center rounded-full bg-green-900 text-white text-xs shadow-xs">
                  <i class="fas fa-bullhorn"></i>
                </span>
                <span class="text-[0.65rem] font-extrabold tracking-[0.16em] uppercase text-green-950">
                  {{ collegeLogoInfo?.abbr ? `${collegeLogoInfo.abbr} UPDATES` : 'NEWS & EVENTS' }}
                </span>
              </div>
              <NuxtLink
                to="/news-updates/list"
                class="text-[0.65rem] font-bold text-green-900 hover:text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 transition-colors inline-flex items-center gap-1"
              >
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
              <NuxtLink
                v-for="(news, nIdx) in collegeNewsEvents"
                :key="news.id || nIdx"
                :to="`/news-updates/${news.id || news.content_id}`"
                class="group bg-gray-50/60 rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-green-600 hover:bg-white transition-all flex flex-col no-underline"
              >
                <!-- Thumbnail Image -->
                <div class="relative h-[300px] w-full overflow-hidden bg-gray-100">
                  <img
                    v-if="news.files && news.files.length > 0 && isImageFile(news.files[0])"
                    :src="getFileUrl(news.files[0])"
                    :alt="news.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gradient-to-br from-green-950 via-green-900 to-green-800 flex flex-col items-center justify-center text-white p-3 text-center"
                  >
                    <i class="fas fa-newspaper text-2xl text-white/40 mb-1"></i>
                    <span class="text-[0.6rem] font-bold text-white/70 uppercase tracking-wider">La Salle University</span>
                  </div>

                  <!-- Category Tag Badge -->
                  <div class="absolute top-2 left-2">
                    <span
                      class="inline-flex items-center gap-1 text-[0.6rem] font-bold px-2 py-0.5 rounded-full border shadow-xs"
                      :class="getNewsCategory(news).bg"
                    >
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
                    <h4 class="text-xs font-extrabold text-gray-900 group-hover:text-green-900 transition-colors line-clamp-2 leading-snug mb-1.5">
                      {{ news.title }}
                    </h4>

                    <!-- Excerpt -->
                    <p v-if="news.descriptions || news.description" class="text-[0.7rem] text-gray-600 line-clamp-2 leading-relaxed mb-2">
                      {{ (news.descriptions || news.description).replace(/<[^>]*>?/gm, '').substring(0, 85) }}...
                    </p>
                  </div>

                  <!-- Action Footer -->
                  <div class="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                    <div class="flex items-center gap-1 flex-wrap">
                      <span
                        v-for="sdg in getNewsSdgBadges(news).slice(0, 2)"
                        :key="sdg.number"
                        class="text-[0.55rem] font-bold text-white px-1.5 py-0.2 rounded"
                        :style="{ backgroundColor: sdg.color }"
                      >
                        SDG {{ sdg.number }}
                      </span>
                    </div>
                    <span class="text-[0.68rem] font-bold text-green-900 group-hover:text-green-700 inline-flex items-center gap-1 shrink-0 ml-auto">
                      Read <i class="fas fa-arrow-right text-[0.6rem] transition-transform group-hover:translate-x-0.5"></i>
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
