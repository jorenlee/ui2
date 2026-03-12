<script setup>
import { ref, onMounted, computed } from "vue";

// ---------------- CONFIG ----------------
const props = defineProps({ darkMode: Boolean });
const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

// ---------------- STATE ----------------
const listItems = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingItem = ref(null);
const searchQuery = ref("");

const confirmDeleteModal = ref(false);
const deleteId = ref(null);

const toasts = ref([]);

// ---------------- FORM ----------------
const defaultForm = {
  fullname: "",
  designation: "",
  lsu_email: "",
  office: "",
  office_abbr: "",
};

const formData = ref({ ...defaultForm });

// ---------------- FETCH ----------------
const fetchList = async () => {
  isLoading.value = true;

  try {
    listItems.value = await $fetch(`${endpoint}/api/cits/lsu-offices/list/`);
  } catch (e) {
    showToast("Error fetching LSU Offices", "error");
  } finally {
    isLoading.value = false;
  }
};

// ---------------- FILTER ----------------
const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  if (!q) return listItems.value;

  return listItems.value.filter(
    (i) =>
      i.fullname?.toLowerCase().includes(q) ||
      i.designation?.toLowerCase().includes(q) ||
      i.lsu_email?.toLowerCase().includes(q) ||
      i.office?.toLowerCase().includes(q),
  );
});

// ---------------- HELPERS ----------------
const resetForm = () => {
  formData.value = { ...defaultForm };
  editingItem.value = null;
};

// ---------------- FORM ----------------
const openForm = (item = null) => {
  editingItem.value = item;

  formData.value = item
    ? {
        fullname: item.fullname,
        designation: item.designation,
        lsu_email: item.lsu_email,
        office: item.office,
        office_abbr: item.office_abbr,
      }
    : { ...defaultForm };

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

// ---------------- SAVE ----------------
const submitForm = async () => {
  if (!formData.value.fullname.trim())
    return showToast("Full name is required", "warning");

  isLoading.value = true;

  const url = editingItem.value
    ? `${endpoint}/api/cits/lsu-offices/${editingItem.value.id}/edit/`
    : `${endpoint}/api/cits/lsu-offices/create/`;

  const method = editingItem.value ? "PUT" : "POST";

  try {
    await $fetch(url, {
      method,
      body: formData.value,
    });

    showToast(
      `Admin ${editingItem.value ? "updated" : "created"} successfully`,
      "success",
    );

    await fetchList();
    closeForm();
  } catch {
    showToast("Error saving admin", "error");
  } finally {
    isLoading.value = false;
  }
};

// ---------------- DELETE ----------------
const deleteItem = (id) => {
  deleteId.value = id;
  confirmDeleteModal.value = true;
};

const cancelDelete = () => {
  confirmDeleteModal.value = false;
  deleteId.value = null;
};

const performDelete = async () => {
  if (!deleteId.value) return;

  isLoading.value = true;

  try {
    await $fetch(`${endpoint}/api/cits/lsu-offices/${deleteId.value}/delete/`, {
      method: "DELETE",
    });

    await fetchList();
    showToast("Admin deleted successfully", "success");
  } catch {
    showToast("Error deleting admin", "error");
  } finally {
    cancelDelete();
    isLoading.value = false;
  }
};

// ---------------- TOAST ----------------
const showToast = (message, type = "info", duration = 3000) => {
  const id = Date.now();

  toasts.value.push({
    id,
    message,
    type,
  });

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
};

onMounted(fetchList);
</script>

<template>
  <div
    class="min-h-screen"
    :class="darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
    <!-- HEADER -->
    <div class="lg:flex items-center w-full px-2 mb-2 space-y-2">
      <div class="w-full flex items-center">
        <div>
            <span class="text-lg font-semibold text-green-700 block mt-1">
          LSU Offices Management
        </span>
        <span class="text-gray-600 text-xs -mt-1 block"> Manage LSU employed admins </span>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="w-full relative">
        <i
          class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        ></i>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search admins..."
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200"
        />
      </div>

      <!-- ADD BUTTON -->
      <div class="lg:w-fit lg:pl-20 pr-2 flex items-center">
        <button
          @click="openForm()"
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 shadow-lg"
        >
          <i class="fa fa-plus"></i> Add
        </button>
      </div>
    </div>

    <!-- TABLE -->
    <div class="px-2">
      <!-- HEADER -->
      <div class="lg:flex hidden bg-gray-200 px-2 uppercase text-xs py-2">
        <div class="w-full">Full Name</div>

        <div class="w-full">Office</div>
        <div class="lg:w-3/12">Actions</div>
      </div>

      <!-- ROWS -->
      <div>
        <div
          v-for="(item, k) in filteredList"
          :key="k"
          class="lg:flex items-center rounded-xl shadow-sm hover:shadow-md text-xs px-2 border-b py-2"
          :class="k % 2 ? 'bg-white' : 'bg-gray-100'"
        >
          <div class="w-full">
          <div class="block font-bold">
              {{ item.fullname }}
          </div>
         <div class="block">
              {{ item.lsu_email }}
          </div>
          </div>

          <div class="w-full">
            <div class="block font-bold">
              {{ item.designation }}
            </div>
            <div class="block">{{ item.office_abbr }} | {{ item.office }}</div>
          </div>

          <div class="lg:w-3/12 flex gap-x-3">
            <button
              @click="openForm(item)"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <i class="fa fa-edit"></i>
            </button>

            <button
              @click="deleteItem(item.id)"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- FORM MODAL -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-lg p-6 rounded-xl">
        <h2 class="text-xl font-bold mb-4">
          {{ editingItem ? "Edit Admin" : "Create Admin" }}
        </h2>

        <div class="space-y-3">
          <input
            v-model="formData.fullname"
            placeholder="Full Name"
            class="w-full border p-3 rounded"
          />

          <input
            v-model="formData.designation"
            placeholder="Designation"
            class="w-full border p-3 rounded"
          />

          <input
            v-model="formData.lsu_email"
            placeholder="Email"
            class="w-full border p-3 rounded"
          />

          <input
            v-model="formData.office"
            placeholder="Office"
            class="w-full border p-3 rounded"
          />

          <input
            v-model="formData.office_abbr"
            placeholder="Office Abbreviation"
            class="w-full border p-3 rounded"
          />
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button
            @click="closeForm"
            class="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>

          <button
            @click="submitForm"
            class="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div
      v-if="confirmDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl max-w-md w-full">
        <h2 class="text-lg font-bold text-red-600 mb-3">Confirm Delete</h2>

        <p class="text-sm mb-6">Are you sure you want to delete this admin?</p>

        <div class="flex justify-end gap-3">
          <button
            @click="cancelDelete"
            class="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancel
          </button>

          <button
            @click="performDelete"
            class="px-4 py-2 bg-red-600 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-sm">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="{
          'bg-green-600 text-white': toast.type === 'success',
          'bg-red-600 text-white': toast.type === 'error',
          'bg-yellow-500 text-white': toast.type === 'warning',
          'bg-gray-600 text-white': toast.type === 'info',
        }"
        class="px-4 py-2 rounded shadow-lg"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>
