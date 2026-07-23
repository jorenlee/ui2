<script setup>
import { onMounted, onBeforeUnmount, ref, watch, watchEffect } from "vue";
import scheduleJSON from "./schedule.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import moment from "moment";
import "./css/main.css";
import _ from "lodash";
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);
const title = ["LRC Book Thru", "(lrc)", "Book Thru"];
const timeSelection = ref(scheduleJSON.timeSelection);

// ✅ Loading State
const isLoading = ref(true);
const isSubmitting = ref(false);

// ✅ Data States
const schedulesListsData = ref([]);
const books = ref([]);
const searchForAvailableBooks = ref("");
let highlightedDates = ref([]);
const minDate = ref(new Date());
let currentHour = ref(moment().format("hh:mm A"));
let id = ref();
let limitCounter = ref(0);
let allFieldsAreRequired = ref(false);

let timeList = ref([]);
const pickedTime = ref();
let displayForm = ref(false);

let filterSearchBooks = ref([]);
let searchIconBtnClicked = ref(false);
const submissionForm = ref(true);

// ✅ Toaster notification
const toaster = ref({
  show: false,
  message: "",
  type: "success", // success, error, warning, info
});

const showToaster = (message, type = "success", duration = 4000) => {
  toaster.value.message = message;
  toaster.value.type = type;
  toaster.value.show = true;

  setTimeout(() => {
    toaster.value.show = false;
  }, duration);
};

// ✅ Booking schedule info
const schedule = ref({
  date: "",
  time: [], // MUST be array
  updated_at: new Date(),
});
const info = ref({
  borrower_category: "",
  id_number: "",
  firstname: "",
  lastname: "",
  email: "",
  books: [],
  booking_date: "",
  booking_time: "",
  status: "pending",
  created_by_email: "",
  updated_at: new Date(),
});

// ✅ Ensure schedule.time is always an array
watch(() => schedule.value.time, (newVal) => {
  if (!Array.isArray(newVal)) {
    schedule.value.time = [];
  }
}, { immediate: true });

const menuList = [
  { label: "Learning Resource Center", link: "/library" },
  { label: "LRC Book Thru", link: "/library/LRCBookThru" },
  {
    label: "Online Public Access Catalog",
    link: "https://lsu-opac.follettdestiny.com",
  },
  {
    label: "Library Overview",
    link: "/library/overview",
  },
  {
    label: "Online Library Services",
    link: "/library/new-normal",
  },
  {
    label: "Library Collection",
    link: "/library/collection",
  },
  {
    label: "Library and Information Services Month",
    link: "/library",
  },
  {
    label: "Virtual Library Programs",
    link: "/library",
  },
  {
    label: "Library Gamification System",
    link: "/library",
  },
  {
    label: "Library Personnel",
    link: "/library",
  },
  {
    label: "Webinars and Workshops",
    link: "/library",
  },
  {
    label: "Library Opening Hours",
    link: "/library",
  },
  {
    label: "Privacy Policy Statement",
    link: "/library/privacy-policy",
  },
];

// ✅ Initial fetch
const fetchInitialData = async () => {
  try {
    isLoading.value = true;
    const [scheds, bookList] = await Promise.all([
      $fetch(endpoint.value + "/api/library/schedule/booking/list/"),
      $fetch(endpoint.value + "/api/library/reports/book/list/"),
    ]);
    schedulesListsData.value = scheds || [];
    books.value = bookList || [];
    highlightedDates.value = schedulesListsData.value.map((s) => s.date);
  } catch (e) {
    console.error("Initial data fetch error:", e);
    showToaster("Failed to load data. Please refresh the page.", "error");
  } finally {
    isLoading.value = false;
  }
};

// ✅ Silent refetch every second
let silentFetchInterval = null;
const fetchSchedulesSilently = async () => {
  try {
    const fresh = await $fetch(
      endpoint.value + "/api/library/schedule/booking/list/",
    );
    if (JSON.stringify(schedulesListsData.value) !== JSON.stringify(fresh)) {
      schedulesListsData.value = fresh || [];
      highlightedDates.value = schedulesListsData.value.map((s) => s.date);
      if (schedule.value.date) updateAvailableTimeSlots();
    }
  } catch (e) {
    console.warn("Silent fetch failed:", e);
  }
};

// ✅ onMounted setup
onMounted(async () => {
  await fetchInitialData();

  interval = setInterval(() => {
    currentHour.value = moment().format("HH:mm");
    if (schedule.value.date) updateAvailableTimeSlots();
  }, 1000);

  silentFetchInterval = setInterval(() => {
    fetchSchedulesSilently();
  }, 1000);
});

// ✅ Cleanup
onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (silentFetchInterval) clearInterval(silentFetchInterval);
});

