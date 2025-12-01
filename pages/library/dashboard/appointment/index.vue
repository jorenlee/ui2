
<script setup>
import { onMounted, ref, onBeforeUnmount, toRaw, computed, nextTick, watch } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";
import { useRouter } from "vue-router";
import scheduleJSON from "./time.json";
import VueDatePicker from "@vuepic/vue-datepicker";
// import "@vuepic/vue-datepicker/dist/main.css";
import "./css/main.css";
import _ from "lodash"

const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

// Reactive state
const date = ref();
const highlightedDates = ref([]);
const timeSelection = ref(scheduleJSON.timeSelection);
const developerEmail = ref(userStore.user.developerEmail);
const bookingLibrary = ref([]);
const isEditingOrViewing = ref(false);
const loadingState = ref(false);
const editForm = ref(false);
const library = ref({});
const confirmModal = ref(false);
const toggleSideBarMenu = ref(true);

// Performance optimizations
let autoRefreshInterval = null;
let lastDataHash = '';
const REFRESH_INTERVAL = 2000; // Reduced from 1000ms to 2000ms
const allowedUsers = [
  developerEmail.value,
  "monaliza.mugot@lsu.edu.ph",
  "marilyn.bejec@lsu.edu.ph",
  "applejane.ebarle@lsu.edu.ph",
  "janekaren.gudmalin@lsu.edu.ph",
  "macy.beniola@lsu.edu.ph",
  "lynn.lumacad@lsu.edu.ph",
  "zosette.salas@lsu.edu.ph",
];

// Computed properties for better performance
const filteredBookings = computed(() => {
  if (!date.value) return [];
  return bookingLibrary.value.filter(b => b.booking_date === date.value);
});

