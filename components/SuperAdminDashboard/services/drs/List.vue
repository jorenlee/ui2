<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "./css/main.css";
import _ from "lodash";

const props = defineProps({ darkMode: Boolean });
const { user } = useAuth();

// CSV download allowed emails
const drsAdminEmails = [
  "meredith.embuscado@lsu.edu.ph",
  "macristina.llauder@lsu.edu.ph",
  "jorenlee.luna@lsu.edu.ph",
  "michaeljohn.puertogalera@lsu.edu.ph",
  "recordsmanagement@lsu.edu.ph",
];

const drsAdmins = computed(() => {
  return drsAdminEmails.includes(user.value?.email);
});

const canEditReviewedBy = computed(() => {
  if (!filteredItems || !user.value?.email) return false;
  return (
    filteredItems.reviewed_by_email === user.value?.email ||
    drsAdminEmails.includes(user.value?.email)
  );
});

const canEditApprovedBy = computed(() => {
  if (!filteredItems || !user.value?.email) return false;
  return (
    filteredItems.approved_by_email === user.value?.email ||
    drsAdminEmails.includes(user.value?.email)
  );
});

const canEditOriginatingSection = computed(() => {
  if (!filteredItems || !user.value?.email) return false;
  return (
    filteredItems.originating_email === user.value?.email ||
    drsAdminEmails.includes(user.value?.email)
  );
});

const updateButtonText = computed(() => {
  if (!filteredItems || !user.value?.email) return "Update";

  if (filteredItems.approved_by_email === user.value?.email) {
    return "Approved";
  }

  if (filteredItems.reviewed_by_email === user.value?.email) {
    return "Reviewed";
  }

  return "Update";
});

const listItems = ref(null);
const effectivityDate = ref(null);
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
let deleteIDItem = ref();
let tableDisplay = ref(true);
let toggleConfirmDelete = ref(false);
const confirmModal = ref(false);
const displayUpdateForm = ref(false);
const statusNotificationAlertModal = ref(false);
const isUpdating = ref(false);
let filteredItems;
const selectedDocumentType = ref("");
const selectedOriginatingOffice = ref("");
const selectedStatus = ref("");
const selectedAll = ref(null);
const selectedReviewed = ref(false);
const selectedVerified = ref(false);
const selectedApproved = ref(false);

// Dynamic year range for date picker (current year)
const currentYear = computed(() => new Date().getFullYear());
// Universal search
const searchQuery = ref("");
// Date sort order
const dateSortOrder = ref("newest");

const documentTypeList = ref([
  "Form or Template",
  "Manual",
  "MOA or MOU",
  "Policy",
  "Portfolio",
  "Procedure",
  "Records",
  "Reports",
  "Work Instructions",
]);

// Auto-refresh interval
let refreshInterval = null;

onMounted(async () => {
  await fetchListItems(); // Ensure fetchListItems completes before navigation

  // Start auto-refresh every second (silently in background)
  refreshInterval = setInterval(async () => {
    await fetchListItemsSilently();
  }, 1000);
});

// Cleanup on unmount
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Helper function to set pagination
const setPagination = (itemCount) => {
  currentPage.value = 1;
  itemsPerPage = 100;
  maxVisiblePages = itemCount <= 100 ? 1 : 5;
};

// Admin emails list
// const adminEmails = [
//   "president@lsu.edu.ph",
//   "rey.mejias@lsu.edu.ph",
//   "meredith.embuscado@lsu.edu.ph",
//   "macristina.llauder@lsu.edu.ph",
//   "recordsmanagement@lsu.edu.ph",
//   "wenny.caseros@lsu.edu.ph"
// ];

const fetchListItems = async () => {
  try {
    isLoading.value = true;
    listItems.value =
      (await $fetch(endpoint.value + "/api/drs/list").catch(
        (error) => error.data,
      )) || [];

    // Calculate filter counts
    reviewedLength.value = listItems.value.filter(
      (item) => item.reviewed_by_action === "Approved",
    ).length;

    verifiedLength.value = listItems.value.filter(
      (item) => item.verified_by_action === "Approved",
    ).length;

    approvedLength.value = listItems.value.filter(
      (item) => item.approved_by_action === "Approved",
    ).length;

    filteredItems = Array.isArray(listItems.value) ? [...listItems.value] : [];

    // Set default filter values
    selectedDocumentType.value = "Document Type";
    selectedOriginatingOffice.value = "Originating Office";
    selectedStatus.value = "Status";

    // User-specific configurations
    const userEmail = user.value?.email;

    selectedAll.value = false;
    selectedOriginatingOffice.value = filteredItems[0]?.originating_office;
    unitOfficeSelectedTotalLength.value = filteredItems.length;
    documentTypeSelectedTotalLength.value = 0;
    statusSelectedTotalLength.value = 0;
    setPagination(filteredItems.length);
  } catch (error) {
    console.error("Error fetching list items:", error);
  } finally {
    isLoading.value = false;
  }
};

// Silent fetch for background updates (no loading indicator)
const fetchListItemsSilently = async () => {
  try {
    const newData =
      (await $fetch(endpoint.value + "/api/drs/list").catch(
        (error) => error.data,
      )) || [];

    // Only update if data has changed
    if (JSON.stringify(newData) !== JSON.stringify(listItems.value)) {
      listItems.value = newData;

      reviewedLength.value = listItems.value.filter(
        (item) => item.reviewed_by_action === "Approved",
      ).length;

      verifiedLength.value = listItems.value.filter(
        (item) => item.verified_by_action === "Approved",
      ).length;

      approvedLength.value = listItems.value.filter(
        (item) => item.approved_by_action === "Approved",
      ).length;
    }
  } catch (error) {
    console.error("Silent fetch error:", error);
  }
};

let reviewedLength = ref(0);
let verifiedLength = ref(0);
let approvedLength = ref(0);

let unitOfficeSelectedTotalLength = ref(0);
let documentTypeSelectedTotalLength = ref(0);
let statusSelectedTotalLength = ref(0);

const isLoading = ref(true); // Add loading state

