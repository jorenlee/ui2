<script setup>
import { onMounted } from "vue";
import { useUserStore } from "~/stores/user";
const router = useRouter();
import moment from "moment";
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);
import scheduleJSON from "../schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const schedulesListsData = await $fetch(
  endpoint.value + "/api/library/schedule/booking/list/"
).catch((error) => error.data);

const timeSelection = ref(scheduleJSON.timeSelection);
let id = ref();
let date = ref();
let time = ref(timeSelection._rawValue[0].time);
let highlightedDates = ref([]);
const minDate = ref(new Date());
const developerEmail = ref(userStore.user.developerEmail);
let addBtn = ref(true);
const cantSelectCurrentDateText = ref(false);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    (userStore.user.email === developerEmail.value ||
      userStore.user.email === "monaliza.mugot@lsu.edu.ph" ||
      userStore.user.email === "marilyn.bejec@lsu.edu.ph" ||
      userStore.user.email === "applejane.ebarle@lsu.edu.ph" ||
      userStore.user.email === "janekaren.gudmalin@lsu.edu.ph" ||
      userStore.user.email === "macy.beniola@lsu.edu.ph" ||
      userStore.user.email === "lynn.lumacad@lsu.edu.ph" ||
      userStore.user.email === 'zosette.salas@lsu.edu.ph')
  ) {
    schedulesListsData.filter(function (params) {
      highlightedDates.value.push(params.date);
    });
    router.push("/library/dashboard/appointment/create");
    created_by_email.value = userStore.user.email;
  } else {
    router.push("/unauthorized");
  }
});

const info = ref({
  borrower_category: "",
  id_number: "",
  firstname: "",
  lastname: "",
  email: "",
  books: [// {book_title: null,book_author: null,book_call_number: null}
  ],
  booking_date: "",
  booking_time: "",
  status: "pending",
  created_by_email: "",
  updated_at: new Date(),
})

let limitCounter = ref(0);
let book_title = ref("");
let book_author = ref("");
let book_call_number = ref("");
let allFieldsAreRequired = ref(false);
let timeList = ref();
let toggleSideBarMenu = ref(true);
let displayIDNumber = ref(false);
let emailSentToaster = ref(false);

const defaultIDNumber = () => {
  displayIDNumber.value = true;
  id_number.value = "";
};

const borrowerCategoryLimit = () => {
  if (borrower_category.value === "Faculty") {
    limitCounter.value = 20;
    defaultIDNumber();
  }
  if (borrower_category.value === "Staff") {
    limitCounter.value = 20;
    defaultIDNumber();
  }
  if (borrower_category.value === "Student") {
    limitCounter.value = 15;
    defaultIDNumber();
  }
  if (borrower_category.value === "Visitor") {
    limitCounter.value = 5;
    displayIDNumber.value = false;
    id_number.value = "N/A";
  }
  books.value = [
    {
      book_title: null,
      book_author: null,
      book_call_number: null,
    },
  ];
};

const addBooks = () => {
  books.value.push({
    book_title: book_title.value,
    book_author: book_author.value,
    book_call_number: book_call_number.value,
  });
  // console.log(books);
  limitCounter.value--;
};

const removeRow = (obj) => {
  if (books.value.length > 1) {
    _.pull(books.value, obj);
    limitCounter.value++;
    // console.log(books);
  }
};

const setDate = (value) => {
  date.value = moment(value).format("MM-DD-YYYY");
  time.value = ["-"];
  setTimeout(() => {
    schedulesListsData.filter(function (params) {
      if (params.date === date.value) {
        id.value = params.id;
        timeList.value = params.time;
      }
    });
  }, 100);
};

const logOut = () => {
  router.push("/library/login");
  userStore.removeToken();
};

const updateSchedule = async () => {
  if (timeList.value.length === 1) {
    timeList.value = ["-"];
  }
  _.pull(timeList.value, time.value);
  await $fetch(endpoint.value + "/api/library/schedule/booking/" + id.value + "/edit/", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      date: date.value,
      time: timeList.value,
      updated_at: updated_at.value,
    },
  }).then((response) => {
    // console.log("response", response);
  });
};

const submitForm = async () => {
  // console.log("submitForm");
  booking_date.value = date.value;
  booking_time.value = time.value;
  await $fetch(endpoint.value + "/api/library/booking/create/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((response) => {
    if (response.status === "errors") {
      // console.log("response.status", response.status);
      // console.log("response.errors", response.errors);
      allFieldsAreRequired.value = true;
      setTimeout(() => {
        allFieldsAreRequired.value = false;
      }, 10000);
    } else {
      updateSchedule();
      submitAppointmentToGmail();
      emailSentToaster.value = true;
      setTimeout(() => {
        emailSentToaster.value = false;
        router.go();
      }, 2000);
      router.push("/library/dashboard/appointment")
    }
  });
}

const submitAppointmentToGmail = async () => {
  await $fetch(endpoint.value + "/api/library/submit-appointment-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: info.value,
  }).then((res) => {
    console.log(res)
  });
};
</script>

