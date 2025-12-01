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
  import axios from 'axios';  // For making HTTP requests
  const pleaseFillUpAllRequiredFields = ref(false);
  const userStore = useUserStore();
  const endpoint = ref(userStore.mainDevServer);
  const formDisplay = ref(true);
  const thankYouDisplay = ref(false);
  const submitCounter = ref(1)
  const dateToday = moment().format('LL');
  const digitsNum = ref(0)
  const date = ref(null)
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
    schedule: "",
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
    document_attachment: [],
    tracking_id: "DRS-" + moment().year() + '-' + String(digitsNum.value).padStart(3, '0'),
  })
  const disabledDates = computed(() => {
    const today = new Date();
    return today
  })

  const setDate = (value) => {
    info.value.schedule = moment(value).format('MMMM DD, YYYY h:mm:ss A');
  }
  const submitForm = () => {
    uploadFiles()
    // postAPI()
  }
  const postAPI = async () => {
    if (submitCounter.value === 1) {
      submitCounter.value = 0;
      await $fetch(endpoint.value + "/api/drs/create/", {
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
        submitDRSFormToGmail()
      })
    }
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

  const selectedFiles = ref([]);
  const uploadedFiles = ref([]);
  const uploadStatus = ref(null);
  // const fileUrl = ref(null);

  const handleFileUpload = (event) => {
    selectedFiles.value = Array.from(event.target.files); 
    console.log(event)
    // Convert FileList to an array
    selectedFiles.value.forEach(file => {
      console.log(`File: ${file.name}, Size: ${file.size} bytes`);
    });
  };

  const uploadFiles = async () => {
    if (!selectedFiles.value.length) {
        return;
    }
    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
      formData.append('file', file); 
      // Append each file to the FormData
    });
    try {
      uploadStatus.value = "Uploading...";
      const response = await axios.post(endpoint.value + "/api/drs/upload/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      uploadStatus.value = "Upload successful!";
      console.log('Files uploaded:', response.data);
      uploadedFiles.value = response.data.map(item => ({
        name: item.name, // Access the name property
        url: item.url,  // Access the URL property
        // size: item.size,
      }));
      selectedFiles.value = []; // Clear selected files after successful upload
      info.value.document_attachment = uploadedFiles.value
      postAPI()

      console.log(info.value)

    } catch (error) {
      console.error("File upload error:", error); // Log the full error for debugging
      uploadStatus.value = "Upload failed: " + error.message; // Display error message
    }
  };

  const submitDRSFormToGmail = async () => {
    await $fetch(endpoint.value + "/api/drs/drs-notification-submit/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        originating_firstname: info.value.originating_firstname,
        originating_office: info.value.originating_office,
        originating_email: info.value.originating_email,
        document_title: info.value.document_title,
        schedule: info.value.schedule,
        tracking_id: info.value.tracking_id
      },
    }).then((response) => {
      console.log(response)
    })
  }
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <div class="shadow-lg pt-[70px]">
          <div class="w-11/12 mx-auto flex justify-between">
            <ul class="flex lasalle-green-text capitalize text-xs pt-2.5 pb-2.5">
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/drs" class="mr-1"> Document Review Sheet </a>
              </li>
            </ul>
            <ul class="flex hover:text-green-800 text-white">
              <li class="px-3 h-full flex items-center capitalize text-xs">
                <a href="/drs/login" class="flex items-center">
                  <!-- <span class="">Admin Login</span> -->
                </a>
              </li>
              <li class="hover:bg-green-800 bg-white hover:text-white 
                text-green-800 px-3 h-full flex items-center capitalize text-xs">
                <a href="/drs/login" class="flex items-center">
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
                                <input type="radio" value="Manual" v-model="info.document_type" class="mr-1" id="Manual" />
                                <label class="ml-2" for="Manual">
                                  <span class=" font-bold mr-1">Manual</span>
                                </label>
                              </div>
                              <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                                <input type="radio" value="Procedure" v-model="info.document_type" class="mr-1" id="Procedure" />
                                <label class="ml-2" for="Procedure">
                                  <span class=" font-bold mr-1">Procedure</span>
                                </label>
                              </div>
                              <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5    text-black text-xs items-center flex ">
                                <input type="radio" value="Policy" v-model="info.document_type" class="mr-1" id="Policy" />
                                <label class="ml-2" for="Policy">
                                  <span class=" font-bold mr-1">Policy</span>
                                </label>
                              </div>
                              <div class="lg:shadow-lg lg:mt-0 mt-2 px-2 lg:pt-[8px] lg:pb-[9px] pb-2.5   text-black text-xs items-center flex ">
                                <input type="radio" value="Form or Template" v-model="info.document_type" class="mr-1" id="FormTemplate" />
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
                                <label class="ml-2 flex item w-full text-black text-xs items-center" for="ForRevision">
                                  <span class="mr-2">
                                    <input type="radio" value="For Revision" v-model="info.status" @change="changeStatus()" class="" id="ForRevision" />
                                  </span>
                                  <span class="font-bold mr-1">For Revision</span>
                                  <span class="font-bold mr-2">No. </span>
                                  <input :class="forRevisionInput ? '': 'hidden'" type="text" 
                                  class="px-2 w-full border-b-2 border-t-0 border-x-0 border-green-700 shadow-lg py-1 rounded-sm text-xs" 
                                  placeholder="Revision Number" v-model="info.revision_number" ref="fileInput" />
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
                              <VueDatePicker 
                                v-model="date" :enable-time-picker="false" name="date" auto-apply :year-range="[2025, 2025]" week-start="0" :min-date="disabledDates" 
                                 @update:model-value="setDate(date)"
                                />
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
                          <div class="lg:w-full w-[250px] my-2">
                            <!-- multiple -->
                           

                            <label for="file-upload" class="
                            
                            bg-green-600 text-white px-5 py-1 font-bold
                            cursor-pointer rounded-md hover:bg-white hover:text-green-600 border-green-600 border
                            ">
                              <i class="fa fa-upload mr-2" aria-hidden="true"></i>  Upload Document
    </label>
