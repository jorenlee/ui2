<script setup>
import { onMounted, ref, onBeforeUnmount, watch, computed } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
import moment from "moment";

const listItems = ref([]);
let tableDisplay = ref(true);
let toggleSideBarMenu = ref(false);
let toggleConfirmDelete = ref(false);

const endpoint = ref(userStore.mainDevServer);
let selectedID = ref(null);
const statusFilter = ref("all");

const showImageModal = ref(false);
const currentModalImage = ref("");

const showPersonalInfoModal = ref(false);
const currentPersonalInfo = ref(null);

const showLogsModal = ref(false);
const showPaymentModal = ref(false);
const showChatModal = ref(false);

const showPrepDocModal = ref(false);
const showReleasingDocModal = ref(false);
const showTransactionClosedModal = ref(false);

const currentItem = ref(null);
const newLogRemarks = ref("");
const newFollowUpMessage = ref("");

const currentPaymentRecord = ref(null);

const verifySuccessMessage = ref("");
const verifyErrorMessage = ref("");
const isVerifying = ref(false);
const isConfirming = ref(false);

const openImageModal = (imageUrl) => {
  currentModalImage.value = imageUrl;
  showImageModal.value = true;
  isModalOpen.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
  isModalOpen.value = checkIfModalOpen();
};

const getCleanUrl = (url) => {
  if (!url) return "";
  const match = url.match(/^(.*?\.(?:jpg|jpeg|png))/i);
  return match ? match[1] : url;
};

// Helper function to build update payload with only required fields
const buildUpdatePayload = (item, additionalFields = {}) => {
  return {
    id: item.id,
    tracking_id: item.tracking_id,
    firstname: item.firstname,
    middlename: item.middlename,
    lastname: item.lastname,
    email: item.email,
    contact_number: item.contact_number,
    college: item.college,
    course: item.course,
    year_level: item.year_level,
    student_id_number: item.student_id_number,
    date_of_birth: item.date_of_birth,
    mother_maiden_name: item.mother_maiden_name,
    year_graduated: item.year_graduated,
    purpose: item.purpose,
    type_document_requests: item.type_document_requests || [],
    detail_fees_type_document_requests:
      item.detail_fees_type_document_requests || [],
    grand_total_payment: item.grand_total_payment,
    valid_id_front: item.valid_id_front || [],
    valid_id_back: item.valid_id_back || [],
    additional_documents: item.additional_documents || [],
    additional_response_details: item.additional_response_details || [],
    logs: item.logs || [],
    latest_status: item.latest_status || "",
    ...additionalFields,
  };
};

const updateStatus = async (item) => {
  const newStatus = "Reviewed and Verified";
  verifyErrorMessage.value = "";
  verifySuccessMessage.value = "";

  // Skip if already updated
  if (item.latest_status === newStatus) {
    return false; // indicate no update was made
  }

  try {
    const newLog = {
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      status_remarks: newStatus,
    };

    const updatedLogs = item.logs ? [...item.logs] : [];
    updatedLogs.unshift(newLog);

    // Build update payload with updated logs and status
    const updatedItem = buildUpdatePayload(item, {
      logs: updatedLogs,
      latest_status: newStatus,
    });

    await $fetch(`${endpoint.value}/api/registrar/${item.id}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    // Update local data
    item.logs = updatedLogs;
    item.latest_status = newStatus;

    const itemIndex = listItems.value.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
      listItems.value[itemIndex].latest_status = newStatus;
    }

    verifySuccessMessage.value = "✅ Status updated successfully!";
    setTimeout(() => (verifySuccessMessage.value = ""), 3000);

    return true; // indicate update was successful
  } catch (error) {
    console.error("Error updating status:", error);
    verifyErrorMessage.value = "❌ Failed to update record.";
    setTimeout(() => (verifyErrorMessage.value = ""), 3000);
    return false; // indicate update failed
  }
};

const sendEmailConfirmationVerified = async (item) => {
  const newStatus = "Reviewed and Verified";

  if (item.latest_status !== newStatus) {
    verifyErrorMessage.value =
      "⚠️ Please update the status first before notifying.";
    return;
  }

  if (item.notified) {
    verifyErrorMessage.value =
      "⚠️ Email has already been sent for this verified status.";
    return;
  }

  verifyErrorMessage.value = "";
  verifySuccessMessage.value = "";
  isVerifying.value = true;

  try {
    await $fetch(`${endpoint.value}/api/registrar/status/update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        id: item.id,
        latest_status: newStatus,
      },
    });

    // Mark as notified locally
    item.notified = true;

    await fetchListItemsQuietly();

    // Retain success message indefinitely
    verifySuccessMessage.value = "✅ Email notification sent successfully!";
    setTimeout(() => (verifySuccessMessage.value = ""), 3000);
  } catch (error) {
    console.error("Error sending email notification:", error);
    verifyErrorMessage.value = "❌ Failed to send email notification.";
    setTimeout(() => (verifyErrorMessage.value = ""), 3000);
  } finally {
    isVerifying.value = false;
  }
};

const verifiedConfirm = async (item) => {
  // First update status
  const updated = await updateStatus(item);

  // Only send email if update was successful or already verified
  if (updated || item.latest_status === "Reviewed and Verified") {
    await sendEmailConfirmationVerified(item);
  }
};

const sendFollowUpMessage = async (item) => {
  if (!newFollowUpMessage.value.trim()) {
    return;
  }

  try {
    // Create new message object
    const newMessage = {
      sender: "Registrar",
      message: newFollowUpMessage.value.trim(),
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
    };

    // Get existing messages or initialize empty array
    const existingMessages = Array.isArray(item.additional_response_details)
      ? item.additional_response_details.filter((msg) => msg.message !== "N/A")
      : [];

    // Add new message to the array
    const updatedMessages = [...existingMessages, newMessage];

    const updatedItem = {
      ...item,
      additional_response_details: updatedMessages,
    };

    await $fetch(`${endpoint.value}/api/registrar/${item.id}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    // Send status update email notification
    await $fetch(`${endpoint.value}/api/registrar/status/update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        id: item.id,
        latest_status: item.latest_status || "",
      },
    });

    // Update local data
    item.additional_response_details = updatedMessages;

    // Update in listItems array
    const itemIndex = listItems.value.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      listItems.value[itemIndex].additional_response_details = updatedMessages;
    }

    // Clear the input
    newFollowUpMessage.value = "";

    // Show success message
    verifySuccessMessage.value = "✅ Follow-up message sent successfully!";
    setTimeout(() => (verifySuccessMessage.value = ""), 3000);
  } catch (error) {
    console.error("Error sending follow-up message:", error);
    verifyErrorMessage.value = "❌ Failed to send follow-up message.";
    setTimeout(() => (verifyErrorMessage.value = ""), 3000);
  }
};

const confirmPrepDoc = async (item) => {
  verifySuccessMessage.value = "";
  verifyErrorMessage.value = "";
  isConfirming.value = true;

  const newStatus = "Preparing Documents";

  try {
    const newLog = {
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      status_remarks: newStatus,
    };

    const updatedLogs = item.logs ? [...item.logs] : [];
    updatedLogs.unshift(newLog);

    selectedID.value = item.id;
    const updatedItem = buildUpdatePayload(item, { logs: updatedLogs });

    await $fetch(`${endpoint.value}/api/registrar/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    prepDocStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/status/update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        id: item.id,
        latest_status: newStatus,
      },
    });

    await fetchListItemsQuietly();

    verifySuccessMessage.value = "✅ Confirm and email sent successfully!";

    setTimeout(() => {
      verifySuccessMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error verifying and sending email:", error);
    verifyErrorMessage.value = "❌ Failed to verify and send email.";
    setTimeout(() => {
      verifyErrorMessage.value = "";
    }, 3000);
  } finally {
    isConfirming.value = false;
    showPrepDocModal.value = false;
  }
};

const confirmReleasingDoc = async (item) => {
  verifySuccessMessage.value = "";
  verifyErrorMessage.value = "";
  isConfirming.value = true;

  const newStatus = "Releasing Documents";

  try {
    const newLog = {
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      status_remarks: newStatus,
    };

    const updatedLogs = item.logs ? [...item.logs] : [];
    updatedLogs.unshift(newLog);

    selectedID.value = item.id;
    const updatedItem = buildUpdatePayload(item, { logs: updatedLogs });

    await $fetch(`${endpoint.value}/api/registrar/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    releasingDocStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/status/update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        id: item.id,
        latest_status: newStatus,
      },
    });

    await fetchListItemsQuietly();

    verifySuccessMessage.value = "✅ Confirm and email sent successfully!";

    setTimeout(() => {
      verifySuccessMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error verifying and sending email:", error);
    verifyErrorMessage.value = "❌ Failed to verify and send email.";

    setTimeout(() => {
      verifyErrorMessage.value = "";
    }, 3000);
  } finally {
    isConfirming.value = false;
    showReleasingDocModal.value = false;
  }
};

