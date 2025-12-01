<script setup>
const title = ["LRC Book Thru", "(lrc)", "Book Thru"];

import { onMounted } from "vue";
import { useUserStore } from "~/stores/user";
const router = useRouter();
import moment from "moment";
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);
import scheduleJSON from "./schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "./css/main.css";

const schedulesListsData = await $fetch(
  endpoint.value + "/api/library/schedule/booking/list/"
).catch((error) => error.data);

const timeSelection = ref(scheduleJSON.timeSelection);

let highlightedDates = ref([]);
const minDate = ref(new Date());


let id = ref();
let date = ref();
let time = ref(timeSelection._rawValue[0].time);

onMounted(() => {
  schedulesListsData.filter(function (params) {
    highlightedDates.value.push(params.date);
  });
});

let borrower_category = ref("");
let id_number = ref("");
let firstname = ref("");
let lastname = ref("");
let email = ref();
let books = ref([
  // {book_title: null,book_author: null,book_call_number: null}
]);
let booking_date = ref();
let booking_time = ref();
let status = ref("pending");
let created_by_email = ref();
let updated_at = ref("Jan 1, 2024");
let limitCounter = ref(0);
let book_title = ref("");
let book_author = ref("");
let book_call_number = ref("");
let allFieldsAreRequired = ref(false);
let errors = ref([]);
let timeList = ref();
let displayIDNumber = ref(false);

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
  // if (borrower_category.value === "Visitor") {
  //   limitCounter.value = 5;
  //   displayIDNumber.value = false;
  //   id_number.value = "N/A";
  // }
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

const createBtn = () => {
  submitForm();
  submitAppointmentToGmail();
};

const submitForm = async () => {
  // console.log("submitForm");
  errors.value = [];
  booking_date.value = date.value;
  booking_time.value = time.value;
  created_by_email.value = email.value;
  if (
    borrower_category.value === "" &&
    id_number.value === "" &&
    firstname.value === "" &&
    lastname.value === "" &&
    email.value === "" &&
    books.value === "" &&
    booking_date.value === "" &&
    booking_time.value === "" &&
    status.value === "" &&
    created_by_email.value === "" &&
    updated_at.value === ""
  ) {
    errors.value.push("Please fill in all fields.");
  }
  if (errors.value.length == 0) {
    await $fetch(endpoint.value + "/api/library/booking/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        borrower_category: borrower_category.value,
        id_number: id_number.value,
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
        books: books.value,
        booking_date: booking_date.value,
        booking_time: booking_time.value,
        status: status.value,
        created_by_email: created_by_email.value,
        updated_at: updated_at.value,
      },
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
        router.push({ path: "/library/LRCBookThru/ConfirmationPage" });
      }
    });
  }
};

