<script setup>
  import {
    useUserStore
  } from "@/stores/user";
  import {
    useTokenClient
  } from "vue3-google-signin";
  const userStore = useUserStore();
  const router = useRouter();
  const paymentMethodImage = ref(false);
  const toggleVarAdmissions = ref(false)
  const toggleVarPayment = ref(false)
  const handleOnError = (errorResponse) => {
    // console.log("Error: ", errorResponse);
  };
  const handleOnSuccess = async (response) => {
    try {
      const userInfo = await $fetch("https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + response.access_token);
      
      if (!userInfo?.email) {
        console.error("No email found in response:", userInfo);
        return;
      }
      
      userStore.setToken(response.access_token, userInfo.email);
      console.log("User info:", userInfo);
      router.push("/enrollment/portal");
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  const {
    isReady,
    login
  } = useTokenClient({
    onSuccess: handleOnSuccess,
    onError: handleOnError,
    // other options
  });
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="">
        <div class="relative">
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg" class="align-top w-full h-auto lg:object-fill lg:block hidden" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/enrollment/enrollmentbg-mobile-lower-size.png" class="align-top w-full min-h-40 pt-12 lg:hidden block"/>
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1 class="lg:block hidden font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"> Enrollment </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <div class="w-11/12 mx-auto flex justify-between">
              <ul class="flex lasalle-green-text capitalize text-xs">
                <li>
                  <a href="/" class="mr-1"> Home </a>
                </li>
                <li>
                  <i class="fas fa-caret-right mr-1"></i>
                  <a href="/enrollment" class="mr-1"> Enrollment </a>
                </li>
              </ul>
              <ul class="flex text-green-800 capitalize text-xs">
                <li>
                  <a href="/enrollment/admin/login" class="mr-1 flex items-center">
                    <i class="fa fa-user mr-2" aria-hidden="true"></i> Admin Login </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:flex lg:w-11/12 mx-auto lg:mt-2 text-center justify-center lg:pb-5 gap-10 tracking-tight">
        <div class="lg:w-full shadow-lg pb-5 lg:border-t-0 border-t-2">
          <div class="w-11/12 mx-auto text-center mb-5">
            <p class="font-bold text-green-900 lg:text-3xl text-lg lg:mb-10 mb-2 lg:mt-7 mt-3">Enrollment Steps</p>
            <ul class="w-full lg:grid grid-cols-2 gap-x-3 justify-between lg:text-sm text-xs">
              <li class="w-full lg:mb-5 mb-2 border bg-white">
                <span class="justify-evenly flex lg:bg-green-800 bg-green-600 text-white py-1 font-bold">
                  <span class="w-full">Step 1:</span>
                  <span class="w-full uppercase">Admissions</span>
                </span>
                <div class="lg:py-2.5 py-2 block relative text-center">
                  <!-- /admissions/form -->
                 <!-- <div class="lg:mb-0 mb-1">
                  <a href="/admissions/form" class="font-bold w-full
                  justify-center cursor-pointer bg-white text-green-800 hover:uppercase hover:underline">
                  <i class="fa fa-external-link mr-1" aria-hidden="true"></i>
                  ONLINE: Admissions Form </a>
                  <button @click="toggleVarAdmissions = !toggleVarAdmissions" class="mt-2.5 ml-2 h-fit w-fit rounded-full">
                    <i class="fa text-green-900 text-[17px] border-2 border-green-400 p-0 rounded-full leading-0" :class="toggleVarAdmissions ? 'fa-info-circle' : 'fa-info-circle'"></i>
                  </button>
                 </div> -->
                  <div v-if="toggleVarAdmissions">
                    <p class="text-green-800 text-xs w-11/12 mx-auto">For New Enrollees Submit Hard Copy Documents</p>
                    <p class="text-green-800 text-xs w-11/12 mx-auto">at Admissions and Scholarships Center Office</p>
                  </div>
                </div>
              </li>
              <li class="w-full lg:mb-5 mb-2 border bg-white ">
                <span class="justify-between flex text-white lg:bg-green-800 bg-green-700 py-1 font-bold">
                  <span class="w-full">Step 2:</span>
                  <span class="w-full uppercase">Advising</span>
                </span>
                <div class="lg:py-3 pt-3.5 pb-2">
                  <p class="bg-white text-green-800  w-full flex justify-center lg:py-0"><span class="font-bold">ONSITE</span>  : Visit SJ Building LSU Campus </p>
                <p class="text-green-800 bg-white lg:pb-0 pb-2 justify-center">
                  <span class=" mr-1">or College Departments for</span>
                  <span class="font-bold">Course Subjects</span></p>
                </div>
              </li>
              <li class="w-full mb-5 border  bg-white">
                <span class="justify-between flex text-white
                lg:bg-green-800 bg-green-800 py-1 font-bold">
                  <span class="w-full">Step 3:</span>
                  <span class="w-full uppercase">Payment</span>
                </span>
                <p class="bg-white text-green-800 lg:py-4 py-2 border-b  w-full  justify-center"> <span class="font-bold">ONSITE:</span> Accounting Office or <br>  <span class="font-bold">ONLINE: </span> Payment Methods
                  <button @click="toggleVarPayment = !toggleVarPayment" class="mt-1 ml-2 h-fit w-fit rounded-full">
                    <i class="fa text-green-900 text-[17px] border-2 border-green-400 p-0 rounded-full leading-0" :class="toggleVarPayment ? 'fa-info-circle' : 'fa-info-circle'"></i>
                  </button>
                </p>
                <div v-if="toggleVarPayment">
                  <div @click="paymentMethodImage = !paymentMethodImage">
                    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PaymentMethods.jpg" class="hover:border-4 hover:rounded-lg border-green-800" />
                  </div>
                </div>
              </li>
              <li class="w-full lg:mb-5 mb-2 border bg-white">
                <span class="justify-between flex text-white  
                lg:bg-green-800
                bg-green-900 py-1 font-bold">
                  <span class="w-full">Step 4:</span>
                  <span class="w-full uppercase">Validation</span>
                </span>
                <p class="ml-1  text-green-800 lg:pt-5 pt-2 lg:flex block justify-center"><span class="font-bold lg:flex block mr-1">ONSITE: Certificate of Registration</span> <span class="block">at Registrar's Office</span></p>
                <p class="justify-center text-green-800 lg:pb-3 pb-2 lg:flex block"><span class="lg:flex block">and NPCC Office for</span> <span class="font-bold mx-1">LSU Gmail and Credentials</span>Creation</p>                  
                  <!-- <div class="text-red-700 lg:text-sm text-sm font-bold bg-red-50 lg:px-5 px-3 lg:py-14 py-3 border-0 lg:border-y-4 border-y-2 border-red-800">
                <p class="lg:mb-10 mb-4 lg:text-sm text-xs"> For the Final Step, the LSU ASC Team will <span class="font-bold">Validate</span> all the information and activate your LSU Gmail.
                </p>
                  <p class="lg:text-sm text-xs">All students are required to complete their detailed student profile; otherwise, they will be deactivated.</p>
                </div> -->
              </li>
            </ul>
          </div>
        </div>
        <div class="lg:mt-5 mt-10 w-11/12 lg:w-auto mx-auto">
          <a href="https://my.lsu.edu.ph/class_offered_stat_open.jsp" class="rounded-lg lg:py-6 py-3 px-5 my-auto justify-center h-fit   
                  mx-auto shadow-xl bg-white text-green-800 hover:bg-green-800 hover:text-white lg:text-sm text-xs font-bold flex lg:whitespace-nowrap">
            <i class="fa fa-list mr-5 text-3xl" aria-hidden="true"></i>
            <h1 class="my-auto whitespace-nowrap lg:text-lg text-sm">Realtime Class Schedule</h1>
          </a>
        </div>
        <!-- <div class="lg:mb-0 mb-5">
          <a href="/admissions/form" class="rounded-lg lg:py-6 py-3 px-5 my-auto h-fit   mx-auto shadow-xl bg-white text-green-800  hover:bg-green-800 hover:text-white
                  lg:text-sm text-xs font-bold flex lg:whitespace-nowrap justify-center">
            <i class="fa fa-user-plus mr-5 text-3xl" aria-hidden="true"></i>
            <h1 class="my-auto whitespace-nowrap lg:text-lg text-sm">Admissions Form</h1>
          </a>
        </div> -->
        <!-- <div class="lg:mb-0 mb-5">
          <a href="/enrollment/tracking" class="rounded-lg lg:py-6 py-3  px-5 my-auto justify-center h-fit 
                  mx-auto shadow-xl bg-white text-green-800 hover:bg-green-800 hover:text-white lg:text-sm text-xs font-bold flex ">
            <i class="fa fa-tasks mr-5 text-3xl" aria-hidden="true"></i>
            <h1 class="my-auto lg:text-lg text-sm whitespace-nowrap">Enrollment Tracking</h1>
          </a>
        </div> -->
      </div>
      <div class="w-11/12 mx-auto text-center mb-4 py-5 px-2 shadow-lg text-green-800 lg:text-sm text-xs mt-3 font-bold border-t">
        If you have any concerns please visit Admissions and Scholarships Office, SJ Building Ground Floor LSU Campus. Monday to Friday 8am to 5pm and Saturday 8am to 12nn. Thank you!</div>
        <!-- <div class="font-bold text-white bg-green-900 lg:text-lg text-center py-2 w-11/12 mx-auto leading-tight text-sm px-5 my-5">
          The Online Admission Form is until August 16, 2024.
        </div> -->
    </div>
    <Footer />
  </div>
</template>
<style scoped>
  .bg-green-10 {
    background: #003613;
  }
</style>
