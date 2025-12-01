<script setup>
  import {
    ref
  } from 'vue';
  import {
    useUserStore
  } from "@/stores/user";
  const userStore = useUserStore();
  const endpoint = ref(userStore.mainDevServer);
  const donationLogs = ref(null)
  const donationLogsCash = ref(null)
  const donationLogsPledge = ref(null)
  const donationLogsBankTransfer = ref(null)
  const degreeCash = ref('')
  const degreePledge = ref('')
  const degreeBankTransfer = ref('')
  const degreeCashNumber = ref(0)
  const degreePledgeNumber = ref(0)
  const degreeBankTransferNumber = ref(0)
  const donationLogsSorted = ref()
  const donationLogsS1List = ref(null)


  const totalAmountCash = ref()
  const totalAmountPledge = ref()
  const totalAmountBankTranfer = ref()


  const percentTotalAmountS1 = ref()
  const percentTotalAmountS2 = ref()
  const percentTotalAmountS3 = ref()
  const percentTotalAmountS4 = ref()
  const percentTotalAmountGeneral = ref()



  const totalAmountS1 = ref(0)
  const totalAmountRoundedS1 = ref(0)
  const formatterS1 = new Intl.NumberFormat("en-US");
  const totalAmountRoundedFormattedS1 = ref()
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
  donationLogsS1List.value = donationLogs.value.filter(function(params) {
    return params.donate_to === 'Strategic Intent 1.0'
  })
  totalAmountS1.value = donationLogsS1List.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
  totalAmountRoundedS1.value = totalAmountS1.value.toFixed(2)
  totalAmountRoundedFormattedS1.value = formatterS1.format(totalAmountRoundedS1.value);




  const donationLogsS2List = ref(null)
  const totalAmountS2 = ref(0)
  const totalAmountRoundedS2 = ref(0)
  const formatterS2 = new Intl.NumberFormat("en-US");
  const totalAmountRoundedFormattedS2 = ref()
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
  donationLogsS2List.value = donationLogs.value.filter(function(params) {
    return params.donate_to === 'Strategic Intent 2.0'
  })
  totalAmountS2.value = donationLogsS2List.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
  totalAmountRoundedS2.value = totalAmountS2.value.toFixed(2)
  totalAmountRoundedFormattedS2.value = formatterS2.format(totalAmountRoundedS2.value);


  const donationLogsS3List = ref(null)
  const totalAmountS3 = ref(0)
  const totalAmountRoundedS3 = ref(0)
  const formatterS3 = new Intl.NumberFormat("en-US");
  const totalAmountRoundedFormattedS3 = ref()
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
  donationLogsS3List.value = donationLogs.value.filter(function(params) {
    return params.donate_to === 'Strategic Intent 3.0'
  })
  totalAmountS3.value = donationLogsS3List.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
  totalAmountRoundedS3.value = totalAmountS3.value.toFixed(2)
  totalAmountRoundedFormattedS3.value = formatterS3.format(totalAmountRoundedS3.value);



  const donationLogsS4List = ref(null)
  const totalAmountS4 = ref(0)
  const totalAmountRoundedS4 = ref(0)
  const formatterS4 = new Intl.NumberFormat("en-US");
  const totalAmountRoundedFormattedS4 = ref()
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
  donationLogsS4List.value = donationLogs.value.filter(function(params) {
    return params.donate_to === 'Strategic Intent 4.0'
  })
  totalAmountS4.value = donationLogsS4List.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
  totalAmountRoundedS4.value = totalAmountS4.value.toFixed(2)
  totalAmountRoundedFormattedS4.value = formatterS4.format(totalAmountRoundedS4.value);




  const donationLogsALL_SIList = ref(null)
  const totalAmountALL_SI = ref(0)
  const totalAmountRoundedALL_SI = ref(0)
  const formatterALL_SI = new Intl.NumberFormat("en-US");
  const totalAmountRoundedFormattedALL_SI = ref()
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
  donationLogsALL_SIList.value = donationLogs.value.filter(function(params) {
    return params.donate_to === 'All Strategic Intents'
  })
  totalAmountALL_SI.value = donationLogsALL_SIList.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
  totalAmountRoundedALL_SI.value = totalAmountALL_SI.value.toFixed(2)
  totalAmountRoundedFormattedALL_SI.value = formatterALL_SI.format(totalAmountRoundedALL_SI.value);



  const totalAmount = ref(0)
  const totalAmountRounded = ref(0)
  const formatter = new Intl.NumberFormat("en-US");
  const totalAmountRoundedFormatted = ref()
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
  totalAmount.value = donationLogs.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
  totalAmountRounded.value = totalAmount.value.toFixed(2)
  totalAmountRoundedFormatted.value = formatter.format(totalAmountRounded.value);



  onMounted(async () => {
    donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
    donationLogsSorted.value = donationLogs.value.sort((b, a) => a.amount - b.amount);
    console.log(donationLogsSorted.value)

    percentTotalAmountS1.value = ((totalAmountS1.value/totalAmount.value) * 100).toFixed(2)+'%'
    percentTotalAmountS2.value = ((totalAmountS2.value/totalAmount.value) * 100).toFixed(2)+'%'
    percentTotalAmountS3.value = ((totalAmountS3.value/totalAmount.value) * 100).toFixed(2)+'%'
    percentTotalAmountS4.value = ((totalAmountS4.value/totalAmount.value) * 100).toFixed(2)+'%'
    percentTotalAmountGeneral.value = ((totalAmountALL_SI.value/totalAmount.value) * 100).toFixed(2)+'%'


    generatePieChart()
  })



  const generatePieChart = () => {

    donationLogsCash.value = donationLogs.value.filter(function(params) {
      return params.payment_method === 'cash'
    })
    donationLogsPledge.value = donationLogs.value.filter(function(params) {
      return params.payment_method === 'pledge'
    })
    donationLogsBankTransfer.value = donationLogs.value.filter(function(params) {
      return params.payment_method === 'bank transfer'
    })
    console.log(donationLogsCash.value.length)
    console.log(donationLogsPledge.value.length)
    console.log(donationLogsBankTransfer.value.length)






    totalAmountCash.value = donationLogsCash.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
    totalAmountPledge.value = donationLogsPledge.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);
    totalAmountBankTranfer.value = donationLogsBankTransfer.value.map(item => item.amount).reduce((prev, curr) => prev + curr, 0);

    degreeCashNumber.value = ((totalAmountCash.value / totalAmount.value) * 100)
    degreePledgeNumber.value = ((totalAmountPledge.value / totalAmount.value) * 100)
    degreeBankTransferNumber.value = ((totalAmountBankTranfer.value / totalAmount.value) * 100)



    
    // degreeCashNumber.value = ((donationLogsCash.value.length / donationLogs.value.length) * 100)
    // degreePledgeNumber.value = ((donationLogsPledge.value.length / donationLogs.value.length) * 100)
    // degreeBankTransferNumber.value = ((donationLogsBankTransfer.value.length / donationLogs.value.length) * 100)




    degreeCash.value = (degreeCashNumber.value).toFixed(2) + '%'
    degreePledge.value = (degreePledgeNumber.value).toFixed(2) + '%'
    degreeBankTransfer.value = (degreeBankTransferNumber.value).toFixed(2) + '%'




    console.log(degreeCashNumber.value)
    console.log(degreePledgeNumber.value)
    console.log(degreeBankTransferNumber.value)

    console.log(degreeCash.value)
    console.log(degreePledge.value)
    console.log(degreeBankTransfer.value)
  }

  // (SI amount / total amount raised)*100 Ang formula

