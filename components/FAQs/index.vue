<template>
  <section class="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md mb-10">
    <h1 class="lg:text-2xl font-semibold mb-2">Student ID Processing — FAQs</h1>
    <p class="text-sm text-gray-600 mb-6">
      Frequently Asked Questions about the Student ID processing.
    </p>

    <!-- Steps -->
    <div class="mx-auto w-fit mb-5">
      <a
        href="https://docs.google.com/forms/d/12KFTQGORWykzuQiQn9zDMgqiDbU_Sf8OqWz2Th4i3T0/edit?ts=689e83e6"
        target="_blank"
        class="lg:px-10 px-5 uppercase bg-green-800 rounded-lg py-3 text-center text-white font-bold lg:text-lg text-xs"
      >
        Open Student ID Request Form
      </a>
    </div>

    <!-- FAQ List -->
    <div class="space-y-2">
      <div
        v-for="(faq, index) in faqs"
        :key="index"
        class="border rounded-lg overflow-hidden"
      >
        <button
          class="w-full text-left lg:p-4 px-2 py-2 flex justify-between items-start focus:outline-none focus:ring"
          @click="toggle(index)"
        >
          <span class="font-medium lg:text-sm text-[10px]">{{ faq.q }}</span>

          <svg
            :class="{ 'rotate-180': faq.open }"
            class="w-5 h-5 transition-transform"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

               <div
              v-show="faq.open"
              class="p-4 lg:text-sm text-[9px] text-white bg-green-900 border-t pl-10"
            >
              {{ faq.a }}
            </div>
      </div>
    </div>

    <!-- Contact -->
    <div class="mt-6 lg:p-4 p-2 border rounded-lg bg-gray-50">
      <h3 class="font-medium">Contact / Support</h3>
      <p class="lg:text-sm text-xs text-gray-700 mt-2">
        For concerns, email
        <a href="mailto:registrar@lsu.edu.ph" class="underline">
          registrar@lsu.edu.ph </a
        >.
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

// FAQ DATA (with "open" state included)
const faqs = ref([
  {
    q: "Who is eligible to apply for a Student ID?",
    a: "All currently enrolled and incoming registered students.",
    open: false,
  },
  {
    q: "Is a Student ID required when claiming TES (Tertiary Education Subsidy)?",
    a: "Yes.",
    open: false,
  },
  {
    q: "How long is the processing time?",
    a: "Usually 1 to 3 working days.",
    open: false,
  },
{
  q: "Where will the Picture ID taking take place?",
  a: "Picture ID taking will take place at the Registrar's Office after submitting or filling out the form.",
  open: false,
},
]);

// Toggle Accordion
const toggle = (index) => {
  faqs.value[index].open = !faqs.value[index].open;
};
</script>

<style scoped></style>
