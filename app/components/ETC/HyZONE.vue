<script setup>
import { ref } from 'vue';

const activeTab = ref('overview');

const classrooms = ['SJ114', 'SJ212', 'SJ214', 'SJ312', 'SJ314'];

const inclusions = [
  '2 Smart TVs',
  '1 Conference Camera',
  '1 Microphone/s with Audio Interface',
  '1 Computer Unit',
  '1 Wireless Presentation Clicker',
];

const generalGuidelines = [
  { title: 'Reservation & Access', text: 'All use must be booked through the ETC HyZONE Classroom Setup Request Form (bit.ly/ETCRequestS). No one may operate the equipment without a confirmed reservation and ETC assistance.' },
  { title: 'User Responsibility', text: 'The faculty-in-charge is accountable for all devices during their scheduled use.' },
  { title: 'Operational Readiness', text: 'Conduct a quick system check (power, display, camera, mic) before class begins.' },
  { title: 'Technical Use', text: 'Operate only for instruction; do not unplug, move, or modify any setup or software.' },
  { title: 'Classroom Conduct', text: 'Maintain professionalism and secure consent before recording or streaming.' },
  { title: 'Maintenance & Reporting', text: 'Report any issue immediately to EdTech & Multimedia Concerns (bit.ly/ETCRequestS); avoid self-repair.' },
  { title: 'Training & Support', text: 'Only trained or assisted users may operate HyZONE equipment.' },
  { title: 'Sanctions for Misuse', text: 'Unauthorized use or damage may result in suspension or administrative action.' },
];

const techGuidelines = [
  {
    component: 'Computer Set',
    use: 'Used for presentations, Canvas access, and hybrid conferencing',
    dos: ['Log in using faculty credentials', 'Store files online', 'Log out after class'],
    donts: ['Do not install personal apps', 'Avoid saving files locally'],
  },
  {
    component: 'Smart TVs (2 units)',
    use: 'Dual display setup for slides and remote participants',
    dos: ['Use HDMI/wireless casting', 'Confirm display input before class'],
    donts: ['Do not manually recalibrate TV settings', 'Avoid touching and writing on the TV screens'],
  },
  {
    component: 'Smart Camera',
    use: 'Tracks the instructor within the teaching zone',
    dos: ['Stay within the marked area', 'Turn off camera\'s AI mode to stay in zoomed-out view'],
    donts: ['Do not cover or touch the lens', 'Avoid obstructing the camera'],
  },
  {
    component: 'Boom / Lapel Microphone',
    use: 'Captures instructor and class discussion',
    dos: ['Check mic input level', 'Keep noise level minimal'],
    donts: ['Do not tap the mic head', 'Avoid unplugging cords'],
  },
  {
    component: 'Wireless Presentation Clicker',
    use: 'Navigates slides and presentations remotely',
    dos: ['Test connection before starting', 'Point toward receiver', 'Replace battery if weak'],
    donts: ['Do not force buttons', 'Do not remove USB receiver', 'Avoid dropping the device'],
  },
];

const steps = [
  'Open ETC Services Google Form (bit.ly/ETCRequestS).',
  'Read La Salle University\'s Media Release Form, review authorization, and check boxes.',
  'Fill in Primary Information.',
  'In ETC Services, choose "HyZONE Classroom Setup".',
  'Identify the classroom details.',
  'Complete ETC Services Evaluation (bit.ly/ETCServicesEvalForm) after service rendered.',
  'Click Submit.',
];
</script>

<template>
  <section id="hyzone" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Blended Learning</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            HyZONE <span class="text-[#14532d]">Classroom Setup</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
            Flexible classroom setups for online classes, conferences, and hybrid meetings across designated SJ rooms.
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'overview' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'overview'"
          >
            Rooms &amp; Inclusions
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'guidelines' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'guidelines'"
          >
            Guidelines &amp; Do's/Don'ts
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'steps'"
          >
            Request Steps (1–7)
          </button>
        </div>
      </div>

      <!-- Tab 1: Rooms & Inclusions -->
      <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-[#14532d] text-white">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-extrabold">HyZONE Classrooms</h3>
            <span class="px-2.5 py-0.5 rounded-full bg-white text-[#14532d] text-[11px] font-black">FREE</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="room in classrooms"
              :key="room"
              class="px-3 py-1.5 rounded-lg bg-[#1b6b3a] border border-white/20 text-xs font-bold"
            >
              {{ room }}
            </span>
          </div>
          <p class="text-xs text-green-100 mt-5 leading-relaxed">
            Service Fee: <strong>Free</strong> for authorized Lasallian Partners and students.
          </p>
        </div>

        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10">
          <h3 class="text-sm sm:text-base font-extrabold text-[#14532d] mb-3">Inclusions</h3>
          <ul class="space-y-2 text-xs text-slate-700 font-semibold">
            <li v-for="(inc, i) in inclusions" :key="i" class="flex items-center gap-2">
              <span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0 text-[10px]">✓</span>
              <span>{{ inc }}</span>
            </li>
          </ul>
        </div>

        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex flex-col justify-between">
          <div>
            <h3 class="text-sm sm:text-base font-extrabold text-[#14532d] mb-3">Requesting Party Responsibility</h3>
            <ul class="space-y-2 text-xs text-slate-700 font-medium list-disc pl-4">
              <li>Classroom Discussion Materials</li>
              <li>Consult the Registrar regarding room availability or request a transfer of class occupants if a scheduling conflict arises.</li>
            </ul>
          </div>
          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-5 w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold transition-colors"
          >
            Book HyZONE Room
          </a>
        </div>
      </div>

      <!-- Tab 2: General & Technical Guidelines -->
      <div v-else-if="activeTab === 'guidelines'" class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="(g, i) in generalGuidelines"
            :key="i"
            class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 text-xs leading-relaxed"
          >
            <p class="font-extrabold text-[#14532d] mb-1">{{ g.title }}</p>
            <p class="text-slate-700">{{ g.text }}</p>
          </div>
        </div>

        <div class="overflow-x-auto rounded-2xl border border-green-900/15">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#14532d] text-white uppercase tracking-wider">
                <th class="py-3 px-4 font-bold">Component</th>
                <th class="py-3 px-4 font-bold">Proper Use</th>
                <th class="py-3 px-4 font-bold">Do's</th>
                <th class="py-3 px-4 font-bold">Don'ts</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-green-900/10">
              <tr v-for="(row, idx) in techGuidelines" :key="idx" class="odd:bg-[#fafcfa] even:bg-[#f0f5f0]/60 align-top">
                <td class="py-3 px-4 font-extrabold text-[#14532d] whitespace-nowrap">{{ row.component }}</td>
                <td class="py-3 px-4 text-slate-700">{{ row.use }}</td>
                <td class="py-3 px-4 text-slate-700">
                  <ul class="list-disc pl-4 space-y-0.5">
                    <li v-for="(d, i) in row.dos" :key="i">{{ d }}</li>
                  </ul>
                </td>
                <td class="py-3 px-4 text-slate-700">
                  <ul class="list-disc pl-4 space-y-0.5">
                    <li v-for="(dn, i) in row.donts" :key="i">{{ dn }}</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Steps -->
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
