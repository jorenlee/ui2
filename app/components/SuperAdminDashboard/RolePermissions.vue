<script setup>
import { ref, onMounted, computed } from "vue";

// ---------------- CONFIG ----------------
const props = defineProps({
  darkMode: Boolean,
  rolePermissions: Array,
});
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

const defaultForm = {
  email: "",
  role_filter_permissions: [],
  updated_at: "",
};

const formData = ref({ ...defaultForm });

// ---------------- ROLES ----------------
// Every menu group in the dashboard is now default-deny: it only appears
// for a user once the matching role below has been granted here. This list
// must stay in sync with the `allowedRole` values used in the dashboard's
// subMenuList, or a group can never be granted to anyone.
const availableRoles = [
  "Super Admin",
  "NPCC Menu",
  "OCH Admin",
  "Content Writer",
  "HR Menu",
  "Library Menu",
  "Registrar Menu",
  "Campus Pass Admin",
  "DRS Admin",
  "Animo Run",
  "Commission on Election",
  "External Links",
  "General Services Office",
  "IT Services Feedback",
  "Lasalle Alumni Association",
  "Open Educational Resources",
  "Safety and Security Center",
  "Juris Doctor Admin",
  "Juris Doctor Examinee",
].map((r) => ({ value: r, label: r }));

// ---------------- FETCH ----------------
const fetchList = async () => {
  isLoading.value = true;
  try {
    listItems.value = await $fetch(
      `${endpoint}/api/cits/role-permissions/list/`,
    );
  } catch (e) {
    showToast("Error fetching role permissions", "error");
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
      i.email?.toLowerCase().includes(q) ||
      i.role_filter_permissions?.some((r) => r.toLowerCase().includes(q)),
  );
});

// ---------------- HELPERS ----------------
const resetForm = () => {
  formData.value = { ...defaultForm };
  editingItem.value = null;
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// ---------------- FORM ----------------
const openForm = (item = null) => {
  editingItem.value = item;
  formData.value = item
    ? {
        email: item.email,
        role_filter_permissions: [...item.role_filter_permissions],
      }
    : { ...defaultForm };

  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
};

// ---------------- ROLE TOGGLE ----------------
const toggleRole = (role) => {
  const roles = formData.value.role_filter_permissions;
  roles.includes(role)
    ? (formData.value.role_filter_permissions = roles.filter((r) => r !== role))
    : roles.push(role);
};

// ---------------- SAVE ----------------
const submitForm = async () => {
  if (!formData.value.email.trim())
    return showToast("Email cannot be empty", "warning");

  formData.value.updated_at = new Date().toString();
  isLoading.value = true;

  const url = editingItem.value
    ? `${endpoint}/api/cits/role-permissions/${editingItem.value.id}/edit/`
    : `${endpoint}/api/cits/role-permissions/create/`;

  const method = editingItem.value ? "PUT" : "POST";

  try {
    await $fetch(url, { method, body: formData.value });

    showToast(
      `Role permission ${editingItem.value ? "updated" : "created"} successfully`,
      "success",
    );

    await fetchList();
    closeForm();
  } catch (e) {
    showToast("Error saving role permission", "error");
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
    await $fetch(
      `${endpoint}/api/cits/role-permissions/${deleteId.value}/delete/`,
      { method: "DELETE" },
    );

    await fetchList();
    showToast("Role permission deleted", "success");
  } catch {
    showToast("Error deleting role permission", "error");
  } finally {
    cancelDelete();
    isLoading.value = false;
  }
};

// ---------------- TOAST ----------------
const showToast = (message, type = "info", duration = 3000) => {
  const id = Date.now();
  toasts.value.push({ id, message, type });

  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, duration);
};

// ---------------- MOUNT ----------------
onMounted(async () => {
  if (props.rolePermissions && props.rolePermissions.length > 0) {
    listItems.value = props.rolePermissions;
  } else {
    await fetchList();
  }
});
</script>

<template>
  <div
    class="min-h-screen"
    :class="darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
    <!-- HEADER -->
    <div class="lg:flex items-center w-full px-2 mb-2 space-y-2">
      <div class="w-full">
        <p class="text-lg font-semibold text-green-700 lg:whitespace-nowrap">
          Role Permissions Management
        </p>
        <span class="text-gray-600 text-xs -mt-1 flex"
          >Manage user roles and permissions</span
        >
      </div>

      <!-- SEARCH -->
      <div class="w-full relative">
        <i
          class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        ></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by email or role..."
          class="w-full pl-10 pr-4 lg:py-2 py-1 rounded-xl border border-gray-200"
        />
      </div>

      <div class="lg:w-fit lg:pl-20 pr-2 flex items-center">
        <button
          @click="openForm()"
          class="px-6 lg:py-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 shadow-lg"
        >
          <i class="fa fa-plus"></i> Add
        </button>
      </div>
    </div>

    <div class="px-2">
      <!-- TABLE HEADER -->
      <div class="lg:flex hidden bg-gray-200 px-2 uppercase text-xs py-2">
        <div class="w-full">Email</div>
        <div class="w-full">Roles</div>
        <div class="w-full whitespace-nowrap">Created / Updated</div>
        <div class="lg:w-3/12">Actions</div>
      </div>

      <!-- ROWS -->
      <div class="">
        <div
          v-for="(item, k) in filteredList"
          :key="k"
          class="lg:flex items-center rounded-xl shadow-sm hover:shadow-md text-xs px-2 border-b py-1"
          :class="k % 2 ? 'bg-white' : 'bg-gray-100'"
        >
          <div class="w-full">
            {{ item.email }}
          </div>

          <div class="w-full">
            <span
              v-for="role in item.role_filter_permissions"
              :key="role"
              class="px-2 text-[10px] rounded-lg bg-green-600 text-white"
            >
              {{ role }}
            </span>
          </div>

          <div class="w-full text-[10px]">
            <div>Created: {{ formatDate(item.created_at) }}</div>
            <div>Updated: {{ formatDate(item.updated_at) }}</div>
          </div>

          <div class="lg:w-3/12 flex gap-x-3">
            <button
              @click="openForm(item)"
              class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
            >
              <i class="fa fa-edit"></i>
            </button>

            <button
              @click="deleteItem(item.id)"
              class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
            >
              <i class="fa fa-trash"></i>
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
            {{
              editingItem ? "Edit Role Permission" : "Create Role Permission"
            }}
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
          <h2
            class="text-lg font-bold text-red-600 mb-3 flex items-center gap-2"
          >
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
  </div>
</template>