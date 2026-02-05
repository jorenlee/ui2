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
        <div
          class="lg:pt-14 pb-3 absolute top-1/2 transform -translate-y-1/2 w-full"
        >
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
            <div
              class="flex hover:text-green-800 text-white bg-white h-full z-50"
            >
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

          <!-- Unrated Completed Tickets Notification Banner -->
          <div
            v-if="hasUnratedCompletedTickets"
            class="mb-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg shadow-md animate-fade-in"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-triangle text-orange-600 text-2xl"></i>
              </div>
              <div class="flex-1">
                <h3 class="text-orange-800 font-bold text-sm mb-1">
                  <i class="fas fa-star mr-1"></i>
                  Pending Feedback Required
                </h3>
                <p class="text-orange-700 text-xs mb-2">
                  You have <strong>{{ unratedTicketsCount }}</strong> completed ticket{{ unratedTicketsCount > 1 ? 's' : '' }}
                  that {{ unratedTicketsCount > 1 ? 'need' : 'needs' }} your rating and feedback.
                </p>
                <p class="text-orange-600 text-xs mb-3">
                  <i class="fas fa-info-circle mr-1"></i>
                  Please provide your feedback before submitting a new request. Your feedback helps us improve our services!
                </p>
                <a
                  href="/portal/login"
                  class="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <i class="fas fa-sign-in-alt mr-2"></i>
                  Go to Portal to Rate Tickets
                  <i class="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </div>
          </div>

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
                  <div
                    class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in"
                  >
                    <div
                      class="flex items-center bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 gap-x-5 justify-center"
                    >
                      <h3 class="text-white text-xl font-bold text-center">
                        Confirm Submission
                      </h3>
                      <div class="flex items-center justify-center">
                        <div class="rounded-full">
                          <i
                            class="fas fa-question-circle text-white text-4xl"
                          ></i>
                        </div>
                      </div>
                    </div>

                    <div class="p-6">
                      <p class="text-gray-700 text-center mb-6">
                        Are you sure you want to submit this tech support
                        request?
                      </p>

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
                  <div
                    class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fade-in"
                  >
                    <div
                      class="bg-gradient-to-r from-green-500 to-green-600 p-6"
                    >
                      <div class="flex items-center justify-center">
                        <div class="bg-white rounded-full p-3 animate-bounce">
                          <i
                            class="fas fa-check-circle text-green-600 text-5xl"
                          ></i>
                        </div>
                      </div>
                      <h3
                        class="text-white text-2xl font-bold text-center mt-4"
                      >
                        Request Submitted!
                      </h3>
                    </div>

                    <div class="p-6">
                      <p class="text-gray-700 text-center mb-4">
                        Your tech support request has been successfully
                        submitted.
                      </p>
                      <p class="text-sm text-gray-600 text-center mb-6">
                        A confirmation email has been sent to
                        <strong>{{ info.requestor_lsu_email }}</strong>
                      </p>

                      <div
                        class="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6"
                      >
                        <p
                          class="text-sm text-green-800 text-center font-semibold"
                        >
                          <i class="fas fa-ticket-alt mr-2"></i>Ticket ID:
                          {{ info.ticket_id }}
                        </p>
                      </div>

                      <button
                        @click="resetForm"
                        class="w-full px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-300 font-semibold transition-colors"
                      >
                        <i class="fas fa-close mr-2"></i>Closed
                      </button>
                    </div>
                  </div>
                </div>

                <!-- ITEM REQUEST -->
                <div
                  class="border-2 border-green-100 rounded-xl lg:p-6 p-2 mb-6 bg-gradient-to-br from-gray-50 to-white shadow-sm"
                >
                  <div class="mb-6">
                    <h3
                      class="text-lg font-bold text-green-800 mb-1 flex items-center"
                    >
                      <i class="fas fa-user-circle mr-2"></i>
                      Requestor Information
                    </h3>
                    <p class="text-xs text-gray-500">
                      Please provide your contact details
                    </p>
                  </div>

                  <div class="grid lg:grid-cols-2 gap-4 mb-6">
                    <div class="w-full">
                      <label
                        class="text-sm font-semibold mb-2 block text-gray-700"
                        ><i class="fas fa-user text-green-600 mr-1"></i>Full
                        Name <span class="text-red-600">*</span></label
                      >
                      <input
                        v-model="info.requestor_fullname"
                        placeholder="Enter your full name"
                        class="input w-full p-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      />
                    </div>

                    <div class="w-full">
                      <label
                        class="text-sm font-semibold mb-2 block text-gray-700"
                        ><i class="fas fa-envelope text-green-600 mr-1"></i>LSU
                        Email <span class="text-red-600">*</span></label
                      >
                      <input
                        v-model="info.requestor_lsu_email"
                        placeholder="e.g johndoe@lsu.edu.ph"
                        class="input w-full p-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div class="border-t-2 border-gray-200 pt-6">
                    <h3
                      class="text-lg font-bold text-green-800 mb-1 flex items-center"
                    >
                      <i class="fas fa-tools mr-2"></i>
                      Request Details
                    </h3>
                    <p class="text-xs text-gray-500 mb-4">
                      Describe your technical support needs
                    </p>

                    <div
                      class="bg-white rounded-lg lg:p-5 p-2 mb-4 border-2 border-gray-100"
                    >
                      <div class="grid lg:grid-cols-2 gap-4 text-sm">

                        
                        <!-- OWNER TYPE -->
                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-user-tag text-green-600 mr-1"></i
                            >Owner Type <span class="text-red-600">*</span>
                          </label>
                          <select
                            v-model="info.owner_type"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          >
                            <option value="LSU">LSU</option>
                            <option value="Personal">Personal</option>
                          </select>
                        </div>

                        <!-- CLIENT ROLE -->
                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-id-badge text-green-600 mr-1"></i
                            >Client Role <span class="text-red-600">*</span>
                          </label>
                          <select
                            v-model="info.client_role"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          >
                            <option value="">Select Role</option>
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Staff">Staff</option>
                            <option value="Alumni">Alumni</option>
                            <option value="Public">Public</option>
                             <option value="Admin">Admin</option>
                          </select>
                        </div>


                        
                        <!-- OFFICE -->
                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700"
                            ><i class="fas fa-building text-green-600 mr-1"></i
                            >Center/Office/Room
                            <span class="text-red-600">*</span></label
                          >
                          <div class="flex gap-2">
                            <select
                              v-model="
                                info.issue_concern_request_center_office_room
                              "
                              class="input border-2 border-gray-200 w-full p-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
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
                              v-if="
                                info.issue_concern_request_center_office_room ===
                                'OTHER'
                              "
                              v-model="customOffice"
                              class="input rounded-lg border-2 border-gray-200 flex-1 p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                              placeholder="Specify location"
                            />
                          </div>
                        </div>

                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-tag text-green-600 mr-1"></i>Tech
                            Type <span class="text-red-600">*</span>
                          </label>
                          <select
                            v-model="info.issue_concern_request_category_type"
                            @change="info.issue_concern_request_item_type = ''"
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
                            ><i class="fas fa-laptop text-green-600 mr-1"></i
                            >Specific Concern
                            <span class="text-red-600">*</span></label
                          >
                          <select
                            v-model="info.issue_concern_request_item_type"
                            :disabled="
                              !info.issue_concern_request_category_type
                            "
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option disabled value="">
                              {{
                                info.issue_concern_request_category_type
                                  ? "Select " +
                                    info.issue_concern_request_category_type
                                  : "Select Tech Type First"
                              }}
                            </option>
                            <option
                              v-for="type in getItemOptions(
                                info.issue_concern_request_category_type,
                              )"
                              :key="type"
                              :value="type"
                            >
                              {{ type }}
                            </option>
                          </select>
                        </div>

                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700"
                            ><i
                              class="fas fa-comment-dots text-green-600 mr-1"
                            ></i
                            >Description
                            <span class="text-red-600">*</span></label
                          >
                          <textarea
                            v-model="info.issue_concern_request_details"
                            class="input rounded-lg border-2 border-gray-200 px-3 py-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                            placeholder="Describe your issue or request in detail..."
                            rows="3"
                          />
                        </div>

                        <!-- BUY ME COFFEE -->
                         <!-- hide for now -->
                        <!-- <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-coffee text-green-600 mr-1"></i>Buy
                            Me Coffee
                          </label>
                          <select
                            v-model="info.buy_me_coffee"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </div> -->

                        <!-- GCASH RECEIPT UPLOAD -->
                        <div
                          v-if="info.buy_me_coffee === 'Yes'"
                          class="w-full lg:col-span-2"
                        >
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-receipt text-green-600 mr-1"></i
                            >GCash Receipt
                          </label>
                          <input
                            type="file"
                            @change="handleReceiptUpload"
                            accept="image/*"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          />

                          <div class="relative inline-block">
                            <img
                              :src="receiptPreview"
                              alt="Receipt Preview"
                              class="max-w-xs rounded-lg border-2 border-gray-300"
                            />
                            <button
                              @click="removeReceipt"
                              class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                            >
                              <i class="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
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

