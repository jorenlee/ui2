<script setup>
import { ref } from 'vue';

const activeTab = ref('services');

const trainingServices = [
  { name: 'Blended Learning Pedagogy and Strategies', fee: '₱30,000.00', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { name: 'Google Workspace', fee: '₱30,000.00', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z' },
  { name: 'Learning Management System (Canvas, Google Classroom, and Edmodo)', fee: '₱30,000.00', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { name: 'Educational Technology Tools', fee: '₱30,000.00', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { name: 'Photography and Photo Editing', fee: '₱30,000.00', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
  { name: 'Graphic Designing', fee: '₱30,000.00', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Videography and Video Editing', fee: '₱30,000.00', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { name: 'Sound Designing and Music Production', fee: '₱30,000.00', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
  { name: 'Animation', fee: '₱30,000.00', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
  { name: 'Event Streaming', fee: '₱30,000.00', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { name: 'Film Production', fee: '₱30,000.00', icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z' },
  { name: 'Event Production (Technical, Sounds, Lights)', fee: '₱30,000.00', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z' }
];

const steps = [
  'Open ETC Services Google Form (https://bit.ly/ETCRequestS).',
  'After reading La Salle University\'s Media Release Form category, review the authorization section and check the boxes that apply (The process will conclude if you select the "I DISAGREE..." option).',
  'Fill in Primary Information.',
  'In the ETC Services portion, choose "Educational Technology and Multimedia Training".',
  'Fill in Training Information (select desired module and audience specifications).',
  'Fill in Pre-training Meeting and Payment Details.',
  'Complete ETC SERVICES EVALUATION (bit.ly/ETCServicesEvalForm) after the service rendered.',
  'Click Submit.'
];
</script>

<template>
  <section id="edtech-training" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Institutional Capacity Building</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Educational Technology &amp; <span class="text-[#14532d]">Multimedia Training</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Tailored, hands-on training sessions to help faculty, staff, and students effectively integrate technology into teaching and learning, enhancing engagement and outcomes.
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'services' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab === 'services'"
          >
            Training Programs
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab === 'steps'"
          >
            Request Steps (1–8)
          </button>
        </div>
      </div>

      <!-- Tab 1: Training Programs (12 modules) -->
      <div v-if="activeTab === 'services'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            v-for="(svc, idx) in trainingServices"
            :key="idx"
            class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 hover:border-[#14532d] transition-colors flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-xl bg-[#14532d] text-white flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="svc.icon" />
                </svg>
              </div>
              <div class="text-xs font-extrabold text-slate-900 leading-snug truncate">
                {{ svc.name }}
              </div>
            </div>
            <div class="text-sm font-black text-[#14532d] shrink-0 bg-white px-3 py-1 rounded-lg border border-green-900/15">
              {{ svc.fee }}
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-[#fafcfa] border border-green-900/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-600">
            <span class="font-bold text-slate-900">Practical &amp; Hands-On:</span> These sessions complement in-service training and equip participants with skills in blended learning, LMS, digital creation, and AV event setups.
          </div>
          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="px-5 py-2.5 rounded-full bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold tracking-wide transition-colors shrink-0"
          >
            Request Training Workshop
          </a>
        </div>
      </div>

      <!-- Tab 2: Request Steps -->
      <div v-else-if="activeTab === 'steps'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div
            v-for="(st, idx) in steps"
            :key="idx"
            class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
          >
            <span class="w-6 h-6 rounded-lg bg-[#14532d] text-white text-[11px] font-black flex items-center justify-center shrink-0">
              {{ idx + 1 }}
            </span>
            <p class="text-xs text-slate-700 leading-relaxed font-medium">
              {{ st }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
