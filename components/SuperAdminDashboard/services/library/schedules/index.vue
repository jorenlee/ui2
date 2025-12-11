<template>
  <div :class="['p-4 min-h-screen']">
    <div class="flex gap-4">
      <!-- Main content -->
      <div class="">
        <!-- Header -->
        <div class="flex items-center mb-4 w-full">
          <h2 class="text-xl font-bold text-green-800 text-center w-full">
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
        <div class="uppercase">
          <component
            v-if="calendarReady && FullCalendar"
            :is="FullCalendar"
            :options="calendarOptions"
            style="background: white; border-radius: 8px; padding: 8px"
          />
          <div v-else class="text-center py-10">Loading calendar...</div>
        </div>

        <!-- Create / Edit Modal -->
        <transition name="fade">
          <div
            v-if="showModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          >
            <div :class="['rounded-lg w-full max-w-2xl p-6 bg-white']">
            <div class="w-full flex justify-between">
                <h3 class="font-bold mb-4">
                {{ isEditing ? "Edit Schedule" : "Create New Schedule" }} ID: {{ form.id }}
              </h3>


                 <button @click="closeModal" class="px-4 py-2 border rounded">
                    <i class="fa fa-times"></i>
                  </button>

            </div>


              <div class="grid gap-3">
                <label class="text-sm"
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

                <label class="text-sm font-bold">
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
                    class="items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      :value="
                        t._12_hour_format_from + ' - ' + t._12_hour_format_to
                      "
                      v-model="form.times"
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
            <div :class="['rounded-lg w-full max-w-md p-6 text-center bg-white']">
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
            <div :class="['rounded-lg w-full max-w-lg p-6 bg-white']">
              <h3 class="font-bold mb-4">
                Manage Time Slots - {{ quickRemoveDate ? moment(quickRemoveDate).format("MMMM DD, YYYY") : "" }}
              </h3>

              <div v-if="quickRemoveSlots.length === 0" class="text-center py-4 text-gray-500">
                No time slots available for this day
              </div>

              <div v-else class="space-y-2">
                <div
                  v-for="(slot, index) in quickRemoveSlots"
                  :key="index"
                  class="flex items-center justify-between p-3 border rounded"
                >
                  <span class="text-sm">{{ slot._12_hour_format_from }} - {{ slot._12_hour_format_to }}</span>
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
                <button @click="closeQuickRemoveModal" class="px-4 py-2 border rounded">
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
import { ref, computed, onMounted, watch } from "vue";
import { useUserStore } from "@/stores/user";
import scheduleJSON from "../schedule.json";
import moment from "moment";

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

  return raw.map((item) => {
    const date = moment(item.date, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(
      "YYYY-MM-DD"
    );

    /* -------------------------
       🔁 RECURRING EVENTS
    --------------------------*/
    if (item.recurrence && typeof item.recurrence === "string") {
      return {
        id: String(item.id),
        title: "BOOKED",
        rrule: item.recurrence,
        allDay: true,
        extendedProps: { original: item },
      };
    }

    /* -------------------------
       📅 NON-RECURRING EVENTS
       → Always ONE BOOKED event
    --------------------------*/
    return {
      id: String(item.id),
      title: "BOOKED",
      start: date,
      allDay: true,
      extendedProps: { original: item },
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
const endpoint = computed(() => userStore?.mainDevServer || "");

const schedules = ref([]);
const events = ref([]);
const loading = ref(false);
const isSubmitting = ref(false);
const toast = ref({ show: false, message: "", type: "success" });

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
  return timeOptions.value.length > 0 && form.value.times.length === timeOptions.value.length;
});

const isIndeterminate = computed(() => {
  return form.value.times.length > 0 && form.value.times.length < timeOptions.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect all
    form.value.times = [];
  } else {
    // Select all
    form.value.times = timeOptions.value.map(t => `${t._12_hour_format_from} - ${t._12_hour_format_to}`);
  }
  selectAll.value = isAllSelected.value;
};

// Watch for manual changes to update selectAll state
watch(() => form.value.times, (newTimes) => {
  selectAll.value = isAllSelected.value;
}, { immediate: true });

// FullCalendar dynamic loader & options
const FullCalendar = ref(null);
const calendarPlugins = ref([]);
const calendarReady = ref(false);
const calendarOptions = ref({});

/* ----------------------- API & Events ----------------------- */
const fetchSchedules = async () => {
  loading.value = true;
  try {
    const data = await $fetch(
      `${endpoint.value}/api/library/schedule/booking/list/`
    );
    schedules.value = Array.isArray(data) ? data : [];
    events.value = parseScheduleToEvents(schedules.value);
    // update calendar options/events bound reference
    if (calendarOptions.value) calendarOptions.value.events = events.value;
  } catch (e) {
    toast.value = {
      show: true,
      message: e?.message || "Failed to load schedules",
      type: "error",
    };
  } finally {
    loading.value = false;
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
      message: `Schedule created for ${payload.date}`,
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

const deleteSchedule = async () => {
  if (!form.value.id) return;
  isSubmitting.value = true;
  try {
    await $fetch(
      `${endpoint.value}/api/library/schedule/booking/${form.value.id}/delete/`,
      { method: "DELETE" }
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
        headers: { "Content-Type": "application/json" }
      }
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
          html: `<div style="font-weight:bold; color:#fff;">BOOKED</div>`,
        };
      },

      select: (sel) => handleSelect(sel),
      eventClick: (info) => handleEventClick(info),
      eventResize: (info) => handleEventResize(info),
      dayClick: (info) => handleDayClick(info),
      height: "auto",
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
});

const handleSelect = (sel) => {
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
  // Find schedule for this date
  const clickedDate = moment(info.date).format("MM-DD-YYYY");
  const schedule = schedules.value.find(s => s.date === clickedDate);

  if (schedule) {
    quickRemoveDate.value = clickedDate;
    quickRemoveScheduleId.value = schedule.id;
    quickRemoveSlots.value = Array.isArray(schedule.time) ? schedule.time : [schedule.time];
    showQuickRemoveModal.value = true;
  } else {
    toast.value = { show: true, message: "No schedule found for this date", type: "info" };
  }
};

const removeTimeSlot = async (slotToRemove) => {
  if (!quickRemoveScheduleId.value) return;

  isSubmitting.value = true;
  try {
    // Get current schedule
    const schedule = schedules.value.find(s => s.id === quickRemoveScheduleId.value);
    if (!schedule) {
      toast.value = { show: true, message: "Schedule not Found", type: "error" };
      return;
    }

    // Remove the slot from the time array
    const currentTimes = Array.isArray(schedule.time) ? schedule.time : [schedule.time];
    const updatedTimes = currentTimes.filter(slot =>
      !(slot._12_hour_format_from === slotToRemove._12_hour_format_from &&
        slot._12_hour_format_to === slotToRemove._12_hour_format_to)
    );

    // Convert to string format for API
    let updatedTimeStrings = updatedTimes.map(slot => `${slot._12_hour_format_from} - ${slot._12_hour_format_to}`);

    // If less than 2 slots, set to ["-"] as per old code
    if (updatedTimeStrings.length < 2) {
      updatedTimeStrings = ["-"];
    }

    // Create payload with updated times
    const payload = {
      date: schedule.date,
      time: updatedTimeStrings,
      updated_at: new Date().toISOString(),
    };

    console.log("📤 Removing slot payload:", payload);

    const response = await $fetch(
      `${endpoint.value}/api/library/schedule/booking/${quickRemoveScheduleId.value}/edit/`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
      }
    );

    console.log("✅ Slot removal response:", response);

    // Update local state
    quickRemoveSlots.value = updatedTimes;

    // If no slots left, close modal and refresh
    if (updatedTimes.length === 0) {
      closeQuickRemoveModal();
      await fetchSchedules();
      toast.value = { show: true, message: "All slots removed for this day", type: "success" };
    } else {
      toast.value = { show: true, message: "Time slot removed", type: "success" };
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
