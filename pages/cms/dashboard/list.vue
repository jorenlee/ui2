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

const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");
const isLoading = ref(false);
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
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a"
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
});
const editLoading = ref(false);
const editSubmitting = ref(false);

// Add these variables to your script setup
const selectedFiles = ref([]);
const uploadingFiles = ref(false);
const selectedSDGs = ref([]);

// Image preview functionality
const showImagePreview = ref(false);
const previewImageUrl = ref('');

// File type checking functions
const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const ext = filename.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(ext);
};

const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const ext = filename.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(ext);
};

const isPdfFile = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext === 'pdf';
};

const getFileIcon = (filename) => {
  if (isImageFile(filename)) return 'fa fa-image';
  if (isVideoFile(filename)) return 'fa fa-video';
  if (isPdfFile(filename)) return 'fa fa-file-pdf';
  return 'fa fa-file';
};

const getFileUrl = (filename) => {
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${filename}`;
};

const openImagePreview = (imageUrl) => {
  previewImageUrl.value = imageUrl;
  showImagePreview.value = true;
  document.body.style.overflow = 'hidden';
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = '';
  document.body.style.overflow = 'auto';
};

const handleImageError = (event, filename) => {
  console.error('Image failed to load:', filename);
  event.target.style.display = 'none';
  // Show fallback icon
  const fallback = event.target.parentElement;
  if (fallback) {
    fallback.innerHTML = '<div class="w-full h-24 bg-gray-200 rounded flex items-center justify-center"><i class="fa fa-image text-gray-400 text-2xl"></i></div>';
  }
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

onMounted(async () => {
  loading.value = true;
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    info.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching list:", error);
    errorMsg.value = "Failed to load news & updates.";
  } finally {
    loading.value = false;
  }
});

onMounted(() => {
  // setTimeout(() => {
  const allowedEmails = [
    "jorenleeluna24@gmail.com",
    "jason.yap@lsu.edu.ph",
    "npc@lsu.edu.ph",
    "wenny.caseros@lsu.edu.ph",
    "mariaalexandra.benitez@lsu.edu.ph",
    "alexander.diaz@lsu.edu.ph",
    "carmelona.jumalon@lsu.edu.ph",
    "carmelona2.jumalon@lsu.edu.ph",
    "carousel.tagaylo@lsu.edu.ph",
    "carlvincent.codera@lsu.edu.ph",
    "cherrylyn.sanipa@lsu.edu.ph",
    "dean.lopez@lsu.edu.ph",
    "esmael.larubis@lsu.edu.ph",
    "israelgallogo@lsu.edu.ph",
    "jeanelyn.potestas@lsu.edu.ph",
    "jenel.cruz@lsu.edu.ph",
    "jerusalem.andrada@lsu.edu.ph",
    "jorenlee.luna@lsu.edu.ph",
    "joed.layna@lsu.edu.ph",
    "jumelah.padilla@lsu.edu.ph",
    "carmela.buenbrazo2@lsu.edu.ph",
    "macristina.llauder@lsu.edu.ph",
    "markjohn.dalagan@lsu.edu.ph",
    "menchie.grana@lsu.edu.ph",
    "meredith.embuscado@lsu.edu.ph",
    "michaeljohn.puertogalera@lsu.edu.ph",
    "naiza.amba@lsu.edu.ph",
    "roselyn.tuastomban@lsu.edu.ph",
    "tednudgent.tacan@lsu.edu.ph",
    "xie.medrano@lsu.edu.ph",
    "jenny.licanda@lsu.edu.ph",
  ];

  //   if (!userStore.user.isAuthenticated || !allowedEmails.includes(userStore.user.email)) {
  //     router.push("/unauthorized");
  //   }
  // }, 5000);
});

const openEditModal = async (item) => {
  editLoading.value = true;
  showEditModal.value = true;

  try {
    const response = await $fetch(
      `${endpoint.value}/api/cms/content/${item.id}/`
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
    };

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
    } else {
      selectedSDGs.value = [];
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
  };
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
  } catch (error) {
    console.error("Error updating content:", error);
    showToast("❌ Failed to update content", "error");
  } finally {
    editSubmitting.value = false;
  }
};

const logOut = () => {
  userStore.removeToken();
  router.push("/cms/login");
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

const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await $fetch(`${endpoint.value}/api/cms/content/file/upload/`, {
      method: "POST",
      body: formData,
      timeout: 60000, // 60 seconds
    });

    showToast(`✅ File uploaded: ${file.name}`, "success");
    return { finalName: res.filename || res.name || file.name };
  } catch (error) {
    console.error("Upload error:", error);

    if (error.status === 413) {
      showToast(`❌ File too large: ${file.name} (Max 50MB)`, "error");
    } else {
      showToast(`❌ Upload failed: ${file.name}`, "error");
    }
    return null;
  }
};

const removeFile = (index) => {
  editContent.value.files.splice(index, 1);
};

// Pagination and filtering
const currentPage = ref(1);
const itemsPerPage = 10;
const maxVisiblePages = 4;
const searchQuery = ref("");
const selectedFilter = ref("");

// Filter options
const filterOptions = [
  { value: "", label: "All Contents" },
  { value: "highlight", label: "Highlighted" },
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
        item.filters?.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (selectedFilter.value) {
    filtered = filtered.filter((item) =>
      item.filters?.toLowerCase().includes(selectedFilter.value.toLowerCase())
    );
  }

  return filtered;
});

const totalPages = computed(() =>
  Math.ceil(filteredInfo.value.length / itemsPerPage)
);

const paginatedInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredInfo.value.slice(start, start + itemsPerPage);
});

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(
    1,
    currentPage.value - Math.floor(maxVisiblePages / 2)
  );
  const end = Math.min(totalPages.value, start + maxVisiblePages - 1);

  for (let i = Math.max(1, end - maxVisiblePages + 1); i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Reset page when search/filter changes
watch([searchQuery, selectedFilter], () => {
  currentPage.value = 1;
});
</script>
<template>
  <div class="w-full min-h-screen flex flex-col">
    <div class="flex flex-1 w-full">
      <!-- Sidebar -->
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 w-full flex overflow-hidden z-40 lg:block lg:static absolute"
        v-show="toggleSideBarMenu"
      >
        <div class="w-full">
          <div
            class="flex items-center text-white bg-green-900 lg:py-[16px] py-[8px]"
          >
            <div class="flex items-center w-full px-2">
              <i class="fa fa-user mx-2" aria-hidden="true"></i>
              <h1 class="text-sm">{{ userStore.user.email }}</h1>
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
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
                class="lg:w-28 w-24 mx-auto rounded-full"
              />
            </div>
            <div class="text-center">
              <h1 class="font-bold text-green-800 text-3xl">Dashboard</h1>
            </div>
            <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
              <a
                href="/cms/dashboard"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
              >
                <i class="fa fa-list mr-3" aria-hidden="true"></i>
                Content Form
              </a>
              <a
                href="/cms/dashboard/list"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
              >
                <i class="fa fa-list-alt mr-3" aria-hidden="true"></i>
                All Contents Lists
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
        <div class="bg-green-800 w-full z-50">
          <div class="flex mx-auto justify-between items-center py-2 px-3.5">
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
                LSU Content Management System
              </p>
            </div>
            <button @click="logOut" class="flex items-center hover:font-bold">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white ml-2 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <!-- Main Content with Footer -->
        <div class="w-full min-h-screen flex flex-col">
          <div class="flex-1 flex flex-col lg:flex-row">
            <!-- Content List Section -->
            <div class="flex-1 p-3 lg:p-5" :class="showEditModal ? 'lg:pr-2' : ''">
              <div v-show="tableDisplay">
                <!-- Search and Filter Bar -->
                <div class="bg-white rounded-lg shadow-sm border p-3 lg:p-4 mb-4 lg:flex w-full gap-x-2">
                  <!-- Stats Cards -->
                  <div class="w-full grid grid-cols-2 gap-2 lg:gap-4 mb-4" :class="showEditModal ? 'lg:grid-cols-2':'lg:grid-cols-4'">
                    <div class="bg-blue-50 p-2 lg:p-x3  lg:py-1rounded-lg border-l-4 border-blue-500">
                      <div class="flex items-center">
                        <i class="fa fa-file-text text-blue-500 text-sm lg:text-lg mr-2 lg:mr-3"></i>
                        <div class="flex items-center">
                          <p class="text-xs text-gray-600 font-medium pr-5">Total</p>
                          <p class="text-lg lg:text-xl font-bold text-blue-600">{{ info.length }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="bg-green-50 p-2 lg:px-3 lg:py-1 rounded-lg border-l-4 border-green-500">
                      <div class="flex items-center">
                        <i class="fa fa-filter text-green-500 text-sm lg:text-lg mr-2 lg:mr-3"></i>
                        <div class="flex items-center">
                          <p class="text-xs text-gray-600 font-medium pr-5">Filtered</p>
                          <p class="text-lg lg:text-xl font-bold text-green-600">{{ filteredInfo.length }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="bg-purple-50 p-2 lg:xp- lg:py-13 rounded-lg border-l-4 border-purple-500">
                      <div class="flex items-center">
                        <i class="fa fa-eye text-purple-500 text-sm lg:text-lg mr-2 lg:mr-3"></i>
                        <div class="flex items-center">
                          <p class="text-xs text-gray-600 font-medium pr-5">Page</p>
                          <p class="text-lg lg:text-xl font-bold text-purple-600">{{ currentPage }}</p>
                        </div>
                      </div>
                    </div>
                    <div class="bg-orange-50 p-2 lg:xp- lg:py-13 rounded-lg border-l-4 border-orange-500">
                      <div class="flex items-center">
                        <i class="fa fa-pages text-orange-500 text-sm lg:text-lg mr-2 lg:mr-3"></i>
                        <div class="flex items-center">
                          <p class="text-xs text-gray-600 font-medium pr-5">Pages</p>
                          <p class="text-lg lg:text-xl font-bold text-orange-600">{{ totalPages }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Search and Filter Controls -->
                  <div class=" items-center gap-3 w-full h-fit" :class="showEditModal ? 'lg:flex-col':'lg:flex'">
                    <div class="relative w-full lg:mb-0 mb-2">
                      <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search..."
                        class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div class="flex gap-2 w-full">
                      <select
                        v-model="selectedFilter"
                        class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        :class="showEditModal ? 'my-2':''"
                      >
                        <option v-for="option in filterOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      
                      <!-- Mobile Edit Button -->
                      <button
                        v-if="selectedItem && display === 'mobile'"
                        @click="showEditModal = !showEditModal"
                        class="lg:hidden bg-green-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                      >
                        {{ showEditModal ? 'Close' : 'Edit' }}
                      </button>
                    </div>

                    <!-- Pagination Controls -->
                    <div v-if="totalPages > 1" class="flex justify-center lg:mt-0 mt-3">
                      <div class="flex items-center space-x-1">
                        <button
                          :disabled="currentPage === 1"
                          @click="currentPage--"
                          class="px-2 lg:px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          <i class="fa fa-chevron-left text-gray-600"></i>
                        </button>
                        <button
                          v-for="page in visiblePages"
                          :key="page"
                          @click="currentPage = page"
                          class="px-2 lg:px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          :class="currentPage === page 
                            ? 'bg-green-800 text-white' 
                            : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'"
                        >
                          {{ page }}
                        </button>
                        <button
                          :disabled="currentPage === totalPages"
                          @click="currentPage++"
                          class="px-2 lg:px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                        >
                          <i class="fa fa-chevron-right text-gray-600"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Content Table/Cards -->
                <div class="bg-white shadow-lg rounded-lg">
                  <!-- Desktop Table View -->
                  <div class="hidden lg:block">
                    <!-- Table Header -->
                    <div class="grid grid-cols-4 gap-4 bg-gray-50 p-3 font-semibold text-gray-700 border-b text-sm">
                      <span class="flex items-center">
                        <i class="fa fa-hashtag mr-2 text-gray-500"></i>ID
                      </span>
                      <span class="flex items-center">
                        <i class="fa fa-user mr-2 text-gray-500"></i>Authors
                      </span>
                      <span class="flex items-center">
                        <i class="fa fa-file-text mr-2 text-gray-500"></i>Title
                      </span>
                      <span class="flex items-center justify-center">
                        <i class="fa fa-cogs mr-2 text-gray-500"></i>Actions
                      </span>
                    </div>

                    <!-- Table Body -->
                    <div class="divide-y divide-gray-200">
                      <div
                        v-for="j in paginatedInfo"
                        :key="j.id"
                        class="grid grid-cols-4 gap-4 p-3 hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                        @click="selectedItem = j"
                        :class="selectedItem?.id === j.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''"
                      >
                        <span class="flex items-center text-gray-800 font-medium truncate">{{ j.content_id }}</span>
                        <span class="flex items-center text-gray-600 truncate">{{ j.authors }}</span>
                        <span class="flex items-center text-gray-800 truncate">{{ j.title }}</span>
                        <span class="flex justify-center">
                          <button
                            @click.stop="openEditModal(j)"
                            class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                          >
                            <i class="fa fa-edit text-xs"></i>
                            <span class="hidden sm:inline text-xs">Edit</span>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Mobile Card View -->
                  <div class="lg:hidden divide-y divide-gray-200">
                    <div
                      v-for="j in paginatedInfo"
                      :key="j.id"
                      class="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      @click="selectedItem = j; openEditModal(j)"
                      :class="selectedItem?.id === j.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''"
                    >
                      <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                          <h3 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{{ j.title }}</h3>
                          <p class="text-xs text-gray-600 mb-1">ID: {{ j.content_id }}</p>
                          <p class="text-xs text-gray-600">{{ j.authors }}</p>
                        </div>
                        <button
                          @click.stop="openEditModal(j)"
                          class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs ml-2"
                        >
                          <i class="fa fa-edit"></i>
                        </button>
                      </div>
                      <div v-if="j.descriptions" class="text-xs text-gray-500 line-clamp-2">
                        {{ j.descriptions }}
                      </div>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-if="!loading && filteredInfo.length === 0" class="text-center py-12">
                    <i class="fa fa-search text-gray-300 text-4xl mb-3"></i>
                    <p class="text-gray-500">No contents found</p>
                    <p class="text-gray-400 text-sm">Try adjusting your search or filter</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit Panel (Right Side / Mobile Overlay) -->
            <div 
              v-if="showEditModal" 
              class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:relative lg:bg-transparent lg:inset-auto lg:w-6/12 lg:bg-white lg:border-l lg:border-gray-200 lg:shadow-lg flex flex-col"
            >
              <!-- Mobile Edit Panel -->
              <div class="bg-white h-full w-full lg:w-auto flex flex-col lg:relative overflow-y-auto">
                <!-- Edit Panel Header -->
                <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                  <h2 class="text-lg font-bold text-gray-800">Edit Content</h2>
                  <button
                    @click="closeEditModal"
                    class="text-gray-500 hover:text-gray-700 p-1"
                  >
                    <i class="fa fa-times text-lg"></i>
                  </button>
                </div>

                <!-- Edit Form -->
                <div class="flex-1 p-4 space-y-4 overflow-y-auto">
                  <form @submit.prevent="updateContent" class="space-y-4">
                    <!-- Content ID -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Content ID</label>
                      <input
                        v-model="editContent.content_id"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        disabled
                      />
                    </div>

                    <!-- Title -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        v-model="editContent.title"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        required
                      />
                    </div>

                    <!-- Authors -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                      <input
                        v-model="editContent.authors"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        required
                      />
                    </div>

                    <!-- Date -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        v-model="editContent.date"
                        type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        required
                      />
                    </div>

                    <!-- Filters -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Filters/SDGs</label>
                      <input
                        v-model="editContent.filters"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="e.g., SDG1, SDG4, SDG17"
                      />
                    </div>

                    <!-- Description -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        v-model="editContent.descriptions"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        required
                      ></textarea>
                    </div>

                    <!-- Links Section -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Links</label>
                      <div class="space-y-2">
                        <div
                          v-for="(link, index) in editContent.links"
                          :key="index"
                          class="flex gap-1"
                        >
                          <input
                            v-model="editContent.links[index]"
                            type="url"
                            placeholder="https://example.com"
                            class="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                          <button
                            type="button"
                            @click="removeLink(index)"
                            class="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            <i class="fa fa-trash"></i>
                          </button>
                        </div>
                        <button
                          type="button"
                          @click="addLink"
                          class="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          <i class="fa fa-plus mr-1"></i>Add Link
                        </button>
                      </div>
                    </div>

                    <!-- Files Section -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Files</label>
                      
                      <!-- File Upload -->
                      <div class="mb-3">
                        <input
                          ref="fileInput"
                          type="file"
                          multiple
                          @change="handleFileSelect"
                          class="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                          :disabled="uploadingFiles"
                        />
                        <p class="text-xs text-gray-500 mt-1">Select files to upload</p>
                      </div>

                      <!-- Upload Progress -->
                      <div v-if="uploadingFiles" class="mb-3">
                        <div class="bg-blue-50 border border-blue-200 rounded p-2">
                          <div class="flex items-center">
                            <i class="fa fa-spinner fa-spin text-blue-500 mr-2 text-sm"></i>
                            <span class="text-blue-700 text-xs">Uploading...</span>
                          </div>
                        </div>
                      </div>

                      <!-- Current Files with Preview -->
                      <div v-if="editContent.files && editContent.files.length > 0" class="space-y-2">
                        <h4 class="text-xs font-medium text-gray-700">Current Files:</h4>
                        <div class="grid grid-cols-3 gap-2">
                          <div
                            v-for="(file, index) in editContent.files"
                            :key="index"
                            class="bg-gray-50 p-2 rounded border"
                          >
                            <!-- Image Preview -->
                            <div v-if="isImageFile(file)" class="mb-2">
                              <img
                                :src="getFileUrl(file)"
                                :alt="file"
                                class="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                                @click="openImagePreview(getFileUrl(file))"
                                @error="handleImageError($event, file)"
                              />
                            </div>
                            
                            <!-- Video Preview -->
                            <div v-else-if="isVideoFile(file)" class="mb-2 relative">
                              <video
                                :src="getFileUrl(file)"
                                class="w-full h-24 object-cover rounded"
                                muted
                                preload="metadata"
                              >
                                Your browser does not support the video tag.
                              </video>
                              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded">
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
                              <div class="w-full h-24 bg-gray-200 rounded flex items-center justify-center">
                                <i class="fa fa-file text-gray-600 text-2xl"></i>
                              </div>
                            </div>

                            <!-- File Info and Actions -->
                            <div class="flex items-center justify-between">
                              <div class="flex items-center flex-1 min-w-0">
                                <i :class="getFileIcon(file)" class="mr-1 text-gray-500 flex-shrink-0 text-xs"></i>
                                <span class="text-gray-700 truncate text-xs">{{ file }}</span>
                              </div>
                              <div class="flex gap-1 ml-2">
                                <a
                                  :href="getFileUrl(file)"
                                  target="_blank"
                                  class="px-1 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                                  title="View file"
                                >
                                  <i class="fa fa-external-link-alt"></i>
                                </a>
                                <button
                                  type="button"
                                  @click="removeFile(index)"
                                  class="px-1 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                  title="Remove file"
                                >
                                  <i class="fa fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Submit Buttons -->
                    <div class="flex gap-2 pt-4 border-t">
                      <button
                        type="button"
                        @click="closeEditModal"
                        class="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        :disabled="editSubmitting"
                        class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        <i v-if="editSubmitting" class="fa fa-spinner fa-spin mr-1"></i>
                        {{ editSubmitting ? 'Updating...' : 'Update' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <!-- Footer at bottom -->
          <DashboardFooter />
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div
    v-if="toast.show"
    :class="[
      'fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-[9999]',
      toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
    ]"
  >
    {{ toast.message }}
  </div>
</template>
<style scoped></style>
