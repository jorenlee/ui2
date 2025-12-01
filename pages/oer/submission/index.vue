<script setup>
import { ref, computed } from "vue";
import moment from "moment";
import axios from "axios";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// UI state
const formDisplay = ref(true);
const thankYouDisplay = ref(false);
const submitCounter = ref(1);
const isSubmitting = ref(false); // ✅ add this

const dateToday = moment().format("MMMM DD, YYYY h:mm:ss A");
const activeTab = ref("resource");

// Tabs
const tabs = [
  { key: "resource", label: "1. Resource Information" },
  { key: "category", label: "2. Category Details" },
  { key: "submit", label: "3. Submit and Confirm" },
];

// Dropdown options
const targetAudienceList = ref([
  "Pre-School",
  "Grade School",
  "Junior High",
  "Senior High",
  "Tertiary",
  "Graduate School",
]);

const licenseList = ref([
  "CC BY - Attribution",
  "CC BY-NC - Attribution-NonCommercial",
  "CC BY-NC-ND - Attribution-NonCommercial-NoDerivatives",
  "CC BY-NC-SA - Attribution-NonCommercial-ShareAlike",
  "CC BY-ND - Attribution-NoDerivatives",
  "CC BY-SA - Attribution-ShareAlike",
]);

const fileFormatList = ref(["PDF", "MP4", "MP3"]);
const languageList = ref(["English", "Tagalog", "English and Tagalog"]);

const collegeList = ref([
  "OPR",
  "VPSS",
  "VPLM",
  "VPFAS",
  "VPAD",
  "VPALS",
  "OCH - Career Counseling Center",
  "OCH - University Registrar",
  "OCH - Learning Resource Center",
  "OCH - Educational Technology Center",
  "OCH - Institutional Research and Publications",
  "OCH - Vice-Chancellor for Academics Affairs",
  "HEU - School of Graduate Studies",
  "HEU - College of Tourism and Hospitality Management",
  "HEU - College of Teacher Education",
  "HEU - College of Computer Studies, Engineering and Architecture",
  "HEU - College of Business and Accountancy",
  "HEU - College of Arts and Sciences",
  "HEU - College Of Criminal Justice Education",
  "HEU - College of Nursing",
  "Basic Education Unit",
]);

// Programs by college
const programsByCollege = ref({
  "HEU - College of Computer Studies, Engineering and Architecture": [
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information Technology",
    "Bachelor of Science in Computer Engineering",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Architecture",
  ],
  "HEU - College of Business and Accountancy": [
    "Bachelor of Science in Business Administration",
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Entrepreneurship",
  ],
  "HEU - College of Arts and Sciences": [
    "Bachelor of Arts in English",
    "Bachelor of Science in Biology",
    "Bachelor of Science in Mathematics",
    "Bachelor of Science in Psychology",
  ],
  "HEU - College of Teacher Education": [
    "Bachelor of Elementary Education",
    "Bachelor of Secondary Education",
    "Bachelor of Physical Education",
  ],
  "HEU - College of Tourism and Hospitality Management": [
    "Bachelor of Science in Tourism Management",
    "Bachelor of Science in Hospitality Management",
  ],
  "HEU - College Of Criminal Justice Education": [
    "Bachelor of Science in Criminology",
  ],
  "HEU - College of Nursing": ["Bachelor of Science in Nursing"],
});

// Main form data
const info = ref({
  // Contributor
  contributor_name: "",
  program: "",
  college_or_unit: "",
  contributor_email: "",

  // Resource
  resource_files: [],
  video_links: "",
  title: "",
  author_and_affiliation: "",
  description_abstract: "",
  type_of_entry: "", // Document or Video

  // Category
  subject_areas: "",
  keywords: "",
  target_audience: "",
  license_chosen: "",
  languages: "",

  // Additional
  learning_objectives: "",
  accessibility_notes: "",
  lasallian_relevance: "",
  relation_to_other_resources: "",
  source_attribution: "",

  // System
  tracking_id: "LSUOER" + moment().valueOf(),
  logs: [
    {
      timestamp: dateToday,
      status_remarks: "Received. For Checking.",
      status_update: "Submitted",
      status_update_by: "OER",
    },
  ],
});

