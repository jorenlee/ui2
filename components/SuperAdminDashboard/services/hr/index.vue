<template>
  <div class="hr-service">
    <div class="w-full min-h-screen">
      <div class="w-11/12 mx-auto lg:my-10 rounded-lg">
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
            <div v-if="careers.length" class="lg:grid grid-cols-5 gap-3">
              <li
                v-for="c in careers"
                :key="c.id"
                class="border rounded-lg shadow-md bg-white relative overflow-hidden list-none mb-3"
              >
                <div
                  v-if="c.image_link && c.image_link.length"
                  class="cursor-pointer"
                  @click="openViewModal(getCleanUrl(c.image_link[0].url))"
                >
                  <img
                    :src="getCleanUrl(c.image_link[0].url)"
                    class="w-full h-[200px] object-cover"
                  />
                </div>

                <div class="absolute bottom-2 right-2 flex gap-2">
                  <button
                    class="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    @click="openViewModal(getCleanUrl(c.image_link?.[0]?.url || ''))"
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

        <!-- Drag & Drop -->
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
          @click="fileInputRef?.click()"
        >
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
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

        <!-- Actions -->
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
        <button class="absolute top-2 right-2 bg-white rounded-full p-2 shadow" @click="closeView">✕</button>
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

    <!-- TOAST -->
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const endpoint = userStore.mainDevServer;

// ================= STATE =================
const loading = ref(true);
const careers = ref([]);
const lastCount = ref(0);

// Modals
const toggleAdd = ref(false);
const toggleView = ref(false);
const toggleConfirmDelete = ref(false);
const viewImage = ref("");
const idToBeDeleted = ref(null);

// Upload
const selectedFile = ref(null);
const preview = ref("");
const fileName = ref("");
const dragging = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const uploadStatus = ref("");
const fileInputRef = ref(null);

// Toast
const toasts = ref([]);
let toastId = 0;
const pushToast = (message, type = "info", ms = 3500) => {
  const id = ++toastId;
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, ms);
};

// ================= FETCH LIST =================
const reloadList = async () => {
  loading.value = true;
  try {
    const data = await $fetch(endpoint + "/api/humanResource/list/");
    careers.value = Array.isArray(data) ? data : data.results ?? [];
    lastCount.value = careers.value.length;
  } catch {
    pushToast("Failed to fetch careers.", "error");
  } finally {
    loading.value = false;
  }
};

// ================= AUTO REFRESH =================
const autoRefresh = async () => {
  try {
    const data = await $fetch(endpoint + "/api/humanResource/list/");
    const newList = Array.isArray(data) ? data : data.results ?? [];
    if (JSON.stringify(newList) !== JSON.stringify(careers.value)) {
      careers.value = newList;
      lastCount.value = newList.length;
    }
  } catch {}
};

let refreshInterval = null;

onMounted(async () => {
  await reloadList();
  refreshInterval = setInterval(autoRefresh, 5000);
});

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

// ================= MODALS =================
const toggleAddModal = () => {
  if (toggleAdd.value) resetForm();
  toggleAdd.value = !toggleAdd.value;
};

const openViewModal = (url) => {
  if (!url) return pushToast("No image available.", "info");
  viewImage.value = url;
  toggleView.value = true;
};

const closeView = () => {
  toggleView.value = false;
  viewImage.value = "";
};

const toggleDeleteBtn = (id = null) => {
  idToBeDeleted.value = id;
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
};

// ================= FILE HANDLING =================
const onFileChange = (e) => {
  const f = e.target.files?.[0];
  if (f) setFile(f);
};

const onDrop = (e) => {
  dragging.value = false;
  const f = e.dataTransfer?.files?.[0];
  if (f) setFile(f);
};

const setFile = (f) => {
  if (!f) return;
  if (!f.type.startsWith("image/")) return pushToast("Only images allowed.", "error");

  selectedFile.value = f;
  preview.value = URL.createObjectURL(f);
  fileName.value = f.name;
};

const removeFile = () => {
  selectedFile.value = null;
  preview.value = "";
  fileName.value = "";
  if (fileInputRef) fileInputRef.value = "";
};

const resetForm = () => {
  removeFile();
  isSubmitting.value = false;
  uploadStatus.value = "";
};

// ================= CLEAN URL =================
const getCleanUrl = (url) => {
  if (!url) return "";
  return url.split("?")[0].split("#")[0].trim();
};

// ================= CREATE =================
const createCareer = async () => {
  if (!selectedFile.value) return pushToast("Please attach an image.", "error");

  isSubmitting.value = true;
  uploadStatus.value = "Uploading file...";

  try {
    const fd = new FormData();
    fd.append("file", selectedFile.value);

    const uploadRes = await $fetch(endpoint + "/api/humanResource/upload/", {
      method: "POST",
      body: fd,
    });

    const fileObj = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;
    if (!fileObj?.name) throw new Error("Invalid upload response");

    const finalUrl =
      fileObj.url ||
      `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/files/humanResource/files/${fileObj.name}`;

    uploadStatus.value = "Saving record...";

    await $fetch(endpoint + "/api/humanResource/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: userStore.user.token,
      },
      body: {
        image_link: [{ name: fileObj.name, url: finalUrl }],
      },
    });

    pushToast("Successfully uploaded.", "success");
    toggleAdd.value = false;
    resetForm();
    await reloadList();
  } catch (err) {
    pushToast("Upload failed.", "error");
    uploadStatus.value = err.message;
  } finally {
    isSubmitting.value = false;
    setTimeout(() => (uploadStatus.value = ""), 2500);
  }
};

// ================= DELETE =================
const deleteCareer = async () => {
  if (!idToBeDeleted.value) return;
  isDeleting.value = true;

  try {
    await $fetch(`${endpoint}/api/humanResource/${idToBeDeleted.value}/delete/`, {
      method: "DELETE",
      headers: { Authorization: userStore.user.token },
    });

    pushToast("Deleted successfully.", "success");
    toggleConfirmDelete.value = false;
    await reloadList();
  } catch {
    pushToast("Failed to delete.", "error");
  } finally {
    isDeleting.value = false;
  }
};
</script>
