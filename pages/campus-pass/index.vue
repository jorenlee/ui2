<script setup>
import { useUserStore } from "@/stores/user";
import _ from "lodash";
import VueDatePicker from "@vuepic/vue-datepicker";
import "./css/main.css";
import moment from "moment";
import { ref, computed } from "vue";

const pleaseFillUpAllRequiredFields = ref(false);
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
const formDisplay = ref(true);
const thankYouDisplay = ref(false);
const next3Days = ref();

const submitCounter = ref(1);

const bulkUploadDisplay = ref(false);

const manualListDisplay = ref(false);

const addCSVBTN = () => {
  bulkUploadDisplay.value = true;
  manualListDisplay.value = false;
  info.value.name_list = [
    {
      firstname: "",
      middlename: "-",
      lastname: "",
      email: "",
      checkin: "",
    },
  ];
};

const addManuallyBTN = () => {
  bulkUploadDisplay.value = false;
  manualListDisplay.value = true;
  csvData.value = null;
};

const disabledDates = computed(() => {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const afterTomorrow = new Date(tomorrow);
  afterTomorrow.setDate(afterTomorrow.getDate() + 1);

  const afterNextTomorrow = new Date(afterTomorrow);
  afterNextTomorrow.setDate(afterNextTomorrow.getDate() + 1);

  return [tomorrow, afterTomorrow, (next3Days.value = afterTomorrow)];
});

const displayCalendar = ref(false);
const datePicked = ref();
const setDate = (value) => {
  let scheduleString = "";
  for (let i = 0; i < value.length; i++) {
    const formattedDate = moment(value[i]).format("LL");
    scheduleString += formattedDate;

    if (i < value.length - 1) {
      // Add a separator if it's not the last date
      scheduleString += "; "; // Or whatever separator you prefer (e.g., "; ", "\n")
    }
  }

  info.value.schedule = scheduleString;

  // console.log(info.value.schedule)
};

const fileInput = ref(null);
const csvData = ref(null);

const uploadedFile = (e) => {
  const file = e.target.files[0];

  if (!file) {
    console.error("No file selected.");
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    const csvText = event.target.result;
    csvData.value = parseCSV(csvText);
    console.log("Parsed CSV Data:", csvData.value);
  };

  reader.onerror = (error) => {
    console.error("Error reading file:", error);
  };

  reader.readAsText(file);
};

function parseCSV(csvText) {
  const results = [];
  const lines = csvText.split(/\r\n|\n/);

  if (lines.length <= 1) return []; // Empty or only headers

  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length - 1; i++) {
    const values = lines[i].split(",");
    const entry = {};

    for (let j = 0; j < headers.length; j++) {
      entry[headers[j].trim()] = values[j] ? values[j].trim() : "";
    }
    results.push(entry);
  }
  return results;
}

const dateToday = moment().format('LLL')
const trackingIdFormat = "LSUCP" + moment().valueOf()
  // type_of_access: ["Urgent Access"],
const info = ref({
  incharge_firstname: "",
  incharge_middlename: "-",
  incharge_lastname: "",
  incharge_contact_email: "",
  incharge_contact_number: "",
  type_of_access: ["Urgent Access"],
  purpose: "",
  schedule: dateToday,
  approved_activities_link: "",
  approved_gso_docs_link: "",
  attendees: "Individual",
  name_list: [
    {
      firstname: "",
      middlename: "-",
      lastname: "",
      email: "",
      checkin: "",
    },
  ],
  approval_status: "pending",
  remarks: "N/A",
  tracking_id: trackingIdFormat,
});
const listMembers = ref(false);
const supportingDocuments = ref(false);

