<template>
  <section class="relative bg-[#0d3b1e] text-white pt-14 pb-24 sm:pt-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
    <!-- Subtle Background Ambient Glows & Tech Grid -->
    <div class="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none"></div>
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[380px] bg-emerald-500/25 blur-[120px] rounded-full pointer-events-none"></div>
    <div class="absolute -bottom-24 left-1/4 w-[450px] h-[250px] bg-green-600/15 blur-[90px] rounded-full pointer-events-none"></div>

    <div class="relative max-w-5xl mx-auto text-center flex flex-col items-center">
      <!-- Top ETC Logo Badge (Floating Clean Capsule) -->
      <div class="inline-flex items-center gap-3 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-white text-[#14532d] shadow-xl shadow-black/15 border border-green-800/15 mb-6 sm:mb-8 transition-transform hover:scale-[1.02]">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LOGOS/ETC%20LOGO.png"
          alt="Educational Technology Center Logo"
          class="h-8 sm:h-9 w-auto object-contain"
        />
        <div class="h-6 w-px bg-green-200"></div>
        <div class="text-left leading-tight">
          <span class="block text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">La Salle University · Ozamiz</span>
          <span class="block text-xs sm:text-sm font-black text-[#14532d] tracking-tight">Educational Technology Center</span>
        </div>
      </div>

      <!-- "Welcome to" in Elegant Script Typography -->
      <p class="font-serif italic text-3xl sm:text-4xl text-green-200/90 font-light tracking-wide mb-1 drop-shadow-sm">
        Welcome to
      </p>

      <!-- myZ1 Title with Neon Emerald Glow Accent -->
      <h1 class="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none mb-4 text-white drop-shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
        my<span class="text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.7)]">Z1</span>
      </h1>

      <!-- Automatic Subtitle with Emerald Pill -->
      <div class="max-w-2xl text-center">
        <p class="text-base sm:text-xl md:text-2xl font-medium text-green-50 leading-relaxed">
          An <span class="font-black text-white px-3 py-0.5 rounded-xl bg-emerald-600/60 border border-emerald-400/40 shadow-inner">Automatic</span> Equipment Management &amp; Technical Support System
        </p>

        <p class="text-xs sm:text-sm text-green-100/80 mt-3 leading-relaxed max-w-xl mx-auto">
          Ensuring the effective upgrade, management, technical support, and maintenance of all equipment utilized within the center's operations.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="mt-7 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#request-form"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-green-50 text-[#14532d] font-black text-xs sm:text-sm shadow-lg shadow-black/20 transition-all hover:scale-105"
        >
          <span>Request an ETC Service</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>

      <!-- Categorized Navigation Dock -->
      <div class="w-full max-w-5xl mt-10 rounded-3xl bg-gradient-to-b from-white/[0.12] to-white/[0.04] backdrop-blur-xl border border-white/15 p-4 sm:p-6 shadow-2xl shadow-black/30 text-left">
        <!-- Dock Header + Featured Quick Jumps -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div class="flex items-center gap-2.5">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <div>
              <span class="block text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200">
                Quick Directory
              </span>
              <span class="block text-[11px] text-green-200/70">
                Jump directly to any ETC service or resource
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <a
              href="#request-form"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#0a2e18] font-black text-xs shadow-lg shadow-emerald-950/30 transition-all hover:-translate-y-0.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Request Form</span>
            </a>
            <a
              href="#e-services"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-green-50 text-[#14532d] font-black text-xs shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5"
            >
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>E-Services</span>
            </a>
          </div>
        </div>

        <!-- 3-Column Categorized Links -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div
            v-for="group in directoryGroups"
            :key="group.title"
            class="rounded-2xl bg-black/20 border border-white/10 p-3.5 hover:border-emerald-400/30 transition-colors"
          >
            <div class="flex items-center gap-2 mb-2.5 px-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/90">
                {{ group.title }}
              </span>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <a
                v-for="item in group.items"
                :key="item.href"
                :href="item.href"
                class="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-emerald-400/20 border border-white/10 hover:border-emerald-400/40 text-xs font-medium text-green-50 hover:text-white transition-all"
              >
                <span>{{ item.label }}</span>
                <svg
                  class="w-3 h-3 text-emerald-300/60 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const directoryGroups = [
  {
    title: 'Equipment & Spaces',
    items: [
      { label: 'Equipment List', href: '#equipment-list' },
      { label: 'HyZONE', href: '#hyzone' },
      { label: 'Custodianship', href: '#custodianship' },
      { label: 'Gear Rental', href: '#equipment-rental' },
      { label: 'Studio Rental', href: '#studio-rental' },
    ],
  },
  {
    title: 'Media & Training',
    items: [
      { label: 'Sound & Crew', href: '#production-rates' },
      { label: 'Streaming', href: '#streaming' },
      { label: 'Multimedia Prod', href: '#multimedia-production' },
      { label: 'EdTech Training', href: '#edtech-training' },
    ],
  },
  {
    title: 'Guides & Support',
    items: [
      { label: 'Workflow Steps', href: '#process-steps' },
      { label: 'Policies', href: '#etc-policies' },
      { label: 'Our Team', href: '#etc-team' },
      { label: 'FAQs', href: '#etc-faqs' },
    ],
  },
];
</script>
