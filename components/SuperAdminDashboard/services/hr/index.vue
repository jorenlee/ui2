<template>
  <div class="hr-service">
    <div class="w-full min-h-screen">
      <div class="w-11/12 mx-auto my-10 rounded-lg">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h1 class="text-green-700 font-bold lg:text-3xl text-xl">Career Opportunities</h1>

          <div class="flex items-center gap-3">
           
            <div
              class="text-center text-white px-4 py-2 bg-green-900 rounded-lg hover:bg-green-700 cursor-pointer"
              @click="toggleAddModal"
            >
              ADD
            </div>
          </div>
        </div>

        <!-- CONTENT CARD -->
        <div class="shadow lg:px-5 px-4 lg:py-5 py-3 rounded-lg bg-white">
          <!-- Loading skeleton -->
          <div v-if="loading" class="grid lg:grid-cols-5 gap-4">
            <div v-for="n in 5" :key="n" class="animate-pulse bg-gray-100 rounded h-48"></div>
          </div>

          <!-- List -->
          <div v-else>
            <div v-if="filtered.length">

              <!-- Pagination controls -->
              <div class="flex items-center justify-between mb-6">
                <div class="text-sm text-gray-600">
                  Showing {{ startIndex + 1 }} - {{ Math.min(endIndex, filtered.length) }} of
                  {{ filtered.length }}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    class="px-3 py-1 border rounded disabled:opacity-50"
                    :disabled="page === 1"
                    @click="prevPage"
                  >
                    Prev
                  </button>

                  <div class="px-3 py-1 border rounded">
                    Page
                    <input
                      class="w-12 text-center ml-2 border rounded px-1 py-0"
                      type="number"
                      v-model.number="pageInput"
                      @change="gotoPage"
                      min="1"
                      :max="totalPages"
                    />
                    / {{ totalPages }}
                  </div>

                  <button
                    class="px-3 py-1 border rounded disabled:opacity-50"
                    :disabled="page === totalPages"
                    @click="nextPage"
                  >
                    Next
                  </button>

                  <select v-model.number="pageSize" class="px-2 py-1 border rounded">
                    <option :value="5">5</option>
                    <option :value="10">10</option>
                    <option :value="20">20</option>
                  </select>
                </div>
              </div>

              <ul class="lg:grid grid-cols-5 gap-3">
                <li
                  v-for="c in paginated"
                  :key="c.id"
                  class="border rounded-lg shadow-md bg-white relative overflow-hidden"
                >
                  <!-- If image_link exists, show first image -->
                  <div
                    v-if="(c.image_link && c.image_link.length)"
                    class="cursor-pointer"
                    @click="openViewModal(c.image_link[0].url)"
                  >
                    <img
                      :src="c.image_link[0].url"
                      alt="career image"
                      class="w-full h-[200px] object-cover"
                    />
                  </div>


                  <div class="absolute bottom-2 right-2 flex gap-2">
                    <button
                      class="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      @click="openViewModal(c.image_link && c.image_link[0] ? c.image_link[0].url : '')"
                    >
                      View
                    </button>
                    <button
                      class="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      @click="toggleDeleteBtn(c.id)"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              </ul>

            </div>

            <!-- Empty -->
            <div v-else class="italic text-gray-400 text-center p-10">
              Please Add Entry, No Results Found!
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ADD MODAL -->
    <div v-if="toggleAdd" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black opacity-40" @click="toggleAddModal"></div>

      <div class="relative bg-white w-[95%] max-w-xl p-6 rounded-lg shadow-lg z-10">
        <h2 class="text-lg font-semibold mb-4">Add Career Image</h2>

        <!-- Drag & drop area -->
        <div
          class="border-2 border-dashed rounded p-4 text-center mb-3 cursor-pointer"
          :class="{
            'border-green-500 bg-green-50': dragging,
            'opacity-60': isSubmitting
          }"
          @dragenter.prevent="dragging = true"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
          @click="fileInput.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            @change="onFileChange"
            class="hidden"
          />

          <div v-if="preview" class="flex items-center gap-3 justify-center">
            <img :src="preview" class="h-20 rounded object-cover" />
            <div class="text-sm text-gray-700">
              {{ fileName }}
              <br />
              <button class="text-xs text-red-600 underline" @click.stop="removeFile">Remove</button>
            </div>
          </div>

          <div v-else class="text-sm text-gray-600">
            Drag & drop an image here, or click to select.<br />
            <span class="text-xs text-gray-400">(Single image only)</span>
          </div>
        </div>

        <!-- actions -->
        <div class="flex items-center justify-end gap-3">
          <button class="px-4 py-2 rounded border" @click="toggleAddModal" :disabled="isSubmitting">
            Cancel
          </button>

          <button
            class="px-4 py-2 rounded bg-green-700 text-white disabled:opacity-60"
            @click="createCareer"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Submit</span>
            <span v-else>Submitting...</span>
          </button>
        </div>

        <div v-if="uploadStatus" class="mt-3 text-sm text-gray-600">{{ uploadStatus }}</div>
      </div>
    </div>

    <!-- VIEW IMAGE MODAL -->
    <div v-if="toggleView" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black opacity-80" @click="closeView"></div>
      <div class="relative z-10">
        <img :src="viewImage" class="max-w-[90vw] max-h-[85vh] rounded-lg shadow-lg" />
        <button class="absolute top-2 right-2 bg-white rounded-full p-2 shadow" @click="closeView">
          ✕
        </button>
      </div>
    </div>

    <!-- DELETE CONFIRM -->
    <div v-if="toggleConfirmDelete" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black opacity-40" @click="toggleDeleteBtn()"></div>
      <div class="relative bg-white p-6 rounded shadow-lg z-10 w-[90%] max-w-md text-center">
        <p class="mb-4 font-semibold">Are you sure you want to delete this entry?</p>
        <div class="flex items-center justify-center gap-4">
          <button class="px-4 py-2 rounded border" @click="toggleDeleteBtn()">Cancel</button>
          <button
            class="px-4 py-2 rounded bg-red-600 text-white"
            @click="deleteCareer"
            :disabled="isDeleting"
          >
            <span v-if="!isDeleting">Yes, Delete</span>
            <span v-else>Deleting...</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toasts -->
    <div class="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="px-4 py-2 rounded shadow-md text-sm max-w-xs"
        :class="{
          'bg-green-600 text-white': t.type === 'success',
          'bg-red-600 text-white': t.type === 'error',
          'bg-gray-800 text-white': t.type === 'info'
        }"
      >
        {{ t.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import _ from "lodash";

const userStore = useUserStore();
const router = useRouter();

const endpoint = userStore.mainDevServer;

// state
const loading = ref(true);
const careers = ref([]);
const query = ref("");
const filtered = ref([]);

const page = ref(1);
const pageInput = ref(1);
const pageSize = ref(10);

const toggleAdd = ref(false);
const toggleView = ref(false);
const toggleConfirmDelete = ref(false);

const viewImage = ref("");
const idToBeDeleted = ref(null);

// FILE-ONLY FORM
const selectedFile = ref(null);
const preview = ref("");
const fileName = ref("");
const dragging = ref(false);

const isSubmitting = ref(false);
const isDeleting = ref(false);

const uploadStatus = ref("");

// toasts
const toasts = ref([]);
let toastId = 0;
const pushToast = (message, type = "info", ms = 3500) => {
  const id = ++toastId;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, ms);
};

// helpers
const reloadList = async () => {
  loading.value = true;
  try {
    const data = await $fetch(endpoint + "/api/humanResource/list/").catch((e) => {
      throw e;
    });
    careers.value = Array.isArray(data) ? data : data.results ?? [];
    filtered.value = careers.value;
  } catch (err) {
    pushToast("Failed to fetch careers.", "error");
    console.error(err);
  } finally {
    loading.value = false;
    page.value = 1;
    pageInput.value = 1;
  }
};

onMounted(async () => {
  await reloadList();
});

// Search / filter
const onSearch = () => {
  const q = (query.value || "").trim().toLowerCase();
  if (!q) {
    filtered.value = careers.value;
  } else {
    filtered.value = careers.value.filter((c) => {
      const id = (c.id || "").toString();
      return id.includes(q);
    });
  }
  page.value = 1;
  pageInput.value = 1;
};

// Pagination computed
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
const startIndex = computed(() => (page.value - 1) * pageSize.value);
const endIndex = computed(() => startIndex.value + pageSize.value);
const paginated = computed(() => filtered.value.slice(startIndex.value, endIndex.value));

// pagination controls
const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    pageInput.value = page.value;
    scrollToTopOfList();
  }
};
const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++;
    pageInput.value = page.value;
    scrollToTopOfList();
  }
};
const gotoPage = () => {
  if (pageInput.value < 1) pageInput.value = 1;
  if (pageInput.value > totalPages.value) pageInput.value = totalPages.value;
  page.value = pageInput.value;
  scrollToTopOfList();
};
const scrollToTopOfList = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// toggle add modal
const toggleAddModal = () => {
  if (toggleAdd.value) resetForm();
  toggleAdd.value = !toggleAdd.value;
};

