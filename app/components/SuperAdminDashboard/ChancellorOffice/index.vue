<template>
  <div class="p-4 min-h-screen"
    :class="darkMode ? 'bg-gray-900' : 'bg-gray-50'">
    <div class="max-w-6xl mx-auto">
      <div class="flex">
        <h2 class="text-xl font-bold text-green-800 text-center mb-4 w-full">
          University Calendar
        </h2>

        <!-- Optional: Add Event (opens Google Calendar UI) -->
        <a
          href="https://calendar.google.com/calendar/u/0/r/eventedit"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center mb-4 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-xs whitespace-nowrap"
        >
          Add Event
        </a>
      </div>

      <div class="rounded-lg shadow overflow-hidden"
        :class="darkMode ? 'bg-gray-800' : 'bg-white'">
        <iframe
          class="w-full h-[75vh] border-0"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Define props
const props = defineProps({
  darkMode: { type: Boolean, default: false }
});

const baseCalendarUrl =
  "https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Asia%2FManila&showPrint=0&src=Y2FsZW5kYXJAbHN1LmVkdS5waA&src=ZW4ucGhpbGlwcGluZXMjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23039be5&color=%230b8043";

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