// Validation
const pattern = /^[a-zA-Z0-9._-]+@(lsu\.edu\.ph|gmail\.com)$/;
const invalidEmail = ref(false);

const availablePrograms = computed(
  () => programsByCollege.value[info.value.college_or_unit] || []
);

const showProgramField = computed(() => availablePrograms.value.length > 0);

const isResourceTabValid = computed(() => {
  // Contributor fields validation
  const contributorValid =
    info.value.contributor_name.trim() &&
    info.value.contributor_email.trim() &&
    info.value.college_or_unit.trim() &&
    (!showProgramField.value || info.value.program.trim());

  // Base resource fields validation
  const baseValid =
    info.value.title.trim() &&
    info.value.author_and_affiliation.trim() &&
    info.value.description_abstract.trim() &&
    info.value.type_of_entry.trim();

  let resourceValid = false;

  if (info.value.type_of_entry === "Document") {
    resourceValid =
      baseValid &&
      (info.value.resource_files.length > 0 ||
        selectedResourceFiles.value.length > 0);
  } else if (info.value.type_of_entry === "Video") {
    resourceValid = baseValid && info.value.video_links.trim();
  }

  // Both contributor and resource fields must be valid
  return contributorValid && resourceValid;
});

const isCategoryTabValid = computed(
  () =>
    info.value.subject_areas.trim() &&
    info.value.keywords.trim() &&
    info.value.target_audience.trim() &&
    info.value.license_chosen.trim() &&
    info.value.languages.trim()
);

// Tab navigation
const canNavigateToTab = (tabKey) => {
  switch (tabKey) {
    case "resource":
      return true;
    case "category":
      return isResourceTabValid.value;
    case "submit":
      return isResourceTabValid.value && isCategoryTabValid.value;
    default:
      return false;
  }
};

const onCollegeChange = () => {
  info.value.program = "";
};

// File handling
const selectedResourceFiles = ref([]);
const uploadStatusResourceFiles = ref(null);
const uploadedResourceFiles = ref([]);

const onResourceFilesChange = (event) => {
  selectedResourceFiles.value = Array.from(event.target.files);
};

// Upload files
const uploadResourceFiles = async () => {
  if (!selectedResourceFiles.value.length) return;
  const formData = new FormData();
  selectedResourceFiles.value.forEach((file) => formData.append("file", file));

  try {
    uploadStatusResourceFiles.value = "Uploading resource files...";
    const response = await axios.post(
      endpoint.value + "/api/oer/upload/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    uploadStatusResourceFiles.value = "Upload successful!";

    uploadedResourceFiles.value = Array.isArray(response.data)
      ? response.data.map((item) => ({
          name: item.name || item.file.split("/").pop(),
          url: item.url || item.file,
        }))
      : [
          {
            name: response.data.file.split("/").pop(),
            url: response.data.file,
          },
        ];

    info.value.resource_files = uploadedResourceFiles.value;
    selectedResourceFiles.value = [];
  } catch (error) {
    uploadStatusResourceFiles.value = "Upload failed: " + error.message;
    console.error("Resource file upload error:", error);
  }
};

const postAPI = async () => {
  if (isSubmitting.value) return; // prevent double submission
  isSubmitting.value = true;

  try {
    // If user selected files, upload them first
    await uploadResourceFiles();

    // ✅ Add default resource file if none exists
    if (!info.value.resource_files || info.value.resource_files.length === 0) {
      info.value.resource_files = [
        {
          name: "N/A",
          url: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/registrar/ImageNotFound.png",
        },
      ];
    }

    // Submit the form
    await $fetch(endpoint.value + "/api/oer/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: info.value,
    });

    formDisplay.value = false;
    thankYouDisplay.value = true;

    console.log("Form submitted:", info.value);
    await submitOERFormToGmail();
  } catch (error) {
    console.error("Submission error:", error);
  } finally {
    isSubmitting.value = false; // reset when done
  }
};