const customOffice = ref("");
const showConfirmation = ref(false);
const showSuccess = ref(false);
const isCreate = ref(true);
const hasUnratedCompletedTickets = ref(false);
const unratedTicketsCount = ref(0);

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
    "LSU Website",
  ],
  Network: ["WiFi Access", "Network Configuration"],
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

const modalLoading = ref(false);
const receiptFile = ref(null);
const receiptPreview = ref("");

// Technicians list with name and email
const TECHNICIANS_PERSONNEL = [
  {
    name: "Michael John Puertogalera",
    email: "michaeljohn.puertogalera@lsu.edu.ph",
  },
  {
    name: "Jo Renlee Luna",
    email: "jorenlee.luna@lsu.edu.ph",
  },
  {
    name: "Jason Yap",
    email: "jason.yap@lsu.edu.ph",
  },
  {
    name: "Flourence John Gonzaga",
    email: "johny14_gonzaga@lsu.edu.ph",
  },
  {
    name: "Rommel Rosal",
    email: "rommel.rosal@lsu.edu.ph",
  },
  {
    name: "Denzel Roy Suarez",
    email: "denzelroy.suarez@lsu.edu.ph",
  },
  {
    name: "Giovanni Jose Morales",
    email: "giovanni.morales@lsu.edu.ph",
  },
];