const addRow = async (obj) => {
  info.value.name_list.push({
    firstname: obj.firstname,
    middlename: "-",
    lastname: obj.lastname,
    email: obj.email,
    checkin: "",
  });
};
const removeRow = (item) => {
  if (info.value.name_list.length > 0) {
    _.pull(info.value.name_list, item);
  }
};
const needSupportingDocs = () => {
  console.log(info.value.type_of_access);
  if (
    info.value.type_of_access.includes("Day Access") ||
    info.value.type_of_access.includes("Night Access") ||
    info.value.type_of_access.includes("Overnight")
  ) {
    supportingDocuments.value = true;
    displayCalendar.value = true;
  } else if (info.value.type_of_access.length === 0) {
    info.value.type_of_access = ["Urgent Access"];
  } else {
    supportingDocuments.value = false;
    displayCalendar.value = false;
  }
};


const submitForm = () => {
  if (csvData.value !== null) {
    info.value.name_list = csvData.value;
  }
  // else {
  //   info.value.name_list = [{
  //     firstname: '',
  //     middlename: '',
  //     lastname: '',
  //     email: ''
  //   }]
  // }

  console.log(info.value);
  postAPI();
};

const postAPI = async () => {
  if (info.value.date === "") {
    console.log("Please Input Date!");
  }
  if (info.value.approved_activities_link === "") {
    info.value.approved_activities_link = "-";
  }
  if (info.value.approved_gso_docs_link === "") {
    info.value.approved_gso_docs_link = "-";
  }
  if (info.value.incharge_middlename === "") {
    info.value.incharge_middlename = "N/A";
  } 
  if (info.value.type_of_access.length === 0) {
    info.value.type_of_access = ["N/A"];
  }
  else if (submitCounter.value === 1) {
    submitCounter.value = 0;
    await $fetch(endpoint.value + "/api/campus-pass/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: info.value,
    }).then((response) => {
      formDisplay.value = false;
      thankYouDisplay.value = true;
      submitCounter.value = 0;
      console.log(response);
      submitAppointmentToGmail();
    });
  }
};
const typeOfAttendees = () => {
  if (info.value.attendees === "Individual") {
    listMembers.value = false;
    info.value.name_list = [
      {
        firstname: "",
        middlename: "-",
        lastname: "",
        email: "",
        checkin: "",
      },
    ];
  }
  if (info.value.attendees === "Group") {
    listMembers.value = true;
  }
};
const submitAppointmentToGmail = async () => {
  await $fetch(endpoint.value + "/api/campus-pass/to-gmail-pending/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      incharge_firstname: info.value.incharge_firstname,
      incharge_contact_email: info.value.incharge_contact_email,
      schedule: info.value.schedule,
      approval_status: info.value.approval_status,
      remarks: info.value.remarks,
      tracking_id: info.value.tracking_id,
      purpose: info.value.purpose,
    },
  }).then((response) => {
    console.log('response',response);
  });
};

