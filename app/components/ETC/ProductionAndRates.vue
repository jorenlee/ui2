<script setup>
import { ref } from 'vue';

const activeTab = ref('sound');

const soundPackages = [
  {
    name: 'Sound System Setup A',
    subtitle: '2-Speaker Sound System Setup',
    fee: '₱3,000.00',
    inclusions: ['1 Technical Crew', '2 Speaker Sound System Setup', '1 Microphone with Audio Interface', '3-hour Setup'],
    responsibility: ['Location (Provide transportation budget if outside LSU)', 'May provide meal budget for 2 pax', 'Other necessary things not in inclusions'],
  },
  {
    name: 'Sound System Setup B',
    subtitle: '4-Speaker Sound System Setup',
    fee: '₱5,000.00',
    inclusions: ['1 Technical Crew', '4 Speaker Sound System Setup', '2 Microphones with Audio Interface', '3-hour Setup'],
    responsibility: ['Location (Provide transportation budget if outside LSU)', 'May provide meal budget for 2 pax', 'Other necessary things not in inclusions'],
  },
];

const techRoles = [
  { role: 'Event Director', fee: '₱20,000.00' },
  { role: 'Technical Director', fee: '₱10,000.00' },
  { role: 'Stage Manager', fee: '₱10,000.00' },
  { role: 'Production Manager', fee: '₱8,000.00' },
  { role: 'Graphic Designer', fee: '₱10,000.00' },
  { role: 'Production Designer', fee: '₱10,000.00' },
  { role: 'Animator', fee: '₱8,000.00' },
  { role: 'Lighting Designer', fee: '₱8,000.00' },
  { role: 'Lighting Crew', fee: '₱3,000.00' },
  { role: 'Sound Designer', fee: '₱8,000.00' },
  { role: 'Sound Crew', fee: '₱3,000.00' },
  { role: 'Teleprompter Crew', fee: '₱3,000.00' },
  { role: 'Video/Slides Crew', fee: '₱3,000.00' },
  { role: 'Camera Crew', fee: '₱3,000.00' },
  { role: 'Photographer', fee: '₱5,000.00' },
  { role: 'Videographer', fee: '₱5,000.00' },
  { role: 'Live Stream Operator', fee: '₱5,000.00' },
];

