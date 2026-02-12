<template>
  <div :class="['p-4 min-h-screen']">
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
            <div :class="['rounded-lg w-full max-w-2xl p-6 bg-white']">
              <h3 class="font-bold mb-4">
                {{ isEditing ? "Edit Schedule" : "Create New Schedule" }}
              </h3>

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
                  <input type="checkbox" />
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
            <div :class="['rounded-lg w-full max-w-md p-6 text-center']">
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
const config = useRuntimeConfig();
const endpoint = computed(() => config.public.apiUrl || "");

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
