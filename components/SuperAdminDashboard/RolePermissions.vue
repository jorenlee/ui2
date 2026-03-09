
<script setup>
import { ref, onMounted, computed } from "vue";

const props = defineProps({ darkMode: Boolean });

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const listItems = ref([]);
const isLoading = ref(false);
const showForm = ref(false);
const editingItem = ref(null);
const searchQuery = ref("");

const formData = ref({
  email: "",
  role_filter_permissions: [],
});

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

const fetchList = async () => {
  isLoading.value = true;
  try {
    listItems.value = await $fetch(
      endpoint.value + "/cits/role-permissions/list/"
    );
  } catch (error) {
    console.error("Error fetching role permissions:", error);
  } finally {
    isLoading.value = false;
  }
};

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return listItems.value;

  const query = searchQuery.value.toLowerCase();

  return listItems.value.filter(
    (item) =>
      item.email?.toLowerCase().includes(query) ||
      item.role_filter_permissions?.some((role) =>
        role.toLowerCase().includes(query)
      )
  );
});

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

const closeForm = () => {
  showForm.value = false;
  editingItem.value = null;

  formData.value = {
    email: "",
    role_filter_permissions: [],
  };
};

const toggleRole = (role) => {
  const index = formData.value.role_filter_permissions.indexOf(role);

  if (index > -1) {
    formData.value.role_filter_permissions.splice(index, 1);
  } else {
    formData.value.role_filter_permissions.push(role);
  }
};

const submitForm = async () => {
  isLoading.value = true;

  try {
    if (editingItem.value) {
      await $fetch(
        endpoint.value +
          `/cits/role-permissions/${editingItem.value.id}/edit/`,
        {
          method: "PUT",
          body: formData.value,
        }
      );
    } else {
      await $fetch(endpoint.value + "/cits/role-permissions/create/", {
        method: "POST",
        body: formData.value,
      });
    }

    await fetchList();
    closeForm();
  } catch (error) {
    console.error("Error saving role permission:", error);
  } finally {
    isLoading.value = false;
  }
};

const deleteItem = async (id) => {
  if (!confirm("Are you sure you want to delete this role permission?"))
    return;

  isLoading.value = true;

  try {
    await $fetch(
      endpoint.value + `/cits/role-permissions/${id}/delete/`,
      {
        method: "DELETE",
      }
    );

    await fetchList();
  } catch (error) {
    console.error("Error deleting role permission:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchList);
</script>

<template>
  <div
    class="p-6"
    :class="darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-900'"
  >
    <!-- Header -->
    <div
      class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div>
        <h1
          class="text-3xl font-bold"
          :class="darkMode ? 'text-green-400' : 'text-green-700'"
        >
          Role Permissions Management
        </h1>

        <p
          class="text-sm mt-1"
          :class="darkMode ? 'text-gray-400' : 'text-gray-600'"
        >
          Manage user roles and permissions
        </p>
      </div>

      <button
        @click="openForm()"
        class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg"
      >
        <i class="fa fa-plus"></i>
        Add New Role
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative max-w-md">
        <i
          class="fa fa-search absolute left-4 top-1/2 transform -translate-y-1/2"
          :class="darkMode ? 'text-gray-500' : 'text-gray-400'"
        ></i>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by email or role..."
          class="w-full pl-11 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          :class="
            darkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500'
              : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
          "
        />
      </div>
    </div>

    <!-- Header Row -->
    <div
      class="grid grid-cols-12 font-semibold px-6 py-3 rounded-xl mb-3"
      :class="darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'"
    >
      <div class="col-span-3">Email</div>
      <div class="col-span-4">Roles</div>
      <div class="col-span-3">Created / Updated</div>
      <div class="col-span-2 text-right">Actions</div>
    </div>

    <!-- Role Rows -->
    <div class="space-y-3">

      <div
        v-for="item in filteredList"
        :key="item.id"
        class="grid grid-cols-12 items-center px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition"
        :class="darkMode ? 'bg-gray-800' : 'bg-white'"
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
          <div>
            <span class="font-semibold">Created:</span>
            {{ formatDate(item.created_at) }}
          </div>

          <div>
            <span class="font-semibold">Updated:</span>
            {{ formatDate(item.updated_at) }}
          </div>
        </div>

        <div class="col-span-2 flex justify-end gap-2">
          <button
            @click="openForm(item)"
            class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <i class="fa fa-edit mr-1"></i> Edit
          </button>

          <button
            @click="deleteItem(item.id)"
            class="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <i class="fa fa-trash mr-1"></i> Delete
          </button>
        </div>
      </div>

      <div
        v-if="filteredList.length === 0"
        class="text-center py-12 rounded-xl"
        :class="darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'"
      >
        No role permissions found
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showForm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div
        class="w-full max-w-lg p-6 rounded-xl"
        :class="darkMode ? 'bg-gray-800' : 'bg-white'"
      >
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
                class="flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  :checked="formData.role_filter_permissions.includes(role.value)"
                  @change="toggleRole(role.value)"
                />
                {{ role.label }}
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
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
  </div>
</template>