const eventPackages = [
  {
    name: 'Event Management Package A',
    subtitle: 'Full-Scale Premium Production',
    fee: '₱100,000.00',
    inclusions: [
      'Pre-Production Team (₱80,000): Event Director, Production Manager, and Designers',
      'Multimedia Productions: BrandKit, Program Slides, Motion Graphics, AVPs, and Technical Script',
      'Event-Day Team (₱37,000): 1 Event Director, 2 Technical Crew, 2 Camera Crews, 1 Photographer',
      'Equipment (₱10,000): 2 computer units and 3 camera setup',
      'Multimedia Release: 3-hour streaming, live projection, and 50–100 edited photos',
      'Supplier Assistance: Support in finding vendors for various services',
    ],
    responsibility: [
      'Location (Please provide transportation budget if location is outside LSU)',
      'May provide meal budget for 2 pax',
      'Other necessary things not mentioned in the inclusions',
    ],
  },
  {
    name: 'Event Management Package B',
    subtitle: 'Enhanced Multimedia & Event Support',
    fee: '₱75,000.00',
    inclusions: [
      'Pre-Production Management Team (₱56,000): Event Director, Production Manager, Graphic Designer, Production Designer, Stage Manager; Deliverables: Promotional materials, AVPs, event design, background music, technical script',
      'Event-Day Production Team (₱37,000): Event/Technical Director/Stage Manager, 2 technical crew, 2 camera crews, 1 photographer',
      'Multimedia Equipment (₱7,500): 1 computer setup with streaming and 2 camera setups',
      'Multimedia Release: Up to 3 hours streaming, live projection, 50–100 edited photo highlights',
      'Supplier Assistance: Sound, lighting, staging, catering, and talent',
    ],
    responsibility: [
      'Initial Thoughts or Ideas & Brand Kit',
      'Pre-meeting venues and/or expenses',
      'Event-Day Management Team\'s Meal Budget Allowance',
      'Event Location & internet connectivity (internet + transportation budget)',
      'Suppliers\' Fees & other necessary things not in inclusions',
    ],
  },
  {
    name: 'Event Management Package C',
    subtitle: 'Standard Event Production',
    fee: '₱50,000.00',
    inclusions: [
      'Pre-Production Team (₱38,000): Event Director, Graphic Designer, Stage Manager',
      'Multimedia Productions: Promotional materials, AVPs, background music, technical script',
      'Event-Day Team (₱31,000): Event Director, Technical Crew, Camera Crew, Photographer',
      'Equipment (₱5,000): Computer and streaming setup, Camera',
      'Multimedia Release: Live projection, 50–100 edited photos on Facebook',
      'Supplier Assistance: Sound, stage, LED wall, production, catering, talents',
    ],
    responsibility: [
      'Initial Thoughts or Ideas & BrandKit',
      'Pre-meeting venues and/or expenses',
      'Event-Day Management Team\'s Meal Budget Allowance',
      'Event Location & internet connectivity (internet + transportation budget)',
      'Suppliers\' Fees & other necessary things not in inclusions',
    ],
  },
  {
    name: 'Event Management Package D',
    subtitle: 'Basic Event Coordination',
    fee: '₱30,000.00',
    inclusions: [
      'Pre-Production Team (₱28,000): Event Director, Graphic Designer, Multimedia (posters, social media designs)',
      'Event-Day Team (₱28,000): 1 Event/Technical Director, 1 Technical Crew, 1 Photographer',
      'Equipment (₱2,500): 1 Computer with streaming setup',
      'Media Release: 50–100 Edited Photos for ETC\'s Facebook (Data Privacy Consent)',
      'Supplier Assistance: Sounds, Lights, Stage, LED Wall, Set Makers, Florist, Catering, Talents',
    ],
    responsibility: [
      'Initial Thoughts or Ideas & BrandKit',
      'Pre-meeting venues and/or expenses',
      'Event-Day Management Team\'s Meal Budget Allowance',
      'Event Location & internet connectivity (internet + transportation budget)',
      'Suppliers\' Fees & other necessary things not in inclusions',
    ],
  },
];
</script>