const uniqueBookings = computed(() => {
  const seen = new Set();
  return filteredBookings.value.filter(item => {
    const key = `${item.id_number}_${item.booking_time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

const timeSlots = computed(() => {
  return [...new Set(uniqueBookings.value.map(item => item.booking_time))];
});

const dataList = computed(() => uniqueBookings.value);

// Utility functions (lodash alternatives)
const createHash = (data) => {
  return JSON.stringify(data).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
};

const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

// Optimized fetch functions
const fetchBookingData = async () => {
  try {
    const data = await $fetch(`${endpoint.value}/api/library/booking/list/`);
    bookingLibrary.value = data || [];
    lastDataHash = createHash(bookingLibrary.value);
    updateHighlightedDates();
  } catch (error) {
    console.error("Error fetching booking data:", error);
  }
};

const fetchBookingDataSilently = async () => {
  if (isEditingOrViewing.value) return;

  try {
    const newData = await $fetch(`${endpoint.value}/api/library/booking/list/`);
    const newHash = createHash(newData);
    
    if (newHash !== lastDataHash) {
      console.log("📊 Data changed, updating...");
      bookingLibrary.value = newData || [];
      lastDataHash = newHash;
      updateHighlightedDates();
      await cleanDuplicateIDNumbersInSameSlot();
    }
  } catch (error) {
    console.error("Silent refresh error:", error);
  }
};

const updateHighlightedDates = () => {
  highlightedDates.value = [...new Set(bookingLibrary.value.map(p => p.booking_date))].map(date => new Date(date));
};

const cleanDuplicateIDNumbersInSameSlot = async () => {
  if (!date.value) return;
  
  const grouped = new Map();
  filteredBookings.value.forEach(entry => {
    const key = `${entry.id_number}_${entry.booking_time}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(entry);
  });

  const toDelete = [];
  grouped.forEach(group => {
    if (group.length > 1) {
      toDelete.push(...group.slice(1).map(d => d.id));
    }
  });

  if (toDelete.length > 0) {
    try {
      await Promise.all(
        toDelete.map(id =>
          $fetch(`${endpoint.value}/api/library/booking/${id}/delete/`, {
            method: "DELETE",
          })
        )
      );
      console.log(`🧹 Cleaned ${toDelete.length} duplicates`);
      await fetchBookingData();
    } catch (error) {
      console.error("❌ Error deleting duplicates:", error);
    }
  }
};

const setDate = (value) => {
  date.value = moment(value).format("MM-DD-YYYY");
};


const goToBack = () => {
  library.value = {};
  editForm.value = false;
  isEditingOrViewing.value = false;
  // Data will be refetched automatically via watch()
};

const logOut = () => {
  isEditingOrViewing.value = false;
  router.push("/library/login");
  userStore.removeToken();
};

const goToEdit = async (id) => {
  isEditingOrViewing.value = true;
  editForm.value = true;
  loadingState.value = true;

  const cached = bookingLibrary.value.find(b => b.id === id);
  library.value = cached ? { ...cached } : { id };

  try {
    const liveData = await $fetch(`${endpoint.value}/api/library/booking/${id}/`);
    if (liveData?.id === id) {
      library.value = { ...liveData };
    }
  } catch (error) {
    console.error("❌ Failed to fetch booking:", error);
  } finally {
    loadingState.value = false;
  }
};


const editStatus = async () => {
  try {
    if (!library.value?.id) return;

    const payload = toRaw({
      borrower_category: library.value.borrower_category || "",
      id_number: library.value.id_number || "",
      firstname: library.value.firstname || "",
      lastname: library.value.lastname || "",
      email: library.value.email || "",
      books: library.value.books || [],
      booking_date: library.value.booking_date || "",
      booking_time: library.value.booking_time || "",
      status: library.value.status || "pending",
      created_by_email: library.value.created_by_email || library.value.email || "",
      updated_at: new Date().toISOString(),
      created_at: library.value.created_at || new Date().toISOString(),
    });

    const response = await $fetch(`${endpoint.value}/api/library/booking/${library.value.id}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    console.log("✅ Status updated:", response);

    // ✅ 1. Refetch latest booking data immediately
    await fetchBookingData();

    // ✅ 2. Update the calendar view (highlighted + time slots)
    if (date.value) setDate(date.value);

    // ✅ 3. Push to Gmail in background
    setTimeout(() => submitToGmail(), 0);

    // ✅ 4. Smooth transition back to list
    editForm.value = false;
    isEditingOrViewing.value = false;
    loadingState.value = false;
  } catch (err) {
    console.error("❌ Failed to update status:", err);
  }
};


const submitToGmail = debounce(async () => {
  try {
    await $fetch(`${endpoint.value}/api/library/submit-status-to-gmail/${library.value.id}/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: {
        id: library.value.id,
        status: library.value.status,
        email: library.value.email,
        updated_at: new Date(),
      },
    });
    console.log("✅ Status sent to Gmail");
  } catch (err) {
    console.error("❌ Gmail submit failed:", err);
  }
}, 500);

const startAutoRefresh = () => {
  clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(fetchBookingDataSilently, REFRESH_INTERVAL);
};

const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
};

const btnShowModal = () => { confirmModal.value = true; };
const btnConfirm = () => {
  loadingState.value = true;
  confirmModal.value = false;

  // Delay to allow modal animation
  setTimeout(() => {
    editStatus();
  }, 300);
};

const btnCloseModal = () => { confirmModal.value = false; };

// Initialize
await fetchBookingData();

