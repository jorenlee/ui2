<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
const listItems = ref([]);
const searchInput = ref("");
const filteredData = ref([]);
const notFoundAlert = ref(false);
const uploadLoading = ref({}); // { [tracking_id]: boolean }
const uploadStatus = ref({}); // { [tracking_id]: { ok: boolean, msg: string } }

onMounted(async () => {
  try {
    const result = await $fetch(endpoint.value + "/api/registrar/list");
    listItems.value = removeDuplicates(result || []);
  } catch (error) {
    console.error("Fetch error:", error);
  }
});


const getCleanUrl = (url) => {
  if (!url) return "";
  const match = url.match(/^(.*?\.(?:jpg|jpeg|png))/i);
  return match ? match[1] : url;
};

// Remove duplicate entries based on tracking_id
const removeDuplicates = (items) => {
  if (!Array.isArray(items) || items.length === 0) return items;

  // Helper function to check if item has real messages
  const hasRealMessages = (item) => {
    const messages = item?.additional_response_details;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return false;
    }
    // Check if there's at least one message that's not 'N/A'
    return messages.some(msg => msg?.message && msg.message !== 'N/A');
  };

  const seen = new Map();

  items.forEach((item) => {
    if (item?.tracking_id) {
      const existing = seen.get(item.tracking_id);

      if (!existing) {
        // No existing entry, add this one
        seen.set(item.tracking_id, item);
      } else {
        // Determine which to keep based on messages
        const existingHasMessages = hasRealMessages(existing);
        const currentHasMessages = hasRealMessages(item);

        if (currentHasMessages && !existingHasMessages) {
          // Current has messages, existing doesn't - keep current
          seen.set(item.tracking_id, item);
        } else if (!currentHasMessages && existingHasMessages) {
          // Existing has messages, current doesn't - keep existing
          // Do nothing
        } else {
          // Both have messages or both don't - keep the most recent
          if (item.id > existing.id) {
            seen.set(item.tracking_id, item);
          }
        }
      }
    }
  });

  const uniqueItems = Array.from(seen.values());
  return uniqueItems;
};

const trackNow = () => {
  const trackingID = searchInput.value.trim().toUpperCase();

  if (trackingID) {
    const matches = listItems.value.filter(
      (item) => item?.tracking_id === trackingID
    );

    // Remove duplicates from search results
    filteredData.value = removeDuplicates(matches);
    notFoundAlert.value = filteredData.value.length === 0;
  } else {
    filteredData.value = [];
    notFoundAlert.value = false;
  }
};

const verifySuccessMessage = ref("");
const verifyErrorMessage = ref("");
const submittingResponse = ref(false); // track submission state

const toastMessage = ref(""); // message to display
const showToast = ref(false); // toggle visibility

const responseDetails = ref("");

const submitResponseDetails = async (item) => {
  if (!responseDetails.value.trim()) {
    return;
  }

  verifyErrorMessage.value = "";
  verifySuccessMessage.value = "";
  submittingResponse.value = true;

  try {
    // Create new message object
    const newMessage = {
      sender: item.firstname || 'User',
      message: responseDetails.value.trim(),
      timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
    };

    // Get existing messages or initialize empty array
    const existingMessages = Array.isArray(item.additional_response_details)
      ? item.additional_response_details.filter(msg => msg.message !== 'N/A')
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

    // Update local state
    item.additional_response_details = updatedMessages;
    const itemIndex = listItems.value.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      listItems.value[itemIndex].additional_response_details = updatedMessages;
    }

    // Show toast notification
    toastMessage.value = "✅ Message submitted successfully!";
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 3000);

    submittingResponse.value = false;
    responseDetails.value = "";
    return true;
  } catch (error) {
    console.error("Error updating response:", error);
    verifyErrorMessage.value = "❌ Failed to update record.";
    setTimeout(() => (verifyErrorMessage.value = ""), 3000);
    submittingResponse.value = false;
    return false;
  }
};

// Attachment functionality
const attachmentInputRefs = ref({});
const selectedAttachments = ref({});
const attachmentUploadStatus = ref({});

// Open file dialog when paperclip is clicked
const openAttachmentDialog = (trackingId) => {
  const inputEl = attachmentInputRefs.value[trackingId];
  if (inputEl) {
    inputEl.click();
  }
};