</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
          class="align-top w-full h-auto lg:object-fill lg:block hidden"
        />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/enrollment/enrollmentbg-mobile-lower-size.png"
          class="align-top w-full min-h-40 pt-12 lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="lg:block hidden font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Campus Pass
          </h1>
        </div>
        <div class="shadow-lg">
          <div class="w-11/12 mx-auto flex justify-between">
            <ul
              class="flex lasalle-green-text capitalize text-xs pt-2.5 pb-2.5"
            >
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/campus-pass" class="mr-1"> Campus Pass Form </a>
              </li>
            </ul>
            <ul class="flex hover:text-green-800 text-white">
              <li class="px-3 h-full flex items-center capitalize text-xs">
                <a href="/campus-pass/login" class="flex items-center">
                  <!-- <span class="">Admin Login</span> -->
                </a>
              </li>
              <li
                class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-3 h-full flex items-center capitalize text-xs"
              >
                <a href="/campus-pass/login" class="flex items-center">
                  <i class="fa fa-user" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-if="formDisplay">
      <form v-on:submit.prevent="submitForm">
        <div
          class="border-t-2 border-green-700 shadow-lg lg:my-5 my-3 w-11/12 mx-auto"
        >
          <div class=" bg-white">
            <div> 
              <h2
                class="lg:text-base text-xs  font-bold bg-green-900 text-white text-center">
                <p class="px-10 py-2 uppercase">
                  <i class="fa fa-address-card text-white mr-2"></i> 
                  Campus Pass Entry Form
                </p>
                <!-- <p class="font-normal text-[11px] bg-[#fff9f9] border-b border-red-100 py-1 text-red-600">Applications for a Campus Pass must be submitted one day prior to the scheduled date.</p> -->
              </h2>
            </div>
            <div class="lg:p-5 px-2 pt-3 pb-2 gap-3">
              <div class="w-full">
                <div class="w-full gap-3">
                  <div class="gap-3 w-full">
                    <div class="gap-3 lg:mb-2 w-full mx-auto">
                      <div class="lg:flex lg:gap-x-2 gap-x-1 w-full">
                        <div class="lg:w-6/12 w-full mb-2">
                          <label class="text-gray-900 pb-2 font-bold">
                            <i
                              class="lg:text-md text-xs ml-1 mr-1.5 fa fa-id-badge text-green-800"
                            ></i>
                            <span class="lg:text-xs text-[10px]"
                              >First Name<span
                                class="text-red-600 font-normal text-sm lg:ml-1"
                                >*</span
                              ></span
                            >
                          </label>
                          <input
                            type="text"
                            class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                            placeholder="First Name"
                            v-model="info.incharge_firstname"
                            required
                          />
                        </div>

                        <div class="lg:w-6/12 w-full mb-2 block">
                          <label
                            class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"
                          >
                            Last Name<span
                              class="text-red-600 font-normal text-sm lg:ml-1"
                              >*</span
                            ></label
                          >
                          <input
                            type="text"
                            class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                            placeholder="Last Name"
                            v-model="info.incharge_lastname"
                            required
                          />
                        </div>

                        <div class="lg:w-9/12 w-full mb-2">
                          <label
                            class="lg:text-xs text-[10px] text-gray-900 lg:block lg:pb-1 pb-2 font-bold"
                          >
                            <i
                              class="text-md mr-1 ml-1 fa fa-envelope text-green-800"
                            ></i>
                            Contact Email<span
                              class="text-red-600 font-normal text-sm lg:ml-1"
                              >*</span
                            ></label
                          >
                          <input
                            type="email"
                            class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                            placeholder="e.g sample@lsu.edu.ph"
                            v-model="info.incharge_contact_email"
                            required
                          />
                        </div>
                        <div class="lg:w-5/12 w-full mb-2">
                          <label
                            class="lg:text-xs text-[10px] text-gray-900 lg:block lg:pb-1 pb-2 font-bold"
                          >
                            <i
                              class="text-md mr-1 ml-1 fa fa-phone text-green-800"
                            ></i>
                            Contact Number<span
                              class="text-red-600 font-normal text-sm lg:ml-1"
                              >*</span
                            ></label
                          >
                          <input
                            type="tel"
                            class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                            required
                            pattern="((^(\+)(\d){12}$)|(^\d{11}$))"
                            id="incharge_contact_number"
                            name="incharge_contact_number"
                            placeholder="e.g +639201004020"
                            v-model="info.incharge_contact_number"
                            maxlength="13"
                          />
                        </div>

                        <!-- <label class="lg:text-xs text-[10px] text-gray-900 lg:block pb-2 font-bold whitespace-nowrap">
                          <i class='text-md mr-1 ml-1 fa fa-id-badge text-green-800'></i>
                          Full Name<span class="text-red-600 text-sm mr-1">*</span> 
                          <span class="text-[10px] font-normal">(Lastname, Firstname Middlename Suffix)</span>
                        </label> -->

                        <!-- <div class="w-full mb-2 block lg:mt-[28px]">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold lg:hidden">
                         Middle Name </label>
                        <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                        rounded-sm lg:h-9 h-8 text-xs" placeholder="Middle Name" v-model="info.incharge_middlename"/>
                      </div> -->
                      </div>
                    </div>
                    <div class="lg:flex gap-3 w-full mx-auto">
                      <div class="w-full mb-2">
                        <div class="w-full">
                          <label
                            class="lg:text-xs text-[10px] text-gray-900 lg:block pb-1.5 font-bold"
                          >
                            <i
                              class="text-md mr-1 ml-1 fa fa-universal-access text-green-800"
                            ></i>
                            Access Type<span
                              class="text-red-600 font-normal text-sm lg:ml-1"
                              >*</span
                            ></label
                          >
                          <div
                            class="lg:flex gap-x-3 w-full px-3 lg:px-0 mx-auto lg:shadow lg:pt-[2px] pt-1 bg-white border-green-700 border-b-2"
                          >
                            <div
                              class="lg:shadow-lg w-full px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 text-black text-xs items-center flex"
                            >
                              <div class="lg:w-fit lg:mx-auto flex items-center gap-x-2"> 
                                <input
                                  type="checkbox"
                                  value="Day Access"
                                  v-model="info.type_of_access"
                                  @change="needSupportingDocs()"
                                  class="mr-1"
                                  id="DayAccess"
                                />
                                <label for="DayAccess">
                                  <span class="font-bold mr-1">Day Access</span>
                                  <span class="uppercase text-[10px] lg:ml-0 ml-1"
                                  >(3am - 6pm)</span
                                >
                              </label>
                              </div>
                            </div>
                            <div
                              class="lg:shadow-lg w-full px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 text-black text-xs items-center flex"
                            >
                              <div class="lg:w-fit lg:mx-auto flex items-center gap-x-2">  
                                 <input
                                    type="checkbox"
                                    value="Night Access"
                                    v-model="info.type_of_access"
                                    class="mr-1"
                                    id="NightAccess"
                                    @change="needSupportingDocs()"
                                  />
                                  <label for="NightAccess">
                                    <span class="font-bold mr-1">Night Access</span>
                                    <span class="uppercase text-[10px] lg:ml-0 ml-1"
                                      >(6pm - 10pm)</span
                                    >
                              </label>
                              </div>
                             
                            </div>
                            <div
                              class="lg:shadow-lg w-full px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 text-black text-xs items-center flex"
                            >
                             <div class="lg:w-fit lg:mx-auto flex items-center gap-x-2"> 
                               <input
                                  type="checkbox"
                                  value="Overnight"
                                  v-model="info.type_of_access"
                                  @change="needSupportingDocs()"
                                  class="mr-1"
                                  id="Overnight"
                                />
                                <label for="Overnight">
                                  <span class="font-bold mr-1"
                                    >Overnight Access</span
                                  >
                                  <span class="uppercase text-[10px] lg:ml-0 ml-1"
                                    >(10 pm - 6am)</span
                                  >
                                </label>
                              </div>
                            </div>
                            <div
                              class="lg:shadow-lg whitespace-nowrap w-full px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5 text-black text-xs items-center flex"
                            >
                              <div class="lg:w-fit lg:mx-auto flex items-center gap-x-2">
                                <input
                                  type="checkbox"
                                  value="Urgent Access"
                                  v-model="info.type_of_access"
                                  @change="needSupportingDocs()"
                                  class="mr-1"
                                  id="UrgentAccess"
                                />
                                <label for="UrgentAccess">
                                  <span class="font-bold mr-1"
                                    >Urgent Access</span
                                  >
                                  <span
                                    class="capitalize text-[10px] lg:ml-0 ml-1"
                                    >(Accompanied By Guard)</span
                                  >
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="lg:flex lg:gap-x-2 gap-x-1 w-full mx-auto">
                      <div class="w-full mb-2">
                        <label class="text-gray-900 pb-2 font-bold">
                          <i
                            class="lg:text-md text-xs ml-1 mr-1.5 fa fa-info-circle text-green-800"
                          ></i>
                          <span class="lg:text-xs text-[10px]"
                            >Details<span
                              class="text-red-600 font-normal text-sm lg:ml-1"
                              >*</span
                            ></span
                          >
                        </label>
                        <input
                          type="text"
                          class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs"
                          placeholder="Details"
                          v-model="info.purpose"
                          required
                        />
                      </div>

                      <div
                        class="lg:w-5/12 w-full mb-5"
                        :class="displayCalendar ? '' : 'hidden'"
                      >
                        <div
                          class="lg:flex mb-2 w-full"
                          v-show="info.type_of_access !== ''"
                        >
                          <div
                            class="lg:block w-full lg:shadow-none border-green-500"
                          >
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 lg:block pb-1.5 lg:w-auto w-6/12 whitespace-nowrap lg:mr-0 mr-3 font-bold"
                            >
                              <i
                                class="text-md mr-1 ml-1 fa fa-calendar text-green-800"
                              ></i>
                              Schedule
                              <span class="text-[10px] font-light"
                                >(Double Click if 1 Day Only)</span
                              ><span class="text-red-600 text-sm ml-1">*</span>
                            </label>
                            <div class="w-full shadow-lg border-gray-200">
                              <!-- <input type="date" class="px-2 py-2.5 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-8 text-xs" v-model="info.date" /> -->
                              <!-- @update:model-value="setDate(dateDisplay)" -->
                              <div class="border-b-2 border-green-700">
                                <VueDatePicker
                                  v-model="datePicked"
                                  :enable-time-picker="false"
                                  name="schedule"
                                  :multi-dates="true"
                                  auto-apply
                                  :year-range="[2025, 2025]"
                                  week-start="0"
                                  :disabled-dates="disabledDates"
                                  :min-date="next3Days"
                                  @update:model-value="setDate(datePicked)"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-full mx-auto lg:bg-white lg:my-4 mb-3">
                <div class="border-y bg-white" v-if="supportingDocuments">
                  <div
                    class="w-fit flex items-center mx-auto gap-2 px-3 uppercase font-bold lg:text-sm text-xs text-center cursor-pointer py-2 text-green-800"
                  >
                    <img
                      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/Google_Drive.png"
                      class="h-5 w-5"
                    />
                    Supporting Documents
                  </div>
                </div>
                <div
                  class="w-full lg:flex lg:my-3 lg:pb-0 pb-3 gap-3"
                  :class="supportingDocuments ? '' : ''"
                >
                  <div class="w-full lg:flex gap-3">
                    <div
                      class="w-full lg:mb-4 lg:mt-0 my-3 mx-auto"
                      v-if="supportingDocuments"
                    >
                      <label
                        class="lg:text-xs text-[10px] font-bold text-gray-900 lg:block pb-1 whitespace-nowrap"
                      >
                        <i class="fa fa-link lg:mx-2 mr-2 text-green-900"></i
                        >Approved Booking Document (From GSO)
                      </label>
                      <div>
                        <input
                          type="url"
                          class="w-full px-2 border border-b-2 shadow-xl border-green-700 rounded-sm lg:h-[34px] h-8 text-xs"
                          placeholder="Google Drive Link"
                          v-model="info.approved_gso_docs_link"
                        />
                      </div>
                    </div>
                    <div
                      class="w-full lg:mb-4 mb-3 mx-auto"
                      v-if="supportingDocuments"
                    >
                      <label
                        class="lg:text-xs text-[10px] font-bold text-gray-900 lg:block pb-1"
                      >
                        <i class="fa fa-link lg:mx-2 mr-2 text-green-900"></i
                        >Approved Activities
                      </label>
                      <div>
                        <input
                          type="url"
                          class="w-full px-2 border border-b-2 shadow-xl border-green-700 rounded-sm lg:h-[34px] h-8 text-xs"
                          placeholder="Google Drive Link"
                          v-model="info.approved_activities_link"
                        />
                      </div>
                    </div>
                    <div
                      :class="
                        supportingDocuments ? 'w-full' : 'lg:w-4/12 mx-auto'
                      "
                    >
                      <label
                        class="lg:text-xs text-[10px] font-bold text-gray-900 lg:block pb-1"
                        :class="supportingDocuments ? '' : 'text-center'"
                      >
                        <i
                          class="text-md mr-2 fa fa-address-card text-green-800"
                        ></i
                        >Attendees
                      </label>
                      <div
                        class="flex bg-white shadow border-green-700"
                        :class="supportingDocuments ? 'border-b' : 'border-b-2'"
                      >
                        <div class="flex w-full gap-x-1">
                          <div class="w-full">
                            <label
                              class="flex justify-center py-2 text-center shadow-xl lg:border-x lg:border-t text-xs lg:block font-bold lg:pb-[6px] lg:pt-[6px] lg:border w-full hover:bg-green-700 border-green-700 hover:text-white text-green-800"
                              for="individual"
                            >
                              <span class="flex items-center w-fit mx-auto">
                                <input
                                  type="radio"
                                  class="w-4 h-4 mr-2"
                                  id="individual"
                                  value="Individual"
                                  v-model="info.attendees"
                                  @change="typeOfAttendees()"
                                />
                                <span class="mt-0.5">
                                  <i class="text-md mr-2 ml-3 fa fa-user"></i
                                  >Individual
                                </span>
                              </span>
                            </label>
                          </div>
                          <div class="w-full">
                            <label
                              class="flex justify-center py-2 text-center shadow-xl lg:border-x lg:border-t text-xs lg:block font-bold lg:pb-[6px] lg:pt-[6px] lg:border w-full hover:bg-green-700 border-green-700 hover:text-white text-green-800"
                              for="group"
                            >
                              <span class="flex items-center w-fit mx-auto">
                                <input
                                  type="radio"
                                  class="w-4 h-4 mr-2"
                                  id="group"
                                  value="Group"
                                  v-model="info.attendees"
                                  @change="typeOfAttendees()"
                                />
                                <span class="mt-0.5">
                                  <i class="text-md mr-2 ml-3 fa fa-users"></i
                                  >Group
                                </span>
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="listMembers" class="lg:py-5 py-3 lg:px-5">
                  <h1
                    class="text-center uppercase font-bold lg:mb-5 mb-4 text-xs border-y py-2"
                  >
                    List of Names of Other Members
                  </h1>

                  <div
                    class="flex lg:gap-x-10 gap-x-3 lg:w-fit mx-auto lg:py-0 py-3"
                  >
                    <div
                      @click="addCSVBTN"
                      class="cursor-pointer shadow-lg bg-white hover:bg-orange-500 text-orange-500 hover:text-white font-bold w-fit mx-auto text-center py-1 px-4 rounded-lg lg:text-sm text-xs border border-orange-500 mb-3"
                    >
                      <i class="fas fa-file-csv lg:mr-3 mr-1"></i> CSV Upload
                    </div>

                    <div
                      @click="addManuallyBTN"
                      class="cursor-pointer shadow-lg bg-white hover:bg-orange-500 text-orange-500 hover:text-white font-bold w-fit mx-auto text-center py-1 px-4 rounded-lg lg:text-sm text-xs border border-orange-500 mb-3"
                    >
                      <i class="fas fa-list lg:mr-3 mr-1"></i> Add Manually
                    </div>
                  </div>

                  <div v-if="bulkUploadDisplay">
                    <div
                      class="lg:w-fit w-full mx-auto lg:mt-6 mt-1 lg:mb-7 block"
                    >
                      <a
                        href="https://lsu-media-styles.sgp1.digitaloceanspaces.com/public/campus-pass/template.csv"
                        download="template.csv"
                        class="py-1 hover:bg-white border border-green-600 bg-green-600 hover:text-green-600 text-white font-bold mx-auto block px-7 rounded-tl-md rounded-tr-md whitespace-nowrap text-center"
                      >
                        <i class="fa fa-download mr-2"></i>
                        Download CSV Template</a
                      >

                      <div class="border mx-auto shadow py-3">
                        <input
                          type="file"
                          @change="uploadedFile"
                          ref="fileInput"
                          class="w-[99px] mx-auto block"
                        />
                      </div>
                    </div>

                    <div v-if="csvData">
                      <h2
                        class="text-center border uppercase font-bold w-full mx-auto mt-5 lg:text-sm text-xs lg:py-1 py-2"
                      >
                        CSV Data
                      </h2>
                      <!-- <pre>{{ JSON.stringify(csvData, null, 2) }}</pre>  -->

                      <div
                        class="lg:flex hidden font-bold w-full mx-auto lg:text-sm text-[10px]"
                      >
                        <div class="w-full border px-3">First Name</div>
                        <!-- <div class="w-full border px-3">Middle Name </div> -->

                        <div class="w-full border px-3">Last Name</div>

                        <div class="w-full border px-[18px]">Email Address</div>
                      </div>

                      <div
                        v-for="(j, i) in csvData"
                        :key="i"
                        class="lg:flex w-full mx-auto text-xs lg:border-0 border-2 lg:p-0 p-3"
                      >
                        <div class="w-full flex">
                          <i
                            class="fa fa-user mr-2 lg:hidden flex"
                            :class="
                              j[0] === '' || j[0] === null ? 'hidden' : ''
                            "
                          ></i>
                          <div
                            class="lg:w-full lg:px-3 px-0.5 lg:border"
                            :class="
                              j[0] === '' || j[0] === null ? 'hidden' : ''
                            "
                          >
                            {{ j["firstname"] }}
                          </div>

                          <div
                            class="lg:w-full lg:px-3 px-0.5 lg:border"
                            :class="j[2] === '' ? 'hidden' : ''"
                          >
                            {{ j["lastname"] }}
                          </div>
                        </div>

                        <!-- <div class="w-full px-2">  {{ j["Middle Name"]}} </div> -->

                        <div class="lg:w-6/12 w-full flex lg:border lg:px-3">
                          <i
                            class="fa fa-envelope mr-2 mt-1 lg:hidden flex"
                            :class="j[3] === '' ? 'hidden' : ''"
                          ></i>

                          <div class="" :class="j[3] === '' ? 'hidden' : ''">
                            {{ j["email"] }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      v-else
                      class="w-11/12 mx-auto text-xs text-center mt-3"
                    >
                      No CSV Data
                    </div>
                  </div>

                  <div class="gap-10" v-if="manualListDisplay">
                    <div
                      class="gap-3 w-full lg:py-2 py-1 lg:mb-0 mb-3"
                      v-for="(j, i) in info.name_list"
                      :key="i"
                    >
                      <div class="flex items-center justify-between">
                        <div
                          class="lg:text-[9px] text-[8px] lg:mr-3 mr-2 font-bold text-white bg-green-800 lg:px-[7px] px-1.5 py-1 h-5 lg:w-5 w-4 rounded-full mt-3"
                        >
                          {{ i + 1 }}
                        </div>
                        <div class="lg:flex lg:gap-3 gap-1.5 w-full">
                          <div class="w-full flex gap-x-1 lg:mb-0 mb-1">
                            <div class="w-full lg:mt-0 mt-1">
                              <label
                                class="lg:text-xs text-[10px] tracking-tighter text-gray-900 font-bold lg:flex block"
                              >
                                <i
                                  class="fa fa-user mr-1 lg:ml-1 text-green-900"
                                ></i
                                >First Name<span
                                  class="text-red-600 text-sm lg:mr-1"
                                  >*</span
                                >
                                <!-- <span class="text-[10px] font-normal whitespace-nowrap lg:flex block lg:h-auto h-0">(Lastname, Firstname Middlename Suffix)</span> -->
                              </label>
                              <div>
                                <div class="flex gap-3">
                                  <input
                                    type="text"
                                    class="w-full px-2 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 lg:text-xs text-[10px]"
                                    v-model="j.firstname"
                                    placeholder="First Name"
                                  />
                                </div>
                              </div>
                            </div>
                            <div class="w-full">
                              <label
                                class="lg:text-xs text-[10px] tracking-tighter text-gray-900 lg:block font-bold"
                              >
                                Last Name<span
                                  class="text-red-600 text-sm lg:ml-1"
                                  >*</span
                                >
                              </label>
                              <div>
                                <div class="flex gap-3">
                                  <input
                                    type="text"
                                    class="w-full px-2 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 lg:text-xs text-[10px]"
                                    v-model="j.lastname"
                                    placeholder="Last Name"
                                  />
                                </div>
                              </div>
                            </div>
                            <!-- <div class="w-full lg:mt-1 hidden">
                              <label class="lg:text-xs text-[10px] tracking-tighter text-gray-900 lg:block font-bold">
                              Middle Name</label>
                              <div>
                                <div class="flex gap-3">
                                  <input type="text" class="w-full px-2 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 lg:text-xs text-[10px]" v-model="j.middlename" placeholder="Middle Name" />
                                </div>
                              </div>
                            </div> -->
                          </div>
                          <div class="w-full">
                            <label
                              class="lg:text-xs text-[10px] text-gray-900 lg:block font-bold"
                            >
                              <i
                                class="fa fa-envelope mr-2 lg:ml-1 text-green-900"
                              ></i
                              >Email<span class="text-red-600 text-sm lg:mr-1"
                                >*</span
                              >
                            </label>
                            <div>
                              <div class="flex gap-3">
                                <input
                                  type="email"
                                  class="w-full px-2 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg rounded-sm lg:h-9 h-7 lg:text-xs text-[10px]"
                                  v-model="j.email"
                                  placeholder="Email"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          @click="removeRow(j)"
                          v-if="info.name_list.length > 1"
                          class="cursor-pointer mt-5 ml-2 shadow-lg bg-white hover:bg-red-700 text-red-700 hover:text-white font-bold w-fit lg:px-1.5 px-1 py-1.5 flex items-center rounded-lg text-lg border border-red-700"
                        >
                          <i class="fa fa-close lg:text-sm text-xs"></i>
                        </div>
                      </div>
                    </div>
                    <div class="flex gap-x-5 w-fit mx-auto">
                      <div
                        @click="addRow"
                        class="mt-5 cursor-pointer shadow-lg hover:bg-white bg-yellow-500 hover:text-yellow-500 text-white font-bold w-fit mx-auto text-center py-1 px-4 rounded-lg lg:text-sm text-xs border border-yellow-500 mb-3"
                      >
                        <i class="fa fa-plus mr-2 font-bold"></i> ADD
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              v-if="pleaseFillUpAllRequiredFields"
              class="my-10 text-white bg-red-800 font-bold text-center py-0.5 px-5 block lg:text-sm text-xs"
            >
              All fields are required information. Otherwise, type N/A if not
              applicable.
            </div>
            <div class="pb-5 lg:px-5 px-3 mb-5">
              <button
                class="px-10 lg:rounded-lg rounded-md bg-green-900 text-white font-bold lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 border-green-900 hover:text-green-900 lg:text-sm text-xs"
              >
                <i class="fa fa-paper-plane mr-2" aria-hidden="true"></i> Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-if="thankYouDisplay" class="">
      <div
        class="lg:flex gap-10 lg:rounded-4xl bg-white lg:px-14 px-3 py-1 w-fit mx-auto lg:my-10 shadow-sm rounded-xl"
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
            href="https://lsu.edu.ph/campus-pass"
            class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 mx-auto w-fit lg:block hidden"
            >Campus Pass</a
          >
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
</style>
