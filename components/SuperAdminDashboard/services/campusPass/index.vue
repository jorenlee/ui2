<script setup>
import { onMounted, ref, computed, watch, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import moment from "moment";
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const props = defineProps({
  darkMode: Boolean,
});

const listItems = ref([]);
let deleteIDItem = ref();
let tableDisplay = ref(true);
let toggleSideBarMenu = ref(false);
let toggleConfirmDelete = ref(false);

const selectedItem = ref(null);
const toggleListsName = ref(false);
const displayListName = ref([]);

const isQuietFetching = ref(false);
let refreshTimer = null;
const refreshIntervalMs = 5000; // Optimized: Changed from 1s to 5s for better performance

// Add multiple selection state
const selectedItems = ref([]);
const isDeleting = ref(false);

// Handle select all functionality
const handleSelectAll = () => {
  if (selectedItems.value.length === paginatedListItems.value.length) {
    // Deselect all
    selectedItems.value = [];
  } else {
    // Select all visible items
    selectedItems.value = paginatedListItems.value.map((item) => item.id);
  }
};

// Toggle individual item selection
const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId);
  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    selectedItems.value.push(itemId);
  }
};

// Function to toggle delete confirmation for multiple items
const toggleDeleteMultiple = () => {
  if (selectedItems.value.length === 0) return;
  toggleConfirmDelete.value = true;
};

// Updated delete function for multiple items
const deleteItems = async () => {
  if (selectedItems.value.length === 0) return;

  try {
    isDeleting.value = true;

    // Delete each selected item
    for (const id of selectedItems.value) {
      await $fetch(endpoint.value + "/api/campus-pass/" + id + "/delete/", {
        method: "DELETE",
        headers: {
          Authorization: userStore.user.token,
          "Content-Type": "application/json",
        },
      });
    }

    console.log(`${selectedItems.value.length} items deleted successfully`);

    // Clear selection and refresh
    selectedItems.value = [];
    await fetchListItems();
    toggleConfirmDelete.value = false;
  } catch (error) {
    console.error("Error deleting items:", error);
  } finally {
    isDeleting.value = false;
  }
};

// Update existing deleteItem to use new function
const deleteItem = async () => {
  await deleteItems();
};

// Silent refresh that merges items by id to avoid flicker
const fetchListItemsQuietly = async () => {
  if (isQuietFetching.value) return;
  isQuietFetching.value = true;
  try {
    const updated =
      (await $fetch(endpoint.value + "/api/campus-pass/list").catch(
        () => []
      )) || [];
    const mergeById = (existingArr, incomingArr) => {
      const map = new Map((existingArr || []).map((x) => [x.id, x]));
      const out = [];
      for (const upd of incomingArr || []) {
        if (upd && map.has(upd.id)) {
          Object.assign(map.get(upd.id), upd);
          out.push(map.get(upd.id));
        } else if (upd) {
          out.push(upd);
        }
      }
      return out;
    };
    if (Array.isArray(listItems.value) && Array.isArray(updated)) {
      listItems.value =
        listItems.value.length === 0
          ? updated
          : mergeById(listItems.value, updated);
    } else {
      listItems.value = updated;
    }
  } catch (err) {
    console.error("Silent fetch error:", err);
  } finally {
    isQuietFetching.value = false;
  }
};

// Add duplicate removal function
const checkAndRemoveDuplicates = async () => {
  try {
    const items = listItems.value;
    if (!items || !Array.isArray(items) || items.length === 0) return;

    // Find duplicate tracking_ids
    const trackingIds = {};
    const duplicates = [];

    items.forEach((item) => {
      if (!item.tracking_id) return;

      if (trackingIds[item.tracking_id]) {
        // This is a duplicate, keep the one with the earlier created_at
        const existingItem = trackingIds[item.tracking_id];
        const duplicateToRemove =
          new Date(existingItem.created_at) > new Date(item.created_at)
            ? existingItem.id
            : item.id;

        duplicates.push(duplicateToRemove);
      } else {
        trackingIds[item.tracking_id] = item;
      }
    });

    // Delete duplicates silently
    for (const id of duplicates) {
      await $fetch(endpoint.value + "/api/campus-pass/" + id + "/delete/", {
        method: "DELETE",
        headers: {
          Authorization: userStore.user.token,
          "Content-Type": "application/json",
        },
      });
    }

    // If any duplicates were removed, refresh the list quietly
    if (duplicates.length > 0) {
      console.log(`🧹 Removed ${duplicates.length} duplicate campus pass entries`);
      await fetchListItemsQuietly();
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error);
  }
};

