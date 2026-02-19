<template>
  <div
    :class="
      darkMode ? 'bg-gray-900 min-h-screen px-4 pt-4 pb-20' : 'bg-white min-h-screen p-4'
    "
  >
    <div class="flex gap-4">
      <!-- Main content -->
      <div class="">
        <!-- Header -->
        <div class="flex items-center mb-4 w-full">
          <h2
            class="text-xl font-bold text-center w-full"
            :class="darkMode ? 'text-green-400' : 'text-green-800'"
          >
            Library Schedules
          </h2>
        </div>

        <!-- Toast -->
        <div
          v-if="toast.show"
          :class="[
            'p-3 rounded mb-3',
            toast.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800',
          ]"
        >
          {{ toast.message }}
        </div>

        <!-- Calendar -->
        <div class="uppercase relative z-0">
          <component
            v-if="calendarReady && FullCalendar"
            :is="FullCalendar"
            :options="calendarOptions"
            :style="
              darkMode
                ? 'background: #1f2937; border-radius: 8px; padding: 8px'
                : 'background: white; border-radius: 8px; padding: 8px'
            "
          />
          <div
            v-else
            class="text-center py-10"
            :class="darkMode ? 'text-gray-300' : 'text-gray-900'"
          >
            Loading calendar...
          </div>
        </div>

        <!-- Create / Edit Modal -->
        <transition name="fade">
          <div
            v-if="showModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div
              class="rounded-lg w-full max-w-2xl p-6"
              :class="darkMode ? 'bg-gray-900' : 'bg-white'"
            >
              <div class="w-full flex justify-between">
                <h3
                  class="font-bold mb-4 uppercase"
                  :class="darkMode ? 'text-gray-200' : 'text-gray-900'"
                >
                  {{ isEditing ? "Edit Schedule" : "Create New Schedule" }} ID:
                  {{ form.id }}
                </h3>

                <button
                  @click="closeModal"
                  class="px-4 py-2 border rounded"
                  :class="
                    darkMode
                      ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  "
                >
                  <i class="fa fa-times"></i>
                </button>
              </div>

              <div class="grid gap-3">
                <label
                  class="text-sm"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-900'"
                  >Date:
                  {{
                    form.date ? moment(form.date).format("MMMM DD, YYYY") : ""
                  }}</label
                >
                <!-- <input
                  v-model="form.date"
                  type="date"
                  class="border p-2 rounded"
                /> -->

                <label
                  class="text-sm font-bold uppercase"
                  :class="darkMode ? 'text-gray-300' : 'text-gray-900'"
                >
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    :indeterminate="isIndeterminate"
                    @change="toggleSelectAll"
                  />
                  Select All</label
                >

                <div class="lg:grid grid-cols-3">
                  <label
                    v-for="(t, i) in timeOptions"
                    :key="i"
                    class="items-center gap-2 text-sm uppercase"
                    :class="darkMode ? 'text-gray-300' : 'text-gray-900'"
                  >
                    <input
                      type="checkbox"
                      :value="
                        t._12_hour_format_from + ' - ' + t._12_hour_format_to
                      "
                      v-model="form.times"
                      :disabled="
                        !isEditing &&
                        form.times.length >= 1 &&
                        !form.times.includes(
                          t._12_hour_format_from + ' - ' + t._12_hour_format_to,
                        )
                      "
                    />
                    <span class="pl-2"
                      >{{ t._12_hour_format_from }} -
                      {{ t._12_hour_format_to }}</span
                    >
                  </label>
                </div>

                <div
                  v-if="form.recurring"
                  class="grid grid-cols-7 gap-2 text-xs"
                >
                  <label
                    v-for="(d, idx) in weekDays"
                    :key="d"
                    class="flex flex-col items-center"
                    :class="darkMode ? 'text-gray-300' : 'text-gray-900'"
                  >
                    <input
                      type="checkbox"
                      :value="d"
                      v-model="form.recurrence_days"
                    />
                    <span class="text-xs">{{ d.slice(0, 2) }}</span>
                  </label>
                </div>

                <div class="">
                  <div class="justify-end flex gap-2 mt-4">
                    <button
                      v-if="!isEditing"
                      @click="createSchedule"
                      :disabled="isSubmitting"
                      class="px-4 py-2 bg-green-800 text-white rounded flex"
                    >
                      {{ isSubmitting ? "Saving..." : "Create" }}
                    </button>

                    <div v-else class="flex w-full justify-between gap-2">
                      <button
                        @click="updateSchedule"
                        :disabled="isSubmitting"
                        class="px-4 py-2 bg-yellow-500 text-white rounded"
                      >
                        {{ isSubmitting ? "assigning..." : "Set" }}
                      </button>
                      <button
                        @click="confirmDelete"
                        class="px-4 py-2 bg-red-600 text-white rounded"
                      >
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Delete Confirmation Modal -->
        <transition name="fade">
          <div
            v-if="showDeleteConfirm"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div
              :class="['rounded-lg w-full max-w-md p-6 text-center bg-white']"
            >
              <h3 class="font-bold mb-4">Confirm Remove</h3>
              <p class="text-sm text-gray-700 mb-6">
                Remove schedule for <strong>{{ form.date }}</strong
                >?
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="showDeleteConfirm = false"
                  class="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  @click="deleteSchedule"
                  :disabled="isSubmitting"
                  class="px-4 py-2 bg-red-700 text-white rounded"
                >
                  {{ isSubmitting ? "Removing..." : "Remove" }}
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- Quick Slot Removal Modal -->
        <transition name="fade">
          <div
            v-if="showQuickRemoveModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div
              class="rounded-lg w-full max-w-lg p-6"
              :class="darkMode ? 'bg-gray-800' : 'bg-white'"
            >
              <h3
                class="font-bold mb-4"
                :class="darkMode ? 'text-gray-200' : 'text-gray-900'"
              >
                Manage Time Slots -
                {{
                  quickRemoveDate
                    ? moment(quickRemoveDate).format("MMMM DD, YYYY")
                    : ""
                }}
              </h3>

              <div
                v-if="quickRemoveSlots.length === 0"
                class="text-center py-4"
                :class="darkMode ? 'text-gray-400' : 'text-gray-500'"
              >
                No time slots available for this day
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="(slot, index) in quickRemoveSlots"
                  :key="index"
                  class="flex items-center justify-between p-3 border rounded"
                  :class="
                    darkMode
                      ? 'border-gray-600 bg-gray-700'
                      : 'border-gray-300 bg-white'
                  "
                >
                  <span
                    class="text-sm"
                    :class="darkMode ? 'text-gray-200' : 'text-gray-900'"
                    >{{ slot._12_hour_format_from }} -
                    {{ slot._12_hour_format_to }}</span
                  >
                  <button
                    @click="removeTimeSlot(slot)"
                    :disabled="isSubmitting"
                    class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    {{ isSubmitting ? "..." : "Remove" }}
                  </button>
                </div>
              </div>

              <div class="flex justify-end gap-2 mt-4">
                <button
                  @click="closeQuickRemoveModal"
                  class="px-4 py-2 border rounded"
                  :class="
                    darkMode
                      ? 'border-gray-600 text-gray-200 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                  "
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useUserStore } from "@/stores/user";
import scheduleJSON from "../schedule.json";
import moment from "moment";

