<script setup>
  import moment from "moment";
  import axios from "axios";
  import {
    useUserStore
  } from "@/stores/user";
  const userStore = useUserStore();
  const endpoint = ref(userStore.mainDevServer);
  const donationInfo = ref({
    payment_method: '',
    donate_to: '',
    amount: 0,
    name: '',
    contact_number: '',
    email: '',
    transaction_number: '',
    receipt_url: '',
    donation_id: "DID" + moment().valueOf(),
    usher_id: '',
    date_time: '',
    confirmation_approval: 'yes',
    privacy_notice_approval: null
  })

  const privacyTextExpand = ref(false)
  const usherettes_code = ref('')
  const final_usherettes_code = ref('')
  const donationForm = ref(true)
  const receiptBox = ref(false)
  const usherettes_codeInputBox = ref(true)
  const codeDoesNotExists = ref(false)
  const cashDetailsBox = ref(false)
  const thankYouMessage = ref(false)
  const pleaseEnterAmountAlert = ref(false)
  const pleaseEnterAllDetails = ref(false)
  const cashInfoDetails = ref(false)
  const donateAnonymously = ref(false)
  const uploadReceiptBox = ref(false)

  const imagePath = ref('https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/investiture/files/');
  const imagePreview = ref(
    "https://lsu-media-styles.sgp1.digitaloceanspaces.com/storage-bucket-name/folder-location/files/admissions/sample.jpg"
  )

  const eTargetFiles = ref(null);

  const uploadedFile = (e) => {
    eTargetFiles.value = e.target.files[0];
    imagePreview.value = URL.createObjectURL(eTargetFiles.value);
    donationInfo.value.receipt_url = imagePath.value + '' + e.target.files[0].name

    console.log(donationInfo.value.receipt_url)
  }



  const backToDetailsBtn = () => {
    donationForm.value = !donationForm.value
    receiptBox.value = !receiptBox.value
  }

  const verifyCode = () => {
    final_usherettes_code.value = usherettes_code.value
    if (
      (final_usherettes_code.value === 'AIU000' || 
      final_usherettes_code.value === 'AIU102' || 
      final_usherettes_code.value === 'AIU203' || 
      final_usherettes_code.value === 'AIU304' || 
      final_usherettes_code.value === 'AIU405' || 
      final_usherettes_code.value === 'AIU506' || 
      final_usherettes_code.value === 'AIU607' || 
      final_usherettes_code.value === 'AIU708' || 
      final_usherettes_code.value === 'AIU809' || 
      final_usherettes_code.value === 'AIU910' || 
      final_usherettes_code.value === 'AIU110') && 
      final_usherettes_code.value.length === 6) {
      cashDetailsBox.value = true
      codeDoesNotExists.value = false
      usherettes_codeInputBox.value = false
    } else {
      final_usherettes_code.value = ''
      usherettes_codeInputBox.value = false
      cashDetailsBox.value = false
      codeDoesNotExists.value = true
    }
  }

  const codeRestart = () => {
    codeDoesNotExists.value = false
    usherettes_codeInputBox.value = true
    final_usherettes_code.value = ''
    usherettes_code.value = ''
    cashDetailsBox.value = false
  }
  



  const okInfo = () => {
    donationForm.value = false
    receiptBox.value = true
    // console.log(donationInfo.value)
  }

  const submitDonation = () => {
    donationInfo.value.date_time = moment().format('LLLL')
    if(donationInfo.value.payment_method === 'cash') {
      donationInfo.value.transaction_number = '' 
      donationInfo.value.receipt_url = '' 
      donationInfo.value.usher_id = final_usherettes_code.value
      if(donationInfo.value.amount === 0) {
        pleaseEnterAmountAlert.value = true
        setTimeout(() => {
          pleaseEnterAmountAlert.value = !pleaseEnterAmountAlert.value
        }, 3000)
      } 
      else {
        if(donationInfo.value.donate_to === '') {
          donationInfo.value.donate_to = 'All Strategic Intents'
        
        }
        if(donationInfo.value.name === '') {
          // donationInfo.value.name = final_usherettes_code.value
          donationInfo.value.name = 'Anonymous'
        
        }
        if(donationInfo.value.contact_number === '') {
          donationInfo.value.contact_number = 'None'
        
        }
        if(donationInfo.value.email === '') {
          donationInfo.value.email = 'dev@lsu.edu.ph'
        }
        okInfo()
      }
    }

    if(donationInfo.value.payment_method === 'bank transfer') {
      if(
        donationInfo.value.donate_to === '' ||
        donationInfo.value.amount === 0 ||
        donationInfo.value.name === '' ||
        donationInfo.value.contact_number === '' ||
        donationInfo.value.email === '' ||
        donationInfo.value.transaction_number === '' ||
        donationInfo.value.receipt_url === ''
      ) {
        pleaseEnterAllDetails.value = true
        setTimeout(() => {
          pleaseEnterAllDetails.value = !pleaseEnterAllDetails.value
        }, 3000)
      } 
      else {
        okInfo()
      }
    }

    if(donationInfo.value.payment_method === 'pledge') {
      donationInfo.value.transaction_number = '' 
      donationInfo.value.receipt_url = '' 
      if(
        donationInfo.value.donate_to === '' ||
        donationInfo.value.amount === 0 ||
        donationInfo.value.name === '' ||
        donationInfo.value.contact_number === '' ||
        donationInfo.value.email === ''
      ) {
        pleaseEnterAllDetails.value = true
        setTimeout(() => {
          pleaseEnterAllDetails.value = !pleaseEnterAllDetails.value
        }, 3000)
      } 
      else {
        okInfo()
      }
    }
  
    // if(donationInfo.value.usher_id === '') {
    //   donationInfo.value.usher_id = donationInfo.value.name
    // }
  }

  const confirmationAndSendToEmailBtn = () => {
    //1st to Load
    if(donationInfo.value.payment_method === 'cash') {
      addNewDonationEntry()
    }

    if(donationInfo.value.payment_method === 'bank transfer') {
      saveFile()
    }

    if(donationInfo.value.payment_method === 'pledge') {
      addNewDonationEntry()
    }
 
  }

  const saveFile = () => {
    let formData = new FormData();
    formData.append("image", eTargetFiles.value);
    let axiosConfig = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    axios
    .post(endpoint.value + "/api/investiture/file/list/files/", formData, axiosConfig)
    .then((response) => {
      console.log(response);
      // 2nd to Load
      addNewDonationEntry()
    })
    .catch(error => {
      console.log(error.response.data.error)
    })
  }



  const addNewDonationEntry = async () => {
    donationForm.value = false
    receiptBox.value = false
    thankYouMessage.value = true
    // console.log(donationInfo.value)
    if(donationInfo.value.payment_method === 'bank transfer') {
      donationInfo.value.usher_id = 'N/A' 
    }

    if(donationInfo.value.payment_method === 'cash') {
      donationInfo.value.transaction_number = 'N/A' 
      donationInfo.value.receipt_url = 'https://images.squarespace-cdn.com/content/v1/504f8e4ac4aad5da934ea37a/1548025303772-Q8CXTD7IN5U97BXF2LQL/N%3AA_logo.png'
    }

    if(donationInfo.value.payment_method === 'pledge') {
      donationInfo.value.usher_id = 'N/A' 
      donationInfo.value.transaction_number = 'N/A' 
      donationInfo.value.receipt_url = 'https://images.squarespace-cdn.com/content/v1/504f8e4ac4aad5da934ea37a/1548025303772-Q8CXTD7IN5U97BXF2LQL/N%3AA_logo.png'
    }

    if(donationInfo.value.privacy_notice_approval === true) {
      donationInfo.value.privacy_notice_approval = 'yes'
    }

    await $fetch(endpoint.value + "/api/investiture/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: donationInfo.value,
    }).then((response) => {
      //console.log(donationInfo.value)
      console.log(response);
      //console.log(response.errors);
      //Last to Load
      notifyEmail()
    })
  }

  const notifyEmail = async () => {
    await $fetch(endpoint.value + "/api/investiture/notify-email/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: donationInfo.value,
    }).then((response) => {
      //console.log(donationInfo.value)
      console.log(response);
      //console.log(response.errors);
    })
  }
