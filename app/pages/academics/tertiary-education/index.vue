<script setup>
import { ref, computed, onMounted, watch } from "vue";

// ── State ──
const underGrad = ref(true);
const gradStud = ref(false);
const searchQuery = ref("");
const selectedSdg = ref(null); // null or SDG number 1-17
const loading = ref(true);

// Set of currently expanded college abbreviations
const openColleges = ref(new Set(["CAS", "CBA", "CCJE", "CCSEA", "CON", "CTE", "CTHM", "CMLS", "SGS"]));

const isCollegeOpen = (abbr) => {
  if (!abbr) return false;
  return openColleges.value.has(abbr.toUpperCase());
};

const toggleCollege = (abbr) => {
  if (!abbr) return;
  const upper = abbr.toUpperCase();
  const next = new Set(openColleges.value);
  if (next.has(upper)) {
    next.delete(upper);
  } else {
    next.add(upper);
  }
  openColleges.value = next;
};

const expandAllColleges = () => {
  const allAbbrs = [
    ...collegesData.value.undergrad.map((c) => c.abbr.toUpperCase()),
    ...collegesData.value.grad.map((c) => c.abbr.toUpperCase()),
  ];
  openColleges.value = new Set(allAbbrs);
};

const collapseAllColleges = () => {
  openColleges.value = new Set();
};

const areAllExpanded = computed(() => {
  const currentList = underGrad.value ? collegesData.value.undergrad : collegesData.value.grad;
  return currentList.every((c) => isCollegeOpen(c.abbr));
});

const toggleAllColleges = () => {
  if (areAllExpanded.value) {
    collapseAllColleges();
  } else {
    expandAllColleges();
  }
};

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

// ── UN SDGs Master Taxonomy ──
const sdgList = [
  { number: 1, id: "no-poverty", title: "No Poverty", color: "#e5243b", category: "Society" },
  { number: 2, id: "zero-hunger", title: "Zero Hunger", color: "#dda63a", category: "Society" },
  { number: 3, id: "good-health-and-well-being", title: "Good Health & Well-Being", color: "#4c9f38", category: "Society" },
  { number: 4, id: "quality-education", title: "Quality Education", color: "#c5192d", category: "Society" },
  { number: 5, id: "gender-equality", title: "Gender Equality", color: "#ff3a21", category: "Society" },
  { number: 6, id: "clean-water-and-sanitation", title: "Clean Water & Sanitation", color: "#26bde2", category: "Biosphere" },
  { number: 7, id: "affordable-and-clean-energy", title: "Affordable & Clean Energy", color: "#fcc30b", category: "Society" },
  { number: 8, id: "decent-work-and-economic-growth", title: "Decent Work & Economic Growth", color: "#a21942", category: "Economy" },
  { number: 9, id: "industry-innovation-and-infrastructure", title: "Industry & Innovation", color: "#fd6925", category: "Economy" },
  { number: 10, id: "reduced-inequalities", title: "Reduced Inequalities", color: "#dd1367", category: "Economy" },
  { number: 11, id: "sustainable-cities-and-communities", title: "Sustainable Cities", color: "#fd9d24", category: "Society" },
  { number: 12, id: "responsible-consumption-and-production", title: "Responsible Consumption", color: "#bf8b2e", category: "Economy" },
  { number: 13, id: "climate-action", title: "Climate Action", color: "#3f7e44", category: "Biosphere" },
  { number: 14, id: "life-below-water", title: "Life Below Water", color: "#0a97d9", category: "Biosphere" },
  { number: 15, id: "life-on-land", title: "Life on Land", color: "#56c02b", category: "Biosphere" },
  { number: 16, id: "peace-justice-and-strong-institutions", title: "Peace & Justice", color: "#00689d", category: "Society" },
  { number: 17, id: "partnerships-for-the-goals", title: "Partnerships for Goals", color: "#19486a", category: "Society" },
];

const collegeLogos = {
  cas: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cas.png",
  cba: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cba.png",
  ccje: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/CCJE.jpg",
  ccsea: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/ccsea.png",
  con: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/con-lsu.png",
  cte: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cte.png",
  cthm: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cthm.png",
  cmls: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cmls.png",
  sgs: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/sgs.png",
};

// ── Default College Taxonomy ──
const createDefaultData = () => ({
  undergrad: [
    {
      abbr: "CAS",
      title: "College of Arts and Sciences",
      link: "lsu-cas",
      logo: collegeLogos.cas,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CBA",
      title: "College of Business and Accountancy",
      link: "lsu-cba",
      logo: collegeLogos.cba,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CCJE",
      title: "College of Criminal Justice Education",
      link: "lsu-ccje",
      logo: collegeLogos.ccje,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CCSEA",
      title: "College of Computer Studies, Engineering, and Architecture",
      link: "lsu-ccsea",
      logo: collegeLogos.ccsea,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CON",
      title: "College of Nursing",
      link: "lsu-con",
      logo: collegeLogos.con,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CTE",
      title: "College of Teacher Education",
      link: "lsu-cte",
      logo: collegeLogos.cte,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CTHM",
      title: "College of Tourism and Hospitality Management",
      link: "lsu-cthm",
      logo: collegeLogos.cthm,
      programs: [],
      vmgItem: null,
    },
    {
      abbr: "CMLS",
      title: "College of Medical Laboratory Science",
      link: "lsu-cmls",
      logo: collegeLogos.cmls,
      programs: [],
      vmgItem: null,
    },
  ],
  grad: [
    {
      abbr: "SGS",
      title: "School of Graduate Studies",
      link: "lsu-sgs",
      logo: collegeLogos.sgs,
      programs: [],
      vmgItem: null,
      category: [
        {
          title: "Graduate School of Business",
          programs: [],
        },
        {
          title: "Graduate School of Education",
          programs: [],
        },
        {
          title: "College of Law",
          programs: [],
        },
      ],
    },
  ],
});

const collegesData = ref(createDefaultData());

const schoolToggle = (a, b) => {
  underGrad.value = a;
  gradStud.value = b;
};

