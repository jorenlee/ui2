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

          <!-- Unrated Tickets Notification Banner -->
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
                  You have <strong>{{ unratedTicketsCount }}</strong> ticket{{ unratedTicketsCount > 1 ? 's' : '' }}
                  that {{ unratedTicketsCount > 1 ? 'need' : 'needs' }} your rating and feedback.
                </p>
                <p class="text-orange-600 text-xs mb-3">
                  <i class="fas fa-info-circle mr-1"></i>
                  Please rate ALL your previous tickets before submitting a new request. Your feedback helps us improve our services!
                </p>
                <a
                  href="/central/login"
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
                        <i class="fas fa-close mr-2"></i>Close
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

                        <!-- 1. CATEGORY -->
                        <div class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-tag text-green-600 mr-1"></i>Category
                            <span class="text-red-600">*</span>
                          </label>
                          <select
                            v-model="info.issue_concern_request_category_type"
                            @change="info.issue_concern_request_item_type = ''"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
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

                        <!-- 2. SPECIFIC CONCERN (Hidden for LSU Webpages and Student Portal) -->
                        <div v-if="info.issue_concern_request_category_type !== 'LSU Webpages' && info.issue_concern_request_category_type !== 'Student Portal'" class="w-full">
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

                        <!-- 3. DESCRIPTION (Hidden for Student Portal) -->
                        <div v-if="info.issue_concern_request_category_type !== 'Student Portal'" class="w-full lg:col-span-2">
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

                        <!-- 4. REQUESTOR ROLE (formerly Client Role) (Hidden for LSU Webpages and Student Portal) -->
                        <div v-if="info.issue_concern_request_category_type !== 'LSU Webpages' && info.issue_concern_request_category_type !== 'Student Portal'" class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700">
                            <i class="fas fa-id-badge text-green-600 mr-1"></i
                            >Requestor Role <span class="text-red-600">*</span>
                          </label>
                          <select
                            v-model="info.client_role"
                            class="input rounded-lg border-2 border-gray-200 p-3 w-full focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                          >
                            <option value="">Select Role</option>
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Staff">Staff</option>
                            <!-- Hide Public and Alumni for Others category -->
                            <option v-if="info.issue_concern_request_category_type !== 'Others'" value="Alumni">Alumni</option>
                            <option v-if="info.issue_concern_request_category_type !== 'Others'" value="Public">Public</option>
                             <option value="Admin">Admin</option>
                          </select>
                        </div>

                        <!-- 5. CENTER/OFFICE/ROOM (Hidden for Public, Alumni, Accounts, Student Portal, and Others) -->
                        <div v-if="info.client_role !== 'Public' && info.client_role !== 'Alumni' && info.issue_concern_request_category_type !== 'Accounts' && info.issue_concern_request_category_type !== 'Student Portal' && info.issue_concern_request_category_type !== 'Others'" class="w-full">
                          <label class="block font-semibold mb-2 text-gray-700"
                            ><i class="fas fa-building text-green-600 mr-1"></i>
                            {{ info.issue_concern_request_category_type === 'Computer Lab' ? 'Computer Lab Location' : 'Center/Office/Room' }}
                            <span class="text-red-600">*</span></label
                          >
                          <div class="flex gap-2">
                            <select
                              v-model="
                                info.issue_concern_request_center_office_room
                              "
                              class="input border-2 border-gray-200 w-full p-3 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                            >
                              <option disabled value="">
                                {{ info.issue_concern_request_category_type === 'Computer Lab' ? 'Select Computer Lab' : 'Select Location' }}
                              </option>
                              <option
                                v-for="office in getLocationOptions"
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

                        <!-- 6. OWNER TYPE (Hidden for Hardware, Network, Computer Lab, Accounts, LSU Webpages, Student Portal) -->
                        <div v-if="info.issue_concern_request_category_type !== 'Hardware' && info.issue_concern_request_category_type !== 'Network' && info.issue_concern_request_category_type !== 'Computer Lab' && info.issue_concern_request_category_type !== 'Accounts' && info.issue_concern_request_category_type !== 'LSU Webpages' && info.issue_concern_request_category_type !== 'Student Portal'" class="w-full">
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
                  :disabled="modalLoading || info.issue_concern_request_category_type === 'Student Portal'"
                >
                  <i class="fas fa-paper-plane mr-2"></i>
                  Submit Request
                </button>
              </div>

              <!-- STUDENT PORTAL MODAL -->
              <div
                v-if="showStudentPortalModal"
                class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                @click.self="showStudentPortalModal = false"
              >
                <div class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 transform transition-all">
                  <div class="text-center">
                    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                      <i class="fas fa-info-circle text-blue-600 text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Student Portal Information</h3>
                    <p class="text-gray-600 mb-6">
                      For Student Portal concerns (forgot your password), please proceed to the Registrar's Office.
                    </p>
                    <button
                      @click="showStudentPortalModal = false"
                      class="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      <i class="fas fa-times mr-2"></i>
                      Close
                    </button>
                  </div>
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
import { ref, computed, watch } from "vue";
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
const showStudentPortalModal = ref(false);

