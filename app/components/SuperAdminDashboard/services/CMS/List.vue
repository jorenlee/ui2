<script setup>
import { onMounted, ref, computed, watch } from "vue";
import _ from "lodash";

// Define props
const props = defineProps({
  darkMode: { type: Boolean, default: false }
});

const { user, init } = useAuth();
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

onMounted(() => {
  init();
});

const addMoreToggle = ref(false);
const addMore = () => {
  addMoreToggle.value = !addMoreToggle.value;
  scrollToTop();
};

const scrollToTop = () => {
  if (process.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

let tableDisplay = ref(true);
const selectedItem = ref(null);


const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");
const display = ref("desktop");

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

// Add toast system
const toast = ref({ show: false, message: "", type: "success" });

const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

// Edit modal
const showEditModal = ref(false);
const editContent = ref({
  id: null,
  content_id: "",
  title: "",
  authors: "",
  filters: "",
  descriptions: "",
  date: "",
  links: [],
  files: [],
  is_verified: false,
  is_approved: false,
  is_published: false,
});
const editLoading = ref(false);
const editSubmitting = ref(false);

// Approval Status Filters
const approvalVerified = ref(false);
const approvalApproved = ref(false);
const approvalPublished = ref(false);

const localApprovalStatus = computed({
  get: () => approvalPublished.value ? 'Published' : 'Unpublished',
  set: (val) => {
    if (val === 'Published') {
      approvalVerified.value = true;
      approvalApproved.value = true;
      approvalPublished.value = true;
    } else {
      approvalVerified.value = false;
      approvalApproved.value = false;
      approvalPublished.value = false;
    }
  }
});

// Add these variables to your script setup
const selectedFiles = ref([]);
const uploadingFiles = ref(false);
const selectedSDGs = ref([]);

// Image preview functionality
const showImagePreview = ref(false);
const previewImageUrl = ref("");

// Drag and drop state for file reordering
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

// File type checking functions
const isImageFile = (filename) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
  const ext = filename.split(".").pop()?.toLowerCase();
  return imageExtensions.includes(ext);
};

const isVideoFile = (filename) => {
  const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "webm"];
  const ext = filename.split(".").pop()?.toLowerCase();
  return videoExtensions.includes(ext);
};

const isPdfFile = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext === "pdf";
};

const getFileIcon = (filename) => {
  if (isImageFile(filename)) return "fa fa-image";
  if (isVideoFile(filename)) return "fa fa-video";
  if (isPdfFile(filename)) return "fa fa-file-pdf";
  return "fa fa-file";
};

