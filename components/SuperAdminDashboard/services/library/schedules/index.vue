<template>
  <div
    :class="[
      'p-4 min-h-screen',
      darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
    ]"
  >
    <div class="flex gap-4">
 
      <!-- Main content -->
      <div class="flex-1">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-green-800">
            Library Schedules — Calendar
          </h2>
          <div class="flex gap-2">
            <button
              @click="openCreateFromButton"
              class="bg-green-800 text-white px-4 py-2 rounded"
            >
              New
            </button>
            <button @click="refresh" class="bg-white border px-3 py-2 rounded">
              Refresh
            </button>
          </div>
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
        <div>
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
    <div
      :class="[
        'rounded-lg w-full max-w-2xl p-6',
        darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900',
      ]"
    >
      <h3 class="font-bold mb-4">
        {{ isEditing ? "Edit Schedule" : "Create New Schedule" }}
      </h3>

      <div class="grid gap-3">
        
        <!-- Date -->
        <label class="text-sm">
          Date:
          <span class="font-bold">
            {{ form.date ? moment(form.date).format("MMMM DD, YYYY") : "" }}
          </span>
        </label>

        <!-- Select Times Title -->
        <label class="text-sm">Select Times</label>

        <!-- SELECT ALL CHECKBOX -->
        <label class="flex items-center gap-2 text-sm font-semibold mb-2">
          <input type="checkbox" v-model="selectAllTimes" @change="toggleSelectAllTimes" />
          <span>Select All</span>
        </label>

        <!-- Times List -->
        <div class="lg:grid grid-cols-3">
          <label
            v-for="(t, i) in timeOptions"
            :key="i"
            class="flex items-center gap-2 text-sm py-1"
          >
            <input
              type="checkbox"
              :value="t._12_hour_format_from + ' - ' + t._12_hour_format_to"
              v-model="form.times"
            />
            <span>
              {{ t._12_hour_format_from }} - {{ t._12_hour_format_to }}
            </span>
          </label>
        </div>

        <!-- Recurrence Days -->
        <div v-if="form.recurring" class="grid grid-cols-7 gap-2 text-xs">
          <label
            v-for="(d, idx) in weekDays"
            :key="d"
            class="flex flex-col items-center"
          >
            <input type="checkbox" :value="d" v-model="form.recurrence_days" />
            <span class="text-xs">{{ d.slice(0, 2) }}</span>
          </label>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-2 mt-3">
          <button @click="closeModal" class="px-4 py-2 border rounded">
            Cancel
          </button>

          <button
            v-if="!isEditing"
            @click="createSchedule"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-green-800 text-white rounded"
          >
            {{ isSubmitting ? "Saving..." : "Create" }}
          </button>

          <div v-else class="flex gap-2">
            <button
              @click="updateSchedule"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              {{ isSubmitting ? "Saving..." : "Save Changes" }}
            </button>

            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-600 text-white rounded"
            >
              Delete
            </button>
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
              :class="[
                'rounded-lg w-full max-w-md p-6 text-center',
                darkMode ? 'bg-gray-800 text-white' : 'bg-white',
              ]"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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
const formatApiDate = (d) =>
  moment(d, ["MM-DD-YYYY", "YYYY-MM-DD"]).format("MMMM D, YYYY");
