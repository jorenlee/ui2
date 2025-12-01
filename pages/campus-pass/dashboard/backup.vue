<script setup>
import { onMounted, ref, computed, watch, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import moment from "moment";
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
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
const refreshIntervalMs = 1000;

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

const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(async () => {
    if (!isQuietFetching.value && !toggleConfirmDelete.value) {
      await fetchListItemsQuietly();
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
  setTimeout(async () => {
    if (
      userStore.user.isAuthenticated &&
      (userStore.user.email === "jorenleeluna24@gmail.com" ||
        userStore.user.email === "esmael.larubis@lsu.edu.ph" ||
      userStore.user.email === "ssec@lsu.edu.ph")
    ) {
      await fetchListItems();
      router.push("/campus-pass/dashboard");
      startAutoRefresh();
    } else {
      router.push("/unauthorized");
    }
  }, 5000);

  console.log("userStore", userStore);
  await fetchListItems();
  startAutoRefresh();
});

const fetchListItems = async () => {
  try {
    listItems.value =
      (await $fetch(endpoint.value + "/api/campus-pass/list").catch(
        (error) => error.data
      )) || [];
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
const statusFilter = ref("all"); // approved | pending | declined | for revision | all
const typeFilter = ref("all");
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

// Read filters from query on load
onMounted(() => {
  const q = route.query || {};
  if (q.status) statusFilter.value = String(q.status);
  if (q.type) typeFilter.value = String(q.type);
  if (q.sort) sortDirection.value = String(q.sort) === "desc" ? "desc" : "asc";
  if (q.from) dateFrom.value = String(q.from);
  if (q.to) dateTo.value = String(q.to);
  if (q.q) searchQuery.value = String(q.q);
});

// Persist filters to query params
watch(
  [statusFilter, typeFilter, sortDirection, dateFrom, dateTo, searchQuery],
  () => {
    const q = {
      ...(statusFilter.value && statusFilter.value !== "all"
        ? { status: statusFilter.value }
        : {}),
      ...(typeFilter.value && typeFilter.value !== "all"
        ? { type: typeFilter.value }
        : {}),
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

  // Status filter
  if (statusFilter.value !== "all") {
    const wanted = statusFilter.value.toLowerCase();
    filteredItems = filteredItems.filter((it) =>
      (it.approval_status || "").toLowerCase().includes(wanted)
    );
  }

  // Type of access filter
  if (typeFilter.value !== "all") {
    filteredItems = filteredItems.filter((it) =>
      normalizeTypeOfAccess(it.type_of_access).includes(typeFilter.value)
    );
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

watch([statusFilter, typeFilter, sortDirection, dateFrom, dateTo], () => {
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
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 w-full flex overflow-hidden"
        v-show="toggleSideBarMenu"
      >
        <div class="w-full">
          <div
            class="flex items-center justify-center text-white bg-green-900 lg:py-[16px] py-[8px] sta"
          >
            <div class="flex items-center w-full px-2">
              <i class="fa fa-user mx-2" aria-hidden="true"></i>
              <h1 class="text-sm">
                {{ userStore.user.email }}
              </h1>
            </div>

            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="w-10 px-1.5 lg:hidden flex"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div class="">
            <div class="w-fit mx-auto mt-5 mb-3">
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG"
                class="lg:w-24 w-20 mx-auto"
              />
            </div>

            <div class="text-center">
              <h1 class="font-bold text-green-800 text-2xl">Dashboard</h1>
            </div>

            <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
              <a
                href="/campus-pass/dashboard"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-black hover:bg-black hover:text-white"
              >
                <i class="fa fa-list mr-3" aria-hidden="true"></i>
                All Request Lists
              </a>

              <a
                href="/"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
              >
                <i class="fa fa-globe mr-3" aria-hidden="true"></i>
                LSU HOME PAGE
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full">
        <div class="bg-green-800 w-full">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="w-auto flex items-center lg:px-1.5"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
              <p
                class="text-white whitespace-nowrap lg:ml-5 ml-3 font-bold uppercase lg:text-sm text-xs"
              >
                Campus Pass Access
              </p>
            </div>

            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <div class="bg-white border rounded-md p-2 text-xs gap-2 mt-2 mx-5">
          <div
            class="flex justify-between bg-white border-b mb-4 py-3"
          >
            <div class="flex items-center justify-between gap-x-3">
              <div class="flex items-center space-x-3">
                <!-- Select All Button -->
                <button
                  @click="handleSelectAll"
                  class="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                  <span class="font-medium text-gray-700"> Select All </span>
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

            <!-- Status pills -->
            <div class="flex gap-2 items-center mb-1 whitespace-nowrap">
              <span class="px-2 py-0.5 rounded-full text-white bg-green-700"
                >Approved: {{ statusCounts.approved }}</span
              >
              <span class="px-2 py-0.5 rounded-full text-white bg-gray-600"
                >Pending: {{ statusCounts.pending }}</span
              >
              <span class="px-2 py-0.5 rounded-full text-white bg-red-700"
                >Declined: {{ statusCounts.declined }}</span
              >
              <span class="px-2 py-0.5 rounded-full text-white bg-yellow-600"
                >For revision: {{ statusCounts["for revision"] }}</span
              >
            </div>
          </div>
          <div class="flex items-center gap-x-3">
            <div class="flex flex-col">
              <label class="font-semibold mb-0.5">Status</label>
              <select v-model="statusFilter" class="border px-2 py-1 rounded">
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
                <option value="for revision">For Revision</option>
              </select>
            </div>
            <div class="flex flex-col whitespace-nowrap">
              <label class="font-semibold mb-0.5">Type of Access</label>
              <select v-model="typeFilter" class="border px-2 py-1 rounded">
                <option value="all">All</option>
                <option
                  v-for="opt in uniqueAccessTypes"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="font-semibold mb-0.5">Sort</label>
              <select v-model="sortDirection" class="border px-2 py-1 rounded">
                <option value="asc">Oldest first (ASC)</option>
                <option value="desc">Newest first (DESC)</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="font-semibold mb-0.5">From</label>
              <input
                type="date"
                v-model="dateFrom"
                class="border px-2 py-1 rounded"
              />
            </div>
            <div class="flex flex-col">
              <label class="font-semibold mb-0.5">To</label>
              <input
                type="date"
                v-model="dateTo"
                class="border px-2 py-1 rounded"
              />
            </div>

            <div class="flex flex-col w-full">
              <label class="font-semibold mb-0.5">Search</label>
              <div class="relative">
                <i
                  class="fa fa-search absolute left-2 top-1/2 -translate-y-1/2 text-gray-500"
                ></i>
                <input
                  type="search"
                  v-model.trim="searchQuery"
                  placeholder="Name, email, TID, remarks, type..."
                  class="border px-2 py-1 rounded pl-7 pr-7 w-full"
                  aria-label="Search Campus Pass requests"
                />
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <i class="fa fa-times-circle"></i>
                </button>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="
                  () => {
                    statusFilter = 'all';
                    typeFilter = 'all';
                    sortDirection = 'asc';
                    dateFrom = '';
                    dateTo = '';
                  }
                "
                class="mt-4 border px-2 py-1 rounded hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div class="">
          <div class="w-full lg:p-5 px-2 py-2">
            <div v-show="tableDisplay">
              <div
                class="w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"
              >
                All Request Lists
              </div>
              <div class="">
                <div
                  class="appointment-lists mx-auto text-xs"
                  :class="toggleListsName ? 'hidden' : ''"
                >
                  <div v-if="isLoading" class="text-center">
                    <!-- Filters toolbar -->

                    <div class="">
                      <div class="flex animate-pulse space-x-4">
                        <div class="flex-1">
                          <div class="h-10 bg-gray-300"></div>
                          <div class="h-0.5 bg-gray-100"></div>
                          <div class="h-10 bg-gray-200"></div>
                          <div class="h-0.5 bg-gray-100"></div>
                          <div class="h-10 bg-gray-300"></div>
                          <div class="h-0.5 bg-gray-100"></div>
                          <div class="h-10 bg-gray-200"></div>
                          <div class="h-0.5 bg-gray-100"></div>
                          <div class="h-10 bg-gray-300"></div>
                          <div class="h-0.5 bg-gray-100"></div>
                          <div class="h-10 bg-gray-100"></div>
                          <div class="h-0.5 bg-gray-100"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else>
                    <div class="gap-4" v-if="paginatedListItems.length > 0">
                      <div
                        class="bg-gray-300 flex justify-evenly items-center h-auto shadow lg:mb-0 mb-5 border-gray-200 border"
                        v-for="(b, i) in paginatedListItems"
                        :key="i"
                      >
                        <div class="px-2">
                          <input   
                            type="checkbox"   
                            :checked="selectedItems.includes(b.id)"
                            @change="toggleItemSelection(b.id)"
                            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer accent-green-600"
                          />
                        </div>
                        <div class="w-full bg-white">
                          <div class="lg:flex items-center w-full">
                            <div
                              class="lg:w-5/12 w-full block text-left text-[11px] leading-tight lg:px-2 px-2 lg:py-1 py-2"
                            >
                              <div class="w-full capitalize text-xs flex">
                                <span class="max-w-[150px] truncate flex mr-1">
                                  <i class="fa fa-user mr-2.5"></i>
                                  {{ b.incharge_lastname }},
                                </span>

                                <span class="">
                                  {{ b.incharge_firstname }}
                                </span>

                                <span
                                  :class="
                                    b.incharge_middlename === '-'
                                      ? 'hidden'
                                      : ''
                                  "
                                  class="mx-1"
                                >
                                  {{ b.incharge_middlename }}
                                </span>
                              </div>
                              <div class="w-full text-xs">
                                <i class="fa fa-envelope mr-1.5"></i>
                                {{ b.incharge_contact_email }}
                              </div>
                              <div class="w-full">
                                <i class="fa fa-phone lg:mr-2 mr-1"></i>
                                {{ b.incharge_contact_number }}
                              </div>
                            </div>
                            <div class="lg:w-6/12 w-full">
                              <div
                                class="w-full font-bold pb-1 flex items-center lg:justify-start justify-center"
                              >
                                <i class="fa fa-calendar mr-2"></i>
                                {{ b.schedule }}
                              </div>
                              <div
                                class="w-full flex items-center justify-center uppercase"
                              >
                                <ul class="gap-x-0.5 flex w-full">
                                  <li
                                    v-for="(j, i) in normalizeTypeOfAccess(
                                      b.type_of_access
                                    )"
                                    :key="i"
                                    class="border px-2 lg:py-0 py-1 text-[10px] tracking-tighter w-full whitespace-nowrap lg:text-left text-center"
                                  >
                                    {{ j }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                            <div
                              class="lg:w-6/12 w-full flex items-center lg:py-0 py-4 border-r"
                            >
                              <div class="w-full">
                                <div
                                  class="flex items-center w-11/12 mx-auto mb-1"
                                >
                                  <label
                                    for="remarks"
                                    class="font-bold text-gray-800 mr-2.5"
                                    >Remarks:</label
                                  >
                                  <div class="flex w-full">
                                    <input
                                      type="text"
                                      class="border-b w-full mx-auto text-xs px-1 shadow-sm"
                                      v-model="b.remarks"
                                    />
                                  </div>
                                </div>

                                <div class="flex items-center w-11/12 mx-auto">
                                  <label
                                    for="details"
                                    class="font-bold text-gray-800 mr-5"
                                    >Details:</label
                                  >
                                  <div class="flex w-full">
                                    <input
                                      type="text"
                                      class="border-b w-full mx-auto text-xs px-1 shadow-sm"
                                      placeholder="Details"
                                      v-model="b.purpose"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              class="lg:w-5/12 w-full flex items-center text-left"
                              :class="
                                b.attendees === 'Group'
                                  ? 'cursor-pointer hover:bg-gray-300 hover:text-black bg-gray-200 py-1'
                                  : 'flex items-center py-1'
                              "
                            >
                              <div
                                class="w-full px-3 lg:block flex items-center lg:py-0 py-2"
                              >
                                <div
                                  class="font-bold uppercase lg:w-full lg:mr-0 mr-6"
                                  @click="btnToggleListsName(b.id)"
                                >
                                  {{ b.attendees }}

                                  <i
                                    class="fa fa-caret-down text-lg ml-2"
                                    :class="
                                      b.attendees === 'Group'
                                        ? 'text-green-800'
                                        : 'hidden'
                                    "
                                  ></i>
                                </div>

                                <div
                                  class="text-[10px] font-light whitespace-nowrap"
                                >
                                  TID:
                                  <span class=""> {{ b.tracking_id }}</span>
                                </div>
                              </div>

                              <div class="gap-x-5 flex w-fit mx-5 pt-1">
                                <a
                                  :href="b.approved_activities_link"
                                  target="_blank"
                                  class="font-bold w-full block text-green-800"
                                  :class="
                                    b.approved_activities_link === '-'
                                      ? 'hidden'
                                      : ''
                                  "
                                >
                                  <i class="fa fa-file-pdf text-lg"></i>

                                  <!-- Approved Activities -->
                                </a>
                                <a
                                  :href="b.approved_gso_docs_link"
                                  target="_blank"
                                  class="font-bold w-full block text-green-800"
                                  :class="
                                    b.approved_gso_docs_link === '-'
                                      ? 'hidden'
                                      : ''
                                  "
                                >
                                  <i class="fa fa-file-pdf text-lg"></i>
                                  <!-- Approved Booking GSO -->
                                </a>
                              </div>
                            </div>
                            <div
                              class="lg:w-3/12 w-full flex items-center justify-center py-1 border-b"
                              :class="{
                                'bg-red-700': b.approval_status === 'declined',
                                'bg-gray-700': b.approval_status === 'pending',
                                'bg-yellow-500':
                                  b.approval_status === 'for revision',
                                'bg-green-900':
                                  b.approval_status === 'approved',
                              }"
                            >
                              <div class="flex w-full">
                                <div
                                  class="w-fit mx-auto lg:py-1 py-3 flex items-center"
                                >
                                  <div
                                    class="lg:block flex items-center w-full"
                                  >
                                    <label
                                      class="font-bold block text-white lg:mr-0 mr-2"
                                      >Status</label
                                    >
                                    <select
                                      v-model="b.approval_status"
                                      name="borrower_category"
                                      class="shadow block font-bold rounded-md w-fit border pb-0.5 border-[#e5e7eb] capitalize"
                                      required
                                      @change="
                                        requestChangeStatus(
                                          b.id,
                                          b.approval_status,
                                          b.purpose,
                                          b.remarks
                                        )
                                      "
                                    >
                                      <option value="pending">
                                        Update Data
                                      </option>
                                      <option value="approved">Approved</option>
                                      <option value="declined">declined</option>
                                      <option value="for revision">
                                        revision
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            </div>

                          
                          </div>
                        </div>
                      </div>

                      <div
                        v-show="toggleConfirmDelete"
                        class="h-screen w-full px-5 bg-[#ffffffa3] shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                      >
                        <div
                          class="my-[10%] bg-white w-fit mx-auto px-10 py-3 rounded-lg shadow-2xl"
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
                      class="flex justify-center my-4 pb-10"
                      v-if="filteredListItems.length > 0"
                    >
                      <button
                        :disabled="currentPage === 1"
                        @click="currentPage--"
                        class="px-2 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-500 hover:text-white"
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
                          'bg-gray-200': currentPage !== page,
                        }"
                      >
                        {{ page }}
                      </button>

                      <button
                        :disabled="currentPage === totalPages"
                        @click="currentPage++"
                        class="px-2 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-500 hover:text-white"
                      >
                        Next
                      </button>
                    </div>

                    <div v-else-if="!isLoading" class="text-center my-5">
                      No items found!
                    </div>
                  </div>
                </div>

                <div
                  v-if="toggleListsName"
                  class="w-full z-10 bg-white h-full mb-16"
                >
                  <div class="border-4 border-gray-100 shadow-lg">
                    <div class="flex items-center">
                      <div class="text-center border-b py-2 font-bold w-full">
                        List of Names
                      </div>

                      <div
                        @click="toggleListsName = !toggleListsName"
                        class="bg-gray-600 hover:bg-white hover:text-gray-600 border-b border-l text-white px-2 py-[8px]"
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
                        class="text-left lg:px-10 px-2 py-1 bg-gray-100 mb-0.5"
                      >
                        <div>
                          {{ j.lastname }}, {{ j.firstname }} {{ j.middlename }}
                        </div>
                        <div>
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
    <div class="w-full">
      <DashboardFooter />
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
