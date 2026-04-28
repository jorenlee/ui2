<script setup>
import moment from "moment";
import { ref, computed } from "vue";
import _ from "lodash";

const governmentIDFile = ref(null);

const handleGovernmentIDUpload = (e) => {
  const file = e.target.files[0];
  governmentIDFile.value = file || null;
};

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const thankYouDisplay = ref(false);
const formDisplay = ref(true);
const showPrivacyPolicy = ref(false);

const togglePrivacyPolicy = () => {
  showPrivacyPolicy.value = !showPrivacyPolicy.value;
};

const showFileSizeToast = ref(false);
const fileSizeError = ref("");
const isUploading = ref(false);
const uploadStatusCredential = ref("");
const showOtherDocumentField = ref(false);
const otherDocumentRequest = ref("");
const documentRequestError = ref(false);

// Calculate min date (90 years ago from today)
const minBirthDate = computed(() => {
  const today = new Date();
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 90);
  return minDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
});

// Calculate max date (15 years ago from today)
const maxBirthDate = computed(() => {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - 15);
  return maxDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD
});
const uploadedFilesCredential = ref([]);
const selectedFilesCredential = ref([]);
const isSubmitting = ref(false);

// Phone helpers: keep country code and restrict digits
const defaultContactPrefix = "+63";
const onContactFocus = () => {
  if (!info.value.contact_number)
    info.value.contact_number = defaultContactPrefix;
};
const onContactInput = (e) => {
  let val = e.target.value || "";
  if (!val || val === "+") {
    info.value.contact_number = defaultContactPrefix;
    return;
  }
  // Determine prefix
  let prefix = defaultContactPrefix;
  if (val.startsWith("+63")) prefix = "+63";
  else if (val.startsWith("+65")) prefix = "+65";
  else if (val.startsWith("+")) {
    // keep '+' then assume default
    prefix = defaultContactPrefix;
  }
  // Sanitize remaining digits after prefix
  let rest = val.slice(prefix.length).replace(/[^0-9]/g, "");
  const maxDigits = 10;
  rest = rest.slice(0, maxDigits);
  info.value.contact_number = prefix + rest;
};
const onContactKeydown = (e) => {
  const val = info.value.contact_number || "";
  const prefix = val.startsWith("+65") ? "+65" : "+63";
  const caretStart = e.target.selectionStart ?? 0;
  if (
    (e.key === "Backspace" && caretStart <= prefix.length) ||
    (e.key === "Delete" && caretStart < prefix.length)
  ) {
    e.preventDefault();
  }
};

const validateEmail = () => {
  if (!info.value.email) return false;
  const pattern =
    /^[a-zA-Z0-9._-]+@(gmail\.com|yahoo\.com|bing\.com|microsoft\.com|lsu\.edu\.ph)$/;
  return pattern.test(info.value.email);
};

const validateContactNumber = () => {
  if (!info.value.contact_number) return false;
  const pattern = /^(\+63|\+65)[0-9]{9,10}$/;
  return pattern.test(info.value.contact_number);
};

const collegeList = ref([
  "Arts and Sciences, Engineering, Architecture, Computer Studies",
  "Business, Commerce, Accountancy",
  "Education / Graduate Studies",
  "Nursing / Tourism and Hospitality Management",
  "Criminology / BS Psychology",
]);

// Document request options as a dynamic array
const documentRequestOptions = ref([
  {
    fee_name: "Transcript of Records",
    amount: 85,
  },
  {
    fee_name: "Transfer of Credentials (Honorable Dismissal)",
    amount: 0,
  },
  {
    fee_name: "CAV (Certification, Authentication, Verification)",
    amount: 0,
  },
  {
    fee_name: "Credential Evaluations (WES, CGFNS, NCLEX, SpanTran, IES, etc.)",
    amount: 0,
  },
]);

const dateToday = moment().format("MMMM DD, YYYY h:mm:ss A");