let interval = null;

const setDate = (value) => {
  schedule.value.date = moment(value).format("MM-DD-YYYY");
  updateAvailableTimeSlots();
};

const updateAvailableTimeSlots = () => {
  const today = moment().format("MM-DD-YYYY");
  const now = moment();

  const match = schedulesListsData.value.find(
    (s) => s.date === schedule.value.date,
  );

  if (!match) {
    schedule.value.time = [];
    return;
  }

  // Ensure match.time is an array
  if (!Array.isArray(match.time)) {
    console.warn("match.time is not an array:", match.time);
    schedule.value.time = [];
    return;
  }

  id.value = match.id;

  // Filter time slots for today (only future times) or show all for future dates
  schedule.value.time =
    match.date === today
      ? match.time.filter((t) => {
          if (!t || !t.range_from_time) return false;
          return moment(t.range_from_time, "hh:mm A").isAfter(now);
        })
      : [...match.time];
};

// ✅ Improved search with debounce
const searchBooks = () => {
  if (
    !searchForAvailableBooks.value ||
    searchForAvailableBooks.value.trim() === ""
  ) {
    filterSearchBooks.value = [];
    return;
  }

  const searchTerm = searchForAvailableBooks.value.toLowerCase().trim();
  filterSearchBooks.value = books.value.filter((book) => {
    const titleMatch = book.title?.toLowerCase().includes(searchTerm);
    const authorMatch = book.author?.toLowerCase().includes(searchTerm);
    const callNumberMatch = book.call_number
      ?.toLowerCase()
      .includes(searchTerm);
    return titleMatch || authorMatch || callNumberMatch;
  });

  if (filterSearchBooks.value.length === 0) {
    showToaster("No books found matching your search.", "info", 2000);
  }
};

const listAvailableBooksBtn = () => {
  searchIconBtnClicked.value = true;
  setTimeout(() => (searchIconBtnClicked.value = false), 2000);
  searchBooks();
};

// Watch for search input changes (search as you type)
watch(searchForAvailableBooks, () => {
  if (searchForAvailableBooks.value.length >= 2) {
    searchBooks();
  } else if (searchForAvailableBooks.value.length === 0) {
    filterSearchBooks.value = [];
  }
});

// ✅ Add book from search results
const addBooks = async (obj) => {
  // Check if book is already in the list
  const alreadyAdded = info.value.books.some(
    (book) => book.book_call_number === obj.call_number,
  );

  if (alreadyAdded) {
    showToaster("This book is already in your list!", "warning");
    return;
  }

  if (limitCounter.value <= 0) {
    showToaster("You have reached your borrowing limit!", "warning");
    return;
  }

  if (!obj.number_of_copies || obj.number_of_copies <= 0) {
    showToaster("This book is not available!", "error");
    return;
  }

  obj.number_of_copies--;
  info.value.books.push({
    book_title: obj.title,
    book_author: obj.author,
    book_call_number: obj.call_number,
  });
  limitCounter.value--;

  try {
    await editForm(obj);
    showToaster(`"${obj.title}" added to your list!`, "success", 2000);
    filterSearchBooks.value = [];
    searchForAvailableBooks.value = "";
  } catch (error) {
    console.error("Error adding book:", error);
    showToaster("Failed to add book. Please try again.", "error");
    // Rollback changes
    obj.number_of_copies++;
    info.value.books.pop();
    limitCounter.value++;
  }
};

// ✅ Manually add empty book entry
const addManualBook = () => {
  if (limitCounter.value <= 0) {
    showToaster("You have reached your borrowing limit!", "warning");
    return;
  }

  // Add empty book entry for manual input
  info.value.books.push({
    book_title: "",
    book_author: "",
    book_call_number: "",
  });

  limitCounter.value--;
  showToaster("Book entry added. Please fill in the details.", "info", 2000);
};

const editForm = async (obj) => {
  let booksData =
    (await $fetch(
      endpoint.value + "/api/library/reports/book/" + obj.id + "/",
    ).catch((error) => error.data)) || 0;
  booksData.number_of_copies--;
  await $fetch(
    endpoint.value + "/api/library/reports/book/edit/" + obj.id + "/",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: booksData,
    },
  );
};

// ✅ Remove book from list
const removeRow = async (obj) => {
  try {
    // Check if this book was added from library search (has call number in library)
    const bookInLibrary = books.value.find(
      (params) => params.call_number === obj.book_call_number,
    );

    // If book exists in library, restore the copy count
    if (bookInLibrary) {
      bookInLibrary.number_of_copies++;
      await reverseEditForm(bookInLibrary);
    }

    // Remove book from the borrowing list
    _.pull(info.value.books, obj);
    limitCounter.value++;
    filterSearchBooks.value = [];

    const bookTitle = obj.book_title || "Book";
    showToaster(`"${bookTitle}" removed from your list.`, "info", 2000);
  } catch (error) {
    console.error("Error removing book:", error);
    showToaster("Failed to remove book. Please try again.", "error");
  }
};

