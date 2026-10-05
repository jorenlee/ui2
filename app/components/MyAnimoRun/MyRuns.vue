<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
const props = defineProps({
  darkMode: { type: Boolean, default: false },
  rolePermissions: { type: Array, default: () => [] }, // passed by dashboard, accepted to suppress Vue warning
});
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
const { user } = useAuth();
const isFetching = ref(false);
const isSaving = ref(false);
const isSendingChat = ref(false);
const registrations = ref([]);
const noticeModal = ref({ show: false, title: "", message: "", type: "success" });
const editingId = ref(null);
const editForm = ref({});
const chatInput = ref("");
const chatAttachment = ref(null); // { file, previewUrl, name }
const showNotice = (message, title = "Notice", type = "success") => {
  noticeModal.value = { show: true, title, message, type };
};
const SUFFIX_OPTIONS = ["", "Jr.", "Sr.", "II", "III", "IV"];

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
    showNotice(`File exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB).`, 'File Too Large', 'error');
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

const getCategoryBadge = (cat) => {
  if (!cat) return "bg-gray-500";
  const c = cat.toUpperCase();
  if (c.startsWith("10")) return "bg-amber-700";
  if (c.startsWith("20")) return "bg-indigo-700";
  if (c.startsWith("1")) return "bg-emerald-700";
  if (c.startsWith("3")) return "bg-rose-700";
  return "bg-gray-600";
};
const getStatusColor = (st) => {
  if (st === "Confirmed") return "bg-emerald-100 text-emerald-700 border-emerald-300";
  if ((st || "").startsWith("Pending")) return "bg-amber-100 text-amber-700 border-amber-300";
  return "bg-gray-100 text-gray-600 border-gray-300";
};
const hasAdminMessage = (reg) =>
  (reg.communication_logs || []).some((m) => m.sender_type === "admin");

// ── Auto-scroll Chat to Bottom ──────────────────────────────────────────
const chatContainers = ref({});
const setChatContainerRef = (el, id) => {
  if (el) {
    chatContainers.value[id] = el;
  }
};

const scrollToBottom = (regId) => {
  nextTick(() => {
    const el = chatContainers.value[regId];
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
    setTimeout(() => {
      if (el) el.scrollTop = el.scrollHeight;
    }, 120);
  });
};

const scrollAllChatsToBottom = () => {
  nextTick(() => {
    Object.values(chatContainers.value).forEach((el) => {
      if (el) el.scrollTop = el.scrollHeight;
    });
    setTimeout(() => {
      Object.values(chatContainers.value).forEach((el) => {
        if (el) el.scrollTop = el.scrollHeight;
      });
    }, 150);
  });
};

