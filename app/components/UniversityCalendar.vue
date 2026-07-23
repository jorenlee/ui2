<template>
  <div class="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
      <!-- Card Header -->
      <div class="px-6 py-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
            <i class="far fa-calendar-alt text-lg"></i>
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold tracking-tight text-white">
              University Academic Calendar
            </h2>
            <p class="text-xs text-emerald-200">
              Official schedule of activities, holidays, and campus deadlines
            </p>
          </div>
        </div>

        <a
          href="mailto:chancellor@lsu.edu.ph"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors shrink-0"
        >
          <i class="far fa-envelope text-xs"></i>
          <span>Inquire Calendar</span>
        </a>
      </div>

      <!-- Calendar Frame -->
      <div class="p-2 sm:p-4 bg-slate-50/50">
        <div class="rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-white">
          <iframe
            class="w-full lg:h-[700px] h-[450px] border-0"
            referrerpolicy="no-referrer"
            loading="lazy"
            :src="iframeSrc"
            width="800"
            height="600"
            frameborder="0"
            scrolling="no"
          ></iframe>
        </div>
      </div>

      <!-- Footer Note -->
      <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
        <p class="text-slate-500 text-xs leading-relaxed">
          Need details regarding specific campus schedules? Send an email to
          <a href="mailto:chancellor@lsu.edu.ph" class="font-bold text-emerald-800 hover:underline">chancellor@lsu.edu.ph</a>
          or contact the Office of the Registrar.
        </p>
      </div>
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
  "&showPrint=0" +
  "&showTabs=0" +
  "&showTitle=0" +
  "&showCalendars=0" +
  "&showTz=0" +
  "&src=Y2FsZW5kYXJAbHN1LmVkdS5waA" +
  "&src=ZW4ucGhpbGlwcGluZXMjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20" +
  "&color=%23039be5" +
  "&color=%230b8043" +
  "&mode=MONTH";

const iframeSrc = ref(baseCalendarUrl);

let interval;

onMounted(() => {
  iframeSrc.value = `${baseCalendarUrl}&t=${Date.now()}`;
  interval = setInterval(() => {
    iframeSrc.value = `${baseCalendarUrl}&t=${Date.now()}`;
  }, 60000);
});

onBeforeUnmount(() => {
  clearInterval(interval);
});
</script>

<style scoped>
</style>

