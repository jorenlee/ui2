<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
const route = useRoute();
const router = useRouter();
const oldSearchBtn = ref('');
const searchBtn = ref('');
const steps = ref();
let receipt = ref('');
const id = ref(null);
const spinner = ref(false);
const requiredField = ref(false);
const pleaseAddCorrectTrackingIDNumber = ref(false);
const trackingList = ref(false)
const paymentMethodImage = ref(false);


const sorryNoResultsFoundOldTrack = ref(false);
const sorryNoResultsFound = ref(false);
// TID1718013151208
const imagePath = ref('https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/admissions/files/');
const banner_imageData = ref("");
let imagePreview = ref('');

let enrolleesData = ref();
let isSubmittedReceipt = ref(false);
let isEvaluationFormSubmitted = ref(false);

let enrolleesDataOneFetch = ref();


const trackBtn = async () => {
  trackingList.value = false;
  sorryNoResultsFoundOldTrack.value = false;
  sorryNoResultsFound.value = false;
  if(searchBtn.value.length === 16) {
    spinner.value = true;
      enrolleesData.value = await $fetch(endpoint.value + "/api/admissions/list/", {
      method: "GET",
    }).then((response) => {
      // console.log("response", response);
      // console.log(response.length)
      response.filter(function (params) {
        if (searchBtn.value === params.tracking_id) {
          steps.value = params.enrollment_tracking_status
          isSubmittedReceipt.value = params.receipt.submitted
          isEvaluationFormSubmitted.value = params.evaluation.submitted
          id.value = params.id
          sorryNoResultsFoundOldTrack.value = false;
          sorryNoResultsFound.value = false;
          trackingList.value = true;
          enrolleesDataOneFetch.value = params
          // console.log(enrolleesData.value)
        }
        else  {
          sorryNoResultsFound.value = true;
          setTimeout(() => {
            sorryNoResultsFound.value = false;
          }, 3000)
          spinner.value = false;
        }       
      })
    }).catch((err) => {
      err.data
      // console.log(err.data)
      spinner.value = false;
      trackingList.value = false;
    })
  } 
  else if (searchBtn.value.length < 15 || searchBtn.value.length > 0){
    // when the loading starts disable button search
    pleaseAddCorrectTrackingIDNumber.value = true;
    setTimeout(() => {
      pleaseAddCorrectTrackingIDNumber.value = false;
      spinner.value = false;
    }, 3000)
  }  
}


const toSubmitReceipt = ref(true)
const doneSubmitReceipt = ref(false)

const uploadedFile = (e) => {
  banner_imageData.value = e.target.files[0];
  imagePreview.value = URL.createObjectURL(banner_imageData.value);
  receipt.value = imagePath.value + '' + e.target.files[0].name
}

// https://stackoverflow.com/questions/73162311/input-accept-image-capture-camera-allows-any-file-type-on-mobile
// https://stackoverflow.com/questions/23916566/html5-input-type-file-accept-image-capture-camera-display-as-image-rat

const saveFile = async () => {
  let formData = new FormData();
  formData.append("image", banner_imageData.value);
  let axiosConfig = {
    headers: { "Content-Type": "multipart/form-data" },
  };
  axios
    .post("https://api.lsu.edu.ph/api/admissions/file/list/files/", formData, axiosConfig)
    .then((response) => {
      // console.log(response);
    });
}

const submitForm = async () => {
  if (banner_imageData.value !== null) {
    saveFile();
    submitFunc()
    toSubmitReceipt.value = false;
    doneSubmitReceipt.value = true;
  }
}


const submitFunc = async () => {
  enrolleesDataOneFetch.value.receipt.image_url = receipt.value;
  enrolleesDataOneFetch.value.receipt.submitted = true;
  enrolleesDataOneFetch.value.enrollment_tracking_status[2] = {
    track_name: 'accounting',
    label: 'payment',
    details: 'payment',
    date_checked: '-',
    check_by: '-',
    status: 'ongoing',
    remarks: 'ongoing'
  }
  // console.log("submitForm");
  await $fetch(endpoint.value + "/api/admissions/" + id.value + "/edit/", {
    method: "PUT",
    body: enrolleesDataOneFetch.value,
  }).then((response) => {
    // console.log("response", response);
    setTimeout(() => {
      doneSubmitReceipt.value = false;
    }, 7000)
  })
}

const goToEvaluation = (id) => {
  router.push("/enrollment/evaluation/" + id);
}

const goToAlternativeEvaluation = () => {
  router.push("/enrollment/evaluation/");
}

