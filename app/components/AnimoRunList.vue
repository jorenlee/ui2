<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import animoRunData from "~/animorun.json";

const COLLEGE_COURSE_OPTIONS = animoRunData?.COLLEGE_COURSE_OPTIONS || [];

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const isFetching = ref(false);
const isAutoRefreshing = ref(false);
const lastUpdated = ref(null);
let pollingInterval = null;
const POLL_INTERVAL_MS = 5000; // 5 seconds
const isConfirming = ref(false);
const isBulkDeleting = ref(false);

// ── Multi-select state ──────────────────────────────────────────────────
const selectedIds = ref([]);

const allSelected = computed(() => {
  const visible = filteredRegistrations.value;
  return visible.length > 0 && visible.every((r) => selectedIds.value.includes(r.id));
});

const someSelected = computed(() => {
  return selectedIds.value.length > 0 && !allSelected.value;
});

const toggleSelectAll = () => {
  if (allSelected.value) {
    // Deselect all currently visible
    const visibleIds = filteredRegistrations.value.map((r) => r.id);
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.includes(id));
  } else {
    const visibleIds = filteredRegistrations.value.map((r) => r.id);
    const merged = new Set([...selectedIds.value, ...visibleIds]);
    selectedIds.value = Array.from(merged);
  }
};

const toggleSelectOne = (id) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((i) => i !== id);
  } else {
    selectedIds.value = [...selectedIds.value, id];
  }
};

const clearSelection = () => {
  selectedIds.value = [];
};

// ── Bulk-delete modal ───────────────────────────────────────────────────
const bulkDeleteModal = ref({ show: false });

const promptBulkDelete = () => {
  if (!selectedIds.value.length || isBulkDeleting.value) return;
  bulkDeleteModal.value.show = true;
};

const closeBulkDeleteModal = () => {
  bulkDeleteModal.value.show = false;
};

const executeBulkDelete = async () => {
  if (!selectedIds.value.length || isBulkDeleting.value) return;
  isBulkDeleting.value = true;
  const ids = [...selectedIds.value];
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/bulk-delete/`, {
      method: "DELETE",
      body: { ids },
    });
    registrations.value = registrations.value.filter((r) => !ids.includes(r.id));
    clearSelection();
    closeBulkDeleteModal();
    showNotice(
      res.message || `${ids.length} registration(s) deleted successfully.`,
      "Deleted",
      "success"
    );
  } catch (err) {
    console.error("Bulk delete error:", err);
    closeBulkDeleteModal();
    showNotice(
      "Failed to delete the selected registrations. Please try again.",
      "Deletion Failed",
      "error"
    );
  } finally {
    isBulkDeleting.value = false;
  }
};

const confirmModal = ref({
  show: false,
  runner: null,
});

const toastModal = ref({
  show: false,
  title: "Notice",
  message: "",
  type: "success",
});

const showNotice = (message, title = "Notice", type = "success") => {
  toastModal.value = {
    show: true,
    title,
    message,
    type,
  };
};

const closeNotice = () => {
  toastModal.value.show = false;
};

const searchQuery = ref("");
const selectedCategory = ref("All");
const selectedStatus = ref("All");
const selectedParticipantType = ref("All");
const selectedAgeGroup = ref("All");
const selectedAcademicUnit = ref("All"); // "All", "HEU", "BEU", "Grade School", "JHS", "SHS", or specific course

// Helper: compute age from birthdate string
const computeAge = (birthdate) => {
  if (!birthdate) return null;
  const birth = new Date(birthdate);
  if (isNaN(birth)) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getAgeGroup = (birthdate) => {
  const age = computeAge(birthdate);
  if (age === null) return null;
  if (age < 18) return 'Under 18';
  if (age <= 24) return '18–24';
  if (age <= 34) return '25–34';
  if (age <= 44) return '35–44';
  if (age <= 54) return '45–54';
  return '55+';
};
const selectedRunner = ref(null);
const isDetailModalOpen = ref(false);

const receiptModal = ref({
  show: false,
  url: "",
  title: "Payment Receipt",
  runner: null,
});

const openReceiptModal = (url, title = "Payment Receipt", runner = null) => {
  if (!url) return;
  receiptModal.value = {
    show: true,
    url: cleanURL(url),
    title,
    runner: runner || selectedRunner.value,
  };
};

const closeReceiptModal = () => {
  receiptModal.value.show = false;
  receiptModal.value.url = "";
  receiptModal.value.runner = null;
};

// Strip everything after the file extension (removes query strings, tokens, extra params)
const cleanURL = (url) => {
  if (!url) return "";
  // Match the URL up to and including the file extension (e.g. .jpg, .png, .pdf, .jpeg, .webp, .gif)
  const match = String(url).match(/^(.*?\.(?:jpg|jpeg|png|gif|webp|bmp|svg|pdf|heic|heif))/i);
  return match ? match[1] : url;
};

// Clean image URLs only until extension (.jpg, .jpeg, .png) removing query params/tokens
const getCleanUrl = (url) => {
  if (!url) return "";
  const match = String(url).match(/^(.*?\.(?:jpg|jpeg|png))/i);
  return match ? match[1] : cleanURL(url);
};


const runCategories = [
  { id: "1KM", name: "1 KM", color: "bg-[#123F38] text-white" }, // Green
  { id: "3KM", name: "3 KM", color: "bg-[#6F2A22] text-white" }, // Red
  { id: "10KM", name: "10 KM", color: "bg-[#8A4528] text-white" }, // Brown
  { id: "20KM", name: "20 KM", color: "bg-[#1D2735] text-white" }, // Navy
];

// Helper: Normalize category string to standard KM format ("1KM", "3KM", "10KM", "20KM")
const normalizeCategory = (cat) => {
  if (!cat) return "";
  const val = String(cat).trim().toUpperCase();
  if (val.includes("PET") || val.startsWith("1K") || val === "1") return "1KM";
  if (val.startsWith("20K") || val === "20") return "20KM";
  if (val.startsWith("10K") || val === "10") return "10KM";
  if (val.startsWith("3K") || val === "3") return "3KM";
  const prefix = val.split(" ")[0];
  if (prefix.endsWith("KM")) return prefix;
  if (prefix.endsWith("K")) return prefix + "M";
  if (!isNaN(prefix) && prefix !== "") return prefix + "KM";
  return prefix;
};

const categoryCounters = [
  { id: "1KM", label: "1KM", dot: "bg-emerald-400" },
  { id: "3KM", label: "3KM", dot: "bg-rose-400" },
  { id: "10KM", label: "10KM", dot: "bg-amber-400" },
  { id: "20KM", label: "20KM", dot: "bg-sky-400" },
];

const categoryCounts = computed(() => {
  const counts = { "1KM": 0, "3KM": 0, "10KM": 0, "20KM": 0 };
  registrations.value.forEach((r) => {
    const norm = normalizeCategory(r.run_category);
    if (counts[norm] !== undefined) {
      counts[norm]++;
    }
  });
  return counts;
});

const CACHE_KEY = "animorun_registrations_cache";
const BATCHES_CACHE_KEY = "animorun_batches_cache";

let initialRegs = [];
if (process.client) {
  try {
    const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
    if (cached) initialRegs = JSON.parse(cached);
  } catch {}
}
const registrations = ref(initialRegs);

const persistCache = (data) => {
  if (process.client && Array.isArray(data)) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(CACHE_KEY, serialized);
      sessionStorage.setItem(CACHE_KEY, serialized);
    } catch {}
  }
};

const isInitialLoading = computed(() => isFetching.value && registrations.value.length === 0);

// ── HEU & BEU Academic Unit Classification ───────────────────────────────────
// HEU: Higher Education Unit (All Bachelor Degrees & School of Graduate Studies - SGS)
// BEU: Basic Education Unit (Grade School, JHS, SHS)

// Helper: Check if a runner belongs to School of Graduate Studies (SGS)
const isGraduateStudies = (runner) => {
  if (!runner) return false;
  const course = String(runner.college_course || "").trim();
  const courseUpper = course.toUpperCase();

  if (
    courseUpper.includes("MASTER") ||
    courseUpper.includes("DOCTOR") ||
    courseUpper.includes("GRADUATE") ||
    courseUpper.includes("JURIS") ||
    courseUpper.includes("PHD") ||
    courseUpper.includes("DBA") ||
    courseUpper.includes("MBA") ||
    courseUpper.includes("MPA") ||
    courseUpper.includes("MAED") ||
    courseUpper.includes("MED")
  ) {
    return true;
  }

  const sgsCodes = new Set([
    "MPA", "MBA", "DBA", "PHDED", "MAED", "MA-EDUC", "MED", "JD", "PHD", "SGS"
  ]);
  return sgsCodes.has(courseUpper);
};

// Helper: Check if a runner belongs to HEU (All Bachelor Degrees + School of Graduate Studies)
const isHEU = (runner) => {
  if (!runner) return false;
  const course = String(runner.college_course || "").trim();
  const courseUpper = course.toUpperCase();

  // If explicit BEU value, never HEU
  if (
    courseUpper === "GRADE SCHOOL" ||
    courseUpper === "JHS" ||
    courseUpper === "SHS" ||
    courseUpper.includes("GRADE SCHOOL") ||
    courseUpper.includes("JUNIOR HIGH") ||
    courseUpper.includes("SENIOR HIGH")
  ) {
    return false;
  }

  // All Bachelor Degrees or Graduate Studies (Master, Doctor, Juris Doctor, PhD, DBA, etc.)
  if (
    courseUpper.includes("BACHELOR") ||
    courseUpper.includes("MASTER") ||
    courseUpper.includes("DOCTOR") ||
    courseUpper.includes("GRADUATE") ||
    courseUpper.includes("JURIS") ||
    courseUpper.includes("PHD")
  ) {
    return true;
  }

  // Known HEU & SGS Codes
  const heuAndSgsCodes = new Set([
    "MPA", "MBA", "DBA", "PHDED", "MAED", "MA-EDUC", "MED", "JD", "PHD", "SGS",
    "BSW", "BSPSYCH", "ABPOLSCI", "BSBA-MARKETING", "BSBA-FINANCIAL", "BSA",
    "BSAIS", "BSCRIM", "BSCE-COMPUTER", "BSCE-CIVIL", "BSCE", "BLIS", "BSIT",
    "BSCS", "BSARCH", "BSECE", "BSN", "BSNED", "BPED", "BSED-VALUES",
    "BSED-SOCIALSTUDIES", "BSED-SCIENCE", "BSED-MATHEMATICS", "BSED-FILIPINO",
    "BSED-ENGLISH", "BSED", "BEED", "BTLED", "BSHM", "BSTM", "BSMLS", "BSBA"
  ]);
  if (heuAndSgsCodes.has(courseUpper)) return true;

  // Match against known course values in COLLEGE_COURSE_OPTIONS (excluding BEU)
  const match = (COLLEGE_COURSE_OPTIONS || []).find(
    (c) =>
      c.value &&
      (c.value.toUpperCase() === courseUpper || c.label.toUpperCase() === courseUpper) &&
      !["GRADE SCHOOL", "JHS", "SHS"].includes(c.value.toUpperCase())
  );
  if (match) return true;

  // Degree abbreviations (BS, AB, BEEd, BTLEd, MPA, MBA, DBA, PhD, JD, MAEd, MEd)
  if (/^(BS|AB|BEED|BTLED|BPED|BSN|BLIS|MPA|MBA|DBA|PHD|MAED|MED|JD)/i.test(course)) return true;

  // Fallback: LSU student in college year level (1st-5th Year) without BEU markers
  const year = String(runner.college_year || "").trim();
  if (
    /^[1-5](st|nd|rd|th)\s*Year/i.test(year) &&
    (runner.participant_type || "").includes("Student") &&
    !runner.beu_grade
  ) {
    return true;
  }

  return false;
};

// Helper: Check if a runner belongs to BEU (Grade School, JHS, SHS)
const isBEU = (runner) => {
  if (!runner) return false;
  const course = String(runner.college_course || "").trim().toUpperCase();
  const beuGrade = String(runner.beu_grade || "").trim().toUpperCase();
  const year = String(runner.college_year || "").trim().toUpperCase();

  if (
    course === "GRADE SCHOOL" ||
    course === "JHS" ||
    course === "SHS" ||
    course.includes("GRADE SCHOOL") ||
    course.includes("JUNIOR HIGH") ||
    course.includes("SENIOR HIGH")
  ) {
    return true;
  }

  // If not HEU, check beu_grade or college_year for BEU indicators
  if (
    !isHEU(runner) &&
    (beuGrade || /(GRADE\s*\d|SFTD|NURSERY|KINDER)/i.test(year))
  ) {
    return true;
  }

  return false;
};

// Check specific BEU Level: "Grade School", "JHS", "SHS"
const isBEULevel = (runner, level) => {
  if (!runner || !isBEU(runner)) return false;
  const course = String(runner.college_course || "").trim();
  const combined = `${runner.college_course || ""} ${runner.beu_grade || ""} ${runner.college_year || ""}`.toUpperCase();
  const lvl = level.toUpperCase();

  if (lvl === "SHS") {
    return (
      course.toUpperCase() === "SHS" ||
      combined.includes("SHS") ||
      combined.includes("SENIOR HIGH") ||
      combined.includes("GRADE 11") ||
      combined.includes("GRADE 12")
    );
  }

  if (lvl === "JHS") {
    return (
      course.toUpperCase() === "JHS" ||
      combined.includes("JHS") ||
      combined.includes("JUNIOR HIGH") ||
      combined.includes("GRADE 7") ||
      combined.includes("GRADE 8") ||
      combined.includes("GRADE 9") ||
      combined.includes("GRADE 10")
    );
  }

  if (lvl === "GRADE SCHOOL") {
    return (
      course.toUpperCase() === "GRADE SCHOOL" ||
      combined.includes("GRADE SCHOOL") ||
      combined.includes("SFTD - GS") ||
      combined.includes("NURSERY") ||
      combined.includes("KINDER") ||
      /(GRADE\s*[1-6]\b)/i.test(combined)
    );
  }

  return false;
};

// Check specific Bachelor or Graduate course match
const matchesSpecificCourse = (runner, courseValue) => {
  if (!runner) return false;
  const course = String(runner.college_course || "").trim().toLowerCase();
  const target = String(courseValue).trim().toLowerCase();
  if (!course || !target) return false;
  if (course === target) return true;
  const option = (COLLEGE_COURSE_OPTIONS || []).find((c) => c.value && c.value.toLowerCase() === target);
  if (option && option.label.toLowerCase() === course) return true;
  return false;
};

// Toggle academic unit filter
const toggleAcademicUnit = (unit) => {
  if (selectedAcademicUnit.value === unit) {
    selectedAcademicUnit.value = "All";
  } else {
    selectedAcademicUnit.value = unit;
  }
};

// Bachelor degree courses from COLLEGE_COURSE_OPTIONS
const bachelorCourses = computed(() => {
  return (COLLEGE_COURSE_OPTIONS || []).filter(
    (c) => c.value && c.label.toLowerCase().includes("bachelor")
  );
});

// School of Graduate Studies (SGS) degree courses from COLLEGE_COURSE_OPTIONS
const graduateCourses = computed(() => {
  return (COLLEGE_COURSE_OPTIONS || []).filter(
    (c) =>
      c.value &&
      !["Grade School", "JHS", "SHS"].includes(c.value) &&
      (c.label.toLowerCase().includes("master") ||
        c.label.toLowerCase().includes("doctor") ||
        c.label.toLowerCase().includes("juris") ||
        c.label.toLowerCase().includes("philosophy") ||
        ["MPA", "MBA", "DBA", "PhDEd", "MAEd", "MA-Educ", "MEd", "JD", "PhD"].includes(c.value))
  );
});

// All HEU Courses combined
const allHeuCourses = computed(() => {
  return [...bachelorCourses.value, ...graduateCourses.value];
});

const isHeuSelected = computed(() => {
  if (selectedAcademicUnit.value === "HEU" || selectedAcademicUnit.value === "SGS") return true;
  return allHeuCourses.value.some((c) => c.value === selectedAcademicUnit.value);
});

const isBeuSelected = computed(() => {
  return ["BEU", "Grade School", "JHS", "SHS"].includes(selectedAcademicUnit.value);
});

const heuCount = computed(() => {
  return registrations.value.filter((r) => isHEU(r)).length;
});

const beuCount = computed(() => {
  return registrations.value.filter((r) => isBEU(r)).length;
});

const beuGradeSchoolCount = computed(() => {
  return registrations.value.filter((r) => isBEULevel(r, "Grade School")).length;
});

const beuJhsCount = computed(() => {
  return registrations.value.filter((r) => isBEULevel(r, "JHS")).length;
});

const beuShsCount = computed(() => {
  return registrations.value.filter((r) => isBEULevel(r, "SHS")).length;
});

// Format Course label
const getCourseLabel = (val) => {
  if (!val) return "";
  const v = String(val).trim();
  const match = (COLLEGE_COURSE_OPTIONS || []).find(
    (c) => c.value && (c.value.toLowerCase() === v.toLowerCase() || c.label.toLowerCase() === v.toLowerCase())
  );
  return match ? match.label : v;
};

// ── Auto-Deduplication ────────────────────────────────────────────────────────
// Groups registrations by (firstname + lastname + created_at minute).
// Within each duplicate group, the entry with the smallest id is kept (first
// submission); all others are deleted via the bulk-delete API and removed from
// the local list immediately so the UI updates without waiting for the next poll.
const isDeduplicating = ref(false);

const deduplicateRegistrations = async () => {
  if (isDeduplicating.value) return;

  // Build a map keyed by "firstname|lastname|created_at-minute"
  const groups = new Map();
  for (const r of registrations.value) {
    const firstName = (r.firstname || "").trim().toLowerCase();
    const lastName = (r.lastname || "").trim().toLowerCase();
    // Truncate timestamp to the minute so entries within the same minute are grouped
    const minute = r.created_at
      ? r.created_at.substring(0, 16) // "YYYY-MM-DDTHH:MM" or "YYYY-MM-DD HH:MM"
      : "__no_ts__";
    const key = `${firstName}|${lastName}|${minute}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  // Collect IDs to delete (all but the first/lowest id in each group)
  const toDeleteIds = [];
  for (const [, group] of groups) {
    if (group.length < 2) continue;
    // Sort ascending by id so the smallest (first) id is index 0
    group.sort((a, b) => Number(a.id) - Number(b.id));
    // Keep group[0], delete the rest
    for (let i = 1; i < group.length; i++) {
      toDeleteIds.push(group[i].id);
    }
  }

  if (!toDeleteIds.length) return;

  isDeduplicating.value = true;
  try {
    // Remove from local list immediately for instant UI update
    registrations.value = registrations.value.filter((r) => !toDeleteIds.includes(r.id));
    // Also clear any stale selections
    selectedIds.value = selectedIds.value.filter((id) => !toDeleteIds.includes(id));

    // Persist the deletion to the server
    await $fetch(`${endpoint.value}/api/animorun/bulk-delete/`, {
      method: "DELETE",
      body: { ids: toDeleteIds },
    });
    console.info(`[AnimoRunList] Auto-removed ${toDeleteIds.length} duplicate registration(s).`);
  } catch (err) {
    console.error("[AnimoRunList] Auto-deduplication delete error:", err);
  } finally {
    isDeduplicating.value = false;
  }
};

