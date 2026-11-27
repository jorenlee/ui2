<script setup>
import { ref } from 'vue';

const activeTab = ref('packages');

// Studio Rental Packages A to E
const studioPackages = [
  {
    code: 'Package A',
    title: 'Studio Only',
    desc: 'Basic studio space with essential utilities, house lighting, power outlets, and soundproofing for customizable setups.',
    rates: [
      { duration: '1 HR', fee: '₱250.00' },
      { duration: '3 HR (9:00 AM – 12:00 PM)', fee: '₱500.00' },
      { duration: '3 HR (1:30 PM – 4:30 PM)', fee: '₱500.00' },
      { duration: '8 HR (8:30 AM – 4:30 PM)', fee: '₱1,000.00' },
      { duration: '1 DAY (9:00 AM – 8:00 PM)', fee: '₱1,500.00' }
    ],
    inclusions: ['1-day / hourly Studio Use', 'No ETC Personnel included'],
    requesterResp: [
      'Studio Reservation and Cancellation',
      'Careful Handling',
      'Sets and Props (provided clearance was given by ETC)'
    ]
  },
  {
    code: 'Package B',
    title: 'Studio with Audio Recording Equipment',
    desc: 'Equipped with professional microphones, mixers, and audio interfaces ideal for podcasts, voiceovers, and audio interviews.',
    rates: [
      { duration: '1 HR', fee: '₱500.00' },
      { duration: '3 HR (9:00 AM – 12:00 PM)', fee: '₱1,000.00' },
      { duration: '3 HR (1:30 PM – 4:30 PM)', fee: '₱1,000.00' },
      { duration: '8 HR', fee: '₱1,500.00' },
      { duration: '1 DAY', fee: '₱2,000.00' }
    ],
    inclusions: ['Studio Use', 'Audio Recording Setup', 'No ETC Personnel included'],
    requesterResp: [
      'Studio Reservation and Cancellation',
      'Careful Handling',
      'Sets and Props (with ETC clearance)',
      'Instruments, audio jacks, and other accessories (with ETC clearance)'
    ]
  },
  {
    code: 'Package C',
    title: 'Studio with Video Recording Equipment',
    desc: 'Features high-quality video cameras, tripods, stabilizers, and lighting setup for video lectures, creative projects, and talks.',
    rates: [
      { duration: '1 HR', fee: '₱1,500.00' },
      { duration: '3 HR (9:00 AM – 12:00 PM)', fee: '₱3,000.00' },
      { duration: '3 HR (1:30 PM – 4:30 PM)', fee: '₱3,000.00' },
      { duration: '8 HR', fee: '₱4,500.00' },
      { duration: '1 DAY', fee: '₱6,000.00' }
    ],
    inclusions: ['Studio Use', 'Video Recording Setup', 'No ETC Personnel included'],
    requesterResp: [
      'Studio Reservation and Cancellation',
      'Careful Handling',
      'Sets and Props (with ETC clearance)',
      'Other equipment (with ETC clearance)'
    ]
  },
  {
    code: 'Package D',
    title: 'Studio with Photoshoot Equipment',
    desc: 'Equipped with professional lighting kits, backdrops, and camera accessories for photo shoots, product photography, and portrait sessions.',
    rates: [
      { duration: '1 HR', fee: '₱1,200.00' },
      { duration: '3 HR (9:00 AM – 12:00 PM)', fee: '₱2,500.00' },
      { duration: '3 HR (1:30 PM – 4:30 PM)', fee: '₱2,500.00' },
      { duration: '8 HR', fee: '₱4,000.00' },
      { duration: '1 DAY', fee: '₱5,000.00' }
    ],
    inclusions: ['Studio Use', 'Photoshoot Setup', 'No ETC Personnel included'],
    requesterResp: [
      'Studio Reservation and Cancellation',
      'Careful Handling',
      'Sets and Props (with ETC clearance)',
      'Other equipment (with ETC clearance)'
    ]
  },
  {
    code: 'Package E',
    title: 'Studio with Live Streaming Equipment',
    desc: 'Complete streaming setup with multi-cam switchers, cameras, and software routing for webinars, virtual convocations, and live events.',
    rates: [
      { duration: '1 HR', fee: '₱1,000.00' },
      { duration: '3 HR (9:00 AM – 12:00 PM)', fee: '₱2,000.00' },
      { duration: '3 HR (1:30 PM – 4:30 PM)', fee: '₱2,000.00' },
      { duration: '8 HR', fee: '₱3,000.00' },
      { duration: '1 DAY', fee: '₱4,500.00' }
    ],
    inclusions: ['Studio Use', 'Live-Streaming Setup', 'No ETC Personnel included'],
    requesterResp: [
      'Studio Reservation and Cancellation',
      'Careful Handling',
      'Sets and Props (with ETC clearance)',
      'Other equipment (with ETC clearance)'
    ]
  }
];

