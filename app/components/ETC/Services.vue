<script setup>
const mainServices = [
  {
    id: 'studio-appointment',
    number: '01',
    title: 'Studio Appointment',
    badge: 'Booking & Production',
    description:
      'Reserve the ETC recording studio for lecture captures, podcasts, interviews, green-screen shoots, and multimedia production.',
    highlights: [
      'Audio & Video Recording',
      'Green Screen & Lighting Setup',
      'Guided Studio Session',
    ],
    iconPath:
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    cta: 'Book Studio',
    link: 'https://bit.ly/ETCRequestS',
  },
  {
    id: 'devices-borrowing',
    number: '02',
    title: 'Devices Borrowing',
    badge: 'Equipment Management',
    description:
      'Borrow plug-and-play and multimedia equipment including cameras, microphones, tripods, projectors, and presentation accessories.',
    highlights: [
      'Cameras, Mics & Tripods',
      'Projectors, TVs & Audio Gear',
      'Tracked Check-Out & Return',
    ],
    iconPath:
      'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    cta: 'Borrow Equipment',
    link: 'https://bit.ly/ETCRequestS',
  },
  {
    id: 'personnel',
    number: '03',
    title: 'Personnel',
    badge: 'Creative & Tech Support',
    description:
      'Request assistance from ETC personnel for graphic design, layouting, video editing, event coverage, and technical support.',
    highlights: [
      'Graphic Design & Layouting',
      'Video Editing & Multimedia',
      'Technical & Event Assistance',
    ],
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    cta: 'Request Support',
    link: 'https://bit.ly/ETCRequestS',
  },
];

const allEtcServices = [
  { num: '01', name: 'Borrowing of Plug-and-Play Multimedia Equipment', group: 'ETMPS', desc: 'Borrow plug-and-play multimedia equipment for educational purposes with managed reservations and return procedures.' },
  { num: '02', name: 'EdTech & Multimedia Concerns', group: 'ETMPS', desc: 'Troubleshooting assistance and solutions for software applications, hardware devices, or multimedia content issues.' },
  { num: '03', name: 'HyZONE Classroom Setup', group: 'ETMPS', desc: 'Configuration of blended learning environments and flexible classroom setups for online classes, conferences, and meetings.' },
  { num: '04', name: 'Multimedia Equipment Custodianship', group: 'ETMPS', desc: 'Extended-period borrowing (such as a week or a month) for authorized academic and office operations.' },
  { num: '05', name: 'Sound System Setup', group: 'ETMPS', desc: 'Audio and sound system setup for large audiences, programs, and campus events.' },
  { num: '06', name: 'Technical Management Support', group: 'ETMPS', desc: 'Focused assistance from an ETC staff member for a specific technical task during an event.' },
  { num: '07', name: 'Event Management Packages', group: 'ETMPS', desc: 'Coordinated logistical and technical support packages tailored for institutional events.' },
  { num: '08', name: 'Event Streaming', group: 'Production', desc: 'Live broadcast support on social media and online streaming platforms.' },
  { num: '09', name: 'Multimedia Equipment Rental', group: 'Equipment', desc: 'Borrowing of complex multimedia gear such as DSLR cameras, lighting kits, or audio recording equipment.' },
  { num: '10', name: 'Studio Rental', group: 'Production', desc: 'Controlled studio environment for video shoots, livestreams, and audio recordings.' },
  { num: '11', name: 'Multimedia Production', group: 'Production', desc: 'Creation of videos, graphic designs, layouts, and other digital content.' },
  { num: '12', name: 'Educational Technology and Multimedia Training', group: 'ETMPS', desc: 'Training on blended learning strategies, Google Workspace, LMS platforms, video editing, animation, and event production.' },
];
</script>

<template>
  <section id="e-services" class="relative z-20 -mt-10 pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-3xl border border-green-900/10 shadow-lg p-6 sm:p-10">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div class="inline-flex items-center gap-2.5 mb-2">
              <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
              <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">ETC Portal</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Main <span class="text-[#14532d]">E-Services</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl">
              Access studio reservations, equipment borrowing, and creative/technical personnel support in one place.
            </p>
          </div>
          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#14532d] hover:bg-[#166534] text-white text-xs font-bold shrink-0 self-start md:self-auto transition-colors"
          >
            <span>Open ETC Request Form</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <!-- 3 Main E-Services Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div
            v-for="service in mainServices"
            :key="service.id"
            class="group bg-[#fafcfa] hover:bg-white rounded-2xl border border-slate-200 hover:border-green-600/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
          >
            <div class="h-1.5 w-full bg-[#14532d]"></div>
            <div class="p-6 flex-1 flex flex-col">
              <div class="flex items-start justify-between gap-3 mb-5">
                <div class="w-12 h-12 rounded-2xl bg-[#14532d] text-white flex items-center justify-center shadow-sm">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="service.iconPath" />
                  </svg>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-[11px] font-black text-slate-300 tracking-widest">{{ service.number }}</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#f0f5f0] text-[#14532d] border-green-200">
                    {{ service.badge }}
                  </span>
                </div>
              </div>

              <h3 class="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 group-hover:text-[#14532d] transition-colors">
                {{ service.title }}
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
                {{ service.description }}
              </p>

              <ul class="space-y-2.5 mb-6 mt-auto pt-4 border-t border-slate-200/70">
                <li
                  v-for="(item, idx) in service.highlights"
                  :key="idx"
                  class="flex items-center gap-2.5 text-xs font-semibold text-slate-700"
                >
                  <span class="w-4 h-4 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0">
                    <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{{ item }}</span>
                </li>
              </ul>

              <a
                :href="service.link"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#14532d] hover:bg-[#166534] shadow-xs transition-colors duration-200"
              >
                <span>{{ service.cta }}</span>
                <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <!-- Table of Contents / All 12 ETC Services (ETMPS & Production) -->
        <div class="pt-8 border-t border-slate-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 class="text-base sm:text-lg font-extrabold text-slate-900">
                Complete Directory of ETC Services <span class="text-[#14532d]">(12 Services)</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Includes EdTech, Multimedia, &amp; Production Management Support Request (ETMPS) and Studio/Rental Services.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div
              v-for="item in allEtcServices"
              :key="item.num"
              class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 hover:border-green-700/30 transition-colors flex flex-col gap-1.5"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-md bg-[#14532d] text-white text-[10px] font-black">{{ item.num }}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#14532d]">{{ item.group }}</span>
              </div>
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug mt-1">{{ item.name }}</h4>
              <p class="text-xs text-slate-600 leading-relaxed">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
