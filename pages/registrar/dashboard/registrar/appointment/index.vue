<script setup>
import { onMounted, ref } from "vue";
import { useUserStore } from "@/stores/user";
import providerListJSON from "./providerList.json";
import scheduleJSON from "./schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import moment from "moment";
const router = useRouter();
const userStore = useUserStore();
const currentPage = ref(1);
const endpoint = ref(userStore.mainDevServer);
import _ from "lodash";

let bookingAppointmentListFilter = ref(0);

const providerLists = ref(providerListJSON.providerLists);
const timeSelection = ref(scheduleJSON.timeSelection);

let appointmentInfo = ref(true);
let addAppointment = ref(false);
let calendarSettings = ref(false);
let toggleSideBarMenu = ref(true);
let toggleConfirmDelete = ref(false);
let idToBeDeleted = ref();
let appointmentDetails = ref(false);
// let totalItems = ref();

//const emailCBA = ref("cba@lsu.edu.ph");
//const emailCCSEA = ref("ccsea@lsu.edu.ph");
//const emailCON = ref("con@lsu.edu.ph");

const emailCBARegistrar = ref("cba.registrar@lsu.edu.ph");
const emailCCSEARegistrar = ref("ccsea.registrar@lsu.edu.ph");
const emailCONRegistrar = ref("onlinerequest@lsu.edu.ph");
const emailCTHMRegistrar = ref("cthm.registrar@lsu.edu.ph");
const emailSGSRegistrar = ref("cthm.registrar@lsu.edu.ph");
const emailCASRegistrar = ref("onlinerequest@lsu.edu.ph");
const emailCTERegistrar = ref("cte.registrar@lsu.edu.ph");

const emailRegistrar = ref(userStore.user.registrarEmail);
const developerEmail = ref(userStore.user.developerEmail);
const testEmail = ref(userStore.user.testEmail);

onMounted(async () => {
  const bookingAppointmentList = await $fetch(
    endpoint.value + "/api/appointments/list/"
  ).catch((error) => error.data);
  // console.log(bookingAppointmentList)
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === emailCBARegistrar.value ||
      userStore.user.email === emailCCSEARegistrar.value ||
      userStore.user.email === emailCONRegistrar.value ||
      userStore.user.email === emailCTHMRegistrar.value ||
      userStore.user.email === emailSGSRegistrar.value ||
      userStore.user.email === emailCASRegistrar.value ||
      userStore.user.email === emailCTERegistrar.value ||
      userStore.user.email === emailRegistrar.value ||
      userStore.user.email === developerEmail.value ||
      userStore.user.email === testEmail.value)
  ) {
    // router.push("/registrar/appointment");
    switch (userStore.user.email) {
      case emailCBARegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CBA";
          }) || 0;
        break;
      case emailCCSEARegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CCSEA";
          }) || 0;
        break;
      case emailCONRegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CAS / CON";
          }) || 0;
        break;
      case emailCTHMRegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CTHM / SGS";
          }) || 0;
        break;
      case emailSGSRegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CTHM / SGS";
          }) || 0;
        break;
      case emailCASRegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CAS / CON";
          }) || 0;
        break;
      case emailCTERegistrar.value:
        bookingAppointmentListFilter.value =
          bookingAppointmentList.filter((params) => {
            return params.provider === "CTE";
          }) || 0;
        break;
      default:
        bookingAppointmentListFilter.value = bookingAppointmentList || 0;

        numberOfPages = Math.ceil(
          bookingAppointmentListFilter._rawValue.length / numberOfItems.value
        );
        bookingAppointmentListFilterlength =
          bookingAppointmentListFilter._rawValue.length;

        // console.log(
        //   "bookingAppointmentListFilterlength",
        //   bookingAppointmentListFilter._rawValue.length
        // );
        // console.log(
        //   "bookingAppointmentListFilter",
        //   bookingAppointmentListFilter._rawValue
        // );
    }
  } else {
    router.push("/unauthorized");
    // console.log(bookingAppointmentList.value);
  }
});