// Dropdown options
const CATEGORY_OPTIONS = [
  "Hardware",
  "Software",
  "Network",
  "Computer Lab",
  "Accounts",
  "LSU Webpages",
  "Student Portal",
  "Others",
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
    "Installation",
    "Repair",
    "Uninstall",
  ],
  Network: ["WiFi Access", "Network Configuration"],
  "Computer Lab": [
    "Computer Setup",
    "Software Installation",
    "Hardware Issue",
    "Network Connectivity",
    "Maintenance",
    "Others",
  ],
  Accounts: [
    "LSU Gmail",
    "Canvas",
    "Microsoft",
    "Student Portal",
    "Others",
  ],
  "LSU Webpages": [
    "Update Content",
    "Fix Errors",
    "Add New Page",
    "Remove Page",
    "Others",
  ],
  "Student Portal": [
    "Forgot Password",
    "Others",
  ],
  Others: [
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

// Computer Lab location options
const COMPUTER_LAB_LOCATIONS = {
  "BVM and SJ Buildings": [
    "BVM 4F Computer Lab",
    "BVM 2F Computer Lab",
    "SJ Computer Lab",
  ],
  "LS Building": [
    "LS209 - Maclab",
    "LS211 - Networking",
    "LS212 - Programming",
    "LS213 - Multimedia",
    "LS215 - Openlab",
  ],
};

const CENTER_OFFICE_ROOM_OPTIONS = ["OCH", "NPCC", "Registrar", "N/A", "OTHER"];

// Computed property to get location options based on category
const getLocationOptions = computed(() => {
  // If Computer Lab is selected, show computer lab locations
  if (info.value.issue_concern_request_category_type === "Computer Lab") {
    // Combine all computer lab locations
    const allLabLocations = [
      ...COMPUTER_LAB_LOCATIONS["BVM and SJ Buildings"],
      ...COMPUTER_LAB_LOCATIONS["LS Building"],
    ];
    return allLabLocations;
  }

  // Otherwise, show default office options
  return CENTER_OFFICE_ROOM_OPTIONS;
});

const modalLoading = ref(false);
const receiptFile = ref(null);
const receiptPreview = ref("");

// Technicians list with name, email, and specializations
const TECHNICIANS_PERSONNEL = [
  {
    name: "Michael John Puertogalera",
    email: "michaeljohn.puertogalera@lsu.edu.ph",
    specializations: ["Accounts", "Software"],
    role: "Accounts / Software",
  },
  {
    name: "Jason Yap",
    email: "jason.yap@lsu.edu.ph",
    specializations: ["Network", "Accounts", "Software"],
    role: "Network / Accounts / Software",
  },
  {
    name: "Flourence John Gonzaga",
    email: "johny14_gonzaga@lsu.edu.ph",
    specializations: ["Network", "Accounts", "Software"],
    role: "Network / Accounts / Software",
  },
  {
    name: "Denzel Roy Suarez",
    email: "denzelroy.suarez@lsu.edu.ph",
    specializations: ["Computer Lab"],
    location: "BVM and SJ Buildings",
    role: "Computer Laboratory: BVM and SJ Buildings Rooms",
  },
  {
    name: "Rommel Rosal",
    email: "rommel.rosal@lsu.edu.ph",
    specializations: ["Computer Lab"],
    location: "LS Building",
    role: "Computer Laboratory: LS Building Rooms",
  },
  {
    name: "Giovanni Jose Morales",
    email: "giovanni.morales@lsu.edu.ph",
    specializations: ["Hardware"],
    role: "PC and Printers and Other Hardwares - Whole LSU Campus Admins and Staffs",
  },
  {
    name: "Jo Renlee Luna",
    email: "jorenlee.luna@lsu.edu.ph",
    specializations: ["Software"],
    role: "LSU Website",
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
  // Set N/A for Public, Alumni, Accounts, Student Portal, and Others (LSU Webpages and Software REQUIRE it)
  if (
    info.value.client_role === 'Public' ||
    info.value.client_role === 'Alumni' ||
    info.value.issue_concern_request_category_type === 'Accounts' ||
    info.value.issue_concern_request_category_type === 'Student Portal' ||
    info.value.issue_concern_request_category_type === 'Others'
  ) {
    info.value.issue_concern_request_center_office_room = "N/A";
  } else if (info.value.issue_concern_request_center_office_room === "OTHER") {
    info.value.issue_concern_request_center_office_room =
      customOffice.value || "Other";
  }

  // Auto-set owner_type to LSU when field is hidden
  if (
    info.value.issue_concern_request_category_type === 'Hardware' ||
    info.value.issue_concern_request_category_type === 'Network' ||
    info.value.issue_concern_request_category_type === 'Computer Lab' ||
    info.value.issue_concern_request_category_type === 'Accounts' ||
    info.value.issue_concern_request_category_type === 'LSU Webpages' ||
    info.value.issue_concern_request_category_type === 'Student Portal'
  ) {
    info.value.owner_type = "LSU";
  }

  // Auto-set client_role when field is hidden
  if (
    info.value.issue_concern_request_category_type === 'LSU Webpages' ||
    info.value.issue_concern_request_category_type === 'Student Portal'
  ) {
    info.value.client_role = "Staff"; // Default to Staff for these categories
  }
};

// Watch for client role changes to auto-set office for Public/Alumni
watch(() => info.value.client_role, (newRole) => {
  if (newRole === 'Public' || newRole === 'Alumni') {
    info.value.issue_concern_request_center_office_room = "N/A";
  } else if (info.value.issue_concern_request_center_office_room === "N/A") {
    // Clear the field if switching from Public/Alumni to another role
    info.value.issue_concern_request_center_office_room = "";
  }
});

// Check if user has unrated tickets (ANY status - pending, in progress, completed, etc.)
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

      // Check if ANY ticket (regardless of status) is missing rating or feedback
      const unratedTickets = userTickets.filter((ticket) => {
        const hasNoRating = !ticket.evaluation_feedback_client_star_rating ||
                           ticket.evaluation_feedback_client_star_rating === "" ||
                           ticket.evaluation_feedback_client_star_rating === null;
        const hasNoFeedback = !ticket.evaluation_feedback_client_comment ||
                             ticket.evaluation_feedback_client_comment === "" ||
                             ticket.evaluation_feedback_client_comment === null;

        // Consider a ticket unrated if it's missing BOTH rating AND feedback
        // (User must provide at least rating or feedback for each ticket)
        return hasNoRating && hasNoFeedback;
      });

      // Update reactive variables for notification banner
      unratedTicketsCount.value = unratedTickets.length;
      hasUnratedCompletedTickets.value = unratedTickets.length > 0;

      return unratedTickets.length > 0;
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

  // Check Center/Office/Room only if not Public, Alumni, Accounts, Student Portal, or Others
  const requiresOffice =
    info.value.client_role !== 'Public' &&
    info.value.client_role !== 'Alumni' &&
    info.value.issue_concern_request_category_type !== 'Accounts' &&
    info.value.issue_concern_request_category_type !== 'Student Portal' &&
    info.value.issue_concern_request_category_type !== 'Others';

  // Check Specific Concern only if not LSU Webpages or Student Portal
  const requiresSpecificConcern =
    info.value.issue_concern_request_category_type !== 'LSU Webpages' &&
    info.value.issue_concern_request_category_type !== 'Student Portal';

  // Check Requestor Role only if not LSU Webpages or Student Portal
  const requiresRequestorRole =
    info.value.issue_concern_request_category_type !== 'LSU Webpages' &&
    info.value.issue_concern_request_category_type !== 'Student Portal';

  // Check Description only if not Student Portal
  const requiresDescription = info.value.issue_concern_request_category_type !== 'Student Portal';

  if (
    (requiresOffice && !info.value.issue_concern_request_center_office_room) ||
    !info.value.issue_concern_request_category_type ||
    (requiresSpecificConcern && !info.value.issue_concern_request_item_type) ||
    (requiresRequestorRole && !info.value.client_role) ||
    (requiresDescription && !info.value.issue_concern_request_details)
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

// Function to auto-assign technicians based on category
const autoAssignTechnicians = (category, specificConcern = null) => {
  if (!category) {
    // Reset to default if no category (Michael only)
    const michael = TECHNICIANS_PERSONNEL.find(
      (tech) => tech.email === "michaeljohn.puertogalera@lsu.edu.ph"
    );
    info.value.technicians_assigned = michael
      ? [{ name: michael.name, email: michael.email }]
      : [];
    return;
  }

  // Define category-based assignments
  const categoryAssignments = {
    "Hardware": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "johny14_gonzaga@lsu.edu.ph",
      "jason.yap@lsu.edu.ph",
      "giovanni.morales@lsu.edu.ph",
      "rommel.rosal@lsu.edu.ph",
      "denzelroy.suarez@lsu.edu.ph"
    ],
    "Software": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "johny14_gonzaga@lsu.edu.ph",
      "jason.yap@lsu.edu.ph",
      "giovanni.morales@lsu.edu.ph",
      "rommel.rosal@lsu.edu.ph",
      "denzelroy.suarez@lsu.edu.ph"
    ],
    "Network": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "johny14_gonzaga@lsu.edu.ph",
      "jason.yap@lsu.edu.ph"
    ],
    "Computer Lab": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "rommel.rosal@lsu.edu.ph",
      "denzelroy.suarez@lsu.edu.ph"
    ],
    "Accounts": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "johny14_gonzaga@lsu.edu.ph",
      "jason.yap@lsu.edu.ph"
    ],
    "LSU Webpages": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "jorenlee.luna@lsu.edu.ph",
      "jason.yap@lsu.edu.ph"
    ],
    "Student Portal": [
      "michaeljohn.puertogalera@lsu.edu.ph"
    ],
    "Others": [
      "michaeljohn.puertogalera@lsu.edu.ph",
      "johny14_gonzaga@lsu.edu.ph",
      "jason.yap@lsu.edu.ph",
      "giovanni.morales@lsu.edu.ph",
      "rommel.rosal@lsu.edu.ph",
      "denzelroy.suarez@lsu.edu.ph"
    ]
  };

  // Get the email list for the category
  const emailList = categoryAssignments[category] || ["michaeljohn.puertogalera@lsu.edu.ph"];

  // Find and assign technicians based on email list
  const assignedTechs = [];
  emailList.forEach(email => {
    const tech = TECHNICIANS_PERSONNEL.find(t => t.email === email);
    if (tech) {
      assignedTechs.push({
        name: tech.name,
        email: tech.email
      });
    }
  });

  info.value.technicians_assigned = assignedTechs;
};