// ── SDG Badges Extractor ──
const extractSdgBadges = (filtersStr) => {
  if (!filtersStr) return [];
  const filters = filtersStr.toLowerCase();
  const badges = [];
  for (const s of sdgList) {
    const patterns = [
      `\\bsdg${s.number}\\b`,
      `\\bsdg ${s.number}\\b`,
      `\\bsdg-${s.number}\\b`,
      `\\bsdg_${s.number}\\b`,
      `\\bgoal ${s.number}\\b`,
      `\\bgoal${s.number}\\b`,
      `\\bsdg${s.number.toString().padStart(2, "0")}\\b`,
    ];
    if (patterns.some((pat) => new RegExp(pat, "i").test(filters))) {
      badges.push(s);
    }
  }
  return badges;
};

// ── Exclude Non-Course Content (News, Updates, Exams, Licensure, Passers, Advisories, Events) ──
const isNewsOrExamOrAnnouncement = (item) => {
  if (!item) return true;
  const title = (item.title || "").trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();

  const excludedPatterns = [
    /\b(exam|examination|licensure|passer|passers|board|topnotcher|topnotch|pnle|cele|cle|cpale|let|nle|ple)\b/i,
    /\b(news|announcement|advisory|memorandum|memo|event|activity|activities|highlight|highlights|carousel|hero)\b/i,
    /\b(webinar|seminar|workshop|symposium|conference|training|orientation|hiring|vacancy|vacancies|job)\b/i,
    /\b(congratulations|congrats|tribute|celebration|ceremony|schedule|calendar|deadline|guidelines)\b/i,
    /\b(donation|blessing|investiture|commencement|alumni|reunion|moa|mou|signing|turnover)\b/i,
  ];

  if (excludedPatterns.some((pattern) => pattern.test(title) || pattern.test(filters))) {
    return true;
  }

  return false;
};

// ── College VMG Check ──
const isCollegeVmgItem = (item, college = null) => {
  if (!item || !item.title) return false;
  const title = item.title.trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();
  const descriptions = (item.descriptions || item.description || "").toLowerCase();

  if (college) {
    const cTitle = (college.title || "").trim().toLowerCase();
    const cAbbr = (college.abbr || "").trim().toLowerCase();
    if (cTitle && title === cTitle) return true;
    if (cAbbr && title === cAbbr) return true;
  }

  const collegeTitles = [
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
    "ccsea",
    "college of nursing",
    "con",
    "college of teacher education",
    "cte",
    "college of tourism and hospitality management",
    "cthm",
    "college of medical laboratory science",
    "cmls",
  ];
  if (collegeTitles.includes(title)) return true;

  // Degree program titles are NOT VMG items
  if (
    title.includes("bachelor") ||
    title.startsWith("bs ") ||
    title.startsWith("bs") ||
    title.startsWith("ba ") ||
    title.startsWith("ba") ||
    title.startsWith("bee") ||
    title.startsWith("bpe") ||
    title.startsWith("btle") ||
    title.startsWith("blis") ||
    title.startsWith("doctor of") ||
    title.startsWith("doctor in") ||
    title.startsWith("master of") ||
    title.startsWith("master in") ||
    title.startsWith("juris doctor")
  ) {
    return false;
  }

  const hasVmgTitle =
    title.includes("vision") ||
    title.includes("mission") ||
    title.includes("goal") ||
    title.includes("vmg") ||
    title.includes("objectives") ||
    title.includes("college info") ||
    title.includes("college overview") ||
    title.includes("about the college");

  const hasVmgFilter =
    filters.includes("vision") ||
    filters.includes("mission") ||
    filters.includes("vmg");

  const hasVmgDesc =
    descriptions.includes("**vision**") ||
    descriptions.includes("**mission**") ||
    (descriptions.includes("vision") && descriptions.includes("mission"));

  return hasVmgTitle || hasVmgFilter || hasVmgDesc;
};

// ── Check if an item is strictly a Graduate Degree Course (Master, Doctor, JD, PhD, etc.) ──
const isGraduateProgram = (item) => {
  if (!item || !item.title) return false;
  if (isNewsOrExamOrAnnouncement(item)) return false;
  if (isCollegeVmgItem(item)) return false;

  const title = item.title.trim().toLowerCase();

  const isDoctor =
    title.startsWith("doctor of") ||
    title.startsWith("doctor in") ||
    title.startsWith("doctorate") ||
    title.includes("doctor of philosophy") ||
    title.includes("doctor in business") ||
    title.includes("doctor of education") ||
    /\b(ph\.?d\.?|dba|edd)\b/i.test(title);

  const isMaster =
    title.startsWith("master of") ||
    title.startsWith("master in") ||
    title.startsWith("master's in") ||
    title.startsWith("master's of") ||
    title.includes("master of arts") ||
    title.includes("master of science") ||
    title.includes("master in education") ||
    title.includes("master in business") ||
    title.includes("master in public") ||
    /\b(mba|mpa|maed|med|msn|mit|msit|mscs)\b/i.test(title);

  const isLaw =
    title.includes("juris doctor") ||
    title === "jd" ||
    /\bjd\b/i.test(title) ||
    title.includes("bachelor of laws");

  return isDoctor || isMaster || isLaw;
};

// ── Check if an item is strictly an Undergraduate Degree Course / Offering ──
const isGenuineUndergradCourse = (item) => {
  if (!item || !item.title) return false;
  if (isNewsOrExamOrAnnouncement(item)) return false;
  if (isCollegeVmgItem(item)) return false;
  if (isGraduateProgram(item)) return false;

  const title = item.title.trim().toLowerCase();
  const filters = (item.filters || item.filter || "").toLowerCase();

  // Must match explicit degree naming patterns
  const degreeRegex = /^(bachelor|associate|diploma|bs\b|ba\b|bee\b|bse\b|bsed\b|beed\b|bped\b|btle\b|btled\b|blis\b|bsc\b|bsa\b|bsais\b|bsba\b|bsoa\b|bsab\b|bsce\b|bsarch\b|bsee\b|bscs\b|bsit\b|bsn\b|bshm\b|bstm\b|bsmls\b|bspsych\b|bssw\b|bapolsc\b|baels\b|bacomm\b|baphilo\b)/i;

  const hasDegreeTitle =
    degreeRegex.test(title) ||
    title.includes("bachelor of") ||
    title.includes("bachelor in") ||
    title.includes("bachelor's in") ||
    title.includes("bachelor's of") ||
    title.includes("associate in") ||
    title.includes("diploma in");

  const hasProgramFilter =
    (filters.includes("curriculum") || filters.includes("program offering") || filters.includes("undergraduate degree") || filters.includes("bachelor degree")) &&
    degreeRegex.test(title);

  return hasDegreeTitle || hasProgramFilter;
};