const reverseEditForm = async (obj) => {
  let booksData =
    (await $fetch(
      endpoint.value + "/api/library/reports/book/" + obj.id + "/",
    ).catch((error) => error.data)) || 0;
  booksData.number_of_copies++;
  await $fetch(
    endpoint.value + "/api/library/reports/book/edit/" + obj.id + "/",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: booksData,
    },
  );
};

const defaultIDNumber = () => {
  displayForm.value = true;
  info.value.id_number = "";
};

const borrowerCategoryLimit = () => {
  if (["Faculty", "Staff"].includes(info.value.borrower_category)) {
    limitCounter.value = 20;
  } else if (info.value.borrower_category === "Student") {
    limitCounter.value = 15;
  } else {
    limitCounter.value = 0;
  }

  defaultIDNumber();

  // Initialize with one empty book entry
  info.value.books = [
    { book_title: "", book_author: "", book_call_number: "" },
  ];

  // Decrease limit counter since we added one book entry
  if (limitCounter.value > 0) {
    limitCounter.value--;
  }
};

const updateSchedule = async () => {
  try {
    // Ensure schedule.time is an array
    if (!Array.isArray(schedule.value.time)) {
      console.error("schedule.time is not an array:", schedule.value.time);
      schedule.value.time = [];
    }

    // Calculate remaining time slots after removing the picked time
    timeList.value =
      schedule.value.time.length === 1
        ? [
            {
              range_from_time: "",
              range_to_time: "",
              _12_hour_format_from: "",
              _12_hour_format_to: "",
            },
          ]
        : _.filter(
            schedule.value.time,
            (params) =>
              params.range_from_time !== pickedTime.value.range_from_time &&
              params.range_to_time !== pickedTime.value.range_to_time,
          );

    // Update the schedule in the database
    await $fetch(
      endpoint.value + "/api/library/schedule/booking/" + id.value + "/edit/",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: {
          date: schedule.value.date,
          time: timeList.value,
          updated_at: schedule.value.updated_at,
        },
      },
    );

    // Send email notification
    await submitAppointmentToGmail();
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error; // Re-throw to be caught by submitForm
  }
};

const isTimeAvailable = (t) => {
  if (!Array.isArray(schedule.value.time)) return false;

  return schedule.value.time.some(
    (s) =>
      s.range_from_time === t._12_hour_format_from &&
      s.range_to_time === t._12_hour_format_to,
  );
};

const createBtn = () => {
  submitForm();
};

// ✅ Validation helper functions
const validateSchedule = () => {
  if (!schedule.value.date) {
    showToaster("Please select a date.", "warning");
    return false;
  }
  if (!pickedTime.value) {
    showToaster("Please select a time slot.", "warning");
    return false;
  }
  return true;
};

const validatePersonalInfo = () => {
  if (!info.value.borrower_category) {
    showToaster("Please select borrower category.", "warning");
    return false;
  }

  const requiredFields = {
    id_number: "ID Number",
    firstname: "First Name",
    lastname: "Last Name",
    email: "Email"
  };

  for (const [field, label] of Object.entries(requiredFields)) {
    if (!info.value[field]) {
      showToaster(`${label} is required.`, "warning");
      return false;
    }
  }
  return true;
};

const validateBooks = () => {
  if (info.value.books.length === 0) {
    showToaster("Please add at least one book to borrow.", "warning");
    return false;
  }

  const emptyBook = info.value.books.find(
    (book) => !book.book_title || !book.book_author || !book.book_call_number
  );

  if (emptyBook) {
    showToaster("Please fill in all book details (Title, Author, Call Number).", "warning");
    return false;
  }
  return true;
};

// ✅ Scroll to top helper
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// ✅ Reset form after successful submission
const resetForm = () => {
  info.value = {
    borrower_category: "",
    id_number: "",
    firstname: "",
    lastname: "",
    email: "",
    books: [],
    booking_date: "",
    booking_time: "",
    status: "pending",
    created_by_email: "",
    updated_at: new Date(),
  };

  schedule.value.date = "";
  pickedTime.value = null;
  limitCounter.value = 0;
  displayForm.value = false;
  searchForAvailableBooks.value = "";
  filterSearchBooks.value = [];
};