onMounted(() => {
  if (userStore.user.isAuthenticated && allowedUsers.includes(userStore.user.email)) {
    startAutoRefresh();
    router.replace("/library/dashboard/appointment");
  } else {
    router.replace("/unauthorized");
  }
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>


<template>
  <div class="">
    <div class="flex min-h-screen" v-if="!editForm">
      <div
        class="pb-3 lg:w-3/12 bg-gray-100 z-10 w-full lg:block lg:static absolute"
        :class="toggleSideBarMenu ? 'lg:hidden' : ''"
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
        <div class="bg-green-700">
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex items-center text-white">
              <div
                @click="toggleSideBarMenu = !toggleSideBarMenu"
                class="min-w-10 px-1.5"
              >
                <i
                  class="fa text-3xl text-white"
                  :class="toggleSideBarMenu ? 'fa-caret-left' : 'fa-bars mr-3'"
                  aria-hidden="true"
                ></i>
              </div>
              <p class="font-bold">Dashboard</p>
            </div>
            <button @click="logOut()" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>

        <div class="border pb-5 m-5">
          <div>
            <div
              class="py-2 mb-5 text-center bg-green-900 text-white uppercase text-xs tracking-widest"
            >
              Appointments
            </div>
            <div class="px-2 lg:flex gap-3">
              <div class="w-fit mb-1">
                <div class="">
                  <div class="">
                    <VueDatePicker
                      v-model="date"
                      inline
                      :enable-time-picker="false"
                      name="date"
                      auto-apply
                      :highlight="highlightedDates"
                      @update:model-value="setDate(date)"
                      :year-range="[2025, 2025]"
                      :disabled-week-days="[0, 7]"
                      week-start="0"
                    />
                  </div>
                </div>
              </div>

              <div class="w-full relative">
                <div class="w-full border rounded-md">
                  <ul class="grid lg:grid-cols-3 justify-center lg:gap-2 p-2">
                    <li
                      class="font-bold border p-1 min-h-[30px]"
                      v-for="(t, i) in timeSelection[0]?.time"
                      :key="i"
                    >
                      <div class="">
                        <div class="flex justify-between w-full">
                          <div class="">
                            <!--<div
                              v-for="(d, i) in dataList"
                              :key="i"
                              :class="{
                                'text-red-700': d.status === 'pending',
                                'text-yellow-500': d.status === 'reserved',
                                'text-green-900': d.status === 'received',
                                'text-blue-300': d.status === 'returned',
                              }"
                            >
                              <span v-if="t === d.booking_time">
                                <span class="text-xs -mt-0.5 mb-3 block">{{
                                  d.booking_time
                                }}</span>
                              </span>
                            </div>-->
                            <!-- {{ d.booking_time }} JSON -->
                            <div
                              class="text-xs w-full"
                              :class="_.includes(t.time, t) ? 'hidden' : ''"
                            >
                              {{ t }}
                            </div>
                          </div>
                          <!-- <div v-for="(d, i) in dataList" :key="i" class="">
                            <span class="" :class="t === d.booking_time ? '' : 'hidden'">
                              <div class="mx-auto lg:flex justify-center">
                                <button @click="toggleDeleteBtn(d.id)" class="">
                                  <i
                                    class="fa fa-history text-green-500 rounded-lg uppercase text-sm "
                                    aria-hidden="true"
                                  ></i>
                                </button>
                              </div>
                            </span>
                          </div> -->
                        </div>
                        <div class="text-xs">
                          <!--<div class="relative">
                            <p v-for="(d, i) in dataList" :key="i">
                              <span
                                :class="t === d.booking_time ? '' : 'hidden'"
                              >
                                {{ d.booking_date }}
                              </span>
                            </p>
                          </div>-->

                          <p v-for="(d, i) in dataList" :key="i">
                            <span v-if="t === d.booking_time">
                              <span>{{ d.email }}</span
                              >
                              <!-- <span>{{ d.borrower_category }}</span> -->
                            </span>
                          </p>

                          <div v-for="(d, i) in dataList" :key="i" class="">
                            <span
                              class=""
                              :class="t === d.booking_time ? '' : 'hidden'"
                            >
                              <div class="">
                                <button
                                  @click="goToEdit(d.id)"
                                  class="w-full py-0.5 rounded-sm flex items-center gap-10 px-3 mt-1 justify-between hover:bg-white text-white border"
                                  :class="{
                                    'bg-red-700 hover:text-red-700 hover:border-red-700': d.status === 'pending',
                                    'bg-yellow-500 hover:text-yellow-500 hover:border-yellow-500': d.status === 'reserved',
                                    'bg-green-900 hover:text-green-900 hover:border-green-900': d.status === 'received',
                                    'bg-blue-300 hover:text-blue-300 hover:border-blue-300': d.status === 'returned',
                                  }"
                                >
                                  <span class=""> Go To Details</span>
                                  <i
                                    class="fa fa-chevron-circle-right rounded-lg uppercase text-sm"
                                    aria-hidden="true"
                                  ></i>
                                </button>
                              </div>
                            </span>
                          </div>
                          <!-- 
                          <p
                            :class="
                              _.includes(time, t) ? ' bg-red-500 text-white' : 'hidden'
                            "
                            class="shadow text-center block p-1 mt-2"
                          >
                            Pending
                          </p> -->
                          <!-- <p
                          class="shadow text-center block p-1 my-2 bg-green-900 text-white"
                        >
                          Done
                        </p> -->
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                <!-- 
                <div
                  class="z-10 px-10 border-4 rounded-lg bg-white shadow-2xl absolute top-[70px] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  v-show="toggleConfirmDelete"
                >
                  <div class="mt-6 mb-12">Done or Close Appointment?</div>
                  <div class="flex gap-20 mx-auto w-fit my-5">
                    <span
                      class="bg-green-900 text-white px-3 py-1 rounded-lg"
                      @click="deleteAppointment"
                      >Confirm</span
                    >
                    <span
                      class="bg-red-900 text-white px-3 py-1 rounded-lg"
                      @click="toggleDeleteBtn"
                      >Cancel</span
                    >
                  </div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex" v-if="editForm">
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
          <div class="lg:flex mx-auto justify-between py-2 px-3.5">
            <div class="lg:flex lg:items-center text-white">
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
              <p class="font-bold">Dashboard</p>
            </div>
            <button @click="logOut" class="flex hover:font-bold pt-1">
              <i class="fa fa-sign-out text-white text-xl"></i>
              <h1 class="text-xs text-white p-1.5">Log Out</h1>
            </button>
          </div>
        </div>
        <div class="text-xs mb-5">
          <div class="p-5">
            <div
              class="flex p-2 mb-7 text-center bg-green-900 text-white uppercase text-xs tracking-widest"
            >
              <div>
                <button
                  @click="goToBack()"
                  class="cursor-pointer tracking-tight absolute flex bg-white hover:bg-green-900 text-green-800 hover:text-white px-3 py-1 -mt-1 rounded-lg font-bold"
                >
                  <i class="fa fa-caret-left mt-0.5 mr-1"></i>
                  Back
                </button>
              </div>
              <div class="w-full">Appointment Details</div>
            </div>
            <div class="lg:w-8/12 w-11/12 mx-auto">
              <div class="p-3">
                <div class="lg:flex gap-2 mb-3">
                  <div class="w-full">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                    >
                      Borrower Category
                    </label>
                    <input
                      class="shadow-md p-2 rounded-sm w-full border"
                      v-model="library.borrower_category"
                      placeholder="Borrower Category"
                      disabled
                    />
                  </div>
                  <div class="w-full">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                    >
                      ID Number
                    </label>
                    <input
                      class="shadow-md p-2 rounded-sm w-full border"
                      v-model="library.id_number"
                      placeholder="ID Number"
                      disabled
                    />
                  </div>
                </div>
                <div class="lg:flex gap-2 mb-3">
                  <div class="w-full">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                    >
                      Firstname
                    </label>
                    <input
                      class="shadow-md p-2 rounded-sm w-full border capitalize"
                      v-model="library.firstname"
                      placeholder="Firstname"
                      disabled
                    />
                  </div>
                  <div class="w-full">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                    >
                      Lastname
                    </label>
                    <input
                      class="shadow-md p-2 rounded-sm w-full border capitalize"
                      v-model="library.lastname"
                      placeholder="Lastname"
                      disabled
                    />
                  </div>
                </div>
                <div class="lg:flex gap-2 mb-3">
                  <div class="w-full">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                    >
                      Booking Date
                    </label>
                    <input
                      class="shadow-md p-2 rounded-sm w-full border"
                      v-model="library.booking_date"
                      placeholder="Booking Date"
                      disabled
                    />
                  </div>
                  <div class="w-full">
                    <label
                      class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                    >
                      Booking Time
                    </label>
                    <input
                      class="shadow-md p-2 rounded-sm w-full border"
                      v-model="library.booking_time"
                      placeholder="Booking Time"
                      disabled
                    />
                  </div>
                </div>
                <div class="w-7/12 mb-3">
                  <label
                    class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                  >
                    Email
                  </label>
                  <input
                    class="shadow-md p-2 rounded-sm w-full border"
                    v-model="library.email"
                    placeholder="Email"
                    disabled
                  />
                </div>
              </div>
              <div class="w-full shadow-lg p-2 mb-5">
                <label
                  :class="{
                    'bg-red-700': library.status === 'pending',
                    'bg-yellow-500': library.status === 'reserved',
                    'bg-green-900': library.status === 'received',
                    'bg-blue-300': library.status === 'returned',
                  }"
                  class="block uppercase tracking-wide text-white text-sm text-center mt-5 mb-5 py-1 rounded-sm"
                >
                  Books
                </label>
                <ul>
                  <li
                    v-for="(j, i) in library.books"
                    :key="i"
                    class="lg:flex gap-3"
                  >
                    <div class="w-full mb-3">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                      >
                        Book Title
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border capitalize"
                        v-model="j.book_title"
                        placeholder="Book Title"
                        disabled
                      />
                    </div>
                    <div class="w-full mb-3">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                      >
                        Book Author
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border capitalize"
                        v-model="j.book_author"
                        placeholder="Book Author"
                        disabled
                      />
                    </div>
                    <div class="w-full mb-3">
                      <label
                        class="block uppercase tracking-wide text-gray-700 text-medium font-semibold mb-2"
                      >
                        Book Call Number
                      </label>
                      <input
                        class="shadow-md p-2 rounded-sm w-full border uppercase"
                        v-model="j.book_call_number"
                        placeholder="Book Call Number"
                        disabled
                      />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="flex w-fit mx-auto my-10 gap-10">
              <div class="w-fit mx-auto flex items-center gap-3">
                <label
                  class="font-bold pt-1"
                  :class="{
                    'text-red-700': library.status === 'pending',
                    'text-yellow-500': library.status === 'reserved',
                    'text-green-900': library.status === 'received',
                    'text-blue-400': library.status === 'returned',
                  }"
                  >STATUS:</label
                >
                <select
                  v-model="library.status"
                  name="borrower_category"
                  class="shadow-md p-2 cursor-pointer font-bold rounded-md w-full border border-[#e5e7eb] capitalize"
                  required
                  @change="btnShowModal()"
                >
                  <option value="pending">pending</option>
                  <option value="reserved">reserved</option>
                  <option value="received">received</option>
                  <option value="returned">returned</option>
                </select>
              </div>
              <div
                v-show="confirmModal"
                class="flex items-center shadow-2xl border-2 rounded-lg py-2"
              >
                <div class="flex items-center">
                  <div class="font-bold pl-5 pr-10">Confirm Status:</div>
                  <div class="flex gap-10 mr-10">
                    <span
                      class="cursor-pointer px-3 uppercase py-1 rounded-lg bg-green-900 border hover:border-green-900 hover:bg-white hover:text-green-900 text-white font-bold"
                      @click="btnConfirm"
                      >yes</span
                    >
                    <span
                      class="cursor-pointer px-3 uppercase py-1 rounded-lg bg-red-700 border hover:border-red-700 hover:bg-white hover:text-green-900 text-white font-bold"
                      @click="btnCloseModal"
                      >no</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div
              v-show="loadingState"
              class="text-green-800 font-bold lg:text-lg text-sm text-center w-fit mx-auto"
            >
              sending email, please wait ...
            </div>
          </div>
        </div>
      </div>
    </div>

    <DashboardFooter />
  </div>
</template>
<style scoped>
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