const props = defineProps({
  darkMode: Boolean,
});

/* ----------------------- Helpers ----------------------- */
const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/* ----------------------- Parse converters ----------------------- */
const normalizeTimeLabel = (t) => {
  if (!t) return null;
  if (typeof t === "string") {
    if (t.includes(" - ")) return t;
    return null;
  }
  if (typeof t === "object") {
    if (t._12_hour_format_from && t._12_hour_format_to)
      return `${t._12_hour_format_from} - ${t._12_hour_format_to}`;
    if (t.range_from_time && t.range_to_time)
      return `${t.range_from_time} - ${t.range_to_time}`;
  }
  return null;
};

const parseScheduleToEvents = (raw) => {
  if (!Array.isArray(raw)) return [];

  // Group schedules by date and merge time slots
  const groupedByDate = {};

  raw.forEach((item) => {
    const date = moment(item.date, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(
      "YYYY-MM-DD",
    );

    if (!groupedByDate[date]) {
      groupedByDate[date] = {
        id: String(item.id),
        date: date,
        originalDate: item.date,
        times: [],
        recurrence: item.recurrence,
        notes: item.notes || "",
      };
    }

    // Merge time slots
    const times = Array.isArray(item.time)
      ? item.time
      : item.time
        ? [item.time]
        : [];
    groupedByDate[date].times.push(...times);
  });

  // Convert grouped data to events
  return Object.values(groupedByDate).map((group) => {
    /* -------------------------
       🔁 RECURRING EVENTS
    --------------------------*/
    if (group.recurrence && typeof group.recurrence === "string") {
      return {
        id: group.id,
        title: "BOOKED",
        rrule: group.recurrence,
        allDay: true,
        extendedProps: {
          original: {
            id: group.id,
            date: group.originalDate,
            time: group.times,
            notes: group.notes,
          },
        },
      };
    }

    /* -------------------------
       📅 NON-RECURRING EVENTS
       → ONE event per date with merged times
    --------------------------*/
    return {
      id: group.id,
      title: "BOOKED",
      start: group.date,
      allDay: true,
      extendedProps: {
        original: {
          id: group.id,
          date: group.originalDate,
          time: group.times,
          notes: group.notes,
        },
      },
    };
  });
};

const scheduleToForm = (raw) => {
  const times = Array.isArray(raw.time) ? raw.time : raw.time ? [raw.time] : [];
  const normalizedTimes = times
    .map((t) => {
      if (typeof t === "string") return t;
      if (t._12_hour_format_from && t._12_hour_format_to) {
        return `${t._12_hour_format_from} - ${t._12_hour_format_to}`;
      }
      return null;
    })
    .filter(Boolean);

  return {
    id: raw.id,
    date: raw.date,
    times: normalizedTimes,
    notes: raw.notes || "",
    recurring: !!raw.recurrence,
    recurrence_days: raw.recurrence_days || [],
  };
};

const formToPayload = (f) => {
  // Convert time strings like "08:00 AM - 08:20 AM" to API object format
  const timeObjects = f.times
    .map((timeStr) => {
      if (!timeStr || !timeStr.includes(" - ")) return null;
      const [from, to] = timeStr.split(" - ").map((s) => s.trim());
      return {
        range_from_time: from,
        range_to_time: to,
        _12_hour_format_from: from,
        _12_hour_format_to: to,
      };
    })
    .filter(Boolean);

  const payload = {
    date: moment(f.date).format("MM-DD-YYYY"),
    time: timeObjects.length > 0 ? timeObjects : [],
    notes: f.notes || "",
    updated_at: new Date().toISOString(), // API requires this
  };

  if (f.recurring) {
    if (f.recurrence_days && f.recurrence_days.length) {
      const map = {
        Sunday: "SU",
        Monday: "MO",
        Tuesday: "TU",
        Wednesday: "WE",
        Thursday: "TH",
        Friday: "FR",
        Saturday: "SA",
      };
      const byday = f.recurrence_days.map((d) => map[d]).join(",");
      const dtstart = moment(f.date).format("YYYYMMDD");
      payload.recurrence = `FREQ=WEEKLY;BYDAY=${byday};DTSTART=${dtstart}`;
      payload.recurrence_days = f.recurrence_days;
    }
  }

  return payload;
};

/* ----------------------- Main state ----------------------- */
const userStore = useUserStore();
const config = useRuntimeConfig();
const endpoint = computed(() => config.public.apiUrl || "");

const schedules = ref([]);
const events = ref([]);
const loading = ref(false);
const isSubmitting = ref(false);
const toast = ref({ show: false, message: "", type: "success" });

// Auto-hide toast after 3 seconds
let toastTimeout = null;
watch(
  () => toast.value.show,
  (newVal) => {
    if (newVal) {
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    }
  },
);

// modal/form state
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const isEditing = ref(false);
const form = ref({
  id: null,
  date: "",
  times: [],
  notes: "",
  recurring: false,
  recurrence_days: [],
});

// Quick remove modal state
const showQuickRemoveModal = ref(false);
const quickRemoveDate = ref("");
const quickRemoveSlots = ref([]);
const quickRemoveScheduleId = ref(null);

const timeOptions = ref(scheduleJSON?.timeSelection?.[0]?.time || []);

// Select All functionality
const selectAll = ref(false);

const isAllSelected = computed(() => {
  return (
    timeOptions.value.length > 0 &&
    form.value.times.length === timeOptions.value.length
  );
});

const isIndeterminate = computed(() => {
  return (
    form.value.times.length > 0 &&
    form.value.times.length < timeOptions.value.length
  );
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all
    form.value.times = [];
  } else {
    // Select only first time slot (limit to 1)
    if (timeOptions.value.length > 0) {
      form.value.times = [
        `${timeOptions.value[0]._12_hour_format_from} - ${timeOptions.value[0]._12_hour_format_to}`,
      ];
    }
  }
  selectAll.value = isAllSelected.value;
};

// Watch for manual changes to update selectAll state
watch(
  () => form.value.times,
  (newTimes) => {
    selectAll.value = isAllSelected.value;
  },
  { immediate: true },
);

// FullCalendar dynamic loader & options
const FullCalendar = ref(null);
const calendarPlugins = ref([]);
const calendarReady = ref(false);
const calendarOptions = ref({});

/* ----------------------- API & Events ----------------------- */
const fetchSchedules = async (silent = false) => {
  if (!silent) loading.value = true;
  try {
    const data = await $fetch(
      `${endpoint.value}/api/library/schedule/booking/list/`,
    );
    schedules.value = Array.isArray(data) ? data : [];
    events.value = parseScheduleToEvents(schedules.value);
    // update calendar options/events bound reference
    if (calendarOptions.value) calendarOptions.value.events = events.value;
  } catch (e) {
    if (!silent) {
      toast.value = {
        show: true,
        message: e?.message || "Failed to load schedules",
        type: "error",
      };
    }
  } finally {
    if (!silent) loading.value = false;
  }
};

// Silent auto-refresh every 5 seconds
let autoRefreshInterval = null;
const startAutoRefresh = () => {
  if (autoRefreshInterval) clearInterval(autoRefreshInterval);
  autoRefreshInterval = setInterval(() => {
    fetchSchedules(true); // silent update
  }, 5000);
};

const stopAutoRefresh = () => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
};

