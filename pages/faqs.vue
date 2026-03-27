<script setup>
import { ref, computed } from "vue";

// FAQ DATA
const faqs = ref([
  // STUDENT ID
  {
    q: "Who is eligible to apply for a Student ID?",
    a: "All currently enrolled and incoming registered students.",
    open: false,
    category: "studentId",
  },
  {
    q: "Is a Student ID required when claiming TES (Tertiary Education Subsidy)?",
    a: "Yes.",
    open: false,
    category: "studentId",
  },
  {
    q: "How long is the processing time?",
    a: "Usually 1 to 3 working days.",
    open: false,
    category: "studentId",
  },
  {
    q: "Where will the Picture ID taking take place?",
    a: "Picture ID taking will take place at the Registrar's Office after submitting or filling out the form.",
    open: false,
    category: "studentId",
  },

  // LSU ACCOUNTS
  {
    q: "How do I retrieve or reset my LSU Canvas account?",
    a: "Visit lsu.instructure.com/login/canvas and click on FORGOT PASSWORD. Contact npc@lsu.edu.ph for concerns.",
    open: false,
    category: "lsuAccounts",
  },
  {
    q: "How do I retrieve or reset my LSU Gmail account?",
    a: "Go to gmail.com, enter your LSU email address, and click FORGOT PASSWORD. Contact npc@lsu.edu.ph for concerns.",
    open: false,
    category: "lsuAccounts",
  },
  {
    q: "How do I retrieve or reset my LSU Student Portal account for MY.LSU?",
    a: "Visit the Registrar's Office to request a new password. If you have forgotten your password more than once, a PHP 50 fee will be charged to avoid negligence. Pay the fee at the Accounting Office. Contact registrar@lsu.edu.ph for concerns.",
    open: false,
    category: "lsuAccounts",
  },

  // TRANSCRIPT / ONLINE DOCUMENTS
  {
    q: "How do I request a Transcript of Records?",
    a: "You may request your Transcript of Records by emailing registrar@lsu.edu.ph, visiting the Registrar's Office, or submitting online requests via https://lsu.edu.ph/registrar.",
    open: false,
    category: "transcript",
  },
  {
    q: "How do I check enrollment or admission status?",
    a: "For enrollment or admission status, email admissions@lsu.edu.ph or visit the Admissions and Scholarships Office, SJ Building Ground Floor LSU Campus. Office hours: Monday to Friday 8am to 5pm, Saturday 8am to 12nn.",
    open: false,
    category: "transcript",
  },

  // LIBRARY / OPAC / FOLLETT
  {
    q: "How do I access OPAC or Follett Software library resources?",
    a: "For OPAC and Follett Software inquiries, email library@lsu.edu.ph. These are 3rd party software and not managed by LSU IT Services. You may also visit the Library Office directly for assistance.",
    open: false,
    category: "library",
  },
]);

// FILTERED LISTS
const studentIdFaqs = computed(() =>
  faqs.value.filter((faq) => faq.category === "studentId"),
);

const faqsAccounts = computed(() =>
  faqs.value.filter((faq) => faq.category === "lsuAccounts"),
);

const transcriptFaqs = computed(() =>
  faqs.value.filter((faq) => faq.category === "transcript"),
);

const libraryFaqs = computed(() =>
  faqs.value.filter((faq) => faq.category === "library"),
);

// TOGGLE
const toggle = (faq) => {
  faq.open = !faq.open;
};
</script>