</script>
<template>
  <div class="text-[#3c4241] font-montserrat">
    <!-- min-h-screen flex items-center -->
    <div v-if="donationForm" class=" min-h-screen">
      <div class="w-full bg-white">
        <NuxtLink to="/">
          <h1 class="lg:static flex items-center lg:mx-auto mx-3 lg:w-fit">
            <span class="lg:w-fit w-16 lg:mx-0 py-3 pr-3 lg:pl-0">
              <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsuseal-mono.png" class="lg:w-[60px] w-auto lg:mx-0 mx-auto"/>
            </span>
            <span class="ml-1">
              <h1 class="lg:whitespace-nowrap uppercase text-green-800 font-bold text-3xl mt-1 font-hk-compression">la salle university</h1>
              <span class="lg:whitespace-nowrap  text-2xl font-bold font-hk-compression -mt-2 flex capitalize">support our mission</span>
            </span>
          </h1>
        </NuxtLink>
       
      </div>
      <!-- <div class="min-h-screen flex lg:items-center lg:pt-20 pt-36 pb-5"> -->
      <div class="lg:pt-0 pb-5 lg:w-fit mx-auto">
        <div class="bg-green-800 text-white  mx-auto">
          <ul class="flex text-center justify-between">
            <NuxtLink to="/">
              <li class=" text-white py-2 lg:text-base lg:mx-10 mx-5 text-xs text-center hover:font-bold hover:underline cursor-pointer static whitespace-nowrap font-montserrat">Home </li>
            </NuxtLink>
            <NuxtLink to="/investiture">
              <li class=" text-white py-2 lg:text-base lg:mx-10 mx-5 text-xs text-center hover:font-bold hover:underline cursor-pointer static whitespace-nowrap font-montserrat">Vision </li>
            </NuxtLink>
            <NuxtLink to="/investiture/donation/dashboard">
              <li class=" text-white py-2 lg:text-base lg:mx-10 mx-5 text-xs text-center hover:font-bold hover:underline cursor-pointer static whitespace-nowrap font-montserrat">Dashboard </li>
            </NuxtLink>

          </ul>
        </div>


        <div class="lg:w-auto w-11/12 mx-auto lg:shadow-lg lg:border-b-0 lg:pb-5 pb-3 lg:px-10 lg:border-t lg:border-gray-100 bg-white">
          <p class="font-monteserrat text-center pt-4 font-bold text-sm flex w-fit mx-auto"><TotalDonationNumberOnly/></p>
          <h2 class="font-hk-compression text-green-800 font-bolder text-center text-4xl lg:pb-5 pb-3">Donate Now</h2>
          <div class="lg:shadow-none shadow lg:pb-0 pb-3 lg:p-0 p-4">
            <!-- w-fit lg:mx-0 mx-auto -->
            <p class="whitespace-nowrap text-sm font-montserrat mb-1">1. Choose Payment Method:</p>
            <div class="ml-10">
              <li class="flex items-center mb-1 relative">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="cash" id="cash" />
                <label class=" flex font-montserrat font-bold hover:text-green-800 cursor-pointer text-sm" for="cash">
                  Cash
                  <span class="rounded-full w-4 h-3.5 bg-white border-green-800 hover:bg-green-800 hover:text-white text-green-800  border flex text-center px-[3px] ml-1" @click="cashInfoDetails = !cashInfoDetails">
                    <i class="fa fa-info text-[9px] mt-[1px] ml-[2.5px]"></i>
                  </span>
                  <div class="text-[10px] bg-gray-100 px-2 text-gray-700 font-light -mt-5 ml-1 absolute left-20 py-1 select-none" @click="cashInfoDetails = !cashInfoDetails"
                  v-if="cashInfoDetails">
                  
                  <p class="leading-tight">Cash Donations are done onsite. Assigned personnel will assist you for the transaction.</p>
                </div>
                </label>
              </li>
              <li class="flex items-center mb-1">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="bank transfer" id="bank-transfer" />
                <label class="font-montserrat whitespace-nowrap font-bold hover:text-green-800 cursor-pointer text-sm" for="bank-transfer">Bank Transfer</label>
              </li>
              <li class="flex items-center mb-1">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="pledge" id="pledge" />
                <label class="font-montserrat whitespace-nowrap font-bold hover:text-green-800 cursor-pointer text-sm" for="pledge">Pledge</label>
              </li>
              <!-- <li class="flex items-center mb-1">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="pledge" id="pledge" />
                <label class="font-montserrat whitespace-nowrap font-bold hover:text-green-800 cursor-pointer text-sm text-gray-400" for="pledge">GCASH <span class="font-normal">(coming soon)</span></label>
              </li>
              <li class="flex items-center mb-1">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="pledge" id="pledge" />
                <label class="font-montserrat whitespace-nowrap font-bold hover:text-green-800 cursor-pointer text-sm text-gray-400" for="pledge">PayMaya <span class="font-normal">(coming soon)</span></label>
              </li>
              <li class="flex items-center mb-1">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="pledge" id="pledge" />
                <label class="font-montserrat whitespace-nowrap font-bold hover:text-green-800 cursor-pointer text-sm text-gray-400" for="pledge">Credit Card <span class="font-normal">(coming soon)</span></label>
              </li>
              <li class="flex items-center mb-1">
                <input type="radio" class="mr-2" v-model="donationInfo.payment_method" value="pledge" id="pledge" />
                <label class="font-montserrat whitespace-nowrap font-bold hover:text-green-800 cursor-pointer text-sm text-gray-400" for="pledge">SPay Later <span class="font-normal">(coming soon)</span></label>
              </li> -->
            </div>
          </div>
          <div v-if="donationInfo.payment_method === 'cash'">
            <div v-if="usherettes_codeInputBox" class="mt-3 mb-2 flex items-center lg:shadow-none shadow-lg w-fit mx-auto ">
              <input v-model="usherettes_code" type="password" maxlength="6" class="h-8 rounded-tl-sm rounded-bl-sm w-[110px] border-y-2 border-l-2 px-2 border-green-800" placeholder="Enter Code" />
              <button class="bg-green-800 text-white hover:bg-green-700 border-2 border-green-800 px-2 h-8 lg:shadow-none shadow-lg" @click="verifyCode"> Verify <i class="fa fa-check ml-1"></i>
              </button>
            </div>
            <div v-if="codeDoesNotExists">
              <p class="text-center text-red-800 font-montserrat text-sm mt-5"> Code does not exists! </p>
              <button class="bg-green-800 text-white hover:bg-white hover:text-green-800 border border-green-800 px-2 py-1 mt-3 mx-auto uppercase text-xs rounded-md w-fit block" @click="codeRestart">reset</button>
            </div>
            <div v-if="cashDetailsBox">
              <div class="lg:mb-0 lg:mt-0 mt-3 lg:shadow-none shadow lg:p-0 p-3">
                <p class="w-11/12 whitespace-nowrap text-sm font-montserrat lg:mt-3 mt-1">2. Please fill out the Donation details</p>
                <div class="lg:ml-10 w-full">
                  <div class="flex items-center mt-1 mb-1">
                    <label class="lg:px-2.5 font-montserrat text-sm lg:font-bold text-green-800">Usher ID</label>
                    <span class="font-monteserrat ml-3">
                      {{ final_usherettes_code }}
                      <i class="fa fa-check ml-2 text-green-700"></i>
                    </span>
                  </div>
                  <div class="lg:flex mb-2">
                    <label class="font-montserrat text-sm lg:font-bold text-green-800 lg:text-right whitespace-nowrap lg:mb-0 mb-2 lg:static block">Donate To<span class="text-white">*</span>
                    </label>
                    <ul class="block text-xs font-montserrat lg:ml-2 lg:mt-1">
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 1.0" id="s1" />
                        <label class="mx-1" for="s1">
                          <span class="font-bold">SI 1.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 lg:whitespace-nowrap cursor-pointer hover:font-bold"> Reengineer the learning experience to foster learner engagement</span>
                        </label>
                      </li>
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 2.0" id="s2" />
                        <label class="mx-1" for="s2">
                          <span class="font-bold">SI 2.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 cursor-pointer hover:font-bold"> Nurture a community of lifelong learners</span>
                        </label>
                      </li>
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 3.0" id="s3" />
                        <label class="mx-1" for="s3">
                          <span class="font-bold">SI 3.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 cursor-pointer hover:font-bold"> Broaden participation in circles of Quality Management</span>
                        </label>
                      </li>
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 4.0" id="s4" />
                        <label class="mx-1" for="s4">
                          <span class="font-bold">SI 4.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 cursor-pointer hover:font-bold"> Contribute to the building of a more sustainable community</span>
                        </label>
                      </li>
                    </ul>
                  </div>
                  <div :class="donateAnonymously ? 'hidden': ''">
                    <div class="font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                      <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap">Name<span class="text-white">*</span>
                      </label>
                      <input type="text" class="text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block capitalize px-2" v-model="donationInfo.name" placeholder="example: Juan Dela Cruz" />
                    </div>
                    <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                      <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap lg:-ml-3">Contact No.<span class="text-white">*</span>
                      </label>
                      <input type="tel" class="text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block lg:ml-3 px-2" maxlength="13" minlength="11" v-model="donationInfo.contact_number" placeholder="e.g +639001002004" />
                    </div>
                    <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                      <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap">Email <span class="text-white">*</span>
                      </label>
                      <input type="email" class="lowercase text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block px-2" v-model="donationInfo.email" placeholder="e.g npc@lsu.edu.ph" />
                    </div>
                  </div>
                  <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                    <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap">Amount <span class="text-red-800">*</span>
                    </label>
                    <input min="1" type="number" class="text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block px-2" v-model="donationInfo.amount" placeholder="e.g 5000.00" />
                  </div>
                  <div class="mt-5 font-montserrat lg:mb-2 mb-3 flex items-center">
                    <span class="lg:w-2/12 text-right mt-0.5">
                      <input type="checkbox" v-model="donateAnonymously" value="anonymous" class="" id="anonymously"/>
                    </span>
                    <label class="lg:ml-5 ml-2  text-gray-400 hover:text-green-800 text-xs select-none" for="anonymously">
                      Donate Anonymously
                    </label>
                  </div>
                  <div class="w-full font-montserrat text-xs text-center text-red-600" v-if="pleaseEnterAmountAlert">
                  Please Enter Amount!
                </div>
                  <div @click="submitDonation" class="select-none cursor-pointer uppercase text-sm border border-green-900 hover:bg-white bg-green-900 
                text-white hover:text-green-900 lg:px-10 px-6 lg:py-1 py-2 mx-auto lg:w-fit mt-7 rounded-full block hover:font-bold font-montserrat text-center">
                    Submit
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="donationInfo.payment_method === 'bank transfer'">
            <div class="lg:mb-3 lg:mt-3 my-3 lg:shadow-none shadow">
              <p class="text-sm mb-2 font-montserrat lg:p-0 p-3">2. Please use the <span class="font-bold">LSU bank account</span> details for bank transfer transactions </p>
              <div class="lg:w-9/12 mx-auto lg:pb-2">
                <div class="w-full border-green-800 border text-center px-10 bg-green-900 text-white font-montserrat text-sm">BPI Account</div>
                <div class="w-full">
                  <div class="flex border-b font-montserrat">
                    <div class="border-b py-1 lg:w-7/12 w-4/12 font-bold px-1 text-xs">Account Name</div>
                    <div class="border-b py-1 w-full lg:px-5 text-xs">La Salle University Ozamiz, Inc.</div>
                  </div>
                  <div class="flex border-b font-montserrat">
                    <div class="border-b py-1 lg:w-7/12 w-4/12 font-bold px-1 text-xs lg:whitespace-nowrap">Account Number</div>
                    <div class="border-b py-1 w-full lg:px-5 text-xs">9363-0720-51</div>
                  </div>
                  <div class="flex border-b font-montserrat">
                    <div class="border-b py-1 lg:w-7/12 w-4/12 font-bold px-1 text-xs">Branch</div>
                    <div class="border-b py-1 w-full lg:px-5 text-xs whitespace-nowrap">Gallardo St. cor Burgos St. Ozamiz</div>
                  </div>
                  <div class="flex border-b font-montserrat">
                    <div class="border-b py-1 lg:w-7/12 w-4/12 font-bold px-1 text-xs">Swift Code</div>
                    <div class="border-b py-1 w-full lg:px-5 text-xs">BOPIPHMM</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="lg:my-0 mt-5 lg:shadow-none shadow lg:p-0 p-3">
              <p class="w-11/12 lg:whitespace-nowrap text-sm font-montserrat">3. Please fill out the Donation details</p>
              <div class="w-full pt-2 lg:ml-12">
                <div class="">
                  <div class="lg:flex mb-2">
                    <label class="font-montserrat text-sm lg:font-bold text-green-800 lg:text-right lg:ml-5 whitespace-nowrap lg:mb-0 mb-2 lg:static block">Donate To <span class="text-red-800">*</span>
                    </label>
                    <ul class="block text-xs font-montserrat lg:ml-3 lg:mt-1">
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 1.0" id="s1" />
                        <label class="mx-1" for="s1">
                          <span class="font-bold">SI 1.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold lg:whitespace-nowrap cursor-pointer"> Reengineer the learning experience to foster learner engagement</span>
                        </label>
                      </li>
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 2.0" id="s2" />
                        <label class="mx-1" for="s2">
                          <span class="font-bold">SI 2.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold cursor-pointer"> Nurture a community of lifelong learners</span>
                        </label>
                      </li>
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 3.0" id="s3" />
                        <label class="mx-1" for="s3">
                          <span class="font-bold">SI 3.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold cursor-pointer"> Broaden participation in circles of Quality Management</span>
                        </label>
                      </li>
                      <li class="lg:flex lg:ml-2 lg:mb-1">
                        <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 4.0" id="s4" />
                        <label class="mx-1" for="s4">
                          <span class="font-bold">SI 4.0</span>
                          <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold cursor-pointer"> Contribute to the building of a more sustainable community</span>
                        </label>
                      </li>
                    </ul>
                  </div>
                  <div class="font-montserrat lg:mb-2 mb-3 lg:flex items-center">
                    <label class="lg:-ml-6 text-sm lg:font-bold text-green-800 w-3/12 lg:text-right lg:mr-5 mr-2 whitespace-nowrap lg:static block">Amount <span class="text-red-800">*</span>
                    </label>
                    <input min="1" type="number" class="text-sm w-full lg:w-7/12 border-b border-green-900 border-0 h-8 rounded-sm shadow px-2"
                    v-model="donationInfo.amount" placeholder="e.g 5000.00" />
                  </div>
                  <div class="font-montserrat lg:mb-2 mb-3 lg:flex items-center">
                    <label class="lg:-ml-6 text-sm lg:font-bold text-green-800 w-3/12 lg:text-right lg:mr-5 mr-2 whitespace-nowrap lg:static block">Name <span class="text-red-800">*</span>
                    </label>
                    <input type="text" class="capitalize text-sm w-full lg:w-7/12 border-b border-green-900 border-0 h-8 rounded-sm shadow px-2" v-model="donationInfo.name" placeholder="example: Juan Dela Cruz" />
                  </div>
                  <div class="font-montserrat lg:mb-2 mb-3 lg:flex items-center">
                    <label class="lg:-ml-6 text-sm lg:font-bold text-green-800 w-3/12 lg:text-right lg:mr-5 mr-2 whitespace-nowrap lg:static block">Contact No. <span class="text-red-800">*</span>
                    </label>
                    <input type="tel" class="text-sm w-full lg:w-7/12 border-b border-green-900 border-0 h-8 rounded-sm shadow px-2" maxlength="13" minlength="11" v-model="donationInfo.contact_number" placeholder="e.g +639001002004" />
                  </div>
                  <div class="font-montserrat lg:mb-2 mb-3 lg:flex items-center">
                    <label class="lg:-ml-6 text-sm lg:font-bold text-green-800 w-3/12 lg:text-right lg:mr-5 mr-2 whitespace-nowrap lg:static block">Email <span class="text-red-800">*</span>
                    </label>
                    <input type="email" class="lowercase text-sm w-full lg:w-7/12 border-b border-green-900 border-0 h-8 rounded-sm shadow px-2" v-model="donationInfo.email" placeholder="e.g npc@lsu.edu.ph" />
                  </div>
                  <div class="font-montserrat mb-4 lg:flex items-center">
                    <label class="lg:-ml-6 font-montserrat text-sm lg:font-bold text-green-800 w-3/12 lg:text-right lg:mr-5 mr-2 whitespace-nowrap lg:static block">Transaction No. <span class="text-red-800">*</span>
                    </label>
                    <input type="text" class="text-sm w-full lg:w-7/12 border-b border-green-900 border-0 h-8 rounded-sm shadow px-2" v-model="donationInfo.transaction_number" placeholder="Transaction No." />
                  </div>

 <!-- accept="image/png, image/jpeg ;capture=camera"  -->
                  <!-- <div @click="uploadReceiptBox = true" class="font-montserrat mb-2 flex items-center mx-auto text-green-800 hover:text-green-600 w-fit">
                    <label class="font-bold font-montserrat text-sm w-fit whitespace-nowrap lg:flex block text-right">Upload Receipt</label>
                    <span class="flex mr-0 ml-3">
                      <i class="fa fa-cloud-upload text-2xl pr-2"></i>
                    </span>
                  </div>

                  <p class="text-xs text-center text-red-600" v-if="uploadReceiptBox">Upload files with sizes around KB only.</p>
                  <div class="mt-3 mb-14 w-fit mx-auto bg-green-800 shadow" v-if="uploadReceiptBox">
                    <div class="text-white">
                     
                      <input 
                        type="file" 
                        @change="uploadedFile" 
                        accept="image/*" capture
                        class="w-[200px]"
                      />
                    </div>
                    <div class="bg-white">
                      <img class="object-contain w-[200px]" :src="imagePreview" />
                    </div>
                  </div> -->


                 <div class="lg:pl-8">
                  <label for="uploadFile1"
      class="bg-white lg:w-[300px]  text-green-500 font-semibold text-base py-2 rounded max-w-md h-32 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-200 border-dashed mx-auto font-[sans-serif]">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-11 mb-2 fill-green-800" viewBox="0 0 32 32">
        <path
          d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
          data-original="#000000" />
        <path
          d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
          data-original="#000000" />
      </svg>
      Upload file

      <input type="file"  @change="uploadedFile" 
      accept="image/png, image/jpeg" id='uploadFile1' class="hidden" />
      <p class="text-xs font-medium text-green-800 mt-2 text-center w-11/12 mx-auto">File size should be less than 1 MB and should be in JPG or PNG format</p>
    </label>

    <div class="mt-3 mb-14 lg:w-fit mx-auto bg-green-800 shadow" v-if="imagePreview">
                   
                    <div class="bg-white">
                      <img class="object-contain lg:w-[200px]" :src="imagePreview" />
                    </div>
                    </div>

                 </div>

                 

                </div>
                <div class="w-full font-montserrat text-xs text-center text-red-600" v-if="pleaseEnterAllDetails">
                  Please Enter All Details!
                </div>
                <div @click="submitDonation" class="select-none cursor-pointer uppercase text-sm border border-green-900 hover:bg-white bg-green-900 
                text-white hover:text-green-900 lg:px-10 px-6 lg:py-1 py-2 mx-auto lg:w-fit mt-7 rounded-full block hover:font-bold font-montserrat text-center">
                    Submit
                  </div>
              </div>
            </div>
          </div>
          <div v-if="donationInfo.payment_method === 'pledge'">
            <div class="lg:mt-2 mt-3 lg:shadow-none shadow lg:p-0 p-3">
              <p class="w-11/12 whitespace-nowrap text-sm font-montserrat mb-1">2. Please fill out the Donation details</p>
              <div class="mx-auto w-full">
                <div class="lg:flex mb-2">
                  <label class="font-montserrat text-sm lg:font-bold text-green-800 lg:text-right  whitespace-nowrap lg:mb-0 mb-2 lg:static block">Donate To <span class="text-red-800">*</span>
                  </label>
                  <ul class="block text-xs font-montserrat lg:ml-2 lg:mt-1">
                    <li class="lg:flex lg:ml-2 lg:mb-1">
                      <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 1.0" id="s1" />
                      <label class="mx-1" for="s1">
                        <span class="font-bold">SI 1.0</span>
                        <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold lg:whitespace-nowrap cursor-pointer"> Reengineer the learning experience to foster learner engagement</span>
                      </label>
                    </li>
                    <li class="lg:flex lg:ml-2 lg:mb-1">
                      <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 2.0" id="s2" />
                      <label class="mx-1" for="s2">
                        <span class="font-bold">SI 2.0</span>
                        <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold cursor-pointer"> Nurture a community of lifelong learners</span>
                      </label>
                    </li>
                    <li class="lg:flex lg:ml-2 lg:mb-1">
                      <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 3.0" id="s3" />
                      <label class="mx-1" for="s3">
                        <span class="font-bold">SI 3.0</span>
                        <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold cursor-pointer"> Broaden participation in circles of Quality Management</span>
                      </label>
                    </li>
                    <li class="lg:flex lg:ml-2 lg:mb-1">
                      <input type="radio" class="w-3 h-3 mt-0.5" v-model="donationInfo.donate_to" value="Strategic Intent 4.0" id="s4" />
                      <label class="mx-1" for="s4">
                        <span class="font-bold">SI 4.0</span>
                        <span class="lg:flex block text-[10px] lg:ml-0 ml-4 hover:font-bold cursor-pointer"> Contribute to the building of a more sustainable community</span>
                      </label>
                    </li>
                  </ul>
                </div>
                <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                  <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap">Amount <span class="text-red-800">*</span>
                  </label>
                  <input min="1" type="number" class="text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block px-2" v-model="donationInfo.amount" placeholder="e.g 5000.00" />
                </div>
                <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                  <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap">Name <span class="text-red-800">*</span>
                  </label>
                  <input type="text" class="capitalize text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block px-2" v-model="donationInfo.name" placeholder="example: Juan Dela Cruz" />
                </div>
                <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                  <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap lg:-ml-3">Contact No. <span class="text-red-800">*</span>
                  </label>
                  <input type="tel" class="text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block lg:ml-3 px-2" maxlength="13" minlength="11" v-model="donationInfo.contact_number" placeholder="e.g +639001002004" />
                </div>
                <div class=" font-montserrat lg:mb-2 mb-3 lg:flex lg:items-center">
                  <label class="text-sm lg:font-bold text-green-800 w-2/12 text-right lg:mr-5 mr-2 whitespace-nowrap">Email <span class="text-red-800">*</span>
                  </label>
                  <input type="email" class="lowercase text-sm mr-2 lg:w-[290px] w-full border-b border-green-900 border-0 h-8 rounded-sm shadow lg:static block px-2" v-model="donationInfo.email" placeholder="e.g npc@lsu.edu.ph" />
                </div>
                <div class="w-full font-montserrat text-xs text-center text-red-600" v-if="pleaseEnterAllDetails">
                  Please Enter All Details!
                </div>
                <div @click="submitDonation" class="select-none cursor-pointer uppercase text-sm border border-green-900 hover:bg-white bg-green-900 
                text-white hover:text-green-900 lg:px-10 px-6 lg:py-1 py-2 mx-auto lg:w-fit mt-7 rounded-full block hover:font-bold font-montserrat text-center">
                    Submit
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div> -->

    <div class="my-5 w-11/12 mx-auto md:w-5/12 shadow-lg bg-white pb-5 lg:pt-0 pt-5 border-t border-gray-100" v-if="receiptBox">
          <div class="">
            <h1 class="flex items-center mx-auto w-fit">
            <span class="lg:w-fit w-16 lg:mx-0 py-3 pr-3 lg:pl-0">
              <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsuseal-mono.png" class="lg:w-[60px] w-auto lg:mx-0 mx-auto"/>
            </span>
            <span class="ml-1">
              <h1 class="lg:whitespace-nowrap uppercase text-green-800 font-bold text-3xl mt-1 font-hk-compression">la salle university</h1>
              <span class="lg:whitespace-nowrap  text-2xl font-bold font-hk-compression -mt-2 flex capitalize">support our mission</span>
            </span>
          </h1>
            <p class="font-monteserrat text-center pt-2 font-bold lg:text-xl text-sm font-montserrat">Please confirm your donation details</p>
            <div class="">
              <ul class="mx-auto w-full pt-5 font-montserrat text-xs">
                <li class=" mb-1 flex items-center">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px] whitespace-nowrap">Payment Method:</label>
                  <span class="w-full lg:text-[15px] text-xs capitalize">{{ donationInfo.payment_method }}</span>
                </li>
                <li class="flex mb-1">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">Donate to:</label>
                  <span class="w-full lg:text-[15px] text-xs capitalize">{{ donationInfo.donate_to }}</span>
                </li>
                <li class=" mb-1 flex items-center">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">Amount:</label>
                  <span class="w-full lg:text-[15px] text-xs uppercase">PHP {{ donationInfo.amount }}</span>
                </li>
                <li class=" mb-1 flex items-center">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">Name:</label>
                  <span class="w-full lg:text-[15px] text-xs capitalize">{{ donationInfo.name }}</span>
                </li>
                <li class=" mb-1 flex items-center">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">Contact No.:</label>
                  <span class="w-full lg:text-[15px] text-xs">{{ donationInfo.contact_number }}</span>
                </li>
                <li class=" mb-1 flex items-center">
                  <label class="font-bold text-green-800 lg:w-7/12 w-3/12 lg:pl-0 lg:ml-0 ml-2 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">Email:</label>
                  <span class="lg:w-full lg:text-[15px] text-xs lowercase lg:max-w-full max-w-[185px] sm:truncate">{{ donationInfo.email }}</span>
                </li>
                <li class=" mb-1 flex items-center" v-if="donationInfo.transaction_number !== ''">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">Transaction No.:</label>
                  <span class="w-full lg:text-[15px] text-xs">{{ donationInfo.transaction_number }}</span>
                </li>
                <li class=" mb-1 flex" v-if="donationInfo.receipt_url !== ''">
                  <label class="font-bold text-green-800 lg:w-7/12 w-5/12 text-right lg:mr-5 mr-3 lg:text-sm text-[8px]">BPI Receipt:</label>
                  <div class="w-full">
                    <div class="shadow-md w-fit px-3 py-3">
                      <img :src="imagePreview" class="w-[100px]"/>
                    </div>
                  </div>
                </li>
                <div class="mx-auto mt-14">
                  <!-- <div class="lg:px-32 flex items-center mt-5 mb-2">
                    <input type="checkbox" v-model="donationInfo.confirmation_approval" value="yes" id="confirmation" />
                    <label class="mx-2 lg:tracking-normal tracking-tighter lg:text-sm text-xs font-montserrat whitespace-nowrap" for="confirmation">I confirm that the details above are correct.</label>
                  </div> -->

                  
                  <!-- :class="privacyTextExpand ? '': 'sm:line-clamp-2'" -->
                  <!-- id="privacy_notice" -->
                  <div class="flex items-start lg:w-10/12 w-11/12 mx-auto">
                    <input type="checkbox" v-model="donationInfo.privacy_notice_approval" value="yes" class="mt-1"/>
                    <label class="select-none mx-2 lg:tracking-normal tracking-tighter text-[10px] font-montserrat leading-tight cursor-pointer hover:font-bold"
                      @click="privacyTextExpand = !privacyTextExpand"
                    for="privacy_notice">
                      By ticking the checkbox, I hereby acknowledge and certify that I have carefully read and understood the Terms and Conditions of the 
                      
                      <a href="/investiture/privacy" class="text-blue-700 hover:font-bold" target="_blank">Data Privacy Policy/Notice</a> of the La Salle University (LSU). 
                      By providing personal information to LSU,

                      <p v-if="privacyTextExpand"> I am confirming that the data is true and correct. I understand that LSU reserves the right to revise any decision made on the basis of the information I provided should the information be found to be untrue or incorrect. I likewise agree that any issue that may arise in connection with the processing of my personal information will be settled amicably with LSU before resorting to appropriate arbitration or court proceedings within the Philippine jurisdiction. Finally, I am providing my voluntary consent and authorization to LSU and its authorized representatives to lawfully process my data/information.</p>
                    </label>
                  </div>
                  
                </div>
              </ul>
             <div class="flex justify-between">
              <button class=" w-fit mx-auto cursor-pointer uppercase lg:text-sm text-xs border border-yellow-500 hover:bg-white bg-yellow-500 
                    select-none text-white hover:text-yellow-500 lg:px-5 px-5 lg:py-2 py-1 sm:mx-auto mt-10 rounded-full block hover:font-bold mb-10 font-montserrat" @click="backToDetailsBtn"> <i class="fa fa-pen lg:mr-3 mr-1"></i> Back 
              </button>


              <button 
              
           

               v-if="donationInfo.privacy_notice_approval"

              class=" w-fit mx-auto cursor-pointer uppercase lg:text-sm text-xs border border-green-900 hover:bg-white bg-green-900 
                    select-none text-white hover:text-green-900 lg:px-5 px-5 lg:py-2 py-1 sm:mx-auto mt-10 rounded-full block hover:font-bold mb-10 font-montserrat" @click="confirmationAndSendToEmailBtn"> Confirm <i class="fa fa-paper-plane lg:ml-3 ml-1"></i>
              </button>

              <button 
              
              v-else
              class="cursor-not-allowed w-fit mx-auto uppercase lg:text-sm text-xs   bg-gray-200 
                    select-none text-gray-900 lg:px-5 px-5 lg:py-2 py-1 sm:mx-auto mt-10 rounded-full block mb-10 font-montserrat"> Confirm 
                    <i class="fa fa-paper-plane lg:ml-3 ml-1"></i>
              </button>


             </div>
            </div>
            <div class="lg:justify-between lg:flex lg:items-center pt-10 px-5">
              <div>
                <p class="text-xs text-gray-400 font-montserrat lg:text-left text-center" v-if="donationInfo.usher_id !== ''">Usher ID: {{ donationInfo.usher_id }}</p>
                <p class="text-xs text-gray-400 lg:mr-14 font-montserrat lg:text-left text-center">Donation ID: {{ donationInfo.donation_id }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-400 lg:ml-14 font-montserrat lg:text-left text-center">Date: {{ donationInfo.date_time }}</p>
              </div>
            </div>
          </div>
        </div>
        <div v-if="thankYouMessage" class="lg:h-screen flex items-center">
          <div class="my-5 lg:w-6/12 lg:shadow-lg w-11/12 mx-auto bg-white text-center pt-10  mb-10 pb-10 px-5" >
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsuseal-mono.png" class="md:w-2/12 w-5/12 mx-auto mb-10" />
          <h2 class="text-green-900 font-hk-compression font-bolder lg:text-7xl text-5xl"> Thank you <br>for your support! </h2>
          <p class="text-green-800 font-montserrat lg:text-2xl text-sm pt-10"> Donation is successfully processed. </p>
          <p class="text-green-800 font-montserrat text-xs pt-5 lg:flex justify-center"> 
            <span class="lg:flex block">A copy of donation receipt</span>
            <span class="lg:flex block">is sent to the email provided.</span>  
          </p>
          <a href="/investiture" class="hover:text-green-800 font-montserrat text-sm mt-10 uppercase hover:font-bold hover:bg-white bg-green-900 border border-green-800 text-white cursor-pointer w-fit mx-auto px-10 py-1 block select-none rounded-3xl"> back to main page </a>
        </div>

        </div>

        <FooterInvestiture/>
  </div>
</template>
<style scoped>
  input[type='radio'] {
    color: #005715;
    outline: none;
    box-shadow: none;
  }

  input[type='checkbox'] {
    color: #005715;
    outline: none;
    box-shadow: none;
  }

  input[type="file"]::file-selector-button {
  border: 2px solid #006715;
  background-color: #006715;
  color: #fff;
  width: 100%;
  /* padding: 0.2em 0.4em;
  border-radius: 0.2em;
  transition: 1s; */
}

input[type="file"]::file-selector-button:hover {
  background-color: #006715;
  border: 2px solid #006715;
}
</style>