watch(registrations, () => {
  scrollAllChatsToBottom();
}, { deep: true });
const fetchMyRegistrations = async () => {
  const email = user.value?.email;
  if (!email) return;
  isFetching.value = true;
  try {
    // Primary endpoint (requires server deployment of new views)
    const res = await $fetch(
      `${endpoint.value}/api/animorun/my-registration/?email=${encodeURIComponent(email)}`
    );
    registrations.value = res.registrations || [];
  } catch (primaryErr) {
    // Fallback: if /my-registration/ returns 404 (not yet deployed), use the
    // existing /list/ endpoint and filter by email client-side.
    const status = primaryErr?.response?.status || primaryErr?.status;
    if (status === 404 || status === 500) {
      try {
        const listRes = await $fetch(`${endpoint.value}/api/animorun/list/`);
        const emailLower = email.trim().toLowerCase();
        const all = Array.isArray(listRes) ? listRes : (listRes.registrations || listRes.results || []);
        const mine = all.filter(
          (r) => (r.contact_email || r.email || "").trim().toLowerCase() === emailLower
        );
        // Inject edit_enabled: true if there are admin messages
        registrations.value = mine.map((r) => ({
          ...r,
          communication_logs: r.communication_logs || [],
          edit_enabled: (r.communication_logs || []).some((m) => m.sender_type === "admin"),
        }));
      } catch {
        registrations.value = [];
      }
    } else {
      // Network error or other — silent, just show empty
      registrations.value = [];
    }
  } finally {
    isFetching.value = false;
    scrollAllChatsToBottom();
  }
};
const openEdit = (reg) => {
  editingId.value = reg.id;
  editForm.value = {
    firstname: reg.firstname || "", middlename: reg.middlename || "",
    lastname: reg.lastname || "", suffix: reg.suffix || "",
    gender: reg.gender || "", birthdate: reg.birthdate || "",
    contact_number: reg.contact_number || "", contact_address: reg.contact_address || "",
    lsu_id_number: reg.lsu_id_number || "", college_course: reg.college_course || "",
    college_year: reg.college_year || "", partner_office: reg.partner_office || "",
    alumni_batch: reg.alumni_batch || "", organization: reg.organization || "",
    pet_name: reg.pet_name || "", pet_type: reg.pet_type || "",
  };
};
const cancelEdit = () => { editingId.value = null; editForm.value = {}; };
const saveEdit = async (reg) => {
  if (isSaving.value) return;
  isSaving.value = true;
  try {
    let res;
    try {
      // Primary: use the dedicated self-edit endpoint
      res = await $fetch(`${endpoint.value}/api/animorun/${reg.id}/self-edit/`, {
        method: "PUT",
        body: { contact_email: user.value?.email, ...editForm.value },
      });
    } catch (selfEditErr) {
      const st = selfEditErr?.response?.status || selfEditErr?.status;
      if (st === 404) {
        // Fallback: use the general /edit/ endpoint (already deployed)
        res = await $fetch(`${endpoint.value}/api/animorun/${reg.id}/edit/`, {
          method: "PUT",
          body: { ...editForm.value },
        });
        // Normalise response shape
        if (!res?.status) res = { status: "ok", message: "Details updated successfully." };
      } else {
        throw selfEditErr;
      }
    }
    if (res.status === "ok" || res.id) {
      showNotice(res.message || "Details updated successfully.", "Saved!", "success");
      cancelEdit();
      await fetchMyRegistrations();
    } else if (res.status === "no_change") {
      showNotice("No changes were detected.", "Nothing Changed", "success");
    }
  } catch (e) {
    showNotice(e?.data?.error || e?.data?.message || "Failed to save changes.", "Save Failed", "error");
  } finally {
    isSaving.value = false;
  }
};
const sendMessage = async (reg) => {
  const text = chatInput.value.trim();
  const attachment = chatAttachment.value;
  if ((!text && !attachment) || isSendingChat.value) return;
  isSendingChat.value = true;
  try {
    let attachmentUrl = '';
    let attachmentName = '';
    if (attachment?.file) {
      const formData = new FormData();
      formData.append('file', attachment.file);
      const uploadRes = await $fetch(`${endpoint.value}/api/animorun/upload/`, {
        method: 'POST',
        body: formData,
      });
      attachmentUrl = uploadRes.url || '';
      attachmentName = attachment.name || 'Attachment';
    }
    const senderName = `${reg.firstname || ""} ${reg.lastname || ""}`.trim() || user.value?.email;
    const res = await $fetch(`${endpoint.value}/api/animorun/chat/`, {
      method: "POST",
      body: {
        contact_email: user.value?.email,
        run_number: reg.run_number,
        sender_name: senderName,
        message: text,
        ...(attachmentUrl ? { attachment_url: attachmentUrl, attachment_name: attachmentName } : {}),
      },
    });
    const idx = registrations.value.findIndex((r) => r.id === reg.id);
    if (idx !== -1) registrations.value[idx].communication_logs = res.messages || [];
    chatInput.value = "";
    removeChatAttachment();
    scrollToBottom(reg.id);
  } catch (e) {
    showNotice("Could not send message.", "Send Failed", "error");
  } finally {
    isSendingChat.value = false;
  }
};

