<script setup>
const leadership = {
  name: 'Maria Alexandra S. Benitez',
  role: 'Director',
  department: 'Educational Technology Center'
};

const officer = {
  name: 'Jenny L. Largo',
  role: 'Officer',
  department: 'Educational Technology Center'
};

const associates = [
  { name: 'Neil F. Laurete', role: 'Multimedia Associate' },
  { name: 'Apollo John C. Flores', role: 'Multimedia Associate' }
];

const assistants = [
  { name: 'Evan Theodosius Arboleras', role: 'Student Assistant' },
  { name: 'Pitt Marc Kuridi', role: 'Student Assistant' }
];
</script>

<template>
  <section id="etc-team" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
        <div class="inline-flex items-center gap-2.5 mb-2">
          <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Our Organization</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Meet our <span class="text-[#14532d]">Team!</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
          The dedicated personnel, multimedia specialists, and student assistants behind ETC services and technical support at La Salle University Ozamiz.
        </p>
      </div>

      <!-- Organizational Chart Structure -->
      <div class="flex flex-col lg:flex-row items-stretch justify-center gap-6">
        <!-- Main Staff Hierarchy -->
        <div class="flex-1 space-y-6">
          <!-- Tier 1: Director & Officer -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Director -->
            <div class="p-5 rounded-2xl bg-[#fafcfa] border-2 border-[#14532d] shadow-sm flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-[#14532d] text-white flex items-center justify-center font-black text-xl shrink-0">
                MB
              </div>
              <div>
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#14532d] text-white">
                  {{ leadership.role }}
                </span>
                <h3 class="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                  {{ leadership.name }}
                </h3>
                <p class="text-[11px] text-slate-500">{{ leadership.department }}</p>
              </div>
            </div>

            <!-- Officer -->
            <div class="p-5 rounded-2xl bg-[#fafcfa] border border-green-900/20 shadow-sm flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-[#166534] text-white flex items-center justify-center font-black text-xl shrink-0">
                JL
              </div>
              <div>
                <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#166534] text-white">
                  {{ officer.role }}
                </span>
                <h3 class="text-sm font-extrabold text-slate-900 mt-1 leading-snug">
                  {{ officer.name }}
                </h3>
                <p class="text-[11px] text-slate-500">{{ officer.department }}</p>
              </div>
            </div>
          </div>

          <!-- Tier 2: Multimedia Associates -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="person in associates"
              :key="person.name"
              class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/15 flex items-center gap-3.5"
            >
              <div class="w-11 h-11 rounded-xl bg-white border border-green-900/20 text-[#14532d] font-bold text-sm flex items-center justify-center shrink-0">
                {{ person.name.charAt(0) }}
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">{{ person.name }}</div>
                <div class="text-[11px] font-semibold text-[#14532d]">{{ person.role }}</div>
              </div>
            </div>
          </div>

          <!-- Tier 3: Student Assistants -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="person in assistants"
              :key="person.name"
              class="p-4 rounded-2xl bg-white border border-green-900/10 flex items-center gap-3.5"
            >
              <div class="w-11 h-11 rounded-xl bg-[#f0f5f0] text-slate-700 font-bold text-sm flex items-center justify-center shrink-0">
                {{ person.name.charAt(0) }}
              </div>
              <div>
                <div class="text-xs font-bold text-slate-900">{{ person.name }}</div>
                <div class="text-[11px] text-slate-500">{{ person.role }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Volunteers & Stakeholders Banner -->
        <div class="lg:w-48 bg-[#14532d] text-white rounded-2xl p-6 flex lg:flex-col items-center justify-center text-center gap-3">
          <svg class="w-8 h-8 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div class="text-xs sm:text-sm font-black tracking-wide uppercase">
            ETC Student Volunteers &amp; Stakeholders
          </div>
          <p class="text-[11px] text-green-100 hidden lg:block leading-relaxed mt-1">
            Empowering students with hands-on technical skills and event media operations across campus.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
