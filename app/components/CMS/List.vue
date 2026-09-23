<script setup>
import { onMounted, ref, computed, watch } from "vue";
import _ from "lodash";

const props = defineProps({
  darkMode: { type: Boolean, default: false },
  rolePermissions: { type: Array, default: () => [] }
});

const { user, init } = useAuth();
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

onMounted(() => {
  init();
});

const addMoreToggle = ref(false);
const addMore = () => {
  addMoreToggle.value = !addMoreToggle.value;
  scrollToTop();
};

const scrollToTop = () => {
  if (process.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

let tableDisplay = ref(true);
const selectedItem = ref(null);


const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");
const display = ref("desktop");


// Add SDG colors mapping
const sdgColors = {
  1: "#e5243b",
  2: "#dda63a",
  3: "#4c9f38",
  4: "#c5192d",
  5: "#ff3a21",
  6: "#26bde2",
  7: "#fcc30b",
  8: "#a21942",
  9: "#fd6925",
  10: "#dd1367",
  11: "#fd9d24",
  12: "#bf8b2e",
  13: "#3f7e44",
  14: "#0a97d9",
  15: "#56c02b",
  16: "#00689d",
  17: "#19486a",
};

// Helper function to get SDG color
const getSdgColor = (sdgNumber) => {
  return sdgColors[sdgNumber] || "#6b7280";
};

// Add toast system
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// CSV Upload Modal
const showCsvModal = ref(false);
const csvFile = ref(null);
const isCsvDragOver = ref(false);

const handleCsvSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    csvFile.value = file;
  }
};

const handleCsvDrop = (event) => {
  isCsvDragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.name.toLowerCase().endsWith('.csv')) {
    csvFile.value = file;
  } else {
    showToast("Please upload a valid CSV file.", "error");
  }
};

const downloadCsvTemplate = () => {
  const headers = "content_id,title,authors,descriptions,filters,date";
  const row = "sample_id,Sample Title,John Doe,This is a description.,SDG1,2023-10-27";
  const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + row;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "cms_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const uploadingCsv = ref(false);

const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let row = 0, col = 0, c = 0;
  for (; c < str.length; c++) {
    let cc = str[c], nc = str[c + 1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';

    if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
    if (cc == '"') { quote = !quote; continue; }
    if (cc == ',' && !quote) { ++col; continue; }
    if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc == '\n' && !quote) { ++row; col = 0; continue; }
    if (cc == '\r' && !quote) { ++row; col = 0; continue; }

    arr[row][col] += cc;
  }
  return arr;
};

const uploadCsv = () => {
  if (!csvFile.value) {
    showToast("Please select a CSV file first.", "error");
    return;
  }

  uploadingCsv.value = true;
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const text = e.target.result;
      const data = parseCSV(text);

      if (data.length < 2) {
        showToast("CSV file is empty or only contains headers.", "error");
        uploadingCsv.value = false;
        return;
      }

      const headers = data[0].map(h => h.trim().toLowerCase());

      if (!headers.includes('title')) {
        showToast("Invalid CSV format. Missing 'title' column.", "error");
        uploadingCsv.value = false;
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row.length === 0 || (row.length === 1 && !row[0])) continue; // skip empty rows

        const payload = {};
        headers.forEach((header, index) => {
          if (header) {
            payload[header] = row[index] || "";
          }
        });

        // Add user info to payload if applicable to match form logic
        if (user.value?.email) {
          payload.personnel = user.value.email;
        }

        try {
          await $fetch(`${endpoint.value}/api/cms/content/create/`, {
            method: "POST",
            body: payload,
          });
          successCount++;
        } catch (error) {
          console.error("Error creating from CSV row:", error);
          failCount++;
        }
      }

      if (successCount > 0) {
        showToast(`Successfully imported ${successCount} items. ${failCount > 0 ? `Failed: ${failCount}` : ''}`, "success");
        await fetchList(true); // refresh the list
        showCsvModal.value = false;
        csvFile.value = null;
      } else {
        showToast(`Failed to import items.`, "error");
      }
    } catch (err) {
      console.error("Error parsing CSV:", err);
      showToast("Error processing CSV file.", "error");
    } finally {
      uploadingCsv.value = false;
    }
  };

  reader.onerror = () => {
    showToast("Error reading the file.", "error");
    uploadingCsv.value = false;
  };

  reader.readAsText(csvFile.value);
};

const closeCsvModal = () => {
  showCsvModal.value = false;
  csvFile.value = null;
};

// Edit modal
const showEditModal = ref(false);
const editContent = ref(null);
const editLoading = ref(false);

// File type checking functions
const isImageFile = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const ext = filename.split(".").pop()?.toLowerCase();
  return imageExtensions.includes(ext);
};