// ── Assign Course to Exact College Abbreviation ──
const getExactCollegeAbbrForUndergrad = (item) => {
  if (!item || !item.title) return "";
  const t = item.title.trim().toLowerCase();
  const f = (item.filters || item.filter || "").toLowerCase();
  const a = (item.authors || item.author || "").toLowerCase();

  // 1. CTE (College of Teacher Education) - check BEFORE CAS because of "English Language" or "Science" majors in education
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
    /\b(cte|lsu-cte)\b/i.test(a)
  ) {
    return "CTE";
  }

  // 2. CCSEA (Computer Studies, Engineering & Architecture)
  if (
    t.includes("computer studies") ||
    t.includes("computer science") ||
    t.includes("information technology") ||
    t.includes("civil engineering") ||
    t.includes("architecture") ||
    t.includes("electrical engineering") ||
    /\b(ccsea|ccs|lsu-ccsea|bscs|bsit|bsce|bsarch|bsee)\b/i.test(t) ||
    /\b(ccsea|ccs|lsu-ccsea)\b/i.test(f) ||
    /\b(ccsea|ccs|lsu-ccsea)\b/i.test(a)
  ) {
    return "CCSEA";
  }

  // 3. CON (College of Nursing)
  if (
    (t.includes("nursing") || /\bbsn\b/i.test(t) || /\b(con|lsu-con)\b/i.test(f) || /\b(con|lsu-con)\b/i.test(a)) &&
    !t.includes("special needs")
  ) {
    return "CON";
  }

  // 4. CMLS (College of Medical Laboratory Science)
  if (
    t.includes("medical laboratory") ||
    t.includes("medical technology") ||
    t.includes("medtech") ||
    /\bbsmls\b/i.test(t) ||
    /\b(cmls|lsu-cmls)\b/i.test(f) ||
    /\b(cmls|lsu-cmls)\b/i.test(a)
  ) {
    return "CMLS";
  }

  // 5. CTHM (College of Tourism and Hospitality Management)
  if (
    t.includes("hospitality management") ||
    t.includes("tourism management") ||
    t.includes("hospitality") ||
    t.includes("tourism") ||
    /\b(bshm|bstm|cthm|lsu-cthm)\b/i.test(t) ||
    /\b(cthm|lsu-cthm)\b/i.test(f) ||
    /\b(cthm|lsu-cthm)\b/i.test(a)
  ) {
    return "CTHM";
  }

  // 6. CCJE (College of Criminal Justice Education)
  if (
    t.includes("criminology") ||
    t.includes("criminal justice") ||
    /\b(ccje|lsu-ccje|bsc)\b/i.test(t) ||
    /\b(ccje|lsu-ccje)\b/i.test(f) ||
    /\b(ccje|lsu-ccje)\b/i.test(a)
  ) {
    return "CCJE";
  }

  // 7. CBA (College of Business and Accountancy)
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
    /\b(cba|lsu-cba)\b/i.test(a)
  ) {
    return "CBA";
  }

  // 8. CAS (College of Arts and Sciences)
  if (
    t.includes("political science") ||
    t.includes("social work") ||
    t.includes("psychology") ||
    t.includes("communication") ||
    t.includes("philosophy") ||
    (t.includes("english language") && !t.includes("education")) ||
    /\b(bapolsc|baels|bacomm|baphilo|bspsych|bssw|cas|lsu-cas)\b/i.test(t) ||
    /\b(cas|lsu-cas)\b/i.test(f) ||
    /\b(cas|lsu-cas)\b/i.test(a)
  ) {
    return "CAS";
  }

  return "";
};

// ── General College VMG Matcher ──
const isCollegeMatch = (cmsItem, college) => {
  if (!cmsItem || !college) return false;
  const cAbbr = (college.abbr || "").trim().toLowerCase();
  const cTitle = (college.title || "").trim().toLowerCase();
  const filters = (cmsItem.filters || cmsItem.filter || "").toLowerCase();
  const authors = (cmsItem.authors || cmsItem.author || "").toLowerCase();
  const title = (cmsItem.title || "").toLowerCase();

  if (cAbbr) {
    const regexAbbr = new RegExp(`(^|[^a-zA-Z0-9])${cAbbr}([^a-zA-Z0-9]|$)`, "i");
    if (regexAbbr.test(filters) || regexAbbr.test(title) || regexAbbr.test(authors)) return true;
  }

  if (cTitle && (filters.includes(cTitle) || title.includes(cTitle) || authors.includes(cTitle))) return true;

  return false;
};

// ── Deduplicate Programs ──
const dedupePrograms = (programs) => {
  const seen = new Set();
  return programs.filter((p) => {
    if (!p || !p.title) return false;
    const norm = p.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });
};

// ── Published Check ──
const isCmsPublished = (item) => {
  if (!item) return false;
  if (item.is_published === true) return true;
  const filters = (item.filters || item.filter || "").toLowerCase();
  return filters.includes("published");
};

// ── Slugs ──
const getProgramSlug = (p, fallbackLink) => {
  if (!p) return `/academics/tertiary-education/${fallbackLink || ""}`;
  if (p.id) return `/academics/tertiary-education/${p.id}`;
  if (p.content_id) return `/academics/tertiary-education/${p.content_id}`;
  if (p.abbr) return `/academics/tertiary-education/${p.abbr.toLowerCase()}`;
  if (p.title) {
    const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return `/academics/tertiary-education/${slug}`;
  }
  return `/academics/tertiary-education/${fallbackLink || ""}`;
};

const getCollegeVmgSlug = (college) => {
  if (college && college.vmgItem && (college.vmgItem.id || college.vmgItem.content_id)) {
    return `/academics/tertiary-education/${college.vmgItem.id || college.vmgItem.content_id}`;
  }
  if (college && college.abbr) {
    return `/academics/tertiary-education/${college.abbr.toLowerCase()}`;
  }
  return `/academics/tertiary-education`;
};

