<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import scheduleJSON from "../schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "../css/main.css";
import moment from "moment";
const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
import _ from "lodash";

const timeSelection = ref(scheduleJSON.timeSelection);
const selectAll = ref(false);

const toggleSelectAll = () => {
  if (selectAll.value) {
    // Add all time slots
    info.value.time = [...timeSelection.value[0].time];
  } else {
    // Clear all selections
    info.value.time = [];
  }
};

const info = ref({
  date: null,
  time: timeSelection._rawValue[0].time,
  updated_at: new Date(),
});

let highlightedDates = ref([]);
let addBtn = ref(false);

let toggleSideBarMenu = ref(true);
const cantSelectCurrentDateText = ref(false);
const timeSelectionList = ref(true);

const minDate = ref(new Date());

const schedulesListsData = await $fetch(
  endpoint.value + "/api/library/schedule/booking/list/"
).catch((error) => error.data);

const developerEmail = ref(userStore.user.developerEmail);

const fetchData = () => {
  schedulesListsData.filter(function (params) {
    info.value.date = params.date;
    highlightedDates.value.push(params.date);
  });
};

onMounted(() => {
  const authorizedEmails = [
    developerEmail.value,
    "monaliza.mugot@lsu.edu.ph",
    "marilyn.bejec@lsu.edu.ph",
    "applejane.ebarle@lsu.edu.ph",
    "janekaren.gudmalin@lsu.edu.ph",
    "macy.beniola@lsu.edu.ph",
    "lynn.lumacad@lsu.edu.ph",
    "zosette.salas@lsu.edu.ph"
  ];

  const userEmail = userStore.user.email;

  if (userStore.user.isAuthenticated && authorizedEmails.includes(userEmail)) {
    fetchData();
    router.push("/library/dashboard/appointment/set-schedules/create");
  } else {
    router.push("/unauthorized");
  }
});


const checkIfExists = () => {
  // addBtn.value = true;
  schedulesListsData.filter(function (params) {
    info.value.time = params.time;
    if (params.date === info.value.date) {
      addBtn.value = false;
    }
  });
};

const setDate = (dateSelected) => {
  info.value.date = moment(dateSelected).format("MM-DD-YYYY");
  let currentDate = moment(moment().toDate()).format("MM-DD-YYYY");
  cantSelectCurrentDateText.value = false;
  timeSelectionList.value = true;
  addBtn.value = true;
  if (info.value.date === currentDate) {
    addBtn.value = false;
    cantSelectCurrentDateText.value = true;
    timeSelectionList.value = false;
  } else if (moment(info.value.date).isBefore(currentDate)) {
    addBtn.value = false;
    timeSelectionList.value = false;
  } else {
    checkIfExists();
  }
};

const browseDates = () => {
  router.push("/library/dashboard/appointment/set-schedules");
};

const logOut = () => {
  router.push("/library/login");
  userStore.removeToken();
};