// Update the auto-refresh function to include duplicate removal
const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(async () => {
    if (!isQuietFetching.value && !toggleConfirmDelete.value && !isDeleting.value) {
      await fetchListItemsQuietly();
      await checkAndRemoveDuplicates();
    }
  }, refreshIntervalMs);
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

onMounted(async () => {
  // Initialize query parameters first (synchronous, no await needed)
  const q = route.query || {};
  if (q.sort) sortDirection.value = String(q.sort) === "desc" ? "desc" : "asc";
  if (q.from) dateFrom.value = String(q.from);
  if (q.to) dateTo.value = String(q.to);
  if (q.q) searchQuery.value = String(q.q);

  // Run data fetching and duplicate check in parallel for better performance
  await Promise.all([
    fetchListItems(),
    checkAndRemoveDuplicates()
  ]);

  // Start auto-refresh after initial data load
  startAutoRefresh();
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});

const fetchListItems = async () => {
  try {
    listItems.value =
      (await $fetch(endpoint.value + "/api/campus-pass/list").catch(
        (error) => error.data
      )) || [];

    // Initialize selectedAccessTypes with all types if empty
    if (selectedAccessTypes.value.length === 0) {
      selectedAccessTypes.value = [...uniqueAccessTypes.value];
    }
  } catch (error) {
    console.error("Error fetching list items:", error);
  } finally {
    isLoading.value = false;
  }
};

const normalizeTypeOfAccess = (val) => {
  const cleanList = (arr) =>
    arr
      .filter((x) => x !== null && x !== undefined)
      .map((x) => String(x).trim())
      .filter((x) => x.length > 0);

  if (Array.isArray(val)) return cleanList(val);

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return cleanList(parsed);
    } catch (_) {}

    const noBrackets = trimmed.replace(/^\[|\]$/g, "");
    const parts = noBrackets
      .split(",")
      .map((s) => s.replace(/^['"]|['"]$/g, "").trim())
      .filter((s) => s.length > 0);

    if (parts.length > 0) return parts;

    const single = noBrackets.replace(/^['"]|['"]$/g, "").trim();
    return single ? [single] : [];
  }

  return [];
};

// Filters and sorting state
const selectedStatuses = ref(["approved", "pending", "declined", "for revision"]); // Multiple status selection
const selectedAccessTypes = ref([]); // Multiple access type selection
const sortDirection = ref("asc"); // asc | desc
const dateFrom = ref(""); // YYYY-MM-DD
const dateTo = ref(""); // YYYY-MM-DD

const searchQuery = ref("");

const uniqueAccessTypes = computed(() => {
  const set = new Set();
  (listItems.value || []).forEach((item) => {
    normalizeTypeOfAccess(item?.type_of_access || []).forEach((t) =>
      set.add(t)
    );
  });
  return Array.from(set).sort();
});

// Status counts for pills
const statusCounts = computed(() => {
  const init = { approved: 0, pending: 0, declined: 0, "for revision": 0 };
  for (const it of listItems.value || []) {
    const s = String(it.approval_status || "").toLowerCase();
    if (s in init) init[s] += 1;
  }
  return init;
});



// Persist filters to query params
watch(
  [selectedStatuses, selectedAccessTypes, sortDirection, dateFrom, dateTo, searchQuery],
  () => {
    const q = {
      ...(sortDirection.value && sortDirection.value !== "asc"
        ? { sort: sortDirection.value }
        : {}),
      ...(dateFrom.value ? { from: dateFrom.value } : {}),
      ...(dateTo.value ? { to: dateTo.value } : {}),
      ...(searchQuery.value ? { q: searchQuery.value } : {}),
    };
    router.replace({ query: q }).catch(() => {});
  }
);

const requestChangeStatus = async (id, status, purpose, remarks) => {
  selectedItem.value = await $fetch(
    endpoint.value + "/api/campus-pass/" + id + "/"
  ).catch((error) => error.data);
  selectedItem.value.approval_status = status;
  selectedItem.value.purpose = purpose;
  selectedItem.value.remarks = remarks;
  editStatus(id);
};

const editStatus = async (id) => {
  await $fetch(endpoint.value + "/api/campus-pass/" + id + "/edit/", {
    method: "PUT",
    body: selectedItem.value,
  }).then((response) => {
    console.log("response", response);

    if (selectedItem.value.approval_status === "approved") {
      submitAppointmentToGmailApproved();
    }

    if (selectedItem.value.approval_status === "declined") {
      submitAppointmentToGmailDeclined();
    }

    if (selectedItem.value.approval_status === "for revision") {
      submitAppointmentToGmailForRevision();
    }
  });
};

const submitAppointmentToGmailApproved = async () => {
  await $fetch(endpoint.value + "/api/campus-pass/to-gmail-approved/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      incharge_firstname: selectedItem.value.incharge_firstname,
      incharge_contact_email: selectedItem.value.incharge_contact_email,
      schedule: selectedItem.value.schedule,
      approval_status: selectedItem.value.approval_status,
      remarks: selectedItem.value.remarks,
      tracking_id: selectedItem.value.tracking_id,
      purpose: selectedItem.value.purpose,
    },
  }).then(async (response) => {
    console.log(response);
    await fetchListItems();
  });
};

const submitAppointmentToGmailDeclined = async () => {
  await $fetch(endpoint.value + "/api/campus-pass/to-gmail-declined/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      incharge_firstname: selectedItem.value.incharge_firstname,
      incharge_contact_email: selectedItem.value.incharge_contact_email,
      schedule: selectedItem.value.schedule,
      approval_status: selectedItem.value.approval_status,
      remarks: selectedItem.value.remarks,
      tracking_id: selectedItem.value.tracking_id,
      purpose: selectedItem.value.purpose,
    },
  }).then(async (response) => {
    console.log(response);
    await fetchListItems();
  });
};

