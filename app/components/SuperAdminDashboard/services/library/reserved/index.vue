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
const library = ref({});
const showSuccessModal = ref(false);
const confirmModal = ref(false);

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
    showSuccessModal.value = true;
    setTimeout(() => {
      showSuccessModal.value = false;
      goToBack();
    }, 2000);
  } catch (error) {
    console.error("Failed to update status or send email", error);
  } finally {
    loadingState.value = false;
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
    <div class="min-h-screen transition-all duration-500" v-if="editForm">
      <div class="w-full max-w-5xl mx-auto p-4 lg:p-8">
        <!-- HEADER / BACK BUTTON -->
        <div class="flex items-center justify-between mb-8">
          <button
            @click="goToBack"
            class="group flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all"
            :class="darkMode
              ? 'bg-gray-800 text-gray-300 hover:text-white border border-gray-700 hover:border-green-500 shadow-lg'
              : 'bg-white text-green-800 border border-gray-200 hover:border-green-600 shadow-md'"
          >
            <i class="fa fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
            Back to List
          </button>
          
          <div class="hidden md:flex items-center gap-2">
            <span class="text-xs uppercase tracking-widest font-bold opacity-50">Appointment ID:</span>
            <span class="text-xs font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">#{{ library.id }}</span>
          </div>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <!-- LEFT COLUMN: BORROWER INFO -->
          <div class="lg:col-span-2 space-y-6">
            <!-- MAIN INFO CARD -->
            <div class="rounded-3xl overflow-hidden shadow-xl border"
              :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'">
              <div class="bg-gradient-to-r from-green-800 to-green-900 px-6 py-4">
                <h2 class="text-white font-bold flex items-center gap-2">
                  <i class="fa fa-user-circle"></i>
                  Borrower Information
                </h2>
              </div>
              
              <div class="p-6">
                <div class="grid md:grid-cols-2 gap-6">
                  <div class="space-y-1">
                    <label class="text-[10px] uppercase tracking-wider font-black opacity-60">Borrower Category</label>
                    <div class="text-sm font-bold p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      {{ library.borrower_category }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] uppercase tracking-wider font-black opacity-60">ID Number</label>
                    <div class="text-sm font-bold p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      {{ library.id_number }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] uppercase tracking-wider font-black opacity-60">Full Name</label>
                    <div class="text-sm font-bold p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      {{ library.firstname }} {{ library.lastname }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] uppercase tracking-wider font-black opacity-60">Email Address</label>
                    <div class="text-sm font-bold p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 break-all">
                      {{ library.email }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] uppercase tracking-wider font-black opacity-60">Booking Date</label>
                    <div class="text-sm font-bold p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <i class="fa fa-calendar-alt text-green-600 mr-2"></i>
                      {{ library.booking_date }}
                    </div>
                  </div>
                  <div class="space-y-1">
                    <label class="text-[10px] uppercase tracking-wider font-black opacity-60">Booking Time</label>
                    <div class="text-sm font-bold p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                      <i class="fa fa-clock text-green-600 mr-2"></i>
                      {{ library.booking_time }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- BOOKS CARD -->
            <div class="rounded-3xl overflow-hidden shadow-xl border"
              :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'">
              <div class="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 class="font-bold flex items-center gap-2" :class="darkMode ? 'text-gray-200' : 'text-gray-800'">
                  <i class="fa fa-book text-green-700"></i>
                  Book Reservation List
                </h2>
                <span class="text-xs font-bold px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-lg">
                  {{ library.books?.length || 0 }} Books
                </span>
              </div>
              
              <div class="p-6">
                <div class="overflow-x-auto">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="text-[10px] uppercase tracking-widest opacity-50">
                        <th class="pb-4 px-2">Book Title</th>
                        <th class="pb-4 px-2">Author</th>
                        <th class="pb-4 px-2">Call Number</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                      <tr v-for="(b, i) in library.books" :key="i" class="group">
                        <td class="py-4 px-2 font-bold text-sm">{{ b.book_title }}</td>
                        <td class="py-4 px-2 text-sm opacity-80">{{ b.book_author }}</td>
                        <td class="py-4 px-2">
                          <span class="text-[11px] font-mono font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded uppercase">
                            {{ b.book_call_number }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: STATUS CONTROL -->
          <div class="space-y-6">
            <div class="sticky top-8 rounded-3xl overflow-hidden shadow-2xl border"
              :class="darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'">
              <div class="p-6 text-center border-b border-gray-50 dark:border-gray-700">
                <div class="text-[10px] uppercase tracking-widest font-black opacity-50 mb-4">Current Status</div>
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black uppercase text-sm shadow-sm"
                  :class="{
                    'bg-red-50 text-red-700': library.status === 'pending',
                    'bg-yellow-50 text-yellow-700': library.status === 'reserved',
                    'bg-green-50 text-green-800': library.status === 'received',
                  }">
                  <span class="w-2 h-2 rounded-full animate-pulse" 
                    :class="{
                      'bg-red-500': library.status === 'pending',
                      'bg-yellow-500': library.status === 'reserved',
                      'bg-green-600': library.status === 'received',
                    }"></span>
                  {{ 
                    library.status === 'pending' ? 'processing' : 
                    library.status === 'reserved' ? 'ready for pick up' : 
                    library.status === 'received' ? 'returned' : library.status
                  }}
                </div>
              </div>

              <div class="p-6 space-y-6">
                <div class="space-y-2 text-center">
                  <label class="text-xs font-bold opacity-70">Update Status To:</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button 
                      v-for="s in [
                        { val: 'pending', label: 'processing' },
                        { val: 'reserved', label: 'ready for pick up' },
                        { val: 'received', label: 'returned' }
                      ]"
                      :key="s.val"
                      @click="library.status = s.val; btnShowModal()"
                      class="px-2 py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all"
                      :class="[
                        library.status === s.val 
                          ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20 shadow-inner' 
                          : 'border-transparent bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700 opacity-60'
                      ]"
                    >
                      {{ s.label }}
                    </button>
                  </div>
                </div>

                <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                  <div class="flex gap-3">
                    <i class="fa fa-info-circle text-blue-500 mt-1"></i>
                    <p class="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                      Changing the status will automatically send an email notification to <strong>{{ library.email }}</strong> with the updated details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALS & OVERLAYS -->
    <Teleport to="body">
      <!-- Loading Overlay -->
      <transition name="fade">
        <div v-if="loadingState" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div class="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-gray-100 dark:border-gray-700">
             <div class="relative w-20 h-20">
               <div class="absolute inset-0 border-4 border-green-100 dark:border-green-900/30 rounded-full"></div>
               <div class="absolute inset-0 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
               <div class="absolute inset-0 flex items-center justify-center">
                 <i class="fa fa-paper-plane text-green-600 animate-bounce"></i>
               </div>
             </div>
             <div class="text-center">
               <p class="text-xl font-black text-gray-900 dark:text-white mb-1">Sending Notification</p>
               <p class="text-xs text-gray-500 dark:text-gray-400">Please wait while we notify the borrower...</p>
             </div>
          </div>
        </div>
      </transition>

      <!-- Confirmation Modal -->
      <transition name="scale">
        <div v-if="confirmModal" class="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div class="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all border border-white/20">
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <i class="fa fa-bell text-3xl"></i>
              </div>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-3">Update Status?</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                You are about to change the status to <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded font-black uppercase text-xs">
                  {{ 
                    library.status === 'pending' ? 'processing' : 
                    library.status === 'reserved' ? 'ready for pick up' : 
                    library.status === 'received' ? 'returned' : library.status
                  }}
                </span>.
                <br/>This will trigger an automated email notification.
              </p>
              
              <div class="flex gap-4">
                <button @click="btnCloseModal" class="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95">Cancel</button>
                <button @click="btnConfirm" class="flex-1 px-6 py-3 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 shadow-xl shadow-green-900/30 transition-all active:scale-95">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Success Modal -->
      <transition name="scale">
        <div v-if="showSuccessModal" class="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div class="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all border-2 border-green-500/20">
            <div class="p-8 text-center">
              <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                <i class="fa fa-check-double text-3xl"></i>
              </div>
              <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-2">Done!</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mb-8">
                The status has been updated and the notification was sent successfully.
              </p>
              <button @click="showSuccessModal = false" class="w-full px-6 py-3 bg-green-700 text-white font-bold rounded-2xl hover:bg-green-800 transition-all active:scale-95 shadow-lg shadow-green-900/20">Great!</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { opacity: 0; transform: scale(0.9) translateY(20px); }

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
