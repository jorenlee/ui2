<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
const route = useRoute();
import _ from "lodash";
import collegeOrSchoolJSON from "../college_school.json";
import courseOrProgramJSON from "../course_program.json";
import courseMajorJSON from "../course_major.json";

const endpoint = ref(userStore.mainDevServer);
const enrollment = await $fetch(endpoint.value + "/api/enrollment/" + route.params.id + "/").catch((error) => error.data)

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === emailRegistrar.value ||
      userStore.user.email === developerEmail.value ||
      userStore.user.email === testEmail.value)
  ) {
    // router.push("/registrar/enrollment/edit/" + route.params.id);
    // console.log(enrollment);
  } else {
    router.push("/unauthorized");
  }
});

let id = ref(enrollment.value.id);
let enrollmentId = ref(enrollment.value.enrollmentId);
let studentId = ref(enrollment.value.studentId);
let firstName = ref(enrollment.value.firstName);
let middleName = ref(enrollment.value.middleName);
let lastName = ref(enrollment.value.lastName);
let suffixName = ref(enrollment.value.suffixName);
let dateOfBirth = ref(enrollment.value.dateOfBirth);
let gender = ref(enrollment.value.gender);
let contactNumber = ref(enrollment.value.contactNumber);
let college = ref(enrollment.value.college);
let courseProgram = ref(enrollment.value.courseProgram);
let courseYear = ref(enrollment.value.courseYear);
let courseMajor = ref(enrollment.value.courseMajor);
let contactEmail = ref(enrollment.value.contactEmail);
let lsuEmail = ref(enrollment.value.lsuEmail);
let lsuEmailPassword = ref(enrollment.value.lsuEmailPassword);
let canvasEmail = ref(enrollment.value.canvasEmail);
let canvasPassword = ref(enrollment.value.canvasPassword);
let schoolAutomateUsername = ref(enrollment.value.schoolAutomateUsername);
let schoolAutomatePassword = ref(enrollment.value.schoolAutomatePassword);
let admissionStatus = ref(enrollment.value.admissionStatus);
let proofOfPayment = ref(enrollment.value.proofOfPayment);
let allowEnrollment = ref(enrollment.value.allowEnrollment);
let isFormSubmitted = ref(enrollment.value.isFormSubmitted);
let isAdmissionConfirmed = ref(enrollment.value.isAdmissionConfirmed);
let admissionRemarks = ref(enrollment.value.admissionRemarks);
let advisingRemarks = ref(enrollment.value.advisingRemarks);
let paymentRemarks = ref(enrollment.value.paymentRemarks);
let isAssigningSubjectsOrCourse = ref(enrollment.value.isAssigningSubjectsOrCourse);
let isSubjectsOrCoursesSuccessfullyAssigned = ref(
  enrollment.value.isSubjectsOrCoursesSuccessfullyAssigned
);
let subjectLoadAndAssessment = ref(enrollment.value.subjectLoadAndAssessment);
let modeOfPayment = ref(enrollment.value.modeOfPayment);
let documents = ref(enrollment.value.documents);
let isSubmitReceipt = ref(enrollment.value.isSubmitReceipt);
let isPaymentConfirm = ref(enrollment.value.isPaymentConfirm);
let enrollmentIsValidated = ref(enrollment.value.enrollmentIsValidated);
let dateOfEnrollment = ref(enrollment.value.dateOfEnrollment);
let updatedBy = ref(enrollment.value.updatedBy);
let lastUpdatedOn = ref(enrollment.value.lastUpdatedOn);
let created_by_name = ref(userStore.user.email);
let created_by_email = ref(userStore.user.email);

let errors = ref([]);
let successToastSubmitCredentialToGmail = ref(false);

let toggleSideBarMenu = ref(true);

const goToList = () => {
  router.push("/registrar");
};

const goToCreate = () => {
  router.push("/registrar/create");
};

const goToSchedules = () => {
  router.push("/registrar/set-schedules");
};

const goToEnrollment = () => {
  // router.push("/registrar/enrollment");
};