<template>
  <section id="production-rates" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Events &amp; Production</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sound System, Technical Support &amp; <span class="text-[#14532d]">Event Packages</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
            Service rates, inclusions, and requesting party responsibilities for sound setups, technical crew, and event management.
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'sound' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'sound'"
          >
            Sound System Setup
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'tech' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'tech'"
          >
            Technical Management Support
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'events' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'events'"
          >
            Event Packages
          </button>
        </div>
      </div>

      <!-- Tab 1: Sound System Setup -->
      <div v-if="activeTab === 'sound'" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="pkg in soundPackages"
            :key="pkg.name"
            class="rounded-2xl border border-green-900/15 overflow-hidden bg-[#fafcfa] flex flex-col"
          >
            <div class="px-6 py-4 bg-[#14532d] text-white flex items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-extrabold">{{ pkg.name }}</h3>
                <p class="text-xs text-green-100">{{ pkg.subtitle }}</p>
              </div>
              <span class="px-3 py-1 rounded-lg bg-white text-[#14532d] text-sm font-black">{{ pkg.fee }}</span>
            </div>
            <div class="p-6 space-y-4 text-xs">
              <div>
                <p class="font-extrabold text-[#14532d] uppercase tracking-wider mb-2">Inclusions</p>
                <ul class="space-y-1.5 text-slate-700 font-semibold">
                  <li v-for="(inc, i) in pkg.inclusions" :key="i" class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0 text-[10px]">✓</span>
                    <span>{{ inc }}</span>
                  </li>
                </ul>
              </div>
              <div class="pt-3 border-t border-slate-200/70">
                <p class="font-extrabold text-[#14532d] uppercase tracking-wider mb-2">Responsibility of Requesting Party</p>
                <ul class="space-y-1 text-slate-600 list-disc pl-4">
                  <li v-for="(r, i) in pkg.responsibility" :key="i">{{ r }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs font-bold text-[#14532d] italic text-right">
          Note: Lighting Setup is currently unavailable.
        </p>
      </div>

      <!-- Tab 2: Technical Management Support -->
      <div v-else-if="activeTab === 'tech'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 overflow-x-auto rounded-2xl border border-green-900/15">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-[#14532d] text-white uppercase tracking-wider text-xs">
                <th class="py-3 px-4 font-bold">Specific Service / Role</th>
                <th class="py-3 px-4 font-bold text-right">Service Fee</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-green-900/10">
              <tr v-for="item in techRoles" :key="item.role" class="odd:bg-[#fafcfa] even:bg-[#f0f5f0]/60">
                <td class="py-2.5 px-4 font-bold text-slate-900">{{ item.role }}</td>
                <td class="py-2.5 px-4 font-mono font-bold text-[#14532d] text-right">{{ item.fee }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex flex-col justify-between">
          <div class="space-y-4">
            <h3 class="text-base font-extrabold text-[#14532d]">Team Overview</h3>
            <p class="text-xs text-slate-700 leading-relaxed">
              A multidisciplinary group supporting pre-event conceptualization, real-time technical operations, design, audiovisuals, staging, and post-event documentation.
            </p>
            <div>
              <p class="text-xs font-extrabold text-[#14532d] uppercase tracking-wider mb-2">Requesting Party Responsibility</p>
              <ul class="space-y-1.5 text-xs text-slate-700 font-semibold">
                <li class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center text-[10px]">✓</span> Event Day Assistance</li>
                <li class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center text-[10px]">✓</span> Transportation Budget</li>
                <li class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center text-[10px]">✓</span> Meal Allowance</li>
                <li class="flex items-center gap-2"><span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center text-[10px]">✓</span> Details finalized during pre-production meeting</li>
              </ul>
            </div>
          </div>
          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-6 w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold transition-colors"
          >
            Request Technical Support
          </a>
        </div>
      </div>

      <!-- Tab 3: Event Management Packages -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="pkg in eventPackages"
          :key="pkg.name"
          class="rounded-2xl border border-green-900/15 overflow-hidden bg-[#fafcfa] flex flex-col"
        >
          <div class="px-6 py-4 bg-[#14532d] text-white flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-extrabold">{{ pkg.name }}</h3>
              <p class="text-xs text-green-100">{{ pkg.subtitle }}</p>
            </div>
            <span class="px-3 py-1 rounded-lg bg-white text-[#14532d] text-sm font-black shrink-0">{{ pkg.fee }}</span>
          </div>
          <div class="p-6 space-y-4 text-xs flex-1 flex flex-col">
            <div>
              <p class="font-extrabold text-[#14532d] uppercase tracking-wider mb-2">Inclusions</p>
              <ul class="space-y-1.5 text-slate-700 font-medium">
                <li v-for="(inc, i) in pkg.inclusions" :key="i" class="flex items-start gap-2">
                  <span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0 text-[10px] mt-0.5">✓</span>
                  <span>{{ inc }}</span>
                </li>
              </ul>
            </div>
            <div class="pt-3 mt-auto border-t border-slate-200/70">
              <p class="font-extrabold text-[#14532d] uppercase tracking-wider mb-2">Responsibility of Requesting Party</p>
              <ul class="space-y-1 text-slate-600 list-disc pl-4">
                <li v-for="(r, i) in pkg.responsibility" :key="i">{{ r }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
