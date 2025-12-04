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
  links: [],                // ← ARRAY OF STRINGS
  files: [],                // ← ARRAY OF STRINGS e.g ['filename.jpg', filename.pdf, filename.mp4]
  logs: [
    {
      personnel_fullname: userStore.user.name,
      personnel_designation: userStore.user.email,
      personnel_email: userStore.user.email,
      remarks_title: "N/A",
      remarks_description: "N/A",
      timestamp: moment().valueOf(),
    }
  ]
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
  { value: "sdg17", label: "SDG 17 - Partnerships" }
]);

const selectedSDGs = ref([]);

// Method to update filters based on checkbox selection
const updateFilters = () => {
  // Get existing filters and clean them up
  let existingFilters = content.value.filters || '';
  
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
  content.value.filters = allFilters.length > 0 ? allFilters.join(', ') : '';
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
  const t = file.type || "";
  if (t.startsWith("image")) return "image";
  if (t.startsWith("video")) return "video";
  if (t === "application/pdf") return "pdf";
  return "other";
};

// ---------------- FILE UPLOAD ----------------
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
<div class="flex">
  <!-- SIDEBAR -->
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
        <h1 class="text-lg font-bold mb-4">Create New Content</h1>

        <div class="grid gap-3 text-sm">
          <!-- TITLE -->
          <label>
            <p>Title</p>
            <input v-model="content.title" class="input" placeholder="Title"/>
          </label>

          <label>
            <p>Author/Authors</p>
            <input v-model="content.authors" class="input" placeholder="Author/Authors"/>
          </label>

          <!-- DESCRIPTION -->
          <label>
            <p>Description</p>
            <textarea v-model="content.descriptions" class="input h-32" placeholder="Descriptions"></textarea>
          </label>

          <!-- KEYWORDS -->
          <div>
            <div>
              <label class="block text-sm font-medium mb-1">Filters</label>
              <input 
                v-model="content.filters" 
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

          <!-- FILE INPUT -->
          <div>
            <p class="font-bold">Select Files (Image, Video, PDF)</p>
            <input type="file" multiple @change="handleFileSelect" class="input" />
          </div>

          <!-- PREVIEW -->
          <div class="mt-4 space-y-3">
            <div
              v-for="(file, i) in sortedSelectedFiles"
              :key="i"
              class="border p-2 rounded bg-gray-50 relative"
            >
              <p class="text-xs font-semibold">{{ file.name }}</p>

              <img
                v-if="file.type === 'image'"
                :src="file.preview"
                class="w-full h-40 object-cover rounded mt-2"
              />
              <video
                v-if="file.type === 'video'"
                :src="file.preview"
                controls
                class="w-full h-40 rounded mt-2"
              ></video>
              <iframe
                v-if="file.type === 'pdf'"
                :src="file.preview"
                class="w-full h-40 rounded mt-2"
              ></iframe>

              <div
                v-if="file.type === 'other'"
                class="text-xs text-gray-600 mt-2"
              >
                File ready to upload.
              </div>

              <div class="mt-1 text-xs">
                <span v-if="file.uploading">Uploading...</span>
                <span v-else-if="file.uploaded" class="text-green-700"
                  >Uploaded ✔</span
                >
                <span v-else-if="file.error" class="text-red-600">{{
                  file.error
                }}</span>
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
            {{ submitting ? "Saving..." : "Submit Content" }}
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
