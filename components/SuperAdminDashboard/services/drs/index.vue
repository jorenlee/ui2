<script setup>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useUserStore } from "@/stores/user";
import VueDatePicker from "@vuepic/vue-datepicker";
import "./css/main.css";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const superAdminEmail = ref("jorenlee.luna@lsu.edu.ph");
const superAdminTwo = ref("macristina.llauder@lsu.edu.ph");
import designationJSON from "./designation.json";
import authorizedEmailsJSON from "./authorized_emails.json";

const designation = ref(designationJSON);
const authorizedEmails = ref(authorizedEmailsJSON);

const listItems = ref(null);

const effectivityDate = ref(null);

// Dynamic year range for date picker (current year)
const currentYear = computed(() => new Date().getFullYear());

// Universal search
const searchQuery = ref("");

const documentTypeList = ref([
  "All",
  "Manual",
  "Procedure",
  "Policy",
  "Form or Template",
  "Work Instructions",
  "MOA or MOU",
  "Portfolio",
]);

const statusList = ref(["All", "New", "For Revision"]);

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

let deleteIDItem = ref();
let tableDisplay = ref(true);
let toggleSideBarMenu = ref(false);
let toggleConfirmDelete = ref(false);
const confirmModal = ref(false);

const displayUpdateForm = ref(false);

const statusNotificationAlertModal = ref(false);

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

let filteredItems;
const selectedDocumentType = ref("");
const selectedOriginatingOffice = ref("");
const selectedStatus = ref("");

const selectedAll = ref(null);
const selectedReviewed = ref(false);
const selectedVerified = ref(false);
const selectedApproved = ref(false);

// Helper function to set pagination
const setPagination = (itemCount) => {
  currentPage.value = 1;
  itemsPerPage = 100;
  maxVisiblePages = itemCount <= 100 ? 1 : 5;
};

// Admin emails list
const adminEmails = [
  superAdminEmail.value,
  "president@lsu.edu.ph",
  "rey.mejias@lsu.edu.ph",
  "meredith.embuscado@lsu.edu.ph",
  "macristina.llauder@lsu.edu.ph",
  "recordsmanagement@lsu.edu.ph",
  "wenny.caseros@lsu.edu.ph",
];

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
    const userEmail = userStore.user.email;

    if (adminEmails.includes(userEmail)) {
      selectedAll.value = true;
      setPagination(filteredItems.length);
    } else if (userEmail === "jorenlee.luna@lsu.edu.ph") {
      selectedReviewed.value = true;
      setPagination(filteredItems.length);
    } else if (userEmail === "jason.yap@lsu.edu.ph") {
      selectedVerified.value = true;
      setPagination(filteredItems.length);
    } else {
      selectedAll.value = false;
      selectedOriginatingOffice.value = filteredItems[0]?.originating_office;
      unitOfficeSelectedTotalLength.value = filteredItems.length;
      documentTypeSelectedTotalLength.value = 0;
      statusSelectedTotalLength.value = 0;
      setPagination(filteredItems.length);
    }
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

  // Apply sorting
  return _.orderBy(filteredItems, [sortColumn.value], [sortDirection.value]);
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
  console.log(filteredItems);

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

  console.log(filteredActions);
};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  deleteIDItem.value = id;
};
const deleteItem = async () => {
  await $fetch(endpoint.value + "/api/drs/delete/" + deleteIDItem.value, {
    method: "DELETE",
    headers: {
      Authorization: userStore.user.token,
      "Content-Type": "application/json",
    },
  }).then(async (response) => {
    console.log("response", response);
    await fetchListItems();
    toggleConfirmDelete.value = !toggleConfirmDelete.value;
  });
};
const logOut = () => {
  userStore.removeToken();
  router.push("/drs/login");
};

const goToEdit = async (id) => {
  filteredItems = await $fetch(endpoint.value + "/api/drs/" + id + "/").catch(
    (error) => error.data,
  );

  console.log(filteredItems);
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
  console.log(id);
  filteredItems.effectivity_date = effectivityDate.value;
  await $fetch(endpoint.value + "/api/drs/edit/" + id + "/", {
    method: "PUT",
    body: filteredItems,
  }).then((response) => {
    statusNotificationAlertModal.value = true;

    setTimeout(() => {
      statusNotificationAlertModal.value = false;
      submitDRSFormToGmailRMO();
      refetchAllData();
    }, 2000);
  });
};

const updateReviewed = async (id) => {
  console.log(id);
  filteredItems.effectivity_date = effectivityDate.value;
  await $fetch(endpoint.value + "/api/drs/edit/" + id + "/", {
    method: "PUT",
    body: filteredItems,
  }).then((response) => {
    statusNotificationAlertModal.value = true;

    setTimeout(() => {
      statusNotificationAlertModal.value = false;
      submitDRSFormToGmailReviewed();
      refetchAllData();
    }, 2000);
  });
};

