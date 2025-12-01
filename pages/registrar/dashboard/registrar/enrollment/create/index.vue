<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
import collegeOrSchoolJSON from "../college_school.json";
import courseOrProgramJSON from "../course_program.json";
import courseMajorJSON from "../course_major.json";
const endpoint = ref(userStore.mainDevServer);

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);

const id = ref();
const enrollmentId = ref("EN" + Date.now());
const studentId = ref("-");
const firstName = ref("-");
const middleName = ref("-");
const lastName = ref("-");
const suffixName = ref("N/A");
const dateOfBirth = ref("");
const gender = ref("");
const contactNumber = ref("-");
const college = ref("-");
const courseProgram = ref("-");
const courseYear = ref("-");
const courseMajor = ref("-");
const contactEmail = ref("-");
const lsuEmail = ref("-");
const lsuEmailPassword = ref("-");
const canvasEmail = ref("-");
const canvasPassword = ref("-");
const schoolAutomateUsername = ref("-");
const schoolAutomatePassword = ref("-");
const admissionStatus = ref(false);
//image
// const files = ref([]);
const upload_status = ref("");
const imagePreview = ref("");
const documentData = ref("");
//image
const documents = ref(
  "https://upload.wikimedia.org/wikipedia/en/b/b0/LSU-Ozamiz_Seal.png"
);
const allowEnrollment = ref(false);
const isFormSubmitted = ref(false);
const isAdmissionConfirmed = ref(false);
const admissionRemarks = ref("-");
const advisingRemarks = ref("-");
const paymentRemarks = ref("-");
const isAssigningSubjectsOrCourse = ref(false);
const isSubjectsOrCoursesSuccessfullyAssigned = ref(false);
const subjectLoadAndAssessment = ref(false);
const modeOfPayment = ref("-");
const proofOfPayment = ref(
  "https://upload.wikimedia.org/wikipedia/en/b/b0/LSU-Ozamiz_Seal.png"
);
const isSubmitReceipt = ref(false);
const isPaymentConfirm = ref(false);
const enrollmentIsValidated = ref(false);
const dateOfEnrollment = ref(Date.now());
const updatedBy = ref(contactEmail.value);
const lastUpdatedOn = ref(Date.now());
const created_by_name = ref(contactEmail.value);
const created_by_email = ref(contactEmail.value);
let errors = ref([]);
let toggleSideBarMenu = ref(true);

onMounted(() => {
  setTimeout(() => {
    if (
      userStore.user.isAuthenticated &&
      (userStore.user.email === emailRegistrar.value ||
        userStore.user.email === developerEmail.value ||
        userStore.user.email === testEmail.value)
    ) {
      router.push("/");
    } else {
      router.push("/unauthorized");
    }
  }, 5000);
});


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

const btnTogoEnrollmentList = () => {
  // router.push("/registrar/enrollment");
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const uploadedFile = (e) => {
  documentData.value = e.target.files[0];
  imagePreview.value = URL.createObjectURL(documentData.value);
  // console.log(e.target.files[0]);
  // documents.value = "https://lsufullstack.onrender.com/media/files/images/" + e.target.files[0].name;
  documents.value = "http://127.0.0.1:8000/media/files/images/" + e.target.files[0].name;
};

const saveFile = async () => {
  let formData = new FormData();
  formData.append("image", documentData.value);

  let axiosConfig = {
    headers: {
      Authorization: userStore.user.token,
      "Content-Type": "multipart/form-data",
    },
  };
  axios
    .post(endpoint.value + "/api/enrollment/image/list/images/", formData, axiosConfig)
    .then((response) => {
      // console.log(response);
      upload_status.value = "success";
    })
    .catch(() => {
      upload_status.value = "error";
    });
};

const submitNewEnrollmentBtn = () => {
  isFormSubmitted.value = true;
  submitForm();
  submitEnrollmentToGmail();
  saveFile();
};

const submitEnrollmentToGmail = async () => {
  await $fetch(endpoint.value + "/api/enrollment/submit-enrollment-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body: {},
  })
    .then((response) => { })
    .catch((error) => {
      // console.log(error);
    });
};

