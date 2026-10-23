<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  darkMode: { type: Boolean, default: false },
});

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

// ─────────────────────────────────────────────
// STATE — Records
// ─────────────────────────────────────────────
const records = ref([]);
const loading = ref(false);
const error = ref("");

const search = ref("");
const statusFilter = ref("");
const currentPage = ref(1);
const pageSize = ref(25);

const showModal = ref(false);
const modalMode = ref("create");
const saving = ref(false);
const saveError = ref("");

const selectedIds = ref([]);
const bulkDeleting = ref(false);

// ─────────────────────────────────────────────
// STATE — eVerify
// ─────────────────────────────────────────────
const activeTab = ref("records"); // 'records' | 'everify'
const everifyStatus = ref(null);
const everifyLoading = ref(false);
const everifyMode = ref("person"); // 'person' | 'nationalid'
const verifying = ref(false);
const verifyResult = ref(null);
const verifyError = ref("");
const consent = ref(false);

const everifyForm = ref({
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  birth_date: "",
  face_liveness_session_id: "",
});

const nationalIdForm = ref({
  pcn: "",
  qr_value: "",
  face_liveness_session_id: "",
  use_qr: false,
});

const STATUS_OPTIONS = ["Pending", "Processing", "Released", "Cancelled"];
const RESULT_GRADES = {
  0: { label: "No result / Failed", color: "bg-gray-100 text-gray-700" },
  1: { label: "Verified ✓", color: "bg-green-100 text-green-700" },
  2: { label: "Failed — face mismatch", color: "bg-red-100 text-red-700" },
  3: { label: "Failed — fingerprint", color: "bg-red-100 text-red-700" },
  4: { label: "Failed — iris", color: "bg-red-100 text-red-700" },
  5: { label: "Failed — PCN", color: "bg-red-100 text-red-700" },
  7: { label: "Verified via fingerprint ✓", color: "bg-green-100 text-green-700" },
};

// ─────────────────────────────────────────────
// DEFAULT FORM
// ─────────────────────────────────────────────
const defaultForm = () => ({
  last_name: "", first_name: "", middle_name: "", suffix: "",
  date_of_birth: "", place_of_birth: "", sex: "", civil_status: "",
  nationality: "Filipino", document_type: "Birth Certificate",
  registry_number: "", date_of_registration: "", lcrno: "",
  mother_maiden_name: "", father_name: "",
  province: "", city_municipality: "", barangay: "",
  requesting_party: "", purpose: "", remarks: "", status: "Pending",
});

const form = ref(defaultForm());
const editingId = ref(null);

// ─────────────────────────────────────────────
// FETCH RECORDS
// ─────────────────────────────────────────────
const fetchRecords = async () => {
  loading.value = true;
  error.value = "";
  try {
    const data = await $fetch(`${endpoint}/api/psa/list/`);
    records.value = Array.isArray(data) ? data : [];
  } catch {
    error.value = "Failed to load PSA records. Please try again.";
  } finally {
    loading.value = false;
  }
};

const fetchEVerifyStatus = async () => {
  everifyLoading.value = true;
  try {
    everifyStatus.value = await $fetch(`${endpoint}/api/psa/everify/status/`);
  } catch {
    everifyStatus.value = { configured: false, message: "Could not reach PSA eVerify status endpoint." };
  } finally {
    everifyLoading.value = false;
  }
};

onMounted(() => {
  fetchRecords();
  fetchEVerifyStatus();
});

// ─────────────────────────────────────────────
// FILTERS & PAGINATION
// ─────────────────────────────────────────────
const filtered = computed(() => {
  let data = records.value;
  const q = search.value.trim().toLowerCase();
  if (q) {
    data = data.filter((r) =>
      [r.last_name, r.first_name, r.middle_name, r.registry_number, r.lcrno]
        .some((v) => (v || "").toLowerCase().includes(q))
    );
  }
  if (statusFilter.value) data = data.filter((r) => r.status === statusFilter.value);
  return data;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
const paginated = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});
const goPage = (n) => { currentPage.value = Math.min(Math.max(1, n), totalPages.value); };
const onSearch = () => { currentPage.value = 1; };
const onStatusFilter = () => { currentPage.value = 1; };

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
const openCreate = () => { form.value = defaultForm(); editingId.value = null; modalMode.value = "create"; saveError.value = ""; showModal.value = true; };
const openEdit = (rec) => { form.value = { ...rec }; editingId.value = rec.id; modalMode.value = "edit"; saveError.value = ""; showModal.value = true; };
const openView = (rec) => { form.value = { ...rec }; editingId.value = rec.id; modalMode.value = "view"; showModal.value = true; };
const closeModal = () => { showModal.value = false; };

const saveRecord = async () => {
  saving.value = true; saveError.value = "";
  try {
    if (modalMode.value === "create") {
      const res = await $fetch(`${endpoint}/api/psa/create/`, { method: "POST", body: form.value });
      records.value.unshift(res);
    } else {
      const res = await $fetch(`${endpoint}/api/psa/${editingId.value}/edit/`, { method: "PUT", body: form.value });
      const idx = records.value.findIndex((r) => r.id === editingId.value);
      if (idx !== -1) records.value[idx] = res;
    }
    closeModal();
  } catch { saveError.value = "Failed to save. Please check the form and try again."; }
  finally { saving.value = false; }
};

const deleteRecord = async (rec) => {
  if (!confirm(`Delete record for ${rec.first_name} ${rec.last_name}?`)) return;
  try {
    await $fetch(`${endpoint}/api/psa/${rec.id}/delete/`, { method: "DELETE" });
    records.value = records.value.filter((r) => r.id !== rec.id);
  } catch { alert("Failed to delete record."); }
};

