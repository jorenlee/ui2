<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import providerListJSON from "../providerList.json";
import providerListDepartmentJSON from "../providerListDepartment.json";
import scheduleJSON from "../schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import addDays from "date-fns/addDays";
import moment from "moment";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
import _ from "lodash";

const endpoint = ref(userStore.mainDevServer);

const timeSelection = ref(scheduleJSON.timeSelection);
const providerListsDepartment = ref(providerListDepartmentJSON.providerListsDepartment);

const schedulesListsData = await $fetch(endpoint.value + "/api/schedules/list/").catch((error) => error.data)


let id = ref();
let provider = ref("CAS / CON");
let date = ref();
let time = ref([]);
let errors = ref([]);
let displayAction = ref(false);
let highlightedDates = ref([]);
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (
      userStore.user.email === emailRegistrar.value ||
      userStore.user.email === developerEmail.value ||
      userStore.user.email === testEmail.value
    )
  ) {
    // router.push("/registrar/appointment/set-schedules");
  } else {
    router.push("/unauthorized");
  }
  // console.log("schedulesLists", schedulesLists);
  // console.log("schedulesListsData", schedulesListsData);
  // listAvailableDates();
  providersSelection("CAS / CON");
});

// let listAvailableDates = () => {
//   highlightedDates.value = [];
//   displayAction.value = false;
//   time.value = ["-"];
//   setTimeout(() => {
//     schedulesListsData.filter(function (params) {
//       if (provider.value === params.provider) {
//         highlightedDates.value.push(params.date);
//       }
//     }, 1000);
//   });
// };

// const displayAvailableDates = () => {
//   schedulesListsData.filter(function (params) {
//     if (date.value === params.date) {
//       id.value = params.id;
//       date.value = params.date;
//       time.value = params.time;
//       provider.value = params.provider;
//       displayAction.value = true;
//     }
//   });
// };

let providersSelection = (department) => {
  highlightedDates.value = [];
  // console.log(department)
  setTimeout(() => {
    schedulesListsData.filter(function (params) {
      if (department === params.provider) {
        provider.value = params.provider
        date.value = params.date
        highlightedDates.value.push(params.date);
      }
    }, 100);
  });
};

const setDate = (value) => {
  date.value = moment(value).format("MM-DD-YYYY");
  displayAction.value = false;
  time.value = ["-"];
  setTimeout(() => {
    schedulesListsData.filter(function (params) {
      if (params.provider === provider.value) {
        if (params.date === date.value) {
          id.value = params.id;
          time.value = params.time;
          displayAction.value = true;
        }
      }
    });
  }, 100);
};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  id.value = id;
};

const deleteSchedule = async () => {
  await $fetch(endpoint.value + "/api/schedules/" + id.value + "/delete/", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      // console.log("response", response);
      router.go();
      toggleConfirmDelete.value = !toggleConfirmDelete.value;
    })
};

const goToList = () => {
  // router.push("/registrar/appointment");
};

const goToCreate = () => {
  router.push("/");
};

const goToSchedules = () => {
  // router.push("/registrar/appointment/set-schedules");
};

const addSchedules = () => {
  // router.push("/registrar/appointment/set-schedules/create");
};

