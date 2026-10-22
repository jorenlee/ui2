<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import animoRunData from "~/animorun.json";

const COLLEGE_COURSE_OPTIONS = animoRunData?.COLLEGE_COURSE_OPTIONS || [];
const OFFICIAL_SHIRT_CONFIGS = animoRunData?.OFFICIAL_SHIRT_CONFIGS || [];
const FINISHER_SHIRT_CONFIG = animoRunData?.FINISHER_SHIRT_CONFIG || null;

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

const fastToast = ref({
  show: false,
  message: "",
  type: "success",
  timer: null,
});

const showFastToast = (message, type = "success", duration = 3500) => {
  if (fastToast.value.timer) {
    clearTimeout(fastToast.value.timer);
  }
  fastToast.value = {
    show: true,
    message,
    type,
    timer: setTimeout(() => {
      fastToast.value.show = false;
    }, duration),
  };
};

const searchQuery = ref("");
const selectedCategory = ref("All");
const selectedStatus = ref("All");
const selectedPaymentType = ref("All"); // "All", "add_to_tuition", "salary_deduction", "family_salary_deduction", "over_the_counter", "qr", "complimentary", "sponsor"
const selectedReceipt = ref("All"); // "All", "has_receipt", "without_receipt"
const selectedParticipantType = ref("All");
const selectedAgeGroup = ref("All");
const selectedAcademicUnit = ref("All"); // "All", "HEU", "BEU", "Grade School", "JHS", "SHS", or specific course
const selectedKitStatus = ref("All"); // "All", "claimed", "ready", "pending"

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

// Interactive Receipt Zoom & Pan state
const receiptZoom = ref(1);
const receiptRotation = ref(0);
const receiptPan = ref({ x: 0, y: 0 });
const isReceiptDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const resetReceiptView = () => {
  receiptZoom.value = 1;
  receiptRotation.value = 0;
  receiptPan.value = { x: 0, y: 0 };
  isReceiptDragging.value = false;
};

const zoomInReceipt = () => {
  receiptZoom.value = Math.min(Number((receiptZoom.value + 0.25).toFixed(2)), 4);
};

const zoomOutReceipt = () => {
  receiptZoom.value = Math.max(Number((receiptZoom.value - 0.25).toFixed(2)), 0.5);
};

const rotateReceipt = () => {
  receiptRotation.value = (receiptRotation.value + 90) % 360;
};

const toggleReceiptZoomFit = () => {
  if (receiptZoom.value === 1) {
    receiptZoom.value = 2;
  } else {
    resetReceiptView();
  }
};

const onReceiptWheel = (e) => {
  if (isPdfUrl(receiptModal.value?.url)) return;
  e.preventDefault();
  if (e.deltaY < 0) {
    zoomInReceipt();
  } else {
    zoomOutReceipt();
  }
};

const startReceiptDrag = (e) => {
  if (isPdfUrl(receiptModal.value?.url)) return;
  if (receiptZoom.value <= 1 && receiptRotation.value === 0) return;
  isReceiptDragging.value = true;
  dragStart.value = {
    x: e.clientX - receiptPan.value.x,
    y: e.clientY - receiptPan.value.y,
  };
};

const onReceiptDrag = (e) => {
  if (!isReceiptDragging.value) return;
  receiptPan.value = {
    x: e.clientX - dragStart.value.x,
    y: e.clientY - dragStart.value.y,
  };
};

const stopReceiptDrag = () => {
  isReceiptDragging.value = false;
};

const openReceiptModal = (url, title = "Payment Receipt", runner = null) => {
  if (!url) return;
  resetReceiptView();
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
  resetReceiptView();
};

// Strip everything after the file extension (removes query strings, tokens, extra params)
const cleanURL = (url, fallbackName = "") => {
  if (!url) return "";
  if (typeof url === "string" && (url.startsWith("data:") || url.startsWith("blob:"))) {
    return url;
  }
  let clean = String(url).trim().split(/[?#]/)[0];

  // Repair URL if it was previously truncated before the real file extension (e.g. file.PNG.jpg truncated to file.PNG)
  if (fallbackName && typeof fallbackName === "string") {
    const doubleExtMatch = fallbackName.match(/\.(?:png|jpe?g|pdf)\.(?:jpe?g|png|pdf)$/i);
    if (doubleExtMatch) {
      const lastExt = fallbackName.slice(fallbackName.lastIndexOf("."));
      if (!clean.toLowerCase().endsWith(lastExt.toLowerCase())) {
        clean += lastExt;
      }
    }
  }

  // Match greedily up to the last supported extension
  const match = clean.match(/^(.*\.(?:jpg|jpeg|png|gif|webp|bmp|svg|pdf|heic|heif))/i);
  return match ? match[1] : clean;
};

// Clean image URLs only until extension (.jpg, .jpeg, .png, etc.) removing query params/tokens
const getCleanUrl = (url, fallbackName = "") => {
  if (!url) return "";
  if (typeof url === "string" && (url.startsWith("data:") || url.startsWith("blob:"))) {
    return url;
  }
  let clean = cleanURL(url, fallbackName);
  const match = clean.match(/^(.*\.(?:jpe?g|png|webp|gif|heic|heif|bmp|svg))/i);
  return match ? match[1] : clean;
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
    if (norm) {
      counts[norm] = (counts[norm] || 0) + 1;
    }
  });
  return counts;
});

const formatPaymentType = (type) => {
  if (!type || type === "All") return "All";
  const map = {
    salary_deduction: "Salary Deduction",
    family_salary_deduction: "Family Salary Deduction",
    add_to_tuition: "Add to Tuition",
    over_the_counter: "Over the Counter",
    cash_payment: "Over the Counter / Cash",
    qr: "QR / GCash / Maya",
    complimentary: "Complimentary",
    sponsor: "Sponsor",
    non_lsu_payment: "Over the Counter / QR",
  };
  return map[type] || type.replaceAll("_", " ").toUpperCase();
};

const paymentMethodCounts = computed(() => {
  const counts = {
    add_to_tuition: 0,
    salary_deduction: 0,
    family_salary_deduction: 0,
    over_the_counter: 0,
    qr: 0,
    complimentary: 0,
    sponsor: 0,
  };
  registrations.value.forEach((r) => {
    const pt = String(r.payment_type || "").trim().toLowerCase();
    if (pt === "add_to_tuition" || pt.includes("tuition")) {
      counts.add_to_tuition++;
    } else if (pt === "family_salary_deduction") {
      counts.family_salary_deduction++;
    } else if (pt === "salary_deduction") {
      counts.salary_deduction++;
    } else if (pt === "over_the_counter" || pt === "cash_payment" || pt === "cash") {
      counts.over_the_counter++;
    } else if (pt === "qr" || pt.includes("gcash") || pt.includes("maya")) {
      counts.qr++;
    } else if (pt === "complimentary") {
      counts.complimentary++;
    } else if (pt === "sponsor") {
      counts.sponsor++;
    } else if (pt === "non_lsu_payment") {
      if (r.proof_of_payment) counts.qr++;
      else counts.over_the_counter++;
    }
  });
  return counts;
});

const receiptCounts = computed(() => {
  let hasReceipt = 0;
  let withoutReceipt = 0;
  registrations.value.forEach((r) => {
    if (r.proof_of_payment) {
      hasReceipt++;
    } else {
      withoutReceipt++;
    }
  });
  return { hasReceipt, withoutReceipt };
});

// ── Multi-Confirm State ─────────────────────────────────────────────────────
const selectedPendingRunners = computed(() => {
  return registrations.value.filter((r) => {
    if (!selectedIds.value.includes(r.id)) return false;
    const status = String(r.payment_status || "").trim().toLowerCase();
    return status !== "confirmed";
  });
});

// ── Bulk Confirm Modal & State ──────────────────────────────────────────────
const isBulkConfirming = ref(false);
const bulkConfirmModal = ref({ show: false });

const promptBulkConfirm = () => {
  if (!selectedIds.value.length || isBulkConfirming.value) {
    showFastToast("Please select at least one runner.", "info");
    return;
  }
  bulkConfirmModal.value.show = true;
};

const closeBulkConfirmModal = () => {
  bulkConfirmModal.value.show = false;
};

const executeBulkConfirm = async () => {
  // If there are unconfirmed runners selected, confirm them; otherwise if all selected are already confirmed, re-send to all selected runners!
  const runnersToConfirm = selectedPendingRunners.value.length > 0
    ? [...selectedPendingRunners.value]
    : registrations.value.filter((r) => selectedIds.value.includes(r.id));

  if (!runnersToConfirm.length || isBulkConfirming.value) return;

  const idsToConfirm = runnersToConfirm.map((r) => r.id);
  const operator = currentOperator.value || "Admin";
  const nowIso = new Date().toISOString();

  // 1. OPTIMISTIC UPDATE: instant visual confirmation
  runnersToConfirm.forEach((r) => {
    r.payment_status = "Confirmed";
    r.confirmed_at = nowIso;
    r.confirmed_by = operator;
    const inList = registrations.value.find((item) => item.id === r.id);
    if (inList) {
      inList.payment_status = "Confirmed";
      inList.confirmed_at = nowIso;
      inList.confirmed_by = operator;
    }
    if (selectedRunner.value && selectedRunner.value.id === r.id) {
      selectedRunner.value.payment_status = "Confirmed";
      selectedRunner.value.confirmed_at = nowIso;
      selectedRunner.value.confirmed_by = operator;
    }
  });

  const count = runnersToConfirm.length;
  closeBulkConfirmModal();
  clearSelection();
  showFastToast(`🎉 Successfully confirmed payment for ${count} runner(s)! Confirmation emails queued.`, "success", 4500);

  // 2. Perform backend API request
  isBulkConfirming.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/bulk-confirm/`, {
      method: "POST",
      body: {
        ids: idsToConfirm,
        confirmed_by: operator,
      },
    });
  } catch (err) {
    console.error("Bulk confirm error:", err);
    showNotice(
      "Bulk confirmation completed locally, but server encountered an issue. Please verify connection or server logs.",
      "Sync Notice",
      "warning"
    );
  } finally {
    isBulkConfirming.value = false;
  }
};

// ── Slot Capacity & Allocation Management ───────────────────────────────────
const slotData = ref({});
const slotDataLoaded = ref(false);
const isSlotModalOpen = ref(false);
const isSavingSlots = ref(false);
const slotEditValues = ref({});
const newCategoryCode = ref("");

// Helper: get total registered runners for a category including pending
const getSlotCategoryTotal = (catKey) => {
  const item = slotData.value?.[catKey];
  if (item) {
    if (item.total !== undefined && item.total !== null) {
      return Number(item.total) || 0;
    }
    const conf = Number(item.confirmed ?? item.filled) || 0;
    const pend = Number(item.pending) || 0;
    return conf + pend;
  }
  return categoryCounts.value?.[catKey] || 0;
};

// Helper: get confirmed registered count for a category
const getSlotCategoryConfirmed = (catKey) => {
  const item = slotData.value?.[catKey];
  if (item && item.confirmed !== undefined && item.confirmed !== null) {
    return Number(item.confirmed) || 0;
  }
  if (item && item.filled !== undefined && item.filled !== null && item.pending !== undefined) {
    return Number(item.filled) || 0;
  }
  return registrations.value.filter((r) => normalizeCategory(r.run_category) === catKey && r.payment_status === "Confirmed").length;
};

// Helper: get pending registered count for a category
const getSlotCategoryPending = (catKey) => {
  const item = slotData.value?.[catKey];
  if (item && item.pending !== undefined && item.pending !== null) {
    return Number(item.pending) || 0;
  }
  return registrations.value.filter((r) => {
    if (normalizeCategory(r.run_category) !== catKey) return false;
    const status = String(r.payment_status || "").trim().toLowerCase();
    return !status || status.startsWith("pending");
  }).length;
};

const totalSlotsAvailable = computed(() => {
  if (!slotData.value) return 0;
  return Object.values(slotData.value).reduce((sum, item) => sum + (Number(item?.max) || 0), 0);
});

// Total slots filled across all categories (confirmed + pending)
const totalSlotsFilled = computed(() => {
  if (slotData.value && Object.keys(slotData.value).length > 0) {
    return Object.values(slotData.value).reduce((sum, item) => {
      const catTotal = item?.total !== undefined && item?.total !== null
        ? Number(item.total)
        : ((Number(item?.confirmed ?? item?.filled) || 0) + (Number(item?.pending) || 0));
      return sum + (Number(catTotal) || 0);
    }, 0);
  }
  return registrations.value.length;
});

const totalSlotsConfirmed = computed(() => {
  if (slotData.value && Object.keys(slotData.value).length > 0) {
    return Object.values(slotData.value).reduce((sum, item) => {
      return sum + (Number(item?.confirmed ?? item?.filled) || 0);
    }, 0);
  }
  return registrations.value.filter((r) => r.payment_status === "Confirmed").length;
});

const totalSlotsPending = computed(() => {
  if (slotData.value && Object.keys(slotData.value).length > 0) {
    return Object.values(slotData.value).reduce((sum, item) => {
      return sum + (Number(item?.pending) || 0);
    }, 0);
  }
  return registrations.value.filter((r) => {
    const s = String(r.payment_status || "").trim().toLowerCase();
    return !s || s.startsWith("pending");
  }).length;
});

const modalTotalSlots = computed(() => {
  return Object.values(slotEditValues.value || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
});

const fetchSlotCounts = async () => {
  try {
    const rawUrl = endpoint.value || config?.public?.apiUrl;
    const url = String(rawUrl).replace(/\/+$/, '');
    const res = await $fetch(`${url}/api/animorun/slot-count/`);
    if (res && typeof res === "object") {
      slotData.value = res;
      slotDataLoaded.value = true;
    }
  } catch (err) {
    console.warn("[AnimoRunList] Failed to fetch slot counts:", err);
  }
};

const sortedSlotCategories = computed(() => {
  const standardOrder = ["1KM", "3KM", "10KM", "20KM"];
  return Object.keys(slotEditValues.value || {}).sort((a, b) => {
    const idxA = standardOrder.indexOf(a);
    const idxB = standardOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.localeCompare(b);
  });
});

const openSlotAdjustmentModal = () => {
  const standardCats = ["1KM", "3KM", "10KM", "20KM"];
  const initial = {};
  for (const cat of standardCats) {
    if (slotData.value && slotData.value[cat] !== undefined) {
      initial[cat] = slotData.value[cat]?.max ?? 1000;
    } else {
      initial[cat] = cat === "1KM" ? 50 : (cat === "10KM" ? 375 : (cat === "20KM" ? 300 : 1000));
    }
  }
  for (const [cat, data] of Object.entries(slotData.value || {})) {
    if (initial[cat] === undefined) {
      initial[cat] = data?.max ?? 1000;
    }
  }
  slotEditValues.value = initial;
  newCategoryCode.value = "";
  isSlotModalOpen.value = true;
};

const closeSlotAdjustmentModal = () => {
  if (isSavingSlots.value) return;
  isSlotModalOpen.value = false;
};

const adjustSlotBy = (catKey, delta) => {
  const current = Number(slotEditValues.value[catKey]) || 0;
  slotEditValues.value[catKey] = Math.max(0, current + delta);
};

const resetSlotDefaults = () => {
  slotEditValues.value = {
    "1KM": 50,
    "3KM": 1000,
    "10KM": 375,
    "20KM": 300,
  };
};

const addNewCategorySlot = () => {
  const raw = newCategoryCode.value.trim().toUpperCase();
  if (!raw) return;
  const norm = normalizeCategory(raw);
  if (slotEditValues.value[norm] === undefined) {
    slotEditValues.value = { ...slotEditValues.value, [norm]: 1000 };
  }
  newCategoryCode.value = "";
};

const saveSlotAdjustments = async () => {
  isSavingSlots.value = true;
  try {
    const rawUrl = endpoint.value || config?.public?.apiUrl;
    const url = String(rawUrl).replace(/\/+$/, '');
    const payload = {};
    for (const [cat, val] of Object.entries(slotEditValues.value)) {
      const parsed = parseInt(val, 10);
      payload[cat] = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    const res = await $fetch(`${url}/api/animorun/slot-count/`, {
      method: "POST",
      body: { slots: payload },
    });
    if (res && typeof res === "object") {
      slotData.value = res;
      slotDataLoaded.value = true;
    } else {
      await fetchSlotCounts();
    }
    showNotice("Category slot limits successfully updated and synced!", "Slots Updated", "success");
    isSlotModalOpen.value = false;
  } catch (err) {
    console.error("[AnimoRunList] Failed to save slot adjustments:", err);
    showNotice(err?.data?.message || err?.message || "Failed to update slot allocations.", "Update Failed", "error");
  } finally {
    isSavingSlots.value = false;
  }
};

const CACHE_KEY = "animorun_registrations_cache";
const BATCHES_CACHE_KEY = "animorun_batches_cache";

let initialRegs = [];
if (process.client) {
  try {
    const cached = localStorage.getItem(CACHE_KEY) || sessionStorage.getItem(CACHE_KEY);
    if (cached) initialRegs = JSON.parse(cached);
  } catch { }
}
const registrations = ref(initialRegs);

const persistCache = (data) => {
  if (process.client && Array.isArray(data)) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(CACHE_KEY, serialized);
      sessionStorage.setItem(CACHE_KEY, serialized);
    } catch { }
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

const vvipCount = computed(() => {
  return registrations.value.filter((r) => r.participant_type === "VVIP").length;
});

const brothersCount = computed(() => {
  return registrations.value.filter((r) => r.participant_type === "De La Salle Brothers").length;
});

const sponsorsCount = computed(() => {
  return registrations.value.filter((r) => r.participant_type === "Sponsors").length;
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

// ── Duplicate Scanner State & Scanning Logic ──────────────────────────────────
const isDuplicateModalOpen = ref(false);
const duplicateSearchQuery = ref("");
const duplicateTypeFilter = ref("all"); // 'all', 'bib', 'name', 'contact'
const selectedBibFilter = ref("");
const selectedDuplicateRunnerIds = ref([]);
const isDeletingDuplicateRunner = ref(false);
const duplicateRunnerToDelete = ref(null);
const isDuplicateDeleteConfirmOpen = ref(false);

const openDuplicateScannerModal = () => {
  duplicateSearchQuery.value = "";
  duplicateTypeFilter.value = "all";
  selectedBibFilter.value = "";
  selectedDuplicateRunnerIds.value = [];
  isDuplicateModalOpen.value = true;
};

const closeDuplicateScannerModal = () => {
  isDuplicateModalOpen.value = false;
  selectedDuplicateRunnerIds.value = [];
  duplicateRunnerToDelete.value = null;
  isDuplicateDeleteConfirmOpen.value = false;
};

const formatDuplicateDate = (dateVal) => {
  if (!dateVal) return "N/A";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateVal);
  }
};

const scanDuplicateClusters = computed(() => {
  const list = registrations.value || [];
  if (list.length === 0) return [];

  // Helper sets for ignored dummy values
  const dummyEmails = new Set([
    "is@lsu.edu.ph",
    "dev@lsu.edu.ph",
    "animorun@lsu.edu.ph",
    "none@lsu.edu.ph",
    "na@lsu.edu.ph",
    "test@lsu.edu.ph",
    "none",
    "n/a",
    "na",
    "null",
    "-",
    ""
  ]);

  const cleanEmail = (em) => {
    if (!em) return "";
    const s = String(em).trim().toLowerCase();
    return dummyEmails.has(s) || s.length < 5 || !s.includes("@") ? "" : s;
  };

  const cleanPhone = (ph) => {
    if (!ph) return "";
    const digits = String(ph).replace(/\D/g, "");
    if (digits.length < 10) return "";
    if (/^(\d)\1+$/.test(digits) || digits === "1234567890" || digits === "09123456789") return "";
    return digits.slice(-10);
  };

  const cleanBib = (b) => {
    if (!b) return "";
    const s = String(b).trim().toUpperCase();
    if (!s || s === "TBD" || s === "PENDING" || s === "UNALLOCATED" || s === "NONE" || s === "N/A" || s === "-" || s.startsWith("AR-")) return "";
    return s;
  };

  const cleanName = (fn, ln) => {
    const f = (fn || "").trim().toLowerCase().replace(/\s+/g, " ");
    const l = (ln || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!f || !l) return "";
    return `${f}|${l}`;
  };

  const cleanLsuId = (id) => {
    if (!id) return "";
    const s = String(id).trim().toUpperCase();
    if (!s || s === "N/A" || s === "NONE" || s === "-" || s === "0") return "";
    return s;
  };

  // Disjoint Set Union (DSU) to connect duplicate records
  const parent = new Map();
  const find = (id) => {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)));
    }
    return parent.get(id);
  };
  const union = (id1, id2) => {
    const root1 = find(id1);
    const root2 = find(id2);
    if (root1 !== root2) {
      parent.set(root1, root2);
    }
  };

  const keyToRunner = new Map();
  const runnerReasons = new Map();

  for (const r of list) {
    const rId = r.id;
    if (!rId) continue;
    if (!runnerReasons.has(rId)) runnerReasons.set(rId, new Set());

    const keys = [];
    const bib = cleanBib(r.run_number || r.bib_number);
    if (bib) keys.push({ key: `bib:${bib}`, type: 'bib', val: bib, label: `BIB ${bib}` });

    const name = cleanName(r.firstname, r.lastname);
    if (name) keys.push({ key: `name:${name}`, type: 'name', val: name, label: `Name: ${(r.firstname || '').trim()} ${(r.lastname || '').trim()}` });

    const em = cleanEmail(r.contact_email || r.email);
    if (em) keys.push({ key: `email:${em}`, type: 'email', val: em, label: `Email: ${em}` });

    const ph = cleanPhone(r.contact_number || r.mobile);
    if (ph) keys.push({ key: `phone:${ph}`, type: 'phone', val: ph, label: `Mobile: ...${ph.slice(-4)}` });

    const lsuId = cleanLsuId(r.lsu_id);
    if (lsuId) keys.push({ key: `lsuid:${lsuId}`, type: 'lsuid', val: lsuId, label: `LSU ID: ${lsuId}` });

    for (const item of keys) {
      if (keyToRunner.has(item.key)) {
        const otherId = keyToRunner.get(item.key);
        union(rId, otherId);
        runnerReasons.get(rId).add(item.label);
        runnerReasons.get(otherId).add(item.label);
      } else {
        keyToRunner.set(item.key, rId);
      }
    }
  }

  const groupsByRoot = new Map();
  for (const r of list) {
    if (!r.id) continue;
    const root = find(r.id);
    if (!groupsByRoot.has(root)) groupsByRoot.set(root, []);
    groupsByRoot.get(root).push(r);
  }

  const resultClusters = [];
  let clusterIndex = 1;

  for (const [, runners] of groupsByRoot) {
    if (runners.length < 2) continue;

    // Sort ascending by ID (earliest submission first)
    runners.sort((a, b) => Number(a.id) - Number(b.id));

    // Analyze BIB numbers in this group
    const bibsInGroup = [];
    const bibCountMap = new Map();
    for (const r of runners) {
      const b = cleanBib(r.run_number || r.bib_number);
      if (b) {
        bibCountMap.set(b, (bibCountMap.get(b) || 0) + 1);
        if (!bibsInGroup.includes(b)) bibsInGroup.push(b);
      }
    }

    let hasBibCollision = false;
    const collidingBibs = [];
    for (const [bib, count] of bibCountMap.entries()) {
      if (count > 1) {
        hasBibCollision = true;
        collidingBibs.push(bib);
      }
    }

    let primaryType = 'name';
    let severity = 'warning';
    if (hasBibCollision) {
      primaryType = 'bib';
      severity = 'critical';
    } else if (runners.some(r => cleanName(runners[0].firstname, runners[0].lastname) === cleanName(r.firstname, r.lastname))) {
      primaryType = 'name';
      severity = 'warning';
    } else {
      primaryType = 'contact';
      severity = 'info';
    }

    const allReasons = new Set();
    for (const r of runners) {
      const reasons = runnerReasons.get(r.id);
      if (reasons) {
        for (const re of reasons) allReasons.add(re);
      }
    }
    if (hasBibCollision) {
      allReasons.add(`Exact BIB Collision: ${collidingBibs.join(', ')}`);
    }

    const representativeName = `${runners[0].firstname || ''} ${runners[0].lastname || ''}`.trim() || `Duplicate Group #${clusterIndex}`;

    resultClusters.push({
      id: `cluster-${clusterIndex++}`,
      runners,
      bibs: bibsInGroup,
      collidingBibs,
      hasBibCollision,
      primaryType,
      severity,
      name: representativeName,
      reasons: Array.from(allReasons),
    });
  }

  resultClusters.sort((a, b) => {
    if (a.hasBibCollision && !b.hasBibCollision) return -1;
    if (!a.hasBibCollision && b.hasBibCollision) return 1;
    return b.runners.length - a.runners.length;
  });

  return resultClusters;
});

const allDuplicateBibs = computed(() => {
  const bibs = new Set();
  for (const c of scanDuplicateClusters.value) {
    for (const b of c.bibs) {
      bibs.add(b);
    }
  }
  return Array.from(bibs).sort();
});

const duplicateStats = computed(() => {
  const clusters = scanDuplicateClusters.value;
  let bibCollisions = 0;
  let totalDuplicateRunners = 0;
  for (const c of clusters) {
    if (c.hasBibCollision) bibCollisions++;
    totalDuplicateRunners += c.runners.length;
  }
  return {
    totalGroups: clusters.length,
    totalRunners: totalDuplicateRunners,
    bibCollisions,
    distinctBibs: allDuplicateBibs.value.length,
  };
});

const duplicateScanCount = computed(() => {
  return scanDuplicateClusters.value.length;
});

const filteredDuplicateClusters = computed(() => {
  let list = scanDuplicateClusters.value;

  if (duplicateTypeFilter.value === 'bib') {
    list = list.filter((c) => c.hasBibCollision || c.bibs.length > 0);
  } else if (duplicateTypeFilter.value === 'name') {
    list = list.filter((c) => c.primaryType === 'name');
  } else if (duplicateTypeFilter.value === 'contact') {
    list = list.filter((c) => c.primaryType === 'contact');
  }

  if (selectedBibFilter.value) {
    const targetBib = selectedBibFilter.value.toUpperCase();
    list = list.filter((c) => c.bibs.some((b) => b.toUpperCase() === targetBib));
  }

  if (duplicateSearchQuery.value && duplicateSearchQuery.value.trim()) {
    const q = duplicateSearchQuery.value.trim().toLowerCase();
    list = list.filter((c) => {
      if (c.name.toLowerCase().includes(q)) return true;
      if (c.bibs.some((b) => b.toLowerCase().includes(q))) return true;
      return c.runners.some((r) => {
        const fn = (r.firstname || "").toLowerCase();
        const ln = (r.lastname || "").toLowerCase();
        const bib = (r.run_number || r.bib_number || "").toLowerCase();
        const email = (r.contact_email || r.email || "").toLowerCase();
        const phone = (r.contact_number || r.mobile || "").toLowerCase();
        const idStr = String(r.id);
        return fn.includes(q) || ln.includes(q) || bib.includes(q) || email.includes(q) || phone.includes(q) || idStr.includes(q);
      });
    });
  }

  return list;
});

const toggleSelectDuplicateRunner = (runnerId) => {
  const idx = selectedDuplicateRunnerIds.value.indexOf(runnerId);
  if (idx >= 0) {
    selectedDuplicateRunnerIds.value.splice(idx, 1);
  } else {
    selectedDuplicateRunnerIds.value.push(runnerId);
  }
};

const isDuplicateRunnerSelected = (runnerId) => {
  return selectedDuplicateRunnerIds.value.includes(runnerId);
};

const promptDeleteDuplicateRunner = (runner) => {
  duplicateRunnerToDelete.value = runner;
  isDuplicateDeleteConfirmOpen.value = true;
};

const closeDuplicateDeleteConfirm = () => {
  duplicateRunnerToDelete.value = null;
  isDuplicateDeleteConfirmOpen.value = false;
};

const executeDeleteDuplicateRunner = async (runner) => {
  const target = runner || duplicateRunnerToDelete.value;
  if (!target || !target.id || isDeletingDuplicateRunner.value) return;

  isDeletingDuplicateRunner.value = true;
  const targetId = target.id;
  const runnerBib = target.run_number || target.bib_number || 'Unallocated';
  const runnerFullName = `${target.firstname || ''} ${target.lastname || ''}`.trim() || `Runner #${targetId}`;

  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/bulk-delete/`, {
      method: "DELETE",
      body: { ids: [targetId] },
    });

    // Remove from local list immediately
    registrations.value = registrations.value.filter((r) => r.id !== targetId);
    selectedDuplicateRunnerIds.value = selectedDuplicateRunnerIds.value.filter((id) => id !== targetId);
    selectedIds.value = selectedIds.value.filter((id) => id !== targetId);

    closeDuplicateDeleteConfirm();

    showFastToast(
      res.message || `Deleted duplicate record for ${runnerFullName} (BIB: ${runnerBib}).`,
      "success"
    );
  } catch (err) {
    console.error("Error deleting duplicate runner:", err);
    closeDuplicateDeleteConfirm();
    showNotice("Failed to delete duplicate runner. Please try again.", "Error", "error");
  } finally {
    isDeletingDuplicateRunner.value = false;
  }
};

const executeBulkDeleteSelectedDuplicates = async () => {
  const ids = [...selectedDuplicateRunnerIds.value];
  if (!ids.length || isDeletingDuplicateRunner.value) return;

  isDeletingDuplicateRunner.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/bulk-delete/`, {
      method: "DELETE",
      body: { ids },
    });

    registrations.value = registrations.value.filter((r) => !ids.includes(r.id));
    selectedDuplicateRunnerIds.value = [];
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));

    showFastToast(
      res.message || `Successfully removed ${ids.length} duplicate registration(s).`,
      "success"
    );
  } catch (err) {
    console.error("Bulk delete duplicates error:", err);
    showNotice("Failed to delete selected duplicates. Please try again.", "Error", "error");
  } finally {
    isDeletingDuplicateRunner.value = false;
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
      // Auto-deduplication removed to allow manual review via Duplicate Scanner modal
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
    fetchSlotCounts();
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
    } catch { }
  }

  // Fetch data in parallel. If we already have cache, fetch silently in background (stale-while-revalidate),
  // otherwise fetch with skeleton loaders.
  fetchRegistrations(hasCache);
  fetchBatches();
  fetchSlotCounts();
  startPolling();
  initScrollObservers();
});

onUnmounted(() => {
  stopValidIdCamera();
  stopPolling();
  if (mobileObserver) {
    mobileObserver.disconnect();
    mobileObserver = null;
  }
  if (desktopObserver) {
    desktopObserver.disconnect();
    desktopObserver = null;
  }
});

const getImageUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") return getCleanUrl(val);
  if (typeof val === "object" && val.url) return getCleanUrl(val.url, val.name);
  if (Array.isArray(val) && val.length > 0) {
    if (typeof val[0] === "string") return getCleanUrl(val[0]);
    return getCleanUrl(val[0]?.url, val[0]?.name) || null;
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
  const clean = cleanURL(url).toLowerCase();
  return clean.endsWith(".pdf") || clean.startsWith("data:application/pdf");
};

// ── Auth & Current Operator ─────────────────────────────────────────────
const { user } = useAuth();
const currentOperator = computed(() => user.value?.email || user.value?.name || "jorenlee.luna@lsu.edu.ph");

// ── Sorting state ──────────────────────────────────────────────────────────
const sortBy = ref("date_desc");
// Options: "date_desc", "date_asc", "firstname_asc", "firstname_desc", "lastname_asc", "lastname_desc", "name_asc", "name_desc", "bib_asc", "batch_asc", "shirt_asc", "receipt_desc", "receipt_asc"

const toggleSort = (field) => {
  if (field === "firstname") {
    sortBy.value = sortBy.value === "firstname_asc" ? "firstname_desc" : "firstname_asc";
  } else if (field === "lastname") {
    sortBy.value = sortBy.value === "lastname_asc" ? "lastname_desc" : "lastname_asc";
  } else if (field === "name") {
    sortBy.value = sortBy.value === "name_asc" ? "name_desc" : "name_asc";
  } else if (field === "date") {
    sortBy.value = sortBy.value === "date_desc" ? "date_asc" : "date_desc";
  } else if (field === "bib") {
    sortBy.value = sortBy.value === "bib_asc" ? "date_desc" : "bib_asc";
  } else if (field === "batch") {
    sortBy.value = sortBy.value === "batch_asc" ? "date_desc" : "batch_asc";
  } else if (field === "shirt") {
    sortBy.value = sortBy.value === "shirt_asc" ? "date_desc" : "shirt_asc";
  } else if (field === "receipt") {
    sortBy.value = sortBy.value === "receipt_desc" ? "receipt_asc" : "receipt_desc";
  }
};

// ── Same Name / Duplicate Quick-Check Helpers ─────────────────────────────
const firstNameCounts = computed(() => {
  const map = new Map();
  for (const r of registrations.value) {
    const fn = (r.firstname || "").trim().toLowerCase();
    if (fn) {
      map.set(fn, (map.get(fn) || 0) + 1);
    }
  }
  return map;
});

const getFirstNameCount = (firstname) => {
  if (!firstname) return 0;
  return firstNameCounts.value.get(firstname.trim().toLowerCase()) || 0;
};

