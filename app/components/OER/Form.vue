<script setup>
import { ref, computed, onMounted, defineAsyncComponent } from "vue";
import moment from "moment";
import axios from "axios";

const emit = defineEmits(["change-view"]);

// Dynamic import of List component for fallback/in-place tab switching
const OERList = defineAsyncComponent(() => import("./List.vue"));

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
const { user } = useAuth();

// Navigation Tabs state
const activeTab = ref("form");
const totalSubmissionsCount = ref(0);

// UI state
const formDisplay = ref(true);
const thankYouDisplay = ref(false);
const isSubmitting = ref(false);
const submittedTrackingId = ref("");
const submittedTitle = ref("");

const dateToday = moment().format("MMMM DD, YYYY h:mm:ss A");

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

const generateTrackingId = () => "LSUOER" + moment().valueOf();

// Main form data
const info = ref({
    // Contributor
    contributor_name: user.value?.name || "",
    program: "",
    college_or_unit: "",
    contributor_email: user.value?.email || "",

    // Resource
    resource_files: [],
    video_links: "",
    google_doc_link: "",
    title: "",
    author_and_affiliation: "",
    description_abstract: "",
    type_of_entry: "Document", // Default to Document

    // Category
    subject_areas: "",
    keywords: "",
    target_audience: "",
    license_chosen: "",
    languages: "English",

    // Additional
    learning_objectives: "",
    accessibility_notes: "",
    lasallian_relevance: "",
    relation_to_other_resources: "",
    source_attribution: "",

    // System
    tracking_id: generateTrackingId(),
    logs: [
        {
            timestamp: dateToday,
            status_remarks: "Received. For Checking.",
            status_update: "Submitted",
            status_update_by: "OER",
        },
    ],
});

// Fetch total count for tab badge
const fetchTotalCount = async () => {
    try {
        const data = await $fetch(`${endpoint.value}/api/oer/list/`);
        if (Array.isArray(data)) {
            totalSubmissionsCount.value = data.length;
        }
    } catch {
        // silent fail
    }
};

onMounted(() => {
    fetchTotalCount();
});

const switchView = (target) => {
    if (target === "list") {
        emit("change-view", "ViewOERList");
        activeTab.value = "list";
    } else {
        emit("change-view", "ViewOERForm");
        activeTab.value = "form";
    }
};

const availablePrograms = computed(
    () => programsByCollege.value[info.value.college_or_unit] || []
);

const showProgramField = computed(() => availablePrograms.value.length > 0);

const onCollegeChange = () => {
    info.value.program = "";
};

// File handling
const selectedResourceFiles = ref([]);
const uploadStatusResourceFiles = ref(null);
const uploadedResourceFiles = ref([]);
const fileValidationError = ref("");

const ALLOWED_OER_EXTS = [".docx", ".doc", ".pdf"];

const onResourceFilesChange = (event) => {
    fileValidationError.value = "";
    uploadStatusResourceFiles.value = null;
    const files = Array.from(event.target.files || []);

    if (!files.length) {
        selectedResourceFiles.value = [];
        return;
    }

    const invalid = files.filter((f) => {
        const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
        return !ALLOWED_OER_EXTS.includes(ext);
    });

    if (invalid.length > 0) {
        fileValidationError.value = `Invalid file format: ${invalid.map((f) => f.name).join(", ")}. Only .docx, .doc, or .pdf files are allowed for Educational Open Resources (OER).`;
        event.target.value = "";
        selectedResourceFiles.value = [];
        return;
    }

    selectedResourceFiles.value = files;
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
        uploadStatusResourceFiles.value = "Upload failed: " + (error.response?.data?.file?.[0] || error.message);
        console.error("Resource file upload error:", error);
        throw error;
    }
};