<input id="file-upload" type="file" @change="handleFileUpload" class="border shadow-lg" />



                            <!-- accept="image/*"   -->
                            <!-- <button @click="uploadFiles" :disabled="!selectedFiles.length">Upload</button> -->
                            <div v-if="uploadStatus">{{ uploadStatus }}</div>
                            <div v-for="file in uploadedFiles" :key="file.url">
                              <img v-if="file.url.includes('jpg') || 
                              file.url.includes('png')" 
                                :src="file.url" alt="Uploaded File" class="w-80" />
                                <!-- <embed v-if="file.url.includes('pdf')" :src="file.url" width="800px" height="2100px" />
                                <iframe v-if="file.url.includes('.docx')" :src="file.url"></iframe> -->
                              <a :href="file.url" target="_blank" rel="noopener noreferrer">{{ file.name }}</a>
                           
                            </div>


                            <div v-for="file in selectedFiles" :key="file.url" class="my-4 shadow-lg px-2 py-3 border-2">
                             
                             
                              <a :href="file.url" target="_blank" rel="noopener noreferrer" class="tracking-tighter">{{ file.name }}</a>
                              <!-- <span class="ml-3 font-bold"> 
                                
                                {{ (file.size/1024).toFixed(2) }} KB size
                              
                              
                              </span> -->

                              <span class="ml-3 font-bold"> 
                                
                                {{ (file.size/1024/1024).toFixed(2) }} MB size
                              
                              
                              </span>
                                
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="w-fit mx-auto my-10">
                      <div class="text-center flex">
                        <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-xs" 
                          placeholder="First Name" 
                          v-model="info.originating_firstname" required />
                        <!-- <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-xs" placeholder="First Name" 
                          v-model="info.originating_middlename" required /> -->
                        <input type="text" class="px-2 w-full 
                        rounded-sm lg:h-9 h-8 text-xs" 
                          placeholder="Last Name" 
                          v-model="info.originating_lastname" required />
                      </div>
                      <div class="border-t-2 border-black text-center">Originator’s Printed Name</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="pleaseFillUpAllRequiredFields" 
              class="my-10 text-white bg-red-800 font-bold text-center py-0.5 px-5 block lg:text-sm text-xs"> 
                All fields are required information. Otherwise, type N/A if not applicable. </div>
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
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg" 
          class="lg:w-44 w-20 mx-auto lg:mt-0 mt-14" />
        </div>
        <div class="text-xl text-green-900 text-center w-fit mx-auto lg:py-20 py-5">
          <h1 class="font-bold text-3xl">Thanks for submitting! </h1>
          <p class="font-light pt-3 pb-10"> Your request has been sent! </p>
          <p class="font-light text-xs italic mb-10">Please check your email.</p>
          <a href="https://lsu.edu.ph/drs" 
            class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 
            mx-auto w-fit lg:block hidden text-sm uppercase ">
              <i class="fa fa-arrow-circle-left mr-4"></i> Document Review Sheet</a>
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

  input[type="file"] {
  display: none;
}

</style>