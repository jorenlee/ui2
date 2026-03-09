<script setup>
import { ref, onMounted, computed } from "vue";

// Props
const props = defineProps({ darkMode: Boolean });

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

// Data
const listItems = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingItem = ref(null);
const searchQuery = ref("");

// DELETE MODAL
const confirmDeleteModal = ref(false);
const deleteId = ref(null);

// Toasts
const toasts = ref([]);

// Form Data
const formData = ref({
  email: "",
  role_filter_permissions: [],
  updated_at: "",
});

// Available Roles
const availableRoles = [
  { value: "Super Admin", label: "Super Admin" },
  { value: "NPCC Menu", label: "NPCC Menu" },
  { value: "OCH Admin", label: "OCH Admin" },
  { value: "Content Writer", label: "Content Writer" },
  { value: "HR Menu", label: "HR Menu" },
  { value: "Library Menu", label: "Library Menu" },
  { value: "Registrar Menu", label: "Registrar Menu" },
  { value: "Campus Pass Admin", label: "Campus Pass Admin" },
  { value: "DRS Admin", label: "DRS Admin" },
];

// ------------------ Fetch List ------------------
const fetchList = async () => {
  isLoading.value = true;
  try {
    listItems.value = await $fetch(
      endpoint.value + "/api/cits/role-permissions/list/",
    );
  } catch (error) {
    showToast("Error fetching role permissions", "error");
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// ------------------ Filtered List ------------------
const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return listItems.value;

  const query = searchQuery.value.toLowerCase();
  return listItems.value.filter(
    (item) =>
      item.email?.toLowerCase().includes(query) ||
      item.role_filter_permissions?.some((role) =>
        role.toLowerCase().includes(query),
      ),
  );
});

// ------------------ Format Date ------------------
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ------------------ Open Form ------------------
const openForm = (item = null) => {
  if (item) {
    editingItem.value = item;
    formData.value = {
      email: item.email,
      role_filter_permissions: [...item.role_filter_permissions],
    };
  } else {
    editingItem.value = null;
    formData.value = {
      email: "",
      role_filter_permissions: [],
    };
  }
  showForm.value = true;
};

// ------------------ Close Form ------------------
const closeForm = () => {
  showForm.value = false;
  editingItem.value = null;
  formData.value = {
    email: "",
    role_filter_permissions: [],
  };
};

// ------------------ Toggle Role ------------------
const toggleRole = (role) => {
  const index = formData.value.role_filter_permissions.indexOf(role);
  if (index > -1) formData.value.role_filter_permissions.splice(index, 1);
  else formData.value.role_filter_permissions.push(role);
};

// ------------------ Submit Form ------------------
const submitForm = async () => {
  if (!formData.value.email.trim()) {
    showToast("Email cannot be empty", "warning");
    return;
  }

  // Refresh updated_at in realtime and convert to simple string
  formData.value.updated_at = new Date().toString();

  isLoading.value = true;

  try {
    if (editingItem.value) {
      await $fetch(
        endpoint.value +
          `/api/cits/role-permissions/${editingItem.value.id}/edit/`,
        {
          method: "PUT",
          body: formData.value,
        }
      );

      showToast("Role permission updated successfully", "success");
    } else {
      await $fetch(endpoint.value + "/api/cits/role-permissions/create/", {
        method: "POST",
        body: formData.value,
      });

      showToast("Role permission created successfully", "success");
    }

    await fetchList();
    closeForm();

  } catch (error) {
    console.error(error);
    showToast("Error saving role permission", "error");

  } finally {
    isLoading.value = false;
  }
};

// ------------------ Open Delete Modal ------------------
const deleteItem = (id) => {
  deleteId.value = id;
  confirmDeleteModal.value = true;
};

// ------------------ Cancel Delete ------------------
const cancelDelete = () => {
  confirmDeleteModal.value = false;
  deleteId.value = null;
};