const submitAppointmentToGmailForRevision = async () => {
  await $fetch(endpoint.value + "/api/campus-pass/to-gmail-for-revision/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      incharge_firstname: selectedItem.value.incharge_firstname,
      incharge_contact_email: selectedItem.value.incharge_contact_email,
      schedule: selectedItem.value.schedule,
      approval_status: selectedItem.value.approval_status,
      remarks: selectedItem.value.remarks,
      tracking_id: selectedItem.value.tracking_id,
      purpose: selectedItem.value.purpose,
    },
  }).then(async (response) => {
    console.log(response);
    await fetchListItems();
  });
};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  deleteIDItem.value = id;
};

const btnToggleListsName = (id) => {
  listItems.value.filter(function (params) {
    if (id === params.id) {
      displayListName.value = params.name_list;
      toggleListsName.value = !toggleListsName.value;
    }
  });
};

const logOut = () => {
  userStore.removeToken();
  router.push("/campus-pass/login");
};

let filteredItems;
const filteredListItems = computed(() => {
  filteredItems = Array.isArray(listItems.value) ? [...listItems.value] : [];

  // Text search (name, email, TID, remarks, purpose, access)
  const q = (searchQuery.value || "").toLowerCase().trim();
  if (q) {
    const includes = (s) =>
      String(s || "")
        .toLowerCase()
        .includes(q);
    filteredItems = filteredItems.filter((it) => {
      const name = `${it.incharge_firstname || ""} ${
        it.incharge_middlename || ""
      } ${it.incharge_lastname || ""}`;
      const access = normalizeTypeOfAccess(it.type_of_access).join(" ");
      return (
        includes(name) ||
        includes(it.incharge_contact_email) ||
        includes(it.tracking_id) ||
        includes(it.remarks) ||
        includes(it.purpose) ||
        includes(access)
      );
    });
  }

  // Status filter - use selectedStatuses array
  if (selectedStatuses.value.length > 0 && selectedStatuses.value.length < 4) {
    filteredItems = filteredItems.filter((it) =>
      selectedStatuses.value.includes((it.approval_status || "").toLowerCase())
    );
  }

  // Type of access filter - use selectedAccessTypes array
  if (selectedAccessTypes.value.length > 0) {
    filteredItems = filteredItems.filter((it) => {
      const itemTypes = normalizeTypeOfAccess(it.type_of_access);
      return selectedAccessTypes.value.some(type => itemTypes.includes(type));
    });
  }

  // Date range filter (created_at preferred, fallback to schedule)
  const parseDate = (it) => moment(it?.created_at || it?.schedule);
  if (dateFrom.value) {
    const from = moment(dateFrom.value, "YYYY-MM-DD").startOf("day");
    filteredItems = filteredItems.filter(
      (it) => parseDate(it).isValid() && parseDate(it).isSameOrAfter(from)
    );
  }
  if (dateTo.value) {
    const to = moment(dateTo.value, "YYYY-MM-DD").endOf("day");
    filteredItems = filteredItems.filter(
      (it) => parseDate(it).isValid() && parseDate(it).isSameOrBefore(to)
    );
  }

  // Sort asc/desc by date
  return _.orderBy(
    filteredItems,
    [(x) => moment(x?.created_at || x?.schedule).valueOf()],
    [sortDirection.value]
  );
});

