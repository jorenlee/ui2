<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

useHead({
  link: [
    { rel: 'preconnect', href: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com' },
    { rel: 'preconnect', href: 'https://raw.githubusercontent.com', crossorigin: '' },
    { rel: 'dns-prefetch', href: 'https://raw.githubusercontent.com' }
  ]
});

const showScrollButton = ref(false);

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => window.addEventListener("scroll", handleScroll));
onBeforeUnmount(() => window.removeEventListener("scroll", handleScroll));
</script>

<template>
  <div class="font-montserrat bg-slate-50 text-slate-800 antialiased">

    <!-- ═══════════════════════════════════════
         HERO SECTION
         LandingHeader + HeroCarousel + Quick-Access Shortcuts
    ════════════════════════════════════════ -->
    <section id="hero" class="relative bg-white">
      <Header class="hidden lg:block" />

      <!-- Full Widescreen Edge-to-Edge Student Banner Image -->
      <div class="relative w-full overflow-hidden bg-white">
        
        <!-- Banner Image -->
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LANDSCAPE%20CROPPED.jpg"
          alt="La Salle Students Banner"
          class="w-full h-auto object-cover object-top sm:object-center block min-h-[180px] sm:min-h-[350px] lg:min-h-[550px] lg:-mt-20"
          loading="eager"
          fetchpriority="high"
        />

        <!-- Logos Container Overlay (Proportionately scaled for mobile, tablet, & desktop) -->
        <div class="absolute inset-x-0 top-0 pt-2 sm:pt-6 lg:pt-12 px-2 sm:px-8 z-10">
          <div class="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-6 lg:pl-48">
            
            <!-- 20th Anniversary Emblem -->
            <div class="flex items-center shrink-0">
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20with%20Theme%20-%20Green.png"
                alt="20th Anniversary Logo"
                class="h-6 sm:h-12 lg:h-24 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            <!-- La Salle Corporate Tagline Logo -->
            <div class="text-center shrink-0">
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
                alt="La Salle Ozamiz - Reshaping Futures"
                class="h-5 sm:h-10 lg:h-20 w-auto object-contain mx-auto transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>

        <!-- Subtle bottom shadow gradient over image -->
        <div class="absolute inset-x-0 bottom-0 h-12 sm:h-24 bg-gradient-to-t from-slate-900/15 to-transparent pointer-events-none"></div>
      </div>

      <!-- Shortcuts bar: absolute on desktop, stacked on mobile -->
      <div class="lg:absolute bottom-0 w-full z-20 shadow-2xl">
        <Shortcuts />
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         LATEST NEWS & UPDATES
    ════════════════════════════════════════ -->
    <section id="news" class="relative bg-white lg:pt-16 pt-6">
      <!-- Decorative top wave -->
      <div class="absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1200 40" xmlns="http://www.w3.org/2000/svg" class="w-full h-8 fill-slate-50">
          <path d="M0,20 C300,60 900,-20 1200,20 L1200,0 L0,0 Z" />
        </svg>
      </div>

      <!-- Section label -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 pb-2">
        <div class="flex items-center gap-3 mb-1">
          <span class="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-700 to-teal-500"></span>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">Campus Updates</span>
        </div>
      </div>

      <BlogPosting />
    </section>

    <!-- ═══════════════════════════════════════
         SUSTAINABILITY / SDGs
    ════════════════════════════════════════ -->
    <section id="sustainability" class="relative bg-slate-50 py-2">
      <!-- Section label -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-0">
        <div class="flex items-center gap-3 mb-1">
          <span class="w-1 h-6 rounded-full bg-gradient-to-b from-teal-600 to-emerald-400"></span>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">Sustainability</span>
        </div>
      </div>

      <SDG />
    </section>

    <!-- ═══════════════════════════════════════
         ANNOUNCEMENTS
    ════════════════════════════════════════ -->
    <section id="announcements" class="relative overflow-hidden">
      <!-- Rich dark background -->
      <div class="bg-gradient-to-br from-[#031d03] via-[#042804] to-[#073a07] pt-12 sm:py-16 px-4 sm:px-6">
        <!-- Decorative ambient glows -->
        <div class="absolute -top-20 -right-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Section header -->
        <div class="max-w-7xl mx-auto relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/80 text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-full border border-emerald-700/40 mb-3">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Updates
            </span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              University <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">Announcements</span>
            </h2>
            <p class="text-emerald-200/70 text-xs sm:text-sm mt-1">
              Stay updated with the latest news from La Salle University Ozamiz.
            </p>
          </div>
        </div>

        <!-- Slider component -->
        <div class="mx-auto relative z-10">
          <Slider />
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         UNIVERSITY CALENDAR
    ════════════════════════════════════════ -->
    <section id="calendar" class="bg-white py-2 sm:py-4">
      <!-- Section label -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <div class="flex items-center gap-3 mb-1">
          <span class="w-1 h-6 rounded-full bg-gradient-to-b from-blue-600 to-sky-400"></span>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-blue-800">Academic Schedule</span>
        </div>
      </div>
      <UniversityCalendar />
    </section>

    <!-- ═══════════════════════════════════════
         FAQs
    ════════════════════════════════════════ -->
    <section id="faqs" class="bg-slate-50 py-2">
      <!-- Section label -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-0">
        <div class="flex items-center gap-3 mb-1">
          <span class="w-1 h-6 rounded-full bg-gradient-to-b from-violet-600 to-purple-400"></span>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-violet-800">Help & Support</span>
        </div>
      </div>
      <FAQs />
    </section>

    <!-- ═══════════════════════════════════════
         PARTNER NETWORKS
    ════════════════════════════════════════ -->
    <section id="partners" class="bg-white border-t border-slate-100">
      <!-- <div class="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
        <div class="flex items-center gap-3 mb-1">
          <span class="w-1 h-6 rounded-full bg-gradient-to-b from-amber-600 to-yellow-400"></span>
          <span class="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">Institutional Partners</span>
        </div>
      </div> -->
      <NetworkLogo class="py-6 sm:py-10" />
    </section>

    <!-- ═══════════════════════════════════════
         FOOTER
    ════════════════════════════════════════ -->
    <Footer />

    <!-- ═══════════════════════════════════════
         FLOATING SCROLL TO TOP
    ════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-75 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-75 translate-y-4"
    >
      <button
        v-show="showScrollButton"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-900 hover:from-emerald-600 hover:to-teal-800 text-white rounded-2xl shadow-xl shadow-emerald-950/30 hover:shadow-2xl transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <i class="fas fa-chevron-up text-sm group-hover:-translate-y-0.5 transition-transform duration-200"></i>
      </button>
    </Transition>
  </div>
</template>