// Gmail notification
const submitOERFormToGmail = async () => {
  try {
    const response = await $fetch(
      endpoint.value + "/api/oer/oer-notification-submit/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: info.value,
      }
    );
    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Notification error:", error);
  }
};
</script>

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
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Metau: LSU OER
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/oer" class="mr-1"> Metau: LSU OER </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="font-montserrat bg-gray-50">
      <!-- Hero Banner -->
      <section
        class="relative bg-gradient-to-r from-green-700 via-green-600 to-green-800"
      >
        <div v-if="formDisplay" class="">
          <div class="header lg:pt-5 pt-1">
            <div class="w-11/12 mx-auto bg-white">
              <form v-on:submit.prevent="postAPI" class="">
                <div class="border-2 border-green-700 shadow-lg my-3">
                  <div class="">
                    <h2
                      class="lg:text-base text-sm px-3 uppercase py-1.5 font-bold bg-green-900 text-center tracking-wide border-b-4 border-yellow-300 text-white"
                    >
                      Document Information
                    </h2>

                    <div class="p-4 lg:p-6 space-y-8 bg-gray-50 text-black">
                      <div class="">
                        <!-- Tabs -->
                        <div
                          class="lg:flex lg:text-base text-xs lg:justify-evenly border-b mb-6"
                        >
                          <div
                            v-for="tab in tabs"
                            :key="tab.key"
                            @click="
                              canNavigateToTab(tab.key)
                                ? (activeTab = tab.key)
                                : null
                            "
                            class="w-full text-center px-4 py-2 font-semibold -mb-px border-b-2 transition"
                            :class="[
                              activeTab === tab.key
                                ? 'border-green-600 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700',
                              !canNavigateToTab(tab.key)
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer',
                            ]"
                            :disabled="!canNavigateToTab(tab.key)"
                          >
                            {{ tab.label }}
                          </div>
                        </div>

                        <!-- Resource Information Tab -->
                        <div
                          v-if="activeTab === 'resource'"
                          class="rounded-xl shadow-sm border border-blue-200 p-4 lg:p-6 space-y-4"
                        >
                          <div
                            class="flex items-center gap-2 text-blue-800 font-semibold text-base"
                          >
                            <span class="text-lg">📄</span>
                            <h3>Resource Information</h3>
                            <div
                              class="flex-1 border-b border-blue-200 ml-2"
                            ></div>
                          </div>

                          <div class="">
                            <div class="lg:flex gap-4 mb-4">
                              <!-- Contributor Name -->
                              <div class="w-full lg:mb-0 mb-4">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Name of Contributor
                                  <span class="text-red-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter your full name"
                                  v-model="info.contributor_name"
                                  required
                                  class="w-full rounded-md border border-green-300 focus:ring-2 focus:ring-green-600 text-sm px-3 py-2"
                                />
                              </div>
                              <!-- Email -->
                              <div class="w-full lg:mb-0 mb-4">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Email <span class="text-red-600">*</span>
                                </label>
                                <input
                                  type="email"
                                  placeholder="your.name@lsu.edu.ph"
                                  v-model="info.contributor_email"
                                  required
                                  class="w-full rounded-md border border-green-300 focus:ring-2 focus:ring-green-600 text-sm px-3 py-2"
                                />
                              </div>
                              <!-- College or Unit -->
                              <div class="w-full lg:mb-0 mb-4">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  College or Unit
                                  <span class="text-red-600">*</span>
                                </label>
                                <select
                                  v-model="info.college_or_unit"
                                  @change="onCollegeChange"
                                  required
                                  class="w-full rounded-md border border-green-300 focus:ring-2 focus:ring-green-600 text-sm px-3 py-2"
                                >
                                  <option value="" disabled>
                                    Select College or Unit
                                  </option>
                                  <option
                                    v-for="college in collegeList"
                                    :key="college"
                                    :value="college"
                                  >
                                    {{ college }}
                                  </option>
                                </select>
                              </div>
                              <!-- Program -->
                              <div class="w-full" v-if="showProgramField">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Program <span class="text-red-600">*</span>
                                </label>
                                <select
                                  v-model="info.program"
                                  required
                                  class="w-full rounded-md border border-green-300 focus:ring-2 focus:ring-green-600 text-sm px-3 py-2"
                                >
                                  <option value="" disabled>
                                    Select Program
                                  </option>
                                  <option
                                    v-for="program in availablePrograms"
                                    :key="program"
                                    :value="program"
                                  >
                                    {{ program }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div class="lg:flex gap-4 w-full mb-4">
                              <!-- Title -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Title <span class="text-red-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter resource title"
                                  v-model="info.title"
                                  required
                                  class="w-full rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-600 text-sm px-3 py-2"
                                />
                              </div>
                              <!-- Author and Affiliation -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Author and Affiliation
                                  <span class="text-red-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Author Name, Institution/Department"
                                  v-model="info.author_and_affiliation"
                                  required
                                  class="w-full rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-600 text-sm px-3 py-2"
                                />
                              </div>
                            </div>

                            <!-- Description/Abstract -->
                            <div class="w-full mb-4">
                              <label
                                class="block text-xs font-bold text-gray-700 mb-1"
                              >
                                Description/Abstract
                                <span class="text-red-600">*</span>
                              </label>
                              <textarea
                                placeholder="Provide a detailed description of the resource..."
                                v-model="info.description_abstract"
                                required
                                rows="1"
                                class="w-full rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-600 text-sm px-3 py-2"
                              ></textarea>
                            </div>

                            <div class="lg:flex gap-x-4">
                              <div class="lg:w-3/12 w-full">
                                <!-- Type of Entry -->
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Type of Entry
                                  <span class="text-red-600">*</span>
                                </label>
                                <div
                                  class="flex gap-x-10 w-full rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-600 text-sm px-3 py-2"
                                >
                                  <label
                                    class="flex items-center gap-2 text-sm cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      value="Document"
                                      v-model="info.type_of_entry"
                                      class="text-blue-600"
                                    />
                                    Document
                                  </label>
                                  <label
                                    class="flex items-center gap-2 text-sm cursor-pointer"
                                  >
                                    <input
                                      type="radio"
                                      value="Video"
                                      v-model="info.type_of_entry"
                                      class="text-blue-600"
                                    />
                                    Video
                                  </label>
                                </div>
                              </div>

                              <div class="lg:flex gap-4 w-full">
                                <!-- Resource Files (show only if Document) -->
                                <div
                                  class="w-full lg:flex gap-x-4"
                                  v-if="info.type_of_entry === 'Document'"
                                >
                                  <div class="w-full">
                                    <label
                                      class="block text-xs font-bold text-gray-700 mb-1"
                                    >
                                      Resource Files
                                      <span class="text-red-600">*</span>
                                    </label>
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/*"
                                      @change="onResourceFilesChange"
                                      class="w-full rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-600 text-sm px-3 py-1.5"
                                    />
                                  </div>

                                  <div
                                    class=""
                                    v-if="selectedResourceFiles.length > 0"
                                  >
                                    <div
                                      class="whitespace-nowrap px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 h-10 flex items-center w-fit mt-5"
                                    >
                                      Upload File ({{
                                        selectedResourceFiles.length
                                      }})
                                    </div>

                                    <div
                                      v-if="uploadStatusResourceFiles"
                                      class="mt-1 text-xs"
                                      :class="
                                        uploadStatusResourceFiles.includes(
                                          'failed'
                                        )
                                          ? 'text-red-600'
                                          : 'text-green-600'
                                      "
                                    >
                                      {{ uploadStatusResourceFiles }}
                                    </div>

                                    <div
                                      v-if="uploadedResourceFiles.length > 0"
                                      class="mt-2"
                                    >
                                      <p class="text-xs text-gray-600 mb-1">
                                        Uploaded Files:
                                      </p>
                                      <div
                                        v-for="file in uploadedResourceFiles"
                                        :key="file.url"
                                        class="text-xs text-blue-600"
                                      >
                                        <a
                                          :href="file.url"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {{ file.name }}
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <!-- Video Links (show only if Video) -->
                                <div
                                  class="w-full"
                                  v-if="info.type_of_entry === 'Video'"
                                >
                                  <label
                                    class="block text-xs font-bold text-gray-700 mb-1"
                                  >
                                    Video Link
                                    <span class="text-red-600">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="URL Link e.g https://www.youtube.com/watch?v=1234567890"
                                    v-model="info.video_links"
                                    class="w-full rounded-md border border-blue-300 focus:ring-2 focus:ring-blue-600 text-sm px-3 py-2"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="flex justify-end pt-10">
                            <div
                              @click="
                                isResourceTabValid
                                  ? (activeTab = 'category')
                                  : null
                              "
                              class="flex items-center gap-x-4 px-3 py-1 rounded-lg cursor-pointer font-bold border w-fit"
                              :class="
                                isResourceTabValid
                                  ? 'border-green-800 bg-green-800 text-white hover:bg-white hover:text-green-800'
                                  : 'border-gray-400 bg-gray-400 text-gray-200 cursor-not-allowed'
                              "
                            >
                              Next <i class="fa fa-angle-double-right"></i>
                            </div>
                          </div>
                        </div>

                        <!-- Category Details Tab -->
                        <div
                          v-if="activeTab === 'category'"
                          class="rounded-xl shadow-sm border border-purple-200 p-4 lg:p-6 space-y-4"
                        >
                          <div
                            class="flex items-center gap-2 text-purple-800 font-semibold text-base"
                          >
                            <span class="text-lg">📂</span>
                            <h3>Category Details</h3>
                            <div
                              class="flex-1 border-b border-purple-200 ml-2"
                            ></div>
                          </div>
                          <div class="">
                           <div class="w-full lg:flex gap-x-4"> 
                             <div class="w-full lg:flex gap-x-4">
                              <!-- Subject Areas -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Subject Areas
                                  <span class="text-red-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="Mathematics, Science, Engineering"
                                  v-model="info.subject_areas"
                                  required
                                  class="w-full rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-600 text-sm px-3 py-2"
                                />
                              </div>
                              <!-- Keywords -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Keywords <span class="text-red-600">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="keyword1, keyword2, keyword3"
                                  v-model="info.keywords"
                                  required
                                  class="w-full rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-600 text-sm px-3 py-2"
                                />
                              </div>
                            </div>

                            <div class="w-full lg:flex gap-4 mb-4">
                              <!-- Target Audience -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Target Audience
                                  <span class="text-red-600">*</span>
                                </label>
                                <select
                                  v-model="info.target_audience"
                                  required
                                  class="w-full rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-600 text-sm px-3 py-2"
                                >
                                  <option value="" disabled selected>
                                    Select Target Audience
                                  </option>
                                  <option
                                    v-for="audience in targetAudienceList"
                                    :key="audience"
                                    :value="audience"
                                  >
                                    {{ audience }}
                                  </option>
                                </select>
                              </div>

                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  License Type
                                  <span class="text-red-600">*</span>
                                </label>

                                <!-- License Type -->
                                <select
                                  v-model="info.license_chosen"
                                  required
                                  class="w-full rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-600 text-sm px-3 py-2"
                                >
                                  <option value="" disabled selected>
                                    Select License Type
                                  </option>
                                  <option
                                    v-for="license in licenseList"
                                    :key="license"
                                    :value="license"
                                  >
                                    {{ license }}
                                  </option>
                                </select>
                              </div>

                              

                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Language
                                  <span class="text-red-600">*</span>
                                </label>

                                <!-- Language -->
                                <select
                                  v-model="info.languages"
                                  required
                                  class="w-full rounded-md border border-purple-300 focus:ring-2 focus:ring-purple-600 text-sm px-3 py-2"
                                >
                                  <option value="" disabled selected>
                                    Select Language
                                  </option>
                                  <option
                                    v-for="language in languageList"
                                    :key="language"
                                    :value="language"
                                  >
                                    {{ language }}
                                  </option>
                                </select>
                              </div>
                            </div>

                           </div>
                            <div class="lg:flex gap-4">
                              <!-- Learning Objectives -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Learning Objectives
                                </label>
                                <textarea
                                  placeholder="List the learning objectives this resource addresses..."
                                  v-model="info.learning_objectives"
                                  rows="2"
                                  class="w-full rounded-md border border-orange-300 focus:ring-2 focus:ring-orange-600 text-sm px-3 py-2"
                                ></textarea>
                              </div>
                              <!-- Accessibility Notes -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Accessibility Notes
                                </label>
                                <textarea
                                  placeholder="Any accessibility features or considerations..."
                                  v-model="info.accessibility_notes"
                                  rows="2"
                                  class="w-full rounded-md border border-orange-300 focus:ring-2 focus:ring-orange-600 text-sm px-3 py-2"
                                ></textarea>
                              </div>
                              <!-- Lasallian Relevance -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Lasallian Relevance
                                </label>
                                <textarea
                                  placeholder="How does this resource relate to Lasallian values and mission..."
                                  v-model="info.lasallian_relevance"
                                  rows="2"
                                  class="w-full rounded-md border border-orange-300 focus:ring-2 focus:ring-orange-600 text-sm px-3 py-2"
                                ></textarea>
                              </div>
                              <!-- Relation to Other Resources -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Relation to Other Resources
                                </label>
                                <textarea
                                  placeholder="How this resource relates to or builds upon other resources..."
                                  v-model="info.relation_to_other_resources"
                                  rows="2"
                                  class="w-full rounded-md border border-orange-300 focus:ring-2 focus:ring-orange-600 text-sm px-3 py-2"
                                ></textarea>
                              </div>
                              <!-- Source Attribution -->
                              <div class="w-full">
                                <label
                                  class="block text-xs font-bold text-gray-700 mb-1"
                                >
                                  Source Attribution
                                </label>
                                <textarea
                                  placeholder="Attribution information for sources used in this resource..."
                                  v-model="info.source_attribution"
                                  rows="2"
                                  class="w-full rounded-md border border-orange-300 focus:ring-2 focus:ring-orange-600 text-sm px-3 py-2"
                                ></textarea>
                              </div>
                            </div>
                          </div>
                          <div class="flex justify-between pt-10">
                            <div
                              @click="activeTab = 'resource'"
                              class="flex items-center gap-x-4 px-3 py-1 rounded-lg cursor-pointer font-bold border border-green-800 text-white bg-green-800 hover:text-green-800 hover:bg-white w-fit"
                            >
                              <i class="fa fa-angle-double-left"></i> Previous
                            </div>
                            <div
                              @click="
                                isCategoryTabValid
                                  ? (activeTab = 'submit')
                                  : null
                              "
                              class="flex items-center gap-x-4 px-3 py-1 rounded-lg cursor-pointer font-bold border w-fit"
                              :class="
                                isCategoryTabValid
                                  ? 'border-green-800 bg-green-800 text-white hover:bg-white hover:text-green-800'
                                  : 'border-gray-400 bg-gray-400 text-gray-200 cursor-not-allowed'
                              "
                            >
                              Next <i class="fa fa-angle-double-right"></i>
                            </div>
                          </div>
                        </div>

                        <!-- Submit and Confirm Tab -->
                        <div
                          v-if="activeTab === 'submit'"
                          class="rounded-xl shadow-sm border border-red-200 p-4 lg:p-6 space-y-4"
                        >
                          <div
                            class="flex items-center gap-2 text-red-800 font-semibold text-base"
                          >
                            <span class="text-lg">✅</span>
                            <h3>Submit and Confirm</h3>
                            <div
                              class="flex-1 border-b border-red-200 ml-2"
                            ></div>
                          </div>
                          <div class="space-y-4">
                            <p class="text-gray-700">
                              Please review your information before submitting.
                            </p>
                            <div class="flex justify-between pt-10">
                              <div
                                @click="activeTab = 'category'"
                                class="flex items-center gap-x-4 px-3 py-1 rounded-lg cursor-pointer font-bold border border-green-800 text-white bg-green-800 hover:text-green-800 hover:bg-white w-fit"
                              >
                                <i class="fa fa-angle-double-left"></i> Previous
                              </div>
                              <button
                                type="button"
                                class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
                                :disabled="isSubmitting"
                                @click="postAPI"
                              >
                                <span v-if="isSubmitting">Submitting...</span>
                                <span v-else>Submit</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
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

        <div class="py-20" v-if="thankYouDisplay">
          <div
            class="lg:flex gap-10 lg:rounded-4xl bg-white lg:px-14 px-3 py-10 lg:w-fit w-full mx-auto shadow-sm"
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
              <p class="font-light pt-3 pb-10">Your resource has been sent!</p>
              <p class="font-light text-xs italic mb-10">
                Please check your email.
              </p>
              <a
                href="https://lsu.edu.ph/oer"
                class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 mx-auto w-fit lg:block hidden text-sm uppercase"
              >
                <i class="fa fa-arrow-circle-left mr-4"></i> Back to Main Page
              </a>
            </div>
          </div>
        </div>
      </section>
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

/* input[type="file"] {
  display: none;
} */

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
</style>