const submitAppointmentToGmail = async () => {
  await $fetch(endpoint.value + "/api/library/submit-appointment-to-gmail/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      borrower_category: borrower_category.value,
      id_number: id_number.value,
      firstname: firstname.value,
      lastname: lastname.value,
      email: email.value,
      books: books.value,
      booking_date: booking_date.value,
      booking_time: booking_time.value,
      status: status.value,
      created_by_email: created_by_email.value,
      updated_at: updated_at.value,
    },
  }).then((response) => {});
};
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="">
        <div class="relative">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
            class="align-top w-full h-auto lg:object-fill lg:block hidden"
          />
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
            class="align-top w-full h-36 object-none lg:hidden block"
          />
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1
              class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
            >
              {{ title[0] }}
            </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <div class="w-11/12 mx-auto flex justify-between">
              <ul class="flex lasalle-green-text capitalize text-xs">
                <li>
                  <a href="/" class=""> Home </a>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-caret-right mx-1.5 mt-0.5"></i>
                  <a href="/library" class="mr-1 flex"> Library </a>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-caret-right mx-1.5 mt-0.5"></i>
                  <a href="/library/LRCBookThru" class="mr-1 flex">
                    <span class="lg:flex hidden ml-1"> LRC Book Thru</span>
                    <span class="lg:hidden flex"> LRC Book Thru</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="text-xs lg:mb-5 bg-white w-11/12 mx-auto lg:mt-5 shadow-xl rounded-xl">
        <div class="">
          <div
            class="bg-green-900 py-1 mt-4 lg:mb-10 mb-4 text-base font-medium text-white text-center uppercase tracking-tight"
          >
            Book an Appointment
          </div>
          <form v-on:submit.prevent="createBtn" class="px-3">
            <div class="lg:w-fit w-auto mx-auto lg:flex lg:gap-20">
              <div class="lg:w-fit mb-1">
                <div class="">
                  <h1
                    class="font-bold lasalle-green-text text-xs text-center capitalize mb-3"
                  >
                    Date
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
                      :disabled-week-days="[6, 7, 0]"
                      week-start="0"
                      :allowed-dates="highlightedDates"
                      :min-date="minDate"
                    />
                  </div>
                </div>
              </div>
              <div class="mx-auto shadow lg:h-fit lg:my-auto border rounded-sm my-3">
                <h1
                  class="border-b-2 border-green-900 text-center font-bold text-green-900 lg:whitespace-nowrap capitalize pt-3 pb-3 mb-3"
                >
                  Time
                </h1>
                <div class="w-full rounded-md justify-center">
                  <ul class="grid lg:grid-cols-3 grid-cols-2">
                    <li
                      class="flex items-center mb-3 font-semibold whitespace-nowrap lg:w-[170px] lg:text-left text-center lg:pl-6 pl-3.5"
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
                        :id="t"
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
                        :for="t"
                        class="lg:text-xs text-[10px]"
                        :class="
                          _.includes(timeList, t) ? 'text-[#087830] font-bold' : ' text-gray-400 font-light'
                        "
                      >
                        {{ t }}
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="lg:w-10/12 mx-auto lg:p-5">
              <div class="flex gap-2 lg:mb-3 lg:mt-0 mt-3">
                <div class="lg:w-fit w-[170px] lg:mb-0 mb-2">
                  <label class="text-[10px] text-gray-300 lg:block hidden">
                    Borrower Category
                  </label>
                  <select
                    v-model="borrower_category"
                    name="borrower_category"
                    class="shadow-md px-2 py-2 rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                    required
                    @change="borrowerCategoryLimit()"
                  >
                    <option value="" disabled selected hidden>
                      Select Borrower Category
                    </option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Student">Student</option>
                    <!-- <option value="Visitor">Visitor</option> -->
                  </select>
                </div>
                <div class="lg:w-3/12 w-full lg:mb-0 mb-2" v-if="displayIDNumber">
                  <label class="text-[10px] text-gray-300 lg:block hidden">
                    ID Number
                  </label>
                  <input
                    class="shadow-md text-green-800 px-2 text-xs rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                    v-model="id_number"
                    placeholder="ID Number"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div class="lg:flex gap-2 lg:mb-3">
                <div class="w-full lg:mb-0 mb-2">
                  <label class="text-[10px] text-gray-300 lg:block hidden">
                    First Name
                  </label>
                  <input
                    class="shadow-md text-xs text-green-800 px-2 py-2 rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                    v-model="firstname"
                    placeholder="first Name"
                    type="text"
                    required
                  />
                </div>
                <div class="w-full lg:mb-0 mb-2">
                  <label class="text-[10px] text-gray-300 lg:block hidden">
                    Last Name
                  </label>
                  <input
                    class="shadow-md text-xs text-green-800 px-2 py-2 rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                    v-model="lastname"
                    placeholder="last Name"
                    type="text"
                    required
                  />
                </div>
                <div class="w-full lg:mb-0 mb-2">
                  <label class="text-[10px] text-gray-300 lg:block hidden"> Email </label>
                  <input
                    class="shadow-md text-xs text-green-800 px-2 py-2 rounded-md w-full lg:border-2 border border-[#225c21]"
                    v-model="email"
                    placeholder="Email"
                    type="email"
                    required
                  />
                </div>
              </div>
              <div class="shadow rounded-lg px-2 py-3">
                <div class="text-green-900 text-sm text-center lg:mb-3 px-3">
                  Open this link
                  <a
                    class="font-bold cursor-pointer"
                    target="_blank"
                    href="http://203.177.51.122:443/common/servlet/presenthomeform.do?l2m=Home&tm=Home"
                  >
                    OPAC
                  </a>

                  for the available resources and copy the book details in the input boxes
                  <span class="">
                    (please select first the borrower category above)</span
                  >.
                </div>
                <div
                  class="lg:flex lg:shadow lg:p-5 gap-2 mb-3 relative"
                  v-for="(b, i) in books"
                  :key="i"
                >
                  <div class="flex items-center">
                    <div class="mr-2 lg:hidden block mt-1">Book</div>
                    <div
                      class="flex items-center lg:mr-3 mt-3 font-bold justify-center bg-green-900 text-white rounded-full h-8 w-8 py-2 px-2.5 text-sm mb-2"
                    >
                      {{ i + 1 }}
                    </div>
                  </div>
                  <div class="w-full lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300 lg:block hidden">
                      Book Title
                    </label>
                    <input
                      class="shadow-md px-2 py-2 text-xs rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                      v-model="b.book_title"
                      placeholder="book title"
                      type="text"
                      required
                    />
                  </div>
                  <div class="w-full lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300 lg:block hidden">
                      Book Author
                    </label>
                    <input
                      class="shadow-md px-2 py-2 text-xs rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                      v-model="b.book_author"
                      placeholder="book author"
                      type="text"
                      required
                    />
                  </div>
                  <div class="w-full lg:mb-0 mb-2">
                    <label class="text-[10px] text-gray-300 lg:block hidden">
                      Book Call Number
                    </label>
                    <input
                      class="shadow-md px-2 py-2 text-xs rounded-md w-full lg:border-2 border border-[#225c21] capitalize"
                      v-model="b.book_call_number"
                      placeholder="book call number"
                      type="text"
                      required
                    />
                  </div>
                  <div
                    class="flex items-center lg:static absolute top-3 right-0"
                    v-if="books.length > 1"
                  >
                    <div class="mr-2 lg:hidden block">Remove</div>
                    <div
                      class="flex items-center lg:ml-5 lg:mt-5 justify-center hover:bg-white bg-red-900 border border-red-900 hover:text-red-900 text-white rounded-full h-8 w-8 pt-2 pb-1.5 px-2.5 text-sm"
                      @click="removeRow(b)"
                    >
                      <i class="fa fa-close"></i>
                    </div>
                  </div>
                </div>
                <div class="lg:w-10/12 lg:mx-auto">
                  <button
                    v-if="limitCounter > 1"
                    class="hover:text-[#f4ca16] border border-[#f4ca16] text-white cursor-pointer w-fit mb-3 hover:bg-white bg-[#f4ca16] font-bold uppercase text-xs rounded-md px-3 py-2 text-center lg:-ml-2"
                    @click="addBooks"
                  >
                    <i class="fa fa-plus mr-1"></i> Add Book
                  </button>
                </div>
              </div>
              <div
                v-if="allFieldsAreRequired"
                class="text-white w-full bg-red-800 text-sm px-3 py-2 rounded-md text-center"
              >
                Date and Time and other fields are required!
              </div>
              <div class="mt-5 mb-3 w-fit lg:mx-auto mr-0 ml-auto">
                <button
                  class="hover:text-green-800 border border-green-800 text-white hover:bg-white bg-green-800 uppercase text-xs rounded-md w-fit mx-auto px-5 py-2 text-center font-bold lg:mb-0 mb-5"
                >
                  Submit <i class="fa fa-paper-plane" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div></div>
    <div>
      <div id="fb-root"></div>
      <div id="fb-customer-chat-library" class="fb-customerchat"></div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
  .sub-header {
    background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/banners/LMC/LMCBanner.png");
    background-position: center;
    background-size: 100% 100%;
  }
  input[type="radio"]:disabled {
    background-color: #e2e2e2;
    accent-color: #e2e2e2;
  }
  input[type='radio'] {
    color: #005715;
    outline: none;
    box-shadow: none; 
  }
</style>