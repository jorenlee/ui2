<script setup>
   import {
     useUserStore
   } from "@/stores/user";
   
   const userStore = useUserStore();
   const endpoint = ref(userStore.mainDevServer);
   const router = useRouter();
   const paymentMethodImage = ref(false);
   
   
   const tabContinuing = ref(true)
   const searchBtnContinuing = ref('');
   const stepsContinuing = ref();
   const idContinuing = ref(null);
   const spinnerContinuing = ref(false);
   const pleaseAddCorrectTrackingIDNumberContinuing = ref(false);
   const trackingListContinuing = ref(false)
   const sorryNoResultsFoundContinuing = ref(false);
   let enrolleesDataContinuing = ref();
   let enrolleesDataOneFetchContinuing = ref();
   let isEvaluationFormSubmittedContinuing = ref(false);
   
   
   const tabTransferee = ref(false)
   const searchBtnTransferee = ref('');
   const stepsTransferee = ref();
   const idTransferee = ref(null);
   const spinneTransferee = ref(false);
   const pleaseAddCorrectTrackingIDNumberTransferee = ref(false);
   const trackingListTransferee = ref(false)
   const sorryNoResultsFoundTransferee = ref(false);
   let enrolleesDataTransferee = ref();
   let enrolleesDataOneFetchTransferee = ref();
   let isEvaluationFormSubmittedTransferee = ref(false);
   
   
   
   const tabSecondDegreeHolder = ref(false)
   const searchBtnSecondDegreeHolder = ref('');
   const stepsSecondDegreeHolder = ref();
   const idSecondDegreeHolder = ref(null);
   const spinneSecondDegreeHolder = ref(false);
   const pleaseAddCorrectTrackingIDNumberSecondDegreeHolder = ref(false);
   const trackingListSecondDegreeHolder = ref(false)
   const sorryNoResultsFoundSecondDegreeHolder = ref(false);
   let enrolleesDataSecondDegreeHolder = ref();
   let enrolleesDataOneFetchSecondDegreeHolder = ref();
   let isEvaluationFormSubmittedSecondDegreeHolder = ref(false);
   
   
   const tabNewFirstYear = ref(false)
   const searchBtnNewFirstYear = ref('');
   const stepsNewFirstYear = ref();
   const idNewFirstYear = ref(null);
   const spinnerNewFirstYear = ref(false);
   const pleaseAddCorrectTrackingIDNumberNewFirstYear = ref(false);
   const trackingListNewFirstYear = ref(false)
   const sorryNoResultsFoundNewFirstYear = ref(false);
   let enrolleesDataNewFirstYear = ref();
   let enrolleesDataOneFetchNewFirstYear = ref();
   let isEvaluationFormSubmittedNewFirstYear = ref(false);
   
   
   const toggleBtn = (a,b,c,d) => {
   tabContinuing.value = a;
   tabTransferee.value = b;
   tabSecondDegreeHolder.value = c;
   tabNewFirstYear.value = d;
   }
   
   
   const trackBtnContinuing = async () => {
     trackingListContinuing.value = false;
   
     sorryNoResultsFoundContinuing.value = false;
     if (searchBtnContinuing.value.length > 0) {
      //  spinnerContinuing.value = true;
       enrolleesDataContinuing.value = await $fetch(endpoint.value + "/api/admissions-second-sem-dev/list/", {
         method: "GET",
       }).then((response) => {
         console.log("response", response);
         console.log(response.length)
         response.filter(function(params) {
          if (searchBtnContinuing.value === params.tracking_id) {
            console.log(params)
            enrolleesDataOneFetchContinuing.value = params
          }
          
         })
       }).catch((err) => {
         err.data
         console.log(err.data)
         spinnerContinuing.value = false;
         trackingListContinuing.value = false;
       })
     } 
   
   }
   
   
   
   const trackBtnTransferee = async () => {
     trackingListTransferee.value = false;
   
     sorryNoResultsFoundTransferee.value = false;
     if (searchBtnTransferee.value.length > 0) {
   
      //  spinneTransferee.value = true;
       enrolleesDataTransferee.value = await $fetch(endpoint.value + "/api/admissions-second-sem-dev/transferee/list/", {
         method: "GET",
       }).then((response) => {
         console.log("response", response);
         console.log(response.length)
         response.filter(function(params) {
          if (searchBtnTransferee.value === params.tracking_id) {
            console.log(params)
            enrolleesDataOneFetchTransferee.value = params
          }
          else {
             sorryNoResultsFoundTransferee.value = true;
             setTimeout(() => {
               sorryNoResultsFoundTransferee.value = false;
             }, 3000)
            spinneTransferee.value = false;
          }
          //  if (searchBtnTransferee.value === params.tracking_id) {
          //    stepsTransferee.value = params.enrollment_tracking_status
          //    isEvaluationFormSubmittedTransferee.value = params.evaluation.submitted
          //    idTransferee.value = params.id
          //    sorryNoResultsFoundTransferee.value = false;
          //    trackingListTransferee.value = true;
          //    enrolleesDataOneFetchTransferee.value = params
          //    console.log('mao ni')
          //    // console.log(enrolleesData.value)
          //  } else {
          //    sorryNoResultsFoundTransferee.value = true;
          //    setTimeout(() => {
          //      sorryNoResultsFoundTransferee.value = false;
          //    }, 3000)
          //    spinneTransferee.value = false;
          //  }
         
         })
       }).catch((err) => {
         err.data
         console.log(err.data)
         spinneTransferee.value = false;
         trackingListTransferee.value = false;
       })
     } 
     
   
   }
   
   
   
   
   
   const trackBtnSecondDegreeHolder = async () => {
     trackingListSecondDegreeHolder.value = false;
   
     sorryNoResultsFoundSecondDegreeHolder.value = false;
     if (searchBtnSecondDegreeHolder.value.length > 0) {
      //  spinneSecondDegreeHolder.value = true;
       enrolleesDataSecondDegreeHolder.value = await $fetch(endpoint.value + "/api/admissions-second-sem-dev/second-degree-holder/list/", {
         method: "GET",
       }).then((response) => {
         console.log("response", response);
         console.log(response.length)
         response.filter(function(params) {
          if (searchBtnSecondDegreeHolder.value === params.tracking_id) {
            console.log(params)
            enrolleesDataOneFetchSecondDegreeHolder.value = params
          }
          else {
             sorryNoResultsFoundSecondDegreeHolder.value = true;
             setTimeout(() => {
               sorryNoResultsFoundSecondDegreeHolder.value = false;
             }, 3000)
            spinneSecondDegreeHolder.value = false;
          }
         })
       }).catch((err) => {
         err.data
         // console.log(err.data)
         spinneSecondDegreeHolder.value = false;
         trackingListSecondDegreeHolder.value = false;
       })
     }
     
   
   }
   
   
   const trackBtnNewFirstYear = async () => {
     trackingListNewFirstYear.value = false;
   
     sorryNoResultsFoundNewFirstYear.value = false;
     if (searchBtnNewFirstYear.value.length > 0) {
      //  spinnerNewFirstYear.value = true;
       enrolleesDataNewFirstYear.value = await $fetch(endpoint.value + "/api/admissions-second-sem-dev/new-student/list/", {
         method: "GET",
       }).then((response) => {
        //  console.log("response", response);
        //  console.log(response.length)
         response.filter(function(params) {
          if (searchBtnNewFirstYear.value === params.tracking_id) {
            console.log('params.tracking_id', params.tracking_id)
            console.log(params)
            enrolleesDataOneFetchNewFirstYear.value = params
          }          
          

          // console.log('params', params)
          // console.log('params.tracking_id', params.tracking_id)
          // if (searchBtnNewFirstYear.value === params.tracking_id) {
      
          //   console.log('params.tracking_id', params.tracking_id)
          //   enrolleesDataOneFetchNewFirstYear.value = params
          // }
          // else {
          //    sorryNoResultsFoundNewFirstYear.value = true;
          //    setTimeout(() => {
          //      sorryNoResultsFoundNewFirstYear.value = false;
          //    }, 3000)
          //   spinneNewFirstYear.value = false;
          // }
         })
       }).catch((err) => {
         err.data
         // console.log(err.data)
         spinnerNewFirstYear.value = false;
         trackingListNewFirstYear.value = false;
       })
     }
     
   
   }
   
   const goToAlternativeEvaluation = () => {
     router.push("/enrollment/evaluation/");
   }
   
   
   
   const continuingBtn = () => {
     toggleBtn(true, false, false, false)
     stepsContinuing.value = null
   }
   const transfereeBtn = () => {
     toggleBtn(false, true, false, false)
     stepsTransferee.value = null
   }
   const secondDegreeStudentBtn = () => {
     toggleBtn(false, false, true, false)
     stepsSecondDegreeHolder.value = null
   }
   const newFirstYearBtn = () => {
     toggleBtn(false, false, false, true)
     stepsNewFirstYear.value = null
   }
   
   
