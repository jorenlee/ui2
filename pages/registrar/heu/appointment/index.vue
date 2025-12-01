<script setup>
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import moment from "moment";
import { ref, computed, watch } from "vue";
import axios from "axios";

const showPrivacyPolicy = ref(false);
const togglePrivacyPolicy = () => {
  showPrivacyPolicy.value = !showPrivacyPolicy.value;
};

const thankYouDisplay = ref(false);

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
const formDisplay = ref(true);

const dateToday = moment().format("MMMM DD, YYYY h:mm:ss A");

const requireAllFields = ref(false);

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
  valid_id_front: [
    {
      name: '',
      url: 'N/A',
      timestamp: dateToday,
    },
  ],
  valid_id_back: [
    {
      name: '',
      url: 'N/A',
      timestamp: dateToday,
    },
  ],
  additional_documents: [
    {
      name: '',
      url: 'N/A',
      timestamp: dateToday,
    },
  ],
  tracking_id: "LSURHEU" + moment().valueOf(),
  data_privacy: "",
  additional_response_details: [
    {
      sender: '',
      message: 'N/A',
      timestamp: dateToday,
    },
  ],
  detail_fees_type_document_requests: [],
  grand_total_payment: '',
  logs: [
    {
      timestamp: dateToday,
      status_remarks: "Received. For Verification.",
    },
  ],
});

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
  }
]);

// Document requests
const showOtherDocumentField = ref(false);
const otherDocumentRequest = ref("");
const documentRequestError = ref(false);

// Watch for changes to the "Other" checkbox and otherDocumentRequest
watch(
  [showOtherDocumentField, otherDocumentRequest],
  ([showField, otherValue]) => {
    // Remove any previous "Other: something" entries
    info.value.detail_fees_type_document_requests =
      info.value.detail_fees_type_document_requests.filter(
        (item) => {
          // Handle both object and string formats for backward compatibility
          if (typeof item === 'object' && item.fee_name) {
            return !item.fee_name.startsWith("Other:");
          }
          return typeof item === 'string' ? !item.startsWith("Other:") : true;
        }
      );

    // Add the new "Other: something" entry if applicable
    if (showField && otherValue.trim()) {
      info.value.detail_fees_type_document_requests.push({
        fee_name: `Other: ${otherValue.trim()}`,
        amount: 0
      });
    }
  }
);

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

const invalidEmail = ref(false);

const validateEmail = () => {
  if (!info.value.email) return false;
  const pattern = /^[a-zA-Z0-9._-]+@(gmail\.com|lsu\.edu\.ph)$/;
  return pattern.test(info.value.email);
};

const invalidContactNumber = ref(false);

const validateContactNumber = () => {
  if (!info.value.contact_number) return false;
  const pattern = /^(\+63|\+65)[0-9]{9,10}$/;
  return pattern.test(info.value.contact_number);
};

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

const isFormValid = computed(() => {
  const hasRequiredFields =
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
    info.value.data_privacy &&
    validateContactNumber() &&
    validateEmail() &&
    info.value.detail_fees_type_document_requests.length > 0 && // At least one document request
    (!showOtherDocumentField.value ||
      (showOtherDocumentField.value &&
        otherDocumentRequest.value.trim() !== ""));

  // Check if required files are uploaded - these are REQUIRED fields
  const hasRequiredFilesUploaded =
    // Front ID is required
    info.value.valid_id_front &&
    Array.isArray(info.value.valid_id_front) &&
    info.value.valid_id_front.length > 0 &&
    // Back ID is required
    info.value.valid_id_back &&
    Array.isArray(info.value.valid_id_back) &&
    info.value.valid_id_back.length > 0;
  // Note: credential_evaluation_requests appears to be optional based on the error

  return hasRequiredFields && hasRequiredFilesUploaded;
});

// Add these refs to track upload status
const isUploading = ref(false);
const allUploadsComplete = ref(false);

// Add a flag to track submission status
const isSubmitting = ref(false);

// File size and type validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ALLOWED_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.pdf'];
const fileSizeError = ref("");
const showFileSizeToast = ref(false);

const showFileSizeErrorToast = (fileName) => {
  fileSizeError.value = `File "${fileName}" exceeds 5MB limit. Please upload a smaller file.`;
  showFileSizeToast.value = true;
  setTimeout(() => {
    showFileSizeToast.value = false;
    fileSizeError.value = "";
  }, 5000);
};

const showFileTypeErrorToast = (fileName) => {
  fileSizeError.value = `File "${fileName}" has an invalid format. Only JPEG, PNG, JPG, or PDF files are allowed.`;
  showFileSizeToast.value = true;
  setTimeout(() => {
    showFileSizeToast.value = false;
    fileSizeError.value = "";
  }, 5000);
};

const validateFile = (file) => {
  // Check file type
  const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
  const isValidType = ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension);

  if (!isValidType) {
    showFileTypeErrorToast(file.name);
    return false;
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    showFileSizeErrorToast(file.name);
    return false;
  }

  return true;
};

