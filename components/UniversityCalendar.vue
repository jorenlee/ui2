<template>
  <div class="p-4 min-h-screen w-full bg-green-900 lg:pt-12 pt-5 lg:pb-10 pb-5">
    <div class="max-w-6xl mx-auto">
      <div class="flex">
        <h2
          class="text-xl font-bold text-center mt-2 mb-4 w-full uppercase text-white"
        >
          University Calendar
        </h2>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <iframe
          class="w-full h-[100vh] border-0"
          referrerpolicy="no-referrer"
          loading="lazy"
          :src="iframeSrc"
          style="border: solid 1px #777"
          width="800"
          height="600"
          frameborder="0"
          scrolling="no"
        ></iframe>
      </div>

      <p class="text-gray-100 text-center text-[10px] mt-3 leading-tight">
        Send an email to
        <a href="mailto:chancellor@lsu.edu.ph" class="font-bold"
          >chancellor@lsu.edu.ph</a
        >
        to request additional information or inquire about other announcements
        within the La Salle community.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const baseCalendarUrl =
  "https://calendar.google.com/calendar/embed?" +
  "height=600" +
  "&wkst=1" +
  "&ctz=Asia%2FManila" +
  "&showPrint=0" + // hide print button
  "&showTabs=0" + // hide tabs (Agenda/Week/Month)
  "&showTitle=0" + // hide calendar title
  "&showCalendars=0" + // hide email/calendar list
  "&showTz=0" + // hide GMT/timezone
  "&src=Y2FsZW5kYXJAbHN1LmVkdS5waA" +
  "&src=ZW4ucGhpbGlwcGluZXMjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20" +
  "&color=%23039be5" +
  "&color=%230b8043" +
  "&mode=MONTH"; // month view only

const iframeSrc = ref(`${baseCalendarUrl}&t=${Date.now()}`);

let interval;

onMounted(() => {
  interval = setInterval(() => {
    iframeSrc.value = `${baseCalendarUrl}&t=${Date.now()}`;
  }, 60000); // reload every 1 minute
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.bg-green-800 {
  background-color: #096b2e;
}
</style>