const addDates = async () => {
  await $fetch(endpoint.value + "/api/library/schedule/booking/create/", {
    method: "POST",
    headers: {
      Authorization: userStore.user.token,
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then(async (response) => {
    // console.log("response", response);

    fetchData();
    setTimeout(() => {
      router.go();
    }, 1000);
    addBtn.value = true;
  });
};
</script>

<template>
  <div class="">
    <div class="flex min-h-screen">
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 z-10 w-full lg:block lg:static absolute"
        v-show="toggleSideBarMenu"
      >
        <div
          class="flex items-center justify-center text-white bg-green-900 lg:py-[16px] py-[8px]"
        >
          <div class="flex items-center w-full px-2">
            <i class="fa fa-user mx-2" aria-hidden="true"></i>
            <h1 class="text-sm">
              {{ userStore.user.email }}
            </h1>
          </div>
          <div
            @click="toggleSideBarMenu = !toggleSideBarMenu"
            class="w-10 px-1.5 lg:hidden flex"
          >
            <i
              class="fa text-3xl text-white"
              :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
              aria-hidden="true"
            ></i>
          </div>
        </div>
        <div class="min-h-[570px]">
          <div class="w-fit mx-auto mt-5 mb-3">
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/LSULRC.jpg"
              class="lg:w-24 w-20 mx-auto rounded-full"
            />
          </div>
          <div class="text-center">
            <h2 class="font-bold text-green-800 text-lg">
              Learning Resource Center
            </h2>
          </div>
          <div class="mx-auto mt-10 mb-5 grid grid-cols-1">
            <a
              href="/library/dashboard/appointment"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-list mr-3" aria-hidden="true"></i>
              Appointment Lists
            </a>

            <a
              href="/library/dashboard/appointment/reports/books"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-book mr-3" aria-hidden="true"></i>
              Available Books
            </a>

            <!-- <a
              href="/library/dashboard/appointment/create"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-plus-circle mr-3"></i>
              Walk-Ins appointment
            </a> -->

            <a
              href="/library/dashboard/appointment/set-schedules"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-calendar mr-3.5" aria-hidden="true"></i> SET
              SCHEDULES
            </a>
            <a
              href="/"
              class="text-xs mx-auto mb-2 w-full uppercase whitespace-nowrap px-5 py-1 font-bold text-left text-green-900 hover:bg-green-900 hover:text-white"
            >
              <i class="fa fa-globe mr-3" aria-hidden="true"></i>
              LSU HOME PAGE
            </a>
          </div>
        </div>
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="flex mx-auto w-full justify-between py-2 px-3.5">
            <div class="flex items-center text-white gap-5">
              <div
                @click="toggleSideBarMenu = !toggleSideBarMenu"
                class="w-10 px-1.5"
              >
                <i
                  class="fa text-3xl text-white"
                  :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars'"
                  aria-hidden="true"
                ></i>
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
                      class="shadow text-center capitalize my-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap"
                    >
                      BACK
                    </button>
                  </div>
                </div>
                <div class="w-full">
                  <div class="w-full">
                    <form
                      class="flex mx-auto w-full px-4"
                      v-on:submit.prevent="addDates"
                    >
                      <div class="mr-5 flex items-center">
                        <button
                          v-if="addBtn"
                          class="bg-green-700 text-xs text-white font-bold py-2 px-4 rounded-lg uppercase cursor-pointer"
                        >
                          ADD
                        </button>
                        <div
                          v-else
                          class="bg-gray-300 text-xs text-white font-bold py-2 px-4 rounded-lg uppercase cursor-not-allowed"
                        >
                          ADD
                        </div>
                      </div>
                      <div class="lg:flex w-full gap-x-5">
                        <div class="w-fit mx-auto mb-10 h-full">
                          <h1
                            class="mb-3 font-bold lasalle-green-text text-xs text-center uppercase"
                          >
                            Select Date to Add Schedule
                          </h1>
                          <!-- remove past dates using min-date disable weekends in calendar -->
                          <!-- set Sunday First in the Calendar using week-start=0 -->
                          <!-- :disabled-week-days="[6, 7, 0]" -->
                          <div class="">
                            <VueDatePicker
                              v-model="info.date"
                              inline
                              :enable-time-picker="false"
                              id="date"
                              name="date"
                              auto-apply
                              :highlight="highlightedDates"
                              @update:model-value="setDate(info.date)"
                              :year-range="[2025, 2025]"
                              :disabled-week-days="[0, 7]"
                              week-start="0"
                              hide-offset-dates
                              :min-date="minDate"
                            />
                          </div>
                          <div
                            v-show="cantSelectCurrentDateText"
                            class="text-center mt-5 text-red-700"
                          >
                            Sorry! Can't Add Current Date
                          </div>
                        </div>
                        <div
                          class="w-full mx-auto mb-5"
                          v-show="timeSelectionList"
                        >
                          <div class="w-full px-3 py-2 shadow-sm border">
                            <div class="flex lg:w-fit mx-auto gap-x-5">
                              <h1
                                class="mb-3 font-bold lasalle-green-text text-xs text-center uppercase"
                              >
                                Time
                              </h1>

                              <!-- ✅ Select All Checkbox -->
                              <div
                                class="flex justify-end items-center mb-2 pr-4"
                              >
                                <input
                                  id="selectAll"
                                  type="checkbox"
                                  class="mr-2"
                                  v-model="selectAll"
                                  @change="toggleSelectAll"
                                />
                                <label
                                  for="selectAll"
                                  class="text-xs font-semibold text-gray-700"
                                  >Select All</label
                                >
                              </div>
                            </div>

                            <ul class="grid lg:grid-cols-3">
                              <li
                                class="my-2 lg:flex justify-center font-bold text-black mx-5 w-full text-xs"
                                v-for="(t, i) in timeSelection[0].time"
                                :key="i"
                              >
                                <input
                                  type="checkbox"
                                  class="mr-2 mt-0.5 available"
                                  :value="t"
                                  v-model="info.time"
                                />
                                <label
                                  >{{ t._12_hour_format_from }} -
                                  {{ t._12_hour_format_to }}</label
                                >
                              </li>
                            </ul>
                          </div>
                        </div>
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
    <DashboardFooter />
  </div>
</template>
<style scoped></style>
