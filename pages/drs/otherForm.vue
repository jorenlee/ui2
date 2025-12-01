<script setup>
  import {
    useUserStore
  } from "@/stores/user";
  import _ from "lodash";
  import VueDatePicker from "@vuepic/vue-datepicker";
  import "./css/main.css";
  import moment from "moment";
  import {
    ref,
    computed
  } from 'vue';
  const pleaseFillUpAllRequiredFields = ref(false);
  const userStore = useUserStore();
  const endpoint = ref(userStore.mainDevServer);
  const formDisplay = ref(true);
  const thankYouDisplay = ref(false);
  const submitCounter = ref(1)
  const dateToday = moment().format('LL');
  const digitsNum = ref(0)
  const info = ref({
    originating_firstname: "",
    originating_middlename: "-",
    originating_lastname: "",
    originating_office: "",
    originating_email: "",
    document_title: "",
    status: "",
    revision_number: "",
    document_type: "",
    schedule: moment().format('MMMM Do YYYY, h:mm:ss a'),
    purpose: "",
    reviewed_by_name: "Dr. Wenny Caseros",
    reviewed_by_designation: "University Chancellor",
    reviewed_by_date_checked: dateToday,
    reviewed_by_action: "",
    reviewed_by_remarks: "",
    approved_by_name: "Br. Rey E. Mejias FSC",
    approved_by_designation: "University President",
    approved_by_date_checked: dateToday,
    approved_by_action: "",
    approved_by_remarks: "",
    other_comments_remarks: "",
    document_code: "EOM-FM-01, Rev. 001",
    effectivity_date: "",
    rmo_name: "",
    document_attachment: "",
    tracking_id: "DRS-" + moment().year() + '-' + String(digitsNum.value).padStart(3, '0'),
  })
  const disabledDates = computed(() => {
    const today = new Date();
    return today
  })
  const submitForm = () => {
    // postAPI()
  }
  const postAPI = async () => {
    info.value.remarks = 'N/A'
    if (info.value.date === "") {
      console.log('Please Input Date!')
    }
    if (info.value.approved_activities_link === "") {
      info.value.approved_activities_link = '-'
    }
    if (info.value.approved_gso_docs_link === "") {
      info.value.approved_gso_docs_link = '-'
    }
    if (info.value.incharge_middlename === "") {
      info.value.incharge_middlename = 'N/A'
    } else if (submitCounter.value === 1) {
      submitCounter.value = 0;
      await $fetch(endpoint.value + "/api/campus-pass/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: info.value,
      }).then((response) => {
        formDisplay.value = false;
        thankYouDisplay.value = true;
        submitCounter.value = 0;
        console.log(response);
        submitAppointmentToGmail()
      })
    }
  }
  const submitAppointmentToGmail = async () => {
    await $fetch(endpoint.value + "/api/campus-pass/to-gmail-pending/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        incharge_firstname: info.value.incharge_firstname,
        incharge_contact_email: info.value.incharge_contact_email,
        schedule: info.value.schedule,
        approval_status: info.value.approval_status,
        remarks: info.value.remarks,
        tracking_id: info.value.tracking_id
      },
    }).then((response) => {
      console.log(response)
    })
  }
  const forRevisionInput = ref(false)
  const changeStatus = () => {
    if (info.value.status === 'For Revision') {
      forRevisionInput.value = true;
      // console.log(info.value.status)
    } else {
      forRevisionInput.value = false;
      // console.log(info.value.status)
    }
  }
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <div class="shadow-lg pt-16">
          <div class="w-11/12 mx-auto flex justify-between">
            <ul class="flex lasalle-green-text capitalize text-xs pt-2.5 pb-2.5">
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/campus-pass" class="mr-1"> Document Review Sheet </a>
              </li>
            </ul>
            <ul class="flex hover:text-green-800 text-white">
              <li class="px-3 h-full flex items-center capitalize text-xs ">
                <a href="/campus-pass/login" class="flex items-center">
                  <!-- <span class="">Admin Login</span> -->
                </a>
              </li>
              <li class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-3 h-full flex items-center capitalize text-xs ">
                <a href="/campus-pass/login" class="flex items-center">
                  <i class="fa fa-user " aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-if="formDisplay">
      <form v-on:submit.prevent="submitForm">
        <div class="border-t-2 border-green-700 shadow-lg lg:my-5 my-3 w-11/12 mx-auto ">
          <div class="">
            <h2 class="lg:text-base text-xs px-10 uppercase py-2 font-bold bg-green-900 text-white text-center"> Document Review Sheet Form <span class="font-light text-xs bg-green-900 text-white block">
                {{ info.document_code }}</span>
            </h2>
            <div class="w-fit mx-auto text-xs mt-4 px-4 font-montserrat tracking-tight"> DRS No. <span class="border-b px-1">{{ info.tracking_id }}</span>
            </div>
            <div class="lg:p-5 px-2 pt-3 pb-2 gap-3">
              <div class="w-full lg:mb-0 mb-5">
                <div class="w-full gap-3">
                  <div class="gap-3 w-full">
                    <div class="gap-3 lg:mb-2 lg:w-10/12 w-full mx-auto border shadow py-5 px-5">
                      <div class="lg:gap-x-2 gap-x-1 w-full">
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Originating Office <span class="text-red-600 font-normal text-sm">*</span>
                            </div>
                          </label>
                          <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Originating Office" v-model="info.originating_office" required />
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Email <span class="text-red-600 font-normal text-sm">*</span>
                            </div>
                          </label>
                          <div class="w-full">
                            <input type="email" class="px-2 w-6/12 border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Email" v-model="info.originating_email" required />
                          </div>
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Document Title <span class="text-red-600 font-normal text-sm">*</span>
                            </div>
                          </label>
                          <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Document Title" v-model="info.document_title" required />
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Document Type <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                            </div>
                          </label>
                          <div class="w-full">
                            <div class="lg:flex gap-x-3 w-fit px-3 lg:px-0 lg:shadow lg:pt-[2px] pt-3 bg-white border-green-700 border-b-2">
                              <div class="lg:shadow-lg px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                                <input type="radio" value="Manual" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="Manual" />
                                <label class="ml-2" for="Manual">
                                  <span class=" font-bold mr-1">Manual</span>
                                </label>
                              </div>
                              <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                                <input type="radio" value="Procedure" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="Procedure" />
                                <label class="ml-2" for="Procedure">
                                  <span class=" font-bold mr-1">Procedure</span>
                                </label>
                              </div>
                              <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                                <input type="radio" value="Policy" v-model="info.type_of_access" class="mr-1" id="Policy" @change="needSupportingDocs()" />
                                <label class="ml-2" for="Policy">
                                  <span class=" font-bold mr-1">Policy</span>
                                </label>
                              </div>
                              <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5   text-black text-xs items-center flex ">
                                <input type="radio" value="Form or Template" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="FormTemplate" />
                                <label class="ml-2" for="FormTemplate">
                                  <span class=" font-bold mr-1">Form or Template</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Status <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                            </div>
                          </label>
                          <div class="w-full">
                            <div class="lg:flex gap-x-3 w-fit px-3 lg:px-0 lg:shadow lg:pt-[2px] pt-3 bg-white border-green-700 border-b-2">
                              <div class="lg:shadow-lg px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                                <input type="radio" value="New" v-model="info.status" @change="changeStatus()" class="mr-1" id="New" ref="fileInput" />
                                <label class="ml-2" for="New">
                                  <span class=" font-bold mr-1">New</span>
                                </label>
                              </div>
                              <div class="flex items-center text-xs whitespace-nowrap lg:shadow-lg lg:mt-0 mt-2 px-2">
                                <label class="ml-2 flex item w-full
                              
                              text-black text-xs items-center 
                              " for="ForRevision">
                                  <span class="mr-2">
                                    <input type="radio" value="For Revision" v-model="info.status" @change="changeStatus()" class="" id="ForRevision" />
                                  </span>
                                  <span class=" font-bold mr-1">For Revision</span>
                                  <span class=" font-bold mr-2">No. </span>
                                  <input :class="forRevisionInput ? '': 'hidden'" type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-1
                                rounded-sm text-xs" placeholder="Revision Number" v-model="info.revision_number" ref="fileInput" />
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Date <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                            </div>
                          </label>
                          <div class="w-full">
                            <div class="border-b-2 border-green-700 w-fit shadow-lg">
                              <VueDatePicker v-model="info.schedule" :enable-time-picker="false" name="date" auto-apply :year-range="[2025, 2025]" week-start="0" :min-date="disabledDates" />
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Purpose <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                            </div>
                          </label>
                          <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Purpose" v-model="info.purpose" required />
                        </div>
                        <div class="flex items-center w-full mb-2">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold whitespace-nowrap w-4/12">
                            <div class="w-fit ml-auto pr-5"> Reference Document <span class="text-red-600 font-normal text-sm">*</span>
                            </div>
                          </label>
                          <!-- <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Please attached draft documented for reference" v-model="info.document_title" required /> -->
                          <input type="file" @change="uploadedFile" ref="fileInput" class="lg:w-full w-[250px]" />
                        </div>
                      </div>
                    </div>
                    <div class="w-fit mx-auto my-10">
                      <div class="text-center flex">
                        <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-xs" placeholder="First Name" v-model="info.originating_firstname" required />
                        <!-- <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-xs" placeholder="First Name" v-model="info.originating_middlename" required /> -->
                        <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-xs" placeholder="Last Name" v-model="info.originating_lastname" required />
                      </div>
                      <div class="border-t-2 border-black text-center">Originator’s Printed Name</div>
                    </div>


                    <!-- <div class="gap-3 lg:mb-2 w-full mx-auto border shadow py-5 px-5">
                      <div class="flex lg:gap-x-2 gap-x-1 w-full">
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Reviewed By <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <div class="w-fit mx-auto ">
                            <div class="text-center flex">
                              <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-sm text-center" placeholder="" v-model="info.reviewed_by_name" />
                            </div>
                            <div class="border-t-2 border-black text-center text-xs">{{ info.reviewed_by_designation }}</div>
                          </div>
                        </div>
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Action <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <div class="lg:flex gap-x-3 w-full px-3 lg:px-0 mx-auto lg:shadow lg:pt-[2px] pt-3 bg-white border-green-700 border-b-2">
                            <div class="lg:shadow-lg px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                              <input type="radio" value="Approved" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="Approved" />
                              <label class="ml-2" for="Approved">
                                <span class=" font-bold mr-1">Approved</span>
                              </label>
                            </div>
                            <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                              <input type="radio" value="Disapproved" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="Disapproved" />
                              <label class="ml-2" for="Disapproved">
                                <span class=" font-bold mr-1">Disapproved</span>
                              </label>
                            </div>
                            <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                              <input type="radio" value="Conditional" v-model="info.type_of_access" class="mr-1" id="Conditional" @change="needSupportingDocs()" />
                              <label class="ml-2" for="Conditional">
                                <span class=" font-bold mr-1">Conditional</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Comments or Remarks <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <textarea type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-1
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Comments or Remarks" v-model="info.reviewed_by_remarks" required></textarea>
                        </div>
                      </div>
                      <div class="flex lg:gap-x-2 gap-x-1 w-full">
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Approved By <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <div class="w-fit mx-auto ">
                            <div class="text-center flex">
                              <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-sm text-center" placeholder="" v-model="info.approved_by_name" />
                            </div>
                            <div class="border-t-2 border-black text-center text-xs">{{ info.approved_by_designation }}</div>
                          </div>
                        </div>
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Action <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <div class="lg:flex gap-x-3 w-full px-3 lg:px-0 mx-auto lg:shadow lg:pt-[2px] pt-3 bg-white border-green-700 border-b-2">
                            <div class="lg:shadow-lg px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                              <input type="radio" value="Approved" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="Approved" />
                              <label class="ml-2" for="Approved">
                                <span class=" font-bold mr-1">Approved</span>
                              </label>
                            </div>
                            <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                              <input type="radio" value="Disapproved" v-model="info.type_of_access" @change="needSupportingDocs()" class="mr-1" id="Disapproved" />
                              <label class="ml-2" for="Disapproved">
                                <span class=" font-bold mr-1">Disapproved</span>
                              </label>
                            </div>
                            <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                              <input type="radio" value="Conditional" v-model="info.type_of_access" class="mr-1" id="Conditional" @change="needSupportingDocs()" />
                              <label class="ml-2" for="Conditional">
                                <span class=" font-bold mr-1">Conditional</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Comments or Remarks <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <textarea type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-1
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Comments or Remarks" v-model="info.approved_by_remarks" required></textarea>
                        </div>
                      </div>
                      <div class="flex lg:gap-x-2 gap-x-1 w-full">
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Other Comment and Remarks <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Other Comment and Remarks" v-model="info.other_comments_remarks" required />
                        </div>
                      </div>
                    </div>
                    <div class="lg:flex gap-3 lg:mb-2 w-full mx-auto">
                      <div class="flex lg:gap-x-2 gap-x-1 w-full">
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Document Code <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="Document Code" v-model="info.document_code" required />
                        </div>
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Effectivity Date <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <div class="border-b-2 border-green-700 shadow-lg">
                            <VueDatePicker v-model="info.approved_by_action" :enable-time-picker="false" name="date" auto-apply :year-range="[2025, 2025]" week-start="0" :min-date="disabledDates" />
                          </div>
                        </div>
                        <div class="w-full mb-2 block">
                          <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> RMO <span class="text-red-600 font-normal text-sm lg:ml-1">*</span>
                          </label>
                          <input type="text" class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg 
                            rounded-sm lg:h-9 h-8 text-xs" placeholder="RMO" v-model="info.approved_by_remarks" required />
                        </div>
                      </div>
                    </div> -->


                    
                  </div>
                </div>
              </div>
            </div>
            <div v-if="pleaseFillUpAllRequiredFields" class="my-10 text-white bg-red-800 font-bold text-center py-0.5 px-5 block lg:text-sm text-xs"> All fields are required information. Otherwise, type N/A if not applicable. </div>
            <div class="pb-5 lg:px-5 px-3 mb-5">
              <button class="px-10 lg:rounded-lg rounded-md bg-green-900 text-white font-bold 
              lg:py-2 py-1.5 lg:w-fit w-full mx-auto block uppercase hover:bg-white border-2 
              border-green-900 hover:text-green-900 lg:text-sm text-xs">
                <i class="fa fa-paper-plane mr-2" aria-hidden="true"></i> Submit </button>
            </div>
          </div>
        </div>
      </form>
    </div>
    <div v-if="thankYouDisplay" class="">
      <div class="lg:flex gap-10 lg:rounded-4xl bg-white lg:px-14 px-3 py-1 w-fit mx-auto lg:my-10 shadow-sm rounded-xl">
        <div class="flex items-center">
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg" class="lg:w-44 w-20 mx-auto lg:mt-0 mt-14" />
        </div>
        <div class="text-xl text-green-900 text-center w-fit mx-auto lg:py-20 py-5">
          <h1 class="font-bold text-3xl">Thanks for submitting! </h1>
          <p class="font-light pt-3 pb-10"> Your request has been sent! </p>
          <p class="font-light text-xs italic mb-10">Please check your email.</p>
          <a href="https://lsu.edu.ph/campus-pass" class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 
          mx-auto w-fit lg:block hidden">Campus Pass</a>
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