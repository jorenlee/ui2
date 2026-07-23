<script setup>
import { computed } from "vue";

const sdgs = [
  { id: 'no-poverty', title: 'No Poverty', number: 1, color: '#e5243b', category: 'Society' },
  { id: 'zero-hunger', title: 'Zero Hunger', number: 2, color: '#dda63a', category: 'Society' },
  { id: 'good-health-and-well-being', title: 'Good Health & Well-Being', number: 3, color: '#4c9f38', category: 'Society' },
  { id: 'quality-education', title: 'Quality Education', number: 4, color: '#c5192d', category: 'Society' },
  { id: 'gender-equality', title: 'Gender Equality', number: 5, color: '#ff3a21', category: 'Society' },
  { id: 'clean-water-and-sanitation', title: 'Clean Water & Sanitation', number: 6, color: '#26bde2', category: 'Biosphere' },
  { id: 'affordable-and-clean-energy', title: 'Affordable & Clean Energy', number: 7, color: '#fcc30b', category: 'Society' },
  { id: 'decent-work-and-economic-growth', title: 'Decent Work & Economic Growth', number: 8, color: '#a21942', category: 'Economy' },
  { id: 'industry-innovation-and-infrastructure', title: 'Industry & Innovation', number: 9, color: '#fd6925', category: 'Economy' },
  { id: 'reduced-inequalities', title: 'Reduced Inequalities', number: 10, color: '#dd1367', category: 'Economy' },
  { id: 'sustainable-cities-and-communities', title: 'Sustainable Cities', number: 11, color: '#fd9d24', category: 'Society' },
  { id: 'responsible-consumption-and-production', title: 'Responsible Consumption', number: 12, color: '#bf8b2e', category: 'Economy' },
  { id: 'climate-action', title: 'Climate Action', number: 13, color: '#3f7e44', category: 'Biosphere' },
  { id: 'life-below-water', title: 'Life Below Water', number: 14, color: '#0a97d9', category: 'Biosphere' },
  { id: 'life-on-land', title: 'Life on Land', number: 15, color: '#56c02b', category: 'Biosphere' },
  { id: 'peace-justice-and-strong-institutions', title: 'Peace, Justice & Institutions', number: 16, color: '#00689d', category: 'Society' },
  { id: 'partnerships-for-the-goals', title: 'Partnerships for Goals', number: 17, color: '#19486a', category: 'Society' }
];
</script>

<template>
  <section class="pb-10 pt-5 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div class="relative bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 border border-emerald-100/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl shadow-emerald-950/5 overflow-hidden">
      <!-- Ambient Decorative Glows -->
      <div class="absolute -top-32 -right-32 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Header & Partner Logos -->
      <div class="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto mb-8 sm:mb-10">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-100/90 text-emerald-800 text-xs font-bold uppercase tracking-widest rounded-full mb-4 border border-emerald-200/60">
          <i class="fas fa-seedling text-emerald-600"></i> Institutional Commitment
        </span>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-2">
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
            alt="La Salle University Logo"
            class="h-12 sm:h-16 object-contain hover:scale-105 transition-transform duration-300"
          />
          <div class="hidden sm:block w-px h-12 bg-slate-200"></div>
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
            alt="UN SDGs Logo"
            class="h-12 sm:h-16 object-contain hover:scale-105 transition-transform duration-300"
          />
        </div>

        <h2 class="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-4 mb-2 tracking-tight">
          La Salle University supports the <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 to-teal-700">Sustainable Development Goals</span>
        </h2>
        <p class="text-slate-600 text-xs sm:text-base max-w-2xl">
          Driving meaningful impact through campus research, social action, environmental stewardship, and inclusive education.
        </p>
      </div>

      <!-- Interactive SDGs Mini Grid -->
      <div class="relative z-10 mb-8 sm:mb-10">
        <div class="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2.5 sm:gap-3.5 max-w-5xl mx-auto">
          <NuxtLink
            v-for="s in sdgs"
            :key="s.id"
            :to="`/sdgs/${s.id}`"
            class="group relative aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border border-slate-100 flex items-center justify-center p-0.5"
            :title="`Goal ${s.number}: ${s.title}`"
          >
            <img
              :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${s.number}.png`"
              :alt="s.title"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-emerald-950/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-1 text-white text-center">
              <span class="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Goal {{ s.number }}</span>
              <p class="text-[10px] font-semibold leading-tight line-clamp-2">{{ s.title }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Bottom Action Bar -->
      <div class="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 pt-6 max-w-5xl mx-auto">
        <div class="flex items-center gap-6 text-xs text-slate-600">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="font-medium">17 Global Goals</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span class="font-medium">3 Core Pillars</span>
          </div>
        </div>

        <NuxtLink
          to="/sdgs"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-800 to-teal-900 hover:from-emerald-900 hover:to-teal-950 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all duration-300 group"
        >
          <span>Explore All Sustainability Initiatives</span>
          <i class="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