<template>
  <div class="bg-gray-50">
    <Header />

    <!-- Banner -->
    <div class="relative">
      <Banner />
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="align-top w-full h-36 object-none lg:hidden block"
      />
      <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
        <h1
          class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
        >
          Frequently Asked Questions
        </h1>
      </div>
      <div class="pt-2.5 pb-3 shadow-lg">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li><a href="/" class="mr-1">Home</a></li>
          <li>
            <i class="fas fa-caret-right mr-1"></i>
            <a href="/faqs" class="mr-1">FAQs</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Student ID FAQs -->
    <div class="lg:flex gap-5 lg:px-5 px-2 pt-10 mx-auto">
      <section class="w-11/12 mx-auto p-6 bg-white rounded-2xl shadow-md mb-10">
        <h1 class="lg:text-2xl font-semibold mb-2">
          Student ID Processing — FAQs
        </h1>
        <p class="text-sm text-gray-600 mb-6">
          Frequently Asked Questions about the Student ID processing.
        </p>

        <div class="mx-auto w-fit mb-5">
          <a
            href="https://docs.google.com/forms/d/12KFTQGORWykzuQiQn9zDMgqiDbU_Sf8OqWz2Th4i3T0/edit?ts=689e83e6"
            target="_blank"
            class="lg:px-10 px-5 uppercase bg-green-800 rounded-lg py-3 text-center text-white font-bold lg:text-lg text-xs"
          >
            Open Student ID Request Form
          </a>
        </div>

        <div class="space-y-2">
          <div
            v-for="(faq, index) in studentIdFaqs"
            :key="index"
            class="border rounded-lg overflow-hidden"
          >
            <button
              class="w-full text-left lg:p-4 px-2 py-2 flex justify-between items-start focus:outline-none focus:ring"
              @click="toggle(faq)"
            >
              <span class="font-medium lg:text-sm text-[10px]">{{
                faq.q
              }}</span>
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
      </section>
    </div>

    <!-- LSU Accounts -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <section class="w-11/12 mx-auto p-6 bg-white rounded-2xl shadow-md mb-10">
        <h1 class="lg:text-2xl font-semibold mb-2">LSU Account Credentials</h1>
        <p class="text-sm text-gray-600 mb-6">
          Frequently Asked Questions about the LSU Accounts and Emails.
        </p>

        <div class="space-y-2">
          <div
            v-for="(faq, index) in faqsAccounts"
            :key="index"
            class="border rounded-lg overflow-hidden"
          >
            <button
              class="w-full text-left lg:p-4 px-2 py-2 flex justify-between items-start focus:outline-none focus:ring"
              @click="toggle(faq)"
            >
              <span class="font-medium lg:text-sm text-[10px]">{{
                faq.q
              }}</span>
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

        <div class="mt-6 lg:p-4 p-2 border rounded-lg bg-gray-50">
          <h3 class="font-medium">Contact / Support</h3>
          <p class="lg:text-sm text-xs text-gray-700 mt-2">
            For concerns, email
            <a href="mailto:registrar@lsu.edu.ph" class="underline"
              >registrar@lsu.edu.ph</a
            >.
          </p>
        </div>
      </section>
    </div>

    <!-- Transcript / Online Documents -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <section class="w-11/12 mx-auto p-6 bg-white rounded-2xl shadow-md mb-10">
        <h1 class="lg:text-2xl font-semibold mb-2">
          Transcript & Online Document Requests
        </h1>
        <p class="text-sm text-gray-600 mb-6">
          Information on requesting your Transcript of Records and other online
          documents.
        </p>

        <div class="space-y-2">
          <div
            v-for="(faq, index) in transcriptFaqs"
            :key="index"
            class="border rounded-lg overflow-hidden"
          >
            <button
              class="w-full text-left lg:p-4 px-2 py-2 flex justify-between items-start focus:outline-none focus:ring"
              @click="toggle(faq)"
            >
              <span class="font-medium lg:text-sm text-[10px]">{{
                faq.q
              }}</span>
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

        <div class="mt-6 lg:p-4 p-2 border rounded-lg bg-gray-50">
          <h3 class="font-medium">Contact / Support</h3>
          <p class="lg:text-sm text-xs text-gray-700 mt-2">
            Email registrar:
            <a href="mailto:registrar@lsu.edu.ph" class="underline"
              >registrar@lsu.edu.ph</a
            ><br />
            Email admissions (enrollment/status):
            <a href="mailto:admissions@lsu.edu.ph" class="underline"
              >admissions@lsu.edu.ph</a
            ><br />
            Office visit: Admissions and Scholarships Office, SJ Building Ground
            Floor LSU Campus. Mon-Fri 8am-5pm, Sat 8am-12nn<br />
            Online requests:
            <a
              href="https://lsu.edu.ph/registrar"
              target="_blank"
              class="underline"
              >https://lsu.edu.ph/registrar</a
            >
          </p>
        </div>
      </section>
    </div>

    <!-- Library / OPAC / Follett -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <section class="w-11/12 mx-auto p-6 bg-white rounded-2xl shadow-md mb-10">
        <h1 class="lg:text-2xl font-semibold mb-2">
          Library — OPAC & Follett Software
        </h1>

        <div class="space-y-2">
          <div
            v-for="(faq, index) in libraryFaqs"
            :key="index"
            class="border rounded-lg overflow-hidden"
          >
            <button
              class="w-full text-left lg:p-4 px-2 py-2 flex justify-between items-start focus:outline-none focus:ring"
              @click="toggle(faq)"
            >
              <span class="font-medium lg:text-sm text-[10px]">{{
                faq.q
              }}</span>
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

        <div class="mt-6 lg:p-4 p-2 border rounded-lg bg-gray-50">
          <h3 class="font-medium">Contact / Support</h3>
          <p class="lg:text-sm text-xs text-gray-700 mt-2">
            Email:
            <a href="mailto:library@lsu.edu.ph" class="underline"
              >library@lsu.edu.ph</a
            ><br />
            Visit the Library Office directly. OPAC and Follett Software are
            3rd-party tools, not managed by LSU IT Services.
          </p>
        </div>
      </section>
    </div>

    <Footer />
  </div>
</template>
