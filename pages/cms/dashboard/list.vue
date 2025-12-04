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

const info = ref([])
const loading = ref(true)
const errorMsg = ref("")
const isLoading = ref(false)
const display = ref("desktop")


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
  { value: "sdg17", label: "SDG 17 - Partnerships" }
]);

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
  files: []
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
  let existingFilters = editContent.value.filters || '';
  
  // Remove existing SDG entries from filters
  const sdgValues = sdgOptions.value.map(sdg => sdg.value);
  let cleanedFilters = existingFilters
    .split(',')
    .map(filter => filter.trim())
    .filter(filter => !sdgValues.includes(filter))
    .filter(filter => filter !== '');
  
  // Add selected SDGs
  const allFilters = [...cleanedFilters, ...selectedSDGs.value];
  
  // Update the filters field
  editContent.value.filters = allFilters.length > 0 ? allFilters.join(', ') : '';
};

onMounted(async () => {
  loading.value = true
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
    const response = await $fetch(`${endpoint.value}/api/cms/content/${item.id}/`);
    editContent.value = {
      id: response.id,
      content_id: response.content_id || "",
      title: response.title || "",
      authors: response.authors || "",
      filters: response.filters || "",
      descriptions: response.descriptions || "",
      date: response.date || "",
      links: response.links || [],
      files: response.files || []
    };
    
    // Populate selectedSDGs based on existing filters using exact matching
    if (response.filters) {
      const filters = response.filters.toLowerCase();
      selectedSDGs.value = sdgOptions.value
        .filter(sdg => {
          // Extract SDG number from value (e.g., "sdg1" -> "1")
          const sdgNum = sdg.value.replace('sdg', '');
          
          // Check for exact SDG matches using word boundaries
          const patterns = [
            `\\bsdg${sdgNum}\\b`,
            `\\bsdg ${sdgNum}\\b`,
            `\\bsdg-${sdgNum}\\b`,
            `\\bsdg_${sdgNum}\\b`,
            `\\bgoal ${sdgNum}\\b`,
            `\\bgoal${sdgNum}\\b`,
            `\\bsdg${sdgNum.toString().padStart(2, '0')}\\b`
          ];
          
          return patterns.some(pattern => {
            const regex = new RegExp(pattern, 'i');
            return regex.test(filters);
          });
        })
        .map(sdg => sdg.value);
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
    files: []
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
      body: editContent.value
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
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = '.' + fileName.split('.').pop().toLowerCase();
  return imageExtensions.includes(ext);
};

const isPdfFile = (fileName) => {
  return fileName.toLowerCase().endsWith('.pdf');
};

const isVideoFile = (fileName) => {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  const ext = '.' + fileName.split('.').pop().toLowerCase();
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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'video/mp4'];
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
  formData.append('file', file);
  
  try {
    const res = await $fetch(`${endpoint.value}/api/cms/content/file/upload/`, {
      method: 'POST',
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
    console.error('Upload error:', error);
    
    if (error.status === 413) {
      showToast(`❌ File too large: ${file.name} (Max 50MB)`, "error");
    } else if (error.message?.includes('CORS')) {
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
  const match = fileName.match(/([^\/\\]+\.(jpg|jpeg|png|gif|webp|pdf|mp4|avi|mov|wmv|flv|webm|mp3))$/i);
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
  console.error('Image failed to load:', fileName);
  console.error('URL:', getImageUrl(fileName));
  console.error('Clean filename:', getCleanFilename(fileName));
  
  // Hide the broken image and show fallback
  event.target.style.display = 'none';
  const fallback = document.getElementById('fallback-' + editContent.value.files.indexOf(fileName));
  if (fallback) {
    fallback.style.display = 'flex';
  }
};

const handleImageLoad = (fileName) => {
  console.log('Image loaded successfully:', fileName);
};
</script>
<template>
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
                href="/cms/dashboard"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-black hover:bg-black hover:text-white"
              >
                <i class="fa fa-list mr-3" aria-hidden="true"></i>
                 Content Form
              </a>

              <a
                href="/cms/dashboard/list"
                class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-black hover:bg-black hover:text-white"
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

      <div class="w-full overflow-y-scroll">
        <div class="bg-green-800 fixed w-full">
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
                LSU Content Management System
              </p>
            </div>

            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5 lg:flex hidden">Log Out</h1>
            </button>
          </div>
        </div>

        <div
          class="bg-white border rounded-md p-2 text-xs flex items-end gap-2 mt-20 mx-5"
        >
          <!-- filters -->
        </div>

        <div class="">
          <div class="w-full lg:p-5 px-2 py-2">
            <div v-show="tableDisplay">
              <div
                class="w-full shadow bg-gray-100 text-green-900 font-bold px-2 text-center mb-3 py-2 text-xs uppercase"
              >
                All Contents Lists
              </div>
              <div class="">
                <div
                  class="appointment-lists mx-auto text-xs"
                  :class="toggleListsName ? 'hidden' : ''"
                >
                  <div v-if="loading" class="text-center">
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
                    <div class="gap-4" v-if="info.length > 0">
                      <ul>
                        <li v-for="(j,i) in info" :key="j.id" class="flex w-full border-b py-2">
                          <span class="w-full"> {{ j.content_id }}</span>
                          <span class="w-full"> {{ j.title }}</span>
                          <span class="w-fit">
                            <button 
                              @click="openEditModal(j)" 
                              class="text-blue-600 hover:underline px-2 py-1"
                            >
                              <i class="fa fa-edit"></i> edit
                            </button>
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEditModal">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Edit Content</h2>
          <button @click="closeEditModal" class="text-gray-500 hover:text-gray-700">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>

        <div v-if="editLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto"></div>
          <p class="mt-2">Loading content...</p>
        </div>

        <form v-else @submit.prevent="submitEdit" class="space-y-4" @click.stop>
          <div>
            <label class="block text-sm font-medium mb-1">Content ID</label>
            <input 
              v-model="editContent.content_id" 
              type="text" 
              disabled
              class="w-full border rounded px-3 py-2"
              
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Title</label>
            <input 
              v-model="editContent.title" 
              type="text" 
              class="w-full border rounded px-3 py-2"
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
              class="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <div>
              <label class="block text-sm font-medium mb-1">Filters</label>
              <input 
                v-model="editContent.filters" 
                type="text" 
                class="w-full border rounded px-3 py-2"
                placeholder="Enter filters manually or use checkboxes below"
              />
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium mb-2">SDGs:</label>
              <div class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded p-3">
                <div v-for="sdg in sdgOptions" :key="sdg.value" class="flex items-center">
                  <input 
                    type="checkbox"
                    :id="sdg.value"
                    :value="sdg.value"
                    v-model="selectedSDGs"
                    @change="updateFilters"
                    class="mr-2"
                  />
                  <label :for="sdg.value" class="text-xs cursor-pointer">
                    {{ sdg.label }}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Date</label>
            <input 
              v-model="editContent.date" 
              type="date" 
              class="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Description</label>
            <textarea 
              v-model="editContent.descriptions" 
              rows="4" 
              class="w-full border rounded px-3 py-2"
            ></textarea>
          </div>

          <!-- Files Section - Always Show -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium">Files & Images</label>
              <button 
                type="button" 
                @click.prevent.stop="$refs.fileInput.click()"
                class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                <i class="fa fa-plus mr-1"></i> Add Files
              </button>
            </div>

            <!-- Hidden file input -->
            <input 
              ref="fileInput"
              type="file" 
              multiple 
              @change="handleFileSelect"
              accept="image/*,application/pdf,video/mp4"
              class="hidden"
              :disabled="uploadingFiles"
            />

            <!-- Existing Files Preview -->
            <div v-if="editContent.files && editContent.files.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div
                v-for="(fileName, i) in editContent.files"
                :key="i"
                class="border p-3 rounded bg-gray-50 relative"
              >
                <p class="text-xs font-semibold mb-2 truncate">{{ fileName }}</p>
                
                <!-- Image preview for jpg, png files -->
                <img
                  v-if="isImageFile(fileName)"
                  :src="getImageUrl(fileName)"
                  class="w-full h-40 object-contain rounded border bg-white"
                  :alt="getCleanFilename(fileName)"
                  @error="handleImageError($event, fileName)"
                  @load="handleImageLoad(fileName)"
                />
                
                <!-- Show fallback if image fails to load -->
                <div 
                  v-if="isImageFile(fileName)" 
                  class="w-full h-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500"
                  style="display: none;"
                  :id="'fallback-' + i"
                >
                  <div class="text-center">
                    <i class="fa fa-image text-gray-400 text-2xl mb-1"></i>
                    <p>Image not found</p>
                    <p class="text-xs">{{ getCleanFilename(fileName) }}</p>
                    <p class="text-xs text-blue-500">{{ getImageUrl(fileName) }}</p>
                  </div>
                </div>
                
                <!-- PDF preview -->
                <div v-else-if="isPdfFile(fileName)" class="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                  <div class="text-center">
                    <i class="fa fa-file-pdf-o text-red-500 text-2xl mb-1"></i>
                    <p class="text-xs">PDF File</p>
                    <a :href="getImageUrl(fileName)" target="_blank" class="text-blue-500 text-xs underline">View PDF</a>
                  </div>
                </div>
                
                <!-- Video preview -->
                <div v-else-if="isVideoFile(fileName)" class="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                  <div class="text-center">
                    <i class="fa fa-file-video-o text-blue-500 text-2xl mb-1"></i>
                    <p class="text-xs">Video File</p>
                    <a :href="getImageUrl(fileName)" target="_blank" class="text-blue-500 text-xs underline">View Video</a>
                  </div>
                </div>
                
                <!-- Audio preview -->
                <div v-else-if="fileName.toLowerCase().includes('.mp3')" class="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                  <div class="text-center">
                    <i class="fa fa-file-audio-o text-green-500 text-2xl mb-1"></i>
                    <p class="text-xs">Audio File</p>
                    <a :href="getImageUrl(fileName)" target="_blank" class="text-blue-500 text-xs underline">Play Audio</a>
                  </div>
                </div>
                
                <!-- Generic file icon for other files -->
                <div v-else class="flex items-center justify-center h-20 bg-gray-200 rounded">
                  <div class="text-center">
                    <i class="fa fa-file text-gray-500 text-xl mb-1"></i>
                    <p class="text-xs">{{ fileName.split('.').pop().toUpperCase() }} File</p>
                  </div>
                </div>

                <!-- Remove file button -->
                <button
                  type="button"
                  @click.prevent.stop="removeFile(i)"
                  class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- No files message -->
            <div v-else class="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <i class="fa fa-image text-gray-400 text-3xl mb-2"></i>
              <p class="text-gray-500 text-sm">No files uploaded yet</p>
              <p class="text-gray-400 text-xs">Click "Add Files" to upload images, PDFs, or videos</p>
            </div>

            <!-- Upload status -->
            <div v-if="uploadingFiles" class="text-center mt-2">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-green-800 mx-auto"></div>
              <p class="text-xs mt-1">Uploading files...</p>
            </div>

            <!-- File info -->
            <p class="text-xs text-gray-500 mt-2">
              Supported: Images (JPG, PNG), PDF, MP4 videos. Max 50MB per file.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Links</label>
            <div v-for="(link, index) in editContent.links" :key="index" class="flex gap-2 mb-2">
              <input 
                v-model="editContent.links[index]" 
                type="url" 
                class="flex-1 border rounded px-3 py-2"
                placeholder="https://example.com"
              />
              <button 
                type="button" 
                @click.prevent.stop="removeLink(index)" 
                class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
            <button 
              type="button" 
              @click.prevent.stop="addLink" 
              class="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
            >
              Add Link
            </button>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button 
              type="button" 
              @click.prevent.stop="closeEditModal" 
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="editSubmitting"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {{ editSubmitting ? 'Updating...' : 'Update Content' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="fixed bottom-0 w-full">
      <DashboardFooter />
    </div>
  </div>
</template>
<style scoped></style>