const btnTogoEnrollmentList = () => {
  // router.push("/registrar/enrollment");
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const collegeOrSchool = ref(collegeOrSchoolJSON);
const courseOrProgram = ref(courseOrProgramJSON);
const courseMajorList = ref(courseMajorJSON);

let collegeOrSchoolData = collegeOrSchool._rawValue;
let courseOrProgramData = courseOrProgram._rawValue;
let courseMajorListData = courseMajorList._rawValue;

let filteredCourseOrProgram = computed(() =>
  courseOrProgramData.filter(function (params) {
    if (params.college_or_school_id === college.value) {
      return params.name;
    }
  })
);

let filteredCourseMajor = computed(() =>
  courseMajorListData.filter(function (params) {
    if (params.course_program_id === courseProgram.value) {
      return params.name;
    }
  })
);

// Receipt Upload
const uploadTaskReceipt = ref(null);
const pausedReceipt = ref(true);
const progressReceipt = ref(0);
let fileTitleReceipt = ref("");

let bannerImagePreviewReceipt = ref(
  "https://firebasestorage.googleapis.com/v0/b/public-images-cbecf.appspot.com/o/public%2F1684826293302?alt=media&token=6bd368c2-5a1b-4d13-9c83-eafccfee8fd2"
);

const progressPercentReceipt = computed(() => Math.round(progressReceipt.value));

function handleChangeReceipt(e) {
  const storage = getStorage();
  fileTitleReceipt.value = e.target.files[0].lastModified;
  const storageRef = storageReference(storage, "receipt/" + fileTitleReceipt.value);
  uploadTaskReceipt.value = uploadBytesResumable(storageRef, e.target.files[0]);

  // console.log(e.target.files[0].lastModified);
  uploadTaskReceipt.value.on(
    "state_changed",
    (snapshot) => {
      // Get task progressprogressReceipt, including the number of bytes uploaded and the total number of bytes to be uploaded
      progressReceipt.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      // console.log("Upload is " + progressprogressReceipt.value + "% done");
      switch (snapshot.state) {
        case "pausedReceipt":
          // console.log("Upload is paused");
          break;
        case "running":
          // console.log("Upload is running");
          break;
      }
    },
    (error) => { },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTaskReceipt.value.snapshot.ref).then((downloadURL) => {
        // console.log("File available at", downloadURL);
        proofOfPayment.value = downloadURL;
        bannerImagePreviewReceipt.value = downloadURL;
      });
    }
  );
  pausedReceipt.value = false;
}

const pauseReceipt = (e) => {
  e.preventDefault();

  if (pausedReceipt.value == false) {
    uploadTaskReceipt.value.pause();
    pausedReceipt.value = !pausedReceipt.value;
  } else {
    uploadTaskReceipt.value.resume();
    pausedReceipt.value = false;
  }
};

const sendEmailCredentials = () => {
  submitCredentialsToGmail();
  submitForm();
};

const submitForm = async () => {
  // console.log("submitForm");

  await $fetch(endpoint.value + "/api/enrollment/" + id.value + "/edit/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    // body: {},
  })
    .then((response) => {
      // console.log("response", response);
      // router.push({ path: "/registrar/enrollment" });
    });

}