const fullNameCounts = computed(() => {
  const map = new Map();
  for (const r of registrations.value) {
    const key = `${(r.firstname || "").trim()} ${(r.lastname || "").trim()}`.toLowerCase();
    if (key.trim()) {
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return map;
});

const getFullNameCount = (runner) => {
  if (!runner) return 0;
  const key = `${(runner.firstname || "").trim()} ${(runner.lastname || "").trim()}`.toLowerCase();
  return fullNameCounts.value.get(key) || 0;
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

    // Payment Method Type Filter
    let matchesPaymentType = true;
    if (selectedPaymentType.value !== "All") {
      const pType = String(item.payment_type || "").trim().toLowerCase();
      const target = selectedPaymentType.value.toLowerCase();
      if (target === "salary_deduction") {
        matchesPaymentType = pType === "salary_deduction" || pType === "salary deduction";
      } else if (target === "family_salary_deduction") {
        matchesPaymentType = pType === "family_salary_deduction" || pType === "family salary deduction";
      } else if (target === "add_to_tuition") {
        matchesPaymentType = pType === "add_to_tuition" || pType === "add to tuition" || pType.includes("tuition");
      } else if (target === "over_the_counter") {
        matchesPaymentType = pType === "over_the_counter" || pType === "over the counter" || pType === "cash_payment" || pType === "cash" || (pType === "non_lsu_payment" && !item.proof_of_payment);
      } else if (target === "qr") {
        matchesPaymentType = pType === "qr" || pType.includes("gcash") || pType.includes("maya") || (pType === "non_lsu_payment" && !!item.proof_of_payment);
      } else if (target === "sponsor") {
        matchesPaymentType = pType === "sponsor" || pType.includes("sponsor");
      } else if (target === "complimentary") {
        matchesPaymentType = pType === "complimentary" || pType.includes("complimentary");
      } else {
        matchesPaymentType = pType === target;
      }
    }

    // Receipt Filter
    let matchesReceipt = true;
    if (selectedReceipt.value === "has_receipt") {
      matchesReceipt = !!item.proof_of_payment;
    } else if (selectedReceipt.value === "without_receipt") {
      matchesReceipt = !item.proof_of_payment;
    }

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

    // Race Kit Status filter
    let matchesKit = true;
    if (selectedKitStatus.value === "claimed") {
      matchesKit = !!item.kit_claimed;
    } else if (selectedKitStatus.value === "ready") {
      matchesKit = !!item.kit_ready && !item.kit_claimed;
    } else if (selectedKitStatus.value === "pending") {
      matchesKit = !item.kit_ready && !item.kit_claimed;
    }

    return matchesQuery && matchesCategory && matchesStatus && matchesPaymentType && matchesReceipt && matchesType && matchesAcademicUnit && matchesAge && matchesBatch && matchesLock && matchesDate && matchesChat && matchesKit;
  });

  // Sorting
  return list.sort((a, b) => {
    if (sortBy.value === "date_desc") {
      return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
    }
    if (sortBy.value === "date_asc") {
      return (new Date(a.created_at || 0)) - (new Date(b.created_at || 0));
    }
    if (sortBy.value === "firstname_asc") {
      const fA = (a.firstname || "").trim().toLowerCase();
      const fB = (b.firstname || "").trim().toLowerCase();
      const cmp = fA.localeCompare(fB);
      if (cmp !== 0) return cmp;
      const lA = (a.lastname || "").trim().toLowerCase();
      const lB = (b.lastname || "").trim().toLowerCase();
      const cmpL = lA.localeCompare(lB);
      if (cmpL !== 0) return cmpL;
      const mA = (a.middlename || "").trim().toLowerCase();
      const mB = (b.middlename || "").trim().toLowerCase();
      return mA.localeCompare(mB);
    }
    if (sortBy.value === "firstname_desc") {
      const fA = (a.firstname || "").trim().toLowerCase();
      const fB = (b.firstname || "").trim().toLowerCase();
      const cmp = fB.localeCompare(fA);
      if (cmp !== 0) return cmp;
      const lA = (a.lastname || "").trim().toLowerCase();
      const lB = (b.lastname || "").trim().toLowerCase();
      const cmpL = lA.localeCompare(lB);
      if (cmpL !== 0) return cmpL;
      const mA = (a.middlename || "").trim().toLowerCase();
      const mB = (b.middlename || "").trim().toLowerCase();
      return mA.localeCompare(mB);
    }
    if (sortBy.value === "lastname_asc") {
      const lA = (a.lastname || "").trim().toLowerCase();
      const lB = (b.lastname || "").trim().toLowerCase();
      const cmp = lA.localeCompare(lB);
      if (cmp !== 0) return cmp;
      const fA = (a.firstname || "").trim().toLowerCase();
      const fB = (b.firstname || "").trim().toLowerCase();
      return fA.localeCompare(fB);
    }
    if (sortBy.value === "lastname_desc") {
      const lA = (a.lastname || "").trim().toLowerCase();
      const lB = (b.lastname || "").trim().toLowerCase();
      const cmp = lB.localeCompare(lA);
      if (cmp !== 0) return cmp;
      const fA = (a.firstname || "").trim().toLowerCase();
      const fB = (b.firstname || "").trim().toLowerCase();
      return fA.localeCompare(fB);
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
    if (sortBy.value === "receipt_desc") {
      const hasA = a.proof_of_payment ? 1 : 0;
      const hasB = b.proof_of_payment ? 1 : 0;
      if (hasA !== hasB) return hasB - hasA;
      return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
    }
    if (sortBy.value === "receipt_asc") {
      const hasA = a.proof_of_payment ? 1 : 0;
      const hasB = b.proof_of_payment ? 1 : 0;
      if (hasA !== hasB) return hasA - hasB;
      return (new Date(b.created_at || 0)) - (new Date(a.created_at || 0));
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

const executeConfirmPayment = async (targetRunner = null) => {
  const runner = targetRunner || confirmModal.value.runner || selectedRunner.value;
  if (!runner || isConfirming.value) return;

  // Preserve previous state for rollback if server error occurs
  const prevStatus = runner.payment_status;
  const prevConfirmedAt = runner.confirmed_at;
  const prevConfirmedBy = runner.confirmed_by;

  // 1. OPTIMISTIC UPDATE: instant visual feedback (0ms latency!)
  const nowIso = new Date().toISOString();
  const operator = currentOperator.value || "Admin";

  runner.payment_status = "Confirmed";
  runner.confirmed_at = nowIso;
  runner.confirmed_by = operator;

  if (selectedRunner.value && selectedRunner.value.id === runner.id) {
    selectedRunner.value.payment_status = "Confirmed";
    selectedRunner.value.confirmed_at = nowIso;
    selectedRunner.value.confirmed_by = operator;
  }

  // Also update reactive registrations array so summary cards, counters and list reflect instantly
  const inList = registrations.value.find((r) => r.id === runner.id);
  if (inList) {
    inList.payment_status = "Confirmed";
    inList.confirmed_at = nowIso;
    inList.confirmed_by = operator;
  }

  // Close confirmation modal immediately if open (no waiting on spinner)
  closeConfirmModal();

  // Instant non-blocking notification toast
  const runnerName = `${runner.firstname || ''} ${runner.lastname || ''}`.trim() || runner.run_number || 'Runner';
  showFastToast(`Payment confirmed for ${runnerName}! Confirmation email dispatched.`, "success");

  // 2. Perform backend API request asynchronously
  isConfirming.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/confirm/`, {
      method: "POST",
      body: {
        confirmed_by: operator,
      },
    });

    if (res?.data) {
      Object.assign(runner, res.data);
      if (selectedRunner.value && selectedRunner.value.id === runner.id) {
        Object.assign(selectedRunner.value, res.data);
      }
      if (inList) {
        Object.assign(inList, res.data);
      }
    }
  } catch (err) {
    console.error("Error confirming payment:", err);
    // ROLLBACK on failure
    runner.payment_status = prevStatus;
    runner.confirmed_at = prevConfirmedAt;
    runner.confirmed_by = prevConfirmedBy;

    if (selectedRunner.value && selectedRunner.value.id === runner.id) {
      selectedRunner.value.payment_status = prevStatus;
      selectedRunner.value.confirmed_at = prevConfirmedAt;
      selectedRunner.value.confirmed_by = prevConfirmedBy;
    }
    if (inList) {
      inList.payment_status = prevStatus;
      inList.confirmed_at = prevConfirmedAt;
      inList.confirmed_by = prevConfirmedBy;
    }

    showNotice(
      "Failed to confirm payment on the server. Please verify your connection or local Django server.",
      "Confirmation Failed",
      "error"
    );
  } finally {
    isConfirming.value = false;
  }
};

const isAdminUploadingReceipt = ref(false);
const MAX_FILE_UPLOAD_MB = 10;
const MAX_FILE_UPLOAD_BYTES = MAX_FILE_UPLOAD_MB * 1024 * 1024; // 10 MB for HD images and documents

/**
 * Optimizes HD receipt images in the browser before upload:
 * - Passes through small images (<1.2 MB) and non-images (PDFs) directly.
 * - For larger images (>1.2 MB or up to 10MB+ phone camera shots), downscales to 2560px (Ultra-HD/QHD)
 *   and encodes to 0.88 JPEG with white background, ensuring fine text, reference numbers,
 *   and bank stamps remain razor sharp while reducing 5-15MB payloads down to ~400KB-900KB.
 * - Prevents HTTP 413 (Request Entity Too Large) errors on web servers (Nginx/Cloudflare).
 */
const compressImageIfNeeded = async (file, maxBytes = MAX_FILE_UPLOAD_BYTES) => {
  if (!file) return file;
  const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if (!isImage) return file;

  // If already small and within limits, keep as-is
  if (file.size <= 1.2 * 1024 * 1024 && file.size <= maxBytes) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 2560; // 2K/QHD dimension preserves ultra-sharp receipt text, amounts & stamps
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);

        // Fill white background in case source is transparent PNG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";

        canvas.toBlob(
          (blob) => {
            if (blob && (blob.size < file.size || blob.size <= maxBytes)) {
              const compressedFile = new File([blob], newFileName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.88
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

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
    let errorMsg = "Failed to upload and record receipt file. Please try again.";
    const status = err?.response?.status || err?.status || err?.statusCode;
    const rawError = (err?.data?.error || err?.message || "").toLowerCase();

    if (status === 413 || rawError.includes("413") || rawError.includes("too large") || rawError.includes("entity too large")) {
      errorMsg = "File size exceeds server upload limit (HTTP 413). Please ensure server Nginx has client_max_body_size set to 20M, or upload a smaller file.";
    } else if (err?.data?.error) {
      errorMsg = err.data.error;
    } else if (rawError.includes("failed to fetch")) {
      errorMsg = "Upload failed: Server connection issue or request payload exceeds server limits (HTTP 413 / CORS). Please ensure server Nginx has client_max_body_size set to 20M.";
    }

    showNotice(
      errorMsg,
      "Upload Failed",
      "error"
    );
  } finally {
    isAdminUploadingReceipt.value = false;
  }
};

const handleAdminReceiptChange = async (event, runner) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const isImageOrPdf = file.type?.startsWith("image/") || file.type === "application/pdf" || /\.(jpe?g|png|webp|gif|pdf)$/i.test(file.name);
  if (!isImageOrPdf) {
    showNotice(
      "Only image files (JPG, PNG, WEBP) or PDF receipts are allowed.",
      "Invalid File Type",
      "error"
    );
    event.target.value = "";
    return;
  }

  let fileToUpload = file;
  const isImage = file.type?.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if (isImage) {
    fileToUpload = await compressImageIfNeeded(file, MAX_FILE_UPLOAD_BYTES);
  }

  if (fileToUpload.size > MAX_FILE_UPLOAD_BYTES) {
    const sizeMb = (fileToUpload.size / (1024 * 1024)).toFixed(2);
    showNotice(
      `File size (${sizeMb} MB) exceeds the maximum allowed limit of ${MAX_FILE_UPLOAD_MB} MB. Please compress the file or choose a smaller file.`,
      "File Too Large",
      "error"
    );
    event.target.value = "";
    return;
  }

  uploadAdminReceipt(fileToUpload, runner);
  event.target.value = "";
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

// ── Valid ID Camera & Capture ───────────────────────────────────────────────
const isValidIdCameraModalOpen = ref(false);
const validIdCameraRunner = ref(null);
const validIdCameraVideoRef = ref(null);
const validIdCameraStream = ref(null);
const validIdCapturedImage = ref(null);
const validIdCapturedBlob = ref(null);
const isValidIdUploading = ref(false);
const isValidIdDeleting = ref(false);
const deleteValidIdModal = ref({ show: false, runner: null });
const validIdCameraFacingMode = ref("environment");
const validIdCameraError = ref("");
const hasMultipleCameras = ref(false);

const openValidIdCamera = async (runner) => {
  if (!runner) return;
  validIdCameraRunner.value = runner;
  validIdCapturedImage.value = null;
  validIdCapturedBlob.value = null;
  validIdCameraError.value = "";
  isValidIdCameraModalOpen.value = true;
  await nextTick();
  startValidIdCamera();
};

const closeValidIdCamera = () => {
  stopValidIdCamera();
  isValidIdCameraModalOpen.value = false;
  validIdCapturedImage.value = null;
  validIdCapturedBlob.value = null;
  validIdCameraError.value = "";
};

const startValidIdCamera = async () => {
  stopValidIdCamera();
  validIdCameraError.value = "";
  try {
    if (typeof navigator === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      throw new Error("Camera API is not supported in this browser. Please use file upload instead.");
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      hasMultipleCameras.value = videoInputs.length > 1;
    } catch (e) {}

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: validIdCameraFacingMode.value },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    } catch (errWithConstraints) {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    validIdCameraStream.value = stream;
    await nextTick();
    if (validIdCameraVideoRef.value) {
      validIdCameraVideoRef.value.srcObject = stream;
      await validIdCameraVideoRef.value.play().catch(() => {});
    }
  } catch (err) {
    console.warn("Valid ID camera error:", err);
    validIdCameraError.value =
      err.message || "Unable to access camera. Please check camera permissions or use the upload button.";
  }
};

const switchValidIdCamera = async () => {
  validIdCameraFacingMode.value = validIdCameraFacingMode.value === "environment" ? "user" : "environment";
  await startValidIdCamera();
};

const stopValidIdCamera = () => {
  if (validIdCameraStream.value) {
    try {
      validIdCameraStream.value.getTracks().forEach((track) => track.stop());
    } catch (e) {}
    validIdCameraStream.value = null;
  }
  if (validIdCameraVideoRef.value) {
    validIdCameraVideoRef.value.srcObject = null;
  }
};

const captureValidIdPhoto = () => {
  const video = validIdCameraVideoRef.value;
  if (!video || !video.videoWidth) {
    showNotice("Camera video is not ready yet. Please wait a moment.", "Camera Busy", "warning");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        showNotice("Failed to capture image. Please try again.", "Error", "error");
        return;
      }
      validIdCapturedBlob.value = blob;
      validIdCapturedImage.value = URL.createObjectURL(blob);
      stopValidIdCamera();
    },
    "image/jpeg",
    0.9
  );
};

const retakeValidIdPhoto = async () => {
  if (validIdCapturedImage.value) {
    try {
      URL.revokeObjectURL(validIdCapturedImage.value);
    } catch (e) {}
  }
  validIdCapturedImage.value = null;
  validIdCapturedBlob.value = null;
  await nextTick();
  startValidIdCamera();
};

const syncRunnerValidIdAcrossView = (runnerId, updatedFront) => {
  if (validIdCameraRunner.value && validIdCameraRunner.value.id === runnerId) {
    validIdCameraRunner.value.valid_id_front = updatedFront;
  }
  if (activeClaimRunner.value && activeClaimRunner.value.id === runnerId) {
    activeClaimRunner.value.valid_id_front = updatedFront;
  }
  if (selectedRunner.value && selectedRunner.value.id === runnerId) {
    selectedRunner.value.valid_id_front = updatedFront;
  }
  const idx = registrations.value.findIndex((r) => r.id === runnerId);
  if (idx !== -1) {
    registrations.value[idx].valid_id_front = updatedFront;
  }
};

const saveCapturedValidId = async () => {
  const runner = validIdCameraRunner.value;
  if (!runner || !validIdCapturedBlob.value || isValidIdUploading.value) return;

  isValidIdUploading.value = true;
  try {
    const filename = `valid_id_${runner.run_number || runner.id}_${Date.now()}.jpg`;
    const file = new File([validIdCapturedBlob.value], filename, { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);
    const res = await $fetch(`${endpoint.value}/api/animorun/upload/`, {
      method: "POST",
      body: formData,
    });
    const photoUrl = res.url;

    const filePayload = [
      {
        name: "valid_id",
        url: photoUrl,
        timestamp: new Date().toISOString(),
      },
    ];

    const editRes = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
      method: "PUT",
      body: {
        valid_id_front: filePayload,
        bypass_lock: true,
      },
    });

    const updatedFront = editRes.data?.valid_id_front || filePayload;
    syncRunnerValidIdAcrossView(runner.id, updatedFront);

    showNotice(
      `Valid ID photo captured and recorded successfully for ${runner.firstname} ${runner.lastname}!`,
      "Valid ID Recorded",
      "success"
    );
    closeValidIdCamera();
  } catch (err) {
    console.error("Save valid ID photo error:", err);
    showNotice(err.data?.error || "Failed to upload and record Valid ID photo. Please try again.", "Error", "error");
  } finally {
    isValidIdUploading.value = false;
  }
};

const handleValidIdFileSelect = async (event, runner) => {
  const file = event.target.files?.[0];
  if (!file || !runner) return;

  const isImg = file.type?.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if (!isImg) {
    showNotice("Please select a valid image file (JPG, PNG, WEBP).", "Invalid File", "error");
    event.target.value = "";
    return;
  }

  isValidIdUploading.value = true;
  try {
    const fileToUpload = await compressImageIfNeeded(file, MAX_FILE_UPLOAD_BYTES);
    const formData = new FormData();
    formData.append("file", fileToUpload);

    const res = await $fetch(`${endpoint.value}/api/animorun/upload/`, {
      method: "POST",
      body: formData,
    });
    const photoUrl = res.url;

    const filePayload = [
      {
        name: file.name || "valid_id",
        url: photoUrl,
        timestamp: new Date().toISOString(),
      },
    ];

    const editRes = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
      method: "PUT",
      body: {
        valid_id_front: filePayload,
        bypass_lock: true,
      },
    });

    const updatedFront = editRes.data?.valid_id_front || filePayload;
    syncRunnerValidIdAcrossView(runner.id, updatedFront);

    showNotice(
      `Valid ID uploaded and recorded successfully for ${runner.firstname} ${runner.lastname}!`,
      "Valid ID Recorded",
      "success"
    );
    if (isValidIdCameraModalOpen.value) {
      closeValidIdCamera();
    }
  } catch (err) {
    console.error("Valid ID upload error:", err);
    showNotice(err.data?.error || "Failed to upload Valid ID. Please try again.", "Error", "error");
  } finally {
    isValidIdUploading.value = false;
    event.target.value = "";
  }
};

const promptDeleteValidId = (runner) => {
  if (!runner || isValidIdDeleting.value) return;
  deleteValidIdModal.value = { show: true, runner };
};

const closeDeleteValidIdModal = () => {
  deleteValidIdModal.value = { show: false, runner: null };
};

const executeDeleteValidId = async () => {
  const runner = deleteValidIdModal.value.runner;
  if (!runner || isValidIdDeleting.value) return;

  isValidIdDeleting.value = true;
  try {
    await $fetch(`${endpoint.value}/api/animorun/${runner.id}/edit/`, {
      method: "PUT",
      body: {
        valid_id_front: [],
        bypass_lock: true,
      },
    });

    syncRunnerValidIdAcrossView(runner.id, []);
    closeDeleteValidIdModal();
    showFastToast(`Valid ID photo removed for ${runner.firstname} ${runner.lastname}.`, "info");
  } catch (err) {
    console.error("Delete Valid ID error:", err);
    closeDeleteValidIdModal();
    showNotice(err.data?.error || "Failed to remove Valid ID photo.", "Error", "error");
  } finally {
    isValidIdDeleting.value = false;
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

// Helper: list of all standard main shirt option values (e.g. "Event Shirt: S;", "Singlet: M;")
const allStandardMainShirtOptions = computed(() => {
  const opts = [];
  (OFFICIAL_SHIRT_CONFIGS || []).forEach((sc) => {
    (sc.sizes || []).forEach((sz) => {
      opts.push(`${sc.shortLabel}: ${sz};`);
    });
  });
  return opts;
});

const isStandardShirtOption = (val) => {
  return allStandardMainShirtOptions.value.includes(val);
};

// Helper: list of all standard finisher shirt option values (e.g. "Finisher Shirt: M;")
const allStandardFinisherOptions = computed(() => {
  const opts = [];
  if (FINISHER_SHIRT_CONFIG && FINISHER_SHIRT_CONFIG.sizes) {
    FINISHER_SHIRT_CONFIG.sizes.forEach((sz) => {
      opts.push(`Finisher Shirt: ${sz};`);
    });
  }
  return opts;
});

const isStandardFinisherOption = (val) => {
  return allStandardFinisherOptions.value.includes(val);
};

// Robust parser: splits and normalizes stored tshirt_size string into main shirt and finisher shirt
const parseRunnerShirtSelection = (runner) => {
  if (!runner) return { mainShirt: "", finisherShirt: "" };

  const tshirtStr = String(runner.tshirt_size || "").trim();
  let rawMain = "";
  let rawFinisher = String(runner.finisher_shirt_size || "").trim();

  if (tshirtStr) {
    const parts = tshirtStr.split(";").map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      if (/finisher/i.test(part)) {
        rawFinisher = part;
      } else if (!rawMain) {
        rawMain = part;
      }
    }
    // If no semicolon existed and regex didn't match finisher:
    if (!rawMain && !rawFinisher) {
      rawMain = tshirtStr;
    }
  }

  // Normalize main shirt
  let mainShirt = "";
  if (rawMain) {
    let clean = rawMain.replace(/;+$/, "").trim();
    if (clean.includes(":")) {
      const [typePart, sizePart] = clean.split(":", 2).map((s) => s.trim());
      const lType = typePart.toLowerCase();
      const uSize = sizePart.toUpperCase();

      if (lType.includes("semi")) {
        mainShirt = `Semi-Crop Top: ${uSize};`;
      } else if (lType.includes("crop")) {
        mainShirt = `Crop Top: ${uSize};`;
      } else if (lType.includes("singlet")) {
        mainShirt = `Singlet: ${uSize};`;
      } else if (lType.includes("kid")) {
        mainShirt = `Kids Shirt: ${sizePart};`;
      } else if (lType.includes("event") || lType.includes("shirt")) {
        mainShirt = `Event Shirt: ${uSize};`;
      } else {
        mainShirt = `${typePart}: ${uSize};`;
      }
    } else {
      // Just raw size string (e.g. "M", "7-8")
      const uClean = clean.toUpperCase();
      if (["1-2", "3-4", "5-6", "7-8", "9-11"].includes(clean)) {
        mainShirt = `Kids Shirt: ${clean};`;
      } else if (["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"].includes(uClean)) {
        mainShirt = `Event Shirt: ${uClean};`;
      } else {
        mainShirt = `${clean};`;
      }
    }
  }

  // Normalize finisher shirt
  let finisherShirt = "";
  if (rawFinisher) {
    let cleanF = rawFinisher.replace(/;+$/, "").trim();
    if (cleanF.includes(":")) {
      const [, sizePart] = cleanF.split(":", 2).map((s) => s.trim());
      finisherShirt = `Finisher Shirt: ${sizePart.toUpperCase()};`;
    } else {
      const uClean = cleanF.toUpperCase();
      if (["2XS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"].includes(uClean)) {
        finisherShirt = `Finisher Shirt: ${uClean};`;
      } else {
        finisherShirt = cleanF.startsWith("Finisher Shirt:") ? `${cleanF};` : `Finisher Shirt: ${cleanF};`;
      }
    }
  }

  // If 20KM and no finisher shirt found, default to "Finisher Shirt: M;"
  const is20KM = String(runner.run_category || "").toUpperCase().startsWith("20K");
  if (is20KM && !finisherShirt) {
    finisherShirt = "Finisher Shirt: M;";
  }

  return { mainShirt, finisherShirt };
};

const onRunCategoryChange = () => {
  if (editForm.value.run_category === "20KM" && !editForm.value.finisher_shirt_size) {
    editForm.value.finisher_shirt_size = "Finisher Shirt: M;";
  }
};

watch(
  () => editForm.value?.run_category,
  (newCat) => {
    if (newCat === "20KM" && !editForm.value.finisher_shirt_size) {
      editForm.value.finisher_shirt_size = "Finisher Shirt: M;";
    }
  }
);

const openEdit = () => {
  if (!selectedRunner.value) return;

  // If runner is locked under a batch, check bypass
  if (selectedRunner.value.batch_locked && !bypassWarningAcknowledged.value) {
    openUnlockPrompt(selectedRunner.value, "runner");
    return;
  }

  const parsedShirts = parseRunnerShirtSelection(selectedRunner.value);

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
    tshirt_size: parsedShirts.mainShirt,
    run_category: selectedRunner.value.run_category || "",
    run_number: selectedRunner.value.run_number || selectedRunner.value.bib_number || "",
    payment_status: selectedRunner.value.payment_status || "",
    payment_type: selectedRunner.value.payment_type || "",
    finisher_shirt_size: parsedShirts.finisherShirt,
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
    const is20KM = (editForm.value.run_category || selectedRunner.value.run_category || "").toUpperCase().startsWith("20K");

    let mainShirt = (editForm.value.tshirt_size || "").trim();
    if (mainShirt && !mainShirt.endsWith(";")) {
      mainShirt += ";";
    }

    let combinedTshirt = mainShirt;
    let finisherVal = (editForm.value.finisher_shirt_size || "").trim();
    if (is20KM) {
      if (!finisherVal) finisherVal = "Finisher Shirt: M;";
      if (!finisherVal.startsWith("Finisher Shirt:")) {
        finisherVal = `Finisher Shirt: ${finisherVal.replace(/;/g, "").trim()};`;
      }
      if (!finisherVal.endsWith(";")) {
        finisherVal += ";";
      }

      // Strip any existing finisher shirt from mainShirt to prevent duplication
      const cleanMain = mainShirt
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !/finisher/i.test(s))
        .join("; ");
      const finalMain = cleanMain ? (cleanMain.endsWith(";") ? cleanMain : cleanMain + ";") : "Event Shirt: M;";
      combinedTshirt = `${finalMain} ${finisherVal}`.trim();
    } else {
      // Non-20KM: strip finisher shirt
      const cleanMain = mainShirt
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s && !/finisher/i.test(s))
        .join("; ");
      combinedTshirt = cleanMain ? (cleanMain.endsWith(";") ? cleanMain : cleanMain + ";") : "";
    }

    const payload = {
      ...editForm.value,
      tshirt_size: combinedTshirt,
      finisher_shirt_size: is20KM ? finisherVal : "",
      bypass_lock: true,
    };

    const res = await $fetch(`${endpoint.value}/api/animorun/${selectedRunner.value.id}/edit/`, {
      method: "PUT",
      body: payload,
    });
    // Merge changes back into both the list and the detail view
    const updated = res.data || payload;
    Object.assign(selectedRunner.value, updated);
    selectedRunner.value.tshirt_size = combinedTshirt;
    selectedRunner.value.finisher_shirt_size = is20KM ? finisherVal : "";

    const idx = registrations.value.findIndex((r) => r.id === selectedRunner.value.id);
    if (idx !== -1) {
      Object.assign(registrations.value[idx], updated);
      registrations.value[idx].tshirt_size = combinedTshirt;
      registrations.value[idx].finisher_shirt_size = is20KM ? finisherVal : "";
    }
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

// ── CSV Template Download & Upload for VVIP, De La Salle Brothers, Sponsors ─────
const csvFileInputRef = ref(null);
const isCsvImportModalOpen = ref(false);
const csvParsedRunners = ref([]);
const csvParseErrors = ref([]);
const isImportingCsv = ref(false);
const csvUploadFileName = ref("");

// ── CSV Import for BEU & HEU Students ──────────────────────────────────────────
const studentCsvFileInputRef = ref(null);
const isStudentCsvModalOpen = ref(false);
const studentImportUnit = ref("BEU"); // "BEU" or "HEU"
const studentRawRows = ref([]);
const studentParsedRunners = ref([]);
const studentSkippedRunners = ref([]);
const studentCsvUploadFileName = ref("");
const isImportingStudentCsv = ref(false);
const studentCsvActiveTab = ref("valid"); // "valid" or "skipped"

const csvImportStats = computed(() => {
  const list = csvParsedRunners.value;
  return {
    total: list.length,
    vvip: list.filter((r) => r.participant_type === "VVIP").length,
    brothers: list.filter((r) => r.participant_type === "De La Salle Brothers").length,
    sponsors: list.filter((r) => r.participant_type === "Sponsors").length,
    employees: list.filter(
      (r) =>
        r.participant_type === "LSU Exclusive - Employee" ||
        r.participant_type === "GSC" ||
        r.participant_type === "GSO"
    ).length,
    students: list.filter((r) => r.participant_type === "LSU Exclusive - Enrolled Student").length,
    alumni: list.filter((r) => r.participant_type === "LSU Exclusive - Alumni").length,
    others: list.filter(
      (r) =>
        ![
          "VVIP",
          "De La Salle Brothers",
          "Sponsors",
          "LSU Exclusive - Employee",
          "LSU Exclusive - Enrolled Student",
          "LSU Exclusive - Alumni",
          "GSC",
          "GSO",
        ].includes(r.participant_type)
    ).length,
  };
});

// Normalizes flexible CSV shirt inputs (e.g. "M - Singlet", "L", "XXL", "XXXXL") to official format
const normalizeCsvShirtSize = (rawSize, category = "3KM") => {
  if (!rawSize) return "Event Shirt: M;";
  const s = String(rawSize).trim();

  if (s.includes(":") && s.includes(";")) return s;
  if (s.includes(":")) return s.endsWith(";") ? s : `${s};`;

  const upper = s.toUpperCase();

  // Detect size
  let detectedSize = "M";
  if (upper.includes("5XL") || upper.includes("XXXXXL")) detectedSize = "5XL";
  else if (upper.includes("4XL") || upper.includes("XXXXL")) detectedSize = "4XL";
  else if (upper.includes("3XL") || upper.includes("XXXL")) detectedSize = "3XL";
  else if (upper.includes("2XL") || upper.includes("XXL")) detectedSize = "2XL";
  else if (/\bXL\b/.test(upper) || upper.includes(" XL") || upper.includes("XL ") || upper === "XL") detectedSize = "XL";
  else if (/\b2XS\b/.test(upper) || upper === "2XS") detectedSize = "2XS";
  else if (/\bXS\b/.test(upper) || upper === "XS") detectedSize = "XS";
  else if (/\bS\b/.test(upper) || upper.startsWith("S ") || upper.startsWith("S-") || upper.endsWith(" S") || upper.endsWith("-S")) detectedSize = "S";
  else if (/\bL\b/.test(upper) || upper.startsWith("L ") || upper.startsWith("L-") || upper.endsWith(" L") || upper.endsWith("-L")) detectedSize = "L";
  else if (/\bM\b/.test(upper) || upper.startsWith("M ") || upper.startsWith("M-") || upper.endsWith(" M") || upper.endsWith("-M")) detectedSize = "M";

  // Detect shirt type
  let shirtType = "Event Shirt";
  if (upper.includes("SEMI") && upper.includes("CROP")) shirtType = "Semi-Crop Top";
  else if (upper.includes("CROP")) shirtType = "Crop Top";
  else if (upper.includes("SINGLET")) shirtType = "Singlet";
  else if (upper.includes("KID")) shirtType = "Kids Shirt";

  let result = `${shirtType}: ${detectedSize};`;

  // If 20KM category, add Finisher Shirt
  const is20KM = String(category || "").toUpperCase().startsWith("20K");
  if (is20KM && !upper.includes("FINISHER")) {
    result += ` Finisher Shirt: ${detectedSize};`;
  }

  return result;
};

// Download official CSV template
const downloadCsvTemplate = () => {
  const headers = [
    "Classification",
    "First Name",
    "Last Name",
    "Middle Name",
    "Suffix",
    "Category",
    "T-Shirt Size",
    "Gender",
    "Birthdate",
    "Contact Number",
    "Email",
    "Address",
    "Organization / Sponsor",
    "Payment Status",
    "Payment Option",
    "Race BIB Number",
  ];

  const sampleRows = [
    [
      "VVIP",
      "Armin",
      "Luistro",
      "A",
      "FSC",
      "3KM",
      "L",
      "Male",
      "1961-12-24",
      "09171234567",
      "armin.luistro@delasalle.ph",
      "Mandaluyong City",
      "De La Salle Philippines",
      "Confirmed",
      "Complimentary",
      "",
    ],
    [
      "De La Salle Brothers",
      "Felipe",
      "Belleza",
      "C",
      "FSC",
      "3KM",
      "XL",
      "Male",
      "1965-05-15",
      "09181234567",
      "felipe.belleza@lsu.edu.ph",
      "La Salle University Ozamiz",
      "De La Salle Brothers",
      "Confirmed",
      "Complimentary",
      "",
    ],
    [
      "Sponsors",
      "Juan",
      "Dela Cruz",
      "M",
      "",
      "10KM",
      "M",
      "Male",
      "1988-08-18",
      "09201234567",
      "juan.delacruz@sponsorcorp.ph",
      "Ozamiz City",
      "Ayala Foundation / Sponsor Partner",
      "Confirmed",
      "Sponsor",
      "",
    ],
    [
      "VVIP",
      "Maria",
      "Santos",
      "B",
      "",
      "3KM",
      "M",
      "Female",
      "1975-03-10",
      "09191234567",
      "maria.santos@partner.org",
      "Cagayan de Oro City",
      "City Government of Ozamiz",
      "Confirmed",
      "Complimentary",
      "",
    ],
    [
      "De La Salle Brothers",
      "Raymundo",
      "Suplido",
      "B",
      "FSC",
      "3KM",
      "L",
      "Male",
      "1957-02-14",
      "09221234567",
      "raymundo.suplido@delasalle.ph",
      "Ozamiz City",
      "De La Salle Brothers Community",
      "Confirmed",
      "Complimentary",
      "",
    ],
    [
      "Sponsors",
      "Elena",
      "Torres",
      "R",
      "",
      "20KM",
      "S",
      "Female",
      "1992-11-20",
      "09179876543",
      "elena.torres@sponsor.com",
      "Cebu City",
      "San Miguel Foods / Major Sponsor",
      "Confirmed",
      "Sponsor",
      "",
    ],
  ];

  const escapeCol = (val) => {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(escapeCol).join(","),
    ...sampleRows.map((row) => row.map(escapeCol).join(",")),
  ];

  const csvContent = csvRows.join("\r\n");
  downloadCsvFile(csvContent, "AnimoRun_Template_VVIP_Brothers_Sponsors.csv");
  showNotice(
    "Template downloaded! Open in Excel or Google Sheets, fill in your VVIP, De La Salle Brothers, or Sponsors, and click 'Upload CSV' to add them directly.",
    "Template Downloaded",
    "success"
  );
};

// Trigger file input click
const triggerCsvUpload = () => {
  if (csvFileInputRef.value) {
    csvFileInputRef.value.value = "";
    csvFileInputRef.value.click();
  }
};

// Robust CSV Line Parser supporting RFC 4180 quotes & escaped commas, tabs, and semicolons
const parseCsvText = (text) => {
  const firstLine = text.split(/\r\n|\r|\n/)[0] || "";
  let delimiter = ",";
  if (!firstLine.includes(",") && firstLine.includes("\t")) {
    delimiter = "\t";
  } else if (!firstLine.includes(",") && firstLine.includes(";")) {
    delimiter = ";";
  }

  const lines = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r" || char === "\n") {
        currentRow.push(currentField.trim());
        currentField = "";
        if (currentRow.some((field) => field.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
};

// Handle CSV File Selection
const handleCsvFileSelected = async (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;

  csvUploadFileName.value = file.name;
  csvParseErrors.value = [];
  csvParsedRunners.value = [];

  try {
    const text = await file.text();
    const rows = parseCsvText(text);

    if (rows.length < 2) {
      showNotice("The selected CSV file appears to be empty or has no data rows.", "Empty CSV", "error");
      return;
    }

    const rawHeaders = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

    // Check if this CSV is specifically a BEU/HEU Student CSV
    const isStudentCsv =
      rawHeaders.some(
        (h) => h.includes("studentid") || h.includes("studentnumber") || (h.includes("student") && h.includes("id"))
      ) || (rawHeaders.includes("gradelevel") && rawHeaders.includes("section"));

    if (isStudentCsv) {
      // Auto-detect unit from file content
      const firstDataRows = rows.slice(1, 15);
      const isBeuContent = firstDataRows.some((r) => {
        const text = r.join(" ").toUpperCase();
        return (
          text.includes("JUNIOR HIGH") ||
          text.includes("SENIOR HIGH") ||
          text.includes("ELEMENTARY") ||
          text.includes("PREPARATORY") ||
          text.includes("KINDER") ||
          text.includes("BE-") ||
          text.includes("GRADE")
        );
      });
      studentImportUnit.value = isBeuContent ? "BEU" : "HEU";
      studentRawRows.value = rows;
      studentCsvUploadFileName.value = file.name;
      const { valid, skipped } = parseStudentCsvData(rows, studentImportUnit.value);
      studentParsedRunners.value = valid;
      studentSkippedRunners.value = skipped;
      studentCsvActiveTab.value = valid.length ? "valid" : "skipped";
      isStudentCsvModalOpen.value = true;
      return;
    }

    // Find column index matching multiple alias keys
    const getIndex = (aliases) => {
      return rawHeaders.findIndex((h) => aliases.some((a) => h.includes(a)));
    };

    const colIdx = {
      classification: getIndex(["classification", "participanttype", "parttype", "type", "role"]),
      firstname: getIndex(["firstname", "first", "fname"]),
      lastname: getIndex(["lastname", "last", "lname", "surname"]),
      middlename: getIndex(["middlename", "middle", "mname", "mi"]),
      suffix: getIndex(["suffix", "ext"]),
      category: getIndex(["category", "runcategory", "distance", "km"]),
      tshirt_size: getIndex(["tshirtsize", "shirtsize", "tshirt", "size", "shirt"]),
      gender: getIndex(["gender", "sex"]),
      birthdate: getIndex(["birthdate", "birth", "dob", "bday"]),
      contact_number: getIndex(["contactnumber", "phone", "mobile", "contact", "cellphone"]),
      contact_email: getIndex(["email", "contactemail", "mail"]),
      contact_address: getIndex(["address", "contactaddress", "city", "location"]),
      organization: getIndex(["organization", "sponsor", "company", "affiliation", "org"]),
      partner_office: getIndex(["partneroffice", "partner", "office", "dept", "department", "unit"]),
      payment_status: getIndex(["paymentstatus", "paystatus", "status"]),
      payment_type: getIndex(["paymentoption", "paymenttype", "paytype", "mode"]),
      run_number: getIndex(["racebib", "runnumber", "bibnumber", "bib"]),
    };

    const parsed = [];
    const errors = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0 || row.every((c) => !c)) continue;

      const getVal = (idx, fallback = "") => (idx !== -1 && row[idx] !== undefined ? row[idx].trim() : fallback);

      const firstname = getVal(colIdx.firstname);
      const lastname = getVal(colIdx.lastname);

      if (!firstname && !lastname) {
        // Skip purely empty trailing rows
        continue;
      }

      let rawType = getVal(colIdx.classification, "VVIP");
      let typeUpper = rawType.toUpperCase();
      let participant_type = "Open Category";

      if (typeUpper.includes("VVIP") || typeUpper === "VIP") {
        participant_type = "VVIP";
      } else if (
        typeUpper.includes("BROTHER") ||
        typeUpper.includes("FSC") ||
        typeUpper.includes("DE LA SALLE") ||
        typeUpper.includes("DLS")
      ) {
        participant_type = "De La Salle Brothers";
      } else if (typeUpper.includes("SPONSOR")) {
        participant_type = "Sponsors";
      } else if (typeUpper.includes("STUDENT")) {
        participant_type = "LSU Exclusive - Enrolled Student";
      } else if (
        typeUpper.includes("EMPLOYEE") ||
        typeUpper.includes("FACULTY") ||
        typeUpper.includes("STAFF") ||
        typeUpper.includes("GSO") ||
        typeUpper.includes("GSC") ||
        typeUpper.includes("MAINTENANCE")
      ) {
        participant_type = "LSU Exclusive - Employee";
      } else if (typeUpper.includes("ALUMNI")) {
        participant_type = "LSU Exclusive - Alumni";
      } else if (rawType) {
        participant_type = rawType;
      }

      let rawCat = getVal(colIdx.category, "3KM");
      let category = normalizeCategory(rawCat) || "3KM";

      let rawSize = getVal(colIdx.tshirt_size, "M");
      let tshirt_size = normalizeCsvShirtSize(rawSize, category);

      let payment_status = getVal(colIdx.payment_status, "Confirmed");
      if (!payment_status) payment_status = "Confirmed";

      let payment_type = getVal(colIdx.payment_type);
      if (!payment_type) {
        if (participant_type === "VVIP" || participant_type === "De La Salle Brothers") {
          payment_type = "complimentary";
        } else if (participant_type === "Sponsors") {
          payment_type = "sponsor";
        } else if (participant_type === "LSU Exclusive - Employee" || typeUpper.includes("GSC") || typeUpper.includes("GSO")) {
          payment_type = "salary_deduction";
        } else {
          payment_type = "cash_payment";
        }
      }

      let organization = getVal(colIdx.organization);
      if (!organization && (typeUpper.includes("GSC") || typeUpper.includes("GSO"))) {
        organization = "General Services Office (GSO)";
      }

      let partner_office = getVal(colIdx.partner_office);
      if (!partner_office && (typeUpper.includes("GSC") || typeUpper.includes("GSO"))) {
        partner_office = "General Services Office (GSO)";
      }

      parsed.push({
        classification: participant_type,
        participant_type,
        firstname,
        lastname,
        middlename: getVal(colIdx.middlename),
        suffix: getVal(colIdx.suffix),
        run_category: category,
        category,
        tshirt_size,
        gender: getVal(colIdx.gender, "Male"),
        birthdate: getVal(colIdx.birthdate),
        contact_number: getVal(colIdx.contact_number),
        contact_email: getVal(colIdx.contact_email),
        contact_address: getVal(colIdx.contact_address),
        organization,
        partner_office,
        payment_status,
        payment_type,
        run_number: getVal(colIdx.run_number),
        row_number: r + 1,
      });
    }

    if (!parsed.length) {
      showNotice("No valid runner entries could be extracted from this CSV.", "Parsing Failed", "error");
      return;
    }

    csvParsedRunners.value = parsed;
    csvParseErrors.value = errors;
    isCsvImportModalOpen.value = true;
  } catch (err) {
    console.error("Error reading CSV file:", err);
    showNotice("Failed to read CSV file. Please make sure it is a valid .csv file.", "File Read Error", "error");
  }
};

// Execute bulk import to backend
const executeCsvImport = async () => {
  if (!csvParsedRunners.value.length || isImportingCsv.value) return;

  isImportingCsv.value = true;
  try {
    const payload = {
      is_dashboard: true,
      participants: csvParsedRunners.value,
    };

    const res = await $fetch(`${endpoint.value}/api/animorun/create/`, {
      method: "POST",
      body: payload,
    });

    const count = res?.count || csvParsedRunners.value.length;
    const stats = csvImportStats.value;

    if (res?.runners && Array.isArray(res.runners)) {
      // Prepend newly created runners to registrations list immediately
      const newRunners = res.runners;
      const existingIds = new Set(registrations.value.map((r) => r.id));
      const filteredNew = newRunners.filter((r) => !existingIds.has(r.id));
      registrations.value = [...filteredNew, ...registrations.value];
      persistCache(registrations.value);
    }

    // Refresh full list from server to ensure perfect sync
    await fetchRegistrations(true);

    isCsvImportModalOpen.value = false;
    csvParsedRunners.value = [];
    if (csvFileInputRef.value) csvFileInputRef.value.value = "";

    const details = [];
    if (stats.vvip) details.push(`${stats.vvip} VVIP`);
    if (stats.brothers) details.push(`${stats.brothers} Brothers`);
    if (stats.sponsors) details.push(`${stats.sponsors} Sponsors`);
    if (stats.employees) details.push(`${stats.employees} Employees`);
    if (stats.students) details.push(`${stats.students} Students`);
    if (stats.alumni) details.push(`${stats.alumni} Alumni`);
    if (stats.others) details.push(`${stats.others} Others`);

    showNotice(
      `🎉 Successfully added ${count} runner(s) directly via CSV!\n\n${details.join(" · ")}\n\nRace BIB numbers have been automatically allocated and payment status marked as Confirmed.`,
      "CSV Import Successful",
      "success"
    );
  } catch (err) {
    console.error("CSV import error:", err);
    showNotice(
      err?.data?.message || err?.data?.error || err?.message || "Failed to import runners from CSV. Please check the data format and try again.",
      "Import Failed",
      "error"
    );
  } finally {
    isImportingCsv.value = false;
  }
};

// ── STUDENT CSV IMPORT LOGIC (BEU & HEU) ──────────────────────────────────────────

const normalizeStudentDob = (val) => {
  if (!val) return "";
  const s = String(val).trim();
  // Check MM/DD/YYYY or M/D/YYYY
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Check YYYY-MM-DD
  const ymd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return s;
};

const normalizeStudentMobile = (val) => {
  if (!val) return "";
  let digits = String(val).replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.length === 10 && digits.startsWith("9")) {
    digits = "0" + digits;
  }
  return digits;
};

const normalizeStudentGender = (val) => {
  if (!val) return "Male";
  const s = String(val).trim().toUpperCase();
  if (s.startsWith("F")) return "Female";
  if (s.startsWith("M")) return "Male";
  return val.trim();
};

const parseStudentCsvData = (rows, unit = "BEU") => {
  if (!rows || rows.length < 2) return { valid: [], skipped: [] };

  const rawHeaders = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const getIndex = (aliases, fallbackIdx) => {
    const idx = rawHeaders.findIndex((h) => aliases.some((a) => h.includes(a)));
    return idx !== -1 ? idx : fallbackIdx;
  };

  const colIdx = {
    student_id: getIndex(["studentid", "studentnumber", "studentno", "lsuid", "idnumber", "studid", "id"], 0),
    last_name: getIndex(["lastname", "last", "lname", "surname"], 1),
    first_name: getIndex(["firstname", "first", "fname"], 2),
    middle_name: getIndex(["middlename", "middle", "mname", "mi"], 3),
    gender: getIndex(["gender", "sex"], 4),
    dob: getIndex(["dob", "birthdate", "birth", "bday", "dateofbirth"], 5),
    grade_level: getIndex(["gradelevel", "grade", "level", "yearlevel", "course", "program"], 6),
    section: getIndex(["section", "class", "strand"], 7),
    student_email: getIndex(["studentemail", "email", "mail", "contactemail"], 8),
    student_mobile: getIndex(["studentmobile", "mobile", "phone", "contactnumber", "cellphone"], 9),
  };

  const valid = [];
  const skipped = [];
  const currentRegs = registrations.value || [];
  const defaultEmail = unit === "BEU" ? "is@lsu.edu.ph" : "dev@lsu.edu.ph";

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || row.every((c) => !c)) continue;

    const getVal = (idx, fallback = "") => (idx !== -1 && row[idx] !== undefined ? row[idx].trim() : fallback);

    const studentId = getVal(colIdx.student_id);
    const lastName = getVal(colIdx.last_name);
    const firstName = getVal(colIdx.first_name);
    const middleName = getVal(colIdx.middle_name);

    if (!studentId && !lastName && !firstName) continue;

    const rawDob = getVal(colIdx.dob);
    const birthdate = normalizeStudentDob(rawDob);
    const gender = normalizeStudentGender(getVal(colIdx.gender));
    const gradeLevel = getVal(colIdx.grade_level);
    const section = getVal(colIdx.section);
    const rawEmail = getVal(colIdx.student_email);
    const mobile = normalizeStudentMobile(getVal(colIdx.student_mobile));

    // Handle email: use provided student email if valid, otherwise fallback to is@lsu.edu.ph (BEU) or dev@lsu.edu.ph (HEU)
    let contactEmail = "";
    let isDefaultEmail = false;
    const cleanMail = String(rawEmail || "").trim().toLowerCase();
    if (cleanMail && cleanMail !== "-" && cleanMail !== "n/a" && cleanMail !== "none" && cleanMail !== "null" && cleanMail.includes("@")) {
      contactEmail = cleanMail;
      isDefaultEmail = false;
    } else {
      contactEmail = defaultEmail;
      isDefaultEmail = true;
    }

    // Determine Academic Fields
    let collegeCourse = "";
    let collegeYear = gradeLevel;
    let beuGrade = "";
    let partnerOffice = section ? `Section: ${section}` : "";

    if (unit === "BEU") {
      const glUpper = gradeLevel.toUpperCase();
      if (
        glUpper.includes("SENIOR HIGH") ||
        glUpper.includes("GRADE 11") ||
        glUpper.includes("GRADE 12") ||
        glUpper.includes("SHS") ||
        glUpper.includes("HUMSS") ||
        glUpper.includes("STEM") ||
        glUpper.includes("ABM") ||
        glUpper.includes("TVL")
      ) {
        collegeCourse = "SHS";
      } else if (
        glUpper.includes("JUNIOR HIGH") ||
        glUpper.includes("GRADE 7") ||
        glUpper.includes("GRADE 8") ||
        glUpper.includes("GRADE 9") ||
        glUpper.includes("GRADE 10") ||
        glUpper.includes("JHS")
      ) {
        collegeCourse = "JHS";
      } else if (
        glUpper.includes("ELEMENTARY") ||
        glUpper.includes("PREPARATORY") ||
        glUpper.includes("KINDER") ||
        /GRADE\s*[1-6]\b/i.test(glUpper)
      ) {
        collegeCourse = "Grade School";
      } else {
        collegeCourse = "BEU";
      }
      collegeYear = gradeLevel;
      beuGrade = section ? `${gradeLevel} - ${section}` : gradeLevel;
    } else {
      collegeCourse = gradeLevel || "College";
      collegeYear = section || "Enrolled";
      beuGrade = "";
    }

    const runnerData = {
      lsu_id_number: studentId,
      firstname: firstName,
      lastname: lastName,
      middlename: middleName,
      gender,
      birthdate,
      raw_dob: rawDob,
      grade_level: gradeLevel,
      section,
      contact_email: contactEmail,
      is_default_email: isDefaultEmail,
      contact_number: mobile,
      run_category: "3KM",
      category: "3KM",
      tshirt_size: "Event Shirt: L;",
      participant_type: "LSU Exclusive - Enrolled Student",
      college_course: collegeCourse,
      college_year: collegeYear,
      beu_grade: beuGrade,
      partner_office: partnerOffice,
      contact_address: "La Salle University Ozamiz",
      organization: unit === "BEU" ? "Basic Education Unit (BEU)" : "Higher Education Unit (HEU)",
      payment_status: "Confirmed",
      payment_type: "add_to_tuition",
      grand_total_payment: "1000",
      row_number: r + 1,
    };

    // ── Detect done registered students -> Skip ─────────────────────────
    const cleanId = String(studentId || "").trim().toLowerCase();
    const cleanFirst = String(firstName || "").trim().toLowerCase();
    const cleanLast = String(lastName || "").trim().toLowerCase();

    let matched = null;
    let skipReason = "";

    // 1. Match by Student ID
    if (cleanId) {
      matched = currentRegs.find((reg) => {
        const regId = String(reg.lsu_id_number || "").trim().toLowerCase();
        return regId && regId === cleanId;
      });
      if (matched) {
        skipReason = `Matched Student ID: ${matched.lsu_id_number} (BIB: ${matched.run_number || matched.id})`;
      }
    }

    // 2. Match by First Name & Last Name
    if (!matched && cleanFirst && cleanLast) {
      matched = currentRegs.find((reg) => {
        const rFirst = String(reg.firstname || "").trim().toLowerCase();
        const rLast = String(reg.lastname || "").trim().toLowerCase();
        return rFirst === cleanFirst && rLast === cleanLast;
      });
      if (matched) {
        skipReason = `Matched Name: ${matched.firstname} ${matched.lastname} (BIB: ${matched.run_number || matched.id})`;
      }
    }

    // 3. Match by non-generic Email
    if (!matched && !isDefaultEmail && contactEmail) {
      matched = currentRegs.find((reg) => {
        const rMail = String(reg.contact_email || reg.email || "").trim().toLowerCase();
        return rMail && rMail === contactEmail;
      });
      if (matched) {
        skipReason = `Matched Email: ${matched.contact_email || matched.email} (BIB: ${matched.run_number || matched.id})`;
      }
    }

    // 4. In-batch duplicate check
    if (!matched) {
      const inBatch = valid.find((v) => {
        const vId = String(v.lsu_id_number || "").trim().toLowerCase();
        const vFirst = String(v.firstname || "").trim().toLowerCase();
        const vLast = String(v.lastname || "").trim().toLowerCase();
        return (cleanId && vId === cleanId) || (cleanFirst && cleanLast && vFirst === cleanFirst && vLast === cleanLast);
      });
      if (inBatch) {
        skipped.push({
          ...runnerData,
          skip_reason: "Duplicate entry within this CSV file",
          matched_runner: null,
        });
        continue;
      }
    }

    if (matched) {
      skipped.push({
        ...runnerData,
        skip_reason: skipReason,
        matched_runner: matched,
      });
    } else {
      valid.push(runnerData);
    }
  }

  return { valid, skipped };
};

// Handle Student CSV File Selection
const handleStudentCsvFileSelected = async (event) => {
  const file = event.target?.files?.[0];
  if (!file) return;

  studentCsvUploadFileName.value = file.name;
  try {
    const text = await file.text();
    const rows = parseCsvText(text);

    if (rows.length < 2) {
      showNotice("The selected CSV file appears to be empty or has no data rows.", "Empty CSV", "error");
      return;
    }

    studentRawRows.value = rows;
    const { valid, skipped } = parseStudentCsvData(rows, studentImportUnit.value);

    if (!valid.length && !skipped.length) {
      showNotice("No valid student entries could be extracted from this CSV.", "Parsing Failed", "error");
      return;
    }

    studentParsedRunners.value = valid;
    studentSkippedRunners.value = skipped;
    studentCsvActiveTab.value = valid.length ? "valid" : "skipped";
    isStudentCsvModalOpen.value = true;
  } catch (err) {
    console.error("Error reading Student CSV file:", err);
    showNotice("Failed to read CSV file. Please make sure it is a valid .csv file.", "File Read Error", "error");
  }
};

// Trigger Student CSV File Selection
const triggerStudentCsvUpload = (unit = "BEU") => {
  studentImportUnit.value = unit;
  if (studentCsvFileInputRef.value) {
    studentCsvFileInputRef.value.value = "";
    studentCsvFileInputRef.value.click();
  }
};

// Change unit inside the modal and re-parse
const setStudentImportUnit = (unit) => {
  studentImportUnit.value = unit;
  if (studentRawRows.value.length > 0) {
    const { valid, skipped } = parseStudentCsvData(studentRawRows.value, unit);
    studentParsedRunners.value = valid;
    studentSkippedRunners.value = skipped;
  }
};

// Download official student CSV template for BEU or HEU
const downloadStudentCsvTemplate = (unit = "BEU") => {
  const headers = [
    "STUDENT ID",
    "LAST NAME",
    "FIRST NAME",
    "MIDDLE NAME",
    "GENDER",
    "DOB",
    "GRADE LEVEL",
    "SECTION",
    "STUDENT EMAIL",
    "STUDENT MOBILE",
  ];

  const beuRows = [
    ["11722243", "Abadilla", "Summer Louisse", "J", "F", "11/04/2009", "Junior High - Grade 10", "BE-BR. FIDELIS LEDDY FSC", "summerlouise.abadilla@lsu.edu.ph", "09108804256"],
    ["200669746", "Abadilla", "Therese Elizabeth", "", "F", "11/07/2014", "Elementary - Grade 6", "BE-BR. ANTHONY FERDINAND FSC", "", "0906916781"],
    ["260337826", "Abaquita", "Jasmine", "S", "F", "01/27/2012", "Junior High - Grade 9", "BE-BR. HUGH WESTER FSC", "", "09102918665"],
    ["G11480654", "Ablong", "Dale Dexter", "P", "M", "11/23/2008", "Senior High - Grade 12-STEM-MED", "BE-BR. BERTRAN FRANCISCO FSC", "", "09391868853"],
    ["G11658006", "Abucay", "Aaron James", "B", "M", "06/08/2010", "Senior High - Grade 11 - STEM - Engineering", "BE-BR. ESTEBAN VICENTE FSC", "aaronabucay2@gmail.com", "09063656905"],
    ["260070844", "Abejuela", "Xanleigh Myrth", "P", "M", "04/04/2021", "Preparatory - Universal Kindergarten", "BE-ISUK", "jvpabejuela@yahoo.com", "09614889432"],
  ];

  const heuRows = [
    ["202100123", "Dela Cruz", "Juan", "M", "M", "05/14/2003", "BSIT", "4th Year", "juan.delacruz@lsu.edu.ph", "09171234567"],
    ["202200456", "Santos", "Maria", "C", "F", "09/21/2004", "BSBA-MARKETING", "3rd Year", "", "09181234567"],
    ["202300789", "Reyes", "Carlo", "G", "M", "01/15/2005", "BSN", "2nd Year", "", "09201234567"],
  ];

  const rows = unit === "HEU" ? heuRows : beuRows;
  const escapeCol = (val) => {
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map(escapeCol).join(","),
    ...rows.map((row) => row.map(escapeCol).join(",")),
  ];

  const csvContent = csvRows.join("\r\n");
  const filename = unit === "HEU" ? "AnimoRun_HEU_Students_Template.csv" : "AnimoRun_BEU_Students_Template.csv";
  downloadCsvFile(csvContent, filename);

  showNotice(
    `${unit} Student CSV template downloaded! Columns: STUDENT ID, LAST NAME, FIRST NAME, MIDDLE NAME, GENDER, DOB, GRADE LEVEL, SECTION, STUDENT EMAIL, STUDENT MOBILE.`,
    "Template Downloaded",
    "success"
  );
};

// Execute bulk student import to backend
const executeStudentCsvImport = async () => {
  if (!studentParsedRunners.value.length || isImportingStudentCsv.value) return;

  isImportingStudentCsv.value = true;
  try {
    const payload = {
      is_dashboard: true,
      participants: studentParsedRunners.value,
    };

    const res = await $fetch(`${endpoint.value}/api/animorun/create/`, {
      method: "POST",
      body: payload,
    });

    const count = res.count || studentParsedRunners.value.length;
    const skippedCount = studentSkippedRunners.value.length;

    if (res.runners && Array.isArray(res.runners)) {
      const newRunners = res.runners;
      const existingIds = new Set(registrations.value.map((r) => r.id));
      const filteredNew = newRunners.filter((r) => !existingIds.has(r.id));
      registrations.value = [...filteredNew, ...registrations.value];
      persistCache(registrations.value);
    } else {
      await fetchRegistrations(true);
    }

    isStudentCsvModalOpen.value = false;
    studentParsedRunners.value = [];
    studentSkippedRunners.value = [];
    studentRawRows.value = [];
    if (studentCsvFileInputRef.value) studentCsvFileInputRef.value.value = "";

    showNotice(
      `🎉 Successfully added ${count} ${studentImportUnit.value} student(s) directly via CSV!\n\n• Category: 3KM\n• Shirt: Event Shirt (Large)\n• Default Email: ${studentImportUnit.value === "BEU" ? "is@lsu.edu.ph" : "dev@lsu.edu.ph"}\n• Skipped: ${skippedCount} already-registered student(s)\n\nRace BIB numbers have been automatically allocated and payment status marked as Confirmed.`,
      "Students CSV Import Successful",
      "success"
    );
  } catch (err) {
    console.error("Student CSV import error:", err);
    showNotice(
      err?.data?.message || err?.message || "Failed to import students from CSV. Please check the data format and try again.",
      "Import Failed",
      "error"
    );
  } finally {
    isImportingStudentCsv.value = false;
  }
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
  { key: 'partner_office', label: 'Partner Office' },
  { key: 'organization', label: 'Club / Organization' },
  { key: 'affiliation', label: 'Batch / Affiliation' },
  { key: 'tshirt_size', label: 'T-Shirt Size' },
  { key: 'pet_name', label: 'Pet Name' },
  { key: 'pet_type', label: 'Pet Type' },
  { key: 'pet_bandana', label: 'Pet Bandana' },
  { key: 'pet_vaccinated', label: 'Pet Vaccinated' },
  { key: 'payment_option', label: 'Payment Option' },
  { key: 'payment_status', label: 'Payment Status' },
  { key: 'receipt', label: 'Receipt' },
  { key: 'total_amount', label: 'Total Amount (PHP)' },
  { key: 'reg_date', label: 'Registration Date' },
  { key: 'confirmed_date', label: 'Confirmed Date' },
  { key: 'confirmed_by', label: 'Confirmed By' },
  { key: 'locked_by', label: 'Batch Locked By' },
  { key: 'locked_at', label: 'Batch Locked At' },
  { key: 'messages_count', label: 'Messages Count' },
];

const DEFAULT_COLUMNS = [
  'full_name', 'category', 'classification', 'payment_status', 'receipt'
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
      partner_office: escapeCsv(r.partner_office || ""),
      organization: escapeCsv(r.organization || ""),
      affiliation: escapeCsv(r.alumni_batch || ""),
      tshirt_size: escapeCsv(r.tshirt_size || "M"),
      pet_name: escapeCsv(r.pet_name || ""),
      pet_type: escapeCsv(r.pet_type || ""),
      pet_bandana: escapeCsv((r.run_category || "").toUpperCase().startsWith("1K") || r.pet_name || r.pet_bandana_size || r.pet_bandana ? "Standard" : ""),
      pet_vaccinated: escapeCsv(r.pet_vaccinated ? "Yes" : "No"),
      payment_option: escapeCsv(r.payment_type || ""),
      payment_status: escapeCsv(r.payment_status || ""),
      receipt: escapeCsv(r.proof_of_payment || ""),
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
  } catch { }
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
    } catch { }
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

const CHAT_ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const CHAT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const handleChatAttachmentChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const isAllowed = CHAT_ACCEPTED_TYPES.includes(file.type) || file.type.startsWith('image/');
  if (!isAllowed) {
    showNotice('Only JPG, JPEG, PNG, WEBP, or PDF files are allowed.', 'Invalid File Type', 'error');
    event.target.value = '';
    return;
  }
  let targetFile = file;
  const isImage = file.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(file.name);
  if (isImage) {
    targetFile = await compressImageIfNeeded(file, CHAT_MAX_SIZE);
  }
  if (targetFile.size > CHAT_MAX_SIZE) {
    showNotice(`File exceeds the 10 MB limit (${(targetFile.size / 1024 / 1024).toFixed(2)} MB). Please compress or choose a file under 10 MB.`, 'File Too Large', 'error');
    event.target.value = '';
    return;
  }
  const previewUrl = targetFile.type.startsWith('image/') ? URL.createObjectURL(targetFile) : null;
  chatAttachment.value = { file: targetFile, previewUrl, name: targetFile.name };
  event.target.value = '';
};

const removeChatAttachment = () => {
  if (chatAttachment.value?.previewUrl) URL.revokeObjectURL(chatAttachment.value.previewUrl);
  chatAttachment.value = null;
};

const isPdfAttachment = (url, name = '') => {
  const clean = (cleanURL(url, name) || '').toLowerCase();
  const n = (name || '').toLowerCase();
  return clean.endsWith('.pdf') || n.endsWith('.pdf');
};


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
      attachmentUrl = getCleanUrl(uploadRes.url, attachment.name) || uploadRes.url || '';
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
    const status = e?.response?.status || e?.status || e?.statusCode;
    const rawError = (e?.data?.error || e?.message || "").toLowerCase();
    let msg = "Failed to send message. Please try again.";
    if (status === 413 || rawError.includes("413") || rawError.includes("too large") || rawError.includes("entity too large")) {
      msg = "Attachment is too large for the server (HTTP 413). Please attach an image under 10 MB or compress the file.";
    } else if (e?.data?.error) {
      msg = e.data.error;
    }
    showNotice(msg, "Send Failed", "error");
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

// ── High-Performance Caching for Runner Message Queries & LocalStorage ──
const readIdsCache = new Map();
const messageStatsCache = new Map();

const getCachedReadIds = (runnerId) => {
  if (readIdsCache.has(runnerId)) return readIdsCache.get(runnerId);
  let ids = [];
  try {
    const stored = localStorage.getItem(`animorun_read_${runnerId}`);
    if (stored) ids = JSON.parse(stored);
  } catch (e) { }
  readIdsCache.set(runnerId, ids);
  return ids;
};

// Determines message stats for a given runner (total count, new unread queries)
// Memoized to avoid synchronous localStorage blocking on thousands of runners
const getRunnerMessageStats = (runner) => {
  if (!runner) return { total: 0, newCount: 0, hasNew: false, unreadQueries: [] };
  const logs = Array.isArray(runner.communication_logs) ? runner.communication_logs : [];
  if (!logs.length) return { total: 0, newCount: 0, hasNew: false, unreadQueries: [] };

  const lastMsgTime = logs[logs.length - 1]?.timestamp || logs[logs.length - 1]?.created_at || '';
  const cacheKey = `${runner.id}_${logs.length}_${lastMsgTime}`;
  if (messageStatsCache.has(cacheKey)) return messageStatsCache.get(cacheKey);

  const readIds = getCachedReadIds(runner.id);
  const unreadQueries = [];
  for (let idx = 0; idx < logs.length; idx++) {
    const msg = logs[idx];
    const isRegistrant = msg.sender_type === 'registrant' || (msg.sender_type !== 'admin' && msg.sender !== 'Admin');
    if (!isRegistrant) continue;
    if (msg.read_by_admin === true || msg.is_read === true) continue;
    if (msg.message_id && readIds.includes(msg.message_id)) continue;
    if (msg.timestamp && readIds.includes(msg.timestamp)) continue;
    const hasSubsequentAdminReply = logs.slice(idx + 1).some(m => m.sender_type === 'admin' || m.sender === 'Admin');
    if (hasSubsequentAdminReply) continue;
    unreadQueries.push(msg);
  }

  const result = { total: logs.length, newCount: unreadQueries.length, hasNew: unreadQueries.length > 0, unreadQueries };
  messageStatsCache.set(cacheKey, result);
  return result;
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
  } catch (e) { }
  readIdsCache.set(runner.id, readIds);
  messageStatsCache.clear();

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


// ── Progressive Rendering for faster load & smooth transitions ────────────
const INITIAL_CHUNK = 80;
const CHUNK_STEP = 60;
const renderLimit = ref(INITIAL_CHUNK);
const loadMoreSentinelMobile = ref(null);
const loadMoreSentinelDesktop = ref(null);
let mobileObserver = null;
let desktopObserver = null;

const displayedRegistrations = computed(() => filteredRegistrations.value.slice(0, renderLimit.value));
const hasMoreToRender = computed(() => renderLimit.value < filteredRegistrations.value.length);

const loadMoreRegistrations = () => {
  renderLimit.value = Math.min(renderLimit.value + CHUNK_STEP, filteredRegistrations.value.length);
};
const loadAllRegistrations = () => {
  renderLimit.value = filteredRegistrations.value.length;
};

const initScrollObservers = () => {
  if (typeof IntersectionObserver === 'undefined') return;
  if (mobileObserver) mobileObserver.disconnect();
  if (desktopObserver) desktopObserver.disconnect();
  const handleIntersect = (entries) => {
    if (entries[0]?.isIntersecting && hasMoreToRender.value) loadMoreRegistrations();
  };
  mobileObserver = new IntersectionObserver(handleIntersect, { rootMargin: '300px' });
  desktopObserver = new IntersectionObserver(handleIntersect, { rootMargin: '300px' });
  nextTick(() => {
    if (loadMoreSentinelMobile.value) mobileObserver.observe(loadMoreSentinelMobile.value);
    if (loadMoreSentinelDesktop.value) desktopObserver.observe(loadMoreSentinelDesktop.value);
  });
};

watch(loadMoreSentinelMobile, (el) => { if (mobileObserver && el) mobileObserver.observe(el); });
watch(loadMoreSentinelDesktop, (el) => { if (desktopObserver && el) desktopObserver.observe(el); });

// ── Quick Filter Helpers & Accordion State ─────────────────────────
const isFilterExpanded = ref(false);

// Reset render limit when filters change
watch(
  [searchQuery, selectedAcademicUnit, selectedCategory, selectedStatus, selectedPaymentType, selectedReceipt, selectedParticipantType, selectedAgeGroup, selectedChatFilter, selectedBatch, selectedLockStatus, selectedKitStatus, dateFrom, dateTo, sortBy],
  () => { renderLimit.value = INITIAL_CHUNK; }
);

const activeFilterCount = computed(() => {
  let count = 0;
  if (selectedAcademicUnit.value !== "All") count++;
  if (selectedCategory.value !== "All") count++;
  if (selectedStatus.value !== "All") count++;
  if (selectedPaymentType.value !== "All") count++;
  if (selectedReceipt.value !== "All") count++;
  if (selectedParticipantType.value !== "All") count++;
  if (selectedAgeGroup.value !== "All") count++;
  if (selectedChatFilter.value !== "All") count++;
  if (selectedBatch.value !== "All") count++;
  if (selectedLockStatus.value !== "All") count++;
  if (selectedKitStatus.value !== "All") count++;
  if (dateFrom.value !== "" || dateTo.value !== "") count++;
  return count;
});

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== "" || activeFilterCount.value > 0;
});

const resetAllFilters = () => {
  searchQuery.value = "";
  selectedCategory.value = "All";
  selectedStatus.value = "All";
  selectedPaymentType.value = "All";
  selectedReceipt.value = "All";
  selectedParticipantType.value = "All";
  selectedAgeGroup.value = "All";
  selectedAcademicUnit.value = "All";
  selectedBatch.value = "All";
  selectedLockStatus.value = "All";
  selectedKitStatus.value = "All";
  dateFrom.value = "";
  dateTo.value = "";
  selectedChatFilter.value = "All";
};

// ── Race Kit Claiming & Inclusions Checklist State ──────────────────────
const isQrScannerModalOpen = ref(false);
const isClaimVerificationModalOpen = ref(false);
const isRunnerQrPassModalOpen = ref(false);
const isMarkingKitReady = ref(false);
const isConfirmingClaim = ref(false);
const isBulkMarkingReady = ref(false);
const bulkMarkReadyProgress = ref({ current: 0, total: 0, success: 0, failed: 0 });
const bulkMarkReadyModal = ref({ show: false });

const promptBulkMarkKitReady = () => {
  if (!selectedIds.value.length || isBulkMarkingReady.value) {
    showFastToast("Please select at least one runner.", "info");
    return;
  }
  bulkMarkReadyModal.value.show = true;
};

const closeBulkMarkReadyModal = () => {
  bulkMarkReadyModal.value.show = false;
};
const isResendingClaimEmail = ref(false);
const isUnclaiming = ref(false);
const unclaimConfirmModal = ref({
  show: false,
  runner: null,
});

const activeClaimRunner = ref(null);
const claimInclusions = ref([]);
const selectedClaimInclusions = ref([]);
const claimQrPassData = ref(null);
const manualSearchQuery = ref("");
const isVerifyingCode = ref(false);
const scannerErrorMessage = ref("");
let html5QrCodeScanner = null;

const allInclusionsChecked = computed(() => {
  return claimInclusions.value.length > 0 && selectedClaimInclusions.value.length === claimInclusions.value.length;
});

const toggleAllInclusions = () => {
  if (allInclusionsChecked.value) {
    selectedClaimInclusions.value = [];
  } else {
    selectedClaimInclusions.value = [...claimInclusions.value];
  }
};

const getInclusionsForRunner = (runner) => {
  if (!runner) return [];
  const cat = (runner.run_category || "").toUpperCase().trim();
  const tshirtStr = (runner.tshirt_size || "").trim();
  let parsedShirts = [];
  if (tshirtStr) {
    const parts = tshirtStr.split(";").map((p) => p.trim()).filter(Boolean);
    parts.forEach((p) => {
      if (p.includes(":")) {
        const [stype, sz] = p.split(":");
        if (stype && sz) parsedShirts.push(`${stype.trim()}: ${sz.trim().toUpperCase()}`);
      } else {
        parsedShirts.push(`Event Shirt: ${p.toUpperCase()}`);
      }
    });
  }
  if (!parsedShirts.length) {
    parsedShirts.push("Event Shirt: M");
  }

  const items = [];
  if (cat.startsWith("1K")) {
    items.push(`Pet Owner's Shirt: ${parsedShirts[0] || "Event Shirt"}`);
    items.push("Pet Bandana");
    items.push("Race Bib");
    items.push("Post-Meal");
    if (runner.pet_name) items.push(`Pet Treat (${runner.pet_name})`);
    else items.push("Pet Treat");
    items.push("Acrylic Finisher Medal");
  } else if (cat.startsWith("3K")) {
    parsedShirts.forEach((s) => items.push(s));
    items.push("Post-Meal");
    items.push("Race Bib");
    items.push("Metal Finisher Medal");
  } else if (cat.startsWith("10K")) {
    parsedShirts.forEach((s) => items.push(s));
    items.push("Post-Meal");
    items.push("Race Bib");
    items.push("Metal Finisher Medal");
  } else if (cat.startsWith("20K")) {
    parsedShirts.forEach((s) => items.push(s));
    const hasFinisher = parsedShirts.some((s) => s.toLowerCase().includes("finisher"));
    if (!hasFinisher) items.push("Finisher Shirt");
    items.push("Post-Meal");
    items.push("Race Bib");
    items.push("Metal Finisher Medal");
  } else {
    parsedShirts.forEach((s) => items.push(s));
    items.push("Post-Meal");
    items.push("Race Bib");
    items.push("Finisher Medal");
  }
  return items;
};

const openQrClaimScanner = async () => {
  isQrScannerModalOpen.value = true;
  scannerErrorMessage.value = "";
  manualSearchQuery.value = "";
  await nextTick();
  startCameraScanner();
};

const closeQrClaimScanner = () => {
  stopCameraScanner();
  isQrScannerModalOpen.value = false;
};

const startCameraScanner = async () => {
  try {
    const { Html5Qrcode } = await import("html5-qrcode");
    const container = document.getElementById("qr-reader-camera");
    if (!container) return;

    if (html5QrCodeScanner) {
      try {
        await html5QrCodeScanner.stop();
      } catch (e) { }
    }

    html5QrCodeScanner = new Html5Qrcode("qr-reader-camera");
    const config = {
      fps: 20,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdge * 0.75);
        return { width: Math.max(qrboxSize, 160), height: Math.max(qrboxSize, 160) };
      },
      aspectRatio: 1.0,
    };

    await html5QrCodeScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        handleQrCodeDetected(decodedText);
      }
    );

    // Ensure video fills the entire viewport without letterboxing or black gaps
    const video = container.querySelector("video");
    if (video) {
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.borderRadius = "1rem";
    }
  } catch (err) {
    console.warn("Camera start failed, falling back to manual entry:", err);
    scannerErrorMessage.value = "Camera access not allowed or unavailable. You can search by Bib # or Name below.";
  }
};