<template>
  <div class="">
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <LibraryMenuBar />
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex lg:items-center text-white gap-5">
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
        <div class="text-xs lg:mb-5">
          <div class="lg:p-5 p-2">
            <div
              class="mb-4 text-base font-medium text-green-900 text-center uppercase tracking-tighter"
            >
              Book an Appointment
            </div>
            <form v-on:submit.prevent="submitForm">
              <div class="w-11/12 mx-auto lg:flex">
                <div class="w-4/12 mb-1">
                  <div class="">
                    <h1
                      class="font-bold lasalle-green-text text-xs text-center capitalize mb-3"
                    >
                      Please Select Date
                    </h1>
                    <div class="mx-auto w-fit">
                      <VueDatePicker
                        v-model="date"
                        inline
                        :enable-time-picker="false"
                        name="date"
                        auto-apply
                        :highlight="highlightedDates"
                        @update:model-value="setDate(date)"
                        :year-range="[2025, 2025]"
                        :disabled-week-days="[0,7]"
                        week-start="0"
                        :min-date="minDate"
                      />
                    </div>
                  </div>
                </div>
                <div class="w-8/12">
                  <h1
                    class="text-center font-bold lasalle-green-text lg:whitespace-nowrap capitalize mb-3"
                  >
                    Select Available Time
                  </h1>
                  <div class="w-full border rounded-md">
                    <ul class="flex flex-wrap px-5 py-4 justify-center">
                      <li
                        class="mb-3 font-bold mx-10"
                        v-for="(t, i) in timeSelection[0].time"
                        :key="i"
                      >
                        <input
                          type="radio"
                          name="time"
                          :value="t"
                          class="mr-2 mt-0.5"
                          v-model="time"
                          v-if="_.includes(timeList, t)"
                          required
                        />
                        <input
                          type="radio"
                          name="time"
                          :value="t"
                          class="mr-2 mt-0.5"
                          v-else
                          disabled
                        />
                        <label
                          :class="
                            _.includes(timeList, t) ? 'text-green-600' : ' text-red-600'
                          "
                        >
                          {{ t }}
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="lg:w-8/12 mx-auto shadow-sm lg:p-5">
                <div class="lg:flex gap-2 lg:mb-3">
                  <div class="lg:w-3/12 lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300"> Borrower Category </label>
                    <select
                      v-model="borrower_category"
                      name="borrower_category"
                      class="shadow-md p-2 rounded-md w-full border border-[#e5e7eb] capitalize"
                      required
                      @change="borrowerCategoryLimit()"
                    >
                      <option value="" disabled selected hidden>
                        Select Borrower Category
                      </option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                      <option value="Student">Student</option>
                      <option value="Visitor">Visitor</option>
                    </select>
                  </div>
                  <div class="lg:w-3/12 lg:mb-0 mb-2" v-if="displayIDNumber">
                    <label class="text-[10px] text-gray-300"> ID Number </label>
                    <input
                      class="shadow-md px-2 lg:py-2 py-3 rounded-md w-full border capitalize"
                      v-model="id_number"
                      placeholder="ID Number"
                      required
                    />
                  </div>
                </div>
                <div class="lg:flex gap-2 lg:mb-3">
                  <div class="w-full lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300"> First Name </label>
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="firstname"
                      placeholder="first Name"
                    />
                  </div>
                  <div class="w-full lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300"> Last Name </label>
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="lastname"
                      placeholder="last Name"
                    />
                  </div>
                  <div class="w-full lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300"> Email </label>
                    <input
                      class="shadow-md p-2 rounded-md w-full border"
                      v-model="email"
                      placeholder="Email"
                    />
                  </div>
                </div>
                <div class="shadow rounded-lg px-5 pt-5 pb-2">
                  <div
                    class="flex shadow p-5 gap-2 mb-3"
                    v-for="(b, i) in books"
                    :key="i"
                  >
                    <div class="flex items-center pr-3 pt-3 font-bold">{{ i + 1 }}</div>
                    <div class="w-full lg:mb-0 mb-2">
                      <label class="text-[10px] text-gray-300"> Book Title </label>
                      <input
                        class="shadow-md p-2 rounded-md w-full border capitalize"
                        v-model="b.book_title"
                        placeholder="book title"
                      />
                    </div>
                    <div class="w-full lg:mb-0 mb-2">
                      <label class="text-[10px] text-gray-300"> Book Author </label>
                      <input
                        class="shadow-md p-2 rounded-md w-full border capitalize"
                        v-model="b.book_author"
                        placeholder="book author"
                      />
                    </div>
                    <div class="w-full lg:mb-0 mb-2">
                      <label class="text-[10px] text-gray-300"> Book Call Number </label>
                      <input
                        class="shadow-md p-2 rounded-md w-full border capitalize"
                        v-model="b.book_call_number"
                        placeholder="book call number"
                      />
                    </div>
                    <div
                      v-if="books.length > 1"
                      class="flex items-center lg:ml-10 mt-5 justify-center bg-green-900 text-white rounded-full lg:h-7 h-8 w-8 lg:w-12 mx-auto px-2.5 text-sm"
                      @click="removeRow(b)"
                    >
                      <i class="fa fa-close"></i>
                    </div>
                  </div>
                  <div
                    v-if="limitCounter > 1"
                    class="text-white cursor-pointer ml-12 w-fit mb-3 bg-green-800 uppercase text-xs rounded-md px-5 py-2 text-center"
                    @click="addBooks"
                  >
                    Add Book
                  </div>
                </div>
                <div
                  v-if="allFieldsAreRequired"
                  class="text-white w-full bg-red-800 text-sm px-3 py-2 rounded-md text-center"
                >
                  Date and Time and other fields are required!
                </div>
                <div
                  v-if="emailSentToaster"
                  class="text-center w-full p-2 bg-green-900 text-white uppercase"
                >
                  Appointment Sent!
                </div>
                <div class="mt-5 w-fit mx-auto">
                  <button
                    class="text-white bg-green-800 uppercase text-xs rounded-md w-fit mx-auto px-5 py-2 text-center"
                  >
                    Submit
                  </button>
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
input[type="radio"]:disabled {
  background-color: #ff8b8b;
  accent-color: #ff8f8f;
}
</style>