const uploadFiles = async () => {
  // Check if files are selected but not yet uploaded
  const hasUnuploadedFiles =
    selectedFilesFront.value?.length > 0 ||
    selectedFilesBack.value?.length > 0 ||
    selectedFilesCredential.value?.length > 0;

  if (hasUnuploadedFiles) {
    isUploading.value = true;

    try {
      // Upload all files first
      await Promise.all([
        uploadFilesFront(),
        uploadFilesBack(),
        uploadFilesCredential(),
      ]);

      allUploadsComplete.value = true;
    } catch (error) {
      console.error("Error uploading files:", error);
      // Show error message to user
      alert("There was an error uploading your files. Please try again.");
      throw error; // Re-throw to be caught by submitForm
    } finally {
      isUploading.value = false;
    }
  }
};

const submitForm = async () => {
  if (isSubmitting.value) return; // Prevent double submission

  isSubmitting.value = true;

  try {
    // First upload files and wait for completion
    await uploadFiles();

    // Only proceed with API submission if uploads are complete
    if (!isUploading.value) {
      await postAPI();
    }
  } catch (error) {
    console.error("Error during form submission:", error);
    alert("There was an error submitting your form. Please try again.");
  } finally {
    isSubmitting.value = false;
  }
};

const requireIDS = ref(false);

const requireAllFieldsNotif = ref(false);

const postAPI = async () => {
  // Additional validation before submission
  if (
    !info.value.valid_id_front ||
    !Array.isArray(info.value.valid_id_front) ||
    info.value.valid_id_front.length === 0
  ) {
    // alert("Please upload your Government ID (Front) before submitting.");
    // return;

    requireIDS.value = true;
    setTimeout(() => {
      requireIDS.value = false;
    }, 3000);
  }

  if (
    !info.value.valid_id_back ||
    !Array.isArray(info.value.valid_id_back) ||
    info.value.valid_id_back.length === 0
  ) {
    // alert("Please upload your Government ID (Back) before submitting.");
    // return;
    requireIDS.value = true;
    setTimeout(() => {
      requireIDS.value = false;
    }, 3000);
  }

  if (info.value.data_privacy && isFormValid.value) {
    // Update the sender name in additional_response_details before submission
    if (info.value.additional_response_details && info.value.additional_response_details.length > 0) {
      info.value.additional_response_details[0].sender = info.value.firstname || 'User';
    }

    // Log the data being sent for debugging
    // console.log('Submitting data:', JSON.stringify(info.value, null, 2));
    // console.log('detail_fees_type_document_requests:', info.value.detail_fees_type_document_requests);

    await $fetch(endpoint.value + "/api/registrar/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: info.value,
    })
      .then((response) => {
        console.log(response);
        formDisplay.value = false;
        thankYouDisplay.value = true;
        submitConfirmationEmail();
      })
      .catch((error) => {
        console.error("Submission error:", error);
        alert(
          "There was an error submitting your form. Please check all required fields and try again."
        );
      });
  } else {
    // alert("Please fill in all required fields before submitting.");
    requireAllFieldsNotif.value = true;
    setTimeout(() => {
      requireAllFieldsNotif.value = false;
    }, 3000);
  }
};

const submitConfirmationEmail = async () => {
  await $fetch(endpoint.value + "/api/registrar/submit-appointment-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((response) => {
    console.log(response);
  });
};

const collegeList = ref([
  "Arts and Sciences, Engineering, Architecture, Computer Studies",
  "Business, Commerce, Accountancy",
  "Education / Graduate Studies",
  "Nursing / Tourism and Hospitality Management",
  "Criminology / BS Psychology",
]);

const courseList = ref([
  "Bachelor of Science in Business Administration (BSBA)",
  "Bachelor of Science in Accounting Information System (BSAIS)",
  "Bachelor of Science in Accountancy (BSAc)",
  "Bachelor of Science in Civil Engineering (BSCE)",
  "Bachelor of Science in Architecture (BSArch)",
  // Add more courses as needed
]);

const showAddNewCourse = ref(false);
const newCourse = ref("");

// Handle course selection change
const handleCourseChange = () => {
  if (info.value.course === "add_new") {
    showAddNewCourse.value = true;
    info.value.course = ""; // Clear the dropdown value
  } else {
    // Ensure the selected course is stored as a string
    info.value.course = String(info.value.course);
  }
};

// Add the new course to the list
const addNewCourse = () => {
  if (newCourse.value.trim()) {
    const courseString = newCourse.value.trim();
    courseList.value.push(courseString);
    info.value.course = courseString; // Store as string
    newCourse.value = "";
    showAddNewCourse.value = false;
  }
};

// Cancel adding new course
const cancelAddNew = () => {
  showAddNewCourse.value = false;
  newCourse.value = "";
  // Reset to first course in list if available
  if (courseList.value.length > 0) {
    info.value.course = String(courseList.value[0]);
  } else {
    info.value.course = "";
  }
};

// File upload for Government ID (Front)
const selectedFilesFront = ref([]);
const uploadedFilesFront = ref([]);
const uploadStatusFront = ref(null);

