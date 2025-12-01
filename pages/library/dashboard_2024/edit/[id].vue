<script setup>
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";

import scheduleJSON from "../schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import addDays from "date-fns/addDays";
import moment from "moment";
import _ from "lodash";
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const timeSelection = ref(scheduleJSON.timeSelection);

const endpoint = ref(userStore.mainDevServer);

const { data: appointment } = await useFetch(endpoint.value + "/api/appointments/" + route.params.id + "/");

const tracksLists = await $fetch(endpoint.value + "/api/appointments/tracking/list/").catch((error) => error.data)

const schedulesListsData = await $fetch(endpoint.value + "/api/schedules/list/").catch((error) => error.data)

let service = ref(appointment.value.service);

let referencecode = ref(appointment.value.referencecode);
let date = ref(appointment.value.date);
let timeOld = ref(appointment.value.time);
let time = ref(appointment.value.time);
let firstname = ref(appointment.value.firstname);
let lastname = ref(appointment.value.lastname);
let email = ref(appointment.value.email);
let contactnumber = ref(appointment.value.contactnumber);
let address = ref(appointment.value.address);
let city = ref(appointment.value.city);
let zipcode = ref(appointment.value.zipcode);
let notes = ref(appointment.value.notes);
//image
const upload_status = ref("");
const imagePreview = ref("");
const banner_imageData = ref("");
//image
let banner_image = ref(appointment.value.banner_image);
let successful_request = ref(appointment.value.successful_request);
let appointment_confirm = ref(appointment.value.appointment_confirm);
let payment = ref(appointment.value.payment);
let request_delivered = ref(appointment.value.request_delivered);
let updated_at = ref(new Date().toDateString());
let created_by_name = ref("Registrars Admin");
let created_by_email = ref(userStore.user.email);

let bannerImagePreview = ref(
  "https://upload.wikimedia.org/wikipedia/en/b/b0/LSU-Ozamiz_Seal.png"
);


let errors = ref([]);

let id = ref();
let dateList = ref();

let timeList = ref();

let tracking_date = ref(new Date().toDateString());
let tracking_time = ref(new Date().toLocaleTimeString());
let tracking_description = ref();

let highlightedDates = ref([]);
let toggleSideBarMenu = ref(true);

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
    listAvailableDates();
    //console.log('appointment', appointment)
    // router.push("/registrar/appointment/edit/" + route.params.id);
    schedulesListsData.filter(function (params) {
      if (params.date === appointment.value.date) {
        id.value = params.id;
        timeList.value = params.time;
        timeList.value.push(timeOld.value);

      }
    });
  } else {
    router.push("/unauthorized");
  }
});

let listAvailableDates = () => {
  for (let i = 0; i < schedulesListsData.length; i++) {
    highlightedDates.value.push(schedulesListsData[i].date);
  }
};



const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

// to select date
const setDate = (value) => {
  time.value = timeOld.value;
  date.value = moment(value).format("MM-DD-YYYY");
  schedulesListsData.filter(function (params) {
    if (params.date === date.value) {
      id.value = params.id;
      timeList.value = params.time;
      timeList.value.push(timeOld.value);
   
    }
  });
  // console.log(id.value);
};

const editSchedule = async () => {
  // console.log("updated");
  if (timeList.value.length > 1) {
    _.pull(timeList.value, time.value);
    await $fetch(endpoint.value + "/api/schedules/" + id.value + "/edit/", {
      method: "PUT",
      body: {
        date: date.value,
        time: timeList.value,
      },
    })
      .then((response) => {
        // console.log("response", response);
      })
      .catch((error) => {
        if (error.response) {
          for (const property in error.response._data) {
            errors.value.push(`${property}: ${error.response._data[property]}`);
          }
          // console.log(JSON.stringify(error.response));
        } else if (error.message) {
          errors.value.push("Something went wrong. Please try again");
          // console.log(JSON.stringify(error));
        }
      });
  }
};

const submitTracking = async () => {
  // console.log("submitTracking");
  errors.value = [];
  if (
    referencecode.value == "" &&
    tracking_date.value == "" &&
    tracking_time.value == "" &&
    tracking_description.value == ""
  ) {
    errors.value.push("Please enter all Fields.");
  }
  if (errors.value.length == 0) {
    await $fetch(endpoint.value + "/api/appointments/tracking/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        referencecode: referencecode.value,
        date: tracking_date.value,
        time: tracking_time.value,
        description: tracking_description.value,
      },
    })
      .then((response) => {
        // console.log("response", response);
        router.go();
      })
      .catch((error) => {
        if (error.response) {
          for (const property in error.response._data) {
            errors.value.push(`${property}: ${error.response._data[property]}`);
          }
          // console.log(JSON.stringify(error.response));
        } else if (error.message) {
          errors.value.push("Something went wrong. Please try again");
          // console.log(JSON.stringify(error));
        }
      });
  }
};