// ================= STATE =================
const info = ref({
  firstname: "",
  middlename: "",
  lastname: "",
  birthdate: "",
  mother_maiden_name: "",
  contact_number: "+63",
  email: "",
  alumni: "",
  college: "",
  course: "",
  year_graduated_last_attended: "",
  details: "",
  tracking_id: "LSURHEU" + moment().valueOf(),
  data_privacy: "no",
  grand_total_payment: "",
  additional_documents: [],
  additional_response_details: [
    {
      sender: "",
      message: "N/A",
      timestamp: dateToday,
    },
  ],
  detail_fees_type_document_requests: [],
  logs: [
    {
      timestamp: dateToday,
      status_remarks: "Received. For Verification.",
    },
  ],
});

// ================= UI =================
const toast = ref({ show: false, message: "" });
const showToast = (msg) => {
  toast.value = { show: true, message: msg };
  setTimeout(() => (toast.value.show = false), 3000);
};

// ================= FILE =================
const selectedFiles = ref([]);
const uploadedFiles = ref([]);

// ================= UPLOAD =================
const uploadFiles = async () => {
  if (!selectedFiles.value.length) return;

  const fd = new FormData();

  selectedFiles.value.forEach((file) => {
    fd.append("file", file);
  });

  const res = await $fetch(`${endpoint}/api/registrar/v3/upload/`, {
    method: "POST",
    body: fd,
  });

  const files = Array.isArray(res) ? res : [res];

  uploadedFiles.value = files.map((f) => ({
    name: f.name,
    url: f.url,
    timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
  }));

  info.value.additional_documents = uploadedFiles.value;
};

const toasterValidNotice = ref(false);

