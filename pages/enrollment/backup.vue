<script setup>
import { useUserStore } from "@/stores/user";
import { useTokenClient } from "vue3-google-signin";
const userStore = useUserStore();
const router = useRouter();
const paymentMethodImage = ref(false);
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

const { isReady, login } = useTokenClient({
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
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
            class="align-top w-full h-auto lg:object-fill lg:block hidden"
          />
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
            class="align-top w-full h-36 object-none lg:hidden block"
          />
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1
              class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
            >
              Enrollment
            </h1>
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


      <div class=" text-center mb-4 py-5 px-36 shadow-lg border-t lg:block hidden">
        <h1 class="uppercase font-bold lg:text-xl text-lg ">
          Announcement:
        </h1>
        <p class="mb-3 text-xs">(Due to System Updates, Server Maintenance and Power Interruptions)</p>
        <div>
          <div class="mb-3">
          <p class="lg:text-sm text-xs lg:w-10/12 mx-auto">
          To all <span class="font-bold uppercase">New Students (incoming 1st Year, Transferees and Second Degree Holders)</span> from July 1 to 4, 2024  that applied for temporary admission,
     
          please go to 
          <span class="font-bold">Admissions and Scholarships Office</span>
          or email <span class="font-bold">admissions@lsu.edu.ph</span>
           to get your new LSU Tracking ID Number (for Enrollment Status and Remarks).
        </p>
        </div>
        <div>
          <p class="lg:text-sm text-xs">
          To all <span class="font-bold uppercase">continuing students</span> from July 1 to 4, 2024 that applied for temporary admission, new LSU Tracking ID Number 
          (for Enrollment Status and Remarks) will be sent to your LSU Gmail Account.  All continuing students are required to use the correct LSU Gmail (no misspelled) along with their personal email when filling out the form; otherwise, the application will be deleted.
        </p>

          
        </div>
        </div>
       
      
       
          <div class="text-green-800 lg:text-sm text-sm mt-3 font-bold">If you have any concerns please visit Admissions and Scholarships Office, SJ Building Ground Floor LSU Campus. Monday to Friday 8am to 5pm and Saturday 8am to 12nn. Thank you!</div>

      </div>

    <div class="lg:flex w-11/12 mx-auto lg:mt-2 mb-5">

     
      <div class="lg:w-7/12 mx-auto items-center lg:shadow-lg lg:order-2 order-1 lg:border-t-2">
        <div class="mx-auto gap-20">
          <!-- <h1 class="text-center text-green-800 italic my-5">(click image to zoom)</h1> -->
          <div class="">
            <!-- <p
              class="lg:w-full w-10/12 mx-auto text-center my-5 lg:text-sm text-xs text-green-900"
            >
              For Shiftees and Transferees, please see your respective Deans.
            </p> -->
          </div>
          <div class="">
            <div class="text-center justify-center gap-10 py-5 lg:my-14">
              <!-- <div class="lg:mb-0 mb-4 cursor-not-allowed">
                <div
                  class="rounded-lg py-2 justify-center lg:px-10 px-5 my-auto h-fit lg:w-fit md:w-5/12 w-10/12 mx-auto shadow-xl bg-gray-300 text-white border-b border-gray-100 mt-0.5 lg:text-sm text-xs font-bold flex lg:whitespace-nowrap"
                >
                  <i class=" fa fa-calendar-times mr-5 text-3xl pt-0.5" aria-hidden="true"></i>
                  <h1 class="my-auto lg:whitespace-nowrap leading-tight">Summer Enrollment Closed</h1>
                </div>
              </div> -->
              <div class="lg:mb-10 mb-4">
                <a
                  href="https://my.lsu.edu.ph/class_offered_stat_open.jsp"
                  class="rounded-lg lg:py-6 py-3 px-10 my-auto justify-center h-fit lg:w-10/12   
                  mx-auto shadow-xl bg-white text-green-800 hover:bg-green-800 hover:text-white lg:text-sm text-xs font-bold flex lg:whitespace-nowrap"
                >
                  <i class="fa fa-list mr-5 text-3xl" aria-hidden="true"></i>
                  <h1 class="my-auto whitespace-nowrap lg:text-lg text-sm">Realtime Class Schedule</h1>
                </a>
              </div>
              <!-- <div class="relative lg:mb-10 mb-4 text-transparent">
                <a
                  href="/admissions/form"
                  class="rounded-lg lg:py-6 py-3 px-10 my-auto h-fit lg:w-10/12   mx-auto shadow-xl bg-white text-green-800  hover:bg-green-800 hover:text-white
                  lg:text-sm text-xs font-bold flex lg:whitespace-nowrap justify-center"
                >
                  <i class="fa fa-user-plus mr-5 text-3xl" aria-hidden="true"></i>
                  <h1 class="my-auto whitespace-nowrap lg:text-lg text-sm">Admissions Form</h1>
                </a>
              </div> -->

              <!-- <div class="relative lg:mb-10 mb-4">
                <p class="font-bold text-center pl-3">System Update until 7 A.M</p>
                <a
                  href="/#"
                  class="rounded-lg lg:py-6 py-3 px-10 my-auto h-fit lg:w-10/12   mx-auto shadow-xl bg-gray-300 text-white  
                  lg:text-sm text-xs font-bold flex lg:whitespace-nowrap justify-center cursor-not-allowed"
                >
                  <i class="fa fa-user-plus mr-5 text-3xl" aria-hidden="true"></i>
                  <h1 class="my-auto whitespace-nowrap lg:text-lg text-sm">Admissions Form</h1>
                </a>
              </div> -->


              <div class="lg:mb-10 mb-4">
                <a
                  href="/enrollment/tracking"
                  class="rounded-lg lg:py-6 py-3  lg:px-10 px-3 my-auto justify-center h-fit lg:w-10/12 
                  mx-auto shadow-xl bg-white text-green-800 hover:bg-green-800 hover:text-white lg:text-sm text-xs font-bold flex "
                >
                  <i class="fa fa-tasks mr-5 text-3xl" aria-hidden="true"></i>
                  <h1 class="my-auto lg:text-lg text-sm">Enrollment Tracking</h1>
                </a>
              </div>
              <!-- <div class="">
                <a
                  href="/enrollment"
                  class="rounded-lg lg:py-6 py-3 px-10 my-auto justify-center h-fit lg:w-10/12   mx-auto shadow-xl bg-white text-green-800 hover:bg-green-800 hover:text-white lg:text-sm text-xs font-bold flex lg:whitespace-nowrap"
                >
                  <i class="fa fa-file-video mr-5 text-3xl" aria-hidden="true"></i>
                  <h1 class="my-auto whitespace-nowrap lg:text-lg text-sm">Enrollment Guide Video</h1>
                </a>
              </div> -->
              <div>
                <!-- <button
                  :disabled="!isReady"
                  @click="login"
                  class="rounded-lg lg:pl-20 lg:pr-10 pl-14 my-10 pr-8 py-3.5 w-fit mx-auto block shadow-lg mb-5 whitespace-nowrap bg-green-10 text-white text-xl font-bold login-with-google-btn"
                >
                  Online Enrollment 
                </button> -->
                <!-- <p class="text-green-800 text-center">online enrollment will be open on January 8, 2024</p> -->
              </div>
            </div>
          </div>
        </div>
      </div>
      

      <div class="font-bold text-white bg-green-900 lg:text-2xl text-center py-5 leading-tight text-sm px-5 lg:hidden block">
            The Enrollment Period for the First Semester of Academic Year 2024 to 2025 is from July 1 to July 31, 2024.
          </div>
      <div class="text-center mb-5 py-5 lg:px-5 px-3 shadow-lg border-t lg:hidden block">
        <h1 class="uppercase font-bold lg:text-2xl text-lg ">
          Announcement:
        </h1>
        <p class="mb-6 text-xs">(Due to System Updates, Server Maintenance and Power Interruptions)</p>
        <div>
          <div class="mb-5">
          <p class="lg:text-sm text-xs lg:w-10/12 mx-auto">
          To all <span class="font-bold uppercase">New Students (incoming 1st Year, Transferees and Second Degree Holders)</span> from July 1 to 4, 2024  that applied for temporary admission,
     
          please go to 
          <span class="font-bold">Admissions and Scholarships Office</span>
          or email <span class="font-bold">admissions@lsu.edu.ph</span>
           to get your new LSU Tracking ID Number (for Enrollment Status and Remarks).
        </p>
        </div>
        <div>
          <p class="lg:text-sm text-xs">
          To all <span class="font-bold uppercase">continuing students</span> from July 1 to 4, 2024 that applied for temporary admission, new LSU Tracking ID Number 
          (for Enrollment Status and Remarks) will be sent to your LSU Gmail Account.
        </p>
        </div>
        </div>
        
        <div class="lg:text-sm text-sm mt-5 font-bold">
          All continuing students are required to use the correct LSU Gmail (no misspelled) along with their personal email when filling out the form; otherwise, the application will be deleted.</div>
        
          
          <div class="text-green-800 lg:text-sm text-sm mt-5 font-bold">If you have any concerns please visit Admissions and Scholarships Office, SJ Building Ground Floor LSU Campus. Monday to Friday 8am to 5pm and Saturday 8am to 12nn. Thank you!</div>
      </div>

      <div class="w-full shadow-lg lg:px-10 px-2 lg:order-1 order-2 border-t-2 lg:mt-0 mt-5 ">
        <div class="w-full mx-auto text-center my-5">
          <p class="font-bold text-green-900 lg:text-3xl text-xl lg:mb-3 mb-5 lg:mt-2 mt-5">Enrollment Steps</p>
          <ul class="w-full grid lg:grid-cols-2 justify-between gap-5">
            <li class="w-full border bg-white text-green-800 hover:text-white hover:bg-green-800">
              <span class="justify-evenly border-b flex p-5  bg-green-800 text-white py-1 font-bold">
                <span class="w-full">Step 1:</span>
                <span class="w-full uppercase">Admissions</span>
              </span>
              <span class=" block relative text-center  ">
                <!-- <a href="https://lsu.edu.ph/admissions/form" class=" font-bold w-full flex 
                justify-center lg:p-4 p-2 lg:pt-7 py-5 cursor-pointer">
                  ONLINE : Admissions Online Form
              </a> -->
                
              </span>
            </li>
            <li class="w-full border  text-white bg-white">
              <span class="justify-between flex p-5 bg-green-800 py-1 font-bold">
                <span class="w-full">Step 2:</span>
                <span class="w-full uppercase">Advising</span>
              </span>
              <span class=" text-green-800 font-bold w-full flex justify-center lg:p-4 p-3 lg:pt-5">
                ONSITE : Visit SJ Building <br> LSU Campus
              </span>
            </li>
            <li class="w-full lg:mb-5 border  text-white">
              <span class="justify-between flex p-5  bg-green-800 py-1 font-bold">
                <span class="w-full">Step 3:</span>
                <span class="w-full uppercase">Payment</span>
              </span>
              <span class="bg-white border-b text-green-800 font-bold w-full flex justify-center p-4">
                ONSITE Accounting Office or <br> Via Online Payment Methods
              </span>
              <div @click="paymentMethodImage = !paymentMethodImage">
                <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PaymentMethods.jpg" class="hover:border-4 hover:rounded-lg border-green-800"/>
              </div>
            </li>
            <li class="w-full lg:mb-5  text-white mb-7">
              <span class="justify-between flex  p-5 bg-green-800 py-1 font-bold">
                <span class="w-full">Last Step:</span>
                <span class="w-full uppercase">Validation</span>
              </span>
              <span class="bg-white text-green-800 font-bold border w-full flex justify-center p-4">
                ONLINE : Validation <br> LSU Email Activation
              </span>

              
          <div class="text-red-700 lg:text-sm text-sm font-bold bg-red-50 lg:px-5 px-3 lg:py-14 py-3 border-0 lg:border-y-4 border-y-2 border-red-800">
         <p class="lg:mb-10 mb-4 lg:text-sm text-xs"> For the Final Step, the LSU ASC Team will <span class="font-bold">Validate</span> all the information and activate your LSU Gmail.
         </p>
          <p class="lg:text-sm text-xs">All students are required to complete their detailed student profile; otherwise, they will be deactivated.</p>
        </div>
            </li>
          </ul>
        </div>
      </div>

      
    </div>

    <div class="font-bold text-white bg-green-900 lg:text-lg text-center py-5 w-11/12 mx-auto leading-tight text-sm px-5 lg:block hidden my-5">
            The Enrollment Period for the First Semester of Academic Year 2024 to 2025 is from July 1 to July 31, 2024.
          </div>


  <div class="w-full h-full shadow-4xl lg:block hidden" v-if="paymentMethodImage">
      <img @click="paymentMethodImage =! paymentMethodImage" src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PaymentMethods.jpg" 
      class="absolute top-1/2 mt-36 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-[800px] border-[40px] hover:border-4 hover:border-red-500 border-green-900 rounded-2xl"/>
    </div>
    </div>
    <!-- <AcademicCalendar /> -->
    <Footer />
  </div>
</template>

<style scoped>
.bg-green-10 {
  background: #003613;
}
</style>