onMounted(() => fetchMyRegistrations());
</script>
<template>
  <div class="min-h-screen px-4 py-8 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-8 flex items-center gap-3 flex-wrap">
      <div class="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-lg">
        <i class="fas fa-running"></i>
      </div>
      <div class="flex-1 min-w-0">
        <h1 class="text-xl font-black" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">My Animo Run</h1>
        <p class="text-xs truncate" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ user?.email }}</p>
      </div>
      <button type="button" @click="fetchMyRegistrations" class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm">
        <i :class="['fas', isFetching ? 'fa-spinner fa-spin' : 'fa-sync-alt']"></i> Refresh
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isFetching && !registrations.length" class="space-y-4 animate-pulse">
      <div v-for="n in 2" :key="n" :class="['rounded-3xl border p-6 space-y-3', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200']">
        <div :class="['h-4 rounded w-1/3', darkMode ? 'bg-gray-700' : 'bg-slate-200']"></div>
        <div :class="['h-3 rounded w-2/3', darkMode ? 'bg-gray-700' : 'bg-slate-100']"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!isFetching && !registrations.length" class="flex flex-col items-center justify-center py-20 text-center">
      <div :class="['w-20 h-20 rounded-3xl flex items-center justify-center mb-4', darkMode ? 'bg-gray-800' : 'bg-gray-100']">
        <i class="fas fa-running text-4xl text-gray-300"></i>
      </div>
      <p class="font-bold text-lg" :class="darkMode ? 'text-gray-300' : 'text-gray-600'">No Registration Found</p>
      <p class="text-sm mt-1" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
        No Animo Run registration is linked to <strong>{{ user?.email }}</strong>.<br/>
        Please ensure you used this email when registering.
      </p>
    </div>

    <!-- Registration Cards -->
    <div v-for="reg in registrations" :key="reg.id" class="mb-8">
      <div :class="['rounded-3xl border shadow-sm overflow-hidden', darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200']">

        <!-- Card Header -->
        <div class="flex items-center gap-3 px-6 py-4 border-b flex-wrap" :class="darkMode ? 'border-gray-700' : 'border-slate-100'">
          <span :class="['px-3 py-1 rounded-lg text-white text-xs font-black tracking-wide shrink-0', getCategoryBadge(reg.run_category)]">
            {{ reg.run_number || ('AR-' + reg.id) }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="font-black text-sm" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">
              {{ reg.run_category }} &nbsp;|&nbsp; ₱{{ reg.grand_total_payment || reg.grand_total || '—' }}
            </p>
            <p class="text-[11px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
              Registered: {{ reg.created_at_formatted || (reg.created_at || '').split('T')[0] }}
            </p>
          </div>
          <span :class="['px-2.5 py-0.5 rounded-lg border text-xs font-bold shrink-0', getStatusColor(reg.payment_status)]">
            {{ reg.payment_status }}
          </span>
        </div>

        <!-- Admin Message Banner -->
        <div v-if="hasAdminMessage(reg)" :class="['px-6 py-3 border-b flex items-start gap-2.5 text-xs', darkMode ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800']">
          <i class="fas fa-exclamation-circle text-base shrink-0 mt-0.5"></i>
          <div>
            <strong>The admin has a message for you.</strong>&nbsp;
            Please review the communication below. You may also update your details using <span class="underline font-bold">Edit My Details</span>.
          </div>
        </div>

        <!-- VIEW MODE -->
        <template v-if="editingId !== reg.id">
          <div class="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 text-xs">
            <div class="flex flex-col gap-0.5">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Full Name</span>
              <span class="font-semibold uppercase" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ [reg.firstname, reg.middlename, reg.lastname, reg.suffix].filter(Boolean).join(' ') }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Gender & Birthdate</span>
              <span class="font-semibold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ reg.gender || '—' }} • {{ reg.birthdate || '—' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Contact Number</span>
              <span class="font-semibold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ reg.contact_number || '—' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Email Address</span>
              <span class="font-semibold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ reg.contact_email }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Classification</span>
              <span class="font-semibold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ reg.participant_type || '—' }} {{ reg.lsu_id_number ? '(' + reg.lsu_id_number + ')' : '' }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">T-Shirt Size</span>
              <span class="font-semibold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ reg.tshirt_size || '—' }}</span>
            </div>
            <div class="flex flex-col gap-0.5 sm:col-span-2">
              <span class="font-bold uppercase text-[10px]" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Address</span>
              <span class="font-semibold" :class="darkMode ? 'text-gray-100' : 'text-gray-800'">{{ reg.contact_address || '—' }}</span>
            </div>
          </div>
          <!-- Edit Button — only when admin has enabled editing -->
          <div v-if="reg.edit_enabled" class="px-6 pb-5">
            <button type="button" @click="openEdit(reg)" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm">
              <i class="fas fa-pen"></i> Edit My Details
            </button>
          </div>
        </template>

        <!-- EDIT MODE -->
        <template v-else>
          <div :class="['px-6 py-3 border-b text-[11px] flex items-center gap-1.5', darkMode ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700']">
            <i class="fas fa-pen shrink-0"></i>
            Editing personal details only. Race category, bib, payment &amp; t-shirt size are managed by the admin.
          </div>
          <div class="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">First Name *</label>
              <input v-model="editForm.firstname" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Middle Name</label>
              <input v-model="editForm.middlename" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Last Name *</label>
              <input v-model="editForm.lastname" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Suffix</label>
              <select v-model="editForm.suffix" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'">
                <option v-for="s in SUFFIX_OPTIONS" :key="s" :value="s">{{ s || 'None' }}</option>
              </select>
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Gender</label>
              <select v-model="editForm.gender" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'">
                <option value="">— Select —</option>
                <option>Male</option><option>Female</option><option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Date of Birth</label>
              <input type="date" v-model="editForm.birthdate" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Contact Number</label>
              <input v-model="editForm.contact_number" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
            <div>
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">LSU ID Number</label>
              <input v-model="editForm.lsu_id_number" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
            <div class="sm:col-span-2">
              <label :class="['block font-bold text-[10px] uppercase mb-1', darkMode ? 'text-gray-400' : 'text-gray-500']">Address</label>
              <input v-model="editForm.contact_address" class="w-full rounded-xl border px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100' : 'bg-white border-gray-200'" />
            </div>
          </div>
          <div class="px-6 pb-5 flex items-center gap-2">
            <button type="button" @click="saveEdit(reg)" :disabled="isSaving" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm">
              <i :class="['fas', isSaving ? 'fa-spinner fa-spin' : 'fa-save']"></i>
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" @click="cancelEdit" class="px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer" :class="darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-100'">Cancel</button>
          </div>
        </template>

        <!-- Communication Chat -->
        <div class="px-6 pb-6 pt-3 border-t" :class="darkMode ? 'border-gray-700' : 'border-slate-100'">
          <p class="text-[10px] font-black uppercase tracking-wide mb-3 flex items-center gap-1.5" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
            <i class="fas fa-comments text-emerald-600"></i> Communication with Admin
          </p>
          <div :ref="el => setChatContainerRef(el, reg.id)" class="space-y-2.5 max-h-60 overflow-y-auto mb-3 pr-0.5">
            <div v-if="!(reg.communication_logs || []).length" class="flex flex-col items-center justify-center py-8 text-gray-400 text-center">
              <i class="fas fa-comment-slash text-3xl opacity-20 mb-2"></i>
              <p class="text-xs">No messages yet</p>
            </div>
            <div v-for="msg in (reg.communication_logs || [])" :key="msg.message_id || msg.timestamp" :class="['flex', msg.sender_type === 'admin' ? 'justify-start' : 'justify-end']">
              <div :class="['max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm', msg.sender_type === 'admin' ? 'bg-emerald-600 text-white rounded-tl-sm' : darkMode ? 'bg-gray-700 text-gray-100 rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tr-sm']">
                <p class="font-semibold text-[10px] mb-0.5 opacity-70">{{ msg.sender }}</p>
                <p v-if="msg.message" class="whitespace-pre-wrap break-words">{{ msg.message }}</p>
                <!-- Attachment -->
                <div v-if="msg.attachment_url" class="mt-1.5">
                  <a v-if="isPdfAttachment(msg.attachment_url)" :href="msg.attachment_url" target="_blank"
                    :class="['flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-bold transition', msg.sender_type === 'admin' ? 'bg-white/20 hover:bg-white/30 text-white' : darkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700']">
                    <i class="fas fa-file-pdf"></i>
                    <span class="truncate max-w-[140px]">{{ msg.attachment_name || 'View PDF' }}</span>
                    <i class="fas fa-external-link-alt text-[9px] opacity-60 ml-auto"></i>
                  </a>
                  <a v-else :href="msg.attachment_url" target="_blank" class="block">
                    <img :src="msg.attachment_url" :alt="msg.attachment_name || 'Image'"
                      @load="scrollToBottom(reg.id)"
                      class="mt-1 max-w-[180px] max-h-[150px] rounded-xl object-cover border border-white/20 shadow-sm cursor-pointer hover:opacity-90 transition" />
                  </a>
                </div>
                <p class="text-[9px] mt-1 opacity-50 text-right">{{ msg.timestamp }}</p>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <!-- Attachment Preview -->
            <div v-if="chatAttachment" class="flex items-center gap-2 p-2 rounded-xl border bg-slate-50 dark:bg-gray-800/60 border-emerald-200 dark:border-emerald-800">
              <img v-if="chatAttachment.previewUrl" :src="chatAttachment.previewUrl" class="w-10 h-10 rounded-lg object-cover border border-emerald-200 shrink-0" alt="preview" />
              <div v-else class="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0">
                <i class="fas fa-file-pdf text-base"></i>
              </div>
              <span class="flex-1 text-[10px] text-gray-600 dark:text-gray-300 truncate">{{ chatAttachment.name }}</span>
              <button type="button" @click="removeChatAttachment" class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 hover:bg-rose-100 hover:text-rose-500 flex items-center justify-center transition cursor-pointer">
                <i class="fas fa-times text-[9px]"></i>
              </button>
            </div>
            <div class="flex gap-2">
              <textarea v-model="chatInput" rows="2" :disabled="isSendingChat" @keydown.enter.ctrl="sendMessage(reg)" placeholder="Type your reply... (Ctrl+Enter to send)" class="flex-1 text-xs rounded-xl border px-3 py-2 resize-none focus:ring-2 focus:ring-emerald-400 focus:outline-none" :class="darkMode ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800'"></textarea>
              <div class="flex flex-col gap-1.5">
                <!-- Paperclip button -->
                <label :class="['flex items-center justify-center rounded-xl border cursor-pointer transition w-10 h-12 shrink-0', chatAttachment ? 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-300 dark:border-emerald-700 text-emerald-600' : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600']" title="Attach image or PDF (max 5 MB)">
                  <i class="fas fa-paperclip text-sm"></i>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,application/pdf" class="hidden" @change="handleChatAttachmentChange" :disabled="isSendingChat" />
                </label>
                
              </div>
            </div>
            <button type="button" @click="sendMessage(reg)" :disabled="isSendingChat || (!chatInput.trim() && !chatAttachment)" class="flex w-full p-3 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition cursor-pointer flex-1 uppercase font-bold text-sm gap-x-3">
                  <i :class="['fas', isSendingChat ? 'fa-spinner fa-spin' : 'fa-paper-plane']"></i> Submit
                </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Notice Modal -->
  <div v-if="noticeModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div :class="['w-full max-w-sm rounded-3xl p-6 shadow-2xl border', darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-slate-200 text-gray-800']">
      <div class="flex items-center gap-2 mb-3">
        <i :class="['fas text-xl', noticeModal.type === 'success' ? 'fa-check-circle text-emerald-500' : noticeModal.type === 'error' ? 'fa-times-circle text-rose-500' : 'fa-exclamation-circle text-amber-500']"></i>
        <h3 class="font-black text-base">{{ noticeModal.title }}</h3>
      </div>
      <p class="text-sm whitespace-pre-wrap leading-relaxed mb-4">{{ noticeModal.message }}</p>
      <button type="button" @click="noticeModal.show = false" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition cursor-pointer">OK</button>
    </div>
  </div>
</template>
