<script setup>
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
import moment from "moment";

const listItems = ref(0);
let tableDisplay = ref(true);
let toggleSideBarMenu = ref(false);
let toggleConfirmDelete = ref(false);

const endpoint = ref(userStore.mainDevServer);
let selectedID = ref(null);

// Add these refs for the image modal
const showImageModal = ref(false);
const currentModalImage = ref("");

// Function to open the image modal
const openImageModal = (imageUrl) => {
  currentModalImage.value = imageUrl;
  showImageModal.value = true;
  isModalOpen.value = true;
  // Prevent scrolling on the body when modal is open
  document.body.style.overflow = "hidden";
};

// Function to close the image modal
const closeImageModal = () => {
  showImageModal.value = false;
  isModalOpen.value = checkIfModalOpen();
  // Restore scrolling
  document.body.style.overflow = "auto";
};

// Add these refs for the logs modal
const showLogsModal = ref(false);
const currentItem = ref(null);
const newLogRemarks = ref("");

// Function to open the logs modal
const openLogsModal = (item) => {
  currentItem.value = item;
  showLogsModal.value = true;
  isModalOpen.value = true;
  newLogRemarks.value = "";
  // Prevent scrolling on the body when modal is open
  document.body.style.overflow = "hidden";
};

// Function to close the logs modal
const closeLogsModal = () => {
  showLogsModal.value = false;
  isModalOpen.value = checkIfModalOpen();
  // Restore scrolling
  document.body.style.overflow = "auto";
};

// Add state for email confirmation
const showEmailConfirmation = ref(false);
const isEmailSending = ref(false);
const pendingLogRemarks = ref("");

// Modified addNewLog function to show confirmation after adding log
const addNewLog = async () => {
  if (!newLogRemarks.value.trim() || !currentItem.value) return;

  try {
    // Store the remarks for potential email
    pendingLogRemarks.value = newLogRemarks.value.trim();

    // Create the new log entry
    const newLog = {
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      status_remarks: pendingLogRemarks.value,
    };

    // Create a copy of the current logs array or initialize a new one
    const updatedLogs = currentItem.value.logs
      ? [...currentItem.value.logs]
      : [];

    // Add the new log to the beginning of the array
    updatedLogs.unshift(newLog);

    // Set the ID for the API call
    selectedID.value = currentItem.value.id;

    // Create a complete copy of the current item to send to the server
    const updatedItem = { ...currentItem.value, logs: updatedLogs };

    // Update the item with the new logs using the existing endpoint
    await $fetch(
      endpoint.value + "/api/registrar/" + selectedID.value + "/edit/",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: updatedItem,
      }
    );

    // Update the local data
    currentItem.value.logs = updatedLogs;

    // Clear the input field
    newLogRemarks.value = "";

    // Refresh the list data in the background without closing the modal
    await fetchListItemsQuietly();

    // Show email confirmation dialog
    showEmailConfirmation.value = true;
  } catch (error) {
    console.error("Error adding log:", error);
    // Optional: Show error message
    // toast.error("Failed to add log");
  }
};

// Function to cancel email confirmation
const cancelEmailConfirmation = () => {
  showEmailConfirmation.value = false;
  pendingLogRemarks.value = "";
};

// Function to send confirmation email
const confirmAndSendEmail = async () => {
  if (!currentItem.value) return;

  isEmailSending.value = true;

  try {
    // Prepare the data for the email API
    const emailData = {
      id: currentItem.value.id, // Make sure we're sending the ID
      latest_status: pendingLogRemarks.value,
    };

    console.log("Sending email data:", emailData); // Debug log

    // Send the email notification
    await $fetch(endpoint.value + "/api/registrar/confirmation/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: emailData,
    });

    // Show success message or notification
    console.log("Email sent successfully");
    // toast.success("Status update email sent successfully");

    // Close the confirmation dialog
    showEmailConfirmation.value = false;
    pendingLogRemarks.value = "";
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    // Show error message
    // toast.error("Failed to send email notification");
  } finally {
    isEmailSending.value = false;
  }
};

const selectedCollege = ref("");
const colleges = ref([
  {
    value: "Arts and Sciences, Engineering, Architecture, Computer Studies",
    label: "Arts and Sciences, Engineering, Architecture, Computer Studies",
  },
  {
    value: "Business-Related Courses, BSTM",
    label: "Business-Related Courses, BSTM",
  },
  {
    value: "Nursing, and Graduate Studies",
    label: "Nursing, and Graduate Studies",
  },
  { value: "Education Courses, BSHM", label: "Education Courses, BSHM" },
  { value: "Criminology", label: "Criminology" },
]);

const collegeFilterList = ref(false);