// Handle attachment file selection
const handleAttachmentUpload = async (event, item) => {
  const files = Array.from(event.target.files || []);
  const trackingId = item.tracking_id;

  if (files.length === 0) return;

  // Store selected files for preview
  selectedAttachments.value[trackingId] = files;

  // Auto-upload the files
  attachmentUploadStatus.value[trackingId] = "Uploading attachments...";

  try {
    // Upload each file
    const uploadedFiles = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await $fetch(
        endpoint.value + "/api/registrar/upload/",
        {
          method: "POST",
          body: formData,
        }
      );

      const uploaded = Array.isArray(uploadResponse)
        ? uploadResponse.map((it) => ({
            name: it.name || it.file?.split("/").pop(),
            url: it.url || it.file,
            timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
          }))
        : [
            {
              name: uploadResponse.name || uploadResponse.file?.split("/").pop(),
              url: uploadResponse.url || uploadResponse.file,
              timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
            },
          ];

      uploadedFiles.push(...uploaded);
    }

    // Update the item's additional_documents array
    const existingDocs = item.additional_documents || [];
    const filteredExisting = existingDocs.filter(doc => doc.name !== 'N/A');
    const mergedDocs = [...filteredExisting, ...uploadedFiles];

    // Update the item in the backend
    const updatedItem = {
      ...item,
      additional_documents: mergedDocs,
    };

    await $fetch(`${endpoint.value}/api/registrar/${item.id}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: updatedItem,
    });

    // Update local state
    item.additional_documents = mergedDocs;
    const itemIndex = listItems.value.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      listItems.value[itemIndex].additional_documents = mergedDocs;
    }

    attachmentUploadStatus.value[trackingId] = "✅ Upload successful!";
    setTimeout(() => {
      attachmentUploadStatus.value[trackingId] = "";
      selectedAttachments.value[trackingId] = [];
    }, 3000);

  } catch (error) {
    console.error("Attachment upload error:", error);
    attachmentUploadStatus.value[trackingId] = "❌ Upload failed. Please try again.";
    setTimeout(() => {
      attachmentUploadStatus.value[trackingId] = "";
    }, 5000);
  }

  // Clear the file input
  event.target.value = "";
};
</script>

<template>
  <div class="bg-gray-50 ">
    <Header />

    <!-- Header Section -->
    <div class="relative">
      <div class="bg-green-700 lg:h-[200px] h-[130px]">
        <div
          class="lg:pt-10 absolute top-1/2 transform -translate-y-1/2 w-full"
        >
          <p
            class="font-bold uppercase text-white lg:text-2xl text-sm w-11/12 mx-auto"
          >
            REGISTRAR
          </p>
          <p class="text-xs w-11/12 mx-auto text-white">
            Appointment Tracker
          </p>
        </div>
      </div>

      <!-- Nav Bar -->
      <div class="shadow-lg text-green-700">
        <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
          <div
            class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
          >
            <div>
              <a href="/registrar" class="mr-2 hover:underline lg:h-10">Home</a>
            </div>
            <div>
              <i class="fas fa-caret-right"></i>
              <a
                href="/registrar/heu/appointment"
                class="mx-2 hover:underline lg:h-10"
                >HEU Appointment</a
              >

              <i class="fas fa-caret-right"></i>
              <a
                href="/registrar/track"
                class="mx-2 hover:underline lg:h-10"
                >Track</a
              >
            </div>
          </div>
          <div class="flex hover:text-green-800 text-white bg-white h-full">
            <div
              class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r"
            >
              <a href="/registrar" class="flex items-center w-fit mx-auto">
                <i class="fa fa-video-camera" aria-hidden="true"></i>
                <span class="ml-3 whitespace-nowrap">Demo Guide</span>
              </a>
            </div>
            <div
              class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r"
            >
              <a
                href="/registrar/track"
                class="flex items-center w-fit mx-auto"
              >
                <i class="fa fa-universal-access" aria-hidden="true"></i>
                <span class="ml-3 whitespace-nowrap">Track</span>
              </a>
            </div>
            <div
              class="hover:bg-green-800 border-x bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
            >
              <a
                href="/registrar/login"
                class="flex items-center w-fit mx-auto"
              >
                <i class="fa fa-user" aria-hidden="true"></i>
                <span class="ml-3 whitespace-nowrap">Admin Login</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="w-11/12 mx-auto my-6">
      <div class="bg-white shadow-md border-2 border-gray-200">
        <h2 class="bg-white text-green-700  text-center uppercase py-2 px-5 font-bold text-sm lg:text-base">
          <i class="fa fa-certificate mr-2"></i>Appointment Tracker
        </h2>
        <div class="p-4">
          <div class="flex flex-col lg:flex-row gap-3 items-center">
            <div class="flex-1 w-full">
              <div class="relative">
                <input
                  class="w-full py-2.5 pl-10 pr-3 uppercase border-2 border-green-700 text-sm focus:ring-0 focus:border-green-800 transition"
                  placeholder="Enter 20-digit Tracking ID"
                  v-model="searchInput"
                  maxlength="20"
                />
                <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-green-700"></i>
              </div>
            </div>
            <button
              class="bg-green-700 hover:bg-green-800 text-white px-6 py-2.5 text-sm font-medium transition shadow-sm hover:shadow w-full lg:w-auto"
              @click="trackNow"
            >
              <i class="fa fa-search mr-2"></i>Track Now
            </button>
          </div>

          <div
            v-if="notFoundAlert"
            class="mt-4 text-sm text-red-700 bg-red-50 border-2 border-red-300 py-2 px-4 flex items-center gap-2"
          >
            <i class="fa fa-exclamation-circle"></i>
            <span>Tracking ID not found. Please check and try again.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="filteredData.length > 0" class="w-11/12 mx-auto mb-8">
        <div v-for="(item, i) in filteredData" :key="i" class="mb-4">
          <div class="bg-white shadow-lg overflow-hidden border-2 border-gray-200">
            <!-- Header -->
            <div class="bg-green-700 px-4 py-3 border-b-2 border-green-800">
              <div class="flex items-center justify-between">
                <h3 class="text-white font-semibold text-sm lg:text-base uppercase">
                  <i class="fa fa-barcode mr-2"></i>{{ item.tracking_id }}
                </h3>
                <span class="bg-green-800 text-white text-xs px-3 py-1 font-medium">
                  {{ item.logs?.[0]?.status_remarks || 'Pending' }}
                </span>
              </div>
            </div>

            <div class="p-4">
              <div class="grid lg:grid-cols-2 gap-4">
                <!-- Left Column: Info -->
                <div class="space-y-3">
                  <!-- Personal Info Card -->
                  <div class="bg-green-50 p-3 border-2 border-green-200">
                    <h4 class="text-xs font-bold text-green-800 mb-2 flex items-center uppercase">
                      <i class="fa fa-user mr-2"></i>Personal Information
                    </h4>
                    <div class="space-y-1.5 text-xs">
                      <div class="flex">
                        <span class="text-gray-600 w-20">Name:</span>
                        <span class="text-gray-900 font-medium">{{ item.firstname }} {{ item.middlename }} {{ item.lastname }}</span>
                      </div>
                      <div class="flex">
                        <span class="text-gray-600 w-20">College:</span>
                        <span class="text-gray-900">{{ item.college }}</span>
                      </div>
                      <div class="flex">
                        <span class="text-gray-600 w-20">Course:</span>
                        <span class="text-gray-900">{{ item.course }}</span>
                      </div>
                      <div class="flex">
                        <span class="text-gray-600 w-20">Year:</span>
                        <span class="text-gray-900">{{ item.year_graduated_last_attended }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Status Timeline -->
                  <div class="bg-gray-50 p-3 border-2 border-gray-200">
                    <h4 class="text-xs font-bold text-gray-800 mb-2 flex items-center uppercase">
                      <i class="fa fa-clock-o mr-2"></i>Status Timeline
                    </h4>
                    <div class="space-y-1.5">
                      <div v-for="(log, logIndex) in item.logs" :key="logIndex" class="flex items-start gap-2 text-xs">
                        <i class="fa fa-circle text-green-600 text-[6px] mt-1.5"></i>
                        <div>
                          <span class="text-gray-600">{{ log.timestamp }}</span>
                          <span class="text-gray-900 font-medium ml-1">{{ log.status_remarks }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Document Requests -->
                  <div class="bg-blue-50 p-3 border-2 border-blue-200">
                    <h4 class="text-xs font-bold text-blue-800 mb-2 flex items-center uppercase">
                      <i class="fa fa-file-text mr-2"></i>Requested Document/s
                    </h4>
                    <div class="space-y-1">
                      <div v-for="(doc, idx) in item.detail_fees_type_document_requests" :key="idx" class="flex items-center gap-2 text-xs">
                        <i class="fa fa-check-circle text-blue-600 text-[10px]"></i>
                        <span class="text-gray-900">{{ doc.fee_name }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Additional Details -->
                  <div v-if="item.details" class="bg-yellow-50 p-3 border-2 border-yellow-200">
                    <h4 class="text-xs font-bold text-yellow-800 mb-1 flex items-center uppercase">
                      <i class="fa fa-info-circle mr-2"></i>Additional Details
                    </h4>
                    <p class="text-xs text-gray-900">{{ item.details }}</p>
                  </div>
                </div>

                <!-- Right Column: Actions & Chat -->
                <div class="space-y-3">
                  <!-- Upload Status Alert -->
                  <div v-if="uploadLoading[item.tracking_id]" class="bg-blue-50 border-2 border-blue-300 px-3 py-2 text-xs flex items-center gap-2">
                    <i class="fa fa-spinner fa-spin text-blue-600"></i>
                    <span class="text-blue-800">Uploading file...</span>
                  </div>

                  <div v-else-if="uploadStatus[item.tracking_id]" class="px-3 py-2 text-xs flex items-center gap-2"
                    :class="uploadStatus[item.tracking_id].ok ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'">
                    <i :class="uploadStatus[item.tracking_id].ok ? 'fa fa-check-circle text-green-600' : 'fa fa-exclamation-circle text-red-600'"></i>
                    <span :class="uploadStatus[item.tracking_id].ok ? 'text-green-800' : 'text-red-800'">{{ uploadStatus[item.tracking_id].msg }}</span>
                  </div>




                  <!-- Chat/Response Section -->
                  <div class="bg-white border-2 border-gray-200 overflow-hidden">
                    <div class="bg-green-700 px-3 py-2 border-b-2 border-green-800">
                      <h4 class="text-xs font-bold text-white flex items-center uppercase">
                        <i class="fa fa-comments mr-2"></i>Additonal Informations
                      </h4>
                    </div>

                    <!-- Pinned Documents Section -->
                    <div v-if="(item.additional_documents && item.additional_documents.length > 0 && item.additional_documents[0].name !== 'N/A') || (item.valid_id_front && item.valid_id_front.length > 0) || (item.valid_id_back && item.valid_id_back.length > 0)" class="px-3 pt-2 bg-gray-100 border-b-2 border-gray-300">
                      <div class="text-[10px] font-bold text-gray-700 uppercase mb-2 flex items-center gap-1">
                     <i class="fa fa-thumb-tack text-green-600"></i> <i class="fa fa-paperclip text-green-600"></i>  
                        <span>Attached Documents:</span>
                      </div>

                      <!-- Horizontal Scrollable Documents -->
                      <div class="flex overflow-x-auto">
    

                        <!-- Additional Documents -->
                        <div v-if="item.additional_documents && item.additional_documents.length > 0 && item.additional_documents[0].name !== 'N/A'" v-for="(file, index) in item.additional_documents" :key="'doc-' + index" 
                          class="flex-shrink-0">
                          <div :class="file.url === 'N/A' ? 'hidden': 'w-10 mx-1'">
                            <img
                              v-if="file.url && (file.url.includes('jpg') || file.url.includes('jpeg') || file.url.includes('png'))"
                               :src="getCleanUrl(file.url)"
                              alt="Document"
                              class="w-10 h-10 object-cover rounded border border-gray-300 mb-1"
                            />
                            <div v-else class="w-10 h-10 bg-blue-100 rounded flex items-center justify-center mb-1">
                              <i class="fa fa-file-pdf-o text-2xl text-red-600" v-if="file.name && file.name.includes('.pdf')"></i>
                              <i class="fa fa-file-word-o text-2xl text-blue-600" v-else-if="file.name && (file.name.includes('.doc') || file.name.includes('.docx'))"></i>
                              <i class="fa fa-file-o text-2xl text-gray-600" v-else></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Chat Messages -->
                    <div class="p-3 bg-gray-50 max-h-[250px] overflow-y-auto space-y-3">
                      <!-- Display all messages from additional_response_details array -->
                      <template v-if="Array.isArray(item.additional_response_details) && item.additional_response_details.length > 0 && item.additional_response_details[0].message !== 'N/A'">
                        <div
                          v-for="(msg, index) in item.additional_response_details"
                          :key="'msg-' + index"
                          :class="msg.sender === 'Registrar' ? 'flex justify-start' : 'flex justify-end'"
                        >
                          <div :class="msg.sender === 'Registrar' ? 'bg-white border-2 border-gray-300 px-3 py-2 max-w-[85%] shadow-sm rounded-lg' : 'bg-green-700 px-3 py-2 max-w-[85%] shadow-sm border-2 border-green-800 rounded-lg'">
                            <div :class="msg.sender === 'Registrar' ? 'text-[10px] font-bold text-green-700 mb-1 uppercase' : 'text-[10px] font-bold text-white/90 mb-1 uppercase'">
                              {{ msg.sender === 'Registrar' ? 'Registrar Office' : 'You' }}:
                            </div>
                            <p :class="msg.sender === 'Registrar' ? 'text-xs text-gray-800' : 'text-xs text-white'">
                              {{ msg.message }}
                            </p>
                            <p :class="msg.sender === 'Registrar' ? 'text-[9px] text-gray-500 mt-1' : 'text-[9px] text-white/70 mt-1'">
                              {{ msg.timestamp }}
                            </p>
                          </div>
                        </div>
                      </template>

                      <!-- Empty State -->
                      <div v-if="!Array.isArray(item.additional_response_details) || item.additional_response_details.length === 0 || item.additional_response_details[0].message === 'N/A'" class="text-center py-6">
                        <i class="fa fa-comment-slash text-gray-300 text-3xl mb-2"></i>
                        <p class="text-xs text-gray-500">No messages yet</p>
                      </div>

                      <!-- Toast -->
                      <transition enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" enter-active-class="transition duration-200"
                        leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95" leave-active-class="transition duration-150">
                        <div v-if="showToast" class="bg-green-700 text-white text-xs px-3 py-1.5 shadow-lg text-center border-2 border-green-800">
                          {{ toastMessage }}
                        </div>
                      </transition>
                    </div>

                    <!-- Input Area with Attachment Button -->
                    <div class="p-2 bg-white border-t-2 border-gray-300">
                      <!-- Hidden File Input -->
                      <input
                        type="file"
                        :ref="el => attachmentInputRefs[item.tracking_id] = el"
                        class="hidden"
                        @change="handleAttachmentUpload($event, item)"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        multiple
                      />

                      <!-- Message Input with Buttons -->
                      <div class="flex gap-2">
                        <input v-model="responseDetails" type="text" placeholder="Type in your message here and press Enter to send"
                          class="flex-1 text-xs border-2 border-gray-300 px-3 py-2 focus:ring-0 focus:border-green-700"
                          @keyup.enter.exact.prevent="submitResponseDetails(item)" />

                        <!-- Paperclip Attachment Button -->
                        <button
                          type="button"
                          @click="openAttachmentDialog(item.tracking_id)"
                          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-medium transition"
                          title="Attach files"
                        >
                          <i class="fa fa-paperclip"></i>
                        </button>

                        <!-- Send Button -->
                        <button @click="submitResponseDetails(item)" :disabled="submittingResponse || !responseDetails.trim()"
                          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed">
                          <i class="fa fa-paper-plane" v-if="!submittingResponse"></i>
                          <i class="fa fa-spinner fa-spin" v-else></i>
                        </button>
                      </div>

                      <!-- Selected Files Preview (Before Upload) -->
                      <div v-if="selectedAttachments[item.tracking_id] && selectedAttachments[item.tracking_id].length > 0" class="mt-2 space-y-1">
                        <div class="text-[10px] font-semibold text-gray-700 mb-1">
                          Selected Files (Click send to upload):
                        </div>
                        <div
                          v-for="file in selectedAttachments[item.tracking_id]"
                          :key="file.name"
                          class="bg-blue-50 border border-blue-200 rounded px-2 py-1 flex items-center justify-between text-[10px]"
                        >
                          <div class="flex items-center gap-1 flex-1 min-w-0">
                            <i class="fa fa-file-o text-blue-600"></i>
                            <span class="truncate">{{ file.name }}</span>
                          </div>
                          <span class="font-semibold text-gray-600 ml-2">
                            {{ (file.size / 1024 / 1024).toFixed(2) }} MB
                          </span>
                        </div>
                      </div>

                      <!-- Upload Status -->
                      <div v-if="attachmentUploadStatus[item.tracking_id]" class="mt-2 text-[10px]">
                        <div
                          :class="attachmentUploadStatus[item.tracking_id].includes('successful') ? 'text-green-600' : attachmentUploadStatus[item.tracking_id].includes('failed') ? 'text-red-600' : 'text-blue-600'"
                          class="flex items-center gap-1"
                        >
                          <i class="fa fa-spinner fa-spin" v-if="attachmentUploadStatus[item.tracking_id].includes('Uploading')"></i>
                          <i class="fa fa-check-circle" v-else-if="attachmentUploadStatus[item.tracking_id].includes('successful')"></i>
                          <i class="fa fa-exclamation-circle" v-else-if="attachmentUploadStatus[item.tracking_id].includes('failed')"></i>
                          {{ attachmentUploadStatus[item.tracking_id] }}
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
   

    <Footer />
  </div>
</template>

<style scoped>
input[type="radio"] {
  margin: 3px auto auto auto;
}
</style>
