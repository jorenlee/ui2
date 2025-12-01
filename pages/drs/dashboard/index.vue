<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";
import VueDatePicker from "@vuepic/vue-datepicker";
import "../css/main.css";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const superAdminEmail = ref("jorenleeluna24@gmail.com");
const superAdminTwo = ref("macristina.llauder@lsu.edu.ph");
import designationJSON from "../designation.json";
import authorizedEmailsJSON from "../authorized_emails.json";

const designation = ref(designationJSON);
const authorizedEmails = ref(authorizedEmailsJSON);

const listItems = ref(null);

const effectivityDate = ref(null);

const documentTypeList = ref([
  "All",
  "Manual",
  "Procedure",
  "Policy",
  "Form or Template",
  "Work Instructions",
  "MOA or MOU",
]);

const statusList = ref(["All", "New", "For Revision"]);

const endpoint = ref(userStore.mainDevServer);

let deleteIDItem = ref();
let tableDisplay = ref(true);
let toggleSideBarMenu = ref(false);
let toggleConfirmDelete = ref(false);
const confirmModal = ref(false);

const displayUpdateForm = ref(false);

const statusNotificationAlertModal = ref(false);

onMounted(async () => {
  setTimeout(async () => {
    if (
      userStore.user.isAuthenticated &&
      authorizedEmails.value.includes(userStore.user.email)
    ) {
      await fetchListItems(); // Ensure fetchListItems completes before navigation
      router.push("/drs/dashboard");
    } else {
      router.push("/unauthorized");
    }
  }, 1500);
  await fetchListItems(); // Ensure fetchListItems completes before navigation
});

let filteredItems;
const selectedDocumentType = ref("");
const selectedOriginatingOffice = ref("");
const selectedStatus = ref("");

const selectedAll = ref(null);
const selectedReviewed = ref(false);
const selectedVerified = ref(false);
const selectedApproved = ref(false);

