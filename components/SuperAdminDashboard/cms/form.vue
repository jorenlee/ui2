<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// Define emit for parent
const emit = defineEmits(["contentSubmitted"]);

// ---------------- CONTENT MODEL ----------------
const content = ref({
  content_id: "CMS" + moment().valueOf(),
  title: "",
  authors: "",
  filters: "",
  descriptions: "",
  date: "",
  links: [""], // ARRAY OF STRINGS (default one empty input)
  files: [], // ← ARRAY OF STRINGS e.g ['filename.jpg', filename.pdf, filename.mp4]
  is_verified: false,
  is_approved: false,
  is_published: false,
  logs: [
    {
      personnel_fullname: userStore.user.name,
      personnel_designation: userStore.user.email,
      personnel_email: userStore.user.email,
      remarks_title: "N/A",
      remarks_description: "N/A",
      timestamp: moment().valueOf(),
    },
  ],
});

// Add SDG options and selected SDGs
const sdgOptions = ref([
  { value: "sdg1", label: "SDG 1 - No Poverty" },
  { value: "sdg2", label: "SDG 2 - Zero Hunger" },
  { value: "sdg3", label: "SDG 3 - Good Health" },
  { value: "sdg4", label: "SDG 4 - Quality Education" },
  { value: "sdg5", label: "SDG 5 - Gender Equality" },
  { value: "sdg6", label: "SDG 6 - Clean Water" },
  { value: "sdg7", label: "SDG 7 - Affordable Energy" },
  { value: "sdg8", label: "SDG 8 - Decent Work" },
  { value: "sdg9", label: "SDG 9 - Industry Innovation" },
  { value: "sdg10", label: "SDG 10 - Reduced Inequalities" },
  { value: "sdg11", label: "SDG 11 - Sustainable Cities" },
  { value: "sdg12", label: "SDG 12 - Responsible Consumption" },
  { value: "sdg13", label: "SDG 13 - Climate Action" },
  { value: "sdg14", label: "SDG 14 - Life Below Water" },
  { value: "sdg15", label: "SDG 15 - Life on Land" },
  { value: "sdg16", label: "SDG 16 - Peace and Justice" },
  { value: "sdg17", label: "SDG 17 - Partnerships" },
]);

const selectedSDGs = ref([]);

// ---------------- OTHER FILTERS (BY PAGE) ----------------
const pageFiltersList = ref(["BOT", "Programs", "Organizational Chart", "College", "OER"]);
const selectedPageFilters = ref([]);

// ---------------- CONTENT TYPE FILTERS ----------------
const contentTypeList = ref([
  "News Highlights",
  "News",
  "Events",
  "Announcements",
]);
const selectedContentTypes = ref([]);

// ---------------- APPROVAL STATUS FILTERS ----------------
const approvalVerified = ref(false);
const approvalApproved = ref(false);
const approvalPublished = ref(false);

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

// Deduplicate helper for lists
const sanitizeList = (arr) => {
  const seen = new Set();
  return (arr || [])
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .filter((s) => {
      if (seen.has(s)) return false;
      seen.add(s);
      return true;
    });
};

// Normalization helper (trim + lowercase) for robust comparisons
const normalize = (s) => (s || "").trim().toLowerCase();

// Method to update filters based on checkbox selection
const updateFilters = () => {
  // Get existing filters and clean them up
  let existingFilters = content.value.filters || "";

  const sdgValues = sdgOptions.value.map((sdg) => sdg.value);
  let existingArr = existingFilters
    .split(",")
    .map((filter) => filter.trim())
    .filter(Boolean);

  // Remove any existing SDG entries
  let cleaned = existingArr.filter((f) => !sdgValues.includes(f));

  // Merge with selected SDGs and dedupe
  const merged = [...cleaned, ...selectedSDGs.value];
  const unique = sanitizeList(merged);
  content.value.filters = unique.length > 0 ? unique.join(", ") : "";
};