const submitForm = async () => {
  // console.log("submitForm");
  errors.value = [];
    editSchedule();

    // console.log("submitForm edited")
    await $fetch(endpoint.value + "/api/appointments/" + route.params.id + "/edit/", {
      method: "PUT",
      body: {
        service: service.value,
        referencecode: referencecode.value,
        date: date.value,
        time: time.value,
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
        contactnumber: contactnumber.value,
        address: address.value,
        city: city.value,
        zipcode: zipcode.value,
        notes: notes.value,
        banner_image: banner_image.value,
        successful_request: successful_request.value,
        appointment_confirm: appointment_confirm.value,
        payment: payment.value,
        request_delivered: request_delivered.value,
        updated_at: updated_at.value,
        created_by_name: created_by_name.value,
        created_by_email: created_by_email.value,
      },
    })
      .then((response) => {
        // console.log("response", response);
        // router.push({ path: "/registrar/appointment" });
      })
    .catch((error) => {
      // console.log(error);
    });

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
          <div class="w-full p-5">
            <form v-on:submit.prevent="submitForm">
              <div class="shadow-lg">
                <div class="w-full mx-auto">
                  <div class="">
                    <div class="lg:grid grid-cols-4 lg:ml-3 ml-8 mt-3">
                      <div class="my-5">
                        <label
                          class="block mb-2 text-xs font-bold text-gray-900 uppercase"
                          >Service</label
                        >
                        <select
                          v-model="service"
                          id="service"
                          name="service"
                          class="shadow-md p-2 rounded-sm mb-2 w-full"
                        >
                          <option value="" disabled>
                            Please select the type of service.
                          </option>
                          <optgroup label="University Registrar">
                            <option value="CAV">CAV Application</option>
                            <option value="Good Moral">
                              Certificate of Good Moral Character
                            </option>
                            <option value="Honorable">Honorable Dismissal</option>
                            <option value="TOR">Transcipt of Records Application</option>
                            <option value="OTHERS">Other Certificates Application</option>
                          </optgroup>

                          <optgroup label="SAO Office">
                            <option value="Good Moral SAO">
                              Certificate of Good Moral Character
                            </option>
                          </optgroup>
                        </select>
                      </div>

              
                      <div class="pb-3">
                        <h1 class="text-center mb-3 font-bold lasalle-green-text">
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
                        </div>
                      </div>

                      <div class="pb-3">
                        <h1
                          class="text-center mt-5 mb-3 font-bold lasalle-green-text lg:whitespace-nowrap"
                        >
                          Available Time
                        </h1>
                        <div class="w-full">
                          <div class="">
                            <div class="">
                              <div class="h-60 w-10/12 mx-auto px-5 py-2 mt-1 rounded-md">
                                <ul class="">
                                  <li
                                    class="mb-3 lg:flex justify-center font-bold"
                                    v-for="(t, i) in timeSelection[0].time"
                                    :key="i"
                                  >
                                    <input
                                      id="time"
                                      type="radio"
                                      name="time"
                                      :value="t"
                                      class="mr-2 mt-0.5"
                                      v-model="time"
                                      v-if="_.includes(timeList, t)"
                                    />
                                    <input
                                      id="time"
                                      type="checkbox"
                                      name="time"
                                      :value="t"
                                      class="mr-2 mt-0.5"
                                      v-else
                                      disabled
                                      checked
                                    />
                                    <label
                                      class="font-bold"
                                      v-if="_.includes(timeOld, t)"
                                    >
                                      {{ t }}
                                    </label>
                                    <label
                                      v-else
                                      :class="
                                        _.includes(timeList, t)
                                          ? 'text-green-500'
                                          : 'text-red-500'
                                      "
                                    >
                                      {{ t }}
                                    </label>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="lg:flex mx-auto gap-20 px-8 w-full pb-3 text-xs">
                    <div class="mx-auto gap-20 w-full">
                      <div class="w-full">
                        <div class="mb-5">
                          <div>
                            <h1 class="mb-3 font-bold lasalle-green-text">
                              Primary Information
                            </h1>
                            <div class="lg:grid lg:grid-cols-2 grid-cols-1 gap-3">
                              <input
                                id="firstname"
                                name="firstname"
                                class="shadow-md p-2 rounded-sm w-full border"
                                placeholder="First Name"
                                v-model="firstname"
                              />
                              <input
                                id="lastname"
                                name="lastname"
                                class="shadow-md p-2 rounded-sm w-full border"
                                placeholder="Last Name"
                                v-model="lastname"
                              />
                              <input
                                id="email"
                                name="email"
                                class="shadow-md p-2 rounded-sm w-full border"
                                placeholder="Email"
                                v-model="email"
                              />
                              <input
                                id="contactnumber"
                                name="contactnumber"
                                class="shadow-md p-2 rounded-sm w-full border"
                                placeholder="Contact Number"
                                v-model="contactnumber"
                              />
                            </div>
                          </div>
                          <div class="mt-3">
                            <h1
                              class="lg:mb-3 mb-2 lg:mt-0 mt-3 font-bold lasalle-green-text"
                            >
                              Contact Address
                            </h1>
                            <div class="gap-5">
                              <input
                                id="address"
                                name="address"
                                class="shadow-md p-2 rounded-sm mb-3 w-full border"
                                placeholder="Address"
                                v-model="address"
                              />
                              <div class="lg:grid lg:grid-cols-2 grid-cols-1 gap-3">
                                <input
                                  id="city"
                                  name="city"
                                  class="shadow-md p-2 rounded-sm w-full border"
                                  placeholder="City"
                                  v-model="city"
                                />
                                <input
                                  id="zipcode"
                                  name="zipcode"
                                  class="shadow-md p-2 rounded-sm w-full border"
                                  placeholder="Zip Code"
                                  v-model="zipcode"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="w-full mt-3">
                          <input
                            name="notes"
                            placeholder="Notes"
                            class="shadow-md border rounded-sm p-2 w-full"
                            v-model="notes"
                          />
                        </div>


                          <div class="mt-3">
                          <div class="flex w-full mb-3">
                            <div class="flex h-fit">
                              <input
                                type="file"
                                @change="uploadedFile"
                                accept="image/*"
                              />
                            </div>
                          </div>

                          <div class="w-fit lg:mx-0 mx-auto">
                            <div class="w-56 shadow">
                              <img
                                class="lg:w-full h-56 object-contain"
                                v-if="imagePreview === ''"
                                :src="bannerImagePreview"
                              />
                              <img
                                class="lg:w-full h-56 object-contain"
                                v-else
                                :src="banner_image"
                              />

                              {{banner_image}}
                            </div>
                          </div>
                        </div>

                        <div class="mt-3">
                          <input
                            id="referencecode"
                            name="referencecode"
                            class="shadow-md p-2 rounded-sm w-full border"
                            placeholder="Reference Code"
                            v-model="referencecode"
                            disabled
                          />
                        </div>
                      </div>
                      <div class="mt-3">
                        <ul class="border-gray-200 pt-2">
                          <li class="flex text-xs mb-2">
                            <label class="pr-2"> Status</label>
                            <h1 class="flex font-bold text-green-800 text-xs">
                              :
                              <ul class="lg:flex">
                                <li class="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="checking"
                                    name="checking"
                                    value=""
                                    class="mt-0.5 mr-1 ml-2"
                                    v-model="successful_request"
                                  />
                                  <label class="">Checking</label>
                                </li>
                                <li class="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="appointment_confirm"
                                    name="appointment_confirm"
                                    value=""
                                    class="mt-0.5 mr-1 ml-2"
                                    v-model="appointment_confirm"
                                  />
                                  <label class="">Confirmed</label>
                                </li>
                                <li class="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="payment"
                                    name="payment"
                                    value=""
                                    class="mt-0.5 mr-1 ml-2"
                                    v-model="payment"
                                  />
                                  <label class="">Payment</label>
                                </li>
                                <li class="flex items-center">
                                  <input
                                    type="checkbox"
                                    id="request_delivered"
                                    name="request_delivered"
                                    value=""
                                    class="mt-0.5 mr-1 ml-2"
                                    v-model="request_delivered"
                                  />
                                  <label class="">Delivered</label>
                                </li>
                              </ul>
                            </h1>
                          </li>
                        </ul>
                      </div>

                      <div
                        v-if="errors.length"
                        class="mb-6 py-4 px-6 bg-rose-400 text-white rounded-xl"
                      >
                        <p v-for="error in errors" v-bind:key="error">
                          {{ error }}
                        </p>
                      </div>
                      <div class="lg:w-full mx-auto justify-between flex">
                        <button
                          class="lasalle-green text-xs hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-6 uppercase"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div class="w-10/12 mx-auto">
            <form v-on:submit.prevent="submitTracking" class="lg:flex items-center">
              <input
                id="tracking_description"
                name="tracking_description"
                class="shadow-md p-2 rounded-sm border text-xs w-full"
                placeholder="Remark Status"
                v-model="tracking_description"
              />

              <button
                class="lasalle-green text-xs hover:bg-green-700 text-white py-1.5 px-1.5 whitespace-nowrap rounded-lg uppercase ml-5 font-bold"
              >
                Add Track Status
              </button>

              <div
                v-if="errors.length"
                class="mb-6 py-4 px-6 bg-rose-400 text-white rounded-xl"
              >
                <p v-for="error in errors" v-bind:key="error">
                  {{ error }}
                </p>
              </div>
            </form>
          </div>

          <div class="mx-auto w-fit mb-10 mt-3">
            <ol
              class="relative border-l border-gray-200 dark:border-gray-700"
              :class="t.referencecode === referencecode ? 'block' : 'hidden'"
              v-for="(t, i) in _.orderBy(tracksLists, 'date', 'time', 'asc')"
              :key="i"
            >
              <li class="pt-10 ml-4">
                <div
                  class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"
                ></div>
                <p
                  class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
                >
                  {{ t.date }}
                </p>
                <p
                  class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
                >
                  {{ t.time }}
                </p>
                <p
                  class="pb-2 text-base font-normal w-10/12 text-gray-500 dark:text-gray-400"
                >
                  {{ t.description }}
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-green-900 p-3">
      <h1 class="text-center text-white text-xs">
        <span class="font-bold">Copyright © 2023 </span
        ><span>La Salle University - Ozamiz</span>
      </h1>
    </div>
  </div>
</template>
<style scoped>

</style>
