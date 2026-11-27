<script setup>
import { ref } from 'vue';

const faqs = ref([
  {
    q: 'What are the available ETC Services?',
    list: [
      'Borrowing of Plug-and-Play Multimedia Equipment',
      'EdTech & Multimedia Concerns',
      'HyZONE Classroom Setup',
      'Multimedia Equipment Custodianship',
      'Sound System Setup',
      'Technical Management Support',
      'Event Management Packages',
      'Event Streaming',
      'Multimedia Equipment Rental',
      'Studio Rental',
      'Multimedia Production',
      'Educational Technology and Multimedia Training',
    ],
    note: 'Please check the table of contents on page 3.',
    open: true,
  },
  {
    q: 'Can I borrow multimedia equipment for free?',
    a: 'Yes, please check Borrowing of Plug-and-Play Multimedia Equipment on page 8.',
    open: false,
  },
  {
    q: 'What ETC service should I request if I want our event to be broadcast live on Social Media or other Streaming Platform?',
    a: 'EdTech & Multimedia Concerns, refer to page 30.',
    open: false,
  },
  {
    q: 'What is the term for a setup used for online classes, conferences, and meetings in a classroom?',
    a: 'HyZONE Classroom Setup, check on page 14.',
    open: false,
  },
  {
    q: 'Can I borrow equipment for an extended period, such as a week or a month?',
    a: 'Yes, please refer to the Multimedia Equipment Custodianship on page 17.',
    open: false,
  },
  {
    q: 'Do you offer sound system setups for large audiences?',
    a: 'Yes, please check Sound System Setup on page 21.',
    open: false,
  },
  {
    q: 'Which ETC service should I request if I need focused assistance from a staff member for a specific task during an event?',
    a: 'Yes, please check the Technical Management Support on page 24.',
    open: false,
  },
  {
    q: 'Which ETC service can help coordinate and support the different logistical and technical needs of an event?',
    a: 'Event Management Support Packages, check on page 27.',
    open: false,
  },
  {
    q: 'Which should I request if I need to borrow complex multimedia equipment, such as DSLR cameras, lighting kits, or audio recording gear, for documentation or production purposes?',
    a: 'Multimedia Equipment Rental, check on page 36.',
    open: false,
  },
  {
    q: 'What ETC service should I request if I need a controlled environment for video shoots, livestreams, or audio recordings?',
    a: 'Studio Rental, refer to page 60.',
    open: false,
  },
  {
    q: 'Which ETC service should I request if I need help creating videos, graphics, or other digital content?',
    a: 'Multimedia Production, check on page 69.',
    open: false,
  },
  {
    q: 'Which ETC service should I request if I want to be trained in areas such as blended learning strategies, Google Workspace, LMS platforms, or multimedia skills like video editing, animation, and event production?',
    a: 'Educational Technology and Multimedia Training, refer to page 80.',
    open: false,
  },
  {
    q: 'Where is the ETC Office located on campus?',
    a: 'The ETC Office is located in Room LS208, 2nd Floor of the LS Building, near the Mac Laboratory.',
    open: true,
  },
]);

const toggleFaq = (index) => {
  faqs.value[index].open = !faqs.value[index].open;
};
</script>

<template>
  <section id="etc-faqs" class="pb-14 sm:pb-16 px-4 sm:px-6 flex-1">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Help &amp; Guide</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions <span class="text-[#14532d]">(FAQs)</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5">
            Quick answers about ETC services, equipment borrowing, studio booking, and campus location.
          </p>
        </div>
        <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f0f5f0] border border-green-200 text-xs font-bold text-[#14532d] shrink-0 self-start sm:self-auto">
          {{ faqs.length }} Questions
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="rounded-2xl border border-green-900/15 overflow-hidden bg-[#fafcfa]"
        >
          <button
            type="button"
            class="w-full text-left px-5 py-4 bg-[#14532d] hover:bg-[#166534] text-white flex items-start justify-between gap-3 transition-colors"
            @click="toggleFaq(index)"
          >
            <span class="text-xs sm:text-sm font-bold leading-snug">{{ faq.q }}</span>
            <span class="w-6 h-6 rounded-full bg-white text-[#14532d] flex items-center justify-center shrink-0 mt-0.5">
              <svg
                class="w-3.5 h-3.5 transition-transform duration-200"
                :class="{ 'rotate-180': faq.open }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>

          <div
            v-show="faq.open"
            class="px-5 py-4 bg-[#f0f5f0] text-slate-800 text-xs sm:text-sm leading-relaxed border-t border-green-900/10"
          >
            <p class="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d] mb-1.5">Answer:</p>
            <ul v-if="faq.list" class="list-disc pl-5 space-y-1 text-slate-700 font-medium mb-2.5">
              <li v-for="(item, i) in faq.list" :key="i">{{ item }}</li>
            </ul>
            <p v-if="faq.a" class="text-slate-700 font-medium">{{ faq.a }}</p>
            <p v-if="faq.note" class="text-slate-500 text-xs italic mt-2">{{ faq.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
