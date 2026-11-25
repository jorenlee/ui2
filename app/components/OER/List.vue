<script setup>
import { ref, computed, onMounted, defineAsyncComponent, watch } from "vue";
import moment from "moment";

const emit = defineEmits(["change-view"]);
const props = defineProps({
    rolePermissions: { type: Array, default: () => [] },
});

// Dynamic import of Form component for fallback/in-place tab switching
const OERForm = defineAsyncComponent(() => import("./Form.vue"));

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
const { user } = useAuth();
const localRolePermissions = ref([]);
const currentEmail = computed(() => (user.value?.email || '').trim().toLowerCase());
const canManageResources = computed(() => {
    if (!currentEmail.value) return false;
    const records = props.rolePermissions.length ? props.rolePermissions : localRolePermissions.value;
    return records.some(record =>
        (record.email || '').trim().toLowerCase() === currentEmail.value
        && Array.isArray(record.role_filter_permissions)
        && record.role_filter_permissions.some(role => typeof role === 'string'
            && ['superadmin', 'oeradmin'].includes(role.trim().toLowerCase().replace(/\s+/g, '')))
    );
});
const tableColumnCount = computed(() => canManageResources.value ? 10 : 8);

const fetchRolePermissions = async () => {
    localRolePermissions.value = [];
    const email = currentEmail.value;
    if (!email || props.rolePermissions.length) return;
    try {
        const records = await $fetch(`${endpoint.value}/api/cits/role-permissions/list/?email=${encodeURIComponent(email)}`);
        if (currentEmail.value === email) localRolePermissions.value = Array.isArray(records) ? records : [];
    } catch {
        // Actions stay hidden when role permissions cannot be verified.
    }
};
watch(currentEmail, fetchRolePermissions);

// Navigation Tabs state
const activeTab = ref("list");

const switchView = (target) => {
    if (target === "form") {
        emit("change-view", "ViewOERForm");
        activeTab.value = "form";
    } else {
        emit("change-view", "ViewOERList");
        activeTab.value = "list";
    }
};

// State
const oerList = ref([]);
const isLoading = ref(false);
const fetchError = ref(null);
const searchQuery = ref("");
const selectedTypeFilter = ref("All");
const selectedCollegeFilter = ref("All");
const selectedStatusFilter = ref("All");

// Modal State
const selectedResource = ref(null);
const showDetailModal = ref(false);

const toast = ref({
    show: false,
    message: '',
    title: '',
    type: 'info',
    timeoutId: null,
});

const showToast = (message, type = 'info', title = '') => {
    if (toast.value.timeoutId) clearTimeout(toast.value.timeoutId);
    const defaultTitle =
        type === 'error' ? 'Error' :
        type === 'success' ? 'Success' :
        type === 'warning' ? 'Warning' : 'Notice';
    toast.value = {
        show: true,
        message,
        title: title || defaultTitle,
        type,
        timeoutId: setTimeout(() => { toast.value.show = false; }, 4000),
    };
};

const closeToast = () => {
    if (toast.value.timeoutId) clearTimeout(toast.value.timeoutId);
    toast.value.show = false;
};

// â”€â”€â”€ CONFIRM MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const confirmModal = ref({
    show: false,
    title: 'Confirm Action',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    resolve: null,
});

