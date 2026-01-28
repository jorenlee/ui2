<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div></div>
        <div class="lg:pt-14 pb-3 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h2
            class="font-bold uppercase text-white lg:text-xl text-sm w-11/12 mx-auto lg:my-12 my-6"
          >
            Network, Programs and Computerization Center
          </h2>
        </div>

        <div class="shadow-lg text-green-700">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/npcc" class="mx-2 hover:underline lg:h-10">NPCC</a>
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white bg-white h-full">
              <div
                class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
              >
                <a href="/cms/login" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-user" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Admin Login</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Layout -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Side Menu -->
      <div class="shadow lg:w-3/12 my-5 bg-white rounded-lg overflow-hidden">
        <DynamicSideMenu :items="menuList" title="Sub Pages" />
      </div>

      <!-- Main Content -->
      <div class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify">
        <div class="bg-white lg:p-6 p-2 shadow rounded-lg">
          <!-- ADMISSION TITLE -->
          <h2 class="lasalle-green-text font-bold text-xl text-center mb-3">
            Request for Tech Support
          </h2>

          <div>
            <!-- MODAL -->
            <div class="">
              <div class="bg-white w-full rounded-lg relative">
                <!-- Loading Overlay -->
                <div
                  v-if="modalLoading"
                  class="absolute inset-0 bg-white/95 flex items-center justify-center z-10 rounded-lg backdrop-blur-sm"
                >
                  <div
                    class="text-center bg-white p-8 rounded-lg shadow-2xl border-2 border-green-600"
                  >
                    <div
                      class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"
                    ></div>
                    <p class="mt-4 text-base font-bold text-gray-800">
                      {{
                        isCreate ? "Creating ticket..." : "Saving changes..."
                      }}
                    </p>
                    <p class="mt-1 text-xs text-gray-600">
                      Please wait, processing your request...
                    </p>
                  </div>
                </div>

                <!-- Confirmation Modal -->
                <div
                  v-if="showConfirmation"
                  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                  @click.self="showConfirmation = false"
                >
                  <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
                    <div class="bg-gradient-to-r from-green-600 to-green-700 p-6">
                      <div class="flex items-center justify-center">
                        <div class="bg-white rounded-full p-3">
                          <i class="fas fa-question-circle text-green-600 text-4xl"></i>
                        </div>
                      </div>
                      <h3 class="text-white text-xl font-bold text-center mt-4">
                        Confirm Submission
                      </h3>
                    </div>

                    <div class="p-6">
                      <p class="text-gray-700 text-center mb-6">
                        Are you sure you want to submit this tech support request?
                      </p>

                      <!-- Summary -->
                      <div class="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Requestor:</span>
                          <span class="font-semibold text-gray-800">{{ info.requestor_fullname }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Email:</span>
                          <span class="font-semibold text-gray-800">{{ info.requestor_lsu_email }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Items:</span>
                          <span class="font-semibold text-gray-800">{{ info.item_request.length }} request(s)</span>
                        </div>
                      </div>

                      <div class="flex gap-3">
                        <button
                          @click="showConfirmation = false"
                          class="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                        >
                          <i class="fas fa-times mr-2"></i>Cancel
                        </button>
                        <button
                          @click="confirmSubmit"
                          class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                        >
                          <i class="fas fa-check mr-2"></i>Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Success Modal -->
                <div
                  v-if="showSuccess"
                  class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
                  @click.self="showSuccess = false"
                >
                  <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
                    <div class="bg-gradient-to-r from-green-500 to-green-600 p-6">
                      <div class="flex items-center justify-center">
                        <div class="bg-white rounded-full p-3 animate-bounce">
                          <i class="fas fa-check-circle text-green-600 text-5xl"></i>
                        </div>
                      </div>
                      <h3 class="text-white text-2xl font-bold text-center mt-4">
                        Request Submitted!
                      </h3>
                    </div>

                    <div class="p-6">
                      <p class="text-gray-700 text-center mb-4">
                        Your tech support request has been successfully submitted.
                      </p>
                      <p class="text-sm text-gray-600 text-center mb-6">
                        A confirmation email has been sent to <strong>{{ info.requestor_lsu_email }}</strong>
                      </p>

                      <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                        <p class="text-sm text-green-800 text-center font-semibold">
                          <i class="fas fa-ticket-alt mr-2"></i>Ticket ID: {{ info.ticket_id }}
                        </p>
                      </div>

                      <button
                        @click="resetForm"
                        class="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                      >
                        <i class="fas fa-plus mr-2"></i>Submit Another Request
                      </button>
                    </div>
                  </div>
                </div>

                <!-- ITEM REQUEST -->
                <div class="border-2 border-green-100 rounded-xl lg:p-6 p-2 mb-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
                  <div class="mb-6">
                    <h3 class="text-lg font-bold text-green-800 mb-1 flex items-center">
                      <i class="fas fa-user-circle mr-2"></i>
                      Requestor Information
                    </h3>
                    <p class="text-xs text-gray-500">Please provide your contact details</p>
                  </div>

                  <div class="grid lg:grid-cols-2 gap-4 mb-6">
                    <div class="w-full">
                      <label class="text-sm font-semibold mb-2 block text-gray-700"
                        ><i class="fas fa-user text-green-600 mr-1"></i>Full Name
                        <span class="text-red-600">*</span></label
                      >
                      <input
                        v-model="info.requestor_fullname"
                        placeholder="Enter your full name"
                        class="input w-full p-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      />
                    </div>

                    <div class="w-full">
                      <label class="text-sm font-semibold mb-2 block text-gray-700"
                        ><i class="fas fa-envelope text-green-600 mr-1"></i>LSU Email
                        <span class="text-red-600">*</span></label
                      >
                      <input
                        v-model="info.requestor_lsu_email"
                        placeholder="e.g johndoe@lsu.edu.ph"
                        class="input w-full p-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div class="border-t-2 border-gray-200 pt-6">
                    <h3 class="text-lg font-bold text-green-800 mb-1 flex items-center">
                      <i class="fas fa-tools mr-2"></i>
                      Request Details
                    </h3>
                    <p class="text-xs text-gray-500 mb-4">Describe your technical support needs</p>

                    <div
                      v-for="(item, index) in info.item_request"
                      :key="index"
                      class="bg-white rounded-lg lg:p-5 p-2 mb-4 border-2 border-gray-100 hover:border-green-200 transition-all"
                    >
                      <div class="grid lg:grid-cols-2 gap-4 text-sm">
                        <!-- OFFICE -->
                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700"
                            ><i class="fas fa-building text-green-600 mr-1"></i>Center/Office/Room
                            <span class="text-red-600">*</span></label
                          >
                          <div class="flex gap-2">
                            <select
                              v-model="item.center_office_room"
                              class="input border-2 border-gray-200 w-full p-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                            >
                              <option disabled value="">
                                Select Location
                              </option>
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
                              class="input rounded-lg border-2 border-gray-200 flex-1 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                              placeholder="Specify location"
                            />
                          </div>
                        </div>

                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-tag text-green-600 mr-1"></i>Tech Type <span class="text-red-600">*</span>
                          </label>
                          <select
                            v-model="item.category_type"
                            @change="item.item_type = ''"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          >
                            <option disabled value="">Select Type</option>
                            <option
                              v-for="cat in CATEGORY_OPTIONS"
                              :key="cat"
                              :value="cat"
                            >
                              {{ cat }}
                            </option>
                          </select>
                        </div>

                        <!-- ITEM TYPE -->
                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700"
                            ><i class="fas fa-laptop text-green-600 mr-1"></i>Specific Concern
                            <span class="text-red-600">*</span></label
                          >
                          <select
                            v-model="item.item_type"
                            :disabled="!item.category_type"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option disabled value="">
                              {{ item.category_type ? 'Select ' + item.category_type : 'Select Tech Type First' }}
                            </option>
                            <option
                              v-for="type in getItemOptions(item.category_type)"
                              :key="type"
                              :value="type"
                            >
                              {{ type }}
                            </option>
                          </select>
                        </div>

                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700"
                            ><i class="fas fa-comment-dots text-green-600 mr-1"></i>Concern <span class="text-red-600">*</span></label
                          >
                          <textarea
                            v-model="item.name"
                            class="input rounded-lg border-2 border-gray-200 px-3 py-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                            placeholder="Describe your issue or request in detail..."
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ACTIONS -->
                <div class="flex justify-center gap-3 mb-10">
                  <button
                    class="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    @click="handleSubmitClick"
                    :disabled="modalLoading"
                  >
                    <i class="fas fa-paper-plane mr-2"></i>
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const menuList = [
  { label: "About NPCC", link: "/npcc" },
  { label: "Request For Tech Support ", link: "/npcc/request" },
  { label: "Track Request", link: "/npcc/track" },
];

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
const showConfirmation = ref(false);
const showSuccess = ref(false);

// Dropdown options
const CATEGORY_OPTIONS = [
  "Hardware",
  "Software",
  "Network",
  "Computer Peripherals",
];

// Dynamic item type options based on category
const ITEM_TYPE_OPTIONS_MAP = {
  Hardware: [
    "Laptop",
    "Desktop",
    "Printer",
    "Scanner",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Projector",
    "Webcam",
    "Headset",
    "Speaker",
    "Microphone",
    "External Hard Drive",
    "USB Flash Drive",
    "Power Supply",
    "Motherboard",
    "RAM",
    "Graphics Card",
    "CPU",
    "Cooling Fan",
    "Others",
  ],
  Software: [
    "Gmail",
    "Google Workspace",
    "Automate",
    "Canvas LMS",
    "Microsoft Office",
    "Microsoft Teams",
    "Microsoft Outlook",
    "Microsoft Excel",
    "Microsoft Word",
    "Microsoft PowerPoint",
    "Adobe Acrobat",
    "Zoom",
  ],
  Network: [
    "Internet Connection",
    "WiFi Access",
    "Network Configuration",
  ],
  "Computer Peripherals": [
    "Screwdriver Set",
    "Cable Ties",
    "Thermal Paste",
    "Cleaning Kit",
    "Cable Tester",
    "Crimping Tool",
    "Anti-static Wrist Strap",
    "Compressed Air",
    "HDMI Cable",
    "VGA Cable",
    "Ethernet Cable",
    "USB Cable",
    "Power Cable",
    "Extension Cord",
    "Others",
  ],
};

// Function to get item options based on category
const getItemOptions = (category) => {
  return ITEM_TYPE_OPTIONS_MAP[category] || [];
};

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
      r.technicians_assigned?.includes(technicianFilter.value),
    );
  }

  // Search filter
  if (searchFilter.value) {
    const search = searchFilter.value.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.ticket_id?.toLowerCase().includes(search) ||
        r.requestor_fullname?.toLowerCase().includes(search) ||
        r.requestor_lsu_email?.toLowerCase().includes(search),
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
  item_request: [emptyItem()],
});

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

