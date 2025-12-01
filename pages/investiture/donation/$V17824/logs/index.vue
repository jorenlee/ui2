<script setup>
  import {
    useUserStore
  } from "@/stores/user";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const donationLogs = ref(null)

onMounted(async () => {
  donationLogs.value = await $fetch(endpoint.value + "/api/investiture/list/").catch((error) => error.data);
})
</script>
<template>
  <div class="relative font-montserrat">
    <div class="lg:flex w-full mb-5 fixed bg-white z-10">
      <NuxtLink to="/">
          <h1 class="lg:static flex items-center lg:mx-auto mx-3 lg:w-fit lg:px-8">
            <span class="lg:w-fit w-16 lg:mx-0 py-3 pr-3 lg:pl-0">
              <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsuseal-mono.png" class="lg:w-[60px] w-auto lg:mx-0 mx-auto"/>
            </span>
            <span class="ml-1">
              <h1 class="lg:whitespace-nowrap uppercase text-green-800 font-bold text-3xl mt-1 font-hk-compression">la salle university</h1>
              <span class="lg:whitespace-nowrap  text-2xl font-bold font-hk-compression -mt-2 flex capitalize">support our mission</span>
            </span>
          </h1>
        </NuxtLink>
      <div class="lg:py-3 lg:bg-white bg-green-900 ml-auto lg:mr-5">
        <ul class="flex text-center justify-between lg:mt-2.5">
          <NuxtLink to="/">
            <li class="lg:text-green-800 text-white py-2 lg:text-base mx-5 text-xs lg:py-5 text-center hover:font-bold hover:underline cursor-pointer static whitespace-nowrap font-montserrat">Home </li>
          </NuxtLink>
          <NuxtLink to="/investiture">
            <li class="lg:text-green-800 text-white py-2 lg:text-base mx-5 text-xs lg:py-5 text-center hover:font-bold hover:underline cursor-pointer static whitespace-nowrap font-montserrat">Vision </li>
          </NuxtLink>
          <NuxtLink to="/investiture/donation/dashboard">
            <li class="lg:text-green-800 text-white py-2 lg:text-base mx-5 text-xs lg:py-5 text-center hover:font-bold hover:underline cursor-pointer static whitespace-nowrap font-montserrat">Dashboard </li>
          </NuxtLink>
        </ul>
      </div>
    </div>
    <div class="lg:h-4/6 block lg:pt-28 pt-[140px] lg:pb-10 bg-white ">
        <div class="bg-green-900 text-white py-1 mx-3">
                    <h2 class="text-center">Donation Log</h2>
                    
                </div>
                <div  class="px-3 lg:mb-5 lg:w-fit w-11/12 mx-auto text-center py-3 shadow-lg">
                    <h2 class="font-bold text-green-800 text-sm">Total Amount <TotalDonationNumberOnly/></h2>
                </div>
        <div class="px-3 shadow-lg lg:flex pb-10 gap-3">
            <!-- <div class="lg:w-[170px] px-3 shadow">
                <h2 class="font-black text-center uppercase mb-5">Filter</h2>
                <div  class="">
                    <h2 class="font-bold text-green-800 mb-3 whitespace-nowrap">Payment Mode</h2>
                    <ul class="text-xs">
                        <li class="mb-2">Cash</li>
                        <li class="mb-2">Bank Transfer</li>
                        <li class="mb-2">Pledge</li>
                        <li class="mb-2">All</li>
                    </ul>
                </div>
                <div  class="mt-10 mb-5">
                    <h2 class="font-bold text-green-800 mb-3">Project</h2>
                    <ul class="text-xs">
                        <li class="mb-2">SI 1.0</li>
                        <li class="mb-2">SI 2.0</li>
                        <li class="mb-2">SI 3.0</li>
                        <li class="mb-2">SI 4.0</li>
                        <li class="mb-2">All</li>
                    </ul>
                </div>

              
            </div> -->
            <div class="shadow w-full bg-white">
                <div class=" lg:w-full">
                    <ul class="flex  bg-green-900 text-white lg:w-full lg:overflow-auto overflow-x-scroll uppercase text-[10px]">
                        <li class="lg:w-1/12  p-2">Payment Mode</li>
                        <li class="lg:w-1/12  p-2">Donated To</li>
                        <li class="lg:w-1/12  p-2">Amount</li>
                        <li class="lg:w-1/12  p-2">Name</li>
                        <li class="lg:w-1/12  p-2">Contact No.</li>
                        <li class="lg:w-1/12  p-2">Email</li>
                        <li class="lg:w-1/12  p-2">Transaction No.</li>
                        <li class="lg:w-1/12  p-2">Receipt</li>
                        <li class="lg:w-1/12  p-2">Donation ID</li>
                        <li class="lg:w-1/12  p-2">Usher ID</li>
                        <li class="lg:w-1/12  p-2">Date Time</li>
                    </ul>
                    <div class="hover:bg-gray-50 w-full lg:overflow-auto overflow-x-scroll" v-for="(j,i) in donationLogs" :key="i" >
                        <ul class="flex w-full">
                            <li class="text-left  lg:w-1/12  text-xs p-2 uppercase">
                                


                               <span :class="
                                [j.payment_method  === 'cash' ? 'font-black text-green-500 ' : ''],
                                [j.payment_method  === 'bank transfer' ? 'text-orange-300  py-1 block ' : ''],
                                [j.payment_method  === 'pledge' ? ' text-blue-600' : ''],
                                [j.payment_method  === 'all' ? 'text-gray-700 ' : '']
                              " class="font-black">

                                {{ j.payment_method }}
                               </span>
                            
                            
                            </li>
                            <li class="text-left lg:w-1/12  text-xs p-2"
                            >{{ j.donate_to }}</li>
                            <li class="text-left lg:w-1/12  text-xs p-2">{{ j.amount }}</li>
                            <li class="text-left lg:w-1/12  text-xs p-2 uppercase">{{ j.name }}</li>
                            <li class="text-left lg:w-1/12  text-xs p-2">
                              <!-- {{ j.contact_number }} --> ...
                            </li>
                            <li class="text-left lg:w-1/12 min-w-[50px]  text-xs p-2">
                              <!-- overflow-x-scroll -->
                                <!-- {{ j.email }} --> ...
                                
                            </li>
                            <li class="text-left lg:w-1/12  text-xs p-2">
                            <span v-if="j.transaction_number">
                              <!-- {{ j.transaction_number }} --> ...
                            </span>    
                            <span v-else>
                                N/A
                            </span>
                            </li>
                            <li class="text-left lg:w-1/12  text-xs lg:p-2 flex">
                               <a :href="j.receipt_url" download class="lg:w-10 lg:h-10 w-[100px] h-[100px] border lg:rounded-full">
                                <img :src="j.receipt_url" class="lg:w-10 lg:h-10 w-[100px] h-[100px] border lg:rounded-full"/>
                               </a>
                            </li>
                            <li class="text-left lg:w-1/12  text-xs p-2">{{ j.donation_id }}</li>
                            <li class="text-left lg:w-1/12  text-xs p-2">{{ j.usher_id }}</li>
                            <li class="text-left lg:w-1/12  text-xs p-2">{{ j.date_time }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- <a href="/investiture/donation">
     <InvestitureDonationBox/>
    </a> -->
    <FooterInvestiture/>
  </div>
</template>
<style scoped></style>