const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 500;
const maxVisiblePages = 4;

const totalPages = computed(() => {
  return Math.ceil(filteredListItems.value.length / itemsPerPage);
});

const paginatedListItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredListItems.value.slice(startIndex, endIndex);
});

watch([selectedStatuses, selectedAccessTypes, sortDirection, dateFrom, dateTo], () => {
  currentPage.value = 1; // reset to first page when filters change
});

const visiblePages = computed(() => {
  const pages = [];
  let startPage = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2)
  );
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});
</script>
<template>
  <div>
    <div class="min-h-screen flex">

      <div class="w-full">


        <div class="border rounded-md p-2 text-xs gap-2 mt-2 mx-5"
          :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'">
          <div
            class="flex justify-between border-b mb-2"
            :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'"
          >
            <div class="flex items-center justify-between gap-x-3">
              <div class="flex items-center space-x-3">
                <!-- Select All Button -->
                <button
                  @click="handleSelectAll"
                  class="flex items-center space-x-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  :class="darkMode
                    ? 'border-gray-600 hover:bg-gray-700 bg-gray-800'
                    : 'border-gray-300 hover:bg-gray-50 bg-white'"
                >
                  <input
                    type="checkbox"
                    :checked="
                      selectedItems.length > 0 &&
                      selectedItems.length === paginatedListItems.length
                    "
                    :indeterminate="
                      selectedItems.length > 0 &&
                      selectedItems.length < paginatedListItems.length
                    "
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    readonly
                  />
                  <span class="font-medium"
                    :class="darkMode ? 'text-gray-200' : 'text-gray-700'"> Select All </span>
                </button>

                <!-- Selected Count Badge -->
                <div
                  v-if="selectedItems.length > 0"
                  class="flex items-center space-x-2"
                >
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                  >
                    <i class="fa fa-user mr-1"></i>
                    ({{ selectedItems.length }})
                  </span>
                </div>
              </div>

              <!-- Delete Button -->
              <button
                @click="toggleDeleteMultiple"
                :disabled="selectedItems.length === 0"
                :class="
                  selectedItems.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-800 hover:bg-red-900'
                "
                class="px-3 py-1 rounded-md uppercase text-white font-bold text-sm transition-colors duration-200"
              >
                DELETE
              </button>
            </div>

            <!-- Status & Type of Access Filter Badges - Mobile Optimized -->
            <div class="lg:flex lg:gap-x-8 mb-3">
              <!-- Status Filters -->
              <div>
                <label class="font-semibold mb-2 text-sm block"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Status:</label>
                <div class="flex flex-wrap gap-2 items-center">
                  <label
                    class="inline-flex items-center lg:px-3 px-2 lg:py-1.5 py-1 rounded-full text-white cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    :class="selectedStatuses.includes('approved') ? 'bg-green-700 shadow-lg ring-2 ring-green-300' : 'bg-green-700 opacity-50'"
                  >
                    <input
                      type="checkbox"
                      value="approved"
                      v-model="selectedStatuses"
                      class="mr-1.5 lg:mr-2 w-3.5 h-3.5 lg:w-4 lg:h-4"
                      style="accent-color: #15803d;"
                    />
                    <span class="font-medium text-xs lg:text-sm">Approved: {{ statusCounts.approved }}</span>
                  </label>

                  <label
                    class="inline-flex items-center lg:px-3 px-2 lg:py-1.5 py-1 rounded-full text-white cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    :class="selectedStatuses.includes('pending') ? 'bg-gray-600 shadow-lg ring-2 ring-gray-300' : 'bg-gray-600 opacity-50'"
                  >
                    <input
                      type="checkbox"
                      value="pending"
                      v-model="selectedStatuses"
                      class="mr-1.5 lg:mr-2 w-3.5 h-3.5 lg:w-4 lg:h-4"
                      style="accent-color: #4b5563;"
                    />
                    <span class="font-medium text-xs lg:text-sm">Pending: {{ statusCounts.pending }}</span>
                  </label>

                  <label
                    class="inline-flex items-center lg:px-3 px-2 lg:py-1.5 py-1 rounded-full text-white cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    :class="selectedStatuses.includes('declined') ? 'bg-red-700 shadow-lg ring-2 ring-red-300' : 'bg-red-700 opacity-50'"
                  >
                    <input
                      type="checkbox"
                      value="declined"
                      v-model="selectedStatuses"
                      class="mr-1.5 lg:mr-2 w-3.5 h-3.5 lg:w-4 lg:h-4"
                      style="accent-color: #b91c1c;"
                    />
                    <span class="font-medium text-xs lg:text-sm">Declined: {{ statusCounts.declined }}</span>
                  </label>

                  <label
                    class="inline-flex items-center lg:px-3 px-2 lg:py-1.5 py-1 rounded-full text-white cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    :class="selectedStatuses.includes('for revision') ? 'bg-yellow-600 shadow-lg ring-2 ring-yellow-300' : 'bg-yellow-600 opacity-50'"
                  >
                    <input
                      type="checkbox"
                      value="for revision"
                      v-model="selectedStatuses"
                      class="mr-1.5 lg:mr-2 w-3.5 h-3.5 lg:w-4 lg:h-4"
                      style="accent-color: #ca8a04;"
                    />
                    <span class="font-medium text-xs lg:text-sm">For revision: {{ statusCounts["for revision"] }}</span>
                  </label>
                </div>
              </div>

              <!-- Type of Access Filters -->
              <div>
                <label class="font-semibold mb-2 text-sm block"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Type of Access:</label>
                <div class="flex flex-wrap gap-2 items-center">
                  <label
                    v-for="accessType in uniqueAccessTypes"
                    :key="accessType"
                    class="inline-flex items-center lg:px-3 px-2 lg:py-1.5 py-1 rounded-full text-white cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                    :class="selectedAccessTypes.includes(accessType) ? 'bg-blue-600 shadow-lg ring-2 ring-blue-300' : 'bg-blue-600 opacity-50'"
                  >
                    <input
                      type="checkbox"
                      :value="accessType"
                      v-model="selectedAccessTypes"
                      class="mr-1.5 lg:mr-2 w-3.5 h-3.5 lg:w-4 lg:h-4"
                      style="accent-color: #2563eb;"
                    />
                    <span class="font-medium text-xs lg:text-sm">{{ accessType }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Filters Section - Mobile Responsive Grid -->
          <div class="lg:flex w-full gap-3">
            <div class="flex flex-col lg:w-4/12">
              <label class="font-semibold text-sm"
                :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Sort By</label>
              <select v-model="sortDirection" class="border-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                :class="darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-200'
                  : 'border-gray-300 bg-white text-gray-900'">
                <option value="asc">Oldest First</option>
                <option value="desc">Newest First</option>
              </select>
            </div>
            <div class="flex flex-col lg:w-4/12">
              <label class="font-semibold text-sm"
                :class="darkMode ? 'text-gray-300' : 'text-gray-700'">From Date</label>
              <input
                type="date"
                v-model="dateFrom"
                class="border-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                :class="darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-200'
                  : 'border-gray-300 bg-white text-gray-900'"
              />
            </div>
            <div class="flex flex-col lg:w-4/12">
              <label class="font-semibold text-sm"
                :class="darkMode ? 'text-gray-300' : 'text-gray-700'">To Date</label>
              <input
                type="date"
                v-model="dateTo"
                class="border-2 px-3 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                :class="darkMode
                  ? 'border-gray-600 bg-gray-700 text-gray-200'
                  : 'border-gray-300 bg-white text-gray-900'"
              />
            </div>

            <!-- Search Bar - Full Width Mobile Optimized -->
            <div class="flex flex-col w-full sm:flex-row gap-3 items-end">
              <div class="flex-1 w-full">
                <label class="font-semibold text-sm block"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Search</label>
                <div class="relative">
                  <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="search"
                    v-model.trim="searchQuery"
                    placeholder="Search by name, email, tracking ID, remarks..."
                    class="border-2 py-1.5 rounded-lg pl-8 pr-5 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    :class="darkMode
                      ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'"
                    aria-label="Search Campus Pass requests"
                  />
                  <button
                    v-if="searchQuery"
                    @click="searchQuery = ''"
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    :class="darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-700'"
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <i class="fa fa-times-circle text-lg"></i>
                  </button>
                </div>
              </div>

              <button
                @click="
                  () => {
                    selectedStatuses = ['approved', 'pending', 'declined', 'for revision'];
                    selectedAccessTypes = [...uniqueAccessTypes];
                    sortDirection = 'asc';
                    dateFrom = '';
                    dateTo = '';
                    searchQuery = '';
                  }
                "
                class="px-4 py-2 border-2 rounded-lg font-medium transition-all whitespace-nowrap"
                :class="darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200'
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900'"
              >
                <i class="fa fa-refresh mr-2"></i>Reset Filters
              </button>
            </div>
          </div>
        </div>

        <div class="">
          <div class="w-full lg:px-5 px-2 py-2">
            <div v-show="tableDisplay">
              <!-- Header with Count -->
              <div class="bg-gradient-to-r from-green-700 to-green-800 shadow-lg rounded-lg text-white font-bold px-4 py-1 mb-1 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <i class="fa fa-list-alt text-lg"></i>
                  <span class="text-sm lg:text-base">Campus Pass Requests</span>
                </div>
                <div class="bg-white text-green-800 px-3 rounded-full text-xs lg:text-sm font-semibold">
                  {{ filteredListItems.length }} Total
                </div>
              </div>

              <div class="">
                <div
                  class="appointment-lists mx-auto text-xs"
                  :class="toggleListsName ? 'hidden' : ''"
                >
                  <!-- Improved Loading Skeleton -->
                  <div v-if="isLoading" class="space-y-3">
                    <div v-for="n in 5" :key="n" class="rounded-lg shadow-md p-4 animate-pulse"
                      :class="darkMode ? 'bg-gray-800' : 'bg-white'">
                      <div class="flex items-center gap-4">
                        <div class="w-4 h-4 bg-gray-300 rounded"></div>
                        <div class="flex-1 space-y-3">
                          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div class="flex gap-2">
                            <div class="h-3 bg-gray-200 rounded w-20"></div>
                            <div class="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                        <div class="w-24 h-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>

                  <div v-else>
                    <!-- Empty State -->
                    <div v-if="paginatedListItems.length === 0" class="text-center py-12 rounded-lg shadow-md"
                      :class="darkMode ? 'bg-gray-800' : 'bg-white'">
                      <i class="fa fa-inbox text-6xl mb-4"
                        :class="darkMode ? 'text-gray-600' : 'text-gray-300'"></i>
                      <p class="text-lg font-medium"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-500'">No requests found</p>
                      <p class="text-sm mt-2"
                        :class="darkMode ? 'text-gray-500' : 'text-gray-400'">Try adjusting your filters</p>
                    </div>

                    <!-- Table Rows - Mobile Optimized -->
                    <div class="space-y-1" v-else>
                      <div
                        class="rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border-l-4 overflow-hidden"
                        :class="[
                          darkMode ? 'bg-gray-800' : 'bg-white',
                          {
                            'border-green-500': b.approval_status === 'approved',
                            'border-gray-500': b.approval_status === 'pending',
                            'border-red-500': b.approval_status === 'declined',
                            'border-yellow-500': b.approval_status === 'for revision'
                          }
                        ]"
                        v-for="(b, i) in paginatedListItems"
                        :key="i"
                      >
                        <div class="flex items-start gap-3 px-1 pb-1">
                          <!-- Checkbox -->
                          <div class="pt-1">
                            <input
                              type="checkbox"
                              :checked="selectedItems.includes(b.id)"
                              @change="toggleItemSelection(b.id)"
                              class="h-4 w-4 lg:h-5 lg:w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer accent-green-600"
                            />
                          </div>

                          <!-- Content -->
                          <div class="flex-1 min-w-0">
                            <div class="lg:flex lg:items-center">
                            <!-- User Info Section -->
                            <div class="lg:w-5/12 w-full mb-3 lg:mb-0">
                              <div class="space-y-0">
                                <div class="flex items-center text-xs font-semibold"
                                  :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                                  <i class="fa fa-user mr-2 text-green-700"></i>
                                  <span class="truncate uppercase">
                                    {{ b.incharge_lastname }}, {{ b.incharge_firstname }}
                                    <span v-if="b.incharge_middlename !== '-'">{{ b.incharge_middlename }}</span>
                                  </span>
                                </div>
                                <div class="flex items-center text-xs"
                                  :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                                  <i class="fa fa-envelope mr-2 text-gray-400"></i>
                                  <span class="truncate">{{ b.incharge_contact_email }}</span>
                                </div>
                                <div class="flex items-center text-xs"
                                  :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                                  <i class="fa fa-phone mr-2 text-gray-400"></i>
                                  <span>{{ b.incharge_contact_number }}</span>
                                </div>
                              </div>
                            </div>
                            <!-- Schedule & Type Section -->
                            <div class="lg:w-6/12 w-full mb-3 lg:mb-0">
                              <div class="space-y-2">
                                <div class="flex items-center text-xs"
                                  :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                                  <i class="fa fa-calendar mr-2 text-green-700"></i>
                                  <span> Access Date: {{ b.schedule }}</span>
                                </div>
                                <div>
                                  <span
                                    v-for="(j, i) in normalizeTypeOfAccess(b.type_of_access)"
                                    :key="i"
                                    class="inline-block px-2 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase"
                                  >
                                    {{ j }}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <!-- Remarks & Details Section -->
                            <div class="lg:w-6/12 w-full mb-3 lg:mb-0">
                              <div class="space-y-0">
                                <div class="flex">
                                  <label class="text-[10px] font-semibold w-14 flex"
                                    :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Remarks:</label>
                                  <input
                                    type="text"
                                    v-model="b.remarks"
                                    class="border-2 rounded px-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    :class="darkMode
                                      ? 'border-gray-600 bg-gray-700 text-gray-200'
                                      : 'border-gray-300 bg-white text-gray-900'"
                                  />
                                </div>
                                <div class="flex">
                                  <label class="text-[10px] font-semibold w-14 flex"
                                    :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Details:</label>
                                  <input
                                    type="text"
                                    v-model="b.purpose"
                                    placeholder="Details"
                                    class="border-2 rounded px-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                                    :class="darkMode
                                      ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400'
                                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'"
                                  />
                                </div>
                              </div>
                            </div>
                            <!-- Attendees & Documents Section -->
                            <div class="lg:w-5/12 w-full mb-3 lg:mb-0 lg:pl-2">
                              <div class="space-y-0">
                                <div
                                  class="flex items-center justify-between px-2 rounded transition-colors"
                                  :class="darkMode
                                    ? (b.attendees === 'Group' ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' : 'hidden')
                                    : (b.attendees === 'Group' ? 'bg-gray-100 hover:bg-gray-200 cursor-pointer' : 'hidden')"
                                  @click="b.attendees === 'Group' ? btnToggleListsName(b.id) : null"
                                >
                                  <div class="flex items-center gap-2">
                                    <i class="fa fa-users"  :class="darkMode ? 'text-white' : 'text-green-700'"></i>
                                    <span class="font-semibold text-sm uppercase"
                                      :class="darkMode ? 'text-gray-200' : 'text-gray-900'">{{ b.attendees }}</span>
                                    <i
                                      v-if="b.attendees === 'Group'"
                                      class="fa fa-caret-down "
                                      :class="darkMode ? 'text-white' : 'text-green-700'"
                                    ></i>
                                  </div>
                                  <div class="flex gap-2">
                                    <a
                                      v-if="b.approved_activities_link !== '-'"
                                      :href="b.approved_activities_link"
                                      target="_blank"
                                      class="text-green-700 hover:text-green-900 transition-colors"
                                      title="Approved Activities"
                                    >
                                      <i class="fa fa-file-pdf text-lg" :class="darkMode ? 'text-white' : 'text-green-700'"></i>
                                    </a>
                                    <a
                                      v-if="b.approved_gso_docs_link !== '-'"
                                      :href="b.approved_gso_docs_link"
                                      target="_blank"
                                      class="text-green-700 hover:text-green-900 transition-colors"
                                      title="Approved GSO Docs"
                                    >
                                      <i class="fa fa-file-pdf text-lg" :class="darkMode ? 'text-white' : 'text-green-700'"></i>
                                    </a>
                                  </div>
                                </div>
                                <div class="text-xs"
                                  :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                                  <span class="font-semibold">TID:</span> {{ b.tracking_id }}
                                </div>
                              </div>
                            </div>
                            <!-- Status Section -->
                            <div class="lg:w-auto w-full lg:pl-3">
                              <div class="flex gap-1">
                                <!-- <label class="text-xs font-semibold"
                                  :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Status</label> -->
                                <select
                                  v-model="b.approval_status"
                                  class="border-2 rounded-lg px-3 py-2 text-sm font-semibold capitalize focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                  :class="{
                                    'border-red-500 bg-red-50 text-red-700': b.approval_status === 'declined',
                                    'border-gray-500 bg-gray-50 text-gray-700': b.approval_status === 'pending',
                                    'border-yellow-500 bg-yellow-50 text-yellow-700': b.approval_status === 'for revision',
                                    'border-green-500 bg-green-50 text-green-700': b.approval_status === 'approved',
                                  }"
                                  @change="requestChangeStatus(b.id, b.approval_status, b.purpose, b.remarks)"
                                >
                                  <option value="pending">Update Data</option>
                                  <option value="approved">Approved</option>
                                  <option value="declined">Declined</option>
                                  <option value="for revision">For Revision</option>
                                </select>
                              </div>
                            </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        v-show="toggleConfirmDelete"
                        class="h-screen w-full px-5 shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                        :class="darkMode ? 'bg-[#000000a3]' : 'bg-[#ffffffa3]'"
                      >
                        <div
                          class="my-[10%] w-fit mx-auto px-10 py-3 rounded-lg shadow-2xl"
                          :class="darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-900'"
                        >
                          <div class="my-6">
                            Are you sure you want to Delete?
                          </div>
                          <div class="flex gap-5 mx-auto w-fit my-5">
                            <span
                              class="bg-green-900 text-white px-3 py-1 rounded-lg cursor-pointer"
                              @click="deleteItem"
                              >Yes</span
                            >
                            <span
                              class="bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer"
                              @click="toggleDeleteBtn"
                              >Cancel</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      class="flex justify-center my-4"
                      v-if="filteredListItems.length > 0"
                    >
                      <button
                        :disabled="currentPage === 1"
                        @click="currentPage--"
                        class="px-2 py-2 mx-1 rounded"
                        :class="darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 hover:text-white text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-500 hover:text-white text-gray-900'"
                      >
                        Prev
                      </button>

                      <button
                        v-for="page in visiblePages"
                        :key="page"
                        @click="currentPage = page"
                        class="hover:bg-green-500 hover:text-white"
                        :class="{
                          'px-4 py-2 mx-1 rounded': true,
                          'bg-green-800 text-white': currentPage === page,
                          [darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-900']: currentPage !== page,
                        }"
                      >
                        {{ page }}
                      </button>

                      <button
                        :disabled="currentPage === totalPages"
                        @click="currentPage++"
                        class="px-2 py-2 mx-1 rounded"
                        :class="darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 hover:text-white text-gray-200'
                          : 'bg-gray-200 hover:bg-gray-500 hover:text-white text-gray-900'"
                      >
                        Next
                      </button>
                    </div>

                    
                  </div>
                </div>

                <div
                  v-if="toggleListsName"
                  class="w-full z-10 h-full mb-16"
                  :class="darkMode ? 'bg-gray-800' : 'bg-white'"
                >
                  <div class="border-4 shadow-lg"
                    :class="darkMode ? 'border-gray-700' : 'border-gray-100'">
                    <div class="flex items-center">
                      <div class="text-center border-b py-2 font-bold w-full"
                        :class="darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-900'">
                        List of Names
                      </div>

                      <div
                        @click="toggleListsName = !toggleListsName"
                        class="border-b border-l px-2 py-[8px]"
                        :class="darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 hover:text-gray-200 border-gray-700 text-white'
                          : 'bg-gray-600 hover:bg-white hover:text-gray-600 border-gray-200 text-white'"
                      >
                        <i class="fa fa-close" aria-hidden="true"></i>
                      </div>
                    </div>
                    <div
                      class="lg:grid grid-cols-4 lg:gap-x-3 lg:text-sm text-xs"
                    >
                      <div
                        v-for="(j, i) in displayListName"
                        :key="i"
                        class="text-left lg:px-10 px-2 py-1 mb-0.5"
                        :class="darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-900'"
                      >
                        <div>
                          {{ j.lastname }}, {{ j.firstname }} {{ j.middlename }}
                        </div>
                        <div :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                          {{ j.email }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
   
  </div>
</template>
<style scoped>
input[type="checkbox"] {
  color: #6f0000;
}

input[type="checkbox"] {
  accent-color: #6f0000;
}
</style>