// ── CMS Content Composable with In-Memory Caching & De-duplication ──
const { cachedList, fetchCmsList } = useCmsContent();

// ── Process and map CMS List Data into College Taxonomy ──
const processCmsData = (res) => {
  if (!res || !Array.isArray(res)) return;
  const publishedRes = res.filter((item) => item && isCmsPublished(item));
  const freshData = createDefaultData();

  // Filter to ONLY genuine undergraduate degree courses (excluding news, events, licensure exams)
  const publishedUndergradCourses = publishedRes.filter((item) => {
    return isGenuineUndergradCourse(item);
  });

  // ── 1. Undergraduate Colleges ──
  freshData.undergrad.forEach((college) => {
    const cAbbr = college.abbr.toUpperCase();

    // Exact match by college discipline
    const cmsItems = publishedUndergradCourses.filter((item) => {
      return getExactCollegeAbbrForUndergrad(item) === cAbbr;
    });

    if (cmsItems.length > 0) {
      const mapped = cmsItems.map((cmsItem) => ({
        id: cmsItem.id || cmsItem.content_id,
        title: cmsItem.title,
        description: cmsItem.descriptions || cmsItem.description || "",
        filters: cmsItem.filters || "",
        sdgBadges: extractSdgBadges(cmsItem.filters),
        cmsData: cmsItem,
      }));
      college.programs = dedupePrograms(mapped);
    }

    // College VMG item
    const vmgItem = publishedRes.find((item) => {
      return isCollegeMatch(item, college) && isCollegeVmgItem(item, college);
    });

    if (vmgItem) {
      college.vmgItem = {
        id: vmgItem.id || vmgItem.content_id,
        title: vmgItem.title || `${college.abbr} Vision, Mission & Goals`,
        description: vmgItem.descriptions || vmgItem.description || "",
        filters: vmgItem.filters || "",
        sdgBadges: extractSdgBadges(vmgItem.filters),
        cmsData: vmgItem,
      };
    }
  });

  // ── 2. Graduate Studies (SGS) (Strictly Graduate Degree Courses Only) ──
  const publishedGradCourses = publishedRes.filter((item) => {
    return isGraduateProgram(item) && !isNewsOrExamOrAnnouncement(item) && !isCollegeVmgItem(item);
  });

  freshData.grad.forEach((college) => {
    const bizPrograms = [];
    const eduPrograms = [];
    const lawPrograms = [];
    const otherPrograms = [];

    publishedGradCourses.forEach((cmsItem) => {
      const t = (cmsItem.title || "").toLowerCase();
      const pObj = {
        id: cmsItem.id || cmsItem.content_id,
        title: cmsItem.title,
        description: cmsItem.descriptions || cmsItem.description || "",
        filters: cmsItem.filters || "",
        sdgBadges: extractSdgBadges(cmsItem.filters),
        cmsData: cmsItem,
      };

      if (t.includes("business") || t.includes("dba") || t.includes("mba") || t.includes("public administration") || t.includes("mpa")) {
        bizPrograms.push(pObj);
      } else if (t.includes("education") || t.includes("phd") || t.includes("maed") || t.includes("med") || t.includes("teaching")) {
        eduPrograms.push(pObj);
      } else if (t.includes("juris doctor") || t.includes("law") || t.includes("jd")) {
        lawPrograms.push(pObj);
      } else {
        otherPrograms.push(pObj);
      }
    });

    college.category = [
      { title: "Graduate School of Business", programs: dedupePrograms(bizPrograms) },
      { title: "Graduate School of Education", programs: dedupePrograms(eduPrograms) },
      { title: "College of Law", programs: dedupePrograms(lawPrograms) },
    ];

    if (otherPrograms.length > 0) {
      college.category.push({
        title: "Other Graduate Programs",
        programs: dedupePrograms(otherPrograms),
      });
    }

    const mappedGrad = publishedGradCourses.map((cmsItem) => ({
      id: cmsItem.id || cmsItem.content_id,
      title: cmsItem.title,
      description: cmsItem.descriptions || cmsItem.description || "",
      filters: cmsItem.filters || "",
      sdgBadges: extractSdgBadges(cmsItem.filters),
      cmsData: cmsItem,
    }));
    college.programs = dedupePrograms(mappedGrad);

    const vmgItem = publishedRes.find((item) => {
      return isCollegeMatch(item, college) && isCollegeVmgItem(item, college);
    });

    if (vmgItem) {
      college.vmgItem = {
        id: vmgItem.id || vmgItem.content_id,
        title: vmgItem.title || `${college.abbr} Vision, Mission & Goals`,
        description: vmgItem.descriptions || vmgItem.description || "",
        filters: vmgItem.filters || "",
        sdgBadges: extractSdgBadges(vmgItem.filters),
        cmsData: vmgItem,
      };
    }
  });

  collegesData.value = freshData;
};

// ── If cached data is available in memory, initialize instantly (0ms latency!) ──
if (cachedList.value && Array.isArray(cachedList.value) && cachedList.value.length > 0) {
  processCmsData(cachedList.value);
  loading.value = false;
}

// ── Fetch from CMS/List (Strictly Course Offerings Only) ──
const fetchCMSPrograms = async (force = false) => {
  const hasLoadedPrograms = collegesData.value.undergrad.some((c) => (c.programs || []).length > 0);
  if (!hasLoadedPrograms) {
    loading.value = true;
  }
  try {
    const res = await fetchCmsList(force);
    if (res && Array.isArray(res)) {
      processCmsData(res);
    }
  } catch (error) {
    console.error("Error loading CMS content list:", error);
  } finally {
    loading.value = false;
  }
};

// Initiate fetch immediately at script setup time (avoids waiting for DOM mount)
fetchCMSPrograms();

// ── Compute SDG Counts Across All Academic Programs ──
const sdgProgramCounts = computed(() => {
  const counts = {};
  for (let i = 1; i <= 17; i++) counts[i] = 0;

  const countProgram = (p) => {
    if (p.sdgBadges && Array.isArray(p.sdgBadges)) {
      p.sdgBadges.forEach((b) => {
        if (counts[b.number] !== undefined) {
          counts[b.number]++;
        }
      });
    }
  };

  collegesData.value.undergrad.forEach((col) => {
    (col.programs || []).forEach(countProgram);
  });

  collegesData.value.grad.forEach((col) => {
    (col.category || []).forEach((cat) => {
      (cat.programs || []).forEach(countProgram);
    });
  });

  return counts;
});