</script>

<template>
<div>
  <Header />
  <div class="relative">
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block" />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Enrollment Tracking
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/enrollment" class="mr-1"> Enrollment </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/enrollment/tracking" class="mr-1">Tracking </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="lg:flex gap-10">
      <div class="lg:w-9/12 lg:overflow-hidden lg:min-h-screen pb-80 px-5 lg:order-2 order-1">
        <p class="text-center mt-10 text-green-900 text-sm lg:px-4 mx-auto">
        
        
      <span class="text-gray-600">If you need any further assistance or have any more questions, feel free to email at 
        <span class="font-bold">dev@lsu.edu.ph</span>. Thank you!</span>
        
      
      </p>
      <p class="lg:text-base text-xs text-red-800 text-center px-10">
        (Ongoing updates, you can track your progress at 4:00 PM)
      </p>


        <div class="lg:flex">
        

          <!-- <div class="flex lg:w-5/12 w-fit shadow mx-auto mt-10 text-center rounded-lg">
            <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 rounded-tl-lg rounded-bl-lg"
            placeholder="Tracking ID" maxlength="16" v-model="searchBtn" required/>

          <button @click="trackBtn()"
            class=" px-5 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 border-4 border-green-900 whitespace-nowrap rounded-tr-lg rounded-br-lg">
            <i class="fa fa-search"></i>
            Track
          
          </button>

          </div> -->
          <div class="flex lg:w-5/12 w-fit shadow mx-auto mt-10 text-center rounded-lg">
            <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-gray-700 rounded-tl-lg rounded-bl-lg"
            placeholder="Tracking ID" maxlength="16" v-model="searchBtn" required/>

          <button
            class=" px-5 bg-gray-400 text-white cursor-not-allowed border-4 border-gray-900 whitespace-nowrap rounded-tr-lg rounded-br-lg">
            <i class="fa fa-search"></i>
            Track
          
          </button>

          </div>
        </div>
        <!-- <div v-if="requiredField" class="font-bold text-center w-11/12 mx-auto my-10">
          Please add your tracking ID
        </div> -->
        <div v-if="pleaseAddCorrectTrackingIDNumber" class="font-bold text-center w-11/12 mx-auto my-10">
          Please Add Correct Tracking ID
        </div>



        
        <div class="mx-auto w-fit my-20" v-if="spinner">
          <p class="text-base text-green-900 font-bold mb-4">Please wait ... </p>
          <i class="fa fa-spinner fa-spin text-8xl text-green-800 animate-spin"></i>
        </div>
        <div class="lg:flex lg:w-10/12 w-full mx-auto pt-10 lg:h-screen mb-5" 
          v-if="trackingList">
          <div class="w-full relative lg:h-auto h-[120px]" v-for="(j, i) in steps" :key="i">
            <div class="flex lg:items-center w-full lg:ml-20">
              <p class="text-white lg:px-3 px-4 py-2 lg:mx-0 ml-10 h-fit w-fit lg:rounded-lg rounded-lg mt-1 lg:mt-0 font-bold"
                :class="
                  [j.status === 'yes' ? 'text-white bg-green-900' : ''],
                  [j.status === 'no' ? 'text-white bg-red-700' : ''],
                  [j.status === '' ? 'text-white bg-gray-300' : ''],
                  [j.status === 'ongoing' ? 'text-white bg-blue-800' : '']
                  ">
                  
                  {{ i + 1 }}
                
                </p>
              <div class="lg:rotate-0 rotate-90 lg:h-[10px] h-[10px] 
              lg:my-auto lg:mx-auto lg:mt-[16px] mt-[79px] lg:ml-0 -ml-[60px] w-[100px]"
                :class="
                  // yes done
                  // ongoing ongoing
                  // no pending 
                  [j.status === 'yes' ? 'bg-green-900' : ''],
                  [j.status === 'no' ? 'bg-red-700' : ''],
                  [j.status === '' ? 'bg-gray-300' : ''],
                  [j.status === 'ongoing' ? 'bg-blue-800' : ''],
                  [i === 3 ? 'hidden h-0 w-0' : 'lg:w-full w-[80px]']
          
                  ">
              </div>
            </div>
            <div class="lg:absolute top-8 lg:left-20 right-0 bottom-0" 
            >
                <p class="uppercase font-bold lg:mt-4" 
                :class="
                  
                  [j.status === 'yes' ? 'text-green-900' : ''],
                  [j.status === 'no' ? 'text-red-700' : ''],
                  [j.status === '' ? 'text-gray-300' : ''],
                  [j.status === 'ongoing' ? 'text-blue-800' : ''],






                  [i === 0 ? 'lg:ml-0 lg:static absolute left-28 top-0' : ''],
                  [i === 1 ? 'lg:ml-0 lg:static absolute left-28 top-0' : ''],
                  [i === 2 ? 'lg:ml-0 lg:static absolute left-28 top-0' : ''],
                  [i === 3 ? 'lg:ml-0 lg:static absolute left-28 top-0' : '']
                  ">
                  {{ j.track_name }}
                </p>
                <span class="text-xs capitalize block" 
                :class="
                  [j.status === 'yes' ? 'text-green-900' : ''],
                  [j.status === 'no' ? 'text-red-700' : ''],
                  [j.status === '' ? 'text-gray-300' : ''],
                  [j.status === 'ongoing' ? 'text-blue-800' : ''],

                  [i === 0 ? 'lg:ml-0 lg:static absolute left-28 top-6' : ''],
                  [i === 1 ? 'lg:ml-0 lg:static absolute left-28 top-6' : ''],
                  [i === 2 ? 'lg:ml-0 lg:static absolute left-28 top-6' : ''],
                  [i === 3 ? 'lg:ml-0 lg:static absolute left-28 top-6' : '']


                
                  ">
                  {{ j.details }}</span>


                <div class="text-xs capitalize block  w-[130px] left-28 leading-tight" 
                  :class="
                    
                  [j.status === 'yes' ? 'text-green-900' : ''],
                  [j.status === 'no' ? 'text-red-700' : ''],
                  [j.status === '' ? 'text-gray-300' : ''],
                  [j.status === 'ongoing' ? 'text-blue-800' : ''],

                  [i === 0 ? 'lg:ml-0 lg:static absolute left-28 top-10' : ''],
                  [i === 1 ? 'lg:ml-0 lg:static absolute left-28 top-10' : ''],
                  [i === 2 ? 'lg:ml-0 lg:static absolute left-28 top-10' : ''],
                  [i === 3 ? 'lg:ml-0 lg:static absolute left-28 top-10' : ''],
                  [j.remarks === '' ? 'hidden' : '']
                    
                    ">
                  Remarks:
                  <div class="font-bold underline  lg:w-[200px] w-[200px]"
                  :class="
                  [i === 2 ? 'w-[230px]' : '']
                  [i === 3 ? 'lg:ml-0 -ml-16 lg:mt-0 mt-7 lg:w-[230px]' : '']
                  ">{{ j.remarks }}</div>
                </div>

                <!-- {{ j }} -->

                <!-- <div :class="[j.status === 'yes' ? 'text-green-900' : 'text-gray-300']" @click="goToEvaluation(id)"
                  v-if="j.status === 'ongoing' && j.track_name === 'verification'" class="text-center   lg:mt-5 mt-[150px] font-bold cursor-pointer bg-green-800 text-white hover:bg-white hover:text-green-900 block 
                border-2 border-green-800 
                leading-[15px] lg:text-sm text-xs px-3 py-2 rounded-lg ">Fill out
                  Evaluation
                  Form</div> -->

                <div :class="isEvaluationFormSubmitted ? 'hidden':''">
                  <div :class="[j.status === 'yes' ? 'text-green-900' : 'text-gray-300']" @click="goToAlternativeEvaluation(id)"
                  v-if="j.status === 'ongoing' && j.track_name === 'verification'" 
                  class="text-center lg:mt-5 mt-[100px] w-fit lg:mx-0 mx-auto font-bold cursor-pointer bg-green-800 text-white hover:bg-white hover:text-green-900 block 
                border-2 border-green-800 
                leading-[15px] lg:text-sm text-xs px-3 py-2 rounded-lg ">
                  Evaluation
                  Form</div>
                </div>

                <div v-if="j.status === 'yes' && j.track_name === 'verification'"
                  class="font-bold text-lg text-green-900 uppercase ml-0 lg:mt-0 mt-20 lg:text-left text-center lg:px-0 px-3">
                  <img
                    src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
                    class="lg:w-20 w-[70px] lg:mx-12 mx-auto lg:mt-6 mt-14 mb-2" />
                  Congratulations!
                </div>
              </div>

              <div :class="isSubmittedReceipt ? 'hidden': ''">
                <div v-if="toSubmitReceipt" class="lg:mb-10">
                <div v-if="j.status === 'yes' && j.track_name === 'advising'"
                  class="absolute lg:left-[50%] lg:top-[130px] top-[370px] w-full lg:shadow mt-5 py-5 px-5">
                  <p class="text-sm pb-2 text-center">Please Submit Proof of Payment:</p>
                  <img v-if="imagePreview === ''"
                    src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/admissions/sample.jpg"
                    class="w-[100px] h-[100px] mx-auto" />
                  <img v-else :src="imagePreview" class="w-[100px] h-[100px] mx-auto" />
                  <input type="file" @change="uploadedFile" accept="capture=camera, image/*, image/png, image/jpeg" capture class="my-5 w-full border" />
                  <div @click="submitForm"
                    class="py-1 px-10 border-2 border-green-900 w-fit mx-auto rounded-md my-2 hover:bg-green-900 hover:text-white cursor-pointer">
                    Submit</div>
                </div>
              </div>

              <div v-if="doneSubmitReceipt">
                <div class="absolute lg:left-[50%] lg:top-[100px] top-[340px] w-full lg:shadow lg:mt-10 py-5 px-3"
                  v-if="j.status === 'yes' && j.track_name === 'advising'">
                  <img
                    src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
                    class="w-[100px] mx-auto lg:mt-0 mt-14" />
                  <p class="text-center mt-5 leading-tight lg:text-sm text-xs">Please check later while the accounting officer verify your
                    receipt, Thank
                    you!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
              <div v-if="sorryNoResultsFound" class="font-bold text-center w-11/12 mx-auto my-10">
                Sorry, No results Found!
              </div>

        </div>
        
        <!-- <div v-if="!spinner && enrolleesData.length === 0">
          Sorry, No Results Found!
        </div> -->




      </div>
      <div class="lg:w-3/12 shadow-lg lg:order-1 order-2 pb-5 lg:border-t-0 border-t-2">
        <div class="w-11/12 mx-auto text-center my-5">
          <p class="font-bold text-green-900 text-3xl mb-10 mt-10">Enrollment Steps</p>
          <ul class="w-full justify-between">
            <li class="w-full mb-5 border">
              <span class="justify-evenly flex  bg-green-800 text-white py-1 font-bold">
                <span class="w-full">Step One:</span>
                <span class="w-full uppercase">Admissions</span>
              </span>
              <span class=" block relative text-center">
                <a href="https://lsu.edu.ph/admissions/form" class=" font-bold w-full flex 
                justify-center py-4 cursor-pointer bg-white text-green-800 hover:text-white hover:bg-green-800">
                  ONLINE : Admissions Online Form
              </a>
                <!-- <a href="https://lsu.edu.ph/admissions/form" class="block absolute">lsu.edu.ph/admissions/form/</a> -->
              </span>
            </li>
            <li class="w-full mb-5 border  text-white">
              <span class="justify-between flex  bg-green-800 py-1 font-bold">
                <span class="w-full">Step Two:</span>
                <span class="w-full uppercase">Advising</span>
              </span>
              <span class="bg-white text-green-800 font-bold w-full flex justify-center py-4">
                ONSITE : Visit College Offices | Campus
              </span>
            </li>
            <li class="w-full mb-5 border  text-white">
              <span class="justify-between flex  bg-green-800 py-1 font-bold">
                <span class="w-full">Step Three:</span>
                <span class="w-full uppercase">Payment</span>
              </span>
              <span class="bg-white border-b text-green-800 font-bold w-full flex justify-center py-4">
                ONSITE Accounting Office or <br> Via Online Payment Methods
              </span>
              <div @click="paymentMethodImage = !paymentMethodImage">
                <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PaymentMethods.jpg" class="hover:border-4 hover:rounded-lg border-green-800"/>
              </div>
            </li>
            <li class="w-full mb-5 border  text-white">
              <span class="justify-between flex  bg-green-800 py-1 font-bold">
                <span class="w-full">Last Step:</span>
                <span class="w-full uppercase">Verification</span>
              </span>
              <span class="bg-white text-green-800 font-bold w-full flex justify-center py-4">
                ONLINE : Verification | Email Notification
              </span>
            </li>
          </ul>
        </div>
      </div>




    </div>

    <div class="block w-full h-full shadow-4xl" v-if="paymentMethodImage">
      <img @click="paymentMethodImage =! paymentMethodImage" src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PaymentMethods.jpg" class="absolute top-1/2  left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[800px] border-[40px] hover:border-4 hover:border-red-500 border-green-900 rounded-2xl"/>
    </div>
  </div>
  <Footer />
</div>
</template>

<style></style>