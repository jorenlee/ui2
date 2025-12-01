<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);

// const enrollments = await $fetch(endpoint.value + "/api/enrollment/list").catch((error) => error.data)

onMounted(() => {
  if (userStore.user.isAuthenticated && userStore.user.email !== null) {
    router.push("/enrollment/portal");
    // enrollments.value.filter(function (params) {
    //   return params.contactEmail === userStore.user.email
    // });
  } else {
    router.push("/enrollment");
  }
});

const id = ref(null);

const info = ref({
  enrollment_id: "EN" + Date.now(),
  student_id: "-",
  firstname: "-",
  middlename: "-",
  lastname: "-",
  suffixname: "-",
  contact_number: "-",
  contact_email: userStore.user.email,
  admission_status: false,
  allow_enrollment: false,
  is_form_submitted: false,
  is_admission_confirmed: false,
  admission_remarks: "-",
  advising_remarks: "-",
  payment_remarks: "-",
  is_assigning_subjects_or_course: false,
  is_subjects_or_courses_successfully_assigned: false,
  subject_load_and_assessment: false,
  mode_of_payment: "-",
  proof_of_payment: "https://firebasestorage.googleapis.com/v0/b/public-images-cbecf.appspot.com/o/public%2F1684826293302?alt=media&token=6bd368c2-5a1b-4d13-9c83-eafccfee8fd2",
  is_submit_receipt: false,
  documents: "https://firebasestorage.googleapis.com/v0/b/public-images-cbecf.appspot.com/o/public%2F1684826293302?alt=media&token=6bd368c2-5a1b-4d13-9c83-eafccfee8fd2",
  is_payment_confirm: false,
  enrollment_is_validated: false,
  date_of_enrollment: Date.now(),
  updated_by: userStore.user.email,
  last_updated_on: Date.now(),
  created_by_name: userStore.user.email,
  created_by_email: userStore.user.email,
})

const banner_image_preview_receipt = ref("https://firebasestorage.googleapis.com/v0/b/public-images-cbecf.appspot.com/o/public%2F1684826293302?alt=media&token=6bd368c2-5a1b-4d13-9c83-eafccfee8fd2")

const logOut = () => {
  router.push("/enrollment");
  userStore.removeToken();
}

const submitNewEnrollmentBtn = () => {
  isFormSubmitted.value = true;
  submitForm();
  submitEnrollmentToGmail();
}