// 10 General Guidelines
const generalGuidelines = [
  { num: '1', title: 'Reservation Confirmation', text: 'Ensure you have a confirmed reservation before using the studio.' },
  { num: '2', title: 'Equipment Handling', text: 'Handle all equipment carefully and adhere to the provided guidelines.' },
  { num: '3', title: 'Cleanliness', text: 'Maintain cleanliness. Dispose of trash properly. Avoid glittery items that cause stains or damage.' },
  { num: '4', title: 'Respect for Time', text: 'Adhere to your reserved time slot. Early setup and timely return of keys and equipment are required.' },
  { num: '5', title: 'Food and Drinks', text: 'Strictly NO food or drinks allowed inside the studio to prevent damage to equipment.' },
  { num: '6', title: 'Report Issues', text: 'Immediately report any equipment malfunction or damage to the ETC.' },
  { num: '7', title: 'Dangerous Items', text: 'Do not bring flammable, sharp, or hazardous items that may cause damage or safety risks.' },
  { num: '8', title: 'Personal Belongings', text: 'ETC is not responsible for personal belongings left in the studio. Ensure you take all personal items.' },
  { num: '9', title: 'No Unauthorized Use', text: 'Do not allow unauthorized individuals to use the studio or its equipment.' },
  { num: '10', title: 'Noise Control', text: 'Maintain a quiet environment within and around the studio. Avoid noise disrupting nearby classes or recordings.' }
];

// Fee schedule tables
const cancellationFees = [
  { days: '≥ 3 Days before', fee: 'Free (Full Refund)' },
  { days: '2 Days before', fee: '5% of Total Rental Fee' },
  { days: '1 Day before', fee: '10% of Total Rental Fee' },
  { days: '0 Days (Same Day)', fee: '50% of Total Rental Fee' }
];

const lateFees = [
  { late: 'Within 30-minute allowance', fee: 'Free' },
  { late: 'Between 31–60 minutes late', fee: '50% of Rental Fee' },
  { late: 'More than 60 minutes late', fee: 'Charged accordingly using hourly rates' }
];

const damageSanctions = [
  { incident: 'Repairable Studio Damage', fee: '50% of Total Rental Fee', repair: 'Total Repair Fee' },
  { incident: 'Repairable Equipment Damage', fee: '30% of Equipment Original Price', repair: 'Total Repair Fee' },
  { incident: 'Irreparable Damage', fee: '50% of Equipment Original Price', repair: 'Replacement of Equipment' },
  { incident: 'Loss', fee: '50% of Equipment Original Price', repair: 'Replacement of Equipment' }
];

// Step-by-Step
const steps = [
  'Open ETC Services Google Form (https://bit.ly/ETCRequestS).',
  'Read La Salle University\'s Media Release Form category, review authorization section and check the boxes that apply (Process concludes if you select "I DISAGREE").',
  'Fill in Primary Information.',
  'In the ETC Services portion, choose "Studio Rental".',
  'After reading the Studio Rental Policy, check the tick box.',
  'Choose the Studio Rental option you want to rent (Package A, B, C, D, or E).',
  'Fill in Event, Studio Rental, and Payment Details.',
  'Complete ETC SERVICES EVALUATION (bit.ly/ETCServicesEvalForm) after the service rendered.',
  'Click Submit.'
];
</script>

