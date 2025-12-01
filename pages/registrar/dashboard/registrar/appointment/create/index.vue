<script setup>
import axios from "axios";
import { onMounted, ref, computed } from "vue";
import { useUserStore } from "@/stores/user";
import providerListJSON from "../providerList.json";
import scheduleJSON from "../schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import addDays from "date-fns/addDays";
import moment from "moment";
import _ from "lodash";
const router = useRouter();
const userStore = useUserStore();
const providerLists = ref(providerListJSON.providerLists);
const timeSelection = ref(scheduleJSON.timeSelection);

const endpoint = ref(userStore.mainDevServer);

const schedulesListsData = await $fetch(endpoint.value + "/api/schedules/list/").catch((error) => error.data)

let toggleSideBarMenu = ref(true);


let id = ref();
let service = ref("");
let provider = ref("");
let referencecode = ref("APS" + Date.now());
let date = ref();
let time = ref("");
let firstname = ref("Jo Renlee");
let lastname = ref("Luna");
let email = ref("jorenleeluna24@gmail.com");
let contactnumber = ref("09210689089");
let address = ref("Philippines");
let city = ref("Ozamiz City");
let zipcode = ref("7200");
let notes = ref("Sample");
//image
const upload_status = ref("");
const imagePreview = ref("");
const banner_imageData = ref("");
//image
let banner_image = ref(
  "https://upload.wikimedia.org/wikipedia/en/b/b0/LSU-Ozamiz_Seal.png"
);
let successful_request = ref(false);
let appointment_confirm = ref(false);
let payment = ref(false);
let request_delivered = ref(false);
let updated_at = ref(new Date().toDateString());
let created_by_name = ref("Registrars Admin");
let created_by_email = ref("admin@gmail.com");
let errors = ref([]);
let timeList = ref();
let providerList = ref();
let highlightedDates = ref([]);

let bookAppointment = ref(true);
let displayInputforReferenceCode = ref(false);

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
    router.push("/");
  } else {
    router.push("/unauthorized");
  }
});

let listAvailableDatesInEachProvider = (value) => {
  highlightedDates.value = [];
  for (let i = 0; i < schedulesListsData.length; i++) {
    if (_.includes(schedulesListsData[i].provider, value)) {
      highlightedDates.value.push(schedulesListsData[i].date);
    }
  }
};

const uploadedFile = (e) => {
  banner_imageData.value = e.target.files[0];
  imagePreview.value = URL.createObjectURL(banner_imageData.value);
  // console.log(e.target.files[0]);
  // banner_image.value = "https://lsufullstack.onrender.com/media/files/images/" + e.target.files[0].name;
  banner_image.value = "http://127.0.0.1:8000/media/files/images/" + e.target.files[0].name;
};

const saveFile = async () => {
  let formData = new FormData();
  formData.append("image", banner_imageData.value);

  let axiosConfig = {
    headers: {
      Authorization: userStore.user.token,
      "Content-Type": "multipart/form-data",
    },
  };
  axios
    .post(endpoint.value + "/api/enrollment/image/list/images/", formData, axiosConfig)
    .then((response) => {
      // console.log(response);
      upload_status.value = "success";
    })
    .catch(() => {
      upload_status.value = "error";
    });
};

const setDate = (value) => {
  date.value = moment(value).format("MM-DD-YYYY");
  schedulesListsData.filter(function (params) {
    if (date.value === params.date) {
      id.value = params.id;
      date.value = params.date;
      timeList.value = params.time;
      providerList.value = params.provider;
    }
  });
};

const logOut = () => {
  router.push("/registrar/login");
  userStore.removeToken();
};

const updateSchedule = async () => {
  if (timeList.value.length === 1) {
    timeList.value = ["-"];
  }
  _.pull(timeList.value, time.value);
  await $fetch(endpoint.value + "/api/schedules/" + id.value + "/edit/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      provider: providerList.value,
      date: date.value,
      time: timeList.value,
    },
  })
    .then((response) => {
      // console.log("response", response);
    });
};

const submitAppointmentToGmail = async () => {
  await $fetch(endpoint.value + "/api/appointments/submit-appointment-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      service: service.value,
      provider: provider.value,
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
      created_by_email: email.value,
    },
  })
  .then((response) => {});
};

