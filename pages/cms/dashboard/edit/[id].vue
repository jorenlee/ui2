<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// Add loading state
const loading = ref(true);
const loadError = ref("");

// Initialize content with empty values first
const content = ref({
  content_id: "CMS" + moment().valueOf(),
  title: "",
  filters: "",
  descriptions: "",
  date: "",
  links: [],
  files: [],
  logs: [
    {
      personnel_designation: userStore.user.email,
      personal_email: userStore.user.email,
      remarks_title: "Edit",
      remarks_description: "Content updated",
      timestamp: moment().valueOf(),
    }
  ]
});

// Fetch existing content in onMounted instead
onMounted(async () => {
  try {
    const response = await $fetch(`${endpoint.value}/api/cms/content/${route.params.id}/`);
    
    if (response) {
      content.value = {
        content_id: response.content_id || "CMS" + moment().valueOf(),
        title: response.title || "",
        filters: response.filters || "",
        descriptions: response.descriptions || "",
        date: response.date || "",
        links: response.links || [],
        files: response.files || [],
        logs: response.logs || [
          {
            personnel_designation: userStore.user.email,
            personal_email: userStore.user.email,
            remarks_title: "Edit",
            remarks_description: "Content updated",
            timestamp: moment().valueOf(),
          }
        ]
      };
    }
  } catch (error) {
    console.error("Error fetching content:", error);
    loadError.value = "Failed to load content";
  } finally {
    loading.value = false;
  }

});

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
const MAX_FILE = 5 * 1024 * 1024;
const MAX_MEDIA = 50 * 1024 * 1024;

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

const showToast = (msg) => {
  fileError.value = msg;
  showFileToast.value = true;
  setTimeout(() => (showFileToast.value = false), 3000);
};

const validateFile = (file) => {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  const mime = file.type.toLowerCase();

  if (!ALLOWED_TYPES.includes(mime) && !ALLOWED_EXTENSIONS.includes(ext)) {
    showToast(`Invalid file: ${file.name}`);
    return false;
  }

  const maxSize =
    mime.startsWith("image") || mime.startsWith("video")
      ? MAX_MEDIA
      : MAX_FILE;

  if (file.size > maxSize) {
    showToast(`File too large: ${file.name}`);
    return false;
  }

  return true;
};