const getFileUrl = (filename) => {
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${filename}`;
};

// Keep selectedAuthors in sync when user manually edits the authors text field.
// Note: We don't update selectedAuthors here to avoid conflicts with checkbox selections
const handleImageError = (event, filename) => {
  console.error("Image failed to load:", filename);
  event.target.style.display = "none";
  // Show fallback icon
  const fallback = event.target.parentElement;
  if (fallback) {
    fallback.innerHTML =
      '<div class="w-full h-full bg-gray-200 rounded flex items-center justify-center"><i class="fa fa-image text-gray-400 text-2xl"></i></div>';
  }
};

const localRolePermissions = ref([]);

const effectiveRolePermissions = computed(() => {
  if (props.rolePermissions && props.rolePermissions.length > 0) {
    return props.rolePermissions;
  }
  return localRolePermissions.value;
});

const fetchLocalRolePermissions = async () => {
  if (props.rolePermissions && props.rolePermissions.length > 0) return;
  try {
    const res = await $fetch(`${endpoint.value}/api/cits/role-permissions/list/`);
    if (Array.isArray(res)) {
      localRolePermissions.value = res;
    }
  } catch (err) {
    console.error("Error fetching role permissions in List.vue:", err);
  }
};

const userRoles = computed(() => {
  if (!user.value?.email) return [];
  const found = effectiveRolePermissions.value.find(
    (r) => r.email?.toLowerCase() === user.value.email?.toLowerCase()
  );
  return found?.role_filter_permissions || [];
});

const isSuperAdmin = computed(() => {
  return (
    user.value?.role === "Super Admin" ||
    user.value?.is_superadmin ||
    userRoles.value.includes("Super Admin")
  );
});

const canEdit = (item) => {
  if (!item) return false;
  if (isSuperAdmin.value) return true;
  if (!user.value?.email) return false;

  const userEmail = user.value.email.toLowerCase().trim();
  const userName = user.value.name ? user.value.name.toLowerCase().trim() : "";

  // Check item.personnel field if present
  if (item.personnel && item.personnel.toLowerCase().trim() === userEmail) {
    return true;
  }

  // Check item.logs array for personnel_email, personnel_designation, or personnel_fullname
  if (Array.isArray(item.logs) && item.logs.length > 0) {
    const isLogAuthor = item.logs.some((log) => {
      const logEmail = log.personnel_email?.toLowerCase().trim();
      const logDesig = log.personnel_designation?.toLowerCase().trim();
      const logName = log.personnel_fullname?.toLowerCase().trim();
      return (
        (logEmail && logEmail === userEmail) ||
        (logDesig && logDesig === userEmail) ||
        (userName && logName && logName === userName)
      );
    });
    if (isLogAuthor) return true;
  }

  // Check item.authors field if it contains user's email or name
  if (item.authors) {
    const authorsLower = item.authors.toLowerCase();
    if (authorsLower.includes(userEmail)) return true;
    if (userName && authorsLower.includes(userName)) return true;
  }

  return false;
};

const fetchList = async (silent = false) => {
  if (!silent) loading.value = true;
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    info.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching list:", error);
    if (!silent) errorMsg.value = "Failed to load news & updates.";
  } finally {
    if (!silent) loading.value = false;
  }
};

onMounted(async () => {
  await fetchLocalRolePermissions();
  await fetchList();
});

const handleFormSubmitted = async () => {
  addMoreToggle.value = false;
  showEditModal.value = false;
  editContent.value = null;
  await fetchList(true); // Silent refresh
  scrollToTop();
};

const openEditModal = async (item) => {
  if (!canEdit(item)) {
    showToast("Only the author who inputed data or Super Admin can edit this content.", "error");
    return;
  }
  editLoading.value = true;

  try {
    const response = await $fetch(
      `${endpoint.value}/api/cms/content/${item.id}/`,
    );
    editContent.value = response;
    showEditModal.value = true;
  } catch (error) {
    console.error("Error fetching content:", error);
  } finally {
    editLoading.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  editContent.value = null;
  scrollToTop();
};

// Pagination and filtering
const currentPage = ref(1);
const itemsPerPage = 20;
const maxVisiblePages = 4;
const searchQuery = ref("");
const selectedFilter = ref("");
const sortBy = ref("latest");

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "title_asc", label: "Name (A-Z)" },
  { value: "title_desc", label: "Name (Z-A)" },
];

// Filter options
const filterOptions = [
  { value: "", label: "All Contents" },
  { value: "downloads", label: "Downloads" },
  { value: "news highlight", label: "News Highlight" },
  { value: "news", label: "News" },
  { value: "events", label: "Events" },
  { value: "announcements", label: "Announcements" },
  { value: "hero carousel", label: "Hero Carousel" },
  { value: "programs", label: "Programs" },
  { value: "CAS (College of Arts and Sciences)", label: "CAS (College of Arts and Sciences)" },
  { value: "CBA (College of Business and Accountancy)", label: "CBA (College of Business and Accountancy)" },
  { value: "CCJE (College of Criminal Justice Education)", label: "CCJE (College of Criminal Justice Education)" },
  { value: "CCSEA (College of Computer Studies, Engineering and Architecture)", label: "CCSEA (College of Computer Studies, Engineering and Architecture)" },
  { value: "CON (College of Nursing)", label: "CON (College of Nursing)" },
  { value: "CTE (College of Teacher Education)", label: "CTE (College of Teacher Education)" },
  { value: "CTHM (College of Tourism and Hospitality Management)", label: "CTHM (College of Tourism and Hospitality Management)" },
  { value: "CMLS (College of Medical Laboratory Science)", label: "CMLS (College of Medical Laboratory Science)" },
  { value: "SGS (School of Graduate Studies)", label: "SGS (School of Graduate Studies)"}
];

// Filtered and paginated data
const filteredInfo = computed(() => {
  let filtered = [...info.value];

  // Text search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.authors?.toLowerCase().includes(query) ||
        item.descriptions?.toLowerCase().includes(query) ||
        item.filters?.toLowerCase().includes(query) ||
        item.content_id?.toLowerCase().includes(query) ||
        item.date?.toLowerCase().includes(query) ||
        (Array.isArray(item.links) && item.links.some((link) => link?.toLowerCase().includes(query))) ||
        (Array.isArray(item.files) && item.files.some((file) => file?.toLowerCase().includes(query))),
    );
  }

  // Filter by category
  if (selectedFilter.value) {
    filtered = filtered.filter((item) =>
      item.filters?.toLowerCase().includes(selectedFilter.value.toLowerCase()),
    );
  }

  // Sorting logic
  if (sortBy.value === "title_asc") {
    filtered.sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" })
    );
  } else if (sortBy.value === "title_desc") {
    filtered.sort((a, b) =>
      (b.title || "").localeCompare(a.title || "", undefined, { numeric: true, sensitivity: "base" })
    );
  } else if (sortBy.value === "latest") {
    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } else if (sortBy.value === "oldest") {
    filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredInfo.value.length / itemsPerPage),
);

const paginatedInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredInfo.value.slice(start, start + itemsPerPage);
});

const selectedForDelete = ref([]);

const selectAll = computed({
  get: () => {
    const editableItems = paginatedInfo.value.filter((item) => canEdit(item));
    if (editableItems.length > 0) {
      return editableItems.every((item) => selectedForDelete.value.includes(item.id));
    }
    return false;
  },
  set: (val) => {
    const editableItems = paginatedInfo.value.filter((item) => canEdit(item));
    if (val) {
      const newSelections = [...selectedForDelete.value];
      editableItems.forEach((item) => {
        if (!newSelections.includes(item.id)) {
          newSelections.push(item.id);
        }
      });
      selectedForDelete.value = newSelections;
    } else {
      const currentIds = editableItems.map((item) => item.id);
      selectedForDelete.value = selectedForDelete.value.filter((id) => !currentIds.includes(id));
    }
  }
});

const showDeleteModal = ref(false);
const deleteLoading = ref(false);

const confirmBulkDelete = () => {
  if (selectedForDelete.value.length === 0) return;
  showDeleteModal.value = true;
};

const executeBulkDelete = async () => {
  deleteLoading.value = true;
  try {
    for (const id of selectedForDelete.value) {
      await $fetch(`${endpoint.value}/api/cms/content/${id}/delete/`, {
        method: "DELETE",
      });
    }

    // Refresh the list
    await fetchList(true);

    showToast(`✅ Successfully deleted ${selectedForDelete.value.length} items.`, "success");
    selectedForDelete.value = [];
    showDeleteModal.value = false;
  } catch (error) {
    console.error("Error deleting items:", error);
    showToast("❌ Failed to delete items", "error");
  } finally {
    deleteLoading.value = false;
  }
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
};

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2),
  );
  const end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  for (let i = Math.max(1, end - maxVisiblePages + 1); i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Reset page when search/filter/sort changes
watch([searchQuery, selectedFilter, sortBy], () => {
  currentPage.value = 1;
});

// Add computed property for SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];

  const filters = item.filters.toLowerCase();
  const badges = [];

  // Check for exact SDG mentions using word boundaries
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`,
      `\\bsdg ${i}\\b`,
      `\\bsdg-${i}\\b`,
      `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`,
      `\\bgoal${i}\\b`,
      `\\bsdg${i.toString().padStart(2, "0")}\\b`,
    ];

    if (
      patterns.some((pattern) => {
        const regex = new RegExp(pattern, "i");
        return regex.test(filters);
      })
    ) {
      badges.push({
        number: i,
        color: getSdgColor(i),
      });
    }
  }
  return badges;
};