// Function to refine technician assignment based on Computer Lab location
const refineComputerLabAssignment = (location) => {
  if (!location || info.value.issue_concern_request_category_type !== "Computer Lab") {
    return;
  }

  // Get Michael John Puertogalera (always included)
  const michael = TECHNICIANS_PERSONNEL.find(
    (tech) => tech.email === "michaeljohn.puertogalera@lsu.edu.ph"
  );

  // Determine which technician based on location
  let assignedTech = null;

  if (location.startsWith("BVM") || location.startsWith("SJ")) {
    // BVM and SJ Buildings -> Denzel Roy Suarez
    assignedTech = TECHNICIANS_PERSONNEL.find(
      (tech) => tech.name === "Denzel Roy Suarez"
    );
  } else if (location.startsWith("LS")) {
    // LS Building -> Rommel Rosal
    assignedTech = TECHNICIANS_PERSONNEL.find(
      (tech) => tech.name === "Rommel Rosal"
    );
  }

  if (assignedTech) {
    const assignedTechs = [];

    // Always add Michael first
    if (michael) {
      assignedTechs.push({
        name: michael.name,
        email: michael.email,
      });
    }

    // Add the lab-specific technician
    assignedTechs.push({
      name: assignedTech.name,
      email: assignedTech.email,
    });

    info.value.technicians_assigned = assignedTechs;
  }
};