const fetchRegistrations = async (silent = false) => {
  if (silent) {
    isAutoRefreshing.value = true;
  } else {
    isFetching.value = true;
  }
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/list/`);
    if (Array.isArray(res)) {
      registrations.value = res;
      lastUpdated.value = new Date();
      persistCache(res);
      // Run deduplication non-blocking in background so UI finishes immediately
      deduplicateRegistrations();
    }
  } catch (err) {
    console.error("Error fetching Animo Run registrations:", err);
  } finally {
    isFetching.value = false;
    isAutoRefreshing.value = false;
  }
};

const startPolling = () => {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(() => {
    fetchRegistrations(true);
  }, POLL_INTERVAL_MS);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const formatLastUpdated = computed(() => {
  if (!lastUpdated.value) return null;
  return lastUpdated.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
});

onMounted(() => {
  let hasCache = false;
  // Restore registrations from cache immediately for 0ms initial paint
  if (process.client && registrations.value.length === 0) {
    try {
      const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          registrations.value = parsed;
          hasCache = true;
        }
      }
    } catch (e) {
      console.warn("[AnimoRunList] Failed to read cached registrations:", e);
    }
  } else if (registrations.value.length > 0) {
    hasCache = true;
  }

  // Restore batches from cache immediately
  if (process.client && batchesList.value.length === 0) {
    try {
      const cachedB = localStorage.getItem(BATCHES_CACHE_KEY) || sessionStorage.getItem(BATCHES_CACHE_KEY);
      if (cachedB) {
        const parsedB = JSON.parse(cachedB);
        if (Array.isArray(parsedB) && parsedB.length > 0) {
          batchesList.value = parsedB;
        }
      }
    } catch {}
  }

  // Fetch data in parallel. If we already have cache, fetch silently in background (stale-while-revalidate),
  // otherwise fetch with skeleton loaders.
  fetchRegistrations(hasCache);
  fetchBatches();
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});

const getImageUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") return getCleanUrl(val);
  if (typeof val === "object" && val.url) return getCleanUrl(val.url);
  if (Array.isArray(val) && val.length > 0) {
    if (typeof val[0] === "string") return getCleanUrl(val[0]);
    return getCleanUrl(val[0]?.url) || null;
  }
  return null;
};

const getDocumentUrl = (val) => {
  return getImageUrl(val);
};

const getDocumentList = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map((item, idx) => {
        if (!item) return null;
        if (typeof item === "string") return { name: `Document ${idx + 1}`, url: item };
        if (typeof item === "object" && item.url) return { name: item.name || `Document ${idx + 1}`, url: item.url };
        return null;
      })
      .filter(Boolean);
  }
  if (typeof val === "string") return [{ name: "Document 1", url: val }];
  if (typeof val === "object" && val.url) return [{ name: val.name || "Document 1", url: val.url }];
  return [];
};

const isPdfUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return url.toLowerCase().includes(".pdf") || url.toLowerCase().startsWith("data:application/pdf");
};

// ── Auth & Current Operator ─────────────────────────────────────────────
const { user } = useAuth();
const currentOperator = computed(() => user.value?.email || user.value?.name || "jorenlee.luna@lsu.edu.ph");

// ── Sorting state ──────────────────────────────────────────────────────────
const sortBy = ref("date_desc");
// Options: "date_desc", "date_asc", "name_asc", "name_desc", "bib_asc", "batch_asc"

const toggleSort = (field) => {
  if (field === "name") {
    sortBy.value = sortBy.value === "name_asc" ? "name_desc" : "name_asc";
  } else if (field === "date") {
    sortBy.value = sortBy.value === "date_desc" ? "date_asc" : "date_desc";
  } else if (field === "bib") {
    sortBy.value = sortBy.value === "bib_asc" ? "date_desc" : "bib_asc";
  } else if (field === "batch") {
    sortBy.value = sortBy.value === "batch_asc" ? "date_desc" : "batch_asc";
  } else if (field === "shirt") {
    sortBy.value = sortBy.value === "shirt_asc" ? "date_desc" : "shirt_asc";
  }
};

// ── Date Range Period state ────────────────────────────────────────────────
const dateFrom = ref("");
const dateTo = ref("");

const setDateRangePreset = (preset) => {
  const today = new Date();
  const format = (d) => d.toISOString().split("T")[0];

  if (preset === "all") {
    dateFrom.value = "";
    dateTo.value = "";
  } else if (preset === "today") {
    dateFrom.value = format(today);
    dateTo.value = format(today);
  } else if (preset === "7days") {
    const d = new Date();
    d.setDate(today.getDate() - 7);
    dateFrom.value = format(d);
    dateTo.value = format(today);
  } else if (preset === "30days") {
    const d = new Date();
    d.setDate(today.getDate() - 30);
    dateFrom.value = format(d);
    dateTo.value = format(today);
  }
};

const clearDateRange = () => {
  dateFrom.value = "";
  dateTo.value = "";
};

// ── Batch & Lock Filter state ──────────────────────────────────────────────
const selectedBatch = ref("All");
const selectedLockStatus = ref("All"); // "All", "Locked", "Unlocked"

const availableBatches = computed(() => {
  const set = new Set();
  registrations.value.forEach((r) => {
    if (r.batch_name) set.add(r.batch_name);
  });
  return Array.from(set).sort();
});

// NOTE: allSelected / someSelected depend on filteredRegistrations so it must be
// declared before those computed refs — but since Vue 3 computed refs are lazy
// and the actual .value access is deferred, hoisting the refs is safe here.
const filteredRegistrations = computed(() => {
  let list = registrations.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim();
    const fullName = `${item.firstname || ""} ${item.middlename || ""} ${item.lastname || ""}`.toLowerCase();
    const bib = (item.run_number || item.bib_number || "").toLowerCase();
    const email = (item.contact_email || item.email || "").toLowerCase();
    const phone = item.contact_number || item.phone || "";
    const regId = String(item.id || "").toLowerCase();
    const batch = (item.batch_name || "").toLowerCase();

    const courseText = `${item.college_course || ""} ${item.beu_grade || ""} ${item.college_year || ""}`.toLowerCase();

    const matchesQuery =
      !q ||
      fullName.includes(q) ||
      regId.includes(q) ||
      bib.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      batch.includes(q) ||
      courseText.includes(q);

    const category = item.run_category || "";
    const matchesCategory =
      selectedCategory.value === "All" ||
      normalizeCategory(item.run_category) === selectedCategory.value ||
      category.startsWith(selectedCategory.value);
    const matchesStatus =
      selectedStatus.value === "All" ||
      (selectedStatus.value === "Pending" ? (item.payment_status || "").startsWith("Pending") : item.payment_status === selectedStatus.value);
    const matchesType = selectedParticipantType.value === "All" || item.participant_type === selectedParticipantType.value;

    // Academic Unit Filter (HEU: All Bachelor Degrees, BEU: Grade School, JHS, SHS)
    let matchesAcademicUnit = true;
    if (selectedAcademicUnit.value === "HEU") {
      matchesAcademicUnit = isHEU(item);
    } else if (selectedAcademicUnit.value === "BEU") {
      matchesAcademicUnit = isBEU(item);
    } else if (selectedAcademicUnit.value === "Grade School") {
      matchesAcademicUnit = isBEULevel(item, "Grade School");
    } else if (selectedAcademicUnit.value === "JHS") {
      matchesAcademicUnit = isBEULevel(item, "JHS");
    } else if (selectedAcademicUnit.value === "SHS") {
      matchesAcademicUnit = isBEULevel(item, "SHS");
    } else if (selectedAcademicUnit.value !== "All") {
      matchesAcademicUnit = matchesSpecificCourse(item, selectedAcademicUnit.value);
    }

    // Age group filter
    let matchesAge = true;
    if (selectedAgeGroup.value !== "All") {
      const ag = getAgeGroup(item.birthdate);
      matchesAge = ag === selectedAgeGroup.value;
    }

    // Batch filter
    let matchesBatch = true;
    if (selectedBatch.value === "Unbatched") {
      matchesBatch = !item.batch_name;
    } else if (selectedBatch.value !== "All") {
      matchesBatch = item.batch_name === selectedBatch.value;
    }

    // Lock status filter
    let matchesLock = true;
    if (selectedLockStatus.value === "Locked") {
      matchesLock = !!item.batch_locked;
    } else if (selectedLockStatus.value === "Unlocked") {
      matchesLock = !item.batch_locked;
    }

    // Date range filter
    let matchesDate = true;
    if (dateFrom.value || dateTo.value) {
      if (!item.created_at) {
        matchesDate = false;
      } else {
        const itemDate = new Date(item.created_at).toISOString().split("T")[0];
        if (dateFrom.value && itemDate < dateFrom.value) matchesDate = false;
        if (dateTo.value && itemDate > dateTo.value) matchesDate = false;
      }
    }

    // Chat / Message inquiries filter
    let matchesChat = true;
    if (selectedChatFilter.value === "new") {
      matchesChat = getRunnerMessageStats(item).hasNew;
    } else if (selectedChatFilter.value === "has_messages") {
      matchesChat = getRunnerMessageStats(item).total > 0;
    } else if (selectedChatFilter.value === "no_messages") {
      matchesChat = getRunnerMessageStats(item).total === 0;
    }

    return matchesQuery && matchesCategory && matchesStatus && matchesType && matchesAcademicUnit && matchesAge && matchesBatch && matchesLock && matchesDate && matchesChat;
  });

  // Sorting
  return list.sort((a, b) => {
    if (sortBy.value === "date_desc") {
      return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
    }
    if (sortBy.value === "date_asc") {
      return (new Date(a.created_at || 0)) - (new Date(b.created_at || 0));
    }
    if (sortBy.value === "name_asc") {
      const nameA = `${a.lastname || ""} ${a.firstname || ""}`.toLowerCase();
      const nameB = `${b.lastname || ""} ${b.firstname || ""}`.toLowerCase();
      return nameA.localeCompare(nameB);
    }
    if (sortBy.value === "name_desc") {
      const nameA = `${a.lastname || ""} ${a.firstname || ""}`.toLowerCase();
      const nameB = `${b.lastname || ""} ${b.firstname || ""}`.toLowerCase();
      return nameB.localeCompare(nameA);
    }
    if (sortBy.value === "bib_asc") {
      return String(a.run_number || a.id).localeCompare(String(b.run_number || b.id), undefined, { numeric: true });
    }
    if (sortBy.value === "batch_asc") {
      return (a.batch_name || "ZZZ").localeCompare(b.batch_name || "ZZZ");
    }
    if (sortBy.value === "shirt_asc") {
      const sizeOrder = ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
      const szA = (a.tshirt_size || 'M').trim().toUpperCase().split(';')[0].split(':').pop().trim();
      const szB = (b.tshirt_size || 'M').trim().toUpperCase().split(';')[0].split(':').pop().trim();
      const idxA = sizeOrder.indexOf(szA);
      const idxB = sizeOrder.indexOf(szB);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    }
    return 0;
  });
});

const stats = computed(() => {
  const totalRunners = registrations.value.length;
  const confirmed = registrations.value.filter((r) => r.payment_status === "Confirmed").length;
  const pending = registrations.value.filter((r) => r.payment_status && r.payment_status.startsWith("Pending")).length;
  const lockedCount = registrations.value.filter((r) => r.batch_locked).length;

  return { totalRunners, confirmed, pending, lockedCount };
});

const openDetails = (runner) => {
  selectedRunner.value = runner;
  isDetailModalOpen.value = true;
  isEditMode.value = false;
  editForm.value = {};
  bypassWarningAcknowledged.value = false;
  chatInput.value = "";
  loadChat(runner);
  markRunnerMessagesAsRead(runner);
  scrollChatToBottom();
};

const closeDetails = () => {
  isDetailModalOpen.value = false;
  selectedRunner.value = null;
  isEditMode.value = false;
  editForm.value = {};
  bypassWarningAcknowledged.value = false;
};

const promptConfirmPayment = (runner) => {
  if (!runner || isConfirming.value) return;
  confirmModal.value = {
    show: true,
    runner,
  };
};

const closeConfirmModal = () => {
  confirmModal.value = {
    show: false,
    runner: null,
  };
};

const executeConfirmPayment = async () => {
  const runner = confirmModal.value.runner;
  if (!runner || isConfirming.value) return;

  isConfirming.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/confirm/`, {
      method: "POST",
      body: {
        confirmed_by: currentOperator.value,
      },
    });

    runner.payment_status = "Confirmed";
    if (selectedRunner.value && selectedRunner.value.id === runner.id) {
      selectedRunner.value.payment_status = "Confirmed";
    }
    closeConfirmModal();
    showNotice(
      `Registration and payment confirmed successfully for ${runner.firstname} ${runner.lastname}.\n\nAn official confirmation email has been sent to ${runner.contact_email || runner.email} (BCC: animorun@lsu.edu.ph, calendar@lsu.edu.ph, vpal@lsu.edu.ph).`,
      "Payment Confirmed!",
      "success"
    );
  } catch (err) {
    console.error("Error confirming payment:", err);
    closeConfirmModal();
    showNotice(
      "Failed to confirm payment on the server. Please verify your local Django server is running on http://127.0.0.1:8000.",
      "Confirmation Failed",
      "error"
    );
  } finally {
    isConfirming.value = false;
  }
};

const isAdminUploadingReceipt = ref(false);

const uploadAdminReceipt = async (file, runner) => {
  if (!file || !runner) return;
  isAdminUploadingReceipt.value = true;
  try {
    const formData = new FormData();
    formData.append("file", file);
    const res = await $fetch(`${endpoint.value}/api/animorun/upload/`, {
      method: "POST",
      body: formData,
    });
    const receiptUrl = res.url;

    // Update proof_of_payment for runner
    const editRes = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
      method: "PUT",
      body: {
        proof_of_payment: receiptUrl,
        bypass_lock: true,
      },
    });

    const updatedUrl = editRes.data?.proof_of_payment || receiptUrl;
    runner.proof_of_payment = updatedUrl;
    if (selectedRunner.value && selectedRunner.value.id === runner.id) {
      selectedRunner.value.proof_of_payment = updatedUrl;
    }
    const idx = registrations.value.findIndex((r) => r.id === runner.id);
    if (idx !== -1) registrations.value[idx].proof_of_payment = updatedUrl;

    showNotice(
      `Payment receipt uploaded and recorded successfully for ${runner.firstname} ${runner.lastname}.`,
      "Receipt Recorded!",
      "success"
    );
  } catch (err) {
    console.error("Admin receipt upload error:", err);
    showNotice(
      "Failed to upload and record receipt file. Please try again.",
      "Upload Failed",
      "error"
    );
  } finally {
    isAdminUploadingReceipt.value = false;
  }
};

const handleAdminReceiptChange = (event, runner) => {
  const file = event.target.files[0];
  if (file) {
    uploadAdminReceipt(file, runner);
  }
};

// ── Delete Receipt ──────────────────────────────────────────────────────────
const isDeletingReceipt = ref(false);
const deleteReceiptModal = ref({ show: false, runner: null });

const promptDeleteReceipt = (runner) => {
  if (!runner || isDeletingReceipt.value) return;
  deleteReceiptModal.value = { show: true, runner };
};

const closeDeleteReceiptModal = () => {
  deleteReceiptModal.value = { show: false, runner: null };
};

const executeDeleteReceipt = async () => {
  const runner = deleteReceiptModal.value.runner;
  if (!runner || isDeletingReceipt.value) return;
  isDeletingReceipt.value = true;
  try {
    await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
      method: "PUT",
      body: { proof_of_payment: "", bypass_lock: true },
    });
    runner.proof_of_payment = "";
    if (selectedRunner.value && selectedRunner.value.id === runner.id) {
      selectedRunner.value.proof_of_payment = "";
    }
    const idx = registrations.value.findIndex((r) => r.id === runner.id);
    if (idx !== -1) registrations.value[idx].proof_of_payment = "";
    closeDeleteReceiptModal();
    showNotice(
      `Payment receipt deleted for ${runner.firstname} ${runner.lastname}.`,
      "Receipt Deleted",
      "success"
    );
  } catch (err) {
    console.error("Delete receipt error:", err);
    closeDeleteReceiptModal();
    showNotice(
      "Failed to delete receipt. Please try again.",
      "Deletion Failed",
      "error"
    );
  } finally {
    isDeletingReceipt.value = false;
  }
};

// Shared input class for edit mode fields
const inputCls = computed(() =>
  `w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none transition ${props.darkMode
    ? 'bg-gray-900 border-gray-600 text-gray-100'
    : 'bg-white border-gray-300 text-gray-800'
  }`
);

const getStatusBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
    case "Pending Approval":
    case "Pending Payment":
      return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300";
  }
};

// ── Inline Edit ──────────────────────────────────────────────────────────────────
const isEditMode = ref(false);
const isSaving = ref(false);
const editForm = ref({});
const bypassWarningAcknowledged = ref(false);

const openEdit = () => {
  if (!selectedRunner.value) return;

  // If runner is locked under a batch, check bypass
  if (selectedRunner.value.batch_locked && !bypassWarningAcknowledged.value) {
    openUnlockPrompt(selectedRunner.value, "runner");
    return;
  }

  // Deep-clone the relevant editable fields into editForm
  editForm.value = {
    firstname: selectedRunner.value.firstname || "",
    middlename: selectedRunner.value.middlename || "",
    lastname: selectedRunner.value.lastname || "",
    suffix: selectedRunner.value.suffix || "",
    birthdate: selectedRunner.value.birthdate || "",
    gender: selectedRunner.value.gender || "",
    contact_number: selectedRunner.value.contact_number || selectedRunner.value.phone || "",
    contact_email: selectedRunner.value.contact_email || selectedRunner.value.email || "",
    contact_address: selectedRunner.value.contact_address || selectedRunner.value.address || "",
    participant_type: selectedRunner.value.participant_type || "",
    lsu_id_number: selectedRunner.value.lsu_id_number || "",
    tshirt_size: selectedRunner.value.tshirt_size || "",
    run_category: selectedRunner.value.run_category || "",
    run_number: selectedRunner.value.run_number || selectedRunner.value.bib_number || "",
    payment_status: selectedRunner.value.payment_status || "",
    college_course: selectedRunner.value.college_course || "",
    college_year: selectedRunner.value.college_year || "",
    partner_office: selectedRunner.value.partner_office || "",
    alumni_batch: selectedRunner.value.alumni_batch || "",
    organization: selectedRunner.value.organization || "",
    pet_name: selectedRunner.value.pet_name || "",
    pet_type: selectedRunner.value.pet_type || "",
    pet_bandana_size: selectedRunner.value.pet_bandana_size || "",
  };
  isEditMode.value = true;
};

const cancelEdit = () => {
  isEditMode.value = false;
  editForm.value = {};
};

const saveEdit = async () => {
  if (!selectedRunner.value || isSaving.value) return;
  isSaving.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${selectedRunner.value.id}/edit/`, {
      method: "PUT",
      body: {
        ...editForm.value,
        bypass_lock: true,
      },
    });
    // Merge changes back into both the list and the detail view
    const updated = res.data || editForm.value;
    Object.assign(selectedRunner.value, updated);
    const idx = registrations.value.findIndex((r) => r.id === selectedRunner.value.id);
    if (idx !== -1) Object.assign(registrations.value[idx], updated);
    isEditMode.value = false;
    editForm.value = {};
    showNotice(
      `Registration info for ${selectedRunner.value.firstname} ${selectedRunner.value.lastname} has been updated successfully.`,
      "Changes Saved",
      "success"
    );
  } catch (err) {
    console.error("Save edit error:", err);
    showNotice(
      err?.data?.error || "Failed to save changes. Please check your connection and try again.",
      "Save Failed",
      "error"
    );
  } finally {
    isSaving.value = false;
  }
};

// ── CSV Export Utilities ─────────────────────────────────────────────────────────
const downloadCsvFile = (csvContent, filename) => {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ── CSV Column Picker for Supplier Fulfillment ──────────────────────────────────
const CSV_ALL_COLUMNS = [
  { key: 'batch', label: 'Batch Group' },
  { key: 'lock_status', label: 'Lock Status' },
  { key: 'reg_id', label: 'Reg ID' },
  { key: 'race_bib', label: 'Race BIB Number' },
  { key: 'category', label: 'Category' },
  { key: 'full_name', label: 'Full Name' },
  { key: 'firstname', label: 'First Name' },
  { key: 'middlename', label: 'Middle Name' },
  { key: 'lastname', label: 'Last Name' },
  { key: 'suffix', label: 'Suffix' },
  { key: 'gender', label: 'Gender' },
  { key: 'age', label: 'Age' },
  { key: 'birthdate', label: 'Birthdate' },
  { key: 'contact_number', label: 'Contact Number' },
  { key: 'email', label: 'Email Address' },
  { key: 'address', label: 'Address' },
  { key: 'classification', label: 'Classification' },
  { key: 'college_course', label: 'Course / Program' },
  { key: 'college_year', label: 'Year / Grade Level' },
  { key: 'lsu_id', label: 'LSU ID Number' },
  { key: 'organization', label: 'Club / Organization' },
  { key: 'affiliation', label: 'Batch / Affiliation' },
  { key: 'tshirt_size', label: 'T-Shirt Size' },
  { key: 'pet_name', label: 'Pet Name' },
  { key: 'pet_type', label: 'Pet Type' },
  { key: 'pet_bandana', label: 'Pet Bandana' },
  { key: 'pet_vaccinated', label: 'Pet Vaccinated' },
  { key: 'payment_option', label: 'Payment Option' },
  { key: 'payment_status', label: 'Payment Status' },
  { key: 'total_amount', label: 'Total Amount (PHP)' },
  { key: 'reg_date', label: 'Registration Date' },
  { key: 'confirmed_date', label: 'Confirmed Date' },
  { key: 'confirmed_by', label: 'Confirmed By' },
  { key: 'locked_by', label: 'Batch Locked By' },
  { key: 'locked_at', label: 'Batch Locked At' },
  { key: 'messages_count', label: 'Messages Count' },
];

const DEFAULT_COLUMNS = [
  'race_bib', 'full_name', 'batch', 'category', 'tshirt_size', 'classification', 'reg_date', 'payment_status'
];

// Default checked columns - controls both CSV export and live table column display
const selectedCsvColumns = ref([...DEFAULT_COLUMNS]);

const isColumnPickerModalOpen = ref(false);

const activeTableColumns = computed(() => {
  const selected = selectedCsvColumns.value || [];
  return CSV_ALL_COLUMNS.filter(c => selected.includes(c.key));
});

const resetToDefaultColumns = () => {
  selectedCsvColumns.value = [...DEFAULT_COLUMNS];
};

const toggleAllCsvColumns = (checked) => {
  selectedCsvColumns.value = checked ? CSV_ALL_COLUMNS.map(c => c.key) : [];
};

const allCsvColumnsSelected = computed(() =>
  selectedCsvColumns.value.length === CSV_ALL_COLUMNS.length
);

const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

const generateCsvFromList = (list, batchLabel = "Export") => {
  const activeCols = CSV_ALL_COLUMNS.filter(c => selectedCsvColumns.value.includes(c.key));
  const headers = activeCols.map(c => `"${c.label}"`);

  const rows = list.map((r) => {
    const fullName = `${r.firstname || ""} ${r.middlename || ""} ${r.lastname || ""}${r.suffix ? " " + r.suffix : ""}`.trim();
    const batchStr = r.batch_name || batchLabel;
    const lockStr = r.batch_locked ? "LOCKED" : "OPEN";
    const age = computeAge(r.birthdate);

    const colMap = {
      batch: escapeCsv(batchStr),
      lock_status: escapeCsv(lockStr),
      reg_id: escapeCsv(r.id),
      race_bib: escapeCsv(r.run_number || r.bib_number || `AR-${r.id}`),
      category: escapeCsv(r.run_category || ""),
      full_name: escapeCsv(fullName),
      firstname: escapeCsv(r.firstname || ""),
      middlename: escapeCsv(r.middlename || ""),
      lastname: escapeCsv(r.lastname || ""),
      suffix: escapeCsv(r.suffix || ""),
      gender: escapeCsv(r.gender || ""),
      age: escapeCsv(age !== null ? age : ""),
      birthdate: escapeCsv(r.birthdate || ""),
      contact_number: escapeCsv(r.contact_number || r.phone || ""),
      email: escapeCsv(r.contact_email || r.email || ""),
      address: escapeCsv(r.contact_address || r.address || ""),
      classification: escapeCsv(r.participant_type || ""),
      college_course: escapeCsv(getCourseLabel(r.college_course) || r.college_course || ""),
      college_year: escapeCsv(r.college_year || r.beu_grade || ""),
      lsu_id: escapeCsv(r.lsu_id_number || ""),
      organization: escapeCsv(r.organization || ""),
      affiliation: escapeCsv(r.alumni_batch || ""),
      tshirt_size: escapeCsv(r.tshirt_size || "M"),
      pet_name: escapeCsv(r.pet_name || ""),
      pet_type: escapeCsv(r.pet_type || ""),
      pet_bandana: escapeCsv((r.run_category || "").toUpperCase().startsWith("1K") || r.pet_name || r.pet_bandana_size || r.pet_bandana ? "Standard" : ""),
      pet_vaccinated: escapeCsv(r.pet_vaccinated ? "Yes" : "No"),
      payment_option: escapeCsv(r.payment_type || ""),
      payment_status: escapeCsv(r.payment_status || ""),
      total_amount: escapeCsv(r.grand_total_payment || r.grand_total || 0),
      reg_date: escapeCsv(r.created_at_formatted || r.created_at || ""),
      confirmed_date: escapeCsv(r.confirmed_at || ""),
      confirmed_by: escapeCsv(r.confirmed_by || ""),
      locked_by: escapeCsv(r.batch_locked_by || ""),
      locked_at: escapeCsv(r.batch_locked_at || ""),
      messages_count: escapeCsv(Array.isArray(r.communication_logs) ? r.communication_logs.length : 0),
    };

    return activeCols.map(c => colMap[c.key] || '""').join(",");
  });

  return [headers.join(","), ...rows].join("\r\n");
};

const downloadBatchCsvPreview = () => {
  const runners = eligibleBatchRunners.value;
  if (!runners.length) {
    showNotice("No eligible runners found for this batch selection.", "Cannot Export CSV", "error");
    return;
  }
  if (!selectedCsvColumns.value.length) {
    showNotice("Please select at least one column to export.", "No Columns Selected", "error");
    return;
  }
  const batchName = batchFinalizeModal.value.batchName || "Supplier_Batch";
  const customCsv = generateCsvFromList(runners, batchName);
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `${batchName.replace(/\s+/g, "_")}_Supplier_Orders_${dateStr}.csv`;
  downloadCsvFile(customCsv, filename);
  showNotice(
    `Successfully exported ${runners.length} supplier batch order(s) to CSV spreadsheet (${selectedCsvColumns.value.length} column(s)).\n\nFile downloaded: ${filename}`,
    "Supplier CSV Exported",
    "success"
  );
};

// ── Batch Finalization & Lock Modal ──────────────────────────────────────────────
let initialBatches = [];
if (process.client) {
  try {
    const cachedB = localStorage.getItem(BATCHES_CACHE_KEY) || sessionStorage.getItem(BATCHES_CACHE_KEY);
    if (cachedB) initialBatches = JSON.parse(cachedB);
  } catch {}
}
const batchesList = ref(initialBatches);
const isFetchingBatches = ref(false);
const isFinalizingBatch = ref(false);

const persistBatchesCache = (data) => {
  if (process.client && Array.isArray(data)) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(BATCHES_CACHE_KEY, serialized);
      sessionStorage.setItem(BATCHES_CACHE_KEY, serialized);
    } catch {}
  }
};

const batchFinalizeModal = ref({
  show: false,
  batchName: "",
  lockedBy: "",
  scope: "unbatched", // "unbatched", "filtered", "selected"
});

const fetchBatches = async () => {
  if (batchesList.value.length === 0) {
    isFetchingBatches.value = true;
  }
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/batch/list/`);
    if (Array.isArray(res)) {
      batchesList.value = res;
      persistBatchesCache(res);
    }
  } catch (err) {
    console.error("Error fetching batches:", err);
  } finally {
    isFetchingBatches.value = false;
  }
};

