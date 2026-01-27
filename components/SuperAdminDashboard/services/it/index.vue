<template>
  <div class="lg:p-6 text-sm">
    <h2 class="text-xl font-bold mb-4">NPCC Tech Support & IT Services</h2>

    <!-- ACTION BAR -->
    <div class="bg-white border rounded-lg p-4 mb-4 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <!-- Status Filter -->
        <div>
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Status</label
          >
          <select
            v-model="statusFilter"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <!-- Technician Filter -->
        <div>
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Technician</label
          >
          <select
            v-model="technicianFilter"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Technicians</option>
            <option
              v-for="tech in TECHNICIANS_PERSONNEL"
              :key="tech"
              :value="tech"
            >
              {{ tech }}
            </option>
          </select>
        </div>

        <!-- Search Filter -->
        <div>
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Search</label
          >
          <input
            v-model="searchFilter"
            type="text"
            placeholder="Ticket ID, Name, Email..."
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          />
        </div>

        <!-- Date Range Filter -->
        <div>
          <label class="text-xs font-semibold text-gray-700 mb-1 block"
            >Date Range</label
          >
          <select
            v-model="dateFilter"
            class="input w-full rounded p-2 text-xs border shadow-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      <div class="flex justify-between items-center">
        <button
          @click="clearFilters"
          class="text-xs text-gray-600 hover:text-gray-800 underline"
        >
          Clear Filters
        </button>
        <button
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap text-sm font-semibold shadow-sm"
          @click="openCreateModal"
        >
          <i class="fa fa-plus mr-1"></i> Walk-in Ticket
        </button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="mb-3 text-sm text-gray-600 font-semibold">
      Showing {{ filteredRequests.length }} of {{ requests.length }} ticket(s)
    </div>

    <!-- ================= DATE LIST TABLE HEADER ================= -->
    <div class="w-full lg:grid hidden grid-cols-7 bg-gradient-to-r from-green-700 to-green-600 rounded-t-lg shadow-md overflow-hidden">
      <div class="text-center p-3 text-white font-bold text-sm border-r border-green-500">
        <i class="fa fa-ticket mr-1"></i> Ticket ID
      </div>
      <div class="text-center p-3 text-white font-bold text-sm border-r border-green-500">
        <i class="fa fa-user mr-1"></i> Full Name
      </div>
      <div class="text-center p-3 text-white font-bold text-sm border-r border-green-500">
        <i class="fa fa-envelope mr-1"></i> LSU Email
      </div>
      <div class="text-center p-3 text-white font-bold text-sm border-r border-green-500">
        <i class="fa fa-users mr-1"></i> Personnel
      </div>
      <div class="text-center p-3 text-white font-bold text-sm border-r border-green-500">
        <i class="fa fa-info-circle mr-1"></i> Status
      </div>
      <div class="text-center p-3 text-white font-bold text-sm border-r border-green-500">
        <i class="fa fa-calendar mr-1"></i> Created
      </div>
      <div class="text-center p-3 text-white font-bold text-sm">
        <i class="fa fa-cog mr-1"></i> Action
      </div>
    </div>

    <!-- Toaster -->
    <transition name="fade">
      <div
        v-if="toaster.show"
        class="fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl text-white font-medium flex items-center gap-3 max-w-md"
        :class="{
          'bg-green-600': toaster.type === 'success',
          'bg-red-600': toaster.type === 'error',
          'bg-blue-600': toaster.type === 'info',
          'bg-yellow-600': toaster.type === 'warning',
        }"
      >
        <i
          class="fa text-xl"
          :class="{
            'fa-check-circle': toaster.type === 'success',
            'fa-exclamation-circle': toaster.type === 'error',
            'fa-info-circle': toaster.type === 'info',
            'fa-exclamation-triangle': toaster.type === 'warning',
          }"
        ></i>
        <span>{{ toaster.message }}</span>
      </div>
    </transition>

    <!-- ================= LOADING STATE ================= -->
    <div v-if="loading" class="space-y-2 mt-2">
      <!-- Desktop Skeleton -->
      <div
        v-for="i in 6"
        :key="'desk-' + i"
        class="hidden lg:grid grid-cols-7 gap-2 bg-white p-3 rounded animate-pulse"
      >
        <div v-for="j in 7" :key="j" class="h-4 bg-gray-200 rounded"></div>
      </div>

      <!-- Mobile Skeleton -->
      <div
        v-for="i in 4"
        :key="'mob-' + i"
        class="lg:hidden border-b p-4 space-y-2 animate-pulse"
      >
        <div class="flex justify-between">
          <div class="h-4 w-20 bg-gray-200 rounded"></div>
          <div class="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div class="h-4 w-32 bg-gray-200 rounded"></div>
        <div class="h-3 w-40 bg-gray-200 rounded"></div>
        <div class="h-3 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>

    <!-- ================= DATA LIST ================= -->
    <div v-else>
      <div v-for="(item, index) in filteredRequests" :key="item.id">
        <!-- ================= DESKTOP ROW ================= -->
        <div
          class="hidden lg:grid grid-cols-7 items-center text-sm cursor-pointer hover:bg-gray-100 border"
          :class="index % 2 === 0 ? 'bg-white' : 'bg-gray-50'"
          @click="openModal(item)"
        >
          <div class="p-3 text-center font-semibold">
            {{ item.ticket_id }}
          </div>

          <div class="p-3 text-center">
            {{ item.requestor_fullname }}
          </div>

          <div class="p-3 text-center text-xs">
            {{ item.requestor_lsu_email }}
          </div>

          <div class="p-3 text-center text-xs">
            {{ item.technicians_assigned?.join(", ") || "-" }}
          </div>

          <div class="p-3 text-center">
            <span
              class="px-2 py-1 rounded text-xs font-semibold"
              :class="ticketStatusClass(latestStatus(item)?.status)"
            >
              {{ latestStatus(item)?.status || "-" }}
            </span>
          </div>

          <div class="p-3 text-center text-xs">
            {{ moment(item.created_at).format("MMM DD, YYYY hh:mm A") }}
          </div>

          <div class="p-3 text-center">
            <span
              class="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-800"
            >
              Edit / View
            </span>
          </div>
        </div>

        <!-- ================= MOBILE CARD ================= -->
        <div
          class="lg:hidden border p-4 space-y-2 hover:bg-gray-50 cursor-pointer"
          @click="openModal(item)"
        >
          <div class="flex justify-between items-center">
            <span class="font-bold text-sm">
              {{ item.ticket_id }}
            </span>

            <span
              class="px-2 py-1 rounded text-xs font-semibold"
              :class="ticketStatusClass(latestStatus(item)?.status)"
            >
              {{ latestStatus(item)?.status || "-" }}
            </span>
          </div>

          <div>
            <p class="text-sm font-semibold">
              {{ item.requestor_fullname }}
            </p>
            <p class="text-xs text-gray-600">
              {{ item.requestor_lsu_email }}
            </p>
          </div>

          <div class="text-xs text-gray-700">
            <span class="font-semibold">Technician:</span>
            {{ item.technicians_assigned?.join(", ") || "—" }}
          </div>

          <div class="flex justify-between items-center pt-2">
            <span class="text-xs text-gray-500">
              {{ moment(item.created_at).format("MMM DD, YYYY hh:mm A") }}
            </span>

            <span
              class="bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold"
            >
              Edit / View
            </span>
          </div>
        </div>
      </div>

      <!-- EMPTY -->
      <div
        v-if="!filteredRequests.length"
        class="text-center py-6 text-gray-500"
      >
        No records found
      </div>
    </div>

    <!-- MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
    >
      <div
        class="bg-white w-full max-w-3xl rounded-lg p-6 max-h-[90vh] overflow-y-auto relative"
      >
        <!-- Loading Overlay -->
        <div
          v-if="modalLoading"
          class="absolute inset-0 bg-white/95 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm"
        >
          <div class="text-center bg-white p-8 rounded-lg shadow-2xl border-2 border-green-600">
            <div
              class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"
            ></div>
            <p class="mt-4 text-base font-bold text-gray-800">
              {{ isCreate ? "Creating ticket..." : "Saving changes..." }}
            </p>
            <p class="mt-1 text-xs text-gray-600">Please wait, processing your request...</p>
          </div>
        </div>

        <h3 class="text-lg font-bold mb-4 text-center w-full">
          {{ isCreate ? "Create Ticket (Job Request)" : "Ticket Details" }}
        </h3>

        <!-- BASIC INFO -->
        <div class="border rounded p-4 mb-4">
          <h4 class="font-semibold mb-2">Basic Information</h4>
          <div class="gap-3">
            <div class="lg:flex w-full gap-x-2 mb-4">
              <div class="w-full">
                <label class="text-sm font-semibold mb-1 block"
                  >Ticket ID</label
                >
                <input
                  v-model="info.ticket_id"
                  disabled
                  class="input w-full p-2 rounded border"
                />
              </div>

              <div class="w-full">
                <label class="text-sm font-semibold mb-1 block"
                  >Full Name / Requestor</label
                >
                <input
                  v-model="info.requestor_fullname"
                  placeholder="Full Name"
                  class="input w-full p-2 rounded border"
                />
              </div>

              <div class="w-full">
                <label class="text-sm font-semibold mb-1 block"
                  >Requestor LSU Email</label
                >
                <input
                  v-model="info.requestor_lsu_email"
                  placeholder="e.g johndoe@lsu.edu.ph"
                  class="input w-full p-2 rounded border"
                />
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="text-sm font-semibold mb-1 block"
                >Assigned Personnel / Technician / Resolved By</label
              >
              <div class="border rounded flex flex-wrap">
                <label
                  v-for="tech in TECHNICIANS_PERSONNEL"
                  :key="tech"
                  class="flex items-center gap-x-2 text-sm cursor-pointer lg:w-4/12 w-full whitespace-nowrap p-2 rounded leading-0 shadow"
                >
                  <input
                    type="checkbox"
                    :value="tech"
                    v-model="info.technicians_assigned"
                    class="accent-blue-600"
                  />
                  <span>{{ tech }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- ITEM REQUEST -->
        <div class="border rounded-lg p-4 mb-4 bg-gray-50">
          <h4 class="font-semibold mb-3">
            Material Use / Device / Hardware / Software
          </h4>

          <div
            v-for="(item, index) in info.item_request"
            :key="index"
            class="border rounded p-4 mb-4 bg-white"
          >
            <div class="flex justify-between items-center mb-2">
              <h5 class="font-semibold text-sm uppercase">
                Item #{{ index + 1 }}
              </h5>
              <button
                class="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-900 text-xs"
                @click.stop="removeItem(index)"
              >
                <i class="fa fa-trash text-xs"></i>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-x-2 text-sm">
              <!-- CATEGORY & NAME -->
              <div class="w-full flex gap-x-2">
                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5"
                    >Category <span class="text-red-600">*</span></label
                  >
                  <select
                    v-model="item.category_type"
                    class="input rounded border p-2 w-full"
                  >
                    <option disabled value="">Select Category</option>
                    <option
                      v-for="cat in CATEGORY_OPTIONS"
                      :key="cat"
                      :value="cat"
                    >
                      {{ cat }}
                    </option>
                  </select>
                </div>

                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5"
                    >Item Name <span class="text-red-600">*</span></label
                  >
                  <input
                    v-model="item.name"
                    class="input rounded border p-2 w-full"
                    placeholder="Item Name"
                  />
                </div>
              </div>

              <!-- OFFICE -->
              <div class="w-full mb-3">
                <label class="block font-semibold mb-0.5"
                  >Office / Room / Center / Location / Area
                  <span class="text-red-600">*</span></label
                >
                <div class="flex">
                  <select
                    v-model="item.center_office_room"
                    class="input border w-full p-2 rounded"
                  >
                    <option disabled value="">Select Location</option>
                    <option
                      v-for="office in CENTER_OFFICE_ROOM_OPTIONS"
                      :key="office"
                      :value="office"
                    >
                      {{ office }}
                    </option>
                  </select>

                  <input
                    v-if="info.center_office_room === 'OTHER'"
                    v-model="customOffice"
                    class="input rounded border ml-2 flex-1 p-2"
                    placeholder="Specific or Exact"
                  />
                </div>
              </div>

              <!-- ITEM TYPE & QUANTITY -->
              <div class="w-full flex gap-x-2">
                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5"
                    >Hardware Type</label
                  >
                  <select
                    v-model="item.item_type"
                    class="input rounded border p-2 w-full"
                  >
                    <option disabled value="">Select Item Type</option>
                    <option
                      v-for="type in ITEM_TYPE_OPTIONS"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>
                </div>

                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5">Quantity</label>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    placeholder="Quantity"
                    @input="item.quantity = Math.max(1, item.quantity)"
                    class="input rounded border p-2 w-full"
                  />
                </div>
              </div>

              <!-- SERIAL & STATUS -->
              <div class="w-full mb-3">
                <label class="block font-semibold mb-0.5">Serial / Code</label>
                <input
                  v-model="item.serial_number_code"
                  class="input rounded border p-2 w-full"
                  placeholder="Serial / Code"
                />
              </div>

              <div class="w-full flex gap-x-2">
                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5"
                    >Current Semester</label
                  >
                  <select
                    v-model="item.current_semester"
                    class="input rounded border p-2 w-full"
                  >
                    <option disabled value="">Select Semester</option>
                    <option
                      v-for="sem in SEMESTER_OPTIONS"
                      :key="sem"
                      :value="sem"
                    >
                      {{ sem }}
                    </option>
                    <option value="OTHER">Other / Custom</option>
                  </select>
                  <input
                    v-if="item.current_semester === 'OTHER'"
                    v-model="item.custom_semester"
                    class="input rounded border p-2 w-full mt-1"
                    placeholder="Enter semester"
                  />
                </div>

                <div class="w-full mb-3">
                  <label class="block font-semibold mb-0.5"
                    >Academic Year</label
                  >
                  <select
                    v-model="item.academic_year"
                    class="input rounded border p-2 w-full"
                  >
                    <option disabled value="">Select Academic Year</option>
                    <option
                      v-for="ay in ACADEMIC_YEAR_OPTIONS"
                      :key="ay"
                      :value="ay"
                    >
                      {{ ay }}
                    </option>
                    <option value="OTHER">Other / Custom</option>
                  </select>
                  <input
                    v-if="item.academic_year === 'OTHER'"
                    v-model="item.custom_academic_year"
                    class="input rounded border p-2 w-full mt-1"
                    placeholder="e.g. A.Y 2018 - 2019"
                  />
                </div>
              </div>

              <div class="w-full flex gap-x-2">
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
              </div>

              <div class="w-full mb-3">
                <label class="block font-semibold mb-0.5">Details</label>
                <textarea
                  v-model="item.details"
                  class="input rounded border px-2 py-2.5 w-full"
                  placeholder="Details (Brand, Model, Specs, etc.)"
                  rows="1"
                />
              </div>
              <div class="w-full mb-3">
                <label class="block font-semibold mb-0.5">Remarks</label>
                <textarea
                  v-model="item.remarks"
                  class="input rounded border px-2 py-2.5 w-full"
                  rows="1"
                  placeholder="Remarks"
                />
              </div>
            </div>
          </div>

          <button
            class="w-6/12 mx-auto block mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            @click.stop="addItem"
          >
            + Add Another Item
          </button>
        </div>
        <!-- LOGS -->
        <div v-if="!isCreate" class="border rounded p-4 mb-4">
          <h4 class="font-semibold mb-2">Status Logs</h4>

          <!-- Existing logs display (read-only) -->
          <div
            v-for="(log, i) in info.logs"
            :key="i"
            class="text-xs p-2 rounded mb-2"
            :class="itemStatusClass(log.status)"
          >
            <div class="flex justify-between font-semibold">
              <span>{{ log.status }}</span>
              <span>{{
                moment(log.timestamp).format("MMMM DD, YYYY hh:mm A")
              }}</span>
            </div>
            <div class="italic">{{ log.remarks }}</div>
          </div>

          <div class="mt-4 border-t pt-2 flex flex-col gap-2">
            <label class="text-xs font-semibold">Update Status:</label>
            <select
              v-model="newLog.status"
              class="input rounded border p-1 text-xs w-full"
            >
              <option disabled value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="Unsuccessful">Unsuccessful</option>
              <option value="Inprogress">Inprogress</option>
              <option value="Done">Done</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Closed">Closed</option>
            </select>

            <label class="text-xs font-semibold">Remarks:</label>
            <input
              v-model="newLog.remarks"
              type="text"
              placeholder="Enter remarks"
              class="input rounded border p-1 text-xs w-full"
            />
            <!-- 
<button
  class="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 w-32"
  @click="addStatusLog"
>
  Update Status
</button> -->
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
            @click="closeModal"
            :disabled="modalLoading"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-900 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            @click="isCreate ? createTicket() : saveChanges()"
            :disabled="modalLoading"
          >
            <i
              class="fa mr-1"
              :class="isCreate ? 'fa-plus' : 'fa-save'"
            ></i>
            {{ isCreate ? "Create" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const requests = ref([]);
const showModal = ref(false);
const isCreate = ref(false);
const statusFilter = ref("");
const technicianFilter = ref("");
const searchFilter = ref("");
const dateFilter = ref("");
const customOffice = ref("");

const successfullySavedData = ref(false);

// Dropdown options
const CATEGORY_OPTIONS = [
  "Hardware",
  "Software",
  "Network",
  "Computer Peripherals",
];
const ITEM_TYPE_OPTIONS = [
  "Laptop",
  "Desktop",
  "Printer",
  "Ink",
  "Scanner",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Router",
  "Switch",
  "UPS",
  "Cable",
  "Others",
  "N/A",
];

const CENTER_OFFICE_ROOM_OPTIONS = ["OCH", "NPCC", "Registrar", "N/A", "OTHER"];

const SEMESTER_OPTIONS = ["First Semester", "Second Semester", "Summer"];
const STATUS_OPTIONS = [
  "New",
  "Used",
  "For Repair",
  "For Disposal",
  "Returned",
  "Issued",
  "Replaced",
  "Condemned",
  "Serviceable",
  "Unserviceable",
  "Running",
];
const TECHNICIANS_PERSONNEL = [
  "Michael John Puertogalera",
  "Jo Renlee Luna",
  "Jason Yap",
  "Flourence John Gonzaga",
  "Rommel Rosal",
  "Denzel Roy Suarez",
  "Giovanni Jose Morales",
];

const loading = ref(false);
const modalLoading = ref(false);

const fetchRequests = async () => {
  loading.value = true;
  try {
    const res = await $fetch(endpoint.value + "/api/cits/tech-support/list/");
    requests.value = res.data || res;
  } catch (err) {
    console.error("Failed to fetch tech support list", err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRequests);

const newLog = reactive({ status: "", remarks: "" });

function addStatusLog() {
  if (!newLog.status) {
    alert("Please select a status");
    return;
  }

  if (!info.value.logs) info.value.logs = [];

  info.value.logs.push({
    status: newLog.status,
    remarks: newLog.remarks || "N/A",
    timestamp: new Date(),
  });

  // Update ticket's current_status
  info.value.current_status = newLog.status;

  // Reset input
  newLog.status = "";
  newLog.remarks = "";
}

// ================= STATUS HELPERS =================
const latestStatus = (item) =>
  item.logs?.length ? item.logs[item.logs.length - 1] : null;

// Backend-aligned filter mapping
const TICKET_STATUS_FILTER_MAP = {
  pending: ["Pending"],
  inprogress: ["Inprogress", "Reviewed"],
  completed: ["Completed", "Done", "Closed"],
};

// Clear filters function
const clearFilters = () => {
  statusFilter.value = "";
  technicianFilter.value = "";
  searchFilter.value = "";
  dateFilter.value = "";
};

// Enhanced filter
const filteredRequests = computed(() => {
  let filtered = [...requests.value];

  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter((r) => {
      const status = latestStatus(r)?.status;
      return TICKET_STATUS_FILTER_MAP[statusFilter.value]?.includes(status);
    });
  }

  // Technician filter
  if (technicianFilter.value) {
    filtered = filtered.filter((r) =>
      r.technicians_assigned?.includes(technicianFilter.value)
    );
  }

  // Search filter
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.ticket_id?.toLowerCase().includes(search) ||
        r.requestor_fullname?.toLowerCase().includes(search) ||
        r.requestor_lsu_email?.toLowerCase().includes(search)
    );
  }

  // Date filter
  if (dateFilter.value) {
    const now = moment();
    filtered = filtered.filter((r) => {
      const created = moment(r.created_at);
      switch (dateFilter.value) {
        case "today":
          return created.isSame(now, "day");
        case "week":
          return created.isSame(now, "week");
        case "month":
          return created.isSame(now, "month");
        case "year":
          return created.isSame(now, "year");
        default:
          return true;
      }
    });
  }

  return filtered;
});

// Date helpers
const getCurrentSemester = () => {
  const month = moment().month() + 1;
  if (month >= 1 && month <= 5) return "Second Semester";
  if (month >= 6 && month <= 7) return "Summer";
  return "First Semester";
};

const getAcademicYear = () => {
  const year = moment().year();
  const month = moment().month() + 1;
  return month >= 6 ? `A.Y ${year} - ${year + 1}` : `A.Y ${year - 1} - ${year}`;
};

const getTodayDateChecked = () => moment().format("DD/MM/YYYY hh:mm A");

const ACADEMIC_YEAR_OPTIONS = (() => {
  const currentYear = moment().year();
  const years = [];
  for (let i = -5; i <= 1; i++) {
    const start = currentYear + i;
    years.push(`A.Y ${start} - ${start + 1}`);
  }
  return years;
})();

// Empty item template
const emptyItem = () => ({
  name: "",
  serial_number_code: "",
  details: "",
  category_type: "",
  item_type: "",
  center_office_room: "",
  quantity: 1,
  status: "Used",
  remarks: "",
  current_semester: getCurrentSemester(), // dropdown
  academic_year: getAcademicYear(), // dropdown
  custom_semester: "",
  custom_academic_year: "",
  date_checked: getTodayDateChecked(),
});

// Form info
const info = ref({
  ticket_id: "TID" + Date.now(),
  requestor_fullname: "",
  requestor_lsu_email: "",
  center_office_room: "",
  technicians_assigned: [],
  logs: [
    {
      timestamp: new Date().toISOString(),
      remarks: "N/A",
      status: "Pending",
    },
  ],
  item_request: [],
});

// Modal controls
const openCreateModal = () => {
  isCreate.value = true;
  info.value = {
    ticket_id: "TID" + Date.now(),
    requestor_fullname: "",
    requestor_lsu_email: "",
    center_office_room: "",
    technicians_assigned: [],
    logs: [
      {
        timestamp: new Date().toISOString(),
        remarks: "N/A",
        status: "Pending",
      },
    ],
    item_request: [emptyItem()],
  };
  showModal.value = true;
};

const openModal = (item) => {
  isCreate.value = false;

  // Directly assign reactive ref
  info.value = reactive({
    ...item,
    technicians_assigned: Array.isArray(item.technicians_assigned)
      ? item.technicians_assigned
      : item.technician_assigned
        ? [item.technician_assigned]
        : [],
    logs: item.logs ? [...item.logs] : [],
  });

  showModal.value = true;
};

const closeModal = () => (showModal.value = false);
const addItem = () => info.value.item_request.push(emptyItem());
const removeItem = (index) => info.value.item_request.splice(index, 1);

// Normalize office before submit
const normalizeOffice = () => {
  if (info.value.center_office_room === "OTHER")
    info.value.center_office_room = customOffice.value || "Other";
};

const createTicket = async () => {
  if (!info.value.item_request.length) {
    showToaster("Please add at least one item.", "warning");
    return;
  }

  modalLoading.value = true;
  normalizeOffice();

  const payload = {
    ticket_id: info.value.ticket_id || `TID${Date.now()}`,
    requestor_fullname: info.value.requestor_fullname?.trim() || "N/A",
    requestor_lsu_email: info.value.requestor_lsu_email?.trim() || "N/A",
    technicians_assigned: info.value.technicians_assigned || [],
    logs: info.value.logs?.length
      ? info.value.logs
      : [
          {
            timestamp: new Date().toISOString(),
            status: "Pending",
            remarks: "Initial status",
          },
        ],
    item_request: info.value.item_request.map((item) => ({
      name: item.name?.trim() || "N/A",
      serial_number_code: item.serial_number_code?.trim() || "N/A",
      details: item.details?.trim() || "N/A",
      category_type: item.category_type?.trim() || "N/A",
      item_type: item.item_type?.trim() || "N/A",
      center_office_room: item.center_office_room?.trim() || "N/A",
      quantity: String(item.quantity || 1),
      status: item.status?.trim() || "Used",
      remarks: item.remarks?.trim() || "N/A",
      current_semester: item.current_semester,
      academic_year: item.academic_year,
      date_checked: item.date_checked || getTodayDateChecked(),
    })),
  };

  try {
    const res = await $fetch(endpoint.value + "/api/cits/tech-support/create/", {
      method: "POST",
      body: payload,
    });

    if (res.status === "created") {
      showToaster("✅ Ticket created successfully! Confirmation email sent.", "success");
      showModal.value = false;
      await fetchRequests(); // Refresh the list
    } else if (res.status === "errors") {
      console.error("Form errors:", res.errors);
      showToaster("❌ Failed to create ticket. Check console for errors.", "error");
    }
  } catch (err) {
    console.error("Failed to create ticket:", err);
    showToaster("❌ Failed to create ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};


const toaster = ref({
  show: false,
  message: "",
  type: "success", // we can extend later to warning, error, etc.
});

const showToaster = (message, type = "success", duration = 3000) => {
  toaster.value.message = message;
  toaster.value.type = type;
  toaster.value.show = true;

  setTimeout(() => {
    toaster.value.show = false;
  }, duration);
};

const saveChanges = async () => {
  if (!info.value.item_request.length) {
    showToaster("Please add at least one item.", "warning");
    return;
  }

  modalLoading.value = true;
  normalizeOffice();

  // Map items (same mapping as create)
  const item_request = info.value.item_request.map((item) => ({
    name: item.name?.trim() || "N/A",
    serial_number_code: item.serial_number_code?.trim() || "N/A",
    details: item.details?.trim() || "N/A",
    category_type: item.category_type?.trim() || "N/A",
    item_type: item.item_type?.trim() || "N/A",
    center_office_room: item.center_office_room?.trim() || "N/A",
    quantity: String(item.quantity || 1),
    status: item.status?.trim() || "Used",
    remarks: item.remarks?.trim() || "N/A",
    current_semester: item.current_semester,
    academic_year: item.academic_year,
    date_checked: item.date_checked || getTodayDateChecked(),
  }));

  const payload = {
    ticket_id: info.value.ticket_id,
    requestor_fullname: info.value.requestor_fullname?.trim() || "N/A",
    requestor_lsu_email: info.value.requestor_lsu_email?.trim() || "N/A",
    center_office_room: info.value.center_office_room,
    technicians_assigned: info.value.technicians_assigned || [],
    logs: info.value.logs || [],
    item_request,
  };
  addStatusLog();

  try {
    const res = await $fetch(
      endpoint.value + `/api/cits/tech-support/${info.value.id}/edit/`,
      {
        method: "PUT", // or PATCH depending on backend
        body: payload,
      },
    );

    if (res.status === "updated") {
      showToaster("✅ Changes saved successfully!", "success");
      showModal.value = false;
      await fetchRequests(); // refresh list
    } else {
      console.error("Update failed:", res);
      showToaster("❌ Failed to update ticket.", "error");
    }
  } catch (err) {
    console.error("Failed to update ticket:", err);
    showToaster("❌ Failed to update ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

const ticketStatusClass = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Inprogress":
      return "bg-blue-100 text-blue-800";
    case "Reviewed":
      return "bg-purple-100 text-purple-800";
    case "Completed":
    case "Done":
      return "bg-green-100 text-green-800";
    case "Closed":
      return "bg-gray-200 text-gray-800";
    case "Cancelled":
    case "Unsuccessful":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const itemStatusClass = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800";
    case "Used":
      return "bg-yellow-100 text-yellow-800";
    case "For Repair":
      return "bg-orange-100 text-orange-800";
    case "For Disposal":
      return "bg-red-100 text-red-800";
    case "Returned":
      return "bg-green-100 text-green-800";
    case "Issued":
      return "bg-purple-100 text-purple-800";
    case "Replaced":
      return "bg-teal-100 text-teal-800";
    case "Condemned":
      return "bg-gray-100 text-gray-700";
    case "Serviceable":
      return "bg-indigo-100 text-indigo-800";
    case "Unserviceable":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-50 text-gray-700";
  }
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