const confirmTransactionClosed = async (item) => {
  verifySuccessMessage.value = "";
  verifyErrorMessage.value = "";
  isConfirming.value = true;

  const newStatus = "Transaction Closed";

  try {
    const newLog = {
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      status_remarks: newStatus,
    };

    const updatedLogs = item.logs ? [...item.logs] : [];
    updatedLogs.unshift(newLog);

    selectedID.value = item.id;
    const updatedItem = buildUpdatePayload(item, { logs: updatedLogs });

    await $fetch(`${endpoint.value}/api/registrar/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    transactionClosedStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/status/transaction-closed/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        id: item.id,
        latest_status: newStatus,
      },
    });

    await fetchListItemsQuietly();

    verifySuccessMessage.value = "✅ Confirm and email sent successfully!";

    setTimeout(() => {
      verifySuccessMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error verifying and sending email:", error);
    verifyErrorMessage.value = "❌ Failed to verify and send email.";

    setTimeout(() => {
      verifyErrorMessage.value = "";
    }, 3000);
  } finally {
    isConfirming.value = false;
    showTransactionClosedModal.value = false;
  }
};

const sendEmailDetailFee = async (item) => {
  isSendingPayment.value = true;
  item.follow_up_remarks =
    "Kindly upload the receipt to this page: https://lsu.edu.ph/registrar/track";

  const payload = {
    ...currentItemInfo.value,
    date_graduated_last_attended: moment(
      currentItemInfo.value.date_graduated_last_attended
    ).format("LL"),
  };

  try {
    await $fetch(endpoint.value + "/api/registrar/payment/fees/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    showSuccessMessage.value = true;
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } catch (error) {
    console.error("Error sending email:", error);
  } finally {
    isSendingPayment.value = false;
    assessmentConfirm(item);
  }
};

const assessmentConfirm = async (item) => {
  verifySuccessMessage.value = "";
  verifyErrorMessage.value = "";
  isVerifying.value = true;

  const newStatus = "Assessment";

  try {
    const newLog = {
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      status_remarks: newStatus,
    };

    const updatedLogs = item.logs ? [...item.logs] : [];
    updatedLogs.unshift(newLog);

    selectedID.value = item.id;
    const updatedItem = buildUpdatePayload(item, { logs: updatedLogs });

    await $fetch(`${endpoint.value}/api/registrar/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    paymentStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/status/update/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        id: item.id,
        latest_status: newStatus,
      },
    });

    await fetchListItemsQuietly();

    verifySuccessMessage.value = "✅ Confirm and email sent successfully!";
    setTimeout(() => {
      verifySuccessMessage.value = "";
    }, 3000);
  } catch (error) {
    console.error("Error verifying and sending email:", error);
    verifyErrorMessage.value = "❌ Failed to verify and send email.";

    setTimeout(() => {
      verifyErrorMessage.value = "";
    }, 3000);
  } finally {
    isVerifying.value = false;
  }
};

const closeAllModals = () => {
  showPersonalInfoModal.value = false;
  showPaymentModal.value = false;
  showPrepDocModal.value = false;
  showReleasingDocModal.value = false;
  showTransactionClosedModal.value = false;
  showLogsModal.value = false;
  showChatModal.value = false;
  currentItem.value = null;
  currentPersonalInfo.value = null;
};

const openLogsModal = (item) => {
  closeAllModals();
  currentItem.value = item;
  showLogsModal.value = true;
  isModalOpen.value = true;
  newLogRemarks.value = "";
};

const closeLogsModal = () => {
  showLogsModal.value = false;
  isModalOpen.value = checkIfModalOpen();
};