// file input handling
const fileInputRef = ref(null);
const fileInput = {
  click: () => fileInputRef.value && fileInputRef.value.click(),
};

const onFileChange = (e) => {
  const f = e.target.files[0];
  setFile(f);
};

const onDrop = (e) => {
  dragging.value = false;
  const f = e.dataTransfer.files[0];
  setFile(f);
};

const setFile = (f) => {
  if (!f) return;
  if (!f.type.startsWith("image/")) {
    pushToast("Only images allowed.", "error");
    return;
  }
  selectedFile.value = f;
  preview.value = URL.createObjectURL(f);
  fileName.value = f.name;
};

const removeFile = () => {
  selectedFile.value = null;
  preview.value = "";
  fileName.value = "";
  if (fileInputRef.value) fileInputRef.value.value = "";
};

const resetForm = () => {
  removeFile();
  isSubmitting.value = false;
  uploadStatus.value = "";
};

// create career (image only) — robust upload + create flow
const createCareer = async () => {
  if (!selectedFile.value) {
    pushToast("Please attach an image.", "error");
    return;
  }

  isSubmitting.value = true;
  uploadStatus.value = "Uploading file...";

  try {
    // STEP 1 — upload file to /upload/ as "file"
    const fd = new FormData();
    fd.append("file", selectedFile.value);

    // Do NOT set Content-Type header here — let browser set boundary
    const uploadRes = await $fetch(endpoint + "/api/humanResource/upload/", {
      method: "POST",
      body: fd,
      // include token if your upload endpoint requires auth:
      // headers: { Authorization: userStore.user.token },
    });

    // uploadRes might be a single object or an array — normalize
    let fileObj = null;
    if (Array.isArray(uploadRes) && uploadRes.length) {
      // array returned
      fileObj = uploadRes[0];
    } else if (uploadRes && typeof uploadRes === "object") {
      fileObj = uploadRes;
    } else {
      throw new Error("Unexpected upload response");
    }

    if (!fileObj || !fileObj.name) {
      throw new Error("Upload response missing 'name' property");
    }

    // If backend returns url, use it; otherwise build final url pattern if needed
    // You said API returns { name, url } (option A), so prefer url.
    const finalUrl = fileObj.url
      ? fileObj.url
      : `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/files/humanResource/files/${fileObj.name}`;

    uploadStatus.value = "Saving record...";

    // STEP 2 — create DB record with image_link JSON
    await $fetch(endpoint + "/api/humanResource/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userStore.user.token,
      },
      body: {
        image_link: [
          {
            name: fileObj.name,
            url: finalUrl,
          },
        ],
      },
    });

    pushToast("Image added successfully.", "success");
    toggleAdd.value = false;
    resetForm();
    await reloadList();
  } catch (err) {
    console.error("createCareer error:", err);
    pushToast("Failed to upload/create image.", "error");
    uploadStatus.value = `Error: ${err.message || "upload failed"}`;
  } finally {
    isSubmitting.value = false;
    // clear status after a moment
    setTimeout(() => (uploadStatus.value = ""), 2500);
  }
};

// view modal
const openViewModal = (url) => {
  if (!url) {
    pushToast("No image available.", "info");
    return;
  }
  viewImage.value = url;
  toggleView.value = true;
};
const closeView = () => {
  toggleView.value = false;
  viewImage.value = "";
};

// delete flow
const toggleDeleteBtn = (id = null) => {
  idToBeDeleted.value = id;
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
};

const deleteCareer = async () => {
  if (!idToBeDeleted.value) return;
  isDeleting.value = true;
  try {
    await $fetch(`${endpoint}/api/humanResource/${idToBeDeleted.value}/delete/`, {
      method: "DELETE",
      headers: {
        Authorization: userStore.user.token,
      },
    });
    pushToast("Deleted successfully.", "success");
    toggleConfirmDelete.value = false;
    await reloadList();
  } catch (err) {
    console.error(err);
    pushToast("Failed to delete.", "error");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