const openBatchFinalizeModal = () => {
  const existingNumbers = batchesList.value.map((b) => b.batch_number).filter(Boolean);
  const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : (batchesList.value.length + 1);
  batchFinalizeModal.value = {
    show: true,
    batchName: `Batch ${nextNum}`,
    lockedBy: currentOperator.value,
    scope: selectedIds.value.length > 0 ? "selected" : "unbatched",
  };
};

const closeBatchFinalizeModal = () => {
  batchFinalizeModal.value.show = false;
};

const eligibleBatchRunners = computed(() => {
  if (batchFinalizeModal.value.scope === "selected" && selectedIds.value.length > 0) {
    return registrations.value.filter((r) => selectedIds.value.includes(r.id));
  }
  if (batchFinalizeModal.value.scope === "filtered") {
    return filteredRegistrations.value.filter((r) => r.payment_status === "Confirmed");
  }
  // Default "unbatched": Confirmed and no batch assigned
  return registrations.value.filter((r) => r.payment_status === "Confirmed" && !r.batch_name);
});

const batchBreakdown = computed(() => {
  const runners = eligibleBatchRunners.value;
  const categories = {};
  const tshirts = {};
  const bandanas = {};
  let totalAmount = 0;

  runners.forEach((r) => {
    const cat = r.run_category || "Unassigned";
    categories[cat] = (categories[cat] || 0) + 1;

    const sz = (r.tshirt_size || "M").trim().toUpperCase();
    tshirts[sz] = (tshirts[sz] || 0) + 1;

    const is1KM = (r.run_category || "").toUpperCase().startsWith("1K") || Boolean(r.pet_name);
    if (is1KM || r.pet_bandana_size || r.pet_bandana) {
      bandanas["Standard"] = (bandanas["Standard"] || 0) + 1;
    }

    totalAmount += Number(r.grand_total_payment || r.grand_total || 0);
  });

  return {
    count: runners.length,
    totalAmount,
    categories,
    tshirts,
    bandanas,
  };
});

const executeFinalizeBatch = async () => {
  const runners = eligibleBatchRunners.value;
  if (!runners.length) {
    showNotice("No eligible runners found for this batch selection.", "Cannot Finalize", "error");
    return;
  }

  if (!selectedCsvColumns.value.length) {
    showNotice("Please select at least one column for the supplier CSV export.", "No Columns Selected", "error");
    return;
  }

  isFinalizingBatch.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/batch/create/`, {
      method: "POST",
      body: {
        batch_name: batchFinalizeModal.value.batchName,
        runner_ids: runners.map((r) => r.id),
        date_from: dateFrom.value || null,
        date_to: dateTo.value || null,
        locked_by: batchFinalizeModal.value.lockedBy || currentOperator.value,
        csv_columns: selectedCsvColumns.value,
      },
    });

    // Auto-download the supplier CSV spreadsheet using selected custom columns
    const filename = `${(res.batch?.batch_name || batchFinalizeModal.value.batchName || "Batch").replace(/\s+/g, "_")}_Supplier_Orders_${new Date().toISOString().split("T")[0]}.csv`;
    if (res.csv_content) {
      downloadCsvFile(res.csv_content, filename);
    } else if (selectedCsvColumns.value && selectedCsvColumns.value.length > 0) {
      const customCsv = generateCsvFromList(runners, res.batch?.batch_name || batchFinalizeModal.value.batchName);
      downloadCsvFile(customCsv, filename);
    }

    // Refresh registrations and batch history
    await Promise.all([fetchRegistrations(), fetchBatches()]);
    clearSelection();
    closeBatchFinalizeModal();

    showNotice(
      `🎉 ${res.batch?.batch_name || "Supplier Batch"} finalized with ${res.batch?.total_runners || runners.length} orders!\n\n` +
      `📥 Supplier CSV has been automatically downloaded (${selectedCsvColumns.value.length} columns).\n\n` +
      `📧 Breakdown and CSV have been emailed to:\n` +
      `• jorenlee.luna@lsu.edu.ph\n• calendar@lsu.edu.ph\n• vpal@lsu.edu.ph\n• animorun@lsu.edu.ph\n\n` +
      `🔒 Orders are now LOCKED for supplier production (Strictly no return / no upgrade / no downgrade). Superadmin bypass is required to modify.`,
      "Batch Finalized & Locked!",
      "success"
    );
  } catch (err) {
    console.error("Finalize batch error:", err);
    showNotice(
      err?.data?.error || "Failed to finalize supplier batch. Please try again.",
      "Finalization Failed",
      "error"
    );
  } finally {
    isFinalizingBatch.value = false;
  }
};

// ── Superadmin Bypass Unlock / Lock Toggle ───────────────────────────────────────
const unlockPromptModal = ref({
  show: false,
  type: "runner", // "runner" or "batch"
  target: null,
  intent: "toggle", // "toggle" or "edit"
});

const isTogglingLock = ref(false);

const openUnlockPrompt = (target, type = "runner", intent = "toggle") => {
  unlockPromptModal.value = {
    show: true,
    type,
    target,
    intent,
  };
};

const closeUnlockPrompt = () => {
  unlockPromptModal.value.show = false;
  unlockPromptModal.value.target = null;
};

const executeToggleLock = async () => {
  const { type, target, intent } = unlockPromptModal.value;
  if (!target) return;

  isTogglingLock.value = true;
  try {
    if (type === "runner") {
      const res = await $fetch(`${endpoint.value}/api/animorun/${target.id}/toggle-lock/`, {
        method: "POST",
        body: {
          by: currentOperator.value,
        },
      });
      const updated = res.data;
      target.batch_locked = updated.batch_locked;
      target.batch_locked_by = updated.batch_locked_by;
      target.batch_locked_at = updated.batch_locked_at;
      if (selectedRunner.value && selectedRunner.value.id === target.id) {
        Object.assign(selectedRunner.value, updated);
      }
      bypassWarningAcknowledged.value = !updated.batch_locked;

      closeUnlockPrompt();

      if (intent === "edit" && !updated.batch_locked) {
        openEdit();
      }

      showNotice(
        `Runner #${target.id} (${target.firstname} ${target.lastname}) has been ${updated.batch_locked ? "locked 🔒" : "unlocked 🔓 for edits"}.\nOperator: ${currentOperator.value}`,
        updated.batch_locked ? "Order Locked" : "Order Unlocked (Bypass)",
        "success"
      );
    } else if (type === "batch") {
      const res = await $fetch(`${endpoint.value}/api/animorun/batch/${target.id}/toggle-lock/`, {
        method: "POST",
        body: {
          unlocked_by: currentOperator.value,
        },
      });
      await Promise.all([fetchRegistrations(), fetchBatches()]);
      closeUnlockPrompt();
      showNotice(
        `${target.batch_name} has been ${res.batch?.is_locked ? "locked 🔒" : "unlocked 🔓"}.\nOperator: ${currentOperator.value}`,
        "Batch Lock Updated",
        "success"
      );
    }
  } catch (err) {
    console.error("Toggle lock error:", err);
    closeUnlockPrompt();
    showNotice(
      err?.data?.error || "Failed to update lock state.",
      "Lock Update Failed",
      "error"
    );
  } finally {
    isTogglingLock.value = false;
  }
};

// ── Batch History Modal ──────────────────────────────────────────────────────────
const batchHistoryModal = ref({
  show: false,
  selectedBatch: null,
});

const openBatchHistoryModal = async () => {
  batchHistoryModal.value.show = true;
  await fetchBatches();
};

const closeBatchHistoryModal = () => {
  batchHistoryModal.value.show = false;
  batchHistoryModal.value.selectedBatch = null;
};

const downloadBatchCsv = (batch) => {
  const runners = registrations.value.filter((r) => r.batch_name === batch.batch_name);
  const csv = generateCsvFromList(runners.length ? runners : registrations.value, batch.batch_name);
  const filename = `${batch.batch_name.replace(/\s+/g, "_")}_EmeraldRun_Orders.csv`;
  downloadCsvFile(csv, filename);
  showNotice(`Downloaded CSV for ${batch.batch_name} (${runners.length} runners).`, "CSV Downloaded", "success");
};


// ── Communication Chat (Admin Side) ─────────────────────────────────────────────
const chatMessages = ref([]);
const chatInput = ref("");
const chatAttachment = ref(null);  // { file, previewUrl, name }
const isSendingChat = ref(false);
const isChatLoading = ref(false);
const chatMessagesContainer = ref(null);
const quickChatMessagesContainer = ref(null);

const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatMessagesContainer.value) {
      chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight;
    }
    if (quickChatMessagesContainer.value) {
      quickChatMessagesContainer.value.scrollTop = quickChatMessagesContainer.value.scrollHeight;
    }
    setTimeout(() => {
      if (chatMessagesContainer.value) {
        chatMessagesContainer.value.scrollTop = chatMessagesContainer.value.scrollHeight;
      }
      if (quickChatMessagesContainer.value) {
        quickChatMessagesContainer.value.scrollTop = quickChatMessagesContainer.value.scrollHeight;
      }
    }, 120);
  });
};

watch(chatMessages, () => {
  scrollChatToBottom();
}, { deep: true });
// Tracks whether the last message also triggered an email notification to the runner
const chatEmailSent = ref(false);

const CHAT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const CHAT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const handleChatAttachmentChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!CHAT_ACCEPTED_TYPES.includes(file.type)) {
    showNotice('Only JPG, JPEG, PNG, or PDF files are allowed.', 'Invalid File Type', 'error');
    event.target.value = '';
    return;
  }
  if (file.size > CHAT_MAX_SIZE) {
    showNotice(`File exceeds the 5 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB).`, 'File Too Large', 'error');
    event.target.value = '';
    return;
  }
  const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
  chatAttachment.value = { file, previewUrl, name: file.name };
  event.target.value = '';
};

const removeChatAttachment = () => {
  if (chatAttachment.value?.previewUrl) URL.revokeObjectURL(chatAttachment.value.previewUrl);
  chatAttachment.value = null;
};

const isPdfAttachment = (url) => (url || '').toLowerCase().includes('.pdf') || (url || '').endsWith('pdf');


const loadChat = async (runner) => {
  if (!runner) return;
  isChatLoading.value = true;
  chatMessages.value = [];
  chatEmailSent.value = false;
  try {
    // Prefer already-loaded communication_logs from the runner object
    if (Array.isArray(runner.communication_logs)) {
      chatMessages.value = runner.communication_logs;
    } else {
      const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/`);
      chatMessages.value = res?.communication_logs || [];
    }
  } catch (e) {
    console.warn("Could not load chat messages:", e);
  } finally {
    isChatLoading.value = false;
    scrollChatToBottom();
  }
};

const sendAdminMessage = async () => {
  const runner = selectedRunner.value;
  const text = chatInput.value.trim();
  const attachment = chatAttachment.value;
  if (!runner || (!text && !attachment) || isSendingChat.value) return;
  isSendingChat.value = true;
  chatEmailSent.value = false;
  try {
    let attachmentUrl = '';
    let attachmentName = '';
    // Upload attachment first if present
    if (attachment?.file) {
      const formData = new FormData();
      formData.append('file', attachment.file);
      const uploadRes = await $fetch(`${endpoint.value}/api/animorun/upload/`, {
        method: 'POST',
        body: formData,
      });
      attachmentUrl = getCleanUrl(uploadRes.url) || uploadRes.url || '';
      attachmentName = attachment.name || 'Attachment';
    }

    let newLogs;
    let emailNotified = false;
    const operatorEmail = user.value?.email || (currentOperator.value.includes('@') ? currentOperator.value : 'animorun@lsu.edu.ph');
    try {
      // Primary: dedicated /message/ endpoint — server sends email notification automatically
      const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/message/`, {
        method: "POST",
        body: {
          message: text,
          sender_name: currentOperator.value || "Admin",
          sender_email: operatorEmail,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName
        },
      });
      newLogs = res.messages || [...chatMessages.value, res.entry];
      emailNotified = true; // server handles email dispatch
    } catch (msgErr) {
      const st = msgErr?.response?.status || msgErr?.status;
      if (st === 404) {
        // Fallback: build the log entry manually and patch via the existing /edit/ endpoint
        const entry = {
          sender: currentOperator.value || "Admin",
          sender_email: operatorEmail,
          sender_type: "admin",
          message: text,
          ...(attachmentUrl ? { attachment_url: attachmentUrl, attachment_name: attachmentName } : {}),
          message_id: Math.random().toString(36).slice(2, 10),
          timestamp: new Date().toLocaleString("en-PH", { hour12: false }).replace(",", ""),
          is_message_edited: "false",
        };
        newLogs = [...(chatMessages.value || []), entry];
        await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
          method: "PUT",
          body: { communication_logs: newLogs },
        });
      } else {
        throw msgErr;
      }
    }
    chatMessages.value = newLogs;
    runner.communication_logs = chatMessages.value;
    chatInput.value = "";
    removeChatAttachment();
    chatEmailSent.value = emailNotified;
    scrollChatToBottom();
    if (emailNotified) {
      showNotice(
        `Message sent and an email notification was dispatched to ${runner.contact_email || 'the runner'}.`,
        "Message Sent ✔ Email Notified",
        "success"
      );
    }
  } catch (e) {
    console.error("Send admin message error:", e);
    showNotice("Failed to send message. Please try again.", "Send Failed", "error");
  } finally {
    isSendingChat.value = false;
  }
};


// ── Dedicated Quick Chat Modal & Message Query Tracking ──────────────────────
const isChatModalOpen = ref(false);
const chatModalRunner = ref(null);
const selectedChatFilter = ref("All"); // "All", "new", "has_messages", "no_messages"
const chatFilterActive = computed(() => selectedChatFilter.value === "new");

const toggleChatFilter = () => {
  selectedChatFilter.value = selectedChatFilter.value === "new" ? "All" : "new";
};

// Determines message stats for a given runner (total count, new unread queries)
const getRunnerMessageStats = (runner) => {
  if (!runner) return { total: 0, newCount: 0, hasNew: false, unreadQueries: [] };
  const logs = Array.isArray(runner.communication_logs) ? runner.communication_logs : [];
  if (!logs.length) return { total: 0, newCount: 0, hasNew: false, unreadQueries: [] };

  let readIds = [];
  try {
    const stored = localStorage.getItem(`animorun_read_${runner.id}`);
    if (stored) readIds = JSON.parse(stored);
  } catch (e) {}

  const unreadQueries = [];
  logs.forEach((msg, idx) => {
    // Only messages from registrant/runner can be new inquiries
    const isRegistrant = msg.sender_type === 'registrant' || (msg.sender_type !== 'admin' && msg.sender !== 'Admin');
    if (!isRegistrant) return;

    if (msg.read_by_admin === true || msg.is_read === true) return;
    if (msg.message_id && readIds.includes(msg.message_id)) return;
    if (msg.timestamp && readIds.includes(msg.timestamp)) return;

    // If an admin replied later in the conversation, the inquiry has been addressed
    const hasSubsequentAdminReply = logs.slice(idx + 1).some(m => m.sender_type === 'admin' || m.sender === 'Admin');
    if (hasSubsequentAdminReply) return;

    unreadQueries.push(msg);
  });

  return {
    total: logs.length,
    newCount: unreadQueries.length,
    hasNew: unreadQueries.length > 0,
    unreadQueries,
  };
};

const totalNewQueriesCount = computed(() => {
  return registrations.value.reduce((acc, r) => {
    return acc + getRunnerMessageStats(r).newCount;
  }, 0);
});

const totalRunnersWithChatCount = computed(() => {
  return registrations.value.filter((r) => {
    return Array.isArray(r.communication_logs) && r.communication_logs.length > 0;
  }).length;
});

const markRunnerMessagesAsRead = async (runner) => {
  if (!runner || !Array.isArray(runner.communication_logs) || !runner.communication_logs.length) return;
  const logs = runner.communication_logs;
  const readIds = [];
  let updatedAny = false;

  const newLogs = logs.map((m) => {
    if (m.message_id) readIds.push(m.message_id);
    if (m.timestamp) readIds.push(m.timestamp);
    if ((m.sender_type === 'registrant' || m.sender_type !== 'admin') && !m.read_by_admin) {
      updatedAny = true;
      return { ...m, read_by_admin: true, is_read: true };
    }
    return m;
  });

  try {
    localStorage.setItem(`animorun_read_${runner.id}`, JSON.stringify(readIds));
  } catch (e) {}

  if (updatedAny) {
    runner.communication_logs = newLogs;
    try {
      await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
        method: "PUT",
        body: { communication_logs: newLogs, bypass_lock: true },
      });
    } catch (e) {
      console.warn("Could not sync message read status to server:", e);
    }
  }
};

const openChatModal = async (runner) => {
  if (!runner) return;
  chatModalRunner.value = runner;
  selectedRunner.value = runner; // keep synchronized for sendAdminMessage
  isChatModalOpen.value = true;
  chatInput.value = "";
  chatEmailSent.value = false;
  await loadChat(runner);
  await markRunnerMessagesAsRead(runner);
  scrollChatToBottom();
};

const closeChatModal = () => {
  isChatModalOpen.value = false;
  chatModalRunner.value = null;
  removeChatAttachment();
};

