<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);

import moment from "moment";
const route = useRoute();

const procurements = ref(0);
// console.log(procurements)

const date = ref(new Date());
let calendarSettings = ref(false);
let deleteIDProcurement = ref();
let appointmentInfo = ref(true);
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);

onMounted(() => {
  setTimeout(async () => {
    if (userStore.user.isAuthenticated &&
      (userStore.user.email === "jorenleeluna24@gmail.com" ||
        userStore.user.email === "procurement@lsu.edu.ph" ||
        userStore.user.email === "jason.yap@lsu.edu.ph"
      )) {
      procurements.value = await $fetch(endpoint.value + "/api/procurements/list").catch((error) => error.data) || 0;
      router.push("/procurement/dashboard");
    } else {
      router.push("/unauthorized");
    }
  }, 3000)
});

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  deleteIDProcurement.value = id;
  // console.log(id);
};

const deleteProcurement = async () => {
  await $fetch(
    endpoint.value +
    "/api/procurements/" +
    deleteIDProcurement.value +
    "/delete/",
    {
      method: "DELETE",
      headers: {
        Authorization: userStore.user.token,
        "Content-Type": "application/json",
      },
    }
  )
    .then(async (response) => {
      // console.log("response", response);
      procurements.value = await $fetch(endpoint.value + "/api/procurements/list").catch((error) => error.data) || 0;
      toggleConfirmDelete.value = !toggleConfirmDelete.value;
    })
}

const logOut = () => {
  router.push("/procurement/login");
  userStore.removeToken();
};

let procurementDetails = ref(true);

let toggleMenu = (a) => {
  appointmentInfo.value = a;
  procurementDetails.value = false;
};

const goToList = () => {
  router.push("/procurement/dashboard");
};

const goToEdit = (id) => {
  router.push("/procurement/dashboard/edit/" + id);
};

const goToCreate = () => {
  router.push("/procurement/dashboard/create");
};
</script>

<template>
<div>
  <div class="flex">
    <div class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden" v-show="toggleSideBarMenu">
      <ProcurementMenuBar :goToList="goToList" :goToCreate="goToCreate" />
    </div>

    <div class="w-full min-h-screen">
      <div class="bg-green-800">
        <div class="lg:flex mx-auto justify-between py-2 px-3.5">
          <div class="lg:flex items-center text-white gap-5">
            <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
              <i class="fa text-3xl text-white" :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                aria-hidden="true"></i>
            </div>
            <div class="flex -mt-1">
              <i class="fa fa-user mr-2 mt-1" aria-hidden="true"></i>
              <h1 class="text-sm">
                {{ userStore.user.email }}
              </h1>
            </div>
          </div>
          <button @click="logOut" class="flex hover:font-bold pt-1">
            <i class="fa fa-sign-out text-white text-xl"></i>
            <h1 class="text-xs text-white p-1.5">Log Out</h1>
          </button>
        </div>
      </div>
      <div>
        <div class="w-full p-5">
          <div v-show="appointmentInfo">
            <div class="">
              <div class="appointment-lists shadow mx-auto text-xs">
                <div class="">
                  <div class="header w-full p-2 bg-green-800 text-white flex items-center">
                    <ul class="lg:flex w-full justify-evenly text-center whitespace-nowrap">
                      <li class="lg:w-1/12">No.</li>
                      <li class="lg:w-5/12">Title</li>
                      <li class="lg:w-1/12">Bid Status</li>
                      <li class="lg:w-3/12">Deadline of Submission</li>
                      <li class="lg:w-2/12">Action</li>
                    </ul>
                  </div>
                  

                  <div class="w-full rows" v-if="procurements.length > 0">
                    <ul class="lg:flex w-full justify-evenly py-3 text-center items-center h-auto border-b border-gray-100"
                      v-for="(b, i) in _.orderBy(procurements, 'id', 'asc')" :key="i">
                      <li class="px-2 lg:w-1/12">{{ i + 1 }}</li>
                      <li class="px-2 lg:w-5/12 capitalize">{{ (b.title).toLowerCase()}}</li>
                      




                      <li class="px-2 lg:w-1/12 uppercase">
                        <!-- <input type="checkbox" disabled v-model="b.open_for_bids" /> -->
                     
                          
                         <span 
                         
      
                      :class="
                      {
                        'border-green-900 px-2 py-1 text-white bg-green-900': b.bid_status === 'completed',
                        'border-red-500 px-2 py-1 text-white bg-red-500': b.bid_status === 'on hold',
                        'border-yellow-500 px-2 py-1 text-white bg-yellow-500': b.bid_status === 'ongoing',
                        'border-purple-800 px-2 py-1 text-white bg-purple-800': b.bid_status === 'announcement',
                      }"
                         
                         > {{ b.bid_status }}</span>
       
                 
                    
                      </li>
                      <li class="px-2 lg:w-3/12">{{ b.deadline }}</li>
                      <li class="flex px-2 font-bold justify-center lg:w-2/12">
                        <div class="mx-auto lg:flex justify-center">
                          <button @click="goToEdit(b.id)">
                            <i class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"></i>
                          </button>
                        </div>

                        <div class="mx-auto lg:flex justify-center">
                          <button @click="toggleDeleteBtn(b.id)">
                            <i class="fa fa-trash text-red-500 rounded-lg uppercase text-xl hover:text-3xl"
                              aria-hidden="true"></i>
                          </button>
                        </div>
                      </li>
                    </ul>
                    <div
                      class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      v-show="toggleConfirmDelete">
                      <div class="my-6">Are you sure you want to Delete?</div>
                      <div class="flex gap-5 mx-auto w-fit my-5">
                        <span class="bg-green-900 text-white px-3 py-1 rounded-lg cursor-pointer" @click="deleteProcurement">Yes</span>
                        <span class="bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer" @click="toggleDeleteBtn">Cancel</span>
                      </div>
                    </div>
                  </div>
                  <div v-if="procurements.length === 0" class="itallic text-gray-400 text-center p-1">
                    No Results Found!
                  </div>
                  <div v-else class="itallic text-gray-400 text-center p-1" :class="procurements.length > 0 ? 'hidden' : ''">
                    Please Wait ...
                  </div>
                </div>
              </div>
              <!-- <div class="mx-auto w-4/12 text-center mt-5 text-gray-400 mb-3">
                  <div class="inline-flex gap-5">
                    <button
                      class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l"
                      @click="prevBtn"
                    >
                      Prev
                    </button>
                    <button class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l"
                    @click="currentBtn">
                      1
                    </button>
                    <button class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l">
                      2
                    </button>
                    <button class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-l">
                      3
                    </button>
                    <button
                      class="bg-green-800 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r"
                    @click="nextBtn">
                      Next
                    </button>
                  </div>
                </div> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <DashboardFooter />
</div>
</template>

<style scoped>
input[type="checkbox"] {
  color: #116f00;
}
</style>