const submitForm = async () => {
  // console.log("submitForm");

  errors.value = [];

  if (
    service.value == "" &&
    provider.value == "" &&
    referencecode.value == "" &&
    date.value == "" &&
    time.value == "" &&
    firstname.value == "" &&
    lastname.value == "" &&
    email.value == "" &&
    contactnumber.value == "" &&
    address.value == "" &&
    city.value == "" &&
    zipcode.value == "" &&
    notes.value == "" &&
    banner_image.value == "" &&
    successful_request.value == "" &&
    appointment_confirm.value == "" &&
    payment.value == "" &&
    request_delivered.value == ""
  ) {
    errors.value.push("Please enter all Fields.");
  }

  if (errors.value.length == 0) {
    successful_request.value = true;
    updateSchedule();
    submitAppointmentToGmail();
    await $fetch(endpoint.value + "/api/appointments/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        service: service.value,
        provider: provider.value,
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
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white gap-5">
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
            <h1
              class="font-bold text-gray-200 text-center text-base py-1 px-4 bg-green-900"
            >
              Add Appointment
            </h1>
            <form v-on:submit.prevent="submitForm">
              <div class="shadow-lg mb-5">
                <div class="w-full mx-auto">
                  <div class="lg:grid grid-cols-2">
                    <div>
                      <div class="my-5 ml-5 mr-5">
                        <label
                          for="service"
                          class="block mb-2 text-xs font-bold text-gray-900 uppercase"
                          >Service</label
                        >
                        <select
                          id="service"
                          name="service"
                          v-model="service"
                          class="shadow-md px-2 py-1 rounded-sm mb-2 w-full"
                        >
                          <option value="" disabled>
                            Please select the type of service
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
                      <div class="ml-5 mr-5">
                        <label
                          for="registrar"
                          class="uppercase block mb-2 text-xs font-bold text-gray-900"
                          >Provider</label
                        >
                        <div class="text-xs mt-3 mb-3 font-bold">
                          <label class="" for="PleaseSelectTheProvider"
                            >Please Select a Provider</label
                          >
                        </div>
                        <div class="space-y-5">
                          <div
                            v-for="(p, i) in providerLists"
                            :key="i"
                            class="mb-[0.125rem] block min-h-[1.5rem] pl-[1.5rem]"
                          >
                            <div class="">
                              <input
                                class="lg:flex items-center w-4 h-4 text-green-600 bg-white border-green-300 focus:ring-green-500"
                                type="radio"
                                name="provider"
                                id="provider"
                                :value="p.registrarsAssign"
                                v-model="provider"
                                @click="
                                  listAvailableDatesInEachProvider(p.registrarsAssign)
                                "
                              />
                              <label
                                class="flex items-center ml-5 font-bold text-green-900 -mt-5 text-sm"
                                style="font-size: 9px"
                                for="provider"
                                >{{ p.title }}</label
                              >
                            </div>

                            <p class="pl-5 text-xs">{{ p.description }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="mx-auto gap-20 w-full text-xs mt-3">
                      <div class="lg:w-full lg:px-10 lg:pt-2">
                        <div class="">
                          <div class="pb-3">
                            <h1 class="mb-3 font-bold lasalle-green-text text-center">
                              Calendar
                            </h1>
                            <div class="w-fit mb-10 border mx-auto">
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
                              class="text-center lg:mt-5 mb-3 font-bold lasalle-green-text lg:whitespace-nowrap"
                            >
                              Available Time
                            </h1>
                            <div class="w-full">
                              <div class="">
                                <div class="">
                                  <div
                                    class="h-60 w-10/12 mx-auto px-5 py-2 mt-1 rounded-md"
                                  >
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
                                          type="radio"
                                          name="time"
                                          :value="t"
                                          class="mr-2 mt-0.5"
                                          v-else
                                          disabled
                                        />
                                        <label for="time">
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
                    </div>
                  </div>
                  <div class="lg:flex mx-auto gap-20 px-8 w-full py-3 text-xs">
                    <div class="mx-auto gap-20 w-full">
                      <div class="w-full">
                        <div class="lg:grid grid-cols-1 gap-5 mb-5">
                          <div class="mt-5">
                            <h1 class="mb-3 font-bold lasalle-green-text">
                              Primary Information
                            </h1>
                            <div class="lg:grid grid-cols-2 gap-3">
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
                          <div>
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
                        <div class="w-full">
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
                                :src="banner_image"
                              />
                              <img
                                class="lg:w-full h-56 object-contain"
                                v-else
                                :src="imagePreview"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        v-if="errors.length"
                        class="mb-6 py-4 px-6 bg-rose-400 text-white rounded-xl"
                      >
                        <p v-for="error in errors" v-bind:key="error">
                          {{ error }}
                        </p>
                      </div>
                      <div class="w-1/2 justify-between flex">
                        <button
                          class="lasalle-green text-xs text-white font-bold py-2.5 px-5 rounded-lg mt-3 uppercase"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
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
  accent-color: #0a4300;
}

input[type="radio"]:disabled {
  background-color: #ebebeb;
  accent-color: #ebebeb;
}
</style>