const createSchedule = async () => {
  if (!form.value.date || !form.value.times.length) {
    toast.value = {
      show: true,
      message: "Choose date and at least one time",
      type: "error",
    };
    return;
  }

  // Check if date already has a schedule
  const clickedDate = moment(form.value.date).format("MM-DD-YYYY");
  const existingSchedule = schedules.value.find((s) => s.date === clickedDate);

  if (existingSchedule) {
    toast.value = {
      show: true,
      message:
        "This date already has a schedule. Please edit the existing one.",
      type: "error",
    };
    return;
  }

  const payload = formToPayload(form.value);
  console.log("📤 Sending payload:", payload);
  console.log("📍 Endpoint:", endpoint.value);

  // Safety check: ensure time array is not empty
  if (!payload.time || payload.time.length === 0) {
    toast.value = { show: true, message: "No times selected", type: "error" };
    return;
  }

  isSubmitting.value = true;
  try {
    const url = `${endpoint.value}/api/library/schedule/booking/create/`;
    console.log("🔗 Full URL:", url);

    const response = await $fetch(url, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Create response:", response);

    // Success: clear form, close modal, refresh calendar
    closeModal();
    await fetchSchedules();

    toast.value = {
      show: true,
      message: `Schedule set for ${payload.date}`,
      type: "success",
    };
  } catch (e) {
    console.error("❌ Create error:", {
      message: e?.message,
      data: e?.data,
      statusCode: e?.statusCode,
      statusMessage: e?.statusMessage,
    });

    toast.value = {
      show: true,
      message:
        e?.data?.message || e?.statusMessage || e?.message || "Create failed",
      type: "error",
    };
  } finally {
    isSubmitting.value = false;
  }
};

const updateSchedule = async () => {
  if (!form.value.date || !form.value.times.length) {
    toast.value = {
      show: true,
      message: "Choose date and at least one time",
      type: "error",
    };
    return;
  }

  console.log("Updating schedule Date:", form.value.date);

  // Get ALL existing schedules for this date
  const clickedDate = moment(form.value.date).format("MM-DD-YYYY");
  const existingSchedules = schedules.value.filter(
    (s) => s.date === clickedDate,
  );

  const payload = formToPayload(form.value);

  // Merge with ALL existing times from all schedules for this date
  if (existingSchedules.length > 0) {
    const allExistingTimes = [];
    existingSchedules.forEach((schedule) => {
      const times = Array.isArray(schedule.time)
        ? schedule.time
        : schedule.time
          ? [schedule.time]
          : [];
      allExistingTimes.push(...times);
    });

    // Combine and remove duplicates based on time range
    const timeMap = new Map();

    // Add existing times
    allExistingTimes.forEach((t) => {
      const key =
        typeof t === "string"
          ? t
          : `${t._12_hour_format_from} - ${t._12_hour_format_to}`;
      if (!timeMap.has(key)) {
        timeMap.set(key, t);
      }
    });

    // Add new times
    payload.time.forEach((t) => {
      const key = `${t._12_hour_format_from} - ${t._12_hour_format_to}`;
      if (!timeMap.has(key)) {
        timeMap.set(key, t);
      }
    });

    payload.time = Array.from(timeMap.values());
  }

  console.log("📤 Sending payload:", payload);
  console.log("📍 Endpoint:", endpoint.value);

  // Safety check: ensure time array is not empty
  if (!payload.time || payload.time.length === 0) {
    toast.value = { show: true, message: "No times selected", type: "error" };
    return;
  }

  isSubmitting.value = true;
  try {
    const url = `${endpoint.value}/api/library/schedule/booking/create/`;
    console.log("🔗 Full URL:", url);

    const response = await $fetch(url, {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Create response:", response);

    // Success: clear form, close modal, refresh calendar
    closeModal();
    await fetchSchedules();

    toast.value = {
      show: true,
      message: `Schedule updated for ${payload.date}`,
      type: "success",
    };
  } catch (e) {
    console.error("❌ Create error:", {
      message: e?.message,
      data: e?.data,
      statusCode: e?.statusCode,
      statusMessage: e?.statusMessage,
    });

    toast.value = {
      show: true,
      message:
        e?.data?.message || e?.statusMessage || e?.message || "Update failed",
      type: "error",
    };
  } finally {
    isSubmitting.value = false;
  }
};

const deleteSchedule = async () => {
  if (!form.value.id) return;
  isSubmitting.value = true;
  try {
    await $fetch(
      `${endpoint.value}/api/library/schedule/booking/${form.value.id}/delete/`,
      { method: "DELETE" },
    );
    showDeleteConfirm.value = false;
    await fetchSchedules();
    toast.value = { show: true, message: "Schedule Removed", type: "success" };
  } catch (e) {
    toast.value = {
      show: true,
      message: e?.data?.message || e?.message || "Delete failed",
      type: "error",
    };
  } finally {
    isSubmitting.value = false;
  }
};

const handleEventResize = async (resizeInfo) => {
  const evt = resizeInfo.event;
  const orig = evt.extendedProps.original || {};
  const s = moment(evt.start).format("hh:mm A");
  const e = moment(evt.end).format("hh:mm A");
  const payload = {
    date: moment(evt.start).format("MM-DD-YYYY"),
    time: [`${s} - ${e}`],
  };

  try {
    await $fetch(
      `${endpoint.value}/api/library/schedule/booking/${orig.id}/update/`,
      {
        method: "PUT",
        body: payload,
        headers: { "Content-Type": "application/json" },
      },
    );
    toast.value = { show: true, message: "Schedule Resized", type: "success" };
    await fetchSchedules();
  } catch (e) {
    toast.value = {
      show: true,
      message: e?.message || "Resize failed",
      type: "error",
    };
    resizeInfo.revert();
  }
};

/* ----------------------- UI helpers ----------------------- */
const openCreateFromButton = () => {
  isEditing.value = false;
  form.value = {
    id: null,
    date: moment().format("YYYY-MM-DD"),
    times: [],
    notes: "",
    recurring: false,
    recurrence_days: [],
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  form.value = {
    id: null,
    date: "",
    times: [],
    notes: "",
    recurring: false,
    recurrence_days: [],
  };
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
  showModal.value = false;
};

const refresh = () => fetchSchedules();

/* ----------------------- Init FullCalendar ----------------------- */
onMounted(async () => {
  try {
    // dynamic imports to avoid SSR issues
    const fcModule = await import("@fullcalendar/vue3");
    const dayGrid = (await import("@fullcalendar/daygrid")).default;
    const timeGrid = (await import("@fullcalendar/timegrid")).default;
    const interaction = (await import("@fullcalendar/interaction")).default;
    // rrule plugin optional; try to load
    let rrule = null;
    try {
      rrule = (await import("@fullcalendar/rrule")).default;
    } catch (e) {
      /* optional */
    }

    FullCalendar.value = fcModule.default || fcModule;
    calendarPlugins.value = rrule
      ? [dayGrid, timeGrid, interaction, rrule]
      : [dayGrid, timeGrid, interaction];

    calendarOptions.value = {
      plugins: calendarPlugins.value,
      selectable: true,
      editable: true,
      droppable: false,
      events: events.value,

      // 👇 ADD THIS TO OVERRIDE SLOT TEXT
      eventContent(arg) {
        return {
          html: `<div style="font-weight:bold; color:#fff; text-align:center; width:100%; display:block;">TIME SCHEDULES</div>`,
        };
      },

      select: (sel) => handleSelect(sel),
      eventClick: (info) => handleEventClick(info),
      eventResize: (info) => handleEventResize(info),
      dayClick: (info) => handleDayClick(info),
      height: "auto",

      headerToolbar: {
        left: "",
        center: "title",
        right: "today prev,next",
      },

      buttonText: {
        today: "TODAY",
      },
    };

    calendarReady.value = true;
  } catch (err) {
    console.warn("FullCalendar load failed:", err);
    toast.value = {
      show: true,
      message: "Calendar failed to load",
      type: "error",
    };
  }

  await fetchSchedules();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

const handleSelect = (sel) => {
  // Check if date already has schedules
  const clickedDate = moment(sel.start).format("MM-DD-YYYY");
  const existingSchedules = schedules.value.filter(
    (s) => s.date === clickedDate,
  );

  // If schedules exist, load them for editing
  if (existingSchedules.length > 0) {
    isEditing.value = true;

    // Merge all existing times
    const allTimes = [];
    existingSchedules.forEach((schedule) => {
      const times = Array.isArray(schedule.time)
        ? schedule.time
        : schedule.time
          ? [schedule.time]
          : [];
      times.forEach((t) => {
        const normalized = normalizeTimeLabel(t);
        if (normalized && !allTimes.includes(normalized)) {
          allTimes.push(normalized);
        }
      });
    });

    form.value = {
      id: existingSchedules[0].id,
      date: moment(sel.start).format("YYYY-MM-DD"),
      times: allTimes,
      notes: existingSchedules[0].notes || "",
      recurring: false,
      recurrence_days: [],
    };
  } else {
    // No existing schedule, create new
    isEditing.value = false;
    form.value = {
      id: null,
      date: moment(sel.start).format("YYYY-MM-DD"),
      times: [],
      notes: "",
      recurring: false,
      recurrence_days: [],
    };
    if (sel.start && sel.end && !sel.allDay) {
      const s = moment(sel.start).format("hh:mm A");
      const e = moment(sel.end).format("hh:mm A");
      form.value.times = [`${s} - ${e}`];
    }
  }

  showModal.value = true;
};

const handleEventClick = (info) => {
  const evt = info.event;
  const original = evt.extendedProps?.original || {};
  isEditing.value = true;
  // scheduleToForm(existingApiObject, calendarEvent)
  form.value = scheduleToForm(original, evt);
  showModal.value = true;
};

const handleDayClick = (info) => {
  // Find ALL schedules for this date
  const clickedDate = moment(info.date).format("MM-DD-YYYY");
  const schedulesForDate = schedules.value.filter(
    (s) => s.date === clickedDate,
  );

  if (schedulesForDate.length > 0) {
    quickRemoveDate.value = clickedDate;
    quickRemoveScheduleId.value = schedulesForDate[0].id; // Use first schedule ID

    // Merge all time slots from all schedules for this date
    const allSlots = [];
    schedulesForDate.forEach((schedule) => {
      const times = Array.isArray(schedule.time)
        ? schedule.time
        : schedule.time
          ? [schedule.time]
          : [];
      allSlots.push(...times);
    });

    quickRemoveSlots.value = allSlots;
    showQuickRemoveModal.value = true;
  } else {
    toast.value = {
      show: true,
      message: "No schedule found for this date",
      type: "info",
    };
  }
};

const removeTimeSlot = async (slotToRemove) => {
  if (!quickRemoveDate.value) return;

  isSubmitting.value = true;
  try {
    // Get ALL schedules for this date
    const schedulesForDate = schedules.value.filter(
      (s) => s.date === quickRemoveDate.value,
    );
    if (schedulesForDate.length === 0) {
      toast.value = {
        show: true,
        message: "Schedule not Found",
        type: "error",
      };
      return;
    }

    // Collect all times from all schedules for this date
    const allTimes = [];
    schedulesForDate.forEach((schedule) => {
      const times = Array.isArray(schedule.time)
        ? schedule.time
        : schedule.time
          ? [schedule.time]
          : [];
      allTimes.push(...times);
    });

    // Remove the specific slot
    const updatedTimes = allTimes.filter(
      (slot) =>
        !(
          slot._12_hour_format_from === slotToRemove._12_hour_format_from &&
          slot._12_hour_format_to === slotToRemove._12_hour_format_to
        ),
    );

    // Convert to object format for API
    const updatedTimeObjects = updatedTimes.map((slot) => ({
      range_from_time: slot._12_hour_format_from,
      range_to_time: slot._12_hour_format_to,
      _12_hour_format_from: slot._12_hour_format_from,
      _12_hour_format_to: slot._12_hour_format_to,
    }));

    // Create payload with updated times
    const payload = {
      date: quickRemoveDate.value,
      time: updatedTimeObjects.length > 0 ? updatedTimeObjects : [],
      updated_at: new Date().toISOString(),
    };

    console.log("📤 Removing slot payload:", payload);

    // Use create endpoint to replace all schedules for this date
    const response = await $fetch(
      `${endpoint.value}/api/library/schedule/booking/create/`,
      {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("✅ Slot removal response:", response);

    // Update local state
    quickRemoveSlots.value = updatedTimes;

    // Refresh schedules
    await fetchSchedules();

    // If no slots left, close modal
    if (updatedTimes.length === 0) {
      closeQuickRemoveModal();
      toast.value = {
        show: true,
        message: "All slots removed for this day",
        type: "success",
      };
    } else {
      toast.value = {
        show: true,
        message: "Time slot removed",
        type: "success",
      };
    }
  } catch (e) {
    console.error("❌ Slot removal error:", e);
    toast.value = {
      show: true,
      message: e?.data?.message || e?.message || "Failed to remove slot",
      type: "error",
    };
  } finally {
    isSubmitting.value = false;
  }
};

const closeQuickRemoveModal = () => {
  showQuickRemoveModal.value = false;
  quickRemoveDate.value = "";
  quickRemoveSlots.value = [];
  quickRemoveScheduleId.value = null;
};
</script>

<style scoped>
.bg-green-800 {
  background-color: #096b2e;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
/* Dark mode calendar styles */
.bg-gray-900 {
  --fc-button-bg-color: #374151;
  --fc-button-border-color: #4b5563;
  --fc-button-hover-bg-color: #4b5563;
  --fc-button-hover-border-color: #6b7280;
  --fc-button-active-bg-color: #10b981;
  --fc-button-active-border-color: #10b981;
  --fc-button-text-color: #e5e7eb;
  --fc-border-color: #4b5563;
  --fc-today-bg-color: rgba(16, 185, 129, 0.1);
  --fc-title-color: #e5e7eb;
  --fc-header-bg-color: #1f2937;
  --fc-header-text-color: #10b981;
  --fc-day-number-color: #e5e7eb;
  --fc-day-frame-bg-color: #1f2937;
}

/* Light mode calendar styles */
.bg-white {
  --fc-button-bg-color: #f3f4f6;
  --fc-button-border-color: #d1d5db;
  --fc-button-hover-bg-color: #e5e7eb;
  --fc-button-hover-border-color: #9ca3af;
  --fc-button-active-bg-color: #10b981;
  --fc-button-active-border-color: #10b981;
  --fc-button-text-color: #1f2937;
  --fc-border-color: #d1d5db;
  --fc-today-bg-color: rgba(16, 185, 129, 0.1);
  --fc-title-color: #1f2937;
  --fc-header-bg-color: #f9fafb;
  --fc-header-text-color: #059669;
  --fc-day-number-color: #1f2937;
  --fc-day-frame-bg-color: #ffffff;
}

.fc .fc-button {
  background-color: var(--fc-button-bg-color) !important;
  border-color: var(--fc-button-border-color) !important;
  color: var(--fc-button-text-color) !important;
  text-transform: uppercase !important;
  font-weight: 500 !important;
  padding: 0.5rem 1rem !important;
  border-radius: 0.375rem !important;
}

.fc .fc-button:hover {
  background-color: var(--fc-button-hover-bg-color) !important;
  border-color: var(--fc-button-hover-border-color) !important;
}

.fc .fc-button-active {
  background-color: var(--fc-button-active-bg-color) !important;
  border-color: var(--fc-button-active-border-color) !important;
}

.fc .fc-toolbar-title {
  color: var(--fc-title-color) !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: var(--fc-border-color) !important;
}

.fc .fc-col-header-cell {
  background-color: var(--fc-header-bg-color) !important;
  color: var(--fc-header-text-color) !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  padding: 0.75rem !important;
}

.fc .fc-daygrid-day-number {
  color: var(--fc-day-number-color) !important;
  padding: 0.5rem !important;
}

.fc .fc-day-today {
  background-color: var(--fc-today-bg-color) !important;
}

.fc .fc-daygrid-day-frame {
  background-color: var(--fc-day-frame-bg-color) !important;
}
</style>