const detectType = (file) => {
  const fileName = file.name || "";
  const ext = fileName.toLowerCase().split('.').pop();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return "image";
  if (['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext)) return "video";
  if (ext === 'pdf') return "pdf";
  return "other";
};

// ---------------- FILE UPLOAD ----------------
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await $fetch(
      `${endpoint.value}/api/cms/content/file/upload/`,
      {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${userStore.token || ""}` },
      }
    );

    let finalName = "";

    if (res?.url) finalName = extractFileNameFromUrl(res.url);
    else if (res?.filename) finalName = res.filename;
    else if (res?.name) finalName = res.name;
    else finalName = file.name;

    // Always add the filename to the array (removed duplicate check)
    content.value.files = [...content.value.files, finalName];

    return { ok: true, finalName };
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    showToast(`Upload failed: ${file.name}`);
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

  // Clear the input value safely
  if (e.target) {
    e.target.value = "";
  }
};

// ---------------- REMOVE FILE ----------------
const removeSelectedFile = (i) => {
  const local = selectedFiles.value[i];

  if (local.uploadedUrl) {
    const index = content.value.files.findIndex(
      (f) => f === local.uploadedUrl
    );
    if (index !== -1) content.value.files.splice(index, 1);
  }

  if (local.preview) URL.revokeObjectURL(local.preview);

  selectedFiles.value.splice(i, 1);
};

const sortedSelectedFiles = computed(() => {
  const order = { video: 1, image: 2, pdf: 3, other: 4 };
  return [...selectedFiles.value].sort(
    (a, b) => order[a.type] - order[b.type]
  );
});

// ---------------- FILE TYPE HELPERS ----------------
const isImageFile = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

const isPdfFile = (fileName) => {
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith('.pdf');
};

const isVideoFile = (fileName) => {
  if (!fileName) return false;
  const ext = fileName.toLowerCase().split('.').pop();
  return ['mp4', 'webm', 'ogg', 'avi', 'mov'].includes(ext);
};

const removeExistingFile = (index) => {
  content.value.files.splice(index, 1);
};

// ---------------- SUBMIT CONTENT ----------------
const submitting = ref(false);
const submitMessage = ref("");

const submitContent = async () => {
  submitting.value = true;

  try {
    await $fetch(`${endpoint.value}/api/cms/content/${route.params.id}/edit/`, {
      method: "PUT",
      body: {
        ...content.value,
        links: [...content.value.links],
      },
    });

    submitMessage.value = "Content successfully updated!";
    selectedFiles.value = [];
    router.push("/cms/dashboard/list");
  } catch (err) {
    console.error(err);
    submitMessage.value = "Error updating content.";
  }

  submitting.value = false;
};

// ---------------- AUTH ----------------
onMounted(() => {
  setTimeout(() => {
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
      "xie.medrano@lsu.edu.ph"
    ];

    if (!userStore.user.isAuthenticated || !allowedEmails.includes(userStore.user.email)) {
      router.push("/unauthorized");
    }
  }, 10000); // Wait 3 seconds for authentication to load
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
<div class="flex">
  <!-- SIDEBAR -->
  <div v-show="toggleSideBarMenu" class="bg-gray-100 w-3/12 p-3">
    <div class="text-center mb-5">
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG"
        class="w-20 mx-auto"
      />
      <h1 class="font-bold text-green-800 text-2xl mt-3">Dashboard</h1>
      <p class="text-green-900 text-sm mt-1">{{ userStore.user.email }}</p>
    </div>

    <div class="grid gap-2">
      <a href="/cms/dashboard" class="menu">Content Form</a>
      <a href="/cms/dashboard/list" class="menu">All Contents</a>
      <a href="/" class="menu">LSU HOME PAGE</a>
    </div>
  </div>

  <!-- MAIN -->
  <div class="w-full">
    <div class="bg-green-800 flex justify-between px-3 py-2 text-white">
      <div
        @click="toggleSideBarMenu = !toggleSideBarMenu"
        class="cursor-pointer"
      >
        <i
          class="fa text-2xl"
          :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
        ></i>
        <span class="ml-2 font-bold uppercase text-xs">LSU CMS</span>
      </div>
      <button
        @click="logOut"
        class="flex items-center hover:bg-green-700 px-2 py-1 rounded"
      >
        <i class="fa fa-sign-out text-white text-xl"></i>
        <span class="ml-1 text-xs hidden lg:flex">Log Out</span>
      </button>
    </div>

    <div class="p-3 lg:p-5">
      <div class="bg-white shadow rounded p-4">
        <h1 class="text-lg font-bold mb-4">Edit Content</h1>

        <div v-if="loading" class="text-center py-4">
          <p>Loading content...</p>
        </div>

        <div v-else-if="loadError" class="text-center py-4 text-red-600">
          <p>{{ loadError }}</p>
        </div>

        <div v-else class="grid gap-3 text-sm">
          <!-- TITLE -->
          <label>
            <p>Title</p>
            <input v-model="content.title" class="input" />
          </label>

          <!-- DESCRIPTION -->
          <label>
            <p>Description</p>
            <textarea v-model="content.descriptions" class="input h-32"></textarea>
          </label>

          <!-- KEYWORDS -->
          <label>
            <p>Keywords</p>
            <input v-model="content.filters" class="input" />
          </label>

          <!-- DATE -->
          <label>
            <p>Date</p>
            <input v-model="content.date" type="date" class="input" />
          </label>

          <!-- LINKS AS ARRAY OF STRINGS -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <p class="font-bold">Attachments (Links)</p>
              <button @click="addItem" class="btn-green">Add</button>
            </div>

            <div
              v-for="(link, i) in content.links"
              :key="i"
              class="flex gap-2 mb-2"
            >
              <input
                v-model="content.links[i]"
                class="input"
                placeholder="Link URL"
              />
              <button @click="removeItem(i)" class="btn-red">X</button>
            </div>
          </div>

          <!-- EXISTING FILES PREVIEW -->
          <div v-if="content.files && content.files.length" class="mt-4">
            <p class="font-bold mb-2">Existing Files</p>
            <div class="space-y-3">
              <div
                v-for="(fileName, i) in content.files"
                :key="i"
                class="border p-2 rounded bg-gray-50 relative"
              >
                <p class="text-xs font-semibold mb-2">{{ fileName }}</p>
                
                <!-- Image preview for jpg, png files -->
                <img
                  v-if="isImageFile(fileName)"
                  :src="`${endpoint}/media/cms/files/${fileName}`"
                  class="w-full h-60 object-contain rounded border"
                  :alt="fileName"
                />
                
                <!-- PDF preview -->
                <div v-else-if="isPdfFile(fileName)" class="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                  <div class="text-center">
                    <i class="fa fa-file-pdf-o text-red-500 text-3xl mb-2"></i>
                    <p class="text-xs">PDF File</p>
                    <a :href="`${endpoint}/media/cms/files/${fileName}`" target="_blank" class="text-blue-500 text-xs underline">View PDF</a>
                  </div>
                </div>
                
                <!-- Video preview -->
                <div v-else-if="isVideoFile(fileName)" class="w-full h-40 bg-gray-100 rounded flex items-center justify-center">
                  <div class="text-center">
                    <i class="fa fa-file-video-o text-blue-500 text-3xl mb-2"></i>
                    <p class="text-xs">Video File</p>
                    <a :href="`${endpoint}/media/cms/files/${fileName}`" target="_blank" class="text-blue-500 text-xs underline">View Video</a>
                  </div>
                </div>
                
                <!-- Generic file icon for other files -->
                <div v-else class="flex items-center justify-center h-20 bg-gray-200 rounded">
                  <i class="fa fa-file text-gray-500 text-2xl"></i>
                </div>

                <!-- Remove existing file button -->
                <button
                  @click="removeExistingFile(i)"
                  class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          <!-- FILE INPUT -->
          <div>
            <p class="font-bold">Add New Files (Image, Video, PDF)</p>
            <input type="file" multiple @change="handleFileSelect" class="input" />
          </div>

          <!-- NEW FILES PREVIEW -->
          <div v-if="sortedSelectedFiles.length" class="mt-4 space-y-3">
            <p class="font-bold">New Files to Upload</p>
            <div
              v-for="(file, i) in sortedSelectedFiles"
              :key="i"
              class="border p-2 rounded bg-gray-50 relative"
            >
              <p class="text-xs font-semibold">{{ file.name }}</p>

              <img
                v-if="isImageFile(file.name)"
                :src="file.preview"
                class="w-full h-40 object-cover rounded mt-2"
                :alt="file.name"
              />
              <video
                v-else-if="isVideoFile(file.name)"
                :src="file.preview"
                controls
                class="w-full h-40 rounded mt-2"
              ></video>
              <div
                v-else-if="isPdfFile(file.name)"
                class="w-full h-40 bg-gray-100 rounded mt-2 flex items-center justify-center"
              >
                <div class="text-center">
                  <i class="fa fa-file-pdf-o text-red-500 text-3xl mb-2"></i>
                  <p class="text-xs">PDF File</p>
                </div>
              </div>

              <div
                v-else
                class="text-xs text-gray-600 mt-2 flex items-center justify-center h-20 bg-gray-100 rounded"
              >
                <div class="text-center">
                  <i class="fa fa-file text-gray-500 text-2xl mb-1"></i>
                  <p>File ready to upload</p>
                </div>
              </div>

              <div class="mt-1 text-xs">
                <span v-if="file.uploading">Uploading...</span>
                <span v-else-if="file.uploaded" class="text-green-700">Uploaded ✔</span>
                <span v-else-if="file.error" class="text-red-600">{{ file.error }}</span>
              </div>

              <button
                @click="removeSelectedFile(i)"
                class="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                X
              </button>
            </div>
          </div>

          <!-- SUBMIT -->
          <button
            @click="submitContent"
            :disabled="submitting"
            class="w-full bg-green-800 text-white py-2 rounded mt-4 font-bold"
          >
            {{ submitting ? "Saving..." : "Update Content" }}
          </button>

          <p class="text-center text-green-700">{{ submitMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</div>
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