// ─────────────────────────────────────────────
// BULK SELECT
// ─────────────────────────────────────────────
const allSelected = computed(
  () => paginated.value.length > 0 && paginated.value.every((r) => selectedIds.value.includes(r.id))
);
const toggleAll = () => {
  if (allSelected.value) selectedIds.value = selectedIds.value.filter((id) => !paginated.value.map((r) => r.id).includes(id));
  else paginated.value.forEach((r) => { if (!selectedIds.value.includes(r.id)) selectedIds.value.push(r.id); });
};
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  idx === -1 ? selectedIds.value.push(id) : selectedIds.value.splice(idx, 1);
};
const bulkDelete = async () => {
  if (!selectedIds.value.length || !confirm(`Delete ${selectedIds.value.length} selected record(s)?`)) return;
  bulkDeleting.value = true;
  try {
    await $fetch(`${endpoint}/api/psa/bulk-delete/`, { method: "POST", body: { ids: selectedIds.value } });
    records.value = records.value.filter((r) => !selectedIds.value.includes(r.id));
    selectedIds.value = [];
  } catch { alert("Bulk delete failed."); }
  finally { bulkDeleting.value = false; }
};

// ─────────────────────────────────────────────
// eVERIFY ACTIONS
// ─────────────────────────────────────────────
const resetVerifyResult = () => { verifyResult.value = null; verifyError.value = ""; };

const verifyPerson = async () => {
  if (!consent.value) { verifyError.value = "You must provide consent before verifying."; return; }
  const f = everifyForm.value;
  const required = ["first_name", "last_name", "birth_date", "face_liveness_session_id"];
  const missing = required.filter((k) => !f[k]);
  if (missing.length) { verifyError.value = `Missing: ${missing.join(", ")}`; return; }

  verifying.value = true; verifyError.value = ""; verifyResult.value = null;
  try {
    const res = await $fetch(`${endpoint}/api/psa/everify/verify-person/`, {
      method: "POST",
      body: {
        first_name: f.first_name.toUpperCase().trim(),
        middle_name: f.middle_name?.toUpperCase().trim() || undefined,
        last_name: f.last_name.toUpperCase().trim(),
        suffix: f.suffix?.toUpperCase().trim() || undefined,
        birth_date: f.birth_date,
        face_liveness_session_id: f.face_liveness_session_id.trim(),
      },
    });
    verifyResult.value = res;
  } catch (e) {
    verifyError.value = e?.data?.message || "PSA verification request failed.";
  } finally { verifying.value = false; }
};

const verifyNationalId = async () => {
  if (!consent.value) { verifyError.value = "You must provide consent before verifying."; return; }
  const f = nationalIdForm.value;
  if (!f.face_liveness_session_id) { verifyError.value = "Liveness session ID is required."; return; }
  if (!f.pcn && !f.qr_value) { verifyError.value = "Either National ID number (PCN) or QR value is required."; return; }

  verifying.value = true; verifyError.value = ""; verifyResult.value = null;
  try {
    const body = { face_liveness_session_id: f.face_liveness_session_id.trim() };
    if (f.pcn) body.pcn = f.pcn.trim();
    if (f.qr_value) body.qr_value = f.qr_value.trim();
    const res = await $fetch(`${endpoint}/api/psa/everify/verify-national-id/`, { method: "POST", body });
    verifyResult.value = res;
  } catch (e) {
    verifyError.value = e?.data?.message || "PSA National ID verification failed.";
  } finally { verifying.value = false; }
};

const gradeInfo = (grade) => RESULT_GRADES[grade] || { label: `Unknown (${grade})`, color: "bg-gray-100 text-gray-600" };
const statusColor = (s) => {
  switch (s) {
    case "Released":   return "bg-green-100 text-green-700";
    case "Processing": return "bg-blue-100 text-blue-700";
    case "Cancelled":  return "bg-red-100 text-red-700";
    default:           return "bg-yellow-100 text-yellow-700";
  }
};
</script>