const getFileUrl = (filename) => {
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${filename}`;
};

// ---------------- AUTHORS ----------------
const authorsList = ref([
  "Arts and Culture Center",
  "Basic Education Unit",
  "Educational Technology Center",
  "Higher Education Unit",
  "Human Resources Management",
  "Marketing and Communications Center",
  "Network Programs and Computerization Center",
  "Student Affairs Center",
  "Tingog Campus Press",
  "University Student Government",
]);

const selectedAuthors = ref([]);

// Helper functions for normalization and sanitization
const normalize = (str) => {
  return str.toLowerCase().trim();
};

const sanitizeList = (arr) => {
  const seen = new Set();
  return arr.filter((item) => {
    const normalized = normalize(item);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

// ---------------- OTHER FILTERS (BY PAGE) ----------------
const pageFiltersList = ref([
  "BOT",
  "Programs",
  "Organizational Chart",
  "College",
  "OER",
]);

const selectedPageFilters = ref([]);

// ---------------- CONTENT TYPE FILTERS ----------------
const contentTypeList = ref([
  "News Highlights",
  "News",
  "Events",
  "Announcements",
]);

const selectedContentTypes = ref([]);

const updatePageFilters = () => {
  const existing = editContent.value.filters || "";
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
  editContent.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

// Method to update content type filters
const updateContentTypes = () => {
  const existing = editContent.value.filters || "";
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
  editContent.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

// ---------------- APPROVAL STATUS FILTERS ----------------
const updateApprovalStatus = () => {
  // Sequential validation: must be verified before approved, approved before published
  if (!approvalVerified.value) {
    approvalApproved.value = false;
    approvalPublished.value = false;
  }
  if (!approvalApproved.value) {
    approvalPublished.value = false;
  }

  // Update editContent
  editContent.value.is_verified = approvalVerified.value;
  editContent.value.is_approved = approvalApproved.value;
  editContent.value.is_published = approvalPublished.value;

  // Update filters field to include approval status
  const existing = editContent.value.filters || "";
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
  editContent.value.filters =
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

const updateAuthorFilters = () => {
  const existing = editContent.value.filters || "";
  const existingArr = existing
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  const authorsFromContent = editContent.value.authors
    ? editContent.value.authors
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
    (a) => authorsMap[normalize(a)] || a,
  );
  const authorsFromContentSet = new Set(
    authorsFromContentCanonical.map((a) => normalize(a)),
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
  editContent.value.filters =
    uniqueCombined.length > 0 ? uniqueCombined.join(", ") : "";
};

const updateAuthors = () => {
  // Get existing authors from the text field
  const existingAuthors = editContent.value.authors
    ? editContent.value.authors
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
  const authorsListNormalized = authorsList.value.map((a) => normalize(a));
  const selectedAuthorsNormalized = selectedAuthors.value.map((a) =>
    normalize(a),
  );

  const filteredExisting = existingAuthors.filter((author) => {
    const normalizedAuthor = normalize(author);
    // Keep if it's not in the authorsList (custom author) OR if it's selected
    return (
      !authorsListNormalized.includes(normalizedAuthor) ||
      selectedAuthorsNormalized.includes(normalizedAuthor)
    );
  });

  // Combine filtered existing with newly selected authors
  const allAuthors = [...filteredExisting, ...selectedAuthors.value];

  // Ensure unique and normalized
  const uniqueAuthors = sanitizeList(allAuthors);
  const mapped = uniqueAuthors.map((a) => authorsMap[normalize(a)] || a);

  // Update the authors field
  editContent.value.authors = mapped.join(", ");

  // Don't call updateAuthorFilters() - authors should not be added to filters
};

// Keep selectedAuthors in sync when user manually edits the authors text field.
// Note: We don't update selectedAuthors here to avoid conflicts with checkbox selections
watch(
  () => editContent.value.authors,
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
      editContent.value.authors = normalized;
      return; // change will retrigger watcher and handle updates
    }

    // Don't update selectedAuthors to avoid circular updates and conflicts
    // The checkboxes will manage their own state
  },
);

const openImagePreview = (imageUrl) => {
  previewImageUrl.value = imageUrl;
  showImagePreview.value = true;
  document.body.style.overflow = "hidden";
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = "";
  document.body.style.overflow = "auto";
};

const handleImageError = (event, filename) => {
  console.error("Image failed to load:", filename);
  event.target.style.display = "none";
  // Show fallback icon
  const fallback = event.target.parentElement;
  if (fallback) {
    fallback.innerHTML =
      '<div class="w-full h-24 bg-gray-200 rounded flex items-center justify-center"><i class="fa fa-image text-gray-400 text-2xl"></i></div>';
  }
};

// ============ DRAG AND DROP SORTING FOR EDIT FILES ============
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

  // Reorder the files array
  const items = [...editContent.value.files];
  const draggedItem = items[draggedIndex.value];

  // Remove from old position
  items.splice(draggedIndex.value, 1);

  // Insert at new position
  items.splice(dropIndex, 0, draggedItem);

  editContent.value.files = items;

  // Reset drag state
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  dragOverIndex.value = null;
};

const sortFilesByName = () => {
  const getNum = (s) => {
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : Infinity;
  };

  editContent.value.files = [...editContent.value.files].sort((a, b) => {
    const strA = a || "";
    const strB = b || "";
    const numA = getNum(strA);
    const numB = getNum(strB);

    if (numA !== numB) return numA - numB;
    return strA.localeCompare(strB, undefined, { numeric: true, sensitivity: "base" });
  });
};

// Add method to update filters based on checkbox selection
const updateFilters = () => {
  // Get existing filters and clean them up
  let existingFilters = editContent.value.filters || "";

  // Remove existing SDG entries from filters
  const sdgValues = sdgOptions.value.map((sdg) => sdg.value);
  let cleanedFilters = existingFilters
    .split(",")
    .map((filter) => filter.trim())
    .filter((filter) => !sdgValues.includes(filter))
    .filter((filter) => filter !== "");

  // Add selected SDGs
  const allFilters = [...cleanedFilters, ...selectedSDGs.value];

  // Update the filters field
  editContent.value.filters =
    allFilters.length > 0 ? allFilters.join(", ") : "";
};

const getCategoryLabel = (item) => {
  if (!item?.filters) return "News";

  const filters = item.filters.toLowerCase();

  // Check for explicit category keywords first
  if (filters.includes("news highlight")) return "News Highlight";
  if (filters.includes("announcement")) return "Announcement";
  if (filters.includes("event")) return "Event";
  if (filters.includes("news")) return "News";

  // If only SDGs, count them and return SDG label
  const sdgMatches = filters.match(/sdg\d+/gi) || [];
  if (sdgMatches.length > 0) {
    return `${sdgMatches.length} SDG${sdgMatches.length > 1 ? "s" : ""}`;
  }

  return "News"; // Default fallback
};

const fetchList = async (silent = false) => {
  if (!silent) loading.value = true;
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    info.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching list:", error);
    if (!silent) errorMsg.value = "Failed to load news & updates.";
  } finally {
    if (!silent) loading.value = false;
  }
};

onMounted(async () => {
  await fetchList();
});

const handleFormSubmitted = async () => {
  addMoreToggle.value = false;
  await fetchList(true); // Silent refresh
  scrollToTop();
};

const openEditModal = async (item) => {
  editLoading.value = true;
  showEditModal.value = true;

  try {
    const response = await $fetch(
      `${endpoint.value}/api/cms/content/${item.id}/`,
    );
    editContent.value = {
      id: response.id,
      content_id: response.content_id || "",
      title: response.title || "",
      authors: response.authors || "",
      filters: response.filters || "",
      descriptions: response.descriptions || "",
      date: response.date || "",
      links: response.links || [],
      files: response.files || [],
      is_verified: response.is_verified || false,
      is_approved: response.is_approved || false,
      is_published: response.is_published || false,
    };

    // Populate approval status checkboxes from response or filters field
    const filters = (response.filters || "").toLowerCase();
    approvalVerified.value = response.is_verified || filters.includes("verified");
    approvalApproved.value = response.is_approved || filters.includes("approved");
    approvalPublished.value = response.is_published || filters.includes("published");

    // Populate selectedAuthors based on existing authors
    if (response.authors) {
      const authorsArr = response.authors.split(",").map((a) => a.trim());
      selectedAuthors.value = authorsArr.filter((author) =>
        authorsList.value.includes(author),
      );
    } else {
      selectedAuthors.value = [];
    }

    // Populate selectedSDGs based on existing filters using exact matching
    if (response.filters) {
      const filters = response.filters.toLowerCase();
      selectedSDGs.value = sdgOptions.value
        .filter((sdg) => {
          // Extract SDG number from value (e.g., "sdg1" -> "1")
          const sdgNum = sdg.value.replace("sdg", "");

          // Check for exact SDG matches using word boundaries
          const patterns = [
            `\\bsdg${sdgNum}\\b`,
            `\\bsdg ${sdgNum}\\b`,
            `\\bsdg-${sdgNum}\\b`,
            `\\bsdg_${sdgNum}\\b`,
            `\\bgoal ${sdgNum}\\b`,
            `\\bgoal${sdgNum}\\b`,
            `\\bsdg${sdgNum.toString().padStart(2, "0")}\\b`,
          ];

          return patterns.some((pattern) => {
            const regex = new RegExp(pattern, "i");
            return regex.test(filters);
          });
        })
        .map((sdg) => sdg.value);

      // Populate selectedPageFilters based on existing filters
      selectedPageFilters.value = pageFiltersList.value.filter((pageFilter) => {
        const filterLower = filters.toLowerCase();
        const pageFilterLower = pageFilter.toLowerCase();
        return filterLower.includes(pageFilterLower);
      });

      // Populate selectedContentTypes based on existing filters
      selectedContentTypes.value = contentTypeList.value.filter((contentType) => {
        const filterLower = filters.toLowerCase();
        const contentTypeLower = contentType.toLowerCase();
        return filterLower.includes(contentTypeLower);
      });
    } else {
      selectedSDGs.value = [];
      selectedPageFilters.value = [];
      selectedContentTypes.value = [];
    }
  } catch (error) {
    console.error("Error fetching content:", error);
  } finally {
    editLoading.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  selectedSDGs.value = [];
  selectedPageFilters.value = [];
  selectedContentTypes.value = [];
  selectedAuthors.value = [];
  approvalVerified.value = false;
  approvalApproved.value = false;
  approvalPublished.value = false;
  editContent.value = {
    id: null,
    content_id: "",
    title: "",
    authors: "",
    filters: "",
    descriptions: "",
    date: "",
    links: [],
    files: [],
    is_verified: false,
    is_approved: false,
    is_published: false,
  };
  scrollToTop();
};

const addLink = () => {
  editContent.value.links.push("");
};

const removeLink = (index) => {
  editContent.value.links.splice(index, 1);
};

const submitEdit = async () => {
  editSubmitting.value = true;

  try {
    await $fetch(`${endpoint.value}/api/cms/content/${editContent.value.id}/`, {
      method: "PUT",
      body: editContent.value,
    });

    // Refresh the list
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    info.value = Array.isArray(res) ? res : [];

    showToast("✅ Content updated successfully!", "success");
    closeEditModal();
    scrollToTop();
  } catch (error) {
    console.error("Error updating content:", error);
    showToast("❌ Failed to update content", "error");
  } finally {
    editSubmitting.value = false;
  }
};

const handlePaste = (e) => {
  e.preventDefault();
  const html = e.clipboardData.getData('text/html');
  const text = e.clipboardData.getData('text/plain');
  
  if (html) {
    // Basic conversion of common block elements to newlines
    let processed = html
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n');
    
    // Strip other tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = processed;
    processed = tempDiv.textContent || tempDiv.innerText || "";
    
    // Clean up excessive newlines (more than 2)
    processed = processed.replace(/\n{3,}/g, '\n\n').trim();
    
    insertTextAtCursor(processed);
  } else {
    insertTextAtCursor(text);
  }
};

const insertTextAtCursor = (text) => {
  const textarea = document.querySelector('textarea[v-model="editContent.descriptions"]');
  if (!textarea) {
    editContent.value.descriptions += text;
    return;
  }
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentText = editContent.value.descriptions;
  
  editContent.value.descriptions = 
    currentText.substring(0, start) + 
    text + 
    currentText.substring(end);
    
  // Restore cursor position after Vue update
  nextTick(() => {
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  });
};

// Add file upload functions
const handleFileSelect = async (e) => {
  const files = e.target.files;
  if (!files?.length) return;

  uploadingFiles.value = true;

  for (const file of files) {
    if (!validateFile(file)) continue;

    const uploaded = await uploadFile(file);
    if (uploaded) {
      editContent.value.files.push(uploaded.finalName);
    }
  }

  uploadingFiles.value = false;
  e.target.value = "";
};

const validateFile = (file) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "video/mp4",
  ];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    showToast(`Invalid file type: ${file.name}`, "error");
    return false;
  }

  if (file.size > maxSize) {
    showToast(`File too large: ${file.name}`, "error");
    return false;
  }

  return true;
};

// Format filename: replace spaces with underscores and remove parentheses
const formatFilename = (filename) => {
  const lastDotIndex = filename.lastIndexOf(".");
  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);

  const formattedName = name
    .replace(/\s+/g, "_") // Replace all spaces with underscores
    .replace(/[()]/g, ""); // Remove all parentheses

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
      timeout: 60000, // 60 seconds
    });

    showToast(`✅ File uploaded: ${formattedFilename}`, "success");
    return { finalName: res.filename || res.name || formattedFilename };
  } catch (error) {
    console.error("Upload error:", error);

    if (error.status === 413) {
      showToast(`❌ File too large: ${formattedFilename} (Max 50MB)`, "error");
    } else {
      showToast(`❌ Upload failed: ${formattedFilename}`, "error");
    }
    return null;
  }
};

const removeFile = (index) => {
  editContent.value.files.splice(index, 1);
};

// Pagination and filtering
const currentPage = ref(1);
const itemsPerPage = 20;
const maxVisiblePages = 4;
const searchQuery = ref("");
const selectedFilter = ref("");
const sortBy = ref("latest");

const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "title_asc", label: "Name (A-Z)" },
  { value: "title_desc", label: "Name (Z-A)" },
];

// Filter options
const filterOptions = [
  { value: "", label: "All Contents" },
  { value: "news highlight", label: "news highlight" },
  { value: "news", label: "News" },
  { value: "events", label: "Events" },
  { value: "announcements", label: "Announcements" },
];

// Filtered and paginated data
const filteredInfo = computed(() => {
  let filtered = [...info.value];

  // Text search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.authors?.toLowerCase().includes(query) ||
        item.descriptions?.toLowerCase().includes(query) ||
        item.filters?.toLowerCase().includes(query),
    );
  }

  // Filter by category
  if (selectedFilter.value) {
    filtered = filtered.filter((item) =>
      item.filters?.toLowerCase().includes(selectedFilter.value.toLowerCase()),
    );
  }

  // Sorting logic
  if (sortBy.value === "title_asc") {
    filtered.sort((a, b) => 
      (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" })
    );
  } else if (sortBy.value === "title_desc") {
    filtered.sort((a, b) => 
      (b.title || "").localeCompare(a.title || "", undefined, { numeric: true, sensitivity: "base" })
    );
  } else if (sortBy.value === "latest") {
    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  } else if (sortBy.value === "oldest") {
    filtered.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredInfo.value.length / itemsPerPage),
);

const paginatedInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredInfo.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2),
  );
  const end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  for (let i = Math.max(1, end - maxVisiblePages + 1); i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Reset page when search/filter/sort changes
watch([searchQuery, selectedFilter, sortBy], () => {
  currentPage.value = 1;
});

// Add computed property for SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];

  const filters = item.filters.toLowerCase();
  const badges = [];

  // Check for exact SDG mentions using word boundaries
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`,
      `\\bsdg ${i}\\b`,
      `\\bsdg-${i}\\b`,
      `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`,
      `\\bgoal${i}\\b`,
      `\\bsdg${i.toString().padStart(2, "0")}\\b`,
    ];

    if (
      patterns.some((pattern) => {
        const regex = new RegExp(pattern, "i");
        return regex.test(filters);
      })
    ) {
      badges.push({
        number: i,
        color: getSdgColor(i),
      });
    }
  }
  return badges;
};

