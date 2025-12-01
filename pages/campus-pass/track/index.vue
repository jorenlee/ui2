<script setup>
import { useUserStore } from "@/stores/user";
import moment from "moment";
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);
const listItems =
  (await $fetch(endpoint.value + "/api/campus-pass/list").catch(
    (error) => error.data
  )) || 0;
const searchInput = ref("");
const filteredData = ref();
const notFoundAlert = ref(false);
const detailsBtn = ref(false);
const getData = () => {
  let trackingID = searchInput.value;
  filteredData.value = null;
  detailsBtn.value = false;
  setTimeout(() => {
    searchInput.value = "";
    if (trackingID.length === 18) {
      filteredData.value = listItems.filter((params) => {
        if (params.tracking_id === trackingID) {
          return params.tracking_id === trackingID;
        }
        // else {
        //   notFoundAlert.value = true;
        //   console.log('Not Found!')
        //   setTimeout(() => {
        //     notFoundAlert.value = false
        //   }, 5000)
        // }
      });
    }
  }, 500);
};
const info = ref({
  incharge_firstname: "",
  incharge_middlename: "",
  incharge_lastname: "",
  incharge_contact_email: "",
  incharge_contact_number: "",
  type_of_access: ["Urgent Access"],
  schedule: moment().format("MMMM Do YYYY, h:mm:ss a"),
  approved_activities_link: "",
  approved_gso_docs_link: "",
  attendees: "Individual",
  name_list: [
    {
      firstname: "",
      middlename: "",
      lastname: "",
      email: "",
    },
  ],
  approval_status: "pending",
  remarks: "",
  tracking_id: "LSUCP" + moment().valueOf(),
});
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
          class="align-top w-full h-auto lg:object-fill lg:block hidden"
        />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/enrollment/enrollmentbg-mobile-lower-size.png"
          class="align-top w-full min-h-40 pt-12 lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="lg:block hidden font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Campus Pass
          </h1>
        </div>
        <div class="shadow-lg">
          <div class="w-11/12 mx-auto flex justify-between">
            <ul
              class="flex lasalle-green-text capitalize text-xs pt-2.5 pb-2.5"
            >
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/campus-pass" class="mr-1"> Campus Pass </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/campus-pass/track" class="mr-1"> Track </a>
              </li>
            </ul>
            <ul class="flex hover:text-green-800 text-white">
              <li class="px-3 h-full flex items-center capitalize text-xs">
                <a href="/campus-pass/login" class="flex items-center">
                  <!-- <span class="">Admin Login</span> -->
                </a>
              </li>
              <li
                class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-3 h-full flex items-center capitalize text-xs"
              >
                <a href="/campus-pass/login" class="flex items-center">
                  <i class="fa fa-user" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div>
        <div
          class="border-t-2 border-green-700 shadow-lg lg:my-5 my-3 lg:pb-10 w-11/12 mx-auto"
        >
          <div class="">
            <h2
              class="lg:text-base text-xs px-10 uppercase py-2 font-bold bg-green-900 text-white text-center"
            >
              <i class="fa fa-certificate text-white mr-2"></i> Campus Pass
              Tracker
            </h2>
          </div>
          <div class="">
            <div class="lg:p-5 p-2">
              <!-- <p class="text-center mt-10 text-green-900 text-sm lg:px-4 mx-auto"><span class="text-gray-600">If you need any further assistance or have any more questions, feel free to email at 
                    <span class="font-bold">admissions@lsu.edu.ph</span>. Thank you! </span></p> -->
              <div class="lg:flex">
                <div
                  class="flex w-fit shadow mx-auto lg:my-7 my-3 text-center lg:rounded-lg rounded-md"
                >
                  <input
                    class="py-1 pl-2 pr-2 uppercase w-full border-2 border-green-700 lg:rounded-tl-lg lg:rounded-bl-lg rounded-tl-md rounded-bl-md lg:text-sm text-xs"
                    placeholder="Transaction ID"
                    v-model="searchInput"
                    required
                    maxlength="18"
                  />
                  <button
                    @click="getData()"
                    class="lg:px-5 px-2 bg-green-900 text-white cursor-pointer hover:bg-white hover:text-green-900 border-4 border-green-900 whitespace-nowrap lg:rounded-tr-lg lg:rounded-br-lg rounded-tr-md rounded-br-md lg:text-lg text-xs"
                  >
                    <i class="fa fa-search"></i> Track
                  </button>
                </div>
              </div>
              <!-- <div class="mx-auto w-fit my-20" v-if="spinnerContinuing"><p class="text-base text-green-900 font-bold mb-4">Please wait ... </p><i class="fa fa-spinner fa-spin text-8xl text-green-800 animate-spin"></i></div> -->
              <!-- <div class="lg:flex lg:w-10/12 w-full mx-auto pt-5 lg:mb-5 mb-2" v-for="(j, i) in filteredData" :key="i"><div class="flex items-center h-fit w-fit mx-auto"><div class="flex items-center"><div :class="j ? 'text-white bg-green-900 px-2':'hidden'" class="h-fit w-fit mx-auto rounded-lg  py-1 font-bold relative z-10 "><i class="fa fa-vcard"></i></div><div :class="j ? 'bg-green-900':''" class="h-[6px] lg:rotate-0  lg:w-[250px] w-[100px]"></div></div><div class="flex items-center" v-if="j.approval_status === 'for revision'"><div class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 font-bold lg:mt-0  relative z-10 bg-orange-500"><i class="fa fa-file-pdf text-white" :class="filteredData.approval_status === 'for revision' ? ' ':''"></i></div><div class="h-[6px] lg:rotate-0  lg:w-[250px] w-[80px] bg-orange-500"></div><div class="h-fit w-fit lg:mx-0 mx-auto rounded-lg px-2 py-1 bg-gray-500 font-bold lg:mt-0 relative z-10"><i class="fa fa-clock text-white"></i></div></div><div :class="j.approval_status === 'pending' ? 'bg-gray-400 text-white':'hidden'" class="h-fit w-fit lg:mt-0  lg:mx-0 mx-auto rounded-lg py-1 font-bold relative z-10"><i class="" :class="j.approval_status === 'pending' ? 'px-2 fa fa-clock':''"></i></div><div :class="j.approval_status === 'declined' ? 'bg-red-700 text-white px-2':' hidden'" class="h-fit w-fit lg:mx-0 mx-auto rounded-lg py-1 font-bold relative z-10"><i class="" :class="j.approval_status === 'declined' ? 'px-1 fa fa-calendar-times':' '"></i></div><div :class="j.approval_status === 'approved' ? 'bg-green-700 px-2':'hidden'" class="h-fit w-fit lg:mx-0 mx-auto rounded-lg  font-bold relative z-10"><i class="" :class="j.approval_status === 'approved' ? 'px-1 py-2 fa fa-calendar-check text-white':''"></i></div></div></div> -->
              <div
                v-if="notFoundAlert"
                class="lg:text-sm text-xs text-gray-800 text-center mt-10 mb-5 py-2 px-4 rounded-sm shadow lg:w-6/12 mx-auto"
              >
                Can't Find Tracking ID!
              </div>
            </div>
          </div>
          <div class="" v-for="(j, i) in filteredData" :key="i">
            <div
              class="justify-evenly lg:w-10/12 mx-auto text-center items-center h-auto lg:mb-0 mb-3 border border-gray-200 shadow"
            >
              <div
                class="flex items-center justify-center lg:text-base text-xs"
              >
                <div
                  class="flex w-full gap-5"
                  :class="{
                    'bg-red-700 text-white': j.approval_status === 'declined',
                    'bg-gray-700 text-white': j.approval_status === 'pending',
                    'bg-yellow-500 text-black':
                      j.approval_status === 'for revision',
                    'bg-green-900 text-white': j.approval_status === 'approved',
                  }"
                >
                  <div class="w-fit mx-auto py-1 flex items-center gap-3">
                    <div class="flex items-center gap-x-1 w-full">
                      <!-- <label class="uppercase block text-white">Status:</label> -->
                      <span class="uppercase font-bold">{{
                        j.approval_status
                      }}</span>
                      <span
                        :class="j.remarks === 'N/A' ? 'hidden' : ''"
                        class=""
                      >
                        : {{ j.remarks }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div class="w-full">
                <div class="flex items-center justify-center border-b relative">
                  <div>
                    <!-- <div class="font-bold uppercase w-full" :class="j.attendees === 'Group' ? 'pt-[3px] cursor-pointer':'pt-[7px]'">
                    {{ j.attendees }}
                    <span :class="j.attendees === 'Group' ? 'text-green-800':'hidden'"><i class="fa fa-caret-down text-lg mt-0.5 ml-2"></i></span></div> -->
                    <div class="my-2 font-bold lg:text-sm text-xs">
                      TID:
                      <span class="hover:font-bold">{{ j.tracking_id }}</span>
                    </div>
                  </div>
                </div>
                <div class="lg:flex">
                  <div class="w-full">
                    <div
                      class="lg:flex items-center capitalize whitespace-nowrap"
                      :class="
                        j.approved_activities_link === '-' ||
                        j.approved_gso_docs_link === '-'
                          ? ''
                          : 'border-b'
                      "
                    >
                      <div class="flex items-center justify-center">
                        <span
                          class="lg:px-3.5 px-2.5 lg:text-sm text-xs lg:py-0 py-1"
                          >Access Type:</span
                        >
                        <i
                          class="text-md lg:ml-2.5 fa fa-universal-access mr-2"
                        ></i>
                      </div>
                      <ul class="flex gap-x-0.5 w-full lg:border-0 border-b">
                        <li
                          v-for="(j, i) in j.type_of_access"
                          :key="i"
                          class="lg:py-1 lg:text-sm text-[10px] whitespace-nowrap capitalize lg:border-t-0 border-t lg:w-fit w-full"
                          :class="
                            i === 0
                              ? 'border-0 lg:pr-3 pr-2 pl-2 lg:pl-1'
                              : 'border-l lg:px-3 px-2'
                          "
                        >
                          <!-- <span class="pr-3" :class="j.type_of_access.length - 1 ? 'border-r':''">{{ j }} </span> {{ j.type_of_access }} -->
                          <span
                            class="py-1 flex lg:w-full text-center justify-center w-fit mx-auto"
                            >{{ j }}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div class="lg:flex items-center">
                      <div class="w-full">
                        <div class="lg:flex">
                          <div
                            class="lg:pl-3 pl-2 lg:pr-5 pr-4 whitespace-nowrap lg:text-sm text-xs lg:py-0 py-3"
                          >
                            Processed By:
                          </div>
                          <div
                            class="w-full text-left lg:px-0 px-2 lg:pb-0 pb-3"
                          >
                            <div
                              class="w-full py-0.5 lg:text-xs text-[10px] uppercase"
                            >
                              <span class="mr-1">
                                <i class="fa fa-user ml-0.5 mr-2"></i>
                                {{ j.incharge_firstname }}
                              </span>
                              <span
                                :class="[
                                  j.incharge_middlename === 'N/A' ||
                                  j.incharge_middlename === '' ||
                                  j.incharge_middlename === '-'
                                    ? 'hidden'
                                    : '',
                                ]"
                                class="mr-1"
                              >
                                {{ j.incharge_middlename }}
                              </span>
                              <span> {{ j.incharge_lastname }}</span>
                            </div>
                            <div class="py-0.5 lg:text-sm text-xs">
                              <i class="fa fa-envelope mr-2 lg:mt-1"></i>
                              {{ j.incharge_contact_email }}
                            </div>
                            <div class="py-0.5 lg:text-sm text-xs">
                              <i class="fa fa-phone mr-1"></i>
                              {{ j.incharge_contact_number }}
                            </div>
                          </div>
                        </div>
                        <div class="lg:flex border-t lg:my-0 lg:py-0 py-3">
                          <div class="lg:px-3 px-2 lg:text-sm text-xs">
                            Date of Access:
                          </div>
                          <div
                            class="py-1 flex items-center justify-center lg:text-sm text-xs lg:px-0 px-2"
                          >
                            <i class="fa fa-calendar mr-2"></i> {{ j.schedule }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- 
                    <div class="lg:mx-4 mx-1" :class="[(j.remarks === 'N/A' || 
                    j.remarks === '' || 
                    j.remarks === '-') ? 'hidden':'']"><div class="flex items-center my-2 lg:text-sm text-xs"><label for="remarks" class="px-2 font-bold text-gray-800">Remarks:</label><span class=" w-full text-left px-2 py-1">
                    {{ j.remarks }}
                  </span></div></div> -->
                  </div>
                  <div
                    class="lg:w-7/12 w-full border-l"
                    :class="
                      j.approved_activities_link === '-' ||
                      j.approved_gso_docs_link === '-'
                        ? 'hidden'
                        : 'lg:border-t-0 border-t lg:pt-1 pt-4'
                    "
                  >
                    <div
                      class="whitespace-nowrap lg:text-left px-2 lg:pt-1 lg:text-sm text-xs text-center"
                    >
                      Supplementary Document:
                    </div>
                    <div
                      class="flex items-center gap-x-3 w-fit mx-auto my-5 left-3 text-xs"
                    >
                      <a
                        :href="j.approved_activities_link"
                        target="_blank"
                        class="font-bold w-full block text-green-800"
                        :class="
                          j.approved_activities_link === '-' ? 'hidden' : ''
                        "
                      >
                        <i class="fa fa-file-pdf text-xl"></i>
                        <span class="block"
                          >Approved <br />
                          Activity
                        </span>
                      </a>
                      <a
                        :href="j.approved_gso_docs_link"
                        target="_blank"
                        class="font-bold w-full block text-green-800"
                        :class="
                          j.approved_gso_docs_link === '-' ? 'hidden' : ''
                        "
                      >
                        <i class="fa fa-file-pdf text-xl"></i>
                        <span class="block">Approved Booking</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              :class="j.attendees === 'Group' ? '' : 'hidden'"
              class="lg:pt-5 pt-2 pb-5"
            >
              <div
                :class="detailsBtn ? 'hidden' : ''"
                @click="detailsBtn = !detailsBtn"
                class="px-3 py-2 w-fit mx-auto cursor-pointer"
              >
                <i class="fa fa-angle-double-down text-4xl text-center"></i>
              </div>
            </div>
          </div>
          <div v-if="detailsBtn">
            <div
              class="shadow overflow-y-scroll h-32 border-t-2 lg:w-10/12 mx-auto"
              v-for="(j, i) in filteredData"
              :key="i"
            >
              <div
                class="bg-gray-200 uppercase text-center text-sm font-bold py-1"
              >
                Entry List
              </div>
              <div class="w-full lg:flex hidden">
                <div class="w-full font-bold border-b-2 border-black px-3">
                  Full Name
                </div>
                <div
                  class="w-full font-bold border-b-2 border-black px-3 lg:border-l"
                >
                  Email
                </div>
              </div>
              <div
                v-for="(j, i) in j.name_list"
                :key="i"
                class="w-full lg:flex lg:border-b border lg:text-sm text-[10px] lg:py-0 py-2"
              >
                <div class="w-full lg:border-b px-3 lg:border-x">
                  {{ j.firstname }} {{ j.lastname }}
                </div>
                <div class="w-full lg:border-b px-3">
                  {{ j.email }}
                </div>
              </div>
            </div>
          </div>
          <div
            :class="detailsBtn ? '' : 'hidden'"
            @click="detailsBtn = !detailsBtn"
            class="cursor-pointer w-fit mx-auto block pt-5 pb-5"
          >
            <i class="fa fa-angle-double-up text-4xl text-center"></i>
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