const readableTimes = (t) => {
  if (!t) return "—";
  if (Array.isArray(t))
    return t
      .map((x) =>
        typeof x === "string"
          ? x
          : x._12_hour_format_from + " - " + x._12_hour_format_to
      )
      .join(", ");
  if (typeof t === "string") return t;
  if (typeof t === "object" && t._12_hour_format_from)
    return `${t._12_hour_format_from} - ${t._12_hour_format_to}`;
  return String(t);
};

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

  return raw.flatMap((item) => {
    // handle recurring with rrule
    if (item.recurrence && typeof item.recurrence === "string") {
      // create an event that uses rrule (FullCalendar rrule plugin required)
      // event will show as all-day unless time ranges present
      const times = Array.isArray(item.time)
        ? item.time
        : item.time
        ? [item.time]
        : [];
      const firstTime = normalizeTimeLabel(times[0]);

      const ev = {
        id: item.id,
        title: item.notes || "Recurring Schedule",
        extendedProps: { original: item },
      };

      if (firstTime) {
        const [from, to] = firstTime.split(" - ").map((s) => s.trim());
        ev.startTime = from;
        ev.endTime = to;
      }

      // attach rrule string
      ev.rrule = item.recurrence;
      return [ev];
    }

    // non-recurring: build events per time slot
    const date = moment(item.date, ["MM-DD-YYYY", "YYYY-MM-DD"]).format(
      "YYYY-MM-DD"
    );
    const times = Array.isArray(item.time)
      ? item.time
      : item.time
      ? [item.time]
      : [];

    if (!times.length) {
      return [
        {
          id: String(item.id),
          title: item.notes || "Schedule",
          start: date,
          allDay: true,
          extendedProps: { original: item },
        },
      ];
    }

    return times.map((t, idx) => {
      const norm = normalizeTimeLabel(t);
      if (!norm) {
        return {
          id: `${item.id}-all-${idx}`,
          title: item.notes || "Schedule",
          start: date,
          allDay: true,
          extendedProps: { original: item },
        };
      }

      const [from, to] = norm.split(" - ").map((s) => s.trim());
      const start = moment(`${date} ${from}`, [
        "YYYY-MM-DD hh:mm A",
        "YYYY-MM-DD HH:mm",
      ]).toISOString();
      const end = moment(`${date} ${to}`, [
        "YYYY-MM-DD hh:mm A",
        "YYYY-MM-DD HH:mm",
      ]).toISOString();

      return {
        id: `${item.id}-${idx}`,
        groupId: String(item.id),
        title: item.notes || `${from} - ${to}`,
        start,
        end,
        extendedProps: { original: item, timeLabel: norm },
      };
    });
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

const timeOptions = ref(scheduleJSON?.timeSelection?.[0]?.time || []);

// FullCalendar dynamic loader & options
const FullCalendar = ref(null);
const calendarPlugins = ref([]);
const calendarReady = ref(false);
const calendarOptions = ref({});

// UI state
const sidebarCollapsed = ref(false);
const darkMode = ref(false);

const toggleSidebar = () => (sidebarCollapsed.value = !sidebarCollapsed.value);
const toggleDarkMode = () => (darkMode.value = !darkMode.value);

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

const updateSchedule = async () => {
  if (!form.value.id) return;
  isSubmitting.value = true;
  try {
    await $fetch(
      `${endpoint.value}/api/library/schedule/booking/${form.value.id}/update/`,
      { method: "PUT", body: formToPayload(form.value) }
    );
    closeModal();
    await fetchSchedules();
    toast.value = { show: true, message: "Schedule updated", type: "success" };
  } catch (e) {
    toast.value = {
      show: true,
      message: e?.data?.message || e?.message || "Update failed",
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
    toast.value = { show: true, message: "Schedule removed", type: "success" };
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

/* ----------------------- Drag & Resize handlers ----------------------- */
const handleEventDrop = async (dropInfo) => {
  // event moved (drag-to-move)
  const evt = dropInfo.event;
  const orig = evt.extendedProps.original || {};
  const newStart = moment(evt.start).format("MM-DD-YYYY");
  // If event has time, preserve time label
  let timeLabel = evt.extendedProps.timeLabel || null;
  if (evt.start && evt.end && !evt.allDay) {
    const s = moment(evt.start).format("hh:mm A");
    const e = moment(evt.end).format("hh:mm A");
    timeLabel = `${s} - ${e}`;
  }

  // Build payload: if original had recurrence, cancel? we update single occurrence by sending date/time
  const payload = { date: newStart };
  if (timeLabel) payload.time = [timeLabel];

  try {
    await $fetch(
      `${endpoint.value}/api/library/schedule/booking/${orig.id}/update/`,
      { method: "PUT", body: payload }
    );
    toast.value = { show: true, message: "Schedule moved", type: "success" };
    await fetchSchedules();
  } catch (e) {
    toast.value = {
      show: true,
      message: e?.message || "Move failed",
      type: "error",
    };
    dropInfo.revert();
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
      { method: "PUT", body: payload }
    );
    toast.value = { show: true, message: "Schedule resized", type: "success" };
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

const openEditFromSidebar = (s) => {
  isEditing.value = true;
  form.value = scheduleToForm(s);
  showModal.value = true;
};

const openEditModal = (schedule) => {
  isEditing.value = true;
  form.value = scheduleToForm(schedule);
  showModal.value = true;
};

const openEditFromCalendar = (schedule) => {
  isEditing.value = true;
  form.value = scheduleToForm(schedule); // form.times is normalized
  showModal.value = true;
};

/* ----------------------- Computeds ----------------------- */
const upcoming = computed(() =>
  schedules.value
    .slice()
    .sort((a, b) =>
      moment(a.date, ["MM-DD-YYYY", "YYYY-MM-DD"]).diff(
        moment(b.date, ["MM-DD-YYYY", "YYYY-MM-DD"])
      )
    )
);

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
      initialView: "timeGridWeek",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      selectable: true,
      editable: true, // allow drag & resize
      droppable: false,
      events: events.value,
      select: (sel) => handleSelect(sel),
      eventClick: (info) => handleEventClick(info),
      eventDrop: (info) => handleEventDrop(info), // move
      eventResize: (info) => handleEventResize(info), // resize
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


const selectAllTimes = ref(false);

const toggleSelectAllTimes = () => {
  if (selectAllTimes.value) {
    // Select all schedules
    form.value.times = timeOptions.value.map(
      (t) => t._12_hour_format_from + " - " + t._12_hour_format_to
    );
  } else {
    // Clear all
    form.value.times = [];
  }
};

// Auto-update "Select All" if user manually checks all items
watch(
  () => form.value.times,
  (val) => {
    selectAllTimes.value = val.length === timeOptions.value.length;
  }
);

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