const updateVerified = async (id) => {
  console.log(id);
  filteredItems.effectivity_date = effectivityDate.value;
  await $fetch(endpoint.value + "/api/drs/edit/" + id + "/", {
    method: "PUT",
    body: filteredItems,
  }).then((response) => {
    statusNotificationAlertModal.value = true;

    setTimeout(() => {
      statusNotificationAlertModal.value = false;
      submitDRSFormToGmailVerified();
      refetchAllData();
    }, 2000);
  });
};

const updateApproved = async (id) => {
  console.log(id);
  filteredItems.effectivity_date = effectivityDate.value;
  await $fetch(endpoint.value + "/api/drs/edit/" + id + "/", {
    method: "PUT",
    body: filteredItems,
  }).then((response) => {
    statusNotificationAlertModal.value = true;

    setTimeout(() => {
      statusNotificationAlertModal.value = false;
      submitDRSFormToGmailApproved();
      refetchAllData();
    }, 2000);
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
  }).then((response) => {
    console.log(response);
    console.log("Details Updated");
  });
};

const submitDRSFormToGmailReviewed = async () => {
  await $fetch(endpoint.value + "/api/drs/drs-notification-reviewed/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: filteredItems,
  }).then((response) => {
    console.log(response);
    console.log("Gmail Reviewed");
  });
};

const submitDRSFormToGmailVerified = async () => {
  await $fetch(endpoint.value + "/api/drs/drs-notification-verified/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: filteredItems,
  }).then((response) => {
    console.log(response);
    console.log("Gmail Verified");
  });
};