// ✅ Submit form
const submitForm = async () => {
  // Run all validations
  if (!validateSchedule() || !validatePersonalInfo() || !validateBooks()) {
    scrollToTop();
    return;
  }

  // Prevent double submission
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  // Prepare booking data
  info.value.booking_date = schedule.value.date;
  info.value.booking_time = `${pickedTime.value._12_hour_format_from} - ${pickedTime.value._12_hour_format_to}`;
  info.value.created_by_email = info.value.email;

  try {
    const response = await $fetch(endpoint.value + "/api/library/booking/create/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: info.value,
    });

    if (response.status === "errors") {
      allFieldsAreRequired.value = true;
      setTimeout(() => (allFieldsAreRequired.value = false), 10000);
      showToaster("Please check all required fields.", "error");
      scrollToTop();
    } else {
      await updateSchedule();
      submissionForm.value = false;
      showToaster("🎉 Appointment booked successfully! Check your email for confirmation.", "success", 5000);
      scrollToTop();

      // Reset form after successful submission
      setTimeout(() => {
        resetForm();
      }, 1000);
    }
  } catch (error) {
    console.error("Submission error:", error);
    showToaster("Failed to submit appointment. Please try again.", "error");
    scrollToTop();
  } finally {
    isSubmitting.value = false;
  }
};

const submitAppointmentToGmail = async () => {
  try {
    await $fetch(endpoint.value + "/api/library/submit-appointment-to-gmail/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: info.value,
    });
  } catch (error) {
    console.error("Failed to send email notification:", error);
    // Don't show error to user since booking was successful
  }
};
</script>