const resetForm = () => {
    info.value = {
        contributor_name: user.value?.name || "",
        program: "",
        college_or_unit: "",
        contributor_email: user.value?.email || "",
        resource_files: [],
        video_links: "",
        google_doc_link: "",
        title: "",
        author_and_affiliation: "",
        description_abstract: "",
        type_of_entry: "Document",
        subject_areas: "",
        keywords: "",
        target_audience: "",
        license_chosen: "",
        languages: "English",
        learning_objectives: "",
        accessibility_notes: "",
        lasallian_relevance: "",
        relation_to_other_resources: "",
        source_attribution: "",
        tracking_id: generateTrackingId(),
        logs: [
            {
                timestamp: moment().format("MMMM DD, YYYY h:mm:ss A"),
                status_remarks: "Received. For Checking.",
                status_update: "Submitted",
                status_update_by: "OER",
            },
        ],
    };
    selectedResourceFiles.value = [];
    uploadedResourceFiles.value = [];
    uploadStatusResourceFiles.value = null;
    fileValidationError.value = "";
    formDisplay.value = true;
    thankYouDisplay.value = false;
};

const postAPI = async () => {
    if (isSubmitting.value) return;

    // Basic Validation Check
    if (!info.value.title.trim()) {
        alert("Please enter the resource title.");
        return;
    }
    if (!info.value.contributor_name.trim() || !info.value.contributor_email.trim()) {
        alert("Please enter contributor name and email.");
        return;
    }
    if (!info.value.college_or_unit) {
        alert("Please select a College or Unit.");
        return;
    }
    if (showProgramField.value && !info.value.program) {
        alert("Please select a Program.");
        return;
    }
    if (info.value.type_of_entry === "Google Doc" && !info.value.google_doc_link.trim()) {
        alert("Please provide the Google Doc URL link.");
        return;
    }
    if (info.value.type_of_entry === "Video" && !info.value.video_links.trim()) {
        alert("Please provide the Video link.");
        return;
    }
    if (info.value.type_of_entry === "Document" && selectedResourceFiles.value.length === 0 && info.value.resource_files.length === 0) {
        alert("Please choose a .docx, .doc, or .pdf resource file to upload.");
        return;
    }

    isSubmitting.value = true;

    try {
        if (info.value.type_of_entry === "Document") {
            await uploadResourceFiles();
            if (!info.value.resource_files || info.value.resource_files.length === 0) {
                info.value.resource_files = [
                    {
                        name: "N/A",
                        url: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/registrar/ImageNotFound.png",
                    },
                ];
            }
        } else if (info.value.type_of_entry === "Google Doc") {
            info.value.resource_files = [
                {
                    name: info.value.title ? `Google Doc: ${info.value.title}` : "Google Doc",
                    url: (info.value.google_doc_link || "").trim(),
                },
            ];
        } else if (info.value.type_of_entry === "Video") {
            info.value.resource_files = [
                {
                    name: info.value.title ? `Video: ${info.value.title}` : "Video Link",
                    url: (info.value.video_links || "").trim(),
                },
            ];
        }

        // Submit to API
        await $fetch(endpoint.value + "/api/oer/create/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: info.value,
        });

        submittedTrackingId.value = info.value.tracking_id;
        submittedTitle.value = info.value.title;

        formDisplay.value = false;
        thankYouDisplay.value = true;
        fetchTotalCount();
        await submitOERFormToGmail();
    } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred during submission: " + error.message);
    } finally {
        isSubmitting.value = false;
    }
};

// Gmail notification
const submitOERFormToGmail = async () => {
    try {
        await $fetch(endpoint.value + "/api/oer/oer-notification-submit/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: info.value,
        });
    } catch (error) {
        console.error("Notification error:", error);
    }
};
</script>