// ── Filtered Undergrad Colleges based on Search & Selected SDG ──
const filteredUndergrad = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const sdgFilter = selectedSdg.value;

  return collegesData.value.undergrad
    .map((college) => {
      const filteredProgs = (college.programs || []).filter((p) => {
        const titleMatch = !q || p.title.toLowerCase().includes(q);
        const sdgMatch = !sdgFilter || (p.sdgBadges && p.sdgBadges.some((b) => b.number === sdgFilter));
        return titleMatch && sdgMatch;
      });

      const colMatchesSearch = !q || college.title.toLowerCase().includes(q) || college.abbr.toLowerCase().includes(q);
      const isVisible = (colMatchesSearch && !sdgFilter) || filteredProgs.length > 0 || (college.programs && college.programs.length > 0 && !q && !sdgFilter);

      return {
        ...college,
        matchedPrograms: filteredProgs,
        hasMatches: filteredProgs.length > 0,
        isVisible,
      };
    })
    .filter((col) => col.isVisible);
});

// ── Filtered Grad Colleges based on Search & Selected SDG ──
const filteredGrad = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  const sdgFilter = selectedSdg.value;

  return collegesData.value.grad.map((college) => {
    const filteredCategories = (college.category || []).map((cat) => {
      const filteredProgs = (cat.programs || []).filter((p) => {
        const titleMatch = !q || p.title.toLowerCase().includes(q);
        const sdgMatch = !sdgFilter || (p.sdgBadges && p.sdgBadges.some((b) => b.number === sdgFilter));
        return titleMatch && sdgMatch;
      });
      return {
        ...cat,
        programs: filteredProgs,
      };
    }).filter((cat) => cat.programs.length > 0 || (!q && !sdgFilter));

    const colMatchesSearch = !q || college.title.toLowerCase().includes(q) || college.abbr.toLowerCase().includes(q);
    const hasCategoryMatches = filteredCategories.some((cat) => cat.programs.length > 0);

    return {
      ...college,
      category: filteredCategories,
      hasMatches: hasCategoryMatches,
      isVisible: (colMatchesSearch && !sdgFilter) || hasCategoryMatches || !q,
    };
  }).filter((col) => col.isVisible);
});

// Total count of matching programs
const totalMatchedPrograms = computed(() => {
  let count = 0;
  if (underGrad.value) {
    filteredUndergrad.value.forEach((c) => {
      count += (c.matchedPrograms || c.programs || []).length;
    });
  } else {
    filteredGrad.value.forEach((c) => {
      (c.category || []).forEach((cat) => {
        count += (cat.programs || []).length;
      });
    });
  }
  return count;
});

// SDG Toggle
const toggleSdg = (num) => {
  if (selectedSdg.value === num) {
    selectedSdg.value = null;
  } else {
    selectedSdg.value = num;
    expandAllColleges();
  }
};

const clearSdg = () => {
  selectedSdg.value = null;
};

// When search query is entered, auto-expand all colleges to show matches
watch(
  () => searchQuery.value,
  (newVal) => {
    if (newVal && newVal.trim().length > 0) {
      expandAllColleges();
    }
  }
);

onMounted(async () => {
  await fetchCMSPrograms();
});

useHead({
  title: "Tertiary Education | La Salle University",
  meta: [
    {
      name: "description",
      content:
        "Explore undergraduate and graduate degree programs at La Salle University, aligned with quality education and UN Sustainable Development Goals.",
    },
  ],
});
</script>

