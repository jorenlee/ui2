<script setup>
import { onMounted, ref, onBeforeUnmount, watch, computed } from "vue";
import _ from "lodash";
import moment from "moment";

const props = defineProps({ darkMode: Boolean });

const { user } = useAuth();
const listItems = ref([]);
let tableDisplay = ref(true);
let toggleConfirmDelete = ref(false);

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
let selectedID = ref(null);
const statusFilter = ref("all");

const showImageModal = ref(false);
const currentModalImage = ref("");

const showPersonalInfoModal = ref(false);
const currentPersonalInfo = ref(null);

const showLogsModal = ref(false);
const showPaymentModal = ref(false);
const showChatModal = ref(false);
const showChatCommunicationModal = ref(false);

const showPrepDocModal = ref(false);
const showReleasingDocModal = ref(false);
const showTransactionClosedModal = ref(false);

const currentItem = ref(null);
const newLogRemarks = ref("");
const newFollowUpMessage = ref("");

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
    detail_fees_type_document_requests: item.detail_fees_type_document_requests || [],
    grand_total_payment: item.grand_total_payment,
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

    await $fetch(`${endpoint.value}/api/registrar/v3/${item.id}/edit/`, {
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
    await $fetch(`${endpoint.value}/api/registrar/v3/status/update/`, {
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

    await $fetch(`${endpoint.value}/api/registrar/v3/${item.id}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    // Send status update email notification
    await $fetch(`${endpoint.value}/api/registrar/v3/status/update/`, {
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

    await $fetch(`${endpoint.value}/api/registrar/v3/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id,
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    prepDocStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/v3/status/update/`, {
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

    await $fetch(`${endpoint.value}/api/registrar/v3/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id,
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    releasingDocStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/v3/status/update/`, {
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

    await $fetch(`${endpoint.value}/api/registrar/v3/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id,
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    transactionClosedStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/v3/status/transaction-closed/`, {
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
      currentItemInfo.value.date_graduated_last_attended,
    ).format("LL"),
  };

  try {
    await $fetch(endpoint.value + "/api/registrar/v3/payment/fees/", {
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

    await $fetch(`${endpoint.value}/api/registrar/v3/${selectedID.value}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    item.logs = updatedLogs;

    const itemIndex = listItems.value.findIndex(
      (listItem) => listItem.id === item.id,
    );
    if (itemIndex !== -1) {
      listItems.value[itemIndex].logs = updatedLogs;
    }

    paymentStatuses.value[item.id] = true;

    await $fetch(`${endpoint.value}/api/registrar/v3/status/update/`, {
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
  showChatCommunicationModal.value = false;
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
    item.date_graduated_last_attended,
  ).format("YYYY-MM-DD");

  // Load existing detail_fees_type_document_requests from the item
  // If it exists and has data, use it; otherwise initialize as empty array
  if (
    item.detail_fees_type_document_requests &&
    Array.isArray(item.detail_fees_type_document_requests) &&
    item.detail_fees_type_document_requests.length > 0
  ) {
    currentItemInfo.value.detail_fees_type_document_requests = JSON.parse(
      JSON.stringify(item.detail_fees_type_document_requests),
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
  currentItem.value = item; // Fix: also set currentItem so verifiedConfirm receives the correct item
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
  showChatCommunicationModal.value = true;
  isModalOpen.value = true;
  newFollowUpMessage.value = ""; // Clear the message input when opening modal
};

const closeChatCommunicationModal = () => {
  showChatCommunicationModal.value = false;
  currentItem.value = null;
  isModalOpen.value = checkIfModalOpen();
};

const closeSuccessToast = () => {
  verifySuccessMessage.value = "";
};

const closeErrorMessage = () => {
  verifyErrorMessage.value = "";
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


const collegeFilterList = ref(false);

onMounted(async () => {
  const email = user.value?.email;

  const emailToCollegeMap = {
    "ccsea.registrar@lsu.edu.ph":
      "Arts and Sciences, Engineering, Architecture, Computer Studies",
    "cba.registrar@lsu.edu.ph": "Business, Commerce, Accountancy",
    "cte.registrar@lsu.edu.ph": "Education / Graduate Studies",
    "onlinerequest@lsu.edu.ph": "Nursing / Tourism and Hospitality Management",
    "ccje.registrar@lsu.edu.ph": "Criminology / BS Psychology",
  };

  const fullAccessEmails = ["registrar@lsu.edu.ph", "jorenlee.luna@lsu.edu.ph"];

  const authorizedEmails = [
    ...fullAccessEmails,
    ...Object.keys(emailToCollegeMap),
  ];

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showImageModal.value) {
      closeImageModal();
    }
  });

  if (email && authorizedEmails.includes(email)) {
    if (!fullAccessEmails.includes(email)) {
      selectedCollege.value = emailToCollegeMap[email] || "";
    } else {
      collegeFilterList.value = true;
    }

    await fetchListItems();
    startAutoRefresh();
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
  },
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
      await $fetch(endpoint.value + "/api/registrar/v3/" + id + "/delete/", {
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
      log.status_remarks &&
      log.status_remarks.includes("Reviewed and Verified"),
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
    (log) => log.status_remarks && log.status_remarks.includes("Assessment"),
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
      log.status_remarks && log.status_remarks.includes("Preparing Documents"),
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
      log.status_remarks && log.status_remarks.includes("Releasing Documents"),
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
      log.status_remarks && log.status_remarks.includes("Transaction Closed"),
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
  { deep: true },
);

const fetchListItemsQuietly = async () => {
  // Avoid overlapping silent fetches
  if (isQuietFetching.value) return;
  isQuietFetching.value = true;
  try {
    const updatedItems =
      (await $fetch(endpoint.value + "/api/registrar/v3/list").catch(() => [])) ||
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
          updatedItems,
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
    const response = await $fetch(endpoint.value + "/api/registrar/v3/list").catch(
      (error) => {
        console.error("Fetch error:", error);
        return [];
      },
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

const selectedItems = ref([]);
const isDeleting = ref(false);

const allSelected = computed(() => {
  return (
    selectedItems.value.length === filteredByCollege.value.length &&
    filteredByCollege.value.length > 0
  );
});

const selectAllItems = () => {
  stopAutoRefresh();
  isSelectingAll.value = true;
  if (allSelected.value) {
    selectedItems.value = [];
  } else {
    selectedItems.value = filteredByCollege.value
      .map((item) => item.tracking_id)
      .filter(Boolean);
  }

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
    for (const trackingId of selectedItems.value) {
      if (!trackingId) continue;
      await $fetch(
        endpoint.value + "/api/registrar/v3/delete/" + trackingId + "/",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

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
      }),
    );
  } else if (statusFilter.value === "pending") {
    items = items.filter((item) =>
      item.logs?.every((log) => {
        const statusRemarks = log?.status_remarks?.toLowerCase() || "";
        return !statusRemarks.includes("transaction closed");
      }),
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
      }),
  ).length;
};

const pendingCount = (college) => {
  return filteredListItems.value.filter(
    (item) =>
      item.college === college &&
      item.logs?.every((log) => {
        const statusRemarks = log?.status_remarks?.toLowerCase() || "";
        return !statusRemarks.includes("transaction closed");
      }),
  ).length;
};

const totalCount = (college) => {
  return filteredListItems.value.filter((item) => item.college === college)
    .length;
};



const getEmailsForCollege = (college) => {
  const emailToCollegeMap = {
    "ccsea.registrar@lsu.edu.ph":
      "Arts and Sciences, Engineering, Architecture, Computer Studies",
    "cba.registrar@lsu.edu.ph": "Business, Commerce, Accountancy",
    "cte.registrar@lsu.edu.ph": "Education / Graduate Studies",
    "onlinerequest@lsu.edu.ph": "Nursing / Tourism and Hospitality Management",
    "ccje.registrar@lsu.edu.ph": "Criminology / BS Psychology",
  };

  return Object.keys(emailToCollegeMap).filter(
    (email) => emailToCollegeMap[email] === college,
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
  if (!selectedCollege.value) {
    return paginatedListItems.value;
  }
  if (!selectedCollege.value) {
    return paginatedListItems.value;
  }
  const filtered = paginatedListItems.value.filter(
    (item) => item.college === selectedCollege.value,
  );

  return filtered;
});

const visiblePages = computed(() => {
  const pages = [];
  let startPage = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2),
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

watch(selectedCollege, () => {
  selectedItems.value = [];
});

watch(statusFilter, () => {
  selectedItems.value = [];
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

watch(
  () => currentItemInfo.value.detail_fees_type_document_requests,
  () => updateTotal(),
  { deep: true },
);

const hasEmptyFeeName = computed(() => {
  return currentItemInfo.value?.detail_fees_type_document_requests?.some(
    (fee) => !fee.fee_name || fee.fee_name.trim() === "",
  );
});
</script>

<template>
  <div>
    <div class="min-h-screen flex">
      <div class="w-full">
        <SuperAdminDashboardServicesRegistrarStatusCounters :darkMode="darkMode" :pendingCount="pendingCount"
          :doneCount="doneCount" :totalCount="totalCount" :colleges="colleges"
          :getEmailsForCollege="getEmailsForCollege" />

        <!-- Fullscreen Success Toast -->
        <SuperAdminDashboardServicesRegistrarVerifySuccessMessageToaster :darkMode="darkMode"
          :verifySuccessMessage="verifySuccessMessage" :closeSuccessToast="closeSuccessToast" />

        <!-- Fullscreen Error Toast -->
        <SuperAdminDashboardServicesRegistrarVerifyErrorMessageToaster :darkMode="darkMode"
          :verifyErrorMessage="verifyErrorMessage" :closeErrorMessage="closeErrorMessage" />

        <SuperAdminDashboardServicesRegistrarFilters :darkMode="darkMode" :colleges="colleges"
          v-model:selectedCollege="selectedCollege" v-model:searchQuery="searchQuery"
          v-model:statusFilter="statusFilter" :selectedItems="selectedItems" :allSelected="allSelected"
          :collegeFilterList="collegeFilterList" :isLoading="isLoading" @performSearch="performSearch"
          @selectAllItems="selectAllItems" @toggleDeleteMultiple="toggleDeleteMultiple" />

        <div>
          <div class="w-full px-2">
            <div v-show="tableDisplay" class="relative">
              <div class="w-full shadow font-bold px-2 text-center mb-1 py-1 text-xs uppercase" :class="props.darkMode
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-green-900'
                ">
                All Request Lists
              </div>
              <div class="">
                <div class="appointment-lists mx-auto text-xs">
                  <!-- Loading Overlay -->

                  <SuperAdminDashboardServicesLoading v-if="isLoading" />



                  <div v-else-if="paginatedListItems.length > 0">
                    <div class="gap-4">
                      <div class="flex items-center h-auto shadow lg:mb-0 mb-3 border-gray-200"
                        v-for="(b, i) in filteredByCollege" :key="i">
                        <div class="w-fit flex px-2" v-if="collegeFilterList">
                          <div class="">
                            <input type="checkbox" :value="b.tracking_id" v-model="selectedItems"
                              class="accent-[#6f0000] cursor-pointer w-4 h-4" />
                          </div>
                        </div>

                        <!-- List Table -->
                        <SuperAdminDashboardServicesRegistrarList :b="b" :i="i" :darkMode="darkMode"
                          :verificationStatuses="verificationStatuses" :paymentStatuses="paymentStatuses"
                          :prepDocStatuses="prepDocStatuses" :releasingDocStatuses="releasingDocStatuses"
                          :transactionClosedStatuses="transactionClosedStatuses" :selectedItems="selectedItems"
                          :statusFilter="statusFilter" :paginatedListItems="paginatedListItems"
                          :filteredByCollege="filteredByCollege" :collegeFilterList="collegeFilterList"
                          :isLoading="isLoading" :showChatCommunicationModal="showChatCommunicationModal"
                          :showPersonalInfoModal="showPersonalInfoModal" :showPaymentModal="showPaymentModal"
                          :showPrepDocModal="showPrepDocModal" :showReleasingDocModal="showReleasingDocModal"
                          :showLogsModal="showLogsModal" :currentItem="currentItem" :isConfirming="isConfirming"
                          @openChatCommunication="openChatCommunication" @openPersonalInfoModal="openPersonalInfoModal"
                          @openPaymentModal="openPaymentModal" @openPrepDocModal="openPrepDocModal"
                          @openReleasingDocModal="openReleasingDocModal"
                          @closeChatCommunicationModal="closeChatCommunicationModal"
                          @closePersonalInfoModal="closePersonalInfoModal" @closePaymentModal="closePaymentModal"
                          @closePrepDocModal="closePrepDocModal" @closeReleasingDocModal="closeReleasingDocModal"
                          @closeLogsModal="closeLogsModal" @confirmPrepDoc="confirmPrepDoc"
                          @confirmReleasingDoc="confirmReleasingDoc"
                          @openTransactionClosedModal="openTransactionClosedModal" @openLogsModal="openLogsModal" />

                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-else class="text-center py-12">
                    <p class="text-lg font-medium" :class="props.darkMode ? 'text-gray-400' : 'text-gray-600'">
                      No items found!
                    </p>
                  </div>

                  <!-- Chat Communication Modal -->
                  <SuperAdminDashboardServicesRegistrarChatCommunicationModal v-if="showChatCommunicationModal"
                    :currentItem="currentItem" :showChatModal="showChatCommunicationModal"
                    @closeChatModal="closeChatCommunicationModal" v-model="newFollowUpMessage" :darkMode="darkMode"
                    @sendFollowUpMessage="sendFollowUpMessage" :getCleanUrl="getCleanUrl"
                    @openImageModal="openImageModal" />


                  <!-- Personal Info Modal -->
                  <SuperAdminDashboardServicesRegistrarPersonalInfoModal :showPersonalInfoModal="showPersonalInfoModal"
                    :currentItem="currentItem" :darkMode="darkMode" :isVerifying="isVerifying"
                    @verifiedConfirm="verifiedConfirm" @closePersonalInfoModal="closePersonalInfoModal" />


                  <!-- Payment Details Modal -->
                  <SuperAdminDashboardServicesRegistrarPaymentDetailsModal v-if="showPaymentModal"
                    :showPaymentModal="showPaymentModal" :currentItemInfo="currentItemInfo" :currentItem="currentItem"
                    :darkMode="darkMode" @closePaymentModal="closePaymentModal" :addDetailFee="addDetailFee"
                    :removeDetailFee="removeDetailFee" :sendEmailDetailFee="sendEmailDetailFee"
                    :hasEmptyFeeName="hasEmptyFeeName" :isSendingPayment="isSendingPayment"
                    :showSuccessMessage="showSuccessMessage" :closeSuccessToast="closeSuccessToast"
                    :closeErrorMessage="closeErrorMessage" :verifyErrorMessage="verifyErrorMessage"
                    :verifySuccessMessage="verifySuccessMessage" :isVerifying="isVerifying"
                    :sendEmailConfirmationVerified="sendEmailConfirmationVerified" :verifiedConfirm="verifiedConfirm"
                    :sendFollowUpMessage="sendFollowUpMessage" :newFollowUpMessage="newFollowUpMessage" />

                  <!-- Document Preparation Modal -->
                  <SuperAdminDashboardServicesRegistrarDocumentPreparationModal :showPrepDocModal="showPrepDocModal"
                    :currentItem="currentItem" :darkMode="darkMode" @closePrepDocModal="closePrepDocModal"
                    @confirmPrepDoc="confirmPrepDoc" :isConfirming="isConfirming" />

                  <!-- Releasing Documents Modal -->
                  <SuperAdminDashboardServicesRegistrarReleasingDocumentsModal
                    :showReleasingDocModal="showReleasingDocModal" :currentItem="currentItem" :darkMode="darkMode"
                    @closeReleasingDocModal="closeReleasingDocModal" @confirmReleasingDoc="confirmReleasingDoc"
                    :isConfirming="isConfirming" />

                  <!-- Transaction Closed Modal -->
                  <SuperAdminDashboardServicesRegistrarTransactionClosedModal
                    :showTransactionClosedModal="showTransactionClosedModal" :currentItem="currentItem"
                    :darkMode="darkMode" @closeTransactionClosedModal="closeTransactionClosedModal"
                    @confirmTransactionClosed="confirmTransactionClosed" :isConfirming="isConfirming" />

                  <!-- Show Image Modal -->
                  <SuperAdminDashboardServicesRegistrarShowImageModal v-if="showImageModal" :currentItem="currentItem"
                    :showImageModal="showImageModal" @closeImageModal="closeImageModal" @openImageModal="openImageModal"
                    :getCleanUrl="getCleanUrl" :currentModalImage="currentModalImage" />

                  <!-- Delete Confirmation Modal -->
                  <SuperAdminDashboardServicesRegistrarDeleteConfirmationModal v-if="toggleConfirmDelete"
                    :toggleConfirmDelete="toggleConfirmDelete" :selectedItems="selectedItems" :isDeleting="isDeleting"
                    @deleteItems="deleteItems" @cancelDelete="cancelDelete" />

                  <!-- Status Logs Modal -->
                  <SuperAdminDashboardServicesRegistrarStatusLogsModal v-if="showLogsModal"
                    :showLogsModal="showLogsModal" :currentItem="currentItem" :darkMode="darkMode"
                    @closeLogsModal="closeLogsModal" :sortedLogs="sortedLogs" />

                  <!-- Pagination -->
                  <SuperAdminDashboardServicesRegistrarPagination v-if="filteredListItems.length > 0"
                    v-model:currentPage="currentPage" :totalPages="totalPages" :visiblePages="visiblePages"
                    :darkMode="darkMode" />

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>