const isFormValid = computed(() => {
  const hasGovernmentID = governmentIDFile.value !== null; // ✅ FIX

  return (
    info.value.firstname &&
    info.value.middlename &&
    info.value.lastname &&
    info.value.birthdate &&
    info.value.mother_maiden_name &&
    info.value.contact_number &&
    info.value.email &&
    info.value.alumni &&
    info.value.college &&
    info.value.course &&
    info.value.year_graduated_last_attended &&
    info.value.data_privacy === "yes" &&
    validateContactNumber() &&
    validateEmail() &&
    hasGovernmentID
  );
});
const submitForm = async () => {
  if (!governmentIDFile.value) {
    toasterValidNotice.value = true;
    return;
  }

  if (!isFormValid.value) {
    toasterValidNotice.value = true;
    return;
  }

  toasterValidNotice.value = false;
  isSubmitting.value = true;

  try {
    isUploading.value = true;

    // 👇 Pass the selected file to your upload function
    await uploadFiles(governmentIDFile.value);

    // After upload, backend-ready files
    info.value.additional_documents = [
      ...uploadedFilesCredential.value, // contains uploaded ID
      ...uploadedFiles.value,
    ];

    const res = await $fetch(`${endpoint}/api/registrar/v3/create/`, {
      method: "POST",
      body: info.value,
    });

    thankYouDisplay.value = true;
    formDisplay.value = false;

    showToast("Submitted successfully!");
  } catch (err) {
    console.error(err);
    showToast("Submission failed");
  } finally {
    isSubmitting.value = false;
    isUploading.value = false;
  }
};
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="bg-green-700 lg:h-[200px] h-[130px]">
      <p
        class="font-bold uppercase text-white lg:text-2xl text-sm w-11/12 mx-auto lg:pt-28 pt-20"
      >
        REGISTRAR
      </p>
      <p class="text-xs w-11/12 mx-auto text-white">
        Higher Education Registrar Appointment
      </p>
    </div>

    <div
      class="shadow-lg text-green-700 lg:flex border-gray-200 flex items-center capitalize text-xs lg:border-b-0 border-b px-2 py-3"
    >
      <div>
        <a href="/registrar" class="mr-2 hover:underline lg:h-10">Home</a>
      </div>
      <div>
        <i class="fas fa-caret-right"></i>
        <a
          href="/registrar/heu/appointment"
          class="mx-2 hover:underline lg:h-10"
          >HEU Appointment</a
        >
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="toast.show"
        class="fixed top-4 right-4 z-[99999] px-4 py-3 rounded-lg shadow-2xl text-white text-xs flex items-center gap-3 max-w-sm"
        :class="{
          'bg-green-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error',
          'bg-blue-600': toast.type === 'info',
          'bg-yellow-600': toast.type === 'warning',
        }"
      >
        <i
          class="fa"
          :class="{
            'fa-check-circle': toast.type === 'success',
            'fa-exclamation-circle': toast.type === 'error',
            'fa-info-circle': toast.type === 'info',
            'fa-exclamation-triangle': toast.type === 'warning',
          }"
        ></i>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <div
      v-if="formDisplay"
      class="header bg-gradient-to-b from-[#fefefe] via-[#fefefe] to-[#bce3c2] lg:w-11/12 w-11/12 mx-auto bg-white border-2 border-green-700 shadow-lg my-3"
    >
      <div class="bg-green-900 text-white">
        <h2
          class="lg:text-base text-sm px-3 uppercase py-1.5 font-bold text-center tracking-wide"
        >
          Document Request Form
        </h2>
        <p
          class="text-white text-[11px] text-center py-1 bg-green-950 lg:px-1 px-3"
        >
          Graduates can request documents online through this form, avoiding
          in-person appointments at LSU.
        </p>
      </div>
      <div class="lg:gap-x-2 gap-x-1 w-full p-2 bg-white">
        <div class="lg:flex gap-x-2">
          <div class="w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Fullname
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div class="w-full flex lg:gap-x-2 gap-x-1">
              <input
                type="text"
                class="lg:px-2 px-1 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                placeholder="First Name"
                v-model="info.firstname"
                required
              />
              <input
                type="text"
                class="lg:px-2 px-1 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                placeholder="Middle Name"
                v-model="info.middlename"
                required
              />
              <input
                type="text"
                class="lg:px-2 px-1 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                placeholder="Last Name"
                v-model="info.lastname"
                required
              />
            </div>
          </div>

          <div class="lg:w-fit w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Date of Birth
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div
              class="w-full flex items-center gap-x-1 bg-white border-b-2 border-green-700 shadow-lg rounded-sm h-fit"
            >
              <input
                type="date"
                class="px-1 w-full border-t-0 border-x-0 border-green-700 lg:h-[34px] h-8 text-xs"
                placeholder="Date of Birth"
                :min="minBirthDate"
                :max="maxBirthDate"
                v-model="info.birthdate"
                required
              />
            </div>
          </div>

          <div class="lg:w-9/12 w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Mother's Full Maiden Name
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div
              class="w-full flex items-center gap-x-1 bg-white border-b-2 border-green-700 shadow-lg rounded-sm h-fit"
            >
              <input
                type="text"
                class="px-2 w-full border-t-0 border-x-0 border-green-700 lg:h-9 h-8 text-xs py-2"
                placeholder="Mother's Full Maiden Name"
                v-model="info.mother_maiden_name"
                required
              />
            </div>
          </div>

          <div class="lg:w-6/12 w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Contact Number
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div
              class="w-full flex items-center gap-x-1 bg-white border-b-2 border-green-700 shadow-lg rounded-sm h-fit"
            >
              <input
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                class="px-2 w-full border-t-0 border-x-0 border-green-700 lg:h-9 h-8 text-xs py-2"
                placeholder="e.g. +639210689089"
                v-model="info.contact_number"
                @focus="onContactFocus"
                @input="onContactInput"
                @keydown="onContactKeydown"
                pattern="^(\+63|\+65)[0-9]{9,10}$"
                maxlength="13"
                title="Please enter a valid phone number with country code +63 or +65"
                required
              />
            </div>
          </div>

          <div class="lg:w-10/12 w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Email
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>

            <div
              class="w-full flex items-center gap-x-1 bg-white border-b-2 border-green-700 shadow-lg rounded-sm h-fit"
            >
              <input
                type="email"
                class="px-2 w-full border-t-0 border-x-0 border-green-700 lg:h-9 h-8 text-xs py-2"
                placeholder="e.g. user.name@gmail.com"
                v-model="info.email"
                required
                title="Please enter a valid Email Address"
              />
            </div>
          </div>
        </div>
        <div class="lg:flex gap-x-2">
          <div class="lg:w-fit mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Did you graduate in ICC/LSU?
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div class="w-full">
              <div
                class="flex px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
              >
                <div class="w-fit mx-auto flex">
                  <div
                    class="flex gap-x-2 items-center w-[70px] justify-center"
                  >
                    <span>
                      <input
                        type="radio"
                        value="yes"
                        v-model="info.alumni"
                        class="mr-1"
                        required
                        id="yes"
                      />
                    </span>
                    <label class="lg:text-sm text-xs hover:font-bold" for="yes">
                      Yes
                    </label>
                  </div>
                  <div
                    class="flex gap-x-2 items-center w-[70px] justify-center"
                  >
                    <span>
                      <input
                        type="radio"
                        value="no"
                        v-model="info.alumni"
                        class="mr-1"
                        required
                        id="no"
                      />
                    </span>
                    <label class="lg:text-sm text-xs hover:font-bold" for="no">
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:w-fit mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Year Graduated or Last Attended
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div class="w-full">
              <select
                class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                required
                v-model="info.year_graduated_last_attended"
              >
                <option value="" disabled selected>Select Year</option>
                <option
                  v-for="year in _.range(moment().year(), 1930, -1)"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </option>
              </select>
            </div>
          </div>

          <div class="w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                College
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div class="w-full">
              <select
                v-model="info.college"
                class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                required
              >
                <option value="" disabled selected>Choose</option>
                <option
                  v-for="(college, index) in collegeList"
                  :key="index"
                  :value="college"
                >
                  {{ college }}
                </option>
              </select>
            </div>
          </div>

          <div class="w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Course
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div>
              <input
                type="text"
                class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                placeholder="Course"
                v-model="info.course"
                required
              />
            </div>
          </div>
        </div>
        <div class="lg:flex gap-x-2">
          <div class="w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Type of Document Requests
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <div
              class="w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm p-2"
            >
              <div class="lg:space-y-3.5">
                <div
                  v-for="(document, index) in documentRequestOptions"
                  :key="index"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :id="'doc_' + index"
                      :value="document"
                      v-model="info.detail_fees_type_document_requests"
                      class="mr-2"
                    />
                    <label :for="'doc_' + index" class="text-xs">{{
                      document.fee_name
                    }}</label>
                  </div>
                </div>
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    id="other_doc"
                    value="other"
                    v-model="showOtherDocumentField"
                    class="mr-2"
                  />
                  <label for="other_doc" class="text-xs">Other:</label>

                  <input
                    v-if="showOtherDocumentField"
                    type="text"
                    v-model="otherDocumentRequest"
                    class="ml-2 px-2 py-1 border-b border-green-700 bg-transparent text-xs w-full"
                    placeholder="Please specify"
                  />
                </div>
              </div>
              <p v-if="documentRequestError" class="text-xs text-red-700 mt-2">
                Please select at least one document type
              </p>
            </div>
          </div>
          <div class="w-full mb-2">
            <label
              class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
            >
              <div class="">
                Upload Government-Issued Valid ID For Verification
                <span class="text-red-600 font-normal text-sm">*</span>
              </div>
            </label>
            <transition name="toast">
              <div
                v-if="showFileSizeToast"
                class="fixed inset-0 flex items-center justify-center px-5 z-50 bg-black/50"
              >
                <div
                  class="bg-red-600 text-white px-2 py-4 rounded-lg shadow-2xl border-2 border-red-700"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0">
                      <i class="fa fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <div class="flex-1">
                      <h4 class="font-bold mb-1">File Size Limit Exceeded</h4>
                      <p class="text-[8px]">
                        {{ fileSizeError }}
                      </p>
                      <p class="text-xs mt-2 opacity-90">
                        <i class="fa fa-info-circle mr-1"></i>
                        Maximum file size for Government IDs is 5MB
                      </p>
                    </div>
                    <button
                      @click="showFileSizeToast = false"
                      class="flex-shrink-0 text-white hover:text-red-200 transition-colors"
                    >
                      <i class="fa fa-times text-xl"></i>
                    </button>
                  </div>
                </div>
              </div>
            </transition>
            <div class="w-full mb-2">
              <p
                class="text-xs mb-1 tracking-tight font-semibold text-gray-700"
              >
                Please upload a valid Government ID or Document (required).
              </p>
              <p class="text-[10px] mb-2 text-gray-600 flex items-start gap-1">
                <i class="fa fa-info-circle text-blue-600 mt-0.5"></i>
                <span>
                  <span class="font-semibold">Allowed formats:</span>
                  JPG, JPEG, PNG, PDF only.
                  <span class="font-semibold">Maximum size:</span>
                  5MB per file.
                </span>
              </p>
              <div class="w-full">
                <input
                  type="file"
                  required
                  @change="handleGovernmentIDUpload"
                  class="lg:px-2 py-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                  id="file-upload-credential"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                />

                <!-- Upload Status -->
                <div v-if="uploadStatusCredential" class="mt-2 text-xs">
                  <div
                    :class="
                      uploadStatusCredential.includes('successful')
                        ? 'text-green-600'
                        : uploadStatusCredential.includes('failed')
                          ? 'text-red-600'
                          : 'text-blue-600'
                    "
                    class="flex items-center gap-2"
                  >
                    <i
                      class="fa fa-spinner fa-spin"
                      v-if="uploadStatusCredential.includes('Uploading')"
                    ></i>
                    <i
                      class="fa fa-check-circle"
                      v-else-if="uploadStatusCredential.includes('successful')"
                    ></i>
                    <i
                      class="fa fa-exclamation-circle"
                      v-else-if="uploadStatusCredential.includes('failed')"
                    ></i>
                    {{ uploadStatusCredential }}
                  </div>
                </div>

                <!-- Uploaded Files Display -->
                <div
                  v-if="
                    uploadedFilesCredential &&
                    uploadedFilesCredential.length > 0
                  "
                  class="mt-3 space-y-2"
                >
                  <div class="text-xs font-semibold text-green-700 mb-2">
                    <i class="fa fa-check-circle mr-1"></i>Uploaded Files ({{
                      uploadedFilesCredential.length
                    }}):
                  </div>
                  <div
                    v-for="(file, index) in uploadedFilesCredential"
                    :key="file.url"
                    class="bg-green-50 border border-green-200 rounded px-3 py-2"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <img
                          v-if="
                            file.url &&
                            (file.url.includes('jpg') ||
                              file.url.includes('jpeg') ||
                              file.url.includes('png'))
                          "
                          :src="file.url"
                          alt="Uploaded Credential"
                          class="w-12 h-12 object-cover rounded border border-gray-300"
                        />
                        <i
                          v-else
                          class="fa fa-file-pdf-o text-green-600 text-2xl"
                        ></i>
                        <div class="flex-1 min-w-0">
                          <div
                            class="text-xs font-semibold text-gray-800 truncate"
                          >
                            {{ file.name || "Document" }}
                          </div>
                          <div class="text-xs text-gray-600">
                            {{
                              file.size
                                ? (file.size / 1024 / 1024).toFixed(2) + " MB"
                                : "Size unknown"
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <a
                          v-if="file.url"
                          :href="file.url"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors flex items-center gap-1"
                          title="View file"
                        >
                          <i class="fa fa-eye"></i>
                          <span class="hidden sm:inline">View</span>
                        </a>
                        <button
                          @click="removeUploadedFileCredential(index)"
                          class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center gap-1"
                          title="Remove file"
                        >
                          <i class="fa fa-trash"></i>
                          <span class="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Files Preview (Before Upload) -->
                <div
                  v-if="
                    selectedFilesCredential &&
                    selectedFilesCredential.length > 0
                  "
                  class="mt-3 space-y-2"
                >
                  <div class="text-xs font-semibold text-gray-700 mb-2">
                    <i class="fa fa-clock-o mr-1"></i>Selected Files ({{
                      selectedFilesCredential.length
                    }}):
                  </div>
                  <div
                    v-for="(file, index) in selectedFilesCredential"
                    :key="file.name + index"
                    class="bg-blue-50 border border-blue-200 rounded px-3 py-2"
                  >
                    <div class="flex items-center justify-between gap-3">
                      <div class="flex items-center gap-2 flex-1 min-w-0">
                        <i class="fa fa-file-o text-blue-600 text-lg"></i>
                        <div class="flex-1 min-w-0">
                          <div
                            class="text-xs font-semibold text-gray-800 truncate"
                          >
                            {{ file.name }}
                          </div>
                          <div class="text-xs text-gray-600">
                            {{ (file.size / 1024 / 1024).toFixed(2) }}
                            MB
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          @click="viewFile(file)"
                          class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors flex items-center gap-1"
                          title="View file"
                        >
                          <i class="fa fa-eye"></i>
                          <span class="hidden sm:inline">View</span>
                        </button>
                        <button
                          @click="removeFileCredential(index)"
                          class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center gap-1"
                          title="Remove file"
                        >
                          <i class="fa fa-trash"></i>
                          <span class="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-full mb-2">
              <label
                class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
              >
                <div class="">Purpose</div>
              </label>
              <div class="w-full">
                <textarea
                  class="px-2 py-2 box-border w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm text-xs"
                  placeholder="Purpose"
                  v-model="info.details"
                  rows="2"
                  cols="50"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div
          @click="togglePrivacyPolicy"
          class="text-green-800 px-2 py-1 bg-gray-50 font-bold text-center text-sm cursor-pointer transition-colors"
        >
          <p>
            PRIVACY POLICY
            <span class="text-xs ml-1">{{
              showPrivacyPolicy ? "▲" : "▼"
            }}</span>
          </p>
        </div>
        <RegistrarPrivacyPolicy v-if="showPrivacyPolicy" />
        <div
          class="border border-gray-300 lg:p-4 p-2 bg-white text-xs"
          :class="{ 'border-t-0': showPrivacyPolicy }"
        >
          <div class="flex items-center">
            <p for="privacy_agreement" class="text-xs">
              By checking the box below, you agree with the

              <span
                @click="togglePrivacyPolicy"
                class="hover:uppercase cursor-pointer underline text-blue-800"
              >
                Privacy Policy
              </span>

              <span class="text-red-600 font-normal text-sm">*</span>
            </p>
          </div>
          <div class="flex items-center gap-x-1">
            <span>
              <input
                type="checkbox"
                id="privacy_agreement"
                v-model="info.data_privacy"
                :true-value="'yes'"
                :false-value="'no'"
                class="mt-1"
                required
              />
            </span>
            <span>
              <label
                for="privacy_agreement"
                :class="info.data_privacy === 'yes' ? 'font-bold' : ''"
              >
                I agree
              </label>
            </span>
          </div>
        </div>
        <div v-if="toasterValidNotice" class="text-red-600 mb-2">
          Government Issued ID or Document is required.
        </div>

        <button
          @click="submitForm"
          :disabled="!isFormValid || isSubmitting || isUploading"
          :class="[
            'lg:px-5 mt-5 mb-1 px-10 lg:rounded-lg rounded-md text-center font-bold py-1.5 lg:w-2/12 w-full mx-auto block uppercase border-2 shadow-xl',
            !isFormValid || isSubmitting || isUploading
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-green-800 hover:bg-white hover:text-green-900 text-white cursor-pointer',
          ]"
        >
          <span v-if="isUploading || isSubmitting" class="justify-center">
            <i class="fa fa-spinner fa-spin mr-2"></i>
            {{ isUploading ? "Uploading..." : "Submitting..." }}
          </span>

          <span v-else class="justify-center">
            <i class="fa fa-paper-plane mr-2"></i>
            Submit
          </span>
        </button>
      </div>
    </div>
    <ThankYouNotifFromFormSubmit v-if="thankYouDisplay" />
    <Footer />
  </div>
</template>