<template>
  <div class="bg-slate-50 min-h-screen flex flex-col font-sans">
    <Header />

    <!-- ── HERO BANNER ── -->
    <div class="relative overflow-hidden bg-gradient-to-r from-green-950 via-emerald-950 to-green-900 text-white py-10 lg:py-14 shadow-inner">
      <div class="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="w-11/12 mx-auto relative z-10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.68rem] font-bold tracking-widest uppercase bg-emerald-800/80 text-emerald-200 border border-emerald-500/30 shadow-sm backdrop-blur-sm">
                <i class="fas fa-graduation-cap"></i> Lasallian Higher Education
              </span>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[0.68rem] font-semibold bg-white/10 text-white/90 border border-white/15">
                <i class="fas fa-certificate text-yellow-400 text-[0.6rem]"></i> PAASCU Accredited
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-white leading-tight">
              Tertiary Education
            </h1>
            <p class="mt-2 text-sm text-emerald-100/80 w-full file:font-normal leading-relaxed">
              Transforming passion into purpose through globally-recognized undergraduate and graduate academic degree programs.
            </p>
          </div>

          <!-- Quick Banner SDG Alignment Badge -->
          <NuxtLink
            to="/sdgs"
            class="group shrink-0 flex items-center gap-3.5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-emerald-400/50 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md transition-all duration-300 no-underline text-white shadow-lg shadow-black/10"
          >
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-lg shadow-inner group-hover:scale-105 transition-transform">
              <i class="fas fa-globe-americas"></i>
            </div>
            <div>
              <div class="text-[0.68rem] uppercase font-bold tracking-wider text-emerald-300">
                UN Agenda 2030
              </div>
              <div class="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors">
                17 SDGs Integrated Curriculum
              </div>
              <div class="text-[0.65rem] text-white/70 flex items-center gap-1 mt-0.5">
                <span>Explore Sustainability Hub</span>
                <i class="fas fa-arrow-right text-[0.55rem] group-hover:translate-x-1 transition-transform"></i>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ── BREADCRUMB & SEARCH BAR ── -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm backdrop-blur-md bg-white/95">
      <div class="w-11/12 mx-auto py-3">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <!-- Breadcrumb links -->
          <nav aria-label="Breadcrumb">
            <ul class="flex items-center flex-wrap gap-x-2 text-xs text-slate-500 m-0 p-0 list-none font-medium">
              <li>
                <NuxtLink to="/" class="text-emerald-800 hover:text-emerald-950 no-underline hover:underline">Home</NuxtLink>
              </li>
              <li class="text-slate-300">/</li>
              <li>
                <span class="text-emerald-800">Academics</span>
              </li>
              <li class="text-slate-300">/</li>
              <li>
                <span class="text-slate-900 font-bold">Tertiary Education</span>
              </li>
              <li v-if="selectedSdg" class="flex items-center gap-1.5">
                <span class="text-slate-300">/</span>
                <span
                  class="text-[0.68rem] font-bold px-2 py-0.5 rounded text-white"
                  :style="{ backgroundColor: sdgList.find(s => s.number === selectedSdg)?.color || '#166534' }"
                >
                  SDG {{ selectedSdg }}
                </span>
              </li>
            </ul>
          </nav>

          <!-- Search Input Box -->
          <div class="relative w-full md:w-80">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search program, degree, or college..."
              class="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              title="Clear search"
            >
              <i class="fas fa-times-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MAIN CONTENT (SIDEBAR + RIGHT ACCORDION LIST) ── -->
    <div class="w-11/12 mx-auto py-8 lg:py-12">
      <div class="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8 items-start">

        <!-- ════════════════════════════════════════════════════════════════ -->
        <!-- LEFT SIDEBAR: BROWSE BY + SDG EXPLORER                           -->
        <!-- ════════════════════════════════════════════════════════════════ -->
        <aside class="flex flex-col gap-6 sticky top-20">

          <!-- 1. Browse By Level Navigation Card -->
          <div class="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
            <div class="text-[0.68rem] font-extrabold tracking-widest text-slate-400 uppercase mb-3 px-1 flex items-center justify-between">
              <span>Academic Level</span>
              <i class="fas fa-layer-group text-slate-300 text-xs"></i>
            </div>
            
            <div class="flex flex-col gap-2">
              <!-- Undergrad Button -->
              <button
                type="button"
                @click="schoolToggle(true, false)"
                class="flex items-center justify-between w-full p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 group border cursor-pointer"
                :class="underGrad
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md shadow-emerald-950/15 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60 font-semibold'"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0" :class="underGrad ? 'bg-emerald-800 text-white' : 'bg-white text-emerald-800 shadow-sm'">
                    <i class="fas fa-user-graduate"></i>
                  </div>
                  <span class="text-xs uppercase tracking-wide truncate">Undergraduate</span>
                </div>
                <span class="text-[0.62rem] px-2 py-0.5 rounded-full font-mono whitespace-nowrap shrink-0 ml-1.5" :class="underGrad ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'">
                  {{ collegesData.undergrad.length }} Colleges
                </span>
              </button>

              <!-- Graduate Studies Button -->
              <button
                type="button"
                @click="schoolToggle(false, true)"
                class="flex items-center justify-between w-full p-2.5 sm:p-3 rounded-xl text-left transition-all duration-200 group border cursor-pointer"
                :class="gradStud
                  ? 'bg-emerald-900 text-white border-emerald-900 shadow-md shadow-emerald-950/15 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60 font-semibold'"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0" :class="gradStud ? 'bg-emerald-800 text-white' : 'bg-white text-emerald-800 shadow-sm'">
                    <i class="fas fa-landmark"></i>
                  </div>
                  <span class="text-xs uppercase tracking-wide truncate">Graduate Studies</span>
                </div>
                <span class="text-[0.62rem] px-2 py-0.5 rounded-full font-mono whitespace-nowrap shrink-0 ml-1.5" :class="gradStud ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'">
                  SGS
                </span>
              </button>
            </div>
          </div>

          <!-- 2. Interactive UN Sustainable Development Goals (SDGs) Explorer Card -->
          <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div class="flex items-center justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[0.7rem] font-bold">
                  <i class="fas fa-leaf"></i>
                </div>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-800">Explore by SDGs</span>
              </div>
              <NuxtLink to="/sdgs" class="text-[0.65rem] font-bold text-emerald-700 hover:text-emerald-900 no-underline hover:underline">
                View All <i class="fas fa-external-link-alt text-[0.55rem]"></i>
              </NuxtLink>
            </div>

            <p class="text-[0.72rem] text-slate-500 mb-3.5 leading-relaxed">
              Filter degree program offerings aligned with the United Nations Sustainable Development Goals.
            </p>

            <!-- Sustainability Hub Link -->
            <NuxtLink
              to="/sdgs"
              class="flex items-center justify-between w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/70 text-emerald-900 text-xs font-bold transition-all group no-underline"
            >
              <div class="flex items-center gap-2">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
                  alt="SDGs"
                  class="h-4 w-4 object-contain"
                />
                <span class="text-[0.72rem]">LSU Sustainability Agenda</span>
              </div>
              <i class="fas fa-chevron-right text-[0.65rem] group-hover:translate-x-0.5 transition-transform text-emerald-700"></i>
            </NuxtLink>
          </div>

          <!-- 3. PAASCU & Quality Assurance Card -->
          <div class="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800">
            <div class="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2">
              <i class="fas fa-award text-yellow-400"></i> Quality Lasallian Education
            </div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Our academic programs undergo rigorous continuous assessment by the Philippine Accrediting Association of Schools, Colleges, and Universities (PAASCU).
            </p>
            <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[0.7rem] text-slate-400">
              <span class="font-medium">Continuous Accreditation</span>
              <span class="text-emerald-400 font-bold">Level II / III / IV</span>
            </div>
          </div>

        </aside>

        <!-- ════════════════════════════════════════════════════════════════ -->
        <!-- RIGHT CONTENT AREA: DEGREE PROGRAM LISTINGS                      -->
        <!-- ════════════════════════════════════════════════════════════════ -->
        <main class="flex flex-col gap-6">

          <!-- Section Header / Controls Bar -->
          <div class="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm">
                <i :class="underGrad ? 'fas fa-graduation-cap' : 'fas fa-landmark'"></i>
              </div>
              <div>
                <h2 class="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 m-0">
                  {{ underGrad ? "Undergraduate Degree Programs" : "Graduate Studies (SGS)" }}
                </h2>
                <p class="text-[0.72rem] text-slate-500 m-0">
                  Showing {{ totalMatchedPrograms }} degree program offerings
                  <span v-if="selectedSdg" class="font-bold text-emerald-800">
                    &bull; Filtered by SDG {{ selectedSdg }}: {{ sdgList.find(s => s.number === selectedSdg)?.title }}
                  </span>
                  <span v-if="searchQuery" class="font-bold text-emerald-800">
                    &bull; Matching "{{ searchQuery }}"
                  </span>
                </p>
              </div>
            </div>

            <!-- Controls: Expand/Collapse All & Reset -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="toggleAllColleges"
                class="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i :class="areAllExpanded ? 'fas fa-compress-alt' : 'fas fa-expand-alt'" class="text-[0.65rem]"></i>
                <span>{{ areAllExpanded ? "Collapse All" : "Expand All" }}</span>
              </button>

              <button
                v-if="selectedSdg || searchQuery"
                @click="clearSdg(); searchQuery = ''"
                class="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <i class="fas fa-rotate-left text-[0.65rem]"></i> Reset
              </button>
            </div>
          </div>

          <!-- Loading State Skeleton -->
          <div v-if="loading" class="flex flex-col gap-4">
            <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse flex flex-col gap-3">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-slate-200 rounded-xl"></div>
                <div class="flex-1">
                  <div class="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div class="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- UNDERGRADUATE VIEW                                             -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div v-else-if="underGrad" class="flex flex-col gap-4">

            <!-- Empty Search State -->
            <div v-if="filteredUndergrad.length === 0" class="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-3">
                <i class="fas fa-search"></i>
              </div>
              <h3 class="text-sm font-bold text-slate-800 mb-1">No Matching Course Offerings Found</h3>
              <p class="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                We couldn't find any degree programs matching your current filter criteria. Try adjusting your search term or SDG filter.
              </p>
              <button
                @click="clearSdg(); searchQuery = ''"
                class="px-4 py-2 bg-emerald-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-colors shadow-sm cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>

            <!-- College Cards -->
            <div
              v-for="col in filteredUndergrad"
              :key="col.abbr"
              class="bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm"
              :class="[
                isCollegeOpen(col.abbr) ? 'border-emerald-700/60 shadow-md' : 'border-slate-200 hover:border-slate-300',
                selectedSdg && col.hasMatches ? 'ring-1 ring-emerald-500/30' : ''
              ]"
            >
              <!-- Card Header Button -->
              <div
                class="flex items-center justify-between p-4 sm:p-5 gap-4 cursor-pointer select-none transition-colors"
                :class="isCollegeOpen(col.abbr) ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50/80'"
                @click="toggleCollege(col.abbr)"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <!-- College Monogram / Logo Avatar -->
                  <div class="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    <img
                      v-if="col.logo"
                      :src="col.logo"
                      :alt="col.abbr"
                      class="w-full h-full object-contain"
                      @error="col.logo = null"
                    />
                    <span v-else class="text-xs font-extrabold text-emerald-900 font-mono">
                      {{ col.abbr }}
                    </span>
                  </div>

                  <!-- College Names & Badges -->
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap mb-0.5">
                      <span class="text-[0.68rem] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {{ col.abbr }}
                      </span>
                      <span class="text-[0.65rem] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {{ (col.matchedPrograms || col.programs || []).length }} Course Offerings
                      </span>
                    </div>
                    <h3 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate">
                      {{ col.title }}
                    </h3>
                  </div>
                </div>

                <!-- Chevron indicator -->
                <div class="flex items-center gap-2 shrink-0">
                  <div
                    class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs transition-transform duration-200"
                    :class="isCollegeOpen(col.abbr) ? 'rotate-180 bg-emerald-100 text-emerald-900' : ''"
                  >
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>

              <!-- Card Body (Expanded) -->
              <div v-if="isCollegeOpen(col.abbr)" class="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 flex flex-col gap-4">

                <!-- College VMG Link Banner -->
                <NuxtLink
                  :to="getCollegeVmgSlug(col)"
                  class="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-900 to-teal-950 hover:from-emerald-950 hover:to-slate-950 rounded-xl text-white transition-all group no-underline shadow-sm"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-emerald-300 flex items-center justify-center text-xs shrink-0">
                      <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors truncate">
                        {{ col.vmgItem?.title || `${col.abbr} Vision, Mission & Goals` }}
                      </div>
                      <div class="text-[0.68rem] text-emerald-200/80 truncate">
                        View College Vision, Mission, Educational Objectives & Administration
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 text-[0.72rem] font-bold text-emerald-300 shrink-0 group-hover:translate-x-0.5 transition-transform ml-2">
                    <span class="hidden sm:inline">Explore VMG</span>
                    <i class="fas fa-chevron-right text-[0.65rem]"></i>
                  </div>
                </NuxtLink>

                <!-- Degree Programs Section -->
                <div>
                  <div class="text-[0.68rem] font-extrabold tracking-wider uppercase text-slate-500 mb-2.5 flex items-center justify-between">
                    <span>DEGREE PROGRAMS ({{ (col.matchedPrograms || col.programs || []).length }})</span>
                    <span v-if="selectedSdg" class="text-[0.65rem] text-emerald-800 font-bold">
                      Filtered by SDG {{ selectedSdg }}
                    </span>
                  </div>

                  <!-- Programs Grid -->
                  <div class="grid grid-cols-1 gap-2">
                    <div
                      v-for="(p, l) in (col.matchedPrograms || col.programs || [])"
                      :key="p.id || l"
                      class="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/80 hover:border-emerald-600/60 hover:shadow-md transition-all duration-200 group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div class="min-w-0 flex-1">
                        <NuxtLink
                          :to="getProgramSlug(p, col.link)"
                          class="text-xs sm:text-[0.82rem] font-bold text-slate-800 group-hover:text-emerald-900 transition-colors no-underline block leading-snug"
                        >
                          {{ p.title }}
                        </NuxtLink>

                        <!-- SDG Badges for this program -->
                        <div v-if="p.sdgBadges && p.sdgBadges.length > 0" class="flex items-center flex-wrap gap-1.5 mt-2">
                          <span class="text-[0.62rem] font-bold uppercase tracking-wider text-slate-400">SDG Alignment:</span>
                          <span
                            v-for="b in p.sdgBadges"
                            :key="b.number"
                            class="inline-flex items-center gap-1 text-[0.62rem] font-extrabold px-1.5 py-0.5 rounded text-white shadow-xs"
                            :style="{ backgroundColor: b.color }"
                            :title="`Goal ${b.number}: ${b.title}`"
                          >
                            <i class="fas fa-circle-check text-[0.55rem]"></i>
                            SDG {{ b.number }}
                          </span>
                        </div>
                      </div>

                      <!-- View Program CTA -->
                      <NuxtLink
                        :to="getProgramSlug(p, col.link)"
                        class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors shrink-0 self-start sm:self-center no-underline"
                      >
                        <span>View Program</span>
                        <i class="fas fa-arrow-right text-[0.6rem] group-hover:translate-x-0.5 transition-transform"></i>
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Empty state when filtered out -->
                  <div v-if="(col.matchedPrograms || col.programs || []).length === 0" class="p-4 rounded-xl bg-slate-100/80 text-center text-xs text-slate-500">
                    No course offerings in this college match the selected filter.
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- ══════════════════════════════════════════════════════════════ -->
          <!-- GRADUATE STUDIES VIEW (SGS)                                    -->
          <!-- ══════════════════════════════════════════════════════════════ -->
          <div v-else-if="gradStud" class="flex flex-col gap-4">

            <!-- SGS College Accordion -->
            <div
              v-for="col in filteredGrad"
              :key="col.abbr"
              class="bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm"
              :class="isCollegeOpen(col.abbr) ? 'border-emerald-700/60 shadow-md' : 'border-slate-200 hover:border-slate-300'"
            >
              <!-- Card Header -->
              <div
                class="flex items-center justify-between p-4 sm:p-5 gap-4 cursor-pointer select-none transition-colors"
                :class="isCollegeOpen(col.abbr) ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50/80'"
                @click="toggleCollege(col.abbr)"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    <img
                      v-if="col.logo"
                      :src="col.logo"
                      :alt="col.abbr"
                      class="w-full h-full object-contain"
                      @error="col.logo = null"
                    />
                    <span v-else class="text-xs font-extrabold text-emerald-900 font-mono">
                      {{ col.abbr }}
                    </span>
                  </div>
                  <div>
                    <div class="flex items-center gap-2 mb-0.5">
                      <span class="text-[0.68rem] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {{ col.abbr }}
                      </span>
                      <span class="text-[0.65rem] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Graduate Studies
                      </span>
                    </div>
                    <h3 class="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {{ col.title }}
                    </h3>
                  </div>
                </div>

                <!-- Chevron indicator -->
                <div class="flex items-center gap-2 shrink-0">
                  <div
                    class="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs transition-transform duration-200"
                    :class="isCollegeOpen(col.abbr) ? 'rotate-180 bg-emerald-100 text-emerald-900' : ''"
                  >
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>

              <!-- Card Body -->
              <div v-if="isCollegeOpen(col.abbr)" class="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 flex flex-col gap-6">

                <!-- SGS VMG Link Banner -->
                <NuxtLink
                  :to="getCollegeVmgSlug(col)"
                  class="flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-900 to-teal-950 hover:from-emerald-950 hover:to-slate-950 rounded-xl text-white transition-all group no-underline shadow-sm"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 text-emerald-300 flex items-center justify-center text-xs shrink-0">
                      <i class="fas fa-bullseye"></i>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs font-bold text-white group-hover:text-emerald-200 transition-colors truncate">
                        {{ col.vmgItem?.title || `${col.abbr} Vision, Mission & Goals` }}
                      </div>
                      <div class="text-[0.68rem] text-emerald-200/80 truncate">
                        View School of Graduate Studies Vision, Mission & Educational Objectives
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 text-[0.72rem] font-bold text-emerald-300 shrink-0 group-hover:translate-x-0.5 transition-transform ml-2">
                    <span class="hidden sm:inline">Explore SGS</span>
                    <i class="fas fa-chevron-right text-[0.65rem]"></i>
                  </div>
                </NuxtLink>

                <!-- Categorized Graduate Programs -->
                <div v-for="(cat, l) in col.category" :key="l" class="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                  <div class="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                    <span class="w-2 h-2 rounded-full bg-emerald-700"></span>
                    <h4 class="text-xs sm:text-[0.82rem] font-extrabold uppercase tracking-wide text-emerald-900 m-0">
                      {{ cat.title }}
                    </h4>
                  </div>

                  <div class="grid grid-cols-1 gap-2">
                    <div
                      v-for="(p, m) in cat.programs"
                      :key="p.id || m"
                      class="bg-slate-50/60 hover:bg-emerald-50/50 rounded-xl p-3 border border-slate-200/60 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div class="min-w-0 flex-1">
                        <NuxtLink
                          :to="getProgramSlug(p, col.link)"
                          class="text-xs sm:text-[0.82rem] font-bold text-slate-800 group-hover:text-emerald-900 transition-colors no-underline block leading-snug"
                        >
                          {{ p.title }}
                        </NuxtLink>

                        <!-- SDG Badges -->
                        <div v-if="p.sdgBadges && p.sdgBadges.length > 0" class="flex items-center flex-wrap gap-1.5 mt-2">
                          <span
                            v-for="b in p.sdgBadges"
                            :key="b.number"
                            class="inline-flex items-center gap-1 text-[0.62rem] font-extrabold px-1.5 py-0.5 rounded text-white shadow-xs"
                            :style="{ backgroundColor: b.color }"
                            :title="`Goal ${b.number}: ${b.title}`"
                          >
                            <i class="fas fa-circle-check text-[0.55rem]"></i>
                            SDG {{ b.number }}
                          </span>
                        </div>
                      </div>

                      <NuxtLink
                        :to="getProgramSlug(p, col.link)"
                        class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 transition-colors shrink-0 self-start sm:self-center border border-slate-200/70 no-underline shadow-xs"
                      >
                        <span>View Details</span>
                        <i class="fas fa-arrow-right text-[0.6rem] group-hover:translate-x-0.5 transition-transform"></i>
                      </NuxtLink>
                    </div>
                  </div>

                  <div v-if="cat.programs.length === 0" class="p-3 text-center text-xs text-slate-400">
                    No programs currently matching the filter criteria in this category.
                  </div>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
    </div>

    <!-- ── FOOTER ── -->
    <Footer />
  </div>
</template>

<style scoped>
</style>