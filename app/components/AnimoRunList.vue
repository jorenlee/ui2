<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const isFetching = ref(false);
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
    url,
    title,
    runner: runner || selectedRunner.value,
  };
};

const closeReceiptModal = () => {
  receiptModal.value.show = false;
  receiptModal.value.url = "";
  receiptModal.value.runner = null;
};

const runCategories = [
  { id: "1KM", name: "1 KM", color: "bg-[#6F2A22] text-white" },
  { id: "3KM", name: "3 KM", color: "bg-[#8A4528] text-white" },
  { id: "10KM", name: "10 KM", color: "bg-[#1D2735] text-white" },
  { id: "20KM", name: "20 KM", color: "bg-[#123F38] text-white" },
];

const registrations = ref([]);

const fetchRegistrations = async () => {
  isFetching.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/list/`);
    if (Array.isArray(res)) {
      registrations.value = res;
    }
  } catch (err) {
    console.error("Error fetching Animo Run registrations:", err);
  } finally {
    isFetching.value = false;
  }
};

onMounted(() => {
  fetchRegistrations();
});

const getImageUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (typeof val === "object" && val.url) return val.url;
  if (Array.isArray(val) && val.length > 0) {
    if (typeof val[0] === "string") return val[0];
    return val[0]?.url || null;
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

    const matchesQuery =
      !q ||
      fullName.includes(q) ||
      regId.includes(q) ||
      bib.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      batch.includes(q);

    const category = item.run_category || "";
    const matchesCategory = selectedCategory.value === "All" || category.startsWith(selectedCategory.value);
    const matchesStatus = selectedStatus.value === "All" || item.payment_status === selectedStatus.value;
    const matchesType = selectedParticipantType.value === "All" || item.participant_type === selectedParticipantType.value;

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

    return matchesQuery && matchesCategory && matchesStatus && matchesType && matchesBatch && matchesLock && matchesDate;
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

// Shared input class for edit mode fields
const inputCls = computed(() =>
  `w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none transition ${
    props.darkMode
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

const generateCsvFromList = (list, batchLabel = "Export") => {
  const headers = [
    "Batch Group",
    "Lock Status",
    "Reg ID",
    "Race Bib",
    "Category",
    "Full Name",
    "First Name",
    "Middle Name",
    "Last Name",
    "Suffix",
    "Gender",
    "Birthdate",
    "Contact Number",
    "Email Address",
    "Address",
    "Classification",
    "LSU ID Number",
    "Club / Organization",
    "Batch / Affiliation",
    "T-Shirt Size",
    "Pet Name",
    "Pet Type",
    "Pet Bandana Size",
    "Pet Vaccinated",
    "Payment Option",
    "Payment Status",
    "Total Amount (PHP)",
    "Registration Date",
    "Confirmed Date",
    "Confirmed By",
    "Batch Locked By",
    "Batch Locked At",
  ];

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map((r) => {
    const fullName = `${r.firstname || ""} ${r.middlename || ""} ${r.lastname || ""}${r.suffix ? " " + r.suffix : ""}`.trim();
    const batchStr = r.batch_name || batchLabel;
    const lockStr = r.batch_locked ? "LOCKED" : "OPEN";

    return [
      escapeCsv(batchStr),
      escapeCsv(lockStr),
      escapeCsv(r.id),
      escapeCsv(r.run_number || r.bib_number || `AR-${r.id}`),
      escapeCsv(r.run_category || ""),
      escapeCsv(fullName),
      escapeCsv(r.firstname || ""),
      escapeCsv(r.middlename || ""),
      escapeCsv(r.lastname || ""),
      escapeCsv(r.suffix || ""),
      escapeCsv(r.gender || ""),
      escapeCsv(r.birthdate || ""),
      escapeCsv(r.contact_number || r.phone || ""),
      escapeCsv(r.contact_email || r.email || ""),
      escapeCsv(r.contact_address || r.address || ""),
      escapeCsv(r.participant_type || ""),
      escapeCsv(r.lsu_id_number || ""),
      escapeCsv(r.organization || ""),
      escapeCsv(r.alumni_batch || ""),
      escapeCsv(r.tshirt_size || "M"),
      escapeCsv(r.pet_name || ""),
      escapeCsv(r.pet_type || ""),
      escapeCsv(r.pet_bandana_size || ""),
      escapeCsv(r.pet_vaccinated ? "Yes" : "No"),
      escapeCsv(r.payment_type || ""),
      escapeCsv(r.payment_status || ""),
      escapeCsv(r.grand_total_payment || r.grand_total || 0),
      escapeCsv(r.created_at_formatted || r.created_at || ""),
      escapeCsv(r.confirmed_at || ""),
      escapeCsv(r.confirmed_by || ""),
      escapeCsv(r.batch_locked_by || ""),
      escapeCsv(r.batch_locked_at || ""),
    ].join(",");
  });

  return [headers.map((h) => `"${h}"`).join(","), ...rows].join("\r\n");
};

const exportCurrentFilteredCsv = () => {
  const targetList = selectedIds.value.length > 0
    ? registrations.value.filter((r) => selectedIds.value.includes(r.id))
    : filteredRegistrations.value;

  if (!targetList.length) {
    showNotice("No runner records to export based on current filters.", "Notice", "info");
    return;
  }

  const csv = generateCsvFromList(targetList, selectedBatch.value === "All" ? "Export" : selectedBatch.value);
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `EmeraldRun_${targetList.length}_Runners_${dateStr}.csv`;
  downloadCsvFile(csv, filename);

  showNotice(
    `Successfully exported ${targetList.length} registration record(s) to CSV spreadsheet.\n\nFile downloaded: ${filename}`,
    "CSV Downloaded",
    "success"
  );
};

// ── Batch Finalization & Lock Modal ──────────────────────────────────────────────
const batchesList = ref([]);
const isFetchingBatches = ref(false);
const isFinalizingBatch = ref(false);

const batchFinalizeModal = ref({
  show: false,
  batchName: "",
  lockedBy: "",
  scope: "unbatched", // "unbatched", "filtered", "selected"
});

const fetchBatches = async () => {
  isFetchingBatches.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/batch/list/`);
    if (Array.isArray(res)) {
      batchesList.value = res;
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

    if (r.pet_bandana_size) {
      const bsz = r.pet_bandana_size.trim();
      bandanas[bsz] = (bandanas[bsz] || 0) + 1;
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
      },
    });

    // Auto-download the CSV spreadsheet immediately
    if (res.csv_content) {
      const filename = `${(res.batch?.batch_name || "Batch").replace(/\s+/g, "_")}_EmeraldRun_Orders_${new Date().toISOString().split("T")[0]}.csv`;
      downloadCsvFile(res.csv_content, filename);
    }

    // Refresh registrations and batch history
    await Promise.all([fetchRegistrations(), fetchBatches()]);
    clearSelection();
    closeBatchFinalizeModal();

    showNotice(
      `🎉 ${res.batch?.batch_name || "Supplier Batch"} finalized with ${res.batch?.total_runners || runners.length} orders!\n\n` +
      `📥 Supplier CSV has been automatically downloaded.\n\n` +
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

// Trigger fetch batches on mounted
onMounted(() => {
  fetchBatches();
});
</script>

<template>
  <div :class="[
    'min-h-screen p-2 transition-colors duration-300',
    props.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800',
  ]">
    <div class="space-y-1">
      <!-- HEADER BANNER -->
      <div :class="[
        'relative overflow-hidden rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border shadow-xl transition-all',
        props.darkMode
          ? 'bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-green-800/40'
          : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 border-emerald-600 text-white',
      ]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div class="space-y-1">
            <h1 class="text-sm sm:text-base text-white font-black tracking-tight leading-snug">
              THE EMERALD RUN
              <span class="font-normal text-xs sm:text-sm text-emerald-200 block sm:inline sm:ml-1">
                <i class="fas fa-list text-amber-300"></i> Track, verify & manage runner registrations & supplier batches
              </span>
            </h1>
          </div>

          <div class="flex items-center gap-2 flex-wrap shrink-0 self-end sm:self-auto">
            <!-- Finalize Supplier Batch button -->
            <button type="button" @click="openBatchFinalizeModal"
              class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md border border-amber-400/40 cursor-pointer">
              <i class="fas fa-layer-group"></i> Finalize Supplier Batch (CSV)
            </button>

            <!-- Supplier Batches History button -->
            <button type="button" @click="openBatchHistoryModal"
              class="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer">
              <i class="fas fa-boxes"></i> Batches
              <span v-if="batchesList.length" class="px-1.5 py-0.2 rounded-full bg-amber-400 text-gray-900 font-black text-[10px]">
                {{ batchesList.length }}
              </span>
            </button>

            <!-- Export CSV button -->
            <button type="button" @click="exportCurrentFilteredCsv"
              class="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm border border-emerald-500 cursor-pointer">
              <i class="fas fa-file-csv"></i> Download CSV
            </button>

            <!-- Refresh button -->
            <button type="button" @click="() => { fetchRegistrations(); fetchBatches(); }" :disabled="isFetching"
              class="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer">
              <i :class="['fas fa-sync-alt', isFetching ? 'fa-spin' : '']"></i>
              {{ isFetching ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>
        </div>
      </div>

      <!-- STATS SUMMARY CARDS (4 COLUMNS INCLUDING SUPPLIER BATCH LOCKED COUNT) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div :class="[
          'px-4 py-2.5 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Runners</p>
            <h3 class="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              <span v-if="isFetching" class="inline-block h-5 w-10 rounded bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.totalRunners }}</span>
            </h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
            <i class="fas fa-running"></i>
          </div>
        </div>

        <div :class="[
          'px-4 py-2.5 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Confirmed Paid</p>
            <h3 class="text-xl font-black text-green-600 dark:text-green-400 mt-0.5">
              <span v-if="isFetching" class="inline-block h-5 w-10 rounded bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.confirmed }}</span>
            </h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center text-lg">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>

        <div :class="[
          'px-4 py-2.5 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending Action</p>
            <h3 class="text-xl font-black text-amber-500 dark:text-amber-400 mt-0.5">
              <span v-if="isFetching" class="inline-block h-5 w-10 rounded bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.pending }}</span>
            </h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
            <i class="fas fa-clock"></i>
          </div>
        </div>

        <div :class="[
          'px-4 py-2.5 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Batch Locked 🔒</p>
            <h3 class="text-xl font-black text-purple-600 dark:text-purple-400 mt-0.5">
              <span v-if="isFetching" class="inline-block h-5 w-10 rounded bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.lockedCount }}</span>
            </h3>
          </div>
          <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
            <i class="fas fa-lock"></i>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER TOOLBAR (ROW 1: SEARCH & FILTERS, ROW 2: DATE RANGE & SORTING) -->
      <div :class="[
        'p-3 rounded-3xl border shadow-md transition space-y-3',
        props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
      ]">
        <!-- Toolbar Row 1: Search & Basic Filters -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Search Input -->
          <div class="relative lg:col-span-1">
            <i class="fas fa-search absolute left-3.5 top-3.5 text-xs text-gray-400"></i>
            <input v-model="searchQuery" type="text" placeholder="Search Name, Reg ID, Bib #, Email, Batch..." :class="[
              'w-full pl-9 pr-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]" />
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
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Payment">Pending Payment</option>
            </select>
          </div>

          <!-- Participant Type Filter -->
          <div>
            <select v-model="selectedParticipantType" :class="[
              'w-full px-3.5 py-2 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]">
              <option value="All">All Classifications</option>
              <option value="Currently Enrolled Students">Currently Enrolled Students</option>
              <option value="Employees">Employees</option>
              <option value="Alumni">Alumni</option>
              <option value="Open Category">Open Category</option>
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
            <button type="button" @click="setDateRangePreset('today')" class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer">
              Today
            </button>
            <button type="button" @click="setDateRangePreset('7days')" class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer">
              7 Days
            </button>
            <button type="button" @click="setDateRangePreset('30days')" class="px-2 py-1.5 rounded-lg text-[10px] font-bold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 cursor-pointer">
              30 Days
            </button>
            <button v-if="dateFrom || dateTo" type="button" @click="clearDateRange" class="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-600 transition cursor-pointer" title="Clear Date Filter">
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
            </select>
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
          <!-- SKELETON CARDS while fetching on mobile -->
          <template v-if="isFetching">
            <div v-for="n in 4" :key="'m-sk-' + n" :class="[
              'p-4 rounded-2xl border animate-pulse space-y-3',
              props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-slate-50 border-slate-200'
            ]">
              <div class="flex items-center justify-between">
                <div :class="['h-3 w-16 rounded', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                <div :class="['h-5 w-20 rounded-full', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
              </div>
              <div :class="['h-4 w-40 rounded', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
              <div :class="['h-3 w-32 rounded', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
              <div class="flex gap-2 pt-2">
                <div :class="['h-8 flex-1 rounded-xl', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
              </div>
            </div>
          </template>

          <!-- MOBILE ACTUAL CARDS -->
          <template v-else-if="filteredRegistrations.length > 0">
            <div
              v-for="runner in filteredRegistrations"
              :key="'m-' + runner.id"
              :class="[
                'p-4 rounded-2xl border transition-all duration-200 shadow-sm space-y-3',
                selectedIds.includes(runner.id)
                  ? (props.darkMode ? 'bg-emerald-950/30 border-emerald-700' : 'bg-emerald-50/80 border-emerald-300')
                  : (props.darkMode ? 'bg-gray-800/90 border-gray-700 hover:border-gray-600' : 'bg-white border-slate-200 hover:border-emerald-300')
              ]"
            >
              <!-- Card Header: ID, Bib, Checkbox and Status -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <!-- Mobile checkbox -->
                  <input
                    type="checkbox"
                    :checked="selectedIds.includes(runner.id)"
                    @change="toggleSelectOne(runner.id)"
                    class="w-4 h-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                  />
                  <span class="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">#{{ runner.id }}</span>
                  <span class="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px] uppercase">
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
                  {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                </h4>
                <div class="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  <span v-if="runner.contact_email || runner.email" class="flex items-center gap-1 truncate max-w-[200px]">
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
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-gray-600">
                  {{ runner.participant_type || 'Individual' }}
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
                    {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : runner.payment_type === 'add_to_tuition' ? 'Add to Tuition' : 'Over the Counter / QR' }}
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
                <button
                  type="button"
                  @click="openDetails(runner)"
                  class="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <i class="fas fa-eye text-xs"></i> View Full Details
                </button>
                <button
                  v-if="runner.payment_status && runner.payment_status.startsWith('Pending')"
                  type="button"
                  @click="promptConfirmPayment(runner)"
                  class="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0"
                >
                  <i class="fas fa-check text-xs"></i> Confirm
                </button>
              </div>
            </div>
          </template>

          <!-- MOBILE EMPTY STATE -->
          <div v-else class="p-8 text-center text-gray-500">
            <i class="fas fa-search text-3xl mb-2 text-gray-400 block"></i>
            <p class="text-xs">No registration records match your search criteria.</p>
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
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate.prop="someSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    title="Select all visible"
                  />
                </th>
                <th class="p-3 cursor-pointer hover:text-emerald-500 transition" @click="toggleSort('bib')">
                  Reg ID &amp; Bib
                  <i :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'bib_asc' ? 'fa-sort-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                </th>
                <th class="p-3 cursor-pointer hover:text-emerald-500 transition" @click="toggleSort('name')">
                  Runner Name
                  <i :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'name_asc' ? 'fa-sort-alpha-down text-emerald-600' : sortBy === 'name_desc' ? 'fa-sort-alpha-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                </th>
                <th class="p-3 cursor-pointer hover:text-emerald-500 transition" @click="toggleSort('batch')">
                  Supplier Batch &amp; Lock
                  <i :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'batch_asc' ? 'fa-sort-amount-down text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                </th>
                <th class="p-3">Category &amp; Size</th>
                <th class="p-3 cursor-pointer hover:text-emerald-500 transition" @click="toggleSort('date')">
                  Date Created
                  <i :class="[
                    'fas ml-1 text-[10px]',
                    sortBy === 'date_desc' ? 'fa-sort-numeric-down text-emerald-600' : sortBy === 'date_asc' ? 'fa-sort-numeric-up text-emerald-600' : 'fa-sort text-gray-400'
                  ]"></i>
                </th>
                <th class="p-3">Payment &amp; Status</th>
                <th class="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700/60 text-xs">

              <!-- SKELETON ROWS while fetching -->
              <template v-if="isFetching">
                <tr v-for="n in 8" :key="'sk-' + n" :class="[
                  'animate-pulse',
                  props.darkMode ? 'bg-gray-800' : 'bg-white',
                ]">
                  <td class="p-3 w-10"></td>
                  <td class="p-3">
                    <div :class="['h-3 w-10 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                    <div :class="['h-2.5 w-20 rounded', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <td class="p-3">
                    <div :class="['h-3 w-32 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                    <div :class="['h-2.5 w-40 rounded', props.darkMode ? 'bg-gray-600' : 'bg-slate-100']"></div>
                  </td>
                  <td class="p-3">
                    <div :class="['h-5 w-20 rounded-full', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <td class="p-3">
                    <div :class="['h-5 w-16 rounded-full', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <td class="p-3">
                    <div :class="['h-3 w-20 rounded', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <td class="p-3">
                    <div :class="['h-3 w-24 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <td class="p-3 text-center">
                    <div :class="['h-6 w-14 rounded-xl mx-auto', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                </tr>
              </template>

              <!-- ACTUAL DATA ROWS -->
              <template v-else>
                <tr v-for="runner in filteredRegistrations" :key="runner.id" :class="[
                  'hover:bg-emerald-50/70 dark:hover:bg-gray-700/40 transition',
                  selectedIds.includes(runner.id) ? (props.darkMode ? 'bg-emerald-950/30' : 'bg-emerald-50/80') : '',
                ]">

                  <!-- Row checkbox -->
                  <td class="px-3 py-3 w-10">
                    <input
                      type="checkbox"
                      :checked="selectedIds.includes(runner.id)"
                      @change="toggleSelectOne(runner.id)"
                      class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                  </td>

                  <!-- Reg ID & Bib -->
                  <td class="px-3 py-3">
                    <div class="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">#{{ runner.id }}</div>
                    <span class="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase">
                      {{ runner.run_number || runner.bib_number || ('AR-' + runner.id) }}
                    </span>
                  </td>

                  <!-- Runner Name -->
                  <td class="px-3 py-3">
                    <div class="font-bold text-gray-900 dark:text-gray-100 uppercase leading-snug">
                      {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                    </div>
                    <div class="text-[11px] text-gray-500 truncate max-w-[180px]">
                      {{ runner.contact_email || runner.email }}
                    </div>
                  </td>

                  <!-- Supplier Batch & Lock -->
                  <td class="px-3 py-3">
                    <div v-if="runner.batch_name" class="flex items-center gap-1">
                      <span :class="[
                        'px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 shadow-2xs',
                        runner.batch_locked
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                          : 'bg-slate-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-slate-300'
                      ]">
                        <i :class="['fas', runner.batch_locked ? 'fa-lock text-purple-600 dark:text-purple-400' : 'fa-unlock text-emerald-500']"></i>
                        {{ runner.batch_name }}
                      </span>
                      <!-- Quick superadmin lock toggle button -->
                      <button type="button" @click="openUnlockPrompt(runner, 'runner')"
                        class="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-purple-900 text-gray-600 dark:text-gray-300 flex items-center justify-center transition cursor-pointer text-[10px]"
                        :title="runner.batch_locked ? 'Superadmin Bypass: Click to unlock order' : 'Click to lock order for supplier'">
                        <i :class="['fas', runner.batch_locked ? 'fa-unlock' : 'fa-lock']"></i>
                      </button>
                    </div>
                    <div v-else class="text-[11px] text-gray-400 italic flex items-center gap-1">
                      <span>Unbatched</span>
                    </div>
                  </td>

                  <!-- Category & Shirt Size -->
                  <td class="px-3 py-3 space-y-1">
                    <span :class="[
                      'px-2 py-0.5 rounded font-black text-[10px] text-white shadow-2xs inline-block',
                      runCategories.find(c => runner.run_category && runner.run_category.startsWith(c.id))?.color || 'bg-emerald-700'
                    ]">
                      {{ runner.run_category }}
                    </span>
                    <div class="text-[10px] font-bold text-gray-500">Size: <span class="text-gray-800 dark:text-gray-200 uppercase">{{ runner.tshirt_size || 'M' }}</span></div>
                  </td>

                  <!-- Date Created -->
                  <td class="px-3 py-3 text-[11px] text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {{ runner.created_at_formatted || (runner.created_at ? new Date(runner.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A') }}
                  </td>

                  <!-- Payment & Status -->
                  <td class="px-3 py-3">
                    <div class="flex items-center gap-2">
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
                    <div class="text-[10px] text-gray-400 capitalize mt-0.5">
                      {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : runner.payment_type === 'add_to_tuition' ? 'Add to Tuition' : 'Over-the-Counter / QR' }}
                    </div>
                  </td>

                  <!-- Actions -->
                  <td class="px-3 py-3 text-center">
                    <button type="button" @click="openDetails(runner)"
                      class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                      <i class="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>

                <tr v-if="filteredRegistrations.length === 0">
                  <td colspan="8" class="p-8 text-center text-gray-500">
                    <i class="fas fa-search text-3xl mb-2 text-gray-400 block"></i>
                    No registration records match your search criteria.
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── BULK-ACTION TOOLBAR (sticky bottom, appears on selection) ──── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div v-if="selectedIds.length > 0"
        class="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md"
        :class="props.darkMode ? 'bg-gray-900/90 border-gray-700 text-gray-100' : 'bg-white/90 border-slate-200 text-gray-800'"
      >
        <!-- Count badge -->
        <span class="flex items-center gap-1.5 text-xs font-bold">
          <span class="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">
            {{ selectedIds.length }}
          </span>
          {{ selectedIds.length === 1 ? 'runner' : 'runners' }} selected
        </span>

        <div class="w-px h-5 bg-gray-300 dark:bg-gray-600"></div>

        <!-- Clear selection -->
        <button type="button" @click="clearSelection"
          class="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition cursor-pointer flex items-center gap-1.5"
        >
          <i class="fas fa-times-circle"></i> Clear
        </button>

        <!-- Delete selected -->
        <button type="button" @click="promptBulkDelete" :disabled="isBulkDeleting"
          class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
        >
          <i v-if="!isBulkDeleting" class="fas fa-trash"></i>
          <i v-else class="fas fa-spinner fa-spin"></i>
          {{ isBulkDeleting ? 'Deleting...' : 'Delete Selected' }}
        </button>
      </div>
    </Transition>

    <!-- DETAIL & VERIFICATION MODAL -->
    <div v-if="isDetailModalOpen && selectedRunner"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div :class="[
        'relative lg:w-8/12 w-full rounded-3xl shadow-2xl border p-4 sm:p-8 max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-6 transition',
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
              <span v-if="isEditMode" class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700 flex items-center gap-1">
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

                <div v-if="selectedRunner.organization" class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Running Club / Org</label>
                  <p class="font-semibold text-emerald-600 dark:text-emerald-400 font-bold">{{ selectedRunner.organization }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">T-Shirt Size</label>
                  <p class="font-semibold">{{ selectedRunner.tshirt_size || 'M' }}</p>
                </div>

                <div class="lg:flex">
                  <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Address</label>
                  <p class="font-semibold">{{ selectedRunner.contact_address || selectedRunner.address || 'Ozamiz City' }}
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
                      <option>Jr.</option><option>Sr.</option>
                      <option>II</option><option>III</option><option>IV</option>
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
                      <option value="Currently Enrolled Students">Currently Enrolled Students</option>
                      <option value="Employees">Employees</option>
                      <option value="Alumni">Alumni</option>
                      <option value="Open Category">Open Category</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">LSU ID Number</label>
                    <input v-model="editForm.lsu_id_number" :class="inputCls" placeholder="e.g. 2021-00001" />
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
                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Running Club / Organization</label>
                    <input v-model="editForm.organization" :class="inputCls" placeholder="e.g. Ozamiz Lifestyle Runners" />
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
                  {{ selectedRunner.run_category }} |   ₱{{ Number(selectedRunner.grand_total_payment || selectedRunner.grand_total || 0).toLocaleString() }}
                </span>
              </div>

              <!-- Pet details if 1K Pet Run -->
              <div v-if="selectedRunner.pet_name || selectedRunner.run_category === '1KM' || selectedRunner.run_category === '1K'"
                class="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <i class="fas fa-paw"></i> Pet Runner Details:
                  </span>
                  <span v-if="selectedRunner.pet_vaccinated" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    <i class="fas fa-syringe mr-0.5"></i> Vaccinated
                  </span>
                </div>
                <p><strong>Name:</strong> {{ selectedRunner.pet_name || 'N/A' }} ({{ selectedRunner.pet_type || 'Dog' }})</p>
                <p><strong>Bandana Size:</strong> {{ selectedRunner.pet_bandana_size || 'Medium' }}</p>

                <!-- Pet Vaccine Document -->
                <div v-if="getDocumentUrl(selectedRunner.pet_vaccine_record)" class="pt-2 border-t dark:border-gray-700">
                  <div class="flex items-center justify-between bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200/60 dark:border-emerald-800/50">
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
                <div v-if="getDocumentList(selectedRunner.pet_consent_documents).length > 0" class="pt-2 border-t dark:border-gray-700 space-y-1.5">
                  <span class="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400 block">
                    <i class="fas fa-file-signature text-amber-600 mr-1"></i> Signed Non-Liability Consent Documents ({{ getDocumentList(selectedRunner.pet_consent_documents).length }}):
                  </span>
                  <div v-for="(doc, dIdx) in getDocumentList(selectedRunner.pet_consent_documents)" :key="dIdx"
                    class="flex items-center justify-between bg-amber-50/70 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/40">
                    <div class="flex items-center gap-1.5 truncate mr-2">
                      <i class="fas fa-file-pdf text-rose-500"></i>
                      <span class="text-[11px] font-medium truncate">{{ doc.name }}</span>
                    </div>
                    <button type="button"
                      @click="openReceiptModal(doc.url, `Consent Doc: ${doc.name}`, selectedRunner)"
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
                  <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                    <i class="fas fa-file-invoice"></i>
                  </div>
                  <div>
                    <p class="font-bold text-xs">Payment Receipt Attached</p>
                    <p class="text-[10px] text-gray-500 dark:text-gray-400">Proof of payment recorded for {{ selectedRunner.firstname }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button type="button"
                    @click="openReceiptModal(selectedRunner.proof_of_payment, 'Payment Receipt Proof', selectedRunner)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm">
                    <i class="fas fa-receipt text-xs"></i> View Receipt
                  </button>
                  <label
                    class="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <i :class="['fas', isAdminUploadingReceipt ? 'fa-spinner fa-spin' : 'fa-upload']"></i>
                    <span>{{ isAdminUploadingReceipt ? 'Uploading...' : 'Replace Receipt' }}</span>
                    <input type="file" accept="image/*,.pdf" class="hidden" @change="handleAdminReceiptChange($event, selectedRunner)" :disabled="isAdminUploadingReceipt" />
                  </label>
                </div>
              </div>

              <div v-else
                class="border-2 border-dashed border-amber-300 dark:border-amber-800/60 rounded-2xl p-3 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 flex items-center justify-center text-sm font-bold">
                    <i class="fas fa-receipt"></i>
                  </div>
                  <div>
                    <p class="font-bold text-xs text-amber-900 dark:text-amber-200">Upload Receipt: Over The Counter Payment or On-Site Weekend Cash Payment</p>
                    <p class="text-[10px] text-amber-700 dark:text-amber-400">To record proof of payment if any modification is made.</p>
                     <p class="text-[10px] text-amber-700 dark:text-amber-400">Salary Deduction / Employee or Add  to Tuition / Currently Enrolled Students</p>
                  </div>
                </div>

                <label
                  class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer">
                  <i :class="['fas', isAdminUploadingReceipt ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt']"></i>
                  <span>{{ isAdminUploadingReceipt ? 'Recording...' : 'Upload & Record Receipt' }}</span>
                  <input type="file" accept="image/*,.pdf" class="hidden" @change="handleAdminReceiptChange($event, selectedRunner)" :disabled="isAdminUploadingReceipt" />
                </label>
              </div>
            </div>

            <!-- Alumni Valid ID (Front and Back) if uploaded -->
            <div v-if="getImageUrl(selectedRunner.valid_id_front) || getImageUrl(selectedRunner.valid_id_back)" class="lg:flex mt-3 gap-x-2">
              
              
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

          </div>
        </div>
        <!-- Action / Status Management -->
        <div class="pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-medium">Status:</span>
            <span
              :class="['px-2.5 py-0.5 rounded-lg border font-bold text-xs', getStatusBadge(selectedRunner.payment_status)]">
              {{ selectedRunner.payment_status }}
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

        <div class="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-trash-alt"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">Delete {{ selectedIds.length }} Registration{{ selectedIds.length !== 1 ? 's' : '' }}?</h3>
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
            Confirm payment for <strong class="text-emerald-600 dark:text-emerald-400">{{ confirmModal.runner.firstname }} {{ confirmModal.runner.lastname }}</strong>?
          </p>
          <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
            An official confirmation email will be sent to <strong>{{ confirmModal.runner.contact_email || confirmModal.runner.email }}</strong> with BCC to <strong>animorun@lsu.edu.ph</strong>, <strong>calendar@lsu.edu.ph</strong>, and <strong>vpal@lsu.edu.ph</strong>.
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
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line px-2">
            {{ toastModal.message }}
          </p>
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
            <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-sm shadow-xs">
              <i class="fas fa-receipt"></i>
            </div>
            <div>
              <h3 class="text-sm sm:text-base font-black tracking-tight leading-tight">
                {{ receiptModal.title }}
              </h3>
              <p v-if="receiptModal.runner" class="text-[11px] text-gray-500 dark:text-gray-400">
                Runner: <span class="font-semibold text-emerald-600 dark:text-emerald-400 uppercase">{{ receiptModal.runner.firstname }} {{ receiptModal.runner.lastname }}</span>
                <span v-if="receiptModal.runner.run_number || receiptModal.runner.bib_number"> • {{ receiptModal.runner.run_number || receiptModal.runner.bib_number }}</span>
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
        <div class="p-3 sm:p-5 overflow-auto flex-1 flex items-center justify-center bg-slate-900/5 dark:bg-black/50 min-h-[260px]">
          <iframe v-if="isPdfUrl(receiptModal.url)" :src="receiptModal.url" class="w-full h-[66vh] rounded-xl border border-gray-200 dark:border-gray-800" />
          <img v-else :src="receiptModal.url" :alt="receiptModal.title"
            class="max-h-[66vh] max-w-full w-auto object-contain rounded-xl border shadow-md border-gray-200 dark:border-gray-800 select-none" />
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t dark:border-gray-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-gray-900/50 shrink-0">
          <div class="text-[11px] text-gray-500 dark:text-gray-400">
            <span v-if="receiptModal.runner && (receiptModal.runner.grand_total_payment || receiptModal.runner.grand_total)">
              Amount Due: <strong class="text-emerald-600 dark:text-emerald-400 font-bold">₱{{ Number(receiptModal.runner.grand_total_payment || receiptModal.runner.grand_total || 0).toLocaleString() }}</strong>
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
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600"></div>

        <div class="flex items-center justify-between border-b pb-3 dark:border-gray-700">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-bold shadow-sm">
              <i class="fas fa-layer-group"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight">Finalize Supplier Batch Order</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">Lock orders for production, generate CSV &amp; dispatch email notifications</p>
            </div>
          </div>
          <button type="button" @click="closeBatchFinalizeModal" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold text-xs cursor-pointer">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- Selection Scope radio options -->
          <div class="space-y-2">
            <label class="font-bold text-gray-500 uppercase text-[10px] block">Include Runners In Batch:</label>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label :class="[
                'p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2',
                batchFinalizeModal.scope === 'unbatched'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              ]">
                <input type="radio" v-model="batchFinalizeModal.scope" value="unbatched" class="accent-emerald-600" />
                <div>
                  <span class="block">Unbatched Confirmed</span>
                  <span class="text-[10px] text-gray-400 font-normal">Only confirmed without batch</span>
                </div>
              </label>

              <label :class="[
                'p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2',
                batchFinalizeModal.scope === 'filtered'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              ]">
                <input type="radio" v-model="batchFinalizeModal.scope" value="filtered" class="accent-emerald-600" />
                <div>
                  <span class="block">Current Filtered View</span>
                  <span class="text-[10px] text-gray-400 font-normal">Respects search &amp; date range</span>
                </div>
              </label>

              <label v-if="selectedIds.length > 0" :class="[
                'p-3 rounded-2xl border cursor-pointer transition flex items-center gap-2',
                batchFinalizeModal.scope === 'selected'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              ]">
                <input type="radio" v-model="batchFinalizeModal.scope" value="selected" class="accent-emerald-600" />
                <div>
                  <span class="block">Selected Runners ({{ selectedIds.length }})</span>
                  <span class="text-[10px] text-gray-400 font-normal">Checkbox selection</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Batch Name & Operator fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-gray-500 uppercase text-[10px] block mb-1">Batch Group Name *</label>
              <input v-model="batchFinalizeModal.batchName" :class="inputCls" placeholder="e.g. Batch 1, Batch 2" />
            </div>
            <div>
              <label class="font-bold text-gray-500 uppercase text-[10px] block mb-1">Finalized &amp; Locked By</label>
              <input v-model="batchFinalizeModal.lockedBy" :class="inputCls" placeholder="Operator Email" />
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
                <span v-for="(cnt, cat) in batchBreakdown.categories" :key="cat"
                  class="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] border border-emerald-300 dark:border-emerald-700">
                  {{ cat }}: <strong>{{ cnt }}</strong>
                </span>
              </div>
            </div>

            <!-- T-Shirt sizes breakdown -->
            <div>
              <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">T-Shirt Size Quantities (Suppliers):</span>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(cnt, sz) in batchBreakdown.tshirts" :key="sz"
                  class="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[11px] border border-amber-300 dark:border-amber-700">
                  {{ sz }}: <strong>{{ cnt }}</strong>
                </span>
              </div>
            </div>

            <!-- Pet Bandana sizes breakdown (if any) -->
            <div v-if="Object.keys(batchBreakdown.bandanas).length > 0">
              <span class="text-[10px] font-bold text-gray-400 uppercase block mb-1">Pet Bandana Sizes:</span>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="(cnt, bsz) in batchBreakdown.bandanas" :key="bsz"
                  class="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-bold text-[11px]">
                  {{ bsz }}: <strong>{{ cnt }}</strong>
                </span>
              </div>
            </div>
          </div>

          <!-- Strict Policy Warning -->
          <div class="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-[11px] space-y-1">
            <p class="font-bold flex items-center gap-1.5">
              <i class="fas fa-exclamation-triangle text-rose-600"></i> Closed for Orders Supplier Policy:
            </p>
            <p class="leading-relaxed text-[10px]">
              Once finalized, these {{ batchBreakdown.count }} orders will be assigned to <strong>{{ batchFinalizeModal.batchName }}</strong> and locked.
              Strictly <strong>NO RETURN POLICY / NO UPGRADE / NO DOWNGRADE</strong> permitted. Superadmin bypass is required to modify.
            </p>
          </div>

          <!-- Email notification list notice -->
          <div class="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <i class="fas fa-paper-plane text-emerald-600 mt-0.5"></i>
            <div>
              <span class="font-bold block">Automatic Email Dispatch:</span>
              <span class="text-[10px] leading-snug block mt-0.5">
                The breakdown and attached supplier CSV spreadsheet will be sent to:
                <strong class="underline">jorenlee.luna@lsu.edu.ph</strong>, <strong>calendar@lsu.edu.ph</strong>, <strong>vpal@lsu.edu.ph</strong>, <strong>animorun@lsu.edu.ph</strong>.
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t dark:border-gray-700">
          <button type="button" @click="closeBatchFinalizeModal" :disabled="isFinalizingBatch"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeFinalizeBatch" :disabled="isFinalizingBatch || batchBreakdown.count === 0"
            class="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
            <i v-if="!isFinalizingBatch" class="fas fa-lock"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isFinalizingBatch ? 'Finalizing &amp; Sending...' : 'Finalize, Lock &amp; Email CSV' }}</span>
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
            <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-bold shadow-sm">
              <i class="fas fa-boxes"></i>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-black tracking-tight">Supplier Batches &amp; Fulfillment History</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">View finalized batch breakdowns, re-download CSVs, or Superadmin unlock</p>
            </div>
          </div>
          <button type="button" @click="closeBatchHistoryModal" class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold text-xs cursor-pointer">
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
                <!-- Re-download CSV button -->
                <button type="button" @click="downloadBatchCsv(b)"
                  class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm cursor-pointer">
                  <i class="fas fa-download"></i> Download CSV
                </button>
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

            <!-- Size breakdown pills -->
            <div class="pt-1 border-t dark:border-gray-700/60 flex items-center gap-2 flex-wrap text-[10px]">
              <span class="font-bold text-gray-400 uppercase">T-Shirt Breakdown:</span>
              <span v-for="(cnt, sz) in (b.tshirt_breakdown || {})" :key="sz"
                class="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border font-bold text-gray-700 dark:text-gray-200">
                {{ sz }}: {{ cnt }}
              </span>
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

        <div class="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-300 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i :class="['fas', unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked ? 'fa-unlock' : 'fa-lock']"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            {{ unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked ? 'Superadmin Bypass: Unlock Order?' : 'Lock Order for Supplier?' }}
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
            <i v-if="!isTogglingLock" :class="['fas', unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked ? 'fa-unlock' : 'fa-lock']"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isTogglingLock ? 'Updating...' : (unlockPromptModal.target.batch_locked || unlockPromptModal.target.is_locked ? 'Yes, Bypass & Unlock' : 'Yes, Lock Order') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