const fetchListItems = async () => {
  try {
    listItems.value =
      (await $fetch(endpoint.value + "/api/drs/list").catch(
        (error) => error.data
      )) || []; // Ensure it's an array or empty array

    reviewedLength.value = listItems.value.filter(
      (item) => item.reviewed_by_action === "Approved"
    ).length;

    verifiedLength.value = listItems.value.filter(
      (item) => item.verified_by_action === "Approved"
    ).length;

    approvedLength.value = listItems.value.filter(
      (item) => item.approved_by_action === "Approved"
    ).length;

    filteredItems = Array.isArray(listItems.value) ? [...listItems.value] : [];

    if (
      userStore.user.email === superAdminEmail.value ||
      userStore.user.email === "president@lsu.edu.ph" ||
      userStore.user.email === "rey.mejias@lsu.edu.ph" ||
      userStore.user.email === "meredith.embuscado@lsu.edu.ph" ||
      userStore.user.email === "macristina.llauder@lsu.edu.ph" ||
      userStore.user.email === "recordsmanagement@lsu.edu.ph" ||
      userStore.user.email === "wenny.caseros@lsu.edu.ph"
    ) {
      selectedDocumentType.value = "Document Type";
      selectedOriginatingOffice.value = "Originating Office";
      selectedStatus.value = "Status";

      selectedAll.value = true;

      if (filteredItems.length <= 10) {
        currentPage.value = 1;

        itemsPerPage = 10;
        maxVisiblePages = 1;
      } else {
        currentPage.value = 1;
        itemsPerPage = 10;

        maxVisiblePages = 5;
      }
    }

    // else if(
    //   userStore.user.email === filteredItems.reviewed_by_email
    // ) {

    //   selectedReviewed.value = true
    //   selectedDocumentType.value = "Document Type"
    //   selectedOriginatingOffice.value = "Originating Office"
    //   selectedStatus.value = "Status"

    //   if(filteredItems.length <= 10) {
    //     currentPage.value = 1

    //     itemsPerPage = 10;
    //     maxVisiblePages = 1;

    //   }

    //   else {
    //     currentPage.value = 1;
    //     itemsPerPage = 10;

    //     maxVisiblePages = 5;
    //   }
    // }
    // filteredItems.verified_by_email
    else if (userStore.user.email === "jorenlee.luna@lsu.edu.ph") {
      selectedReviewed.value = true;
      selectedDocumentType.value = "Document Type";
      selectedOriginatingOffice.value = "Originating Office";
      selectedStatus.value = "Status";

      if (filteredItems.length <= 10) {
        currentPage.value = 1;

        itemsPerPage = 10;
        maxVisiblePages = 1;
      } else {
        currentPage.value = 1;
        itemsPerPage = 10;

        maxVisiblePages = 5;
      }
    } 
    
    // jason.yap@lsu.edu.ph
    // filteredItems.approved_by_email
    else if (userStore.user.email === "jason.yap@lsu.edu.ph") {
      selectedVerified.value = true;
      selectedDocumentType.value = "Document Type";
      selectedOriginatingOffice.value = "Originating Office";
      selectedStatus.value = "Status";

      if (filteredItems.length <= 10) {
        currentPage.value = 1;

        itemsPerPage = 10;
        maxVisiblePages = 1;
      } else {
        currentPage.value = 1;
        itemsPerPage = 10;

        maxVisiblePages = 5;
      }
    } else {
      selectedAll.value = false;

      console.log("filteredItems", filteredItems);

      selectedOriginatingOffice.value = filteredItems[0]?.originating_office;
      selectedDocumentType.value = "Document Type";
      selectedStatus.value = "Status";

      unitOfficeSelectedTotalLength.value = filteredItems.length;

      documentTypeSelectedTotalLength.value = 0;

      statusSelectedTotalLength.value = 0;

      if (filteredItems.length <= 10) {
        currentPage.value = 1;

        itemsPerPage = 10;
        maxVisiblePages = 1;
      } else {
        currentPage.value = 1;
        itemsPerPage = 10;

        maxVisiblePages = 5;
      }
    }
  } catch (error) {
    console.error("Error fetching list items:", error);
    // Handle error appropriately
  } finally {
    isLoading.value = false; // Set loading to false when fetch is complete
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

  if (
    selectedDocumentType.value &&
    selectedOriginatingOffice.value &&
    selectedStatus.value &&
    selectedDocumentType.value !== "All" &&
    selectedOriginatingOffice.value !== "All" &&
    selectedStatus.value !== "All" &&
    selectedDocumentType.value !== "Document Type" &&
    selectedOriginatingOffice.value !== "Originating Office" &&
    selectedStatus.value !== "Status" &&
    selectedReviewed.value !== "" &&
    selectedVerified.value !== "" &&
    selectedApproved.value !== ""
  ) {
    filteredItems = filteredItems.filter(
      (item) =>
        item.document_type === selectedDocumentType.value &&
        item.originating_office === selectedOriginatingOffice.value &&
        item.status === selectedStatus.value
    );
  } 
  else {
    if (
      selectedDocumentType.value &&
      selectedDocumentType.value !== "All" &&
      selectedDocumentType.value !== "Document Type"
    ) {
      filteredItems = filteredItems.filter(
        (item) => item.document_type === selectedDocumentType.value
      );

      documentTypeSelectedTotalLength.value = filteredItems.length;

      unitOfficeSelectedTotalLength.value = 0;
      statusSelectedTotalLength.value = 0;

      if (filteredItems.length <= 10) {
        currentPage.value = 1;
      }
    }

    if (
      selectedOriginatingOffice.value &&
      selectedOriginatingOffice.value !== "All" &&
      selectedOriginatingOffice.value !== "Originating Office"
    ) {
      filteredItems = filteredItems.filter(
        (item) => item.originating_office === selectedOriginatingOffice.value
      );

      unitOfficeSelectedTotalLength.value = filteredItems.length;

      documentTypeSelectedTotalLength.value = 0;

      statusSelectedTotalLength.value = 0;
      if (filteredItems.length <= 10) {
        currentPage.value = 1;
      }
    }

    if (
      selectedStatus.value &&
      selectedStatus.value !== "All" &&
      selectedStatus.value !== "Status"
    ) {
      filteredItems = filteredItems.filter(
        (item) => item.status === selectedStatus.value
      );

      statusSelectedTotalLength.value = filteredItems.length;

      unitOfficeSelectedTotalLength.value = 0;

      documentTypeSelectedTotalLength.value = 0;
      if (filteredItems.length <= 10) {
        currentPage.value = 1;
      }
    }

    if (selectedAll.value) {
      selectedDocumentType.value = "Document Type";
      selectedOriginatingOffice.value = "Originating Office";
      selectedStatus.value = "Status";

      selectedReviewed.value = "";
      selectedVerified.value = "";
      selectedApproved.value = "";

      unitOfficeSelectedTotalLength.value = "";
      documentTypeSelectedTotalLength.value = "";
      statusSelectedTotalLength.value = "";
    }

    if (selectedReviewed.value) {
      filteredItems = filteredItems.filter(
        (item) => item.reviewed_by_action === "Approved"
      );
      if (filteredItems.length <= 10) {
        currentPage.value = 1;
      }
    }

    if (selectedVerified.value) {
      filteredItems = filteredItems.filter(
        (item) => item.verified_by_action === "Approved"
      );
      if (filteredItems.length <= 10) {
        currentPage.value = 1;
      }
    }

    if (selectedApproved.value) {
      filteredItems = filteredItems.filter(
        (item) => item.approved_by_action === "Approved"
      );
      if (filteredItems.length <= 10) {
        currentPage.value = 1;
      }
    }
  }

  return _.orderBy(filteredItems, "id", "asc");
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
      actionKey + "Disapproved"
    );
    const conditionalElement = document.getElementById(
      actionKey + "Conditional"
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
    (error) => error.data
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

let currentPage = ref(0);
let itemsPerPage = 0;

let maxVisiblePages = 0;

let totalPages = computed(() => {
  return Math.ceil(filteredListItems.value.length / itemsPerPage);
});

const paginatedListItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredListItems.value.slice(startIndex, endIndex);
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
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 z-10 w-full lg:block lg:static absolute lg:min-h-auto min-h-[700px] lg:h-auto h-screen"
        v-show="toggleSideBarMenu"
      >
        <div
          class="flex items-center justify-center text-white bg-green-900 lg:py-[16px] py-[8px]"
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
          <div
            class="mx-auto mt-10 mb-5 grid grid-cols-1 lg:tracking-tight font-bold"
          >
            <a
              href="/drs/dashboard"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 text-left text-black hover:bg-black hover:text-white"
            >
              <i class="fa fa-list mr-3" aria-hidden="true"></i> All Request
              Lists
            </a>
            <a
              href="/"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 text-left hover:bg-black hover:text-white"
            >
              <i class="fa fa-globe mr-3" aria-hidden="true"></i> LSU HOME PAGE
            </a>
          </div>
        </div>
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div
              @click="toggleSideBarMenu = !toggleSideBarMenu"
              class="px-1.5 flex items-center whitespace-nowrap"
            >
              <i
                class="fa text-3xl text-white"
                :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"
              ></i>
              <h1 class="text-white font-bold ml-3 flex">
                <span class="lg:hidden ml-1"> ODR </span>

                <span class="lg:flex hidden ml-1">
                  Online Document Review
                </span>
              </h1>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>

        <div v-if="!displayUpdateForm">
          <div class="w-full lg:p-5 px-2 py-2">
            <div v-show="tableDisplay">
              <div class="shadow-lg lg:pb-3 lg:px-3 p-1.5 mb-3">
                <div
                  class="flex items-center font-bold text-sm border-b-2 pb-2"
                >
                  <div class="lg:mr-3 mr-1 lg:text-sm text-xs">Filters:</div>
                  <div class="flex items-center lg:gap-x-1">
                    <div
                      class="w-fit bg-white px-1.5 flex items-center text-green-900 hover:text-white hover:bg-green-900 text-center cursor-pointer rounded-lg text-xs"
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
                    >
                      <input
                        type="checkbox"
                        id="checkboxAll"
                        class="lg:mr-1 mr-0.5"
                        value="all"
                        v-model="selectedAll"
                      />
                      <label class="lg:text-sm text-[10px]" for="checkboxAll">
                        All
                        <span v-if="listItems"
                          >({{ listItems.length }})</span
                        ></label
                      >
                    </div>
                    <div
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
                      class="w-fit bg-white px-1.5 flex items-center text-green-900 hover:text-white hover:bg-green-900 text-center cursor-pointer rounded-lg text-xs"
                    >
                      <input
                        type="checkbox"
                        id="checkboxReviewed"
                        class="lg:mr-1 mr-0.5"
                        value="Approved"
                        v-model="selectedReviewed"
                      />
                      <label
                        class="lg:text-sm text-[10px]"
                        for="checkboxReviewed"
                      >
                        Reviewed ({{ reviewedLength }})</label
                      >
                    </div>
                    <div
                      class="w-fit bg-white px-1.5 flex items-center text-green-900 hover:text-white hover:bg-green-900 text-center cursor-pointer rounded-lg text-xs"
                    >
                      <input
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
                        type="checkbox"
                        id="checkboxVerified"
                        class="lg:mr-1 mr-0.5"
                        value="Approved"
                        v-model="selectedVerified"
                      />
                      <label
                        class="lg:text-sm text-[10px]"
                        for="checkboxVerified"
                      >
                        Verified ({{ verifiedLength }})</label
                      >
                    </div>
                    <div
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
                      class="w-fit bg-white px-1.5 flex items-center text-green-900 hover:text-white hover:bg-green-900 text-center cursor-pointer rounded-lg text-xs"
                    >
                      <input
                        type="checkbox"
                        id="checkboxApproved"
                        class="lg:mr-1 mr-0.5"
                        value="Approved"
                        v-model="selectedApproved"
                      />
                      <label
                        class="lg:text-sm text-[10px]"
                        for="checkboxApproved"
                      >
                        Approved ({{ approvedLength }})</label
                      >
                    </div>
                  </div>
                </div>
                <div class="lg:flex gap-x-3">
                  <div class="lg:w-10/12">
                    <label class="text-xs"
                      >By Unit or Office
                      <span v-if="unitOfficeSelectedTotalLength"
                        >({{ unitOfficeSelectedTotalLength }})</span
                      ></label
                    >
                    <select
                      v-model="selectedOriginatingOffice"
                      class="px-1 w-full border-b-2 font-bold border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                      :disabled="
                        !(
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminEmail ||
                          userStore.user.email?.trim().toLowerCase() ===
                            superAdminTwo ||
                          userStore.user.email?.trim().toLowerCase() ===
                            'jorenlee.luna@lsu.edu.ph'
                        )
                      "
                    >
                      <option value="Originating Office" disabled selected>
                        Originating Office
                      </option>
                      <option :value="j" v-for="(j, i) in designation" :key="i">
                        {{ j }}
                      </option>
                    </select>
                  </div>

                  <div class="lg:w-7/12">
                    <label class="text-xs"
                      >By Document Type
                      <span v-if="documentTypeSelectedTotalLength"
                        >({{ documentTypeSelectedTotalLength }})</span
                      ></label
                    >
                    <select
                      v-model="selectedDocumentType"
                      class="px-1 w-full border-b-2 font-bold border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                    >
                      <option value="Document Type" disabled selected>
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

                  <div class="lg:w-4/12">
                    <label class="text-xs"
                      >By Status
                      <span v-if="statusSelectedTotalLength"
                        >({{ statusSelectedTotalLength }})</span
                      ></label
                    >
                    <select
                      v-model="selectedStatus"
                      class="px-1 w-full border-b-2 font-bold border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                    >
                      <option value="Status" disabled selected>Status</option>
                      <option :value="j" v-for="(j, i) in statusList" :key="i">
                        {{ j }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                class="lg:mt-3 mt-5 w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"
              >
                All Request Lists
              </div>

              <div class="relative">
                <div class="appointment-lists mx-auto text-xs">
                  <div class="text-xs">
                    <div
                      class="lg:flex hidden bg-green-800 text-white pb-2 pt-2.5 px-3 gap-x-6"
                    >
                      <div class="w-[100px] mx-auto">No.</div>
                      <div class="w-full mx-auto">Office</div>
                      <div class="w-6/12 mx-auto">Status</div>
                      <div class="w-full mx-auto">Document Title</div>
                      <div class="w-4/12 mx-auto">Document Type</div>
                      <div class="w-full mx-auto">Document Code</div>
                      <div class="w-4/12 mx-auto text-center">Action</div>
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
                        class="lg:border lg:rounded-none rounded-lg lg:shadow"
                      >
                        <div
                          class="lg:flex justify-evenly text-left items-center h-auto px-1 gap-x-7 border-gray-200 lg:py-1 py-3 lg:mb-0 mb-5 lg:border-y border lg:shadow-none shadow-md lg:bg-gray-50 bg-gray-100"
                          v-for="(b, i) in paginatedListItems"
                          :key="i"
                        >
                          <div class="w-[100px] mx-auto text-center font-bold">
                            {{ (currentPage - 1) * itemsPerPage + i + 1 }}
                          </div>
                          <div
                            class="w-full mx-auto lg:text-left text-center lg:font-bold"
                          >
                            {{ b.originating_office }}
                          </div>
                          <div
                            class="lg:w-6/12 mx-auto lg:text-left text-center lg:font-bold"
                          >
                            {{ b.status }}

                            <span v-if="b.revision_number" class="ml-1"
                              >No. {{ b.revision_number }}</span
                            >
                          </div>
                          <div
                            class="w-full mx-auto lg:text-left text-center lg:font-bold"
                          >
                            {{ b.document_title }}
                          </div>

                          <div
                            class="lg:w-4/12 mx-auto lg:text-left text-center lg:font-bold"
                          >
                            {{ b.document_type }}
                          </div>

                          <div
                            class="w-full mx-auto lg:text-left text-center lg:font-bold"
                          >
                            <span
                              :class="
                                b.document_code === 'To Be Assigned By RMO'
                                  ? 'hidden'
                                  : ''
                              "
                              >{{ b.document_code }}</span
                            >
                            {{ b.tracking_id }}
                          </div>

                          <div class="lg:w-4/12 w-fit mx-auto lg:mt-0 mt-4">
                            <div
                              class="text-left flex items-center gap-x-2 font-bold mx-auto"
                            >
                              <div class="lg:w-fit lg:mx-auto">
                                <div
                                  class="text-gray-800 hover:bg-white bg-yellow-500 border border-yellow-500 px-3 py-1 rounded-md w-fit mx-auto cursor-pointer"
                                  @click="goToEdit(b.id)"
                                >
                                  Details
                                </div>
                              </div>

                              <div
                                class="w-fit mx-4"
                                :class="
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminEmail ||
                                  userStore.user.email?.trim().toLowerCase() ===
                                    superAdminTwo
                                    ? ' lg:flex justify-center'
                                    : 'hidden'
                                "
                              >
                                <div @click="toggleDeleteBtn(b.id)">
                                  <i
                                    class="fa fa-trash text-red-500 rounded-lg uppercase text-xl hover:text-2xl"
                                    aria-hidden="true"
                                  ></i>
                                </div>
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
                        <div
                          class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                          v-show="toggleConfirmDelete"
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
                      <div
                        class="flex justify-center my-4"
                        v-if="filteredListItems.length > 0"
                      >
                        <div v-if="filteredItems.length > 10">
                          <button
                            :disabled="currentPage === 1"
                            @click="currentPage--"
                            class="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-500 hover:text-white"
                          >
                            Previous
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
                            class="px-4 py-2 mx-1 bg-gray-200 rounded hover:bg-gray-500 hover:text-white"
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
                                            .toLowerCase() === superAdminEmail ||
                                            userStore.user.email?.trim().toLowerCase() ===
                                              superAdminTwo
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
                                        :year-range="[2025, 2025]"
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
                                      
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo ||
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo
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
                                  :year-range="[2025, 2025]"
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
                                  
                        userStore.user.email?.trim().toLowerCase() ===
                          superAdminTwo ||
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
    <div class="static bottom-0 w-full">
      <DashboardFooter />
    </div>
  </div>
</template>
<style scoped></style>