// ------------------ Confirm Delete ------------------
const performDelete = async () => {
  if (!deleteId.value) return;

  isLoading.value = true;
  try {
    await $fetch(
      endpoint.value + `/api/cits/role-permissions/${deleteId.value}/delete/`,
      {
        method: "DELETE",
      },
    );

    await fetchList();
    showToast("Role permission deleted", "success");
  } catch (error) {
    console.error(error);
    showToast("Error deleting role permission", "error");
  } finally {
    confirmDeleteModal.value = false;
    deleteId.value = null;
    isLoading.value = false;
  }
};

// ------------------ Toast Helper ------------------
const showToast = (message, type = "info", duration = 3000) => {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
};

onMounted(fetchList);
</script>

<template>
  <div
    class="p-4 sm:p-6 min-h-screen"
    :class="darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
    <!-- HEADER -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-green-700">
          Role Permissions Management
        </h1>
        <p class="text-gray-600 text-sm">Manage user roles and permissions</p>
      </div>

      <button
        @click="openForm()"
        class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg"
      >
        <i class="fa fa-plus"></i> Add
      </button>
    </div>

    <!-- SEARCH -->
    <div class="mb-6 max-w-md relative">
      <i
        class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      ></i>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by email or role..."
        class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200"
      />
    </div>

    <!-- TABLE HEADER -->
    <div
      class="lg:grid grid-cols-12 text-sm font-semibold px-6 py-3 rounded-xl mb-2 bg-gray-200"
    >
      <div class="col-span-3">Email</div>
      <div class="col-span-4">Roles</div>
      <div class="col-span-3">Created / Updated</div>
      <div class="col-span-2 text-right">Actions</div>
    </div>

    <!-- ROWS -->
    <div class="space-y-3">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="lg:grid grid-cols-12 gap-4 items-center px-6 py-4 bg-white rounded-xl shadow-sm hover:shadow-md"
      >
        <div class="col-span-3 font-medium break-all">
          {{ item.email }}
        </div>

        <div class="col-span-4 flex flex-wrap gap-2">
          <span
            v-for="role in item.role_filter_permissions"
            :key="role"
            class="px-2 py-1 text-xs rounded-lg bg-green-600 text-white"
          >
            {{ role }}
          </span>
        </div>

        <div class="col-span-3 text-sm space-y-1">
          <div><b>Created:</b> {{ formatDate(item.created_at) }}</div>
          <div><b>Updated:</b> {{ formatDate(item.updated_at) }}</div>
        </div>

        <div class="col-span-2 flex justify-end gap-2">
          <button
            @click="openForm(item)"
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
          >
            <i class="fa fa-edit"></i> Edit
          </button>

          <button
            @click="deleteItem(item.id)"
            class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
          >
            <i class="fa fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white w-full max-w-lg p-6 rounded-xl">
        <h2 class="text-xl font-bold mb-4">
          {{ editingItem ? "Edit Role Permission" : "Create Role Permission" }}
        </h2>

        <div class="space-y-4">
          <input
            v-model="formData.email"
            type="email"
            placeholder="User Email"
            class="w-full border p-3 rounded"
          />

          <div>
            <p class="font-semibold mb-2">Select Roles</p>

            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="role in availableRoles"
                :key="role.value"
                class="lg:flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  :checked="
                    formData.role_filter_permissions.includes(role.value)
                  "
                  @change="toggleRole(role.value)"
                />
                {{ role.label }}
              </label>
            </div>
          </div>
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

    <!-- DELETE CONFIRM MODAL -->
    <div
      v-if="confirmDeleteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-xl max-w-md w-full">
        <h2 class="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
          <i class="fa fa-exclamation-triangle"></i>
          Confirm Delete
        </h2>

        <p class="text-sm mb-6">
          Are you sure you want to delete this role permission? This action
          cannot be undone.
        </p>

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

    <!-- TOASTS -->
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