const initialDisplay = ref(2);
const numberOfItems = ref(2);
const startNum = ref(0);
let numberOfPages;
let bookingAppointmentListFilterlength;

let itemsLoaded = computed(() => {
  return bookingAppointmentListFilter.value.slice(startNum.value, numberOfItems.value);
});

const prev = () => {
  if (startNum.value > 0) {
    startNum.value -= initialDisplay.value;
    numberOfItems.value -= initialDisplay.value;
    // console.log("prev");
    itemsLoaded;
  }
};

const next = () => {
  if (numberOfItems.value < bookingAppointmentListFilterlength) {
    startNum.value += initialDisplay.value;
    numberOfItems.value += initialDisplay.value;
    // console.log("next");
    itemsLoaded;
  }
};

const pagination = (selectedPage) => {
  startNum.value = 0;
  numberOfItems.value = initialDisplay.value;
  itemsLoaded;

  if (selectedPage > 1) {
    numberOfItems.value *= selectedPage;
    startNum.value = numberOfItems.value - initialDisplay.value;
  }
};

const toggleDeleteBtn = (id) => {
  toggleConfirmDelete.value = !toggleConfirmDelete.value;
  idToBeDeleted.value = id;
};

const deleteAppointment = async () => {
  await $fetch(endpoint.value + "/api/appointments/" + idToBeDeleted.value + "/delete/", {
    // await $fetch("/api/appointments/" + idToBeDeleted.value + "/delete/", {
    method: "DELETE",
    headers: {
      Authorization: userStore.user.token,
      "Content-Type": "application/json",
    },
  })
    .then(async (response) => {
      // console.log("response", response);
      router.go();
      toggleConfirmDelete.value = !toggleConfirmDelete.value;
    })
    .catch((error) => {
      // console.log(error);
    });
};

