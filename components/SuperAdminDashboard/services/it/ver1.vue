<template>
  <div class="p-6">
    <h2 class="text-xl font-bold mb-4">NPCC Tech Support</h2>

    <!-- ACTION BAR -->
    <div class="flex flex-wrap gap-3 items-center mb-4">
      <select v-model="statusFilter" class="input w-auto">
        <option value="">All Status</option>
        <option>New</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>

      <button
        class="ml-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        @click="openCreateModal"
      >
        + Walk-in Ticket
      </button>
    </div>

    <!-- TABLE HEADER -->
    <div class="hidden md:grid grid-cols-11 bg-gray-100 border text-xs font-semibold">
      <div class="p-2 border">Ticket</div>
      <div class="p-2 border">Tech Type</div>
      <div class="p-2 border">Hardware</div>
      <div class="p-2 border">Email</div>
      <div class="p-2 border">Office</div>
      <div class="p-2 border">Device</div>
      <div class="p-2 border">Issue</div>
      <div class="p-2 border">Software</div>
      <div class="p-2 border">Technician</div>
      <div class="p-2 border">Status</div>
      <div class="p-2 border">Created</div>
    </div>


                  <!-- <div class="w-full flex gap-x-2">
                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5">Date Checked</label>
                  <input
                    type="text"
                    v-model="item.date_checked"
                    class="input rounded border p-2 w-full"
                    placeholder="DD/MM/YYYY hh:mm AM/PM"
                  />
                </div>

                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5">Status</label>
                  <select
                    v-model="item.status"
                    class="input rounded border p-2 w-full"
                  >
                    <option disabled value="">Select Status</option>
                    <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">
                      {{ s }}
                    </option>
                    <option value="OTHER">Other / Custom</option>
                  </select>

                  <input
                    v-if="item.status === 'OTHER'"
                    v-model="item.custom_status"
                    class="input rounded border p-2 w-full mt-1"
                    placeholder="Enter custom status"
                  />
                </div>
              </div> -->

    <!-- TABLE ROWS -->
    <div
      v-for="item in filteredRequests"
      :key="item.id"
      class="border md:grid md:grid-cols-11 text-sm hover:bg-gray-50 cursor-pointer"
      @click="openModal(item)"
    >
      <div class="p-2 border font-semibold">{{ item.ticket_id }}</div>
      <div class="p-2 border">{{ item.tech_type }}</div>
      <div class="p-2 border">{{ item.device_hardware }}</div>
      <div class="p-2 border break-all">{{ item.lsu_email }}</div>
      <div class="p-2 border">{{ item.center_office_room }}</div>
      <div class="p-2 border">{{ item.office_device }}</div>
      <div class="p-2 border truncate">{{ item.issue }}</div>
      <div class="p-2 border">{{ item.software || "-" }}</div>
      <div class="p-2 border">{{ item.technician_assigned || "-" }}</div>

      <div class="p-2 border">
        <span
          v-if="latestStatus(item)"
          class="px-2 py-1 rounded text-xs font-semibold"
          :class="statusClass(latestStatus(item).status)"
        >
          {{ latestStatus(item).status }}
        </span>
      </div>

      <div class="p-2 border text-xs">
        {{ formatDate(item.created_at) }}
      </div>
    </div>

    <div v-if="!filteredRequests.length" class="text-center py-6 text-gray-500">
      No records found
    </div>






















    

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
        <h3 class="text-lg font-bold mb-4">
          {{ isCreate ? "Create Walk-in Ticket" : "Ticket Details" }}
        </h3>

        <!-- FORM -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <input v-model="info.ticket_id" class="input" disabled />
          <input v-model="info.lsu_email" class="input" placeholder="LSU Email" />

          <!-- OFFICE -->
          <select v-model="info.center_office_room" class="input">
            <option disabled value="">Select Office</option>
            <option>OCH</option>
            <option>NPCC</option>
            <option>Registrar</option>
            <option>+ Other</option>
          </select>

          <!-- OTHER OFFICE -->
          <input
            v-if="info.center_office_room === '+ Other'"
            v-model="info.custom_office"
            class="input"
            placeholder="Enter Office Name"
          />

          <input v-model="info.office_device" class="input" placeholder="Office Device" />

          <select v-model="info.tech_type" class="input">
            <option disabled value="">Select Tech Type</option>
            <option>Device / Hardware</option>
            <option>Apps / Software</option>
            <option>Materials</option>
            <option>User Account</option>
            <option>Internet</option>
          </select>

  

          <select v-model="info.technician_assigned" class="input">
            <option disabled value="">Assign Technician</option>
            <option>Denzel Roy Suarez</option>
            <option>Rommel Rosal</option>
            <option>Jason Yap</option>
            <option>Flourence John Gonzaga</option>
            <option>Giovanni Morales</option>
          </select>

<div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
  <!-- TYPE -->
  <div>
    <label class="block text-sm font-semibold mb-2">Type</label>
    <div class="flex items-center gap-4">
      <label class="flex items-center gap-2">
        <input type="radio" value="Hardware" v-model="info.tech_type" />
        Hardware
      </label>
      <label class="flex items-center gap-2">
        <input type="radio" value="Software" v-model="info.tech_type" />
        Software
      </label>
    </div>
  </div>

 <div>
   <!-- DETAILS -->
  <input
    v-model="info.device_hardware"
    class="input"
    placeholder="Specify hardware or software name"
  />
 </div>
