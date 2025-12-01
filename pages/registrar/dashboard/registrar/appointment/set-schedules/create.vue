<script setup>
import { onMounted, provide } from "vue";
import { useUserStore } from "@/stores/user";
import providerListJSON from "../providerList.json";
import providerListDepartmentJSON from "../providerListDepartment.json";
import scheduleJSON from "../schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import moment from "moment";
const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
import _ from "lodash";
import addDays from "date-fns/addDays";

const timeSelection = ref(scheduleJSON.timeSelection);
const providerListsDepartment = ref(providerListDepartmentJSON.providerListsDepartment);
let id = ref();
let provider = ref();
let date = ref();
let time = ref(timeSelection._rawValue[0].time);
let errors = ref([]);
let highlightedDates = ref([]);
let addBtn = ref(true);
let toggleSideBarMenu = ref(true);
const cantSelectCurrentDateText = ref(false);
const cantSelectPreviousDatesText = ref(false);
const timeSelectionList = ref(true);
const pleaseSelectTheProvider = ref(true);

const schedulesListsData = await $fetch(endpoint.value + "/api/schedules/list/").catch((error) => error.data)

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);

const minDate = ref(new Date());

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (
      userStore.user.email === emailRegistrar.value ||
      userStore.user.email === developerEmail.value ||
      userStore.user.email === testEmail.value
    )
  ) {
    // router.push("/registrar/appointment/set-schedules/create");
  } else {
    router.push("/unauthorized");
  }
});

const providersSelection = (department) => {
  highlightedDates.value = [];
  cantSelectCurrentDateText.value = false;
  cantSelectPreviousDatesText.value = false;
  timeSelectionList.value = true;
  addBtn.value = true;
  pleaseSelectTheProvider.value = false;
  //let tomorrow = moment().add(1,'days');
  let currentDate = moment(moment().toDate()).format("MM-DD-YYYY");
  date.value = moment(currentDate).format("MM-DD-YYYY");
  // console.log(date.value)

  setTimeout(() => {
    schedulesListsData.filter(function (params) {
      if (department === params.provider) {
        provider.value = params.provider;
        date.value = params.date;
        highlightedDates.value.push(params.date);
      }
    }, 100);
  });
};

const checkIfExists = () => {
  // addBtn.value = true;
  setTimeout(() => {
    schedulesListsData.filter(function (params) {
      if (params.provider === provider.value) {
        time.value = params.time;
        if (params.date === date.value) {
          addBtn.value = false;
        }
      }
    });
  }, 100);
}

const setDate = (dateSelected) => {
  date.value = moment(dateSelected).format("MM-DD-YYYY");
  let currentDate = moment(moment().toDate()).format("MM-DD-YYYY");
  cantSelectCurrentDateText.value = false;
  cantSelectPreviousDatesText.value = false;
  timeSelectionList.value = true;
  addBtn.value = true;

  if (date.value === currentDate) {
    addBtn.value = false;
    cantSelectCurrentDateText.value = true;
    timeSelectionList.value = false;
    pleaseSelectTheProvider.value = true;
    provider.value = "";
  }
  else if (moment(date.value).isBefore(currentDate)) {
    addBtn.value = false;
    cantSelectPreviousDatesText.value = true;
    timeSelectionList.value = false;
    pleaseSelectTheProvider.value = true;
    provider.value = "";
  }
  else {
    checkIfExists()
  }
}

const addDataToAPI = () => {
  router.go();
}

const browseDates = () => {
  // router.push("/registrar/appointment/set-schedules");
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const addDates = async () => {
  // console.log("addDates");
  errors.value = [];

  if (date.value == "" && provider.value == [] && time.value == []) {
    errors.value.push("Please Input All Fields (date, provider, time)");
  }
  if (errors.value.length === 0) {
    await $fetch(endpoint.value + "/api/schedules/create/", {
      method: "POST",
      headers: {
        Authorization: userStore.user.token,
        "Content-Type": "application/json",
      },
      body: {
        provider: provider.value,
        date: date.value,
        time: time.value,
      },
    })
      .then(async(response) => {
        // console.log("response", response);
        addDataToAPI()
      });
  }
};
</script>

<template>
  <div class="">
    <div class="flex">
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
            <div class="h-full shadow-lg">
              <div class="">
                <div class="w-full shadow mb-10">
                  <div class="px-3">
                    <button
                      @click="browseDates"
                      class="shadow text-center uppercase my-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap"
                    >
                      Browse Dates
                    </button>
                  </div>
                </div>
                <div class="w-full">
                  <div class="">
                    <form class="lg:flex p-5" v-on:submit.prevent="addDates">
                      <div class="w-fit mx-auto">
                        <div class="w-fit mx-auto">
                          <label
                            for="registrar"
                            class="uppercase block mb-2 text-xs font-bold text-gray-900 text-center lasalle-green-text"
                            >Provider</label
                          >
                          <div class="border p-5 w-fit mx-auto">
                            <div class="text-xs mb-3 font-bold" v-show="pleaseSelectTheProvider">
                              <label class="text-red-900" for="selectprovider"
                                >Please Select a Provider</label
                              >
                            </div>
                            <div class="">
                              <div
                                v-for="(p, i) in providerListsDepartment"
                                :key="i"
                                class=""
                              >
                                <div class="flex">
                                  <input
                                    id="provider"
                                    type="radio"
                                    name="provider"
                                    :value="p.department"
                                    class="mr-2 mt-0.5"
                                    v-model="provider"
                                    @click="providersSelection(p.department)"
                                  />
                                  <label class="ml-1" for="provider">
                                    {{ p.department }}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="w-fit mx-auto mb-10 h-full">
                        <h1
                          class="mb-3 font-bold lasalle-green-text text-xs text-center uppercase"
                        >
                          Calendar
                        </h1>
                        <div class="">
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
                        </div>
                      </div>
                      <div v-show="cantSelectCurrentDateText" class="text-red-700">
                        Sorry! Can't Add Current Date
                      </div>
                      <div v-show="cantSelectPreviousDatesText" class="text-red-700">
                        Sorry! Can't Add Previous Dates
                      </div>
                      <div class="w-fit mx-auto" v-show="timeSelectionList">
                        <h1
                          class="mb-3 font-bold lasalle-green-text whitespace-nowrap text-xs text-center uppercase"
                        >
                          Set Time ( AM )
                        </h1>
                        <div class="w-full">
                          <div class="">
                            <div class="">
                              <div class="flex h-full w-full px-5 py-2 shadow-sm border">
                                <ul class="text-xs">
                                  <li
                                    class="mb-3 lg:flex justify-center font-bold text-black"
                                    v-for="(t, i) in timeSelection[0].time"
                                    :key="i"
                                  >
                                    <input
                                      id="time"
                                      type="checkbox"
                                      name="time"
                                      :value="t"
                                      class="mr-2 mt-0.5 available"
                                      v-model="time"
                                    />
                                    <label class="" for="time">{{ t }}</label>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="lg:py-80">
                        <button
                          v-if="addBtn"
                          class="bg-green-700 text-xs text-white font-bold py-2 px-4 rounded-lg mt-6 uppercase"
                        >
                          Add
                        </button>
                        <!-- <button
                          @click="addDataToAPI"
                          class="bg-green-700 text-xs text-white font-bold py-2 px-4 rounded-lg mt-6 uppercase"
                        >
                         refresh
                        </button> -->
                      </div>
                    </form>
                  </div>
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