</script>
<template>
   <div>
      <Header />
      <div class="relative">
         <div class="">
            <div class="relative">
               <Banner />
               <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png" class="align-top w-full h-36 object-none lg:hidden block" />
               <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
                  <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"> Enrollment Tracking </h1>
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
         <div class="lg:flex">
            <div class="tracking-side lg:order-2 order-1 lg:w-9/12">
               <div class="grid xl:grid-cols-4 grid-cols-2 w-full bg-green-900 text-white xl:px-4 lg:py-5 py-4 lg:justify-between lg:order-1 order-2 lg:gap-4 gap-3 px-2">
                  <div @click="continuingBtn()" class="lg:text-base text-[10px] uppercase  cursor-pointer bg-green-700 text-white hover:bg-white hover:text-green-800 font-bold border text-center lg:mb-0  rounded-2xl  px-2 lg:py-1.5 py-2 ">
                     Continuing
                  </div>
                  <div @click="transfereeBtn()" class="lg:text-base  text-[10px] uppercase  cursor-pointer bg-green-700 text-white hover:bg-white hover:text-green-800 font-bold border text-center lg:mb-0  rounded-2xl  px-2 lg:py-1.5 py-2 ">
                     Transferee
                  </div>
                  <div @click="secondDegreeStudentBtn()" class="lg:text-base  text-[10px] uppercase  cursor-pointer bg-green-700 text-white hover:bg-white hover:text-green-800 font-bold border text-center lg:mb-0  rounded-2xl  px-2 lg:py-1.5 py-2">
                     Second Degree Student
                  </div>
                  <div @click="newFirstYearBtn()" class="lg:text-base  text-[10px]  uppercase  cursor-pointer bg-green-700 text-white hover:bg-white hover:text-green-800 font-bold border text-center rounded-2xl  px-2 lg:py-1.5 py-2">
                     New First Year
                  </div>
               </div>
               <div class="lg:order-2 order-1">
                  <div class="overflow-hidden" 
                     v-if="tabContinuing">
                     <p class=" text-center font-bold lg:mt-10 mt-7">Status: Continuing / Shiftee / Returnee</p>
                     <div class="lg:overflow-hidden lg:min-h-screen pb-80 px-5 ">
                        <p class="text-center mt-10 text-green-900 text-sm lg:px-4 mx-auto">
                           <span class="text-gray-600">If you need any further assistance or have any more questions, feel free to email at 
                           <span class="font-bold">admissions@lsu.edu.ph</span>. Thank you! </span>
                        </p>
                        <div class="lg:flex">
                           <div class="flex lg:w-5/12 w-fit shadow mx-auto mt-10 text-center rounded-lg">
                              <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 rounded-tl-lg rounded-bl-lg"
                                 placeholder="Tracking ID"              
                                 v-model="searchBtnContinuing" required/>
                              <button @click="trackBtnContinuing()"
                                 class=" px-5 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 border-4 border-green-900 whitespace-nowrap rounded-tr-lg rounded-br-lg">
                              <i class="fa fa-search"></i>
                              Track
                              </button>
                           </div>
                        </div>
                        <div v-if="pleaseAddCorrectTrackingIDNumberContinuing" 
                           class="font-bold text-center w-11/12 mx-auto my-10"> Please Add Correct Tracking ID </div>
                        <div class="mx-auto w-fit my-20" v-if="spinnerContinuing">
                           <p class="text-base text-green-900 font-bold mb-4">Please wait ... </p>
                           <i class="fa fa-spinner fa-spin text-8xl text-green-800 animate-spin"></i>
                        </div>
                        <div class="lg:flex lg:w-10/12 w-full mx-auto pt-10 lg:h-screen mb-5">
                          
                           <div v-if="enrolleesDataOneFetchContinuing" class="lg:flex items-center h-fit lg:w-full w-fit mx-auto">
                              <div
                                 class="h-fit w-fit rounded-lg px-2 py-1 font-bold relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                                 1. Admissions
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 2. Advising
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 3. Payment
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 4. Validation
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="w-fit h-fit lg:mx-0 mx-auto rounded-full px-3 py-2 lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchContinuing.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 <i class="fa fa-check text-3xl"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="overflow-hidden" v-if="tabTransferee">
                     <p class=" text-center font-bold mt-10">Status: Transferee</p>
                     <p class="text-center text-sm text-green-800 px-5"> An undergraduate student known to have attended a different college/university prior to seeking admission to the University.</p>
                     <div class="lg:overflow-hidden lg:min-h-screen pb-80 px-5 lg:order-2 order-1">
                        <p class="text-center lg:mt-10 mt-5 text-green-900 text-sm lg:px-4 mx-auto">
                           <span class="text-gray-600">If you need any further assistance or have any more questions, feel free to email at 
                           <span class="font-bold">admissions@lsu.edu.ph</span>. Thank you! </span>
                        </p>
                        <div class="lg:flex">
                           <div class="flex lg:w-5/12 w-fit shadow mx-auto mt-10 text-center rounded-lg">
                              <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 rounded-tl-lg rounded-bl-lg"
                                 placeholder="Tracking ID" 
                                 v-model="searchBtnTransferee" required/>
                              <button @click="trackBtnTransferee()"
                                 class=" px-5 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 border-4 border-green-900 whitespace-nowrap rounded-tr-lg rounded-br-lg">
                              <i class="fa fa-search"></i>
                              Track
                              </button>
                           </div>
                        </div>
                        <div v-if="pleaseAddCorrectTrackingIDNumberTransferee" 
                           class="font-bold text-center w-11/12 mx-auto my-10"> Please Add Correct Tracking ID </div>
                        <div class="mx-auto w-fit my-20" v-if="spinneTransferee">
                           <p class="text-base text-green-900 font-bold mb-4">Please wait ... </p>
                           <i class="fa fa-spinner fa-spin text-8xl text-green-800 animate-spin"></i>
                        </div>
                        <div class="lg:flex lg:w-10/12 w-full mx-auto pt-10 lg:h-screen mb-5">
                           <div v-if="enrolleesDataOneFetchTransferee" class="lg:flex items-center h-fit lg:w-full w-fit mx-auto">
                              <div
                                 class="h-fit w-fit rounded-lg px-2 py-1 font-bold relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                                 1. Admissions
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 2. Advising
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 3. Payment
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 4. Validation
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="w-fit h-fit lg:mx-0 mx-auto rounded-full px-3 py-2 lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchTransferee.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 <i class="fa fa-check text-3xl"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="overflow-hidden" v-if="tabSecondDegreeHolder">
                     <p class=" text-center font-bold mt-10">Status: Second Degree Holder</p>
                     <p class="text-center text-sm text-green-800 px-5">A student who have already completed a bachelor's degree but is seeking admission to another degree program as a second degree.</p>
                     <div class="lg:overflow-hidden lg:min-h-screen pb-80 px-5 lg:order-2 order-1">
                        <p class="text-center mt-10 text-green-900 text-sm lg:px-4 mx-auto">
                           <span class="text-gray-600">If you need any further assistance or have any more questions, feel free to email at 
                           <span class="font-bold">admissions@lsu.edu.ph</span>. Thank you! </span>
                        </p>
                        <div class="lg:flex">
                           <div class="flex lg:w-5/12 w-fit shadow mx-auto mt-10 text-center rounded-lg">
                              <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 rounded-tl-lg rounded-bl-lg"
                                 placeholder="Tracking ID" 
                                 v-model="searchBtnSecondDegreeHolder" required/>
                              <button @click="trackBtnSecondDegreeHolder()"
                                 class=" px-5 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 border-4 border-green-900 whitespace-nowrap rounded-tr-lg rounded-br-lg">
                              <i class="fa fa-search"></i>
                              Track
                              </button>
                           </div>
                        </div>
                        <div v-if="pleaseAddCorrectTrackingIDNumberSecondDegreeHolder" 
                           class="font-bold text-center w-11/12 mx-auto my-10"> Please Add Correct Tracking ID </div>
                        <div class="mx-auto w-fit my-20" v-if="spinneSecondDegreeHolder">
                           <p class="text-base text-green-900 font-bold mb-4">Please wait ... </p>
                           <i class="fa fa-spinner fa-spin text-8xl text-green-800 animate-spin"></i>
                        </div>
                        <div class="lg:flex lg:w-10/12 w-full mx-auto pt-10 lg:h-screen mb-5">
                           <div v-if="enrolleesDataOneFetchSecondDegreeHolder" class="lg:flex items-center h-fit lg:w-full w-fit mx-auto">
                              <div
                                 class="h-fit w-fit rounded-lg px-2 py-1 font-bold relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                                 1. Admissions
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 2. Advising
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 3. Payment
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 4. Validation
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="w-fit h-fit lg:mx-0 mx-auto rounded-full px-3 py-2 lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchSecondDegreeHolder.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 <i class="fa fa-check text-3xl"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div class="overflow-hidden" v-if="tabNewFirstYear">
                     <p class=" text-center font-bold mt-10">Status: New First Year</p>
                     <p class="text-center text-sm text-green-800 px-5"> A student who is eligible for admission to an undergaduate program after the completion of the K to 12 curriculum or its equivalent.</p>
                     <div class="lg:overflow-hidden lg:min-h-screen pb-80 px-5 lg:order-2 order-1">
                        <p class="text-center mt-10 text-green-900 text-sm lg:px-4 mx-auto">
                           <span class="text-gray-600">If you need any further assistance or have any more questions, feel free to email at 
                           <span class="font-bold">admissions@lsu.edu.ph</span>. Thank you! </span>
                        </p>
                        <div class="lg:flex">
                           <div class="flex lg:w-5/12 w-fit shadow mx-auto mt-10 text-center rounded-lg">
                              <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 rounded-tl-lg rounded-bl-lg"
                                 placeholder="Tracking ID" 
                                 v-model="searchBtnNewFirstYear" required/>
                              <button @click="trackBtnNewFirstYear()"
                                 class=" px-5 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 border-4 border-green-900 whitespace-nowrap rounded-tr-lg rounded-br-lg">
                              <i class="fa fa-search"></i>
                              Track
                              </button>
                           </div>
                        </div>
                        <div v-if="pleaseAddCorrectTrackingIDNumberNewFirstYear" 
                           class="font-bold text-center w-11/12 mx-auto my-10"> Please Add Correct Tracking ID </div>
                        <div class="mx-auto w-fit my-20" v-if="spinnerNewFirstYear">
                           <p class="text-base text-green-900 font-bold mb-4">Please wait ... </p>
                           <i class="fa fa-spinner fa-spin text-8xl text-green-800 animate-spin"></i>
                        </div>
                        <div class="lg:flex lg:w-10/12 w-full mx-auto pt-10 lg:h-screen mb-5">
                           <div v-if="enrolleesDataOneFetchNewFirstYear" class="lg:flex items-center h-fit lg:w-full w-fit mx-auto">
                              <div
                                 class="h-fit w-fit rounded-lg px-2 py-1 font-bold relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                                 1. Admissions
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_admissions_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 " >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 2. Advising
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_advising_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 3. Payment
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_accounting_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 4. Validation
                              </div>
                              <div
                                 class="h-[6px] lg:rotate-0 rotate-90 w-[100px] lg:mt-0 mt-10 lg:ml-0 ml-3"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                              </div>
                              <div
                                 class="w-fit h-fit lg:mx-0 mx-auto rounded-full px-3 py-2 lg:mt-0 mt-10 relative z-10"
                                 :class="
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'yes' ? 'text-white bg-green-900' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'no' ? 'text-white bg-red-700' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === '-' ? 'text-white bg-gray-300' : ''],
                                 [ enrolleesDataOneFetchNewFirstYear.enrollment_tracking_status_validation_is_complete === 'ongoing' ? 'text-white bg-blue-800' : '']
                                 "
                                 >
                                 <i class="fa fa-check text-3xl"></i>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div class="lg:w-3/12 shadow-lg lg:order-1 order-2 pb-5 lg:border-t-0 border-t-2">
               <div class="w-11/12 mx-auto text-center my-5">
                  <p class="font-bold text-green-900 text-3xl mb-10 mt-10">Enrollment Steps</p>
                  <ul class="w-full justify-between">
                     <li class="w-full mb-5 border">
                        <span class="justify-evenly flex  bg-green-800 text-white py-1 font-bold">
                        <span class="w-full">Step 1:</span>
                        <span class="w-full uppercase">Admissions</span>
                        </span>
                        <span class=" block relative text-center">
                        <!-- <a href="https://lsu.edu.ph/admissions/form" class=" font-bold w-full flex 
                           justify-center py-4 cursor-pointer bg-white text-green-800 hover:text-white hover:bg-green-800"> ONLINE : Admissions Online Form </a> -->
                        </span>
                     </li>
                     <li class="w-full mb-5 border  text-white">
                        <span class="justify-between flex  bg-green-800 py-1 font-bold">
                        <span class="w-full">Step 2:</span>
                        <span class="w-full uppercase">Advising</span>
                        </span>
                        <span class="bg-white text-green-800 font-bold w-full flex justify-center py-4"> ONSITE : Visit SJ Building <br> LSU Campus </span>
                     </li>
                     <li class="w-full mb-5 border  text-white">
                        <span class="justify-between flex  bg-green-800 py-1 font-bold">
                        <span class="w-full">Step 3:</span>
                        <span class="w-full uppercase">Payment</span>
                        </span>
                        <span class="bg-white border-b text-green-800 font-bold w-full flex justify-center py-4"> ONSITE Accounting Office or <br> Via Online Payment Methods </span>
                        <div @click="paymentMethodImage = !paymentMethodImage">
                           <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PaymentMethods.jpg" class="hover:border-4 hover:rounded-lg border-green-800" />
                        </div>
                     </li>
                     <li class="w-full mb-5 border  text-white">
                        <span class="justify-between flex  bg-green-800 py-1 font-bold">
                        <span class="w-full">Step 4:</span>
                        <span class="w-full uppercase">Validation</span>
                        </span>
                        <span class="bg-white text-green-800 font-bold w-full flex justify-center py-4"> ONLINE : Validation <br> LSU Email Activation </span>
                        <div class="text-red-700 lg:text-sm text-sm font-bold bg-red-50 lg:px-5 px-3 lg:py-14 py-3 border-0 lg:border-y-4 border-y-2 border-red-800">
                           <p class="lg:mb-10 mb-4 lg:text-sm text-xs"> For the Final Step, the LSU ASC Team will <span class="font-bold">Validate</span> all the information and activate your LSU Gmail.
                           </p>
                           <p class="lg:text-sm text-xs">All students are required to complete their detailed student profile; otherwise, it will be deactivated.</p>
                        </div>
                     </li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
      <Footer />
   </div>
</template>
<style></style>