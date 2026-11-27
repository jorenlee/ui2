<script setup>
// The 6 Official Core ETC Services from the manual
const coreServices = [
  {
    id: 'training',
    number: '01',
    title: 'Educational Technology and Multimedia Training',
    tagline: 'Institutional & Academic Training',
    description:
      'Cutting-edge courses designed to train teachers, students, and other potential clients with their educational technology and multimedia needs.',
    targetId: '#edtech-training',
    requestLink: 'https://bit.ly/ETCRequestS',
    iconPath:
      'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    highlights: ['Blended Learning Pedagogy', 'Google Workspace & LMS', 'Media Production Workshops']
  },
  {
    id: 'support',
    number: '02',
    title: 'EdTech, Multimedia, & Event Management Support',
    tagline: 'Logistical & Technical Crew',
    description:
      'Provision of comprehensive support to individuals and organizations seeking to harness the power of technology, multimedia, and event management. Solutions are tailored to specific needs.',
    targetId: '#production-rates',
    requestLink: 'https://bit.ly/ETCRequestS',
    iconPath:
      'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    highlights: ['Sound System Setups A & B', '17 Technical Crew Roles', 'Event Management Packages A–D']
  },
  {
    id: 'production',
    number: '03',
    title: 'Multimedia Production',
    tagline: 'Creative & Digital Content',
    description:
      'A dynamic platform for individuals with a passion for multimedia to bring their ideas to life.',
    targetId: '#multimedia-production',
    requestLink: 'https://bit.ly/ETCRequestS',
    iconPath:
      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    highlights: ['Slide Decks & Brand Kits', 'Graphic & Motion Design', 'Video, Voiceover & Music']
  },
  {
    id: 'studio',
    number: '04',
    title: 'Studio Rental',
    tagline: 'Controlled Acoustic Space',
    description:
      'A fully equipped studio space available for rent, tailored to meet an individual\'s creative and professional needs with its flexible rental options.',
    targetId: '#studio-rental',
    requestLink: 'https://bit.ly/ETCRequestS',
    iconPath:
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    highlights: ['Packages A–E (Studio to Multi-Cam)', 'Green Screen & 4K Recording', 'Podcast & Live Desk at Room LS 208']
  },
  {
    id: 'streaming',
    number: '05',
    title: 'Event Streaming',
    tagline: 'Live Broadcast & Hybrid',
    description:
      'Seamless streaming, crystal-clear audio, and interactive features, bringing an event to life for both in-person and online participants.',
    targetId: '#streaming',
    requestLink: 'https://bit.ly/ETCRequestS',
    iconPath:
      'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    highlights: ['Packages A through E (₱3k–₱10k)', 'Multi-Platform Social Broadcast', 'Live Audio Feeds & Overlays']
  },
  {
    id: 'rental',
    number: '06',
    title: 'Multimedia Equipment Rental',
    tagline: 'Certified Hardware Access',
    description:
      'A wide range of professional multimedia equipment available for rent, allowing an individual to access top-notch tools without the commitment of ownership.',
    targetId: '#equipment-rental',
    requestLink: 'https://bit.ly/ETCRequestS',
    iconPath:
      'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    highlights: ['DSLR & Mirrorless Cameras', 'SM7B Mics & Wireless Lapels', 'Nanlite, Godox & ATEM Switchers']
  }
];

// Complete 12-Service Table of Contents for ETMPS & Operations
const allEtcServices = [
  { num: '01', name: 'Borrowing of Plug-and-Play Multimedia Equipment', group: 'ETMPS', target: '#equipment-list', desc: 'Borrow plug-and-play multimedia equipment for educational purposes with managed reservations and return procedures.' },
  { num: '02', name: 'EdTech & Multimedia Concerns', group: 'ETMPS', target: '#process-steps', desc: 'Troubleshooting assistance and solutions for software applications, hardware devices, or multimedia content issues.' },
  { num: '03', name: 'HyZONE Classroom Setup', group: 'ETMPS', target: '#hyzone', desc: 'Configuration of blended learning environments and flexible classroom setups for online classes, conferences, and meetings.' },
  { num: '04', name: 'Multimedia Equipment Custodianship', group: 'ETMPS', target: '#custodianship', desc: 'Extended-period borrowing (such as a week or a month) for authorized academic and office operations.' },
  { num: '05', name: 'Sound System Setup', group: 'ETMPS', target: '#production-rates', desc: 'Audio and sound system setup for large audiences, programs, and campus events.' },
  { num: '06', name: 'Technical Management Support', group: 'ETMPS', target: '#production-rates', desc: 'Focused assistance from an ETC staff member for a specific technical task during an event.' },
  { num: '07', name: 'Event Management Packages', group: 'ETMPS', target: '#production-rates', desc: 'Coordinated logistical and technical support packages tailored for institutional events.' },
  { num: '08', name: 'Event Streaming', group: 'Production', target: '#streaming', desc: 'Live broadcast support on social media and online streaming platforms.' },
  { num: '09', name: 'Multimedia Equipment Rental', group: 'Equipment', target: '#equipment-rental', desc: 'Borrowing of complex multimedia gear such as DSLR cameras, lighting kits, or audio recording equipment.' },
  { num: '10', name: 'Studio Rental', group: 'Production', target: '#studio-rental', desc: 'Controlled studio environment for video shoots, livestreams, and audio recordings.' },
  { num: '11', name: 'Multimedia Production', group: 'Production', target: '#multimedia-production', desc: 'Creation of videos, graphic designs, layouts, and other digital content.' },
  { num: '12', name: 'Educational Technology and Multimedia Training', group: 'ETMPS', target: '#edtech-training', desc: 'Training on blended learning strategies, Google Workspace, LMS platforms, video editing, animation, and event production.' },
];
</script>