</script>
<template>
  <div>
    <div class="flex flex-1 w-full">
      <div class="w-full">
        <!-- Main Content with Footer -->
        <div class="w-full min-h-screen flex flex-col" v-if="!addMoreToggle && !showEditModal">
          <div class="">
            <!-- Content List Section -->
            <div class="">
              <div v-show="tableDisplay">
            
<!-- Search and Filter Bar -->
<div
  class="rounded-xl border shadow-sm mb-3 overflow-hidden"
  :class="darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200'"
>
  <!-- Main Toolbar -->
  <div class="p-2.5">
    <div class="flex flex-col xl:flex-row xl:items-center gap-2">

      <!-- Stats -->
      <div class="flex items-center gap-1.5 shrink-0">

        <!-- Total -->
        <div
          class="flex items-center gap-2 px-2.5 h-9 rounded-lg border"
          :class="darkMode
            ? 'bg-blue-900/20 border-blue-800/50'
            : 'bg-blue-50 border-blue-100'"
        >
          <i
            class="fa fa-file-text text-xs"
            :class="darkMode ? 'text-blue-400' : 'text-blue-600'"
          ></i>

          <span
            class="text-[10px] font-semibold uppercase"
            :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
          >
            Total
          </span>

          <span
            class="text-sm font-bold"
            :class="darkMode ? 'text-blue-400' : 'text-blue-600'"
          >
            {{ info.length }}
          </span>
        </div>

        <!-- Filtered -->
        <div
          class="flex items-center gap-2 px-2.5 h-9 rounded-lg border"
          :class="darkMode
            ? 'bg-emerald-900/20 border-emerald-800/50'
            : 'bg-emerald-50 border-emerald-100'"
        >
          <i
            class="fa fa-filter text-xs"
            :class="darkMode ? 'text-emerald-400' : 'text-emerald-600'"
          ></i>

          <span
            class="text-[10px] font-semibold uppercase"
            :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
          >
            Filtered
          </span>

          <span
            class="text-sm font-bold"
            :class="darkMode ? 'text-emerald-400' : 'text-emerald-600'"
          >
            {{ filteredInfo.length }}
          </span>
        </div>

      </div>


      <!-- Search / Filters -->
      <div class="flex flex-1 items-center gap-1.5">

        <!-- Search -->
        <div class="relative flex-1 min-w-0">
          <i
            class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[11px]"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
          ></i>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full h-9 pl-8 pr-8 border rounded-lg outline-none text-xs focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            :class="darkMode
              ? 'bg-gray-900/60 border-gray-700 text-gray-200 placeholder-gray-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'"
          />

          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <i class="fa fa-times text-[10px]"></i>
          </button>
        </div>


        <!-- Filter -->
        <div class="relative w-36 shrink-0">
          <i
            class="fa fa-filter absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px]"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
          ></i>

          <select
            v-model="selectedFilter"
            class="w-full h-9 pl-7 pr-6 border rounded-lg outline-none text-xs appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            :class="darkMode
              ? 'bg-gray-900/60 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-900'"
          >
            <option
              v-for="option in filterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>

          <i
            class="fa fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
          ></i>
        </div>


        <!-- Sort -->
        <div class="relative w-36 shrink-0">
          <i
            class="fa fa-sort-amount-down absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px]"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
          ></i>

          <select
            v-model="sortBy"
            class="w-full h-9 pl-7 pr-6 border rounded-lg outline-none text-xs appearance-none cursor-pointer focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            :class="darkMode
              ? 'bg-gray-900/60 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-900'"
          >
            <option
              v-for="option in sortOptions"
              :key="option.value"
              :value="option.value"
            >
              Sort: {{ option.label }}
            </option>
          </select>

          <i
            class="fa fa-chevron-down absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none"
            :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
          ></i>
        </div>


        <!-- Mobile Edit -->
        <button
          v-if="selectedItem && display === 'mobile' && canEdit(selectedItem)"
          @click="showEditModal = !showEditModal"
          class="lg:hidden h-9 px-3 rounded-lg text-xs font-semibold text-white whitespace-nowrap"
          :class="showEditModal
            ? 'bg-gray-700'
            : 'bg-green-700 hover:bg-green-800'"
        >
          <i
            :class="showEditModal ? 'fa fa-times' : 'fa fa-edit'"
            class="mr-1"
          ></i>
          {{ showEditModal ? "Close" : "Edit" }}
        </button>

      </div>

    </div>
  </div>


  <!-- Bottom Action / Pagination -->
  <div
    class="px-2.5 py-2 border-t flex flex-wrap items-center justify-between gap-2"
    :class="darkMode
      ? 'bg-gray-900/30 border-gray-700'
      : 'bg-gray-50/60 border-gray-100'"
  >

    <!-- Actions -->
    <div class="flex items-center gap-1.5">

      <!-- Add -->
      <button
        @click="addMore"
        v-if="!addMoreToggle"
        class="h-8 px-3 rounded-lg text-[10px] font-bold uppercase text-white transition"
        :class="darkMode
          ? 'bg-yellow-600 hover:bg-yellow-500'
          : 'bg-yellow-500 hover:bg-yellow-400'"
      >
        <i class="fa fa-plus mr-1"></i>
        Add More
      </button>


      <!-- CSV -->
      <button
        @click="showCsvModal = true"
        v-if="!addMoreToggle"
        class="h-8 px-3 rounded-lg text-[10px] font-bold uppercase text-white transition"
        :class="darkMode
          ? 'bg-blue-600 hover:bg-blue-500'
          : 'bg-blue-500 hover:bg-blue-400'"
      >
        <i class="fa fa-upload mr-1"></i>
        CSV
      </button>


      <!-- Delete -->
      <button
        @click="confirmBulkDelete"
        v-if="selectedForDelete.length > 0"
        class="h-8 px-3 rounded-lg text-[10px] font-bold uppercase text-white transition"
        :class="darkMode
          ? 'bg-red-600 hover:bg-red-500'
          : 'bg-red-500 hover:bg-red-400'"
      >
        <i class="fa fa-trash mr-1"></i>
        Delete
        <span class="ml-1 opacity-80">
          ({{ selectedForDelete.length }})
        </span>
      </button>

    </div>


    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center gap-1"
    >
      <span
        class="text-[10px] mr-1"
        :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
      >
        {{ currentPage }}/{{ totalPages }}
      </span>

      <!-- Previous -->
      <button
        :disabled="currentPage === 1"
        @click="currentPage--"
        class="w-7 h-7 rounded-md border flex items-center justify-center text-[10px] disabled:opacity-30"
        :class="darkMode
          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'"
      >
        <i class="fa fa-chevron-left"></i>
      </button>

      <!-- Pages -->
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="currentPage = page"
        class="min-w-7 h-7 px-1.5 rounded-md flex items-center justify-center text-[10px] font-semibold"
        :class="currentPage === page
          ? 'bg-green-700 text-white'
          : (darkMode
            ? 'bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700'
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100')"
      >
        {{ page }}
      </button>

      <!-- Next -->
      <button
        :disabled="currentPage === totalPages"
        @click="currentPage++"
        class="w-7 h-7 rounded-md border flex items-center justify-center text-[10px] disabled:opacity-30"
        :class="darkMode
          ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'"
      >
        <i class="fa fa-chevron-right"></i>
      </button>

    </div>

  </div>

</div>


<!-- Desktop Table -->
<div
  class="hidden lg:block w-full rounded-xl border shadow-sm overflow-hidden"
  :class="darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200'"
>

  <!-- Compact Table Header -->
  <div
    class="px-3 py-2 flex items-center justify-between border-b"
    :class="darkMode
      ? 'bg-gray-900/40 border-gray-700'
      : 'bg-gray-50 border-gray-100'"
  >
    <div class="flex items-center gap-2">

      <i
        class="fa fa-list text-[11px]"
        :class="darkMode ? 'text-green-400' : 'text-green-700'"
      ></i>

      <span
        class="text-[11px] font-bold"
        :class="darkMode ? 'text-gray-300' : 'text-gray-600'"
      >
        Records
      </span>

      <span
        class="text-[10px]"
        :class="darkMode ? 'text-gray-600' : 'text-gray-400'"
      >
        {{ paginatedInfo.length }} shown
      </span>

    </div>

    <span
      class="hidden xl:flex items-center gap-1 text-[9px]"
      :class="darkMode ? 'text-gray-600' : 'text-gray-400'"
    >
      <i class="fa fa-arrows-h"></i>
      Horizontal scroll
    </span>
  </div>


  <!-- Horizontal Scroll -->
  <div class="overflow-x-auto custom-scrollbar">

    <table class=" w-full border-collapse">

  

      <!-- Header -->
      <thead>

        <tr
          class="border-b text-[9px] font-bold uppercase tracking-wide"
          :class="darkMode
            ? 'bg-gray-900 text-gray-500 border-gray-700'
            : 'bg-gray-50 text-gray-500 border-gray-200'"
        >

          <!-- Select -->
          <th class="px-2 py-2 text-center sticky left-0 z-20 lg:w-10"
            :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'"
          >
            <input
              type="checkbox"
              v-model="selectAll"
              class="w-3.5 h-3.5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
            />
          </th>

          <!-- Status -->
          <th class="px-2 py-2 text-left lg:w-10">
            <span class="flex items-center gap-1">
              <i class="fa fa-check-circle"></i>
              Status
            </span>
          </th>

          <!-- Image -->
          <th class="px-2 py-2 text-left lg:w-10">
            <span class="flex items-center gap-1">
              <i class="fa fa-image"></i>
              Image
            </span>
          </th>

          <!-- Authors -->
          <th class="px-2 py-2 text-left lg:w-3/12">
            <span class="flex items-center gap-1">
              <i class="fa fa-user"></i>
              Authors
            </span>
          </th>

          <!-- Title -->
          <th class="px-2 py-2 text-left lg:w-4/12">
            <span class="flex items-center gap-1">
              <i class="fa fa-file-text"></i>
              Title
            </span>
          </th>

          <!-- Description -->
          <th class="px-2 py-2 text-left lg:w-6/12">
            <span class="flex items-center gap-1">
              <i class="fa fa-align-left"></i>
              Description
            </span>
          </th>

          <!-- Actions -->
          <th class="px-2 py-2 text-center">
            <i class="fa fa-cogs"></i>
          </th>

        </tr>

      </thead>


      <!-- Loading -->
      <tbody v-if="loading">

        <tr>
          <td
            colspan="7"
            class="px-3 py-8 text-center"
          >
            <SuperAdminDashboardLoading />
          </td>
        </tr>

      </tbody>


      <!-- Body -->
      <tbody
        v-else
        class="divide-y text-[11px]"
        :class="darkMode
          ? 'divide-gray-700'
          : 'divide-gray-100'"
      >

        <tr
          v-for="j in paginatedInfo"
          :key="j.id"
          @click="selectedItem = j"
          class="group transition-colors cursor-pointer border-l-2"
          :class="[
            selectedItem?.id === j.id
              ? (darkMode
                ? 'bg-blue-900/20 border-blue-500'
                : 'bg-blue-50/70 border-blue-500')
              : (darkMode
                ? 'hover:bg-gray-750 border-transparent'
                : 'hover:bg-gray-50 border-transparent')
          ]"
        >

          <!-- Checkbox -->
          <td
            class="px-2 py-2 text-center align-middle sticky left-0 z-10"
            :class="selectedItem?.id === j.id
              ? (darkMode ? 'bg-blue-900/20' : 'bg-blue-50/70')
              : (darkMode ? 'bg-gray-800' : 'bg-white')"
          >
            <input
              type="checkbox"
              :value="j.id"
              v-model="selectedForDelete"
              :disabled="!canEdit(j)"
              @click.stop
              class="w-3.5 h-3.5 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer disabled:opacity-30"
            />
          </td>


          <!-- Status -->
          <td class="px-2 py-2 align-middle">

            <div class="flex items-center justify-center">

              <!-- Published -->
              <div
                v-if="j.is_published || (j.filters && j.filters.toLowerCase().includes('published'))"
                class="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center shadow-sm"
                title="Published"
              >
                <i class="fa fa-check text-white text-[10px]"></i>
              </div>

              <!-- Approved -->
              <div
                v-else-if="j.is_approved || (j.filters && j.filters.toLowerCase().includes('approved'))"
                class="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center shadow-sm"
                title="Approved"
              >
                <i class="fa fa-check-circle text-white text-[10px]"></i>
              </div>

              <!-- Verified -->
              <div
                v-else-if="j.is_verified || (j.filters && j.filters.toLowerCase().includes('verified'))"
                class="w-7 h-7 rounded-md bg-yellow-400 flex items-center justify-center shadow-sm"
                title="Verified"
              >
                <i class="fa fa-clock-o text-white text-[10px]"></i>
              </div>

              <!-- Unverified -->
              <div
                v-else
                class="w-7 h-7 rounded-md flex items-center justify-center shadow-sm"
                :class="darkMode ? 'bg-gray-700' : 'bg-gray-300'"
                title="Unverified"
              >
                <i
                  class="fa fa-question text-[10px]"
                  :class="darkMode ? 'text-gray-400' : 'text-white'"
                ></i>
              </div>

            </div>

          </td>


          <!-- Image -->
          <td class="px-2 py-2 align-middle">

            <div
              class="w-16 h-10 rounded-md overflow-hidden border flex items-center justify-center"
              :class="darkMode
                ? 'bg-gray-900 border-gray-700'
                : 'bg-gray-50 border-gray-200'"
            >

              <img
                v-if="j.files?.find(isImageFile)"
                :src="getFileUrl(j.files.find(isImageFile))"
                class="w-full h-full object-cover"
                @error="handleImageError($event, j.files.find(isImageFile))"
              />

              <i
                v-else
                class="fa fa-image text-xs"
                :class="darkMode ? 'text-gray-600' : 'text-gray-300'"
              ></i>

            </div>

          </td>


          <!-- Authors -->
          <td class="px-2 py-2 align-middle max-w-0">

            <p
              class="truncate font-semibold text-xs"
              :class="darkMode
                ? 'text-gray-200'
                : 'text-gray-700'"
              :title="j.authors || '—'"
            >
              {{ j.authors || '—' }}
            </p>

            <p
              class="truncate text-[9px] mt-0.5"
              :class="darkMode
                ? 'text-gray-500'
                : 'text-gray-400'"
            >
              {{ j.logs?.[0]?.personnel_email || j.personnel || '' }}
            </p>

          </td>


          <!-- Title -->
          <td class="px-2 py-2 align-middle max-w-0">

            <p
              class="truncate font-bold text-xs"
              :class="darkMode
                ? 'text-gray-100'
                : 'text-gray-800'"
              :title="j.title"
            >
              {{ j.title }}
            </p>

            <!-- SDG -->
            <div
              v-if="getSdgBadges(j).length"
              class="flex flex-wrap gap-0.5 mt-1"
            >
              <span
                v-for="badge in getSdgBadges(j)"
                :key="badge.number"
                class="inline-flex items-center justify-center w-4 h-4 rounded font-bold text-white text-[8px]"
                :style="{ backgroundColor: badge.color }"
              >
                {{ badge.number }}
              </span>
            </div>

          </td>


          <!-- Description -->
          <td class="px-2 py-2 align-middle max-w-0">

            <p
              class="text-[10px] line-clamp-2 leading-relaxed"
              :class="darkMode
                ? 'text-gray-400'
                : 'text-gray-500'"
              :title="j.descriptions || '—'"
            >
              {{ j.descriptions || '—' }}
            </p>

          </td>


          <!-- Actions -->
          <td class="px-2 py-2 text-center align-middle">

            <button
              v-if="canEdit(j)"
              @click.stop="openEditModal(j)"
              class="w-7 h-7 rounded-md flex items-center justify-center mx-auto text-white transition"
              :class="darkMode
                ? 'bg-yellow-600 hover:bg-yellow-500'
                : 'bg-yellow-500 hover:bg-yellow-400'"
              title="Edit"
            >
              <i class="fa fa-edit text-[10px]"></i>
            </button>

            <span
              v-else
              class="w-7 h-7 rounded-md flex items-center justify-center mx-auto opacity-40"
              :class="darkMode
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-100 text-gray-400'"
              title="Only the author or Super Admin can edit"
            >
              <i class="fa fa-lock text-[9px]"></i>
            </span>

          </td>

        </tr>

      </tbody>

    </table>

  </div>


  <!-- Empty State -->
  <div
    v-if="!loading && paginatedInfo.length === 0"
    class="py-8 text-center border-t"
    :class="darkMode ? 'border-gray-700' : 'border-gray-100'"
  >
    <i
      class="fa fa-search text-xl"
      :class="darkMode ? 'text-gray-600' : 'text-gray-300'"
    ></i>

    <p
      class="text-xs font-semibold mt-2"
      :class="darkMode ? 'text-gray-300' : 'text-gray-700'"
    >
      No records found
    </p>

    <p
      class="text-[10px] mt-0.5"
      :class="darkMode ? 'text-gray-600' : 'text-gray-400'"
    >
      Try changing your search or filter.
    </p>
  </div>

