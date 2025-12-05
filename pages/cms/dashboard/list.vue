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

const isImageFile = (fileName) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = "." + fileName.split(".").pop().toLowerCase();
  return imageExtensions.includes(ext);
};

const isPdfFile = (fileName) => {
  return fileName.toLowerCase().endsWith(".pdf");
};

const isVideoFile = (fileName) => {
  const videoExtensions = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"];
  const ext = "." + fileName.split(".").pop().toLowerCase();
  return videoExtensions.includes(ext);
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
    alert(`Invalid file type: ${file.name}`);
    return false;
  }

  if (file.size > maxSize) {
    alert(`File too large: ${file.name}`);
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
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      },
      // Add timeout and retry logic
      timeout: 60000, // 60 seconds
    });

    showToast(`✅ File uploaded: ${file.name}`, "success");
    return { finalName: res.filename || res.name || file.name };
  } catch (error) {
    console.error("Upload error:", error);

    if (error.status === 413) {
      showToast(`❌ File too large: ${file.name} (Max 50MB)`, "error");
    } else if (error.message?.includes("CORS")) {
      showToast(`❌ CORS error: ${file.name}`, "error");
    } else {
      showToast(`❌ Upload failed: ${file.name}`, "error");
    }
    return null;
  }
};

const removeFile = (index) => {
  editContent.value.files.splice(index, 1);
};

// Add this helper function to get clean filename
const getCleanFilename = (fileName) => {
  if (!fileName) return "";
  // Extract just the filename with extension, removing any extra parameters
  const match = fileName.match(
    /([^\/\\]+\.(jpg|jpeg|png|gif|webp|pdf|mp4|avi|mov|wmv|flv|webm|mp3))$/i
  );
  return match ? match[1] : fileName;
};

// Update the image URL helper to handle spaces and special characters
const getImageUrl = (fileName) => {
  const cleanName = getCleanFilename(fileName);
  // URL encode the filename to handle spaces and special characters
  const encodedName = encodeURIComponent(cleanName);
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${encodedName}`;
};

// Add debugging functions
const handleImageError = (event, fileName) => {
  console.error("Image failed to load:", fileName);
  console.error("URL:", getImageUrl(fileName));
  console.error("Clean filename:", getCleanFilename(fileName));

  // Hide the broken image and show fallback
  event.target.style.display = "none";
  const fallback = document.getElementById(
    "fallback-" + editContent.value.files.indexOf(fileName)
  );
  if (fallback) {
    fallback.style.display = "flex";
  }
};

const handleImageLoad = (fileName) => {
  console.log("Image loaded successfully:", fileName);
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
                  <div class="w-full grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-4">
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
                  <div class="lg:flex items-center gap-3 w-full h-fit">
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
              class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:relative lg:bg-transparent lg:inset-auto lg:w-96 lg:bg-white lg:border-l lg:border-gray-200 lg:shadow-lg flex flex-col"
            >
              <!-- Mobile Edit Panel -->
              <div class="bg-white h-full w-full lg:w-auto flex flex-col lg:relative">
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

                <!-- Edit Panel Content -->
                <div class="flex-1 overflow-y-auto p-4">
                  <div v-if="editLoading" class="text-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mx-auto"></div>
                    <p class="mt-2 text-sm text-gray-600">Loading content...</p>
                  </div>

                  <form v-else @submit.prevent="submitEdit" class="space-y-4">
                    <!-- Form fields remain the same but with responsive adjustments -->
                    <div>
                      <label class="block text-sm font-medium mb-1">Content ID</label>
                      <input
                        v-model="editContent.content_id"
                        type="text"
                        disabled
                        class="w-full border rounded px-3 py-2 bg-gray-50 text-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-1">Title</label>
                      <input
                        v-model="editContent.title"
                        type="text"
                        class="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Title"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-1">Author/Authors</label>
                      <input
                        v-model="editContent.authors"
                        placeholder="e.g. John Doe, Jane Doe"
                        type="text"
                        class="w-full border rounded px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        v-model="editContent.descriptions"
                        class="w-full border rounded px-3 py-2 text-sm h-20 resize-y"
                        placeholder="Description"
                      ></textarea>
                    </div>

                    <div>
                      <label class="block text-sm font-medium mb-1">Filters</label>
                      <input
                        v-model="editContent.filters"
                        type="text"
                        class="w-full border rounded px-3 py-2 text-sm"
                        placeholder="Enter filters manually or use checkboxes below"
                      />
                      
                      <div class="mt-2">
                        <label class="block text-xs font-medium mb-1">SDGs:</label>
                        <div class="grid grid-cols-1 lg:grid-cols-1 gap-1 max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                          <div v-for="sdg in sdgOptions" :key="sdg.value" class="flex items-center">
                            <input 
                              type="checkbox"
                              :id="`edit-${sdg.value}`"
                              :value="sdg.value"
                              v-model="selectedSDGs"
                              @change="updateEditFilters"
                              class="mr-2 w-3 h-3"
                              :style="{ accentColor: getSdgColor(parseInt(sdg.value.replace('sdg', ''))) }"
                            />
                            <label :for="`edit-${sdg.value}`" class="text-xs cursor-pointer text-gray-700 flex items-center">
                              <span 
                                class="inline-block w-2 h-2 rounded-full mr-1"
                                :style="{ backgroundColor: getSdgColor(parseInt(sdg.value.replace('sdg', ''))) }"
                              ></span>
                              {{ sdg.label.replace('SDG ', '') }}
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Additional form fields... -->
                    
                    <button
                      type="submit"
                      :disabled="editSubmitting"
                      class="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-400 text-white py-3 lg:py-2 rounded text-sm font-medium"
                    >
                      {{ editSubmitting ? "Updating..." : "Update Content" }}
                    </button>
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