</div>


          <textarea
            v-model="info.issue"
            class="input md:col-span-2"
            placeholder="Issue Description"
          />
        </div>

        <!-- STATUS -->
        <div class="mt-4">
          <h4 class="font-semibold mb-2">
            {{ isCreate ? "Initial Status" : "Add Status Update" }}
          </h4>

          <select v-model="newStatus" class="input mb-2">
            <option disabled value="">Select Status</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>

          <textarea v-model="newRemarks" class="input" placeholder="Remarks" />

          <button
            class="mt-2 bg-green-600 text-white px-3 py-2 rounded"
            @click="addStatus"
          >
            {{ isCreate ? "Set Status" : "Add Status" }}
          </button>
        </div>

        <!-- MATERIAL REQUESTS -->
        <div class="mt-4">
          <h4 class="font-semibold mb-2">Material Requests</h4>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-end">
            <input v-model="newMaterial.name" class="input" placeholder="Item Name" />
            <input v-model="newMaterial.number_of_items" class="input" placeholder="Qty" />
            <input v-model="newMaterial.details" class="input" placeholder="Details" />

            <button
              class="bg-purple-600 text-white px-3 py-2 rounded"
              @click="addMaterial"
            >
              Add Material
            </button>
          </div>

          <div v-if="info.material_request.length" class="space-y-2">
            <div
              v-for="(mat, i) in info.material_request"
              :key="i"
              class="p-3 border rounded text-sm flex justify-between"
            >
              <div>
                <div class="font-semibold">
                  {{ mat.name }} ({{ mat.number_of_items }})
                </div>
                <div class="italic text-gray-700">{{ mat.details }}</div>
              </div>
              <button class="text-red-600" @click="removeMaterial(i)">Remove</button>
            </div>
          </div>

          <div v-else class="text-gray-400 text-sm">No materials requested</div>
        </div>

        <!-- LOGS -->
        <div v-if="!isCreate" class="mt-5">
          <h4 class="font-semibold mb-2">Status History</h4>

          <div
            v-for="(log, i) in info.logs"
            :key="i"
            class="p-3 mb-2 rounded text-xs"
            :class="statusClass(log.status)"
          >
            <div class="flex justify-between font-semibold">
              <span>{{ log.status }}</span>
              <span>{{ formatDate(log.timestamp) }}</span>
            </div>
            <div class="italic">{{ log.remarks }}</div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-end gap-3 mt-6">
          <button class="px-4 py-2 bg-gray-300 rounded" @click="closeModal">
            Cancel
          </button>

          <button
            class="px-4 py-2 bg-blue-600 text-white rounded"
            @click="isCreate ? createTicket() : saveChanges()"
          >
            {{ isCreate ? "Create" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import moment from "moment";

const API = "/api/cits/tech-support/";

const requests = ref([]);
const showModal = ref(false);
const isCreate = ref(false);
const statusFilter = ref("");

const info = ref({
  id: null,
  ticket_id: "TID" + moment().valueOf(),
  lsu_email: "",
  center_office_room: "",
  custom_office: "",
  office_device: "",
  tech_type: "",
  device_hardware: "",
  technician_assigned: "",
  software: "",
  issue: "",
  logs: [],
  material_request: [],
});

const newStatus = ref("");
const newRemarks = ref("");

const newMaterial = ref({
  name: "",
  number_of_items: "",
  details: "",
});

onMounted(fetchRequests);

async function fetchRequests() {
  const res = await axios.get(`${API}list/`);
  requests.value = res.data;
}

const normalizeOffice = () => {
  if (info.value.center_office_room === "+ Other") {
    info.value.center_office_room =
      info.value.custom_office || "Other";
  }
};

const openCreateModal = () => {
  isCreate.value = true;
  info.value = {
    id: null,
    ticket_id: "TID" + Date.now(),
    lsu_email: "",
    center_office_room: "",
    custom_office: "",
    office_device: "",
    tech_type: "",
    device_hardware: "",
    technician_assigned: "",
    software: "",
    issue: "",
    logs: [],
    material_request: [],
  };
  showModal.value = true;
};

const openModal = (item) => {
  isCreate.value = false;
  info.value = JSON.parse(JSON.stringify(item));
  if (!info.value.logs) info.value.logs = [];
  if (!info.value.material_request) info.value.material_request = [];
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  newStatus.value = "";
  newRemarks.value = "";
  newMaterial.value = { name: "", number_of_items: "", details: "" };
};

const addStatus = () => {
  if (!newStatus.value) return;
  info.value.logs.push({
    status: newStatus.value,
    remarks: newRemarks.value,
    timestamp: new Date().toISOString(),
  });
  newStatus.value = "";
  newRemarks.value = "";
};

const addMaterial = () => {
  if (!newMaterial.value.name) return;
  info.value.material_request.push({ ...newMaterial.value });
  newMaterial.value = { name: "", number_of_items: "", details: "" };
};

const removeMaterial = (i) => {
  info.value.material_request.splice(i, 1);
};

const createTicket = async () => {
  normalizeOffice();
  await axios.post(`${API}create/`, info.value);
  await fetchRequests();
  closeModal();
};

const saveChanges = async () => {
  normalizeOffice();
  await axios.patch(`${API}${info.value.id}/edit/`, info.value);
  await fetchRequests();
  closeModal();
};

const latestStatus = (item) =>
  item.logs?.length ? item.logs[item.logs.length - 1] : null;

const filteredRequests = computed(() =>
  [...requests.value]
    .filter((r) =>
      statusFilter.value
        ? latestStatus(r)?.status === statusFilter.value
        : true
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
);

const formatDate = (d) => new Date(d).toLocaleString();

const statusClass = (status = "") => {
  switch (status.toLowerCase()) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "in progress":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
</script>

<style scoped>
.input {
  @apply border rounded px-3 py-2 text-sm w-full;
}
</style>