</div>

                  <SuperAdminDashboardLoading v-if="loading" />

                  <!-- Mobile Card View -->
                  <div v-else class="lg:hidden divide-y border shadow-sm" :class="darkMode ? 'divide-gray-700' : 'divide-gray-200'">
                    <div v-for="j in paginatedInfo" :key="j.id" class="p-4 transition-colors cursor-pointer" :class="[
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
                      selectedItem?.id === j.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    ]" @click="
                      selectedItem = j;
                      if (canEdit(j)) openEditModal(j);
                    ">
                      <div class="flex justify-between items-start mb-2 gap-3">
                        <div class="flex-shrink-0 w-20 h-16">
                          <template v-if="j.files?.find(isImageFile)">
                            <img :src="getFileUrl(j.files.find(isImageFile))"
                              class="w-full h-full object-cover rounded border"
                              :class="darkMode ? 'border-gray-700' : 'border-gray-200'"
                              @error="handleImageError($event, j.files.find(isImageFile))" />
                          </template>
                          <div v-else class="w-full h-full flex items-center justify-center rounded border"
                            :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'">
                            <i class="fa fa-image text-xl" :class="darkMode ? 'text-gray-600' : 'text-gray-300'"></i>
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <h3 class="font-medium text-sm mb-1 line-clamp-2"
                            :class="darkMode ? 'text-gray-200' : 'text-gray-900'">
                            {{ j.title }}
                          </h3>
                          <!-- SDG Badges -->
                          <div v-if="getSdgBadges(j).length" class="mb-2">
                            <div class="flex flex-wrap gap-1">
                              <div v-for="badge in getSdgBadges(j)" :key="badge.number"
                                class="inline-flex items-center">
                                <span
                                  class="inline-flex items-center w-5 h-5 justify-center rounded text-xs font-bold text-white shadow-sm"
                                  :style="{ backgroundColor: badge.color }">
                                  {{ badge.number }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p class="text-xs mb-1" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                            ID: {{ j.content_id }}
                          </p>
                          <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">{{ j.authors || '—' }}</p>
                          <p class="text-[10px] opacity-60" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">{{ j.logs?.[0]?.personnel_email || j.personnel || '' }}</p>
                        </div>
                        <button v-if="canEdit(j)" @click.stop="openEditModal(j)"
                          class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs flex-shrink-0">
                          <i class="fa fa-edit"></i>
                        </button>
                        <span v-else class="text-gray-400 text-xs px-2 py-1 flex-shrink-0 opacity-40" title="Only the author or Super Admin can edit">
                          <i class="fa fa-lock"></i>
                        </span>
                      </div>
                      <div v-if="j.descriptions" class="text-xs whitespace-pre-wrap line-clamp-3"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ j.descriptions }}
                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="!loading && filteredInfo.length === 0" class="text-center py-12">
                    <i class="fa fa-search text-4xl mb-3" :class="darkMode ? 'text-gray-600' : 'text-gray-300'"></i>
                    <p :class="darkMode ? 'text-gray-400' : 'text-gray-500'">No contents found</p>
                    <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                      Try adjusting your search or filter
                    </p>
                  </div>
                
              </div>
            </div>
          </div>
        </div>



































        <!-- Add / Edit Form Panel -->
        <div v-if="addMoreToggle || showEditModal" class="relative">
          <!-- Close Button -->
          <div class="w-full p-2 flex justify-end absolute top-0 right-0 z-10">
            <button @click="addMoreToggle ? addMoreToggle = false : closeEditModal()"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2">
              <i class="fa fa-times"></i>
              Close Form
            </button>
          </div>

          <!-- Form -->
          <CMSForm :darkMode="darkMode" :editData="showEditModal ? editContent : null"
            @content-submitted="handleFormSubmitted" />
        </div>
      </div>
    </div>



    <!-- CSV Upload Modal -->
    <div v-if="showCsvModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      @click="closeCsvModal">
      <div class="w-full max-w-md rounded-lg shadow-lg overflow-hidden flex flex-col"
        :class="darkMode ? 'bg-gray-800' : 'bg-white'" @click.stop>
        <div class="flex justify-between items-center p-4 border-b"
          :class="darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'">
          <h2 class="text-lg font-bold" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
            CSV Upload
          </h2>
          <button @click="closeCsvModal" class="p-1"
            :class="darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'">
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div class="flex justify-center mb-4">
            <button @click="downloadCsvTemplate"
              class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium w-full justify-center transition-colors">
              <i class="fa fa-download"></i> Download CSV Template
            </button>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
              Upload CSV File
            </label>
            <div
              class="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all duration-300 relative"
              @dragover.prevent="isCsvDragOver = true" @dragleave.prevent="isCsvDragOver = false"
              @drop.prevent="handleCsvDrop" :class="[
                darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50',
                isCsvDragOver ? (darkMode ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-500 bg-indigo-50') : ''
              ]">

              <div v-if="isCsvDragOver"
                class="absolute inset-0 flex items-center justify-center rounded-lg bg-indigo-500/10 pointer-events-none z-10 border-2 border-indigo-500 border-dashed">
                <span class="text-indigo-600 font-bold text-lg" :class="darkMode ? 'text-indigo-400' : ''">Drop file
                  here</span>
              </div>

              <i class="fa fa-cloud-upload text-3xl mb-2 transition-colors" :class="[
                darkMode ? 'text-gray-400' : 'text-gray-500',
                isCsvDragOver ? (darkMode ? 'text-indigo-400' : 'text-indigo-500') : ''
              ]"></i>
              <input type="file" accept=".csv" @change="handleCsvSelect" class="hidden" id="csv-upload" />
              <label for="csv-upload"
                class="cursor-pointer px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded text-sm font-medium transition-colors z-20"
                :class="darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : ''">
                Browse File
              </label>
              <p class="mt-2 text-xs text-center z-20" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                {{ csvFile ? csvFile.name : 'No file selected' }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-end p-4 border-t gap-2"
          :class="darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'">
          <button @click="closeCsvModal" class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            Cancel
          </button>
          <button @click="uploadCsv" :disabled="!csvFile || uploadingCsv"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
            <i v-if="uploadingCsv" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-upload"></i>
            {{ uploadingCsv ? "Uploading..." : "Upload" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      @click="closeDeleteModal">
      <div class="w-full max-w-md rounded-lg shadow-lg overflow-hidden flex flex-col"
        :class="darkMode ? 'bg-gray-800' : 'bg-white'" @click.stop>
        <div class="flex justify-between items-center p-4 border-b"
          :class="darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'">
          <h2 class="text-lg font-bold flex items-center text-red-500">
            <i class="fa fa-exclamation-triangle mr-2"></i> Confirm Deletion
          </h2>
          <button @click="closeDeleteModal" class="p-1" :disabled="deleteLoading"
            :class="darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'">
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>

        <div class="p-6">
          <p :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
            Are you sure you want to delete <strong>{{ selectedForDelete.length }}</strong> selected item(s)? This
            action
            cannot be undone.
          </p>
        </div>

        <div class="flex justify-end p-4 border-t gap-2"
          :class="darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'">
          <button @click="closeDeleteModal" :disabled="deleteLoading"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'">
            Cancel
          </button>
          <button @click="executeBulkDelete" :disabled="deleteLoading"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
            <i v-if="deleteLoading" class="fa fa-spinner fa-spin"></i>
            <i v-else class="fa fa-trash"></i>
            {{ deleteLoading ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="[
      'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-[9999]',
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
    ]">
      {{ toast.message }}
    </div>
  </div>
</template>