<template>
  <div class="psa-wrap" :class="darkMode ? 'dark-mode' : 'light-mode'">

    <!-- ─── HEADER ─────────────────────────────── -->
    <div class="psa-header">
      <div class="psa-title-area">
        <div class="psa-icon-box">
          <i class="fa fa-id-card-o"></i>
        </div>
        <div>
          <h1 class="psa-title">PSA Data</h1>
          <p class="psa-subtitle">Philippine Statistics Authority Records &amp; eVerify Integration</p>
        </div>
      </div>

      <div class="psa-header-actions" v-if="activeTab === 'records'">
        <button v-if="selectedIds.length" class="btn-danger" :disabled="bulkDeleting" @click="bulkDelete">
          <i class="fa fa-trash"></i> Delete {{ selectedIds.length }} selected
        </button>
        <button class="btn-primary" @click="openCreate">
          <i class="fa fa-plus"></i> Add Record
        </button>
      </div>
    </div>

    <!-- ─── TABS ──────────────────────────────── -->
    <div class="tab-bar">
      <button class="tab-btn" :class="{ 'tab-active': activeTab === 'records' }" @click="activeTab = 'records'">
        <i class="fa fa-database"></i> PSA Records
        <span class="tab-badge">{{ records.length }}</span>
      </button>
      <button class="tab-btn" :class="{ 'tab-active': activeTab === 'everify' }" @click="activeTab = 'everify'">
        <i class="fa fa-shield"></i> eVerify Identity
        <span v-if="everifyStatus?.configured" class="tab-badge tab-badge-green">● Live</span>
        <span v-else class="tab-badge tab-badge-gray">○ Setup needed</span>
      </button>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- TAB: PSA RECORDS                          -->
    <!-- ══════════════════════════════════════════ -->
    <div v-if="activeTab === 'records'">

      <!-- Filters -->
      <div class="psa-filters">
        <div class="search-wrapper">
          <i class="fa fa-search search-icon"></i>
          <input v-model="search" class="psa-input" placeholder="Search by name, registry no., LCR no…" @input="onSearch" />
        </div>
        <select v-model="statusFilter" class="psa-select" @change="onStatusFilter">
          <option value="">All Statuses</option>
          <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="pageSize" class="psa-select" @change="currentPage = 1">
          <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
        </select>
      </div>

      <!-- Stats -->
      <div class="psa-stats">
        <div class="stat-chip"><span class="stat-num">{{ records.length }}</span><span class="stat-label">Total</span></div>
        <div v-for="s in STATUS_OPTIONS" :key="s" class="stat-chip">
          <span class="stat-num">{{ records.filter(r => r.status === s).length }}</span>
          <span class="stat-label">{{ s }}</span>
        </div>
        <div class="stat-chip"><span class="stat-num">{{ filtered.length }}</span><span class="stat-label">Filtered</span></div>
      </div>

      <!-- Loading / Error -->
      <div v-if="loading" class="psa-loading">
        <div class="spinner"></div><span>Loading PSA records…</span>
      </div>
      <div v-else-if="error" class="psa-error">
        <i class="fa fa-exclamation-circle"></i> {{ error }}
        <button class="btn-retry" @click="fetchRecords">Retry</button>
      </div>

      <!-- Table -->
      <div v-else class="psa-table-wrap">
        <table class="psa-table">
          <thead>
            <tr>
              <th class="th-check"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
              <th>#</th><th>Last Name</th><th>First Name</th><th>Middle Name</th>
              <th>Sex</th><th>Date of Birth</th><th>Document Type</th>
              <th>Registry No.</th><th>LCR No.</th><th>Status</th>
              <th>Requesting Party</th><th>Created</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginated.length === 0">
              <td colspan="14" class="empty-row">
                <i class="fa fa-inbox"></i><span>No PSA records found.</span>
              </td>
            </tr>
            <tr v-for="(rec, idx) in paginated" :key="rec.id" :class="{ 'row-selected': selectedIds.includes(rec.id) }">
              <td class="td-check"><input type="checkbox" :checked="selectedIds.includes(rec.id)" @change="toggleSelect(rec.id)" /></td>
              <td class="td-num">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
              <td class="td-bold">{{ rec.last_name }}</td>
              <td>{{ rec.first_name }}</td>
              <td class="td-muted">{{ rec.middle_name }}</td>
              <td>{{ rec.sex }}</td>
              <td>{{ rec.date_of_birth }}</td>
              <td>{{ rec.document_type }}</td>
              <td class="td-mono">{{ rec.registry_number }}</td>
              <td class="td-mono">{{ rec.lcrno }}</td>
              <td><span class="status-badge" :class="statusColor(rec.status)">{{ rec.status }}</span></td>
              <td>{{ rec.requesting_party }}</td>
              <td class="td-muted td-date">{{ rec.created_at_formatted }}</td>
              <td class="td-actions">
                <button class="action-btn view-btn" title="View" @click="openView(rec)"><i class="fa fa-eye"></i></button>
                <button class="action-btn edit-btn" title="Edit" @click="openEdit(rec)"><i class="fa fa-pencil"></i></button>
                <button class="action-btn del-btn" title="Delete" @click="deleteRecord(rec)"><i class="fa fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && !error" class="psa-pagination">
        <span class="page-info">Page {{ currentPage }} of {{ totalPages }} ({{ filtered.length }} record{{ filtered.length !== 1 ? "s" : "" }})</span>
        <div class="page-btns">
          <button class="page-btn" :disabled="currentPage === 1" @click="goPage(1)"><i class="fa fa-angle-double-left"></i></button>
          <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)"><i class="fa fa-angle-left"></i></button>
          <button
            v-for="p in totalPages <= 7 ? Array.from({length:totalPages},(_,i)=>i+1) : [1,'…',currentPage-1,currentPage,currentPage+1,'…',totalPages].filter((v,i,a)=>typeof v==='string'||(v>=1&&v<=totalPages&&a.indexOf(v)===i))"
            :key="p" class="page-btn" :class="{'page-active':p===currentPage}" :disabled="p==='…'" @click="p!=='…'&&goPage(p)">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage===totalPages" @click="goPage(currentPage+1)"><i class="fa fa-angle-right"></i></button>
          <button class="page-btn" :disabled="currentPage===totalPages" @click="goPage(totalPages)"><i class="fa fa-angle-double-right"></i></button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- TAB: PSA eVERIFY                          -->
    <!-- ══════════════════════════════════════════ -->
    <div v-if="activeTab === 'everify'" class="everify-wrap">

      <!-- Status Banner -->
      <div v-if="everifyLoading" class="psa-loading"><div class="spinner"></div><span>Checking PSA eVerify status…</span></div>
      <div v-else-if="everifyStatus" :class="['everify-status-bar', everifyStatus.configured ? 'status-ok' : 'status-warn']">
        <div class="everify-status-left">
          <i :class="['fa', everifyStatus.configured ? 'fa-check-circle' : 'fa-exclamation-circle']"></i>
          <div>
            <div class="everify-status-title">PSA National ID eVerify API</div>
            <div class="everify-status-msg">{{ everifyStatus.message }}</div>
            <div v-if="everifyStatus.base_url" class="everify-status-url">{{ everifyStatus.base_url }}</div>
          </div>
        </div>
        <div v-if="everifyStatus.configured" class="everify-status-badge">🟢 Connected</div>
        <div v-else class="everify-status-badge-warn">🔴 Not Configured</div>
      </div>

      <!-- SDK Notice -->
      <div class="everify-sdk-notice" v-if="everifyStatus?.configured || true">
        <div class="sdk-notice-icon"><i class="fa fa-info-circle"></i></div>
        <div>
          <div class="sdk-notice-title">Facial Liveness SDK Required</div>
          <div class="sdk-notice-body">
            The <strong>face_liveness_session_id</strong> must come from the official PSA Facial Liveness SDK
            (<code>liveness.everify.gov.ph/js/everify-liveness-sdk.min.js</code>).
            The session ID expires after <strong>5 minutes</strong>. Complete liveness first, then submit immediately.
          </div>
        </div>
      </div>

      <!-- Mode Toggle -->
      <div class="everify-mode-toggle">
        <button :class="['mode-btn', everifyMode === 'person' ? 'mode-active' : '']" @click="everifyMode='person'; resetVerifyResult()">
          <i class="fa fa-user"></i> Verify by Personal Info
        </button>
        <button :class="['mode-btn', everifyMode === 'nationalid' ? 'mode-active' : '']" @click="everifyMode='nationalid'; resetVerifyResult()">
          <i class="fa fa-credit-card"></i> Verify by National ID / QR
        </button>
      </div>

      <!-- ── FORM: Personal Info ── -->
      <div v-if="everifyMode === 'person'" class="everify-form-card">
        <div class="everify-form-title">
          <i class="fa fa-user-circle-o"></i> Identity Verification — Personal Information
          <span class="everify-tier-tag">PSA /query endpoint</span>
        </div>

        <div class="everify-grid">
          <div class="ef-group"><label>Last Name <span class="req">*</span></label>
            <input v-model="everifyForm.last_name" class="ef-input" placeholder="DELA CRUZ" /></div>
          <div class="ef-group"><label>First Name <span class="req">*</span></label>
            <input v-model="everifyForm.first_name" class="ef-input" placeholder="JUAN" /></div>
          <div class="ef-group"><label>Middle Name</label>
            <input v-model="everifyForm.middle_name" class="ef-input" placeholder="SANTOS" /></div>
          <div class="ef-group ef-sm"><label>Suffix</label>
            <input v-model="everifyForm.suffix" class="ef-input" placeholder="JR, SR, III…" /></div>
          <div class="ef-group"><label>Date of Birth <span class="req">*</span></label>
            <input type="date" v-model="everifyForm.birth_date" class="ef-input" /></div>
          <div class="ef-group ef-full">
            <label>Facial Liveness Session ID <span class="req">*</span></label>
            <input v-model="everifyForm.face_liveness_session_id" class="ef-input ef-mono" placeholder="Paste session ID from PSA Liveness SDK…" />
            <span class="ef-hint"><i class="fa fa-clock-o"></i> Expires 5 min after liveness completion</span>
          </div>
        </div>

        <label class="consent-label">
          <input type="checkbox" v-model="consent" />
          <span>I consent to the processing of my personal information for identity verification through the PSA National ID eVerify system.</span>
        </label>

        <div v-if="verifyError" class="verify-error"><i class="fa fa-exclamation-triangle"></i> {{ verifyError }}</div>

        <div class="ef-actions">
          <button class="btn-primary btn-lg" :disabled="verifying || !consent" @click="verifyPerson">
            <span v-if="verifying"><i class="fa fa-spinner fa-spin"></i> Verifying with PSA…</span>
            <span v-else><i class="fa fa-shield"></i> Verify Identity (PSA eVerify)</span>
          </button>
        </div>
      </div>

      <!-- ── FORM: National ID / QR ── -->
      <div v-if="everifyMode === 'nationalid'" class="everify-form-card">
        <div class="everify-form-title">
          <i class="fa fa-credit-card"></i> Identity Verification — National ID / QR Code
          <span class="everify-tier-tag">PSA /query/qr endpoint</span>
        </div>

        <div class="mode-sub-toggle">
          <label>
            <input type="radio" v-model="nationalIdForm.use_qr" :value="false" /> Use PCN (National ID Number)
          </label>
          <label>
            <input type="radio" v-model="nationalIdForm.use_qr" :value="true" /> Use QR Code Value
          </label>
        </div>

        <div class="everify-grid">
          <div v-if="!nationalIdForm.use_qr" class="ef-group ef-full">
            <label>National ID Number (PCN) <span class="req">*</span></label>
            <input v-model="nationalIdForm.pcn" class="ef-input ef-mono" placeholder="1234-5678-9012" />
          </div>
          <div v-else class="ef-group ef-full">
            <label>QR Code Value <span class="req">*</span></label>
            <textarea v-model="nationalIdForm.qr_value" class="ef-input ef-mono" rows="3" placeholder="Paste raw QR string from National ID…"></textarea>
          </div>
          <div class="ef-group ef-full">
            <label>Facial Liveness Session ID <span class="req">*</span></label>
            <input v-model="nationalIdForm.face_liveness_session_id" class="ef-input ef-mono" placeholder="Paste session ID from PSA Liveness SDK…" />
            <span class="ef-hint"><i class="fa fa-clock-o"></i> Expires 5 min after liveness completion</span>
          </div>
        </div>

        <label class="consent-label">
          <input type="checkbox" v-model="consent" />
          <span>I consent to the processing of my personal information for identity verification through the PSA National ID eVerify system.</span>
        </label>

        <div v-if="verifyError" class="verify-error"><i class="fa fa-exclamation-triangle"></i> {{ verifyError }}</div>

        <div class="ef-actions">
          <button class="btn-primary btn-lg" :disabled="verifying || !consent" @click="verifyNationalId">
            <span v-if="verifying"><i class="fa fa-spinner fa-spin"></i> Verifying with PSA…</span>
            <span v-else><i class="fa fa-shield"></i> Verify National ID (PSA eVerify)</span>
          </button>
        </div>
      </div>

      <!-- ── VERIFICATION RESULT ── -->
      <div v-if="verifyResult" :class="['verify-result-card', verifyResult.is_verified ? 'result-success' : 'result-fail']">
        <div class="result-header">
          <i :class="['fa fa-2x', verifyResult.is_verified ? 'fa-check-circle' : 'fa-times-circle']"></i>
          <div>
            <div class="result-title">{{ verifyResult.is_verified ? "Identity Verified" : "Verification Failed" }}</div>
            <div class="result-sub">PSA eVerify Response</div>
          </div>
        </div>
        <div class="result-body">
          <div class="result-row">
            <span class="result-label">Result Grade</span>
            <span class="result-val">
              <span class="status-badge" :class="gradeInfo(verifyResult.result_grade).color">
                {{ verifyResult.result_grade }} — {{ gradeInfo(verifyResult.result_grade).label }}
              </span>
            </span>
          </div>
          <div class="result-row">
            <span class="result-label">Status</span>
            <span class="result-val">{{ verifyResult.result_description }}</span>
          </div>
          <div v-if="verifyResult.backend_token" class="result-row">
            <span class="result-label">Backend Token</span>
            <span class="result-val result-mono">{{ verifyResult.backend_token }}</span>
          </div>
          <div class="result-notice">
            <i class="fa fa-info-circle"></i>
            Only the verification result is stored. Full PSA response data is not retained per data privacy guidelines.
          </div>
        </div>
        <button class="btn-ghost mt-3" @click="resetVerifyResult">Clear Result</button>
      </div>

      <!-- Flow Diagram -->
      <div class="everify-flow">
        <div class="flow-title">Integration Architecture</div>
        <div class="flow-steps">
          <div class="flow-step">
            <div class="flow-step-icon flow-lsu"><i class="fa fa-university"></i></div>
            <div class="flow-step-label">LSU Dashboard</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <div class="flow-step-icon flow-sdk"><i class="fa fa-camera"></i></div>
            <div class="flow-step-label">PSA Liveness SDK</div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <div class="flow-step-icon flow-django"><i class="fa fa-server"></i></div>
            <div class="flow-step-label">Django API<br/><small>/api/psa/everify/</small></div>
          </div>
          <div class="flow-arrow">→</div>
          <div class="flow-step">
            <div class="flow-step-icon flow-psa"><i class="fa fa-shield"></i></div>
            <div class="flow-step-label">PSA eVerify<br/><small>ws.everify.gov.ph</small></div>
          </div>
        </div>
        <div class="flow-endpoints">
          <div class="flow-ep"><code>POST /api/psa/everify/verify-person/</code> — Verify by personal info + liveness</div>
          <div class="flow-ep"><code>POST /api/psa/everify/verify-national-id/</code> — Verify by PCN/QR + liveness</div>
          <div class="flow-ep"><code>GET &nbsp;/api/psa/everify/status/</code> — Check credentials &amp; config</div>
        </div>
      </div>
    </div>

    <!-- ─── RECORD MODAL ──────────────────────────── -->
    <teleport to="body">
      <transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box" :class="darkMode ? 'modal-dark' : 'modal-light'">
            <div class="modal-header">
              <div class="modal-title-area">
                <i class="fa" :class="{'fa-plus-circle':modalMode==='create','fa-pencil':modalMode==='edit','fa-eye':modalMode==='view'}"></i>
                <span>{{ modalMode==="create" ? "Add New PSA Record" : modalMode==="edit" ? "Edit PSA Record" : "View PSA Record" }}</span>
              </div>
              <button class="modal-close" @click="closeModal"><i class="fa fa-times"></i></button>
            </div>
            <div class="modal-body">
              <div v-if="saveError" class="form-error-banner"><i class="fa fa-exclamation-triangle"></i> {{ saveError }}</div>
              <div class="form-grid">
                <div class="form-section-title">Identity</div>
                <div class="field-group"><label>Last Name <span class="req">*</span></label><input v-model="form.last_name" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>First Name <span class="req">*</span></label><input v-model="form.first_name" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>Middle Name</label><input v-model="form.middle_name" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group field-sm"><label>Suffix</label><input v-model="form.suffix" class="field-input" :readonly="modalMode==='view'" placeholder="Jr., Sr., III…" /></div>

                <div class="form-section-title">Personal Information</div>
                <div class="field-group"><label>Date of Birth</label><input type="date" v-model="form.date_of_birth" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>Place of Birth</label><input v-model="form.place_of_birth" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group field-sm"><label>Sex</label><select v-model="form.sex" class="field-input" :disabled="modalMode==='view'"><option value="">—</option><option>Male</option><option>Female</option></select></div>
                <div class="field-group field-sm"><label>Civil Status</label><select v-model="form.civil_status" class="field-input" :disabled="modalMode==='view'"><option value="">—</option><option>Single</option><option>Married</option><option>Widowed</option><option>Legally Separated</option></select></div>
                <div class="field-group field-sm"><label>Nationality</label><input v-model="form.nationality" class="field-input" :readonly="modalMode==='view'" /></div>

                <div class="form-section-title">Parents</div>
                <div class="field-group"><label>Mother's Maiden Name</label><input v-model="form.mother_maiden_name" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>Father's Name</label><input v-model="form.father_name" class="field-input" :readonly="modalMode==='view'" /></div>

                <div class="form-section-title">Document Details</div>
                <div class="field-group"><label>Document Type</label><select v-model="form.document_type" class="field-input" :disabled="modalMode==='view'"><option>Birth Certificate</option><option>Marriage Certificate</option><option>Death Certificate</option><option>Certificate of No Marriage (CENOMAR)</option><option>Other</option></select></div>
                <div class="field-group"><label>Registry Number</label><input v-model="form.registry_number" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>LCR No.</label><input v-model="form.lcrno" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>Date of Registration</label><input type="date" v-model="form.date_of_registration" class="field-input" :readonly="modalMode==='view'" /></div>

                <div class="form-section-title">Address / Region</div>
                <div class="field-group"><label>Province</label><input v-model="form.province" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>City / Municipality</label><input v-model="form.city_municipality" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>Barangay</label><input v-model="form.barangay" class="field-input" :readonly="modalMode==='view'" /></div>

                <div class="form-section-title">Request Details</div>
                <div class="field-group"><label>Requesting Party</label><input v-model="form.requesting_party" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group"><label>Purpose</label><input v-model="form.purpose" class="field-input" :readonly="modalMode==='view'" /></div>
                <div class="field-group field-sm"><label>Status</label><select v-model="form.status" class="field-input" :disabled="modalMode==='view'"><option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ s }}</option></select></div>
                <div class="field-group field-wide"><label>Remarks</label><textarea v-model="form.remarks" class="field-input field-textarea" :readonly="modalMode==='view'" rows="3"></textarea></div>
              </div>
            </div>
            <div class="modal-footer" v-if="modalMode !== 'view'">
              <button class="btn-ghost" @click="closeModal">Cancel</button>
              <button class="btn-primary" :disabled="saving" @click="saveRecord">
                <span v-if="saving"><i class="fa fa-spinner fa-spin"></i> Saving…</span>
                <span v-else><i class="fa fa-save"></i> Save Record</span>
              </button>
            </div>
            <div class="modal-footer" v-else>
              <button class="btn-ghost" @click="closeModal">Close</button>
              <button class="btn-primary" @click="openEdit(form)"><i class="fa fa-pencil"></i> Edit</button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<style scoped>
