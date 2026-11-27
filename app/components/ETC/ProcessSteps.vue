<script setup>
import { ref } from 'vue';

const activeTab = ref('borrowing');

const borrowingRequestSteps = [
  { step: 'Step 1', text: 'Open the ETC Services Google Form via bit.ly/ETCRequestS.' },
  { step: 'Step 2', text: 'Read La Salle University\'s Media Release Form, review the authorization section, and check the boxes that apply (selecting "I DISAGREE..." concludes the process).' },
  { step: 'Step 3', text: 'Fill in Primary Information.' },
  { step: 'Step 4', text: 'In the ETC Services portion, choose "Borrowing of Plug-and-Play Multimedia Equipment".' },
  { step: 'Step 5', text: 'Read the Borrowing of Plug-and-Play Multimedia Equipment Policy and check the agreement box.' },
  { step: 'Step 6', text: 'In the List of Multimedia Equipment, check the items you wish to borrow (confirm availability with ETC Personnel).' },
  { step: 'Step 7', text: 'Fill in Event Information.' },
  { step: 'Step 8', text: 'Keep track of your experience when borrowing equipment for the ETC Services Evaluation Form later.' },
  { step: 'Step 9', text: 'Click Submit. (For multi-day activities, fill out the form once per day.)' },
];

const receivingSteps = [
  { step: 'Step 10', text: 'Open the ETC Services BPPME Receiving and Returning Form via bit.ly/bppmeLOG.' },
  { step: 'Step 11', text: 'Fill in Primary Information.' },
  { step: 'Step 12', text: 'In Action to Take, choose "Receiving Borrowed Equipment".' },
  { step: 'Step 13', text: 'Select the items and confirm item receipt details and equipment condition.' },
  { step: 'Step 14–16', text: 'Fill in Event Information and click Submit.' },
];

const returningSteps = [
  { step: 'Step 17', text: 'Open the ETC Services BPPME Receiving and Returning Form via bit.ly/bppmeLOG.' },
  { step: 'Step 18–19', text: 'Fill in Primary Information and choose "Returning Borrowed Equipment".' },
  { step: 'Step 20–21', text: 'Select the items, confirm return details and equipment condition, and fill in Event Information.' },
  { step: 'Step 22', text: 'Complete the ETC Services Evaluation via bit.ly/ETCServicesEvalForm, then input DONE.' },
  { step: 'Step 23', text: 'Click Submit.' },
];

const concernsSteps = [
  { step: 'Step 1', text: 'Open the ETC Services Google Form via https://bit.ly/ETCRequestS.' },
  { step: 'Step 2', text: 'Read La Salle University\'s Media Release Form, review the authorization section, and check the boxes that apply.' },
  { step: 'Step 3', text: 'Fill in Primary Information.' },
  { step: 'Step 4', text: 'In the ETC Services portion, choose "EdTech & Multimedia Concerns".' },
  { step: 'Step 5', text: 'Identify the possible issues.' },
  { step: 'Step 6', text: 'Provide additional details about your concern.' },
  { step: 'Step 7', text: 'Upload photos or videos to support your concern.' },
  { step: 'Step 8', text: 'Complete the ETC Services Evaluation via bit.ly/ETCServicesEvalForm after the service is rendered.' },
  { step: 'Step 9', text: 'Click Submit.' },
];
</script>

<template>
  <section id="process-steps" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">myZ1 Workflow</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Step-by-Step <span class="text-[#14532d]">Process</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5">
            Follow the guided workflow for borrowing equipment, receiving/returning items, or reporting EdTech &amp; multimedia concerns.
          </p>
        </div>

        <!-- Tabs -->
        <div class="inline-flex p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'borrowing' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'borrowing'"
          >
            Borrowing (Steps 1–23)
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'concerns' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'concerns'"
          >
            EdTech Concerns (Steps 1–9)
          </button>
        </div>
      </div>

      <!-- Tab 1: Borrowing Process -->
      <div v-if="activeTab === 'borrowing'" class="space-y-8">
        <!-- Part 1: Requesting -->
        <div>
          <h3 class="text-sm sm:text-base font-extrabold text-[#14532d] mb-3 flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-md bg-[#14532d] text-white text-xs">Part 1</span>
            <span>Submitting a Request (Steps 1–9)</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div
              v-for="item in borrowingRequestSteps"
              :key="item.step"
              class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
            >
              <span class="px-2 py-1 rounded-lg bg-[#14532d] text-white text-[10px] font-black shrink-0">{{ item.step }}</span>
              <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ item.text }}</p>
            </div>
          </div>
        </div>

        <!-- Part 2: Receiving & Returning -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-[#14532d] mb-3 flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-[#14532d] text-white text-xs">Part 2A</span>
              <span>Receiving Equipment (Steps 10–16)</span>
            </h3>
            <div class="space-y-2.5">
              <div
                v-for="item in receivingSteps"
                :key="item.step"
                class="p-3.5 rounded-xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
              >
                <span class="px-2 py-0.5 rounded-md bg-[#14532d] text-white text-[10px] font-black shrink-0">{{ item.step }}</span>
                <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ item.text }}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-[#14532d] mb-3 flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-[#14532d] text-white text-xs">Part 2B</span>
              <span>Returning &amp; Evaluation (Steps 17–23)</span>
            </h3>
            <div class="space-y-2.5">
              <div
                v-for="item in returningSteps"
                :key="item.step"
                class="p-3.5 rounded-xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
              >
                <span class="px-2 py-0.5 rounded-md bg-[#14532d] text-white text-[10px] font-black shrink-0">{{ item.step }}</span>
                <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Links Bar -->
        <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <a href="https://bit.ly/ETCRequestS" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold transition-colors">
            Request Form: bit.ly/ETCRequestS
          </a>
          <a href="https://bit.ly/bppmeLOG" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-[#f0f5f0] hover:bg-[#e2ece2] border border-green-900/20 text-[#14532d] text-xs font-bold transition-colors">
            Receiving &amp; Returning Log: bit.ly/bppmeLOG
          </a>
          <a href="https://bit.ly/ETCServicesEvalForm" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-[#f0f5f0] hover:bg-[#e2ece2] border border-green-900/20 text-[#14532d] text-xs font-bold transition-colors">
            Evaluation Form: bit.ly/ETCServicesEvalForm
          </a>
        </div>
      </div>

      <!-- Tab 2: EdTech & Multimedia Concerns -->
      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            v-for="item in concernsSteps"
            :key="item.step"
            class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
          >
            <span class="px-2 py-1 rounded-lg bg-[#14532d] text-white text-[10px] font-black shrink-0">{{ item.step }}</span>
            <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ item.text }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <a href="https://bit.ly/ETCRequestS" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold transition-colors">
            Submit Concern: bit.ly/ETCRequestS
          </a>
          <a href="https://bit.ly/ETCServicesEvalForm" target="_blank" rel="noopener noreferrer" class="px-4 py-2 rounded-xl bg-[#f0f5f0] hover:bg-[#e2ece2] border border-green-900/20 text-[#14532d] text-xs font-bold transition-colors">
            Evaluation Form: bit.ly/ETCServicesEvalForm
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