const submitForm = async () => {
  // console.log("submitForm");
  await $fetch(endpoint.value + "/api/enrollment/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  })
  .then((res) => {
    // console.log("res", res);
    router.push("/enrollment/portal");
  })
}

const submitEnrollmentToGmail = async () => {
  // console.log("submitEnrollmentToGmail");
  await $fetch(endpoint.value + "/api/enrollment/submit-enrollment-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  })
    .then((res) => {
      // console.log("res", res);
    })
}

async function updateEnrollment() {
  // console.log("updateEnrollment");
  await $fetch(endpoint.value + "/api/enrollment/" + id.value + "/edit/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  })
  .then((res) => {
    // console.log("res", res);
    // router.push({ path: "/registrar" });
  })
}
</script>

<template>
  <div class="">
    <div class="lasalle-green shadow-lg lg:h-16">
      <div class="lg:w-11/12 mx-auto lg:px-4">
        <div class="lg:flex lg:justify-between">
          <a href="/" class="flex lg:border-0 border-b">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
              class="lg:w-48 h-10 my-3 lg:mx-0 mx-auto"
            />
          </a>
          <div class="flex lg:pb-0 justify-between lg:px-0 px-2">
            <h1 class="text-gray-300 text-base py-5 block">
              {{ userStore.user.email }}
            </h1>
            <p
              class="text-white whitespace-nowrap py-5 font-bold text-base cursor-pointer hover:underline lg:pl-5"
              @click="logOut"
            >
              Log Out
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full min-h-screen">
      <div class="">
        <div class="lg:w-full lg:p-5 bg-gray-50">
          <div
            class="xl:w-8/12 lg:10/12 w-full lg:px-0 px-2 mx-auto h-full bg-white shadow-lg pt-1 lg:pb-10 pb-5"
          >
            <div class="relative">
              <h1
                class="font-bold mt-5 mb-5 text-center lg:text-3xl text-xl block px-3 whitespace-nowrap lasalle-green-text capitalize"
              >
                online enrollment
              </h1>
              <p>Continuing Student</p>
              <div>
                <h1 class="text-xl text-green-800 lg:ml-5">
                  Step 1. <span class="font-bold">Admission</span>
                </h1>
                <div
                  class="lg:w-11/12 mx-auto lg:px-5 px-2 border-l-4 my-2 shadow-sm py-4 text-xs"
                  :class="info.is_form_submitted ? 'border-green-800' : ''"
                >
                  <div class="flex">
                    <h2 class="font-bold lg:text-base text-xs capitalize text-green-800">
                      <i
                        class="fa-solid fa-circle-minus mr-1 text-gray-500"
                        v-if="!info.is_form_submitted"
                      ></i>
                      <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                      1.1 Fill Out Admission Form
                    </h2>
                    <h1 class="ml-1 lg:mt-1 text-xs lowercase italic font-semibold">
                      (<span class="text-red-600 font-bold">*</span>
                      - is required)
                    </h1>
                  </div>
                  <form
                    class="lg:w-fit mx-auto"
                    v-on:submit.prevent="submitNewEnrollmentBtn"
                  >
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32"
                        >Enrollment ID</label
                      >
                      <input
                        id="enrollmentId"
                        name="enrollmentId"
                        class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="Enrollment Id"
                        v-model="info.enrollment_id"
                        disabled
                      />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32"
                      >
                        Student ID
                         <span class="text-slate-400 text-xs mb-2 lg:hidden block">
                        (For Continuing Student)</span
                      >
                      </label>
                      <div>
                        <input
                        id="studentId"
                        name="studentId"
                        class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="Student Id"
                        v-model="info.student_id"
                        :disabled="info.is_form_submitted"
                      />
                      <span class="text-slate-400 text-xs mt-2 ml-2 lg:block hidden">
                        (For Continuing Student)</span
                      >
                      </div>
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32"
                      >
                        First Name<span class="text-red-500">*</span></label
                      >
                      <input
                        v-model="info.firstname"
                        name="firstName"
                        class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="First Name"
                        :disabled="info.is_form_submitted"
                      />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32"
                        >Middle Name<span class="text-red-500">*</span></label
                      >
                      <input
                        name="middlename"
                        class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="Middle Name"
                        v-model="info.firstname"
                        :disabled="info.is_form_submitted"
                      />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32"
                        >Last Name<span class="text-red-500">*</span></label
                      >
                      <input
                        name="lastname"
                        class="capitalize rounded border py-0.5 px-2 lg:w-1/3 w-full"
                        placeholder="Last Name"
                        v-model="info.lastname"
                        :disabled="info.is_form_submitted"
                      />
                    </div>
                    <div class="w-full lg:flex my-3">
                      <label
                        class="text-gray-400 text-xs mt-2 whitespace-nowrap block lg:text-right mr-3 capitalize w-32"
                        >Contact Email</label
                      >
                      <input
                        name="contactEmail"
                        class="lowercase  rounded border py-0.5 px-2 border-slate-300 lg:w-7/12 w-full"
                        disabled
                        v-model="info.contact_number"
                      />
                    </div>

                    <button
                      v-if="!info.is_form_submitted"
                      class="capitalize border border-green-800 my-10 px-3 py-1 text-sm bg-green-800 text-white rounded mx-auto block hover:font-bold"
                      type="submit"
                    >
                      submit
                    </button>
                  </form>
                  <h2
                    class="font-bold lg:text-base text-xs capitalize py-2"
                    :class="info.is_form_submitted ? 'text-green-800' : 'text-slate-400'"
                  >
                    <i
                      class="fa-solid fa-circle-minus mr-1 text-gray-500"
                      v-if="!info.is_form_submitted"
                    ></i>
                    <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                    1.2 Form Submitted
                  </h2>
                  <h2
                    class="font-bold lg:text-base text-xs capitalize py-2"
                    :class="info.is_form_submitted ? 'text-green-800' : 'text-slate-400'"
                  >
                    <i
                      class="fa-solid fa-circle-minus mr-1 text-gray-500"
                      v-if="!info.is_admission_confirmed"
                    ></i>
                    <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                    1.3 Admission Confirmed
                  </h2>
                  <div class="flex">
                    <h1
                      class="font-bold whitespace-nowrap lg:text-base text-xs capitalize py-1"
                      :class="info.is_admission_confirmed ? 'text-green-800' : 'text-slate-400'"
                    >
                      Admission Remarks:
                    </h1>
                    <input
                      type="text"
                      class="mt-0.5 ml-2 shadow border-0 rounded w-8/12 py-0"
                      disabled
                      v-model="admissionRemarks"
                    />
                  </div>
                </div>
              </div>
            </div>
            <h1
              class="text-xl lg:ml-5"
              :class="info.is_admission_confirmed ? 'text-green-800' : 'text-slate-400'"
            >
              Step 2.
              <span class="font-bold">Advising</span>
            </h1>
            <div
              class="lg:w-11/12 mx-auto lg:px-5 px-2 border-l-4 my-2 shadow-sm py-4 text-xs"
              :class="info.is_form_submitted ? 'border-green-800' : ''"
            >
              <h2
                class="font-bold lg:text-base text-xs capitalize py-2"
                :class="info.is_assigning_subjects_or_course ? 'text-green-800' : 'text-slate-400'"
              >
                <i
                  class="fa-solid fa-circle-minus mr-1 text-gray-500"
                  v-if="!info.is_assigning_subjects_or_course"
                ></i>
                <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                2.1 Assigning Subjects or Courses
              </h2>
              <h2
                class="lg:text-base text-xs font-bold capitalize py-2"
                :class="
                  info.is_subjects_or_courses_successfully_assigned
                    ? 'text-green-800'
                    : 'text-slate-400'
                "
              >
                <i
                  class="fa-solid fa-circle-minus mr-1 text-gray-500"
                  v-if="!info.is_subjects_or_courses_successfully_assigned"
                ></i>
                <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                2.2 Successfully Added Subjects or Courses
              </h2>
              <div class="flex">
                <h1
                  class="whitespace-nowrap font-bold text-sm py-1"
                  :class="
                    info.is_subjects_or_courses_successfully_assigned
                      ? 'text-green-800'
                      : 'text-slate-400'
                  "
                >
                  Advising Remarks:
                </h1>
                <input
                  type="text"
                  class="mt-0.5 ml-2 shadow border-0 rounded w-8/12 py-0"
                  disabled
                  v-model="info.advising_remarks"
                />
              </div>
            </div>

            <h1
              class="text-xl lg:ml-5"
              :class="
                info.is_subjects_or_courses_successfully_assigned
                  ? 'text-green-800'
                  : 'text-slate-400'
              "
            >
              Step 3. <span class="font-bold">Payment</span>
            </h1>
            <div
              class="lg:w-11/12 mx-auto lg:px-5 px-2 border-l-4 my-2 shadow-sm py-4 text-xs"
              :class="info.is_form_submitted ? 'border-green-800' : ''"
            >
              <h2
                class="lg:text-base text-xs font-bold capitalize py-2"
                :class="info.is_submit_receipt ? 'text-green-800' : 'text-slate-400'"
              >
                <i
                  class="fa-solid fa-circle-check mr-1 text-green-800"
                  v-if="info.is_payment_confirm"
                ></i>
                <i class="fa-solid fa-circle-minus mr-1 text-gray-500" v-else></i>
                3.1 Payment Receipt
              </h2>
              <div
                class="mt-3"
                v-if="info.is_subjects_or_courses_successfully_assigned"
                :class="info.is_payment_confirm ? 'hidden' : ''"
              >
                <div class="flex">
                  <div class="flex h-fit">
                    <form v-on:submit.prevent="updateEnrollment">
                      <input
                        class="border"
                        type="file"
                        @change="handleChangeReceipt"
                        accept="image/*"
                      />
                      <button>Submit Receipt</button>
                    </form>
                  </div>
                  <div class="w-5/12 ml-10 text-center pt-3">
                    <div
                      class="text-white bg-green-900 transition-all ease-in-out duration-200 h-5 flex items-center"
                      :style="`width:${progressPercentReceipt}%`"
                    >
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
              <h2
                class="lg:text-base text-xs font-bold capitalize py-2"
                :class="isPaymentConfirm ? 'text-green-800' : 'text-slate-400'"
              >
                <i
                  class="fa-solid fa-circle-check mr-1 text-green-800"
                  v-if="isPaymentConfirm"
                ></i>
                <i class="fa-solid fa-circle-minus mr-1 text-gray-500" v-else></i>
                3.2 Payment Confirmed
              </h2>
              <div class="flex">
                <h1
                  class="whitespace-nowrap font-bold text-sm py-1"
                  :class="isPaymentConfirm ? 'text-green-800' : 'text-slate-400'"
                >
                  Payment Remarks:
                </h1>
                <input
                  type="text"
                  class="mt-0.5 ml-2 shadow border-0 rounded w-8/12 py-0"
                  disabled
                  v-model="paymentRemarks"
                />
              </div>
            </div>
            <h1
              class="text-xl lg:ml-5"
              :class="isPaymentConfirm ? 'text-green-800' : 'text-slate-400'"
            >
              Step 4. <span class="font-bold">Validation</span>
            </h1>
            <div
              class="lg:w-11/12 mx-auto lg:px-5 px-2 border-l-4 my-2 shadow-sm py-4 text-xs"
              :class="isFormSubmitted ? 'border-green-800' : ''"
            >
              <h2
                class="lg:text-base text-xs font-bold capitalize py-2"
                :class="info.enrollment_is_validated ? 'text-green-800' : 'text-slate-400'"
              >
                <i
                  class="fa-solid fa-circle-minus mr-1 text-gray-500"
                  v-if="!info.enrollment_is_validated"
                ></i>
                <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                4.1 Enrollees online accounts
              </h2>
              <h2
                class="lg:text-base text-xs font-bold capitalize py-2"
                :class="info.enrollment_is_validated ? 'text-green-800' : 'text-slate-400'"
              >
                <i
                  class="fa-solid fa-circle-minus mr-1 text-gray-500"
                  v-if="!info.enrollment_is_validated"
                ></i>
                <i class="fa-solid fa-circle-check mr-1 text-green-800" v-else></i>
                4.2 Enrollment Complete
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-green-900 p-3">
      <h1 class="text-center text-white text-xs">
        <span class="font-bold">Copyright © 2023 </span
        ><span>La Salle University - Ozamiz</span>
      </h1>
    </div>
  </div>
</template>

<style scoped>
  input[type=file]::file-selector-button {background: #004d01; }
</style>
