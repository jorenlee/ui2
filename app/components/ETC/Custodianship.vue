<script setup>
import { ref } from 'vue';

const activeTab = ref('overview');

const custodianItems = [
  { equipment: 'Flat Screen TV', details: 'Old classroom TVs' },
  { equipment: 'TV (with stand)', details: 'CY# - Devant 55", Smart 4K (₱20,590.00)' },
  { equipment: 'TV (without stand)', details: 'CY# - Devant 55", Smart 4K (₱17,590.00)' },
  { equipment: 'TV Remote (Devant Phase 1)', details: 'CY# - Devant TV Remote P1 (₱2,500.00)' },
  { equipment: 'TV Remote (Devant Phase 2)', details: 'CY# - Devant TV Remote P1 (₱2,500.00)' },
  { equipment: 'Others', details: 'Specify other assigned multimedia items' },
];

const steps = [
  'Open ETC Services Google Form (bit.ly/ETCRequestS).',
  'Read La Salle University\'s Media Release Form, review authorization, and check boxes.',
  'Fill in Primary Information.',
  'In ETC Services, choose "Multimedia Equipment Custodianship".',
  'Read the Multimedia Equipment Custodianship Policy and check the agreement box.',
  'List all multimedia equipment (separated by commas) under your custody with quantity (e.g., 2 Smart TVs, 3 HDMIs, 2 TV Remotes).',
  'Indicate your specific duration of custodianship (e.g., June 17–July 30, 2025).',
  'Indicate your specific room assignment (e.g., SJ215 - ETC Studio; put NA if not permanently assigned).',
  'Complete ETC Services Evaluation (bit.ly/ETCServicesEvalForm) after service rendered.',
  'Click Submit.',
];
</script>

<template>
  <section id="custodianship" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Long-Term Assignment</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multimedia Equipment <span class="text-[#14532d]">Custodianship</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
            At the beginning of each academic year, ETC designates EdTech and multimedia equipment to classrooms, faculty members, or advisers as responsible custodians.
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'overview' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'overview'"
          >
            Policy &amp; Equipment
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'steps'"
          >
            Request Steps (1–10)
          </button>
        </div>
      </div>

      <!-- Tab 1: Policy & Equipment -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 class="text-base font-extrabold text-[#14532d]">Custodianship Policy Highlights</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li><strong>Custodian Responsibilities:</strong> Handle equipment carefully, use solely for educational purposes, and report any damage, malfunction, loss, or theft immediately to ETC.</li>
            <li><strong>Training:</strong> Custodians must attend orientation and equipment handling training at the beginning of each academic year.</li>
            <li><strong>Damaged or Lost Equipment:</strong> Custodians must cooperate with ETC's investigation and bear responsibility for repair/replacement costs up to fair market value.</li>
            <li><strong>Indemnification &amp; Termination:</strong> Custodians indemnify the school from claims; ETC may recall or terminate custodianship with reasonable notice or upon end of employment.</li>
          </ul>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-green-900/15 self-start">
          <table class="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr class="bg-[#14532d] text-white uppercase tracking-wider text-xs">
                <th class="py-3 px-4 font-bold">Equipment</th>
                <th class="py-3 px-4 font-bold">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-green-900/10">
              <tr v-for="(item, idx) in custodianItems" :key="idx" class="odd:bg-[#fafcfa] even:bg-[#f0f5f0]/60">
                <td class="py-3 px-4 font-bold text-slate-900">{{ item.equipment }}</td>
                <td class="py-3 px-4 text-slate-700">{{ item.details }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: Steps -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          v-for="(s, idx) in steps"
          :key="idx"
          class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex flex-col gap-2"
        >
          <span class="px-2 py-0.5 rounded-md bg-[#14532d] text-white text-[10px] font-black self-start">Step {{ idx + 1 }}</span>
          <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ s }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