// CSV Download Function
const downloadCSV = () => {
  try {
    // Get the current filtered items
    const dataToExport = filteredListItems.value;

    if (!dataToExport || dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV headers based on the info structure
    const headers = [
      "Tracking ID",
      "Document Attachment",
      "Document Title",
      "Document Type",
      "Status",
      "Document Code",
    ];

    // Convert data to CSV rows
    const csvRows = [headers.join(",")];

    dataToExport.forEach((item) => {
      const row = [
        item.tracking_id || "",
        item.document_attachment || "",
        `"${(item.document_title || "").replace(/"/g, '""')}"`,
        item.document_type || "",
        item.status || "",
        item.document_code || "",
      ];
      csvRows.push(row.join(","));
    });

    // Create CSV content
    const csvContent = csvRows.join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Generate filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `DRS_Export_${date}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    alert("Error downloading CSV. Please try again.");
  }
};

const filteredListItems = computed(() => {
  filteredItems = Array.isArray(listItems.value) ? [...listItems.value] : [];

  // Apply checkbox filters first
  if (selectedAll.value) {
    // Show all items
    selectedReviewed.value = false;
    selectedVerified.value = false;
    selectedApproved.value = false;
  } else {
    if (selectedReviewed.value) {
      filteredItems = filteredItems.filter(
        (item) => item.reviewed_by_action === "Approved",
      );
    }

    if (selectedVerified.value) {
      filteredItems = filteredItems.filter(
        (item) => item.verified_by_action === "Approved",
      );
    }

    if (selectedApproved.value) {
      filteredItems = filteredItems.filter(
        (item) => item.approved_by_action === "Approved",
      );
    }
  }

  // Apply universal search filter
  if (searchQuery.value && searchQuery.value.trim() !== "") {
    const query = searchQuery.value.toLowerCase().trim();
    filteredItems = filteredItems.filter((item) => {
      return (
        item.document_title?.toLowerCase().includes(query) ||
        item.document_code?.toLowerCase().includes(query) ||
        item.document_type?.toLowerCase().includes(query) ||
        item.originating_office?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query) ||
        item.originating_firstname?.toLowerCase().includes(query) ||
        item.originating_lastname?.toLowerCase().includes(query) ||
        item.revision_number?.toLowerCase().includes(query) ||
        String(item.id)?.includes(query)
      );
    });
  }

  // Reset page to 1 if filtered results change
  if (filteredItems.length <= 10) {
    currentPage.value = 1;
  }

  // Apply date sorting based on dateSortOrder
  if (dateSortOrder.value === "newest") {
    filteredItems = _.orderBy(filteredItems, ["id"], ["desc"]);
  } else if (dateSortOrder.value === "oldest") {
    filteredItems = _.orderBy(filteredItems, ["id"], ["asc"]);
  }

  return filteredItems;
});
let displayRevision = ref(null);
const statusChange = () => {
  if (filteredItems.status === "New") {
    filteredItems.status = "New";
    displayRevision.value = false;
    filteredItems.revision_number = "";
  }
  if (filteredItems.status === "For Revision") {
    filteredItems.status = "For Revision";
    displayRevision.value = true;
  }
};

// Sorting functionality
const sortColumn = ref("id");
const sortDirection = ref("desc");

const sortBy = (column) => {
  if (sortColumn.value === column) {
    // Toggle direction if same column
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    // Set new column and default to ascending
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const filteredActions = reactive({
  reviewed_by_action: "",
  verified_by_action: "",
  approved_by_action: "",
});

const actionChecked = () => {
  const actions = {
    reviewedByAction: "reviewed_by_action",
    verifiedByAction: "verified_by_action",
    approvedByAction: "approved_by_action",
  };

  for (const actionKey in actions) {
    const approvedElement = document.getElementById(actionKey + "Approved");
    const disapprovedElement = document.getElementById(
      actionKey + "Disapproved",
    );
    const conditionalElement = document.getElementById(
      actionKey + "Conditional",
    );

    if (approvedElement?.checked) {
      filteredActions[actions[actionKey]] = approvedElement.value;
    } else if (disapprovedElement?.checked) {
      filteredActions[actions[actionKey]] = disapprovedElement.value;
    } else if (conditionalElement?.checked) {
      filteredActions[actions[actionKey]] = conditionalElement.value;
    }
  }
};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  deleteIDItem.value = id;
};
const deleteItem = async () => {
  await $fetch(endpoint.value + "/api/drs/delete/" + deleteIDItem.value, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    await fetchListItems();
    toggleConfirmDelete.value = !toggleConfirmDelete.value;
  });
};

const goToEdit = async (id) => {
  filteredItems = await $fetch(endpoint.value + "/api/drs/" + id + "/").catch(
    (error) => error.data,
  );
  displayUpdateForm.value = true;
};

const refetchAllData = async () => {
  displayUpdateForm.value = false;

  // Optionally reset filters when refetching all data
  selectedDocumentType.value = "All";
  selectedOriginatingOffice.value = "All";
  selectedStatus.value = "All";

  isLoading.value = true;

  fetchListItems();
};

const updateData = async (id) => {
  isUpdating.value = true;
  filteredItems.effectivity_date = effectivityDate.value;
  await $fetch(endpoint.value + "/api/drs/edit/" + id + "/", {
    method: "PUT",
    body: filteredItems,
  })
    .then(() => {
      isUpdating.value = false;
      statusNotificationAlertModal.value = true;

      setTimeout(() => {
        statusNotificationAlertModal.value = false;
        submitDRSFormToGmailRMO();
        refetchAllData();
      }, 2000);
    })
    .catch(() => {
      isUpdating.value = false;
    });
};

// Pagination configuration
let currentPage = ref(1);
let itemsPerPage = 100;
let maxVisiblePages = 5;

const totalPages = computed(() => {
  return Math.ceil(filteredListItems.value.length / itemsPerPage);
});

const paginatedListItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredListItems.value.slice(startIndex, endIndex);
});

const visiblePages = computed(() => {
  const pages = [];
  const startPage = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2),
  );
  const endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);
  const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

  for (let i = adjustedStartPage; i <= endPage; i++) {
    pages.push(i);
  }
  return pages;
});

const submitDRSFormToGmailRMO = async () => {
  await $fetch(endpoint.value + "/api/drs/drs-notification-rmo/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: filteredItems,
  });
};
</script>
<template>
  <div>
    <div class="lg:flex min-h-screen">
      <div class="w-full">
        <div v-if="!displayUpdateForm">
          <div class="p-2">
            <div v-show="tableDisplay">
              <div class="lg:flex items-center gap-x-3 pb-5">
                <div class="flex items-center gap-x-2">
                  <div
                    class="flex items-center font-bold text-sm lg:text-base"
                    :class="darkMode ? 'text-green-400' : 'text-green-800'"
                  >
                    <i class="fa fa-filter mr-2"></i>
                    <span class="lg:flex hidden">Filters</span>
                  </div>
                  <div class="flex gap-2">
                    <label
                      class="inline-flex items-center lg:px-3 px-1.5 lg:py-2 py-1 shadow-lg text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all border-2"
                      :class="[
                        selectedAll
                          ? 'bg-green-700 text-white border-green-700'
                          : darkMode
                            ? 'bg-gray-800 text-green-400 border-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700'
                            : 'bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300',
                      ]"
                      for="checkboxAll"
                    >
                      <input
                        type="checkbox"
                        id="checkboxAll"
                        class="mr-2 w-4 h-4 accent-green-600"
                        value="all"
                        v-model="selectedAll"
                      />
                      All
                      <span
                        v-if="listItems"
                        class="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="
                          selectedAll
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800'
                        "
                        >{{ listItems.length }}</span
                      >
                    </label>

                    <label
                      class="inline-flex items-center lg:px-3 px-1.5 lg:py-2 py-1 shadow-lg text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all border-2"
                      :class="[
                        selectedReviewed
                          ? 'bg-green-700 text-white border-green-700'
                          : darkMode
                            ? 'bg-gray-800 text-green-400 border-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700'
                            : 'bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300',
                      ]"
                      for="checkboxReviewed"
                    >
                      <input
                        type="checkbox"
                        id="checkboxReviewed"
                        class="mr-2 w-4 h-4 accent-green-600"
                        value="Reviewed"
                        v-model="selectedReviewed"
                      />
                      <span class="lg:flex hidden">Reviewed</span>

                      <span class="lg:hidden flex">
                        <i class="fa fa-clock"></i>
                      </span>
                      <span
                        class="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="
                          selectedReviewed
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800'
                        "
                        >{{ reviewedLength }}</span
                      >
                    </label>

                    <label
                      class="inline-flex items-center lg:px-3 px-1.5 lg:py-2 py-1 shadow-lg text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all border-2"
                      :class="[
                        selectedApproved
                          ? 'bg-green-700 text-white border-green-700'
                          : darkMode
                            ? 'bg-gray-800 text-green-400 border-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700'
                            : 'bg-white text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300',
                      ]"
                      for="checkboxApproved"
                    >
                      <input
                        type="checkbox"
                        id="checkboxApproved"
                        class="mr-2 w-4 h-4 accent-green-600"
                        value="Approved"
                        v-model="selectedApproved"
                      />

                      <span class="lg:flex hidden">Approved</span>

                      <span class="lg:hidden flex">
                        <i class="fa fa-check"></i>
                      </span>
                      <span
                        class="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                        :class="
                          selectedApproved
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 text-green-800'
                        "
                        >{{ approvedLength }}</span
                      >
                    </label>
                  </div>
                </div>
                <!-- Universal Search Input -->
                <div class="w-full lg:my-0 my-3">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
                    >
                      <i
                        class="fa fa-search"
                        :class="darkMode ? 'text-green-400' : 'text-green-700'"
                      ></i>
                    </div>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by title, code, type, office, status, name, ID..."
                      class="pl-10 pr-4 w-full border-2 shadow-lg rounded-full h-10 lg:h-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      :class="
                        darkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400 focus:border-green-500'
                          : 'border-green-700 bg-white text-gray-900 placeholder-gray-500 focus:border-green-500'
                      "
                    />
                  </div>
                </div>

                <!-- Date Sort Buttons -->
                <div class="flex gap-2 lg:mt-0 mt-3 justify-between">
                  <div class="flex space-x-3">
                    <button
                      @click="dateSortOrder = 'newest'"
                      class="px-4 lg:py-2 py-1 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
                      :class="
                        dateSortOrder === 'newest'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-green-500'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                      "
                    >
                      <i class="fa fa-arrow-down"></i>
                      <span class="hidden sm:inline">Newest</span>
                    </button>
                    <button
                      @click="dateSortOrder = 'oldest'"
                      class="px-4 lg:py-2 py-1 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg"
                      :class="
                        dateSortOrder === 'oldest'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : darkMode
                            ? 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-green-500'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-500'
                      "
                    >
                      <i class="fa fa-arrow-up"></i>
                      <span class="hidden sm:inline">Oldest</span>
                    </button>
                  </div>

                  <button
                    v-if="drsAdmins"
                    @click="downloadCSV"
                    class="px-4 lg:py-2 py-1 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                    title="Download filtered data as CSV"
                  >
                    <i class="fa fa-download"></i>
                    <span class="">CSV</span>
                  </button>
                </div>
              </div>

              <div class="relative">
                <div class="appointment-lists mx-auto text-xs">
                  <div class="text-xs">
                    <div
                      class="lg:flex hidden pb-2 pt-2.5 px-3 gap-x-6"
                      :class="
                        darkMode
                          ? 'bg-green-900 text-gray-200'
                          : 'bg-green-800 text-white'
                      "
                    >
                      <div
                        class="w-full mx-auto cursor-pointer px-2 py-1 rounded"
                        :class="
                          darkMode ? 'hover:bg-green-700' : 'hover:bg-green-950'
                        "
                        @click="sortBy('originating_office')"
                      >
                        Office
                        <i
                          v-if="sortColumn === 'originating_office'"
                          :class="
                            sortDirection === 'asc'
                              ? 'fa fa-arrow-up'
                              : 'fa fa-arrow-down'
                          "
                          class="ml-1"
                        ></i>
                        <i v-else class="fa fa-sort ml-1"></i>
                      </div>

                      <div
                        class="w-full mx-auto cursor-pointer px-2 py-1 rounded"
                        :class="
                          darkMode ? 'hover:bg-green-700' : 'hover:bg-green-950'
                        "
                        @click="sortBy('document_title')"
                      >
                        Document Title
                        <i
                          v-if="sortColumn === 'document_title'"
                          :class="
                            sortDirection === 'asc'
                              ? 'fa fa-arrow-up'
                              : 'fa fa-arrow-down'
                          "
                          class="ml-1"
                        ></i>
                        <i v-else class="fa fa-sort ml-1"></i>
                      </div>

                      <div class="w-1/12 pr-4 py-1 pl-16 text-center">Action</div>
                    </div>

                    <div v-if="isLoading" class="text-center">
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
                      <div
                        v-if="paginatedListItems.length > 0"
                        class="lg:border-0 border-0"
                      >
                        <div
                          class="lg:flex text-left items-stretch h-auto lg:px-3 px-2 lg:gap-x-6 gap-y-2 py-1 lg:mb-0 mb-3 lg:border-b border rounded-lg lg:rounded-none cursor-pointer transition-all duration-200 group"
                          :class="[
                            darkMode
                              ? i % 2 === 0
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-gray-900 border-gray-700'
                              : i % 2 === 0
                                ? 'bg-white border-gray-200'
                                : 'bg-gray-100 border-gray-200',
                            darkMode
                              ? 'hover:bg-gray-700 hover:shadow-lg hover:scale-[1.01] lg:hover:scale-100'
                              : 'hover:bg-green-50 hover:shadow-lg hover:scale-[1.01] lg:hover:scale-100',
                          ]"
                          v-for="(b, i) in paginatedListItems"
                          :key="i"
                          @click="goToEdit(b.id)"
                        >
                          <!-- Mobile: Card Layout -->
                          <div class="lg:hidden space-y-2">
                            <div class="lg:flex lg:justify-between items-start">
                              <div class="lg:flex-1 mb-2">
                                <div
                                  class="text-xs uppercase font-semibold mb-1"
                                  :class="
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  "
                                >
                                  Office
                                </div>
                                <div
                                  class="font-medium text-sm"
                                  :class="
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  "
                                >
                                  {{ b.originating_office }}
                                </div>
                              </div>
                              <template
                                v-if="
                                  b.originating_email === user?.email ||
                                  drsAdminEmails.includes(user?.email)
                                "
                              >
                                <button
                                  v-if="b.other_comments_remarks"
                                  class="mr-3 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md transition-all transform hover:scale-105"
                                  @click="goToEdit(b.id)"
                                  title="Records Manager Comment"
                                >
                                  <i
                                    class="fa fa-comment"
                                    aria-hidden="true"
                                  ></i>
                                </button>

                                <a
                                  v-if="b.document_attachment"
                                  :href="b.document_attachment"
                                  target="_blank"
                                  class="mr-3 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md transition-all transform hover:scale-105 inline-flex items-center gap-1.5"
                                  title="Open in Google Drive"
                                >
                                  <i class="fab fa-google-drive"></i>
                                  <i class="fa fa-external-link text-xs"></i>
                                </a>
                                <button
                                  v-else
                                  class="mr-3 bg-gray-400 text-white px-3 py-1.5 rounded-md cursor-not-allowed opacity-50"
                                  disabled
                                  title="No document attached"
                                >
                                  <i class="fab fa-google-drive"></i>
                                </button>
                                <button
                                  class="mr-3 w-14 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition-all transform hover:scale-105"
                                  @click="goToEdit(b.id)"
                                  title="Edit"
                                >
                                  <i
                                    class="fa fa-pencil"
                                    aria-hidden="true"
                                  ></i>
                                </button>
                                <button
                                  class="mr-3 w-14 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-all transform hover:scale-105"
                                  @click="toggleDeleteBtn(b.id)"
                                  title="Delete"
                                >
                                  <i class="fa fa-trash" aria-hidden="true"></i>
                                </button>
                              </template>
                            </div>

                            <div>
                              <div
                                class="text-xs uppercase font-semibold mb-1"
                                :class="
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                "
                              >
                                Document Title
                              </div>
                              <div
                                class="font-medium text-sm"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-gray-900'
                                "
                              >
                                {{ b.document_title }}
                              </div>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                              <div>
                                <div
                                  class="text-xs uppercase font-semibold mb-1"
                                  :class="
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  "
                                >
                                  Status
                                </div>
                                <div class="text-sm">
                                  <span
                                    class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="
                                      b.status === 'New'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-orange-100 text-orange-800'
                                    "
                                  >
                                    {{ b.status }}
                                  </span>
                                  <span
                                    v-if="b.revision_number"
                                    class="ml-1 text-xs"
                                    :class="
                                      darkMode
                                        ? 'text-gray-400'
                                        : 'text-gray-600'
                                    "
                                    >No. {{ b.revision_number }}</span
                                  >
                                </div>
                              </div>
                              <div>
                                <div
                                  class="text-xs uppercase font-semibold mb-1"
                                  :class="
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  "
                                >
                                  Type
                                </div>
                                <div class="text-sm">{{ b.document_type }}</div>
                              </div>
                            </div>

                            <div>
                              <div
                                class="text-xs text-gray-500 uppercase font-semibold mb-1"
                              >
                                Document Code
                              </div>
                              <div class="text-sm font-mono">
                                <span
                                  v-if="
                                    b.document_code !== 'To Be Assigned By RMO'
                                  "
                                  >{{ b.document_code }}</span
                                >
                                {{ b.tracking_id }}
                              </div>
                            </div>
                          </div>

                          <!-- Desktop: Table Row Layout -->
                          <div class="hidden lg:contents">
                            <div class="w-full flex items-center px-2">
                              <div>
                                <div
                                  class="text-sm tracking-tighter whitespace-nowrap"
                                >
                                  {{ b.originating_office }}
                                </div>
                                <div class="capitalize">
                                  {{ b.originating_firstname }}
                                </div>
                                <div>
                                  {{ b.originating_email }}
                                </div>
                              </div>
                            </div>

                            <div class="w-full flex items-center px-2">
                              <div class="text-sm">
                                <div class="font-medium">
                                  {{ b.document_type }} : {{ b.document_title }}
                                </div>
                                <div
                                  class="text-xs"
                                  :class="
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  "
                                >
                                  <span
                                    v-if="
                                      b.document_code !==
                                      'To Be Assigned By RMO'
                                    "
                                    :class="
                                      darkMode ? 'text-white' : 'text-gray-900'
                                    "
                                    class="font-mono"
                                    >{{ b.document_code }}</span
                                  >
                                </div>
                                <div
                                  class="text-xs"
                                  :class="
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  "
                                >
                                  <span
                                    class="font-mono"
                                    :class="
                                      darkMode ? 'text-white' : 'text-gray-900'
                                    "
                                    >{{ b.tracking_id }}</span
                                  >
                                </div>
                              </div>
                            </div>

                            <div
                              class="w-2/12 flex items-center justify-end"
                              @click.stop
                            >
                              <div class="gap-x-2 space-y-2" :class="drsAdminEmails.includes(user?.email) ? 'py-2':''">
                                <template
                                  v-if="
                                    b.originating_email === user?.email ||
                                    drsAdminEmails.includes(user?.email)
                                  "
                                >
                                  <a
                                    v-if="b.document_attachment"
                                    :href="b.document_attachment"
                                    target="_blank"
                                    class="block bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md transition-all transform hover:scale-105 items-center gap-2"
                                    title="Open in Google Drive"
                                  >
                                    <i class="fab fa-google-drive mr-2"></i>
                                    <i class="fa fa-external-link text-xs"></i>
                                  </a>
                                  <button
                                    v-if="b.other_comments_remarks"
                                    class="block w-14 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-all transform hover:scale-105"
                                    @click="goToEdit(b.id)"
                                    title="Records Manager Comment"
                                  >
                                    <i
                                      class="fa fa-comment"
                                      aria-hidden="true"
                                    ></i>
                                  </button>

                                  <button
                                    class="block w-14 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md transition-all transform hover:scale-105"
                                    @click="goToEdit(b.id)"
                                    title="Edit"
                                  >
                                    <i
                                      class="fa fa-pencil"
                                      aria-hidden="true"
                                    ></i>
                                  </button>
                                  <button
                                    class="block w-14 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition-all transform hover:scale-105"
                                    @click="toggleDeleteBtn(b.id)"
                                    title="Delete"
                                  >
                                    <i
                                      class="fa fa-trash"
                                      aria-hidden="true"
                                    ></i>
                                  </button>
                                </template>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#ffffff59] w-full h-screen flex items-center"
                          v-show="confirmModal"
                        >
                          <div
                            class="w-fit mx-auto flex items-center shadow-2xl border-2 rounded-lg py-2 bg-white"
                          >
                            <div class="flex items-center">
                              <div class="font-bold pl-5 pr-10">
                                Confirm Remarks:
                              </div>
                              <div class="flex gap-10 mr-10">
                                <span
                                  class="px-3 uppercase py-1 rounded-lg bg-green-900 border hover:border-green-900 hover:bg-white hover:text-green-900 text-white font-bold cursor-pointer"
                                  @click="btnConfirm"
                                  >yes</span
                                >
                                <span
                                  class="px-3 uppercase py-1 rounded-lg bg-red-700 border hover:border-red-700 hover:bg-white hover:text-green-900 text-white font-bold cursor-pointer"
                                  @click="btnCloseModal"
                                  >no</span
                                >
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- Delete Confirmation Modal -->
                        <div
                          v-show="toggleConfirmDelete"
                          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
                          @click.self="toggleDeleteBtn"
                        >
                          <div
                            class="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all"
                            @click.stop
                          >
                            <!-- Modal Header -->
                            <div
                              class="flex items-center gap-3 p-6 border-b border-gray-200"
                            >
                              <div
                                class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"
                              >
                                <i
                                  class="fa fa-exclamation-triangle text-red-600 text-xl"
                                ></i>
                              </div>
                              <div>
                                <h3 class="text-lg font-semibold text-gray-900">
                                  Confirm Delete
                                </h3>
                                <p class="text-sm text-gray-500">
                                  This action cannot be undone
                                </p>
                              </div>
                            </div>

                            <!-- Modal Body -->
                            <div class="p-6">
                              <p class="text-gray-700">
                                Are you sure you want to delete this document?
                                This will permanently remove the document from
                                the system.
                              </p>
                            </div>

                            <!-- Modal Footer -->
                            <div class="flex gap-3 p-6 bg-gray-50 rounded-b-xl">
                              <button
                                class="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                                @click="toggleDeleteBtn"
                              >
                                Cancel
                              </button>
                              <button
                                class="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all transform hover:scale-105"
                                @click="deleteItem"
                              >
                                <i class="fa fa-trash mr-2"></i>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- Pagination -->
                      <div
                        class="flex flex-col items-center my-4 gap-y-2"
                        v-if="filteredListItems.length > 0"
                      >
                        <!-- Page info -->
                        <div
                          class="text-xs"
                          :class="darkMode ? 'text-white' : 'text-gray-900'"
                        >
                          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
                          {{
                            Math.min(
                              currentPage * itemsPerPage,
                              filteredListItems.length,
                            )
                          }}
                          of {{ filteredListItems.length }} entries
                        </div>

                        <!-- Pagination buttons -->
                        <div
                          v-if="totalPages > 1"
                          class="flex items-center gap-x-1"
                        >
                          <button
                            :disabled="currentPage === 1"
                            @click="currentPage--"
                            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>

                          <button
                            v-for="page in visiblePages"
                            :key="page"
                            @click="currentPage = page"
                            class="px-4 py-2 rounded hover:bg-green-500 hover:text-white transition-colors"
                            :class="{
                              'bg-green-800 text-white': currentPage === page,
                              'bg-gray-200': currentPage !== page,
                            }"
                          >
                            {{ page }}
                          </button>

                          <button
                            :disabled="currentPage === totalPages"
                            @click="currentPage++"
                            class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>

                      <div v-else-if="!isLoading" class="text-center my-5">
                        No items found!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="displayUpdateForm">
          <div class="w-full lg:p-5 px-2 py-2">
            <div>
              <form>
                <div
                  class="shadow-lg mx-auto"
                  :class="darkMode ? 'bg-gray-800' : 'bg-white'"
                >
                  <div class="">
                    <h2
                      class="lg:text-base text-xs px-10 uppercase py-1.5 font-bold text-center border-2"
                      :class="
                        darkMode
                          ? 'text-green-400 border-gray-700 bg-gray-800'
                          : 'text-green-900 border-gray-100 bg-white'
                      "
                    >
                      Document Review Sheet Form
                    </h2>
                    <div
                      class="w-fit mx-auto text-xs mt-4 px-4 font-montserrat tracking-tight"
                      :class="darkMode ? 'text-gray-300' : 'text-gray-900'"
                    >
                      DRS No.
                      <span
                        class="border-b px-1"
                        :class="
                          darkMode ? 'border-gray-600' : 'border-gray-400'
                        "
                        >{{ filteredItems.tracking_id }}</span
                      >
                    </div>
                    <div class="lg:px-2 pt-3 pb-2 gap-3">
                      <div class="w-full lg:mb-0 mb-5">
                        <div class="w-full gap-3">
                          <div class="gap-3 w-full">
                            <div
                              class="gap-3 lg:mb-2 lg:w-6/12 mx-auto py-5 lg:px-5 px-3"
                            >
                              <div class="lg:gap-x-2 gap-x-1 w-full">
                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Attached Document
                                    </div>
                                  </label>

                                  <div
                                    class="w-full flex items-center gap-x-1 border-b-2 rounded-sm h-fit"
                                    :class="
                                      darkMode
                                        ? 'bg-gray-700 border-gray-600'
                                        : 'bg-white border-green-700'
                                    "
                                  >
                                    <img
                                      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/Google_Drive.png"
                                      class="h-5 w-5 ml-2"
                                    />
                                    <input
                                      type="url"
                                      class="px-1 w-full border-t-0 border-x-0 text-xs py-1.5"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                          : 'bg-white border-gray-400 text-gray-900 placeholder-gray-500'
                                      "
                                      placeholder="Google Drive Link"
                                      v-model="
                                        filteredItems.document_attachment
                                      "
                                      :disabled="!canEditOriginatingSection"
                                    />
                                    <a
                                      :href="filteredItems.document_attachment"
                                      target="_blank"
                                    >
                                      <i
                                        class="fa fa-external-link px-2"
                                        :class="
                                          darkMode
                                            ? 'text-green-400'
                                            : 'text-green-800'
                                        "
                                      ></i>
                                    </a>
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Document Title
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="text"
                                      class="px-2 w-full border-green-700 border-b-2 border-t-0 border-x-0 rounded-sm py-2 text-xs"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                          : 'bg-white border-gray-400 text-gray-900 placeholder-gray-500'
                                      "
                                      placeholder="Document Title"
                                      v-model="filteredItems.document_title"
                                      :disabled="!canEditOriginatingSection"
                                    />
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] pb-2 font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode ? 'text-gray-300' : 'text-black'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Document Type
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <select
                                      v-model="filteredItems.document_type"
                                      class="lg:w-7/12 w-full border-green-700 border-b-2 border-t-0 border-x-0 rounded-sm py-2 text-xs pr-10"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                                          : 'bg-white border-gray-400 text-gray-900'
                                      "
                                      required
                                      :disabled="!canEditOriginatingSection"
                                    >
                                      <option
                                        value="Document Type"
                                        disabled
                                        selected
                                      >
                                        Document Type
                                      </option>
                                      <option
                                        :value="j"
                                        v-for="(j, i) in documentTypeList"
                                        :key="i"
                                      >
                                        {{ j }}
                                      </option>
                                    </select>
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] pb-2 font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode ? 'text-gray-300' : 'text-black'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Status
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <div
                                      class="flex lg:w-fit lg:px-0 border-b-2"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600'
                                          : 'bg-white border-green-700'
                                      "
                                    >
                                      <div
                                        class="px-1 text-xs items-center flex"
                                        :class="
                                          darkMode
                                            ? 'text-gray-200'
                                            : 'text-black'
                                        "
                                      >
                                        <span>
                                          <input
                                            type="radio"
                                            value="New"
                                            v-model="filteredItems.status"
                                            class="mr-1"
                                            id="New"
                                            @change="statusChange"
                                            :disabled="
                                              !canEditOriginatingSection
                                            "
                                          />
                                        </span>
                                        <label class="ml-2 py-2" for="New">
                                          <span class="font-bold">New</span>
                                        </label>
                                      </div>
                                      <div
                                        class="flex items-center text-xs whitespace-nowrap px-1"
                                      >
                                        <label
                                          class="ml-2 flex items-center w-full text-xs"
                                          :class="
                                            darkMode
                                              ? 'text-gray-200'
                                              : 'text-black'
                                          "
                                          for="ForRevision"
                                        >
                                          <span class="mr-2">
                                            <input
                                              type="radio"
                                              value="For Revision"
                                              v-model="filteredItems.status"
                                              class=""
                                              id="ForRevision"
                                              @change="statusChange"
                                              :disabled="
                                                !canEditOriginatingSection
                                              "
                                            />
                                          </span>

                                          <span class="font-bold mr-1"
                                            >For Revision</span
                                          >

                                          <div
                                            v-if="
                                              displayRevision ||
                                              filteredItems.revision_number
                                            "
                                            class="flex items-center"
                                          >
                                            <div class="font-bold mr-2">
                                              No.
                                            </div>
                                            <input
                                              type="text"
                                              class="px-2 w-full border-b-2 border-t-0 border-x-0 py-1 rounded-sm text-xs"
                                              :class="
                                                darkMode
                                                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                                  : 'bg-white border-gray-400 text-gray-900 placeholder-gray-500'
                                              "
                                              placeholder="Revision Number"
                                              v-model="
                                                filteredItems.revision_number
                                              "
                                              ref="fileInput"
                                              :disabled="
                                                !canEditOriginatingSection
                                              "
                                            />
                                          </div>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Originating Office
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="text"
                                      class="px-2 w-full border-green-700 border-b-2 border-t-0 border-x-0 rounded-sm py-2 text-xs"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                                          : 'bg-white border-gray-400 text-gray-900'
                                      "
                                      placeholder="Originating Office"
                                      v-model="filteredItems.originating_office"
                                      disabled
                                    />
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Originating Fullname
                                    </div>
                                  </label>

                                  <div class="w-full">
                                    <input
                                      type="text"
                                      class="capitalize px-2 w-full border-green-700 border-b-2 border-t-0 border-x-0 rounded-sm py-2 text-xs"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                                          : 'bg-white border-gray-400 text-gray-900'
                                      "
                                      placeholder="Originating Office"
                                      v-model="
                                        filteredItems.originating_firstname
                                      "
                                      disabled
                                    />
                                  </div>
                                </div>
                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Originating Email
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="email"
                                      class="px-2 lg:w-7/12 w-full border-b-2 border-t-0 border-x-0 rounded-sm py-2 text-xs"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                          : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                                      "
                                      placeholder="Email"
                                      v-model="filteredItems.originating_email"
                                      disabled
                                    />
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] font-bold whitespace-nowrap lg:w-5/12"
                                    :class="
                                      darkMode
                                        ? 'text-gray-300'
                                        : 'text-gray-900'
                                    "
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Date Submitted
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <div
                                      class="px-2 lg:w-6/12 w-full border-b-2 border-t-0 border-x-0 rounded-sm py-2 text-xs"
                                      :class="
                                        darkMode
                                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                                          : 'bg-[#EFEFEF4D] border-green-700 text-gray-900'
                                      "
                                    >
                                      {{ filteredItems.schedule }}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="px-2">
                      <div class="lg:flex gap-x-5">
                        <div
                          class="lg:gap-x-10 gap-x-1 w-full shadow lg:px-5 px-3 py-3 my-5"
                          :class="darkMode ? 'bg-gray-800' : 'bg-white'"
                        >
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Reviewed By
                            </label>
                            <div class="w-full">
                              <div class="text-center flex">
                                <input
                                  type="text"
                                  class="px-2 w-full rounded-sm h-fit py-1 text-sm text-center"
                                  :class="
                                    darkMode
                                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                                      : 'bg-white border-gray-400 text-gray-900'
                                  "
                                  placeholder=""
                                  v-model="filteredItems.reviewed_by_name"
                                  :disabled="!canEditReviewedBy"
                                />
                              </div>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="border-t-2 text-center text-xs w-full"
                                  :class="
                                    darkMode
                                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                                      : 'bg-white border-black text-gray-900'
                                  "
                                  placeholder=""
                                  v-model="
                                    filteredItems.reviewed_by_designation
                                  "
                                  :disabled="!canEditReviewedBy"
                                />
                                <input
                                  v-model="filteredItems.reviewed_by_email"
                                  class="text-center text-xs w-full h-fit -mt-0.5 block"
                                  type="email"
                                  :disabled="!canEditReviewedBy"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Action
                            </label>
                            <div
                              class="flex lg:gap-x-3 w-full lg:px-0 lg:shadow border-b-2"
                              :class="
                                darkMode
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-white border-green-700'
                              "
                            >
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Approved"
                                    v-model="filteredItems.reviewed_by_action"
                                    class="mr-1"
                                    id="reviewedByActionApproved"
                                    name="reviewedByAction"
                                    @change="actionChecked()"
                                    :disabled="!canEditReviewedBy"
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="reviewedByActionApproved"
                                  >
                                    <span
                                      :class="
                                        !canEditReviewedBy
                                          ? ''
                                          : 'hover:font-bold'
                                      "
                                      >Approved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Disapproved"
                                    v-model="filteredItems.reviewed_by_action"
                                    class="mr-1"
                                    id="reviewedByActionDisapproved"
                                    name="reviewedByAction"
                                    @change="actionChecked()"
                                    :disabled="!canEditReviewedBy"
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="reviewedByActionDisapproved"
                                  >
                                    <span
                                      :class="
                                        !canEditReviewedBy
                                          ? ''
                                          : 'hover:font-bold'
                                      "
                                      >Disapproved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Conditional"
                                    v-model="filteredItems.reviewed_by_action"
                                    class="mr-1"
                                    id="reviewedByActionConditional"
                                    name="reviewedByAction"
                                    @change="actionChecked()"
                                    :disabled="!canEditReviewedBy"
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="reviewedByActionConditional"
                                  >
                                    <span
                                      :class="
                                        !canEditReviewedBy
                                          ? ''
                                          : 'hover:font-bold'
                                      "
                                      >Conditional</span
                                    >
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Comments or Remarks
                            </label>
                            <textarea
                              type="text"
                              class="px-2 w-full border-b-2 border-t-0 border-x-0 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                              :class="
                                darkMode
                                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                  : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                              "
                              placeholder="Comments or Remarks"
                              v-model="filteredItems.reviewed_by_remarks"
                              :disabled="!canEditReviewedBy"
                            >
                            </textarea>
                          </div>
                        </div>
                        <div
                          class="lg:gap-x-10 gap-x-1 w-full shadow lg:px-5 px-3 py-3 my-5 hidden"
                          :class="darkMode ? 'bg-gray-800' : 'bg-white'"
                        >
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Reviewed By
                            </label>
                            <div class="w-full">
                              <div class="text-center flex">
                                <input
                                  type="text"
                                  class="px-2 w-full rounded-sm h-fit py-1 text-sm text-center"
                                  :class="
                                    darkMode
                                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                                      : 'bg-white border-gray-400 text-gray-900'
                                  "
                                  placeholder=""
                                  v-model="filteredItems.verified_by_name"
                                />
                              </div>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="border-t-2 text-center text-xs w-full"
                                  :class="
                                    darkMode
                                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                                      : 'bg-white border-black text-gray-900'
                                  "
                                  placeholder=""
                                  v-model="
                                    filteredItems.verified_by_designation
                                  "
                                />
                                <input
                                  v-model="filteredItems.verified_by_email"
                                  class="text-center text-xs w-full h-fit -mt-0.5 block"
                                  type="email"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Action
                            </label>
                            <div
                              class="flex gap-x-3 w-full lg:shadow border-b-2"
                              :class="
                                darkMode
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-white border-green-700'
                              "
                            >
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full pb-2.5 text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Approved"
                                    v-model="filteredItems.verified_by_action"
                                    id="verifiedByActionApproved"
                                    name="verifiedByAction"
                                    @change="actionChecked()"
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="verifiedByActionApproved"
                                  >
                                    <span class="hover:font-bold"
                                      >Approved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full pb-2.5 text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Disapproved"
                                    v-model="filteredItems.verified_by_action"
                                    id="verifiedByActionDisapproved"
                                    name="verifiedByAction"
                                    @change="actionChecked()"
                                  />
                                  <label
                                    class="ml-2"
                                    for="verifiedByActionDisapproved"
                                  >
                                    <span class="hover:font-bold"
                                      >Disapproved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full pb-2.5 text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Conditional"
                                    v-model="filteredItems.verified_by_action"
                                    id="verifiedByActionConditional"
                                    name="verifiedByAction"
                                    @change="actionChecked()"
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="verifiedByActionConditional"
                                  >
                                    <span class="hover:font-bold"
                                      >Conditional</span
                                    >
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Comments or Remarks
                            </label>
                            <textarea
                              type="text"
                              class="px-2 w-full border-b-2 border-t-0 border-x-0 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                              :class="
                                darkMode
                                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                  : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                              "
                              placeholder="Comments or Remarks"
                              v-model="filteredItems.verified_by_remarks"
                            >
                            </textarea>
                          </div>
                        </div>
                        <div
                          class="lg:gap-x-10 gap-x-1 w-full shadow lg:px-5 px-3 py-3 my-5"
                          :class="darkMode ? 'bg-gray-800' : 'bg-white'"
                        >
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Approved By
                            </label>
                            <div class="w-full">
                              <div class="text-center flex">
                                <input
                                  type="text"
                                  class="px-2 w-full rounded-sm h-fit py-1 text-sm text-center"
                                  :class="
                                    darkMode
                                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                                      : 'bg-white border-gray-400 text-gray-900'
                                  "
                                  placeholder=""
                                  v-model="filteredItems.approved_by_name"
                                  :disabled="!canEditApprovedBy"
                                />
                              </div>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="border-t-2 text-center text-xs w-full"
                                  :class="
                                    darkMode
                                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                                      : 'bg-white border-black text-gray-900'
                                  "
                                  placeholder=""
                                  v-model="
                                    filteredItems.approved_by_designation
                                  "
                                  :disabled="!canEditApprovedBy"
                                />

                                <input
                                  v-model="filteredItems.approved_by_email"
                                  class="text-center text-xs w-full h-fit -mt-0.5 block"
                                  type="email"
                                  :disabled="!canEditApprovedBy"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Action
                            </label>
                            <div
                              class="flex gap-x-3 w-full lg:shadow border-b-2"
                              :class="
                                darkMode
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-white border-green-700'
                              "
                            >
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Approved"
                                    v-model="filteredItems.approved_by_action"
                                    class="mr-1"
                                    id="approvedByActionApproved"
                                    name="approvedByAction"
                                    @change="actionChecked()"
                                    :disabled="!canEditApprovedBy"
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="approvedByActionApproved"
                                  >
                                    <span
                                      :class="
                                        !canEditApprovedBy
                                          ? ''
                                          : 'hover:font-bold'
                                      "
                                      >Approved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Disapproved"
                                    v-model="filteredItems.approved_by_action"
                                    class="mr-1"
                                    id="approvedByActionDisapproved"
                                    name="approvedByAction"
                                    @change="actionChecked()"
                                    :disabled="!canEditApprovedBy"
                                  />

                                  <label
                                    class="ml-0.5"
                                    for="approvedByActionDisapproved"
                                  >
                                    <span
                                      :class="
                                        !canEditApprovedBy
                                          ? ''
                                          : 'hover:font-bold'
                                      "
                                      >Disapproved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-xs items-center flex"
                                :class="
                                  darkMode ? 'text-gray-200' : 'text-black'
                                "
                              >
                                <div
                                  class="w-fit mx-auto flex items-center space-x-1"
                                >
                                  <input
                                    type="radio"
                                    value="Conditional"
                                    v-model="filteredItems.approved_by_action"
                                    class="mr-1"
                                    id="approvedByActionConditional"
                                    name="approvedByAction"
                                    @change="actionChecked()"
                                    :disabled="!canEditApprovedBy"
                                  />

                                  <label
                                    class="ml-0.5"
                                    for="approvedByActionConditional"
                                  >
                                    <span
                                      :class="
                                        !canEditApprovedBy
                                          ? ''
                                          : 'hover:font-bold'
                                      "
                                      >Conditional</span
                                    >
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] pb-2 font-bold"
                              :class="
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              "
                            >
                              Comments or Remarks
                            </label>
                            <textarea
                              type="text"
                              class="px-2 w-full border-b-2 border-t-0 border-x-0 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                              :class="
                                darkMode
                                  ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                  : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                              "
                              placeholder="Comments or Remarks"
                              v-model="filteredItems.approved_by_remarks"
                              :disabled="!canEditApprovedBy"
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div
                        class="lg:flex lg:gap-x-2 gap-x-1 w-full shadow px-3 py-3 my-5"
                        :class="darkMode ? 'bg-gray-800' : 'bg-white'"
                      >
                        <div class="w-full">
                          <div class="lg:flex gap-x-3">
                            <div class="lg:w-6/12 w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] pb-2 font-bold"
                                :class="
                                  darkMode ? 'text-gray-300' : 'text-gray-900'
                                "
                              >
                                Records Management Officer (RMO)
                              </label>
                              <input
                                type="text"
                                class="px-2 w-full border-b-2 border-t-0 border-x-0 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                :class="
                                  darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                    : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                                "
                                placeholder="Records Management Officer (RMO)"
                                v-model="filteredItems.rmo_name"
                                :disabled="!drsAdmins"
                              />
                            </div>
                            <div class="lg:w-4/12 w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] pb-2 font-bold"
                                :class="
                                  darkMode ? 'text-gray-300' : 'text-gray-900'
                                "
                              >
                                Document Code
                              </label>
                              <input
                                type="text"
                                class="px-2 w-full border-b-2 border-t-0 border-x-0 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                :class="
                                  darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                    : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                                "
                                placeholder="Document Code"
                                v-model="filteredItems.document_code"
                                required
                              />
                            </div>

                            <div class="lg:w-5/12 w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] pb-2 font-bold"
                                :class="
                                  darkMode ? 'text-gray-300' : 'text-gray-900'
                                "
                              >
                                Effectivity Date
                              </label>
                              <div
                                class="border-b-2 shadow-lg"
                                :class="
                                  darkMode
                                    ? 'border-gray-600'
                                    : 'border-green-700'
                                "
                              >
                                <VueDatePicker
                                  v-model="effectivityDate"
                                  :enable-time-picker="false"
                                  name="date"
                                  auto-apply
                                  :year-range="[
                                    currentYear - 5,
                                    currentYear + 5,
                                  ]"
                                  week-start="0"
                                  :dark="darkMode"
                                />
                              </div>
                            </div>

                            <div class="w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] pb-2 font-bold"
                                :class="
                                  darkMode ? 'text-gray-300' : 'text-gray-900'
                                "
                              >
                                Other Comment and Remarks
                              </label>
                              <input
                                type="text"
                                class="px-2 w-full border-b-2 border-t-0 border-x-0 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                                :class="
                                  darkMode
                                    ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                                    : 'bg-white border-green-700 text-gray-900 placeholder-gray-500'
                                "
                                placeholder="Other Comment and Remarks"
                                v-model="filteredItems.other_comments_remarks"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-if="statusNotificationAlertModal"
                      class="my-10 text-white bg-green-800 font-bold text-center py-2 lg:w-11/12 mx-auto px-5 block lg:text-sm text-xs"
                    >
                      Updated!
                    </div>
                    <div class="pb-5 lg:px-5 px-3 mb-5 flex gap-x-3">
                      <button
                        @click="refetchAllData()"
                        class="px-10 lg:rounded-lg rounded-md bg-gray-500 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-gray-500 hover:text-gray-500 lg:text-sm text-xs cursor-pointer transition-all"
                      >
                        <i class="fa fa-arrow-left mr-2" aria-hidden="true"></i>
                        Back
                      </button>
                      <button
                        :disabled="isUpdating"
                        class="px-10 lg:rounded-lg rounded-md bg-yellow-500 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-yellow-500 hover:text-yellow-500 lg:text-sm text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        @click="updateData(filteredItems.id)"
                      >
                        <i
                          v-if="!isUpdating"
                          class="fa fa-paper-plane mr-2"
                          aria-hidden="true"
                        ></i>
                        <i
                          v-if="isUpdating"
                          class="fa fa-spinner fa-spin mr-2"
                          aria-hidden="true"
                        ></i>
                        {{ isUpdating ? "Updating..." : updateButtonText }}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