const showConfirm = (message, { title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' } = {}) => {
    return new Promise((resolve) => {
        confirmModal.value = { show: true, title, message, confirmText, cancelText, type, resolve };
    });
};

const handleConfirmOk = () => {
    if (confirmModal.value.resolve) confirmModal.value.resolve(true);
    confirmModal.value.show = false;
};

const handleConfirmCancel = () => {
    if (confirmModal.value.resolve) confirmModal.value.resolve(false);
    confirmModal.value.show = false;
};

// â”€â”€â”€ SELECT / BULK DELETE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const selectedIds = ref([]);
const isDeleting = ref(false);

const allSelected = computed(() =>
    filteredList.value.length > 0 &&
    filteredList.value.every(item => selectedIds.value.includes(item.id))
);

const toggleSelectAll = () => {
    if (!canManageResources.value) return;
    if (allSelected.value) {
        selectedIds.value = selectedIds.value.filter(id => !filteredList.value.map(i => i.id).includes(id));
    } else {
        filteredList.value.forEach(item => {
            if (!selectedIds.value.includes(item.id)) selectedIds.value.push(item.id);
        });
    }
};

const deleteSelected = async () => {
    if (!canManageResources.value || !selectedIds.value.length) return;
    const count = selectedIds.value.length;
    const confirmed = await showConfirm(
        `Are you sure you want to permanently delete ${count} selected resource${count > 1 ? 's' : ''}? This action cannot be undone.`,
        { title: `Delete ${count} Resource${count > 1 ? 's' : ''}`, confirmText: `Delete ${count}`, type: 'danger' }
    );
    if (!confirmed || !canManageResources.value) return;
    isDeleting.value = true;
    try {
        await $fetch(`${endpoint.value}/api/oer/bulk-delete/`, {
            method: 'POST',
            body: { ids: selectedIds.value },
        });
        showToast(`${count} resource${count > 1 ? 's' : ''} deleted successfully.`, 'success');
        selectedIds.value = [];
        await fetchOERList();
    } catch {
        showToast('Bulk delete failed. Please try again.', 'error');
    } finally {
        isDeleting.value = false;
    }
};

const deleteSingle = async (item) => {
    if (!canManageResources.value) return;
    const confirmed = await showConfirm(
        `Are you sure you want to permanently delete "${item.title || 'this resource'}"? This action cannot be undone.`,
        { title: 'Delete Resource', confirmText: 'Delete', type: 'danger' }
    );
    if (!confirmed || !canManageResources.value) return;
    isDeleting.value = true;
    try {
        await $fetch(`${endpoint.value}/api/oer/${item.id}/delete/`, { method: 'DELETE' });
        showToast('Resource deleted successfully.', 'success');
        selectedIds.value = selectedIds.value.filter(id => id !== item.id);
        await fetchOERList();
    } catch {
        showToast('Failed to delete resource. Please try again.', 'error');
    } finally {
        isDeleting.value = false;
    }
};

// Fetch OER submissions
const fetchOERList = async () => {
    isLoading.value = true;
    fetchError.value = null;
    try {
        const data = await $fetch(`${endpoint.value}/api/oer/list/`);
        oerList.value = Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("Failed to load OER list:", err);
        fetchError.value = "Failed to load OER submissions. Please check your network connection.";
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchRolePermissions();
    fetchOERList();
});

watch(canManageResources, allowed => {
    if (allowed) return;
    selectedIds.value = [];
    showDetailModal.value = false;
    selectedResource.value = null;
    handleConfirmCancel();
});

// Colleges present in list
const colleges = computed(() => {
    const set = new Set();
    oerList.value.forEach((item) => {
        if (item.college_or_unit) set.add(item.college_or_unit);
    });
    return Array.from(set).sort();
});

// Statistics
const stats = computed(() => {
    const total = oerList.value.length;
    let documents = 0;
    let googleDocs = 0;
    let videos = 0;
    let approved = 0;

    oerList.value.forEach((item) => {
        const type = (item.type_of_entry || "").toLowerCase();
        if (type.includes("google")) googleDocs++;
        else if (type.includes("video")) videos++;
        else documents++;

        const latestStatus = getLatestStatus(item).toLowerCase();
        if (latestStatus.includes("approved") || latestStatus.includes("published")) {
            approved++;
        }
    });

    return { total, documents, googleDocs, videos, approved };
});

// Helper: Get latest status from logs
const getLatestStatus = (item) => {
    if (Array.isArray(item.logs) && item.logs.length > 0) {
        const latest = item.logs[item.logs.length - 1];
        return latest.status_update || "Submitted";
    }
    return "Submitted";
};

// Helper: Get status badge class
const getStatusBadgeClass = (statusText) => {
    const s = (statusText || "").toLowerCase();
    if (s.includes("approved") || s.includes("published")) {
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
    }
    if (s.includes("review") || s.includes("checking")) {
        return "bg-amber-100 text-amber-800 border-amber-300";
    }
    if (s.includes("revision") || s.includes("reject")) {
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
    return "bg-blue-100 text-blue-800 border-blue-300";
};

// Helper: Get entry type badge class
const getTypeBadgeClass = (typeText) => {
    const t = (typeText || "").toLowerCase();
    if (t.includes("google")) {
        return "bg-sky-100 text-sky-800 border-sky-300";
    }
    if (t.includes("video")) {
        return "bg-purple-100 text-purple-800 border-purple-300";
    }
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
};

// Helper: Format Date
const formatDate = (dateStr) => {
    if (!dateStr) return "â€”";
    return moment(dateStr).format("MMM DD, YYYY");
};

// ─── URL CLEANERS (strips AWS signed params after extension) ───────────
// Identical pattern to AnimoRunList.vue
const cleanURL = (url, fallbackName = '') => {
    if (!url) return '';
    if (typeof url === 'string' && (url.startsWith('data:') || url.startsWith('blob:'))) return url;
    let clean = String(url).trim().split(/[?#]/)[0];
    // Repair double-extension filenames (e.g. file.PNG.jpg → keep both)
    if (fallbackName && typeof fallbackName === 'string') {
        const doubleExtMatch = fallbackName.match(/\.(?:png|jpe?g|pdf)\.(?:jpe?g|png|pdf)$/i);
        if (doubleExtMatch) {
            const lastExt = fallbackName.slice(fallbackName.lastIndexOf('.'));
            if (!clean.toLowerCase().endsWith(lastExt.toLowerCase())) clean += lastExt;
        }
    }
    // Greedily keep path up to and including the last supported extension
    const match = clean.match(/^(.*\.(?:jpg|jpeg|png|gif|webp|bmp|svg|pdf|heic|heif))/i);
    return match ? match[1] : clean;
};

// Image-only cleaner (strips query params, keeps only image extension)
const getCleanUrl = (url, fallbackName = '') => {
    if (!url) return '';
    if (typeof url === 'string' && (url.startsWith('data:') || url.startsWith('blob:'))) return url;
    const clean = cleanURL(url, fallbackName);
    const match = clean.match(/^(.*\.(?:jpe?g|png|webp|gif|heic|heif|bmp|svg))/i);
    return match ? match[1] : clean;
};

// Primary link for a resource
const getPrimaryResourceLink = (item) => {
    if (item.type_of_entry === "Google Doc" && item.google_doc_link) {
        return {
            name: "Open Google Doc",
            url: item.google_doc_link,
            icon: "fab fa-google-drive",
            isExternal: true,
        };
    }
    if (item.type_of_entry === "Video" && item.video_links) {
        return {
            name: "Watch Video",
            url: item.video_links,
            icon: "fab fa-youtube",
            isExternal: true,
        };
    }
    if (Array.isArray(item.resource_files) && item.resource_files.length > 0) {
        const first = item.resource_files[0];
        if (first?.url && first.url !== "#") {
            const isGDoc = (first.url || "").includes("docs.google.com");
            const cleanedUrl = cleanURL(first.url, first.name);
            return {
                name: first.name || "Download / View File",
                url: cleanedUrl,
                icon: isGDoc ? "fab fa-google-drive" : "fa fa-file-download",
                isExternal: true,
            };
        }
    }
    if (item.google_doc_link) {
        return {
            name: "Open Google Doc",
            url: item.google_doc_link,
            icon: "fab fa-google-drive",
            isExternal: true,
        };
    }
    if (item.video_links) {
        return {
            name: "Watch Video",
            url: item.video_links,
            icon: "fab fa-youtube",
            isExternal: true,
        };
    }
    return null;
};

// â”€â”€â”€ SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const sortKey = ref('');
const sortDir = ref('asc'); // 'asc' | 'desc'

const setSort = (key) => {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortDir.value = 'asc';
    }
};

const sortIcon = (key) => {
    if (sortKey.value !== key) return 'fa fa-sort text-white/40';
    return sortDir.value === 'asc' ? 'fa fa-sort-up text-white' : 'fa fa-sort-down text-white';
};

// Filtered list
const filteredList = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();

    let list = oerList.value.filter((item) => {
        // Search filter
        if (query) {
            const matchTitle = (item.title || "").toLowerCase().includes(query);
            const matchContributor = (item.contributor_name || "").toLowerCase().includes(query);
            const matchEmail = (item.contributor_email || "").toLowerCase().includes(query);
            const matchTracking = (item.tracking_id || "").toLowerCase().includes(query);
            const matchCollege = (item.college_or_unit || "").toLowerCase().includes(query);
            const matchKeywords = (item.keywords || "").toLowerCase().includes(query);
            const matchSubject = (item.subject_areas || "").toLowerCase().includes(query);

            if (
                !matchTitle &&
                !matchContributor &&
                !matchEmail &&
                !matchTracking &&
                !matchCollege &&
                !matchKeywords &&
                !matchSubject
            ) {
                return false;
            }
        }

        // Type filter
        if (selectedTypeFilter.value !== "All") {
            const itemType = item.type_of_entry || "Document";
            if (itemType !== selectedTypeFilter.value) return false;
        }

        // College filter
        if (selectedCollegeFilter.value !== "All") {
            if (item.college_or_unit !== selectedCollegeFilter.value) return false;
        }

        // Status filter
        if (selectedStatusFilter.value !== "All") {
            const status = getLatestStatus(item);
            if (!status.toLowerCase().includes(selectedStatusFilter.value.toLowerCase())) {
                return false;
            }
        }

        return true;
    });

    // Sort
    if (sortKey.value) {
        list = [...list].sort((a, b) => {
            let valA = '';
            let valB = '';
            if (sortKey.value === 'tracking_id') {
                valA = a.tracking_id || '';
                valB = b.tracking_id || '';
            } else if (sortKey.value === 'title') {
                valA = a.title || '';
                valB = b.title || '';
            } else if (sortKey.value === 'contributor') {
                valA = a.contributor_name || '';
                valB = b.contributor_name || '';
            } else if (sortKey.value === 'college') {
                valA = a.college_or_unit || '';
                valB = b.college_or_unit || '';
            } else if (sortKey.value === 'type') {
                valA = a.type_of_entry || '';
                valB = b.type_of_entry || '';
            } else if (sortKey.value === 'status') {
                valA = getLatestStatus(a);
                valB = getLatestStatus(b);
            } else if (sortKey.value === 'date') {
                valA = a.created_at || '';
                valB = b.created_at || '';
            }
            const cmp = valA.toString().localeCompare(valB.toString(), undefined, { numeric: true, sensitivity: 'base' });
            return sortDir.value === 'asc' ? cmp : -cmp;
        });
    }

    return list;
});

// Modal view
const openDetail = (item) => {
    if (!canManageResources.value) return;
    selectedResource.value = item;
    showDetailModal.value = true;
};

const closeDetail = () => {
    showDetailModal.value = false;
    selectedResource.value = null;
};
</script>

<template>
    <!-- Render Form directly if tab switched locally -->
    <div v-if="activeTab === 'form'">
        <OERForm @change-view="switchView" />
    </div>

    <div v-else class="font-montserrat p-4 space-y-6">
        <!-- Top Navigation Tabs (List and Form easy navigation) -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div class="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200 shadow-2xs">
                <button
                    type="button"
                    @click="switchView('form')"
                    :class="activeTab === 'form' ? 'bg-green-800 text-white shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900 font-medium'"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                    <i class="fa fa-pen-to-square"></i>
                    <span>OER Submission Form</span>
                </button>
                <button
                    type="button"
                    @click="switchView('list')"
                    :class="activeTab === 'list' ? 'bg-green-800 text-white shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900 font-medium'"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                    <i class="fa fa-table-list"></i>
                    <span>OER Submissions List</span>
                    <span v-if="oerList.length > 0" class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                        {{ oerList.length }}
                    </span>
                </button>
            </div>

            <div class="flex items-center gap-2">
                <!-- Bulk Delete Button (visible when items selected) -->
                <transition name="fade-slide">
                    <button
                        v-if="canManageResources && selectedIds.length > 0"
                        type="button"
                        @click="deleteSelected"
                        :disabled="isDeleting"
                        class="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg border border-red-700 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                        title="Delete selected resources"
                    >
                        <i class="fa fa-trash-alt" :class="{ 'fa-spin': isDeleting }"></i>
                        <span>Delete Selected ({{ selectedIds.length }})</span>
                    </button>
                </transition>
                <button
                    type="button"
                    @click="fetchOERList"
                    :disabled="isLoading"
                    class="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-300 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                    title="Refresh list"
                >
                    <i class="fa fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                    <span>Refresh</span>
                </button>
            </div>
        </div>

        <!-- Top Bar / Title -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
            <div>
                <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-700 to-emerald-800 flex items-center justify-center text-white shadow-md">
                        <i class="fa fa-book-open text-lg"></i>
                    </div>
                    <div>
                        <h1 class="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">
                            Metau: Educational Open Resources (OER)
                        </h1>
                        <p class="text-xs sm:text-sm text-gray-500">
                            Central repository of open curriculum materials, Google Docs, and educational videos.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Metric Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-green-50 text-green-700 flex items-center justify-center text-base">
                    <i class="fa fa-layer-group"></i>
                </div>
                <div>
                    <div class="text-xl font-black text-gray-800">{{ stats.total }}</div>
                    <div class="text-xs text-gray-500 font-medium">Total Entries</div>
                </div>
            </div>

            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-base">
                    <i class="fa fa-file-alt"></i>
                </div>
                <div>
                    <div class="text-xl font-black text-gray-800">{{ stats.documents }}</div>
                    <div class="text-xs text-gray-500 font-medium">Documents (.doc/pdf)</div>
                </div>
            </div>

            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center text-base">
                    <i class="fab fa-google-drive"></i>
                </div>
                <div>
                    <div class="text-xl font-black text-gray-800">{{ stats.googleDocs }}</div>
                    <div class="text-xs text-gray-500 font-medium">Google Docs</div>
                </div>
            </div>

            <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center text-base">
                    <i class="fa fa-video"></i>
                </div>
                <div>
                    <div class="text-xl font-black text-gray-800">{{ stats.videos }}</div>
                    <div class="text-xs text-gray-500 font-medium">Videos</div>
                </div>
            </div>

            <div class="col-span-2 lg:col-span-1 bg-white rounded-xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center text-base">
                    <i class="fa fa-check-circle"></i>
                </div>
                <div>
                    <div class="text-xl font-black text-gray-800">{{ stats.approved }}</div>
                    <div class="text-xs text-gray-500 font-medium">Approved / Active</div>
                </div>
            </div>
        </div>

        <!-- Filters & Search Toolbar -->
        <div class="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
                <!-- Search input -->
                <div class="md:col-span-6 relative">
                    <i class="fa fa-search absolute left-3.5 top-3 text-gray-400 text-xs"></i>
                    <input
                        type="text"
                        v-model="searchQuery"
                        placeholder="Search title, contributor, tracking ID, college, keyword..."
                        class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-gray-50/50"
                    />
                    <button
                        v-if="searchQuery"
                        @click="searchQuery = ''"
                        class="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs"
                    >
                        <i class="fa fa-times"></i>
                    </button>
                </div>

                <!-- Type of Entry filter -->
                <div class="md:col-span-2">
                    <select
                        v-model="selectedTypeFilter"
                        class="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                    >
                        <option value="All">All Types</option>
                        <option value="Document">Document (.doc/pdf)</option>
                        <option value="Google Doc">Google Doc</option>
                        <option value="Video">Video</option>
                    </select>
                </div>

                <!-- College filter -->
                <div class="md:col-span-2">
                    <select
                        v-model="selectedCollegeFilter"
                        class="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white truncate"
                    >
                        <option value="All">All Colleges / Units</option>
                        <option v-for="c in colleges" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>

                <!-- Status filter -->
                <div class="md:col-span-2">
                    <select
                        v-model="selectedStatusFilter"
                        class="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Approved">Approved / Published</option>
                        <option value="Revision">Revision Requested</option>
                    </select>
                </div>
            </div>

            <!-- Active filter chips -->
            <div
                v-if="searchQuery || selectedTypeFilter !== 'All' || selectedCollegeFilter !== 'All' || selectedStatusFilter !== 'All'"
                class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600"
            >
                <span class="font-semibold text-gray-500">Active filters:</span>
                <span v-if="searchQuery" class="px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200 flex items-center gap-1">
                    Query: "{{ searchQuery }}"
                    <button @click="searchQuery = ''" class="hover:text-green-950 font-bold">&times;</button>
                </span>
                <span v-if="selectedTypeFilter !== 'All'" class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                    Type: {{ selectedTypeFilter }}
                    <button @click="selectedTypeFilter = 'All'" class="hover:text-blue-950 font-bold">&times;</button>
                </span>
                <span v-if="selectedCollegeFilter !== 'All'" class="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                    College: {{ selectedCollegeFilter }}
                    <button @click="selectedCollegeFilter = 'All'" class="hover:text-purple-950 font-bold">&times;</button>
                </span>
                <span v-if="selectedStatusFilter !== 'All'" class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    Status: {{ selectedStatusFilter }}
                    <button @click="selectedStatusFilter = 'All'" class="hover:text-amber-950 font-bold">&times;</button>
                </span>
                <button
                    @click="
                        searchQuery = '';
                        selectedTypeFilter = 'All';
                        selectedCollegeFilter = 'All';
                        selectedStatusFilter = 'All';
                    "
                    class="text-xs text-red-600 hover:underline font-semibold ml-auto"
                >
                    Reset all
                </button>
            </div>
        </div>

        <!-- Error Alert -->
        <div v-if="fetchError" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fa fa-exclamation-circle text-red-600 text-sm"></i>
                <span>{{ fetchError }}</span>
            </div>
            <button @click="fetchOERList" class="font-bold underline hover:text-red-950">Retry</button>
        </div>

        <!-- Table Container -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs text-gray-700">
                    <thead class="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white uppercase text-[11px] font-bold tracking-wider">
                        <tr>
                            <!-- Select All -->
                            <th v-if="canManageResources" class="py-3 px-3 w-12 text-center">
                                <input
                                    type="checkbox"
                                    :checked="allSelected"
                                    @change="toggleSelectAll"
                                    class="!m-0 h-4 w-4 rounded border-gray-300 accent-green-700 cursor-pointer shrink-0"
                                    title="Select all"
                                />
                            </th>
                            <!-- Tracking ID -->
                            <th class="py-3 px-3 w-32 cursor-pointer select-none group" @click="setSort('tracking_id')">
                                <div class="flex items-center gap-1.5">
                                    <span>Tracking ID</span>
                                    <i :class="sortIcon('tracking_id')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- Title -->
                            <th class="py-3 px-4 min-w-[240px] cursor-pointer select-none group" @click="setSort('title')">
                                <div class="flex items-center gap-1.5">
                                    <span>Title &amp; Description</span>
                                    <i :class="sortIcon('title')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- Contributor -->
                            <th class="py-3 px-3 w-40 cursor-pointer select-none group" @click="setSort('contributor')">
                                <div class="flex items-center gap-1.5">
                                    <span>Contributor</span>
                                    <i :class="sortIcon('contributor')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- College / Program / Department -->
                            <th class="py-3 px-3 w-44 cursor-pointer select-none group" @click="setSort('college')">
                                <div class="flex items-center gap-1.5">
                                    <span>College / Unit</span>
                                    <i :class="sortIcon('college')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- Type -->
                            <th class="py-3 px-3 w-28 text-center cursor-pointer select-none group" @click="setSort('type')">
                                <div class="flex items-center justify-center gap-1.5">
                                    <span>Type</span>
                                    <i :class="sortIcon('type')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- Resource Link (non-sortable) -->
                            <th class="py-3 px-3 w-32 text-center">Resource Link</th>
                            <!-- Status -->
                            <th class="py-3 px-3 w-28 text-center cursor-pointer select-none group" @click="setSort('status')">
                                <div class="flex items-center justify-center gap-1.5">
                                    <span>Status</span>
                                    <i :class="sortIcon('status')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- Date -->
                            <th class="py-3 px-3 w-24 text-center cursor-pointer select-none group" @click="setSort('date')">
                                <div class="flex items-center justify-center gap-1.5">
                                    <span>Date</span>
                                    <i :class="sortIcon('date')" class="text-[10px]"></i>
                                </div>
                            </th>
                            <!-- Action (non-sortable) -->
                            <th v-if="canManageResources" class="py-3 px-3 w-20 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <!-- Loading state -->
                        <tr v-if="isLoading">
                            <td :colspan="tableColumnCount" class="py-12 text-center text-gray-500">
                                <i class="fa fa-circle-notch fa-spin text-2xl text-green-700 mb-2"></i>
                                <p class="text-xs font-medium">Loading OER Submissions...</p>
                            </td>
                        </tr>

                        <!-- Empty state -->
                        <tr v-else-if="filteredList.length === 0">
                            <td :colspan="tableColumnCount" class="py-12 text-center text-gray-500">
                                <i class="fa fa-folder-open text-3xl text-gray-300 mb-2"></i>
                                <p class="text-sm font-semibold text-gray-700">No OER resources found</p>
                                <p class="text-xs text-gray-400 mt-1">Try adjusting your search or filters.</p>
                            </td>
                        </tr>

                        <!-- Data rows -->
                        <tr
                            v-else
                            v-for="(item, index) in filteredList"
                            :key="item.id || item.tracking_id"
                            class="hover:bg-green-50/40 transition-colors"
                            :class="{ 'bg-green-50': selectedIds.includes(item.id) }"
                        >
                            <!-- Checkbox + Index -->
                            <td v-if="canManageResources" class="py-3 px-3 text-center">
                                <div class="flex flex-col items-center gap-0.5">
                                    <input
                                        type="checkbox"
                                        :value="item.id"
                                        v-model="selectedIds"
                                        class="!m-0 h-4 w-4 rounded border-gray-300 accent-green-700 cursor-pointer shrink-0"
                                    />
                                    <span class="text-[9px] text-gray-400 font-mono">{{ index + 1 }}</span>
                                </div>
                            </td>

                            <!-- Tracking ID -->
                            <td class="py-3 px-3">
                                <span class="font-mono text-[11px] font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                                    {{ item.tracking_id || 'â€”' }}
                                </span>
                            </td>

                            <!-- Title & Abstract -->
                            <td class="py-3 px-4">
                                <div class="font-bold text-gray-900 text-xs line-clamp-2" :class="{ 'hover:text-green-800 cursor-pointer': canManageResources }" @click="openDetail(item)">
                                    {{ item.title || 'Untitled Resource' }}
                                </div>
                                <div class="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                    {{ item.description_abstract || 'No description provided.' }}
                                </div>
                                <div v-if="item.keywords" class="flex flex-wrap gap-1 mt-1">
                                    <span
                                        v-for="kw in item.keywords.split(',').slice(0, 3)"
                                        :key="kw"
                                        class="text-[9px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium"
                                    >
                                        {{ kw.trim() }}
                                    </span>
                                </div>
                            </td>

                            <!-- Contributor -->
                            <td class="py-3 px-3">
                                <div class="font-semibold text-gray-800">{{ item.contributor_name || 'Anonymous' }}</div>
                                <div class="text-[10px] text-gray-500 truncate max-w-[140px]" :title="item.contributor_email">
                                    {{ item.contributor_email || 'â€”' }}
                                </div>
                            </td>

                            <!-- College / Program / Department -->
                            <td class="py-3 px-3">
                                <div class="text-[11px] font-medium text-gray-700 line-clamp-2" :title="item.college_or_unit">
                                    {{ item.college_or_unit || 'â€”' }}
                                </div>
                                <div v-if="item.program" class="text-[10px] text-gray-500 line-clamp-1" :title="item.program">
                                    {{ item.program }}
                                </div>
                            </td>

                            <!-- Type of Entry badge -->
                            <td class="py-3 px-3 text-center">
                                <span
                                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-2xs whitespace-nowrap"
                                    :class="getTypeBadgeClass(item.type_of_entry)"
                                >
                                    <i
                                        v-if="item.type_of_entry === 'Google Doc'"
                                        class="fab fa-google-drive text-[10px]"
                                    ></i>
                                    <i
                                        v-else-if="item.type_of_entry === 'Video'"
                                        class="fa fa-video text-[10px]"
                                    ></i>
                                    <i
                                        v-else
                                        class="fa fa-file-alt text-[10px]"
                                    ></i>
                                    {{ item.type_of_entry || 'Document' }}
                                </span>
                            </td>

                            <!-- Resource Link -->
                            <td class="py-3 px-3 text-center">
                                <template v-if="getPrimaryResourceLink(item)">
                                    <a
                                        :href="getPrimaryResourceLink(item).url"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md border shadow-2xs transition-all active:scale-95"
                                        :class="
                                            item.type_of_entry === 'Google Doc'
                                                ? 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100'
                                                : item.type_of_entry === 'Video'
                                                ? 'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
                                                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                        "
                                        :title="getPrimaryResourceLink(item).name"
                                    >
                                        <i :class="getPrimaryResourceLink(item).icon"></i>
                                        <span>Open</span>
                                        <i class="fa fa-external-link-alt text-[9px] opacity-70"></i>
                                    </a>
                                </template>
                                <span v-else class="text-[10px] text-gray-400">No link</span>
                            </td>

                            <!-- Status -->
                            <td class="py-3 px-3 text-center">
                                <span
                                    class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs whitespace-nowrap"
                                    :class="getStatusBadgeClass(getLatestStatus(item))"
                                >
                                    {{ getLatestStatus(item) }}
                                </span>
                            </td>

                            <!-- Date Submitted -->
                            <td class="py-3 px-3 text-center text-gray-500 font-mono text-[10px] whitespace-nowrap">
                                {{ formatDate(item.created_at) }}
                            </td>

                            <!-- Action -->
                            <td v-if="canManageResources" class="py-3 px-3 text-center">
                                <div class="flex items-center justify-center gap-1">
                                    <button
                                        type="button"
                                        @click="openDetail(item)"
                                        class="p-1.5 rounded-lg bg-gray-100 hover:bg-green-700 hover:text-white text-gray-600 transition-colors cursor-pointer"
                                        title="View full details"
                                    >
                                        <i class="fa fa-eye text-xs"></i>
                                    </button>
                                    <button
                                        type="button"
                                        @click="deleteSingle(item)"
                                        :disabled="isDeleting"
                                        class="p-1.5 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white text-gray-500 transition-colors cursor-pointer disabled:opacity-50"
                                        title="Delete resource"
                                    >
                                        <i class="fa fa-trash-alt text-xs"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Footer summary -->
            <div class="px-4 py-3 bg-gray-50/80 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                <div>
                    Showing <span class="font-bold text-gray-800">{{ filteredList.length }}</span> of <span class="font-bold text-gray-800">{{ oerList.length }}</span> resources
                </div>
                <div class="text-[11px] text-gray-400">
                    La Salle University Ozamiz, Inc. &bull; Metau OER Repository
                </div>
            </div>
        </div>

        <!-- Detail Modal -->
        <div
            v-if="canManageResources && showDetailModal && selectedResource"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            @click.self="closeDetail"
        >
            <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
                <!-- Modal Header -->
                <div class="sticky top-0 bg-gradient-to-r from-green-800 to-emerald-800 text-white p-5 rounded-t-2xl flex items-start justify-between gap-4 z-10">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="font-mono text-xs px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                                {{ selectedResource.tracking_id }}
                            </span>
                            <span
                                class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-yellow-400 text-green-950"
                            >
                                {{ selectedResource.type_of_entry || 'Document' }}
                            </span>
                        </div>
                        <h2 class="text-base sm:text-lg font-bold leading-snug">
                            {{ selectedResource.title || 'Untitled Resource' }}
                        </h2>
                    </div>
                    <button
                        type="button"
                        @click="closeDetail"
                        class="text-white/80 hover:text-white text-xl leading-none p-1 cursor-pointer"
                    >
                        &times;
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="p-6 space-y-5 text-xs text-gray-700">
                    <!-- Contributor Info Box -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <span class="text-gray-400 uppercase text-[10px] font-bold block">Contributor</span>
                            <span class="font-semibold text-gray-900">{{ selectedResource.contributor_name || 'â€”' }}</span>
                            <span class="text-gray-500 block text-[11px]">{{ selectedResource.contributor_email || 'â€”' }}</span>
                        </div>
                        <div>
                            <span class="text-gray-400 uppercase text-[10px] font-bold block">College & Program</span>
                            <span class="font-semibold text-gray-900">{{ selectedResource.college_or_unit || 'â€”' }}</span>
                            <span class="text-gray-500 block text-[11px]">{{ selectedResource.program || 'No specific program' }}</span>
                        </div>
                        <div>
                            <span class="text-gray-400 uppercase text-[10px] font-bold block">Author & Affiliation</span>
                            <span class="text-gray-800">{{ selectedResource.author_and_affiliation || 'â€”' }}</span>
                        </div>
                        <div>
                            <span class="text-gray-400 uppercase text-[10px] font-bold block">Target Audience & License</span>
                            <span class="text-gray-800 font-medium">{{ selectedResource.target_audience || 'General' }}</span>
                            <span class="text-gray-500 block text-[11px]">{{ selectedResource.license_chosen || 'â€”' }}</span>
                        </div>
                    </div>

                    <!-- Direct Resource Links -->
                    <div class="p-3.5 bg-green-50/70 border border-green-200 rounded-xl space-y-2">
                        <div class="font-bold text-green-900 flex items-center gap-2">
                            <i class="fa fa-link text-xs"></i>
                            <span>Resource Links & Files</span>
                        </div>

                        <!-- Google Doc Link -->
                        <div v-if="selectedResource.google_doc_link" class="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-sky-200">
                            <div class="flex items-center gap-2 truncate">
                                <i class="fab fa-google-drive text-sky-600 text-sm"></i>
                                <span class="font-semibold text-sky-900 truncate">Google Doc Link:</span>
                                <span class="text-gray-600 text-[11px] truncate">{{ selectedResource.google_doc_link }}</span>
                            </div>
                            <a
                                :href="selectedResource.google_doc_link"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1 shadow-2xs"
                            >
                                <span>Open Google Doc</span>
                                <i class="fa fa-external-link-alt text-[9px]"></i>
                            </a>
                        </div>

                        <!-- Video Link -->
                        <div v-if="selectedResource.video_links" class="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-purple-200">
                            <div class="flex items-center gap-2 truncate">
                                <i class="fa fa-video text-purple-600 text-sm"></i>
                                <span class="font-semibold text-purple-900 truncate">Video URL:</span>
                                <span class="text-gray-600 text-[11px] truncate">{{ selectedResource.video_links }}</span>
                            </div>
                            <a
                                :href="selectedResource.video_links"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1 shadow-2xs"
                            >
                                <span>Watch Video</span>
                                <i class="fa fa-external-link-alt text-[9px]"></i>
                            </a>
                        </div>

                        <!-- Files list -->
                        <div v-if="Array.isArray(selectedResource.resource_files) && selectedResource.resource_files.length > 0" class="space-y-1">
                            <div
                                v-for="(file, idx) in selectedResource.resource_files"
                                :key="idx"
                                class="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-gray-200"
                            >
                                <div class="flex items-center gap-2 truncate">
                                    <i class="fa fa-file-alt text-gray-500"></i>
                                    <span class="font-medium text-gray-800 truncate">{{ file.name || 'Resource File' }}</span>
                                </div>
                                <a
                                    v-if="file.url && file.url !== '#'"
                                    :href="cleanURL(file.url, file.name)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="px-3 py-1 bg-green-700 hover:bg-green-800 text-white rounded text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1 shadow-2xs"
                                >
                                    <span>Download / Open</span>
                                    <i class="fa fa-external-link-alt text-[9px]"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Description / Abstract -->
                    <div>
                        <h4 class="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-1">
                            Description / Abstract
                        </h4>
                        <p class="p-3 bg-gray-50 rounded-lg text-gray-700 leading-relaxed whitespace-pre-line border border-gray-200">
                            {{ selectedResource.description_abstract || 'No abstract available.' }}
                        </p>
                    </div>

                    <!-- Learning Objectives -->
                    <div v-if="selectedResource.learning_objectives">
                        <h4 class="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-1">
                            Learning Objectives
                        </h4>
                        <p class="p-3 bg-gray-50 rounded-lg text-gray-700 leading-relaxed whitespace-pre-line border border-gray-200">
                            {{ selectedResource.learning_objectives }}
                        </p>
                    </div>

                    <!-- Lasallian Relevance & Accessibility -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div v-if="selectedResource.lasallian_relevance">
                            <h4 class="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-1">
                                Lasallian Relevance
                            </h4>
                            <p class="p-2.5 bg-gray-50 rounded-lg text-gray-600 text-[11px] leading-relaxed border border-gray-200">
                                {{ selectedResource.lasallian_relevance }}
                            </p>
                        </div>
                        <div v-if="selectedResource.accessibility_notes">
                            <h4 class="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-1">
                                Accessibility Notes
                            </h4>
                            <p class="p-2.5 bg-gray-50 rounded-lg text-gray-600 text-[11px] leading-relaxed border border-gray-200">
                                {{ selectedResource.accessibility_notes }}
                            </p>
                        </div>
                    </div>

                    <!-- Subject areas & Keywords -->
                    <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                        <span v-if="selectedResource.subject_areas" class="px-2 py-1 rounded bg-green-50 text-green-800 border border-green-200 text-[10px]">
                            <strong>Subject:</strong> {{ selectedResource.subject_areas }}
                        </span>
                        <span v-if="selectedResource.languages" class="px-2 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px]">
                            <strong>Language:</strong> {{ selectedResource.languages }}
                        </span>
                    </div>

                    <!-- Status History / Logs -->
                    <div v-if="Array.isArray(selectedResource.logs) && selectedResource.logs.length > 0">
                        <h4 class="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-2">
                            Status History & Remarks
                        </h4>
                        <div class="space-y-2">
                            <div
                                v-for="(log, lIdx) in selectedResource.logs"
                                :key="lIdx"
                                class="p-2.5 rounded-lg border border-gray-200 bg-gray-50 flex items-start justify-between gap-3"
                            >
                                <div>
                                    <span
                                        class="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold border"
                                        :class="getStatusBadgeClass(log.status_update)"
                                    >
                                        {{ log.status_update || 'Update' }}
                                    </span>
                                    <p class="text-gray-700 text-[11px] mt-1">{{ log.status_remarks || 'â€”' }}</p>
                                    <span class="text-gray-400 text-[10px]">By: {{ log.status_update_by || 'OER Staff' }}</span>
                                </div>
                                <span class="text-[10px] text-gray-400 font-mono whitespace-nowrap">
                                    {{ log.timestamp }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="p-4 bg-gray-50 rounded-b-2xl border-t border-gray-200 flex justify-end">
                    <button
                        type="button"
                        @click="closeDetail"
                        class="px-5 py-2 bg-gray-800 hover:bg-black text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- â”€â”€â”€ CONFIRM MODAL (v-if, no browser confirm()) â”€â”€â”€ -->
    <teleport to="body">
        <transition name="modal-fade">
            <div
                v-if="confirmModal.show"
                class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                @click.self="handleConfirmCancel"
            >
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden">
                    <div class="p-6 flex gap-4 items-start">
                        <div
                            class="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                            :class="confirmModal.type === 'danger' ? 'bg-red-100 text-red-600' : confirmModal.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'"
                        >
                            <i :class="confirmModal.type === 'danger' ? 'fa fa-trash' : confirmModal.type === 'warning' ? 'fa fa-exclamation-triangle' : 'fa fa-question-circle'"></i>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-sm font-bold text-gray-900 mb-1">{{ confirmModal.title }}</h3>
                            <p class="text-xs text-gray-500 leading-relaxed">{{ confirmModal.message }}</p>
                        </div>
                    </div>
                    <div class="px-6 pb-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            @click="handleConfirmCancel"
                            class="px-4 py-2 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer transition-all"
                        >
                            {{ confirmModal.cancelText }}
                        </button>
                        <button
                            type="button"
                            @click="handleConfirmOk"
                            class="px-4 py-2 text-xs font-bold text-white rounded-lg cursor-pointer transition-all"
                            :class="confirmModal.type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-700 hover:bg-green-800'"
                        >
                            {{ confirmModal.confirmText }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>

    <!-- â”€â”€â”€ TOASTER (v-if, no browser alert()) â”€â”€â”€ -->
    <teleport to="body">
        <transition name="toast-slide">
            <div
                v-if="toast.show"
                class="fixed bottom-6 right-6 z-[10000] flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-xl border min-w-[280px] max-w-sm bg-white"
                :class="{
                    'border-green-300': toast.type === 'success',
                    'border-red-300': toast.type === 'error',
                    'border-amber-300': toast.type === 'warning',
                    'border-blue-300': toast.type === 'info',
                }"
            >
                <div
                    class="text-lg flex-shrink-0 mt-0.5"
                    :class="{
                        'text-green-600': toast.type === 'success',
                        'text-red-600': toast.type === 'error',
                        'text-amber-600': toast.type === 'warning',
                        'text-blue-600': toast.type === 'info',
                    }"
                >
                    <i :class="toast.type === 'success' ? 'fa fa-check-circle' : toast.type === 'error' ? 'fa fa-times-circle' : toast.type === 'warning' ? 'fa fa-exclamation-triangle' : 'fa fa-info-circle'"></i>
                </div>
                <div class="flex-1">
                    <div class="text-xs font-bold text-gray-900 mb-0.5">{{ toast.title }}</div>
                    <div class="text-[11px] text-gray-500 leading-relaxed">{{ toast.message }}</div>
                </div>
                <button @click="closeToast" class="text-gray-400 hover:text-gray-700 ml-2 cursor-pointer text-xs flex-shrink-0">
                    <i class="fa fa-times"></i>
                </button>
            </div>
        </transition>
    </teleport>

</template>

<style scoped>
/* ─── SORT HEADERS ──────────────────────────────── */
thead th[class*="cursor-pointer"]:hover {
    background: rgba(255, 255, 255, 0.08);
}

/* ─── FADE SLIDE (Delete Selected button) ──────── */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.97);
}

.toast-slide-enter-active,
.toast-slide-leave-active {
    transition: all 0.25s ease-out;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
}
</style>
