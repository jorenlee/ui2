<script setup>
import { ref, computed, onMounted, onBeforeUnmount, toRaw } from "vue";
import moment from "moment";
import scheduleJSON from "../time.json";
import VueDatePicker from "@vuepic/vue-datepicker";
import "../css/main.css";
import _ from "lodash";

// Define props
const props = defineProps({
  darkMode: { type: Boolean, default: false }
});

/* =========================
   STORE / ENDPOINT
========================= */

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

/* =========================
   STATE
========================= */
const date = ref(null); // MM-DD-YYYY
const highlightedDates = ref([]);
const bookingLibrary = ref([]);
const timeSelection = ref(scheduleJSON.timeSelection);

const editForm = ref(false);
const isEditingOrViewing = ref(false);
const loadingState = ref(false);
const confirmModal = ref(false);
const library = ref({});

/* =========================
   AUTO REFRESH
========================= */
let autoRefreshInterval = null;
let lastDataHash = "";

/* =========================
   COMPUTED
========================= */
const filteredBookings = computed(() => {
  if (!date.value) return [];
  return bookingLibrary.value.filter(
    (b) => b.booking_date === date.value
  );
});

const uniqueBookings = computed(() => {
  const seen = new Set();
  return filteredBookings.value.filter((b) => {
    const key = `${b.id_number}_${b.booking_time}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
});

const dataList = computed(() => uniqueBookings.value);

/* =========================
   HELPERS
========================= */
const createHash = (data) =>
  JSON.stringify(data)
    .split("")
    .reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

const debounce = (fn, delay = 500) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

/* =========================
   API
========================= */
const fetchBookingData = async () => {
  const data = await $fetch(`${endpoint.value}/api/library/booking/list/`);
  bookingLibrary.value = data || [];
  lastDataHash = createHash(data);
  updateHighlightedDates();
};

const fetchBookingDataSilently = async () => {
  if (isEditingOrViewing.value) return;

  const data = await $fetch(`${endpoint.value}/api/library/booking/list/`);
  const hash = createHash(data);

  if (hash !== lastDataHash) {
    bookingLibrary.value = data;
    lastDataHash = hash;
    updateHighlightedDates();
  }
};

const updateHighlightedDates = () => {
  highlightedDates.value = [
    ...new Set(bookingLibrary.value.map((b) => b.booking_date)),
  ].map((d) => new Date(d));
};

/* =========================
   DATE HANDLER
========================= */
const setDate = (val) => {
  if (!val) return;
  date.value = moment(val).format("MM-DD-YYYY");
};

/* =========================
   EDIT / VIEW
========================= */
const goToEdit = async (id) => {
  editForm.value = true;
  isEditingOrViewing.value = true;
  loadingState.value = true;

  const cached = bookingLibrary.value.find((b) => b.id === id);
  library.value = cached ? { ...cached } : {};

  const live = await $fetch(
    `${endpoint.value}/api/library/booking/${id}/`
  );
  library.value = live;
  loadingState.value = false;
};

const goToBack = () => {
  editForm.value = false;
  isEditingOrViewing.value = false;
  library.value = {};
};

/* =========================
   UPDATE STATUS
========================= */
const editStatus = async () => {
  loadingState.value = true;
  const payload = toRaw({
    ...library.value,
    updated_at: new Date().toISOString(),
  });

  try {
    await $fetch(
      `${endpoint.value}/api/library/booking/${library.value.id}/edit/`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      }
    );

    await submitToGmail();
    await fetchBookingData();
  } catch (error) {
    console.error("Failed to update status or send email", error);
  } finally {
    loadingState.value = false;
    goToBack();
  }
};

const submitToGmail = async () => {
  await $fetch(
    `${endpoint.value}/api/library/submit-status-to-gmail/${library.value.id}/`,
    {
      method: "PUT",
      body: {
        id: library.value.id,
        status: library.value.status,
        email: library.value.email,
      },
    }
  );
};

/* =========================
   MODAL
========================= */
const btnShowModal = () => (confirmModal.value = true);
const btnConfirm = () => {
  confirmModal.value = false;
  editStatus();
};
const btnCloseModal = () => (confirmModal.value = false);

/* =========================
   LIFECYCLE
========================= */
onMounted(async () => {
  await fetchBookingData();
  autoRefreshInterval = setInterval(fetchBookingDataSilently, 3000);
});

onBeforeUnmount(() => {
  clearInterval(autoRefreshInterval);
});
</script>

<template>
  <div>
    <!-- ========================= APPOINTMENTS ========================= -->
    <div class="flex min-h-screen" v-if="!editForm">
      <div class="w-full">
        <div class="border pb-5 m-5"
          :class="darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'">
          <div
            class="py-2 mb-5 text-center bg-green-900 text-white uppercase text-xs tracking-widest"
          >
            Appointments
          </div>

          <div class="px-2 lg:flex gap-3">
            <!-- CALENDAR -->
            <div class="w-fit mb-1">
              <VueDatePicker
                v-model="date"
                inline
                auto-apply
                :enable-time-picker="false"
                :highlight="highlightedDates"
                :year-range="[2025, 2026]"
                :disabled-week-days="[0, 7]"
                week-start="0"
                @update:model-value="setDate"
              />
            </div>

            <!-- TIME SLOTS -->
            <div class="w-full relative">
              <div class="w-full border rounded-md"
                :class="darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-white'">
                <ul class="grid lg:grid-cols-3 justify-center lg:gap-2 p-2">
                  <li
                    v-for="(t, i) in timeSelection[0].time"
                    :key="i"
                    class="font-bold border p-1 min-h-[30px]"
                    :class="darkMode ? 'border-gray-700 text-gray-200' : 'border-gray-200 text-gray-900'"
                  >
                    <div class="text-xs">{{ t }}</div>

                    <div
                      v-for="d in dataList"
                      :key="d.id"
                      v-show="d.booking_time === t"
                      class="mt-1 text-xs"
                    >
                   <p :class="darkMode ? 'text-gray-300' : 'text-gray-700'">
                     {{ d.firstname }} {{ d.lastname }}
                   </p>
                      <button
                        @click="goToEdit(d.id)"
                        class="w-full py-0.5 rounded-sm flex items-center justify-between px-3 text-white border hover:bg-white"
                        :class="{
                          'bg-red-700 hover:text-red-700 hover:border-red-700':
                            d.status === 'pending',
                          'bg-yellow-500 hover:text-yellow-500 hover:border-yellow-500':
                            d.status === 'reserved',
                          'bg-green-900 hover:text-green-900 hover:border-green-900':
                            d.status === 'received',
                          'bg-blue-300 hover:text-blue-300 hover:border-blue-300':
                            d.status === 'returned',
                        }"
                      >
                        <span>Go To Details</span>
                        <i class="fa fa-chevron-circle-right"></i>
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= APPOINTMENT DETAILS ========================= -->
    <div class="flex" v-if="editForm">
      <div class="w-full p-5">
        <button
          @click="goToBack"
          class="cursor-pointer tracking-tight flex px-3 py-1 rounded-lg font-bold mb-5"
          :class="darkMode
            ? 'bg-gray-700 hover:bg-green-900 text-gray-200 hover:text-white border border-gray-600'
            : 'bg-white hover:bg-green-900 text-green-800 hover:text-white border border-gray-300'"
        >
          <i class="fa fa-caret-left mt-0.5 mr-1"></i>
          Back
        </button>

        <div class="lg:w-8/12 w-11/12 mx-auto">
          <div class="p-3">
            <!-- BORROWER INFO -->
            <div class="lg:flex gap-2 mb-3">
              <div class="w-full">
                <label class="font-semibold"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-800'">Borrower Category</label>
                <input
                  class="shadow-md p-2 w-full border rounded"
                  :class="darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'"
                  v-model="library.borrower_category"
                  disabled
                />
              </div>
              <div class="w-full">
                <label class="font-semibold"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-800'">ID Number</label>
                <input
                  class="shadow-md p-2 w-full border rounded"
                  :class="darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'"
                  v-model="library.id_number"
                  disabled
                />
              </div>
            </div>

            <div class="lg:flex gap-2 mb-3">
              <div class="w-full">
                <label class="font-semibold"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-800'">Firstname</label>
                <input
                  class="shadow-md p-2 w-full border rounded"
                  :class="darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'"
                  v-model="library.firstname"
                  disabled
                />
              </div>
              <div class="w-full">
                <label class="font-semibold"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-800'">Lastname</label>
                <input
                  class="shadow-md p-2 w-full border rounded"
                  :class="darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'"
                  v-model="library.lastname"
                  disabled
                />
              </div>
            </div>

            <div class="lg:flex gap-2 mb-3">
              <div class="w-full">
                <label class="font-semibold"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-800'">Booking Date</label>
                <input
                  class="shadow-md p-2 w-full border rounded"
                  :class="darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'"
                  v-model="library.booking_date"
                  disabled
                />
              </div>
              <div class="w-full">
                <label class="font-semibold"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-800'">Booking Time</label>
                <input
                  class="shadow-md p-2 w-full border rounded"
                  :class="darkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'"
                  v-model="library.booking_time"
                  disabled
                />
              </div>
            </div>

            <div class="mb-5">
              <label class="font-semibold"
                :class="darkMode ? 'text-gray-300' : 'text-gray-800'">Email</label>
              <input
                class="shadow-md p-2 w-full border rounded"
                :class="darkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-200'
                  : 'bg-white border-gray-300 text-gray-900'"
                v-model="library.email"
                disabled
              />
            </div>

            <!-- BOOKS -->
            <div class="shadow-lg p-3 mb-5"
              :class="darkMode ? 'bg-gray-900/50 border border-gray-700' : 'bg-white'">
              <label
                class="block text-white text-center py-1 mb-3 rounded"
                :class="{
                  'bg-red-700': library.status === 'pending',
                  'bg-yellow-500': library.status === 'reserved',
                  'bg-green-900': library.status === 'received',
                  'bg-blue-300': library.status === 'returned',
                }"
              >
                Books
              </label>

              <ul>
                <li
                  v-for="(b, i) in library.books"
                  :key="i"
                  class="lg:flex gap-3 mb-3"
                >
                  <input
                    class="shadow-md p-2 w-full border rounded"
                    :class="darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-900'"
                    v-model="b.book_title"
                    disabled
                  />
                  <input
                    class="shadow-md p-2 w-full border rounded"
                    :class="darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-900'"
                    v-model="b.book_author"
                    disabled
                  />
                  <input
                    class="shadow-md p-2 w-full border rounded uppercase"
                    :class="darkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-200'
                      : 'bg-white border-gray-300 text-gray-900'"
                    v-model="b.book_call_number"
                    disabled
                  />
                </li>
              </ul>
            </div>

            <!-- STATUS -->
            <div class="flex items-center gap-3 justify-center">
              <label class="font-bold">STATUS:</label>
              <select
                v-model="library.status"
                class="shadow-md p-2 font-bold rounded-md border capitalize"
                @change="btnShowModal"
              >
                <option value="pending">pending</option>
                <option value="reserved">reserved</option>
                <option value="received">received</option>
                <option value="returned">returned</option>
              </select>
            </div>

            <!-- CONFIRM -->
            <div v-if="confirmModal" class="flex justify-center gap-5 mt-5">
              <span
                class="cursor-pointer px-3 py-1 bg-green-900 text-white rounded font-bold"
                @click="btnConfirm"
                >yes</span
              >
              <span
                class="cursor-pointer px-3 py-1 bg-red-700 text-white rounded font-bold"
                @click="btnCloseModal"
                >no</span
              >
            </div>

            <div
              v-if="loadingState"
              class="text-green-800 font-bold text-center mt-5"
            >
              Sending Email, please wait ...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 2px;
}
::-webkit-scrollbar-track {
  background: #ececec;
}
::-webkit-scrollbar-thumb {
  background: #135000;
}
::-webkit-scrollbar-thumb:hover {
  background: #00c566;
}
</style>