// Watch for category changes to auto-assign technicians
watch(
  () => info.value.issue_concern_request_category_type,
  (newCategory) => {
    autoAssignTechnicians(newCategory, info.value.issue_concern_request_item_type);
    // Clear location when category changes
    info.value.issue_concern_request_center_office_room = "";
    // Clear specific concern when category changes
    info.value.issue_concern_request_item_type = "";

    // Show modal when Student Portal is selected
    if (newCategory === 'Student Portal') {
      showStudentPortalModal.value = true;
    }
  }
);

// Watch for specific concern changes to refine technician assignment
watch(
  () => info.value.issue_concern_request_item_type,
  (newSpecificConcern) => {
    // Re-assign based on specific concern
    autoAssignTechnicians(
      info.value.issue_concern_request_category_type,
      newSpecificConcern
    );
  }
);

// Watch for Computer Lab location changes to refine technician assignment
watch(
  () => info.value.issue_concern_request_center_office_room,
  (newLocation) => {
    refineComputerLabAssignment(newLocation);
  }
);

// Watch for email changes to check for unrated tickets
watch(() => info.value.requestor_lsu_email, async (newEmail) => {
  // Reset notification if email is empty
  if (!newEmail || newEmail.trim() === "") {
    hasUnratedCompletedTickets.value = false;
    unratedTicketsCount.value = 0;
    return;
  }

  // Check for unrated tickets when email is entered
  await checkForUnratedTickets(newEmail);
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
