<script setup>
import _ from "lodash";
import "./css/main.css";
import moment from "moment";
import { ref, computed } from "vue";
import headOfficeJSON from "./head_office.json";

/* ================= AUTH ================= */
const { user, init } = useAuth();

onMounted(() => { init();});

const headOffice = ref(headOfficeJSON);
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
const formDisplay = ref(true);
const thankYouDisplay = ref(false);
const submitCounter = ref(1);
const dateToday = moment().format("MMMM DD, YYYY h:mm:ss A");
const digitsNum = ref(0);
const requireAllFields = ref(false);
const isSubmitting = ref(false);

const documentTypeList = ref([
  "All",
  "Form or Template",
  "Manual",
  "MOA or MOU",
  "Policy",
  "Portfolio",
  "Procedure",
  "Records",
  "Work Instructions",
]);

const info = ref({
  originating_firstname: user.value?.name,
  originating_middlename: "-",
  originating_lastname: "-",
  originating_office: "Head Office Reviewer",
  originating_email: user.value?.email,
  document_title: "",
  status: "",
  revision_number: "",
  document_type: "Document Type",
  schedule: dateToday,
  purpose: "",
  reviewed_by_name: "",
  reviewed_by_designation: "",
  reviewed_by_date_checked: dateToday,
  reviewed_by_action: "",
  reviewed_by_remarks: "",
  reviewed_by_email: "",
  verified_by_name: "Dr. Wenny Caseros",
  verified_by_designation: "University Chancellor",
  verified_by_date_checked: dateToday,
  verified_by_action: "",
  verified_by_remarks: "",
  verified_by_email: "wenny.caseros@lsu.edu.ph",
  approved_by_name: "",
  approved_by_designation: "",
  approved_by_date_checked: dateToday,
  approved_by_action: "",
  approved_by_remarks: "",
  approved_by_email: "",
  other_comments_remarks: "",
  document_code: "For Review",
  effectivity_date: "",
  rmo_name: "Maria Cristina M. Llauder",
  rmo_email: "recordsmanagement@lsu.edu.ph",
  document_attachment: "",
  tracking_id: "",
});

const updateReviewedByName = () => {
  const selectedOffice = headOffice.value.find(
    (office) => office.designation === info.value.originating_office,
  );
  if (selectedOffice) {
    info.value.reviewed_by_name = selectedOffice.name;
    info.value.reviewed_by_designation = selectedOffice.offices;
    info.value.reviewed_by_email = selectedOffice.office_lsu_email;
  } else {
    info.value.reviewed_by_name = ""; // Clear if no match
  }
};

const submitForm = async () => {
  isSubmitting.value = true;
  let listItems =
    (await $fetch(endpoint.value + "/api/drs/list").catch(
      (error) => error.data,
    )) || 0;
  if (listItems.length === 0) {
    info.value.tracking_id = "DRS-" + moment().year() + "-001";
    postAPI();
  } else if (info.value.originating_office === "Head Office Reviewer") {
    requireAllFields.value = true;
    isSubmitting.value = false;
    setTimeout(() => {
      requireAllFields.value = false;
    }, 2000);
  } else {
    let filteredListItems = [];
    listItems.filter((params) => {
      filteredListItems.push(parseInt(params.tracking_id.slice(-3)));
    });
    let largestNumber = Math.max(...filteredListItems);
    console.log(largestNumber);
    digitsNum.value = largestNumber + 1;
    info.value.tracking_id =
      "DRS-" + moment().year() + "-" + String(digitsNum.value).padStart(3, "0");
    postAPI();
  }
};

const invalidLSUEmail = ref(false);
const postAPI = async () => {
  const pattern = /^[a-zA-Z0-9._-]+@lsu\.edu\.ph$/;

  if (!pattern.test(info.value.originating_email)) {
    invalidLSUEmail.value = true;
    isSubmitting.value = false;

    setTimeout(() => {
      invalidLSUEmail.value = false;
    }, 3000);
  } else {
    if (submitCounter.value === 1) {
      submitCounter.value = 0;
      await $fetch(endpoint.value + "/api/drs/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: info.value,
      }).then((response) => {
        formDisplay.value = false;
        thankYouDisplay.value = true;
        submitCounter.value = 0;
        isSubmitting.value = false;
        // console.log(response);
        submitDRSFormToGmail();
      });
    }
  }
};
const forRevisionInput = ref(false);
const changeStatus = () => {
  if (info.value.status === "For Revision") {
    forRevisionInput.value = true;
    // console.log(info.value.status)
  } else {
    forRevisionInput.value = false;
    // console.log(info.value.status)
  }
};

