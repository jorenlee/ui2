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

// NOTE: allSelected / someSelected depend on filteredRegistrations so it must be
// declared before those computed refs — but since Vue 3 computed refs are lazy
// and the actual .value access is deferred, hoisting the refs is safe here.
const filteredRegistrations = computed(() => {
  return registrations.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim();
    const fullName = `${item.firstname || ""} ${item.middlename || ""} ${item.lastname || ""}`.toLowerCase();
    const bib = (item.run_number || item.bib_number || "").toLowerCase();
    const email = (item.contact_email || item.email || "").toLowerCase();
    const phone = item.contact_number || item.phone || "";
    const regId = String(item.id || "").toLowerCase();

    const matchesQuery =
      !q ||
      fullName.includes(q) ||
      regId.includes(q) ||
      bib.includes(q) ||
      email.includes(q) ||
      phone.includes(q);

    const category = item.run_category || "";
    const matchesCategory = selectedCategory.value === "All" || category.startsWith(selectedCategory.value);
    const matchesStatus = selectedStatus.value === "All" || item.payment_status === selectedStatus.value;
    const matchesType = selectedParticipantType.value === "All" || item.participant_type === selectedParticipantType.value;

    return matchesQuery && matchesCategory && matchesStatus && matchesType;
  });
});

const stats = computed(() => {
  const totalRunners = registrations.value.length;
  const confirmed = registrations.value.filter((r) => r.payment_status === "Confirmed").length;
  const pending = registrations.value.filter((r) => r.payment_status && r.payment_status.startsWith("Pending")).length;

  return { totalRunners, confirmed, pending };
});

const openDetails = (runner) => {
  selectedRunner.value = runner;
  isDetailModalOpen.value = true;
  isEditMode.value = false;
  editForm.value = {};
};