<template>
  <div>
    <!-- Toaster Notification -->
    <transition name="fade">
      <div
        v-if="toaster.show"
        class="fixed top-1/2 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl text-white font-medium flex items-center gap-3 max-w-md animate-slide-in"
        :class="{
          'bg-green-600': toaster.type === 'success',
          'bg-red-600': toaster.type === 'error',
          'bg-blue-600': toaster.type === 'info',
          'bg-yellow-600': toaster.type === 'warning',
        }"
      >
        <i
          class="fa text-xl"
          :class="{
            'fa-check-circle': toaster.type === 'success',
            'fa-exclamation-circle': toaster.type === 'error',
            'fa-info-circle': toaster.type === 'info',
            'fa-exclamation-triangle': toaster.type === 'warning',
          }"
        ></i>
        <span>{{ toaster.message }}</span>
      </div>
    </transition>

    <div class="bg-gray-50">
      <Header />
      <div class="">
        <div class="">
          <div class="relative">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/about.jpg"
              class="align-top w-full h-auto lg:object-fill lg:block hidden"
            />
            <img
              src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
              class="align-top w-full h-36 object-none lg:hidden block"
            />
            <div
              class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full"
            >
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

        <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
          <div class="shadow lg:w-4/12 my-5 bg-white overflow-hidden">
            <DynamicSideMenu :items="menuList" title="Sub Pages" />
          </div>

          <div class="w-full">
            <div
              v-if="!submissionForm"
              class="lg:flex gap-10 rounded-4xl bg-white lg:px-14 px-3 py-1 w-fit mx-auto lg:my-10 shadow-sm rounded-xl"
            >
              <div class="flex items-center">
                <img
                  src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/check-mark-icon-isolated-on-white-background-vector-26464923.jpg"
                  class="lg:w-44 w-20 mx-auto lg:mt-0 mt-14"
                />
              </div>
              <div
                class="text-xl text-green-900 text-center w-fit mx-auto lg:py-20 py-5"
              >
                <h1 class="font-bold text-3xl">Thanks for submitting!</h1>
                <p class="font-light pt-3 pb-10">
                  your appointment request has been sent!
                </p>
                <p class="font-light italic mb-10">Please Check your Email.</p>
                <a
                  href="https://lsu.edu.ph/library"
                  class="bg-green-800 text-white rounded-3xl py-1.5 px-10 lg:mb-0 mb-5 mx-auto block w-fit"
                  >Go Back to LRC</a
                >
              </div>
            </div>
            <div
              v-if="submissionForm"
              class="text-xs lg:mb-5 bg-white lg:mt-5 shadow-xl rounded-xl"
            >
              <div class="">
                <div
                  class="bg-green-900 py-0.5 lg:mb-10 mb-4 text-base font-medium text-white text-center uppercase tracking-tight"
                >
                  LRC Book Thru
                </div>
                <form v-on:submit.prevent="createBtn" class="px-3">
                  <div class="lg:w-fit w-auto mx-auto lg:flex lg:gap-20">
                    <div>
                      <div
                        v-if="isLoading"
                        class="flex justify-center items-center lg:py-10"
                      >
                        <div
                          class="border w-[310px] h-[310px] shadow flex items-center space-y-2 text-gray-600"
                        >
                          <div class="flex w-fit mx-auto gap-x-5">
                            <svg
                              class="animate-spin h-6 w-6 text-blue-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                              ></circle>
                              <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                              />
                            </svg>
                            <p class="text-sm font-medium">
                              Scanning available schedules ...
                            </p>
                          </div>
                        </div>
                      </div>

                      <div class="lg:w-fit mb-1" v-else>
                        <div class="">
                          <h1
                            class="font-bold lasalle-green-text text-xs text-center capitalize mb-3"
                          >
                            Date
                          </h1>
                          <div class="mx-auto w-fit">
                            <VueDatePicker
                              v-model="schedule.date"
                              inline
                              :enable-time-picker="false"
                              name="date"
                              auto-apply
                              :highlight="highlightedDates"
                              @update:model-value="setDate(schedule.date)"
                              :year-range="[2026, 2026]"
                              :disabled-week-days="[0, 7]"
                              week-start="0"
                              :allowed-dates="highlightedDates"
                              :min-date="minDate"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <!-- Time Section - Hidden while loading -->
                    <div
                      v-if="!isLoading"
                      class="mx-auto shadow lg:h-fit lg:my-auto border rounded-sm my-3"
                    >
                      <h1
                        class="border-b-2 border-green-900 text-center font-bold text-green-900 lg:whitespace-nowrap capitalize pt-3 pb-3 mb-3"
                      >
                        Time
                      </h1>
                      <div class="w-full rounded-md justify-center">
                        <ul class="grid lg:grid-cols-3 grid-cols-2">
                          <li
                            class="flex items-center mb-3 font-semibold whitespace-nowrap w-fit justify-left lg:mx-7 mx-2.5 gap-x-2"
                            v-for="(t, i) in timeSelection[0].time"
                            :key="i"
                          >
                            <input
                              type="radio"
                              name="time"
                              :value="t"
                              class="mr-2 mt-0.5"
                              v-model="pickedTime"
                              v-if="isTimeAvailable(t)"
                              :id="i"
                              required
                            />

                            <input
                              type="radio"
                              class="mr-2 mt-0.5"
                              disabled
                              v-else
                            />

                            <label
                              :for="i"
                              class="lg:text-xs text-[10px]"
                              :class="
                                isTimeAvailable(t)
                                  ? 'text-[#087830] font-bold'
                                  : 'text-gray-400 font-light'
                              "
                            >
                              {{ t._12_hour_format_from }} -
                              {{ t._12_hour_format_to }}
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <!-- {{ pickedTime }}
            <div @click="updateSchedule">updateSchedule</div> -->
                  <!-- Borrower Category and Form Section - Hidden while loading -->
                  <div v-if="!isLoading" class="lg:w-11/12 mx-auto lg:p-5">
                    <div class="lg:flex gap-2 lg:mb-3 lg:mt-0 mt-3">
                      <div class="flex lg:w-9/12 mx-auto gap-2">
                        <div class="lg:w-fit w-full mx-auto lg:mb-0 mb-2">
                          <label class="text-[10px] text-gray-800">
                            Borrower Category
                          </label>
                          <select
                            v-model="info.borrower_category"
                            name="borrower_category"
                            class="shadow-lg pl-2 pr-3 pt-2 pb-[6.5px] w-full border-b-2 border-green-800 capitalize"
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
                        <div class="w-full lg:mb-0 mb-2" v-if="displayForm">
                          <label class="text-[10px] text-gray-800">
                            ID Number
                          </label>
                          <input
                            class="shadow-lg px-2 py-2 text-xs w-full border-b-2 border-green-800 capitalize"
                            v-model="info.id_number"
                            placeholder="ID Number"
                            type="text"
                            required
                          />
                        </div>
                      </div>
                      <div class="flex lg:w-full gap-2" v-if="displayForm">
                        <div class="w-full lg:mb-0 mb-2">
                          <label class="text-[10px] text-gray-800">
                            First Name
                          </label>
                          <input
                            class="shadow-lg text-xs px-2 py-2 w-full border-b-2 border-green-800 capitalize"
                            v-model="info.firstname"
                            placeholder="first Name"
                            type="text"
                            required
                          />
                        </div>
                        <div class="w-full lg:mb-0 mb-2">
                          <label class="text-[10px] text-gray-800">
                            Last Name
                          </label>
                          <input
                            class="shadow-lg text-xs px-2 py-2 w-full border-b-2 border-green-800 capitalize"
                            v-model="info.lastname"
                            placeholder="last Name"
                            type="text"
                            required
                          />
                        </div>
                      </div>
                      <div
                        class="lg:w-10/12 w-full lg:mb-0 mb-2"
                        v-if="displayForm"
                      >
                        <label class="text-[10px] text-gray-800"> Email </label>
                        <input
                          class="shadow-lg text-xs px-2 py-2 w-full border-b-2 border-green-800"
                          v-model="info.email"
                          placeholder="Email"
                          type="email"
                          required
                        />
                      </div>
                    </div>
                    <!-- <div class="lg:flex gap-2 lg:mb-3"></div> -->
                    <div
                      class="lg:shadow lg:rounded-lg lg:px-2 lg:py-3 lg:mt-0 mt-5"
                    >
                      <div
                        class="bg-green-50 border-l-4 border-green-600 p-4 mb-4 rounded-r-lg"
                      >
                        <div class="flex items-start">
                          <i
                            class="fa fa-info-circle text-green-600 text-xl mr-3 mt-1"
                          ></i>
                          <div>
                            <p class="text-green-900 text-sm font-medium mb-1">
                              Search for Available Books
                            </p>
                            <p class="text-green-800 text-xs">
                              Open this link
                              <a
                                class="font-bold underline hover:text-green-600 transition-colors"
                                target="_blank"
                                href="https://lsu-opac.follettdestiny.com"
                              >
                                OPAC
                              </a>
                              for the available resources or use the search
                              below.
                              <span class="block mt-1 italic text-green-700">
                                (Please select borrower category first)
                              </span>
                            </p>
                            <div
                              v-if="limitCounter > 0"
                              class="mt-2 flex items-center gap-2"
                            >
                              <span
                                class="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                <i class="fa fa-book mr-1"></i>
                                Book Limit Counter: {{ limitCounter }}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="limitCounter > 0">
                        <div class="lg:w-8/12 mx-auto lg:my-5">
                          <div
                            class="flex shadow-lg rounded-lg overflow-hidden border-2 border-green-800"
                          >
                            <div class="relative flex-1">
                              <input
                                v-model="searchForAvailableBooks"
                                placeholder="Search by title, author, or call number..."
                                class="text-sm text-green-900 px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-600"
                                @keyup.enter="listAvailableBooksBtn"
                              />
                              <i
                                v-if="searchForAvailableBooks"
                                @click="
                                  searchForAvailableBooks = '';
                                  filterSearchBooks = [];
                                "
                                class="fa fa-times absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              ></i>
                            </div>
                            <button
                              @click="listAvailableBooksBtn"
                              class="bg-green-800 hover:bg-green-700 text-white px-6 transition-colors duration-200 flex items-center gap-2"
                            >
                              <i class="fa fa-search text-lg"></i>
                              <span class="hidden lg:inline font-medium"
                                >Search</span
                              >
                            </button>
                          </div>
                          <p
                            class="text-xs text-gray-600 mt-2 text-center italic"
                          >
                            <i class="fa fa-info-circle mr-1"></i>
                            Search automatically as you type (minimum 2
                            characters)
                          </p>
                        </div>
                        <div
                          class="lg:mb-10 mb-3 lg:bg-white bg-green-50 lg:text-black text-gray-800 shadow-xl rounded-lg overflow-hidden"
                        >
                          <div class="appointment-lists mx-auto text-xs">
                            <div class="">
                              <!-- Search Results Header -->
                              <div
                                v-if="filterSearchBooks.length > 0"
                                class="header w-full bg-gradient-to-r from-green-800 to-green-700 text-white lg:flex hidden items-center"
                              >
                                <ul
                                  class="lg:flex w-full justify-center text-center whitespace-nowrap uppercase font-semibold"
                                >
                                  <li
                                    class="border-r border-green-600 py-3 px-2 w-full"
                                  >
                                    <i class="fa fa-book mr-2"></i>Title
                                  </li>
                                  <li
                                    class="border-r border-green-600 py-3 px-2 w-full"
                                  >
                                    <i class="fa fa-user mr-2"></i>Author
                                  </li>
                                  <li
                                    class="border-r border-green-600 py-3 px-2 w-full"
                                  >
                                    <i class="fa fa-barcode mr-2"></i>Call
                                    Number
                                  </li>
                                  <li
                                    class="border-r border-green-600 py-3 px-2 w-full"
                                  >
                                    <i class="fa fa-copy mr-2"></i>Copies
                                  </li>
                                  <!-- <li class="py-3 px-2 lg:w-52">
                                  <i class="fa fa-check-circle mr-2"></i>Action
                                </li> -->
                                </ul>
                              </div>
                              <!-- Search Results -->
                              <div
                                class="w-full rows max-h-96 overflow-y-auto"
                                v-if="filterSearchBooks.length > 0"
                              >
                                <ul
                                  class="lg:flex w-full justify-center lg:text-center h-auto border-b border-gray-200 lg:py-0 py-5 hover:bg-green-50 transition-colors duration-150"
                                  v-for="(b, i) in _.orderBy(
                                    filterSearchBooks,
                                    'id',
                                    'asc',
                                  )"
                                  :key="i"
                                  :class="
                                    i % 2 ? 'lg:bg-gray-50' : 'lg:bg-white'
                                  "
                                >
                                  <li
                                    class="px-2 w-full lg:flex items-center justify-evenly lg:border-r border-gray-200 lg:h-10 lg:mb-0 mb-2 lg:gap-0 gap-5"
                                  >
                                    <span class="font-bold lg:hidden"
                                      >Title:</span
                                    >
                                    {{ b.title }}
                                  </li>
                                  <li
                                    class="px-2 w-full flex items-center lg:justify-evenly lg:border-r border-gray-200 lg:h-10 lg:gap-0 gap-5"
                                  >
                                    <span class="font-bold lg:hidden"
                                      >Author:</span
                                    >{{ b.author }}
                                  </li>
                                  <li
                                    class="px-2 w-full flex items-center lg:justify-evenly lg:border-r border-gray-200 lg:h-10 lg:gap-0 gap-5"
                                  >
                                    <span class="font-bold lg:hidden"
                                      >Call Number:</span
                                    >{{ b.call_number }}
                                  </li>
                                  <li
                                    class="px-2 w-full flex items-center lg:justify-evenly lg:border-r border-gray-200 lg:h-10 lg:mb-0 mb-5 lg:gap-0 gap-5"
                                  >
                                    <span class="font-bold lg:hidden"
                                      >Number of Copies:</span
                                    >{{ b.number_of_copies }}
                                  </li>
                                  <!-- <li
                                  class="px-2 lg:w-52 lg:h-10 flex items-center justify-center gap-2"
                                  v-if="b.number_of_copies > 0"
                                >
                                  <span
                                    class="bg-green-500 text-white font-semibold px-3 py-1 rounded-full text-[10px] lg:border-0 border-white border flex items-center gap-1"
                                  >
                                    <i class="fa fa-check-circle"></i>
                                    Available
                                  </span>
                                  <button
                                    @click="addBooks(b)"
                                    class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 font-bold px-3 py-1.5 rounded-lg uppercase shadow-lg cursor-pointer text-[10px] transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
                                  >
                                    <i class="fa fa-plus"></i>
                                    Add to List
                                  </button>
                                </li> -->
                                  <!-- <li
                                  class="px-2 lg:w-52 lg:h-10 lg:mb-0 mb-3 flex items-center justify-center"
                                  v-if="b.number_of_copies === 0"
                                >
                                  <span
                                    class="bg-red-500 text-white font-semibold px-3 py-1 rounded-full whitespace-nowrap border border-white flex items-center gap-1"
                                  >
                                    <i class="fa fa-times-circle"></i>
                                    Not Available
                                  </span>
                                </li> -->
                                </ul>
                              </div>
                              <!-- No Results Message -->
                              <div
                                v-if="
                                  filterSearchBooks.length === 0 &&
                                  searchForAvailableBooks !== '' &&
                                  searchForAvailableBooks.length >= 2
                                "
                                class="text-center py-10 px-4"
                              >
                                <i
                                  class="fa fa-search text-4xl text-gray-300 mb-3"
                                ></i>
                                <p class="text-gray-500 font-medium">
                                  No books found matching "{{
                                    searchForAvailableBooks
                                  }}"
                                </p>
                                <p class="text-gray-400 text-xs mt-2">
                                  Try searching with different keywords
                                </p>
                              </div>

                              <!-- Initial State Message -->
                              <div
                                v-if="
                                  filterSearchBooks.length === 0 &&
                                  searchForAvailableBooks === ''
                                "
                                class="text-center py-10 px-4"
                              >
                                <i
                                  class="fa fa-book text-4xl text-green-200 mb-3"
                                ></i>
                                <p class="text-gray-500 font-medium">
                                  Start searching for books
                                </p>
                                <p class="text-gray-400 text-xs mt-2">
                                  Enter at least 2 characters to search
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        class="shadow-xl p-4 lg:border-0 border-t bg-gradient-to-br from-green-50 to-white rounded-lg"
                        v-if="info.books.length > 0"
                      >
                        <div
                          class="bg-green-800 text-white rounded-lg p-3 mb-4"
                        >
                          <p
                            class="text-center font-bold flex items-center justify-center gap-2"
                          >
                            <i class="fa fa-list-alt"></i>
                            Final List of Books to be Borrowed
                            <span
                              class="bg-white text-green-800 px-2 py-0.5 rounded-full text-xs ml-2"
                            >
                              {{ info.books.length }}
                              {{ info.books.length === 1 ? "book" : "books" }}
                            </span>
                          </p>
                        </div>
                        <div
                          class="lg:flex lg:shadow-lg lg:p-5 gap-2 mb-4 relative bg-white rounded-lg border-l-4 border-green-600 hover:shadow-xl transition-shadow duration-200"
                          v-for="(b, i) in info.books"
                          :key="i"
                        >
                          <div class="flex items-center">
                            <div
                              class="mr-2 lg:hidden block mt-1 text-gray-600 font-medium"
                            >
                              Book
                            </div>
                            <div
                              class="flex items-center lg:mr-3 mt-3 font-bold justify-center bg-gradient-to-br from-green-800 to-green-700 text-white rounded-full h-10 w-10 shadow-md text-sm mb-2"
                            >
                              {{ i + 1 }}
                            </div>
                          </div>
                          <div class="w-full lg:mb-0 mb-2">
                            <label class="text-[10px] text-gray-800">
                              Book Title
                            </label>
                            <input
                              class="shadow-lg px-2 py-2 text-xs w-full border-b-2 border-[#225c21] capitalize"
                              v-model="b.book_title"
                              placeholder="book title"
                              type="text"
                              required
                            />
                          </div>
                          <div class="lg:w-6/12 lg:mb-0 mb-2">
                            <label class="text-[10px] text-gray-800">
                              Book Author
                            </label>
                            <input
                              class="shadow-lg px-2 py-2 text-xs w-full border-b-2 border-[#225c21] capitalize"
                              v-model="b.book_author"
                              placeholder="book author"
                              type="text"
                              required
                            />
                          </div>
                          <div class="lg:w-4/12 lg:mb-0 mb-2">
                            <label class="text-[10px] text-gray-800">
                              Book Call Number
                            </label>
                            <input
                              class="shadow-lg px-2 py-2 text-xs w-full border-b-2 border-[#225c21] capitalize"
                              v-model="b.book_call_number"
                              placeholder="book call number"
                              type="text"
                              required
                            />
                          </div>
                          <!-- Remove Button -->
                          <div
                            class="flex items-center lg:static absolute top-3 right-3"
                          >
                            <div
                              class="mr-2 lg:hidden block text-gray-600 font-medium"
                            >
                              Remove
                            </div>
                            <button
                              class="flex items-center lg:ml-5 lg:mt-5 justify-center hover:bg-red-600 bg-red-500 border-2 border-red-500 hover:border-red-600 text-white rounded-full h-9 w-9 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110"
                              @click="removeRow(b)"
                              title="Remove this book"
                            >
                              <i class="fa fa-trash text-sm"></i>
                            </button>
                          </div>
                        </div>
                        <!-- Add Book Button -->
                        <div
                          class="lg:w-10/12 lg:mx-auto"
                          v-if="limitCounter > 0"
                        >
                          <button
                            type="button"
                            class="hover:text-[#f4ca16] border-2 border-[#f4ca16] text-white cursor-pointer w-fit mb-3 hover:bg-white bg-[#f4ca16] font-bold uppercase text-xs rounded-md px-4 py-2.5 text-center lg:-ml-2 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                            @click="addManualBook"
                          >
                            <i class="fa fa-plus-circle"></i> Add Book
                          </button>
                        </div>
                      </div>
                    </div>
                    <!-- Error Message -->
                    <transition name="fade">
                      <div
                        v-if="allFieldsAreRequired"
                        class="text-white w-full bg-red-600 text-sm px-4 py-3 rounded-lg text-center shadow-lg flex items-center justify-center gap-2 animate-pulse"
                      >
                        <i class="fa fa-exclamation-triangle"></i>
                        Date, Time, and all fields are required!
                      </div>
                    </transition>

                    <!-- Submit Button -->
                    <div
                      class="mt-6 mb-3 w-fit lg:mx-auto mx-auto"
                      v-if="info.books.length > 0"
                    >
                      <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="group relative overflow-hidden bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white uppercase text-sm rounded-lg px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-2 min-w-[220px] justify-center"
                      >
                        <i
                          v-if="!isSubmitting"
                          class="fa fa-paper-plane group-hover:translate-x-1 transition-transform duration-300"
                        ></i>
                        <svg
                          v-else
                          class="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>{{ isSubmitting ? 'Submitting...' : 'Submit Appointment' }}</span>
                        <span
                          v-if="!isSubmitting"
                          class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        ></span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
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

input[type="radio"] {
  color: #005715;
  outline: none;
  box-shadow: none;
}

/* Toaster Animations */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Smooth scrollbar for search results */
.rows::-webkit-scrollbar {
  width: 8px;
}

.rows::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.rows::-webkit-scrollbar-thumb {
  background: #166534;
  border-radius: 10px;
}

.rows::-webkit-scrollbar-thumb:hover {
  background: #14532d;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