const goToEdit = (id) => {
  // router.push("/registrar/appointment/edit/" + id);
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
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
      <div class="w-full min-h-screen">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white lg:gap-5">
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
            <button @click="logOut" class="flex hover:font-boldn pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="px-3">
          <div class="">
            <a
              href="/"
              class="w-fit block shadow text-center uppercase my-3 px-4 py-1 bg-green-900 font-semibold text-sm text-white rounded-md whitespace-nowrap"
            >
              Add Appointment
            </a>
          </div>
          <div class="">
            <div class="w-full">
              <div class="">
                <div class="appointment-lists shadow mx-auto text-xs">
                  <div class="">
                    <div
                      class="header w-full p-2 bg-green-800 text-white flex items-center"
                    >
                      <ul
                        class="lg:flex w-full justify-evenly text-center lg:whitespace-nowrap"
                      >
                        <li class="lg:w-14">No.</li>
                        <li class="lg:w-1/12">Reference Code</li>
                        <li class="lg:w-1/12">Provider</li>
                        <li class="lg:w-1/12">Time</li>
                        <li class="lg:w-2/12">Date</li>
                        <li class="lg:w-1/12">Action</li>
                      </ul>
                    </div>
                    <div
                      class="w-full rows"
                      v-if="bookingAppointmentListFilter.length > 0"
                    >
                      <ul
                        class="lg:flex w-full justify-evenly text-center items-center h-auto border-b border-gray-100"
                        v-for="(b, i) in _.orderBy(itemsLoaded, 'date', 'asc')"
                        :key="i"
                      >
                        <li class="px-2 lg:w-14">{{ i + 1 }}</li>
                        <li class="px-2 lg:w-1/12">{{ b.referencecode }}</li>
                        <li class="px-2 lg:w-1/12 whitespace-nowrap">
                          {{ b.provider }}
                        </li>
                        <li class="px-2 lg:w-1/12 whitespace-nowrap">
                          {{ b.time }}
                        </li>
                        <li class="px-2 lg:w-2/12">
                          {{ moment(b.date).format("MM-DD-YYYY") }}
                        </li>
                        <li class="flex px-2 font-bold justify-center lg:w-1/12">
                          <div class="mx-auto lg:flex justify-center">
                            <button @click="goToEdit(b.id)">
                              <i
                                class="fa fa-edit text-yellow-500 rounded-lg uppercase text-xl hover:text-3xl"
                                aria-hidden="true"
                              ></i>
                            </button>
                          </div>
                          <div class="mx-auto lg:flex justify-center">
                            <button @click="toggleDeleteBtn(b.id)">
                              <i
                                class="fa fa-trash text-red-500 rounded-lg uppercase text-xl hover:text-3xl"
                                aria-hidden="true"
                              ></i>
                            </button>
                          </div>
                        </li>
                      </ul>
                      <div
                        class="px-5 rounded-lg bg-white shadow-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        v-show="toggleConfirmDelete"
                      >
                        <div class="my-6">Are you sure you want to Delete?</div>
                        <div class="flex gap-5 mx-auto w-fit my-5">
                          <span
                            class="bg-green-900 text-white px-3 py-1 rounded-lg"
                            @click="deleteAppointment"
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
                    <div v-else class="itallic text-gray-400 text-center p-1">
                      Please Add appointments, No Results Found!
                    </div>
                  </div>
                </div>

                <div
                  v-if="bookingAppointmentListFilter.length > initialDisplay"
                  class="flex items-center w-fit mx-auto font-bold text-sm rounded-lg mt-10"
                >
                  <div
                    @click="prev"
                    class="shadow px-2 py-1.5 rounded-tl-lg rounded-bl-lg bg-white hover:bg-green-900 hover:text-white text-green-950"
                  >
                    <i class="fa fa-angle-left" aria-hidden="true"></i>
                    Prev
                  </div>

                  <!-- <div
            v-if="numberOfPages > 3"
            class="cursor-pointer px-2 py-1 border mx-1 rounded-lg"
          >
            <i class="fa fa-angle-double-left" aria-hidden="true"></i>
          </div> -->
                  <ul
                    class="border-t border-gray-50 flex w-[150px] justify-evenly overflow-x-scroll px-2"
                  >
                    <li
                      v-for="(selectedPage, i) in numberOfPages"
                      class="bg-white hover:bg-green-900 hover:text-white text-green-950 cursor-pointer px-2 py-0.5 border mx-1 my-1 rounded-lg"
                      :key="i"
                      @click="pagination(selectedPage)"
                    >
                      {{ selectedPage }}
                    </li>
                  </ul>
                  <!-- <div
            v-if="numberOfPages > 3"
            class="cursor-pointer px-2 py-1 border mx-1 rounded-lg"
          >
            <i class="fa fa-angle-double-right" aria-hidden="true"></i>
          </div> -->

                  <div
                    @click="next"
                    class="bg-white hover:bg-green-900 hover:text-white text-green-950 shadow px-2 py-1.5 rounded-tr-lg rounded-br-lg"
                  >
                    Next

                    <i class="fa fa-angle-right" aria-hidden="true"></i>
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
/* .scrollbar::-webkit-scrollbar {
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
.pagination-container {
  display: flex;
  column-gap: 10px;
}
.paginate-buttons {
  height: 40px;
  width: 40px;
  border-radius: 20px;
  cursor: pointer;
  background-color: rgb(242, 242, 242);
  border: 1px solid rgb(217, 217, 217);
  color: black;
}
.paginate-buttons:hover {
  background-color: #d8d8d8;
}
.active-page {
  background-color: #3498db;
  border: 1px solid #3498db;
  color: white;
}
.active-page:hover {
  background-color: #2988c8;
} */

/* width */
::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #ececec;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #135000;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #00c566;
}
</style>