</script>
<template>
  <div class="relative font-montserrat">
    <Header />
    <div class="mb-7">
        <div class="relative">
          <Banner />
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
            class="align-top w-full h-36 object-none lg:hidden block"
          />
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1
              class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
            >
              Dashboard
            </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <ul
              class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
            >
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/donation" class="mr-1"> Donation </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/donation/dashboard" class="mr-1"> Dashboard </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
   
   
  
    <div class="lg:h-4/6 block lg:pb-10 bg-white">
      <div class="lg:shadow-lg w-11/12 mx-auto ">
        <!-- <div class="bg-green-900 text-white py-1">
          <h2 class="text-center uppercase py-1">Donation Dashboard</h2>
        </div> -->
        <div class="px-3 lg:mt-5 mb-5 shadow-md lg:w-fit mx-auto text-center py-3">
          <h2 class="font-bold text-green-800 mb-3">Total Amount Raised</h2>
          <p class="lg:text-3xl text-base font-bold tracking-widest">
            PHP {{totalAmountRoundedFormatted}}
          </p>
        </div>
        <div class="px-2 lg:flex gap-10">
          <!-- <Bar :data="chartData" :options="chartOptions" /> -->
          <!-- Line Graph -->
          <div class="lg:flex items-center w-full shadow">
            <div class="w-full">
              <h2 class="text-center mt-4 font-bold uppercase lg:text-sm text-xs lg:py-0 pt-4">Donations per Strategic Intent</h2>
              <ul class="lg:py-10 pt-3 lg:pb-10 pb-7 lg:px-5 px-3 w-full lg:text-sm text-xs">
                <li class="lg:flex w-full items-center  lg:mb-7 mb-3">
                  <span class="w-[60px] whitespace-nowrap text-right lg:text-sm text-xs mr-3 font-bold">S.I. 1:</span>
                  <span class="border shadow-lg flex w-full items-center">
                    <span class="bg-green-400 lg:h-10 h-5 flex items-center text-center whitespace-nowrap  border-green-300 lg:w-[120px]  
                    lg:text-sm text-[10px] lg:px-3 px-1 text-gray-600"> PHP {{ totalAmountS1 }} </span>
                    <span class=" flex w-full items-center">
                      <span class="bg-green-400 lg:h-10 h-5 flex items-center text-center  whitespace-nowrap px-3 text-gray-600 percentTotalAmountS1"></span>
                      <span class="lg:ml-2 ml-auto font-bold whitespace-nowrap px-1 w-fit"> {{percentTotalAmountS1}}</span>

                    </span>
                  </span>
                </li>
                <li class="lg:flex w-full items-center  lg:mb-7 mb-3">
                  <span class="w-[60px] whitespace-nowrap text-right lg:text-sm text-xs mr-3 font-bold">S.I. 2:</span>
                  <span class="border shadow-lg flex w-full items-center">
                    <span class="bg-green-500 lg:h-10 h-5 flex items-center text-center whitespace-nowrap  border-green-300 lg:w-[120px]  
                    lg:text-sm text-[10px] lg:px-3 px-1 text-gray-700"> PHP {{ totalAmountS2 }}</span>
                    <span class=" flex w-full items-center">
                      <span class="bg-green-500 lg:h-10 h-5 flex items-center text-center whitespace-nowrap  px-3 text-gray-700 percentTotalAmountS2"></span>
                      <span class="lg:ml-2 ml-auto font-bold whitespace-nowrap px-1 w-fit"> {{percentTotalAmountS2}}</span>
                    </span>
                  </span>
                </li>
                <li class="lg:flex w-full items-center  lg:mb-7 mb-3">
                  <span class="w-[60px] whitespace-nowrap text-right lg:text-sm text-xs mr-3 font-bold">S.I. 3:</span>
                  <span class="border shadow-lg flex w-full items-center">
                    <span class="bg-green-600 lg:h-10 h-5 flex items-center text-center whitespace-nowrap  border-green-300 lg:w-[120px]  
                    lg:text-sm text-[10px] lg:px-3 px-1 text-white"> PHP {{ totalAmountS3 }}</span>
                    <span class=" flex w-full items-center">
                      <span class="bg-green-600 lg:h-10 h-5 flex items-center text-center whitespace-nowrap   px-3 text-white percentTotalAmountS3"></span>
                      <span class="lg:ml-2 ml-auto font-bold whitespace-nowrap px-1 w-fit"> {{percentTotalAmountS3}}</span>
                    </span>
                  </span>
                </li>
                <li class="lg:flex w-full items-center  lg:mb-7 mb-3">
                  <span class="w-[60px] whitespace-nowrap text-right lg:text-sm text-xs mr-3 font-bold">S.I. 4:</span>
                  <span class="border shadow-lg flex w-full items-center">
                    <span class="bg-green-800 lg:h-10 h-5 flex items-center text-center whitespace-nowrap  border-green-300 lg:w-[120px]  
                    lg:text-sm text-[10px] lg:px-3 px-1 text-white"> PHP {{ totalAmountS4 }}</span>
                    <span class=" flex w-full items-center">
                      <span class="bg-green-800 lg:h-10 h-5 flex items-center text-center whitespace-nowrap   px-3 text-white percentTotalAmountS4"></span>
                      <span class="lg:ml-2 ml-auto font-bold whitespace-nowrap px-1 w-fit"> {{percentTotalAmountS4}}</span>
                    </span>
                  </span>
                </li>
                <li class="lg:flex w-full items-center  lg:mb-7 mb-3">
                  <span class="w-[60px] whitespace-nowrap text-right lg:text-sm text-xs mr-3 font-bold">General:</span>
                  <span class="border shadow-lg flex w-full items-center">
                    <span class="bg-green-950 lg:h-10 h-5 flex items-center text-center whitespace-nowrap  border-green-300 lg:w-[120px]  
                    lg:text-sm text-[10px] lg:px-3 px-1 text-white"> PHP {{ totalAmountALL_SI }}</span>
                    <span class=" flex w-full items-center">
                      <span class="bg-green-950 lg:h-10 h-5 flex items-center text-center whitespace-nowrap px-3 text-white percentTotalAmountGeneral"></span>
                      <span class="lg:ml-2 ml-auto font-bold whitespace-nowrap px-1 w-fit"> {{percentTotalAmountGeneral}}</span>
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <!-- Pie Chart -->
          <div class="w-full shadow flex items-center">
            <div class="w-full">
              <h2 class="text-center mt-5 font-bold uppercase lg:text-sm text-xs">Donations per Payment Mode</h2>
              <div class="w-fit mx-auto lg:mt-7 mt-5">
                <div class="piechart border-3 border-black"></div>
                <!-- {{ degreeCash }}
                {{ degreePledge }}
                {{ degreeBankTransfer }} -->
              </div>
              <div class="w-fit mx-auto mt-7 mb-5">
                <!-- <div class="flex"><div class="w-[200px]">
                    Cash
                </div><div class="  " v-if="donationLogsCash">{{ donationLogsCash.length }} Total</div></div> -->
                <div class="lg:flex mb-3">
                  <div class="w-[180px] lg:text-sm text-xs text-gray-100 px-2 bg-[#0d441a] font-bold" 
                  v-if="donationLogsCash"> 
                    
                    Cash ({{ donationLogsCash.length }}) </div>
                  <div class="lg:text-sm text-xs lg:ml-3 ml-2 flex" v-if="donationLogsCash">
                 
                    <span class="w-[120px]">PHP {{ totalAmountCash }}</span> :  {{ ((totalAmountCash / totalAmount) * 100).toFixed(2) }} %</div>
                </div>
                <div class="lg:flex mb-3">
                  <div class="w-[180px] lg:text-sm text-xs text-gray-100 px-2 bg-[#128db6] font-bold" 
                  v-if="donationLogsPledge"> 
                  Pledge ({{ donationLogsPledge.length }}) </div>
                  <div class="lg:text-sm text-xs lg:ml-3 ml-2 flex" v-if="donationLogsPledge">
                         <span class="w-[120px]">PHP {{ totalAmountPledge }}</span>  :  {{ ((totalAmountPledge / totalAmount) * 100).toFixed(2)}} %</div>
                </div>
                <div class="lg:flex mb-3">
                  <div class="w-[180px] lg:text-sm text-xs text-gray-100 px-2 bg-[#ffa500] font-bold"
                  v-if="donationLogsBankTransfer"> 
                    Bank Transfer ({{ donationLogsBankTransfer.length }}) </div>
                  <div class="lg:text-sm text-xs lg:ml-3 ml-2 flex" v-if="donationLogsBankTransfer">
                     <span class="w-[120px]">PHP {{ totalAmountBankTranfer }}</span>  :  {{ ((totalAmountBankTranfer / totalAmount) * 100).toFixed(2) }} % </div>
                </div>
                <div class="lg:flex mb-3">
                  <div class="w-[180px] lg:text-sm text-xs font-bold text-gray-700 lg:text-left text-center" v-if="donationLogs"> 
                    
                    Number of Donors ({{ donationLogs.length }}) </div>
                  <!-- <div class="lg:text-sm text-xs lg:ml-3 ml-2 flex" v-if="donationLogs">{{ donationLogs.length }}</div> -->
                      <!-- <div class="lg:text-sm text-xs lg:ml-3 ml-2 flex">
                        
                        <span class="w-[120px]">PHP {{ totalAmount }}</span>
                        : 100% </div> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:w-11/12 mx-auto lg:py-10 py-5 lg:text-sm text-xs">
          <h2 class="text-center bg-green-800 text-white uppercase py-2">Top Donors</h2>
          <div class="w-full shadow-lg">
            <ul>
              <li class="flex items-center p-1 bg-gray-300  font-bold text-green-800">
                <span class="lg:w-44 w-32 text-center">Top</span>
                <span class="lg:w-full w-8/12 lg:text-center">Name</span>
                <span class="w-full text-center">Amount</span>
                <span class="w-full text-center px-1">Strategic Intent</span>
              </li>
              <div v-if="donationLogsSorted">
                <li v-for="(j,i) in donationLogsSorted.slice(0, 5)" :key="i" class="flex items-center border-b p-1" :class="i % 2 === 1 ? 'bg-gray-50':''">
                  <span class="lg:w-44 w-32 text-center">{{ i + 1}}</span>
                  <span class="lg:w-full w-8/12 lg:text-center capitalize">{{ j.name.slice(0, 3) }}*****</span>
                  <span class="w-full text-center">{{ j.amount }}</span>
                  <span class="w-full text-center px-1 md:whitespace-nowrap">{{ j.donate_to }}</span>
                </li>
              </div>
              <!-- <li class="flex mt-1 mb-2 border-b py-2"><span class="w-full text-center">1</span><span class="w-full text-center">1000</span><span class="w-full text-center">SI 2.0</span></li> -->
            </ul>
          </div>
        </div>
      </div>
    </div>
    <a href="/donation/box">
     <InvestitureDonationBox/>
    </a>
  
    <Footer />
  </div>
</template>
<style scoped>
  .piechart {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(#0d441a 0% v-bind(degreeCash),
        #128db6 v-bind(degreeCash) calc(v-bind(degreePledge) + v-bind(degreeCash)),
        #ffa500 calc(v-bind(degreePledge) + v-bind(degreeCash)));
  }

  .percentTotalAmountS1 {
    width: v-bind(percentTotalAmountS1);
  }
  .percentTotalAmountS2 {
    width: v-bind(percentTotalAmountS2);
  }
  .percentTotalAmountS3 {
    width: v-bind(percentTotalAmountS3);
  }
  .percentTotalAmountS4 {
    width: v-bind(percentTotalAmountS4);
  }
  .percentTotalAmountGeneral {
    width: v-bind(percentTotalAmountGeneral);
  }
</style>