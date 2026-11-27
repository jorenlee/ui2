<script setup>
import { ref } from 'vue';

const activeTab = ref('packages');

const streamingPackages = [
  {
    name: 'Event Streaming A',
    subtitle: 'Live Streaming Setup Only',
    fee: '₱3,000.00',
    inclusions: [
      'Maximum of 3-hour Streaming Setup',
      '1 Computer Unit plus streaming equipment setup',
      '2 Camera setup',
      '1 Audio in setup',
      'Live Projection to LCD/LED Projection System',
    ],
  },
  {
    name: 'Event Streaming B',
    subtitle: 'Onsite speakers (ETC studio or small venue) / HyFlex Setup',
    fee: '₱4,000.00',
    inclusions: [
      '1 Technical Crew',
      'Maximum of 3-hour Streaming (LSU ZONE YouTube Channel or LSU EDMST FB Page)',
      '1 Computer Unit plus streaming equipment setup',
      '1 Camera Setup & 2 Microphones Setup',
      'Maximum 3-hour Studio use',
      'Event Technical Script or Prompt Sheet',
    ],
  },
  {
    name: 'Event Streaming C',
    subtitle: 'Online & onsite speakers + videoconferencing / HyZONE Setup',
    fee: '₱5,000.00',
    inclusions: [
      '1 Technical Crew & Event Technical Script or Prompt Sheet',
      'Maximum of 3-hour Streaming (LSU ZONE YouTube Channel or LSU EDMST FB Page)',
      '1 Computer Unit + streaming setup, 1 Camera, 4 Microphones Setup',
      'Maximum 3-hour Studio use',
      'Premium Google Meet Link (max 500 participants; or client\'s preferred tool)',
    ],
  },
  {
    name: 'Event Streaming D',
    subtitle: 'Onsite Event (simple setup)',
    fee: '₱7,000.00',
    inclusions: [
      '1 Technical Director, 1 Technical Crew, 1 Camera Crew',
      'Maximum of 3-hour Streaming (LSU ZONE YouTube Channel or LSU EDMST FB Page)',
      '1 Computer Unit plus streaming equipment setup & 2 Camera setup',
      'Live Projection to LCD/LED Projection System',
      'Event Technical Script or Prompt Sheet',
    ],
  },
  {
    name: 'Event Streaming E',
    subtitle: 'Onsite Event (complex setup) and Photo Highlights',
    fee: '₱10,000.00',
    inclusions: [
      '1 Technical Director, 1 Technical Crew, 2 Camera Crew',
      'Maximum of 3-hour Streaming (LSU ZONE YouTube Channel or LSU EDMST FB Page)',
      '2 Computer Units + streaming setup & 3 Camera setup',
      'Live Projection to LCD/LED & Event Technical Script / Prompt Sheet',
      '50–100 Edited Photo Highlights uploaded on ETC\'s Facebook Page (with Data Privacy Consent)',
    ],
  },
];

const responsibilities = [
  'Pre-Produced Video, Audio, Presentation, and Graphic Materials (with no copyright issues) ready for streaming',
  'Location and internet connectivity (provide internet connectivity and transportation budget for off-campus activities)',
  'LCD/LED Projection System & Sound System',
  'Description of the event to be streamed & Event Thumbnail',
  'May provide snack and/or meal',
];

const steps = [
  'Open ETC Services Google Form (bit.ly/ETCRequestS).',
  'Read La Salle University\'s Media Release Form, review authorization, and check boxes.',
  'Fill in Primary Information.',
  'In ETC Services, choose "Event Streaming".',
  'Choose the streaming setup you need (Event Streaming A–E).',
  'Fill in Event and Payment Details.',
  'Complete ETC Services Evaluation (bit.ly/ETCServicesEvalForm) after service rendered.',
  'Click Submit.',
];
</script>

<template>
  <section id="streaming" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Live Broadcast</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Event <span class="text-[#14532d]">Streaming</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
            Live streaming of educational events via ETC's social media platforms (LSU ZONE YouTube Channel or LSU EDMST FB Page).
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'packages' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'packages'"
          >
            Packages A–E &amp; Fees
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'steps'"
          >
            Request Steps (1–8)
          </button>
        </div>
      </div>

      <!-- Packages -->
      <div v-if="activeTab === 'packages'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="pkg in streamingPackages"
            :key="pkg.name"
            class="rounded-2xl border border-green-900/15 overflow-hidden bg-[#fafcfa] flex flex-col"
          >
            <div class="px-5 py-4 bg-[#14532d] text-white flex items-start justify-between gap-2">
              <div>
                <h3 class="text-sm sm:text-base font-extrabold">{{ pkg.name }}</h3>
                <p class="text-[11px] text-green-100 mt-0.5 leading-snug">{{ pkg.subtitle }}</p>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-white text-[#14532d] text-xs font-black shrink-0">{{ pkg.fee }}</span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <p class="text-[11px] font-extrabold uppercase tracking-wider text-[#14532d] mb-2">Inclusions</p>
              <ul class="space-y-1.5 text-xs text-slate-700 font-medium">
                <li v-for="(inc, i) in pkg.inclusions" :key="i" class="flex items-start gap-2">
                  <span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0 text-[10px] mt-0.5">✓</span>
                  <span>{{ inc }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-[#f5f7f4] border border-green-900/10">
          <p class="text-xs font-extrabold uppercase tracking-wider text-[#14532d] mb-2">Responsibility of the Requesting Party</p>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-700 list-disc pl-5">
            <li v-for="(r, i) in responsibilities" :key="i">{{ r }}</li>
          </ul>
        </div>
      </div>

      <!-- Steps -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="(s, idx) in steps"
          :key="idx"
          class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
        >
          <span class="px-2 py-1 rounded-lg bg-[#14532d] text-white text-[10px] font-black shrink-0">Step {{ idx + 1 }}</span>
          <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ s }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