// Form info - Updated for ITServicesModelV2
const info = ref({
  ticket_id: "TID" + Date.now(),
  requestor_fullname: "",
  requestor_lsu_email: "",
  technicians_assigned: [
    {
      name: "Michael John Puertogalera",
      email: "michaeljohn.puertogalera@lsu.edu.ph",
    },
  ],
  issue_concern_request_details: "",
  issue_concern_request_category_type: "",
  issue_concern_request_item_type: "",
  issue_concern_request_center_office_room: "",
  owner_type: "LSU",
  client_role: "",
  buy_me_coffee: "No",
  logs: [
    {
      timestamp: new Date().toISOString(),
      status: "Pending",
      remarks: "Initial status",
      assigned_technician_name: "",
      assigned_technician_lsu_email: "",
    },
  ],
});

// Handle receipt file upload
const handleReceiptUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    receiptFile.value = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      receiptPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const removeReceipt = () => {
  receiptFile.value = null;
  receiptPreview.value = "";
};

// Normalize office before submit
const normalizeOffice = () => {
  if (info.value.issue_concern_request_center_office_room === "OTHER")
    info.value.issue_concern_request_center_office_room =
      customOffice.value || "Other";
};

// Check if user has unrated tickets (specifically completed/done tickets)
const checkForUnratedTickets = async (email) => {
  try {
    const res = await $fetch(
      endpoint.value + "/api/cits/request-ticket/list/"
    );

    if (res && Array.isArray(res)) {
      // Filter tickets for this user
      const userTickets = res.filter(
        (ticket) => ticket.requestor_lsu_email === email
      );

      // Check if any COMPLETED/DONE ticket is missing rating or feedback
      const unratedCompletedTickets = userTickets.filter((ticket) => {
        // Check if ticket status is "Done" or "Completed"
        const isCompleted = ticket.current_status === "Done" ||
                           ticket.current_status === "Completed" ||
                           (ticket.logs && ticket.logs.some(log =>
                             log.status === "Done" || log.status === "Completed"
                           ));

        if (!isCompleted) return false;

        const hasNoRating = !ticket.evaluation_feedback_client_star_rating ||
                           ticket.evaluation_feedback_client_star_rating === "";
        const hasNoFeedback = !ticket.evaluation_feedback_client_comment ||
                             ticket.evaluation_feedback_client_comment === "";

        // Consider a ticket unrated if it's completed but missing either rating or feedback
        return hasNoRating || hasNoFeedback;
      });

      // Update reactive variables for notification banner
      unratedTicketsCount.value = unratedCompletedTickets.length;
      hasUnratedCompletedTickets.value = unratedCompletedTickets.length > 0;

      return unratedCompletedTickets.length > 0;
    }

    return false;
  } catch (error) {
    console.error("Error checking for unrated tickets:", error);
    // If there's an error, allow submission to proceed
    return false;
  }
};