const stopCameraScanner = () => {
  if (html5QrCodeScanner) {
    try {
      html5QrCodeScanner.stop().catch(() => { });
      html5QrCodeScanner.clear().catch(() => { });
    } catch (e) { }
    html5QrCodeScanner = null;
  }
};

const handleQrCodeDetected = async (code) => {
  if (!code || isVerifyingCode.value) return;
  try {
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
  } catch (e) { }
  stopCameraScanner();
  isQrScannerModalOpen.value = false;
  await verifyAndOpenClaimModal(code);
};

const verifyAndOpenClaimModal = async (code) => {
  if (!code) return;
  isVerifyingCode.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/claim-verify/`, {
      method: "POST",
      body: { code },
    });
    if (res && res.found && res.runner) {
      activeClaimRunner.value = res.runner;
      claimInclusions.value = res.inclusions || getInclusionsForRunner(res.runner);
      if (res.is_claimed && res.claimed_inclusions && res.claimed_inclusions.length) {
        selectedClaimInclusions.value = [...res.claimed_inclusions];
      } else {
        selectedClaimInclusions.value = [...claimInclusions.value];
      }
      isClaimVerificationModalOpen.value = true;
    } else {
      showNotice(res?.error || `No runner found for "${code}".`, "Runner Not Found", "error");
    }
  } catch (err) {
    console.error("Verification error:", err);
    showNotice(err.data?.error || `Unable to find runner with code or Bib "${code}".`, "Verification Error", "error");
  } finally {
    isVerifyingCode.value = false;
  }
};

const openRunnerClaimModal = (runner) => {
  activeClaimRunner.value = runner;
  const inc = getInclusionsForRunner(runner);
  claimInclusions.value = inc;
  if (runner.kit_claimed && runner.kit_inclusions_claimed && runner.kit_inclusions_claimed.length) {
    selectedClaimInclusions.value = [...runner.kit_inclusions_claimed];
  } else {
    selectedClaimInclusions.value = [...inc];
  }
  isClaimVerificationModalOpen.value = true;
};

const closeClaimVerificationModal = () => {
  closeValidIdCamera();
  isClaimVerificationModalOpen.value = false;
  activeClaimRunner.value = null;
};

const executeConfirmClaim = async () => {
  if (!activeClaimRunner.value || isConfirmingClaim.value) return;
  isConfirmingClaim.value = true;
  const runnerId = activeClaimRunner.value.id;
  const operator = currentOperator.value;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${runnerId}/confirm-claim/`, {
      method: "POST",
      body: {
        claimed_by: operator,
        inclusions: selectedClaimInclusions.value,
      },
    });

    if (res?.data) {
      const idx = registrations.value.findIndex((r) => r.id === runnerId);
      if (idx !== -1) {
        registrations.value[idx] = { ...registrations.value[idx], ...res.data };
      }
      if (selectedRunner.value && selectedRunner.value.id === runnerId) {
        selectedRunner.value = { ...selectedRunner.value, ...res.data };
      }
      activeClaimRunner.value = { ...activeClaimRunner.value, ...res.data };
    } else {
      const nowStr = new Date().toISOString();
      const updated = {
        kit_claimed: true,
        kit_claimed_at: nowStr,
        kit_claimed_by: operator,
        kit_inclusions_claimed: selectedClaimInclusions.value,
        kit_ready: true,
      };
      const idx = registrations.value.findIndex((r) => r.id === runnerId);
      if (idx !== -1) registrations.value[idx] = { ...registrations.value[idx], ...updated };
      if (selectedRunner.value && selectedRunner.value.id === runnerId) selectedRunner.value = { ...selectedRunner.value, ...updated };
    }

    const emailNotice = activeClaimRunner.value?.contact_email ? ` Confirmation email with "See you in the event day!" dispatched to ${activeClaimRunner.value.contact_email}.` : '';
    showNotice(
      `Race kit successfully released to ${activeClaimRunner.value.firstname} ${activeClaimRunner.value.lastname} (${activeClaimRunner.value.run_number})!${emailNotice}`,
      "Kit Claimed & Released",
      "success"
    );
    closeClaimVerificationModal();
  } catch (err) {
    console.error("Claim confirmation error:", err);
    showNotice(err.data?.error || "Failed to confirm kit claiming. Please try again.", "Error", "error");
  } finally {
    isConfirmingClaim.value = false;
  }
};