// Method to update page filters
const updatePageFilters = () => {
  const existing = content.value.filters || "";
  const existingArr = existing
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  // Map known page filters to canonical labels
  const pageFiltersMap = pageFiltersList.value.reduce((acc, label) => {
    acc[normalize(label)] = label;
    return acc;
  }, {});

  const pageFiltersSet = new Set(Object.keys(pageFiltersMap));

  // Remove any existing entries that match known page filters (case-insensitive)
  const cleaned = existingArr.filter((f) => {
    const nf = normalize(f);
    if (pageFiltersSet.has(nf)) return false;
    return true;
  });

  const combined = [...cleaned, ...selectedPageFilters.value];
  const uniqueCombined = sanitizeList(combined);
  content.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

// Method to update content type filters
const updateContentTypes = () => {
  const existing = content.value.filters || "";
  const existingArr = existing
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  // Map known content types to canonical labels
  const contentTypesMap = contentTypeList.value.reduce((acc, label) => {
    acc[normalize(label)] = label;
    return acc;
  }, {});

  const contentTypesSet = new Set(Object.keys(contentTypesMap));

  // Remove any existing entries that match known content types (case-insensitive)
  const cleaned = existingArr.filter((f) => {
    const nf = normalize(f);
    if (contentTypesSet.has(nf)) return false;
    return true;
  });

  const combined = [...cleaned, ...selectedContentTypes.value];
  const uniqueCombined = sanitizeList(combined);
  content.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

// Method to update approval status with sequential validation
const updateApprovalStatus = () => {
  // Sequential validation: must be verified before approved, approved before published
  if (!approvalVerified.value) {
    approvalApproved.value = false;
    approvalPublished.value = false;
  }
  if (!approvalApproved.value) {
    approvalPublished.value = false;
  }

  // Update content
  content.value.is_verified = approvalVerified.value;
  content.value.is_approved = approvalApproved.value;
  content.value.is_published = approvalPublished.value;

  // Update filters field to include approval status
  const existing = content.value.filters || "";
  const existingArr = existing
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  // Define approval status keywords
  const approvalKeywords = ["Verified", "Approved", "Published"];

  // Remove any existing approval status entries
  const cleaned = existingArr.filter((f) => {
    const normalized = normalize(f);
    return !approvalKeywords.some(keyword => normalize(keyword) === normalized);
  });

  // Add selected approval statuses
  const selectedApprovals = [];
  if (approvalVerified.value) selectedApprovals.push("Verified");
  if (approvalApproved.value) selectedApprovals.push("Approved");
  if (approvalPublished.value) selectedApprovals.push("Published");

  const combined = [...cleaned, ...selectedApprovals];
  const uniqueCombined = sanitizeList(combined);
  content.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

// Watch for changes to enforce sequential validation
watch(approvalVerified, (newVal) => {
  if (!newVal) {
    approvalApproved.value = false;
    approvalPublished.value = false;
  }
  updateApprovalStatus();
});

watch(approvalApproved, (newVal) => {
  if (!newVal) {
    approvalPublished.value = false;
  }
  updateApprovalStatus();
});

watch(approvalPublished, () => {
  updateApprovalStatus();
});

// ---------------- AUTHORS ----------------
const authorsList = ref([
  "Arts and Culture Center",
  "Basic Education Unit",
  "Educational Technology Center",
  "Higher Education Unit",
  "Marketing and Communications Center",
  "Network Programs and Computerization Center",
  "Student Affairs Center",
  "Tingog Campus Press",
  "University Student Government",
]);

const selectedAuthors = ref([]);

const updateAuthorFilters = () => {
  const existing = content.value.filters || "";
  const existingArr = existing
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const authorsFromContent = content.value.authors
    ? content.value.authors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Map known authors to canonical labels
  const authorsMap = authorsList.value.reduce((acc, label) => {
    acc[normalize(label)] = label;
    return acc;
  }, {});
  const authorsFromContentCanonical = authorsFromContent.map(
    (a) => authorsMap[normalize(a)] || a
  );
  const authorsFromContentSet = new Set(
    authorsFromContentCanonical.map((a) => normalize(a))
  );
  const authorsListSet = new Set(Object.keys(authorsMap));

  // Remove any existing entries that match known authors or authors from content (case-insensitive)
  const cleaned = existingArr.filter((f) => {
    const nf = normalize(f);
    if (authorsFromContentSet.has(nf)) return false;
    if (authorsListSet.has(nf)) return false;
    return true;
  });

  const combined = [...cleaned, ...authorsFromContentCanonical];
  const uniqueCombined = sanitizeList(combined);
  content.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

const updateAuthors = () => {
  // Get existing authors from the text field
  const existingAuthors = content.value.authors
    ? content.value.authors
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // Map to canonical labels for comparison
  const authorsMap = authorsList.value.reduce((acc, label) => {
    acc[normalize(label)] = label;
    return acc;
  }, {});

  // Filter out authors that are in authorsList but not in selectedAuthors
  const authorsListNormalized = authorsList.value.map(a => normalize(a));
  const selectedAuthorsNormalized = selectedAuthors.value.map(a => normalize(a));

  const filteredExisting = existingAuthors.filter((author) => {
    const normalizedAuthor = normalize(author);
    // Keep if it's not in the authorsList (custom author) OR if it's selected
    return !authorsListNormalized.includes(normalizedAuthor) ||
           selectedAuthorsNormalized.includes(normalizedAuthor);
  });

  // Combine filtered existing with newly selected authors
  const allAuthors = [...filteredExisting, ...selectedAuthors.value];

  // Ensure unique and normalized
  const uniqueAuthors = sanitizeList(allAuthors);
  const mapped = uniqueAuthors.map((a) => authorsMap[normalize(a)] || a);

  // Update the authors field
  content.value.authors = mapped.join(", ");

  // Don't call updateAuthorFilters() - authors should not be added to filters
};

// Initialize selectedAuthors from content.authors on mount
onMounted(() => {
  if (content.value.authors) {
    const typed = content.value.authors
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const authorsMap = authorsList.value.reduce((acc, label) => {
      acc[normalize(label)] = label;
      return acc;
    }, {});
    const mapped = typed.map((a) => authorsMap[normalize(a)] || a);
    const uniqMapped = sanitizeList(mapped);
    // Normalize stored authors using canonical labels where available
    content.value.authors = uniqMapped.join(", ");
    selectedAuthors.value = uniqMapped.filter((a) =>
      authorsList.value.includes(a)
    );
    // Don't call updateAuthorFilters() - authors should not be added to filters
  }
});

// Keep selectedAuthors in sync when user manually edits the authors text field.
// Note: We don't update selectedAuthors here to avoid conflicts with checkbox selections
watch(
  () => content.value.authors,
  (newVal) => {
    const typed = newVal
      ? newVal
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const authorsMap = authorsList.value.reduce((acc, label) => {
      acc[normalize(label)] = label;
      return acc;
    }, {});
    const mapped = typed.map((a) => authorsMap[normalize(a)] || a);
    const uniqMapped = sanitizeList(mapped);

    // Normalize the authors field if there are duplicates or extra spaces
    const normalized = uniqMapped.join(", ");
    if ((newVal || "").trim() !== normalized) {
      content.value.authors = normalized;
      return; // change will retrigger watcher and handle updates
    }

    // Don't update selectedAuthors to avoid circular updates and conflicts
    // The checkboxes will manage their own state
  }
);

// ---------------- HELPERS ----------------
const extractFileNameFromUrl = (url) => {
  try {
    const clean = url.split("?")[0];
    return clean.split("/").pop();
  } catch {
    return "unknown_file";
  }
};

// ---------------- FILE VALIDATION ----------------
const selectedFiles = ref([]);
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB for images
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB for PDFs and other files

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "audio/mpeg",
  "video/mp4",
];

const ALLOWED_EXTENSIONS = [".jpeg", ".jpg", ".png", ".pdf", ".mp3", ".mp4"];

const fileError = ref("");
const showFileToast = ref(false);

const showToast = (msg, type = "error") => {
  fileError.value = msg;
  showFileToast.value = true;
  setTimeout(() => (showFileToast.value = false), 3000);
};

const validateFile = (file) => {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  const mime = file.type.toLowerCase();

  if (!ALLOWED_TYPES.includes(mime) && !ALLOWED_EXTENSIONS.includes(ext)) {
    showToast(`Invalid file type: ${file.name}`);
    return false;
  }

  // Different size limits for images vs other files
  const isImage = mime.startsWith("image");
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const sizeLimit = isImage ? "1MB" : "10MB";

  if (file.size > maxSize) {
    showToast(`File too large: ${file.name} (Max ${sizeLimit})`);
    return false;
  }

  return true;
};

const detectType = (file) => {
  const t = file.type || "";
  if (t.startsWith("image")) return "image";
  if (t.startsWith("video")) return "video";
  if (t === "application/pdf") return "pdf";
  return "other";
};

// Add these functions to handle file previews
const removeSelectedFile = (index) => {
  const fileObj = selectedFiles.value[index];
  if (fileObj.preview && fileObj.preview.startsWith("blob:")) {
    URL.revokeObjectURL(fileObj.preview);
  }
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Add modal state
const showImagePreview = ref(false);
const previewImageUrl = ref("");

const openImagePreview = (url) => {
  previewImageUrl.value = url;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = "";
};

// ============ DRAG AND DROP SORTING ============
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const handleDragStart = (index) => {
  draggedIndex.value = index;
};

const handleDragOver = (e, index) => {
  e.preventDefault();
  dragOverIndex.value = index;
};

const handleDragLeave = () => {
  dragOverIndex.value = null;
};

const handleDrop = (e, dropIndex) => {
  e.preventDefault();

  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null;
    dragOverIndex.value = null;
    return;
  }

  // Reorder the array
  const items = [...selectedFiles.value];
  const draggedItem = items[draggedIndex.value];

  // Remove from old position
  items.splice(draggedIndex.value, 1);

  // Insert at new position
  items.splice(dropIndex, 0, draggedItem);

  selectedFiles.value = items;

  // Reset drag state
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

// ---------------- FILE UPLOAD ----------------
// Format filename: replace spaces with underscores and remove parentheses
const formatFilename = (filename) => {
  const lastDotIndex = filename.lastIndexOf('.');
  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);

  const formattedName = name
    .replace(/\s+/g, '_')  // Replace all spaces with underscores
    .replace(/[()]/g, ''); // Remove all parentheses

  return formattedName + extension;
};

const uploadFile = async (file) => {
  const formData = new FormData();

  // Format the filename before uploading
  const formattedFilename = formatFilename(file.name);
  const renamedFile = new File([file], formattedFilename, { type: file.type });

  formData.append("file", renamedFile);

  try {
    const res = await $fetch(`${endpoint.value}/api/cms/content/file/upload/`, {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
      timeout: 60000, // 60 seconds
    });

    showToast(`✅ File uploaded: ${formattedFilename}`, "success");
    return { finalName: res.filename || res.name || formattedFilename };
  } catch (error) {
    console.error("Upload error:", error);

    if (error.status === 413) {
      showToast(`❌ File too large: ${formattedFilename} (Max 50MB)`, "error");
    } else if (error.message?.includes("CORS")) {
      showToast(`❌ CORS error: ${formattedFilename}`, "error");
    } else {
      showToast(`❌ Upload failed: ${formattedFilename}`, "error");
    }
    return null;
  }
};

const handleFileSelect = async (e) => {
  const files = e.target.files;
  if (!files?.length) return;

  for (const file of files) {
    if (!validateFile(file)) continue;

    selectedFiles.value.push({
      file,
      name: file.name,
      type: detectType(file),
      preview: URL.createObjectURL(file),
      uploaded: false,
      uploading: true,
      error: null,
      uploadedUrl: null, // Store the uploaded filename here
    });

    const uploaded = await uploadFile(file);

    const last = selectedFiles.value[selectedFiles.value.length - 1];
    last.uploading = false;

    if (uploaded) {
      last.uploaded = true;
      last.uploadedUrl = uploaded.finalName; // Store the filename from upload response
    } else {
      last.error = "Upload failed";
    }
  }

  e.target.value = "";
};

// ============ SUBMIT CONTENT ============
const submitting = ref(false);
const submitMessage = ref("");

const submitContent = async () => {
  // Validate required fields
  if (!content.value.title?.trim()) {
    displayToast("❌ Please enter a title", "error");
    return;
  }

  if (!content.value.descriptions?.trim()) {
    displayToast("❌ Please enter a description", "error");
    return;
  }

  try {
    submitting.value = true;
    submitMessage.value = "";

    // Collect uploaded filenames
    const uploadedFilenames = selectedFiles.value
      .filter((fileObj) => fileObj.uploaded && fileObj.uploadedUrl)
      .map((fileObj) => fileObj.uploadedUrl);

    const response = await $fetch(`${endpoint.value}/api/cms/content/create/`, {
      method: "POST",
      body: {
        ...content.value,
        links: content.value.links.filter((l) => l && l.trim()),
        files: uploadedFilenames,
      },
    });

    // Success handling
    displayToast("✅ Content submitted successfully!", "success", 2000);
    submitMessage.value = "Content submitted successfully!";

    // Reset form immediately
    resetForm();

    // Emit event to parent after short delay to let user see success message
    setTimeout(() => {
      emit("contentSubmitted");
    }, 2000);
  } catch (error) {
    console.error("Submission error:", error);
    const errorMsg =
      error?.data?.message ||
      error?.message ||
      "Error submitting content. Please try again.";
    displayToast(`❌ ${errorMsg}`, "error", 4000);
    submitMessage.value = errorMsg;
  } finally {
    submitting.value = false;
  }
};

const resetForm = () => {
  content.value = {
    content_id: "CMS" + Date.now(),
    title: "",
    authors: "",
    filters: "",
    descriptions: "",
    date: "",
    links: [""],
    is_verified: false,
    is_approved: false,
    is_published: false,
  };
  selectedFiles.value = [];
  selectedSDGs.value = [];
  selectedAuthors.value = [];
  selectedPageFilters.value = [];
  selectedContentTypes.value = [];
  approvalVerified.value = false;
  approvalApproved.value = false;
  approvalPublished.value = false;
  submitMessage.value = "";
};

// ---------------- LINKS (ARRAY OF STRINGS) ----------------
const addItem = () => content.value.links.push("");
const removeItem = (i) => content.value.links.splice(i, 1);

// Toast notification state
const showToastVar = ref(false);
const toastMessage = ref("");
const toastType = ref("success"); // "success", "error", "info"

const displayToast = (message, type = "success", duration = 3000) => {
  toastMessage.value = message;
  toastType.value = type;
  showToastVar.value = true;
  setTimeout(() => {
    showToastVar.value = false;
  }, duration);
};
</script>

<template>
  <div class="w-full">
    <!-- Toast Notification -->
    <Transition name="slide-fade">
      <div
        v-if="showToastVar"
        :class="[
          'fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 max-w-md',
          toastType === 'success'
            ? 'bg-green-500 text-white'
            : toastType === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white',
        ]"
      >
        <div class="flex-shrink-0">
          <i
            :class="[
              'fa text-lg',
              toastType === 'success'
                ? 'fa-check-circle'
                : toastType === 'error'
                ? 'fa-exclamation-circle'
                : 'fa-info-circle',
            ]"
          ></i>
        </div>
        <div class="flex-1">
          <p class="font-medium">{{ toastMessage }}</p>
        </div>
        <button
          @click="showToastVar = false"
          class="flex-shrink-0 text-lg leading-none opacity-70 hover:opacity-100"
        >
          <i class="fa fa-times"></i>
        </button>
      </div>
    </Transition>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 bg-gray-50 overflow-y-auto">
      <div class="p-3 lg:p-8">
        <div class="bg-white shadow-lg rounded-lg p-6 lg:p-8">
          <h1 class="text-2xl lg:text-3xl font-bold mb-8 text-gray-800">
            Create New Content
          </h1>

          <div class="w-full space-y-6">
            <!-- TITLE -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Title
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="content.title"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="Enter content title"
              />
            </div>

            <!-- AUTHORS -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Author/Authors</label
              >
              <input
                v-model="content.authors"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                placeholder="e.g., John Doe, Jane Smith"
              />
            </div>

            <!-- Authors Selection -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-3 uppercase"
                >Default Authors</label
              >
              <div
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div v-for="author in authorsList" :key="author">
                  <label
                    :for="author"
                    class="cursor-pointer text-xs text-gray-700 flex items-center"
                  >
                    <input
                      :id="author"
                      type="checkbox"
                      :value="author"
                      v-model="selectedAuthors"
                      @change="updateAuthors"
                      class="mr-2 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                    />
                    {{ author }}
                  </label>
                </div>
              </div>
            </div>

            <!-- DESCRIPTION -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                Description
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="content.descriptions"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 h-20 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y"
                placeholder="Provide a detailed description of the content"
              ></textarea>
            </div>

            <!-- FILTERS & SDGs -->
            <div class="border-t pt-6">
              <label class="block text-sm font-semibold text-gray-700 mb-3"
                >Filters</label
              >
              <input
                v-model="content.filters"
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition mb-4"
                placeholder="Enter filters manually or select SDGs below"
              />

              <!-- SDGs Selection -->
              <div>
                <label
                  class="block text-xs font-semibold text-gray-600 mb-3 uppercase"
                  >Sustainable Development Goals (SDGs)</label
                >
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div
                    v-for="sdg in sdgOptions"
                    :key="sdg.value"
                    class="flex items-center hover:bg-white px-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      :id="sdg.value"
                      :value="sdg.value"
                      v-model="selectedSDGs"
                      @change="updateFilters"
                      class="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      :style="{
                        accentColor: getSdgColor(
                          parseInt(sdg.value.replace('sdg', ''))
                        ),
                      }"
                    />
                    <label
                      :for="sdg.value"
                      class="text-sm cursor-pointer text-gray-700 flex items-center flex-1"
                    >
                      <span
                        class="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        :style="{
                          backgroundColor: getSdgColor(
                            parseInt(sdg.value.replace('sdg', ''))
                          ),
                        }"
                      ></span>
                      <span class="text-xs">{{ sdg.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Other Filters Group (By Page Filter) -->
              <div class="mt-6">
                <label
                  class="block text-xs font-semibold text-gray-600 mb-3 uppercase"
                  >Other Filters Group</label
                >
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div
                    v-for="pageFilter in pageFiltersList"
                    :key="pageFilter"
                    class="flex items-center hover:bg-white px-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      :id="`page-${pageFilter}`"
                      :value="pageFilter"
                      v-model="selectedPageFilters"
                      @change="updatePageFilters"
                      class="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      :for="`page-${pageFilter}`"
                      class="text-sm cursor-pointer text-gray-700 flex items-center flex-1"
                    >
                      <span class="text-xs">{{ pageFilter }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- News and Updates Content Type -->
              <div class="mt-6">
                <label
                  class="block text-xs font-semibold text-gray-600 mb-3 uppercase"
                  >News and Updates Content Type</label
                >
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div
                    v-for="contentType in contentTypeList"
                    :key="contentType"
                    class="flex items-center hover:bg-white px-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      :id="`content-${contentType}`"
                      :value="contentType"
                      v-model="selectedContentTypes"
                      @change="updateContentTypes"
                      class="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      :for="`content-${contentType}`"
                      class="text-sm cursor-pointer text-gray-700 flex items-center flex-1"
                    >
                      <span class="text-xs">{{ contentType }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Approval Level Status Filter -->
              <div class="mt-6">
                <label
                  class="block text-xs font-semibold text-gray-600 mb-3 uppercase"
                  >Approval Level Status Filter</label
                >
                <div
                  class="grid grid-cols-1 md:grid-cols-3 gap-3 border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <!-- Verified -->
                  <div
                    class="flex items-center hover:bg-white px-2 rounded transition"
                  >
                    <input
                      type="checkbox"
                      id="approval-verified"
                      v-model="approvalVerified"
                      class="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                    />
                    <label
                      for="approval-verified"
                      class="text-sm cursor-pointer text-gray-700 flex items-center flex-1"
                    >
                      <span class="text-xs font-medium">Verified</span>
                    </label>
                  </div>

                  <!-- Approved -->
                  <div
                    class="flex items-center hover:bg-white px-2 rounded transition"
                    :class="{ 'opacity-50': !approvalVerified }"
                  >
                    <input
                      type="checkbox"
                      id="approval-approved"
                      v-model="approvalApproved"
                      :disabled="!approvalVerified"
                      class="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label
                      for="approval-approved"
                      class="text-sm cursor-pointer text-gray-700 flex items-center flex-1"
                      :class="{ 'cursor-not-allowed': !approvalVerified }"
                    >
                      <span class="text-xs font-medium">Approved</span>
                    </label>
                  </div>

                  <!-- Published -->
                  <div
                    class="flex items-center hover:bg-white px-2 rounded transition"
                    :class="{ 'opacity-50': !approvalApproved || !approvalVerified }"
                  >
                    <input
                      type="checkbox"
                      id="approval-published"
                      v-model="approvalPublished"
                      :disabled="!approvalApproved || !approvalVerified"
                      class="mr-3 w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label
                      for="approval-published"
                      class="text-sm cursor-pointer text-gray-700 flex items-center flex-1"
                      :class="{ 'cursor-not-allowed': !approvalApproved || !approvalVerified }"
                    >
                      <span class="text-xs font-medium">Published</span>
                    </label>
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  <i class="fa fa-info-circle mr-1"></i>
                  Must be verified before approved, and approved before published
                </p>
              </div>
            </div>

            <!-- DATE -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Date</label
              >
              <input
                v-model="content.date"
                type="date"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <!-- LINKS -->
            <div class="border-t pt-6">
              <div class="flex justify-between items-center mb-4">
                <label class="text-sm font-semibold text-gray-700"
                  >Attachments (Links)</label
                >
                <button
                  @click="addItem"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <i class="fa fa-plus mr-2"></i>Add Link
                </button>
              </div>

              <div class="space-y-2">
                <div
                  v-for="(link, i) in content.links"
                  :key="i"
                  class="flex gap-2"
                >
                  <input
                    v-model="content.links[i]"
                    class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    placeholder="https://example.com"
                  />
                  <button
                    @click="removeItem(i)"
                    class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                  >
                    <i class="fa fa-trash mr-1"></i>Remove
                  </button>
                </div>
              </div>
            </div>

            <!-- FILE INPUT -->
            <div class="border-t pt-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2"
                >Upload Files</label
              >
              <p class="text-xs text-gray-500 mb-3">
                Supported: Images (JPG, PNG), Videos (MP4), PDFs, Audio (MP3)
              </p>

              <label
                class="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
              >
                <i class="fa fa-cloud-upload text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Images: Max 1MB | PDFs & Other files: Max 10MB
                </p>
                <input
                  type="file"
                  multiple
                  @change="handleFileSelect"
                  accept="image/*,video/mp4,application/pdf,audio/mpeg"
                  class="hidden"
                />
              </label>

              <!-- File Previews -->
              <div v-if="selectedFiles.length > 0" class="mt-6">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-sm font-semibold text-gray-700">
                    Uploaded Files ({{ selectedFiles.length }})
                  </h3>
                  <p class="text-xs text-gray-500 flex items-center gap-2">
                    <i class="fa fa-arrows-alt text-green-600"></i>
                    Drag to reorder
                  </p>
                </div>
                <div
                  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  <div
                    v-for="(fileObj, index) in selectedFiles"
                    :key="index"
                    draggable="true"
                    @dragstart="handleDragStart(index)"
                    @dragover="handleDragOver($event, index)"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop($event, index)"
                    @dragend="handleDragEnd"
                    :class="[
                      'relative border-2 rounded-lg overflow-hidden bg-white hover:shadow-xl transition-all duration-300 group cursor-grab active:cursor-grabbing',
                      draggedIndex === index ? 'opacity-40 scale-90 rotate-2 shadow-2xl ring-4 ring-blue-300' : '',
                      dragOverIndex === index && draggedIndex !== index ? 'border-green-500 bg-green-50 scale-110 shadow-2xl ring-4 ring-green-300 animate-pulse' : 'border-gray-300 hover:border-blue-400',
                    ]"
                  >
                    <!-- Drag Handle Icon - Always Visible -->
                    <div class="absolute top-2 left-2 z-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-8 h-8 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <i class="fa fa-grip-vertical text-white text-sm"></i>
                    </div>

                    <!-- Drag Instruction Overlay -->
                    <div class="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none z-10 flex items-center justify-center">
                      <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        <i class="fa fa-arrows-alt mr-1"></i>Drag to reorder
                      </div>
                    </div>

                    <!-- Sequence Number Badge -->
                    <div class="absolute top-1/2 right-2 z-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg font-bold text-sm border-2 border-white group-hover:scale-125 transition-transform">
                      {{ index + 1 }}
                    </div>
                    <!-- Image Preview -->
                    <div v-if="fileObj.type === 'image'" class="relative">
                      <img
                        :src="fileObj.preview"
                        :alt="fileObj.name"
                        class="w-full h-24 object-cover cursor-pointer hover:opacity-90"
                        @click="openImagePreview(fileObj.preview)"
                      />
                    </div>

                    <!-- Video Preview -->
                    <div
                      v-else-if="fileObj.type === 'video'"
                      class="relative bg-black h-24 flex items-center justify-center cursor-pointer"
                      @click="openImagePreview(fileObj.preview)"
                    >
                      <i
                        class="fa fa-play text-white text-xl group-hover:text-2xl transition"
                      ></i>
                    </div>

                    <!-- PDF Preview -->
                    <div
                      v-else-if="fileObj.type === 'pdf'"
                      class="h-24 bg-red-50 flex items-center justify-center"
                    >
                      <i class="fa fa-file-pdf text-red-600 text-2xl"></i>
                    </div>

                    <!-- Other Files -->
                    <div
                      v-else
                      class="h-24 bg-gray-100 flex items-center justify-center"
                    >
                      <i class="fa fa-file text-gray-600 text-2xl"></i>
                    </div>

                    <!-- File Info -->
                    <div class="p-2 border-t border-gray-200">
                      <p
                        class="text-xs font-medium text-gray-800 truncate"
                        :title="fileObj.name"
                      >
                        {{ fileObj.name }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ formatFileSize(fileObj.file.size) }}
                      </p>
                    </div>

                    <!-- Upload Status -->
                    <div
                      v-if="fileObj.uploading"
                      class="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center"
                    >
                      <div class="text-center">
                        <i
                          class="fa fa-spinner fa-spin text-green-600 text-xl"
                        ></i>
                        <p class="text-xs text-gray-600 mt-2">Uploading...</p>
                      </div>
                    </div>

                    <div
                      v-else-if="fileObj.uploaded"
                      class="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <i class="fa fa-check text-xs"></i>
                    </div>

                    <div
                      v-else-if="fileObj.error"
                      class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      :title="fileObj.error"
                    >
                      <i class="fa fa-exclamation text-xs"></i>
                    </div>

                    <!-- Remove Button -->
                    <button
                      @click="removeSelectedFile(index)"
                      class="absolute bottom-1 left-1 right-1 bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition"
                    >
                      <i class="fa fa-trash mr-1"></i>Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SUBMIT BUTTON -->
            <div class="border-t pt-6 flex gap-3">
              <button
                @click="submitContent"
                :disabled="submitting"
                class="flex-1 bg-green-800 hover:bg-green-900 disabled:bg-gray-400 text-white py-3 rounded-lg text-base font-bold transition-colors flex items-center justify-center"
              >
                <i v-if="submitting" class="fa fa-spinner fa-spin mr-2"></i>
                {{ submitting ? "Saving..." : "Submit Content" }}
              </button>
              <button
                @click="resetForm"
                class="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition-colors"
              >
                <i class="fa fa-refresh mr-2"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Image Preview Modal -->
  <ClientOnly>
    <div
      v-if="showImagePreview"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="closeImagePreview"
    >
      <div
        class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg"
        @click.stop
      >
        <button
          @click="closeImagePreview"
          class="absolute top-2 right-2 text-gray-700 hover:text-red-500 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10"
        >
          <i class="fa fa-times"></i>
        </button>
        <img
          v-if="!previewImageUrl.includes('.mp4')"
          :src="previewImageUrl"
          class="max-w-full max-h-[85vh] object-contain"
          alt="Preview"
        />
        <video
          v-else
          :src="previewImageUrl"
          class="max-w-full max-h-[85vh]"
          controls
          autoplay
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
.input {
  @apply border p-2 rounded w-full text-xs;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from {
  transform: translateX(10px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateX(10px);
  opacity: 0;
}

/* Drag and drop styles */
.cursor-move {
  cursor: move;
}

.cursor-move:active {
  cursor: grabbing;
}
</style>
