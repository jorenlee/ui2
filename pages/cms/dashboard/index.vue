<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// ---------------- CONTENT MODEL ----------------
const content = ref({
  content_id: "CMS" + moment().valueOf(),
  title: "",
  authors: "",
  filters: "",
  descriptions: "",
  date: "",
  links: [], // ← ARRAY OF STRINGS
  files: [], // ← ARRAY OF STRINGS e.g ['filename.jpg', filename.pdf, filename.mp4]
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

// Method to update filters based on checkbox selection
const updateFilters = () => {
  // Get existing filters and clean them up
  let existingFilters = content.value.filters || "";

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
  content.value.filters = allFilters.length > 0 ? allFilters.join(", ") : "";
};

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
  if (fileObj.preview && fileObj.preview.startsWith('blob:')) {
    URL.revokeObjectURL(fileObj.preview);
  }
  selectedFiles.value.splice(index, 1);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Add modal state
const showImagePreview = ref(false);
const previewImageUrl = ref('');

const openImagePreview = (url) => {
  previewImageUrl.value = url;
  showImagePreview.value = true;
};

const closeImagePreview = () => {
  showImagePreview.value = false;
  previewImageUrl.value = '';
};

// ---------------- FILE UPLOAD ----------------
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
    });

    const uploaded = await uploadFile(file);

    const last = selectedFiles.value[selectedFiles.value.length - 1];
    last.uploading = false;

    if (uploaded) {
      last.uploaded = true;
      last.uploadedUrl = uploaded.finalName;
    } else {
      last.error = "Upload failed";
    }
  }

  e.target.value = "";
};

const sortedSelectedFiles = computed(() => {
  const order = { video: 1, image: 2, pdf: 3, other: 4 };
  return [...selectedFiles.value].sort((a, b) => order[a.type] - order[b.type]);
});

// ---------------- SUBMIT CONTENT ----------------
const submitting = ref(false);
const submitMessage = ref("");

const submitContent = async () => {
  submitting.value = true;

  try {
    await $fetch(`${endpoint.value}/api/cms/content/create/`, {
      method: "POST",
      body: {
        ...content.value,
        links: [...content.value.links],
      },
    });

    submitMessage.value = "Content successfully created!";
    selectedFiles.value = [];
    router.push("/cms/dashboard/list");
  } catch (err) {
    console.error(err);
    submitMessage.value = "Error submitting content.";
  }

  submitting.value = false;
};

// ---------------- AUTH ----------------
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

  // if (!userStore.user.isAuthenticated || !allowedEmails.includes(userStore.user.email)) {
  //   router.push("/unauthorized");
  // }
  // }, 10000); // Wait 3 seconds for authentication to load
});

// ---------------- LINKS (ARRAY OF STRINGS) ----------------
const addItem = () => content.value.links.push("");
const removeItem = (i) => content.value.links.splice(i, 1);

// ---------------- SIDEBAR ----------------
const toggleSideBarMenu = ref(true);
const logOut = () => {
  userStore.removeToken();
  router.push("/cms/login");
};
</script>