/* ─── BASE ────────────────────────────────── */
.psa-wrap { padding: 24px; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
.light-mode { background: #f8fafc; color: #1e293b; }
.dark-mode  { background: #0f172a; color: #e2e8f0; }

/* ─── HEADER ─────────────────────────────── */
.psa-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
.psa-title-area { display:flex; align-items:center; gap:14px; }
.psa-icon-box { width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#166534,#16a34a);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;box-shadow:0 4px 14px rgba(22,163,74,.35); }
.psa-title { font-size:22px;font-weight:700;margin:0;line-height:1.2; }
.psa-subtitle { font-size:12px;color:#64748b;margin:2px 0 0; }
.dark-mode .psa-subtitle { color:#94a3b8; }
.psa-header-actions { display:flex;gap:10px;flex-wrap:wrap; }

/* ─── TABS ───────────────────────────────── */
.tab-bar { display:flex;gap:6px;margin-bottom:18px;border-bottom:2px solid #e2e8f0;padding-bottom:0; }
.dark-mode .tab-bar { border-color:#334155; }
.tab-btn { display:flex;align-items:center;gap:7px;padding:10px 18px;border:none;background:transparent;cursor:pointer;font-size:13px;font-weight:600;color:#64748b;border-bottom:3px solid transparent;margin-bottom:-2px;transition:color .2s,border-color .2s; }
.tab-btn:hover { color:#16a34a; }
.tab-active { color:#16a34a !important;border-bottom-color:#16a34a !important; }
.dark-mode .tab-btn { color:#94a3b8; }
.tab-badge { padding:2px 8px;border-radius:100px;background:#e2e8f0;color:#64748b;font-size:11px;font-weight:700; }
.tab-badge-green { background:#dcfce7;color:#166534; }
.tab-badge-gray  { background:#f1f5f9;color:#94a3b8; }
.dark-mode .tab-badge { background:#334155;color:#94a3b8; }

/* ─── BUTTONS ────────────────────────────── */
.btn-primary { background:linear-gradient(135deg,#166534,#16a34a);color:#fff;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .2s,transform .15s; }
.btn-primary:hover:not(:disabled) { opacity:.88;transform:translateY(-1px); }
.btn-primary:disabled { opacity:.5;cursor:not-allowed; }
.btn-lg { padding:12px 24px;font-size:14px; }
.btn-ghost { background:transparent;border:1.5px solid #cbd5e1;color:#64748b;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:background .2s; }
.btn-ghost:hover { background:#f1f5f9; }
.dark-mode .btn-ghost { border-color:#334155;color:#94a3b8; }
.dark-mode .btn-ghost:hover { background:#1e293b; }
.btn-danger { background:linear-gradient(135deg,#991b1b,#dc2626);color:#fff;border:none;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:opacity .2s; }
.btn-danger:disabled { opacity:.5;cursor:not-allowed; }
.btn-retry { background:#fff3;border:1px solid #fff6;color:#fff;padding:4px 12px;border-radius:8px;cursor:pointer;margin-left:10px; }
.mt-3 { margin-top:12px; }

/* ─── FILTERS ────────────────────────────── */
.psa-filters { display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px; }
.search-wrapper { position:relative;flex:1;min-width:220px; }
.search-icon { position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8;font-size:13px; }
.psa-input { width:100%;padding:9px 12px 9px 34px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;outline:none;transition:border-color .2s;box-sizing:border-box; }
.psa-input:focus { border-color:#16a34a; }
.dark-mode .psa-input { background:#1e293b;border-color:#334155;color:#e2e8f0; }
.psa-select { padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:13px;background:#fff;outline:none;cursor:pointer; }
.dark-mode .psa-select { background:#1e293b;border-color:#334155;color:#e2e8f0; }

/* ─── STATS ──────────────────────────────── */
.psa-stats { display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px; }
.stat-chip { display:flex;flex-direction:column;align-items:center;padding:10px 18px;border-radius:12px;background:#fff;border:1.5px solid #e2e8f0;min-width:80px;box-shadow:0 1px 4px rgba(0,0,0,.06); }
.dark-mode .stat-chip { background:#1e293b;border-color:#334155; }
.stat-num { font-size:20px;font-weight:700;color:#16a34a;line-height:1; }
.stat-label { font-size:10px;color:#94a3b8;margin-top:3px;font-weight:500; }

/* ─── LOADING / ERROR ────────────────────── */
.psa-loading { display:flex;align-items:center;gap:12px;justify-content:center;padding:60px 0;color:#64748b; }
.spinner { width:28px;height:28px;border:3px solid #e2e8f0;border-top-color:#16a34a;border-radius:50%;animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.psa-error { text-align:center;padding:40px;color:#fff;background:linear-gradient(135deg,#991b1b,#dc2626);border-radius:14px;margin:20px 0; }

/* ─── TABLE ──────────────────────────────── */
.psa-table-wrap { overflow-x:auto;border-radius:14px;border:1.5px solid #e2e8f0;background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.06); }
.dark-mode .psa-table-wrap { background:#1e293b;border-color:#334155; }
.psa-table { width:100%;border-collapse:collapse;font-size:12.5px; }
.psa-table thead th { padding:12px 14px;background:linear-gradient(135deg,#166534,#16a34a);color:#fff;font-weight:600;text-align:left;white-space:nowrap; }
.psa-table thead th:first-child { border-radius:12px 0 0 0; }
.psa-table thead th:last-child  { border-radius:0 12px 0 0; }
.psa-table tbody tr { border-bottom:1px solid #f1f5f9;transition:background .15s; }
.dark-mode .psa-table tbody tr { border-color:#334155; }
.psa-table tbody tr:hover { background:#f0fdf4; }
.psa-table tbody tr:last-child { border-bottom:none; }
.row-selected { background:#dcfce7 !important; }
.dark-mode .row-selected { background:#14532d !important; }
.psa-table td { padding:10px 14px;vertical-align:middle; }
.th-check,.td-check { width:36px;text-align:center; }
.td-num { width:40px;color:#94a3b8;font-weight:600; }
.td-bold { font-weight:600; }
.td-muted { color:#64748b; }
.dark-mode .td-muted { color:#94a3b8; }
.td-mono { font-family:monospace;font-size:11.5px; }
.td-date { white-space:nowrap;font-size:11px; }
.td-actions { display:flex;gap:6px;align-items:center; }
.empty-row { text-align:center;padding:50px 0;color:#94a3b8; }
.empty-row i { display:block;font-size:28px;margin-bottom:8px; }
.status-badge { padding:3px 9px;border-radius:100px;font-size:11px;font-weight:600;white-space:nowrap; }
.action-btn { width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;transition:transform .15s; }
.action-btn:hover { transform:scale(1.12); }
.view-btn { background:#dbeafe;color:#1d4ed8; }
.edit-btn { background:#fef9c3;color:#854d0e; }
.del-btn  { background:#fee2e2;color:#b91c1c; }

/* ─── PAGINATION ─────────────────────────── */
.psa-pagination { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:18px; }
.page-info { font-size:12px;color:#64748b; }
.dark-mode .page-info { color:#94a3b8; }
.page-btns { display:flex;gap:4px;flex-wrap:wrap; }
.page-btn { width:32px;height:32px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s,border-color .15s;display:flex;align-items:center;justify-content:center; }
.dark-mode .page-btn { background:#1e293b;border-color:#334155;color:#e2e8f0; }
.page-btn:disabled { opacity:.4;cursor:not-allowed; }
.page-btn:hover:not(:disabled) { background:#f0fdf4;border-color:#16a34a; }
.page-active { background:linear-gradient(135deg,#166534,#16a34a) !important;color:#fff !important;border-color:transparent !important; }

/* ─── eVERIFY WRAP ───────────────────────── */
.everify-wrap { display:flex;flex-direction:column;gap:18px; }
.everify-status-bar { display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;padding:16px 20px;border-radius:14px; }
.status-ok   { background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1.5px solid #86efac; }
.status-warn { background:linear-gradient(135deg,#fffbeb,#fef9c3);border:1.5px solid #fde68a; }
.dark-mode .status-ok   { background:#14532d;border-color:#166534; }
.dark-mode .status-warn { background:#422006;border-color:#854d0e; }
.everify-status-left { display:flex;align-items:flex-start;gap:12px;flex:1; }
.everify-status-left .fa { font-size:22px;margin-top:2px; }
.status-ok .fa   { color:#16a34a; }
.status-warn .fa { color:#d97706; }
.everify-status-title { font-weight:700;font-size:14px; }
.everify-status-msg { font-size:12.5px;color:#64748b;margin-top:2px; }
.dark-mode .everify-status-msg { color:#94a3b8; }
.everify-status-url { font-size:11px;font-family:monospace;color:#94a3b8;margin-top:2px; }
.everify-status-badge { padding:5px 14px;border-radius:100px;background:#16a34a;color:#fff;font-size:12px;font-weight:700; }
.everify-status-badge-warn { padding:5px 14px;border-radius:100px;background:#dc2626;color:#fff;font-size:12px;font-weight:700; }

/* ─── SDK NOTICE ─────────────────────────── */
.everify-sdk-notice { display:flex;gap:12px;padding:14px 18px;border-radius:12px;background:#eff6ff;border:1.5px solid #bfdbfe; }
.dark-mode .everify-sdk-notice { background:#1e3a5f;border-color:#1d4ed8; }
.sdk-notice-icon { font-size:18px;color:#1d4ed8;padding-top:2px; }
.sdk-notice-title { font-weight:700;font-size:13px;color:#1e40af; }
.dark-mode .sdk-notice-title { color:#93c5fd; }
.sdk-notice-body { font-size:12px;color:#374151;margin-top:3px;line-height:1.5; }
.dark-mode .sdk-notice-body { color:#cbd5e1; }
.sdk-notice-body code { background:#dbeafe;color:#1d4ed8;padding:1px 5px;border-radius:4px;font-size:11px; }
.dark-mode .sdk-notice-body code { background:#1e3a5f;color:#93c5fd; }

/* ─── MODE TOGGLE ────────────────────────── */
.everify-mode-toggle { display:flex;gap:8px;flex-wrap:wrap; }
.mode-btn { padding:10px 20px;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;font-size:13px;font-weight:600;color:#64748b;display:flex;align-items:center;gap:7px;transition:all .2s; }
.mode-btn:hover { border-color:#16a34a;color:#16a34a; }
.mode-active { background:linear-gradient(135deg,#166534,#16a34a) !important;color:#fff !important;border-color:transparent !important; }
.dark-mode .mode-btn { background:#1e293b;border-color:#334155;color:#94a3b8; }
.mode-sub-toggle { display:flex;gap:16px;font-size:13px;margin-bottom:4px; }
.mode-sub-toggle label { display:flex;align-items:center;gap:6px;cursor:pointer; }

/* ─── eVERIFY FORM CARD ──────────────────── */
.everify-form-card { background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px;box-shadow:0 2px 12px rgba(0,0,0,.06); }
.dark-mode .everify-form-card { background:#1e293b;border-color:#334155; }
.everify-form-title { font-size:14px;font-weight:700;color:#166534;margin-bottom:18px;display:flex;align-items:center;gap:8px;flex-wrap:wrap; }
.dark-mode .everify-form-title { color:#4ade80; }
.everify-tier-tag { margin-left:auto;background:#dcfce7;color:#166534;padding:3px 10px;border-radius:100px;font-size:11px;font-family:monospace; }
.dark-mode .everify-tier-tag { background:#14532d;color:#4ade80; }
.everify-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:16px; }
.ef-group { display:flex;flex-direction:column;gap:4px; }
.ef-sm { grid-column:auto; }
.ef-full { grid-column:1/-1; }
.ef-group label { font-size:11.5px;font-weight:600;color:#475569; }
.dark-mode .ef-group label { color:#94a3b8; }
.req { color:#dc2626; }
.ef-input { padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:13px;background:#f8fafc;outline:none;transition:border-color .2s;width:100%;box-sizing:border-box; }
.ef-input:focus { border-color:#16a34a;background:#fff; }
.dark-mode .ef-input { background:#0f172a;border-color:#334155;color:#e2e8f0; }
.dark-mode .ef-input:focus { border-color:#16a34a;background:#0f172a; }
.ef-mono { font-family:monospace;font-size:12px; }
.ef-hint { font-size:11px;color:#94a3b8;margin-top:3px; }
.ef-actions { display:flex;justify-content:flex-end;margin-top:16px; }

/* ─── CONSENT ────────────────────────────── */
.consent-label { display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:#475569;cursor:pointer;line-height:1.5; }
.dark-mode .consent-label { color:#94a3b8; }
.consent-label input { margin-top:2px; }

.verify-error { background:#fee2e2;color:#b91c1c;padding:10px 14px;border-radius:10px;font-size:13px;margin-top:12px; }

/* ─── VERIFY RESULT ──────────────────────── */
.verify-result-card { border-radius:16px;border:2px solid;padding:22px; }
.result-success { background:#f0fdf4;border-color:#86efac; }
.result-fail    { background:#fff5f5;border-color:#fca5a5; }
.dark-mode .result-success { background:#14532d;border-color:#166534; }
.dark-mode .result-fail    { background:#450a0a;border-color:#7f1d1d; }
.result-header { display:flex;align-items:center;gap:14px;margin-bottom:16px; }
.result-success .fa { color:#16a34a; }
.result-fail    .fa { color:#dc2626; }
.result-title { font-size:18px;font-weight:700; }
.result-sub { font-size:12px;color:#64748b;margin-top:2px; }
.result-body { display:flex;flex-direction:column;gap:10px; }
.result-row { display:flex;align-items:flex-start;gap:12px; }
.result-label { font-size:12px;font-weight:600;color:#64748b;min-width:120px;flex-shrink:0; }
.result-val { font-size:13px;font-weight:500; }
.result-mono { font-family:monospace;font-size:11px;word-break:break-all; }
.result-notice { font-size:11.5px;color:#64748b;background:#f8fafc;border-radius:8px;padding:10px;margin-top:6px;display:flex;gap:7px;align-items:flex-start; }
.dark-mode .result-notice { background:#1e293b;color:#94a3b8; }

/* ─── FLOW DIAGRAM ───────────────────────── */
.everify-flow { background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;padding:22px;box-shadow:0 2px 8px rgba(0,0,0,.04); }
.dark-mode .everify-flow { background:#1e293b;border-color:#334155; }
.flow-title { font-size:13px;font-weight:700;color:#166534;margin-bottom:20px;text-transform:uppercase;letter-spacing:.06em; }
.dark-mode .flow-title { color:#4ade80; }
.flow-steps { display:flex;align-items:center;gap:0;flex-wrap:wrap;justify-content:center;margin-bottom:20px; }
.flow-step { display:flex;flex-direction:column;align-items:center;gap:8px;min-width:90px; }
.flow-step-icon { width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff; }
.flow-lsu    { background:linear-gradient(135deg,#166534,#16a34a); }
.flow-sdk    { background:linear-gradient(135deg,#1d4ed8,#3b82f6); }
.flow-django { background:linear-gradient(135deg,#7c3aed,#8b5cf6); }
.flow-psa    { background:linear-gradient(135deg,#b45309,#f59e0b); }
.flow-step-label { font-size:11px;font-weight:600;color:#64748b;text-align:center;line-height:1.4; }
.dark-mode .flow-step-label { color:#94a3b8; }
.flow-step-label small { font-size:10px;font-family:monospace;display:block; }
.flow-arrow { font-size:20px;color:#94a3b8;padding:0 8px;margin-bottom:20px; }
.flow-endpoints { display:flex;flex-direction:column;gap:7px; }
.flow-ep { font-size:12px;color:#475569;padding:8px 12px;background:#f8fafc;border-radius:8px;border-left:3px solid #16a34a; }
.dark-mode .flow-ep { background:#0f172a;color:#94a3b8;border-color:#16a34a; }
.flow-ep code { font-size:12px;font-weight:600;color:#166534; }
.dark-mode .flow-ep code { color:#4ade80; }

/* ─── MODAL ──────────────────────────────── */
.modal-overlay { position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;overflow-y:auto; }
.modal-box { width:100%;max-width:780px;border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;max-height:90vh;overflow:hidden; }
.modal-light { background:#fff;color:#1e293b; }
.modal-dark  { background:#1e293b;color:#e2e8f0; }
.modal-header { padding:18px 22px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#166534,#16a34a);color:#fff;border-radius:18px 18px 0 0; }
.modal-title-area { display:flex;align-items:center;gap:10px;font-size:15px;font-weight:700; }
.modal-close { background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:background .2s; }
.modal-close:hover { background:rgba(255,255,255,.35); }
.modal-body { padding:22px;overflow-y:auto;flex:1; }
.form-error-banner { background:#fee2e2;color:#b91c1c;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px; }
.form-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:14px; }
.form-section-title { grid-column:1/-1;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#16a34a;border-bottom:1.5px solid #bbf7d0;padding-bottom:5px;margin-top:6px; }
.dark-mode .form-section-title { color:#4ade80;border-color:#166534; }
.field-group { display:flex;flex-direction:column;gap:4px; }
.field-sm { grid-column:auto; }
.field-wide { grid-column:1/-1; }
.field-group label { font-size:11.5px;font-weight:600;color:#475569; }
.dark-mode .field-group label { color:#94a3b8; }
.field-input { padding:8px 12px;border:1.5px solid #e2e8f0;border-radius:9px;font-size:13px;background:#f8fafc;outline:none;transition:border-color .2s;width:100%;box-sizing:border-box; }
.field-input:focus { border-color:#16a34a;background:#fff; }
.field-input[readonly],.field-input:disabled { background:#f1f5f9;cursor:not-allowed;color:#64748b; }
.dark-mode .field-input { background:#0f172a;border-color:#334155;color:#e2e8f0; }
.dark-mode .field-input:focus { border-color:#16a34a;background:#0f172a; }
.dark-mode .field-input[readonly],.dark-mode .field-input:disabled { background:#1e293b;color:#64748b; }
.field-textarea { resize:vertical;min-height:70px; }
.modal-footer { padding:16px 22px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px; }
.dark-mode .modal-footer { border-color:#334155; }
.modal-fade-enter-active,.modal-fade-leave-active { transition:opacity .25s,transform .25s; }
.modal-fade-enter-from,.modal-fade-leave-to { opacity:0;transform:scale(.96); }
</style>