// File upload for Government ID (Back)
const selectedFilesBack = ref([]);
const uploadedFilesBack = ref([]);
const uploadStatusBack = ref(null);

// File upload for Credential Evaluations
const selectedFilesCredential = ref([]);
const uploadedFilesCredential = ref([]);
const uploadStatusCredential = ref(null);

// Handle file upload for Government ID (Front)
const handleFileUploadFront = (event) => {
  const files = Array.from(event.target.files);

  // Validate file size and type
  const validFiles = [];
  for (const file of files) {
    console.log(`Front ID File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    if (!validateFile(file)) {
      event.target.value = ""; // Clear the input
      return;
    }
    validFiles.push(file);
  }

  selectedFilesFront.value = validFiles;
  console.log("Front ID files:", event);
};

// Handle file upload for Government ID (Back)
const handleFileUploadBack = (event) => {
  const files = Array.from(event.target.files);

  // Validate file size and type
  const validFiles = [];
  for (const file of files) {
    console.log(`Back ID File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    if (!validateFile(file)) {
      event.target.value = ""; // Clear the input
      return;
    }
    validFiles.push(file);
  }

  selectedFilesBack.value = validFiles;
  console.log("Back ID files:", event);
};

// Handle file upload for Credential Evaluations (Multiple files)
const handleFileUploadCredential = (event) => {
  const files = Array.from(event.target.files);

  // Validate each file
  const validFiles = [];
  for (const file of files) {
    if (!validateFile(file)) {
      continue; // Skip invalid files (validation shows error toast)
    }
    validFiles.push(file);
  }

  selectedFilesCredential.value = validFiles;
  console.log("Credential files selected:", validFiles);
  validFiles.forEach((file) => {
    console.log(`Credential File: ${file.name}, Size: ${file.size} bytes`);
  });
};

// Upload Government ID (Front) files
const uploadFilesFront = async () => {
  if (!selectedFilesFront.value.length) {
    return;
  }
  const formData = new FormData();
  selectedFilesFront.value.forEach((file) => {
    formData.append("file", file);
  });
  try {
    uploadStatusFront.value = "Uploading front ID...";
    const response = await axios.post(
      endpoint.value + "/api/registrar/upload/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    uploadStatusFront.value = "Upload successful!";
    console.log("Front ID files uploaded:", response.data);

    // Handle both array and single object responses
    if (Array.isArray(response.data)) {
      uploadedFilesFront.value = response.data.map((item) => ({
        name: item.name || item.file.split("/").pop(),
        url: item.url || item.file,
        timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      }));
    } else {
      // Handle single object response
      uploadedFilesFront.value = [
        {
          name: response.data.file.split("/").pop(),
          url: response.data.file,
          timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
        },
      ];
    }

    selectedFilesFront.value = []; // Clear selected files after successful upload
    info.value.valid_id_front = uploadedFilesFront.value;
    console.log("Updated info with front ID:", info.value);
  } catch (error) {
    console.error("Front ID upload error:", error);
    uploadStatusFront.value = "Upload failed: " + error.message;
  }
};

// Upload Government ID (Back) files
const uploadFilesBack = async () => {
  if (!selectedFilesBack.value.length) {
    return;
  }
  const formData = new FormData();
  selectedFilesBack.value.forEach((file) => {
    formData.append("file", file);
  });
  try {
    uploadStatusBack.value = "Uploading back ID...";
    const response = await axios.post(
      endpoint.value + "/api/registrar/upload/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    uploadStatusBack.value = "Upload successful!";
    console.log("Back ID files uploaded:", response.data);

    // Handle both array and single object responses
    if (Array.isArray(response.data)) {
      uploadedFilesBack.value = response.data.map((item) => ({
        name: item.name || item.file.split("/").pop(),
        url: item.url || item.file,
        timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
      }));
    } else {
      // Handle single object response
      uploadedFilesBack.value = [
        {
          name: response.data.file.split("/").pop(),
          url: response.data.file,
          timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
        },
      ];
    }

    selectedFilesBack.value = []; // Clear selected files after successful upload
    info.value.valid_id_back = uploadedFilesBack.value;
    console.log("Updated info with back ID:", info.value);
  } catch (error) {
    console.error("Back ID upload error:", error);
    uploadStatusBack.value = "Upload failed: " + error.message;
  }
};

// Upload Additional Documents files (Multiple files support)
const uploadFilesCredential = async () => {
  if (!selectedFilesCredential.value.length) {
    return;
  }

  try {
    uploadStatusCredential.value = `Uploading ${selectedFilesCredential.value.length} file(s)...`;

    // Upload each file individually and collect results
    const uploadedFiles = [];

    for (let i = 0; i < selectedFilesCredential.value.length; i++) {
      const file = selectedFilesCredential.value[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        uploadStatusCredential.value = `Uploading file ${i + 1} of ${selectedFilesCredential.value.length}...`;

        const response = await $fetch(
          endpoint.value + "/api/registrar/upload/",
          {
            method: "POST",
            body: formData,
          }
        );

        console.log(`File ${i + 1} uploaded:`, response);

        // Handle both array and single object responses
        if (Array.isArray(response)) {
          const mapped = response.map((item) => ({
            name: item.name || item.file?.split("/").pop() || file.name,
            url: item.url || item.file,
            timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
          }));
          uploadedFiles.push(...mapped);
        } else {
          uploadedFiles.push({
            name: response.name || response.file?.split("/").pop() || file.name,
            url: response.url || response.file,
            timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
          });
        }
      } catch (fileError) {
        console.error(`Error uploading file ${i + 1}:`, fileError);
        // Continue with other files even if one fails
        uploadStatusCredential.value = `Error uploading ${file.name}. Continuing...`;
      }
    }

    if (uploadedFiles.length > 0) {
      uploadStatusCredential.value = `✅ Successfully uploaded ${uploadedFiles.length} file(s)!`;
      uploadedFilesCredential.value = uploadedFiles;

      // Replace the default "N/A" value with actual uploaded files
      info.value.additional_documents = uploadedFiles;

      console.log("All additional documents uploaded:", uploadedFiles);
      console.log("Updated info.additional_documents:", info.value.additional_documents);

      selectedFilesCredential.value = []; // Clear selected files after successful upload

      // Clear status after 3 seconds
      setTimeout(() => {
        uploadStatusCredential.value = "";
      }, 3000);
    } else {
      uploadStatusCredential.value = "❌ All uploads failed. Please try again.";
    }
  } catch (error) {
    console.error("Additional documents upload error:", error);
    uploadStatusCredential.value = "❌ Upload failed: " + error.message;
  }
};
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <div class="bg-green-700 lg:h-[200px] h-[130px]">
          <div
            class="lg:pt-10 absolute top-1/2 transform -translate-y-1/2 w-full"
          >
            <p
              class="font-bold uppercase text-white lg:text-2xl text-sm w-11/12 mx-auto"
            >
              REGISTRAR
            </p>
            <p class="text-xs w-11/12 mx-auto text-white">
              Higher Education Registrar Appointment
            </p>
          </div>
        </div>

        <div class="shadow-lg text-green-700">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/registrar" class="mr-2 hover:underline lg:h-10"
                  >Home</a
                >
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
          
          </div>
        </div>
      </div>
    </div>
    <div v-if="formDisplay" class="">
      <div
        class="header bg-gradient-to-b from-[#fefefe] via-[#fefefe] to-[#bce3c2] lg:pt-5 pt-1"
      >
        <div class="lg:w-11/12 w-11/12 mx-auto bg-white">
          <!-- <form v-on:submit.prevent="submitForm" class=""> -->
          <div>
            <div class="border-2 border-green-700 shadow-lg my-3">
              <div class="">
                <div class="bg-green-900 text-white">
                  <h2
                    class="lg:text-base text-sm px-3 uppercase py-1.5 font-bold text-center tracking-wide"
                  >
                    Request Appointment Form

                    <!-- <span class="font-light text-xs bg-green-900 text-white block">
                      {{ info.document_code }}</span> -->
                  </h2>

                  <p
                    class="text-white text-[11px] text-center py-1 bg-green-950 lg:px-1 px-3"
                  >
                    Graduates can request documents online through this form,
                    avoiding in-person appointments at LSU.
                  </p>
                </div>

                <!-- <div class="w-fit mx-auto text-xs mt-4 px-4 font-montserrat tracking-tight"> DRS No. <span class="border-b px-1">{{ info.tracking_id }}</span></div> -->
                <div class="lg:p-5 px-2 pt-3 pb-2 gap-3">
                  <div class="w-full lg:mb-0 mb-5">
                    <div class="w-full gap-3">
                      <div class="gap-3 w-full">
                        <div class="gap-3 lg:mb-2 shadow py-2 px-2">
                          <div class="lg:gap-x-2 gap-x-1 w-full">
                            <div class="lg:flex gap-x-2">
                              <div class="w-full mb-2">
                                <label
                                  class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                >
                                  <div class="">
                                    Fullname
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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
                                <p
                                  v-if="invalidContactNumber"
                                  class="text-xs text-red-700 mt-2 px-1"
                                >
                                  Please enter a valid phone number with country
                                  code +63
                                </p>
                              </div>

                              <div class="lg:w-10/12 w-full mb-2">
                                <label
                                  class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                >
                                  <div class="">
                                    Email
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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
                                <p
                                  v-if="invalidEmail"
                                  class="text-xs text-red-700 mt-2 px-1"
                                >
                                  Only Valid email addresses are accepted.
                                </p>
                              </div>
                            </div>

                            <div class="lg:flex gap-x-2">
                              
                              <div class="lg:w-fit mb-2">
                                <label
                                  class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                >
                                  <div class="">
                                    Did you graduate in ICC/LSU?
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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
                                        <label
                                          class="lg:text-sm text-xs hover:font-bold"
                                          for="yes"
                                        >
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
                                        <label
                                          class="lg:text-sm text-xs hover:font-bold"
                                          for="no"
                                        >
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
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
                                  </div>
                                </label>
                                <div class="w-full">
                                  <select
                                    class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                    required
                                    v-model="info.year_graduated_last_attended"
                                  >
                                    <option value="" disabled selected>
                                      Select Year
                                    </option>
                                    <option
                                      v-for="year in _.range(
                                        moment().year(),
                                        1930,
                                        -1
                                      )"
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
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
                                  </div>
                                </label>
                                <div class="w-full">
                                  <select
                                    v-model="info.college"
                                    class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                    required
                                  >
                                    <option value="" disabled selected>
                                      Choose
                                    </option>
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
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
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

                            <div class="lg:flex gap-x-2"></div>

                            <div class="lg:flex gap-x-2">
                              <div class="w-full mb-2">
                                <label
                                  class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                >
                                  <div class="">
                                    Type of Document Requests
                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
                                  </div>
                                </label>
                                <div
                                  class="w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm p-2"
                                >
                                  <div class="space-y-2">
                                    <div
                                      v-for="(
                                        document, index
                                      ) in documentRequestOptions"
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
                                        <label
                                          :for="'doc_' + index"
                                          class="text-xs"
                                          >{{ document.fee_name }}</label
                                        >
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
                                      <label for="other_doc" class="text-xs"
                                        >Other:</label
                                      >

                                      <input
                                        v-if="showOtherDocumentField"
                                        type="text"
                                        v-model="otherDocumentRequest"
                                        class="ml-2 px-2 py-1 border-b border-green-700 bg-transparent text-xs w-full"
                                        placeholder="Please specify"
                                      />
                                    </div>
                                  </div>

                                  <p
                                    v-if="documentRequestError"
                                    class="text-xs text-red-700 mt-2"
                                  >
                                    Please select at least one document type
                                  </p>
                                </div>
                              </div>

                              
                           <div class="w-full mb-2">
 <label
                                  class="lg:text-xs text-[10px] text-green-950 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                >
                                  <div class="">Upload Government-Issued Valid ID For Verification <span
                                        class="text-red-600 font-normal text-sm"
                                        >*</span
                                      ></div>
                                </label>
                                <div class="w-full">
                                 






                              <!-- File Size Error Toast -->
                              <transition name="toast">
                                <div
                                  v-if="showFileSizeToast"
                                  class="fixed inset-0 flex items-center justify-center px-5 z-50 bg-black/50"
                                >
                                  <div
                                    class="bg-red-600 text-white px-2 py-4 rounded-lg shadow-2xl border-2 border-red-700 animate-shake"
                                  >
                                    <div class="flex items-start gap-3">
                                      <div class="flex-shrink-0">
                                        <i
                                          class="fa fa-exclamation-triangle text-2xl"
                                        ></i>
                                      </div>
                                      <div class="flex-1">
                                        <h4 class="font-bold mb-1">
                                          File Size Limit Exceeded
                                        </h4>
                                        <p class="text-[8px]">
                                          {{ fileSizeError }}
                                        </p>
                                        <p class="text-xs mt-2 opacity-90">
                                          <i class="fa fa-info-circle mr-1"></i>
                                          Maximum file size for Government IDs
                                          is 5MB
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

                              <div
                                class=""
                              >
                                <!-- Government ID (Front) -->
                                <!-- <div class="w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-green-800 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                  >
                                    <div class="">
                                      Government Issue ID (Front)
                                      <span
                                        class="text-red-600 font-normal text-sm"
                                        >*</span
                                      >
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="file"
                                      class="lg:px-2 py-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                      @change="handleFileUploadFront"
                                      id="file-upload-front"
                                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    />

                                    <div v-if="uploadStatusFront">
                                      {{ uploadStatusFront }}
                                    </div>
                                    <div
                                      v-for="file in uploadedFilesFront"
                                      :key="file.url"
                                    >
                                      <img
                                        v-if="
                                          file.url.includes('jpg') ||
                                          file.url.includes('png')
                                        "
                                        :src="file.url"
                                        alt="Uploaded Front ID"
                                        class="lg:w-80 w-full"
                                      />
                                    </div>
                                    <div
                                      v-for="file in selectedFilesFront"
                                      :key="file.name"
                                      class="my-4 shadow-lg px-2 py-3 border-2"
                                    >
                                      <span class="font-bold block">
                                        {{
                                          (file.size / 1024 / 1024).toFixed(2)
                                        }}
                                        MB size
                                      </span>
                                    </div>
                                  </div>
                                </div> -->
                                <!-- Government ID (Back) -->
                                <!-- <div class="w-full mb-2">
                                  <label
                                    class="lg:text-xs text-[10px] text-green-800 pb-2 font-bold whitespace-nowrap lg:w-6/12"
                                  >
                                    <div class="">
                                      Government Issue ID (Back)
                                      <span
                                        class="text-red-600 font-normal text-sm"
                                        >*</span
                                      >
                                    </div>
                                  </label>
                                  <div class="w-full">
                                    <input
                                      type="file"
                                      class="lg:px-2 py-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                      @change="handleFileUploadBack"
                                      id="file-upload-back"
                                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    />

                                    <div v-if="uploadStatusBack">
                                      {{ uploadStatusBack }}
                                    </div>
                                    <div
                                      v-for="file in uploadedFilesBack"
                                      :key="file.url"
                                    >
                                      <img
                                        v-if="
                                          file.url.includes('jpg') ||
                                          file.url.includes('png')
                                        "
                                        :src="file.url"
                                        alt="Uploaded Back ID"
                                        class="lg:w-80 w-full"
                                      />
                                    </div>
                                    <div
                                      v-for="file in selectedFilesBack"
                                      :key="file.name"
                                      class="my-4 shadow-lg px-2 py-3 border-2"
                                    >
                                      <span class="font-bold block">
                                        {{
                                          (file.size / 1024 / 1024).toFixed(2)
                                        }}
                                        MB size
                                      </span>
                                    </div>
                                  </div>
                                </div> -->

                                <div class="w-full mb-2">
                                
                                  <p class="text-xs mb-1 tracking-tight"> Select multiple files for any additional documents.</p>
                                  <div class="w-full">
                                    <input
                                      type="file"
                                      class="lg:px-2 py-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                      @change="handleFileUploadCredential"
                                      id="file-upload-credential"
                                      multiple
                                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                    />

                                    <!-- Upload Status -->
                                    <div v-if="uploadStatusCredential" class="mt-2 text-xs">
                                      <div
                                        :class="uploadStatusCredential.includes('successful') ? 'text-green-600' : uploadStatusCredential.includes('failed') ? 'text-red-600' : 'text-blue-600'"
                                        class="flex items-center gap-2"
                                      >
                                        <i class="fa fa-spinner fa-spin" v-if="uploadStatusCredential.includes('Uploading')"></i>
                                        <i class="fa fa-check-circle" v-else-if="uploadStatusCredential.includes('successful')"></i>
                                        <i class="fa fa-exclamation-circle" v-else-if="uploadStatusCredential.includes('failed')"></i>
                                        {{ uploadStatusCredential }}
                                      </div>
                                    </div>

                                    <!-- Uploaded Files Display -->
                                    <div
                                      v-if="uploadedFilesCredential && uploadedFilesCredential.length > 0"
                                      class="mt-3 space-y-2"
                                    >
                                      <div class="text-xs font-semibold text-green-700 mb-2">
                                        <i class="fa fa-check-circle mr-1"></i>Uploaded Files:
                                      </div>
                                      <div
                                        v-for="file in uploadedFilesCredential"
                                        :key="file.url"
                                        class="bg-green-50 border border-green-200 rounded px-2 py-2"
                                      >
                                        <div class="flex items-center gap-2">
                                          <img
                                            v-if="file.url && (file.url.includes('jpg') || file.url.includes('jpeg') || file.url.includes('png'))"
                                            :src="file.url"
                                            alt="Uploaded Credential"
                                            class="w-12 h-12 object-cover rounded border border-gray-300"
                                          />
                                          <i v-else class="fa fa-file-o text-green-600 text-lg"></i>
                                          <div class="flex-1 min-w-0">
                                            <div class="text-xs font-semibold text-gray-800 truncate">
                                              {{ file.name || 'Document' }}
                                            </div>
                                            <a
                                              v-if="file.url"
                                              :href="file.url"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              class="text-xs text-green-600 hover:text-green-800 hover:underline"
                                            >
                                              <i class="fa fa-external-link"></i> View
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <!-- Selected Files Preview (Before Upload) -->
                                    <div
                                      v-if="selectedFilesCredential && selectedFilesCredential.length > 0"
                                      class="mt-3 space-y-2"
                                    >
                                      <div class="text-xs font-semibold text-gray-700 mb-2">
                                        <i class="fa fa-clock-o mr-1"></i>Selected Files ({{ selectedFilesCredential.length }}):
                                      </div>
                                      <div
                                        v-for="(file, index) in selectedFilesCredential"
                                        :key="file.name + index"
                                        class="bg-blue-50 border border-blue-200 rounded px-2 py-2 flex items-center justify-between"
                                      >
                                        <div class="flex items-center gap-2 flex-1 min-w-0">
                                          <i class="fa fa-file-o text-blue-600"></i>
                                          <span class="text-xs truncate">{{ file.name }}</span>
                                        </div>
                                        <span class="text-xs font-semibold text-gray-600 ml-2">
                                          {{ (file.size / 1024 / 1024).toFixed(2) }} MB
                                        </span>
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

                        

                            <!-- <div
                              v-if="requireIDS"
                              class="text-red-600 text-xs mt-1"
                            >
                              Government ID (Front) is required
                            </div>

                            <div
                              v-if="requireIDS"
                              class="text-red-600 text-xs mt-1"
                            >
                              Government ID (Back) is required
                            </div> -->

                            <div
                              v-if="requireAllFieldsNotif"
                              class="text-red-600 text-xs mt-1"
                            >
                              Required all Fields
                            </div>

                            <div class="">
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

                              <div
                                v-if="showPrivacyPolicy"
                                class="border border-gray-300 lg:p-4 p-2 bg-white text-xs"
                              >
                                <p class="font-bold text-green-900 mb-2">
                                  PRIVACY NOTICE
                                </p>
                                <p class="mb-2">
                                  At the
                                  <span class="text-green-800 font-semibold"
                                    >La Salle University Registrar's
                                    Office</span
                                  >, we are committed to protecting the privacy
                                  and security of your personal information.
                                  This Privacy Notice explains how we collect,
                                  use, disclose, and protect your information
                                  when you interact with our office.
                                </p>

                                <p class="font-bold text-green-800 mt-4 mb-1">
                                  INFORMATION WE COLLECT
                                </p>
                                <p class="mb-1">
                                  We collect various types of personal
                                  information necessary for providing our
                                  services, including but not limited to:
                                </p>
                                <ol
                                  class="list-decimal lg:ml-6 ml-3 mb-3 space-y-1"
                                >
                                  <li>
                                    <span class="font-semibold"
                                      >Contact Information:</span
                                    >
                                    Name, address, email address, phone number,
                                    and other contact details
                                  </li>
                                  <li>
                                    <span class="font-semibold"
                                      >Identification Information:
                                    </span>
                                    Student ID number, government-issued
                                    identification details,
                                  </li>
                                  <li>
                                    <span class="font-semibold"
                                      >Academic Information:</span
                                    >
                                    Course enrollment, grades, academic
                                    progress, and transcripts.
                                  </li>
                                  <li>
                                    <span class="font-semibold"
                                      >Co-curricular Information:</span
                                    >
                                    Service learnings, outreach activities,
                                    Field Trips, Internship or apprenticeship
                                    compliance.
                                  </li>
                                  <li>
                                    <span class="font-semibold"
                                      >Financial Information:
                                    </span>
                                    Payment details, financial aid information,
                                    promissory notes.
                                  </li>
                                  <li>
                                    <span class="font-semibold"
                                      >Pictures and Videos
                                    </span>
                                    of activities you participate in, via
                                    official documentation of such activities.
                                  </li>
                                  <li>
                                    <span class="font-semibold"
                                      >Other Information:</span
                                    >
                                    Any additional information you provide to us
                                    in the course of our interactions.
                                  </li>
                                </ol>

                                <p class="font-bold text-green-800 mt-4 mb-1">
                                  HOW WE COLLECT YOUR INFORMATION
                                </p>
                                <p class="mb-1">
                                  We use the information we collect for the
                                  following purposes:
                                </p>
                                <ol
                                  class="list-decimal lg:ml-6 ml-3 mb-3 space-y-1"
                                >
                                  <li>
                                    Providing Registrar services, including
                                    enrollment, course registration, and
                                    academic records management;
                                  </li>
                                  <li>
                                    Communicating with you regarding
                                    administrative matters, such as changes to
                                    policies or procedures;
                                  </li>
                                  <li>
                                    Processing financial transactions related to
                                    your academic activities;
                                  </li>
                                  <li>
                                    Analyzing and improving our services,
                                    systems, and operations;
                                  </li>
                                  <li>
                                    Complying with legal obligations and
                                    regulatory requirements;
                                  </li>
                                  <li>
                                    Soliciting your participation in research
                                    and non-commercial surveys sanctioned by the
                                    University;
                                  </li>
                                  <li>
                                    Sharing of grades between and among academic
                                    administrators and offices, for academic
                                    deliberations and evaluation of student
                                    performance;
                                  </li>
                                </ol>

                                <p class="font-bold text-green-800 mt-4 mb-1">
                                  DISCLOSURE OF YOUR INFORMATION
                                </p>
                                <p class="mb-1">
                                  We may disclose your personal information in
                                  the following circumstances:
                                </p>
                                <ol
                                  class="list-decimal lg:ml-6 ml-3 mb-3 space-y-1"
                                >
                                  <li>
                                    To authorized personnel within La Salle
                                    University who require access to fulfill
                                    their duties.
                                  </li>
                                  <li>
                                    To educational institutions or organizations
                                    as required to facilitate academic processes
                                    (e.g., transcript requests, enrollment
                                    verification).
                                  </li>
                                  <li>
                                    To third-party service providers who assist
                                    us in carrying out our functions and
                                    services.
                                  </li>
                                  <li>
                                    When required by law or legal process, such
                                    as in response to a subpoena or court order.
                                  </li>
                                  <li>
                                    In emergencies or situations involving the
                                    health or safety of individuals.
                                  </li>
                                  <li>
                                    To Government agencies for legitimate
                                    planning purposes directly related to
                                    education and student welfare. Such purposes
                                    may include enrollment forecasting, program
                                    evaluation, research studies, and policy
                                    development
                                  </li>
                                </ol>

                                <p class="font-bold text-green-800 mt-4 mb-1">
                                  DATA SECURITY
                                </p>
                                <p class="mb-2">
                                  We implement appropriate technical and
                                  organizational measures to protect your
                                  personal information against unauthorized
                                  access, disclosure, alteration, or
                                  destruction.
                                </p>

                                <p class="font-bold text-green-800 mt-4 mb-1">
                                  CONTACT US
                                </p>
                                <p class="mb-3">
                                  If you have any questions, concerns, or
                                  complaints about our Privacy Notice or our
                                  handling of your personal information, please
                                  contact us at
                                  <span class="text-blue-600"
                                    >registrar@lsu.edu.ph</span
                                  >
                                </p>
                              </div>

                              <div
                                class="border border-gray-300 lg:p-4 p-2 bg-white text-xs"
                                :class="{ 'border-t-0': showPrivacyPolicy }"
                              >
                                <div class="flex items-center">
                                  <p for="privacy_agreement" class="text-xs">
                                    By checking the box below, you agree with
                                    the

                                    <span
                                      @click="togglePrivacyPolicy"
                                      class="hover:uppercase cursor-pointer underline text-blue-800"
                                    >
                                      Privacy Policy
                                    </span>

                                    <span
                                      class="text-red-600 font-normal text-sm"
                                      >*</span
                                    >
                                  </p>
                                </div>
                                <div class="flex items-center gap-x-1">
                                  <span>
                                    <input
                                      type="checkbox"
                                      id="privacy_agreement"
                                      v-model="info.data_privacy"
                                      class="mt-1"
                                      required
                                      value="I agree"
                                    />
                                  </span>
                                  <span>
                                    <label
                                      for="privacy_agreement"
                                      :class="
                                        info.data_privacy ? 'font-bold' : ''
                                      "
                                    >
                                      I agree
                                    </label>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="requireAllFields"
                  class="my-10 w-11/12 mx-auto text-white bg-red-800 text-center py-2 px-5 block lg:text-sm text-xs"
                >
                  All fields are required!
                </div>

                <div class="pb-5 lg:px-5 px-3 mb-1">
                  <div
                    @click.prevent="submitForm"
                    :disabled="!isFormValid || isUploading || isSubmitting"
                    class="px-10 lg:rounded-lg rounded-md text-center font-bold py-1.5 lg:w-fit w-full mx-auto block uppercase border-2 hover:bg-white hover:text-green-900 lg:text-sm text-xs justify-center shadow-xl"
                    :class="
                      !isFormValid || isUploading || isSubmitting
                        ? 'bg-[#0d6d28] text-white border-[#0d6d28] cursor-not-allowed'
                        : 'bg-green-900 text-white  border-[#10561c] cursor-pointer'
                    "
                  >
                    <span
                      v-if="isSubmitting || isUploading"
                      class="justify-center"
                    >
                      <i class="fa fa-spinner fa-spin mr-2"></i>
                      {{ isUploading ? "Uploading..." : "Submitting..." }}
                    </span>
                    <span v-else class="justify-center">
                      <i class="fa fa-paper-plane mr-2" aria-hidden="true"></i>
                      Submit
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!--Waves Container-->
        <div>
          <svg
            class="waves"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shape-rendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g class="parallax">
              <use
                xlink:href="#gentle-wave"
                x="48"
                y="0"
                fill="rgba(255,255,255,0.7"
              />
              <use
                xlink:href="#gentle-wave"
                x="48"
                y="3"
                fill="rgba(255,255,255,0.5)"
              />
              <use
                xlink:href="#gentle-wave"
                x="48"
                y="5"
                fill="rgba(255,255,255,0.3)"
              />
              <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
            </g>
          </svg>
        </div>
        <!--Waves end-->
      </div>
    </div>
    <div v-if="thankYouDisplay" class="">
      <div
        class="lg:flex gap-10 lg:rounded-4xl bg-white lg:px-14 px-3 py-1 lg:w-fit w-full mx-auto lg:my-10 shadow-sm"
      >
        <div class="flex items-center">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
            class="lg:w-44 w-20 mx-auto lg:mt-0 mt-14"
          />
        </div>
        <div
          class="text-xl text-green-900 text-center w-fit mx-auto lg:py-20 py-5"
        >
          <h1 class="font-bold text-3xl">Thanks for submitting!</h1>
          <p class="font-light pt-3 pb-10">Your request has been sent!</p>
          <p class="font-light text-xs italic mb-10">
            Please check your email.
          </p>
          <a
            href="https://lsu.edu.ph/registrar"
            class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 mx-auto w-fit lg:block hidden text-sm uppercase"
          >
            <i class="fa fa-arrow-circle-left mr-4"></i> Registrar
          </a>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>
<style scoped>
input[type="radio"] {
  margin: 3px auto auto auto;
}

.error {
  color: red;
}

.waves {
  position: relative;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px;
  /*Fix for safari gap*/
  min-height: 100px;
  max-height: 150px;
}

/* Animation */
.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/*Shrinking for mobile*/
@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }

  .content {
    height: 30vh;
  }

  h1 {
    font-size: 24px;
  }
}

/* Toast Notification Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
</style>