<template>
  <div class="h-screen flex flex-col">
    <!-- Main Content Area -->
    <div class="flex flex-1">
      <!-- SIDEBAR -->
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 w-full flex overflow-hidden z-40 lg:block lg:static absolute h-full"
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

      <div class="w-full">
        <!-- Fixed Header -->
        <div class="bg-green-800 w-full z-50">
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
        <!-- MAIN -->
        <div class="flex-1 bg-gray-50">
          <div class="p-3 lg:p-5">
            <div class="bg-white shadow-lg rounded-lg p-6">
              <h1 class="text-2xl font-bold mb-6 text-gray-800">Create New Content</h1>

              <div class="space-y-4">
                <!-- TITLE -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input v-model="content.title" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Title"/>
                </div>

                <!-- AUTHORS -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Author/Authors</label>
                  <input v-model="content.authors" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Author/Authors"/>
                </div>

                <!-- DESCRIPTION -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea v-model="content.descriptions" class="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y" placeholder="Descriptions"></textarea>
                </div>

                <!-- FILTERS -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Filters</label>
                  <input 
                    v-model="content.filters" 
                    type="text" 
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter filters manually or use checkboxes below"
                  />
                  
                  <div class="mt-2">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">SDGs:</label>
                    <div class="grid lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div v-for="sdg in sdgOptions" :key="sdg.value" class="flex items-center">
                        <input 
                          type="checkbox"
                          :id="sdg.value"
                          :value="sdg.value"
                          v-model="selectedSDGs"
                          @change="updateFilters"
                          class="mr-2 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          :style="{ accentColor: getSdgColor(parseInt(sdg.value.replace('sdg', ''))) }"
                        />
                        <label :for="sdg.value" class="text-xs cursor-pointer text-gray-700 flex items-center">
                          <span 
                            class="inline-block w-3 h-3 rounded-full mr-2"
                            :style="{ backgroundColor: getSdgColor(parseInt(sdg.value.replace('sdg', ''))) }"
                          ></span>
                          {{ sdg.label }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DATE -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Date</label>
                  <input v-model="content.date" type="date" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>

                <!-- LINKS -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <label class="text-sm font-semibold text-gray-700">Attachments (Links)</label>
                    <button @click="addItem" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors">Add Link</button>
                  </div>

                  <div class="space-y-2">
                    <div
                      v-for="(link, i) in content.links"
                      :key="i"
                      class="flex gap-2"
                    >
                      <input
                        v-model="content.links[i]"
                        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Link URL"
                      />
                      <button @click="removeItem(i)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors">Remove</button>
                    </div>
                  </div>
                </div>

                <!-- FILE INPUT -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-1">Select Files (Image, Video, PDF)</label>
                  <input 
                    type="file" 
                    multiple 
                    @change="handleFileSelect" 
                    accept="image/*,video/mp4,application/pdf,audio/mpeg"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
                  />
                  <p class="text-xs text-gray-500 mt-1">Images: Max 1MB | PDFs & Other files: Max 10MB</p>
                  
                  <!-- File Previews -->
                  <div v-if="selectedFiles.length > 0" class="mt-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div
                        v-for="(fileObj, index) in selectedFiles"
                        :key="index"
                        class="relative border border-gray-200 rounded-lg p-2 bg-gray-50"
                      >
                        <!-- Image Preview -->
                        <div v-if="fileObj.type === 'image'" class="mb-2">
                          <img
                            :src="fileObj.preview"
                            :alt="fileObj.name"
                            class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                            @click="openImagePreview(fileObj.preview)"
                          />
                        </div>
                        
                        <!-- Video Preview -->
                        <div v-else-if="fileObj.type === 'video'" class="mb-2 relative cursor-pointer" @click="openImagePreview(fileObj.preview)">
                          <video
                            :src="fileObj.preview"
                            class="w-full h-20 object-cover rounded"
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
                        <div v-else-if="fileObj.type === 'pdf'" class="mb-2">
                          <div class="w-full h-20 bg-red-100 rounded flex items-center justify-center">
                            <i class="fa fa-file-pdf text-red-600 text-2xl"></i>
                          </div>
                        </div>
                        
                        <!-- Other Files -->
                        <div v-else class="mb-2">
                          <div class="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
                            <i class="fa fa-file text-gray-600 text-2xl"></i>
                          </div>
                        </div>
                        
                        <!-- File Info -->
                        <div class="text-xs">
                          <p class="font-medium text-gray-800 truncate" :title="fileObj.name">{{ fileObj.name }}</p>
                          <div class="flex justify-between items-center mt-1">
                            <span class="text-gray-500">{{ formatFileSize(fileObj.file.size) }}</span>
                            <button
                              @click="removeSelectedFile(index)"
                              class="text-red-500 hover:text-red-700 p-1"
                              title="Remove file"
                            >
                              <i class="fa fa-times"></i>
                            </button>
                          </div>
                        </div>
                        
                        <!-- Upload Status -->
                        <div v-if="fileObj.uploading" class="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
                          <div class="text-center">
                            <i class="fa fa-spinner fa-spin text-green-600 text-lg mb-1"></i>
                            <p class="text-xs text-gray-600">Uploading...</p>
                          </div>
                        </div>
                        
                        <div v-else-if="fileObj.uploaded" class="absolute top-1 right-1">
                          <i class="fa fa-check-circle text-green-500"></i>
                        </div>
                        
                        <div v-else-if="fileObj.error" class="absolute top-1 right-1">
                          <i class="fa fa-exclamation-circle text-red-500" :title="fileObj.error"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- SUBMIT -->
                <button
                  @click="submitContent"
                  :disabled="submitting"
                  class="w-full bg-green-800 hover:bg-green-900 disabled:bg-gray-400 text-white py-1 rounded-lg text-lg font-bold transition-colors mt-4"
                >
                  {{ submitting ? "Saving..." : "Submit Content" }}
                </button>

                <p v-if="submitMessage" class="text-center text-green-700 font-medium">{{ submitMessage }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer at bottom -->
        <DashboardFooter />
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
      <div class="relative max-w-4xl max-h-[90vh] overflow-auto bg-white p-2 rounded-lg" @click.stop>
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
.menu {
  @apply hover:bg-green-800 hover:text-white text-green-800 px-3 py-1 rounded;
}
.btn-green {
  @apply px-2 py-1 bg-green-600 text-white text-xs rounded;
}
.btn-red {
  @apply px-2 py-1 bg-red-600 text-white text-xs rounded;
}
</style>