const closeDetails = () => {
  isDetailModalOpen.value = false;
  selectedRunner.value = null;
  isEditMode.value = false;
  editForm.value = {};
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
        confirmed_by: "Admin",
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

const openEdit = () => {
  if (!selectedRunner.value) return;
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
      body: editForm.value,
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
      "Failed to save changes. Please check your connection and try again.",
      "Save Failed",
      "error"
    );
  } finally {
    isSaving.value = false;
  }
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
        'relative overflow-hidden rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border shadow-xl transition-all',
        props.darkMode
          ? 'bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-green-800/40'
          : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 border-emerald-600 text-white',
      ]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
          <div class="space-y-1">
          
            <h1 class="text-sm sm:text-base text-white font-black tracking-tight leading-snug">
              Animo Run 2026 — Participant Status
              <span class="font-normal text-xs sm:text-sm text-emerald-200 block sm:inline sm:ml-1"> <i class="fas fa-list text-amber-300"></i> Track, verify & manage runner registrations</span>
            </h1>
          </div>

          <button type="button" @click="fetchRegistrations" :disabled="isFetching"
            class="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer shrink-0 self-end sm:self-auto">
            <i :class="['fas fa-sync-alt', isFetching ? 'fa-spin' : '']"></i>
            {{ isFetching ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <!-- STATS SUMMARY CARDS (3 COLUMNS - NO REVENUE/COST FOR DATA PRIVACY) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div :class="[
          'px-5 py-2 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Runners</p>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              <span v-if="isFetching" class="inline-block h-6 w-10 rounded-lg bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.totalRunners }}</span>
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
            <i class="fas fa-running"></i>
          </div>
        </div>

        <div :class="[
          'px-5 py-2 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed Paid</p>
            <h3 class="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
              <span v-if="isFetching" class="inline-block h-6 w-10 rounded-lg bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.confirmed }}</span>
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>

        <div :class="[
          'px-5 py-2 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Action</p>
            <h3 class="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              <span v-if="isFetching" class="inline-block h-6 w-10 rounded-lg bg-slate-200 dark:bg-gray-700 animate-pulse"></span>
              <span v-else>{{ stats.pending }}</span>
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
            <i class="fas fa-clock"></i>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER TOOLBAR -->
      <div :class="[
        'p-3 rounded-3xl border shadow-md transition',
        props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
      ]">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Search Input -->
          <div class="relative lg:col-span-1">
            <i class="fas fa-search absolute left-3.5 top-3.5 text-xs text-gray-400"></i>
            <input v-model="searchQuery" type="text" placeholder="Search Name, Reg ID, Bib #, Email..." :class="[
              'w-full pl-9 pr-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]" />
          </div>

          <!-- Category Filter -->
          <div>
            <select v-model="selectedCategory" :class="[
              'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
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
              'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
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
              'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
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
                'text-[11px] font-bold uppercase tracking-wider border-b transition',
                props.darkMode
                  ? 'bg-gray-900/80 border-gray-700 text-gray-400'
                  : 'bg-emerald-50/60 border-slate-200 text-emerald-900',
              ]">
                <!-- Select-all checkbox -->
                <th class="p-4 w-10">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    :indeterminate.prop="someSelected"
                    @change="toggleSelectAll"
                    class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    title="Select all visible"
                  />
                </th>
                <th class="p-4">Reg ID & Bib</th>
                <th class="p-4">Runner Name</th>
                <th class="p-4">Classification</th>
                <th class="p-4">Category</th>
                <th class="p-4">Payment Option</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700/60 text-xs">

              <!-- SKELETON ROWS while fetching -->
              <template v-if="isFetching">
                <tr v-for="n in 8" :key="'sk-' + n" :class="[
                  'animate-pulse',
                  props.darkMode ? 'bg-gray-800' : 'bg-white',
                ]">
                  <!-- Reg ID & Bib -->
                  <td class="p-4">
                    <div :class="['h-3 w-10 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                    <div :class="['h-2.5 w-20 rounded', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <!-- Runner Name -->
                  <td class="p-4">
                    <div :class="['h-3 w-32 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                    <div :class="['h-2.5 w-40 rounded', props.darkMode ? 'bg-gray-600' : 'bg-slate-100']"></div>
                  </td>
                  <!-- Classification -->
                  <td class="p-4">
                    <div :class="['h-3 w-28 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                    <div :class="['h-2.5 w-16 rounded', props.darkMode ? 'bg-gray-600' : 'bg-slate-100']"></div>
                  </td>
                  <!-- Category -->
                  <td class="p-4">
                    <div :class="['h-5 w-16 rounded-full', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <!-- Payment Option -->
                  <td class="p-4">
                    <div :class="['h-3 w-24 rounded mb-1.5', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                    <div :class="['h-2.5 w-12 rounded', props.darkMode ? 'bg-gray-600' : 'bg-slate-100']"></div>
                  </td>
                  <!-- Status -->
                  <td class="p-4">
                    <div :class="['h-5 w-20 rounded-xl', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                  <!-- Actions -->
                  <td class="p-4 text-center">
                    <div :class="['h-6 w-14 rounded-xl mx-auto', props.darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
                  </td>
                </tr>
              </template>

              <!-- ACTUAL DATA ROWS -->
              <template v-else>
                <tr v-for="runner in filteredRegistrations" :key="runner.id" :class="[
                  'hover:bg-emerald-50/30 dark:hover:bg-gray-700/40 transition',
                  selectedIds.includes(runner.id) ? (props.darkMode ? 'bg-emerald-950/30' : 'bg-emerald-50/60') : '',
                ]">
                  <!-- Row checkbox -->
                  <td class="p-4 w-10">
                    <input
                      type="checkbox"
                      :checked="selectedIds.includes(runner.id)"
                      @change="toggleSelectOne(runner.id)"
                      class="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                    />
                  </td>

                  <td class="p-4 font-mono">
                    <!-- <div class="font-bold text-emerald-600 dark:text-emerald-400">#{{ runner.id }}</div> -->
                    <span
                      class="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                      {{ runner.run_number || runner.bib_number || ('AR-' + runner.id) }}
                    </span>
                  </td>

                  <td class="p-4">
                    <div class="font-bold text-gray-900 dark:text-gray-100">
                      {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname
                      }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                    </div>
                    <div class="text-[11px] text-gray-500 truncate max-w-[180px]">
                      {{ runner.contact_email || runner.email }}
                    </div>
                  </td>

                  <td class="p-4">
                    <span class="font-medium text-gray-700 dark:text-gray-300 block">
                      {{ runner.participant_type || 'Individual' }}
                    </span>
                    <span class="text-[10px] text-gray-400 block mt-0.5">
                      {{ runner.college_course || runner.beu_grade || runner.partner_office || runner.alumni_batch ||
                        runner.organization || 'General' }}
                    </span>
                  </td>

                  <td class="p-4">
                    <span :class="[
                      'px-2.5 py-1 rounded-full font-black text-[11px] inline-block shadow-sm',
                      runCategories.find(c => runner.run_category && runner.run_category.startsWith(c.id))?.color || 'bg-emerald-700 text-white',
                    ]">
                      {{ runner.run_category }}
                    </span>
                  </td>

                  <td class="p-4">
                    <div class="font-medium capitalize">
                      {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : runner.payment_type ===
                        'add_to_tuition' ? 'Add to Tuition' : 'Over the Counter / QR' }}
                    </div>
                    <div class="text-[10px] text-gray-400 font-bold mt-0.5">
                      ₱{{ Number(runner.grand_total_payment || runner.grand_total || 0).toLocaleString() }}
                    </div>
                  </td>

                  <td class="p-4">
                    <span :class="[
                      'px-2.5 py-1 rounded-xl text-[10px] font-bold border inline-block',
                      getStatusBadge(runner.payment_status),
                    ]">
                      {{ runner.payment_status }}
                    </span>
                  </td>

                  <td class="p-4 text-center">
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
                  <p class="font-semibold">
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
                    <input v-model="editForm.run_number" :class="inputCls" placeholder="e.g. 10KM-001" />
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


            <!-- Proof of Payment Receipt (if uploaded) -->
            <div v-if="selectedRunner.proof_of_payment">
              <div
                class="border rounded-2xl lg:mt-5 p-3 bg-slate-50 dark:bg-gray-900/40 flex items-center justify-between">
                <div class="flex items-center gap-3">
                 
                  <div>
                   
                    <p class="font-bold text-xs text-gray-500 dark:text-gray-400">Proof Attached</p>
                  </div>
                </div>
                <button type="button"
                  @click="openReceiptModal(selectedRunner.proof_of_payment, 'Payment Receipt Proof', selectedRunner)"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer shadow-sm">
                  <i class="fas fa-receipt text-xs"></i> View Receipt
                </button>
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
  </div>
</template>

<style scoped></style>
