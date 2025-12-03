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
  filters: "",
  descriptions: "",
  // links: [],   // for manual links
  files: [],   // for uploaded files (names only)
  logs: [
    {
      personnel_designation: userStore.user.email,
      personal_email: userStore.user.email,
      remarks_title: "N/A",
      remarks_description: "N/A",
      timestamp: moment().valueOf(),
    }
  ]
});

// ---------------- HELPERS ----------------
const extractFileNameFromUrl = (url) => {
  try {
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split("/").pop();
  } catch {
    return "uploaded_file";
  }
};

// ---------------- FILE VALIDATION ----------------
const selectedFiles = ref([]);
const MAX_FILE_SIZE_DEFAULT = 5 * 1024 * 1024;
const MAX_FILE_SIZE_MEDIA = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg","image/png","image/jpg","application/pdf","audio/mpeg","video/mp4"];
const ALLOWED_EXTENSIONS = [".jpeg",".jpg",".png",".pdf",".mp3",".mp4"];

const fileError = ref("");
const showFileToast = ref(false);

const showToast = (msg) => {
  fileError.value = msg;
  showFileToast.value = true;
  setTimeout(() => showFileToast.value = false, 3000);
};

const validateFile = (file) => {
  const ext = "." + file.name.split(".").pop().toLowerCase();
  const mime = (file.type || "").toLowerCase();
  const isValid = ALLOWED_TYPES.includes(mime) || ALLOWED_EXTENSIONS.includes(ext);
  if (!isValid) {
    showToast(`Invalid file: ${file.name}`);
    return false;
  }
  const maxSize = mime.startsWith("image") || mime.startsWith("video") ? MAX_FILE_SIZE_MEDIA : MAX_FILE_SIZE_DEFAULT;
  if (file.size > maxSize) {
    showToast(`File too large: ${file.name}`);
    return false;
  }
  return true;
};

const detectType = (file) => {
  const t = (file.type || "");
  if (t.startsWith("image")) return "image";
  if (t.startsWith("video")) return "video";
  if (t === "application/pdf") return "pdf";
  return "other";
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
        Authorization: `Bearer ${userStore.token || ""}`
      }
    });




console.log('mao nani', file.name)


const finalName = file.name

    if (!content.value.files.includes(finalName)) {
      content.value.files = [...content.value.files, finalName];
    }


    console.log('content.value.files', content.value.files)
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

    try {
      await uploadFile(file); // filename will be added to content.files
    } catch (err) {
      showToast(`Upload error: ${file.name}`);
      console.error(err);
    }
  }

  e.target.value = null;
};

// ---------------- REMOVE FILE ----------------
const removeSelectedFile = (i) => {
  const local = selectedFiles.value[i];
  if (local?.uploadedUrl) {
    const idx = content.value.files.findIndex(f => f === local.name);
    if (idx !== -1) content.value.files.splice(idx, 1);
  }
  if (local?.preview) URL.revokeObjectURL(local.preview);
  selectedFiles.value.splice(i, 1);
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

  // Upload any remaining files
  for (const local of selectedFiles.value) {
    if (!local.uploaded && !local.uploading) {
      local.uploading = true;
      const uploaded = await uploadFile(local.file);
      local.uploading = false;
      if (uploaded) {
        local.uploaded = true;
        local.uploadedUrl = uploaded.url;
      } else {
        local.error = "Upload failed";
      }
    }
  }

  try {
    await $fetch(`${endpoint.value}/api/cms/content/create/`, {
      method: "POST",
      body: {
        ...content.value,
        files: content.value.files // uploaded file names
      }
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
});


// ---------------- LINKS MANUAL ----------------
const addItem = () => content.value.links.push({ name: "" });
const removeItem = (i) => content.value.links.splice(i, 1);

// ---------------- SIDEBAR ----------------
const toggleSideBarMenu = ref(true);
const logOut = () => { userStore.removeToken(); router.push("/cms/login"); };
</script>

<template>
<div class="flex">
  <!-- SIDEBAR -->
  <div v-show="toggleSideBarMenu" class="bg-gray-100 w-3/12 p-3">
    <div class="text-center mb-5">
      <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSU_Seal.PNG" class="w-20 mx-auto" />
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
      <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="cursor-pointer">
        <i class="fa text-2xl" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"></i>
        <span class="ml-2 font-bold uppercase text-xs">LSU CMS</span>
      </div>
      <button @click="logOut" class="flex items-center hover:bg-green-700 px-2 py-1 rounded">
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

          <!-- LINKS -->
          <!-- <div>
            <div class="flex justify-between items-center mb-1">
              <p class="font-bold">Links</p>
              <button @click="addItem" class="btn-green">Add</button>
            </div>
            <div v-for="(link,i) in content.links" :key="i" class="flex gap-2 mb-2">
              <input v-model="link.name" class="input" placeholder="Links" />
              <button @click="removeItem(i)" class="btn-red">X</button>
            </div>
          </div> -->

          <!-- FILE SELECT -->
          <div>
            <p class="font-bold">Select Files (Image, Video, PDF)</p>
            <input type="file" multiple @change="handleFileSelect" class="input" />
          </div>

          <!-- LOCAL FILE PREVIEW -->
          <div class="mt-4 space-y-3">
            <div
              v-for="(file,i) in sortedSelectedFiles"
              :key="i"
              class="border p-2 rounded bg-gray-50 relative"
            >
              <p class="text-xs font-semibold">{{ file.name }}</p>

              <img v-if="file.type==='image'" :src="file.preview" class="w-full h-40 object-cover rounded mt-2" />
              <video v-if="file.type==='video'" :src="file.preview" controls class="w-full h-40 rounded mt-2"></video>
              <iframe v-if="file.type==='pdf'" :src="file.preview" class="w-full h-40 rounded mt-2"></iframe>

              <div v-if="file.type==='other'" class="text-xs text-gray-600 mt-2">File ready to upload.</div>

              <div class="mt-2 text-xs">
                <span v-if="file.uploading">Uploading...</span>
                <span v-else-if="file.uploaded">Uploaded</span>
                <span v-else-if="file.error" class="text-red-600">{{ file.error }}</span>
              </div>

              <button
                @click="removeSelectedFile(i)"
                class="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >X</button>
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
.input { @apply border p-2 rounded w-full text-xs; }
.menu { @apply hover:bg-green-800 hover:text-white text-green-800 px-3 py-1 rounded; }
.btn-green { @apply px-2 py-1 bg-green-600 text-white text-xs rounded; }
.btn-red { @apply px-2 py-1 bg-red-600 text-white text-xs rounded; }
</style>