const applyChatTemplate = (text) => {
  chatInput.value = text;
};


// ── Quick Filter Helpers for Empty States & UX ─────────────────────────
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== "" ||
    selectedCategory.value !== "All" ||
    selectedStatus.value !== "All" ||
    selectedParticipantType.value !== "All" ||
    selectedAgeGroup.value !== "All" ||
    selectedAcademicUnit.value !== "All" ||
    selectedBatch.value !== "All" ||
    selectedLockStatus.value !== "All" ||
    dateFrom.value !== "" ||
    dateTo.value !== "" ||
    selectedChatFilter.value === "new"
  );
});

const resetAllFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "All";
  selectedStatus.value = "All";
  selectedParticipantType.value = "All";
  selectedAgeGroup.value = "All";
  selectedAcademicUnit.value = "All";
  selectedBatch.value = "All";
  selectedLockStatus.value = "All";
  dateFrom.value = "";
  dateTo.value = "";
  selectedChatFilter.value = "All";
};
</script>

<template>
  <div :class="[
    'min-h-screen p-2 transition-colors duration-300',
    props.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800',
  ]">
    <div class="space-y-1">
      <!-- HEADER BANNER -->
      <div :class="[
        'relative overflow-hidden rounded-2xl lg:px-4 px-2 border shadow-xl transition-all',
        props.darkMode
          ? 'bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-green-800/40'
          : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 border-emerald-600 text-white',
      ]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div class="space-y-1">
            <h1 class="text-sm sm:text-base text-white font-black tracking-tight leading-snug">
              THE EMERALD RUN
              <span class="font-normal text-xs sm:text-sm text-emerald-200 block sm:inline sm:ml-1">
                <i class="fas fa-list text-amber-300"></i> Track, verify & manage runner registrations & supplier
                batches
              </span>
            </h1>
          </div>

          <div class="flex items-center gap-2 sm:gap-2.5 flex-wrap shrink-0 self-end sm:self-auto">

            <!-- Academic Unit Filter (HEU: All Bachelor Degrees, BEU: Grade School, JHS, SHS) -->
            <div class="flex items-center whitespace-nowrap gap-1 sm:gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/15 shadow-inner">
              <!-- HEU (All Bachelor Degrees) Button -->
              <button
                type="button"
                @click="toggleAcademicUnit('HEU')"
                :class="[
                  'px-2 sm:px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer border select-none',
                  isHeuSelected
                    ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-md ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30'
                ]"
                :title="`Click to ${selectedAcademicUnit === 'HEU' ? 'clear filter' : 'filter by Higher Education Unit (HEU - Bachelor Degrees & Graduate Studies)'} (${heuCount} runners)`"
              >
                <i class="fas fa-graduation-cap text-[10px]" :class="isHeuSelected ? 'text-emerald-950' : 'text-amber-300'"></i>
                <span class="tracking-tight text-white/90 lg:text-xs text-[10px]" :class="{ '!text-emerald-950 font-black': isHeuSelected }">
                  HEU -
                </span>
                <span class="font-black text-amber-300 lg:text-xs text-[10px]" :class="{ '!text-emerald-950': isHeuSelected }">
                  <span v-if="isInitialLoading" class="inline-block h-2.5 w-4 rounded bg-white/30 animate-pulse"></span>
                  <span v-else>{{ heuCount }}</span>
                </span>
              </button>

              <!-- BEU (Grade School, JHS, SHS) Button -->
              <button
                type="button"
                @click="toggleAcademicUnit('BEU')"
                :class="[
                  'px-2 sm:px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer border select-none',
                  isBeuSelected
                    ? 'bg-sky-400 text-sky-950 border-sky-300 shadow-md ring-2 ring-sky-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30'
                ]"
                :title="`Click to ${selectedAcademicUnit === 'BEU' ? 'clear filter' : 'filter by Basic Education Unit (BEU - Grade School, JHS, SHS)'} (${beuCount} runners)`"
              >
                <i class="fas fa-school text-[10px]" :class="isBeuSelected ? 'text-sky-950' : 'text-sky-300'"></i>
                <span class="tracking-tight text-white/90 lg:text-xs text-[10px]" :class="{ '!text-sky-950 font-black': isBeuSelected }">
                  BEU -
                </span>
                <span class="font-black text-sky-300 lg:text-xs text-[10px]" :class="{ '!text-sky-950': isBeuSelected }">
                  <span v-if="isInitialLoading" class="inline-block h-2.5 w-4 rounded bg-white/30 animate-pulse"></span>
                  <span v-else>{{ beuCount }}</span>
                </span>
              </button>

              <!-- BEU Sub-level quick toggle pills when BEU is active -->
              <template v-if="isBeuSelected">
                <span class="h-4 w-px bg-white/20 mx-0.5"></span>
                <button
                  type="button"
                  @click.stop="selectedAcademicUnit = selectedAcademicUnit === 'Grade School' ? 'BEU' : 'Grade School'"
                  :class="[
                    'px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer select-none',
                    selectedAcademicUnit === 'Grade School'
                      ? 'bg-white text-sky-950 border-white shadow-xs font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10'
                  ]"
                  :title="`Grade School (${beuGradeSchoolCount} runners)`"
                >
                  GS ({{ beuGradeSchoolCount }})
                </button>
                <button
                  type="button"
                  @click.stop="selectedAcademicUnit = selectedAcademicUnit === 'JHS' ? 'BEU' : 'JHS'"
                  :class="[
                    'px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer select-none',
                    selectedAcademicUnit === 'JHS'
                      ? 'bg-white text-sky-950 border-white shadow-xs font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10'
                  ]"
                  :title="`Junior High School (${beuJhsCount} runners)`"
                >
                  JHS ({{ beuJhsCount }})
                </button>
                <button
                  type="button"
                  @click.stop="selectedAcademicUnit = selectedAcademicUnit === 'SHS' ? 'BEU' : 'SHS'"
                  :class="[
                    'px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer select-none',
                    selectedAcademicUnit === 'SHS'
                      ? 'bg-white text-sky-950 border-white shadow-xs font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10'
                  ]"
                  :title="`Senior High School (${beuShsCount} runners)`"
                >
                  SHS ({{ beuShsCount }})
                </button>
              </template>
            </div>

            <!-- Distance Category Counters (1KM, 3KM, 10KM, 20KM) -->
            <div class="flex items-center whitespace-nowrap gap-1 sm:gap-1.5 bg-black/20 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/15 shadow-inner">
              <button
                v-for="cat in categoryCounters"
                :key="cat.id"
                type="button"
                @click="selectedCategory = selectedCategory === cat.id ? 'All' : cat.id"
                :class="[
                  'px-2 sm:px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer border select-none',
                  selectedCategory === cat.id
                    ? 'bg-white text-emerald-950 border-white shadow-md ring-2 ring-amber-300 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 hover:border-white/30'
                ]"
                :title="`Click to ${selectedCategory === cat.id ? 'clear filter' : 'filter by ' + cat.id} (${categoryCounts[cat.id] || 0} runners)`"
              >
                <span :class="['w-1.5 h-1.5 rounded-full shrink-0', cat.dot]"></span>
                <span class="tracking-tight text-white/90 lg:text-xs text-[10px]" :class="{ '!text-emerald-950': selectedCategory === cat.id }">
                  {{ cat.id }} -
                </span>
                <span class="font-black text-amber-300 lg:text-xs text-[10px]" :class="{ '!text-emerald-900': selectedCategory === cat.id }">
                  <span v-if="isInitialLoading" class="inline-block h-2.5 w-3.5 rounded bg-white/30 animate-pulse"></span>
                  <span v-else>{{ categoryCounts[cat.id] || 0 }}</span>
                </span>
              </button>
            </div>

            <!-- Supplier Batches History button -->
            <button type="button" @click="openBatchHistoryModal"
              class="hidden lg:flex px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition items-center gap-1.5 shadow-sm cursor-pointer">
              <i class="fas fa-boxes"></i> Batches
              <span v-if="batchesList.length"
                class="px-1.5 py-0.2 rounded-full bg-amber-400 text-gray-900 font-black text-[10px]">
                {{ batchesList.length }}
              </span>
            </button>

            <!-- Chat Inquiries Filter button / pill -->
            <button type="button" @click="toggleChatFilter"
              :class="[
                'px-3 py-2 rounded-xl backdrop-blur font-semibold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer border select-none',
                chatFilterActive
                  ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-300 font-bold'
                  : totalNewQueriesCount > 0
                    ? 'bg-rose-500/80 hover:bg-rose-500 text-white border-rose-400/80 shadow-md animate-pulse'
                    : 'bg-white/20 hover:bg-white/30 border-white/30 text-white'
              ]"
              :title="`Click to ${chatFilterActive ? 'clear filter' : 'filter runners with new message queries'} (${totalNewQueriesCount} new queries, ${totalRunnersWithChatCount} active threads)`">
              <i class="fas fa-comments" :class="chatFilterActive ? 'text-white' : 'text-amber-300'"></i>
              <span>Messages</span>
              <span v-if="totalNewQueriesCount > 0"
                class="px-1.5 py-0.2 rounded-full bg-white text-rose-700 font-black text-[10px] shadow-xs">
                {{ totalNewQueriesCount }} NEW
              </span>
              <span v-else-if="totalRunnersWithChatCount > 0"
                class="px-1.5 py-0.2 rounded-full bg-emerald-400 text-gray-900 font-black text-[10px]">
                {{ totalRunnersWithChatCount }}
              </span>
            </button>

            <!-- Table Columns Customizer button -->
            <button type="button" @click="isColumnPickerModalOpen = true"
              class="hidden lg:flex px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition items-center gap-1.5 shadow-sm cursor-pointer">
              <i class="fas fa-table-columns text-amber-300"></i> Columns
              <span class="px-1.5 py-0.2 rounded-full bg-emerald-400 text-gray-900 font-black text-[10px]">
                {{ selectedCsvColumns.length }}
              </span>
            </button>

            <!-- Live indicator -->
            <!-- Live indicator & Manual Refresh Button -->
            <button
              type="button"
              @click="fetchRegistrations(false)"
              :disabled="isFetching || isAutoRefreshing"
              class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-[10px] font-medium transition cursor-pointer disabled:opacity-75 select-none"
              title="Click to refresh registrations">
              <span
                :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', isAutoRefreshing || isFetching ? 'bg-amber-300 animate-ping' : 'bg-emerald-400 animate-pulse']"></span>
              <span v-if="isFetching" class="text-emerald-100 flex items-center gap-1">Fetching… <i class="fas fa-spinner fa-spin text-[9px]"></i></span>
              <span v-else-if="isAutoRefreshing" class="text-amber-200 flex items-center gap-1">Syncing… <i class="fas fa-arrows-rotate fa-spin text-[9px]"></i></span>
              <span v-else-if="formatLastUpdated" class="text-emerald-200">Live · {{ formatLastUpdated }} <i class="fas fa-rotate text-[9px] ml-1 opacity-75"></i></span>
              <span v-else class="text-white/60">Live <i class="fas fa-rotate text-[9px] ml-1 opacity-75"></i></span>
            </button>

          </div>
        </div>
      </div>

      <div class="lg:flex">
        <!-- STATS SUMMARY CARDS (4 COLUMNS INCLUDING SUPPLIER BATCH LOCKED COUNT) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 lg:w-5/12 w-full">
          <div :class="[
            'px-4 py-2.5 rounded-2xl border shadow-sm transition items-center whitespace-nowrap',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]">
            <div
              class="w-10 h-10 rounded-xl mx-auto mb-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <i class="fas fa-running"></i>
            </div>
            <div class="text-center">
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Runners</p>
              <h3 class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center min-h-[28px]">
                <span v-if="isInitialLoading" class="inline-block h-6 w-12 rounded bg-emerald-100 dark:bg-emerald-950/70 animate-pulse"></span>
                <span v-else>{{ stats.totalRunners }}</span>
              </h3>
            </div>

          </div>

          <div :class="[
            'px-4 py-2.5 rounded-2xl border shadow-sm transition items-center whitespace-nowrap',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]">
            <div
              class="w-10 h-10 rounded-xl mx-auto mb-2 bg-emerald-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center text-lg">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="text-center">
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Confirmed Paid</p>
              <h3 class="text-xl font-black text-green-600 dark:text-green-400 mt-0.5 flex items-center justify-center min-h-[28px]">
                <span v-if="isInitialLoading" class="inline-block h-6 w-12 rounded bg-green-100 dark:bg-green-950/70 animate-pulse"></span>
                <span v-else>{{ stats.confirmed }}</span>
              </h3>
            </div>

          </div>

          <div :class="[
            'px-4 py-2.5 rounded-2xl border shadow-sm transition items-center whitespace-nowrap cursor-pointer group',
            selectedStatus === 'Pending'
              ? (props.darkMode ? 'bg-amber-950/40 border-amber-600 ring-2 ring-amber-500/40' : 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/50')
              : (props.darkMode ? 'bg-gray-800 border-gray-700 hover:border-amber-600/50' : 'bg-white border-slate-200 hover:border-amber-300'),
          ]" @click="selectedStatus = selectedStatus === 'Pending' ? 'All' : 'Pending'"
            :title="selectedStatus === 'Pending' ? 'Click to clear pending filter' : 'Click to filter by pending items'">
            <div :class="[
              'w-10 h-10 rounded-xl mx-auto mb-2 bg-emerald-100 flex items-center justify-center text-lg transition',
              selectedStatus === 'Pending'
                ? 'bg-amber-400 text-white'
                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200'
            ]">
              <i class="fas fa-clock"></i>
            </div>
            <div class="text-center">
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending Action</p>
              <h3 class="text-xl font-black text-amber-500 dark:text-amber-400 mt-0.5 flex items-center justify-center min-h-[28px]">
                <span v-if="isInitialLoading" class="inline-block h-6 w-12 rounded bg-amber-100 dark:bg-amber-950/70 animate-pulse"></span>
                <span v-else>{{ stats.pending }}</span>
              </h3>
              <p v-if="!isInitialLoading && selectedStatus === 'Pending'" class="text-[10px] text-amber-500 font-semibold mt-0.5">Filtering
                active ✓</p>
            </div>

          </div>

          <div :class="[
            'px-4 py-2.5 rounded-2xl border shadow-sm transition items-center whitespace-nowrap',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]">
            <div
              class="w-10 h-10 rounded-xl mx-auto mb-2 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <i class="fas fa-lock"></i>
            </div>
            <div class="text-center">
              <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Batch Locked</p>
              <h3 class="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 flex items-center justify-center min-h-[28px]">
                <span v-if="isInitialLoading" class="inline-block h-6 w-12 rounded bg-purple-100 dark:bg-purple-950/70 animate-pulse"></span>
                <span v-else>{{ stats.lockedCount }}</span>
              </h3>
            </div>

          </div>
        </div>

        <!-- SEARCH & FILTER TOOLBAR (ROW 1: SEARCH & FILTERS, ROW 2: DATE RANGE & SORTING) -->
        <div :class="[
          'p-3 rounded-3xl border shadow-md transition space-y-3 w-full',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <!-- Toolbar Row 1: Search & Basic Filters -->
          <div class="lg:flex gap-2.5 w-full flex-wrap">
            <!-- Search Input -->
            <div class="relative lg:w-4/12 flex-1 min-w-[200px]">
              <i class="fas fa-search absolute left-3.5 top-3.5 text-xs text-gray-400"></i>
              <input v-model="searchQuery" type="text" placeholder="Search Name, Reg ID, Bib #, Email, Course, Batch..." :class="[
                'w-full pl-9 pr-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]" />
            </div>

            <!-- Academic Unit Filter (HEU / BEU) -->
            <div class="min-w-[180px]">
              <select v-model="selectedAcademicUnit" :class="[
                'w-full px-3 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                selectedAcademicUnit !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
              ]">
                <option value="All">All Units / Programs</option>
                <optgroup label="🎓 HEU - All Higher Education">
                  <option value="HEU">🎓 All HEU (Bachelor & Graduate Studies) ({{ heuCount }})</option>
                </optgroup>
                <optgroup label="🎓 HEU - Undergraduate (Bachelor Degrees)">
                  <option v-for="c in bachelorCourses" :key="c.value" :value="c.value">
                    &nbsp;&nbsp;↳ {{ c.label }}
                  </option>
                </optgroup>
                <optgroup label="🏛️ HEU - School of Graduate Studies (SGS)">
                  <option v-for="c in graduateCourses" :key="c.value" :value="c.value">
                    &nbsp;&nbsp;↳ {{ c.label }}
                  </option>
                </optgroup>
                <optgroup label="🏫 BEU - Basic Education Unit">
                  <option value="BEU">🏫 All BEU (Grade School, JHS, SHS) ({{ beuCount }})</option>
                  <option value="Grade School">&nbsp;&nbsp;↳ 🎒 Grade School ({{ beuGradeSchoolCount }})</option>
                  <option value="JHS">&nbsp;&nbsp;↳ 📘 Junior High School (JHS) ({{ beuJhsCount }})</option>
                  <option value="SHS">&nbsp;&nbsp;↳ 🎓 Senior High School (SHS) ({{ beuShsCount }})</option>
                </optgroup>
              </select>
            </div>

            <!-- Category Filter -->
            <div>
              <select v-model="selectedCategory" :class="[
                'w-full px-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]">
                <option value="All">All Distance Categories</option>
                <option value="1KM">1 KM (Pet Run)</option>
                <option value="3KM">3 KM</option>
                <option value="10KM">10 KM</option>
                <option value="20KM">20 KM</option>
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <select v-model="selectedStatus" :class="[
                'w-full px-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]">
                <option value="All">All Payment Statuses</option>
                <option value="Confirmed">✅ Confirmed</option>
                <option value="Pending">⏳ All Pending</option>
                <option value="Pending Payment">💳 Pending Payment</option>
                <option value="Pending Approval">🔍 Pending Approval</option>
              </select>
            </div>

            <!-- Participant Type Filter -->
            <div>
              <select v-model="selectedParticipantType" :class="[
                'w-full px-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]">
                <option value="All">All Classifications</option>
                <option value="LSU Exclusive - Enrolled Student">LSU Exclusive - Enrolled Student</option>
                <option value="LSU Exclusive - Employee">LSU Exclusive - Employee</option>
                <option value="LSU Exclusive - Alumni">LSU Exclusive - Alumni</option>
                <option value="Open Category">Open Category</option>
                <option value="Pet">Pet</option>
              </select>
            </div>

            <!-- Age Group Filter -->
            <div>
              <select v-model="selectedAgeGroup" :class="[
                'w-full px-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]">
                <option value="All">All Age Groups</option>
                <option value="Under 18">Under 18</option>
                <option value="18–24">18–24</option>
                <option value="25–34">25–34</option>
                <option value="35–44">35–44</option>
                <option value="45–54">45–54</option>
                <option value="55+">55+</option>
              </select>
            </div>

            <!-- Messages / Queries Filter -->
            <div>
              <select v-model="selectedChatFilter" :class="[
                'w-full px-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                selectedChatFilter === 'new' ? 'ring-2 ring-rose-400 font-bold !border-rose-400 bg-rose-50/70 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' : selectedChatFilter !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
              ]">
                <option value="All">💬 All Messages</option>
                <option value="new">🔴 New Queries ({{ totalNewQueriesCount }})</option>
                <option value="has_messages">💬 With Chat History ({{ totalRunnersWithChatCount }})</option>
                <option value="no_messages">⚪ No Messages</option>
              </select>
            </div>
          </div>

          <!-- Toolbar Row 2: Date Range Period, Supplier Batch Filter & Sorting -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-2.5 border-t dark:border-gray-700/60">
            <!-- Date Range Period Inputs -->
            <div class="lg:col-span-4 flex items-center gap-1.5">
              <div class="relative w-1/2">
                <span class="absolute left-2.5 top-2 text-[9px] font-bold text-gray-400 uppercase">From</span>
                <input type="date" v-model="dateFrom" :class="[
                  'w-full pl-10 pr-1.5 py-1.5 rounded-xl border text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                  props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800'
                ]" />
              </div>
              <div class="relative w-1/2">
                <span class="absolute left-2.5 top-2 text-[9px] font-bold text-gray-400 uppercase">To</span>
                <input type="date" v-model="dateTo" :class="[
                  'w-full pl-7 pr-1.5 py-1.5 rounded-xl border text-[11px] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                  props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800'
                ]" />
              </div>
            </div>

            <!-- Quick Date Range Presets -->
            <div class="lg:col-span-2 flex items-center gap-1">
              <button type="button" @click="setDateRangePreset('today')"
                class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer">
                Today
              </button>
              <button type="button" @click="setDateRangePreset('7days')"
                class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer">
                7 Days
              </button>
              <button type="button" @click="setDateRangePreset('30days')"
                class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer">
                30 Days
              </button>
              <button v-if="dateFrom || dateTo" type="button" @click="clearDateRange"
                class="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 transition cursor-pointer"
                title="Clear Date Filter">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Supplier Batch Filter -->
            <div class="lg:col-span-2">
              <select v-model="selectedBatch" :class="[
                'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800'
              ]">
                <option value="All">All Supplier Batches</option>
                <option value="Unbatched">Unbatched Only</option>
                <option v-for="b in availableBatches" :key="b" :value="b">{{ b }}</option>
              </select>
            </div>

            <!-- Lock Status Filter -->
            <div class="lg:col-span-2">
              <select v-model="selectedLockStatus" :class="[
                'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800'
              ]">
                <option value="All">All Lock Statuses</option>
                <option value="Locked">🔒 Locked Orders Only</option>
                <option value="Unlocked">🔓 Unlocked Orders</option>
              </select>
            </div>

            <!-- Sorting Controls Dropdown -->
            <div class="lg:col-span-2 flex items-center gap-1.5">
              <select v-model="sortBy" :class="[
                'w-full px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800'
              ]">
                <option value="date_desc">📅 Date: Latest → Oldest</option>
                <option value="date_asc">📅 Date: Oldest → Latest</option>
                <option value="name_asc">👤 Name: Ascending (A-Z)</option>
                <option value="name_desc">👤 Name: Descending (Z-A)</option>
                <option value="bib_asc">🔢 Race Bib #: Ascending</option>
                <option value="batch_asc">📦 Supplier Batch: Ascending</option>
                <option value="shirt_asc">👕 T-Shirt Size: S → XL</option>
              </select>
            </div>
          </div>
        </div>

      </div>
      <!-- PARTICIPANTS VIEW (RESPONSIVE: MOBILE CARDS + DESKTOP TABLE) -->
      <div :class="[
        'rounded-3xl border shadow-lg overflow-hidden transition',
        props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
      ]">
        <!-- ── MOBILE CARD VIEW (VISIBLE ON PHONES / SMALL SCREENS < md) ── -->
        <div class="block md:hidden p-3 space-y-3">
          <!-- MOBILE SKELETON CARDS -->
          <template v-if="isInitialLoading">
            <div v-for="n in 4" :key="'skel-m-' + n"
              :class="[
                'p-4 rounded-2xl border transition shadow-sm space-y-3 animate-pulse',
                props.darkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white border-slate-200'
              ]">
              <!-- Card Header Skeleton -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-4 h-4 rounded bg-slate-200 dark:bg-gray-700"></div>
                  <div class="h-4 w-10 rounded bg-slate-200 dark:bg-gray-700"></div>
                  <div class="h-5 w-24 rounded-md bg-emerald-100/80 dark:bg-emerald-950/70"></div>
                </div>
                <div class="h-5 w-20 rounded-xl bg-slate-200 dark:bg-gray-700"></div>
              </div>

              <!-- Runner Info Skeleton -->
              <div class="space-y-1.5 pt-1">
                <div class="h-4 w-44 rounded bg-slate-200 dark:bg-gray-700"></div>
                <div class="flex items-center gap-3">
                  <div class="h-3 w-28 rounded bg-slate-100 dark:bg-gray-700/60"></div>
                  <div class="h-3 w-20 rounded bg-slate-100 dark:bg-gray-700/60"></div>
                </div>
              </div>

              <!-- Badges Row Skeleton -->
              <div class="flex items-center gap-2 pt-1">
                <div class="h-5 w-14 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                <div class="h-5 w-20 rounded-full bg-slate-200 dark:bg-gray-700"></div>
                <div class="h-5 w-24 rounded-full bg-slate-200 dark:bg-gray-700"></div>
              </div>

              <!-- Payment Summary Skeleton -->
              <div :class="[
                'p-2.5 rounded-xl flex items-center justify-between',
                props.darkMode ? 'bg-gray-900/50' : 'bg-slate-50'
              ]">
                <div class="space-y-1">
                  <div class="h-2.5 w-16 rounded bg-slate-200 dark:bg-gray-700"></div>
                  <div class="h-3 w-24 rounded bg-slate-200 dark:bg-gray-700"></div>
                </div>
                <div class="space-y-1">
                  <div class="h-2.5 w-12 rounded bg-slate-200 dark:bg-gray-700 ml-auto"></div>
                  <div class="h-4 w-16 rounded bg-emerald-200/80 dark:bg-emerald-950/80 ml-auto"></div>
                </div>
              </div>

              <!-- Actions Skeleton -->
              <div class="pt-1 flex gap-2">
                <div class="h-8 flex-1 rounded-xl bg-emerald-200/70 dark:bg-emerald-950/70"></div>
                <div class="h-8 w-16 rounded-xl bg-slate-200 dark:bg-gray-700"></div>
              </div>
            </div>
          </template>

          <!-- MOBILE ACTUAL CARDS -->
          <template v-else-if="filteredRegistrations.length > 0">
            <div v-for="runner in filteredRegistrations" :key="'m-' + runner.id" :class="[
              'p-4 rounded-2xl border transition-all duration-200 shadow-sm space-y-3',
              selectedIds.includes(runner.id)
                ? (props.darkMode ? 'bg-emerald-950/30 border-emerald-700' : 'bg-emerald-50/80 border-emerald-300')
                : (props.darkMode ? 'bg-gray-800/90 border-gray-700 hover:border-gray-600' : 'bg-white border-slate-200 hover:border-emerald-300')
            ]">
              <!-- Card Header: ID, Bib, Checkbox and Status -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Mobile checkbox -->
                  <input type="checkbox" :checked="selectedIds.includes(runner.id)" @change="toggleSelectOne(runner.id)"
                    class="w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0" />
                  <span class="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">#{{ runner.id
                    }}</span>
                  <span
                    class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px] uppercase">
                    RACE BIB {{ runner.run_number || runner.bib_number || ('AR-' + runner.id) }}
                  </span>
                </div>
                <span :class="[
                  'px-2.5 py-0.5 rounded-xl text-[10px] font-bold border shrink-0',
                  getStatusBadge(runner.payment_status)
                ]">
                  {{ runner.payment_status }}
                </span>
              </div>

              <!-- Runner Info -->
              <div>
                <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug">
                  {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname
                  }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                </h4>
                <div class="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span v-if="runner.contact_email || runner.email"
                    class="flex items-center gap-1 truncate max-w-[200px]">
                    <i class="fas fa-envelope text-[10px] text-gray-400"></i>
                    {{ runner.contact_email || runner.email }}
                  </span>
                  <span v-if="runner.contact_number || runner.phone" class="flex items-center gap-1">
                    <i class="fas fa-phone text-[10px] text-gray-400"></i>
                    {{ runner.contact_number || runner.phone }}
                  </span>
                </div>
              </div>

              <!-- Badges Row: Category + Classification -->
              <div class="flex items-center gap-1.5 flex-wrap pt-1">
                <span :class="[
                  'px-2.5 py-0.5 rounded-full font-black text-[10px] text-white shadow-xs flex items-center gap-1',
                  runCategories.find(c => runner.run_category && runner.run_category.startsWith(c.id))?.color || 'bg-emerald-700'
                ]">
                  <i class="fas fa-running text-[9px]"></i> {{ runner.run_category }}
                </span>
                <span
                  class="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600">
                  {{ runner.participant_type || 'Individual' }}
                </span>
                <span v-if="runner.college_course" :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1',
                  isHEU(runner)
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                    : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300'
                ]" :title="getCourseLabel(runner.college_course)">
                  <i :class="['fas text-[9px]', isHEU(runner) ? 'fa-graduation-cap' : 'fa-school']"></i>
                  {{ isHEU(runner) ? 'HEU · ' : 'BEU · ' }}{{ runner.college_course }}
                </span>
              </div>

              <!-- Payment Summary & Details -->
              <div :class="[
                'p-2.5 rounded-xl text-xs flex items-center justify-between',
                props.darkMode ? 'bg-gray-900/50' : 'bg-slate-50'
              ]">
                <div class="text-gray-600 dark:text-gray-400">
                  <span class="font-medium text-[11px] block text-gray-500">Payment Option</span>
                  <span class="font-bold text-xs capitalize text-gray-800 dark:text-gray-200">
                    {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : runner.payment_type ===
                      'add_to_tuition' ? 'Add to Tuition' : 'Over the Counter / QR' }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="font-medium text-[11px] block text-gray-500">Amount</span>
                  <span class="font-black text-sm text-emerald-600 dark:text-emerald-400">
                    ₱{{ Number(runner.grand_total_payment || runner.grand_total || 0).toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- Card Action Button -->
              <div class="pt-1 flex gap-2">
                <button type="button" @click="openDetails(runner)"
                  class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                  <i class="fas fa-eye text-xs"></i> View Details
                </button>
                <!-- Mobile Message Button with NEW Badge -->
                <button type="button" @click="openChatModal(runner)"
                  :class="[
                    'py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 border select-none',
                    getRunnerMessageStats(runner).hasNew
                      ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/80 animate-pulse'
                      : getRunnerMessageStats(runner).total > 0
                        ? 'bg-slate-100 hover:bg-emerald-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 border-slate-200 dark:border-gray-700 hover:text-emerald-700'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 text-gray-500 hover:text-emerald-600 border-slate-200 dark:border-gray-700'
                  ]"
                  :title="getRunnerMessageStats(runner).hasNew ? `${getRunnerMessageStats(runner).newCount} new query` : `${getRunnerMessageStats(runner).total} messages`">
                  <i :class="['fas text-xs', getRunnerMessageStats(runner).hasNew ? 'fa-comment-dots text-rose-600' : 'fa-comments text-emerald-600']"></i>
                  <span v-if="getRunnerMessageStats(runner).hasNew" class="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black text-[10px]">
                    {{ getRunnerMessageStats(runner).newCount }} NEW
                  </span>
                  <span v-else-if="getRunnerMessageStats(runner).total > 0" class="text-[11px] font-bold">
                    {{ getRunnerMessageStats(runner).total }}
                  </span>
                  <span v-else class="text-[11px] font-normal opacity-70">
                    Chat
                  </span>
                </button>
                <button v-if="runner.payment_status && runner.payment_status.startsWith('Pending')" type="button"
                  @click="promptConfirmPayment(runner)"
                  class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0">
                  <i class="fas fa-check text-xs"></i> Confirm
                </button>
              </div>
            </div>
          </template>

          <!-- MOBILE EMPTY STATE -->
          <div v-else class="p-8 text-center text-gray-500">
            <div class="max-w-xs mx-auto space-y-2">
              <i class="fas fa-search text-3xl mb-1 text-gray-400 block"></i>
              <p class="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {{ registrations.length === 0 ? 'No registration records found yet.' : 'No registration records match your search criteria.' }}
              </p>
              <button v-if="hasActiveFilters" type="button" @click="resetAllFilters"
                class="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer">
                <i class="fas fa-rotate-left text-xs"></i> Reset Filters
              </button>
            </div>
          </div>
        </div>

        <!-- ── DESKTOP TABLE VIEW (VISIBLE ON md+) ───────────────────── -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr :class="[
                'text-[11px] font-bold uppercase tracking-wider border-b transition select-none',
                props.darkMode
                  ? 'bg-gray-900/80 border-gray-700 text-gray-400'
                  : 'bg-emerald-50/60 border-slate-200 text-emerald-900',
              ]">
                <!-- Select-all checkbox -->
                <th class="p-3 w-10">
                  <input type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected"
                    @change="toggleSelectAll" class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    title="Select all visible" />
                </th>

                <!-- Dynamic Columns Header driven by selectedCsvColumns -->
                <th v-for="col in activeTableColumns" :key="col.key" :class="[
                  'p-3 transition select-none',
                  ['race_bib', 'reg_id', 'full_name', 'firstname', 'lastname', 'batch', 'reg_date'].includes(col.key) ? 'cursor-pointer hover:text-emerald-500' : ''
                ]"
                  @click="['race_bib', 'reg_id'].includes(col.key) ? toggleSort('bib') : ['full_name', 'firstname', 'lastname'].includes(col.key) ? toggleSort('name') : col.key === 'batch' ? toggleSort('batch') : col.key === 'reg_date' ? toggleSort('date') : null">
                  {{ col.label }}
                  <i v-if="['race_bib', 'reg_id'].includes(col.key)" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'bib_asc' ? 'fa-sort-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                  <i v-else-if="['full_name', 'firstname', 'lastname'].includes(col.key)" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'name_asc' ? 'fa-sort-alpha-down text-emerald-600' : sortBy === 'name_desc' ? 'fa-sort-alpha-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                  <i v-else-if="col.key === 'batch'" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'batch_asc' ? 'fa-sort-amount-down text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                  <i v-else-if="col.key === 'reg_date'" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'date_desc' ? 'fa-sort-numeric-down text-emerald-600' : sortBy === 'date_asc' ? 'fa-sort-numeric-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                </th>

                <!-- Messages / Chat Column Header (Red box in user's layout) -->
                <th class="p-3 text-center whitespace-nowrap">
                  <span class="inline-flex items-center gap-1.5 cursor-pointer hover:text-emerald-500 transition select-none"
                    @click="toggleChatFilter"
                    :title="`Click to filter runners with new queries (${totalNewQueriesCount} new)`">
                    <i class="fas fa-comments text-emerald-600 dark:text-emerald-400 text-xs"></i>
                    <span>Messages</span>
                    <span v-if="totalNewQueriesCount > 0"
                      class="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black text-[9px] animate-pulse">
                      {{ totalNewQueriesCount }} NEW
                    </span>
                  </span>
                </th>

                <th class="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700/60 text-xs">
              <!-- DESKTOP SKELETON ROWS -->
              <template v-if="isInitialLoading">
                <tr v-for="n in 8" :key="'skel-row-' + n"
                  class="animate-pulse border-b border-gray-100 dark:border-gray-800">
                  <!-- Checkbox -->
                  <td class="px-3 py-3.5 w-10">
                    <div class="w-4 h-4 rounded bg-slate-200 dark:bg-gray-700"></div>
                  </td>

                  <!-- Dynamic Columns -->
                  <td v-for="col in activeTableColumns" :key="col.key" class="px-3 py-3.5">
                    <!-- race_bib -->
                    <div v-if="col.key === 'race_bib'"
                      class="h-5 w-16 rounded bg-emerald-100/80 dark:bg-emerald-950/70"></div>

                    <!-- reg_id -->
                    <div v-else-if="col.key === 'reg_id'"
                      class="h-4 w-10 rounded bg-slate-200 dark:bg-gray-700"></div>

                    <!-- full_name -->
                    <div v-else-if="col.key === 'full_name'" class="space-y-1.5">
                      <div class="h-3.5 w-32 rounded bg-slate-200 dark:bg-gray-700"></div>
                      <div class="h-2.5 w-24 rounded bg-slate-100 dark:bg-gray-800"></div>
                    </div>

                    <!-- names -->
                    <div v-else-if="['firstname', 'lastname', 'middlename', 'suffix'].includes(col.key)"
                      class="h-3.5 w-20 rounded bg-slate-200 dark:bg-gray-700"></div>

                    <!-- batch -->
                    <div v-else-if="col.key === 'batch'"
                      class="h-5 w-20 rounded-xl bg-slate-200 dark:bg-gray-700"></div>

                    <!-- category -->
                    <div v-else-if="col.key === 'category'"
                      class="h-5 w-14 rounded-full bg-slate-200 dark:bg-gray-700"></div>

                    <!-- classification / academic unit -->
                    <div v-else-if="['classification', 'academic_unit', 'college_course', 'college_year'].includes(col.key)"
                      class="h-5 w-24 rounded-full bg-slate-200 dark:bg-gray-700"></div>

                    <!-- tshirt_size -->
                    <div v-else-if="col.key === 'tshirt_size'"
                      class="h-5 w-8 rounded-md bg-slate-200 dark:bg-gray-700 mx-auto"></div>

                    <!-- payment_status -->
                    <div v-else-if="col.key === 'payment_status'"
                      class="h-5 w-20 rounded-full bg-slate-200 dark:bg-gray-700"></div>

                    <!-- date -->
                    <div v-else-if="['reg_date', 'confirmed_date', 'birthdate'].includes(col.key)"
                      class="h-3.5 w-20 rounded bg-slate-200 dark:bg-gray-700"></div>

                    <!-- default -->
                    <div v-else class="h-3.5 w-20 rounded bg-slate-200 dark:bg-gray-700"></div>
                  </td>

                  <!-- Messages Skeleton -->
                  <td class="px-3 py-3.5 text-center">
                    <div class="h-6 w-9 rounded-xl bg-slate-200 dark:bg-gray-700 mx-auto"></div>
                  </td>

                  <!-- Actions Skeleton -->
                  <td class="px-3 py-3.5 text-center whitespace-nowrap">
                    <div class="h-6 w-14 rounded-xl bg-emerald-200/70 dark:bg-emerald-950/70 mx-auto"></div>
                  </td>
                </tr>
              </template>

              <!-- DESKTOP ACTUAL ROWS -->
              <template v-else-if="filteredRegistrations.length > 0">
                <tr v-for="runner in filteredRegistrations" :key="runner.id" :class="[
                  'hover:bg-emerald-50/70 dark:hover:bg-gray-700/40 transition',
                  selectedIds.includes(runner.id) ? (props.darkMode ? 'bg-emerald-950/30' : 'bg-emerald-50/80') : '',
                ]">

                  <!-- Row checkbox -->
                  <td class="px-3 w-10">
                    <input type="checkbox" :checked="selectedIds.includes(runner.id)"
                      @change="toggleSelectOne(runner.id)" class="w-4 h-4 rounded accent-emerald-600 cursor-pointer" />
                  </td>

                  <!-- Dynamic columns rendered based on col.key -->
                  <td v-for="col in activeTableColumns" :key="col.key" class="px-3">
                    <!-- race_bib -->
                    <template v-if="col.key === 'race_bib'">
                      <span
                        class="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase">
                        {{ runner.run_number || runner.bib_number || ('AR-' + runner.id) }}
                      </span>
                    </template>

                    <!-- reg_id -->
                    <template v-else-if="col.key === 'reg_id'">
                      <span class="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">#{{ runner.id
                        }}</span>
                    </template>

                    <!-- full_name -->
                    <template v-else-if="col.key === 'full_name'">
                      <div class="font-bold text-gray-900 dark:text-gray-100 uppercase leading-snug">
                        {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{
                        runner.lastname }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                      </div>
                      <div class="text-[11px] text-gray-500 truncate max-w-[180px]">
                        {{ runner.contact_email || runner.email }}
                      </div>
                    </template>

                    <!-- firstname -->
                    <template v-else-if="col.key === 'firstname'">
                      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ runner.firstname || '-' }}</span>
                    </template>

                    <!-- middlename -->
                    <template v-else-if="col.key === 'middlename'">
                      <span class="text-gray-700 dark:text-gray-300">{{ runner.middlename || '-' }}</span>
                    </template>

                    <!-- lastname -->
                    <template v-else-if="col.key === 'lastname'">
                      <span class="font-semibold text-gray-900 dark:text-gray-100">{{ runner.lastname || '-' }}</span>
                    </template>

                    <!-- suffix -->
                    <template v-else-if="col.key === 'suffix'">
                      <span class="text-gray-700 dark:text-gray-300">{{ runner.suffix || '-' }}</span>
                    </template>

                    <!-- batch -->
                    <template v-else-if="col.key === 'batch'">
                      <div v-if="runner.batch_name" class="flex items-center gap-1">
                        <span :class="[
                          'px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 shadow-2xs',
                          runner.batch_locked
                            ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                            : 'bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-slate-300'
                        ]">
                          <i
                            :class="['fas', runner.batch_locked ? 'fa-lock text-purple-600 dark:text-purple-400' : 'fa-unlock text-emerald-500']"></i>
                          {{ runner.batch_name }}
                        </span>
                        <button type="button" @click="openUnlockPrompt(runner, 'runner')"
                          class="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-purple-900 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer text-[10px]"
                          :title="runner.batch_locked ? 'Superadmin Bypass: Click to unlock order' : 'Click to lock order for supplier'">
                          <i :class="['fas', runner.batch_locked ? 'fa-unlock' : 'fa-lock']"></i>
                        </button>
                      </div>
                      <div v-else class="text-[11px] text-gray-400 italic">Unbatched</div>
                    </template>

                    <!-- lock_status -->
                    <template v-else-if="col.key === 'lock_status'">
                      <span :class="[
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                        runner.batch_locked ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                      ]">
                        {{ runner.batch_locked ? 'Locked' : 'Open' }}
                      </span>
                    </template>

                    <!-- category -->
                    <template v-else-if="col.key === 'category'">
                      <span :class="[
                        'px-2 py-0.5 rounded font-black text-[10px] text-white shadow-2xs inline-block',
                        runCategories.find(c => normalizeCategory(runner.run_category) === c.id || (runner.run_category && runner.run_category.startsWith(c.id)))?.color || 'bg-emerald-700'
                      ]">
                        {{ runner.run_category }}
                      </span>
                    </template>

                    <!-- tshirt_size -->
                    <template v-else-if="col.key === 'tshirt_size'">
                      <div v-if="(runner.run_category || '').toUpperCase().startsWith('1K') || runner.pet_name"
                        class="text-[10px] font-bold text-gray-500">
                        Pet Bandana: <span class="text-gray-800 dark:text-gray-200">Standard</span>
                      </div>
                      <div v-else class="text-[10px] font-bold text-gray-500">Size: <span
                          class="text-gray-800 dark:text-gray-200 uppercase">{{ runner.tshirt_size || 'M' }}</span>
                      </div>
                    </template>

                    <!-- classification -->
                    <template v-else-if="col.key === 'classification'">
                      <span
                        class="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-[10px] font-semibold">
                        {{ runner.participant_type || 'Open Category' }}
                      </span>
                    </template>

                    <!-- college_course -->
                    <template v-else-if="col.key === 'college_course'">
                      <div v-if="runner.college_course" class="space-y-0.5">
                        <span :class="[
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border',
                          isHEU(runner)
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                        ]" :title="getCourseLabel(runner.college_course)">
                          <i :class="['fas text-[9px]', isHEU(runner) ? 'fa-graduation-cap text-amber-600 dark:text-amber-400' : 'fa-school text-sky-600 dark:text-sky-400']"></i>
                          <span class="font-black uppercase">{{ isHEU(runner) ? 'HEU' : 'BEU' }}</span>
                          <span class="opacity-40">·</span>
                          <span class="font-bold">{{ runner.college_course }}</span>
                        </span>
                        <div class="text-[9px] text-gray-500 truncate max-w-[170px]" :title="getCourseLabel(runner.college_course)">
                          {{ getCourseLabel(runner.college_course) }}
                        </div>
                      </div>
                      <span v-else class="text-gray-400 text-[11px]">-</span>
                    </template>

                    <!-- college_year -->
                    <template v-else-if="col.key === 'college_year'">
                      <span class="text-gray-700 dark:text-gray-300 text-[11px] font-medium">
                        {{ runner.college_year || runner.beu_grade || '-' }}
                      </span>
                    </template>

                    <!-- pet_bandana -->
                    <template v-else-if="col.key === 'pet_bandana'">
                      <span
                        v-if="(runner.run_category || '').toUpperCase().startsWith('1K') || runner.pet_name || runner.pet_bandana_size"
                        class="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">Standard</span>
                      <span v-else class="text-gray-400 text-[11px]">-</span>
                    </template>

                    <!-- pet_name -->
                    <template v-else-if="col.key === 'pet_name'">
                      <span class="text-gray-800 dark:text-gray-200 font-medium">{{ runner.pet_name || '-' }}</span>
                    </template>

                    <!-- pet_type -->
                    <template v-else-if="col.key === 'pet_type'">
                      <span class="text-gray-700 dark:text-gray-300 capitalize">{{ runner.pet_type ?
                        runner.pet_type.replace('_', ' ') : '-' }}</span>
                    </template>

                    <!-- pet_vaccinated -->
                    <template v-else-if="col.key === 'pet_vaccinated'">
                      <span
                        :class="runner.pet_vaccinated ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400'">
                        {{ runner.pet_vaccinated ? 'Yes' : 'No' }}
                      </span>
                    </template>

                    <!-- gender -->
                    <template v-else-if="col.key === 'gender'">
                      <span class="text-gray-700 dark:text-gray-300 capitalize">{{ runner.gender || '-' }}</span>
                    </template>

                    <!-- age -->
                    <template v-else-if="col.key === 'age'">
                      <span class="text-gray-700 dark:text-gray-300">{{ computeAge(runner.birthdate) !== null ?
                        computeAge(runner.birthdate) : '-' }}</span>
                    </template>

                    <!-- birthdate -->
                    <template v-else-if="col.key === 'birthdate'">
                      <span class="text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ runner.birthdate || '-'
                        }}</span>
                    </template>

                    <!-- contact_number -->
                    <template v-else-if="col.key === 'contact_number'">
                      <span class="text-gray-700 dark:text-gray-300 font-mono text-[11px]">{{ runner.contact_number ||
                        '-' }}</span>
                    </template>

                    <!-- email -->
                    <template v-else-if="col.key === 'email'">
                      <span class="text-gray-700 dark:text-gray-300 text-[11px]">{{ runner.contact_email || runner.email
                        || '-' }}</span>
                    </template>

                    <!-- address -->
                    <template v-else-if="col.key === 'address'">
                      <span class="text-gray-700 dark:text-gray-300 text-[11px] line-clamp-1 max-w-[200px]"
                        :title="runner.contact_address">{{ runner.contact_address || '-' }}</span>
                    </template>

                    <!-- lsu_id -->
                    <template v-else-if="col.key === 'lsu_id'">
                      <span class="font-mono text-gray-700 dark:text-gray-300 text-[11px]">{{ runner.lsu_id_number ||
                        '-' }}</span>
                    </template>

                    <!-- organization -->
                    <template v-else-if="col.key === 'organization'">
                      <span class="text-gray-700 dark:text-gray-300 text-[11px]">{{ runner.organization || '-' }}</span>
                    </template>

                    <!-- affiliation -->
                    <template v-else-if="col.key === 'affiliation'">
                      <span class="text-gray-700 dark:text-gray-300 text-[11px]">{{ runner.alumni_batch || '-' }}</span>
                    </template>

                    <!-- payment_option -->
                    <template v-else-if="col.key === 'payment_option'">
                      <span class="text-[10px] text-gray-600 dark:text-gray-300 capitalize">
                        {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : runner.payment_type ===
                          'add_to_tuition' ? 'Add to Tuition' : 'Over-the-Counter / QR' }}
                      </span>
                    </template>

                    <!-- payment_status -->
                    <template v-else-if="col.key === 'payment_status'">
                      <div class="flex items-center gap-1.5">
                        <span :class="[
                          'px-2.5 py-0.5 rounded-xl text-[10px] font-bold border shrink-0',
                          getStatusBadge(runner.payment_status)
                        ]">
                          {{ runner.payment_status }}
                        </span>
                        <div class="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₱{{ Number(runner.grand_total_payment || runner.grand_total || 0).toLocaleString() }}
                        </div>
                      </div>
                    </template>

                    <!-- total_amount -->
                    <template v-else-if="col.key === 'total_amount'">
                      <div class="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₱{{ Number(runner.grand_total_payment || runner.grand_total || 0).toLocaleString() }}
                      </div>
                    </template>

                    <!-- reg_date -->
                    <template v-else-if="col.key === 'reg_date'">
                      <span class="text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {{ runner.created_at_formatted || (runner.created_at ? new
                          Date(runner.created_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year:
                        'numeric' }) : 'N/A') }}
                      </span>
                    </template>

                    <!-- confirmed_date -->
                    <template v-else-if="col.key === 'confirmed_date'">
                      <span class="text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {{ runner.confirmed_at ? new Date(runner.confirmed_at).toLocaleDateString('en-US', {
                          month:
                            'short', day: 'numeric', year: 'numeric' }) : '-' }}
                      </span>
                    </template>

                    <!-- confirmed_by -->
                    <template v-else-if="col.key === 'confirmed_by'">
                      <span class="text-[11px] text-gray-700 dark:text-gray-300">{{ runner.confirmed_by || '-' }}</span>
                    </template>

                    <!-- locked_by -->
                    <template v-else-if="col.key === 'locked_by'">
                      <span class="text-[11px] text-gray-700 dark:text-gray-300">{{ runner.batch_locked_by || '-'
                        }}</span>
                    </template>

                    <!-- locked_at -->
                    <template v-else-if="col.key === 'locked_at'">
                      <span class="text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {{ runner.batch_locked_at ? new Date(runner.batch_locked_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric' }) : '-' }}
                      </span>
                    </template>

                    <!-- fallback -->
                    <template v-else>
                      <span class="text-gray-700 dark:text-gray-300 text-[11px]">{{ runner[col.key] || '-' }}</span>
                    </template>
                  </td>

                  <!-- Messages / Chat Column (Red box in user's layout) -->
                  <td class="px-3 text-center whitespace-nowrap">
                    <!-- Runner has NEW unread message query -->
                    <button v-if="getRunnerMessageStats(runner).hasNew" type="button"
                      @click="openChatModal(runner)"
                      class="relative px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-700/80 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer group"
                      :title="`${getRunnerMessageStats(runner).newCount} new message query · Click to view and reply`">
                      <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <i class="fas fa-comment-dots text-rose-600 dark:text-rose-400 text-sm group-hover:scale-110 transition-transform"></i>
                      <span class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-tight shadow-2xs">
                        {{ getRunnerMessageStats(runner).newCount }} NEW
                      </span>
                    </button>

                    <!-- Runner has message history (all read / replied) -->
                    <button v-else-if="getRunnerMessageStats(runner).total > 0" type="button"
                      @click="openChatModal(runner)"
                      class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer group"
                      :title="`${getRunnerMessageStats(runner).total} message(s) in chat history · Click to view`">
                      <i class="fas fa-comments text-emerald-600 dark:text-emerald-400 text-xs group-hover:scale-110 transition-transform"></i>
                      <span class="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 font-bold text-[10px]">
                        {{ getRunnerMessageStats(runner).total }}
                      </span>
                    </button>

                    <!-- No messages yet: subtle icon to start conversation -->
                    <button v-else type="button"
                      @click="openChatModal(runner)"
                      class="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400 border border-transparent hover:border-slate-200 dark:hover:border-gray-700 transition inline-flex items-center justify-center cursor-pointer group"
                      title="No chat history · Click to send message to runner">
                      <i class="far fa-comment-dots text-sm group-hover:scale-110 transition-transform"></i>
                    </button>
                  </td>

                  <!-- Fixed Actions column -->
                  <td class="px-3 text-center whitespace-nowrap">
                    <button type="button" @click="openDetails(runner)"
                      class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                      <i class="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              </template>

              <!-- DESKTOP EMPTY STATE -->
              <tr v-else>
                <td :colspan="activeTableColumns.length + 3" class="p-10 text-center text-gray-500">
                  <div class="max-w-md mx-auto space-y-2">
                    <i class="fas fa-search text-3xl mb-1 text-gray-400 block"></i>
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {{ registrations.length === 0 ? 'No registration records found yet.' : 'No registration records match your search criteria.' }}
                    </p>
                    <p v-if="registrations.length > 0" class="text-xs text-gray-400">
                      Try adjusting your search keywords, category, academic unit, or date range.
                    </p>
                    <button v-if="hasActiveFilters" type="button" @click="resetAllFilters"
                      class="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition cursor-pointer">
                      <i class="fas fa-rotate-left text-xs"></i> Reset Filters
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── BULK-ACTION TOOLBAR (sticky bottom, appears on selection) ──── -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0">
      <div v-if="selectedIds.length > 0"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md"
        :class="props.darkMode ? 'bg-gray-900/90 border-gray-700 text-gray-100' : 'bg-white/90 border-slate-200 text-gray-800'">
        <!-- Count badge -->
        <span class="flex items-center gap-1.5 text-xs font-bold">
          <span
            class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">
            {{ selectedIds.length }}
          </span>
          {{ selectedIds.length === 1 ? 'runner' : 'runners' }} selected
        </span>

        <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>

        <!-- Clear selection -->
        <button type="button" @click="clearSelection"
          class="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer flex items-center gap-1.5">
          <i class="fas fa-times-circle"></i> Clear
        </button>


        <!-- Finalize Supplier Batch button -->
        <button type="button" @click="openBatchFinalizeModal"
          class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md border border-amber-400/40 cursor-pointer">
          <i class="fas fa-layer-group"></i> Finalize Supplier Batch (CSV)
        </button>



        <!-- Delete selected -->
        <button type="button" @click="promptBulkDelete" :disabled="isBulkDeleting"
          class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-60">
          <i v-if="!isBulkDeleting" class="fas fa-trash"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ isBulkDeleting ? 'Deleting...' : '' }}
        </button>
      </div>
    </Transition>

    <!-- DETAIL & VERIFICATION MODAL -->
    <div v-if="isDetailModalOpen && selectedRunner"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div :class="[
        'relative lg:w-11/12 w-full rounded-3xl shadow-2xl border p-4 sm:p-8 max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-6 transition',
        props.darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200',
      ]">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs uppercase">
                {{ selectedRunner.run_number || selectedRunner.bib_number || ('AR-' + selectedRunner.id) }}
              </span>
              <h2 class="text-xl font-black">Runner Registration Details</h2>
              <!-- Edit mode badge -->
              <span v-if="isEditMode"
                class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <i class="fas fa-pen text-[9px]"></i> Editing
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">Date Created: {{
              selectedRunner.created_at_formatted || selectedRunner.registration_date }}</p>
          </div>

          <div class="flex items-center gap-2">
            <!-- Edit / Cancel toggle -->
            <button v-if="!isEditMode" type="button" @click="openEdit"
              class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer">
              <i class="fas fa-pen"></i> Edit Info
            </button>
            <button v-else type="button" @click="cancelEdit"
              class="px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer">
              <i class="fas fa-times"></i> Cancel
            </button>
            <!-- Close -->
            <button type="button" @click="closeDetails"
              class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold cursor-pointer">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="lg:flex lg:gap-x-10">
          <!-- Personal Details -->
          <div class="w-full">
            <div class="space-y-3 gap-4 text-xs">

              <!-- ── VIEW MODE ───────────────────────────────────────────── -->
              <template v-if="!isEditMode">
                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Full Name</label>
                  <p class="font-semibold uppercase">
                    {{ selectedRunner.firstname }} {{ selectedRunner.middlename }} {{ selectedRunner.lastname }}{{
                      selectedRunner.suffix ? ' ' + selectedRunner.suffix : '' }}
                  </p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Gender &amp; Birthdate</label>
                  <p class="font-semibold">
                    {{ selectedRunner.gender || 'Not specified' }} • {{ selectedRunner.birthdate || 'N/A' }}
                  </p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Contact Phone</label>
                  <p class="font-semibold">{{ selectedRunner.contact_number || selectedRunner.phone || 'N/A' }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Email Address</label>
                  <p class="font-semibold">{{ selectedRunner.contact_email || selectedRunner.email }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Classification</label>
                  <p class="font-semibold">{{ selectedRunner.participant_type }} {{ selectedRunner.lsu_id_number ? '(' +
                    selectedRunner.lsu_id_number + ')' : '' }}</p>
                </div>

                <div v-if="selectedRunner.college_course || selectedRunner.college_year || selectedRunner.beu_grade" class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Course / Program</label>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span v-if="getCourseLabel(selectedRunner.college_course)" class="font-semibold text-emerald-700 dark:text-emerald-400">
                        {{ getCourseLabel(selectedRunner.college_course) }}
                      </span>
                      <span v-if="isHEU(selectedRunner)"
                        class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                        <i class="fas fa-graduation-cap mr-1"></i> HEU ({{ isGraduateStudies(selectedRunner) ? 'School of Graduate Studies' : 'Bachelor Degree' }})
                      </span>
                      <span v-else-if="isBEU(selectedRunner)"
                        class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300">
                        <i class="fas fa-school mr-1"></i> BEU ({{ isBEULevel(selectedRunner, 'SHS') ? 'Senior High School' : isBEULevel(selectedRunner, 'JHS') ? 'Junior High School' : 'Grade School' }})
                      </span>
                    </div>
                    <p v-if="selectedRunner.college_year || selectedRunner.beu_grade" class="text-[11px] text-gray-500">
                      Level: <strong class="text-gray-700 dark:text-gray-300">{{ selectedRunner.college_year || selectedRunner.beu_grade }}</strong>
                    </p>
                  </div>
                </div>

                <div v-if="selectedRunner.organization" class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Running Club / Org</label>
                  <p class="font-semibold text-emerald-600 dark:text-emerald-400">{{ selectedRunner.organization }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">T-Shirt Size</label>
                  <p class="font-semibold">{{ selectedRunner.tshirt_size || 'M' }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-5/12 uppercase">Address</label>
                  <p class="font-semibold">{{ selectedRunner.contact_address || selectedRunner.address || 'Ozamiz City'
                    }}
                  </p>
                </div>
              </template>

              <!-- ── EDIT MODE ───────────────────────────────────────────── -->
              <template v-else>
                <div :class="[
                  'p-4 rounded-2xl border mb-4',
                  props.darkMode ? 'bg-amber-950/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'
                ]">
                  <p class="text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                    <i class="fas fa-info-circle"></i>
                    You are editing this runner's registration. Click <strong>Save Changes</strong> to apply.
                  </p>
                </div>

                <!-- Name row -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">First Name *</label>
                    <input v-model="editForm.firstname" :class="inputCls" placeholder="First Name" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Middle Name</label>
                    <input v-model="editForm.middlename" :class="inputCls" placeholder="Middle Name" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Last Name *</label>
                    <input v-model="editForm.lastname" :class="inputCls" placeholder="Last Name" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Suffix</label>
                    <select v-model="editForm.suffix" :class="inputCls">
                      <option value="">None</option>
                      <option>Jr.</option>
                      <option>Sr.</option>
                      <option>II</option>
                      <option>III</option>
                      <option>IV</option>
                    </select>
                  </div>
                </div>

                <!-- Gender & Birthdate -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Gender</label>
                    <select v-model="editForm.gender" :class="inputCls">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date of Birth</label>
                    <input type="date" v-model="editForm.birthdate" :class="inputCls" />
                  </div>
                </div>

                <!-- Contact -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Phone *</label>
                    <input v-model="editForm.contact_number" :class="inputCls" placeholder="0917 123 4567" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email *</label>
                    <input v-model="editForm.contact_email" :class="inputCls" placeholder="email@example.com" />
                  </div>
                </div>

                <!-- Address -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Address</label>
                  <input v-model="editForm.contact_address" :class="inputCls" placeholder="Barangay, City, Province" />
                </div>

                <!-- Classification & LSU ID -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Classification</label>
                    <select v-model="editForm.participant_type" :class="inputCls">
                      <option value="">-- Select --</option>
                      <option value="LSU Exclusive - Enrolled Student">LSU Exclusive - Enrolled Student</option>
                      <option value="LSU Exclusive - Employee">LSU Exclusive - Employee</option>
                      <option value="LSU Exclusive - Alumni">LSU Exclusive - Alumni</option>
                      <option value="Open Category">Open Category</option>
                      <option value="Pet">Pet</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">LSU ID Number</label>
                    <input v-model="editForm.lsu_id_number" :class="inputCls" placeholder="e.g. 2021-00001" />
                  </div>
                </div>

                <!-- Course / Program & Year / Grade Level -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Course / Program</label>
                    <select v-model="editForm.college_course" :class="inputCls">
                      <option value="">-- Select Course / Program --</option>
                      <optgroup label="🎓 HEU - Undergraduate (Bachelor Degrees)">
                        <option v-for="c in bachelorCourses" :key="c.value" :value="c.value">
                          {{ c.label }}
                        </option>
                      </optgroup>
                      <optgroup label="🏛️ HEU - School of Graduate Studies (SGS)">
                        <option v-for="c in graduateCourses" :key="c.value" :value="c.value">
                          {{ c.label }}
                        </option>
                      </optgroup>
                      <optgroup label="🏫 BEU (Basic Education)">
                        <option value="Grade School">Grade School</option>
                        <option value="JHS">Junior High School (JHS)</option>
                        <option value="SHS">Senior High School (SHS)</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Year / Grade Level</label>
                    <input v-model="editForm.college_year" :class="inputCls" placeholder="e.g. 1st Year, Grade 11 STEM" />
                  </div>
                </div>

                <!-- Shirt size & Run category -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">T-Shirt Size</label>
                    <input v-model="editForm.tshirt_size" :class="inputCls" placeholder="e.g. M, L, XL" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Run Category</label>
                    <select v-model="editForm.run_category" :class="inputCls">
                      <option value="">-- Select --</option>
                      <option value="1KM">1 KM (Pet Run)</option>
                      <option value="3KM">3 KM</option>
                      <option value="10KM">10 KM</option>
                      <option value="20KM">20 KM</option>
                    </select>
                  </div>
                </div>

                <!-- Bib number -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Bib / Run Number</label>
                    <input v-model="editForm.run_number" :class="inputCls" placeholder="e.g. 10-0001" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Payment Status</label>
                    <select v-model="editForm.payment_status" :class="inputCls">
                      <option value="Pending Payment">Pending Payment</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Confirmed">Confirmed</option>
                    </select>
                  </div>
                </div>

                <!-- Running Club & Batch -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Running Club /
                      Organization</label>
                    <input v-model="editForm.organization" :class="inputCls"
                      placeholder="e.g. Ozamiz Lifestyle Runners" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Affiliation / Batch</label>
                    <input v-model="editForm.alumni_batch" :class="inputCls" placeholder="e.g. Batch 2024 or Dept" />
                  </div>
                </div>
              </template>

            </div>
          </div>

          <div class="lg:w-10/12">
            <!-- Category & Addons / Pet Details -->
            <div :class="[
              'p-4 rounded-2xl border space-y-3 text-xs',
              props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-emerald-50/50 border-emerald-200',
            ]">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-800 dark:text-emerald-300">Run Category</span>
                <span class="font-black text-sm text-emerald-700 dark:text-emerald-400">
                  {{ selectedRunner.run_category }} | ₱{{ Number(selectedRunner.grand_total_payment ||
                    selectedRunner.grand_total || 0).toLocaleString() }}
                </span>
              </div>

              <!-- Pet details if 1K Pet Run -->
              <div
                v-if="selectedRunner.pet_name || selectedRunner.run_category === '1KM' || selectedRunner.run_category === '1K'"
                class="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <i class="fas fa-paw"></i> Pet Runner Details:
                  </span>
                  <span v-if="selectedRunner.pet_vaccinated"
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    <i class="fas fa-syringe mr-0.5"></i> Vaccinated
                  </span>
                </div>
                <p><strong>Name:</strong> {{ selectedRunner.pet_name || 'N/A' }} ({{ selectedRunner.pet_type || 'Dog'
                  }})
                </p>
                <p><strong>Bandana:</strong> Standard</p>

                <!-- Pet Vaccine Document -->
                <div v-if="getDocumentUrl(selectedRunner.pet_vaccine_record)"
                  class="pt-2 border-t dark:border-gray-700">
                  <div
                    class="flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
                    <div class="flex items-center gap-1.5 truncate mr-2">
                      <i class="fas fa-file-medical text-emerald-600"></i>
                      <span class="text-[11px] font-bold truncate">Vaccine Record / Anti-Rabies</span>
                    </div>
                    <button type="button"
                      @click="openReceiptModal(getDocumentUrl(selectedRunner.pet_vaccine_record), 'Pet Vaccination Record', selectedRunner)"
                      class="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition shrink-0 cursor-pointer">
                      <i class="fas fa-eye"></i> View
                    </button>
                  </div>
                </div>

                <!-- Pet Consent Documents (Multi) -->
                <div v-if="getDocumentList(selectedRunner.pet_consent_documents).length > 0"
                  class="pt-2 border-t dark:border-gray-700 space-y-1.5">
                  <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block">
                    <i class="fas fa-file-signature text-amber-600 mr-1"></i> Signed Non-Liability Consent Documents ({{
                      getDocumentList(selectedRunner.pet_consent_documents).length }}):
                  </span>
                  <div v-for="(doc, dIdx) in getDocumentList(selectedRunner.pet_consent_documents)" :key="dIdx"
                    class="flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                    <div class="flex items-center gap-1.5 truncate mr-2">
                      <i class="fas fa-file-pdf text-rose-500"></i>
                      <span class="text-[11px] font-medium truncate">{{ doc.name }}</span>
                    </div>
                    <button type="button" @click="openReceiptModal(doc.url, `Consent Doc: ${doc.name}`, selectedRunner)"
                      class="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] transition shrink-0 cursor-pointer">
                      <i class="fas fa-eye"></i> View
                    </button>
                  </div>
                </div>
              </div>


            </div>


            <!-- Proof of Payment Receipt (View & Admin Upload/Transfer) -->
            <div class="lg:mt-4">
              <div v-if="selectedRunner.proof_of_payment"
                class="border rounded-2xl p-3 bg-slate-50 dark:bg-gray-900/40 flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                    <i class="fas fa-file-invoice"></i>
                  </div>
                  <div>
                    <p class="font-bold text-xs">Payment Receipt Attached</p>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">Proof of payment recorded for {{
                      selectedRunner.firstname }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-wrap">
                  <button type="button"
                    @click="openReceiptModal(selectedRunner.proof_of_payment, 'Payment Receipt Proof', selectedRunner)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="fas fa-receipt text-xs"></i> View Receipt
                  </button>
                  <label
                    class="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <i :class="['fas', isAdminUploadingReceipt ? 'fa-spinner fa-spin' : 'fa-upload']"></i>
                    <span>{{ isAdminUploadingReceipt ? 'Uploading...' : 'Replace Receipt' }}</span>
                    <input type="file" accept="image/*,.pdf" class="hidden"
                      @change="handleAdminReceiptChange($event, selectedRunner)" :disabled="isAdminUploadingReceipt" />
                  </label>
                  <button type="button" @click="promptDeleteReceipt(selectedRunner)" :disabled="isDeletingReceipt"
                    class="px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-200 dark:hover:bg-rose-900/80 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs border border-rose-200 dark:border-rose-800 disabled:opacity-50">
                    <i :class="['fas', isDeletingReceipt ? 'fa-spinner fa-spin' : 'fa-trash']" class="text-xs"></i>
                    <span>{{ isDeletingReceipt ? 'Deleting...' : 'Delete Receipt' }}</span>
                  </button>
                </div>
              </div>

              <div v-else
                class="border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-2xl p-3 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                    <i class="fas fa-receipt"></i>
                  </div>
                  <div>
                    <p class="font-bold text-xs text-amber-900 dark:text-amber-200">Upload Receipt: Over The Counter
                      Payment
                      or On-Site Weekend Cash Payment</p>
                    <p class="text-[10px] text-amber-700 dark:text-amber-400">To record proof of payment if any
                      modification
                      is made.</p>
                    <p class="text-[10px] text-amber-700 dark:text-amber-400">Salary Deduction / Employee or Add to
                      Tuition
                      / Currently Enrolled Students</p>
                  </div>
                </div>

                <label
                  class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer">
                  <i :class="['fas', isAdminUploadingReceipt ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt']"></i>
                  <span>{{ isAdminUploadingReceipt ? 'Recording...' : 'Upload & Record Receipt' }}</span>
                  <input type="file" accept="image/*,.pdf" class="hidden"
                    @change="handleAdminReceiptChange($event, selectedRunner)" :disabled="isAdminUploadingReceipt" />
                </label>
              </div>
            </div>

            <!-- Alumni Valid ID (Front and Back) if uploaded -->
            <div v-if="getImageUrl(selectedRunner.valid_id_front) || getImageUrl(selectedRunner.valid_id_back)"
              class="lg:flex mt-3 gap-x-2">


              <div v-if="getImageUrl(selectedRunner.valid_id_front)"
                class="border rounded-2xl p-3 bg-slate-50 dark:bg-gray-900/40 flex items-center justify-between w-full">
                <div class="flex items-center gap-3">

                  <div>
                    <p class="font-bold text-xs">Alumni ID</p>

                  </div>
                </div>
                <button type="button"
                  @click="openReceiptModal(getImageUrl(selectedRunner.valid_id_front), 'Alumni ID (Front)', selectedRunner)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <i class="fas fa-eye text-xs"></i> View Front
                </button>
              </div>

              <div v-if="getImageUrl(selectedRunner.valid_id_back)"
                class="border rounded-2xl p-3 bg-slate-50 dark:bg-gray-900/40 flex items-center justify-between w-full">
                <div class="flex items-center gap-3">

                  <div>
                    <p class="font-bold text-xs">Alumni ID </p>
                  </div>
                </div>
                <button type="button"
                  @click="openReceiptModal(getImageUrl(selectedRunner.valid_id_back), 'Alumni ID (Back)', selectedRunner)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <i class="fas fa-eye text-xs"></i> View Back
                </button>
              </div>
            </div>

          </div><!-- /Personal Details -->

          <!-- ── COMMUNICATION CHAT PANEL ────────────────────────────────────────────── -->
          <div class="lg:w-80 shrink-0 flex flex-col mt-6 lg:mt-0">
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2 border-b dark:border-gray-700">
              <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm">
                <i class="fas fa-comments"></i>
              </div>
              <div>
                <p class="text-xs font-black uppercase tracking-wide">Communication Chat</p>
                <p class="text-[10px] text-gray-500">{{ selectedRunner.run_number }}</p>
              </div>
              <div class="ml-auto flex items-center gap-1.5">
                <span v-if="chatEmailSent"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">
                  <i class="fas fa-envelope-check text-[9px]"></i> Email Sent
                </span>
                <button type="button" @click="loadChat(selectedRunner)" title="Refresh messages"
                  class="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-gray-500 hover:text-emerald-700 flex items-center justify-center transition cursor-pointer">
                  <i :class="['fas text-[10px]', isChatLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
                </button>
              </div>
            </div>

            <!-- Message thread -->
            <div ref="chatMessagesContainer" class="flex-1 overflow-y-auto max-h-72 space-y-2.5 pr-1 custom-scrollbar">
              <!-- Empty state -->
              <div v-if="!isChatLoading && !chatMessages.length"
                class="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <i class="fas fa-comment-slash text-3xl mb-2 opacity-30"></i>
                <p class="text-xs">No messages yet</p>
              </div>

              <!-- Loading -->
              <div v-if="isChatLoading" class="flex items-center justify-center py-6">
                <i class="fas fa-spinner fa-spin text-emerald-500 text-lg"></i>
              </div>

              <!-- Messages -->
              <div v-for="msg in chatMessages" :key="msg.message_id || msg.timestamp" :class="[
                'flex',
                msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
              ]">
                <div :class="[
                  'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm',
                  msg.sender_type === 'admin'
                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm'
                ]">
                  <p class="font-semibold text-[10px] mb-0.5 opacity-80">{{ msg.sender }}</p>
                  <p v-if="msg.message" class="whitespace-pre-wrap break-words">{{ msg.message }}</p>
                  <!-- Attachment -->
                  <div v-if="msg.attachment_url" class="mt-1.5">
                    <a v-if="isPdfAttachment(msg.attachment_url)" :href="cleanURL(msg.attachment_url)" target="_blank"
                      :class="['flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold transition', msg.sender_type === 'admin' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200']">
                      <i class="fas fa-file-pdf"></i>
                      <span class="truncate max-w-[140px]">{{ msg.attachment_name || 'View PDF' }}</span>
                      <i class="fas fa-external-link-alt text-[9px] opacity-60 ml-auto"></i>
                    </a>
                    <a v-else :href="getCleanUrl(msg.attachment_url)" target="_blank" class="block">
                      <img :src="getCleanUrl(msg.attachment_url)" :alt="msg.attachment_name || 'Image'" @load="scrollChatToBottom"
                        class="mt-1 max-w-[180px] max-h-[160px] rounded-xl object-cover border border-white/20 shadow-sm cursor-pointer hover:opacity-90 transition" />
                    </a>
                  </div>
                  <p class="text-[9px] mt-1 opacity-60 text-right">{{ msg.timestamp }}</p>
                </div>
              </div>
            </div>

            <!-- Reply input -->
            <div class="mt-3 pt-3 border-t dark:border-gray-700">
              <p class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
                <i class="fas fa-pencil-alt"></i> Send Follow-up Message
                <span class="ml-auto font-normal text-gray-400 flex items-center gap-1">
                  <i class="fas fa-envelope text-[9px]"></i> Email will be sent to runner
                </span>
              </p>

              <!-- Attachment Preview -->
              <div v-if="chatAttachment"
                class="mb-2 flex items-center gap-2 p-2 rounded-xl border bg-slate-50 dark:bg-gray-800/60 border-emerald-200 dark:border-emerald-800">
                <img v-if="chatAttachment.previewUrl" :src="chatAttachment.previewUrl"
                  class="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0" alt="preview" />
                <div v-else
                  class="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
                  <i class="fas fa-file-pdf text-base"></i>
                </div>
                <span class="flex-1 text-[10px] text-gray-600 dark:text-gray-300 truncate">{{ chatAttachment.name
                  }}</span>
                <button type="button" @click="removeChatAttachment"
                  class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition cursor-pointer">
                  <i class="fas fa-times text-[9px]"></i>
                </button>
              </div>

              <textarea v-model="chatInput" :disabled="isSendingChat" @keydown.enter.ctrl="sendAdminMessage" rows="3"
                placeholder="Type your follow-up remarks here..." :class="[
                  'w-full rounded-xl border text-xs px-3 py-2 resize-none focus:ring-2 focus:ring-emerald-400 focus:outline-none transition',
                  props.darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                ]"></textarea>
              <div class="mt-2 flex items-center gap-2">
                <!-- Paperclip / Attach file -->
                <label :class="[
                  'flex items-center justify-center w-9 h-9 rounded-xl border cursor-pointer transition shrink-0',
                  chatAttachment
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-300 hover:text-emerald-600'
                ]" title="Attach image or PDF (max 5 MB)">
                  <i class="fas fa-paperclip text-sm"></i>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" class="hidden"
                    @change="handleChatAttachmentChange" :disabled="isSendingChat" />
                </label>
                <button type="button" @click="sendAdminMessage"
                  :disabled="isSendingChat || (!chatInput.trim() && !chatAttachment)"
                  class="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Send message and notify the runner by email">
                  <i :class="['fas', isSendingChat ? 'fa-spinner fa-spin' : 'fa-paper-plane']"></i>
                  <span>{{ isSendingChat ? 'Sending...' : 'Send Message' }}</span>
                  <span v-if="!isSendingChat" class="ml-1 opacity-70 flex items-center gap-0.5"><i
                      class="fas fa-envelope text-[9px]"></i></span>
                </button>
              </div>
            </div>
          </div><!-- /chat panel -->

        </div><!-- /lg:flex -->
        <!-- Action / Status Management -->
        <div class="pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-medium">Status:</span>
            <span
              :class="['px-2.5 py-0.5 rounded-lg border font-bold text-xs', getStatusBadge(selectedRunner.payment_status)]">
              {{ selectedRunner.payment_status }}
            </span>
            <span class="px-5 py-1 rounded-lg border font-bold text-xs bg-blue-600 text-white">
              <i class="fa fa-credit-card mr-2" aria-hidden="true"></i>
              {{ selectedRunner.payment_type.replaceAll('_', ' ').toUpperCase() }}
            </span>
            <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium ml-1">
              <i class="fas fa-shield-alt text-emerald-600 mr-1"></i> No Refund Policy
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <!-- Save Changes button (edit mode) -->
            <button v-if="isEditMode" type="button" @click="saveEdit" :disabled="isSaving"
              class="flex-1 sm:flex-none px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
              <i v-if="!isSaving" class="fas fa-save"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
            </button>

            <!-- Confirm Payment button (view mode) -->
            <template v-if="!isEditMode">
              <button v-if="selectedRunner.payment_status !== 'Confirmed'" type="button"
                @click="promptConfirmPayment(selectedRunner)" :disabled="isConfirming"
                class="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
                <i v-if="!isConfirming" class="fas fa-check"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span>{{ isConfirming ? 'Processing...' : 'Approve / Confirm Payment' }}</span>
              </button>
              <span v-else class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <i class="fas fa-check-circle"></i> Registration Confirmed
              </span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- BULK-DELETE CONFIRMATION MODAL ──────────────────────────────── -->
    <div v-if="bulkDeleteModal.show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="closeBulkDeleteModal">
      <div :class="[
        'w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Red accent bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-trash-alt"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">Delete {{ selectedIds.length }} Registration{{
            selectedIds.length
            !== 1 ? 's' : '' }}?</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            This action is <strong class="text-rose-600">permanent</strong> and cannot be undone.
            All selected runner records will be removed from the system.
          </p>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeBulkDeleteModal" :disabled="isBulkDeleting"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeBulkDelete" :disabled="isBulkDeleting"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
            <i v-if="!isBulkDeleting" class="fas fa-trash"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isBulkDeleting ? 'Deleting...' : 'Yes, Delete All' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE RECEIPT CONFIRMATION MODAL -->
    <div v-if="deleteReceiptModal.show && deleteReceiptModal.runner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeDeleteReceiptModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-trash"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">Delete Receipt?</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Remove the uploaded payment receipt for
            <strong class="text-rose-600 dark:text-rose-400">{{ deleteReceiptModal.runner.firstname }} {{
              deleteReceiptModal.runner.lastname }}</strong>?
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
            This will clear the <strong>proof of payment</strong> on record. The runner's payment status will remain
            unchanged. You can upload a new receipt at any time.
          </p>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeDeleteReceiptModal" :disabled="isDeletingReceipt"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeDeleteReceipt" :disabled="isDeletingReceipt"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
            <i v-if="!isDeletingReceipt" class="fas fa-trash"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isDeletingReceipt ? 'Deleting...' : 'Yes, Delete Receipt' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ADMIN CONFIRMATION DIALOG MODAL (REPLACES BROWSER CONFIRM) -->
    <div v-if="confirmModal.show && confirmModal.runner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeConfirmModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-envelope-circle-check"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            Confirm Payment?
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Confirm payment for <strong class="text-emerald-600 dark:text-emerald-400">{{ confirmModal.runner.firstname
              }}
              {{ confirmModal.runner.lastname }}</strong>?
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
            An official confirmation email will be sent to <strong>{{ confirmModal.runner.contact_email ||
              confirmModal.runner.email }}</strong> with BCC to <strong>animorun@lsu.edu.ph</strong>,
            <strong>calendar@lsu.edu.ph</strong>, and <strong>vpal@lsu.edu.ph</strong>.
          </p>
        </div>



        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeConfirmModal" :disabled="isConfirming"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeConfirmPayment" :disabled="isConfirming"
            class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5">
            <i v-if="!isConfirming" class="fas fa-check"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isConfirming ? 'Sending Email...' : 'Yes, Confirm & Send' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION MODAL (REPLACES BROWSER ALERT) -->
    <div v-if="toastModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeNotice">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div :class="[
          'absolute top-0 left-0 right-0 h-1.5',
          toastModal.type === 'error'
            ? 'bg-rose-500'
            : toastModal.type === 'success'
              ? 'bg-emerald-500'
              : 'bg-amber-500'
        ]"></div>

        <div :class="[
          'w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-sm mt-2',
          toastModal.type === 'error'
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
            : toastModal.type === 'success'
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
        ]">
          <i :class="[
            toastModal.type === 'error'
              ? 'fas fa-exclamation-circle'
              : toastModal.type === 'success'
                ? 'fas fa-check-circle'
                : 'fas fa-info-circle'
          ]"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            {{ toastModal.title }}
          </h3>
          <!-- <p class="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line px-2">
            {{ toastModal.message }} 
          </p> -->
        </div>

        <div class="pt-2">
          <button type="button" @click="closeNotice" :class="[
            'w-full py-3 px-5 rounded-2xl font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-white',
            toastModal.type === 'error'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          ]">
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>

    <!-- PAYMENT RECEIPT & IMAGE PREVIEW MODAL -->
    <div v-if="receiptModal.show && receiptModal.url"
      class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
      @click.self="closeReceiptModal">
      <div :class="[
        'relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-all',
        props.darkMode ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Header -->
        <div class="px-5 py-3.5 border-b flex items-center justify-between dark:border-gray-800 shrink-0">
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-sm shadow-xs">
              <i class="fas fa-receipt"></i>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-black tracking-tight leading-tight">
                {{ receiptModal.title }}
              </h3>
              <p v-if="receiptModal.runner" class="text-[11px] text-gray-500 dark:text-gray-400">
                Runner: <span class="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{{
                  receiptModal.runner.firstname }} {{ receiptModal.runner.lastname }}</span>
                <span v-if="receiptModal.runner.run_number || receiptModal.runner.bib_number"> • {{
                  receiptModal.runner.run_number || receiptModal.runner.bib_number }}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- <a :href="receiptModal.url" target="_blank" title="Open full image in new tab if needed"
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-emerald-600 transition flex items-center justify-center text-xs cursor-pointer">
              <i class="fas fa-external-link-alt"></i>
            </a> -->
            <button type="button" @click="closeReceiptModal"
              class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-rose-500 hover:text-white text-gray-600 dark:text-gray-300 transition flex items-center justify-center text-xs font-bold cursor-pointer">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Document / Image Content Area -->
        <div
          class="p-3 sm:p-5 overflow-auto flex-1 flex items-center justify-center bg-slate-900/5 dark:bg-black/50 min-h-[260px]">
          <iframe v-if="isPdfUrl(receiptModal.url)" :src="receiptModal.url"
            class="w-full h-[66vh] rounded-xl border border-gray-200 dark:border-gray-800" />
          <img v-else :src="receiptModal.url" :alt="receiptModal.title"
            class="max-h-[66vh] max-w-full w-auto object-contain rounded-xl border shadow-md border-gray-200 dark:border-gray-800 select-none" />
        </div>

        <!-- Footer -->
        <div
          class="px-5 py-3 border-t dark:border-gray-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-gray-900/50 shrink-0">
          <div class="text-[11px] text-gray-500 dark:text-gray-400">
            <span
              v-if="receiptModal.runner && (receiptModal.runner.grand_total_payment || receiptModal.runner.grand_total)">
              Amount Due: <strong class="text-emerald-600 dark:text-emerald-400 font-bold">₱{{
                Number(receiptModal.runner.grand_total_payment || receiptModal.runner.grand_total || 0).toLocaleString()
                }}</strong>
            </span>
          </div>
          <button type="button" @click="closeReceiptModal"
            class="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- ── FINALIZE SUPPLIER BATCH MODAL ─────────────────────────────── -->
    <div v-if="batchFinalizeModal.show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto"
      @click.self="closeBatchFinalizeModal">
      <div :class="[
        'relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all space-y-5 overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Gold Accent Bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600">
        </div>

        <div class="flex items-center justify-between border-b pb-3 dark:border-gray-700">
          <div class="flex items-center gap-2.5">
            <div
              class="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold shadow-sm">
              <i class="fas fa-layer-group"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight">Finalize Supplier Batch Order</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Lock orders for production, generate CSV &amp;
                dispatch
                email notifications</p>
            </div>
          </div>
          <button type="button" @click="closeBatchFinalizeModal"
            class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold text-xs cursor-pointer">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Selection Scope radio options -->
          <div class="space-y-5">



            <!-- Batch Details -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <!-- Batch Name -->
              <div>
                <label class="font-bold text-gray-500 uppercase text-[10px] block mb-1">
                  Batch Group Name <span class="text-red-500">*</span>
                </label>

                <input v-model="batchFinalizeModal.batchName" :class="inputCls" class="w-full"
                  placeholder="e.g. Batch 1, Batch 2" />
              </div>

              <!-- Locked By -->
              <div>
                <label class="font-bold text-gray-500 uppercase text-[10px] block mb-1">
                  Finalized &amp; Locked By
                </label>

                <input v-model="batchFinalizeModal.lockedBy" :class="inputCls"
                  class="w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed" placeholder="Operator Email"
                  disabled />
              </div>

            </div>

          </div>

          <!-- Live Breakdown Summary Box -->
          <div :class="[
            'p-4 rounded-2xl border space-y-3',
            props.darkMode ? 'bg-gray-900/70 border-gray-700' : 'bg-slate-50 border-slate-200'
          ]">
            <div class="flex items-center justify-between border-b pb-2 dark:border-gray-700">
              <span class="font-bold text-gray-700 dark:text-gray-300 uppercase text-[11px]">
                <i class="fas fa-chart-pie text-emerald-600 mr-1"></i> Live Supplier Breakdown Preview
              </span>
              <span class="font-black text-sm text-emerald-600 dark:text-emerald-400">
                {{ batchBreakdown.count }} Runners | ₱{{ batchBreakdown.totalAmount.toLocaleString() }}
              </span>
            </div>

            <!-- Categories breakdown -->
            <div>
              <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Distance Categories:</span>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(cnt, cat) in batchBreakdown.categories" :key="cat" :class="[
                  runCategories.find(c => c.id === cat || c.name === cat)?.color || 'bg-gray-700 text-white',
                  'px-2.5 py-1 rounded-xl font-bold text-[11px] border border-white/20'
                ]">
                  {{ cat }}: <strong>{{ cnt }}</strong>
                </span>
              </div>
            </div>

            <!-- T-Shirt sizes breakdown -->


            <!-- Pet Bandana sizes breakdown (if any) -->
            <div v-if="Object.keys(batchBreakdown.bandanas).length > 0">
              <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pet Bandana (Standard):</span>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(cnt, bsz) in batchBreakdown.bandanas" :key="bsz"
                  class="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                  {{ bsz }}: <strong>{{ cnt }}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- CSV Column Picker for Supplier Batch Export -->
          <div :class="[
            'p-3 rounded-2xl border space-y-2.5',
            props.darkMode ? 'bg-gray-900/70 border-gray-700' : 'bg-slate-50 border-slate-200'
          ]">
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-600 dark:text-gray-300 uppercase text-[10px] flex items-center gap-1.5">
                <i class="fas fa-table-columns text-emerald-500"></i>
                CSV Columns to Export
              </span>
              <label class="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold">
                <input type="checkbox" :checked="allCsvColumnsSelected"
                  @change="e => toggleAllCsvColumns(e.target.checked)"
                  class="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer" />
                <span class="text-gray-500 dark:text-gray-400">Select All ({{ CSV_ALL_COLUMNS.length }})</span>
                <span class="text-amber-600 dark:text-amber-400 font-black">{{ selectedCsvColumns.length }}
                  selected</span>
              </label>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-1">
              <label v-for="col in CSV_ALL_COLUMNS" :key="col.key" :class="[
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition text-[11px]',
                selectedCsvColumns.includes(col.key)
                  ? (props.darkMode ? 'bg-amber-900/30 border-amber-600 text-amber-300' : 'bg-amber-50 border-amber-400 text-amber-800')
                  : (props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500' : 'bg-white border-slate-200 text-gray-600 hover:border-amber-300')
              ]">
                <input type="checkbox" :value="col.key" v-model="selectedCsvColumns"
                  class="w-3 h-3 rounded accent-amber-500 cursor-pointer shrink-0" />
                <span class="font-medium leading-tight truncate">{{ col.label }}</span>
              </label>
            </div>
          </div>

          <!-- Strict Policy Warning -->
          <div
            class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-[11px] space-y-1">
            <p class="font-bold flex items-center gap-1.5">
              <i class="fas fa-exclamation-triangle text-rose-600"></i> Closed for Orders Supplier Policy:
            </p>
            <p class="leading-relaxed text-[10px]">
              Once finalized, these {{ batchBreakdown.count }} orders will be assigned to <strong>{{
                batchFinalizeModal.batchName }}</strong> and locked.
              Strictly <strong>NO RETURN POLICY / NO UPGRADE / NO DOWNGRADE</strong> permitted. Superadmin bypass is
              required to modify.
            </p>
          </div>


        </div>

        <div class="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
          <button type="button" @click="closeBatchFinalizeModal" :disabled="isFinalizingBatch"
            class="py-2.5 px-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="downloadBatchCsvPreview"
            :disabled="isFinalizingBatch || batchBreakdown.count === 0 || selectedCsvColumns.length === 0"
            class="py-2.5 px-3.5 rounded-xl border border-emerald-500/50 hover:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
            <i class="fas fa-file-csv"></i>
            <span>Export CSV Only</span>
          </button>
          <button type="button" @click="executeFinalizeBatch"
            :disabled="isFinalizingBatch || batchBreakdown.count === 0 || selectedCsvColumns.length === 0"
            class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
            <i v-if="!isFinalizingBatch" class="fas fa-lock"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isFinalizingBatch ? 'Finalizing &amp; Sending...' : `Finalize, Lock &amp; Email CSV
              (${selectedCsvColumns.length} cols)` }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── SUPPLIER BATCHES HISTORY MODAL ─────────────────────────────── -->
    <div v-if="batchHistoryModal.show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm overflow-y-auto"
      @click.self="closeBatchHistoryModal">
      <div :class="[
        'relative w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all space-y-4 max-h-[92vh] overflow-y-auto',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="flex items-center justify-between border-b pb-3 dark:border-gray-700">
          <div class="flex items-center gap-2.5">
            <div
              class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shadow-sm">
              <i class="fas fa-boxes"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight">Supplier Batches &amp; Fulfillment History</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">View finalized batch breakdowns, re-download CSVs, or
                Superadmin unlock</p>
            </div>
          </div>
          <button type="button" @click="closeBatchHistoryModal"
            class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold text-xs cursor-pointer">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="isFetchingBatches" class="p-8 text-center animate-pulse">
          <i class="fas fa-spinner fa-spin text-2xl text-emerald-500 mb-2"></i>
          <p class="text-xs text-gray-500">Loading batch records...</p>
        </div>

        <div v-else-if="batchesList.length > 0" class="space-y-3 text-xs">
          <div v-for="b in batchesList" :key="b.id" :class="[
            'p-4 rounded-2xl border transition-all space-y-3',
            props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-slate-50 border-slate-200'
          ]">
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 rounded-xl bg-amber-500 text-white font-black text-xs uppercase shadow-xs">
                  {{ b.batch_name }}
                </span>
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1',
                  b.is_locked ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300' : 'bg-slate-100 text-gray-700 border-gray-300'
                ]">
                  <i :class="['fas', b.is_locked ? 'fa-lock' : 'fa-unlock']"></i>
                  {{ b.is_locked ? 'LOCKED (Closed for Orders)' : 'UNLOCKED (Bypass)' }}
                </span>
              </div>

              <div class="flex items-center gap-2">

                <!-- Superadmin Toggle Lock -->
                <button type="button" @click="openUnlockPrompt(b, 'batch')"
                  class="px-3 py-1.5 rounded-xl border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 font-bold text-xs transition flex items-center gap-1 cursor-pointer">
                  <i :class="['fas', b.is_locked ? 'fa-unlock' : 'fa-lock']"></i>
                  <span>{{ b.is_locked ? 'Superadmin Unlock' : 'Lock Batch' }}</span>
                </button>
              </div>
            </div>

            <!-- Info stats -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-gray-600 dark:text-gray-300 pt-1">
              <div><strong>Runners:</strong> {{ b.total_runners }} participants</div>
              <div><strong>Total Amount:</strong> ₱{{ b.total_amount }}</div>
              <div><strong>Finalized By:</strong> {{ b.created_by || b.locked_by || 'Admin' }}</div>
              <div><strong>Date:</strong> {{ b.created_at_formatted || b.created_at }}</div>
            </div>


          </div>
        </div>

        <div v-else class="p-8 text-center text-gray-500">
          <i class="fas fa-boxes text-3xl mb-2 text-gray-400 block"></i>
          <p class="text-xs">No supplier batch orders have been finalized yet.</p>
        </div>

        <div class="pt-2 border-t dark:border-gray-700 text-right">
          <button type="button" @click="closeBatchHistoryModal"
            class="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold text-xs transition cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- ── SUPERADMIN BYPASS UNLOCK PROMPT MODAL ───────────────────────── -->
    <div v-if="unlockPromptModal.show && unlockPromptModal.target"
      class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="closeUnlockPrompt">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-purple-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i
            :class="['fas', unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked ? 'fa-unlock' : 'fa-lock']"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            {{ (unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked) ? 'Superadmin Bypass: Unlock Order?' : 'Lock Order for Supplier?' }}
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            <span v-if="unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked">
              This order is locked under <strong class="text-purple-600 dark:text-purple-400">{{ unlockPromptModal.target.batch_name }}</strong>.
              Unlocking allows emergency modifications to t-shirt size, bib, or category specifications.
            </span>
            <span v-else>
              Locking this order enforces supplier production lock (No return / No upgrade / No downgrade).
            </span>
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Operator logging action: <strong>{{ currentOperator }}</strong>
          </p>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeUnlockPrompt" :disabled="isTogglingLock"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeToggleLock" :disabled="isTogglingLock"
            class="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
            <i v-if="!isTogglingLock"
              :class="['fas', unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked ? 'fa-unlock' : 'fa-lock']"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isTogglingLock ? 'Updating...' : ((unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked) ? 'Yes, Bypass & Unlock' : 'Yes, Lock Order') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ── COLUMN PICKER MODAL (FOLLOW LIVE TABLE & CSV) ────────────────── -->
    <div v-if="isColumnPickerModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div :class="[
        'relative max-w-2xl w-full rounded-3xl shadow-2xl border p-4 sm:p-6 space-y-4 transition',
        props.darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="flex items-center justify-between border-b pb-3 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
              <i class="fas fa-table-columns"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-sm sm:text-base">Customize Table Columns</h3>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">Select which columns display on the table &amp;
                export
                in CSV</p>
            </div>
          </div>
          <button type="button" @click="isColumnPickerModalOpen = false"
            class="w-7 h-7 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {{ selectedCsvColumns.length }} of {{ CSV_ALL_COLUMNS.length }} columns visible
          </span>
          <div class="flex items-center gap-2 text-xs">
            <button type="button" @click="toggleAllCsvColumns(true)"
              class="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
              Select All
            </button>
            <span class="text-gray-300">|</span>
            <button type="button" @click="toggleAllCsvColumns(false)"
              class="text-rose-500 hover:underline font-semibold cursor-pointer">
              Deselect All
            </button>
            <span class="text-gray-300">|</span>
            <button type="button" @click="resetToDefaultColumns"
              class="text-gray-500 hover:underline font-semibold cursor-pointer">
              Reset Default
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[60vh] overflow-y-auto p-1">
          <label v-for="col in CSV_ALL_COLUMNS" :key="col.key" :class="[
            'flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer transition text-xs select-none',
            selectedCsvColumns.includes(col.key)
              ? (props.darkMode ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300' : 'bg-emerald-50 border-emerald-400 text-emerald-800')
              : (props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-white border-slate-200 text-gray-600 hover:border-emerald-300')
          ]">
            <input type="checkbox" :value="col.key" v-model="selectedCsvColumns"
              class="w-3.5 h-3.5 rounded accent-emerald-600 cursor-pointer shrink-0" />
            <span class="font-medium truncate">{{ col.label }}</span>
          </label>
        </div>

        <div class="flex justify-end pt-3 border-t dark:border-gray-700">
          <button type="button" @click="isColumnPickerModalOpen = false"
            class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition cursor-pointer">
            Done &amp; Apply
          </button>
        </div>
      </div>
    </div>

    <!-- ── CHAT COMMUNICATION HISTORY MODAL (FAST TRACKING FOR ADMINS) ──────── -->
    <div v-if="isChatModalOpen && chatModalRunner"
      class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      @click.self="closeChatModal">
      <div :class="[
        'relative w-full max-w-3xl rounded-3xl shadow-2xl border transition-all flex flex-col max-h-[92vh] overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b dark:border-gray-700 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-gray-900/50">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs uppercase shadow-xs">
                {{ chatModalRunner.run_number || chatModalRunner.bib_number || ('AR-' + chatModalRunner.id) }}
              </span>
              <h2 class="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-gray-100">
                {{ chatModalRunner.firstname }} {{ chatModalRunner.lastname }}
              </h2>
              <span :class="[
                'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                getStatusBadge(chatModalRunner.payment_status)
              ]">
                {{ chatModalRunner.payment_status }}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {{ chatModalRunner.run_category }}
              </span>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
              <span class="flex items-center gap-1">
                <i class="fas fa-envelope text-[11px] text-emerald-600"></i>
                {{ chatModalRunner.contact_email || chatModalRunner.email || 'No email' }}
              </span>
              <span v-if="chatModalRunner.contact_number" class="flex items-center gap-1">
                <i class="fas fa-phone text-[11px] text-emerald-600"></i>
                {{ chatModalRunner.contact_number }}
              </span>
              <span class="text-[11px] opacity-70">
                Registered: {{ chatModalRunner.created_at_formatted || 'N/A' }}
              </span>
            </div>
          </div>

          <!-- Header Action Buttons -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Open Full Details Profile button -->
            <button type="button" @click="closeChatModal(); openDetails(chatModalRunner)"
              class="hidden sm:inline-flex px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 text-gray-600 dark:text-gray-300 font-bold text-xs transition items-center gap-1.5 cursor-pointer"
              title="View full registration profile">
              <i class="fas fa-external-link-alt text-[10px]"></i> Full Profile
            </button>
            <!-- Reload chat -->
            <button type="button" @click="loadChat(chatModalRunner)"
              class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-gray-600 dark:text-gray-300 hover:text-emerald-700 flex items-center justify-center transition cursor-pointer"
              title="Refresh conversation">
              <i :class="['fas text-xs', isChatLoading ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i>
            </button>
            <!-- Close modal -->
            <button type="button" @click="closeChatModal"
              class="w-8 h-8 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer font-bold">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Notification Banner / Information Strip -->
        <div class="px-4 py-2 bg-emerald-50/80 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between gap-2 text-[11px]">
          <div class="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
            <i class="fas fa-info-circle text-emerald-600 dark:text-emerald-400"></i>
            <span>Admin communication messages automatically notify the runner via email at <strong>{{ chatModalRunner.contact_email || 'their registered email' }}</strong>.</span>
          </div>
          <span v-if="chatEmailSent" class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] shrink-0 flex items-center gap-1">
            <i class="fas fa-check"></i> Email Dispatched
          </span>
        </div>

        <!-- Quick Reply Suggestions / Templates -->
        <div class="px-4 py-2 border-b dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/30 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase shrink-0">
            <i class="fas fa-bolt text-amber-400 mr-0.5"></i> Quick Reply:
          </span>
          <button type="button" @click="applyChatTemplate('Please upload a clearer copy or official screenshot of your payment receipt.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            Receipt Clarification
          </button>
          <button type="button" @click="applyChatTemplate('Payment verified! Your registration for The Emerald Run is officially confirmed.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            Payment Confirmed
          </button>
          <button type="button" @click="applyChatTemplate('Please confirm your preferred event t-shirt size so we can reserve your kit.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            T-Shirt Size
          </button>
          <button type="button" @click="applyChatTemplate('Please provide your valid LSU ID number for discount verification.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            LSU ID Query
          </button>
        </div>

        <!-- Chat Message Thread / History Stream -->
        <div ref="quickChatMessagesContainer"
          class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar min-h-[260px] max-h-[420px] bg-white dark:bg-gray-800/80">
          
          <!-- Loading State -->
          <div v-if="isChatLoading" class="flex flex-col items-center justify-center py-12 text-gray-400">
            <i class="fas fa-spinner fa-spin text-emerald-500 text-2xl mb-2"></i>
            <p class="text-xs">Loading conversation history...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!chatMessages.length" class="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xl mb-2">
              <i class="far fa-comments"></i>
            </div>
            <p class="text-sm font-bold text-gray-600 dark:text-gray-300">No messages exchanged yet</p>
            <p class="text-xs text-gray-400 max-w-sm mt-1">
              Start the conversation by sending a follow-up remark or inquiry response to {{ chatModalRunner.firstname }} below.
            </p>
          </div>

          <!-- Message Bubbles -->
          <div v-for="msg in chatMessages" :key="msg.message_id || msg.timestamp" :class="[
            'flex items-end gap-2',
            msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'
          ]">
            <!-- Runner Avatar / Icon on Left -->
            <div v-if="msg.sender_type !== 'admin'"
              class="w-7 h-7 rounded-full bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300 flex items-center justify-center text-[10px] font-bold shrink-0">
              <i class="fas fa-user text-[10px]"></i>
            </div>

            <!-- Message Card -->
            <div :class="[
              'max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 text-xs shadow-sm transition',
              msg.sender_type === 'admin'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-xs'
                : 'bg-slate-100 dark:bg-gray-700/80 text-gray-800 dark:text-gray-100 rounded-bl-xs border border-slate-200/80 dark:border-gray-600/60'
            ]">
              <!-- Sender Header -->
              <div class="flex items-center justify-between gap-2 mb-1">
                <span :class="[
                  'font-bold text-[10px] uppercase tracking-wide flex items-center gap-1',
                  msg.sender_type === 'admin' ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'
                ]">
                  <i :class="['fas text-[9px]', msg.sender_type === 'admin' ? 'fa-shield-alt' : 'fa-comment']"></i>
                  {{ msg.sender_type === 'admin' ? (msg.sender || 'Admin') : (msg.sender || chatModalRunner.firstname || 'Runner') }}
                </span>
                <span :class="['text-[9px]', msg.sender_type === 'admin' ? 'text-emerald-200/80' : 'text-gray-400']">
                  {{ msg.timestamp }}
                </span>
              </div>

              <!-- Message Body -->
              <p v-if="msg.message" class="whitespace-pre-wrap break-words leading-relaxed text-xs">
                {{ msg.message }}
              </p>

              <!-- Attachment Preview (Image or PDF) -->
              <div v-if="msg.attachment_url" class="mt-2 pt-2 border-t"
                :class="msg.sender_type === 'admin' ? 'border-white/20' : 'border-gray-200 dark:border-gray-600'">
                <!-- PDF Attachment -->
                <a v-if="isPdfAttachment(msg.attachment_url)" :href="cleanURL(msg.attachment_url)" target="_blank"
                  :class="[
                    'flex items-center gap-2 p-2 rounded-xl text-[11px] font-bold transition',
                    msg.sender_type === 'admin'
                      ? 'bg-white/20 hover:bg-white/30 text-white'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 border border-slate-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                  ]">
                  <i class="fas fa-file-pdf text-rose-500 text-base"></i>
                  <span class="truncate flex-1">{{ msg.attachment_name || 'Document.pdf' }}</span>
                  <i class="fas fa-arrow-down text-[10px] opacity-70"></i>
                </a>

                <!-- Image Attachment -->
                <div v-else class="space-y-1">
                  <a :href="getCleanUrl(msg.attachment_url)" target="_blank" class="block group relative overflow-hidden rounded-xl">
                    <img :src="getCleanUrl(msg.attachment_url)" :alt="msg.attachment_name || 'Attached Image'"
                      class="max-w-[220px] max-h-[180px] rounded-xl object-cover border border-white/20 shadow-sm cursor-pointer group-hover:scale-105 transition-transform" />
                  </a>
                  <p class="text-[9px] opacity-70 truncate">{{ msg.attachment_name || 'Attachment' }}</p>
                </div>
              </div>
            </div>

            <!-- Admin Avatar on Right -->
            <div v-if="msg.sender_type === 'admin'"
              class="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
              <i class="fas fa-user-shield text-[10px]"></i>
            </div>
          </div>
        </div>

        <!-- Reply Composer Area -->
        <div class="p-3 sm:p-4 border-t dark:border-gray-700 bg-slate-50/80 dark:bg-gray-900/50 space-y-2">
          <!-- Pending Attachment Preview Chip -->
          <div v-if="chatAttachment"
            class="flex items-center gap-2 p-2 rounded-xl border bg-white dark:bg-gray-800 border-emerald-300 dark:border-emerald-700 shadow-2xs">
            <img v-if="chatAttachment.previewUrl" :src="chatAttachment.previewUrl"
              class="w-9 h-9 rounded-lg object-cover border border-emerald-200 shrink-0" alt="preview" />
            <div v-else
              class="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
              <i class="fas fa-file-pdf text-base"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ chatAttachment.name }}</p>
              <p class="text-[9px] text-gray-400">Ready to attach with message</p>
            </div>
            <button type="button" @click="removeChatAttachment"
              class="w-6 h-6 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-gray-700 text-gray-500 flex items-center justify-center transition cursor-pointer">
              <i class="fas fa-times text-[10px]"></i>
            </button>
          </div>

          <!-- Text Input Row -->
          <div class="flex items-end gap-2">
            <!-- Paperclip / Attach File -->
            <label :class="[
              'w-10 h-10 rounded-2xl border flex items-center justify-center cursor-pointer transition shrink-0',
              chatAttachment
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 border-emerald-300'
                : 'bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-gray-700 text-gray-500 hover:text-emerald-600 border-gray-300 dark:border-gray-700'
            ]" title="Attach image (PNG, JPG) or PDF document (max 5 MB)">
              <i class="fas fa-paperclip text-sm"></i>
              <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" class="hidden"
                @change="handleChatAttachmentChange" :disabled="isSendingChat" />
            </label>

            <!-- Textarea -->
            <div class="flex-1 relative">
              <textarea v-model="chatInput" :disabled="isSendingChat" @keydown.enter.ctrl="sendAdminMessage" rows="2"
                placeholder="Type response or remarks to this runner... (Press Ctrl + Enter to send)"
                :class="[
                  'w-full px-3.5 py-2.5 rounded-2xl border text-xs resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none transition leading-relaxed',
                  props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                ]"></textarea>
            </div>

            <!-- Send Button -->
            <button type="button" @click="sendAdminMessage"
              :disabled="isSendingChat || (!chatInput.trim() && !chatAttachment)"
              class="px-4 py-2.5 h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
              title="Send reply and notify runner via email">
              <i :class="['fas', isSendingChat ? 'fa-spinner fa-spin' : 'fa-paper-plane']"></i>
              <span class="hidden sm:inline">{{ isSendingChat ? 'Sending...' : 'Send' }}</span>
            </button>
          </div>

          <!-- Bottom Footer Note -->
          <div class="flex items-center justify-between text-[10px] text-gray-400 px-1">
            <span>
              <i class="fas fa-keyboard mr-1 opacity-70"></i> <strong>Ctrl + Enter</strong> to send quickly
            </span>
            <span>
              Logged in as: <strong>{{ currentOperator }}</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>


</template>

<style scoped></style>