const resendClaimEmail = async (runner) => {
  const target = (runner && runner.id) ? runner : (activeClaimRunner.value || unclaimConfirmModal.value?.runner);
  if (!target || !target.id || isResendingClaimEmail.value) return;
  isResendingClaimEmail.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${target.id}/resend-claim-email/`, {
      method: "POST",
    });
    showNotice(
      res.message || `Claim confirmation email sent to ${target.contact_email || target.email}!`,
      "Email Dispatched",
      "success"
    );
  } catch (err) {
    console.error("Resend claim email error:", err);
    showNotice(err.data?.error || "Failed to resend claim email.", "Error", "error");
  } finally {
    isResendingClaimEmail.value = false;
  }
};

const promptUnclaim = (runner) => {
  const target = (runner && runner.id) ? runner : activeClaimRunner.value;
  if (!target || !target.id) return;
  unclaimConfirmModal.value = {
    show: true,
    runner: target,
  };
};

const closeUnclaimConfirmModal = () => {
  unclaimConfirmModal.value = {
    show: false,
    runner: null,
  };
};

const executeUnclaim = async (runner) => {
  const target = (runner && runner.id) ? runner : (unclaimConfirmModal.value?.runner || activeClaimRunner.value);
  if (!target || !target.id || isUnclaiming.value) return;
  isUnclaiming.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${target.id}/unclaim/`, {
      method: "POST",
    });
    if (res?.data) {
      const idx = registrations.value.findIndex((r) => r.id === target.id);
      if (idx !== -1) registrations.value[idx] = { ...registrations.value[idx], ...res.data };
      if (selectedRunner.value && selectedRunner.value.id === target.id) selectedRunner.value = { ...selectedRunner.value, ...res.data };
      if (activeClaimRunner.value && activeClaimRunner.value.id === target.id) activeClaimRunner.value = { ...activeClaimRunner.value, ...res.data };
    }
    closeUnclaimConfirmModal();
    showNotice(`Claim status reverted for ${target.firstname} ${target.lastname}.`, "Claim Reverted", "success");
    showFastToast(`Claim status reverted for ${target.firstname} ${target.lastname}.`, "success");
    closeClaimVerificationModal();
  } catch (err) {
    console.error("Unclaim error:", err);
    closeUnclaimConfirmModal();
    showNotice(err.data?.error || "Failed to revert claim status.", "Error", "error");
  } finally {
    isUnclaiming.value = false;
  }
};

const markKitReadyAndNotify = async (runner, options = {}) => {
  const { silent = false, force = false } = options;
  if (!runner) return { success: false, error: "No runner specified" };
  if (!force && isMarkingKitReady.value) return { success: false, error: "Operation in progress" };

  if (!silent) {
    isMarkingKitReady.value = true;
  }
  const operator = currentOperator.value || "Admin";

  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/mark-kit-ready/`, {
      method: "POST",
      body: { operator },
    });

    const nowIso = new Date().toISOString();
    const serverData = res?.data || {};

    // 1. Reactive in-place update of runner instance
    runner.kit_ready = true;
    runner.kit_ready_by = operator;
    runner.kit_ready_at = serverData.kit_ready_at || nowIso;
    if (serverData.claim_qr_code) {
      runner.claim_qr_code = serverData.claim_qr_code;
    }

    // 2. Synchronize inside registrations array
    const idx = registrations.value.findIndex((r) => r.id === runner.id);
    if (idx !== -1) {
      registrations.value[idx] = {
        ...registrations.value[idx],
        ...serverData,
        kit_ready: true,
        kit_ready_by: operator,
        kit_ready_at: serverData.kit_ready_at || nowIso,
      };
    }

    // 3. Synchronize selectedRunner if currently viewed
    if (selectedRunner.value && selectedRunner.value.id === runner.id) {
      selectedRunner.value = {
        ...selectedRunner.value,
        ...serverData,
        kit_ready: true,
        kit_ready_by: operator,
        kit_ready_at: serverData.kit_ready_at || nowIso,
      };
    }

    // 4. Synchronize claimQrPassData if currently open
    if (claimQrPassData.value && claimQrPassData.value.runner && claimQrPassData.value.runner.id === runner.id) {
      Object.assign(claimQrPassData.value.runner, {
        ...serverData,
        kit_ready: true,
        kit_ready_by: operator,
        kit_ready_at: serverData.kit_ready_at || nowIso,
      });
      if (serverData.claim_qr_code) {
        claimQrPassData.value.claim_code = serverData.claim_qr_code;
      }
    }

    if (!silent) {
      const emailTarget = runner.contact_email || runner.email || "registrant";
      showNotice(
        `Race kit marked ready for ${runner.firstname} ${runner.lastname}. Claiming email with QR code sent to ${emailTarget}!`,
        "Claiming Email Notified",
        "success"
      );
    }

    return { success: true, runner, data: serverData };
  } catch (err) {
    console.error(`Mark ready error for runner #${runner?.id}:`, err);
    if (!silent) {
      showNotice(
        err.data?.error || "Failed to send kit claiming email. Please try again.",
        "Email Failed",
        "error"
      );
    }
    return { success: false, runner, error: err };
  } finally {
    if (!silent) {
      isMarkingKitReady.value = false;
    }
  }
};

const executeBulkMarkKitReady = async () => {
  if (!selectedIds.value.length || isBulkMarkingReady.value) return;

  closeBulkMarkReadyModal();

  isBulkMarkingReady.value = true;
  const targetIds = [...selectedIds.value];

  // Map selected IDs to runner instances
  const runnerMap = new Map(registrations.value.map((r) => [r.id, r]));
  const runnersToProcess = targetIds.map((id) => runnerMap.get(id) || { id, firstname: `Runner #${id}`, lastname: "" });

  bulkMarkReadyProgress.value = {
    current: 0,
    total: runnersToProcess.length,
    success: 0,
    failed: 0,
  };

  showFastToast(`Starting to dispatch claiming emails to ${runnersToProcess.length} runner(s)...`, "info", 2000);

  // Controlled concurrency pool (concurrency limit = 6)
  // Sends each individual email via markKitReadyAndNotify so every selected runner is dispatched
  const CONCURRENCY = 6;
  let cursor = 0;

  const worker = async () => {
    while (cursor < runnersToProcess.length) {
      const currentIndex = cursor++;
      const runner = runnersToProcess[currentIndex];
      try {
        const res = await markKitReadyAndNotify(runner, { silent: true, force: true });
        if (res && res.success) {
          bulkMarkReadyProgress.value.success++;
        } else {
          bulkMarkReadyProgress.value.failed++;
        }
      } catch (e) {
        bulkMarkReadyProgress.value.failed++;
      } finally {
        bulkMarkReadyProgress.value.current++;
      }
    }
  };

  try {
    const workerCount = Math.min(CONCURRENCY, runnersToProcess.length);
    const workers = Array.from({ length: workerCount }, () => worker());
    await Promise.all(workers);

    const { total, success, failed } = bulkMarkReadyProgress.value;
    clearSelection();

    if (failed === 0) {
      showNotice(
        `🎉 Successfully sent kit claiming emails with QR codes to all ${success} runner(s)!`,
        "All Emails Dispatched",
        "success"
      );
    } else {
      showNotice(
        `Bulk dispatch completed for ${total} runner(s): ${success} email(s) sent successfully, ${failed} failed.`,
        "Bulk Notice Completed",
        success > 0 ? "warning" : "error"
      );
    }
  } catch (err) {
    console.error("Bulk mark ready error:", err);
    showNotice("An error occurred during bulk email dispatch.", "Bulk Notice Failed", "error");
  } finally {
    isBulkMarkingReady.value = false;
  }
};

const openRunnerQrPassModal = async (runner) => {
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/qr-code/`);
    claimQrPassData.value = {
      runner,
      qr_code_base64: res.qr_code_base64,
      qr_code_url: res.qr_code_url,
      claim_code: res.claim_code,
      inclusions: res.inclusions || getInclusionsForRunner(runner),
    };
    isRunnerQrPassModalOpen.value = true;
  } catch (err) {
    const fallbackCode = runner.claim_qr_code || `ANIMORUN-CLAIM:${runner.id}:${runner.run_number}`;
    claimQrPassData.value = {
      runner,
      claim_code: fallbackCode,
      qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(fallbackCode)}&color=064e3b`,
      inclusions: getInclusionsForRunner(runner),
    };
    isRunnerQrPassModalOpen.value = true;
  }
};