const handleSubmitClick = async () => {
  // Validate required fields
  if (!info.value.requestor_fullname || !info.value.requestor_lsu_email) {
    showToaster("Please fill in all required fields.", "warning");
    return;
  }

  if (
    !info.value.issue_concern_request_center_office_room ||
    !info.value.issue_concern_request_category_type ||
    !info.value.issue_concern_request_item_type ||
    !info.value.issue_concern_request_details
  ) {
    showToaster("Please fill in all request details.", "warning");
    return;
  }

  // Check for unrated completed tickets before allowing new submission
  const hasUnratedTickets = await checkForUnratedTickets(info.value.requestor_lsu_email);
  if (hasUnratedTickets) {
    showToaster(
      `⚠️ You have ${unratedTicketsCount.value} completed ticket${unratedTicketsCount.value > 1 ? 's' : ''} without rating/feedback. Please visit the portal to complete your feedback before submitting a new request.`,
      "warning",
      8000
    );
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
  modalLoading.value = true;
  normalizeOffice();

  // Create FormData for file upload
  const formData = new FormData();
  formData.append("ticket_id", info.value.ticket_id || `TID${Date.now()}`);
  formData.append(
    "requestor_fullname",
    info.value.requestor_fullname?.trim() || "",
  );
  formData.append(
    "requestor_lsu_email",
    info.value.requestor_lsu_email?.trim() || "",
  );
  formData.append(
    "technicians_assigned",
    JSON.stringify(info.value.technicians_assigned || []),
  );
  formData.append(
    "issue_concern_request_details",
    info.value.issue_concern_request_details?.trim() || "",
  );
  formData.append(
    "issue_concern_request_category_type",
    info.value.issue_concern_request_category_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_item_type",
    info.value.issue_concern_request_item_type?.trim() || "",
  );
  formData.append(
    "issue_concern_request_center_office_room",
    info.value.issue_concern_request_center_office_room?.trim() || "",
  );
  formData.append("owner_type", info.value.owner_type || "LSU");
  formData.append("client_role", info.value.client_role || "");
  formData.append("buy_me_coffee", info.value.buy_me_coffee || "No");
  formData.append("logs", JSON.stringify(info.value.logs || []));

  // Add receipt file if exists
  if (receiptFile.value) {
    formData.append("buy_me_coffee_gcash_receipt", receiptFile.value);
  }

  try {
    const res = await $fetch(
      endpoint.value + "/api/cits/request-ticket/create/",
      {
        method: "POST",
        body: formData,
      },
    );

    if (res.status === "created") {
      showSuccess.value = true;
      showToaster(
        "✅ Ticket created successfully! Confirmation email sent.",
        "success",
      );
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
  receiptFile.value = null;
  receiptPreview.value = "";
  info.value = {
    ticket_id: "TID" + Date.now(),
    requestor_fullname: "",
    requestor_lsu_email: "",
    technicians_assigned: [
      {
        name: "Michael John Puertogalera",
        email: "michaeljohn.puertogalera@lsu.edu.ph",
      },
    ],
    issue_concern_request_details: "",
    issue_concern_request_category_type: "",
    issue_concern_request_item_type: "",
    issue_concern_request_center_office_room: "",
    owner_type: "LSU",
    client_role: "",
    buy_me_coffee: "No",
    logs: [
      {
        timestamp: new Date().toISOString(),
        status: "Pending",
        remarks: "Initial status",
        assigned_technician_name: "",
        assigned_technician_lsu_email: "",
      },
    ],
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

// Check for unrated completed tickets on page load
onMounted(async () => {
  // Get user email from store or form
  const userEmail = userStore.userEmail || userStore.user?.email || info.value.requestor_lsu_email;

  if (userEmail) {
    await checkForUnratedTickets(userEmail);
  }
});
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