const browseDates = () => {
  // router.push("/registrar/appointment/set-schedules");
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const updateTimeAndProviders = (id) => {
  // router.push("/registrar/appointment/set-schedules/edit/" + id);
  // console.log(id);
};

const goToEdit = (id) => {
  // router.push("/registrar/appointment/edit/" + id);
};
</script>

<template>
  <div class="">
    <div class="flex h-screen">
      <div
        class="pt-7 pb-24 w-3/12 px-1 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <RegistrarMenuBar />
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="flex mx-auto justify-between py-2 px-3.5">
            <div class="flex items-center text-white gap-5">
              <div @click="toggleSideBarMenu = !toggleSideBarMenu" class="w-10 px-1.5">
                <i
                  class="fa text-3xl text-white"
                  :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                  aria-hidden="true"
                ></i>
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
        <div class="">
          <div class="lg:w-full p-5">
            <div class="h-full shadow-lg pb-10">
              <div class="relative">
                <div class="w-full mb-10">
                  <div class="shadow px-3">
                    <button
                      @click="addSchedules"
                      class="shadow text-center uppercase my-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap"
                    >
                      Add Schedules
                    </button>
                  </div>
                </div>
                <div class="" v-if="schedulesListsData.length > 0">
                  <div class="w-full">
                    <div class="lg:flex">
                      <div class="lg:w-1/3 mx-auto">
                        <div class="lg:w-8/12 mx-auto ml-5">
                          <p
                            class="uppercase block mb-2 text-xs font-bold text-gray-900 lasalle-green-text text-center"
                            >Provider</p
                          >
                          <div class="border p-5 w-fit mx-auto">
                            <!-- <div class="text-xs mt-3 mb-3 font-bold">
                              <label class="" for="PleaseSelectTheProvider"
                                >Providers:</label
                              >
                            </div> -->
                            <div class="lg:py-2">
                              <div v-for="(p, i) in providerListsDepartment" :key="i">
                                <div class="flex">
                                  <input
                                    class="lg:flex items-center w-4 h-4 text-green-600 bg-white border-green-300 focus:ring-green-500 mt-1"
                                    type="radio"
                                    name="provider"
                                   
                                    :value="p.department"
                                    v-model="provider"
                                    @click="providersSelection(p.department)"
                                  />
                                  <div class="ml-1">
                                    {{ p.department }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="w-1/3 mb-10 w-fitmx-auto h-full mr-10">
                        <h1
                          class="mb-3 font-bold lasalle-green-text text-xs ml-5 text-center uppercase"
                        >
                          Calendar
                        </h1>
                        <div class="w-fit mx-auto">
                          <VueDatePicker
                            v-model="date"
                            inline
                            :enable-time-picker="false"
                            id="date"
                            name="date"
                            auto-apply
                            :highlight="highlightedDates"
                            @update:model-value="setDate(date)"
                            :year-range="[2025, 2025]"
                            :disabled-week-days="[6, 7,0]"
                            week-start="0"
                            hide-offset-dates
                            :min-date="minDate"
                          />
                          <!-- @update:model-value="setDate" -->
                          <!-- :highlight="date" -->
                          <!-- highlight-disabled-days -->
                          <!-- :allowed-dates="allowedDates" -->
                          <!-- :disabled-dates="disabledDates" -->
                        </div>
                      </div>

                      <div class="lg:w-1/3 mx-auto">
                        <h1
                          class="mb-3 font-bold lasalle-green-text whitespace-nowrap text-xs text-center uppercase"
                        >
                          Set Time ( AM )
                        </h1>
                        <div class="w-full">
                          <div class="">
                            <div class="">
                              <div
                                class="flex h-full w-fit mx-auto px-5 py-2 shadow-sm border"
                              >
                                <ul class="text-xs">
                                  <li
                                    class="mb-3 lg:flex justify-center font-bold text-black"
                                    v-for="(t, i) in timeSelection[0].time"
                                    :key="i"
                                  >
                                    <input
                              
                                      type="checkbox"
                                      name="time"
                                      :value="t"
                                      class="mr-2 mt-0.5 available"
                                      v-model="time"
                                      disabled
                                    />
                                    <p class="" for="time">{{ t }}</p>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="displayAction" class="ml-10">
                    <button
                      @click="updateTimeAndProviders(id)"
                      class="mx-4 uppercase text-sm rounded-sm my-2 shadow px-5 py-1 text-green-900 whitespace-nowrap"
                    >
                      Update Time
                    </button>
                    <button
                      @click="toggleDeleteBtn"
                      class="mx-4 uppercase text-sm rounded-sm my-2 shadow px-5 py-1 text-green-900"
                    >
                      Removed / Disable
                    </button>
                  </div>

                  <div
                    class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    v-show="toggleConfirmDelete"
                  >
                    <div class="my-6">Are you sure you want to Delete?</div>
                    <div class="flex gap-5 mx-auto w-fit my-5">
                      <span
                        class="bg-green-900 text-white px-3 py-1 rounded-lg"
                        @click="deleteSchedule"
                        >Yes</span
                      >
                      <span
                        class="bg-red-900 text-white px-3 py-1 rounded-lg"
                        @click="toggleDeleteBtn"
                        >Cancel</span
                      >
                    </div>
                  </div>
                </div>
                <div v-else class="text-center">
                  Please Add Schedules, No Results Found!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DashboardFooter/>
  </div>
</template>
<style scoped>
.scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 20px;
}

.scrollbar::-webkit-scrollbar-track {
  border-radius: 100vh;
  background: #0e4a03;
}

.scrollbar::-webkit-scrollbar-thumb {
  background: #ffffff;
  border-radius: 100vh;
  border: 3px solid #12b700;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
  background: #014716;
}

input[type="radio"] {
  accent-color: #20990b;
}
</style>