const submitDRSFormToGmail = async () => {
  await $fetch(endpoint.value + "/api/drs/drs-notification-submit/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((response) => {
    console.log(response);
  });
};
</script>
<template>
  <div>
  
      <div
      v-if="formDisplay"
        class="header bg-gradient-to-b from-[#fefefe] via-[#fefefe] to-[#bce3c2]"
      >
        <div class="lg:w-6/12 w-11/12 mx-auto bg-white my-20">
          <form v-on:submit.prevent="submitForm" class="">
            <div class="border-2 border-green-700 shadow-lg my-3">
              <div class="">
                <h2
                  class="lg:text-base text-sm px-3 uppercase py-1.5 font-bold bg-green-900 text-white text-center tracking-wide"
                >
                  Document Review Sheet Form
                  <!-- <span class="font-light text-xs bg-green-900 text-white block">
                    {{ info.document_code }}</span> -->
                </h2>
                <!-- <div class="w-fit mx-auto text-xs mt-4 px-4 font-montserrat tracking-tight"> DRS No. <span class="border-b px-1">{{ info.tracking_id }}</span></div> -->
                <div class="lg:p-5 px-2 pt-3 pb-2 gap-3">
                  <div class="w-full lg:mb-0 mb-5">
                    <div class="w-full gap-3">
                      <div class="gap-3 w-full">
                        <div class="gap-3 lg:mb-2 shadow py-2 px-2">
                          <div class="lg:gap-x-2 gap-x-1 w-full">
                            <div class="lg:flex items-center w-full mb-2">
                              <label
                                class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-6/12"
                              >
                                <div class="w-fit lg:ml-auto pr-5">
                                  Reference Document
                                  <span class="text-red-600 font-normal text-sm"
                                    >*</span
                                  >
                                </div>
                              </label>

                              <div
                                class="w-full flex items-center gap-x-1 bg-white border-b-2 border-green-700 shadow-lg rounded-sm h-fit"
                              >
                                <img
                                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/Google_Drive.png"
                                  class="h-5 w-5 ml-2"
                                />
                                <input
                                  type="url"
                                  class="px-1 w-full border-t-0 border-x-0 border-green-700 text-xs py-2"
                                  placeholder="Google Drink Link"
                                  v-model="info.document_attachment"
                                  required
                                />
                              </div>
                            </div>

                            <div class="lg:flex items-center w-full mb-2">
                              <label
                                class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-6/12"
                              >
                                <div class="w-fit lg:ml-auto pr-5">
                                  Document Title
                                  <span class="text-red-600 font-normal text-sm"
                                    >*</span
                                  >
                                </div>
                              </label>
                              <div class="w-full">
                                <input
                                  type="text"
                                  class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                  placeholder="Document Title"
                                  v-model="info.document_title"
                                  required
                                />
                              </div>
                            </div>

                            <div class="lg:flex items-center w-full mb-2">
                              <label
                                class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-6/12"
                              >
                                <div class="w-fit lg:ml-auto pr-5">
                                  Head Office Reviewer
                                  <span class="text-red-600 font-normal text-sm"
                                    >*</span
                                  >
                                </div>
                              </label>
                              <div class="w-full">
                                <select
                                  v-model="info.originating_office"
                                  class="px-1 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                  required
                                  @change="updateReviewedByName"
                                >
                                  <option
                                    value="Head Office Reviewer"
                                    disabled
                                    selected
                                  >
                                    Head Office Reviewer
                                  </option>
                                  <option
                                    :value="j.designation"
                                    v-for="(j, i) in headOffice"
                                    :key="i"
                                  >
                                    {{ j.officeAbbr }} | {{ j.designation }}
                                  </option>
                                </select>
                              </div>
                            </div>



                            <div class="lg:flex items-center w-full mb-2">
                              <label
                                class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-6/12"
                              >
                                <div class="w-fit lg:ml-auto pr-5">
                                  Document Type
                                  <span
                                    class="text-red-600 font-normal text-sm lg:ml-1"
                                    >*</span
                                  >
                                </div>
                              </label>
                              <div class="w-full">
                                <select
                                  v-model="info.document_type"
                                  class="px-1 lg:w-5/12 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                  required
                                >
                                  <option
                                    value="Document Type"
                                    disabled
                                    selected
                                  >
                                    Document Type
                                  </option>
                                  <option
                                    :value="j"
                                    v-for="(j, i) in documentTypeList"
                                    :key="i"
                                  >
                                    {{ j }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <div class="lg:flex items-center w-full mb-2">
                              <label
                                class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-6/12"
                              >
                                <div class="w-fit lg:ml-auto pr-5">
                                  Status
                                  <span
                                    class="text-red-600 font-normal text-sm lg:ml-1"
                                    >*</span
                                  >
                                </div>
                              </label>
                              <div class="w-full">
                                <div
                                  class="flex lg:w-fit lg:px-0 shadow bg-white border-green-700 border-b-2"
                                >
                                  <div
                                    class="lg:shadow-lg px-1 text-black text-xs items-center flex"
                                  >
                                    <span>
                                      <input
                                        type="radio"
                                        value="New"
                                        v-model="info.status"
                                        @change="changeStatus()"
                                        class="mr-1"
                                        id="New"
                                        ref="fileInput"
                                      />
                                    </span>
                                    <label class="ml-1 py-2" for="New">
                                      <span class="font-bold">New</span>
                                    </label>
                                  </div>
                                  <div
                                    class="flex items-center text-xs whitespace-nowrap lg:shadow-lg px-1"
                                  >
                                    <label
                                      class="ml-1 flex items-center w-full text-black text-xs"
                                      for="ForRevision"
                                    >
                                      <span class="mr-1">
                                        <input
                                          type="radio"
                                          value="For Revision"
                                          v-model="info.status"
                                          @change="changeStatus()"
                                          class=""
                                          id="ForRevision"
                                        />
                                      </span>
                                      <span class="font-bold mr-1"
                                        >For Revision</span
                                      >
                                      <span
                                        class="font-bold mr-2"
                                        :class="
                                          forRevisionInput ? '' : 'hidden'
                                        "
                                        >No.
                                      </span>
                                      <input
                                        :class="
                                          forRevisionInput ? '' : 'hidden'
                                        "
                                        type="text"
                                        class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-1 rounded-sm text-xs"
                                        placeholder="Revision Number"
                                        v-model="info.revision_number"
                                        ref="fileInput"
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div class="w-full mb-2 hidden">
                              <label
                                class="lg:text-xs text-[10px] text-black pb-2 font-bold whitespace-nowrap lg:w-6/12"
                              >
                                <div class="w-fit lg:ml-auto pr-5">
                                  Originating Email
                                  <span class="text-red-600 font-normal text-sm"
                                    >*</span
                                  >
                                </div>
                              </label>
                              <div class="w-full">
                                <input
                                  :disabled="true"
                                  type="email"
                                  id="email"
                                  class="px-2 lg:w-8/12 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                                  placeholder="e.g. user.name@lsu.edu.ph"
                                  v-model="info.originating_email"
                                  required
                                  title="Please enter a valid LSU email address (e.g., user.name@lsu.edu.ph)"
                                />

                                <!-- pattern="^[a-zA-Z0-9._-]+@lsu\.edu\.ph$" -->
                                <p
                                  v-if="invalidLSUEmail"
                                  class="text-xs text-red-700 mt-2 px-1"
                                >
                                  Invalid LSU email address.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="w-fit mx-auto my-5 hidden">
                          <div class="text-center flex">
                            <input
                              type="text"
                              class="px-1 w-full rounded-sm h-8 text-xs text-right"
                              placeholder="First Name"
                              v-model="info.originating_firstname"
                              required
                            />
                            <!-- <input type="text" class="px-1 w-full 
                        rounded-sm  h-8 text-xs" placeholder="First Name" 
                          v-model="info.originating_middlename" required /> -->
                            <input
                              type="text"
                              class="px-1 w-full rounded-sm h-8 text-xs"
                              placeholder="Last Name"
                              v-model="info.originating_lastname"
                              required
                            />
                          </div>
                          <div
                            class="border-t-2 border-black text-center text-xs py-1"
                          >
                            Originator’s Printed Name (E-Signature)
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
                  <button
                    :disabled="isSubmitting"
                    class="px-10 lg:rounded-lg rounded-md bg-green-900 text-white font-bold py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-green-900 hover:text-green-900 lg:text-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <i v-if="!isSubmitting" class="fa fa-paper-plane mr-2" aria-hidden="true"></i>
                    <i v-if="isSubmitting" class="fa fa-spinner fa-spin mr-2" aria-hidden="true"></i>
                    {{ isSubmitting ? 'Submitting...' : 'Submit' }}
                  </button>
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
  
      <!-- v-if="thankYouDisplay"  -->
 
      <div
      v-if="thankYouDisplay" 
        class="flex items-center min-h-[630px]"
      >
       <div class="lg:w-fit lg:mx-auto w-full  lg:h-4/6 gap-10  bg-white lg:px-14 px-3 py-1 lg:my-10 shadow-lg lg:rounded-7xl">

         <div>
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
            class="lg:w-44 w-20 mx-auto"
          />
        </div>
        <div
          class="text-xl text-green-900 text-center w-fit mx-auto lg:py-10 py-5"
        >
          <h1 class="font-bold text-3xl">Thanks for submitting!</h1>
          <p class="font-light pt-3 pb-10">Your request has been sent!</p>
          <p class="font-light text-xs italic mb-10">
            Please check your email.
          </p>
          <a
            href="https://lsu.edu.ph/drs"
            class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 mx-auto w-fit lg:block hidden text-sm uppercase"
          >
            <i class="fa fa-arrow-circle-left mr-4"></i> Document Review Sheet
          </a>
        </div>
       </div>
      </div>
  
  </div>
</template>
<style scoped>
input[type="radio"] {
  margin: 3px auto auto auto;
}

.error {
  color: red;
}

input[type="file"] {
  display: none;
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
</style>