<template>
  <section id="e-services" class="relative z-20 -mt-10 pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-3xl border border-green-900/10 shadow-lg p-6 sm:p-10">
        <!-- Section Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <div class="inline-flex items-center gap-2.5 mb-2">
              <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
              <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Educational Technology Center</span>
            </div>
            <h2 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              ETC <span class="text-[#14532d]">Services</span>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
              Explore the 6 primary core services and the complete 12-program directory provided by the center for teachers, students, departments, and external clients.
            </p>
          </div>

          <a
            href="https://bit.ly/ETCRequestS"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#14532d] hover:bg-[#166534] text-white text-xs font-extrabold shrink-0 self-start md:self-auto shadow-sm transition-all hover:scale-105"
          >
            <span>Open ETC Request Form</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <!-- The 6 Core Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div
            v-for="svc in coreServices"
            :key="svc.id"
            class="group bg-[#fafcfa] hover:bg-white rounded-2xl border border-green-900/15 hover:border-[#14532d] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
          >
            <!-- Top emerald accent line -->
            <div class="h-1.5 w-full bg-[#14532d]"></div>

            <div class="p-6 flex-1 flex flex-col">
              <!-- Service Number & Tag -->
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="w-12 h-12 rounded-2xl bg-[#14532d] text-white flex items-center justify-center shadow-sm shrink-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="svc.iconPath" />
                  </svg>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="text-xs font-black text-slate-300 tracking-widest">{{ svc.number }}</span>
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-[#f0f5f0] text-[#14532d] border-green-900/15">
                    {{ svc.tagline }}
                  </span>
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-base sm:text-lg font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-[#14532d] transition-colors">
                {{ svc.title }}
              </h3>

              <!-- Exact Description from the Flyer -->
              <p class="text-xs text-slate-600 leading-relaxed mb-5">
                {{ svc.description }}
              </p>

              <!-- Highlights -->
              <ul class="space-y-1.5 mb-6 mt-auto pt-4 border-t border-slate-100">
                <li
                  v-for="(hl, idx) in svc.highlights"
                  :key="idx"
                  class="flex items-center gap-2 text-[11px] font-semibold text-slate-700"
                >
                  <span class="w-3.5 h-3.5 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0">
                    <svg class="w-2 h-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span>{{ hl }}</span>
                </li>
              </ul>

              <!-- Card Action Buttons -->
              <div class="flex items-center gap-2 pt-2">
                <a
                  :href="svc.targetId"
                  class="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-[#14532d] bg-[#f0f5f0] hover:bg-[#14532d] hover:text-white border border-green-900/15 transition-colors"
                >
                  <span>View Details &amp; Rates</span>
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </a>
                <a
                  :href="svc.requestLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center p-2.5 rounded-xl text-white bg-[#14532d] hover:bg-[#166534] transition-colors"
                  title="Request via Google Form"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Complete 12-Service Directory Breakdown -->
        <div class="pt-8 border-t border-slate-100">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 class="text-lg font-black text-slate-900">
                Complete Directory of All 12 ETC Services
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Every service section available under the myZ1 automatic technical management system. Click any service to jump directly to its rates and policies.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <a
              v-for="item in allEtcServices"
              :key="item.num"
              :href="item.target"
              class="p-4 rounded-2xl bg-[#f5f7f4] hover:bg-white border border-green-900/10 hover:border-[#14532d] transition-all hover:scale-[1.01] flex flex-col gap-1.5 group"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="px-2 py-0.5 rounded-md bg-[#14532d] text-white text-[10px] font-black">{{ item.num }}</span>
                <span class="text-[10px] font-bold uppercase tracking-wider text-[#14532d]">{{ item.group }}</span>
              </div>
              <h4 class="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug mt-1 group-hover:text-[#14532d] transition-colors flex items-center justify-between gap-2">
                <span>{{ item.name }}</span>
                <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#14532d] group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </h4>
              <p class="text-xs text-slate-600 leading-relaxed">{{ item.desc }}</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
