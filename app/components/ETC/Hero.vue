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
          href="https://bit.ly/ETCRequestS"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-green-50 text-[#14532d] font-black text-xs sm:text-sm shadow-lg shadow-black/20 transition-all hover:scale-105"
        >
          <span>Request an ETC Service</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        <!-- <a
          href="https://bit.ly/ETCmyZ1guide"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md transition-all hover:scale-105"
        >
          <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Public Manual Guide</span>
        </a> -->
      </div>

      <!-- Categorized Navigation Dock -->
      <div class="w-full max-w-4xl mt-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-4 sm:p-5 shadow-2xl shadow-black/25">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-white/15 text-[11px] font-bold uppercase tracking-wider text-green-200">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Quick Directory Navigation</span>
          </div>
          <span class="text-[10px] text-green-300/80 font-medium lowercase">click to jump</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2">
          <!-- Main E-Services -->
          <a
            href="#e-services"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#14532d] hover:bg-green-50 font-black text-xs shadow-md transition-all hover:scale-105"
          >
            <span>⚡ E-Services</span>
          </a>

          <!-- Core Academic & Borrowing -->
          <a
            href="#equipment-list"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Equipment List</span>
          </a>
          <a
            href="#hyzone"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>HyZONE</span>
          </a>
          <a
            href="#custodianship"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Custodianship</span>
          </a>

          <!-- Media & Productions -->
          <a
            href="#production-rates"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Sound &amp; Crew</span>
          </a>
          <a
            href="#streaming"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Streaming</span>
          </a>
          <a
            href="#equipment-rental"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Gear Rental</span>
          </a>
          <a
            href="#studio-rental"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Studio Rental</span>
          </a>
          <a
            href="#multimedia-production"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Multimedia Prod</span>
          </a>

          <!-- Training, Steps, Info -->
          <a
            href="#edtech-training"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>EdTech Training</span>
          </a>
          <a
            href="#process-steps"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Workflow Steps</span>
          </a>
          <a
            href="#etc-policies"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Policies</span>
          </a>
          <a
            href="#etc-team"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>Our Team</span>
          </a>
          <a
            href="#etc-faqs"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all hover:scale-105"
          >
            <span>FAQs</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