const submitForm = async () => {
  // console.log("submitForm");
  await $fetch(endpoint.value + "/api/enrollment/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // body: {},
  })
  .then((response) => {
    // console.log("response", response);
    // router.push({ path: "/registrar/enrollment" });
  })
}
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
                <div class="shadow w-full mb-10">
                  <button @click="btnTogoEnrollmentList"
                    class="shadow text-center uppercase m-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap">
                    Enrollment List
                  </button>
                </div>
                <h1
                  class="font-bold mt-5 mb-5 text-center lg:text-3xl text-xl block px-3 whitespace-nowrap lasalle-green-text capitalize">
                  online enrollment
                </h1>
                <div class="lg:w-fit mx-auto">
                  <h1 class="text-xl text-green-800 lg:ml-5 ml-2">
                    Step 1. <span class="font-bold">Admission</span>
                  </h1>
                  <div class="lg:w-11/12 mx-auto lg:px-5 px-2 my-2 shadow-sm py-4 text-xs">
                    <div class="flex">
                      <h2 class="font-bold lg:text-base text-xs capitalize text-green-800">
                        1.1 Fill Out Admission Form
                      </h2>
                      <h1 class="ml-1 lg:mt-1 text-xs lowercase italic font-semibold">
                        (<span class="text-red-600 font-bold">*</span>
                        - is required)
                      </h1>
                    </div>
                    <form class="lg:w-fit mx-auto" v-on:submit.prevent="submitNewEnrollmentBtn">
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Enrollment
                          ID</label>
                        <input id="enrollmentId" name="enrollmentId"
                          class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="Enrollment Id"
                          v-model="enrollmentId" disabled />
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">
                          Student ID
                          <span class="text-slate-400 text-xs mb-2 lg:hidden block">
                            (For Continuing Student)</span>
                        </label>
                        <div class="flex">
                          <input id="studentId" name="studentId" class="capitalize rounded border py-0.5 px-2 w-full"
                            placeholder="Student Id" v-model="studentId" />
                          <span class="text-slate-400 whitespace-nowrap text-xs mt-1 ml-2 lg:block hidden">
                            (For Continuing Student)</span>
                        </div>
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">
                          First Name<span class="text-red-500">*</span></label>
                        <input v-model="firstName" name="firstName"
                          class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="First Name" />
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Middle
                          Name<span class="text-red-500">*</span></label>
                        <input id="middlename" name="middlename"
                          class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="Middle Name"
                          v-model="middleName" />
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Last
                          Name<span class="text-red-500">*</span></label>
                        <input id="lastname" name="lastname" class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                          placeholder="Last Name" v-model="lastName" />
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Suffix</label>
                        <input id="suffixName" name="suffixName"
                          class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="e.g SR. JR. II"
                          v-model="suffixName" />
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">
                          Date of Birth<span class="text-red-500">*</span></label>
                        <input id="dateOfBirth" name="dateOfBirth" type="date"
                          class="lowercase rounded py-0 px-2 lg:w-fit w-full border border-gray-200"
                          placeholder="Date of Birth" v-model="dateOfBirth" />
                      </div>
                      <div class="w-full flex my-3 md:justify-normal justify-between">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Gender<span
                            class="text-red-500">*</span></label>
                        <input type="radio" id="male" name="male" value="male" class="mr-1 my-1 block" v-model="gender" />
                        <label class="mr-3 py-1">Male</label>
                        <input type="radio" class="mr-1 my-1 block" id="female" name="female" value="female"
                          v-model="gender" />
                        <label class="lg:mr-3 py-1">Female</label>
                      </div>
                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">
                          Contact Number<span class="text-red-500">*</span></label>
                        <input id="contactNumber" name="contactNumber"
                          class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full" placeholder="e.g 09XXXXXXXXX"
                          v-model="contactNumber" />
                      </div>

                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-1.5 whitespace-nowrap block lg:text-right mx-3 capitalize w-32">
                          College/School<span class="text-red-500">*</span></label>
                        <div class="">
                          <select id="college" v-model="college" name="college"
                            class="capitalize rounded border py-0.5 px-2 border-slate-300 w-full" required>
                            <option value="N/A" disabled selected>
                              Select College or School
                            </option>
                            <option value="" disabled>
                              CON (College of Nursing) - Walk In Enrollment
                            </option>
                            <option value="" disabled>
                              CTHM (College of Tourism and Hospitality Management) - Walk
                              In Enrollment
                            </option>
                            <option value="" disabled>BEd (Basic Education)</option>
                            <option :value="college.name" v-for="(college, i) in collegeOrSchoolData" :key="i">
                              {{ college.name }}
                            </option>
                          </select>
                        </div>
                      </div>

                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-1.5 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Course/Program<span
                            class="text-red-500">*</span></label>
                        <select id="courseProgram" v-model="courseProgram" name="courseProgram"
                          class="capitalize rounded border py-0.5 px-2 border-slate-300 lg:w-9/12 w-full" required>
                          <option value="N/A" disabled selected>
                            Select Course Program
                          </option>
                          <option :value="cp.name" v-for="(cp, i) in filteredCourseOrProgram" :key="i">
                            {{ cp.name }}
                          </option>
                        </select>
                      </div>

                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-1.5 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">
                          Course Major</label>
                        <select id="courseMajor" v-model="courseMajor" name="courseMajor"
                          class="capitalize rounded border py-0.5 px-2 border-slate-300 lg:w-9/12 w-full">
                          <option value="N/A" disabled selected>
                            Select Course Major
                          </option>
                          <option :value="cm.name" v-for="(cm, i) in filteredCourseMajor" :key="i">
                            <span v-if="cm">{{ cm.name }}</span>
                          </option>
                        </select>
                      </div>

                      <div class="w-full lg:flex my-3">
                        <label
                          class="text-gray-400 text-xs mt-1.5 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">
                          Course Year/Grade<span class="text-red-500">*</span></label>
                        <div class="">
                          <select id="courseYear" v-model="courseYear" name="courseYear"
                            class="capitalize rounded border py-0.5 px-2 border-slate-300 lg:w-auto w-full" required>
                            <option value="N/A" disabled>Select Course Year</option>
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
                          class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32">Contact
                          Email</label>
                        <input id="contactEmail" name="contactEmail"
                          class="lowercase rounded border py-0.5 px-2 border-slate-300 lg:w-7/12 w-full"
                          v-model="contactEmail" type="email" />
                      </div>
                      <div class="w-full lg:flex mt-3">
                        <label
                          class="text-gray-400 lg:pt-3 text-xs lg:mt-2 whitespace-nowrap lg:block lg:text-right mr-3 capitalize w-32 flex">
                          <span class="block pr-1">Valid Government ID or</span>
                          <span class="lg:block flex">School ID <span class="text-red-500">*</span></span>
                        </label>
                        <div class="lg:mt-3">
                          <div class="flex lg:mb-5 mb-2" v-if="!isFormSubmitted">
                            <div class="flex h-fit">
                              <input type="file" @change="uploadedFile" accept="image/*" />
                            </div>
                          </div>
                          <div class="w-fit lg:mx-0 mx-auto">
                            <div class="w-56 shadow">
                              <img class="lg:w-full h-56 object-contain" v-if="imagePreview === ''" :src="documents" />
                              <img class="lg:w-full h-56 object-contain" v-else :src="imagePreview" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="mt-5" v-if="!isFormSubmitted">
                        <sup class="w-full lg:mx-auto block text-xs text-gray-500 pt-2">
                          *For Continuing Students: Upload softcopy of Student ID/Any
                          valid ID (IMAGE/PNG/PDF).<br />
                          *For New Students: Submit Required Documents (Orginal Hard
                          Copies) at registrar's office.
                        </sup>
                      </div>

                      <button v-if="!isFormSubmitted"
                        class="capitalize border border-green-800 my-10 px-3 py-1 text-sm bg-green-800 hover:font-bold text-white rounded mx-auto block"
                        type="submit">
                        submit
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>

<style scoped>
input[type="file"]::file-selector-button {
  background: #004d01;
}
</style>