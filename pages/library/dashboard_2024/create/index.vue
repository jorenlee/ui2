<script setup>
import { onMounted } from "vue";
import { useUserStore } from "~/stores/user";
const router = useRouter();
import moment from "moment";
const userStore = useUserStore();
import _ from "lodash";
const endpoint = ref(userStore.mainDevServer);
import scheduleJSON from "../schedule.json";
import collegeOrSchoolJSON from "../college_school.json";
import courseOrProgramJSON from "../course_program.json";
import courseMajorJSON from "../course_major.json";

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
let addBtn = ref(true);

const cantSelectCurrentDateText = ref(false);
const timeSelectionList = ref(true);

const minDate = ref(new Date());

const developerEmail = ref(userStore.user.developerEmail);

onMounted(() => {
  if (
    userStore.user.isAuthenticated &&
    userStore.user.email === developerEmail.value
  ) {
    schedulesListsData.filter(function (params) {
      date.value = params.date;
      highlightedDates.value.push(params.date);
    });
    created_by_email.value = userStore.user.email;
  } else {
    router.push("/unauthorized");
  }
});

let firstname = ref("");
let lastname = ref("");
let college = ref("");
let courseProgram = ref();
let courseYear = ref();
let courseMajor = ref();
let email = ref(userStore.user.email);
let student_id = ref("");
let borrower_category = ref("");
let book_title = ref("");
let book_description = ref("");
let booking_date = ref();
let booking_time = ref();
let status = ref("Pending");
let created_by_email = ref(userStore.user.email);
let updated_at = ref("Jan 1, 2024");
let errors = ref([]);

let timeList = ref();

let toggleSideBarMenu = ref(true);

const collegeOrSchool = ref(collegeOrSchoolJSON);
const courseOrProgram = ref(courseOrProgramJSON);
const courseMajorList = ref(courseMajorJSON);

let collegeOrSchoolData = collegeOrSchool._rawValue;
let courseOrProgramData = courseOrProgram._rawValue;
let courseMajorListData = courseMajorList._rawValue;

let filteredCourseOrProgram = computed(() =>
  courseOrProgramData.filter(function (params) {
    if (params.college_or_school_id === college.value) {
      return params.name;
    }
  })
);

let filteredCourseMajor = computed(() =>
  courseMajorListData.filter(function (params) {
    if (params.course_program_id === courseProgram.value) {
      return params.name;
    }
  })
);

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
  await $fetch(
    endpoint.value + "/api/library/schedule/booking/" + id.value + "/edit/",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        date: date.value,
        time: timeList.value,
        updated_at: updated_at.value,
      },
    }
  ).then((response) => {
    // console.log("response", response);
  });
};

const submitForm = async () => {
  // console.log("submitForm");

  errors.value = [];
  booking_date.value = date.value;
  booking_time.value = time.value;

  if (
    firstname.value == "" &&
    lastname.value == "" &&
    college.value == "" &&
    courseProgram.value == "" &&
    courseYear.value == "" &&
    courseMajor.value == "" &&
    email.value == "" &&
    student_id.value == "" &&
    borrower_category.value == "" &&
    book_title.value == "" &&
    book_description.value == "" &&
    booking_date.value == "" &&
    booking_time.value == "" &&
    status.value == ""
  ) {
    errors.value.push("Please fill in all fields.");
  }
  if (errors.value.length == 0) {
    updateSchedule();
    await $fetch(endpoint.value + "/api/library/booking/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        firstname: firstname.value,
        lastname: lastname.value,
        college: college.value,
        courseProgram: courseProgram.value,
        courseYear: courseYear.value,
        courseMajor: courseMajor.value,
        email: email.value,
        student_id: student_id.value,
        borrower_category: borrower_category.value,
        book_title: book_title.value,
        book_description: book_description.value,
        booking_date: booking_date.value,
        booking_time: booking_time.value,
        status: status.value,
        created_by_email: created_by_email.value,
        updated_at: updated_at.value,
      },
    }).then((response) => {
      // console.log("response", response);
      router.push("/library/dashboard/appointment");
    });
  }
};
</script>