<template>
    <div class="font-montserrat p-4 space-y-6">
        <!-- Top Navigation Tabs (List and Form easy navigation) -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-200">
            <div class="inline-flex p-1 rounded-xl bg-gray-100 border border-gray-200 shadow-2xs">
                <button
                    type="button"
                    @click="switchView('form')"
                    :class="activeTab === 'form' ? 'bg-green-800 text-white shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900 font-medium'"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                    <i class="fa fa-pen-to-square"></i>
                    <span>OER Submission Form</span>
                </button>
                <button
                    type="button"
                    @click="switchView('list')"
                    :class="activeTab === 'list' ? 'bg-green-800 text-white shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900 font-medium'"
                    class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all cursor-pointer"
                >
                    <i class="fa fa-table-list"></i>
                    <span>OER Submissions List</span>
                    <span v-if="totalSubmissionsCount > 0" class="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-mono">
                        {{ totalSubmissionsCount }}
                    </span>
                </button>
            </div>

            <!-- Tracking ID badge -->
            <div class="flex items-center gap-2 text-xs text-gray-500">
                <span class="font-medium">Tracking ID:</span>
                <span class="font-mono font-bold text-green-900 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 shadow-2xs">
                    {{ info.tracking_id }}
                </span>
            </div>
        </div>

        <!-- Render List directly if tab switched locally -->
        <div v-if="activeTab === 'list'">
            <OERList @change-view="switchView" />
        </div>

        <!-- Form View -->
        <div v-else>
            <!-- Form Container -->
            <div v-if="formDisplay" class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <!-- Header Banner -->
                <div class="bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-xs">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-yellow-300 text-base">
                            <i class="fa fa-book-bookmark"></i>
                        </div>
                        <div>
                            <h2 class="text-base sm:text-lg font-black tracking-wide uppercase">
                                Document Information
                            </h2>
                            <p class="text-xs text-green-100">
                                Educational Open Resources (Metau) Curriculum Submission
                            </p>
                        </div>
                    </div>
                    <div class="text-[11px] text-green-200 bg-white/10 px-3 py-1 rounded-full w-fit">
                        Fields marked with <span class="text-red-300 font-bold">*</span> are required
                    </div>
                </div>

                <form @submit.prevent="postAPI" class="p-6 sm:p-8 space-y-8 bg-gray-50/40">
                    <!-- Section I: Resource Information -->
                    <div class="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-5">
                        <div class="flex items-center gap-2.5 pb-3 border-b border-gray-100 text-green-800 font-bold text-sm">
                            <span class="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-black">I</span>
                            <h3>Resource Information</h3>
                        </div>

                        <!-- Contributor Info Row -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <!-- Name -->
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Name of Contributor <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    v-model="info.contributor_name"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                />
                            </div>

                            <!-- Email -->
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Email <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="your.name@lsu.edu.ph"
                                    v-model="info.contributor_email"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                />
                            </div>

                            <!-- College or Unit -->
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    College or Unit <span class="text-red-600">*</span>
                                </label>
                                <select
                                    v-model="info.college_or_unit"
                                    @change="onCollegeChange"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white truncate"
                                >
                                    <option value="" disabled>Select College or Unit</option>
                                    <option v-for="c in collegeList" :key="c" :value="c">{{ c }}</option>
                                </select>
                            </div>

                            <!-- Program (Conditional) -->
                            <div v-if="showProgramField">
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Program <span class="text-red-600">*</span>
                                </label>
                                <select
                                    v-model="info.program"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white truncate"
                                >
                                    <option value="" disabled>Select Program</option>
                                    <option v-for="p in availablePrograms" :key="p" :value="p">{{ p }}</option>
                                </select>
                            </div>
                        </div>

                        <!-- Title and Author Row -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Resource Title <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Object-Oriented Programming Laboratory Manual"
                                    v-model="info.title"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white font-medium"
                                />
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Author and Affiliation <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Author Name, Institution/Department"
                                    v-model="info.author_and_affiliation"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                />
                            </div>
                        </div>

                        <!-- Description/Abstract -->
                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-1">
                                Description / Abstract <span class="text-red-600">*</span>
                            </label>
                            <textarea
                                placeholder="Provide a detailed description of the educational resource, topic overview, and scope..."
                                v-model="info.description_abstract"
                                required
                                rows="3"
                                class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 p-3 bg-white leading-relaxed"
                            ></textarea>
                        </div>

                        <!-- Type of Entry Selection (Interactive Modern Cards) -->
                        <div>
                            <label class="block text-xs font-bold text-gray-700 mb-2">
                                Type of Entry <span class="text-red-600">*</span>
                            </label>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <!-- Document Option -->
                                <label
                                    class="relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group"
                                    :class="info.type_of_entry === 'Document' ? 'border-green-700 bg-green-50/70 shadow-xs ring-1 ring-green-700' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'"
                                >
                                    <div class="flex items-center justify-center shrink-0">
                                        <input
                                            type="radio"
                                            value="Document"
                                            v-model="info.type_of_entry"
                                            style="margin: 0 !important;"
                                            class="!m-0 shrink-0 h-4 w-4 text-green-700 focus:ring-green-600 cursor-pointer"
                                        />
                                    </div>
                                    <div
                                        class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                        :class="info.type_of_entry === 'Document' ? 'bg-green-700 text-white shadow-xs' : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-700'"
                                    >
                                        <i class="fa fa-file-alt text-sm"></i>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="font-bold text-xs text-gray-900 leading-tight">
                                            Document
                                        </div>
                                        <div class="text-[10px] text-gray-500 truncate mt-0.5">
                                            Upload file (.docx, .doc, .pdf)
                                        </div>
                                    </div>
                                </label>

                                <!-- Google Doc Option -->
                                <label
                                    class="relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group"
                                    :class="info.type_of_entry === 'Google Doc' ? 'border-sky-600 bg-sky-50/70 shadow-xs ring-1 ring-sky-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'"
                                >
                                    <div class="flex items-center justify-center shrink-0">
                                        <input
                                            type="radio"
                                            value="Google Doc"
                                            v-model="info.type_of_entry"
                                            style="margin: 0 !important;"
                                            class="!m-0 shrink-0 h-4 w-4 text-sky-600 focus:ring-sky-600 cursor-pointer"
                                        />
                                    </div>
                                    <div
                                        class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                        :class="info.type_of_entry === 'Google Doc' ? 'bg-sky-600 text-white shadow-xs' : 'bg-gray-100 text-gray-500 group-hover:bg-sky-100 group-hover:text-sky-700'"
                                    >
                                        <i class="fab fa-google-drive text-sm"></i>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="font-bold text-xs text-gray-900 leading-tight">
                                            Google Doc
                                        </div>
                                        <div class="text-[10px] text-gray-500 truncate mt-0.5">
                                            Google Drive / Docs URL link
                                        </div>
                                    </div>
                                </label>

                                <!-- Video Option -->
                                <label
                                    class="relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer group"
                                    :class="info.type_of_entry === 'Video' ? 'border-red-600 bg-red-50/70 shadow-xs ring-1 ring-red-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/60 bg-white'"
                                >
                                    <div class="flex items-center justify-center shrink-0">
                                        <input
                                            type="radio"
                                            value="Video"
                                            v-model="info.type_of_entry"
                                            style="margin: 0 !important;"
                                            class="!m-0 shrink-0 h-4 w-4 text-red-600 focus:ring-red-600 cursor-pointer"
                                        />
                                    </div>
                                    <div
                                        class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                        :class="info.type_of_entry === 'Video' ? 'bg-red-600 text-white shadow-xs' : 'bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-700'"
                                    >
                                        <i class="fa fa-video text-sm"></i>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="font-bold text-xs text-gray-900 leading-tight">
                                            Video
                                        </div>
                                        <div class="text-[10px] text-gray-500 truncate mt-0.5">
                                            YouTube / Web video URL
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Dynamic Resource Attachment Field -->
                        <div class="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
                            <!-- Document: File Upload (.docx, .doc, .pdf) -->
                            <div v-if="info.type_of_entry === 'Document'" class="space-y-3">
                                <div>
                                    <div class="flex items-center justify-between mb-1">
                                        <label class="block text-xs font-bold text-gray-800">
                                            Upload Resource Files <span class="text-red-600">*</span>
                                        </label>
                                        <span class="text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                                            .docx, .doc, or .pdf only
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
                                        @change="onResourceFilesChange"
                                        class="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-green-700 file:text-white hover:file:bg-green-800 file:cursor-pointer p-2 border border-dashed border-green-700/60 rounded-xl bg-white"
                                    />
                                </div>

                                <!-- Validation Error -->
                                <div
                                    v-if="fileValidationError"
                                    class="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium"
                                >
                                    <i class="fa fa-exclamation-triangle text-red-600"></i>
                                    <span>{{ fileValidationError }}</span>
                                </div>

                                <!-- Selected files badge -->
                                <div v-if="selectedResourceFiles.length > 0" class="flex flex-wrap gap-2 items-center">
                                    <span class="text-xs text-gray-600 font-medium">Selected files ready for upload:</span>
                                    <span
                                        v-for="f in selectedResourceFiles"
                                        :key="f.name"
                                        class="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono flex items-center gap-1.5"
                                    >
                                        <i class="fa fa-file-alt text-blue-600"></i>
                                        <span>{{ f.name }} ({{ (f.size / 1024).toFixed(0) }} KB)</span>
                                    </span>
                                </div>

                                <!-- Upload status -->
                                <div v-if="uploadStatusResourceFiles" class="text-xs font-semibold" :class="uploadStatusResourceFiles.includes('failed') ? 'text-red-600' : 'text-green-700'">
                                    {{ uploadStatusResourceFiles }}
                                </div>

                                <!-- Uploaded files list -->
                                <div v-if="uploadedResourceFiles.length > 0" class="space-y-1">
                                    <span class="text-xs text-gray-500 font-semibold block">Uploaded:</span>
                                    <div
                                        v-for="file in uploadedResourceFiles"
                                        :key="file.url"
                                        class="text-xs text-green-800 bg-white p-2 rounded-lg border border-gray-200 flex items-center justify-between"
                                    >
                                        <div class="flex items-center gap-2 truncate">
                                            <i class="fa fa-check-circle text-green-600"></i>
                                            <span class="font-medium truncate">{{ file.name }}</span>
                                        </div>
                                        <a :href="file.url" target="_blank" class="text-blue-600 hover:underline font-bold text-[11px]">
                                            Preview
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <!-- Google Doc Link -->
                            <div v-else-if="info.type_of_entry === 'Google Doc'" class="space-y-2">
                                <label class="block text-xs font-bold text-gray-800">
                                    Google Doc / Drive Link <span class="text-red-600">*</span>
                                </label>
                                <div class="relative">
                                    <input
                                        type="url"
                                        placeholder="https://docs.google.com/document/d/... or Google Drive URL"
                                        v-model="info.google_doc_link"
                                        required
                                        class="w-full text-xs rounded-lg border border-sky-300 focus:ring-2 focus:ring-sky-600 focus:border-sky-600 pl-9 pr-3 py-2.5 bg-white"
                                    />
                                    <i class="fab fa-google-drive absolute left-3 top-3 text-sky-600 text-sm"></i>
                                </div>
                                <p class="text-[11px] text-gray-500 flex items-center gap-1.5">
                                    <i class="fa fa-info-circle text-sky-600"></i>
                                    <span>Please ensure sharing permission is set to <strong>"Anyone with the link can view"</strong> for reviewers.</span>
                                </p>
                            </div>

                            <!-- Video Link -->
                            <div v-else-if="info.type_of_entry === 'Video'" class="space-y-2">
                                <label class="block text-xs font-bold text-gray-800">
                                    Educational Video URL <span class="text-red-600">*</span>
                                </label>
                                <div class="relative">
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=... or Video URL"
                                        v-model="info.video_links"
                                        required
                                        class="w-full text-xs rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 pl-9 pr-3 py-2.5 bg-white"
                                    />
                                    <i class="fa fa-video absolute left-3 top-3 text-purple-600 text-sm"></i>
                                </div>
                                <p class="text-[11px] text-gray-500 flex items-center gap-1.5">
                                    <i class="fa fa-info-circle text-purple-600"></i>
                                    <span>Provide a direct YouTube link or accessible video streaming URL.</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Section II: Category Details -->
                    <div class="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-5">
                        <div class="flex items-center gap-2.5 pb-3 border-b border-gray-100 text-green-800 font-bold text-sm">
                            <span class="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-black">II</span>
                            <h3>Category Details</h3>
                        </div>

                        <!-- Subject, Keywords, Target Audience, License, Language -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Subject Areas <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mathematics, Computer Science, Literature"
                                    v-model="info.subject_areas"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                />
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Keywords <span class="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="keyword1, keyword2, keyword3"
                                    v-model="info.keywords"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                />
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Target Audience <span class="text-red-600">*</span>
                                </label>
                                <select
                                    v-model="info.target_audience"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                >
                                    <option value="" disabled selected>Select Target Audience</option>
                                    <option v-for="a in targetAudienceList" :key="a" :value="a">{{ a }}</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    License Type <span class="text-red-600">*</span>
                                </label>
                                <select
                                    v-model="info.license_chosen"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                >
                                    <option value="" disabled selected>Select License Type</option>
                                    <option v-for="lic in licenseList" :key="lic" :value="lic">{{ lic }}</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Language <span class="text-red-600">*</span>
                                </label>
                                <select
                                    v-model="info.languages"
                                    required
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                >
                                    <option v-for="lang in languageList" :key="lang" :value="lang">{{ lang }}</option>
                                </select>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Course Codes (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. CS101, IT202, MATH10"
                                    v-model="info.course_codes"
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 px-3 py-2 bg-white"
                                />
                            </div>
                        </div>

                        <!-- Qualitative Details -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Learning Objectives
                                </label>
                                <textarea
                                    placeholder="List the intended student learning outcomes or competencies..."
                                    v-model="info.learning_objectives"
                                    rows="2"
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 p-2.5 bg-white"
                                ></textarea>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Lasallian Relevance
                                </label>
                                <textarea
                                    placeholder="How does this resource relate to Lasallian values and educational mission..."
                                    v-model="info.lasallian_relevance"
                                    rows="2"
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 p-2.5 bg-white"
                                ></textarea>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Accessibility Notes
                                </label>
                                <textarea
                                    placeholder="Accessibility features, screen-reader compatibility, or alt-text notes..."
                                    v-model="info.accessibility_notes"
                                    rows="2"
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 p-2.5 bg-white"
                                ></textarea>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1">
                                    Source Attribution & Credits
                                </label>
                                <textarea
                                    placeholder="Attribution information for any third-party sources or inspirations used..."
                                    v-model="info.source_attribution"
                                    rows="2"
                                    class="w-full text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 focus:border-green-600 p-2.5 bg-white"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Submission Actions Bar -->
                    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            @click="resetForm"
                            class="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <i class="fa fa-undo mr-1.5"></i>
                            <span>Reset Form</span>
                        </button>

                        <div class="flex items-center gap-3">
                            <button
                                type="submit"
                                :disabled="isSubmitting"
                                class="inline-flex items-center justify-center gap-2 px-8 py-2.5 bg-gradient-to-r from-green-800 to-emerald-700 hover:from-green-700 hover:to-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-60"
                            >
                                <i v-if="isSubmitting" class="fa fa-circle-notch fa-spin"></i>
                                <i v-else class="fa fa-paper-plane"></i>
                                <span>{{ isSubmitting ? "Submitting..." : "Submit Resource" }}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <!-- Thank You / Confirmation Screen -->
            <div v-if="thankYouDisplay" class="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-gray-200 max-w-2xl mx-auto text-center space-y-6">
                <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    <i class="fa fa-check"></i>
                </div>

                <div class="space-y-2">
                    <h2 class="text-2xl font-black text-gray-900">
                        Resource Submitted Successfully!
                    </h2>
                    <p class="text-xs sm:text-sm text-gray-600">
                        Thank you for contributing to <strong>Metau: LSU Open Educational Resources</strong>.
                    </p>
                </div>

                <!-- Submission summary card -->
                <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 text-left text-xs space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">Tracking ID:</span>
                        <span class="font-mono font-bold text-green-900 bg-green-100 px-2 py-0.5 rounded">
                            {{ submittedTrackingId }}
                        </span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">Title:</span>
                        <span class="font-bold text-gray-900 truncate max-w-[280px]">{{ submittedTitle }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">Type:</span>
                        <span class="font-bold text-gray-800">{{ info.type_of_entry }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-500">Status:</span>
                        <span class="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                            Submitted &bull; Received for Checking
                        </span>
                    </div>
                </div>

                <p class="text-xs text-gray-500">
                    A confirmation receipt has been sent to your email. The Learning Resource Center (LRC) will review your submission shortly.
                </p>

                <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        @click="resetForm"
                        class="px-5 py-2.5 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                        <i class="fa fa-plus-circle mr-1.5"></i>
                        <span>Submit Another Resource</span>
                    </button>
                    <button
                        type="button"
                        @click="switchView('list')"
                        class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all border border-gray-300 cursor-pointer"
                    >
                        <i class="fa fa-table-list mr-1.5"></i>
                        <span>View Submissions List</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
input[type="radio"] {
    margin: 0 !important;
}
</style>