const closeRunnerQrPassModal = () => {
  isRunnerQrPassModalOpen.value = false;
  claimQrPassData.value = null;
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
        'relative overflow-hidden rounded-2xl lg:px-4 px-3 py-2.5 border shadow-md transition-all',
        props.darkMode
          ? 'bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-green-800/40 text-white'
          : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 border-emerald-600 text-white',
      ]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 relative z-10">
          <div class="flex items-center gap-2">
            <h1 class="text-sm sm:text-base text-white font-black tracking-tight leading-snug flex items-center gap-2">
              <i class="fas fa-list text-amber-300"></i>
              <span>THE EMERALD RUN</span>
            </h1>
            <span class="hidden md:inline-block text-xs text-emerald-200/90 border-l border-white/20 pl-2">
              Track, verify & manage runner registrations & supplier batches
            </span>
          </div>

          <!-- Live indicator & Manual Refresh Button -->
          <button type="button" @click="fetchRegistrations(false)" :disabled="isFetching || isAutoRefreshing"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white text-[11px] font-medium transition cursor-pointer disabled:opacity-75 select-none"
            title="Click to refresh registrations">
            <span
              :class="['w-1.5 h-1.5 rounded-full flex-shrink-0', isAutoRefreshing || isFetching ? 'bg-amber-300 animate-ping' : 'bg-emerald-400 animate-pulse']"></span>
            <span v-if="isFetching" class="text-emerald-100 flex items-center gap-1">Fetching… <i
                class="fas fa-spinner fa-spin text-[9px]"></i></span>
            <span v-else-if="isAutoRefreshing" class="text-amber-200 flex items-center gap-1">Syncing… <i
                class="fas fa-arrows-rotate fa-spin text-[9px]"></i></span>
            <span v-else-if="formatLastUpdated" class="text-emerald-200">Live · {{ formatLastUpdated }} <i
                class="fas fa-rotate text-[9px] ml-1 opacity-75"></i></span>
            <span v-else class="text-white/80">Live <i class="fas fa-rotate text-[9px] ml-1 opacity-75"></i></span>
          </button>
        </div>
      </div>

      <!-- ── ADVANCED SEARCH & FILTER TOOLBAR (MINIMIZED ACCORDION DESIGN) ── -->
      <div class="w-full">
        <div :class="[
          'p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border shadow-sm transition-all duration-300 w-full',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <!-- ── ROW 1: DEFAULT COMPACT BAR (SEARCH INPUT RETAINED BY DEFAULT) ── -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5">

            <!-- SEARCH INPUT (Retained as primary default filter) -->
            <div class="relative flex-1 min-w-[220px]">
              <i class="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400"></i>
              <input v-model="searchQuery" type="text" placeholder="Search Name, Reg ID, Bib #, Email, Course, Batch..."
                :class="[
                  'w-full pl-9 pr-8 py-2 rounded-xl sm:rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                  props.darkMode
                    ? 'bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500'
                    : 'bg-slate-50 border-gray-300 text-gray-800 placeholder-gray-400',
                ]" />
              <!-- Clear Search button -->
              <button v-if="searchQuery" type="button" @click="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-xs p-1"
                title="Clear search">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- CONTROLS & ACTIONS GROUP -->
            <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap shrink-0">

              <!-- ACCORDION / TOGGLE MINIMIZE BUTTON -->
              <button type="button" @click="isFilterExpanded = !isFilterExpanded" :class="[
                'px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border select-none shadow-xs',
                isFilterExpanded
                  ? (props.darkMode ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' : 'bg-emerald-600 text-white border-emerald-600 shadow-md')
                  : activeFilterCount > 0
                    ? (props.darkMode ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30' : 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400/30')
                    : (props.darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-gray-700')
              ]" :title="isFilterExpanded ? 'Minimize / Collapse filters' : 'Expand / Show advanced filters'">
                <i
                  :class="['fas fa-sliders text-[11px] transition-transform duration-300 ease-in-out', isFilterExpanded ? 'text-amber-300 rotate-90' : '']"></i>
                <span>Filters</span>
                <!-- Active badge count if any advanced filter is set -->
                <span v-if="activeFilterCount > 0" :class="[
                  'px-1.5 py-0.2 rounded-full text-[10px] font-black',
                  isFilterExpanded
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-emerald-600 text-white dark:bg-emerald-500'
                ]">
                  {{ activeFilterCount }}
                </span>
                <!-- Accordion Chevron Arrow -->
                <i :class="[
                  'fas fa-chevron-down text-[10px] transition-transform duration-300 ease-in-out ml-0.5',
                  isFilterExpanded ? 'rotate-180' : ''
                ]"></i>
              </button>

              <!-- Quick Reset button (visible whenever any filter or search is active) -->
              <button v-if="hasActiveFilters" type="button" @click="resetAllFilters" :class="[
                'px-2.5 py-2 rounded-xl sm:rounded-2xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer border',
                props.darkMode ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/60 text-rose-300' : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
              ]" title="Reset all filters and search">
                <i class="fas fa-rotate-left text-[10px]"></i>
                <span class="hidden sm:inline">Reset</span>
              </button>

              <!-- Scan QR Code for Claiming button (Mobile & Desktop) -->
              <button type="button" @click="openQrClaimScanner"
                class="px-2.5 sm:px-3.5 py-2 rounded-xl sm:rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border shadow-sm select-none active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-500 hover:shadow-md"
                title="Scan QR Code to Verify Details & Claim Race Kit">
                <i class="fas fa-qrcode text-amber-300 text-sm"></i>
                <span>Scan QR Code</span>
              </button>

              <!-- Supplier Batches History button -->
              <button type="button" @click="openBatchHistoryModal" :class="[
                'px-2.5 sm:px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border shadow-xs',
                props.darkMode ? 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-200' : 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 text-white'
              ]" title="Supplier Batches History">
                <i class="fas fa-boxes text-[11px]"></i>
                <span class="hidden md:inline">Batches</span>
                <span v-if="batchesList.length"
                  class="px-1.5 py-0.2 rounded-full bg-amber-400 text-gray-900 font-black text-[10px]">
                  {{ batchesList.length }}
                </span>
              </button>

              <!-- Messages / Chat Inquiry Filter button -->
              <button type="button" @click="toggleChatFilter" :class="[
                'px-2.5 sm:px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border shadow-xs select-none',
                chatFilterActive
                  ? 'bg-rose-500 text-white border-rose-300 ring-2 ring-rose-300 font-bold'
                  : totalNewQueriesCount > 0
                    ? 'bg-rose-500/90 hover:bg-rose-500 text-white border-rose-400 shadow-md animate-pulse'
                    : (props.darkMode ? 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-200' : 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 text-white')
              ]"
                :title="`Click to ${chatFilterActive ? 'clear filter' : 'filter runners with new message queries'} (${totalNewQueriesCount} new queries, ${totalRunnersWithChatCount} active threads)`">
                <i class="fas fa-comments text-[11px]" :class="chatFilterActive ? 'text-white' : 'text-amber-300'"></i>
                <span class="hidden md:inline">Messages</span>
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
              <button type="button" @click="isColumnPickerModalOpen = true" :class="[
                'px-2.5 sm:px-3 py-2 rounded-xl sm:rounded-2xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border shadow-xs',
                props.darkMode ? 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-200' : 'bg-emerald-700 hover:bg-emerald-800 border-emerald-800 text-white'
              ]" title="Customize Visible Columns">
                <i class="fas fa-table-columns text-amber-300 text-[11px]"></i>
                <span class="hidden md:inline">Columns</span>
                <span class="px-1.5 py-0.2 rounded-full bg-emerald-400 text-gray-900 font-black text-[10px]">
                  {{ selectedCsvColumns.length }}
                </span>
              </button>

            </div>
          </div>

          <!-- ── ACTIVE FILTER PILLS (SHOWN WHEN MINIMIZED BUT ADVANCED FILTERS ACTIVE) ── -->
          <div v-if="!isFilterExpanded && activeFilterCount > 0"
            class="flex items-center gap-1.5 pt-2.5 mt-2 border-t dark:border-gray-700/60 flex-wrap text-xs animate-[fadeSlideIn_0.2s_ease-out]">
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1 mr-1">
              <i class="fas fa-filter text-[10px] text-emerald-500"></i> Active:
            </span>

            <!-- Academic Unit pill -->
            <span v-if="selectedAcademicUnit !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Unit: {{ selectedAcademicUnit }}
              <button type="button" @click="selectedAcademicUnit = 'All'"
                class="hover:text-emerald-950 dark:hover:text-white ml-0.5" title="Remove unit filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Category pill -->
            <span v-if="selectedCategory !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              Cat: {{ selectedCategory }}
              <button type="button" @click="selectedCategory = 'All'"
                class="hover:text-amber-950 dark:hover:text-white ml-0.5" title="Remove category filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Status pill -->
            <span v-if="selectedStatus !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
              Status: {{ selectedStatus }}
              <button type="button" @click="selectedStatus = 'All'"
                class="hover:text-blue-950 dark:hover:text-white ml-0.5" title="Remove status filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Payment Method pill -->
            <span v-if="selectedPaymentType !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Method: {{ formatPaymentType(selectedPaymentType) }}
              <button type="button" @click="selectedPaymentType = 'All'"
                class="hover:text-emerald-950 dark:hover:text-white ml-0.5" title="Remove payment method filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Receipt pill -->
            <span v-if="selectedReceipt !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
              Receipt: {{ selectedReceipt === 'has_receipt' ? 'Has Receipt' : 'Without Receipt' }}
              <button type="button" @click="selectedReceipt = 'All'"
                class="hover:text-emerald-950 dark:hover:text-white ml-0.5" title="Remove receipt filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Classification pill -->
            <span v-if="selectedParticipantType !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
              {{ selectedParticipantType }}
              <button type="button" @click="selectedParticipantType = 'All'"
                class="hover:text-purple-950 dark:hover:text-white ml-0.5" title="Remove classification filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Age group pill -->
            <span v-if="selectedAgeGroup !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
              Age: {{ selectedAgeGroup }}
              <button type="button" @click="selectedAgeGroup = 'All'"
                class="hover:text-teal-950 dark:hover:text-white ml-0.5" title="Remove age filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Chat filter pill -->
            <span v-if="selectedChatFilter !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
              Msg: {{ selectedChatFilter }}
              <button type="button" @click="selectedChatFilter = 'All'"
                class="hover:text-rose-950 dark:hover:text-white ml-0.5" title="Remove message filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Date range pill -->
            <span v-if="dateFrom || dateTo"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
              Date: {{ dateFrom || '...' }} → {{ dateTo || '...' }}
              <button type="button" @click="clearDateRange" class="hover:text-indigo-950 dark:hover:text-white ml-0.5"
                title="Clear date range">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Batch pill -->
            <span v-if="selectedBatch !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-700">
              Batch: {{ selectedBatch }}
              <button type="button" @click="selectedBatch = 'All'"
                class="hover:text-orange-950 dark:hover:text-white ml-0.5" title="Remove batch filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>

            <!-- Lock status pill -->
            <span v-if="selectedLockStatus !== 'All'"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-700">
              Lock: {{ selectedLockStatus }}
              <button type="button" @click="selectedLockStatus = 'All'"
                class="hover:text-violet-950 dark:hover:text-white ml-0.5" title="Remove lock filter">
                <i class="fas fa-times text-[10px]"></i>
              </button>
            </span>
          </div>

          <!-- ── ACCORDION EXPANDED SECTION (TOGGLE MINIMIZE / EXPAND) ── -->
          <div class="accordion-wrapper" :class="{ 'is-expanded': isFilterExpanded }">
            <div class="accordion-inner">
              <div class="pt-3.5 mt-3 border-t dark:border-gray-700/70 space-y-3.5">

                <!-- ── STATS SUMMARY CARDS (4 CLEAN METRIC BOXES) ── -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <!-- Total Runners -->
                  <div :class="[
                    'px-3.5 py-2.5 rounded-2xl border shadow-xs transition flex items-center justify-between',
                    props.darkMode ? 'bg-gray-900/60 border-gray-700/80' : 'bg-slate-50 border-slate-200',
                  ]">
                    <div>
                      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <i class="fas fa-running text-emerald-500 mr-1"></i> Total Runners
                      </p>
                      <h3
                        class="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 min-h-[26px] flex items-center">
                        <span v-if="isInitialLoading"
                          class="inline-block h-5 w-12 rounded bg-emerald-100 dark:bg-emerald-950/70 animate-pulse"></span>
                        <span v-else>{{ stats.totalRunners }}</span>
                      </h3>
                    </div>
                    <div
                      class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0">
                      <i class="fas fa-users"></i>
                    </div>
                  </div>

                  <!-- Confirmed Paid -->
                  <div :class="[
                    'px-3.5 py-2.5 rounded-2xl border shadow-xs transition flex items-center justify-between',
                    props.darkMode ? 'bg-gray-900/60 border-gray-700/80' : 'bg-slate-50 border-slate-200',
                  ]">
                    <div>
                      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <i class="fas fa-check-circle text-green-500 mr-1"></i> Confirmed Paid
                      </p>
                      <h3
                        class="text-lg sm:text-xl font-black text-green-600 dark:text-green-400 mt-0.5 min-h-[26px] flex items-center">
                        <span v-if="isInitialLoading"
                          class="inline-block h-5 w-12 rounded bg-green-100 dark:bg-green-950/70 animate-pulse"></span>
                        <span v-else>{{ stats.confirmed }}</span>
                      </h3>
                    </div>
                    <div
                      class="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center text-sm shrink-0">
                      <i class="fas fa-receipt"></i>
                    </div>
                  </div>

                  <!-- Pending Action (Clickable) -->
                  <div :class="[
                    'px-3.5 py-2.5 rounded-2xl border shadow-xs transition flex items-center justify-between cursor-pointer group',
                    selectedStatus === 'Pending'
                      ? (props.darkMode ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/40' : 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/60')
                      : (props.darkMode ? 'bg-gray-900/60 border-gray-700/80 hover:border-amber-500/50' : 'bg-slate-50 border-slate-200 hover:border-amber-300'),
                  ]" @click="selectedStatus = selectedStatus === 'Pending' ? 'All' : 'Pending'"
                    :title="selectedStatus === 'Pending' ? 'Click to clear pending filter' : 'Click to filter by pending items'">
                    <div>
                      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <i class="fas fa-clock text-amber-500 mr-1"></i> Pending Action
                      </p>
                      <h3
                        class="text-lg sm:text-xl font-black text-amber-500 dark:text-amber-400 mt-0.5 min-h-[26px] flex items-center">
                        <span v-if="isInitialLoading"
                          class="inline-block h-5 w-12 rounded bg-amber-100 dark:bg-amber-950/70 animate-pulse"></span>
                        <span v-else>{{ stats.pending }}</span>
                      </h3>
                    </div>
                    <div :class="[
                      'w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 transition',
                      selectedStatus === 'Pending'
                        ? 'bg-amber-500 text-white'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200'
                    ]">
                      <i class="fas fa-hourglass-half"></i>
                    </div>
                  </div>

                  <!-- Batch Locked -->
                  <div :class="[
                    'px-3.5 py-2.5 rounded-2xl border shadow-xs transition flex items-center justify-between',
                    props.darkMode ? 'bg-gray-900/60 border-gray-700/80' : 'bg-slate-50 border-slate-200',
                  ]">
                    <div>
                      <p class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        <i class="fas fa-lock text-purple-500 mr-1"></i> Batch Locked
                      </p>
                      <h3
                        class="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5 min-h-[26px] flex items-center">
                        <span v-if="isInitialLoading"
                          class="inline-block h-5 w-12 rounded bg-purple-100 dark:bg-purple-950/70 animate-pulse"></span>
                        <span v-else>{{ stats.lockedCount }}</span>
                      </h3>
                    </div>
                    <div
                      class="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm shrink-0">
                      <i class="fas fa-box-archive"></i>
                    </div>
                  </div>
                </div>

                <!-- ── FILTER SELECT CONTROLS (9 CATEGORIES IN A CLEAN GRID) ── -->
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-2.5">
                  <!-- Academic Unit Filter (HEU / BEU) -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-graduation-cap text-emerald-500 mr-0.5"></i> Academic Unit
                    </label>
                    <select v-model="selectedAcademicUnit" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedAcademicUnit !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">All Units / Programs</option>
                      <optgroup label="🎓 HEU - All Higher Education">
                        <option value="HEU">🎓 All HEU (Bachelor & SGS) ({{ heuCount }})</option>
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

                  <!-- Distance Category Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-route text-emerald-500 mr-0.5"></i> Distance Category
                    </label>
                    <select v-model="selectedCategory" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedCategory !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">All Distance Categories</option>
                      <option value="1KM">1 KM (Pet Run)</option>
                      <option value="3KM">3 KM</option>
                      <option value="10KM">10 KM</option>
                      <option value="20KM">20 KM</option>
                    </select>
                  </div>

                  <!-- Payment Status Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-credit-card text-emerald-500 mr-0.5"></i> Payment Status
                    </label>
                    <select v-model="selectedStatus" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedStatus !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">All Payment Statuses</option>
                      <option value="Confirmed">✅ Confirmed</option>
                      <option value="Pending">⏳ All Pending</option>
                      <option value="Pending Payment">💳 Pending Payment</option>
                      <option value="Pending Approval">🔍 Pending Approval</option>
                    </select>
                  </div>

                  <!-- Payment Method Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-money-bill-transfer text-emerald-500 mr-0.5"></i> Payment Method
                    </label>
                    <select v-model="selectedPaymentType" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedPaymentType !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">All Payment Methods</option>
                      <option value="add_to_tuition">🏫 Add to Tuition ({{ paymentMethodCounts.add_to_tuition }})
                      </option>
                      <option value="salary_deduction">💼 Salary Deduction ({{ paymentMethodCounts.salary_deduction }})
                      </option>
                      <option value="family_salary_deduction">👨‍👩‍👧 Family Salary ({{
                        paymentMethodCounts.family_salary_deduction }})</option>
                      <option value="over_the_counter">💵 Over the Counter / Cash ({{
                        paymentMethodCounts.over_the_counter }})</option>
                      <option value="qr">📱 QR / GCash / Maya ({{ paymentMethodCounts.qr }})</option>
                      <option value="complimentary">🎁 Complimentary ({{ paymentMethodCounts.complimentary }})</option>
                      <option value="sponsor">🤝 Sponsor ({{ paymentMethodCounts.sponsor }})</option>
                    </select>
                  </div>

                  <!-- Receipt Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-receipt text-emerald-500 mr-0.5"></i> Receipt
                    </label>
                    <select v-model="selectedReceipt" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedReceipt !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">All Receipts</option>
                      <option value="has_receipt">🧾 Has Receipt ({{ receiptCounts.hasReceipt }})</option>
                      <option value="without_receipt">🚫 Without Receipt ({{ receiptCounts.withoutReceipt }})</option>
                    </select>
                  </div>

                  <!-- Participant Classification Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-id-badge text-emerald-500 mr-0.5"></i> Classification
                    </label>
                    <select v-model="selectedParticipantType" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedParticipantType !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">All Classifications</option>
                      <option value="VVIP">VVIP ({{ vvipCount }})</option>
                      <option value="De La Salle Brothers">De La Salle Brothers ({{ brothersCount }})</option>
                      <option value="Sponsors">Sponsors ({{ sponsorsCount }})</option>
                      <option value="LSU Exclusive - Enrolled Student">LSU Exclusive - Enrolled Student</option>
                      <option value="LSU Exclusive - Employee">LSU Exclusive - Employee</option>
                      <option value="LSU Exclusive - Alumni">LSU Exclusive - Alumni</option>
                      <option value="Open Category">Open Category</option>
                      <option value="Pet">Pet</option>
                    </select>
                  </div>

                  <!-- Age Group Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-user-clock text-emerald-500 mr-0.5"></i> Age Group
                    </label>
                    <select v-model="selectedAgeGroup" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedAgeGroup !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
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
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-comment-dots text-emerald-500 mr-0.5"></i> Chat & Inquiries
                    </label>
                    <select v-model="selectedChatFilter" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedChatFilter === 'new'
                        ? 'ring-2 ring-rose-400 font-bold !border-rose-400 bg-rose-50/70 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                        : selectedChatFilter !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">💬 All Messages</option>
                      <option value="new">🔴 New Queries ({{ totalNewQueriesCount }})</option>
                      <option value="has_messages">💬 With Chat History ({{ totalRunnersWithChatCount }})</option>
                      <option value="no_messages">⚪ No Messages</option>
                    </select>
                  </div>

                  <!-- Race Kit Claiming Status Filter -->
                  <div>
                    <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      <i class="fas fa-box-archive text-emerald-500 mr-0.5"></i> Race Kit Status
                    </label>
                    <select v-model="selectedKitStatus" :class="[
                      'w-full px-2.5 py-1.5 rounded-xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                      props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
                      selectedKitStatus !== 'All' ? 'ring-2 ring-emerald-500 font-bold !border-emerald-500' : ''
                    ]">
                      <option value="All">📦 All Kit Statuses</option>
                      <option value="ready">📫 Ready for Claiming</option>
                      <option value="claimed">✅ Claimed Kits</option>
                      <option value="pending">⏳ Not Ready / Pending</option>
                    </select>
                  </div>
                </div>

                <!-- ── QUICK PILLS & TOGGLES (ACADEMIC UNITS & CATEGORY COUNTERS) ── -->
                <div class="flex items-center justify-between gap-3 flex-wrap pt-1">
                  <div class="flex items-center gap-2 flex-wrap">

                    <!-- Academic Unit Quick Buttons -->
                    <div
                      class="flex items-center whitespace-nowrap gap-1 px-2 py-1 rounded-xl border dark:border-gray-700 bg-slate-100/70 dark:bg-gray-900/60 shadow-xs">
                      <span class="text-[10px] font-bold text-gray-400 uppercase mr-1">Unit:</span>
                      <!-- HEU -->
                      <button type="button" @click="toggleAcademicUnit('HEU')" :class="[
                        'px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none',
                        isHeuSelected
                          ? 'bg-amber-400 text-emerald-950 border-amber-300 shadow-xs scale-105'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      ]" :title="`Higher Education Unit (${heuCount} runners)`">
                        <i class="fas fa-graduation-cap text-[10px]"></i>
                        <span>HEU</span>
                        <span class="font-black text-amber-600 dark:text-amber-400"
                          :class="{ '!text-emerald-950': isHeuSelected }">
                          {{ isInitialLoading ? '...' : heuCount }}
                        </span>
                      </button>

                      <!-- BEU -->
                      <button type="button" @click="toggleAcademicUnit('BEU')" :class="[
                        'px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none',
                        isBeuSelected
                          ? 'bg-sky-400 text-sky-950 border-sky-300 shadow-xs scale-105'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                      ]" :title="`Basic Education Unit (${beuCount} runners)`">
                        <i class="fas fa-school text-[10px]"></i>
                        <span>BEU</span>
                        <span class="font-black text-sky-600 dark:text-sky-300"
                          :class="{ '!text-sky-950': isBeuSelected }">
                          {{ isInitialLoading ? '...' : beuCount }}
                        </span>
                      </button>

                      <!-- Sub-level BEU Pills -->
                      <template v-if="isBeuSelected">
                        <span class="h-3 w-px bg-gray-300 dark:bg-gray-700 mx-0.5"></span>
                        <button type="button"
                          @click.stop="selectedAcademicUnit = selectedAcademicUnit === 'Grade School' ? 'BEU' : 'Grade School'"
                          :class="[
                            'px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer select-none',
                            selectedAcademicUnit === 'Grade School'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                          ]">
                          GS ({{ beuGradeSchoolCount }})
                        </button>
                        <button type="button"
                          @click.stop="selectedAcademicUnit = selectedAcademicUnit === 'JHS' ? 'BEU' : 'JHS'" :class="[
                            'px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer select-none',
                            selectedAcademicUnit === 'JHS'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                          ]">
                          JHS ({{ beuJhsCount }})
                        </button>
                        <button type="button"
                          @click.stop="selectedAcademicUnit = selectedAcademicUnit === 'SHS' ? 'BEU' : 'SHS'" :class="[
                            'px-1.5 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer select-none',
                            selectedAcademicUnit === 'SHS'
                              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                          ]">
                          SHS ({{ beuShsCount }})
                        </button>
                      </template>
                    </div>

                    <!-- Distance Category Counters Quick Pills -->
                    <div
                      class="flex items-center whitespace-nowrap gap-1 px-2 py-1 rounded-xl border dark:border-gray-700 bg-slate-100/70 dark:bg-gray-900/60 shadow-xs">
                      <span class="text-[10px] font-bold text-gray-400 uppercase mr-1">Distance:</span>
                      <button v-for="cat in categoryCounters" :key="cat.id" type="button"
                        @click="selectedCategory = selectedCategory === cat.id ? 'All' : cat.id" :class="[
                          'px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none',
                          selectedCategory === cat.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-105'
                            : 'bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                        ]" :title="`Filter by ${cat.id} (${categoryCounts[cat.id] || 0} runners)`">
                        <span :class="['w-1.5 h-1.5 rounded-full shrink-0', cat.dot]"></span>
                        <span>{{ cat.id }}</span>
                        <span class="font-black text-amber-500 dark:text-amber-400"
                          :class="{ '!text-white': selectedCategory === cat.id }">
                          {{ isInitialLoading ? '...' : (categoryCounts[cat.id] || 0) }}
                        </span>
                      </button>
                    </div>

                    <!-- ── CSV TEMPLATE ACTIONS (DOWNLOAD & UPLOAD CSV FOR VVIP, DE LA SALLE BROTHERS, SPONSORS) ── -->
                    <div
                      class="flex items-center whitespace-nowrap gap-1 px-2 py-1 rounded-xl border dark:border-gray-700 bg-slate-100/70 dark:bg-gray-900/60 shadow-xs">
                      <span class="text-[10px] font-bold text-gray-400 uppercase mr-1 flex items-center gap-1">
                        <i class="fas fa-file-csv text-emerald-500 text-[11px]"></i> Template:
                      </span>
                      <!-- Download CSV Button -->
                      <button type="button" @click="downloadCsvTemplate"
                        class="px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-xs hover:border-emerald-300 active:scale-95"
                        title="Download official CSV template for VVIP, De La Salle Brothers, and Sponsors">
                        <i class="fas fa-download text-emerald-600 dark:text-emerald-400 text-[10px]"></i>
                        <span>Download CSV</span>
                      </button>
                      <!-- Upload CSV Button -->
                      <button type="button" @click="triggerCsvUpload"
                        class="px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs active:scale-95"
                        title="Upload CSV to add VVIP, De La Salle Brothers, and Sponsors directly">
                        <i class="fas fa-upload text-white text-[10px]"></i>
                        <span>Upload CSV</span>
                      </button>
                      <!-- Hidden file input for CSV selection -->
                      <input ref="csvFileInputRef" type="file" accept=".csv,text/csv" class="hidden"
                        @change="handleCsvFileSelected" />
                    </div>

                    <!-- ── STUDENT CSV IMPORT ACTIONS (BEU / HEU STUDENTS) ── -->
                    <div
                      class="flex items-center whitespace-nowrap gap-1 px-2 py-1 rounded-xl border dark:border-gray-700 bg-slate-100/70 dark:bg-gray-900/60 shadow-xs">
                      <span class="text-[10px] font-bold text-gray-400 uppercase mr-1 flex items-center gap-1">
                        <i class="fas fa-user-graduate text-sky-500 text-[11px]"></i> Students:
                      </span>
                      <!-- Upload BEU Button -->
                      <button type="button" @click="triggerStudentCsvUpload('BEU')"
                        class="px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none bg-sky-600 hover:bg-sky-700 text-white border-sky-600 shadow-xs active:scale-95"
                        title="Upload CSV for Basic Education Unit (BEU) Students (Defaults: 3KM, Event Shirt Large, is@lsu.edu.ph)">
                        <i class="fas fa-school text-white text-[10px]"></i>
                        <span>Import BEU</span>
                      </button>
                      <!-- Upload HEU Button -->
                      <button type="button" @click="triggerStudentCsvUpload('HEU')"
                        class="px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-xs active:scale-95"
                        title="Upload CSV for Higher Education Unit (HEU) Students (Defaults: 3KM, Event Shirt Large, dev@lsu.edu.ph)">
                        <i class="fas fa-graduation-cap text-white text-[10px]"></i>
                        <span>Import HEU</span>
                      </button>
                      <!-- BEU Template Download -->
                      <button type="button" @click="downloadStudentCsvTemplate('BEU')"
                        class="px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none bg-white dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-700 dark:hover:text-sky-300 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-xs hover:border-sky-300 active:scale-95"
                        title="Download BEU Students CSV Template (STUDENT ID, LAST NAME, FIRST NAME, MIDDLE NAME, GENDER, DOB, GRADE LEVEL, SECTION, STUDENT EMAIL, STUDENT MOBILE)">
                        <i class="fas fa-download text-sky-600 dark:text-sky-400 text-[10px]"></i>
                        <span>BEU Template</span>
                      </button>
                      <!-- HEU Template Download -->
                      <button type="button" @click="downloadStudentCsvTemplate('HEU')"
                        class="px-2 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border select-none bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-xs hover:border-indigo-300 active:scale-95"
                        title="Download HEU Students CSV Template">
                        <i class="fas fa-download text-indigo-600 dark:text-indigo-400 text-[10px]"></i>
                        <span>HEU Template</span>
                      </button>
                      <!-- Hidden file input for Student CSV selection -->
                      <input ref="studentCsvFileInputRef" type="file" accept=".csv,text/csv" class="hidden"
                        @change="handleStudentCsvFileSelected" />
                    </div>

                    <!-- ── SLOT ALLOCATION ACTIONS (ADJUST RUNNER SLOTS) ── -->
                    <div
                      class="flex items-center whitespace-nowrap gap-1 px-2 py-1 rounded-xl border dark:border-gray-700 bg-slate-100/70 dark:bg-gray-900/60 shadow-xs">
                      <span class="text-[10px] font-bold text-gray-400 uppercase mr-1 flex items-center gap-1">
                        <i class="fas fa-gauge-high text-emerald-500 text-[11px]"></i> Slots:
                      </span>
                      <!-- Adjust Slots Button -->
                      <button type="button" @click="openSlotAdjustmentModal"
                        class="px-2.5 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border select-none bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 shadow-xs hover:border-emerald-300 active:scale-95"
                        title="Adjust slot capacity limits for all race categories">
                        <i class="fas fa-sliders text-emerald-600 dark:text-emerald-400 text-[10px]"></i>
                        <span>Adjust Slots</span>
                        <span v-if="slotDataLoaded && totalSlotsAvailable > 0"
                          class="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 ml-0.5">
                          {{ totalSlotsFilled }}/{{ totalSlotsAvailable }}
                        </span>
                      </button>
                    </div>

                    <!-- ── DUPLICATE SCANNER ACTION (REVIEW DUPLICATES & RACE BIBS) ── -->
                    <div
                      class="flex items-center whitespace-nowrap gap-1 px-2 py-1 rounded-xl border dark:border-gray-700 bg-slate-100/70 dark:bg-gray-900/60 shadow-xs">
                      <span class="text-[10px] font-bold text-gray-400 uppercase mr-1 flex items-center gap-1">
                        <i class="fas fa-clone text-amber-500 text-[11px]"></i> Duplicates:
                      </span>
                      <!-- Scan Duplicates Button -->
                      <button type="button" @click="openDuplicateScannerModal"
                        class="px-2.5 py-0.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border select-none bg-amber-500 hover:bg-amber-600 text-white border-amber-500 shadow-xs active:scale-95"
                        title="Scan for duplicate registrants and review race BIB numbers">
                        <i class="fas fa-search text-white text-[10px]"></i>
                        <span>Scan Duplicates</span>
                        <span v-if="duplicateScanCount > 0"
                          :class="[
                            'px-1.5 py-0.2 rounded-full text-[10px] font-black ml-0.5 shadow-2xs',
                            duplicateStats.bibCollisions > 0 ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-700 text-white'
                          ]">
                          {{ duplicateScanCount }}
                        </span>
                      </button>
                    </div>

                  </div>

                  <!-- Runners Results Count -->
                  <div class="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <i class="fas fa-filter text-emerald-500 text-[10px]"></i>
                    <span>Showing <strong class="text-emerald-600 dark:text-emerald-400">{{ filteredRegistrations.length
                        }}</strong> of {{
                      registrations.length }} runners</span>
                  </div>
                </div>

                <!-- ── DATE RANGE, BATCH, LOCK STATUS & SORTING ── -->
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-3 border-t dark:border-gray-700/60">
                  <!-- Date Range Inputs -->
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
                      class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer">
                      Today
                    </button>
                    <button type="button" @click="setDateRangePreset('7days')"
                      class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer">
                      7 Days
                    </button>
                    <button type="button" @click="setDateRangePreset('30days')"
                      class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer">
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
                      <option value="firstname_asc">🔤 First Name: Ascending (A-Z)</option>
                      <option value="firstname_desc">🔤 First Name: Descending (Z-A)</option>
                      <option value="lastname_asc">👤 Last Name: Ascending (A-Z)</option>
                      <option value="lastname_desc">👤 Last Name: Descending (Z-A)</option>
                      <option value="name_asc">👤 Full Name (Last): A-Z</option>
                      <option value="name_desc">👤 Full Name (Last): Z-A</option>
                      <option value="bib_asc">🔢 Race Bib #: Ascending</option>
                      <option value="batch_asc">📦 Supplier Batch: Ascending</option>
                      <option value="shirt_asc">👕 T-Shirt Size: S → XL</option>
                      <option value="receipt_desc">🧾 Receipt: Has Receipt First</option>
                      <option value="receipt_asc">🧾 Receipt: Without Receipt First</option>
                    </select>
                  </div>
                </div>

                <!-- ── ACCORDION FOOTER (COLLAPSE & RESET SHORTCUTS) ── -->
                <div class="flex items-center justify-between pt-2 border-t dark:border-gray-700/60 text-xs">
                  <button v-if="hasActiveFilters" type="button" @click="resetAllFilters"
                    class="text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                    <i class="fas fa-rotate-left text-[11px]"></i> Reset all filters
                  </button>
                  <div v-else></div>

                  <button type="button" @click="isFilterExpanded = false"
                    class="text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer ml-auto transition hover:scale-105 active:scale-95">
                    <span>Collapse filters</span>
                    <i class="fas fa-chevron-up text-[10px] transition-transform duration-200"></i>
                  </button>
                </div>
              </div>
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
            <div v-for="n in 4" :key="'skel-m-' + n" :class="[
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
            <div v-for="runner in displayedRegistrations" :key="'m-' + runner.id" :class="[
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
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-snug">
                    {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname
                    }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                  </h4>
                  <span v-if="getFullNameCount(runner) > 1"
                    class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                    :title="`${getFullNameCount(runner)} runners have this exact same name`">
                    <i class="fas fa-clone text-[8px] mr-1"></i>Same Name ({{ getFullNameCount(runner) }})
                  </span>
                  <span v-else-if="getFirstNameCount(runner.firstname) > 1"
                    class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
                    :title="`${getFirstNameCount(runner.firstname)} runners share the first name '${runner.firstname}'`">
                    <i class="fas fa-users text-[8px] mr-1"></i>{{ getFirstNameCount(runner.firstname) }} same
                  </span>
                </div>
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
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1',
                  runner.participant_type === 'VVIP'
                    ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300 shadow-xs'
                    : runner.participant_type === 'De La Salle Brothers'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 shadow-xs'
                      : runner.participant_type === 'Sponsors'
                        ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300 shadow-xs'
                        : 'bg-slate-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-slate-200 dark:border-gray-600'
                ]">
                  <i v-if="runner.participant_type === 'VVIP'" class="fas fa-crown text-amber-500 text-[9px]"></i>
                  <i v-else-if="runner.participant_type === 'De La Salle Brothers'"
                    class="fas fa-cross text-emerald-600 text-[9px]"></i>
                  <i v-else-if="runner.participant_type === 'Sponsors'"
                    class="fas fa-handshake text-blue-600 text-[9px]"></i>
                  <span>{{ runner.participant_type || 'Individual' }}</span>
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
                    {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' :
                      runner.payment_type === 'family_salary_deduction' ? 'Family Salary Deduction' :
                        runner.payment_type === 'add_to_tuition' ? 'Add to Tuition' :
                          runner.payment_type === 'over_the_counter' ? 'Over the Counter' :
                            runner.payment_type === 'qr' ? 'QR' : 'Over-the-Counter / QR' }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="font-medium text-[11px] block text-gray-500">Amount</span>
                  <span class="font-black text-sm text-emerald-600 dark:text-emerald-400">
                    ₱{{ Number(runner.grand_total_payment || runner.grand_total || 0).toLocaleString() }}
                  </span>
                </div>
              </div>

              <!-- Mobile Receipt Preview Banner if available -->
              <div v-if="runner.proof_of_payment" :class="[
                'p-2 rounded-xl text-xs flex items-center justify-between gap-2 border',
                props.darkMode ? 'bg-gray-900/40 border-gray-700/60' : 'bg-emerald-50/50 border-emerald-200/60'
              ]">
                <div class="flex items-center gap-2">
                  <div v-if="!isPdfUrl(runner.proof_of_payment)" class="relative cursor-pointer shrink-0"
                    @click.stop="openReceiptModal(runner.proof_of_payment, 'Payment Receipt', runner)">
                    <img :src="getCleanUrl(runner.proof_of_payment)" :alt="runner.firstname + ' Receipt'"
                      class="w-8 h-8 rounded-lg object-cover border border-slate-300 dark:border-gray-600 shadow-2xs" />
                  </div>
                  <div v-else
                    class="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center text-xs shrink-0">
                    <i class="fas fa-file-pdf"></i>
                  </div>
                  <div class="leading-tight">
                    <span class="font-bold text-[11px] block">Payment Receipt</span>
                    <span class="text-[9px] text-gray-500">Tap to inspect & zoom</span>
                  </div>
                </div>
                <button type="button" @click.stop="openReceiptModal(runner.proof_of_payment, 'Payment Receipt', runner)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-2xs transition flex items-center gap-1 cursor-pointer">
                  <i class="fas fa-search-plus text-[9px]"></i> View
                </button>
              </div>

              <!-- Mobile Race Kit Claiming Section -->
              <div :class="[
                'p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 border',
                runner.kit_claimed
                  ? (props.darkMode ? 'bg-emerald-950/40 border-emerald-800' : 'bg-emerald-50 border-emerald-200')
                  : runner.kit_ready
                    ? (props.darkMode ? 'bg-sky-950/40 border-sky-800' : 'bg-sky-50 border-sky-200')
                    : (props.darkMode ? 'bg-gray-900/40 border-gray-700/60' : 'bg-slate-50 border-slate-200')
              ]">
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0',
                    runner.kit_claimed ? 'bg-emerald-600 text-white' : runner.kit_ready ? 'bg-sky-600 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  ]">
                    <i
                      :class="['fas', runner.kit_claimed ? 'fa-check-double' : runner.kit_ready ? 'fa-box-open' : 'fa-bell']"></i>
                  </div>
                  <div class="leading-tight">
                    <span class="font-bold text-[11px] block text-gray-900 dark:text-gray-100">
                      {{ runner.kit_claimed ? 'Race Kit Claimed' : (runner.kit_ready ? 'Ready for Claiming' : 'Kit Pending Claim') }}
                    </span>
                    <span v-if="runner.kit_claimed && runner.kit_claimed_by"
                      class="text-[9px] text-emerald-700 dark:text-emerald-400">
                      Claimed by {{ runner.kit_claimed_by.split('@')[0] }}
                    </span>
                    <span v-else-if="runner.kit_ready" class="text-[9px] text-sky-700 dark:text-sky-400">
                      Claim Pass Email Sent
                    </span>
                    <span v-else class="text-[9px] text-gray-500">
                      Not yet notified
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                  <button type="button" @click="openRunnerQrPassModal(runner)"
                    class="w-7 h-7 rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs shadow-2xs"
                    title="View Claim QR Pass">
                    <i class="fas fa-qrcode"></i>
                  </button>
                </div>
              </div>

              <!-- Card Action Button -->
              <div class="pt-1 flex gap-2">
                <button type="button" @click="openDetails(runner)"
                  class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer">
                  <i class="fas fa-eye text-xs"></i> View Details
                </button>
                <!-- Mobile Message Button with NEW Badge -->
                <button type="button" @click="openChatModal(runner)" :class="[
                  'py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 border select-none',
                  getRunnerMessageStats(runner).hasNew
                    ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/80 animate-pulse'
                    : getRunnerMessageStats(runner).total > 0
                      ? 'bg-slate-100 hover:bg-emerald-50 dark:bg-gray-800 text-slate-700 dark:text-gray-200 border-slate-200 dark:border-gray-700 hover:text-emerald-700'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 text-gray-500 hover:text-emerald-600 border-slate-200 dark:border-gray-700'
                ]"
                  :title="getRunnerMessageStats(runner).hasNew ? `${getRunnerMessageStats(runner).newCount} new query` : `${getRunnerMessageStats(runner).total} messages`">
                  <i
                    :class="['fas text-xs', getRunnerMessageStats(runner).hasNew ? 'fa-comment-dots text-rose-600' : 'fa-comments text-emerald-600']"></i>
                  <span v-if="getRunnerMessageStats(runner).hasNew"
                    class="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-black text-[10px]">
                    {{ getRunnerMessageStats(runner).newCount }} NEW
                  </span>
                  <span v-else-if="getRunnerMessageStats(runner).total > 0" class="text-[11px] font-bold">
                    {{ getRunnerMessageStats(runner).total }}
                  </span>
                  <span v-else class="text-[11px] font-normal opacity-70">
                    Chat
                  </span>
                </button>
               
              </div>
            </div>


            
            <!-- Mobile Progressive Load More -->
            <div v-if="hasMoreToRender && !isInitialLoading"
              class="p-3 text-center bg-slate-50/50 dark:bg-gray-900/30 rounded-2xl space-y-2 mt-1">
              <div class="text-[11px] text-gray-500 dark:text-gray-400">
                Showing <strong class="text-emerald-600 dark:text-emerald-400">{{ displayedRegistrations.length
                  }}</strong> of {{ filteredRegistrations.length }}
              </div>
              <div class="flex items-center justify-center gap-2">
                <button type="button" @click="loadMoreRegistrations"
                  class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition cursor-pointer active:scale-95">
                  <i class="fas fa-angles-down text-[10px] mr-1"></i> Load More
                </button>
                <button type="button" @click="loadAllRegistrations"
                  class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-semibold transition cursor-pointer active:scale-95">
                  Show All ({{ filteredRegistrations.length }})
                </button>
              </div>
            </div>
            <div ref="loadMoreSentinelMobile" class="h-1 w-full"></div>
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

        <!-- ── CURRENT FILTER SELECTION NOTIFICATION BAR ── -->
        <div v-if="selectedIds.length > 0"
          class="px-4 py-2 border-b dark:border-gray-800 bg-emerald-50/80 dark:bg-emerald-950/40 flex items-center justify-between gap-3 text-xs transition flex-wrap">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
              {{ selectedIds.length }}
            </span>
            <span class="font-semibold text-emerald-900 dark:text-emerald-200">
              {{ selectedIds.length }} runner{{ selectedIds.length !== 1 ? 's' : '' }} selected based on current
              filters.
              <span v-if="selectedPendingRunners.length > 0" class="text-amber-700 dark:text-amber-300 font-bold ml-1">
                ({{ selectedPendingRunners.length }} pending confirmation)
              </span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" @click="promptBulkConfirm"
              :disabled="isBulkConfirming"
              class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
              <i v-if="!isBulkConfirming" class="fas fa-check-double text-[11px]"></i>
              <i v-else class="fas fa-spinner fa-spin text-[11px]"></i>
              <span v-if="selectedPendingRunners.length > 0">Confirm Selected ({{ selectedPendingRunners.length }})</span>
              <span v-else>Resend Confirm Email ({{ selectedIds.length }})</span>
            </button>
            <button type="button" @click="promptBulkMarkKitReady" :disabled="isBulkMarkingReady"
              class="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Send claiming notification email with QR code to all selected runners">
              <i v-if="!isBulkMarkingReady" class="fas fa-qrcode text-[11px]"></i>
              <i v-else class="fas fa-spinner fa-spin text-[11px]"></i>
              <span v-if="isBulkMarkingReady">Sending ({{ bulkMarkReadyProgress.current }}/{{ bulkMarkReadyProgress.total }})</span>
              <span v-else>Notify Ready ({{ selectedIds.length }})</span>
            </button>
            <button type="button" @click="clearSelection"
              class="text-xs text-gray-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-300 font-semibold cursor-pointer px-2 py-1">
              Clear
            </button>
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
                <!-- Clean Select-all checkbox based on current filters -->
                <th class="p-3 w-10 whitespace-nowrap">
                  <input type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected"
                    @change="toggleSelectAll" class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    :title="allSelected ? 'Deselect all' : `Select all ${filteredRegistrations.length} in current filters`" />
                </th>

                <!-- Dynamic Columns Header driven by selectedCsvColumns -->
                <th v-for="col in activeTableColumns" :key="col.key" :class="[
                  'p-3 transition select-none',
                  col.key === 'receipt' ? 'text-center' : '',
                  ['race_bib', 'reg_id', 'full_name', 'firstname', 'lastname', 'batch', 'reg_date', 'receipt'].includes(col.key) ? 'cursor-pointer hover:text-emerald-500' : ''
                ]"
                  @click="['race_bib', 'reg_id'].includes(col.key) ? toggleSort('bib') : col.key === 'firstname' ? toggleSort('firstname') : col.key === 'lastname' ? toggleSort('lastname') : col.key === 'full_name' ? toggleSort('name') : col.key === 'batch' ? toggleSort('batch') : col.key === 'reg_date' ? toggleSort('date') : col.key === 'receipt' ? toggleSort('receipt') : null">
                  {{ col.label }}
                  <i v-if="['race_bib', 'reg_id'].includes(col.key)" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'bib_asc' ? 'fa-sort-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                  <i v-else-if="col.key === 'firstname'" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'firstname_asc' ? 'fa-sort-alpha-down text-emerald-600' : sortBy === 'firstname_desc' ? 'fa-sort-alpha-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                  <i v-else-if="col.key === 'lastname'" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'lastname_asc' ? 'fa-sort-alpha-down text-emerald-600' : sortBy === 'lastname_desc' ? 'fa-sort-alpha-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                  <i v-else-if="col.key === 'full_name'" :class="[
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
                  <i v-else-if="col.key === 'receipt'" :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'receipt_desc' ? 'fa-sort-amount-down text-emerald-600' : sortBy === 'receipt_asc' ? 'fa-sort-amount-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                </th>

                <!-- Messages / Chat Column Header (Red box in user's layout) -->
                <th class="p-3 text-center whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 cursor-pointer hover:text-emerald-500 transition select-none"
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

                <!-- Race Kit Status Column Header (Red box in user's layout) -->
                <th class="p-3 text-center whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 cursor-pointer hover:text-emerald-500 transition select-none"
                    @click="selectedKitStatus = selectedKitStatus === 'All' ? 'ready' : selectedKitStatus === 'ready' ? 'claimed' : 'All'"
                    :title="`Click to cycle kit filters (Current: ${selectedKitStatus})`">
                    <i class="fas fa-box-archive text-emerald-600 dark:text-emerald-400 text-xs"></i>
                    <span>Race Kit</span>
                    <span v-if="selectedKitStatus !== 'All'"
                      class="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase">
                      {{ selectedKitStatus }}
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
                    <div v-else-if="col.key === 'reg_id'" class="h-4 w-10 rounded bg-slate-200 dark:bg-gray-700"></div>

                    <!-- full_name -->
                    <div v-else-if="col.key === 'full_name'" class="space-y-1.5">
                      <div class="h-3.5 w-32 rounded bg-slate-200 dark:bg-gray-700"></div>
                      <div class="h-2.5 w-24 rounded bg-slate-100 dark:bg-gray-800"></div>
                    </div>

                    <!-- names -->
                    <div v-else-if="['firstname', 'lastname', 'middlename', 'suffix'].includes(col.key)"
                      class="h-3.5 w-20 rounded bg-slate-200 dark:bg-gray-700"></div>

                    <!-- batch -->
                    <div v-else-if="col.key === 'batch'" class="h-5 w-20 rounded-xl bg-slate-200 dark:bg-gray-700">
                    </div>

                    <!-- category -->
                    <div v-else-if="col.key === 'category'" class="h-5 w-14 rounded-full bg-slate-200 dark:bg-gray-700">
                    </div>

                    <!-- classification / academic unit -->
                    <div
                      v-else-if="['classification', 'academic_unit', 'college_course', 'college_year', 'partner_office'].includes(col.key)"
                      class="h-5 w-24 rounded-full bg-slate-200 dark:bg-gray-700"></div>

                    <!-- tshirt_size -->
                    <div v-else-if="col.key === 'tshirt_size'"
                      class="h-5 w-8 rounded-md bg-slate-200 dark:bg-gray-700 mx-auto"></div>

                    <!-- payment_status -->
                    <div v-else-if="col.key === 'payment_status'"
                      class="h-5 w-20 rounded-full bg-slate-200 dark:bg-gray-700"></div>

                    <!-- receipt -->
                    <div v-else-if="col.key === 'receipt'"
                      class="h-10 w-10 rounded-lg bg-slate-200 dark:bg-gray-700 mx-auto"></div>

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

                  <!-- Race Kit Skeleton -->
                  <td class="px-3 py-3.5 text-center">
                    <div class="h-6 w-20 rounded-xl bg-slate-200 dark:bg-gray-700 mx-auto"></div>
                  </td>

                  <!-- Actions Skeleton -->
                  <td class="px-3 py-3.5 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1.5">
                      <div class="h-6 w-14 rounded-xl bg-emerald-200/70 dark:bg-emerald-950/70"></div>
                      <div class="h-6 w-16 rounded-xl bg-amber-200/60 dark:bg-amber-950/60"></div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- DESKTOP ACTUAL ROWS -->
              <template v-else-if="filteredRegistrations.length > 0">
                <tr v-for="runner in displayedRegistrations" :key="runner.id" :class="[
                  'hover:bg-emerald-50/70 dark:hover:bg-gray-700/40 transition',
                  selectedIds.includes(runner.id) ? (props.darkMode ? 'bg-emerald-950/30' : 'bg-emerald-50/80') : '',
                ]">

                  <!-- Row checkbox -->
                  <td class="px-3 w-10">
                    <input type="checkbox" :checked="selectedIds.includes(runner.id)"
                      @change="toggleSelectOne(runner.id)" class="w-4 h-4 rounded accent-emerald-600 cursor-pointer" />
                  </td>

                  <!-- Dynamic columns rendered based on col.key -->
                  <td v-for="col in activeTableColumns" :key="col.key"
                    :class="['px-3', col.key === 'receipt' ? 'text-center' : '']">
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
                      <div class="font-bold text-gray-900 dark:text-gray-100 uppercase leading-snug flex items-center gap-1.5 flex-wrap">
                        <span>
                          {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{
                            runner.lastname }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                        </span>
                        <span v-if="getFullNameCount(runner) > 1"
                          class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                          :title="`${getFullNameCount(runner)} runners have this exact same name (${runner.firstname} ${runner.lastname})`">
                          <i class="fas fa-clone text-[8px] mr-1"></i>Same Name ({{ getFullNameCount(runner) }})
                        </span>
                      </div>
                      <div class="text-[11px] text-gray-500 truncate max-w-[180px]">
                        {{ runner.contact_email || runner.email }}
                      </div>
                    </template>

                    <!-- firstname -->
                    <template v-else-if="col.key === 'firstname'">
                      <div class="inline-flex items-center gap-1.5 flex-wrap">
                        <span class="font-semibold text-gray-900 dark:text-gray-100">{{ runner.firstname || '-' }}</span>
                        <span v-if="getFullNameCount(runner) > 1"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                          :title="`Exact full name match: ${getFullNameCount(runner)} runners with name '${runner.firstname} ${runner.lastname}'`">
                          <i class="fas fa-clone text-[9px] mr-1"></i>{{ getFullNameCount(runner) }} exact
                        </span>
                        <span v-else-if="getFirstNameCount(runner.firstname) > 1"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
                          :title="`${getFirstNameCount(runner.firstname)} runners have the first name '${runner.firstname}'`">
                          <i class="fas fa-users text-[9px] mr-1"></i>{{ getFirstNameCount(runner.firstname) }} same
                        </span>
                      </div>
                    </template>

                    <!-- middlename -->
                    <template v-else-if="col.key === 'middlename'">
                      <span class="text-gray-700 dark:text-gray-300">{{ runner.middlename || '-' }}</span>
                    </template>

                    <!-- lastname -->
                    <template v-else-if="col.key === 'lastname'">
                      <div class="inline-flex items-center gap-1.5 flex-wrap">
                        <span class="font-semibold text-gray-900 dark:text-gray-100">{{ runner.lastname || '-' }}</span>
                        <span v-if="getFullNameCount(runner) > 1"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                          :title="`Exact full name match: ${getFullNameCount(runner)} runners with name '${runner.firstname} ${runner.lastname}'`">
                          <i class="fas fa-clone text-[9px] mr-1"></i>{{ getFullNameCount(runner) }} exact
                        </span>
                      </div>
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
                      <span :class="[
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border',
                        runner.participant_type === 'VVIP'
                          ? 'bg-purple-100 text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300'
                          : runner.participant_type === 'De La Salle Brothers'
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300'
                            : runner.participant_type === 'Sponsors'
                              ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300'
                              : 'bg-slate-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-transparent'
                      ]">
                        <i v-if="runner.participant_type === 'VVIP'" class="fas fa-crown text-amber-500 text-[9px]"></i>
                        <i v-else-if="runner.participant_type === 'De La Salle Brothers'"
                          class="fas fa-cross text-emerald-600 text-[9px]"></i>
                        <i v-else-if="runner.participant_type === 'Sponsors'"
                          class="fas fa-handshake text-blue-600 text-[9px]"></i>
                        <span>{{ runner.participant_type || 'Open Category' }}</span>
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
                          <i
                            :class="['fas text-[9px]', isHEU(runner) ? 'fa-graduation-cap text-amber-600 dark:text-amber-400' : 'fa-school text-sky-600 dark:text-sky-400']"></i>
                          <span class="font-black uppercase">{{ isHEU(runner) ? 'HEU' : 'BEU' }}</span>
                          <span class="opacity-40">·</span>
                          <span class="font-bold">{{ runner.college_course }}</span>
                        </span>
                        <div class="text-[9px] text-gray-500 truncate max-w-[170px]"
                          :title="getCourseLabel(runner.college_course)">
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

                    <!-- partner_office -->
                    <template v-else-if="col.key === 'partner_office'">
                      <span class="text-gray-700 dark:text-gray-300 text-[11px] font-medium">{{ runner.partner_office || '-' }}</span>
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
                        {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' :
                          runner.payment_type === 'family_salary_deduction' ? 'Family Salary Deduction' :
                            runner.payment_type === 'add_to_tuition' ? 'Add to Tuition' :
                              runner.payment_type === 'over_the_counter' ? 'Over the Counter' :
                                runner.payment_type === 'qr' ? 'QR' : 'Over-the-Counter / QR' }}
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

                    <!-- receipt -->
                    <template v-else-if="col.key === 'receipt'">
                      <div class="flex items-center justify-center">
                        <div v-if="runner.proof_of_payment" class="inline-flex items-center justify-center">
                          <!-- PDF Receipt button -->
                          <button v-if="isPdfUrl(runner.proof_of_payment)" type="button"
                            @click.stop="openReceiptModal(runner.proof_of_payment, 'Payment Receipt (PDF)', runner)"
                            class="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer group"
                            title="View PDF Receipt">
                            <i class="fas fa-file-pdf text-xs group-hover:scale-110 transition-transform"></i>
                            <span>PDF</span>
                          </button>

                          <!-- Image Receipt Thumbnail Preview -->
                          <div v-else class="relative group cursor-pointer"
                            @click.stop="openReceiptModal(runner.proof_of_payment, 'Payment Receipt', runner)"
                            title="Click to view & zoom receipt">
                            <span class="text-green-800 hover:underline text-[11px]">
                              <i class="fa fa-receipt text-3xl"></i>
                            </span>
                            <div
                              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-[10px]">
                              <i class="fas fa-search-plus"></i>
                            </div>
                          </div>
                        </div>

                        <!-- No Receipt -->
                        <span v-else class="text-[10px] text-gray-400 dark:text-gray-500 italic select-none">
                          No receipt
                        </span>
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
                              'numeric'
                          }) : 'N/A') }}
                      </span>
                    </template>

                    <!-- confirmed_date -->
                    <template v-else-if="col.key === 'confirmed_date'">
                      <span class="text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {{ runner.confirmed_at ? new Date(runner.confirmed_at).toLocaleDateString('en-US', {
                          month:
                            'short', day: 'numeric', year: 'numeric'
                        }) : '-' }}
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
                          month: 'short', day: 'numeric', year: 'numeric'
                        }) : '-' }}
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
                    <button v-if="getRunnerMessageStats(runner).hasNew" type="button" @click="openChatModal(runner)"
                      class="relative px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 border border-rose-300 dark:border-rose-700/80 text-rose-700 dark:text-rose-300 font-bold text-xs shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer group"
                      :title="`${getRunnerMessageStats(runner).newCount} new message query · Click to view and reply`">
                      <span class="relative flex h-2 w-2">
                        <span
                          class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                      </span>
                      <i
                        class="fas fa-comment-dots text-rose-600 dark:text-rose-400 text-sm group-hover:scale-110 transition-transform"></i>
                      <span
                        class="px-1.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] tracking-tight shadow-2xs">
                        {{ getRunnerMessageStats(runner).newCount }} NEW
                      </span>
                    </button>

                    <!-- Runner has message history (all read / replied) -->
                    <button v-else-if="getRunnerMessageStats(runner).total > 0" type="button"
                      @click="openChatModal(runner)"
                      class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-gray-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-semibold text-xs transition inline-flex items-center gap-1.5 cursor-pointer group"
                      :title="`${getRunnerMessageStats(runner).total} message(s) in chat history · Click to view`">
                      <i
                        class="fas fa-comments text-emerald-600 dark:text-emerald-400 text-xs group-hover:scale-110 transition-transform"></i>
                      <span
                        class="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-gray-200 font-bold text-[10px]">
                        {{ getRunnerMessageStats(runner).total }}
                      </span>
                    </button>

                    <!-- No messages yet: subtle icon to start conversation -->
                    <button v-else type="button" @click="openChatModal(runner)"
                      class="px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 text-gray-400 hover:text-emerald-600 dark:text-gray-500 dark:hover:text-emerald-400 border border-transparent hover:border-slate-200 dark:hover:border-gray-700 transition inline-flex items-center justify-center cursor-pointer group"
                      title="No chat history · Click to send message to runner">
                      <i class="far fa-comment-dots text-sm group-hover:scale-110 transition-transform"></i>
                    </button>
                  </td>

                  <!-- Race Kit Status Column (Red box in user's layout) -->
                  <td class="px-3 text-center whitespace-nowrap">
                    <!-- Case 1: Kit Already Claimed -->
                    <div v-if="runner.kit_claimed" class="inline-flex flex-col items-center gap-0.5">
                      <div class="inline-flex items-center gap-1">
                        <button type="button" @click="openRunnerClaimModal(runner)"
                          class="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold text-[11px] shadow-2xs transition inline-flex items-center gap-1 cursor-pointer group"
                          :title="`Kit claimed on ${runner.kit_claimed_at ? new Date(runner.kit_claimed_at).toLocaleDateString() : 'N/A'} by ${runner.kit_claimed_by || 'Admin'}. Click to view or update claimed inclusions.`">
                          <i
                            class="fas fa-check-double text-emerald-600 dark:text-emerald-400 text-xs group-hover:scale-110 transition-transform"></i>
                          <span>Claimed</span>
                        </button>


                      </div>
                      <span v-if="runner.kit_claimed_by"
                        class="text-[9px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]"
                        :title="runner.kit_claimed_by">
                        by {{ runner.kit_claimed_by.split('@')[0] }}
                      </span>
                    </div>

                    <!-- Case 2: Kit Marked Ready for Claiming (Email dispatched with QR code) -->
                    <div v-else-if="runner.kit_ready" class="inline-flex items-center gap-1.5">
                      <button type="button" @click="openRunnerQrPassModal(runner)"
                        class="px-1.5 py-0.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700/80 transition inline-flex items-center justify-center cursor-pointer"
                        title="View or print Runner Claim Pass with QR code">
                        <i class="fas fa-qrcode text-3xl"></i>
                      </button>
                    </div>

                  </td>
                  <!-- Fixed Actions column -->
                  <td class="px-3 text-center whitespace-nowrap">
                    <div class="inline-flex items-center justify-center gap-1.5">
                      <button type="button" @click="openDetails(runner)"
                        class="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition inline-flex items-center gap-1 cursor-pointer"
                        title="View registration details">
                        <i class="fas fa-eye"></i> View
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- Desktop Progressive Load More Row -->
                <tr v-if="hasMoreToRender">
                  <td :colspan="activeTableColumns.length + 4"
                    class="p-3 text-center bg-slate-50/60 dark:bg-gray-900/40">
                    <div class="flex items-center justify-between px-3 py-1">
                      <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <i class="fas fa-layer-group text-emerald-500"></i>
                        Showing <strong class="text-gray-800 dark:text-gray-200 mx-1">{{ displayedRegistrations.length
                          }}</strong> of {{ filteredRegistrations.length }} runners
                      </div>
                      <div class="flex items-center gap-2">
                        <button type="button" @click="loadMoreRegistrations"
                          class="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95">
                          <i class="fas fa-angles-down text-[10px]"></i> Load More
                        </button>
                        <button type="button" @click="loadAllRegistrations"
                          class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-semibold transition cursor-pointer active:scale-95">
                          Show All ({{ filteredRegistrations.length }})
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- DESKTOP EMPTY STATE -->
              <tr v-else>
                <td :colspan="activeTableColumns.length + 4" class="p-10 text-center text-gray-500">
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
          <div ref="loadMoreSentinelDesktop" class="h-1 w-full"></div>
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


        <!-- Multi-Confirm Payment button -->
        <button v-if="selectedIds.length > 0" type="button" @click="promptBulkConfirm"
          :disabled="isBulkConfirming"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs transition shadow-lg flex items-center gap-1.5 border border-emerald-400/40 cursor-pointer active:scale-95 disabled:opacity-60"
          title="Approve / Confirm payment for all selected pending runners">
          <i v-if="!isBulkConfirming" class="fas fa-check-double"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          <span v-if="selectedPendingRunners.length > 0">Multi-Confirm ({{ selectedPendingRunners.length }})</span>
          <span v-else>Resend Email ({{ selectedIds.length }})</span>
        </button>

        <!-- Notify Kit Ready button -->
        <button v-if="selectedIds.length > 0" type="button" @click="promptBulkMarkKitReady"
          :disabled="isBulkMarkingReady"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs transition shadow-lg flex items-center gap-1.5 border border-sky-400/40 cursor-pointer active:scale-95 disabled:opacity-60"
          title="Send claiming notification email with QR code to all selected runners">
          <i v-if="!isBulkMarkingReady" class="fas fa-qrcode"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          <span v-if="isBulkMarkingReady">Sending ({{ bulkMarkReadyProgress.current }}/{{ bulkMarkReadyProgress.total }})</span>
          <span v-else>Notify Ready ({{ selectedIds.length }})</span>
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
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Full Name</label>
                  <p class="font-semibold uppercase">
                    {{ selectedRunner.firstname }} {{ selectedRunner.middlename }} {{ selectedRunner.lastname }}{{
                      selectedRunner.suffix ? ' ' + selectedRunner.suffix : '' }}
                  </p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Gender &amp; Birthdate</label>
                  <p class="font-semibold">
                    {{ selectedRunner.gender || 'Not specified' }} • {{ selectedRunner.birthdate || 'N/A' }}
                  </p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Contact Phone</label>
                  <p class="font-semibold">{{ selectedRunner.contact_number || selectedRunner.phone || 'N/A' }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Email Address</label>
                  <p class="font-semibold">{{ selectedRunner.contact_email || selectedRunner.email }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Classification</label>
                  <p class="font-semibold">{{ selectedRunner.participant_type }} {{ selectedRunner.lsu_id_number ? '(' +
                    selectedRunner.lsu_id_number + ')' : '' }}</p>
                </div>

                <div v-if="selectedRunner.college_course || selectedRunner.college_year || selectedRunner.beu_grade"
                  class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Course / Program</label>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span v-if="getCourseLabel(selectedRunner.college_course)"
                        class="font-semibold text-emerald-700 dark:text-emerald-400">
                        {{ getCourseLabel(selectedRunner.college_course) }}
                      </span>

                    </div>
                    <p v-if="selectedRunner.college_year || selectedRunner.beu_grade" class="text-[11px] text-gray-500">
                      Level: <strong class="text-gray-700 dark:text-gray-300">{{ selectedRunner.college_year ||
                        selectedRunner.beu_grade }}</strong>
                    </p>
                  </div>
                </div>

                <div v-if="selectedRunner.organization" class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Running Club / Org</label>
                  <p class="font-semibold text-emerald-600 dark:text-emerald-400">{{ selectedRunner.organization }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">T-Shirt Size</label>
                  <p class="font-semibold">{{ selectedRunner.tshirt_size || 'M' }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Address</label>
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
                      <option value="VVIP">VVIP</option>
                      <option value="De La Salle Brothers">De La Salle Brothers</option>
                      <option value="Sponsors">Sponsors</option>
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
                    <input v-model="editForm.college_year" :class="inputCls"
                      placeholder="e.g. 1st Year, Grade 11 STEM" />
                  </div>
                </div>

                <!-- Shirt size & Run category -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">T-Shirt Size</label>
                    <select v-model="editForm.tshirt_size" :class="inputCls">
                      <option value="">-- Select Size --</option>
                      <template v-for="shirtConfig in OFFICIAL_SHIRT_CONFIGS" :key="shirtConfig.id">
                        <optgroup :label="shirtConfig.sizesGroupLabel">
                          <option v-for="size in shirtConfig.sizes" :key="shirtConfig.id + '-' + size"
                            :value="shirtConfig.shortLabel + ': ' + size + ';'">
                            {{ shirtConfig.shortLabel }}: {{ size }};
                          </option>
                        </optgroup>
                      </template>
                      <!-- Fallback option for custom/non-standard values so dropdown is never blank -->
                      <option v-if="editForm.tshirt_size && !isStandardShirtOption(editForm.tshirt_size)"
                        :value="editForm.tshirt_size">
                        {{ editForm.tshirt_size }}
                      </option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Run Category</label>
                    <select v-model="editForm.run_category" @change="onRunCategoryChange" :class="inputCls">
                      <option value="">-- Select --</option>
                      <option value="1KM">1 KM (Pet Run)</option>
                      <option value="3KM">3 KM</option>
                      <option value="10KM">10 KM</option>
                      <option value="20KM">20 KM</option>
                    </select>
                  </div>
                </div>

                <!-- Finisher Shirt Size (20KM only) -->
                <div
                  v-if="editForm.run_category === '20KM' || (selectedRunner && selectedRunner.run_category === '20KM')">
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    <i class="fas fa-medal text-amber-500 mr-1"></i>Finisher Shirt Size
                    <span
                      class="ml-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-300 normal-case">20KM
                      Inclusion</span>
                  </label>
                  <select v-model="editForm.finisher_shirt_size" :class="inputCls">
                    <option value="">-- Select Finisher Shirt Size --</option>
                    <template v-if="FINISHER_SHIRT_CONFIG">
                      <optgroup :label="FINISHER_SHIRT_CONFIG.sizesGroupLabel">
                        <option v-for="size in FINISHER_SHIRT_CONFIG.sizes" :key="'finisher-' + size"
                          :value="'Finisher Shirt: ' + size + ';'">
                          Finisher Shirt: {{ size }};
                        </option>
                      </optgroup>
                    </template>
                    <!-- Fallback option for custom/non-standard values so dropdown is never blank -->
                    <option
                      v-if="editForm.finisher_shirt_size && !isStandardFinisherOption(editForm.finisher_shirt_size)"
                      :value="editForm.finisher_shirt_size">
                      {{ editForm.finisher_shirt_size }}
                    </option>
                  </select>
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

                <!-- Payment Method -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Payment Method</label>
                  <select v-model="editForm.payment_type" :class="inputCls">
                    <option value="">-- Select Payment Method --</option>
                    <option value="salary_deduction">Salary Deduction</option>
                    <option value="family_salary_deduction">Family Salary Deduction</option>
                    <option value="add_to_tuition">Add to Tuition</option>
                    <option value="over_the_counter">Over the Counter</option>
                    <option value="qr">QR / GCash / Maya</option>
                  </select>
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

          <div class="lg:w-7/12" v-if="!isEditMode">
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

            <!-- Valid ID Verification & Camera Capture -->
            <div class="mt-4 p-3.5 rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50/70 dark:bg-gray-900/40 space-y-3">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2">
                  <div
                    :class="[
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                      getImageUrl(selectedRunner.valid_id_front)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 text-white'
                    ]"
                  >
                    <i :class="getImageUrl(selectedRunner.valid_id_front) ? 'fas fa-id-card-clip' : 'fas fa-id-card'"></i>
                  </div>
                  <div>
                    <h5 class="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                      <span>Valid ID</span>
                      <span
                        v-if="getImageUrl(selectedRunner.valid_id_front)"
                        class="px-2 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-bold"
                      >
                        Recorded
                      </span>
                      <span
                        v-else
                        class="px-2 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold"
                      >
                        Not Recorded
                      </span>
                    </h5>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">
                      {{ getImageUrl(selectedRunner.valid_id_front)
                        ? 'Official participant Valid ID recorded on file.'
                        : 'Take a picture with camera or upload proof of identity.' }}
                    </p>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    @click="openValidIdCamera(selectedRunner)"
                    :disabled="isValidIdUploading"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <i class="fas fa-camera text-xs"></i>
                    <span>{{ getImageUrl(selectedRunner.valid_id_front) ? 'Retake Photo' : 'Take Picture (Camera)' }}</span>
                  </button>

                  <label
                    class="px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Upload Valid ID file"
                  >
                    <i class="fas fa-upload text-[11px]"></i>
                    <span class="hidden sm:inline">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      class="hidden"
                      @change="handleValidIdFileSelect($event, selectedRunner)"
                      :disabled="isValidIdUploading"
                    />
                  </label>
                </div>
              </div>

              <!-- Display Valid ID if recorded -->
              <div v-if="getImageUrl(selectedRunner.valid_id_front) || getImageUrl(selectedRunner.valid_id_back)" class="space-y-2">
                <div v-if="getImageUrl(selectedRunner.valid_id_front)"
                  class="border rounded-2xl p-2.5 bg-white dark:bg-gray-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      :src="getImageUrl(selectedRunner.valid_id_front)"
                      alt="Valid ID Front"
                      class="w-16 h-12 rounded-lg object-cover border bg-gray-100 cursor-pointer shrink-0"
                      @click="openReceiptModal(getImageUrl(selectedRunner.valid_id_front), 'Valid ID (Front)', selectedRunner)"
                    />
                    <div class="truncate">
                      <p class="font-extrabold text-xs text-gray-900 dark:text-gray-100 truncate">Valid ID (Front)</p>
                      <p class="text-[10px] text-gray-500">Click to view full preview</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button type="button"
                      @click="openReceiptModal(getImageUrl(selectedRunner.valid_id_front), 'Valid ID (Front)', selectedRunner)"
                      class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shadow-xs">
                      <i class="fas fa-eye text-xs"></i> View
                    </button>
                    <button type="button"
                      @click="promptDeleteValidId(selectedRunner)"
                      :disabled="isValidIdDeleting"
                      class="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[11px] hover:bg-rose-200 transition flex items-center gap-1 cursor-pointer">
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
                </div>

                <div v-if="getImageUrl(selectedRunner.valid_id_back)"
                  class="border rounded-2xl p-2.5 bg-white dark:bg-gray-800 flex items-center justify-between gap-3 shadow-2xs">
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      :src="getImageUrl(selectedRunner.valid_id_back)"
                      alt="Valid ID Back"
                      class="w-16 h-12 rounded-lg object-cover border bg-gray-100 cursor-pointer shrink-0"
                      @click="openReceiptModal(getImageUrl(selectedRunner.valid_id_back), 'Valid ID (Back)', selectedRunner)"
                    />
                    <div class="truncate">
                      <p class="font-extrabold text-xs text-gray-900 dark:text-gray-100 truncate">Valid ID (Back)</p>
                      <p class="text-[10px] text-gray-500">Click to view full preview</p>
                    </div>
                  </div>
                  <button type="button"
                    @click="openReceiptModal(getImageUrl(selectedRunner.valid_id_back), 'Valid ID (Back)', selectedRunner)"
                    class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer shadow-xs shrink-0">
                    <i class="fas fa-eye text-xs"></i> View
                  </button>
                </div>
              </div>
            </div>

          </div><!-- /Personal Details -->

          <!-- ── COMMUNICATION CHAT PANEL ────────────────────────────────────────────── -->
          <div class="lg:w-80 shrink-0 flex flex-col mt-6 lg:mt-0" v-if="!isEditMode">

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
                    <a v-if="isPdfAttachment(msg.attachment_url, msg.attachment_name)" :href="cleanURL(msg.attachment_url, msg.attachment_name)" target="_blank"
                      :class="['flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold transition', msg.sender_type === 'admin' ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200']">
                      <i class="fas fa-file-pdf"></i>
                      <span class="truncate max-w-[140px]">{{ msg.attachment_name || 'View PDF' }}</span>
                      <i class="fas fa-external-link-alt text-[9px] opacity-60 ml-auto"></i>
                    </a>
                    <a v-else :href="getCleanUrl(msg.attachment_url, msg.attachment_name)" target="_blank" class="block">
                      <img :src="getCleanUrl(msg.attachment_url, msg.attachment_name)" :alt="msg.attachment_name || 'Image'"
                        @load="scrollChatToBottom"
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
                ]" title="Attach image or PDF (max 10 MB)">
                  <i class="fas fa-paperclip text-sm"></i>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" class="hidden"
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
                @click="executeConfirmPayment(selectedRunner)" :disabled="isConfirming"
                class="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
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

    <!-- BULK-CONFIRM PAYMENT MODAL ──────────────────────────────────── -->
    <div v-if="bulkConfirmModal.show"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="closeBulkConfirmModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Emerald accent bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-check-double"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            <span v-if="selectedPendingRunners.length > 0">
              Confirm {{ selectedPendingRunners.length }} Runner Payment{{ selectedPendingRunners.length !== 1 ? 's' : '' }}?
            </span>
            <span v-else>
              Resend Confirmation Email to {{ selectedIds.length }} Runner{{ selectedIds.length !== 1 ? 's' : '' }}?
            </span>
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            <span v-if="selectedPendingRunners.length > 0">
              This will mark all <strong class="text-emerald-600 dark:text-emerald-400">{{ selectedPendingRunners.length }}
                pending registrations</strong> as <strong class="text-emerald-600 dark:text-emerald-400">Confirmed</strong>
              and queue their official registration confirmation emails.
            </span>
            <span v-else>
              This will queue and resend official registration confirmation emails to all
              <strong class="text-emerald-600 dark:text-emerald-400">{{ selectedIds.length }} selected runner(s)</strong>.
            </span>
          </p>
        </div>

        <!-- Quick Summary Box -->
        <div
          class="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-left text-xs space-y-1.5">
          <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
            <span>Operator:</span>
            <span class="font-bold text-gray-800 dark:text-gray-100">{{ currentOperator || 'Admin' }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
            <span>{{ selectedPendingRunners.length > 0 ? 'Runners to Confirm:' : 'Runners to Email:' }}</span>
            <span class="font-bold text-emerald-600 dark:text-emerald-400">
              {{ selectedPendingRunners.length > 0 ? selectedPendingRunners.length : selectedIds.length }}
            </span>
          </div>
          <div v-if="selectedPendingRunners.length > 0 && selectedIds.length > selectedPendingRunners.length"
            class="flex justify-between items-center text-gray-400 text-[11px]">
            <span>Already confirmed (skipped):</span>
            <span>{{ selectedIds.length - selectedPendingRunners.length }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeBulkConfirmModal" :disabled="isBulkConfirming"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeBulkConfirm" :disabled="isBulkConfirming"
            class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
            <i v-if="!isBulkConfirming" class="fas fa-check-double"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isBulkConfirming ? 'Confirming...' : 'Yes, Confirm All' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BULK-MARK KIT READY CONFIRMATION MODAL (REPLACES BROWSER CONFIRM) -->
    <div v-if="bulkMarkReadyModal.show"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="closeBulkMarkReadyModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Sky accent bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 to-blue-600"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-qrcode"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            Send Race Kit Claiming Emails?
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Are you sure you want to mark race kits ready and dispatch claiming notification emails with QR codes to each of the
            <strong class="text-sky-600 dark:text-sky-400">{{ selectedIds.length }} selected runner{{ selectedIds.length !== 1 ? 's' : '' }}</strong>?
          </p>
        </div>

        <!-- Quick Summary Box -->
        <div
          class="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 text-left text-xs space-y-1.5">
          <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
            <span>Operator:</span>
            <span class="font-bold text-gray-800 dark:text-gray-100">{{ currentOperator || 'Admin' }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
            <span>Runners to Notify:</span>
            <span class="font-bold text-sky-600 dark:text-sky-400">{{ selectedIds.length }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
            <span>Inclusions:</span>
            <span class="font-medium text-gray-700 dark:text-gray-200">Claim QR Code + Kit Instructions</span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeBulkMarkReadyModal" :disabled="isBulkMarkingReady"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeBulkMarkKitReady" :disabled="isBulkMarkingReady"
            class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95">
            <i v-if="!isBulkMarkingReady" class="fas fa-paper-plane"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isBulkMarkingReady ? 'Dispatching...' : 'Yes, Send Emails' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BULK-DELETE CONFIRMATION MODAL ──────────────────────────────── -->
    <div v-if="bulkDeleteModal.show"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
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
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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

    <!-- DELETE VALID ID CONFIRMATION MODAL (REPLACES BROWSER CONFIRM) -->
    <div v-if="deleteValidIdModal.show && deleteValidIdModal.runner"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeDeleteValidIdModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-id-card"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">Remove Valid ID?</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to remove the recorded Valid ID for
            <strong class="text-rose-600 dark:text-rose-400">{{ deleteValidIdModal.runner.firstname }} {{
              deleteValidIdModal.runner.lastname }}</strong>?
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
            This will remove the uploaded identification image. You can upload a new Valid ID at any time.
          </p>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeDeleteValidIdModal" :disabled="isValidIdDeleting"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeDeleteValidId" :disabled="isValidIdDeleting"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
            <i v-if="!isValidIdDeleting" class="fas fa-trash"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isValidIdDeleting ? 'Removing...' : 'Yes, Remove Valid ID' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ADMIN CONFIRMATION DIALOG MODAL (REPLACES BROWSER CONFIRM) -->
    <div v-if="confirmModal.show && confirmModal.runner"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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

    <!-- UNCLAIM CONFIRMATION MODAL (REPLACES BROWSER CONFIRM) -->
    <div v-if="unclaimConfirmModal.show && unclaimConfirmModal.runner"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeUnclaimConfirmModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-rotate-left"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            Revert Claim Status?
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Are you sure you want to revert claimed status for
            <strong class="text-rose-600 dark:text-rose-400">
              {{ unclaimConfirmModal.runner.firstname }} {{ unclaimConfirmModal.runner.lastname }}
              ({{ unclaimConfirmModal.runner.run_number || ('AR-' + unclaimConfirmModal.runner.id) }})
            </strong>?
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-2 leading-relaxed">
            This will mark the race kit as uncollected and clear the claimed handover record.
          </p>
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeUnclaimConfirmModal" :disabled="isUnclaiming"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeUnclaim()" :disabled="isUnclaiming"
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
            <i v-if="!isUnclaiming" class="fas fa-rotate-left"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isUnclaiming ? 'Reverting...' : 'Yes, Revert Claim' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- FAST FLOATING TOAST NOTIFICATION (NON-BLOCKING) -->
    <transition enter-active-class="transform transition ease-out duration-300"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="fastToast.show"
        class="fixed top-6 right-6 z-[9999] max-w-sm w-full shadow-2xl rounded-2xl p-4 border flex items-center gap-3 backdrop-blur-md pointer-events-auto"
        :class="[
          fastToast.type === 'error'
            ? 'bg-rose-900/95 text-rose-100 border-rose-700 shadow-rose-950/40'
            : fastToast.type === 'warning'
              ? 'bg-amber-900/95 text-amber-100 border-amber-700 shadow-amber-950/40'
              : 'bg-emerald-900/95 text-emerald-100 border-emerald-700 shadow-emerald-950/40'
        ]">
        <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" :class="[
          fastToast.type === 'error' ? 'bg-rose-500/30 text-rose-300' : 'bg-emerald-500/30 text-emerald-300'
        ]">
          <i :class="['fas text-sm', fastToast.type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check']"></i>
        </div>
        <div class="flex-1 text-xs font-semibold leading-snug">
          {{ fastToast.message }}
        </div>
        <button type="button" @click="fastToast.show = false"
          class="text-white/60 hover:text-white transition p-1 text-xs cursor-pointer">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    </transition>

    <!-- TOAST NOTIFICATION MODAL (REPLACES BROWSER ALERT) -->
    <div v-if="toastModal.show"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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

    <!-- PAYMENT RECEIPT & IMAGE PREVIEW MODAL WITH INTERACTIVE ZOOM & PAN -->
    <div v-if="receiptModal.show && receiptModal.url"
      class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
      @click.self="closeReceiptModal">
      <div :class="[
        'relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-all',
        props.darkMode ? 'bg-gray-900 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Header -->
        <div
          class="px-5 py-3.5 border-b flex items-center justify-between dark:border-gray-800 shrink-0 flex-wrap gap-2">
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

          <!-- Zoom & Modal Controls Toolbar -->
          <div class="flex items-center gap-1.5 sm:gap-2">
            <!-- Zoom Controls (for image receipts) -->
            <template v-if="!isPdfUrl(receiptModal.url)">
              <div
                class="flex items-center bg-gray-100 dark:bg-gray-800/80 rounded-xl p-0.5 border border-gray-200 dark:border-gray-700">
                <button type="button" @click="zoomOutReceipt" :disabled="receiptZoom <= 0.5"
                  class="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 flex items-center justify-center text-xs transition cursor-pointer"
                  title="Zoom Out (-)">
                  <i class="fas fa-search-minus"></i>
                </button>
                <button type="button" @click="resetReceiptView"
                  class="px-2 py-0.5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer min-w-[46px] text-center"
                  title="Click to reset zoom (100%)">
                  {{ Math.round(receiptZoom * 100) }}%
                </button>
                <button type="button" @click="zoomInReceipt" :disabled="receiptZoom >= 4"
                  class="w-7 h-7 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-40 flex items-center justify-center text-xs transition cursor-pointer"
                  title="Zoom In (+)">
                  <i class="fas fa-search-plus"></i>
                </button>
              </div>

              <!-- Reset Zoom button -->
              <button type="button" @click="resetReceiptView"
                class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs transition cursor-pointer"
                title="Reset Zoom & Pan">
                <i class="fas fa-arrows-rotate"></i>
              </button>

              <!-- Rotate button -->
              <button type="button" @click="rotateReceipt"
                class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs transition cursor-pointer"
                title="Rotate 90°">
                <i class="fas fa-rotate-right"></i>
              </button>
            </template>

            <!-- Open in new tab -->
            <a :href="receiptModal.url" target="_blank" rel="noopener noreferrer"
              class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/60 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs transition cursor-pointer"
              title="Open full file in new tab">
              <i class="fas fa-arrow-up-right-from-square"></i>
            </a>

            <!-- Close button -->
            <button type="button" @click="closeReceiptModal"
              class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-rose-500 hover:text-white text-gray-600 dark:text-gray-300 transition flex items-center justify-center text-xs font-bold cursor-pointer"
              title="Close modal (Esc)">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Document / Image Content Area with Interactive Zoom & Drag Pan -->
        <div
          class="p-3 sm:p-5 overflow-hidden flex-1 flex items-center justify-center bg-slate-900/5 dark:bg-black/50 min-h-[320px] select-none relative"
          @wheel="onReceiptWheel" @mousedown="startReceiptDrag" @mousemove="onReceiptDrag" @mouseup="stopReceiptDrag"
          @mouseleave="stopReceiptDrag" :class="[
            receiptZoom > 1 || receiptRotation !== 0
              ? (isReceiptDragging ? 'cursor-grabbing' : 'cursor-grab')
              : 'cursor-default'
          ]">
          <iframe v-if="isPdfUrl(receiptModal.url)" :src="receiptModal.url"
            class="w-full h-[68vh] rounded-xl border border-gray-200 dark:border-gray-800" />
          <div v-else class="w-full h-full flex items-center justify-center overflow-hidden">
            <img :src="receiptModal.url" :alt="receiptModal.title" @dblclick="toggleReceiptZoomFit" :style="{
              transform: `translate(${receiptPan.x}px, ${receiptPan.y}px) scale(${receiptZoom}) rotate(${receiptRotation}deg)`,
              transformOrigin: 'center center',
              transition: isReceiptDragging ? 'none' : 'transform 0.15s ease-out'
            }"
              class="max-h-[68vh] max-w-full w-auto object-contain rounded-xl border shadow-md border-gray-200 dark:border-gray-800 select-none pointer-events-auto"
              draggable="false" title="Double-click: 200% zoom/reset · Wheel: Zoom · Drag: Pan" />
          </div>

          <!-- Zoom Interaction Hint -->
          <div v-if="!isPdfUrl(receiptModal.url)"
            class="absolute bottom-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[10px] pointer-events-none flex items-center gap-1.5 opacity-70">
            <i class="fas fa-mouse text-[9px]"></i> Scroll to zoom · Drag to pan · Double-click
          </div>
        </div>

        <!-- Footer -->
        <div
          class="px-5 py-3 border-t dark:border-gray-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-gray-900/50 shrink-0 flex-wrap gap-2">
          <div class="text-[11px] text-gray-500 dark:text-gray-400">
            <span
              v-if="receiptModal.runner && (receiptModal.runner.grand_total_payment || receiptModal.runner.grand_total)">
              Amount Due: <strong class="text-emerald-600 dark:text-emerald-400 font-bold">₱{{
                Number(receiptModal.runner.grand_total_payment || receiptModal.runner.grand_total || 0).toLocaleString()
              }}</strong>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Quick Approve inside Receipt Modal -->
            <button v-if="receiptModal.runner && receiptModal.runner.payment_status !== 'Confirmed'" type="button"
              @click="executeConfirmPayment(receiptModal.runner); closeReceiptModal();" :disabled="isConfirming"
              class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition active:scale-95 disabled:opacity-50"
              title="Approve / Confirm payment for this runner">
              <i class="fas fa-check"></i>
              <span>Approve Payment</span>
            </button>
            <span v-else-if="receiptModal.runner && receiptModal.runner.payment_status === 'Confirmed'"
              class="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 shadow-2xs select-none">
              <i class="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i> Approved
            </span>

            <button type="button" @click="closeReceiptModal"
              class="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition cursor-pointer">
              Close
            </button>
          </div>
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
              This order is locked under <strong class="text-purple-600 dark:text-purple-400">{{
                unlockPromptModal.target.batch_name }}</strong>.
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
            <span>{{ isTogglingLock ? 'Updating...' : ((unlockPromptModal.target.batch_locked ||
              unlockPromptModal.target.is_locked) ? 'Yes, Bypass & Unlock' : 'Yes, Lock Order') }}</span>
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
        <div
          class="p-4 sm:p-5 border-b dark:border-gray-700 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-gray-900/50">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs uppercase shadow-xs">
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
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
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
        <div
          class="px-4 py-2 bg-emerald-50/80 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between gap-2 text-[11px]">
          <div class="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
            <i class="fas fa-info-circle text-emerald-600 dark:text-emerald-400"></i>
            <span>Admin communication messages automatically notify the runner via email at <strong>{{
              chatModalRunner.contact_email || 'their registered email' }}</strong>.</span>
          </div>
          <span v-if="chatEmailSent"
            class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] shrink-0 flex items-center gap-1">
            <i class="fas fa-check"></i> Email Dispatched
          </span>
        </div>

        <!-- Quick Reply Suggestions / Templates -->
        <div
          class="px-4 py-2 border-b dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/30 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span class="text-[10px] font-extrabold text-gray-400 uppercase shrink-0">
            <i class="fas fa-bolt text-amber-400 mr-0.5"></i> Quick Reply:
          </span>
          <button type="button"
            @click="applyChatTemplate('Please upload a clearer copy or official screenshot of your payment receipt.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            Receipt Clarification
          </button>
          <button type="button"
            @click="applyChatTemplate('Payment verified! Your registration for The Emerald Run is officially confirmed.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            Payment Confirmed
          </button>
          <button type="button"
            @click="applyChatTemplate('Please confirm your preferred event t-shirt size so we can reserve your kit.')"
            class="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 hover:border-emerald-400 text-gray-700 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap transition cursor-pointer shrink-0">
            T-Shirt Size
          </button>
          <button type="button"
            @click="applyChatTemplate('Please provide your valid LSU ID number for discount verification.')"
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
          <div v-else-if="!chatMessages.length"
            class="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <div
              class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-xl mb-2">
              <i class="far fa-comments"></i>
            </div>
            <p class="text-sm font-bold text-gray-600 dark:text-gray-300">No messages exchanged yet</p>
            <p class="text-xs text-gray-400 max-w-sm mt-1">
              Start the conversation by sending a follow-up remark or inquiry response to {{ chatModalRunner.firstname
              }}
              below.
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
                  {{ msg.sender_type === 'admin' ? (msg.sender || 'Admin') : (msg.sender || chatModalRunner.firstname ||
                  'Runner') }}
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
                <a v-if="isPdfAttachment(msg.attachment_url, msg.attachment_name)" :href="cleanURL(msg.attachment_url, msg.attachment_name)" target="_blank"
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
                  <a :href="getCleanUrl(msg.attachment_url, msg.attachment_name)" target="_blank"
                    class="block group relative overflow-hidden rounded-xl">
                    <img :src="getCleanUrl(msg.attachment_url, msg.attachment_name)" :alt="msg.attachment_name || 'Attached Image'"
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
            ]" title="Attach image (PNG, JPG, WEBP) or PDF document (max 10 MB)">
              <i class="fas fa-paperclip text-sm"></i>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" class="hidden"
                @change="handleChatAttachmentChange" :disabled="isSendingChat" />
            </label>

            <!-- Textarea -->
            <div class="flex-1 relative">
              <textarea v-model="chatInput" :disabled="isSendingChat" @keydown.enter.ctrl="sendAdminMessage" rows="2"
                placeholder="Type response or remarks to this runner... (Press Ctrl + Enter to send)" :class="[
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

    <!-- ── CSV TEMPLATE IMPORT PREVIEW MODAL (VVIP, BROTHERS, SPONSORS DIRECT IMPORT) ── -->
    <div v-if="isCsvImportModalOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
      @click.self="isCsvImportModalOpen = false">
      <div :class="[
        'relative w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all space-y-4 overflow-hidden max-h-[92vh] flex flex-col',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Top Gradient Accent Bar -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-emerald-500 to-blue-500">
        </div>

        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b pb-3.5 dark:border-gray-700 shrink-0">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold shadow-xs">
              <i class="fas fa-file-csv"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Import Runners from CSV
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  {{ csvParsedRunners.length }} Found
                </span>
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                File: <strong class="text-emerald-600 dark:text-emerald-400">{{ csvUploadFileName }}</strong> · Review
                parsed runners before confirming direct import
              </p>
            </div>
          </div>
          <button type="button" @click="isCsvImportModalOpen = false"
            class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <!-- Breakdown Chips (VVIP, Brothers, Sponsors, Employees, Students, Others) -->
        <div class="flex items-center gap-2 flex-wrap shrink-0 pt-0.5">
          <div v-if="csvImportStats.vvip > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-xs">
            <i class="fas fa-crown text-amber-500 text-xs"></i>
            <span>VVIP:</span>
            <span class="font-black text-sm">{{ csvImportStats.vvip }}</span>
          </div>

          <div v-if="csvImportStats.brothers > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
            <i class="fas fa-cross text-emerald-600 text-xs"></i>
            <span>De La Salle Brothers:</span>
            <span class="font-black text-sm">{{ csvImportStats.brothers }}</span>
          </div>

          <div v-if="csvImportStats.sponsors > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shadow-xs">
            <i class="fas fa-handshake text-blue-600 text-xs"></i>
            <span>Sponsors:</span>
            <span class="font-black text-sm">{{ csvImportStats.sponsors }}</span>
          </div>

          <div v-if="csvImportStats.employees > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-teal-100 dark:bg-teal-950/70 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800 shadow-xs">
            <i class="fas fa-id-badge text-teal-600 text-xs"></i>
            <span>Employees / GSO:</span>
            <span class="font-black text-sm">{{ csvImportStats.employees }}</span>
          </div>

          <div v-if="csvImportStats.students > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs">
            <i class="fas fa-user-graduate text-amber-600 text-xs"></i>
            <span>Students:</span>
            <span class="font-black text-sm">{{ csvImportStats.students }}</span>
          </div>

          <div v-if="csvImportStats.alumni > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-cyan-100 dark:bg-cyan-950/70 text-cyan-900 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 shadow-xs">
            <i class="fas fa-user-shield text-cyan-600 text-xs"></i>
            <span>Alumni:</span>
            <span class="font-black text-sm">{{ csvImportStats.alumni }}</span>
          </div>

          <div v-if="csvImportStats.others > 0"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 shadow-xs">
            <i class="fas fa-users text-gray-500 text-xs"></i>
            <span>Others:</span>
            <span class="font-black text-sm">{{ csvImportStats.others }}</span>
          </div>
        </div>

        <!-- Scrollable Table Preview -->
        <div class="flex-1 overflow-y-auto border rounded-2xl dark:border-gray-700 min-h-[220px]">
          <table class="w-full text-left text-xs border-collapse">
            <thead
              class="sticky top-0 bg-slate-100 dark:bg-gray-900/90 backdrop-blur-sm border-b dark:border-gray-700 text-gray-500 uppercase text-[10px] font-bold z-10">
              <tr>
                <th class="py-2.5 px-3">#</th>
                <th class="py-2.5 px-3">Classification</th>
                <th class="py-2.5 px-3">Runner Name</th>
                <th class="py-2.5 px-3">Category</th>
                <th class="py-2.5 px-3">Shirt Size</th>
                <th class="py-2.5 px-3">Contact / Email</th>
                <th class="py-2.5 px-3">Organization / Sponsor</th>
                <th class="py-2.5 px-3">Payment</th>
              </tr>
            </thead>
            <tbody class="divide-y dark:divide-gray-700/60 font-medium">
              <tr v-for="(r, idx) in csvParsedRunners" :key="idx"
                class="hover:bg-slate-50 dark:hover:bg-gray-700/40 transition">
                <td class="py-2 px-3 text-gray-400 text-[11px] font-bold">{{ idx + 1 }}</td>

                <!-- Classification -->
                <td class="py-2 px-3 whitespace-nowrap">
                  <span :class="[
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                    r.participant_type === 'VVIP'
                      ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
                      : r.participant_type === 'De La Salle Brothers'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                        : r.participant_type === 'Sponsors'
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                          : r.participant_type === 'LSU Exclusive - Employee' || r.participant_type === 'GSC' || r.participant_type === 'GSO'
                            ? 'bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-300 border-teal-300'
                            : r.participant_type === 'LSU Exclusive - Enrolled Student'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                              : 'bg-slate-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-slate-200 dark:border-gray-600'
                  ]">
                    <i v-if="r.participant_type === 'VVIP'" class="fas fa-crown text-amber-500 text-[9px]"></i>
                    <i v-else-if="r.participant_type === 'De La Salle Brothers'"
                      class="fas fa-cross text-emerald-600 text-[9px]"></i>
                    <i v-else-if="r.participant_type === 'Sponsors'"
                      class="fas fa-handshake text-blue-600 text-[9px]"></i>
                    <i v-else-if="r.participant_type === 'LSU Exclusive - Employee' || r.participant_type === 'GSC' || r.participant_type === 'GSO'"
                      class="fas fa-id-badge text-teal-600 text-[9px]"></i>
                    <i v-else-if="r.participant_type === 'LSU Exclusive - Enrolled Student'"
                      class="fas fa-user-graduate text-amber-600 text-[9px]"></i>
                    <span>{{ r.participant_type }}</span>
                  </span>
                </td>

                <!-- Name -->
                <td class="py-2 px-3 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {{ r.firstname }} {{ r.middlename ? r.middlename[0] + '.' : '' }} {{ r.lastname }}{{ r.suffix ? ' ' +
                  r.suffix : '' }}
                </td>

                <!-- Category -->
                <td class="py-2 px-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-0.5 rounded-full font-black text-[10px] text-white shadow-xs',
                    runCategories.find(c => r.run_category && r.run_category.startsWith(c.id))?.color || 'bg-emerald-700'
                  ]">
                    {{ r.run_category }}
                  </span>
                </td>

                <!-- Shirt Size -->
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300 font-semibold text-[11px] whitespace-nowrap">
                  {{ (r.tshirt_size || 'M').replace(/;/g, ' ').trim() }}
                </td>

                <!-- Contact / Email -->
                <td class="py-2 px-3 text-gray-500 text-[11px]">
                  <div v-if="r.contact_email" class="truncate max-w-[170px]" :title="r.contact_email">
                    <i class="fas fa-envelope text-[9px] mr-1 opacity-70"></i>{{ r.contact_email }}
                  </div>
                  <div v-if="r.contact_number" class="text-[10px]">
                    <i class="fas fa-phone text-[9px] mr-1 opacity-70"></i>{{ r.contact_number }}
                  </div>
                  <span v-if="!r.contact_email && !r.contact_number" class="text-gray-400 italic">None</span>
                </td>

                <!-- Organization / Sponsor / Partner Office -->
                <td class="py-2 px-3 text-gray-600 dark:text-gray-300 text-[11px] max-w-[150px] truncate"
                  :title="r.organization || r.partner_office">
                  {{ r.organization || r.partner_office || '-' }}
                </td>

                <!-- Payment Status -->
                <td class="py-2 px-3 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800">
                    <i class="fas fa-check-circle text-[9px]"></i>
                    {{ r.payment_status || 'Confirmed' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal Bottom Actions & Instructions -->
        <div
          class="pt-3 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div class="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <i class="fas fa-info-circle text-emerald-500"></i>
            <span>
              BIB numbers are automatically allocated per KM category. Payment will be marked
              <strong>Confirmed</strong>.
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button type="button" @click="isCsvImportModalOpen = false" :disabled="isImportingCsv"
              class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="button" @click="executeCsvImport" :disabled="isImportingCsv || !csvParsedRunners.length"
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <i :class="['fas', isImportingCsv ? 'fa-spinner fa-spin' : 'fa-check']"></i>
              <span>{{ isImportingCsv ? 'Importing Runners...' : `Confirm & Import ${csvParsedRunners.length} Runners`
                }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── STUDENT CSV IMPORT PREVIEW MODAL (BEU / HEU DIRECT IMPORT) ── -->
    <div v-if="isStudentCsvModalOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
      @click.self="isStudentCsvModalOpen = false">
      <div :class="[
        'relative w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all space-y-4 overflow-hidden max-h-[94vh] flex flex-col',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Top Gradient Accent Bar (Sky to Indigo to Purple) -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500">
        </div>

        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b pb-3.5 dark:border-gray-700 shrink-0">
          <div class="flex items-center gap-3">
            <div
              class="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl font-bold shadow-xs">
              <i class="fas fa-user-graduate"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  Import {{ studentImportUnit }} Students from CSV
                </h3>
                <span
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                  {{ studentParsedRunners.length }} Ready
                </span>
                <span v-if="studentSkippedRunners.length > 0"
                  class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {{ studentSkippedRunners.length }} Skipped (Already Registered)
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                File: <strong class="text-sky-600 dark:text-sky-400">{{ studentCsvUploadFileName }}</strong> · Detecting
                duplicates, mapping academic records & shirt sizes
              </p>
            </div>
          </div>
          <button type="button" @click="isStudentCsvModalOpen = false"
            class="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <!-- Student Unit Selector & Preset Settings Banner -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Target Unit:</span>
            <div class="inline-flex rounded-xl p-0.5 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xs">
              <button type="button" @click="setStudentImportUnit('BEU')" :class="[
                'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                studentImportUnit === 'BEU'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-sky-600'
              ]">
                <i class="fas fa-school text-[11px]"></i>
                <span>BEU (Basic Education)</span>
              </button>
              <button type="button" @click="setStudentImportUnit('HEU')" :class="[
                'px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
                studentImportUnit === 'HEU'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-300 hover:text-indigo-600'
              ]">
                <i class="fas fa-graduation-cap text-[11px]"></i>
                <span>HEU (Higher Education)</span>
              </button>
            </div>
          </div>

          <!-- Configuration pills -->
          <div class="flex items-center gap-2 flex-wrap text-[11px] text-gray-600 dark:text-gray-300">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 font-bold">
              <i class="fas fa-person-running text-red-500"></i> Category: <strong
                class="text-red-600 dark:text-red-400">3KM</strong>
            </span>
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 font-bold">
              <i class="fas fa-shirt text-emerald-500"></i> Shirt: <strong
                class="text-emerald-600 dark:text-emerald-400">Event Shirt: Large</strong>
            </span>
            <span
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 font-bold">
              <i class="fas fa-envelope text-blue-500"></i> Default Email: <strong
                class="text-blue-600 dark:text-blue-400 font-mono">{{ studentImportUnit === 'BEU' ? 'is@lsu.edu.ph' :
                'dev@lsu.edu.ph' }}</strong>
            </span>
          </div>
        </div>

        <!-- Navigation Tabs: Ready vs Skipped -->
        <div class="flex items-center justify-between gap-2 border-b dark:border-gray-700 pb-1 shrink-0">
          <div class="flex items-center gap-2">
            <button type="button" @click="studentCsvActiveTab = 'valid'" :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border',
              studentCsvActiveTab === 'valid'
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]">
              <i class="fas fa-check-circle text-[11px]"></i>
              <span>Ready to Register</span>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-black">
                {{ studentParsedRunners.length }}
              </span>
            </button>

            <button type="button" @click="studentCsvActiveTab = 'skipped'" :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border',
              studentCsvActiveTab === 'skipped'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            ]">
              <i class="fas fa-ban text-[11px]"></i>
              <span>Already Registered (Skipped)</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 font-black"
                :class="{ '!bg-white/20 !text-white': studentCsvActiveTab === 'skipped' }">
                {{ studentSkippedRunners.length }}
              </span>
            </button>
          </div>

          <div class="text-[11px] text-gray-400 hidden sm:block">
            Showing <strong class="text-gray-700 dark:text-gray-200">{{ studentCsvActiveTab === 'valid' ?
              studentParsedRunners.length : studentSkippedRunners.length }}</strong> student(s)
          </div>
        </div>

        <!-- Table View: Ready to Register -->
        <div v-if="studentCsvActiveTab === 'valid'"
          class="flex-1 overflow-y-auto border rounded-2xl dark:border-gray-700 min-h-[240px]">
          <div v-if="studentParsedRunners.length === 0"
            class="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <i class="fas fa-user-check text-3xl mb-2 text-emerald-400 opacity-60"></i>
            <p class="font-bold text-sm">All students from this CSV are already registered!</p>
            <p class="text-xs mt-1">Check the "Already Registered (Skipped)" tab above to view them.</p>
          </div>
          <table v-else class="w-full text-left text-xs border-collapse">
            <thead
              class="sticky top-0 bg-slate-100 dark:bg-gray-900/90 backdrop-blur-sm border-b dark:border-gray-700 text-gray-500 uppercase text-[10px] font-bold z-10">
              <tr>
                <th class="py-2.5 px-3">#</th>
                <th class="py-2.5 px-3">Student ID</th>
                <th class="py-2.5 px-3">Student Name</th>
                <th class="py-2.5 px-3">Gender / DOB</th>
                <th class="py-2.5 px-3">Grade Level & Section</th>
                <th class="py-2.5 px-3">Student Email</th>
                <th class="py-2.5 px-3">Mobile</th>
                <th class="py-2.5 px-3">Category</th>
                <th class="py-2.5 px-3">Shirt Size</th>
              </tr>
            </thead>
            <tbody class="divide-y dark:divide-gray-700/60 font-medium">
              <tr v-for="(s, idx) in studentParsedRunners" :key="idx"
                class="hover:bg-slate-50 dark:hover:bg-gray-700/40 transition">
                <td class="py-2 px-3 text-gray-400 text-[11px] font-bold">{{ idx + 1 }}</td>
                <td class="py-2 px-3 whitespace-nowrap font-mono font-bold text-sky-700 dark:text-sky-300">
                  {{ s.lsu_id_number || '-' }}
                </td>
                <td class="py-2 px-3 whitespace-nowrap font-bold text-gray-900 dark:text-gray-100">
                  {{ s.firstname }} {{ s.middlename ? s.middlename + '.' : '' }} {{ s.lastname }}
                </td>
                <td class="py-2 px-3 whitespace-nowrap text-gray-600 dark:text-gray-300 text-[11px]">
                  <span>{{ s.gender }}</span>
                  <span v-if="s.birthdate" class="text-gray-400 ml-1">({{ s.birthdate }})</span>
                </td>
                <td class="py-2 px-3 text-gray-700 dark:text-gray-300 text-[11px] max-w-[200px]">
                  <div class="font-bold truncate" :title="s.grade_level">{{ s.grade_level }}</div>
                  <div v-if="s.section" class="text-[10px] text-gray-500 truncate" :title="s.section">
                    {{ s.section }}
                  </div>
                </td>
                <td class="py-2 px-3 whitespace-nowrap text-[11px]">
                  <div v-if="s.is_default_email"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[10px]"
                    :title="'Default email used because none provided in CSV'">
                    <i class="fas fa-wand-magic-sparkles text-[9px]"></i>
                    {{ s.contact_email }}
                  </div>
                  <div v-else class="text-gray-700 dark:text-gray-300 font-mono text-[11px] truncate max-w-[170px]"
                    :title="s.contact_email">
                    {{ s.contact_email }}
                  </div>
                </td>
                <td class="py-2 px-3 whitespace-nowrap text-gray-500 text-[11px] font-mono">
                  {{ s.contact_number || '-' }}
                </td>
                <td class="py-2 px-3 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-full font-black text-[10px] text-white bg-red-600 shadow-xs">
                    3KM
                  </span>
                </td>
                <td class="py-2 px-3 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <i class="fas fa-shirt text-[9px]"></i>
                    Event Shirt: Large
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table View: Skipped / Already Registered -->
        <div v-else class="flex-1 overflow-y-auto border rounded-2xl dark:border-gray-700 min-h-[240px]">
          <div v-if="studentSkippedRunners.length === 0"
            class="flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <i class="fas fa-check-double text-3xl mb-2 text-emerald-400 opacity-60"></i>
            <p class="font-bold text-sm">No duplicate registrations detected!</p>
            <p class="text-xs mt-1">All {{ studentParsedRunners.length }} student(s) in this CSV are new and ready to be
              registered.</p>
          </div>
          <table v-else class="w-full text-left text-xs border-collapse">
            <thead
              class="sticky top-0 bg-amber-50 dark:bg-amber-950/60 backdrop-blur-sm border-b dark:border-gray-700 text-amber-800 dark:text-amber-300 uppercase text-[10px] font-bold z-10">
              <tr>
                <th class="py-2.5 px-3">#</th>
                <th class="py-2.5 px-3">Student ID</th>
                <th class="py-2.5 px-3">Student Name</th>
                <th class="py-2.5 px-3">Grade & Section</th>
                <th class="py-2.5 px-3">Skip Reason / Duplicate Match</th>
                <th class="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y dark:divide-gray-700/60 font-medium">
              <tr v-for="(s, idx) in studentSkippedRunners" :key="idx"
                class="bg-amber-50/30 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition">
                <td class="py-2 px-3 text-gray-400 text-[11px] font-bold">{{ idx + 1 }}</td>
                <td class="py-2 px-3 whitespace-nowrap font-mono font-bold text-gray-700 dark:text-gray-300">
                  {{ s.lsu_id_number || '-' }}
                </td>
                <td class="py-2 px-3 whitespace-nowrap font-bold text-gray-800 dark:text-gray-200">
                  {{ s.firstname }} {{ s.middlename ? s.middlename + '.' : '' }} {{ s.lastname }}
                </td>
                <td class="py-2 px-3 text-gray-600 dark:text-gray-400 text-[11px] max-w-[180px] truncate">
                  {{ s.grade_level }} {{ s.section ? '· ' + s.section : '' }}
                </td>
                <td class="py-2 px-3 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                  <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700">
                    <i class="fas fa-exclamation-triangle text-amber-600 dark:text-amber-400 text-[10px]"></i>
                    {{ s.skip_reason }}
                  </span>
                </td>
                <td class="py-2 px-3 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    <i class="fas fa-forward text-[9px]"></i> Skipped
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal Bottom Actions -->
        <div
          class="pt-3 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div class="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <i class="fas fa-shield-halved text-sky-500"></i>
            <span>
              <strong>{{ studentSkippedRunners.length }}</strong> registered student(s) skipped to prevent duplicates.
              <strong>{{ studentParsedRunners.length }}</strong> will be registered with BIB numbers.
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button type="button" @click="isStudentCsvModalOpen = false" :disabled="isImportingStudentCsv"
              class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="button" @click="executeStudentCsvImport"
              :disabled="isImportingStudentCsv || !studentParsedRunners.length"
              class="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <i :class="['fas', isImportingStudentCsv ? 'fa-spinner fa-spin' : 'fa-check']"></i>
              <span>{{ isImportingStudentCsv ? 'Registering Students...' : `Confirm & Register
                ${studentParsedRunners.length} Students` }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── SLOT ALLOCATION ADJUSTMENT MODAL ── -->
    <div v-if="isSlotModalOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm overflow-y-auto"
      @click.self="closeSlotAdjustmentModal">
      <div :class="[
        ' lg:max-w-xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <!-- Top decorative gradient strip -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500">
        </div>

        <!-- Header -->
        <div class="flex items-start justify-between gap-3 border-b pb-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
              <i class="fas fa-gauge-high"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black tracking-tight">Adjust Category Slot Limits</h3>
              </div>
            </div>
          </div>
          <button type="button" @click="closeSlotAdjustmentModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <i class="fas fa-times text-base"></i>
          </button>
        </div>

        <!-- Summary Metric Cards -->
        <div class="grid grid-cols-3 gap-3 my-3">
          <div class="p-3 rounded-2xl border bg-slate-50 dark:bg-gray-900/60 dark:border-gray-700 text-center">
            <span class="text-[10px] uppercase font-bold text-gray-400 block">Total Slots</span>
            <span class="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {{ modalTotalSlots.toLocaleString() }}
            </span>
          </div>
          <div class="p-3 rounded-2xl border bg-slate-50 dark:bg-gray-900/60 dark:border-gray-700 text-center">
            <span class="text-[10px] uppercase font-bold text-gray-400 block"> Registered</span>
            <span class="text-xl font-black text-amber-500">
              {{ totalSlotsFilled.toLocaleString() }}
            </span>
            <span v-if="totalSlotsPending > 0" class="text-[9px] text-gray-400 block mt-0.5 truncate"
              :title="`${totalSlotsConfirmed.toLocaleString()} Confirmed · ${totalSlotsPending.toLocaleString()} Pending`">
              {{ totalSlotsConfirmed.toLocaleString() }} conf + {{ totalSlotsPending.toLocaleString() }} pend
            </span>
          </div>
          <div class="p-3 rounded-2xl border bg-slate-50 dark:bg-gray-900/60 dark:border-gray-700 text-center">
            <span class="text-[10px] uppercase font-bold text-gray-400 block"> Remaining</span>
            <span class="text-xl font-black text-sky-500">
              {{ Math.max(0, modalTotalSlots - totalSlotsFilled).toLocaleString() }}
            </span>
          </div>
        </div>

        <!-- Categories List -->
        <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          <div v-for="catKey in sortedSlotCategories" :key="catKey" :class="[
            'p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-2.5',
            props.darkMode ? 'bg-gray-900/40 border-gray-700/80 hover:border-gray-600' : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300'
          ]">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2.5">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-base font-black tracking-tight">{{ catKey }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">

                    <span v-if="getSlotCategoryPending(catKey) > 0"
                      class="text-[10px] text-amber-600 dark:text-amber-400 font-medium uppercase">
                      ({{ getSlotCategoryConfirmed(catKey) }} confirm + {{ getSlotCategoryPending(catKey) }} pending)
                    </span>
                    <span>= <strong class="text-gray-700 dark:text-gray-200">{{ getSlotCategoryTotal(catKey)
                        }}</strong></span>
                    <span>+</span>
                    <span>Remaining: <strong
                        :class="(slotEditValues[catKey] - getSlotCategoryTotal(catKey)) <= 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'">
                        {{ Math.max(0, slotEditValues[catKey] - getSlotCategoryTotal(catKey)) }}
                      </strong></span>
                    <span v-if="getSlotCategoryTotal(catKey) >= slotEditValues[catKey]"
                      class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-red-500 text-white">
                      FULL
                    </span>
                  </div>
                </div>
              </div>

              <!-- Input & Quick Steppers -->
              <div class="flex items-center gap-2">
                <div
                  class="flex items-center border rounded-xl overflow-hidden shadow-xs dark:border-gray-600 bg-white dark:bg-gray-800">
                  <button type="button" @click="adjustSlotBy(catKey, -25)"
                    class="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition text-xs font-bold"
                    title="Decrease by 25">
                    <i class="fas fa-minus text-[10px]"></i>
                  </button>
                  <input type="number" min="0" step="1" v-model.number="slotEditValues[catKey]"
                    class="w-16 py-1.5 text-center font-black text-sm bg-transparent outline-none focus:ring-0 border-x dark:border-gray-600 text-gray-800 dark:text-white" />
                  <button type="button" @click="adjustSlotBy(catKey, 500)"
                    class="px-2.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition text-xs font-bold"
                    title="Increase by 500">
                    <i class="fas fa-plus text-[10px]"></i>
                  </button>
                </div>

                <!-- Quick Presets -->
                <!-- <div class="hidden sm:flex items-center gap-1">
                  <button
                    type="button"
                    @click="adjustSlotBy(catKey, 500)"
                    class="px-2 py-1 rounded-lg text-[10px] font-bold border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    +500
                  </button>
                </div> -->
              </div>
            </div>

            <!-- Mini Progress Bar -->
            <div class="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-300 rounded-full" :class="[
                (getSlotCategoryTotal(catKey) / (slotEditValues[catKey] || 1)) >= 1 ? 'bg-red-500' :
                  (getSlotCategoryTotal(catKey) / (slotEditValues[catKey] || 1)) >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
              ]"
                :style="{ width: `${Math.min(100, Math.round((getSlotCategoryTotal(catKey) / (slotEditValues[catKey] || 1)) * 100))}%` }">
              </div>
            </div>
          </div>
        </div>

        <!-- Add Custom Category & Reset Defaults -->
        <div class="pt-2 border-t dark:border-gray-700 flex items-center justify-between flex-wrap gap-2 my-3">
          <div class="flex items-center gap-2">
            <input type="text" v-model="newCategoryCode" placeholder="e.g. 5KM or 42KM"
              class="w-32 px-3 py-1.5 rounded-xl border text-xs dark:bg-gray-900 dark:border-gray-700 outline-none uppercase font-bold" />
            <button type="button" @click="addNewCategorySlot" :disabled="!newCategoryCode.trim()"
              class="px-3 py-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-xs font-bold transition flex items-center gap-1 disabled:opacity-40">
              <i class="fas fa-plus text-[10px]"></i> Add Category
            </button>
          </div>

          <button type="button" @click="resetSlotDefaults"
            class="text-[11px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1 transition cursor-pointer">
            <i class="fas fa-rotate-left text-[10px]"></i> Reset to Defaults (50/1000/375/300)
          </button>
        </div>

        <!-- Modal Bottom Actions -->
        <div class="pt-3 border-t dark:border-gray-700 flex items-center justify-between gap-3">
          <span class="text-[11px] text-gray-400 hidden sm:inline">
            <i class="fas fa-shield-halved text-emerald-500 mr-1"></i>
            The Emerald Run
          </span>

          <div class="flex items-center gap-2 ml-auto">
            <button type="button" @click="closeSlotAdjustmentModal" :disabled="isSavingSlots"
              class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
              Cancel
            </button>
            <button type="button" @click="saveSlotAdjustments" :disabled="isSavingSlots"
              class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer">
              <i :class="['fas', isSavingSlots ? 'fa-spinner fa-spin' : 'fa-floppy-disk']"></i>
              <span>{{ isSavingSlots ? 'Saving Slots...' : 'Save & Update Slots' }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         MODAL 1: MOBILE QR SCANNER MODAL FOR RACE KIT CLAIMING
         ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="isQrScannerModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div
        class="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[92vh]">
        <!-- Scanner Header -->
        <div
          class="p-4 border-b dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-emerald-700 to-teal-800 text-white">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <i class="fas fa-qrcode text-amber-300 text-sm"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-sm tracking-tight leading-tight">Scan QR for Claiming</h3>
              <p class="text-[10px] text-emerald-200">Point phone camera at runner's QR pass</p>
            </div>
          </div>
          <button type="button" @click="closeQrClaimScanner"
            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <!-- Camera Viewport / Reader -->
        <div class="p-4 flex flex-col items-center justify-center relative bg-slate-900">
          <div id="qr-reader-camera"
            class="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-inner border-2 border-emerald-500/70 relative">
          </div>

          <!-- Helper alert if error or camera blocked -->
          <div v-if="scannerErrorMessage"
            class="mt-3 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs text-center">
            <i class="fas fa-triangle-exclamation text-rose-400 mr-1"></i>
            {{ scannerErrorMessage }}
          </div>

          <div v-else class="mt-3 text-center">
            <p class="text-[11px] text-gray-400 flex items-center justify-center gap-1.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-detecting QR code... hold steady
            </p>
          </div>
        </div>

        <!-- Manual Bib/ID Search Fallback -->
        <div class="p-4 border-t dark:border-gray-700/80 bg-slate-50 dark:bg-gray-900/60 space-y-2">
          <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Or Enter Bib # or Reg ID manually:
          </label>
          <div class="flex gap-2">
            <div class="relative flex-1">
              <i class="fas fa-barcode absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input type="text" v-model="manualSearchQuery" @keyup.enter="verifyAndOpenClaimModal(manualSearchQuery)"
                placeholder="e.g. 10-0005, 01-0012, or #123"
                class="w-full pl-8 pr-3 py-2 rounded-xl border text-xs dark:bg-gray-800 dark:border-gray-700 outline-none uppercase font-bold" />
            </div>
            <button type="button" @click="verifyAndOpenClaimModal(manualSearchQuery)"
              :disabled="!manualSearchQuery.trim() || isVerifyingCode"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer">
              <i :class="['fas', isVerifyingCode ? 'fa-spinner fa-spin' : 'fa-search']"></i>
              <span>Verify</span>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-3 border-t dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
          <span class="text-[10px]">
            <i class="fas fa-user-shield text-emerald-600 mr-1"></i>
            Claimer: {{ currentOperator.split('@')[0] }}
          </span>
          <button type="button" @click="closeQrClaimScanner"
            class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-700">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         MODAL 2: CLAIM VERIFICATION & INCLUSIONS CHECKLIST MODAL
         ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="isClaimVerificationModalOpen && activeClaimRunner"
      class="fixed  inset-0 z-50 justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm transition-opacity overflow-y-scroll">
      <div
        class="bg-white dark:bg-gray-800 lg:w-fit w-full mx-auto overflow-hidden shadow-2xl  flex flex-col">
        <!-- Header -->
        <div
          class="px-4 py-1 border-b dark:border-gray-700/80 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div>
              <h3 class="font-extrabold text-sm sm:text-base tracking-tight leading-tight">Race Kit Claiming & Inclusions
              </h3>
            </div>
          </div>
          <button type="button" @click="closeClaimVerificationModal"
            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <div class="p-2 overflow-y-auto space-y-1">
          <!-- ALREADY CLAIMED WARNING BANNER -->
          <div v-if="activeClaimRunner.kit_claimed"
            class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center text-sm shrink-0 mt-0.5">
              <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div class="flex-1">
              <h4 class="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wide">
                Notice: Kit Already Claimed
              </h4>
              <p class="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                This runner's kit was marked claimed on
                <strong>{{ activeClaimRunner.kit_claimed_at ? new
                  Date(activeClaimRunner.kit_claimed_at).toLocaleString() :
                  'N/A' }}</strong>
                by <strong>{{ activeClaimRunner.kit_claimed_by || 'Admin' }}</strong>.
              </p>
              <div class="mt-2.5 flex items-center gap-2 flex-wrap">
                <button type="button" @click="resendClaimEmail(activeClaimRunner)" :disabled="isResendingClaimEmail"
                  class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-60 shadow-2xs">
                  <i :class="['fas', isResendingClaimEmail ? 'fa-spinner fa-spin' : 'fa-paper-plane text-[10px]']"></i>
                  <span>{{ isResendingClaimEmail ? 'Sending...' : 'Resend Claim Email' }}</span>
                </button>
                <button type="button" @click="promptUnclaim(activeClaimRunner)" :disabled="isUnclaiming"
                  class="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-60 border border-rose-300 dark:border-rose-700">
                  <i :class="['fas', isUnclaiming ? 'fa-spinner fa-spin' : 'fa-rotate-left text-[10px]']"></i>
                  <span>{{ isUnclaiming ? 'Reverting...' : 'Undo Claim' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- RUNNER PROFILE SUMMARY CARD -->
          <div
            class="p-4 rounded-2xl border border-slate-200 dark:border-gray-700/80 bg-slate-50 dark:bg-gray-900/40 space-y-2.5">
            <div class="flex items-center justify-between flex-wrap">
              <div class="flex items-center">
         
                <span :class="[
                  'px-2 py-0.5 rounded font-black text-[10px] text-white uppercase shadow-2xs',
                  runCategories.find(c => normalizeCategory(activeClaimRunner.run_category) === c.id)?.color || 'bg-emerald-700'
                ]">
                    {{ activeClaimRunner.run_number || ('AR-' + activeClaimRunner.id) }}
                </span>
              </div>
              <span :class="[
                'px-2 py-0.5 rounded-full text-[10px] font-bold',
                activeClaimRunner.payment_status === 'Confirmed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              ]">
                <i
                  :class="['fas mr-0.5', activeClaimRunner.payment_status === 'Confirmed' ? 'fa-check-circle text-emerald-600' : 'fa-clock text-amber-500']"></i>
                {{ activeClaimRunner.payment_status || 'Pending Payment' }}
              </span>
            </div>

            <div>
              <h4 class="font-black text-xs text-gray-900 dark:text-gray-100 uppercase">
                {{ activeClaimRunner.firstname }} {{ activeClaimRunner.middlename ? activeClaimRunner.middlename[0] +
                '.' :
                '' }} {{ activeClaimRunner.lastname }} {{ activeClaimRunner.suffix || '' }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ activeClaimRunner.contact_email || activeClaimRunner.email }} &middot; {{
                  activeClaimRunner.contact_number || 'No phone' }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2 border-t dark:border-gray-800 text-xs">
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block">Classification</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ activeClaimRunner.participant_type || 'Open Category' }}</span>
              </div>
              <div>
                <span class="text-[10px] font-bold text-gray-400 uppercase block">Official Shirt Size</span>
                <span class="font-black text-emerald-700 dark:text-emerald-400 uppercase">{{
                  activeClaimRunner.tshirt_size
                  || 'M' }}</span>
              </div>
              <div v-if="activeClaimRunner.pet_name">
                <span class="text-[10px] font-bold text-gray-400 uppercase block">Pet Companion</span>
                <span class="font-bold text-gray-800 dark:text-gray-200">{{ activeClaimRunner.pet_name }} ({{
                  activeClaimRunner.pet_type || 'Pet' }})</span>
              </div>
              
            </div>
          </div>

          <!-- ── PARTICIPANT VALID ID VERIFICATION & CAMERA SNAP ── -->
          <div
            class="p-4 rounded-2xl border transition-all space-y-3"
            :class="getImageUrl(activeClaimRunner.valid_id_front)
              ? (props.darkMode ? 'bg-emerald-950/25 border-emerald-700/60' : 'bg-emerald-50/70 border-emerald-200')
              : (props.darkMode ? 'bg-amber-950/25 border-amber-800/60' : 'bg-amber-50/70 border-amber-200')"
          >
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                    getImageUrl(activeClaimRunner.valid_id_front)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white animate-pulse'
                  ]"
                >
                  <i :class="getImageUrl(activeClaimRunner.valid_id_front) ? 'fas fa-id-card-clip' : 'fas fa-camera'"></i>
                </div>
                <div>
                  <h5 class="text-xs font-black uppercase tracking-wide flex items-center gap-1.5">
                    <span>Valid ID Verification</span>
                    <span
                      v-if="getImageUrl(activeClaimRunner.valid_id_front)"
                      class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black tracking-normal"
                    >
                      <i class="fas fa-check text-[8px] mr-0.5"></i> Recorded
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black tracking-normal"
                    >
                      Verification Needed
                    </span>
                  </h5>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400">
                    {{ getImageUrl(activeClaimRunner.valid_id_front)
                      ? 'Participant identity verified and recorded on file.'
                      : 'Take a picture of participant Valid ID with camera before releasing kit.' }}
                  </p>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  @click="openValidIdCamera(activeClaimRunner)"
                  :disabled="isValidIdUploading"
                  class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <i class="fas fa-camera text-xs"></i>
                  <span>{{ getImageUrl(activeClaimRunner.valid_id_front) ? 'Retake Photo' : 'Take Picture (Camera)' }}</span>
                </button>

                <label
                  class="px-2.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Upload Valid ID file"
                >
                  <i class="fas fa-upload text-[11px]"></i>
                  <span class="hidden sm:inline">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    class="hidden"
                    @change="handleValidIdFileSelect($event, activeClaimRunner)"
                    :disabled="isValidIdUploading"
                  />
                </label>
              </div>
            </div>

            <!-- If Valid ID is recorded, display it -->
            <div
              v-if="getImageUrl(activeClaimRunner.valid_id_front)"
              class="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800/80 shadow-2xs"
            >
              <div
                class="relative group w-20 h-14 sm:w-28 sm:h-18 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border shrink-0 cursor-pointer"
                @click="openReceiptModal(getImageUrl(activeClaimRunner.valid_id_front), 'Valid ID - ' + activeClaimRunner.firstname + ' ' + activeClaimRunner.lastname, activeClaimRunner)"
              >
                <img
                  :src="getImageUrl(activeClaimRunner.valid_id_front)"
                  alt="Valid ID"
                  class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                  <i class="fas fa-magnifying-glass-plus"></i> View
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-extrabold text-gray-900 dark:text-gray-100 truncate">
                    Valid ID Captured
                  </span>
                  <span class="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>
                <p class="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  Identity recorded. Click image to enlarge full preview.
                </p>
                <div class="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    @click="openReceiptModal(getImageUrl(activeClaimRunner.valid_id_front), 'Valid ID - ' + activeClaimRunner.firstname + ' ' + activeClaimRunner.lastname, activeClaimRunner)"
                    class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i class="fas fa-eye text-[10px]"></i> View Full Image
                  </button>
                  <span class="text-gray-300 dark:text-gray-600">&middot;</span>
                  <button
                    type="button"
                    @click="promptDeleteValidId(activeClaimRunner)"
                    :disabled="isValidIdDeleting"
                    class="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i class="fas fa-trash text-[10px]"></i> Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State / Prompt to snap photo -->
            <div
              v-else
              class="p-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/10 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <i class="fas fa-id-card text-xs"></i>
                </div>
                <div>
                  <p class="text-xs font-bold text-amber-900 dark:text-amber-200">No Valid ID Recorded Yet</p>
                  <p class="text-[10px] text-amber-700 dark:text-amber-400">
                    Snap a picture with camera or upload proof of identity.
                  </p>
                </div>
              </div>
              <button
                type="button"
                @click="openValidIdCamera(activeClaimRunner)"
                class="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <i class="fas fa-camera text-[10px]"></i>
                <span>Open Camera</span>
              </button>
            </div>
          </div>

          <!-- INCLUSIONS CHECKLIST SECTION -->
          <div class="space-y-2.5 mt-3">
            <div class="flex items-center justify-between">
              <div>
                <h5
                  class="font-extrabold text-xs text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                  <i class="fas fa-list-check text-emerald-600"></i>
                  <span>Kit Inclusions Checklist</span>
                </h5>
              </div>

              <!-- Check All / Clear Button -->
              <button type="button" @click="toggleAllInclusions"
                class="px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 cursor-pointer">
                {{ allInclusionsChecked ? 'Uncheck All' : 'Check All' }}
              </button>
            </div>

            <!-- Inclusions Items list -->
            <div class="space-y-1">
              <label v-for="item in claimInclusions" :key="item" :class="[
                'flex items-center px-2 py-2 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99]',
                selectedClaimInclusions.includes(item)
                  ? (props.darkMode ? 'bg-emerald-950/40 border-emerald-700 text-white' : 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-semibold shadow-2xs')
                  : (props.darkMode ? 'bg-gray-900/40 border-gray-700 text-gray-400' : 'bg-white border-slate-200 text-gray-700 hover:bg-slate-50')
              ]">
                <input type="checkbox" :value="item" v-model="selectedClaimInclusions"
                  class="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer mr-3" />
                <div class="flex-1 flex items-center justify-between text-xs sm:text-sm">
                  <span>{{ item }}</span>
                  <i v-if="selectedClaimInclusions.includes(item)"
                    class="fas fa-check text-emerald-600 text-xs font-black"></i>
                </div>
              </label>
            </div>

            <div class="text-right text-[11px] text-gray-500">
              Selected <strong>{{ selectedClaimInclusions.length }}</strong> of {{ claimInclusions.length }} inclusions
            </div>
          </div>

          <!-- Claim Operator Notice -->
          <div
            class="p-3 rounded-xl bg-slate-100 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
            <span class="text-[11px]">
              <i class="fas fa-user-check text-emerald-500 mr-1"></i>
              Disbursed By: <strong>{{ currentOperator }}</strong>
            </span>
            <span class="text-[10px] text-gray-400">
              {{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div
          class="p-4 border-t dark:border-gray-700 bg-slate-50 dark:bg-gray-900/60 flex items-center justify-between gap-3">
          <button type="button" @click="closeClaimVerificationModal"
            class="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
            Cancel
          </button>

          <button type="button" @click="executeConfirmClaim" :disabled="isConfirmingClaim"
            class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">
            <i
              :class="['fas', isConfirmingClaim ? 'fa-spinner fa-spin' : (activeClaimRunner.kit_claimed ? 'fa-check-double' : 'fa-box-check')]"></i>
            <span>{{ isConfirmingClaim ? 'Recording Claim...' : (activeClaimRunner.kit_claimed ? 'Update Claim Inclusions' : 'Confirm & Release Kit (Sends Email)') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         MODAL 3: RUNNER QR CLAIM PASS PREVIEW MODAL
         ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="isRunnerQrPassModalOpen && claimQrPassData"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-opacity">
      <div
        class="bg-white dark:bg-gray-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col text-center">
        <!-- Header -->
        <div class="p-4 bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 text-white relative">
          <span
            class="inline-block px-3 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider mb-1">
            Official Claim Pass
          </span>
          <h3 class="font-black text-lg leading-tight uppercase">
            {{ claimQrPassData.runner.firstname }} {{ claimQrPassData.runner.lastname }}
          </h3>
          <p class="text-xs text-emerald-200 font-bold">
            BIB # {{ claimQrPassData.runner.run_number || ('AR-' + claimQrPassData.runner.id) }} &middot; {{
              claimQrPassData.runner.run_category }}
          </p>
          <button type="button" @click="closeRunnerQrPassModal"
            class="absolute right-3 top-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs cursor-pointer">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body with QR -->
        <div class="p-6 space-y-3 bg-white dark:bg-gray-800 flex flex-col items-center">
          <div class="p-3 bg-white rounded-2xl shadow-md border-2 border-dashed border-emerald-500 inline-block">
            <img v-if="claimQrPassData.qr_code_url || claimQrPassData.qr_code_base64"
              :src="claimQrPassData.qr_code_url || claimQrPassData.qr_code_base64" alt="Claim QR Code"
              class="w-48 h-48 rounded-xl object-contain mx-auto" />
            <div v-else class="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400">
              <i class="fas fa-qrcode text-5xl text-emerald-600"></i>
            </div>
          </div>

          <div
            class="font-mono text-xs font-black text-emerald-800 dark:text-emerald-300 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg">
            {{ claimQrPassData.claim_code }}
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 leading-snug max-w-xs">
            Present this QR code on mobile screen or printout to the distribution desk to verify and claim your race
            kit.
          </p>

          <div class="w-full text-left pt-2 border-t dark:border-gray-700 text-xs space-y-1">
            <span class="text-[10px] font-bold text-gray-400 uppercase block">Inclusions</span>
            <div class="flex flex-wrap gap-1">
              <span v-for="inc in claimQrPassData.inclusions" :key="inc"
                class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-gray-700 text-[10px] text-gray-700 dark:text-gray-300 font-semibold">
                {{ inc }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-3 border-t dark:border-gray-700 bg-slate-50 dark:bg-gray-900 flex items-center justify-between gap-2">
          <button type="button" @click="markKitReadyAndNotify(claimQrPassData.runner)" :disabled="isMarkingKitReady"
            class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
            <i class="fas fa-paper-plane text-[10px]"></i> Send Email
          </button>
          <button type="button" @click="openRunnerClaimModal(claimQrPassData.runner); closeRunnerQrPassModal();"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
            <i class="fas fa-hand-holding-box text-[10px]"></i> Claim Kit Now
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         MODAL: VALID ID LIVE CAMERA CAPTURE & RECORD MODAL
         ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="isValidIdCameraModalOpen && validIdCameraRunner"
      class="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md transition-opacity"
    >
      <div
        class="bg-gray-900 text-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-700 flex flex-col max-h-[94vh]"
      >
        <!-- Camera Modal Header -->
        <div class="p-4 border-b border-gray-800 bg-gradient-to-r from-emerald-800 to-teal-900 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <i class="fas fa-id-card text-emerald-300 text-sm"></i>
            </div>
            <div>
              <h3 class="font-extrabold text-sm tracking-tight leading-tight">
                {{ validIdCapturedImage ? 'Review Valid ID Photo' : 'Capture Valid ID' }}
              </h3>
              <p class="text-[10px] text-emerald-200">
                {{ validIdCameraRunner.firstname }} {{ validIdCameraRunner.lastname }} &middot; BIB # {{ validIdCameraRunner.run_number || ('AR-' + validIdCameraRunner.id) }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <!-- Camera Flip Button (only in live mode and if multiple cameras exist) -->
            <button
              v-if="!validIdCapturedImage && hasMultipleCameras"
              type="button"
              @click="switchValidIdCamera"
              class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              title="Switch Camera (Front/Back)"
            >
              <i class="fas fa-camera-rotate text-xs"></i>
            </button>
            <!-- Close Modal -->
            <button
              type="button"
              @click="closeValidIdCamera"
              class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Camera Viewfinder / Preview Area -->
        <div class="relative bg-black flex flex-col items-center justify-center p-3 sm:p-4 min-h-[340px] sm:min-h-[380px] overflow-hidden select-none">
          <!-- ERROR STATE -->
          <div v-if="validIdCameraError && !validIdCapturedImage" class="p-6 text-center max-w-sm space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-300 flex items-center justify-center mx-auto text-2xl">
              <i class="fas fa-camera-slash"></i>
            </div>
            <p class="text-xs text-rose-200 font-semibold leading-relaxed">
              {{ validIdCameraError }}
            </p>
            <div class="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                @click="startValidIdCamera"
                class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
              >
                <i class="fas fa-rotate-right mr-1"></i> Retry Camera
              </button>
              <label class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold text-xs transition cursor-pointer text-center">
                <i class="fas fa-upload mr-1"></i> Choose from Files
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  class="hidden"
                  @change="handleValidIdFileSelect($event, validIdCameraRunner)"
                />
              </label>
            </div>
          </div>

          <!-- LIVE CAMERA STREAM -->
          <div v-show="!validIdCapturedImage && !validIdCameraError" class="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-emerald-500/40 shadow-inner">
            <video
              ref="validIdCameraVideoRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover"
            ></video>

            <!-- ID CARD FRAMING OVERLAY / GUIDELINES -->
            <div class="absolute inset-4 pointer-events-none border-2 border-dashed border-emerald-400/70 rounded-xl flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <div class="flex justify-between items-start">
                <span class="w-4 h-4 border-t-2 border-l-2 border-emerald-300 rounded-tl"></span>
                <span class="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                  Align ID Here
                </span>
                <span class="w-4 h-4 border-t-2 border-r-2 border-emerald-300 rounded-tr"></span>
              </div>
              <div class="flex justify-between items-end">
                <span class="w-4 h-4 border-b-2 border-l-2 border-emerald-300 rounded-bl"></span>
                <span class="text-[9px] text-emerald-200/80 font-medium bg-black/50 px-2 py-0.5 rounded">
                  Hold camera steady
                </span>
                <span class="w-4 h-4 border-b-2 border-r-2 border-emerald-300 rounded-br"></span>
              </div>
            </div>
          </div>

          <!-- STILL PHOTO REVIEW -->
          <div v-if="validIdCapturedImage" class="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-emerald-500 shadow-2xl">
            <img
              :src="validIdCapturedImage"
              alt="Captured Valid ID Preview"
              class="w-full h-full object-contain"
            />
            <div class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-white font-black text-[10px] uppercase tracking-wider shadow-sm flex items-center gap-1">
              <i class="fas fa-check-circle"></i> Photo Ready
            </div>
          </div>
        </div>

        <!-- Camera Controls / Footer -->
        <div class="p-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between gap-3">
          <!-- LIVE MODE CONTROLS -->
          <template v-if="!validIdCapturedImage">
            <button
              type="button"
              @click="closeValidIdCamera"
              class="px-4 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <!-- SHUTTER BUTTON -->
            <div class="flex-1 flex justify-center">
              <button
                type="button"
                @click="captureValidIdPhoto"
                :disabled="!!validIdCameraError"
                class="group relative w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center cursor-pointer transition transform active:scale-90 hover:border-emerald-400 disabled:opacity-40"
                title="Capture Photo"
              >
                <span class="w-12 h-12 rounded-full bg-white group-hover:bg-emerald-300 transition-colors shadow-lg"></span>
              </button>
            </div>

            <!-- Upload from gallery / files fallback -->
            <label
              class="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-gray-700"
              title="Upload existing image or file"
            >
              <i class="fas fa-folder-open text-xs"></i>
              <span class="hidden sm:inline">Files</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                class="hidden"
                @change="handleValidIdFileSelect($event, validIdCameraRunner)"
              />
            </label>
          </template>

          <!-- PHOTO REVIEW CONTROLS -->
          <template v-else>
            <button
              type="button"
              @click="retakeValidIdPhoto"
              :disabled="isValidIdUploading"
              class="px-4 py-2.5 rounded-xl border border-gray-700 hover:bg-gray-800 text-gray-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <i class="fas fa-rotate-left text-xs"></i>
              <span>Retake</span>
            </button>

            <button
              type="button"
              @click="saveCapturedValidId"
              :disabled="isValidIdUploading"
              class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <i :class="['fas', isValidIdUploading ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up']"></i>
              <span>{{ isValidIdUploading ? 'Recording...' : 'Record & Display Valid ID' }}</span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════
         DUPLICATE REGISTRANT SCANNER & RACE BIB REVIEW MODAL
         ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="isDuplicateModalOpen"
      class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md transition-opacity"
      @click.self="closeDuplicateScannerModal">
      
      <div :class="[
        'w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-all',
        props.darkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">

        <!-- ── MODAL HEADER ── -->
        <div class="p-4 sm:p-5 border-b dark:border-gray-800 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-xl shadow-xs">
              <i class="fas fa-clone"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base sm:text-lg font-black tracking-tight leading-tight">
                  Duplicate Registrations & BIB Scanner
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/25 backdrop-blur-xs text-white">
                  {{ duplicateStats.totalGroups }} Group{{ duplicateStats.totalGroups !== 1 ? 's' : '' }}
                </span>
                <span v-if="duplicateStats.bibCollisions > 0" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                  🚨 {{ duplicateStats.bibCollisions }} BIB Conflict{{ duplicateStats.bibCollisions !== 1 ? 's' : '' }}
                </span>
              </div>
              <p class="text-xs text-amber-100 font-medium">
                Review duplicate registrants and their assigned Race BIB numbers. You can manually delete any duplicate entry below.
              </p>
            </div>
          </div>

          <button type="button" @click="closeDuplicateScannerModal"
            class="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white transition flex items-center justify-center cursor-pointer shadow-xs"
            title="Close modal">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <!-- ── BIB NUMBERS REVIEW BANNER ── -->
        <div class="p-3 sm:p-4 border-b dark:border-gray-800 bg-amber-50/70 dark:bg-amber-950/30 shrink-0">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div class="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <i class="fas fa-id-badge text-amber-600 dark:text-amber-400"></i>
                <span>Race BIB Numbers Needing Review ({{ allDuplicateBibs.length }} Distinct BIBs):</span>
              </div>
              <p class="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                Click any BIB chip below to filter directly to that registration group:
              </p>
            </div>

            <!-- Clear BIB filter if active -->
            <button v-if="selectedBibFilter" type="button" @click="selectedBibFilter = ''"
              class="self-start sm:self-auto px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 hover:bg-amber-300 flex items-center gap-1 cursor-pointer transition">
              <span>Filter: BIB {{ selectedBibFilter }}</span>
              <i class="fas fa-times text-[10px]"></i>
            </button>
          </div>

          <!-- BIB Numbers Chips Carousel / Flex list -->
          <div v-if="allDuplicateBibs.length > 0" class="flex flex-wrap gap-1.5 mt-2.5 max-h-24 overflow-y-auto pr-1">
            <button v-for="bib in allDuplicateBibs" :key="bib" type="button"
              @click="selectedBibFilter = selectedBibFilter === bib ? '' : bib"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-mono font-black border transition flex items-center gap-1.5 cursor-pointer select-none shadow-2xs',
                selectedBibFilter === bib
                  ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400 scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/40'
              ]">
              <i class="fas fa-running text-[10px] text-amber-500"></i>
              <span>BIB {{ bib }}</span>
            </button>
          </div>
          <div v-else class="text-xs text-gray-500 dark:text-gray-400 italic mt-1 flex items-center gap-1.5">
            <i class="fas fa-info-circle text-amber-500"></i>
            <span>No allocated Race BIBs in the duplicate list (registrants may be pending assignment or unallocated).</span>
          </div>
        </div>

        <!-- ── SEARCH & FILTER CONTROLS ── -->
        <div class="p-3 sm:p-4 border-b dark:border-gray-800 bg-slate-50 dark:bg-gray-900/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <!-- Search Input -->
          <div class="relative flex-1 max-w-md">
            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input type="text" v-model="duplicateSearchQuery"
              placeholder="Search by runner name, BIB #, ID, email..."
              class="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition" />
            <button v-if="duplicateSearchQuery" type="button" @click="duplicateSearchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs">
              <i class="fas fa-times-circle"></i>
            </button>
          </div>

          <!-- Filter Pills -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <button type="button" @click="duplicateTypeFilter = 'all'"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer select-none',
                duplicateTypeFilter === 'all'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              ]">
              All ({{ scanDuplicateClusters.length }})
            </button>
            <button type="button" @click="duplicateTypeFilter = 'bib'"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer select-none flex items-center gap-1',
                duplicateTypeFilter === 'bib'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              ]">
              <i class="fas fa-triangle-exclamation text-[10px] text-rose-500" :class="{ 'text-white': duplicateTypeFilter === 'bib' }"></i>
              <span>BIB Conflicts</span>
            </button>
            <button type="button" @click="duplicateTypeFilter = 'name'"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer select-none flex items-center gap-1',
                duplicateTypeFilter === 'name'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              ]">
              <i class="fas fa-user-tag text-[10px] text-indigo-500" :class="{ 'text-white': duplicateTypeFilter === 'name' }"></i>
              <span>Name Matches</span>
            </button>
            <button type="button" @click="duplicateTypeFilter = 'contact'"
              :class="[
                'px-2.5 py-1 rounded-xl text-xs font-bold transition border cursor-pointer select-none flex items-center gap-1',
                duplicateTypeFilter === 'contact'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              ]">
              <i class="fas fa-address-book text-[10px] text-sky-500" :class="{ 'text-white': duplicateTypeFilter === 'contact' }"></i>
              <span>Contact Matches</span>
            </button>

            <!-- Multi-select Bulk Delete button if any selected -->
            <button v-if="selectedDuplicateRunnerIds.length > 0" type="button"
              @click="executeBulkDeleteSelectedDuplicates" :disabled="isDeletingDuplicateRunner"
              class="px-3 py-1 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto disabled:opacity-50">
              <i class="fas fa-trash-alt text-[10px]"></i>
              <span>Delete Selected ({{ selectedDuplicateRunnerIds.length }})</span>
            </button>
          </div>
        </div>

        <!-- ── MODAL SCROLLABLE CONTENT (CLUSTERS LIST) ── -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          <!-- Empty State: No duplicates -->
          <div v-if="filteredDuplicateClusters.length === 0" class="py-16 text-center space-y-3">
            <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-sm">
              <i class="fas fa-check-circle"></i>
            </div>
            <div>
              <h4 class="text-base font-extrabold text-gray-800 dark:text-gray-100">
                {{ scanDuplicateClusters.length === 0 ? 'No Duplicate Registrants Detected!' : 'No Matching Duplicates Found' }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
                {{ scanDuplicateClusters.length === 0
                  ? 'All runners have unique registration records and race BIB numbers. Great job!'
                  : 'Try clearing your search query or filter pills to see other duplicate groups.' }}
              </p>
            </div>
            <button v-if="selectedBibFilter || duplicateSearchQuery || duplicateTypeFilter !== 'all'" type="button"
              @click="selectedBibFilter = ''; duplicateSearchQuery = ''; duplicateTypeFilter = 'all'"
              class="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer">
              Reset Filters
            </button>
          </div>

          <!-- Clusters Loop -->
          <div v-for="(group, gIdx) in filteredDuplicateClusters" :key="group.id"
            :class="[
              'rounded-2xl border transition-all overflow-hidden shadow-xs',
              group.hasBibCollision
                ? 'border-rose-300 dark:border-rose-900/70 bg-rose-50/20 dark:bg-rose-950/20'
                : 'border-amber-200 dark:border-gray-800 bg-white dark:bg-gray-800/80'
            ]">

            <!-- Cluster Header -->
            <div :class="[
              'p-3.5 border-b flex flex-wrap items-center justify-between gap-2.5',
              group.hasBibCollision
                ? 'bg-rose-100/70 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60'
                : 'bg-amber-50/60 dark:bg-gray-800/90 border-amber-100 dark:border-gray-700/80'
            ]">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span :class="[
                  'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shadow-2xs',
                  group.hasBibCollision
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-white'
                ]">
                  {{ gIdx + 1 }}
                </span>

                <div class="flex items-center gap-2">
                  <h4 class="text-sm font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    {{ group.name }}
                  </h4>
                  <span class="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    ({{ group.runners.length }} entries)
                  </span>
                </div>

                <!-- Collision Warning Badge -->
                <span v-if="group.hasBibCollision"
                  class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-rose-600 text-white tracking-wider flex items-center gap-1 shadow-2xs animate-pulse">
                  <i class="fas fa-triangle-exclamation"></i>
                  Exact BIB Collision: {{ group.collidingBibs.join(', ') }}
                </span>

                <!-- Match Reasons Badges -->
                <div class="flex items-center gap-1 flex-wrap">
                  <span v-for="reason in group.reasons" :key="reason"
                    class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white dark:bg-gray-900/70 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    {{ reason }}
                  </span>
                </div>
              </div>

              <!-- BIB Summary for this cluster -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] font-bold uppercase text-gray-400">Involved BIBs:</span>
                <span v-for="bib in group.bibs" :key="bib"
                  :class="[
                    'px-2 py-0.5 rounded text-[11px] font-mono font-black border',
                    group.collidingBibs.includes(bib)
                      ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                      : 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                  ]">
                  BIB {{ bib }}
                </span>
                <span v-if="group.bibs.length === 0" class="text-[11px] text-gray-400 italic">
                  Unallocated
                </span>
              </div>
            </div>

            <!-- Cluster Runners Grid (Side-by-side on desktop) -->
            <div class="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div v-for="(runner, rIdx) in group.runners" :key="runner.id"
                :class="[
                  'relative rounded-2xl p-3.5 border transition-all flex flex-col justify-between space-y-3',
                  isDuplicateRunnerSelected(runner.id)
                    ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 dark:bg-rose-950/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xs hover:border-amber-300 dark:hover:border-amber-800'
                ]">

                <!-- Top row: Selection checkbox, submission tag, ID -->
                <div class="flex items-center justify-between gap-2">
                  <label class="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" :checked="isDuplicateRunnerSelected(runner.id)"
                      @change="toggleSelectDuplicateRunner(runner.id)"
                      class="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-gray-300 dark:border-gray-600 cursor-pointer" />
                    <span :class="[
                      'px-1.5 py-0.2 rounded text-[10px] font-black uppercase tracking-wider',
                      rIdx === 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    ]">
                      {{ rIdx === 0 ? 'Entry #1 (First)' : `Entry #${rIdx + 1} (Duplicate)` }}
                    </span>
                  </label>

                  <span class="text-[10px] font-mono text-gray-400">
                    ID #{{ runner.id }}
                  </span>
                </div>

                <!-- PROMINENT RACE BIB BADGE (Plate Style) -->
                <div class="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800/60 flex items-center justify-between shadow-2xs">
                  <div>
                    <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                      Race BIB Number:
                    </span>
                    <span class="text-base sm:text-lg font-mono font-black tracking-tight text-gray-900 dark:text-white">
                      {{ runner.run_number || runner.bib_number || 'UNALLOCATED' }}
                    </span>
                  </div>

                  <!-- Distance / Category Pill -->
                  <div class="text-right">
                    <span class="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-2xs">
                      {{ runner.run_category || runner.category || '3KM' }}
                    </span>
                    <span v-if="runner.shirt_size" class="text-[10px] block text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                      {{ runner.shirt_size }}
                    </span>
                  </div>
                </div>

                <!-- Runner Details -->
                <div class="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <div class="font-extrabold text-sm text-gray-900 dark:text-gray-100 leading-snug">
                    {{ runner.firstname }} {{ runner.lastname }}
                  </div>

                  <!-- Email & Phone -->
                  <div class="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                    <i class="fas fa-envelope text-[10px] text-gray-400 shrink-0"></i>
                    <span class="truncate">{{ runner.contact_email || runner.email || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <i class="fas fa-phone text-[10px] text-gray-400 shrink-0"></i>
                    <span>{{ runner.contact_number || runner.mobile || '-' }}</span>
                  </div>

                  <!-- Status & Payment -->
                  <div class="flex items-center gap-1.5 pt-1 flex-wrap">
                    <span :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-extrabold',
                      runner.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    ]">
                      {{ runner.status || 'Pending' }}
                    </span>
                    <span class="text-[10px] text-gray-400">
                      {{ formatPaymentType(runner.payment_type) }}
                    </span>
                    <span v-if="runner.reference_number" class="text-[10px] font-mono text-gray-500 truncate max-w-[120px]">
                      Ref: {{ runner.reference_number }}
                    </span>
                  </div>

                  <!-- Date -->
                  <div class="text-[10px] text-gray-400 flex items-center gap-1 pt-0.5">
                    <i class="fas fa-calendar-alt text-[9px]"></i>
                    <span>{{ formatDuplicateDate(runner.created_at) }}</span>
                  </div>
                </div>

                <!-- ACTIONS PER RUNNER: Delete Record & View Record -->
                <div class="pt-2 border-t dark:border-gray-800 flex items-center gap-2">
                  <button type="button" @click="openDetails(runner)"
                    class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition flex items-center justify-center gap-1 cursor-pointer">
                    <i class="fas fa-eye text-[10px]"></i>
                    <span>Details</span>
                  </button>

                  <!-- Delete Record Button -->
                  <button type="button" @click="promptDeleteDuplicateRunner(runner)" :disabled="isDeletingDuplicateRunner"
                    class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center gap-1 cursor-pointer shadow-xs disabled:opacity-50">
                    <i class="fas fa-trash-alt text-[10px]"></i>
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>

        <!-- ── MODAL FOOTER ── -->
        <div class="p-3.5 sm:p-4 border-t dark:border-gray-800 bg-slate-50 dark:bg-gray-900 flex items-center justify-between gap-3 shrink-0">
          <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <i class="fas fa-shield-halved text-amber-500"></i>
            <span>Manual deletion mode: review race BIB numbers and remove unwanted duplicates safely.</span>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" @click="closeDuplicateScannerModal"
              class="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold transition cursor-pointer">
              Close
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── SINGLE DUPLICATE DELETE CONFIRMATION MODAL ── -->
    <div v-if="isDuplicateDeleteConfirmOpen && duplicateRunnerToDelete"
      class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      @click.self="closeDuplicateDeleteConfirm">
      <div :class="[
        'w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-rose-500"></div>

        <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-trash-alt"></i>
        </div>

        <div>
          <h3 class="text-base font-black tracking-tight">Delete Duplicate Registration?</h3>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-2 font-medium">
            You are about to delete the duplicate record for:
          </p>
          <div class="p-3 my-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 border dark:border-gray-700 text-left text-xs space-y-1">
            <div><strong>Name:</strong> {{ duplicateRunnerToDelete.firstname }} {{ duplicateRunnerToDelete.lastname }}</div>
            <div><strong>Race BIB:</strong> <span class="font-mono font-bold text-amber-600 dark:text-amber-400">{{ duplicateRunnerToDelete.run_number || duplicateRunnerToDelete.bib_number || 'Unallocated' }}</span></div>
            <div><strong>Reg ID:</strong> #{{ duplicateRunnerToDelete.id }}</div>
            <div><strong>Category:</strong> {{ duplicateRunnerToDelete.run_category || duplicateRunnerToDelete.category || '3KM' }}</div>
            <div><strong>Date:</strong> {{ formatDuplicateDate(duplicateRunnerToDelete.created_at) }}</div>
          </div>
          <p class="text-[11px] text-rose-500 dark:text-rose-400 font-semibold">
            This will permanently remove this duplicate registration.
          </p>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <button type="button" @click="closeDuplicateDeleteConfirm" :disabled="isDeletingDuplicateRunner"
            class="flex-1 py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeDeleteDuplicateRunner(duplicateRunnerToDelete)" :disabled="isDeletingDuplicateRunner"
            class="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60">
            <i v-if="!isDeletingDuplicateRunner" class="fas fa-trash"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isDeletingDuplicateRunner ? 'Deleting...' : 'Yes, Delete' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>


</template>

<style scoped>
/* 60fps CSS Grid Accordion */
.accordion-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  transition: grid-template-rows 320ms cubic-bezier(0.25, 1, 0.5, 1), opacity 260ms cubic-bezier(0.25, 1, 0.5, 1);
  will-change: grid-template-rows, opacity;
  pointer-events: none;
}

.accordion-wrapper.is-expanded {
  grid-template-rows: 1fr;
  opacity: 1;
  pointer-events: auto;
}

.accordion-inner {
  overflow: hidden;
  min-height: 0;
}

/* Fade-slide-in for pills */
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── QR Scanner Camera Viewport Styling (Removes black letterboxing) ── */
:deep(#qr-reader-camera) {
  border: none !important;
  background: transparent !important;
  overflow: hidden !important;
  position: relative !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(#qr-reader-camera video) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
  border-radius: 1rem !important;
}

:deep(#qr-shaded-region) {
  border-color: rgba(16, 185, 129, 0.6) !important;
}

:deep(#qr-shaded-region > div) {
  background-color: rgba(0, 0, 0, 0.25) !important;
}

:deep(#qr-reader-camera canvas) {
  display: none !important;
}

:deep(#qr-reader-camera img[alt="Info icon"]) {
  display: none !important;
}
</style>