onMounted(() => {
  setTimeout(async () => {
    const email = userStore.user.email;

    const emailToCollegeMap = {
      "ccsea.registrar@lsu.edu.ph":
        "Arts and Sciences, Engineering, Architecture, Computer Studies",
      "jorenlee.luna@lsu.edu.ph":
        "Arts and Sciences, Engineering, Architecture, Computer Studies",
      "cba.registrar@lsu.edu.ph": "Business-Related Courses, BSTM",
      "onlinerequest@lsu.edu.ph": "Nursing, and Graduate Studies",
      "cte.registrar@lsu.edu.ph": "Education Courses, BSHM",
      "ccje.registra@lsu.edu.ph": "Criminology",
    };

    const fullAccessEmails = [
      "jorenleeluna24@gmail.com",
      "registrar@lsu.edu.ph",
    ];

    const authorizedEmails = [
      ...fullAccessEmails,
      ...Object.keys(emailToCollegeMap),
    ];

    if (userStore.user.isAuthenticated && authorizedEmails.includes(email)) {
      // Set selected college for non-full-access users
      if (!fullAccessEmails.includes(email)) {
        selectedCollege.value = emailToCollegeMap[email] || "";
      } else {
        // Enable college filter dropdown for full access users
        collegeFilterList.value = true;
      }

      await fetchListItems();
      router.push("/registrar/dashboard");
      startAutoRefresh();
    } else {
      router.push("/unauthorized");
    }
  }, 5000);
});

// Auto-refresh interval (in milliseconds)
const refreshInterval = 1000; // 1 second (increased from 1 second)
let refreshTimer = null;
let isModalOpen = ref(false); // Track if any modal is open

// Function to check if any modal is currently open
const checkIfModalOpen = () => {
  return (
    showLogsModal.value ||
    showImageModal.value ||
    toggleConfirmDelete.value ||
    showPersonalInfoModal.value
  );
};

// Start auto-refresh of data
const startAutoRefresh = () => {
  // Clear any existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Set up new interval timer
  refreshTimer = setInterval(async () => {
    // Skip refresh if a modal is open to prevent disrupting user input
    isModalOpen.value = checkIfModalOpen();
    if (!isModalOpen.value) {
      await fetchListItemsQuietly();
      await checkAndRemoveDuplicates();
    }
  }, refreshInterval);
};