<template>
  <div class="">
    <div class="flex">
      <div
        class="pt-7 pb-24 w-3/12 px-5 bg-gray-100 lg:block hidden"
        v-show="toggleSideBarMenu"
      >
        <LibraryMenuBarBorrower />
      </div>
      <div class="w-full">
        <div class="bg-green-800">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex lg:items-center text-white gap-5">
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
              <div class="lg:w-6/12 mx-auto lg:flex gap-10">
                <div class="mb-1">
                  <div class="">
                    <h1
                      class="font-bold lasalle-green-text text-xs text-center uppercase mb-3"
                    >
                      Calendar
                    </h1>
                    <!-- remove past dates using min-date disable weekends in calendar -->
                    <!-- set Sunday First in the Calendar using week-start=0 -->
                    <!-- hide-offset-dates -->
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
                        :min-date="minDate"
                      />
                    </div>
                  </div>
                </div>

                <div class="w-full">
                  <h1
                    class="text-center font-bold lasalle-green-text lg:whitespace-nowrap uppercase mb-3"
                  >
                    Available Time
                  </h1>
                  <div class="w-full border rounded-md pt-5 pb-2">
                    <ul class="mx-auto w-fit">
                      <li
                        class="mb-3 font-bold"
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
                            _.includes(timeList, t)
                              ? 'text-green-600'
                              : ' text-red-600'
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
                <div class="lg:flex gap-2">
                  <div class="w-full lg:mb-0 mb-2">
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="firstname"
                      placeholder="first Name"
                    />
                  </div>

                  <div class="w-full lg:mb-0 mb-2">
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="lastname"
                      placeholder="last Name"
                    />
                  </div>
                </div>

                <!-- 1px solid #e5e7eb; -->

                <div class="w-full lg:flex gap-2">
                  <div class="w-full lg:flex my-3">
                    <select
                      v-model="college"
                      name="college"
                      class="shadow-md p-2 rounded-md w-full border border-[#e5e7eb]"
                      required
                    >
                      <option value="">Select College or School</option>
                      <option value="" disabled>
                        CON (College of Nursing) - Walk In Enrollment
                      </option>
                      <option value="" disabled>
                        CTHM (College of Tourism and Hospitality Management) -
                        Walk In Enrollment
                      </option>
                      <option value="" disabled>BEd (Basic Education)</option>
                      <option
                        :value="college.name"
                        v-for="(college, i) in collegeOrSchoolData"
                        :key="i"
                      >
                        {{ college.name }}
                      </option>
                    </select>
                  </div>

                  <div class="w-full lg:flex my-3">
                    <select
                      v-model="courseProgram"
                      name="courseProgram"
                      class="shadow-md p-2 rounded-md w-full border border-[#e5e7eb]"
                      required
                    >
                      <option value="">Select Course Program</option>

                      <option
                        :value="cp.name"
                        v-for="(cp, i) in filteredCourseOrProgram"
                        :key="i"
                      >
                        {{ cp.name }}
                      </option>
                    </select>
                  </div>

                  <div class="w-full lg:flex my-3">
                    <select
                      v-model="courseMajor"
                      name="courseMajor"
                      class="shadow-md p-2 rounded-md w-full border border-[#e5e7eb]"
                      required
                    >
                      <option value="">Select Course Major</option>

                      <option value="N/A">N/A</option>
                      <option
                        :value="cm.name"
                        v-for="(cm, i) in filteredCourseMajor"
                        :key="i"
                      >
                        <span v-if="cm">{{ cm.name }}</span>
                      </option>
                    </select>
                  </div>
                </div>

                <div class="w-full lg:flex gap-2">
                  <div class="w-full lg:flex">
                    <select
                      v-model="courseYear"
                      name="courseYear"
                      class="shadow-md p-2 rounded-md w-full border border-[#e5e7eb]"
                      required
                    >
                      <option value="">Select Course Year</option>

                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                      <option value="6th Year">6th Year</option>
                      <option value="7th Year">7th Year</option>
                      <option value="8th Year">8th Year</option>
                      <option value="9th Year">9th Year</option>
                      <option value="10th Year">10th Year</option>
                    </select>
                  </div>

                  <div class="w-full lg:mb-0 mb-2">
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="student_id"
                      placeholder="student iD"
                    />
                  </div>

                  <div class="w-full lg:mb-0 mb-2">
                    <input
                      class="shadow-md p-2 rounded-md w-full border"
                      disabled
                      v-model="email"
                      placeholder="email"
                    />
                  </div>
                </div>
                <div class="lg:flex gap-2 lg:my-3">
                  <div class="w-full lg:mb-0 mb-2">
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="borrower_category"
                      placeholder="borrower category"
                    />
                  </div>

                  <div class="w-full lg:mb-0 mb-2">
                    <input
                      class="shadow-md p-2 rounded-md w-full border capitalize"
                      v-model="book_title"
                      placeholder="book title"
                    />
                  </div>
                </div>

                <div class="w-full lg:my-3">
                  <input
                    class="shadow-md p-2 rounded-md w-full border capitalize"
                    v-model="book_description"
                    placeholder="book description"
                  />
                </div>
                <!-- <div class="w-full my-3">
                  <input
                    class="shadow-md p-2 rounded-md w-full border capitalize"
                    v-model="status"
                    placeholder="status"
                  />
                </div> -->
                <div class="mt-5 w-fit mx-auto">
                  <button
                    class="text-white bg-green-800 uppercase text-xs rounded-md w-full sm:w-auto px-5 py-2 text-center"
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
    <div class="bg-green-900 p-3">
      <h1 class="text-center text-white text-xs">
        <span class="font-bold">Copyright © 2023 </span
        ><span>La Salle University - Ozamiz</span>
      </h1>
    </div>
  </div>
</template>

<style scoped>
/* input[type="radio"] {
  accent-color: #148600;
  background-color: #6eff58;
} */

input[type="radio"]:disabled {
  background-color: #ff8b8b;
  accent-color: #ff8f8f;
}
</style>