const openPaymentModal = (item) => {
  closeAllModals();
  currentItem.value = item;
  showPaymentModal.value = true;
  isModalOpen.value = true;

  currentItemInfo.value.fullname = `${item.firstname} ${item.middlename} ${item.lastname}`;
  currentItemInfo.value.email = item.email;
  currentItemInfo.value.course = item.course;
  currentItemInfo.value.tracking_id = item.tracking_id;
  currentItemInfo.value.college = item.college;
  currentItemInfo.value.date_graduated_last_attended = moment(
    item.date_graduated_last_attended
  ).format("YYYY-MM-DD");

  // Load existing detail_fees_type_document_requests from the item
  // If it exists and has data, use it; otherwise initialize as empty array
  if (
    item.detail_fees_type_document_requests &&
    Array.isArray(item.detail_fees_type_document_requests) &&
    item.detail_fees_type_document_requests.length > 0
  ) {
    currentItemInfo.value.detail_fees_type_document_requests = JSON.parse(
      JSON.stringify(item.detail_fees_type_document_requests)
    );
  } else {
    // Initialize with empty array if no existing fees
    currentItemInfo.value.detail_fees_type_document_requests = [];
  }

  updateTotal();
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  currentItem.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const openPersonalInfoModal = (item) => {
  closeAllModals();
  currentPersonalInfo.value = item;
  showPersonalInfoModal.value = true;
  isModalOpen.value = true;
  newFollowUpMessage.value = ""; // Clear the message input when opening modal
};

const closePersonalInfoModal = () => {
  showPersonalInfoModal.value = false;
  currentPersonalInfo.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const openChatCommunication = (item) => {
  closeAllModals();
  currentItem.value = item;
  showChatModal.value = true;
  isModalOpen.value = true;
  newFollowUpMessage.value = ""; // Clear the message input when opening modal
};

const closeChatModal = () => {
  showChatModal.value = false;
  currentItem.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const openPrepDocModal = async (item) => {
  closeAllModals();
  currentItem.value = item;
  showPrepDocModal.value = true;
  isModalOpen.value = true;
};

const closePrepDocModal = () => {
  showPrepDocModal.value = false;
  currentItem.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const openReleasingDocModal = (item) => {
  closeAllModals();
  currentItem.value = item;
  showReleasingDocModal.value = true;
  isModalOpen.value = true;
};

const closeReleasingDocModal = () => {
  showReleasingDocModal.value = false;
  currentItem.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const openTransactionClosedModal = (item) => {
  closeAllModals();
  currentItem.value = item;
  showTransactionClosedModal.value = true;
  isModalOpen.value = true;
};

const closeTransactionClosedModal = () => {
  showTransactionClosedModal.value = false;
  currentItem.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const checkIfModalOpen = () => {
  return (
    showPaymentModal.value ||
    showPrepDocModal.value ||
    showReleasingDocModal.value ||
    showTransactionClosedModal.value ||
    showLogsModal.value ||
    showImageModal.value ||
    showPersonalInfoModal.value ||
    showChatModal.value ||
    toggleConfirmDelete.value
  );
};

const selectedCollege = ref("");
const colleges = ref([
  {
    value: "Arts and Sciences, Engineering, Architecture, Computer Studies",
    label: "Arts and Sciences, Engineering, Architecture, Computer Studies",
  },
  {
    value: "Business, Commerce, Accountancy",
    label: "Business, Commerce, Accountancy",
  },
  {
    value: "Education / Graduate Studies",
    label: "Education / Graduate Studies",
  },
  {
    value: "Nursing / Tourism and Hospitality Management",
    label: "Nursing / Tourism and Hospitality Management",
  },
  {
    value: "Criminology / BS Psychology",
    label: "Criminology / BS Psychology",
  },
]);

const sortColumn = ref(null);
const sortDirection = ref("asc");
const collegeFilterList = ref(false);

onMounted(async () => {
  const email = userStore.user.email;

  const emailToCollegeMap = {
    "ccsea.registrar@lsu.edu.ph":
      "Arts and Sciences, Engineering, Architecture, Computer Studies",
    "jorenlee.luna@lsu.edu.ph": "Business, Commerce, Accountancy",
    "cba.registrar@lsu.edu.ph": "Business, Commerce, Accountancy",
    "cte.registrar@lsu.edu.ph": "Education / Graduate Studies",
    "onlinerequest@lsu.edu.ph": "Nursing / Tourism and Hospitality Management",
    "ccje.registrar@lsu.edu.ph": "Criminology / BS Psychology",
  };

  const fullAccessEmails = [
    "jorenleeluna24@gmail.com",
    "registrar@lsu.edu.ph",
    "jason.yap@lsu.edu.ph",
  ];

  const authorizedEmails = [
    ...fullAccessEmails,
    ...Object.keys(emailToCollegeMap),
  ];

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showImageModal.value) {
      closeImageModal();
    }
  });

  if (userStore.user.isAuthenticated && authorizedEmails.includes(email)) {
    if (!fullAccessEmails.includes(email)) {
      selectedCollege.value = emailToCollegeMap[email] || "";
    } else {
      collegeFilterList.value = true;
    }

    await fetchListItems();
    router.push("/registrar/dashboard");
    startAutoRefresh();
  } else {
    // router.push("/unauthorized");
    router.push("/registrar/dashboard");
  }
});

const refreshInterval = 1000;
let refreshTimer = null;
let isModalOpen = ref(false);
let isSelectingAll = ref(false);
const isQuietFetching = ref(false);

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  refreshTimer = setInterval(async () => {
    if (
      !checkIfModalOpen() &&
      !isSelectingAll.value &&
      !isConfirming.value &&
      !isVerifying.value &&
      !isQuietFetching.value
    ) {
      await fetchListItemsQuietly();
      await checkAndRemoveDuplicates();
    }
  }, refreshInterval);
};

// Lock body scroll when any modal is open (placed after isModalOpen declaration)
watch(
  () => isModalOpen.value,
  (val) => {
    if (typeof window !== "undefined") {
      const cls = document.documentElement.classList;
      if (val) {
        cls.add("overflow-hidden");
      } else {
        cls.remove("overflow-hidden");
      }
    }
  }
);

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const checkAndRemoveDuplicates = async () => {
  stopAutoRefresh();
  try {
    const items = listItems.value;
    if (!items || !Array.isArray(items) || items.length === 0) return;

    const trackingIds = {};
    const duplicates = [];

    // Helper function to check if item has real messages
    const hasRealMessages = (item) => {
      const messages = item.additional_response_details;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return false;
      }
      // Check if there's at least one message that's not 'N/A'
      return messages.some((msg) => msg.message && msg.message !== "N/A");
    };

    items.forEach((item) => {
      if (!item.tracking_id) return;

      if (trackingIds[item.tracking_id]) {
        const existingItem = trackingIds[item.tracking_id];

        // Determine which item to keep based on messages
        const existingHasMessages = hasRealMessages(existingItem);
        const currentHasMessages = hasRealMessages(item);

        let duplicateToRemove;

        if (existingHasMessages && !currentHasMessages) {
          // Keep existing (has messages), remove current
          duplicateToRemove = item.id;
        } else if (!existingHasMessages && currentHasMessages) {
          // Keep current (has messages), remove existing
          duplicateToRemove = existingItem.id;
          trackingIds[item.tracking_id] = item; // Update to keep current
        } else {
          // Both have messages or both don't - keep newer one
          duplicateToRemove =
            new Date(existingItem.created_at) > new Date(item.created_at)
              ? item.id
              : existingItem.id;

          if (duplicateToRemove === existingItem.id) {
            trackingIds[item.tracking_id] = item; // Update to keep current
          }
        }

        duplicates.push(duplicateToRemove);
      } else {
        trackingIds[item.tracking_id] = item;
      }
    });

    for (const id of duplicates) {
      await $fetch(endpoint.value + "/api/registrar/" + id + "/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (duplicates.length > 0) {
      await fetchListItems();
    }
  } catch (error) {
    console.error("Error checking for duplicates:", error);
  } finally {
    startAutoRefresh();
  }
};

const verificationStatuses = ref({});
const paymentStatuses = ref({});
const prepDocStatuses = ref({});
const releasingDocStatuses = ref({});
const transactionClosedStatuses = ref({});

const updateVerificationStatuses = () => {
  if (!listItems.value || !Array.isArray(listItems.value)) return;

  listItems.value.forEach((item) => {
    if (item && item.id) {
      verificationStatuses.value[item.id] = hasReviewedAndVerifiedStatus(item);
    }
  });
};

const updatePaymentStatuses = () => {
  if (!listItems.value || !Array.isArray(listItems.value)) return;

  listItems.value.forEach((item) => {
    if (item && item.id) {
      paymentStatuses.value[item.id] = hasPaidStatus(item);
    }
  });
};
const updatePrepDocStatuses = () => {
  if (!listItems.value || !Array.isArray(listItems.value)) return;

  listItems.value.forEach((item) => {
    if (item && item.id) {
      prepDocStatuses.value[item.id] = hasPrepDocStatus(item);
    }
  });
};

const updateReleasingDocStatuses = () => {
  if (!listItems.value || !Array.isArray(listItems.value)) return;

  listItems.value.forEach((item) => {
    if (item && item.id) {
      releasingDocStatuses.value[item.id] = hasReleasingDocStatus(item);
    }
  });
};

const updateTransactionClosedStatuses = () => {
  if (!listItems.value || !Array.isArray(listItems.value)) return;

  listItems.value.forEach((item) => {
    if (item && item.id) {
      transactionClosedStatuses.value[item.id] =
        hasTransactionClosedStatus(item);
    }
  });
};

const hasReviewedAndVerifiedStatus = (item) => {
  if (
    !item ||
    !item.logs ||
    !Array.isArray(item.logs) ||
    item.logs.length === 0
  ) {
    return false;
  }

  return item.logs.some(
    (log) =>
      log.status_remarks && log.status_remarks.includes("Reviewed and Verified")
  );
};

const hasPaidStatus = (item) => {
  if (
    !item ||
    !item.logs ||
    !Array.isArray(item.logs) ||
    item.logs.length === 0
  ) {
    return false;
  }

  return item.logs.some(
    (log) => log.status_remarks && log.status_remarks.includes("Assessment")
  );
};

const hasPrepDocStatus = (item) => {
  if (
    !item ||
    !item.logs ||
    !Array.isArray(item.logs) ||
    item.logs.length === 0
  ) {
    return false;
  }

  return item.logs.some(
    (log) =>
      log.status_remarks && log.status_remarks.includes("Preparing Documents")
  );
};

const hasReleasingDocStatus = (item) => {
  if (
    !item ||
    !item.logs ||
    !Array.isArray(item.logs) ||
    item.logs.length === 0
  ) {
    return false;
  }

  return item.logs.some(
    (log) =>
      log.status_remarks && log.status_remarks.includes("Releasing Documents")
  );
};

const hasTransactionClosedStatus = (item) => {
  if (
    !item ||
    !item.logs ||
    !Array.isArray(item.logs) ||
    item.logs.length === 0
  ) {
    return false;
  }

  return item.logs.some(
    (log) =>
      log.status_remarks && log.status_remarks.includes("Transaction Closed")
  );
};

watch(
  () => listItems.value,
  () => {
    updateVerificationStatuses();
    updatePaymentStatuses();
    updatePrepDocStatuses();
    updateReleasingDocStatuses();
    updateTransactionClosedStatuses();
  },
  { deep: true }
);

const fetchListItemsQuietly = async () => {
  // Avoid overlapping silent fetches
  if (isQuietFetching.value) return;
  isQuietFetching.value = true;
  try {
    const updatedItems =
      (await $fetch(endpoint.value + "/api/registrar/list").catch(() => [])) ||
      [];

    // Helper: merge updated array into existing array by id, preserving object identity
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

    if (Array.isArray(updatedItems)) {
      // If user is searching (originalListItems has a snapshot), keep it in sync silently
      if (originalListItems.value.length > 0) {
        originalListItems.value = mergeById(
          originalListItems.value,
          updatedItems
        );
        // Re-run search without resetting pagination beyond page 1
        performSearch();
      } else if (listItems.value.length === 0) {
        // Initial population
        listItems.value = updatedItems;
      } else {
        // Silent in-place update to prevent flicker and keep selections/modals stable
        listItems.value = mergeById(listItems.value, updatedItems);
      }

      // Refresh derived flags
      updateVerificationStatuses();
      updatePaymentStatuses();
      updatePrepDocStatuses();
      updateReleasingDocStatuses();
      updateTransactionClosedStatuses();

      // Keep the item open inside modals up-to-date without replacing the reference
      if (currentItem.value) {
        const fresh = updatedItems.find((it) => it.id === currentItem.value.id);
        if (fresh) Object.assign(currentItem.value, fresh);
      }
    }
  } catch (error) {
    console.error("Error fetching list items quietly:", error);
  } finally {
    isQuietFetching.value = false;
  }
};

const fetchListItems = async () => {
  isLoading.value = true;
  try {
    const response = await $fetch(endpoint.value + "/api/registrar/list").catch(
      (error) => {
        console.error("Fetch error:", error);
        return [];
      }
    );

    listItems.value = Array.isArray(response) ? response : [];

    originalListItems.value = [];
    searchQuery.value = "";

    updateVerificationStatuses();
    updatePaymentStatuses();
    updatePrepDocStatuses();
    updateReleasingDocStatuses();
    updateTransactionClosedStatuses();
  } catch (error) {
    console.error("Error fetching list items:", error);
    listItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

onBeforeUnmount(() => {
  stopAutoRefresh();
});

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const selectedItems = ref([]);
const isDeleting = ref(false);

const allSelected = computed(() => {
  return (
    selectedItems.value.length === filteredByCollege.value.length &&
    filteredByCollege.value.length > 0
  );
});

const selectAllItems = () => {
  // console.log("selectAllItems called");
  // console.log("allSelected.value:", allSelected.value);
  stopAutoRefresh();
  isSelectingAll.value = true;
  if (allSelected.value) {
    selectedItems.value = [];
  } else {
    // console.log("filteredByCollege.value:", filteredByCollege.value);
    selectedItems.value = filteredByCollege.value.map((item) => item.id);
  }
  // console.log("selectedItems.value:", selectedItems.value);
  startAutoRefresh();
  isSelectingAll.value = false;
};

const toggleDeleteMultiple = () => {
  if (selectedItems.value.length === 0) return;
  toggleConfirmDelete.value = true;
  isModalOpen.value = true;
};

const cancelDelete = () => {
  toggleConfirmDelete.value = false;
  isModalOpen.value = checkIfModalOpen();
};

const deleteItems = async () => {
  if (selectedItems.value.length === 0) return;

  try {
    isDeleting.value = true;
    for (const id of selectedItems.value) {
      await $fetch(endpoint.value + "/api/registrar/" + id + "/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // console.log(`${selectedItems.value.length} items deleted successfully`);

    selectedItems.value = [];
    await fetchListItems();
    toggleConfirmDelete.value = false;
    isModalOpen.value = checkIfModalOpen();
  } catch (error) {
    console.error("Error deleting items:", error);
  } finally {
    isDeleting.value = false;
  }
};

const filteredListItems = computed(() => {
  let items = [...listItems.value];
  if (statusFilter.value === "done") {
    items = items.filter((item) =>
      item.logs?.some((log) => {
        const statusRemarks = log?.status_remarks?.toLowerCase() || "";
        return statusRemarks.includes("transaction closed");
      })
    );
  } else if (statusFilter.value === "pending") {
    items = items.filter((item) =>
      item.logs?.every((log) => {
        const statusRemarks = log?.status_remarks?.toLowerCase() || "";
        return !statusRemarks.includes("transaction closed");
      })
    );
  }

  return _.orderBy(items, "created_at", "asc");
});

const doneCount = (college) => {
  return filteredListItems.value.filter(
    (item) =>
      item.college === college &&
      item.logs?.some((log) => {
        const statusRemarks = log?.status_remarks?.toLowerCase() || "";
        return statusRemarks.includes("transaction closed");
      })
  ).length;
};

const pendingCount = (college) => {
  return filteredListItems.value.filter(
    (item) =>
      item.college === college &&
      item.logs?.every((log) => {
        const statusRemarks = log?.status_remarks?.toLowerCase() || "";
        return !statusRemarks.includes("transaction closed");
      })
  ).length;
};

const totalCount = (college) => {
  return filteredListItems.value.filter((item) => item.college === college)
    .length;
};

const sortColleges = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }

  colleges.value.sort((a, b) => {
    let valueA, valueB;

    if (column === "Pending") {
      valueA = pendingCount(a.value);
      valueB = pendingCount(b.value);
    } else if (column === "Done") {
      valueA = doneCount(a.value);
      valueB = doneCount(b.value);
    } else if (column === "Total") {
      valueA = totalCount(a.value);
      valueB = totalCount(b.value);
    } else {
      valueA = a.label;
      valueB = b.label;
    }

    if (valueA < valueB) {
      return sortDirection.value === "asc" ? -1 : 1;
    }
    if (valueA > valueB) {
      return sortDirection.value === "asc" ? 1 : -1;
    }
    return 0;
  });
};

const getEmailsForCollege = (college) => {
  const emailToCollegeMap = {
    "ccsea.registrar@lsu.edu.ph":
      "Arts and Sciences, Engineering, Architecture, Computer Studies",
    "jorenlee.luna@lsu.edu.ph": "Business, Commerce, Accountancy",
    "cba.registrar@lsu.edu.ph": "Business, Commerce, Accountancy",
    "cte.registrar@lsu.edu.ph": "Education / Graduate Studies",
    "onlinerequest@lsu.edu.ph": "Nursing / Tourism and Hospitality Management",
    "ccje.registrar@lsu.edu.ph": "Criminology / BS Psychology",
  };

  return Object.keys(emailToCollegeMap).filter(
    (email) => emailToCollegeMap[email] === college
  );
};

const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = 500;

const maxVisiblePages = 4;

const searchQuery = ref("");
const originalListItems = ref([]);
const showSuccessMessage = ref(false);
const isSendingPayment = ref(false);

const totalPages = computed(() => {
  return Math.ceil(filteredListItems.value.length / itemsPerPage);
});

const paginatedListItems = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredListItems.value.slice(startIndex, endIndex);
});

const filteredByCollege = computed(() => {
  // console.log("filteredByCollege computed");
  // console.log("selectedCollege.value:", selectedCollege.value);
  // console.log("paginatedListItems.value:", paginatedListItems.value);
  if (!selectedCollege.value) {
    return paginatedListItems.value;
  }
  if (!selectedCollege.value) {
    return paginatedListItems.value;
  }
  const filtered = paginatedListItems.value.filter(
    (item) => item.college === selectedCollege.value
  );
  // console.log("filtered:", filtered);
  return filtered;
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

onBeforeUnmount(() => {
  window.removeEventListener("keydown", (e) => {
    if (e.key === "Escape" && showImageModal.value) {
      closeImageModal();
    }
  });
  stopAutoRefresh();
});

const performSearch = () => {
  currentPage.value = 1;
  if (originalListItems.value.length === 0 && listItems.value.length > 0) {
    originalListItems.value = [...listItems.value];
  }

  const q = searchQuery.value.toLowerCase().trim();

  const filteredItems =
    originalListItems.value.length > 0
      ? originalListItems.value
      : listItems.value;

  listItems.value = filteredItems.filter((item) => {
    if (!item) return false;

    return Object.keys(item).some((key) => {
      if (typeof item[key] === "string") {
        return item[key].toLowerCase().includes(q);
      }
      return false;
    });
  });

  selectedItems.value = [];
};

const sortedLogs = computed(() => {
  if (!currentItem.value?.logs || !Array.isArray(currentItem.value.logs)) {
    return [];
  }

  return [...currentItem.value.logs].sort((a, b) => {
    const dateA = moment(a.timestamp, "MMMM DD, YYYY h:mm:ss A");
    const dateB = moment(b.timestamp, "MMMM DD, YYYY h:mm:ss A");

    return dateA.valueOf() - dateB.valueOf();
  });
});

watch(listItems, (val) => {
  // console.log("listItems updated:", val);
});

watch(selectedCollege, () => {
  selectedItems.value = [];
});

watch(statusFilter, () => {
  selectedItems.value = [];
});

const isFullAccess = computed(() => {
  return (
    userStore.user.email === "jorenleeluna24@gmail.com" ||
    userStore.user.email === "registrar@lsu.edu.ph"
  );
});

const currentItemInfo = ref({
  payment_id: "PID" + moment().valueOf(),
  fullname: "",
  email: "",
  course: "",
  college: "",
  date_graduated_last_attended: "",
  total: "0",
  tracking_id: "",
  receipt_image_url: [],
  detail_fees_type_document_requests: [],
});

// const documentFees = ref({
//   "Transcript of Records": 85,
//   "Transfer of Credentials (Honorable Dismissal)": 0,
//   "CAV (Certification, Authentication, Verification)": 0,
//   "Credential Evaluations (WES, CGFNS, NCLEX, SpanTran, IES, etc.)": 0,
// });

const addDetailFee = () => {
  currentItemInfo.value.detail_fees_type_document_requests.push({
    fee_name: "",
    amount: 0,
  });
  updateTotal();
};

const removeDetailFee = (index) => {
  currentItemInfo.value.detail_fees_type_document_requests.splice(index, 1);
  updateTotal();
};

const updateTotal = () => {
  let total = 0;
  currentItemInfo.value.detail_fees_type_document_requests.forEach((fee) => {
    total += Number((fee.amount || 0).toString());
  });
  const formatted = total.toFixed(2);
  currentItemInfo.value.total = formatted;
};

// Ensure receipt URLs are trimmed to the actual image file (png/jpg/jpeg)
const extractImageUrl = (rec) => {
  try {
    const raw = typeof rec === "string" ? rec : rec?.url || rec?.href || "";
    if (!raw) return "";
    const match = raw.match(/^(.*?\.(?:png|jpe?g))(?:[?#].*)?$/i);
    return match ? match[1] : raw;
  } catch {
    return "";
  }
};

watch(
  () => currentItemInfo.value.detail_fees_type_document_requests,
  () => updateTotal(),
  { deep: true }
);

const hasEmptyFeeName = computed(() => {
  return currentItemInfo.value?.detail_fees_type_document_requests?.some(
    (fee) => !fee.fee_name || fee.fee_name.trim() === ""
  );
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

      <div class="w-full">
        <div class="bg-green-800 w-full z-10">
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

        <div v-if="isFullAccess" class="lg:mx-2 mx-2 shadow-lg rounded-lg p-1">
          <div class="lg:flex gap-2">
            <div
              v-for="college in colleges"
              :key="college.value"
              class="border border-gray-300 rounded-lg px-2 py-1 shadow-sm w-full lg:mb-0 mb-2"
            >
              <div
                class="font-semibold text-[10px] text-gray-800 whitespace-nowrap text-center lg:tracking-normal tracking-tighter"
              >
                {{ college.label }}
              </div>
              <div class="text-[10px] text-gray-500 text-center">
                {{ getEmailsForCollege(college.value).join(", ") }}
              </div>

              <div class="flex flex-wrap mx-auto w-fit gap-1 mt-1 text-[11px]">
                <!-- Pending -->
                <span
                  class="border border-500 text-red-800 px-2 py-0.5 rounded-full font-semibold"
                >
                  Pending: {{ pendingCount(college.value) }}
                </span>

                <!-- Done -->
                <span
                  class="border border-700 text-green-800 px-2 py-0.5 rounded-full font-semibold"
                >
                  Done: {{ doneCount(college.value) }}
                </span>

                <!-- Total -->
                <span
                  class="border border-600 text-blue-800 px-2 py-0.5 rounded-full font-semibold"
                >
                  Total: {{ totalCount(college.value) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="w-full px-2">
            <div v-show="tableDisplay" class="relative">
              <div
                class="w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-1 py-1 text-xs uppercase"
              >
                All Request Lists
              </div>

              <!-- Fullscreen Success Toast -->
              <div
                v-if="verifySuccessMessage"
                class="fixed inset-0 z-[1000] bg-gray-800 bg-opacity-90 flex items-center justify-center"
              >
                <p class="text-white text-lg font-semibold text-center px-6">
                  {{ verifySuccessMessage }}
                </p>
              </div>

              <div
                v-if="verifyErrorMessage"
                class="fixed inset-0 z-[1000] bg-red-900 bg-opacity-90 flex items-center justify-center"
              >
                <p class="text-white text-lg font-semibold text-center px-6">
                  {{ verifyErrorMessage }}
                </p>
              </div>

              <div
                class="w-full lg:flex flex-wrap items-center gap-3 mb-1 px-3 py-1 bg-white border rounded-md shadow-sm"
              >
                <div class="w-full lg:flex items-center gap-3">
                  <!-- Left Actions -->
                  <div
                    v-if="collegeFilterList"
                    class="lg:mb-0 mb-3 flex items-center gap-2 lg:w-3/12 w-full"
                  >
                    <!-- Select/Deselect All -->
                    <button
                      @click="selectAllItems"
                      class="flex items-center text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition whitespace-nowrap"
                    >
                      {{ allSelected ? "Deselect All" : "Select All" }}
                    </button>

                    <!-- Delete Selected -->
                    <button
                      @click="toggleDeleteMultiple"
                      :disabled="selectedItems.length === 0"
                      :class="
                        selectedItems.length === 0
                          ? 'bg-pink-100 text-red-300 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      "
                      class="flex items-center text-xs px-2 py-1 rounded-md transition whitespace-nowrap"
                    >
                      <i class="fa fa-trash mr-1"></i>
                      ({{ selectedItems.length }})
                    </button>
                  </div>

                  <!-- College Filter Dropdown -->
                  <div v-if="collegeFilterList" class="lg:mb-0 mb-3 w-full">
                    <select
                      v-model="selectedCollege"
                      class="w-full text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
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

                  <!-- Search Input -->
                  <div class="lg:mb-0 mb-3 relative w-full">
                    <input
                      v-model="searchQuery"
                      type="search"
                      placeholder="Search"
                      class="text-xs w-full border border-gray-300 rounded-md px-2 py-1 pr-8 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      @keyup.enter="performSearch"
                    />
                    <button
                      @click="performSearch"
                      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
                    >
                      <i class="fa fa-search"></i>
                    </button>
                  </div>

                  <!-- Status Filters -->
                  <div class="w-fit mx-auto flex items-center gap-1">
                    <button
                      @click="statusFilter = 'all'"
                      :class="
                        statusFilter === 'all'
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-900 border hover:bg-gray-900 hover:text-white'
                      "
                      class="text-xs border border-gray-900 px-2 py-1 rounded-full transition"
                    >
                      All
                    </button>

                    <button
                      @click="statusFilter = 'pending'"
                      :class="
                        statusFilter === 'pending'
                          ? 'bg-red-500 text-white'
                          : 'bg-white text-red-600 border hover:bg-red-500 hover:text-white'
                      "
                      class="text-xs border border-red-600 px-2 py-1 rounded-full transition"
                    >
                      Pending
                    </button>

                    <button
                      @click="statusFilter = 'done'"
                      :class="
                        statusFilter === 'done'
                          ? 'bg-green-600 text-white'
                          : 'bg-white text-green-600 border hover:bg-green-600 hover:text-white'
                      "
                      class="text-xs border border-green-600 px-2 py-1 rounded-full transition"
                    >
                      Done
                    </button>
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
                        <div class="w-fit flex px-2" v-if="collegeFilterList">
                          <div class="">
                            <input
                              type="checkbox"
                              :value="b.id"
                              v-model="selectedItems"
                              class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                          </div>
                        </div>

                        <div
                          class="w-full border-l lg:flex items-center"
                          :class="i % 2 ? 'bg-gray-100' : ''"
                        >
                          <div class="lg:w-8/12 w-full">
                            <div class="w-full">
                              <div
                                class="w-full text-xs uppercase text-black px-1 flex items-center font-montserrat mt-1"
                              >
                                <i class="fa fa-user mr-2.5 ml-1"></i>
                                {{ b.lastname }}, {{ b.firstname }}
                                {{ b.middlename }}
                              </div>
                              <div class="text-[10px] pl-[29px] -mt-1">
                                {{b.tracking_id}}
                              </div>
                            </div>
                          </div>

                          <div class="w-full text-[10px]">
                            <div class="w-fit mx-auto">
                              <div
                                class="lg:w-fit mx-auto w-full py-1 lg:flex lg:whitespace-nowrap text-left"
                              >
                                <button
                                  class="lg:w-fit w-full px-2 py-1 font-bold text-[#ffffff] cursor-pointer lg:px-5 border-b shadow-lg border-green-500 bg-green-800 hover:bg-[#fff] hover:text-green-800"
                                  @click="openChatCommunication(b)"
                                >
                                  <i class="fa fa-comments mr-3"></i>
                                  <i class="fa fa-file"></i>
                                </button>
                                <button
                                  @click="openPersonalInfoModal(b)"
                                  class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 hover:bg-green-800 hover:text-white"
                                  :class="
                                    verificationStatuses[b.id]
                                      ? 'bg-green-800 text-white'
                                      : 'bg-white text-green-800'
                                  "
                                >
                                  Verify
                                </button>
                                <button
                                  class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 hover:bg-green-800 hover:text-white"
                                  @click="openPaymentModal(b)"
                                  :class="
                                    paymentStatuses[b.id]
                                      ? 'bg-green-800 text-white'
                                      : 'bg-white text-green-800'
                                  "
                                >
                                  Assessment
                                </button>
                                <button
                                  @click="openPrepDocModal(b)"
                                  :class="
                                    prepDocStatuses[b.id]
                                      ? 'bg-green-800 text-white'
                                      : 'bg-white text-green-800'
                                  "
                                  class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 hover:bg-green-800 hover:text-white"
                                >
                                  Preparing
                                </button>
                                <button
                                  @click="openReleasingDocModal(b)"
                                  :class="
                                    releasingDocStatuses[b.id]
                                      ? 'bg-green-800 text-white'
                                      : 'bg-white text-green-800'
                                  "
                                  class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 hover:bg-green-800 hover:text-white"
                                >
                                  Releasing
                                </button>
                                <button
                                  @click="openTransactionClosedModal(b)"
                                  :class="
                                    transactionClosedStatuses[b.id]
                                      ? 'bg-green-800 text-white'
                                      : 'bg-white text-green-800'
                                  "
                                  class="w-full lg:text-center text-left px-1.5 py-1 cursor-pointer lg:px-5 border-b shadow-lg border-green-500 hover:bg-green-800 hover:text-white"
                                >
                                  Closed
                                </button>

                                <button
                                  class="lg:w-fit w-full px-2 py-1 text-green-700 cursor-pointer bg-white border-b shadow-lg border-green-500 hover:bg-green-800 hover:text-white"
                                  @click="openLogsModal(b)"
                                >
                                  <i class="fa fa-ellipsis-h"></i>
                                </button>
                              </div>
                            </div>
                          </div>

                          <div class="w-full flex items-center">
                            <div
                              class="text-[10px] font-light whitespace-nowrap"
                            >
                              <span class="font-semibold uppercase">
                                {{ b.course }}
                              </span>
                            </div>
                          </div>

                          <div
                            v-if="showPaymentModal && currentItem === b"
                            class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                            @click="closePaymentModal"
                          >
                            <div
                              class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-auto"
                              :class="{
                                'scale-100 opacity-100': showPaymentModal,
                                'scale-95 opacity-0': !showPaymentModal,
                              }"
                              @click.stop
                            >
                              <div
                                class="flex justify-between items-center mb-4 border-b pb-3"
                              >
                                <h3 class="text-lg font-medium text-gray-900">
                                  Payment Information
                                </h3>
                                <button
                                  @click="closePaymentModal"
                                  class="text-gray-400 hover:text-gray-500"
                                >
                                  <i class="fa fa-times"></i>
                                </button>
                              </div>

                              <div
                                class="border border-gray-200 bg-gray-50/50 px-5 py-4 my-4 rounded-xl shadow-sm"
                              >
                                <!-- Header Fields -->
                                <div
                                  class="grid lg:grid-cols-2 md:grid-cols-2 gap-4 mb-3"
                                >
                                  <div>
                                    <label
                                      class="block text-xs font-medium text-gray-700 mb-1"
                                      >Total :
                                      {{ currentItemInfo.total }}</label
                                    >
                                  </div>
                                </div>

                                <!-- Detail Fees -->
                                <div class="mt-4">
                                  <!-- Display message if no fees exist -->
                                  <div
                                    v-if="
                                      !currentItemInfo?.detail_fees_type_document_requests ||
                                      currentItemInfo
                                        .detail_fees_type_document_requests
                                        .length === 0
                                    "
                                    class="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-4"
                                  >
                                    <i
                                      class="fa fa-file-invoice-dollar text-3xl text-gray-400 mb-2"
                                    ></i>
                                    <p class="text-sm text-gray-500">
                                      No document request fees added yet
                                    </p>
                                    <p class="text-xs text-gray-400 mt-1">
                                      Click "Add Fee" below to add document
                                      request fees
                                    </p>
                                  </div>

                                  <!-- Display existing fees -->
                                  <div
                                    v-for="(
                                      fee, index
                                    ) in currentItemInfo?.detail_fees_type_document_requests"
                                    :key="index"
                                    class="flex items-end gap-3 mb-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200"
                                  >
                                    <div class="w-full">
                                      <label
                                        :for="'fee_name_' + index"
                                        class="block text-xs font-medium text-gray-700 mb-1"
                                      >
                                        Fee Name
                                      </label>
                                      <input
                                        type="text"
                                        :id="'fee_name_' + index"
                                        v-model="fee.fee_name"
                                        class="w-full text-sm py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
                                      />
                                    </div>

                                    <div class="lg:w-3/12 w-full">
                                      <label
                                        :for="'fee_amount_' + index"
                                        class="block text-xs font-medium text-gray-700 mb-1"
                                      >
                                        Amount
                                      </label>
                                      <input
                                        type="number"
                                        :id="'fee_amount_' + index"
                                        v-model="fee.amount"
                                        class="w-full text-sm py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
                                      />
                                    </div>

                                    <button
                                      @click="removeDetailFee(index)"
                                      class="px-3 py-2 text-xs text-red-500 bg-red-50 border border-red-500 rounded-md hover:bg-red-600 hover:text-white transition-all duration-200"
                                      title="Remove Fee"
                                    >
                                      <i class="fa fa-trash"></i>
                                    </button>
                                  </div>

                                  <button
                                    @click="addDetailFee"
                                    class="block mx-auto mt-3 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
                                  >
                                    + Add Fee
                                  </button>
                                </div>

                                <!-- Follow Up Remarks (Hidden) -->
                                <div class="mt-4 hidden">
                                  <label
                                    class="block text-xs font-medium text-gray-700 mb-1"
                                  >
                                    Follow Up Remarks:
                                  </label>
                                  <textarea
                                    v-model="b.follow_up_remarks"
                                    rows="3"
                                    placeholder="Follow Up Remarks"
                                    class="w-full text-sm py-2 px-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none shadow-sm"
                                  ></textarea>
                                </div>

                                <!-- Submit Button -->
                                <div class="mt-6">
                                  <button
                                    @click="sendEmailDetailFee(b)"
                                    :disabled="
                                      hasEmptyFeeName || isSendingPayment
                                    "
                                    class="w-full py-2 font-semibold rounded-md border border-green-600 bg-green-600 text-white hover:bg-white hover:text-green-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                  >
                                    <template v-if="isSendingPayment">
                                      <svg
                                        class="animate-spin h-4 w-4 inline-block mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <circle
                                          class="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          stroke-width="4"
                                        ></circle>
                                        <path
                                          class="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8v8z"
                                        ></path>
                                      </svg>
                                      Sending...
                                    </template>
                                    <template v-else>Send Payment</template>
                                  </button>
                                </div>

                                <!-- Success Message -->
                                <div
                                  v-if="showSuccessMessage"
                                  class="mt-4 text-center text-sm bg-green-100 text-green-800 border border-green-400 px-4 py-2 rounded-md animate-pulse"
                                >
                                  ✅ Payment details sent successfully!
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          v-if="showPrepDocModal && currentItem === b"
                          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                          @click="closePrepDocModal"
                        >
                          <div
                            class="bg-white dark:bg-gray-800 rounded-xl shadow-3xl p-6 w-full max-w-sm mx-4 transform transition-all duration-300 ease-out"
                            :class="{
                              'scale-100 opacity-100': showPrepDocModal,
                              'scale-95 opacity-0': !showPrepDocModal,
                            }"
                            @click.stop
                          >
                            <div
                              class="flex items-center justify-between pb-4 mb-4 border-b"
                            >
                              <h2
                                class="text-xl font-bold text-gray-800 dark:text-gray-100"
                              >
                                Verify & Prepare Documents
                              </h2>
                              <button
                                @click="closePrepDocModal"
                                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  class="w-6 h-6"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                                    clip-rule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>

                            <div
                              class="pt-4 border-gray-200 dark:border-gray-700"
                            >
                              <button
                                @click="confirmPrepDoc(b)"
                                class="w-full flex items-center justify-center gap-2 px-4 py-0.5 text-base font-semibold rounded-lg transition-all duration-250 ease-in-out"
                                :class="{
                                  'bg-green-600 hover:bg-white hover:text-green-600 text-white hover:border hover:border-green-600  shadow-md hover:shadow-lg':
                                    !isConfirming,
                                  'bg-gray-400 text-white cursor-not-allowed':
                                    isConfirming,
                                }"
                                :disabled="isConfirming"
                              >
                                <span
                                  v-if="isConfirming"
                                  class="flex items-center gap-2"
                                >
                                  <svg
                                    class="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      class="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      stroke-width="4"
                                    ></circle>
                                    <path
                                      class="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Notifying...
                                </span>
                                <span v-else>Notify</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <!-- Status Logs Modal -->
                        <div
                          v-if="showLogsModal && currentItem === b"
                          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-300"
                          @click="closeLogsModal"
                        >
                          <div
                            class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-auto"
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
                                    class="flex items-center justify-between capitalize gap-x-3"
                                  >
                                    <div
                                      class="font-medium w-9/12"
                                      :class="
                                        index === sortedLogs.length - 1
                                          ? 'text-green-800 text-sm'
                                          : 'text-gray-500'
                                      "
                                    >
                                      <div
                                        class="w-full bg-transparent focus:outline-none px-1"
                                        :class="
                                          index === sortedLogs.length - 1
                                            ? 'border-green-300 focus:border-green-500'
                                            : 'border-gray-300 focus:border-gray-500'
                                        "
                                      >
                                        {{ log.status_remarks }}
                                      </div>
                                    </div>
                                    <div class="text-gray-500 w-3/12">
                                      <div
                                        class="whitespace-nowrap bg-transparent text-center -mb-0.5 focus:outline-none px-1 pb-0.5"
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
                          </div>
                        </div>

                        <!-- Personal Info Modal -->
                        <div
                          v-if="
                            showPersonalInfoModal && currentPersonalInfo === b
                          "
                          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300"
                          @click="closePersonalInfoModal"
                        >
                          <div
                            class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl px-5 py-2 lg:w-7/12 w-11/12 mx-auto transform transition-transform duration-300 max-h-[95vh] overflow-y-auto"
                            :class="{
                              'scale-100 opacity-100': showPersonalInfoModal,
                              'scale-95 opacity-0': !showPersonalInfoModal,
                            }"
                            @click.stop
                          >
                            <!-- Header -->
                            <div
                              class="flex justify-between items-center mb-2 pb-2 border-b-2 border-green-200"
                            >
                              <div class="flex items-center gap-3">
                                <div
                                  class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg"
                                >
                                  <i class="fa fa-user text-white text-xl"></i>
                                </div>
                                <div>
                                  <h3 class="text-lg font-bold text-gray-900">
                                    Personal Information
                                  </h3>
                                  <p>{{ b.tracking_id }}</p>
                                </div>
                              </div>
                              <button
                                @click="closePersonalInfoModal"
                                class="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 shadow-md"
                              >
                                <i class="fa fa-times text-lg"></i>
                              </button>
                            </div>

                            <!-- Content Grid -->
<div class="lg:flex lg:gap-6 w-full space-y-4 lg:space-y-0">

  <!-- LEFT COLUMN -->
  <div class="lg:w-9/12 w-full bg-white rounded-xl p-4 shadow-md border border-gray-200">

    <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
      <i class="fa fa-id-card text-green-600"></i>
      Personal Details
    </h4>

    <!-- Fullname -->
    <div class="mb-4">
      <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
        <i class="fa fa-user text-green-600 mr-2"></i>
        Fullname
      </label>
      <div class="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900">
        {{ b.firstname }} {{ b.middlename }} {{ b.lastname }}
      </div>
    </div>

    <!-- Date of Birth -->
    <div class="mb-4">
      <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
        <i class="fa fa-birthday-cake text-green-500 mr-2"></i>
        Date of Birth
      </label>
      <input
        type="text"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
        v-model="b.birthdate"
      />
    </div>

    <!-- Mother's Maiden Name -->
    <div class="mb-4">
      <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
        <i class="fa fa-female text-green-500 mr-2"></i>
        Mother's Maiden Name
      </label>
      <input
        type="text"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
        v-model="b.mother_maiden_name"
      />
    </div>

    <!-- Email -->
    <div class="mb-4">
      <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
        <i class="fa fa-envelope text-green-600 mr-2"></i>
        Email
      </label>
      <input
        type="text"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
        v-model="b.email"
      />
    </div>

    <!-- Contact Number -->
    <div class="mb-2">
      <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
        <i class="fa fa-phone text-green-600 mr-2"></i>
        Contact Number
      </label>
      <input
        type="text"
        class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
        v-model="b.contact_number"
      />
    </div>

  </div>

  <!-- RIGHT COLUMN -->
  <div class="w-full space-y-4">

    <div class="bg-white rounded-xl p-4 shadow-md border border-gray-200">
      <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fa fa-graduation-cap text-green-600"></i>
        Academic Information
      </h4>

      <!-- 2-Column layout only on large screens -->
      <div class="lg:flex lg:gap-4">
        
        <!-- Alumni -->
        <div class="mb-4 w-full">
          <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
            <i class="fa fa-graduation-cap text-green-500 mr-2"></i>
            ICC / LSU Graduate?
          </label>
          <select
            class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
            v-model="b.alumni"
          >
            <option value="yes">Alumnus</option>
            <option value="no">Non-Alumnus</option>
          </select>
        </div>

        <!-- AY -->
        <div class="mb-4 w-full">
          <label class="flex items-center text-sm font-semibold text-gray-700 mb-1 whitespace-nowrap">
            <i class="fa fa-calendar text-green-500 mr-2"></i>
            A.Y Graduated or Attended
          </label>
          <input
            type="text"
            class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
            v-model="b.year_graduated_last_attended"
          />
        </div>
      </div>

      <!-- College -->
      <div class="mb-4">
        <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
          <i class="fa fa-university text-green-500 mr-2"></i>
          College
        </label>
        <select
          class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
          v-model="b.college"
        >
          <option value="">Choose</option>
          <option value="Arts and Sciences, Engineering, Architecture, Computer Studies">
            Arts and Sciences, Engineering, Architecture, Computer Studies
          </option>
          <option value="Business, Commerce, Accountancy">
            Business, Commerce, Accountancy
          </option>
          <option value="Education / Graduate Studies">
            Education / Graduate Studies
          </option>
          <option value="Nursing / Tourism and Hospitality Management">
            Nursing / Tourism and Hospitality Management
          </option>
          <option value="Criminology / BS Psychology">
            Criminology / BS Psychology
          </option>
        </select>
      </div>

      <!-- Course -->
      <div class="mb-4">
        <label class="flex items-center text-sm font-semibold text-gray-700 mb-1">
          <i class="fa fa-book text-green-500 mr-2"></i>
          Course
        </label>
        <input
          type="text"
          class="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 transition"
          v-model="b.course"
        />
      </div>

      <!-- Purpose -->
      <div v-if="b.details" class="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <p class="flex items-center text-sm font-semibold text-gray-700 mb-1">
          <i class="fa fa-info-circle text-green-600 mr-2"></i>
          Purpose and Details:
        </p>
        <p class="text-sm text-gray-700">{{ b.details }}</p>
      </div>

      <!-- Requested Documents -->
      <div class="bg-blue-50 p-3 border-2 border-blue-200 mt-4 rounded-lg">
        <h4 class="text-xs font-bold text-blue-800 mb-2 flex items-center uppercase">
          <i class="fa fa-file-text mr-2"></i> Requested Document/s
        </h4>
        <div class="space-y-1">
          <div
            v-for="(doc, idx) in b.detail_fees_type_document_requests"
            :key="idx"
            class="flex items-center gap-2 text-xs"
          >
            <i class="fa fa-check-circle text-blue-600 text-[10px]"></i>
            <span class="text-gray-900">{{ doc.fee_name }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Action Buttons -->
<div class="mt-4 pt-4 border-t-2 border-gray-200">
  <button
    @click="verifiedConfirm(b)"
    :disabled="isVerifying"
    class="w-full flex items-center justify-center gap-2 px-6 py-3 font-bold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <i v-if="isVerifying" class="fa fa-spinner fa-spin"></i>
    <i v-else class="fa fa-paper-plane"></i>
    <span v-if="isVerifying">Verifying...</span>
    <span v-else>Verify Information</span>
  </button>
</div>


                      
                          </div>
                        </div>







































                        <!-- Releasing Documents Modal -->
                        <div
                          v-if="showReleasingDocModal && currentItem === b"
                          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                          @click="closeReleasingDocModal"
                        >
                          <div
                            class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-transform duration-300"
                            :class="{
                              'scale-100 opacity-100': showReleasingDocModal,
                              'scale-95 opacity-0': !showReleasingDocModal,
                            }"
                            @click.stop
                          >
                            <div
                              class="flex justify-between items-center mb-4 border-b pb-3"
                            >
                              <h3 class="text-lg font-medium text-gray-900">
                                Releasing Documents
                              </h3>
                              <button
                                @click="closeReleasingDocModal"
                                class="text-gray-400 hover:text-gray-500"
                              >
                                <i class="fa fa-times"></i>
                              </button>
                            </div>

                            <!-- Verified Button -->
                            <div
                              @click="confirmReleasingDoc(b)"
                              class="w-full text-center px-2 py-1 font-bold bg-green-600 text-white rounded-md mt-2 cursor-pointer hover:bg-white hover:text-green-600 border hover:border-green-600"
                              :class="{
                                'opacity-75 cursor-not-allowed': isConfirming,
                              }"
                            >
                              <span v-if="isConfirming">
                                <i class="fa fa-spinner fa-spin mr-1"></i>
                                Confirming...
                              </span>
                              <span v-else>Confirm</span>
                            </div>
                          </div>
                        </div>

                        <!-- Transaction Closed Modal -->
                        <div
                          v-if="showTransactionClosedModal && currentItem === b"
                          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                          @click="closeTransactionClosedModal"
                        >
                          <div
                            class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-transform duration-300"
                            :class="{
                              'scale-100 opacity-100':
                                showTransactionClosedModal,
                              'scale-95 opacity-0': !showTransactionClosedModal,
                            }"
                            @click.stop
                          >
                            <div
                              class="flex justify-between items-center mb-4 border-b pb-3"
                            >
                              <h3 class="text-lg font-medium text-gray-900">
                                Transaction Closed
                              </h3>
                              <button
                                @click="closeTransactionClosedModal"
                                class="text-gray-400 hover:text-gray-500"
                              >
                                <i class="fa fa-times"></i>
                              </button>
                            </div>

                            <!-- Verified Button -->
                            <div
                              @click="confirmTransactionClosed(b)"
                              class="w-full text-center px-2 py-1 font-bold bg-green-600 text-white rounded-md mt-2 cursor-pointer hover:bg-white hover:text-green-600 border hover:border-green-600"
                              :class="{
                                'opacity-75 cursor-not-allowed': isConfirming,
                              }"
                            >
                              <span v-if="isConfirming">
                                <i class="fa fa-spinner fa-spin mr-1"></i>
                                Confirming...
                              </span>
                              <span v-else>Confirm</span>
                            </div>
                          </div>
                        </div>

                        <!-- Chat Communication Modal -->
                        <div
                          v-if="showChatModal && currentItem === b"
                          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                          @click="closeChatModal"
                        >
                          <div
                            class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 transform transition-transform duration-300 max-h-[90vh] overflow-hidden flex flex-col"
                            :class="{
                              'scale-100 opacity-100': showChatModal,
                              'scale-95 opacity-0': !showChatModal,
                            }"
                            @click.stop
                          >
                            <!-- Modal Header -->
                            <div
                              class="flex justify-between items-center p-5 border-b bg-gradient-to-r from-green-600 to-green-700"
                            >
                              <h3
                                class="text-lg font-bold text-white flex items-center gap-2"
                              >
                                <i class="fa fa-comments"></i>
                                Communication Chat -
                                {{ currentItem?.tracking_id || "N/A" }}
                              </h3>
                              <button
                                @click="closeChatModal"
                                class="text-white hover:text-gray-200 transition-colors"
                              >
                                <i class="fa fa-times text-xl"></i>
                              </button>
                            </div>

                            <!-- Pinned Documents Section -->
                            <div
                              v-if="
                                (currentItem.additional_documents &&
                                  currentItem.additional_documents.length > 0 &&
                                  currentItem.additional_documents[0].name !==
                                    'N/A') ||
                                (currentItem.valid_id_front &&
                                  currentItem.valid_id_front.length > 0) ||
                                (currentItem.valid_id_back &&
                                  currentItem.valid_id_back.length > 0)
                              "
                              class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200"
                            >
                              <div
                                class="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-2"
                              >
                                <i class="fa fa-thumb-tack text-green-600"></i>
                                <i class="fa fa-paperclip text-green-600"></i>
                                <span>Attached Documents</span>
                              </div>

                              <!-- Horizontal Scrollable Documents -->
                              <div class="flex gap-3 overflow-x-auto pb-2">
                                <!-- Additional Documents -->
                                <div
                                  v-if="
                                    currentItem.additional_documents &&
                                    currentItem.additional_documents.length >
                                      0 &&
                                    currentItem.additional_documents[0].name !==
                                      'N/A'
                                  "
                                  v-for="(
                                    file, index
                                  ) in currentItem.additional_documents"
                                  :key="'doc-' + index"
                                  class="flex-shrink-0"
                                >
                                  <div
                                    class="bg-white border-2 border-blue-300 rounded-xl w-20 hover:shadow-lg transition-all hover:scale-105"
                                    v-if="file.url !== 'N/A'"
                                  >
                                    <img
                                      v-if="
                                        file.url &&
                                        (file.url.includes('jpg') ||
                                          file.url.includes('jpeg') ||
                                          file.url.includes('png'))
                                      "
                                      :src="getCleanUrl(file.url)"
                                      alt="Document"
                                      class="w-full h-5 object-cover rounded-lg border border-gray-300 cursor-pointer"
                                      @click="openImageModal(file.url)"
                                    />
                                    <div
                                      v-else
                                      class="w-full h-5 bg-blue-100 rounded-lg flex items-center justify-center mb-2"
                                    >
                                      <i
                                        class="fa fa-file-pdf-o text-3xl text-red-600"
                                        v-if="
                                          file.name &&
                                          file.name.includes('.pdf')
                                        "
                                      ></i>
                                      <i
                                        class="fa fa-file-word-o text-3xl text-blue-600"
                                        v-else-if="
                                          file.name &&
                                          (file.name.includes('.doc') ||
                                            file.name.includes('.docx'))
                                        "
                                      ></i>
                                      <i
                                        class="fa fa-file-o text-3xl text-gray-600"
                                        v-else
                                      ></i>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Chat Messages -->
                            <div
                              class="flex-1 p-5 space-y-4 overflow-y-auto bg-gray-50"
                              style="max-height: 400px"
                            >
                              <!-- Display all messages from additional_response_details array -->
                              <template
                                v-if="
                                  Array.isArray(
                                    currentItem.additional_response_details
                                  ) &&
                                  currentItem.additional_response_details
                                    .length > 0 &&
                                  currentItem.additional_response_details[0]
                                    .message !== 'N/A'
                                "
                              >
                                <div
                                  v-for="(
                                    msg, index
                                  ) in currentItem.additional_response_details"
                                  :key="'msg-' + index"
                                  :class="
                                    msg.sender === 'Registrar'
                                      ? 'flex gap-3 flex-row-reverse animate-fade-in'
                                      : 'flex gap-3 animate-fade-in'
                                  "
                                >
                                  <!-- Avatar -->
                                  <div class="flex-shrink-0">
                                    <div
                                      v-if="msg.sender === 'Registrar'"
                                      class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white shadow-md"
                                    >
                                      <i class="fa fa-user-tie"></i>
                                    </div>
                                    <div
                                      v-else
                                      class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md"
                                    >
                                      {{ currentItem.firstname?.charAt(0)
                                      }}{{ currentItem.lastname?.charAt(0) }}
                                    </div>
                                  </div>

                                  <!-- Message Content -->
                                  <div
                                    :class="
                                      msg.sender === 'Registrar'
                                        ? 'flex-1 text-right'
                                        : 'flex-1'
                                    "
                                  >
                                    <!-- Sender Info -->
                                    <div
                                      :class="
                                        msg.sender === 'Registrar'
                                          ? 'flex items-center gap-2 mb-1 justify-end'
                                          : 'flex items-center gap-2 mb-1'
                                      "
                                    >
                                      <span
                                        v-if="msg.sender === 'Registrar'"
                                        class="text-xs text-gray-500"
                                        >Registrar</span
                                      >
                                      <span
                                        class="text-sm font-bold text-gray-900"
                                        >{{
                                          msg.sender === "Registrar"
                                            ? "You"
                                            : currentItem.firstname +
                                              " " +
                                              currentItem.lastname
                                        }}</span
                                      >
                                      <span
                                        v-if="msg.sender !== 'Registrar'"
                                        class="text-xs text-gray-500"
                                        >Applicant</span
                                      >
                                    </div>

                                    <!-- Message Bubble -->
                                    <div
                                      :class="
                                        msg.sender === 'Registrar'
                                          ? 'bg-gradient-to-r from-green-500 to-green-600 rounded-2xl rounded-tr-none px-4 py-3 shadow-md inline-block text-left'
                                          : 'bg-white border border-blue-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm'
                                      "
                                    >
                                      <p
                                        :class="
                                          msg.sender === 'Registrar'
                                            ? 'text-sm text-white'
                                            : 'text-sm text-gray-800'
                                        "
                                      >
                                        {{ msg.message }}
                                      </p>
                                      <!-- Timestamp -->
                                      <p
                                        :class="
                                          msg.sender === 'Registrar'
                                            ? 'text-xs text-white/70 mt-1'
                                            : 'text-xs text-gray-500 mt-1'
                                        "
                                      >
                                        {{ msg.timestamp }}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </template>

                              <!-- Empty State -->
                              <div
                                v-if="
                                  !Array.isArray(
                                    currentItem.additional_response_details
                                  ) ||
                                  currentItem.additional_response_details
                                    .length === 0 ||
                                  currentItem.additional_response_details[0]
                                    .message === 'N/A'
                                "
                                class="text-center py-8"
                              >
                                <i
                                  class="fa fa-comment-slash text-gray-300 text-4xl mb-3"
                                ></i>
                                <p class="text-sm text-gray-500">
                                  No messages yet
                                </p>
                              </div>
                            </div>

                            <!-- Chat Input -->
                            <div class="p-4 bg-white border-t border-gray-200">
                              <label
                                class="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2"
                              >
                                <i class="fa fa-pencil text-green-600"></i>
                                Send Follow-up Message
                              </label>
                              <div class="relative">
                                <textarea
                                  class="w-full bg-gray-50 border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                  placeholder="Type your follow-up remarks here..."
                                  v-model="newFollowUpMessage"
                                  rows="3"
                                  @keydown.enter="
                                    sendFollowUpMessage(currentItem)
                                  "
                                ></textarea>
                                <div
                                  class="absolute bottom-3 right-3 text-xs text-gray-400"
                                >
                                  <i class="fa fa-keyboard-o mr-1"></i>
                                  Press Enter to send
                                </div>
                              </div>
                              <button
                                @click="sendFollowUpMessage(currentItem)"
                                :disabled="!newFollowUpMessage.trim()"
                                class="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <i class="fa fa-paper-plane"></i>
                                <span>Send Message</span>
                              </button>
                            </div>
                          </div>
                        </div>


                        
                      </div>
                    </div>

                    <div
                      v-if="showImageModal"
                      class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/70 backdrop-blur-md"
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
                          :src="getCleanUrl(currentModalImage)"
                          class="max-w-full max-h-[85vh] object-contain"
                        />
                      </div>
                    </div>

                    <!-- Improved Delete Confirmation Modal -->
                    <div
                      v-if="toggleConfirmDelete"
                      class="fixed inset-0 z-50 flex items-center justify-center bg-emerald-900/60 backdrop-blur-sm transition-opacity duration-300"
                    >
                      <div
                        class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 transform transition-transform duration-300"
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
                                : "these " + selectedItems.length + " records"
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
  <div class="w-full">
    <DashboardFooter />
  </div>
</template>
<style scoped>
input[type="checkbox"] {
  color: #6f0000;
}

input[type="checkbox"] {
  accent-color: #6f0000;
}

/* Chat UI Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Custom scrollbar for chat */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #16a34a;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #15803d;
}
</style>