const submitCredentialsToGmail = async () => {
  successToastSubmitCredentialToGmail.value = true;
  setTimeout(() => {
    successToastSubmitCredentialToGmail.value = false;
  }, 1000);

  enrollmentIsValidated.value = true;

  await $fetch(endpoint.value + "/api/enrollment/submit-credentials-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body: {},
  })
    .then((response) => { });
};
</script>
<template>
  <div class="">
    <div class="flex">
      <div class="pt-7 pb-24 w-3/12 px-1 bg-gray-100 lg:block hidden" v-show="toggleSideBarMenu">
        <RegistrarMenuBar />
      </div>
      <div class="w-full min-h-screen">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white lg:gap-5">
              <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
                <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                  aria-hidden="true">
                </i>
              </div>
              <div class="flex -mt-1">
                <i class="fa fa-user mr-2 mt-1" aria-hidden="true"></i>
                <h1 class="text-sm">
                  {{ userStore.user.email }}
                </h1>
              </div>
            </div>
            <button @click="logOut" class="flex hover:font-boldn pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="">
          <div class="lg:w-full p-5">
            <div class="h-full shadow-lg pb-10">
              <div class="relative">
                <div class="shadow">
                  <button @click="btnTogoEnrollmentList"
                    class="shadow text-center uppercase my-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap mx-3">
                    Enrollment List
                  </button>
                </div>
              </div>

              <h1
                class="font-bold lg:mb-5 text-center lg:text-3xl text-3xl block mt-10 px-3 capitalize whitespace-nowrap lasalle-green-text">
                online enrollment
              </h1>

              <form v-on:submit.prevent="submitForm">
                <div>
                  <h1 class="text-xl text-green-800 ml-5">
                    Step 1. <span class="font-bold">Admission</span>
                  </h1>

                  <div class="lg:w-11/12 mx-auto border-l-4 border-green-800 lg:px-5 px-2 my-2 shadow-sm py-4 text-xs">
                    <div class="flex">
                      <h2 class="font-bold lg:text-base text-xs capitalize text-green-800">
                        <i class="fa-solid fa-circle-minus mr-1 text-gray-500" v-if="!isFormSubmitted"></i>
                        <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                        1.1 Fill Out Admission Form
                      </h2>
                      <h1 class="ml-1 lg:mt-1 text-xs lowercase italic font-semibold">
                        (<span class="text-red-600 font-bold">*</span>
                        - is required)
                      </h1>
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">Enrollment
                        ID</label>
                      <input id="enrollmentId" name="enrollmentId"
                        class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="Enrollment Id"
                        v-model="enrollmentId" disabled />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">
                        Student ID
                      </label>
                      <input id="studentId" name="studentId" class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="Student Id" v-model="studentId" />
                      <span class="text-slate-400 text-xs mt-2 ml-2">
                        (For Continuing Student)</span>
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize lg:ml-16">
                        First Name<span class="text-red-500">*</span></label>
                      <input v-model="firstName" name="firstName" class="capitalize rounded border py-0.5 px-2 w-full"
                        placeholder="First Name" />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize lg:ml-16">Middle
                        Name<span class="text-red-500">*</span></label>
                      <input id="middlename" name="middlename" class="capitalize rounded border py-0.5 px-2 w-full"
                        placeholder="Middle Name" v-model="middleName" />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize lg:ml-16">Last
                        Name<span class="text-red-500">*</span></label>
                      <input id="lastname" name="lastname" class="capitalize rounded border py-0.5 px-2 w-full"
                        placeholder="Last Name" v-model="lastName" />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">Suffix</label>
                      <input id="suffixName" name="suffixName" class="rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="e.g SR. JR. II" v-model="suffixName" />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">
                        Date of Birth<span class="text-red-500">*</span></label>
                      <input id="dateOfBirth" name="dateOfBirth" type="date"
                        class="rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="Date of Birth"
                        v-model="dateOfBirth" />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-1 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">Gender<span
                          class="text-red-500">*</span></label>
                      <input type="radio" id="male" name="male" value="male" class="mr-1 my-1 block" v-model="gender" />
                      <label class="mr-3 py-1">Male</label>
                      <input type="radio" class="mr-1 my-1 block" id="female" name="female" value="female"
                        v-model="gender" />
                      <label class="mr-3 py-1">Female</label>
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">
                        Contact Number<span class="text-red-500">*</span></label>
                      <input id="contactNumber" name="contactNumber" class="rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="e.g 09XXXXXXXXX" v-model="contactNumber" />
                    </div>

                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-1.5 lg:w-4/12 whitespace-nowrap block lg:text-right mr-3 capitalize">
                        College/School<span class="text-red-500">*</span></label>
                      <div class="w-full">
                        <select id="college" v-model="college" name="college"
                          class="capitalize rounded border py-0.5 px-2 border-slate-300 lg:w-8/12 w-full" required>
                          <option value="" disabled>Select College or School</option>
                          <option value="" disabled>
                            CON (College of Nursing) - Walk In Enrollment
                          </option>
                          <option value="" disabled>
                            CTHM (College of Tourism and Hospitality Management) - Walk In
                            Enrollment
                          </option>
                          <option value="" disabled>BEd (Basic Education)</option>
                          <option :value="college.name" v-for="(college, i) in collegeOrSchoolData" :key="i">
                            {{ college.name }}
                          </option>
                        </select>
                      </div>
                    </div>

                    <div class="lg:flex">
                      <label
                        class="text-gray-400 text-xs mt-1.5 whitespace-nowrap block lg:text-right mr-3 capitalize lg:w-3/12">Course/Program<span
                          class="text-red-500">*</span></label>
                      <select id="courseProgram" v-model="courseProgram" name="courseProgram"
                        class="capitalize rounded border py-0.5 px-2 border-slate-300 lg:w-6/12" required>
                        <option value="" disabled>Select Course Program</option>
                        <option :value="cp.name" v-for="(cp, i) in filteredCourseOrProgram" :key="i">
                          {{ cp.name }}
                        </option>
                      </select>
                    </div>

                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-1.5 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize">
                        Course Major<span class="text-red-500">*</span></label>

                      <select id="courseMajor" v-model="courseMajor" name="courseMajor"
                        class="capitalize rounded border py-0.5 border-slate-300 lg:w-6/12 w-full" required>
                        <option value="" disabled>Select Course Major</option>
                        <option value="">N/A</option>
                        <option :value="cm.name" v-for="(cm, i) in filteredCourseMajor" :key="i">
                         {{ cm.name }}
                        </option>
                      </select>
                    </div>

                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-1.5 lg:w-4/12 whitespace-nowrap block lg:text-right mr-3 capitalize">
                        Course Year/Grade<span class="text-red-500">*</span></label>
                      <div class="w-full">
                        <select id="courseYear" v-model="courseYear" name="courseYear"
                          class="capitalize rounded border py-0.5 px-2 border-slate-300 lg:w-8/12 w-full" required>
                          <!-- <option value="" disabled>Select Course Year or Grade</option> -->
                          <option value="" disabled>Select Course Year</option>
                          <!-- <option value="Pre School">Pre School</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                      <option value="Grade 11">Grade 11</option>
                      <option value="Grade 12">Grade 12</option> -->
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="5th Year">5th Year</option>
                          <option value="6th Year">6th Year</option>
                          <option value="7th Year">7th Year</option>
                          <option value="8th Year">8th Year</option>
                          <option value="9th Year">9th Year</option>
                          <option value="10th Year">10th Year</option>
                        </select>
                      </div>
                    </div>

                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 capitalize mt-1.5 lg:ml-16">Contact
                        Email<span class="text-red-500">*</span></label>
                      <input id="contactEmail" name="contactEmail"
                        class="lowercase rounded border py-0.5 px-2 w-full text-sm" placeholder="jorenluna@lsu.edu.ph"
                        v-model="contactEmail" />
                    </div>
                    <div class="lg:flex mt-3">
                      <label
                        class="text-gray-400 text-xs mt-2 lg:w-3/12 whitespace-nowrap block lg:text-right mr-3 mt-1 capitalize lg:ml-16">Valid
                        Government ID / Student ID<span class="text-red-500">*</span></label>
                      <div class="w-fit shadow" v-if="documents">
                        <img class="w-full h-56" :src="documents" />
                      </div>
                    </div>
                    <h2 class="font-bold lg:text-base text-xs capitalize text-green-800 py-2">
                      <!-- <i class="fa-solid fa-circle-minus mr-1"></i> -->
                      <input id="status" type="checkbox" value="true" name="status" class="" v-model="isFormSubmitted"
                        disabled />
                      1.2 Form Submitted
                    </h2>

                    <h2 class="font-bold lg:text-base text-xs capitalize text-slate-400 py-2">
                      <input id="status" type="checkbox" value="true" name="status" class=""
                        v-model="isAdmissionConfirmed" />
                      1.3 Admission Confirmed
                    </h2>
                    <div class="flex">
                      <h1 class="whitespace-nowrap text-green-800 font-bold text-sm py-1">
                        Admission Remarks:
                      </h1>
                      <input v-model="admissionRemarks" class="capitalize rounded border py-0.5 px-2 w-4/12 ml-3" />
                    </div>
                  </div>
                </div>

                <h1 class="text-xl ml-5">
                  Step 2. <span class="font-bold">Advising</span>
                </h1>
                <div class="lg:w-11/12 mx-auto border-l-4 lg:px-5 px-2 my-2 shadow-sm py-4">
                  <div class="flex">
                    <h2 class="font-bold lg:text-base text-xs capitalize text-slate-400 py-2">
                      <input id="status" type="checkbox" value="true" name="status" class=""
                        v-model="isAssigningSubjectsOrCourse" />
                      2.1 Assigning Subjects or Courses
                    </h2>
                  </div>
                  <div class="flex">
                    <h2 class="lg:text-base text-xs font-bold capitalize text-slate-400 py-2">
                      <input id="status" type="checkbox" value="true" name="status" class=""
                        v-model="isSubjectsOrCoursesSuccessfullyAssigned" />
                      2.2 Successfully Added Subjects or Courses
                    </h2>
                  </div>
                  <div class="flex">
                    <h1 class="whitespace-nowrap text-green-800 font-bold text-sm py-1">
                      Advising Remarks:
                    </h1>
                    <input v-model="advisingRemarks" class="capitalize rounded border py-0.5 px-2 w-4/12 ml-3" />
                  </div>
                </div>
                <h1 class="text-xl ml-5">
                  Step 3. <span class="font-bold">Payment</span>
                </h1>
                <div class="lg:w-11/12 mx-auto lg:px-5 px-2 my-2 shadow-sm py-4 border-l-4">
                  <h2 class="lg:text-base text-xs font-bold capitalize text-slate-400 py-2">
                    3. 1 Payment Receipt
                  </h2>
                  <div class="mt-3">
                    <div class="flex">
                      <div class="flex h-fit">
                        <input class="border" type="file" @change="handleChangeReceipt" accept="image/*" />
                      </div>
                      <div class="w-5/12 ml-10 text-center pt-3">
                        <div class="text-white bg-green-900 transition-all ease-in-out duration-200 h-5 flex items-center"
                          :style="`width:${progressPercentReceipt}%`">
                          <p class="mx-auto">{{ progressPercentReceipt }} %</p>
                        </div>
                      </div>
                    </div>
                    <div class="w-fit my-5">
                      <div class="w-full shadow" v-if="proofOfPayment === ''">
                        <img class="w-full h-56" :src="bannerImagePreviewReceipt" />
                      </div>
                      <div class="w-full shadow" v-else>
                        <img class="w-full h-56" :src="proofOfPayment" />
                      </div>
                    </div>
                  </div>

                  <div class="flex">
                    <h2 class="lg:text-base text-xs font-bold capitalize text-slate-400 py-2">
                      <input id="status" type="checkbox" value="true" name="status" class="" v-model="isPaymentConfirm" />
                      3.2 Payment Confirmed
                    </h2>
                  </div>

                  <div class="flex">
                    <h1 class="whitespace-nowrap text-green-800 font-bold text-sm py-1">
                      Payment Remarks:
                    </h1>
                    <input v-model="paymentRemarks" class="capitalize rounded border py-0.5 px-2 w-4/12 ml-3" />
                  </div>
                </div>
                <h1 class="text-xl ml-5">
                  Step 4. <span class="font-bold">Validation</span>
                </h1>
                <div class="lg:w-11/12 mx-auto border-l-4 shadow-sm lg:px-5 px-2 my-2 py-4">
                  <h2 class="lg:text-base text-xs font-bold capitalize text-slate-400 py-2">
                    4.1 Enrollees online accounts
                  </h2>

                  <div>
                    <div class="grid grid-cols-3">
                      <div class="block">
                        <div class="flex">
                          <label class="text-sm">LSU Email :</label>
                          <input id="email" name="email" class="capitalize rounded border px-2 w-fit ml-3"
                            v-model="lsuEmail" />
                        </div>

                        <div class="flex mt-3 w-fit">
                          <label class="text-sm">LSU Email Password:</label>
                          <div class="">
                            <input id="email" name="email" class="capitalize rounded border px-2 w-fit ml-3"
                              v-model="lsuEmailPassword" />
                          </div>
                        </div>
                      </div>

                      <div class="block">
                        <div class="flex">
                          <label class="text-sm">Canvas Email:</label>
                          <input id="email" name="email" class="capitalize rounded border px-2 w-fit ml-3"
                            v-model="canvasEmail" />
                        </div>

                        <div class="flex mt-3">
                          <label class="text-sm">Canvas Password:</label>
                          <input id="email" name="email" class="capitalize rounded border px-2 w-fit ml-3"
                            v-model="canvasPassword" />
                        </div>
                      </div>

                      <div class="block">
                        <div class="flex">
                          <label class="text-sm">Automate Username:</label>
                          <input id="email" name="email" class="capitalize rounded border px-2 w-fit ml-3"
                            v-model="schoolAutomateUsername" />
                        </div>

                        <div class="flex mt-3">
                          <label class="text-sm">Automate Password:</label>
                          <input id="email" name="email" class="capitalize rounded border px-2 w-fit ml-3"
                            v-model="schoolAutomatePassword" />
                        </div>
                      </div>
                    </div>
                    <div class="border w-fit bg-green-900 py-1 px-3 text-white mt-3 mb-3" @click="sendEmailCredentials">
                      Send Credentials
                    </div>
                  </div>

                  <h2 class="lg:text-base text-xs font-bold capitalize text-slate-400 py-2">
                    <input id="status" type="checkbox" value="true" name="status" class=""
                      v-model="enrollmentIsValidated" />
                    4.2 Enrollment Complete
                  </h2>
                </div>

                <div class="bg-green-700 text-white py-2 px-5 my-2" v-if="successToastSubmitCredentialToGmail">
                  Sent!
                </div>

                <button
                  class="capitalize border border-green-800 lg:mt-10 mt-1 px-3 py-1 text-sm bg-green-800 text-white rounded mx-auto block"
                  type="submit">
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
