<script setup>
  import {
    useUserStore
  } from "@/stores/user";
  import moment from "moment";
  const userStore = useUserStore();
  import _ from "lodash";
  const endpoint = ref(userStore.mainDevServer);
  const listItems = await $fetch(endpoint.value + "/api/drs/list").catch((error) => error.data) || 0;
  const searchInput = ref('');
  const filteredData = ref();
  const notFoundAlert = ref(false)
  const detailsBtn = ref(false)
  const getData = () => {
    let trackingID = searchInput.value
    filteredData.value = null
    detailsBtn.value = false
    setTimeout(() => {
      searchInput.value = ''
      if (trackingID.length === 12) {
        filteredData.value = listItems.filter((params) => {
          if (params.tracking_id === trackingID) {
            return params.tracking_id === trackingID
          }
        });
      }
    }, 500)
  }
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg" class="align-top w-full h-auto lg:object-fill lg:block hidden" />
        <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/enrollment/enrollmentbg-mobile-lower-size.png" class="align-top w-full min-h-40 pt-12 lg:hidden block" />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="lg:block hidden font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"> DRS Track </h1>
        </div>
         <div class="shadow-lg text-green-700">
          <div class="lg:w-11/12 mx-auto lg:flex justify-between">
            <div class="flex capitalize text-xs pt-2.5 pb-2.5 lg:border-b-0 border-b lg:px-0 px-5">
              <div>
                <a href="/" class="mr-2 hover:underline">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/drs" class="mx-2 hover:underline">Document Review Sheet</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/drs/track" class="mx-2 hover:underline">Track</a>
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white lg:gap-x-0 gap-x-3 lg:py-0 py-2 lg:px-0 px-5 bg-white">
              <div class="hover:bg-green-800 shadow-sm border bg-white hover:text-white 
                text-green-800 px-3 h-full flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full border-r">
                <a href="/drs/track" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-universal-access" aria-hidden="true"></i>
                  <span class="ml-3">Track</span>
                </a>
              </div>
              <div class="hover:bg-green-800 shadow-sm border bg-white hover:text-white 
                text-green-800 px-3 h-full flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full">
                <a href="/drs/login" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-user " aria-hidden="true"></i>
                  <span class="ml-3">Admin Login</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div>
        <div class=" border-t-2 border-green-700 shadow-lg lg:my-5 my-3 lg:pb-10 w-11/12 mx-auto ">
          <div class="">
            <h2 class="lg:text-base text-xs px-10 uppercase py-2 font-bold bg-green-900 text-white text-center">
              <i class="fa fa-certificate text-white mr-2"></i> DRS Tracker
            </h2>
          </div>
          <div class="">
            <div class="lg:p-5 p-2">
              <div class="lg:flex">
                <div class="flex w-fit shadow mx-auto my-3 text-center lg:rounded-lg rounded-md">
                  <input class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 lg:rounded-tl-md lg:rounded-bl-md rounded-tl-md rounded-bl-md text-xs" placeholder="Transaction ID" v-model="searchInput" required maxlength="18" />
                  <button @click="getData()" class="lg:px-5 px-2 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 
                            border-4 border-green-900 whitespace-nowrap lg:rounded-tr-lg lg:rounded-br-lg rounded-tr-md rounded-br-md lg:text-lg text-xs">
                    <i class="fa fa-search"></i> Track </button>
                </div>
              </div>
              <div v-if="notFoundAlert" class="lg:text-sm text-xs text-gray-800 text-center mt-10 mb-5 py-2 px-4 rounded-sm shadow lg:w-6/12 mx-auto"> Can't Find Tracking ID! </div>
            </div>
          </div>
          <div> 
                  
       <div v-for="(j,i) in filteredData" :key="i">
          <div class="w-full">
            <div>
              <div class="border-2 border-gray-300 shadow-lg mx-auto w-11/12">
                <div class="">
                  <h2 class="lg:text-base text-xs px-10 uppercase py-2 font-bold text-green-900 text-center border-b bg-gray"> Document Review Sheet
                    
                   
                  </h2>


                  <div class="mx-auto w-fit text-center">
                    
                    <!-- <span class="font-light text-xs  block px-5">
                      {{ j.document_code }} </span>  -->

                      <span class="text-xs  block px-5 my-2 font-bold">
                        {{ j.tracking_id }} </span> 
                  </div>
                  
                  <div class="px-2 pb-2 gap-3">
                    <div class="w-full lg:mb-0 mb-1">
                      <div class="w-full gap-3">
                        <div class="gap-3 w-full">
                          <div class="gap-3 lg:mb-2 w-full mx-auto border p-2">
                            <div class="lg:gap-x-2 gap-x-1 w-full">
                              <div class="lg:flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit lg:ml-auto lg:pr-5 pr-2"> Originating Office 
                                  </div>
                                </label>
                               
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                  {{ j.originating_office }}
                                </div> 

                              </div>
                              <div class="lg:flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit lg:ml-auto lg:pr-5 pr-2"> Email 
                                  </div>
                                </label>
                               
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                 {{ j.originating_email }}
                               </div> 

                              </div>
                              <div class="lg:flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit lg:ml-auto lg:pr-5 pr-2"> Document Title 
                                  </div>
                                </label>
                               
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                 {{ j.document_title }}
                               </div>

                              </div>
                              <div class="lg:flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit lg:ml-auto lg:pr-5 pr-2"> Document Type 
                                  </div>
                                </label>
                               
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                 {{ j.document_type }}
                               </div>

                              </div>
                              <div class="lg:flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit lg:ml-auto lg:pr-5 pr-2"> Status 
                                  </div>
                                </label>
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                 {{ j.status }}
                               </div>



                              </div>
                              <div class="lg:flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit lg:ml-auto lg:pr-5 pr-2"> Date Submitted
                                  </div>
                                </label>
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                 {{ j.schedule }}
                               </div>



                              </div>
                              <!-- <div class="flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit ml-auto lg:pr-5 pr-2"> Purpose 
                                  </div>
                                </label>

                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                 
                                 {{ j.purpose }}
                               </div>
                                
                              </div> -->
                              <!-- <div class="flex items-center w-full mb-2">
                                <label class="lg:text-xs text-[10px] text-gray-900   whitespace-nowrap lg:w-8/12 w-6/12">
                                  <div class="w-fit ml-auto lg:pr-5 pr-2"> Reference Document
                                  </div>
                                </label>
                               
                                <div class="w-full font-bold lg:text-sm text-xs"> 
                                  <a :href="j.document_attachment" class="flex px-2 py-2 lg:w-fit w-full border-t-0 border-x-0 shadow-lg rounded-sm h-8 text-xs" > 
                                  <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/Google_Drive.png" 
                                  class="h-5 w-5 mr-3" /> {{j.document_attachment}}
                                </a>
                                </div>
                              
                              </div> -->
                            </div>
                          </div>
                          <div class="w-fit mx-auto my-5 lg:text-sm text-xs">
                            <div class="mx-auto w-fit font-bold"> 
                                 
                              {{j.originating_firstname}}  {{j.originating_lastname}}
                            </div>
                            <div class="border-t-2 border-gray-100 text-center px-5">Originator’s Printed Name</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div class="lg:gap-x-2 gap-x-1 w-full border lg:px-3 px-6 py-3 my-5">
                      <div class="w-full">
                      
                        <div class="lg:flex gap-x-3">
                          <div class="w-full mb-2 block" v-if="j.other_comments_remarks">
                           
                            <div class="text-center font-bold lg:text-sm text-[10px]"> 
                              {{ j.other_comments_remarks }}
                            </div>
                            <label class=" text-gray-900 w-fit mx-auto block lg:text-sm text-[10px]"> Other Comment and Remarks 
                            </label>
                          </div>
                          <div class="w-full mb-2 block">
                         
                            <div class="text-center font-bold lg:text-sm text-[10px]"> 
                              {{ j.document_code }}
                            </div>
                            <label class=" text-gray-900 w-fit mx-auto block lg:text-sm text-[10px]"> Document Code 
                            </label>
                          </div>
                          <div class="w-full mb-2 block" v-if="j.effectivity_date">
                         
                             <div class="text-center font-bold lg:text-sm text-[10px]"> 
                              {{ moment(j.effectivity_date).format('MMMM Do YYYY, h:mm:ss a') }}

                              
                            </div>

                            <label class=" text-gray-900 w-fit mx-auto block lg:text-sm text-[10px]"> Date Checked 
                            </label>
                          </div>
                          <div class="w-full mb-2 block" v-if="j.rmo_name">
                           
                             <div class="text-center font-bold lg:text-sm text-[10px]"> 
                              {{ j.rmo_name }}
                            </div>
                            <label class=" text-gray-900 w-fit mx-auto block lg:text-sm text-[10px]"> Records Management Officer (RMO) 
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  <div class="p-2">
<div class="lg:flex"> 
  <div class="lg:gap-x-2 gap-x-1 w-full lg:px-3 px-6 py-3 my-5">
                      <div class="lg:w-full mb-2 block" :class="j.reviewed_by_action === 'Approved' ? 'text-green-600':''">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 mx-auto w-fit block"> Reviewed By 
                        </label>
                        <div class="lg:w-fit mx-auto text-center">
                       

                          <div class="font-bold lg:text-sm text-[10px]" v-if="j.reviewed_by_action === 'Approved'">
                            (SGD)
                          </div>
                          <div class="font-bold lg:text-sm text-[10px]" v-else>
                            ---
                          </div>



                          
                          <div class="font-bold lg:text-sm text-[10px]">
                            {{ j.reviewed_by_name }}
                          </div>
                          <div class="border-t-2 border-gray-100 text-center px-5 lg:text-sm text-[10px]">{{ j.reviewed_by_designation }}</div>
                        </div>
                      </div>
                     
                      <div class="w-full mb-2 block text-center text-xs" v-if="j.reviewed_by_remarks">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Comments or Remarks 
                        </label>
                        <div class="">
                          {{ j.reviewed_by_remarks }}
                        </div>
                      </div>
                    </div>

                    <div class="lg:gap-x-2 gap-x-1 w-full lg:px-3 px-6 py-3 my-5">
                     


                      <div class="lg:w-full mb-2 block" :class="j.verified_by_action === 'Approved' ? 'text-green-600':''">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 mx-auto w-fit block"> Verified By 
                        </label>
                        <div class="lg:w-fit mx-auto text-center">
                          <div class="font-bold lg:text-sm text-[10px]" v-if="j.verified_by_action === 'Approved'">
                            (SGD)
                          </div>
                          <div class="font-bold lg:text-sm text-[10px]" v-else>
                            ---
                          </div>
                          <div class="font-bold lg:text-sm text-[10px]">
                            {{ j.verified_by_name }}
                          </div>
                          <div class="border-t-2 border-gray-100 text-center px-5 lg:text-sm text-[10px]">{{ j.verified_by_designation }}</div>
                        </div>
                      </div>
                      
                    
                      <div class="w-full mb-2 block text-center text-xs" v-if="j.verified_by_remarks">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Comments or Remarks 
                        </label>
                        <div class="">
                          {{ j.verified_by_remarks }}
                        </div>
                      </div>
                    </div>


                    <div class="lg:gap-x-2 gap-x-1 w-full lg:px-3 px-6 py-3 my-5">
                      <div class="lg:w-full mb-2 block" :class="j.approved_by_action === 'Approved' ? 'text-green-600':''">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 mx-auto w-fit block"> Approved By 
                        </label>
                        <div class="lg:w-fit mx-auto text-center">
                    

                          <div class="font-bold lg:text-sm text-[10px]" v-if="j.approved_by_action === 'Approved'">
                            (SGD)
                          </div>
                          <div class="font-bold lg:text-sm text-[10px]" v-else>
                            ---
                          </div>




                          <div class="font-bold lg:text-sm text-[10px]">
                            {{ j.approved_by_name }}
                          </div>
                          <div class="border-t-2 border-gray-100 text-center px-5 lg:text-sm text-[10px]">{{ j.approved_by_designation }}</div>
                        </div>
                      </div>
                    
                      <div class="w-full mb-2 block text-center text-xs" v-if="j.approved_by_remarks">
                        <label class="lg:text-xs text-[10px] text-gray-900 pb-2 font-bold"> Comments or Remarks 
                        </label>
                        <div class="">
                          {{ j.approved_by_remarks }}
                        </div>
                      </div>
                    </div>

</div>

            
         
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          </div>
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
</style>