<template>
  <section id="studio-rental" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Controlled Media Space</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Studio <span class="text-[#14532d]">Rental</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Professional studio facilities offering Lasallian Partners, bona fide students, and external clients access to acoustic and visual media setups (Room LS 208).
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'packages' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'packages'"
          >
            Packages A–E
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'policy' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'policy'"
          >
            Guidelines &amp; Policies
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'steps'"
          >
            Booking Steps (1–9)
          </button>
        </div>
      </div>

      <!-- Tab 1: Studio Packages A to E -->
      <div v-if="activeTab === 'packages'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="pkg in studioPackages"
            :key="pkg.code"
            class="flex flex-col bg-[#f5f7f4] rounded-2xl border border-green-900/15 p-5 hover:border-[#14532d] transition-colors"
          >
            <div class="flex items-center justify-between pb-3 border-b border-green-900/10">
              <span class="text-[11px] font-black uppercase tracking-wider text-[#14532d] bg-white px-2.5 py-1 rounded-full border border-green-900/15">
                {{ pkg.code }}
              </span>
              <span class="text-xs font-semibold text-slate-500">No ETC Personnel</span>
            </div>

            <h3 class="text-base font-extrabold text-slate-900 mt-3 leading-snug">
              {{ pkg.title }}
            </h3>
            <p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
              {{ pkg.desc }}
            </p>

            <!-- Rates Matrix -->
            <div class="mt-4 rounded-xl bg-white border border-green-900/10 p-3 space-y-1.5">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Rental Rates</div>
              <div
                v-for="(r, idx) in pkg.rates"
                :key="idx"
                class="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
              >
                <span class="text-slate-700 font-medium">{{ r.duration }}</span>
                <span class="font-extrabold text-[#14532d]">{{ r.fee }}</span>
              </div>
            </div>

            <!-- Inclusions -->
            <div class="mt-4 space-y-1">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Inclusions</div>
              <ul class="text-xs text-slate-700 space-y-1">
                <li v-for="(inc, idx) in pkg.inclusions" :key="idx" class="flex items-start gap-1.5">
                  <svg class="w-3.5 h-3.5 text-[#14532d] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ inc }}</span>
                </li>
              </ul>
            </div>

            <!-- Responsibilities -->
            <div class="mt-4 pt-3 border-t border-green-900/10 mt-auto">
              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Requester Responsibilities</div>
              <ul class="text-[11px] text-slate-600 space-y-1">
                <li v-for="(resp, idx) in pkg.requesterResp" :key="idx" class="flex items-start gap-1.5">
                  <span class="text-[#14532d] font-bold">•</span>
                  <span>{{ resp }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-[#fafcfa] border border-green-900/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-600">
            <span class="font-bold text-slate-900">Training Prerequisite:</span> Before renting, clients must complete the ETC modular orientation covering safe studio handling and operation.
          </div>
          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="px-5 py-2.5 rounded-full bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold tracking-wide transition-colors shrink-0"
          >
            Open ETC Studio Request
          </a>
        </div>
      </div>

      <!-- Tab 2: Policy & Guidelines -->
      <div v-else-if="activeTab === 'policy'" class="space-y-6">
        <!-- 10 General Guidelines -->
        <div class="rounded-2xl border border-green-900/15 bg-[#fafcfa] p-5 sm:p-6">
          <h3 class="text-sm font-extrabold uppercase tracking-wider text-[#14532d] mb-4">
            10 General Guidelines for Proper Studio Use
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div
              v-for="g in generalGuidelines"
              :key="g.num"
              class="p-3.5 rounded-xl bg-white border border-green-900/10 flex items-start gap-3"
            >
              <span class="w-6 h-6 rounded-lg bg-[#14532d] text-white text-xs font-black flex items-center justify-center shrink-0">
                {{ g.num }}
              </span>
              <div>
                <div class="text-xs font-bold text-slate-900">{{ g.title }}</div>
                <div class="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{{ g.text }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cancellation & Late Returns Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Cancellation Table -->
          <div class="p-5 rounded-2xl bg-white border border-green-900/15">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#14532d] mb-1">
              Cancellation Inconvenience Fees
            </h4>
            <p class="text-[11px] text-slate-500 mb-3">
              Must cancel at least 3 days before slot by email/chat. Confirmed refund processed at ETC (LS 214).
            </p>
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-[#14532d] text-white font-bold text-left">
                  <th class="py-2 px-3 rounded-l-lg">Advance Notice</th>
                  <th class="py-2 px-3 text-right rounded-r-lg">Inconvenience Fee</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(cf, idx) in cancellationFees" :key="idx" class="even:bg-[#f5f7f4]">
                  <td class="py-2 px-3 font-semibold text-slate-800">{{ cf.days }}</td>
                  <td class="py-2 px-3 text-right font-bold text-[#14532d]">{{ cf.fee }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Late Return Table -->
          <div class="p-5 rounded-2xl bg-white border border-green-900/15">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#14532d] mb-1">
              Late Return Inconvenience Fees
            </h4>
            <p class="text-[11px] text-slate-500 mb-3">
              Keys and equipment must be returned promptly within 30 minutes after conclusion.
            </p>
            <table class="w-full text-xs">
              <thead>
                <tr class="bg-[#14532d] text-white font-bold text-left">
                  <th class="py-2 px-3 rounded-l-lg">Minutes Late</th>
                  <th class="py-2 px-3 text-right rounded-r-lg">Fee</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="(lf, idx) in lateFees" :key="idx" class="even:bg-[#f5f7f4]">
                  <td class="py-2 px-3 font-semibold text-slate-800">{{ lf.late }}</td>
                  <td class="py-2 px-3 text-right font-bold text-[#14532d]">{{ lf.fee }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Damage & Loss Sanctions Table -->
        <div class="p-5 rounded-2xl bg-white border border-green-900/15 overflow-x-auto">
          <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#14532d] mb-1">
            Damage, Loss &amp; Replacement Fees
          </h4>
          <p class="text-[11px] text-slate-500 mb-3">
            External clients deposit a refundable 50% security bond. Clients are liable for any damage or loss incurred during rental.
          </p>
          <table class="w-full text-xs border-collapse">
            <thead>
              <tr class="bg-[#14532d] text-white font-bold text-left">
                <th class="py-2.5 px-3 rounded-l-lg">Incident</th>
                <th class="py-2.5 px-3">Inconvenience Fee</th>
                <th class="py-2.5 px-3 text-right rounded-r-lg">Repair or Replacement</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(ds, idx) in damageSanctions" :key="idx" class="even:bg-[#f5f7f4]">
                <td class="py-2.5 px-3 font-bold text-slate-900">{{ ds.incident }}</td>
                <td class="py-2.5 px-3 font-semibold text-slate-700">{{ ds.fee }}</td>
                <td class="py-2.5 px-3 text-right font-bold text-[#14532d]">{{ ds.repair }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Step-by-Step Request -->
      <div v-else-if="activeTab === 'steps'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
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
