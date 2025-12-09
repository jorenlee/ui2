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
    // Collect uploaded filenames
    const uploadedFilenames = selectedFiles.value
      .filter(fileObj => fileObj.uploaded && fileObj.uploadedUrl)
      .map(fileObj => fileObj.uploadedUrl);

    await $fetch(`${endpoint.value}/api/cms/content/create/`, {
      method: "POST",
      body: {
        ...content.value,
        links: [...content.value.links],
        files: uploadedFilenames, // Add the filenames array
      },
    });

    submitMessage.value = "Content successfully created!";
    selectedFiles.value = [];
    router.push("/cms/dashboard");
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
  <div class="w-full">
    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 bg-gray-50 overflow-y-auto">
      <div class="p-3 lg:p-8">
        <div class="bg-white shadow-lg rounded-lg p-6 lg:p-8">
          <h1 class="text-2xl lg:text-3xl font-bold mb-8 text-gray-800">Create New Content</h1>

          <div class="w-full">
            <!-- TITLE -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input 
                v-model="content.title" 
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition" 
                placeholder="Enter content title"
              />
            </div>

            <!-- AUTHORS -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Author/Authors</label>
              <input 
                v-model="content.authors" 
                type="text"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition" 
                placeholder="e.g., John Doe, Jane Smith"
              />
            </div>

            <!-- DESCRIPTION -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea 
                v-model="content.descriptions" 
                class="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-y" 
                placeholder="Provide a detailed description of the content"
              ></textarea>
            </div>

            <!-- FILTERS & SDGs -->
            <div class="border-t pt-6">
              <label class="block text-sm font-semibold text-gray-700 mb-3">Filters</label>
              <input 
                v-model="content.filters" 
                type="text" 
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition mb-4"
                placeholder="Enter filters manually or select SDGs below"
              />
              
              <!-- SDGs Selection -->
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-3 uppercase">Sustainable Development Goals (SDGs)</label>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div v-for="sdg in sdgOptions" :key="sdg.value" class="flex items-center hover:bg-white p-2 rounded transition">
                    <input 
                      type="checkbox"
                      :id="sdg.value"
                      :value="sdg.value"
                      v-model="selectedSDGs"
                      @change="updateFilters"
                      class="mr-3 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      :style="{ accentColor: getSdgColor(parseInt(sdg.value.replace('sdg', ''))) }"
                    />
                    <label :for="sdg.value" class="text-sm cursor-pointer text-gray-700 flex items-center flex-1">
                      <span 
                        class="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
                        :style="{ backgroundColor: getSdgColor(parseInt(sdg.value.replace('sdg', ''))) }"
                      ></span>
                      <span class="text-xs">{{ sdg.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- DATE -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input 
                v-model="content.date" 
                type="date" 
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition" 
              />
            </div>

            <!-- LINKS -->
            <div class="border-t pt-6">
              <div class="flex justify-between items-center mb-4">
                <label class="text-sm font-semibold text-gray-700">Attachments (Links)</label>
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
              <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Files</label>
              <p class="text-xs text-gray-500 mb-3">Supported: Images (JPG, PNG), Videos (MP4), PDFs, Audio (MP3)</p>
              
              <label class="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
                <i class="fa fa-cloud-upload text-3xl text-gray-400 mb-2"></i>
                <p class="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p class="text-xs text-gray-500 mt-1">Images: Max 1MB | PDFs & Other files: Max 10MB</p>
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
                <h3 class="text-sm font-semibold text-gray-700 mb-4">Uploaded Files ({{ selectedFiles.length }})</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div
                    v-for="(fileObj, index) in selectedFiles"
                    :key="index"
                    class="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition"
                  >
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
                    <div v-else-if="fileObj.type === 'video'" class="relative bg-black h-24 flex items-center justify-center cursor-pointer group" @click="openImagePreview(fileObj.preview)">
                      <i class="fa fa-play text-white text-xl group-hover:text-2xl transition"></i>
                    </div>
                    
                    <!-- PDF Preview -->
                    <div v-else-if="fileObj.type === 'pdf'" class="h-24 bg-red-50 flex items-center justify-center">
                      <i class="fa fa-file-pdf text-red-600 text-2xl"></i>
                    </div>
                    
                    <!-- Other Files -->
                    <div v-else class="h-24 bg-gray-100 flex items-center justify-center">
                      <i class="fa fa-file text-gray-600 text-2xl"></i>
                    </div>
                    
                    <!-- File Info -->
                    <div class="p-2 border-t border-gray-200">
                      <p class="text-xs font-medium text-gray-800 truncate" :title="fileObj.name">{{ fileObj.name }}</p>
                      <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(fileObj.file.size) }}</p>
                    </div>
                    
                    <!-- Upload Status -->
                    <div v-if="fileObj.uploading" class="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
                      <div class="text-center">
                        <i class="fa fa-spinner fa-spin text-green-600 text-xl"></i>
                        <p class="text-xs text-gray-600 mt-2">Uploading...</p>
                      </div>
                    </div>
                    
                    <div v-else-if="fileObj.uploaded" class="absolute top-1 right-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                      <i class="fa fa-check text-xs"></i>
                    </div>
                    
                    <div v-else-if="fileObj.error" class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" :title="fileObj.error">
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
                @click="() => { content = { ...content, title: '', authors: '', descriptions: '', filters: '', date: '', links: [] }; selectedFiles = []; }"
                class="px-6 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-bold transition-colors"
              >
                Clear
              </button>
            </div>

            <!-- Messages -->
            <div v-if="submitMessage" class="p-4 rounded-lg" :class="submitMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              <i class="fa" :class="submitMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'" ></i>
              {{ submitMessage }}
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
</style>