const superAdminEmails = [
  "npc@lsu.edu.ph",
  "michaeljohn.puertogalera@lsu.edu.ph",
  "jason.yap@lsu.edu.ph",
];

</script>
<template>
  <div>
    <div class="flex flex-1 w-full">
      <div class="w-full">
        <!-- Main Content with Footer -->
        <div class="w-full min-h-screen flex flex-col" v-if="!addMoreToggle">
          <div class="flex-1 flex flex-col lg:flex-row">
            <!-- Content List Section -->
            <div class="flex-1" :class="showEditModal ? 'lg:pr-2' : ''">
              <div v-show="tableDisplay">
                <!-- Search and Filter Bar -->
                <div class="rounded-lg shadow-sm border p-3 lg:p-4 mb-4 w-full" :class="[
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                  showEditModal ? '' : 'lg:flex lg:gap-x-2'
                ]">
                  <!-- Stats Cards -->
                  <div class="flex gap-x-2 lg:mb-0 mb-3" :class="showEditModal ? 'grid grid-cols-2 lg:mb-3' : 'w-fit'
                    " v-if="superAdminEmails.includes(user.value?.email)">
                    <div class="p-2 lg:px-3 w-full lg:py-1 rounded-lg border-l-4 border-blue-500"
                      :class="darkMode ? 'bg-blue-900/30' : 'bg-blue-50'">
                      <div class="flex items-center">
                        <i class="fa fa-file-text text-blue-500 text-sm lg:text-lg mr-2 lg:mr-3"></i>
                        <div class="flex items-center">
                          <p class="text-xs font-medium pr-2 lg:pr-5"
                            :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                            Total
                          </p>
                          <p class="text-lg lg:text-xl font-bold text-blue-600">
                            {{ info.length }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="p-2 lg:px-3 w-full lg:py-1 rounded-lg border-l-4 border-green-500"
                      :class="darkMode ? 'bg-green-900/30' : 'bg-green-50'">
                      <div class="flex items-center">
                        <i class="fa fa-filter text-green-500 text-sm lg:text-lg mr-2 lg:mr-3"></i>
                        <div class="flex items-center">
                          <p class="text-xs font-medium pr-2 lg:pr-5"
                            :class="darkMode ? 'text-gray-300' : 'text-gray-600'">
                            Filtered
                          </p>
                          <p class="text-lg lg:text-xl font-bold text-green-600">
                            {{ filteredInfo.length }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Search and Filter Controls -->



                  <div class="flex flex-col lg:flex-row items-center gap-3 w-full h-fit">

                    <div>
                      <button @click="addMore" v-if="!addMoreToggle"
                        class="whitespace-nowrap px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-white font-bold uppercase rounded-lg">
                        <i class="fa fa-plus mr-2"></i> Add More
                      </button>

                    </div>



                    <div class="relative w-full">
                      <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input v-model="searchQuery" type="text" placeholder="Search..."
                        class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'" />
                    </div>
                    <div class="flex gap-2 w-full lg:w-fit">
                      <select v-model="selectedFilter"
                        class="flex-1 lg:flex-none px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm capitalize"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'">
                        <option v-for="option in filterOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>

                      <select v-model="sortBy"
                        class="flex-1 lg:flex-none px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'">
                        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                          Sort: {{ option.label }}
                        </option>
                      </select>

                      <!-- Mobile Edit Button -->
                      <button v-if="selectedItem && display === 'mobile'" @click="showEditModal = !showEditModal"
                        class="lg:hidden bg-green-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap">
                        {{ showEditModal ? "Close" : "Edit" }}
                      </button>
                    </div>

                    <!-- Pagination Controls -->
                    <div v-if="totalPages > 1" class="flex justify-center w-full lg:w-auto">
                      <div class="flex items-center space-x-1">
                        <button :disabled="currentPage === 1" @click="currentPage--"
                          class="px-2 lg:px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                          :class="darkMode
                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                            : 'bg-white border-gray-300 hover:bg-gray-50'">
                          <i class="fa fa-chevron-left" :class="darkMode ? 'text-gray-300' : 'text-gray-600'"></i>
                        </button>
                        <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                          class="px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors" :class="currentPage === page
                            ? 'bg-green-800 text-white'
                            : (darkMode
                              ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600 text-gray-200'
                              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700')
                            ">
                          {{ page }}
                        </button>
                        <button :disabled="currentPage === totalPages" @click="currentPage++"
                          class="px-2 lg:px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                          :class="darkMode
                            ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                            : 'bg-white border-gray-300 hover:bg-gray-50'">
                          <i class="fa fa-chevron-right" :class="darkMode ? 'text-gray-300' : 'text-gray-600'"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Content Table/Cards -->
                <div class="shadow-lg rounded-lg" :class="darkMode ? 'bg-gray-800' : 'bg-white'">
                  <!-- Desktop Table View -->
                  <div class="hidden lg:block">
                    <!-- Table Header -->
                    <div class="lg:flex gap-4 px-3 py-2 font-semibold border-b text-sm" :class="darkMode
                      ? 'bg-gray-900/50 text-gray-300 border-gray-700'
                      : 'bg-gray-50 text-gray-700 border-gray-200'">
                      <span class="flex items-center w-20">
                        <i class="fa fa-check-circle mr-2"
                          :class="darkMode ? 'text-gray-400' : 'text-gray-500'"></i>Status
                      </span>

                      <span class="flex items-center lg:w-3/12 w-full">
                        <i class="fa fa-user mr-2" :class="darkMode ? 'text-gray-400' : 'text-gray-500'"></i>Authors
                      </span>

                      <span class="flex items-center w-full">
                        <i class="fa fa-file-text mr-2" :class="darkMode ? 'text-gray-400' : 'text-gray-500'"></i>Title
                      </span>

                      <span class="flex items-center justify-end w-fit">
                        <i class="fa fa-cogs mr-2" :class="darkMode ? 'text-gray-400' : 'text-gray-500'"></i>Actions
                      </span>
                    </div>

                    <SuperAdminDashboardServicesLoading v-if="loading" />

                    <!-- Table Body -->
                    <div v-else class="divide-y text-sm" :class="darkMode ? 'divide-gray-700' : 'divide-gray-200'">
                      <div v-for="j in paginatedInfo" :key="j.id" @click="selectedItem = j">
                        <!-- v-if="
                            j.logs?.[0]?.personnel_email &&
                            (canVerify(j.logs[0].personnel_email) ||
                              superAdminEmails.includes(user.value?.email) ||
                              user.value?.email ===
                                j.logs[0].personnel_email)
                          " -->

                        <div :class="[
                          selectedItem?.id === j.id
                            ? (darkMode ? 'bg-blue-900/30 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500')
                            : '',
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        ]" class="lg:flex gap-4 px-3 py-1 transition-colors cursor-pointer">
                          <div class="flex flex-col gap-1 items-center justify-center w-20 py-2">
                            <!-- Status States - Show only the highest status achieved -->

                            <!-- Published - Green Circle (Highest Priority) -->
                            <div v-if="j.is_published || (j.filters && j.filters.toLowerCase().includes('published'))"
                              class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md"
                              title="Published">
                              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M5 13l4 4L19 7" />
                              </svg>
                            </div>

                            <!-- Approved - Blue Circle (Medium Priority) -->
                            <div
                              v-else-if="j.is_approved || (j.filters && j.filters.toLowerCase().includes('approved'))"
                              class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-md"
                              title="Approved">
                              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>

                            <!-- Verified - Yellow Circle (Lowest Priority) -->
                            <div
                              v-else-if="j.is_verified || (j.filters && j.filters.toLowerCase().includes('verified'))"
                              class="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-md"
                              title="Verified">
                              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div class="truncate lg:w-3/12 w-full px-2"
                            :class="darkMode ? 'text-gray-200' : 'text-gray-600'">
                            <span class="block"> {{ j.authors }}</span>

                            <span class="block">
                              {{ j.logs[0].personnel_email }}</span>
                          </div>

                          <div class="flex items-center w-full px-2">
                            <div>
                              <span class="flex items-center" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">{{
                                j.title
                              }}</span>
                              <!-- SDG Badges -->
                              <div v-if="getSdgBadges(j).length" class="mt-1">
                                <div class="flex flex-wrap gap-1">
                                  <div v-for="badge in getSdgBadges(j)" :key="badge.number"
                                    class="inline-flex items-center">
                                    <span
                                      class="inline-flex items-center w-5 h-5 justify-center rounded font-bold text-white shadow-sm text-[10px]"
                                      :style="{ backgroundColor: badge.color }">
                                      {{ badge.number }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <span class="flex justify-end">
                            <button @click.stop="openEditModal(j)"
                              class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded transition-colors flex items-center gap-1">
                              <i class="fa fa-edit text-xl"></i>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SuperAdminDashboardServicesLoading v-if="loading" />

                  <!-- Mobile Card View -->
                  <div v-else class="lg:hidden divide-y" :class="darkMode ? 'divide-gray-700' : 'divide-gray-200'">
                    <div v-for="j in paginatedInfo" :key="j.id" class="p-4 transition-colors cursor-pointer" :class="[
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
                      selectedItem?.id === j.id
                        ? 'bg-blue-50 border-l-4 border-blue-500'
                        : ''
                    ]" @click="
                      selectedItem = j;
                    openEditModal(j);
                    ">
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                          <h3 class="font-medium text-sm mb-1 line-clamp-2"
                            :class="darkMode ? 'text-gray-200' : 'text-gray-900'">
                            {{ j.title }}
                          </h3>
                          <!-- SDG Badges -->
                          <div v-if="getSdgBadges(j).length" class="mb-2">
                            <div class="flex flex-wrap gap-1">
                              <div v-for="badge in getSdgBadges(j)" :key="badge.number"
                                class="inline-flex items-center">
                                <span
                                  class="inline-flex items-center w-5 h-5 justify-center rounded text-xs font-bold text-white shadow-sm"
                                  :style="{ backgroundColor: badge.color }">
                                  {{ badge.number }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p class="text-xs mb-1" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">
                            ID: {{ j.content_id }}
                          </p>
                          <p class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">{{ j.authors }}</p>
                        </div>
                        <button @click.stop="openEditModal(j)"
                          class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs ml-2">
                          <i class="fa fa-edit"></i>
                        </button>
                      </div>
                      <div v-if="j.descriptions" class="text-xs whitespace-pre-wrap line-clamp-3"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                        {{ j.descriptions }}
                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="!loading && filteredInfo.length === 0" class="text-center py-12">
                    <i class="fa fa-search text-4xl mb-3" :class="darkMode ? 'text-gray-600' : 'text-gray-300'"></i>
                    <p :class="darkMode ? 'text-gray-400' : 'text-gray-500'">No contents found</p>
                    <p class="text-sm" :class="darkMode ? 'text-gray-500' : 'text-gray-400'">
                      Try adjusting your search or filter
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit Panel (Right Side / Mobile Overlay) -->
            <div v-if="showEditModal"
              class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:relative lg:bg-transparent lg:inset-auto lg:w-6/12 lg:border-l lg:shadow-lg flex flex-col"
              :class="darkMode ? 'lg:bg-gray-800 lg:border-gray-700' : 'lg:bg-white lg:border-gray-200'">
              <!-- Mobile Edit Panel -->
              <div class="h-full w-full lg:w-auto flex flex-col lg:relative overflow-y-auto"
                :class="darkMode ? 'bg-gray-800' : 'bg-white'">
                <!-- Edit Panel Header -->
                <div class="flex justify-between items-center p-4 border-b" :class="darkMode
                  ? 'border-gray-700 bg-gray-900/50'
                  : 'border-gray-200 bg-gray-50'">
                  <h2 class="text-lg font-bold" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">Edit Content</h2>
                  <button @click="closeEditModal" class="p-1" :class="darkMode
                    ? 'text-gray-400 hover:text-gray-200'
                    : 'text-gray-500 hover:text-gray-700'">
                    <i class="fa fa-times text-lg"></i>
                  </button>
                </div>

                <!-- Edit Form -->
                <div class="flex-1 p-4 space-y-4 overflow-y-auto">
                  <form @submit.prevent="submitEdit" class="space-y-4">
                    <!-- Content ID -->
                    <div>
                      <label class="block text-sm font-medium mb-1"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Content ID</label>
                      <input v-model="editContent.content_id" type="text"
                        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'" disabled />
                    </div>

                    <!-- Title -->
                    <div>
                      <label class="block text-sm font-medium mb-1"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Title</label>
                      <input v-model="editContent.title" type="text"
                        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'" required />
                    </div>

                    <!-- Authors -->
                    <div>
                      <label class="block text-sm font-medium mb-1"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Authors</label>
                      <input v-model="editContent.authors" type="text"
                        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'" required />
                    </div>

                    <!-- Default Authors (Authors Selection) -->
                    <div>
                      <label class="block text-xs font-semibold mb-3 uppercase"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-600'">Default Authors</label>
                      <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4"
                        :class="darkMode
                          ? 'bg-gray-900/50 border-gray-700'
                          : 'bg-gray-50 border-gray-200'">
                        <div v-for="author in authorsList" :key="author">
                          <label :for="author" class="cursor-pointer text-xs flex items-center"
                            :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                            <input :id="author" type="checkbox" :value="author" v-model="selectedAuthors"
                              @change="updateAuthors"
                              class="mr-2 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer" />
                            {{ author }}
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Date -->
                    <div>
                      <label class="block text-sm font-medium mb-1"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Date</label>
                      <input v-model="editContent.date" type="date"
                        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200'
                          : 'bg-white border-gray-300 text-gray-900'" required />
                    </div>

                    <!-- Filters -->
                    <div>
                      <label class="block text-sm font-medium mb-1"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Filters/SDGs</label>
                      <input v-model="editContent.filters" type="text"
                        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'"
                        placeholder="e.g., SDG1, SDG4, SDG17" />
                    </div>

                    <!-- SDGs Selection -->
                    <div>
                      <label class="block text-xs font-semibold mb-3 uppercase"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-600'">Sustainable Development Goals
                        (SDGs)</label>
                      <div
                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4"
                        :class="darkMode
                          ? 'bg-gray-900/50 border-gray-700'
                          : 'bg-gray-50 border-gray-200'">
                        <div v-for="sdg in sdgOptions" :key="sdg.value"
                          class="flex items-center px-2 rounded transition"
                          :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'">
                          <input type="checkbox" :id="sdg.value" :value="sdg.value" v-model="selectedSDGs"
                            @change="updateFilters"
                            class="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                            :style="{
                              accentColor: getSdgColor(
                                parseInt(sdg.value.replace('sdg', '')),
                              ),
                            }" />
                          <label :for="sdg.value" class="text-sm cursor-pointer text-gray-700 flex items-center flex-1">
                            <span class="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0" :style="{
                              backgroundColor: getSdgColor(
                                parseInt(sdg.value.replace('sdg', '')),
                              ),
                            }"></span>
                            <span class="text-xs" :class="darkMode ? 'text-gray-400' : 'text-gray-600'">{{ sdg.label
                            }}</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- Other Filters Group (By Page Filter) -->
                    <div>
                      <label class="block text-xs font-semibold mb-3 uppercase"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-600'">Other Filters Group</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 border rounded-lg p-4" :class="darkMode
                        ? 'bg-gray-900/50 border-gray-700'
                        : 'bg-gray-50 border-gray-200'">
                        <div v-for="pageFilter in pageFiltersList" :key="pageFilter"
                          class="flex items-center px-2 rounded transition"
                          :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'">
                          <input type="checkbox" :id="`page-${pageFilter}`" :value="pageFilter"
                            v-model="selectedPageFilters" @change="updatePageFilters"
                            class="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                          <label :for="`page-${pageFilter}`" class="text-sm cursor-pointer flex items-center flex-1"
                            :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                            <span class="text-xs">{{ pageFilter }}</span>
                          </label>
                        </div>
                      </div>
                    </div>


                    <div>
                      <label class="block text-xs font-semibold mb-3 uppercase"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-600'">News and Updates Content Type</label>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 border rounded-lg p-4" :class="darkMode
                        ? 'bg-gray-900/50 border-gray-700'
                        : 'bg-gray-50 border-gray-200'">
                        <div v-for="contentType in contentTypeList" :key="contentType"
                          class="flex items-center px-2 rounded transition"
                          :class="darkMode ? 'hover:bg-gray-800' : 'hover:bg-white'">
                          <input type="checkbox" :id="`content-${contentType}`" :value="contentType"
                            v-model="selectedContentTypes" @change="updateContentTypes"
                            class="mr-3 w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                          <label :for="`content-${contentType}`" class="text-sm cursor-pointer flex items-center flex-1"
                            :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                            <span class="text-xs">{{ contentType }}</span>
                          </label>
                        </div>
                      </div>
                    </div>


                    <!-- Approval Status -->
                    <div>
                      <label class="block text-xs font-semibold mb-3 uppercase tracking-wider"
                        :class="darkMode ? 'text-gray-400' : 'text-gray-600'">Approval Status</label>
                      <div class="flex p-1.5 rounded-xl border transition-all duration-300" 
                        :class="darkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'">
                        
                        <!-- Unpublished -->
                        <label class="flex-1 relative cursor-pointer group">
                          <input type="radio" value="Unpublished" v-model="localApprovalStatus" class="sr-only" />
                          <div class="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300"
                            :class="localApprovalStatus === 'Unpublished' 
                              ? (darkMode ? 'bg-gray-700 text-white shadow-lg' : 'bg-white text-gray-800 shadow-md border border-gray-100') 
                              : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')">
                            <i class="fa fa-eye-slash" :class="localApprovalStatus === 'Unpublished' ? 'text-orange-400' : ''"></i>
                            <span class="text-[10px] font-bold uppercase tracking-tight">Unpublished</span>
                          </div>
                        </label>

                        <!-- Published -->
                        <label class="flex-1 relative cursor-pointer group">
                          <input type="radio" value="Published" v-model="localApprovalStatus" class="sr-only" />
                          <div class="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-300"
                            :class="localApprovalStatus === 'Published' 
                              ? (darkMode ? 'bg-green-600 text-white shadow-lg' : 'bg-green-600 text-white shadow-md') 
                              : (darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600')">
                            <i class="fa fa-globe"></i>
                            <span class="text-[10px] font-bold uppercase tracking-tight">Published</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <!-- Description -->
                    <div>
                      <label class="block text-sm font-medium mb-1"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Description</label>
                      <textarea v-model="editContent.descriptions" rows="10"
                        @paste="handlePaste"
                        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        style="white-space: pre-wrap;"
                        :class="darkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'" required></textarea>
                    </div>

                    <!-- Links Section -->
                    <div>
                      <label class="block text-sm font-medium mb-2"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Links</label>
                      <div class="space-y-2">
                        <div v-for="(link, index) in editContent.links" :key="index" class="flex gap-1">
                          <input v-model="editContent.links[index]" type="url" placeholder="https://example.com"
                            class="flex-1 px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                            :class="darkMode
                              ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'" />
                          <button type="button" @click="removeLink(index)"
                            class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">
                            <i class="fa fa-trash"></i>
                          </button>
                        </div>
                        <button type="button" @click="addLink"
                          class="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                          <i class="fa fa-plus mr-1"></i>Add Link
                        </button>
                      </div>
                    </div>

                    <!-- Files Section -->
                    <div>
                      <label class="block text-sm font-medium mb-2"
                        :class="darkMode ? 'text-gray-300' : 'text-gray-700'">Files</label>

                      <!-- File Upload -->
                      <div class="mb-3">
                        <input ref="fileInput" type="file" multiple @change="handleFileSelect"
                          class="w-full px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          :class="darkMode
                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                            : 'bg-white border-gray-300 text-gray-900'" :disabled="uploadingFiles" />
                        <p class="text-xs mt-1" :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                          Select files to upload
                        </p>
                      </div>

                      <!-- Upload Progress -->
                      <div v-if="uploadingFiles" class="mb-3">
                        <div class="border rounded p-2" :class="darkMode
                          ? 'bg-blue-900/30 border-blue-700'
                          : 'bg-blue-50 border-blue-200'">
                          <div class="flex items-center">
                            <i class="fa fa-spinner fa-spin text-blue-500 mr-2 text-sm"></i>
                            <span class="text-xs"
                              :class="darkMode ? 'text-blue-300' : 'text-blue-700'">Uploading...</span>
                          </div>
                        </div>
                      </div>

                      <!-- Current Files with Preview -->
                      <div v-if="editContent.files && editContent.files.length > 0" class="space-y-2">
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-4">
                            <h4 class="text-xs font-medium" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                              Current Files ({{ editContent.files.length }})
                            </h4>
                            <button
                              type="button"
                              @click="sortFilesByName"
                              v-if="editContent.files.length > 1"
                              class="text-[10px] px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center gap-1 shadow-sm uppercase font-bold"
                            >
                              <i class="fa fa-sort-alpha-down"></i>
                              Sort by Name
                            </button>
                          </div>
                          <p class="text-xs flex items-center gap-1"
                            :class="darkMode ? 'text-gray-400' : 'text-gray-500'">
                            <i class="fa fa-arrows-alt text-green-600"></i>
                            Drag to reorder
                          </p>
                        </div>
                        <div class="grid grid-cols-3 gap-2">
                          <div v-for="(file, index) in editContent.files" :key="index" draggable="true"
                            @dragstart="handleDragStart(index)" @dragover="handleDragOver($event, index)"
                            @dragleave="handleDragLeave" @drop="handleDrop($event, index)" @dragend="handleDragEnd"
                            :class="[
                              'p-2 rounded-lg border-2 transition-all duration-300 cursor-grab active:cursor-grabbing relative group hover:shadow-xl',
                              darkMode ? 'bg-gray-800' : 'bg-white',
                              dragOverIndex === index && draggedIndex !== index
                                ? 'border-green-500 bg-green-50 scale-110 shadow-2xl ring-4 ring-green-300 animate-pulse'
                                : (darkMode ? 'border-gray-600 hover:border-blue-400' : 'border-gray-300 hover:border-blue-400'),
                              draggedIndex === index
                                ? 'opacity-40 scale-90 rotate-2 shadow-2xl ring-4 ring-blue-300'
                                : 'opacity-100',
                            ]">
                            <!-- Drag Handle Icon - Always Visible -->
                            <div
                              class="absolute top-2 left-2 z-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg w-8 h-8 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <i class="fa fa-grip-vertical text-white text-sm"></i>
                            </div>

                            <!-- Drag Instruction Overlay -->
                            <div
                              class="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 pointer-events-none z-10 flex items-center justify-center rounded-lg">
                              <div
                                class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                <i class="fa fa-arrows-alt mr-1"></i>Drag to
                                reorder
                              </div>
                            </div>

                            <!-- Order Badge -->
                            <div
                              class="absolute top-2 right-2 z-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg font-bold text-sm border-2 border-white group-hover:scale-125 transition-transform">
                              {{ index + 1 }}
                            </div>
                            <!-- Image Preview -->
                            <div v-if="isImageFile(file)" class="mb-2">
                              <img :src="getFileUrl(file)" :alt="file"
                                class="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                @click="openImagePreview(getFileUrl(file))" @error="handleImageError($event, file)" />
                            </div>

                            <!-- Video Preview -->
                            <div v-else-if="isVideoFile(file)" class="mb-2 relative">
                              <video :src="getFileUrl(file)" class="w-full h-24 object-cover rounded" muted
                                preload="metadata">
                                Your browser does not support the video tag.
                              </video>
                              <div
                                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
                                <i class="fa fa-play text-white text-lg"></i>
                              </div>
                            </div>

                            <!-- PDF Preview -->
                            <div v-else-if="isPdfFile(file)" class="mb-2">
                              <div class="w-full h-24 bg-red-100 rounded flex items-center justify-center">
                                <i class="fa fa-file-pdf text-red-600 text-2xl"></i>
                              </div>
                            </div>

                            <!-- Other Files -->
                            <div v-else class="mb-2">
                              <div class="w-full h-24 rounded flex items-center justify-center"
                                :class="darkMode ? 'bg-gray-700' : 'bg-gray-200'">
                                <i class="fa fa-file text-2xl"
                                  :class="darkMode ? 'text-gray-400' : 'text-gray-600'"></i>
                              </div>
                            </div>

                            <!-- File Info and Actions -->
                            <div class="flex items-center justify-between">
                              <div class="flex items-center flex-1 min-w-0">
                                <i :class="[
                                  getFileIcon(file),
                                  'mr-1 flex-shrink-0 text-xs',
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                ]"></i>
                                <span class="truncate text-xs" :class="darkMode ? 'text-gray-300' : 'text-gray-700'">{{
                                  file
                                }}</span>
                              </div>
                              <div class="flex gap-1 ml-2">
                                <!-- <a
                                  :href="getFileUrl(file)"
                                  target="_blank"
                                  class="px-1 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                  title="View file"
                                >
                                  <i class="fa fa-external-link-alt"></i>
                                </a> -->
                                <button type="button" @click="removeFile(index)"
                                  class="px-1 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                  title="Remove file">
                                  <i class="fa fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Update Button -->
                    <div class="flex justify-end pt-4 border-t border-gray-200">
                      <button type="submit" :disabled="editSubmitting"
                        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                        <i v-if="editSubmitting" class="fa fa-spinner fa-spin"></i>
                        <i v-else class="fa fa-save"></i>
                        {{ editSubmitting ? "Updating..." : "Update" }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

                <div v-if="addMoreToggle" class="relative">
          <!-- Close Button -->
          <div class="w-full p-2 flex justify-end absolute top-0 right-0">
            <button @click="addMoreToggle = !addMoreToggle"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2">
              <i class="fa fa-times"></i>
              Close Form
            </button>
          </div>

          <!-- Form -->
          <SuperAdminDashboardServicesCMSForm @content-submitted="handleFormSubmitted" />
        </div>

      </div>
    </div>
  </div>

  <!-- Image Preview Modal - Only render on client -->
  <ClientOnly>
    <div v-if="showImagePreview" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="closeImagePreview">
      <div class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg" @click.stop>
        <button @click="closeImagePreview"
          class="absolute top-2 right-2 text-gray-700 hover:text-red-500 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-10">
          <i class="fa fa-times"></i>
        </button>
        <img :src="previewImageUrl" class="max-w-full max-h-[85vh] object-contain" alt="Preview" />
      </div>
    </div>
  </ClientOnly>

  <!-- Toast Notification -->
  <div v-if="toast.show" :class="[
    'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-[9999]',
    toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
  ]">
    {{ toast.message }}
  </div>
</template>
<style scoped></style>