// Stop auto-refresh (e.g., when component is unmounted)
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// Function to check and remove duplicate entries based on tracking_id
const checkAndRemoveDuplicates = async () => {
  try {
    // Get all items
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

    // Delete duplicates
    for (const id of duplicates) {
      console.log(`Removing duplicate item with ID: ${id}`);
      await $fetch(endpoint.value + "/api/registrar/" + id + "/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // If any duplicates were removed, refresh the list
    if (duplicates.length > 0) {
      console.log(`Removed ${duplicates.length} duplicate entries`);
      await fetchListItems();
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error);
  }
};

// Fetch items without changing loading state (for background updates)
const fetchListItemsQuietly = async () => {
  try {
    const updatedItems =
      (await $fetch(endpoint.value + "/api/registrar/list").catch(
        (error) => error.data
      )) || [];

    // Update the list items without affecting search or other UI state
    if (updatedItems.length > 0) {
      // If we have a search active, we need to preserve it
      if (originalListItems.value.length > 0) {
        // Update the original list
        originalListItems.value = updatedItems;

        // Re-apply the current search filter
        performSearch();
      } else {
        // No search active, just update the list
        listItems.value = updatedItems;
      }

      // Update the current item with fresh data
      if (currentItem.value) {
        const updatedCurrentItem = updatedItems.find(
          (item) => item.id === currentItem.value.id
        );
        if (updatedCurrentItem) {
          currentItem.value = updatedCurrentItem;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching list items quietly:", error);
  }
};

const fetchListItems = async () => {
  isLoading.value = true; // Set loading to true when starting fetch
  try {
    listItems.value =
      (await $fetch(endpoint.value + "/api/registrar/list").catch(
        (error) => error.data
      )) || []; // Ensure it's an array or empty array

    // Reset search state
    originalListItems.value = [];
    searchQuery.value = "";
  } catch (error) {
    console.error("Error fetching list items:", error);
    // Handle error appropriately
  } finally {
    isLoading.value = false; // Set loading to false when fetch is complete
  }
};

// Clean up on component unmount
onBeforeUnmount(() => {
  stopAutoRefresh();
});

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const editStatus = async (id) => {
  await $fetch(endpoint.value + "/api/registrar/" + id + "/edit/", {
    method: "PUT",
    body: selectedItem.value,
  }).then((response) => {
    console.log("response", response);
  });
};

// Add these refs for multiple selection
const selectedItems = ref([]);
const isDeleting = ref(false);

// Computed property to check if all items are selected
const allSelected = computed(() => {
  return (
    selectedItems.value.length === paginatedListItems.value.length &&
    paginatedListItems.value.length > 0
  );
});

// Function to select or deselect all items
const selectAllItems = () => {
  if (allSelected.value) {
    // Deselect all
    selectedItems.value = [];
  } else {
    // Select all
    selectedItems.value = paginatedListItems.value.map((item) => item.id);
  }
};

// Function to toggle delete confirmation for multiple items
const toggleDeleteMultiple = () => {
  if (selectedItems.value.length === 0) return;
  toggleConfirmDelete.value = true;
  isModalOpen.value = true;
};

// Function to cancel delete operation
const cancelDelete = () => {
  toggleConfirmDelete.value = false;
  isModalOpen.value = checkIfModalOpen();
};

// Updated toggleDeleteBtn function to handle single item selection
const toggleDeleteBtn = (id) => {
  if (id === null) {
    // Just close the modal
    toggleConfirmDelete.value = false;
    isModalOpen.value = checkIfModalOpen();
    return;
  }

  // Select just this item
  selectedItems.value = [id];

  // Show the confirmation modal
  toggleConfirmDelete.value = true;
  isModalOpen.value = true;
};

// Unified delete function for both single and multiple items
const deleteItems = async () => {
  if (selectedItems.value.length === 0) return;

  try {
    // Show loading state
    isDeleting.value = true;

    // Delete each selected item
    for (const id of selectedItems.value) {
      await $fetch(endpoint.value + "/api/registrar/" + id + "/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Success handling
    console.log(`${selectedItems.value.length} items deleted successfully`);

    // Clear selection
    selectedItems.value = [];

    // Refresh the list
    await fetchListItems();

    // Close the modal
    toggleConfirmDelete.value = false;
    isModalOpen.value = checkIfModalOpen();
  } catch (error) {
    console.error("Error deleting items:", error);
  } finally {
    // Reset loading state
    isDeleting.value = false;
  }
};

let filteredItems;
const filteredListItems = computed(() => {
  filteredItems = listItems.value;
  return _.orderBy(filteredItems, "created_at", "asc");
});

const isLoading = ref(true); // Add loading state
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

const filteredByCollege = computed(() => {
  if (!selectedCollege.value) {
    return paginatedListItems.value;
  }
  return paginatedListItems.value.filter(
    (item) => item.college === selectedCollege.value
  );
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

// Add these refs for the personal info modal
const showPersonalInfoModal = ref(false);
const currentPersonalInfo = ref(null);

// Function to open the personal info modal
const openPersonalInfoModal = (item) => {
  currentPersonalInfo.value = item;
  showPersonalInfoModal.value = true;
  isModalOpen.value = true;
  // Prevent scrolling on the body when modal is open
  document.body.style.overflow = "hidden";
};

// Function to close the personal info modal
const closePersonalInfoModal = () => {
  showPersonalInfoModal.value = false;
  isModalOpen.value = checkIfModalOpen();
  // Restore scrolling
  document.body.style.overflow = "auto";
};

// Note: Don't add a new checkIfModalOpen function here
// The existing one will be updated separately

// Make sure to add event listener to close modal on escape key
onMounted(() => {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showImageModal.value) {
      closeImageModal();
    }
  });
});

// Clean up event listener on component unmount
onBeforeUnmount(() => {
  window.removeEventListener("keydown", (e) => {
    if (e.key === "Escape" && showImageModal.value) {
      closeImageModal();
    }
  });
  // Also make sure to clean up the auto-refresh
  stopAutoRefresh();
});

// Add search functionality
const searchQuery = ref("");
const originalListItems = ref([]);

// Function to perform search
const performSearch = () => {
  // Reset to page 1 when searching
  currentPage.value = 1;

  // If search is empty, restore original list
  if (!searchQuery.value.trim()) {
    clearSearch();
    return;
  }

  // Store original list if this is the first search
  if (originalListItems.value.length === 0 && listItems.value.length > 0) {
    originalListItems.value = [...listItems.value];
  }

  // Perform the search
  const query = searchQuery.value.toLowerCase().trim();

  // Filter the items based on search query
  const filteredItems =
    originalListItems.value.length > 0
      ? originalListItems.value
      : listItems.value;

  listItems.value = filteredItems.filter((item) => {
    // Search in all string properties of the item
    if (!item) return false;

    const query = searchQuery.value.toLowerCase().trim();

    // Check all properties of the item
    return Object.keys(item).some((key) => {
      // Only search in string properties
      if (typeof item[key] === "string") {
        return item[key].toLowerCase().includes(query);
      }
      return false;
    });
  });

  // Clear selection when search results change
  selectedItems.value = [];
};

// Function to clear search and restore original list
const clearSearch = () => {
  if (originalListItems.value.length > 0) {
    listItems.value = [...originalListItems.value];
    originalListItems.value = [];
  }
  searchQuery.value = "";
  currentPage.value = 1;
  selectedItems.value = [];
};

// Instead of reassigning fetchListItems, let's create a wrapper function
const fetchListItemsWithReset = async () => {
  await fetchListItems();
  // Clear any active search when refreshing the list
  originalListItems.value = [];
  searchQuery.value = "";
};

// Add a computed property to sort logs by timestamp (oldest first)
const sortedLogs = computed(() => {
  if (!currentItem.value?.logs || !Array.isArray(currentItem.value.logs)) {
    return [];
  }

  // Create a copy of the logs array to avoid modifying the original
  return [...currentItem.value.logs].sort((a, b) => {
    // Parse timestamps using moment for accurate comparison
    const dateA = moment(a.timestamp, "MMMM DD, YYYY h:mm:ss A");
    const dateB = moment(b.timestamp, "MMMM DD, YYYY h:mm:ss A");

    // Sort in ascending order (oldest first)
    return dateA.valueOf() - dateB.valueOf();
  });
});
</script>
<template>
  <!-- <div class="">
    <div class="flex">
      <div class="pt-7 pb-24 w-3/12 px-1 bg-gray-100 lg:block hidden" v-show="toggleSideBarMenu">
        <RegistrarMenuBar />
      </div>
      <div class="w-full min-h-screen">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white lg:gap-5">
              <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
                <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'" aria-hidden="true"></i>
              </div>
              <div class="flex -mt-1">
                <i class="fa fa-user mr-2 mt-1" aria-hidden="true"></i>
                <h1 class="text-sm">
                  {{ userStore.user.email }}
                </h1>
              </div>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="px-3">
          <div>
            <div class="text-left p-10 shadow-lg">
              <h1 class="font-bold text-green-800 text-3xl">Welcome!</h1>
              <h2 class="font-bold text-green-800 text-lg">Registrar's Admin Portal</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> -->

  <div>
    <div class="h-screen flex">
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
                href="/registrar/dashboard"
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

      <div class="w-full overflow-y-scroll">
        <div class="bg-green-800 fixed w-full z-10">
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
                Registrar
              </p>
            </div>

            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <div class="pt-14">
          <div class="w-full lg:p-5 px-2 py-2">
            <div v-show="tableDisplay">
              <div
                class="w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"
              >
                All Request Lists
              </div>

              <div
                class="w-full flex justify-between items-center mb-4 px-2 py-2 bg-white shadow rounded-md"
              >
                <div class="lg:flex justify-between w-full gap-x-3">
                 <div class="flex justify-between gap-x-2"> 


                   <div class="">
                    <button
                      @click="selectAllItems"
                      class="whitespace-nowrap flex items-center px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 lg:px-3 pr-2 py-1.5 rounded-md transition-colors duration-200 lg:text-sm text-xs"
                    >
                      <!-- <i class="fa fa-check-square"></i> -->
                      {{ allSelected ? "Deselect All" : "Select All" }}
                    </button>
                  </div>


                   <div :class="selectedItems.length === 0 ? 'hidden' : ''">
                    <button
                      @click="toggleDeleteMultiple"
                      class="flex items-center hover:bg-red-600 text-white px-3 lg:py-1 py-0.5 rounded-md transition-colors duration-200 disabled:opacity-50 whitespace-nowrap"
                      :disabled="selectedItems.length === 0"
                      :class="
                        selectedItems.length === 0
                          ? 'bg-pink-200'
                          : 'bg-red-500'
                      "
                    >
                      <i class="fa fa-trash mr-2"></i>
                  ({{ selectedItems.length }})
                    </button>
                  </div>
                 </div>



                  <div
                    class="flex items-center lg:my-0 my-2"
                    v-if="collegeFilterList"
                  >
                    <select
                      v-model="selectedCollege"
                      class="lg:px-3 px-1 lg:py-1.5 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-xs"
                    >
                      <option value="">All Colleges</option>
                      <option
                        v-for="college in colleges"
                        :key="college.value"
                        :value="college.value"
                      >
                        {{ college.label }}
                      </option>
                    </select>
                  </div>

                  <div class="flex items-center w-full lg:mt-0 mt-2">
                    <div class="relative w-full">
                      <input
                        v-model="searchQuery"
                        type="search"
                        placeholder="Search"
                        class="lg:px-3 px-2 lg:py-1.5 py-1 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 w-full text-xs"
                        @keyup.enter="performSearch"
                      />
                      <button
                        @click="performSearch"
                        class="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-green-600"
                      >
                        <i class="fa fa-search"></i>
                      </button>
                    </div>
                    <!-- <button
                      v-if="searchQuery"
                      @click="clearSearch"
                      class="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md transition-colors duration-200"
                      title="Clear search"
                    >
                      <i class="fa fa-times"></i>
                    </button> -->
                  </div>

                 <div>

                  <button>Export CSV</button>
                 </div>
                </div>
              </div>

              <div class="">
                <div class="appointment-lists mx-auto text-xs">
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
                    <div class="gap-4" v-if="paginatedListItems.length > 0">
                      <div
                        class="flex items-center h-auto shadow lg:mb-0 mb-3 border-gray-200"
                        v-for="(b, i) in filteredByCollege"
                        :key="i"
                      >
                        <div class="w-fit flex px-2">
                          <div class="">
                            <input
                              type="checkbox"
                              :value="b.id"
                              v-model="selectedItems"
                              class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                          </div>
                        </div>

                        <div class="w-full px-2 py-1.5 border-l lg:flex items-center" :class="i % 2 ? 'bg-gray-100':''">
                          <div class="lg:w-7/12 w-full flex items-center">
                            <div class="w-full">
                              <div class="w-full lg:px-3 lg:flex items-center">
                                <div
                                  class="text-[10px] font-light whitespace-nowrap"
                                >
                                  <span class="mr-1">Tracking ID:</span>
                                  <span class="font-bold">
                                    {{ b.tracking_id }}</span
                                  >
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="w-full">
                            <div class="w-full my-1">
                              <div
                                class="w-full cursor-pointer text-xs cursor font-bold uppercase text-green-800 bg-green-50 hover:bg-green-900 hover:text-white py-1 px-1 flex items-center"
                                @click="openPersonalInfoModal(b)"
                              >
                                <i class="fa fa-user mr-2.5"></i>
                                {{ b.lastname }}, {{ b.firstname }}
                                {{ b.middlename }}
                              </div>
                            </div>

                            <!-- Personal Info Modal -->
                            <div
                              v-if="
                                showPersonalInfoModal &&
                                currentPersonalInfo === b
                              "
                              class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
                              @click="closePersonalInfoModal"
                            >
                              <div
                                class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-transform duration-300"
                                :class="{
                                  'scale-100 opacity-100':
                                    showPersonalInfoModal,
                                  'scale-95 opacity-0': !showPersonalInfoModal,
                                }"
                                @click.stop
                              >
                                <div
                                  class="flex justify-between items-center mb-4 border-b pb-3"
                                >
                                  <h3 class="text-lg font-medium text-gray-900">
                                    Personal Information
                                  </h3>
                                  <button
                                    @click="closePersonalInfoModal"
                                    class="text-gray-400 hover:text-gray-500"
                                  >
                                    <i class="fa fa-times"></i>
                                  </button>
                                </div>

                                <div class="space-y-4">
                                  <div class="flex items-center">
                                    <div
                                      class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0"
                                    >
                                      <i class="fa fa-user text-green-600"></i>
                                    </div>
                                    <div class="ml-4">
                                      <p
                                        class="text-sm font-medium text-gray-900"
                                      >
                                        {{ b.firstname }} {{ b.middlename }}
                                        {{ b.lastname }}
                                      </p>
                                      <p class="text-sm text-gray-500">
                                        Tracking ID: {{ b.tracking_id }}
                                      </p>
                                    </div>
                                  </div>

                                  <div class="bg-gray-50 p-4 rounded-md">
                                    <div class="grid grid-cols-1 gap-3">
                                      <div class="flex items-start">
                                        <div
                                          class="flex-shrink-0 h-5 w-5 text-green-500"
                                        >
                                          <i class="fa fa-envelope"></i>
                                        </div>
                                        <div class="ml-3 text-sm">
                                          <p class="font-medium text-gray-900">
                                            Email
                                          </p>
                                          <p class="text-gray-500">
                                            {{ b.email }}
                                          </p>
                                        </div>
                                      </div>

                                      <div class="flex items-start">
                                        <div
                                          class="flex-shrink-0 h-5 w-5 text-green-500"
                                        >
                                          <i class="fa fa-phone"></i>
                                        </div>
                                        <div class="ml-3 text-sm">
                                          <p class="font-medium text-gray-900">
                                            Contact Number
                                          </p>
                                          <p class="text-gray-500">
                                            {{ b.contact_number }}
                                          </p>
                                        </div>
                                      </div>

                                      <div class="flex items-start">
                                        <div
                                          class="flex-shrink-0 h-5 w-5 text-green-500"
                                        >
                                          <i class="fa fa-birthday-cake"></i>
                                        </div>
                                        <div class="ml-3 text-sm">
                                          <p class="font-medium text-gray-900">
                                            Date of Birth
                                          </p>
                                          <p class="text-gray-500">
                                            {{ b.birthdate }}
                                          </p>
                                        </div>
                                      </div>

                                      <div class="flex items-start">
                                        <div
                                          class="flex-shrink-0 h-5 w-5 text-green-500"
                                        >
                                          <i class="fa fa-female"></i>
                                        </div>
                                        <div class="ml-3 text-sm">
                                          <p class="font-medium text-gray-900">
                                            Mother's Maiden Name
                                          </p>
                                          <p class="text-gray-500">
                                            {{ b.mother_maiden_name }}
                                          </p>
                                        </div>
                                      </div>

                                      <div class="w-11/12 mx-auto">
                                        <label
                                          for="alumni"
                                          class="font-bold text-gray-800 mr-1"
                                          >ICC / LSU Graduate? :</label
                                        >
                                        <div class="flex w-full">
                                          <select
                                            class="border-b w-full mx-auto text-xs px-1 shadow-sm"
                                            v-model="b.alumni"
                                          >
                                            <option value="yes">Alumnus</option>
                                            <option value="no">
                                              Non-Alumnus
                                            </option>
                                          </select>
                                        </div>
                                      </div>

                                      <div class="w-11/12 mx-auto">
                                        <label
                                          for="college"
                                          class="font-bold text-gray-800 mr-1"
                                          >College:</label
                                        >
                                        <div class="flex w-full">
                                          <input
                                            type="text"
                                            class="border-b w-full mx-auto text-xs px-1 shadow-sm"
                                            placeholder="College"
                                            v-model="b.college"
                                          />
                                        </div>
                                      </div>

                                      <div class="w-11/12 mx-auto">
                                        <label
                                          for="course"
                                          class="font-bold text-gray-800 mr-1"
                                          >Course:</label
                                        >
                                        <div class="flex w-full">
                                          <input
                                            type="text"
                                            class="border-b w-full mx-auto text-xs px-1 shadow-sm"
                                            placeholder="Course"
                                            v-model="b.course"
                                          />
                                        </div>
                                      </div>

                                      <div class="w-11/12 mx-auto">
                                        <label
                                          for="year_graduated_last_attended"
                                          class="font-bold text-gray-800 whitespace-nowrap mr-1"
                                        >
                                          A.Y. Graduated | Attended:</label
                                        >
                                        <div class="flex w-full">
                                          <input
                                            type="text"
                                            class="border-b w-full mx-auto text-xs px-1 shadow-sm"
                                            placeholder="Year Graduated or Last Attended"
                                            v-model="
                                              b.year_graduated_last_attended
                                            "
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <!-- Logs Modal -->
                            <div
                              v-if="showLogsModal && currentItem === b"
                              class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
                              @click="closeLogsModal"
                            >
                              <div
                                class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-auto"
                                :class="{
                                  'scale-100 opacity-100': showLogsModal,
                                  'scale-95 opacity-0': !showLogsModal,
                                }"
                                @click.stop
                              >
                                <div
                                  class="flex justify-between items-center mb-4 border-b pb-3"
                                >
                                  <h3 class="text-lg font-medium text-gray-900">
                                    Status Logs -
                                    {{ currentItem?.tracking_id || "N/A" }}
                                  </h3>
                                  <button
                                    @click="closeLogsModal"
                                    class="text-gray-400 hover:text-gray-500"
                                  >
                                    <i class="fa fa-times"></i>
                                  </button>
                                </div>

                                <!-- Logs List - Update to sort by timestamp -->
                                <div class="mb-6 max-h-[40vh] overflow-y-auto">
                                  <div
                                    v-if="
                                      !currentItem?.logs ||
                                      currentItem.logs.length === 0
                                    "
                                    class="text-center text-gray-500 py-4"
                                  >
                                    No logs available
                                  </div>

                                  <div v-else class="space-y-3">
                                    <div
                                      v-for="(log, index) in sortedLogs"
                                      :key="index"
                                      class="border-l-4 rounded-r text-[10px]"
                                      :class="
                                        index === sortedLogs.length - 1
                                          ? 'border-green-500 bg-green-50 py-3 '
                                          : 'border-gray-300 bg-gray-50'
                                      "
                                    >
                                      <div
                                        class="flex justify-between items-start"
                                      >
                                        <div
                                          class="font-medium"
                                          :class="
                                            index === sortedLogs.length - 1
                                              ? 'text-green-800 text-sm'
                                              : 'text-gray-500'
                                          "
                                        >
                                          <div
                                            class="w-full bg-transparent border-b focus:outline-none px-1"
                                            :class="
                                              index === sortedLogs.length - 1
                                                ? 'border-green-300 focus:border-green-500'
                                                : 'border-gray-300 focus:border-gray-500'
                                            "
                                          >
                                            {{ log.status_remarks }}
                                          </div>
                                        </div>
                                        <div class="text-gray-500">
                                          <div
                                            class="bg-transparent border-b focus:outline-none px-1 text-right"
                                            :class="
                                              index === sortedLogs.length - 1
                                                ? 'border-green-300 focus:border-green-500'
                                                : 'border-gray-300 focus:border-gray-500'
                                            "
                                          >
                                            {{ log.timestamp }}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <!-- Add New Log Form -->
                                <div class="border-t pt-4">
                                  <!-- <h4 class="font-medium text-gray-700 mb-2">Add New Status Update</h4> -->
                                  <div class="space-y-3">
                                    <div>
                                      <label
                                        for="status_remarks"
                                        class="block text-sm font-medium text-gray-700 mb-1"
                                        >Status / Remarks</label
                                      >
                                      <textarea
                                        id="status_remarks"
                                        v-model="newLogRemarks"
                                        rows="2"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                                        placeholder="Enter status update..."
                                      ></textarea>
                                    </div>

                                    <div class="flex justify-end gap-2">
                                      <button
                                        @click="addNewLog"
                                        :disabled="!newLogRemarks.trim()"
                                        class="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <i class="fa fa-plus mr-2"></i> Add
                                      </button>
                                    </div>

                                    <!-- Add confirmation modal for email notification -->
                                    <Transition appear name="fade">
                                      <div
                                        v-if="showEmailConfirmation"
                                        class="fixed inset-0 z-50 overflow-y-auto"
                                      >
                                        <div
                                          class="flex min-h-full items-center justify-center p-4 text-center"
                                        >
                                          <div
                                            class="fixed inset-0 bg-black bg-opacity-25"
                                            @click="cancelEmailConfirmation"
                                          ></div>

                                          <div
                                            class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                                          >
                                            <h3
                                              class="text-lg font-medium leading-6 text-gray-900"
                                            >
                                              Send Status Update Email
                                            </h3>
                                            <div class="mt-2">
                                              <p class="text-sm text-gray-500">
                                                Would you like to notify the
                                                applicant about this status
                                                update via email?
                                              </p>
                                              <div
                                                class="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4"
                                              >
                                                <div class="flex">
                                                  <div class="flex-shrink-0">
                                                    <i
                                                      class="fa fa-info-circle text-yellow-400"
                                                    ></i>
                                                  </div>
                                                  <div class="ml-3">
                                                    <p
                                                      class="text-sm text-yellow-700"
                                                    >
                                                      This will send an email to
                                                      <span
                                                        class="font-medium"
                                                        >{{
                                                          currentItem?.email
                                                        }}</span
                                                      >
                                                      with the latest status
                                                      information.
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            <div
                                              class="mt-4 flex justify-end gap-2"
                                            >
                                              <button
                                                type="button"
                                                class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                @click="cancelEmailConfirmation"
                                              >
                                                No, Skip Email
                                              </button>
                                              <button
                                                type="button"
                                                class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                @click="confirmAndSendEmail"
                                                :disabled="isEmailSending"
                                              >
                                                <i
                                                  class="fa fa-paper-plane mr-2"
                                                  v-if="!isEmailSending"
                                                ></i>
                                                <i
                                                  class="fa fa-spinner fa-spin mr-2"
                                                  v-else
                                                ></i>
                                                {{
                                                  isEmailSending
                                                    ? "Sending..."
                                                    : "Yes, Send Email"
                                                }}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </Transition>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div class="w-full py-1">
                              <div class="lg:flex items-center gap-x-3">
                                <div class="font-bold text-[10px] mr-1 text-center">
                                  IDs and Documents:
                                </div>
                                <div class="flex gap-x-3 w-fit mx-auto">
                                  <span class="flex gap-x-3" v-if="b">
                                    <a
                                      v-if="
                                        b.valid_id_front?.[0]?.url?.match(
                                          /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                        )
                                      "
                                      @click.prevent="
                                        openImageModal(
                                          b.valid_id_front[0].url.match(
                                            /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                          )?.[0]
                                        )
                                      "
                                      class="cursor-pointer rounded-full border-2 border-green-800"
                                    >
                                      <img
                                        :src="
                                          b.valid_id_front[0].url.match(
                                            /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                          )?.[0]
                                        "
                                        class="w-7 h-7 hover:opacity-80 rounded-full transition-opacity"
                                      />
                                    </a>

                                    <a
                                      v-if="
                                        b.valid_id_back?.[0]?.url?.match(
                                          /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                        )
                                      "
                                      @click.prevent="
                                        openImageModal(
                                          b.valid_id_back[0].url.match(
                                            /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                          )?.[0]
                                        )
                                      "
                                      class="cursor-pointer rounded-full border-2 border-green-800"
                                    >
                                      <img
                                        :src="
                                          b.valid_id_back[0].url.match(
                                            /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                          )?.[0]
                                        "
                                        class="w-7 h-7 hover:opacity-80 rounded-full transition-opacity"
                                      />
                                    </a>

                                    <a
                                      v-if="
                                        b.credential_evaluation_requests?.[0]?.url?.match(
                                          /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                        )
                                      "
                                      @click.prevent="
                                        openImageModal(
                                          b.credential_evaluation_requests[0].url.match(
                                            /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                          )?.[0]
                                        )
                                      "
                                      class="cursor-pointer rounded-full border-2 border-green-800"
                                    >
                                      <img
                                        :src="
                                          b.credential_evaluation_requests[0].url.match(
                                            /https:\/\/.*?\.(jpg|jpeg|png|gif|pdf|doc|docx)/i
                                          )?.[0]
                                        "
                                        class="w-7 h-7 hover:opacity-80 rounded-full transition-opacity"
                                      />
                                    </a>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div class="lg:w-10/12 w-full items-center text-left">
                            <div
                              class="w-full lg:px-3 lg:block flex items-center lg:py-0 py-2"
                            >
                              <div
                                class="text-[10px] font-light whitespace-nowrap"
                              >
                                <span class="font-bold"
                                  >Requested Documents:</span
                                >
                                <ul class="list-decimal lg:pl-4 pl-2.5">
                                  <li
                                    class="leading-[10px] text-[9px]"
                                    v-for="(j, i) in b.type_document_requests"
                                    :key="i"
                                  >
                                    {{ j }}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div class="lg:w-7/12 text-left">
                            <div
                              class="w-full lg:block flex items-center lg:py-0 py-2"
                              v-if="b.details"
                            >
                              <div
                                class="text-[10px] font-light whitespace-nowrap"
                              >
                                <span class="font-bold mr-1">Note:</span>
                                <span class=""> {{ b.details }}</span>
                              </div>
                            </div>

                            <div
                              class="lg:w-fit w-full flex items-center justify-center py-1"
                            >
                              <button
                                class="w-full whitespace-nowrap  text-green-700 cursor-pointer bg-white border shadow-lg border-green-500 hover:bg-green-800 px-5 pt-1 pb-1 hover:text-white font-bold rounded-full uppercase"
                                @click="openLogsModal(b)"
                              >
                                Status ({{ b.logs ? b.logs.length : 0 }})
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Image Modal -->
                      <div
                        v-if="showImageModal"
                        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                        @click="closeImageModal"
                      >
                        <div
                          class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg"
                          @click.stop
                        >
                          <button
                            @click="closeImageModal"
                            class="absolute top-2 right-2 text-gray-700 hover:text-red-500 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
                          >
                            <i class="fa fa-close"></i>
                          </button>
                          <img
                            :src="currentModalImage"
                            class="max-w-full max-h-[85vh] object-contain"
                          />
                        </div>
                      </div>

                      <!-- Improved Delete Confirmation Modal -->
                      <div
                        v-if="toggleConfirmDelete"
                        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
                      >
                        <div
                          class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 transform transition-transform duration-300"
                          :class="{
                            'scale-100 opacity-100': toggleConfirmDelete,
                            'scale-95 opacity-0': !toggleConfirmDelete,
                          }"
                        >
                          <div class="text-center">
                            <div
                              class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
                            >
                              <i
                                class="fa fa-exclamation-triangle text-red-600 text-xl"
                              ></i>
                            </div>
                            <h3 class="text-lg font-medium text-gray-900 mb-2">
                              Confirm Deletion
                            </h3>
                            <p class="text-sm text-gray-500 mb-6">
                              Are you sure you want to delete
                              {{
                                selectedItems.length === 1
                                  ? "this record"
                                  : "these " +
                                    selectedItems.length +
                                    " records"
                              }}? This action cannot be undone.
                            </p>
                          </div>
                          <div class="flex justify-center gap-4">
                            <button
                              @click="deleteItems"
                              class="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors duration-200"
                              :disabled="isDeleting"
                            >
                              <i
                                class="fa fa-spinner fa-spin mr-2"
                                v-if="isDeleting"
                              ></i>
                              {{ isDeleting ? "Deleting..." : "Delete" }}
                            </button>
                            <button
                              @click="cancelDelete"
                              class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors duration-200"
                              :disabled="isDeleting"
                            >
                              Cancel
                            </button>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fixed bottom-0 w-full">
      <DashboardFooter />
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