const handleSubmitClick = () => {
  // Validate required fields
  if (!info.value.requestor_fullname || !info.value.requestor_lsu_email) {
    showToaster("Please fill in all required fields.", "warning");
    return;
  }

  if (!info.value.item_request.length) {
    showToaster("Please add at least one item.", "warning");
    return;
  }

  // Check if all items have required fields
  const hasEmptyFields = info.value.item_request.some(
    item => !item.center_office_room || !item.category_type || !item.item_type || !item.name
  );

  if (hasEmptyFields) {
    showToaster("Please fill in all required fields for each request.", "warning");
    return;
  }

  // Show confirmation dialog
  showConfirmation.value = true;
};

const confirmSubmit = () => {
  showConfirmation.value = false;
  if (isCreate.value) {
    createTicket();
  } else {
    saveChanges();
  }
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
    const res = await $fetch(
      endpoint.value + "/api/cits/tech-support/create/",
      {
        method: "POST",
        body: payload,
      },
    );

    if (res.status === "created") {
      showSuccess.value = true;
      showToaster(
        "✅ Ticket created successfully! Confirmation email sent.",
        "success",
      );
      await fetchRequests(); // Refresh the list
    } else if (res.status === "errors") {
      console.error("Form errors:", res.errors);
      showToaster(
        "❌ Failed to create ticket. Check console for errors.",
        "error",
      );
    }
  } catch (err) {
    console.error("Failed to create ticket:", err);
    showToaster("❌ Failed to create ticket. Please try again.", "error");
  } finally {
    modalLoading.value = false;
  }
};

const resetForm = () => {
  showSuccess.value = false;
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