const submitDRSFormToGmailApproved = async () => {
  await $fetch(endpoint.value + "/api/drs/drs-notification-approved/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: filteredItems,
  }).then((response) => {
    console.log(response);
    console.log("Gmail Approved");
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
              <div class="lg:flex items-center gap-x-3 py-5">
                <div class="flex items-center gap-x-2">
                  <div class="flex items-center font-bold text-sm lg:text-base text-green-800">
                    <i class="fa fa-filter mr-2"></i>
                    <span>Filters</span>
                  </div>
                  <div class="flex gap-2">
                    <label
                      v-if="
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminEmail ||
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'meredith.embuscado@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'macristina.llauder@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'recordsmanagement@lsu.edu.ph'
                      "
                      class="inline-flex items-center px-3 py-2 bg-white shadow-lg text-green-900 hover:bg-green-700 hover:text-white text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all"
                      :class="selectedAll ? 'bg-green-700 text-white' : ''"
                      for="checkboxAll"
                    >
                      <input
                        type="checkbox"
                        id="checkboxAll"
                        class="mr-2 w-4 h-4"
                        value="all"
                        v-model="selectedAll"
                      />
                      All
                      <span v-if="listItems" class="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{{ listItems.length }}</span>
                    </label>

                    <label
                      v-if="
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminEmail ||
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'meredith.embuscado@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'macristina.llauder@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'recordsmanagement@lsu.edu.ph'
                      "
                      class="inline-flex items-center px-3 py-2 bg-white shadow-lg text-green-900 hover:bg-green-700 hover:text-white text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all"
                      :class="selectedReviewed ? 'bg-green-700 text-white' : ''"
                      for="checkboxReviewed"
                    >
                      <input
                        type="checkbox"
                        id="checkboxReviewed"
                        class="mr-2 w-4 h-4"
                        value="Approved"
                        v-model="selectedReviewed"
                      />
                      Reviewed
                      <span class="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{{ reviewedLength }}</span>
                    </label>

                    <label
                      v-if="
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminEmail ||
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'meredith.embuscado@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'macristina.llauder@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'recordsmanagement@lsu.edu.ph'
                      "
                      class="inline-flex items-center px-3 py-2 bg-white shadow-lg text-green-900 hover:bg-green-700 hover:text-white text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all"
                      :class="selectedVerified ? 'bg-green-700 text-white' : ''"
                      for="checkboxVerified"
                    >
                      <input
                        type="checkbox"
                        id="checkboxVerified"
                        class="mr-2 w-4 h-4"
                        value="Approved"
                        v-model="selectedVerified"
                      />
                      Verified
                      <span class="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{{ verifiedLength }}</span>
                    </label>

                    <label
                      v-if="
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminEmail ||
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'meredith.embuscado@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'macristina.llauder@lsu.edu.ph' ||
                        userStore.user.email?.trim().toLowerCase() ===
                          'recordsmanagement@lsu.edu.ph'
                      "
                      class="inline-flex items-center px-3 py-2 bg-white shadow-lg text-green-900 hover:bg-green-700 hover:text-white text-center cursor-pointer rounded-full text-xs lg:text-sm font-medium transition-all"
                      :class="selectedApproved ? 'bg-green-700 text-white' : ''"
                      for="checkboxApproved"
                    >
                      <input
                        type="checkbox"
                        id="checkboxApproved"
                        class="mr-2 w-4 h-4"
                        value="Approved"
                        v-model="selectedApproved"
                      />
                      Approved
                      <span class="ml-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{{ approvedLength }}</span>
                    </label>
                  </div>
                </div>
                <!-- Universal Search Input -->
                <div class="w-full">
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <i class="fa fa-search text-green-700"></i>
                    </div>
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Search by title, code, type, office, status, name, ID..."
                      class="pl-10 pr-4 w-full border-2 border-green-700 shadow-lg rounded-full h-10 lg:h-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div class="relative">
                <div class="appointment-lists mx-auto text-xs">
                  <div class="text-xs">
                    <div
                      class="lg:flex hidden bg-green-800 text-white pb-2 pt-2.5 px-3 gap-x-6"
                    >
                      <div
                        class="w-full mx-auto cursor-pointer hover:bg-green-700 px-2 py-1 rounded"
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
                        class="w-full mx-auto cursor-pointer hover:bg-green-700 px-2 py-1 rounded"
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
                      <div
                        class="w-full mx-auto cursor-pointer hover:bg-green-700 px-2 py-1 rounded"
                        @click="sortBy('document_type')"
                      >
                        Document Type
                        <i
                          v-if="sortColumn === 'document_type'"
                          :class="
                            sortDirection === 'asc'
                              ? 'fa fa-arrow-up'
                              : 'fa fa-arrow-down'
                          "
                          class="ml-1"
                        ></i>
                        <i v-else class="fa fa-sort ml-1"></i>
                      </div>

                      <div class="w-3/12 mx-auto text-center">Action</div>
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
                          class="lg:flex text-left items-stretch h-auto lg:px-3 px-2 lg:gap-x-6 gap-y-2 border-gray-200 py-1 lg:mb-0 mb-3 lg:border-b border rounded-lg lg:rounded-none cursor-pointer transition-all duration-200 group"
                          :class="[
                            i % 2 === 0 ? 'bg-white' : 'bg-gray-100',
                            'hover:bg-green-50 hover:shadow-lg hover:scale-[1.01] lg:hover:scale-100'
                          ]"
                          v-for="(b, i) in paginatedListItems"
                          :key="i"
                          @click="goToEdit(b.id)"
                        >
                          <!-- Mobile: Card Layout -->
                          <div class="lg:hidden space-y-2">
                            <div class="flex justify-between items-start">
                              <div class="flex-1">
                                <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Office</div>
                                <div class="font-medium text-sm">{{ b.originating_office }}</div>
                              </div>
                              <div class="flex gap-x-2" @click.stop>
                                <button
                                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition-colors"
                                  @click="goToEdit(b.id)"
                                >
                                  <i class="fa fa-pencil" aria-hidden="true"></i>
                                </button>
                                <button
                                  v-if="userStore.user.email?.trim().toLowerCase() === superAdminEmail || userStore.user.email?.trim().toLowerCase() === superAdminTwo"
                                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-colors"
                                  @click="toggleDeleteBtn(b.id)"
                                >
                                  <i class="fa fa-trash" aria-hidden="true"></i>
                                </button>
                              </div>
                            </div>

                            <div>
                              <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Document Title</div>
                              <div class="font-medium text-sm">{{ b.document_title }}</div>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                              <div>
                                <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Status</div>
                                <div class="text-sm">
                                  <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="b.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'">
                                    {{ b.status }}
                                  </span>
                                  <span v-if="b.revision_number" class="ml-1 text-xs">No. {{ b.revision_number }}</span>
                                </div>
                              </div>
                              <div>
                                <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Type</div>
                                <div class="text-sm">{{ b.document_type }}</div>
                              </div>
                            </div>

                            <div>
                              <div class="text-xs text-gray-500 uppercase font-semibold mb-1">Document Code</div>
                              <div class="text-sm font-mono">
                                <span v-if="b.document_code !== 'To Be Assigned By RMO'">{{ b.document_code }}</span>
                                {{ b.tracking_id }}
                              </div>
                            </div>
                          </div>

                          <!-- Desktop: Table Row Layout -->
                          <div class="hidden lg:contents">
                            <div class="w-full flex items-center px-2">
                              <div class="text-sm">{{ b.originating_office }}</div>
                            </div>

                            <div class="w-full flex items-center px-2">
                              <div class="text-sm">
                                <div class="font-medium">{{ b.document_title }}</div>
                                <div class="text-xs text-gray-600 mt-1">
                                  <span v-if="b.document_code !== 'To Be Assigned By RMO'" class="font-mono">{{ b.document_code }}</span>
                                  <span class="font-mono">{{ b.tracking_id }}</span>
                                </div>
                              </div>
                            </div>

                            <div class="w-full flex items-center px-2">
                              <div class="text-sm">
                                <div>
                                  <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                                    :class="b.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'">
                                    {{ b.status }}
                                  </span>
                                  <span v-if="b.revision_number" class="ml-1 text-xs text-gray-600">No. {{ b.revision_number }}</span>
                                </div>
                                <div class="mt-1 text-gray-700">{{ b.document_type }}</div>
                              </div>
                            </div>

                            <div class="w-3/12 flex items-center justify-center" @click.stop>
                              <div class="flex gap-x-2">
                                <button
                                  class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition-all transform hover:scale-105"
                                  @click="goToEdit(b.id)"
                                  title="Edit"
                                >
                                  <i class="fa fa-pencil" aria-hidden="true"></i>
                                </button>
                                <button
                                  v-if="userStore.user.email?.trim().toLowerCase() === superAdminEmail || userStore.user.email?.trim().toLowerCase() === superAdminTwo"
                                  class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-all transform hover:scale-105"
                                  @click="toggleDeleteBtn(b.id)"
                                  title="Delete"
                                >
                                  <i class="fa fa-trash" aria-hidden="true"></i>
                                </button>
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
                            <div class="flex items-center gap-3 p-6 border-b border-gray-200">
                              <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <i class="fa fa-exclamation-triangle text-red-600 text-xl"></i>
                              </div>
                              <div>
                                <h3 class="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                                <p class="text-sm text-gray-500">This action cannot be undone</p>
                              </div>
                            </div>

                            <!-- Modal Body -->
                            <div class="p-6">
                              <p class="text-gray-700">
                                Are you sure you want to delete this document? This will permanently remove the document from the system.
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
                        <div class="text-xs text-gray-600">
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
                <div class="shadow-lg mx-auto">
                  <div class="">
                    <h2
                      class="lg:text-base text-xs px-10 uppercase py-1.5 font-bold text-green-900 text-center border-2 border-gray-100"
                    >
                      Document Review Sheet Form
                      <!-- <span class="font-light text-xs bg-green-900 text-white block">
                        {{ filteredItems.document_code }}</span> -->
                    </h2>
                    <div
                      class="w-fit mx-auto text-xs mt-4 px-4 font-montserrat tracking-tight"
                    >
                      DRS No.
                      <span class="border-b px-1">{{
                        filteredItems.tracking_id
                      }}</span>
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
                                    class="lg:text-xs text-[10px] text-gray-900 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Attached Document
                                    </div>
                                  </label>

                                  <div
                                    class="w-full flex items-center gap-x-1 bg-white border-b-2 border-green-700 rounded-sm h-fit"
                                  >
                                    <img
                                      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/Google_Drive.png"
                                      class="h-5 w-5 ml-2"
                                    />
                                    <input
                                      type="url"
                                      class="px-1 w-full border-t-0 border-x-0 border-gray-400 text-xs py-1.5"
                                      placeholder="Google Drink Link"
                                      v-model="
                                        filteredItems.document_attachment
                                      "
                                      :disabled="
                                        !(
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            filteredItems.reviewed_by_email ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            filteredItems.originating_email ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            superAdminEmail ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() === superAdminTwo
                                        )
                                      "
                                    />
                                    <a
                                      :href="filteredItems.document_attachment"
                                      target="_blank"
                                    >
                                      <i
                                        class="fa fa-external-link px-2 text-green-800"
                                      ></i>
                                    </a>
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-gray-900 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Originating Office
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="text"
                                      class="px-2 w-full border-b-2 border-t-0 border-x-0 border-gray-400 rounded-sm py-2 text-xs"
                                      placeholder="Originating Office"
                                      v-model="filteredItems.originating_office"
                                      disabled
                                    />
                                  </div>
                                </div>

                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-gray-900 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Document Title
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="text"
                                      class="px-2 w-full border-b-2 border-t-0 border-x-0 border-gray-400 rounded-sm py-2 text-xs"
                                      placeholder="Document Title"
                                      v-model="filteredItems.document_title"
                                      :disabled="
                                        !(
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            filteredItems.reviewed_by_email ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            superAdminEmail ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() === superAdminTwo
                                        )
                                      "
                                    />
                                  </div>
                                </div>
                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-gray-900 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Originating Email
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="email"
                                      class="px-2 lg:w-7/12 w-full border-b-2 border-t-0 border-x-0 border-gray-400 rounded-sm py-2 text-xs"
                                      placeholder="Email"
                                      v-model="filteredItems.originating_email"
                                      :disabled="
                                        !(
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            filteredItems.reviewed_by_email ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() ===
                                            superAdminEmail ||
                                          userStore.user.email
                                            ?.trim()
                                            .toLowerCase() === superAdminTwo
                                        )
                                      "
                                    />
                                  </div>
                                </div>
                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Document Type
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <select
                                      v-model="filteredItems.document_type"
                                      class="lg:w-7/12 w-full border-b-2 border-t-0 border-x-0 border-gray-400 rounded-sm py-2 text-xs pr-10"
                                      required
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
                                    class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Status
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <div
                                      class="flex lg:w-fit lg:px-0 bg-white border-green-700 border-b-2"
                                    >
                                      <div
                                        class="px-1 text-black text-xs items-center flex"
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
                                              !(
                                                userStore.user.email
                                                  ?.trim()
                                                  .toLowerCase() ===
                                                  filteredItems.reviewed_by_email ||
                                                userStore.user.email
                                                  ?.trim()
                                                  .toLowerCase() ===
                                                  superAdminEmail ||
                                                userStore.user.email
                                                  ?.trim()
                                                  .toLowerCase() ===
                                                  superAdminTwo
                                              )
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
                                          class="ml-2 flex items-center w-full text-black text-xs"
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
                                                !(
                                                  userStore.user.email
                                                    ?.trim()
                                                    .toLowerCase() ===
                                                    filteredItems.reviewed_by_email ||
                                                  userStore.user.email
                                                    ?.trim()
                                                    .toLowerCase() ===
                                                    superAdminEmail ||
                                                  userStore.user.email
                                                    ?.trim()
                                                    .toLowerCase() ===
                                                    superAdminTwo
                                                )
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
                                              class="px-2 w-full border-b-2 border-t-0 border-x-0 border-gray-400 py-1 rounded-sm text-xs"
                                              placeholder="Revision Number"
                                              v-model="
                                                filteredItems.revision_number
                                              "
                                              ref="fileInput"
                                            />
                                          </div>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div class="lg:flex items-center w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-gray-900 font-bold whitespace-nowrap lg:w-5/12"
                                  >
                                    <div class="w-fit lg:ml-auto pr-5">
                                      Date Submitted
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <!-- <input
                                      type="date"
                                      class="px-2 w-6/12 border-b-2 border-t-0 border-x-0 border-gray-400 shadow-lg rounded-sm py-2 text-xs"
                                      v-model=""
                                      disabled
                                    /> -->
                                    <div
                                      class="px-2 lg:w-6/12 w-full border-b-2 border-t-0 border-x-0 border-gray-400 rounded-sm py-2 text-xs bg-[#EFEFEF4D]"
                                    >
                                      {{ filteredItems.schedule }}
                                    </div>
                                  </div>
                                  <!-- <div class="w-full">
                                    <div
                                      class="border-b-2 border-green-700 w-fit shadow-lg"
                                    >
                                      <VueDatePicker
                                        v-model="filteredItems.schedule"
                                        :enable-time-picker="false"
                                        name="date"
                                        auto-apply
                                        :year-range="[currentYear - 5, currentYear + 5]"
                                        week-start="0"
                                        @update:model-value="setDate(date)"
                                        disabled
                                      />
                                    </div>
                                  </div> -->
                                </div>
                              </div>
                            </div>
                            <div class="w-fit mx-auto my-5">
                              <div
                                class="text-center flex w-fit mx-auto text-sm"
                              >
                                <!-- <input 
                                  type="text" 
                                  class="px-0.5 uppercase w-full rounded-sm lg:h-9 h-8 text-xs text-right" 
                                  placeholder="First Name" 
                                  v-model="filteredItems.originating_firstname" 
                                  :disabled="!(userStore.user.email?.trim().toLowerCase() === filteredItems.reviewed_by_email)"
                                />
                                <input 
                                  type="text" 
                                  class="px-0.5 uppercase w-full rounded-sm lg:h-9 h-8 text-xs" 
                                  placeholder="Last Name" 
                                  v-model="filteredItems.originating_lastname" 
                                  :disabled="!(userStore.user.email?.trim().toLowerCase() === filteredItems.reviewed_by_email)"
                                /> -->

                                {{ filteredItems.originating_firstname }}
                                {{ filteredItems.originating_lastname }}
                              </div>
                              <div
                                class="border-t-2 border-black text-center text-xs px-5"
                              >
                                Originator’s Printed Name
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
                          v-if="
                            userStore.user.email?.trim().toLowerCase() ===
                              filteredItems.reviewed_by_email ||
                            userStore.user.email?.trim().toLowerCase() ===
                              superAdminEmail ||
                            userStore.user.email?.trim().toLowerCase() ===
                              superAdminTwo
                          "
                        >
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Direct Head
                            </label>
                            <div class="w-full">
                              <div class="text-center flex">
                                <input
                                  type="text"
                                  class="px-2 w-full rounded-sm h-fit py-1 text-sm text-center"
                                  placeholder=""
                                  v-model="filteredItems.reviewed_by_name"
                                  :disabled="
                                    !(
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() ===
                                        filteredItems.reviewed_by_email ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminEmail ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminTwo
                                    )
                                  "
                                />
                              </div>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="border-t-2 border-black text-center text-xs w-full"
                                  placeholder=""
                                  v-model="
                                    filteredItems.reviewed_by_designation
                                  "
                                  :disabled="
                                    !(
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() ===
                                        filteredItems.reviewed_by_email ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminEmail ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminTwo
                                    )
                                  "
                                />

                                <input
                                  v-model="filteredItems.reviewed_by_email"
                                  :class="
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      filteredItems.reviewed_by_email ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminTwo ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminEmail
                                      ? ''
                                      : 'hidden'
                                  "
                                  class="text-center text-xs w-full h-fit -mt-0.5 block"
                                  type="email"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Action
                            </label>
                            <div
                              class="flex lg:gap-x-3 w-full lg:px-0 lg:shadow bg-white border-green-700 border-b-2"
                            >
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Approved"
                                    v-model="filteredItems.reviewed_by_action"
                                    class="mr-1"
                                    id="reviewedByActionApproved"
                                    name="reviewedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.reviewed_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="reviewedByActionApproved"
                                  >
                                    <span class="hover:font-bold"
                                      >Approved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Disapproved"
                                    v-model="filteredItems.reviewed_by_action"
                                    class="mr-1"
                                    id="reviewedByActionDisapproved"
                                    name="reviewedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.reviewed_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="reviewedByActionDisapproved"
                                  >
                                    <span class="hover:font-bold"
                                      >Disapproved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Conditional"
                                    v-model="filteredItems.reviewed_by_action"
                                    class="mr-1"
                                    id="reviewedByActionConditional"
                                    name="reviewedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.reviewed_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="reviewedByActionConditional"
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
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Comments or Remarks
                            </label>
                            <textarea
                              type="text"
                              class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                              placeholder="Comments or Remarks"
                              v-model="filteredItems.reviewed_by_remarks"
                              :disabled="
                                !(
                                  userStore.user.email?.trim().toLowerCase() ===
                                    filteredItems.reviewed_by_email ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminEmail ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminTwo
                                )
                              "
                            >
                            </textarea>
                          </div>
                        </div>

                        <div
                          v-if="
                            userStore.user.email?.trim().toLowerCase() ===
                              filteredItems.verified_by_email ||
                            userStore.user.email?.trim().toLowerCase() ===
                              superAdminEmail ||
                            userStore.user.email?.trim().toLowerCase() ===
                              superAdminTwo
                          "
                          class="lg:gap-x-10 gap-x-1 w-full shadow lg:px-5 px-3 py-3 my-5"
                        >
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Chancellor
                            </label>
                            <div class="w-full">
                              <div class="text-center flex">
                                <input
                                  type="text"
                                  class="px-2 w-full rounded-sm h-fit py-1 text-sm text-center"
                                  placeholder=""
                                  v-model="filteredItems.verified_by_name"
                                  :disabled="
                                    !(
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() ===
                                        filteredItems.verified_by_email ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminEmail ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminTwo
                                    )
                                  "
                                />
                              </div>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="border-t-2 border-black text-center text-xs w-full"
                                  placeholder=""
                                  v-model="
                                    filteredItems.verified_by_designation
                                  "
                                  :disabled="
                                    !(
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() ===
                                        filteredItems.verified_by_email ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminEmail ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminTwo
                                    )
                                  "
                                />

                                <input
                                  v-model="filteredItems.verified_by_email"
                                  :class="
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      filteredItems.verified_by_email ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminEmail
                                      ? ''
                                      : 'hidden' ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                  "
                                  class="text-center text-xs w-full h-fit -mt-0.5 block"
                                  type="email"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Action
                            </label>
                            <div
                              class="flex gap-x-3 w-full lg:shadow bg-white border-green-700 border-b-2"
                            >
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full pb-2.5 text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Approved"
                                    v-model="filteredItems.verified_by_action"
                                    class="mr-1"
                                    id="verifiedByActionApproved"
                                    name="verifiedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.verified_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
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
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full pb-2.5 text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Disapproved"
                                    v-model="filteredItems.verified_by_action"
                                    class="mr-1"
                                    id="verifiedByActionDisapproved"
                                    name="verifiedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.verified_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
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
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full pb-2.5 text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Conditional"
                                    v-model="filteredItems.verified_by_action"
                                    class="mr-1"
                                    id="verifiedByActionConditional"
                                    name="verifiedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.verified_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
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
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Comments or Remarks
                            </label>
                            <textarea
                              type="text"
                              class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                              placeholder="Comments or Remarks"
                              v-model="filteredItems.verified_by_remarks"
                              :disabled="
                                !(
                                  userStore.user.email?.trim().toLowerCase() ===
                                    filteredItems.verified_by_email ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminEmail ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminTwo
                                )
                              "
                            >
                            </textarea>
                          </div>
                        </div>

                        <div
                          v-if="
                            userStore.user.email?.trim().toLowerCase() ===
                              filteredItems.approved_by_email ||
                            userStore.user.email?.trim().toLowerCase() ===
                              superAdminEmail ||
                            userStore.user.email?.trim().toLowerCase() ===
                              superAdminTwo
                          "
                          class="lg:gap-x-10 gap-x-1 w-full shadow lg:px-5 px-3 py-3 my-5"
                        >
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              President
                            </label>
                            <div class="w-full">
                              <div class="text-center flex">
                                <input
                                  type="text"
                                  class="px-2 w-full rounded-sm h-fit py-1 text-sm text-center"
                                  placeholder=""
                                  v-model="filteredItems.approved_by_name"
                                  :disabled="
                                    !(
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() ===
                                        filteredItems.approved_by_email ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminEmail
                                    )
                                  "
                                />
                              </div>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="border-t-2 border-black text-center text-xs w-full"
                                  placeholder=""
                                  v-model="
                                    filteredItems.approved_by_designation
                                  "
                                  :disabled="
                                    !(
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() ===
                                        filteredItems.approved_by_email ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminEmail ||
                                      userStore.user.email
                                        ?.trim()
                                        .toLowerCase() === superAdminTwo
                                    )
                                  "
                                />

                                <input
                                  v-model="filteredItems.approved_by_email"
                                  :class="
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      filteredItems.approved_by_email ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminEmail
                                      ? ''
                                      : 'hidden' ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                  "
                                  class="text-center text-xs w-full h-fit -mt-0.5 block"
                                  type="email"
                                />
                              </div>
                            </div>
                          </div>
                          <div class="w-full mb-2 block">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Action
                            </label>
                            <div
                              class="flex gap-x-3 w-full lg:shadow bg-white border-green-700 border-b-2"
                            >
                              <div
                                class="lg:shadow-lg lg:pt-[8px] lg:pb-[9px] w-full text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Approved"
                                    v-model="filteredItems.approved_by_action"
                                    class="mr-1"
                                    id="approvedByActionApproved"
                                    name="approvedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.approved_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          'president@lsu.edu.ph' ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
                                  />
                                  <label
                                    class="ml-0.5"
                                    for="approvedByActionApproved"
                                  >
                                    <span class="hover:font-bold"
                                      >Approved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Disapproved"
                                    v-model="filteredItems.approved_by_action"
                                    class="mr-1"
                                    id="approvedByActionDisapproved"
                                    name="approvedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.approved_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          'president@lsu.edu.ph' ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
                                  />

                                  <label
                                    class="ml-0.5"
                                    for="approvedByActionDisapproved"
                                  >
                                    <span class="hover:font-bold"
                                      >Disapproved</span
                                    >
                                  </label>
                                </div>
                              </div>
                              <div
                                class="lg:shadow-lg lg:mt-0 mt-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 w-full text-black text-xs items-center flex"
                              >
                                <div class="w-fit mx-auto flex items-center">
                                  <input
                                    type="radio"
                                    value="Conditional"
                                    v-model="filteredItems.approved_by_action"
                                    class="mr-1"
                                    id="approvedByActionConditional"
                                    name="approvedByAction"
                                    @change="actionChecked()"
                                    :disabled="
                                      !(
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          filteredItems.approved_by_email ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() ===
                                          'president@lsu.edu.ph' ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminEmail ||
                                        userStore.user.email
                                          ?.trim()
                                          .toLowerCase() === superAdminTwo
                                      )
                                    "
                                  />

                                  <label
                                    class="ml-0.5"
                                    for="approvedByActionConditional"
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
                              class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                            >
                              Comments or Remarks
                            </label>
                            <textarea
                              type="text"
                              class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                              placeholder="Comments or Remarks"
                              v-model="filteredItems.approved_by_remarks"
                              :disabled="
                                !(
                                  userStore.user.email?.trim().toLowerCase() ===
                                    filteredItems.approved_by_email ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    'president@lsu.edu.ph' ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminEmail ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminTwo
                                )
                              "
                            ></textarea>
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="
                          userStore.user.email?.trim().toLowerCase() ===
                            'meredith.embuscado@lsu.edu.ph' ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminTwo ||
                          userStore.user.email?.trim().toLowerCase() ===
                            filteredItems.rmo_email ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminEmail ||
                          userStore.user.email?.trim().toLowerCase() ===
                            reviewed_by_email
                        "
                        class="lg:flex lg:gap-x-2 gap-x-1 w-full shadow px-3 py-3 my-5"
                      >
                        <div class="w-full">
                          <div class="lg:flex gap-x-3">
                            <div class="lg:w-6/12 w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                              >
                                Records Management Officer (RMO)
                              </label>
                              <input
                                type="text"
                                class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                placeholder="Records Management Officer (RMO)"
                                v-model="filteredItems.rmo_name"
                                :disabled="
                                  !(
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      'meredith.embuscado@lsu.edu.ph' ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      'macristina.llauder@lsu.edu.ph' ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      filteredItems.rmo_email ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminEmail ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminTwo
                                  )
                                "
                              />
                            </div>
                            <div class="lg:w-4/12 w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                              >
                                Document Code
                              </label>
                              <input
                                type="text"
                                class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                placeholder="Document Code"
                                v-model="filteredItems.document_code"
                                required
                                :disabled="
                                  !(
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      'meredith.embuscado@lsu.edu.ph' ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      'macristina.llauder@lsu.edu.ph' ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      filteredItems.rmo_email ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminEmail ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminTwo
                                  )
                                "
                              />
                            </div>

                            <div
                              class="lg:w-5/12 w-full mb-2 block"
                              :class="
                                [
                                  'meredith.embuscado@lsu.edu.ph',
                                  'macristina.llauder@lsu.edu.ph',
                                  filteredItems.rmo_email,
                                  superAdminEmail,
                                ].includes(userStore.user.email)
                                  ? ''
                                  : 'hidden'
                              "
                            >
                              <label
                                class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                              >
                                Effectivity Date
                              </label>
                              <div
                                class="border-b-2 border-green-700 shadow-lg"
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
                                />
                              </div>
                            </div>

                            <div class="w-full mb-2 block">
                              <label
                                class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                              >
                                Other Comment and Remarks
                              </label>
                              <input
                                type="text"
                                class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-2 rounded-sm lg:h-9 h-8 text-xs"
                                placeholder="Other Comment and Remarks"
                                v-model="filteredItems.other_comments_remarks"
                                :disabled="
                                  !(
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      'meredith.embuscado@lsu.edu.ph' ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminTwo ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() ===
                                      filteredItems.rmo_email ||
                                    userStore.user.email
                                      ?.trim()
                                      .toLowerCase() === superAdminEmail
                                  )
                                "
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
                    <div class="pb-5 lg:px-5 px-3 mb-5">
                      <div
                        v-if="
                          userStore.user.email?.trim().toLowerCase() ===
                            filteredItems.rmo_email ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminEmail ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminTwo
                        "
                        class="px-10 lg:rounded-lg rounded-md bg-yellow-500 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-yellow-500 hover:text-yellow-500 lg:text-sm text-xs cursor-pointer"
                        @click="updateData(filteredItems.id)"
                      >
                        <i
                          class="fa fa-paper-plane mr-2"
                          aria-hidden="true"
                        ></i>
                        Update
                      </div>

                      <div
                        v-if="
                          userStore.user.email?.trim().toLowerCase() ===
                            filteredItems.reviewed_by_email ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminEmail
                        "
                        class="px-10 lg:rounded-lg rounded-md bg-yellow-500 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-yellow-500 hover:text-yellow-500 lg:text-sm text-xs cursor-pointer"
                        @click="updateReviewed(filteredItems.id)"
                      >
                        <i
                          class="fa fa-paper-plane mr-2"
                          aria-hidden="true"
                        ></i>
                        Reviewed
                      </div>

                      <div
                        v-if="
                          userStore.user.email?.trim().toLowerCase() ===
                            filteredItems.verified_by_email ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminEmail
                        "
                        class="px-10 lg:rounded-lg rounded-md bg-yellow-500 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-yellow-500 hover:text-yellow-500 lg:text-sm text-xs cursor-pointer"
                        @click="updateVerified(filteredItems.id)"
                      >
                        <i
                          class="fa fa-paper-plane mr-2"
                          aria-hidden="true"
                        ></i>
                        Verified
                      </div>

                      <div
                        v-if="
                          userStore.user.email?.trim().toLowerCase() ===
                            filteredItems.approved_by_email ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminEmail
                        "
                        class="px-10 lg:rounded-lg rounded-md bg-yellow-500 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-yellow-500 hover:text-yellow-500 lg:text-sm text-xs cursor-pointer"
                        @click="updateApproved(filteredItems.id)"
                      >
                        <i
                          class="fa fa-paper-plane mr-2"
                          aria-hidden="true"
                        ></i>
                        Approved
                      </div>
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
<style scoped></style>
