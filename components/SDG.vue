<template>
  <div class="px-4 lg:px-0">
    <a
      href="/sdgs"
      class="group relative block max-w-6xl mx-auto
             bg-white
       
             rounded-2xl
             px-6 lg:px-16 py-12 lg:py-24
             overflow-hidden
             transition-all duration-500
             hover:border-green-700/40"
    >
      <!-- SOFT GLOW -->
      <div
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700"
        style="
          background: radial-gradient(
            circle at center,
            rgba(22,163,74,0.08),
            transparent 70%
          );
        "
      ></div>

      <!-- CONTENT -->
      <div class="relative z-10 flex flex-col items-center gap-8">

        <!-- LOGOS -->
        <div class="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          <!-- LSU LOGO -->
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
            class="w-40 lg:w-80
                   transition-all duration-700 ease-out
                   group-hover:scale-105 group-hover:-translate-y-1"
            alt="LSU Logo"
          />

          <!-- DIVIDER -->
          <div class="hidden lg:block w-px h-40 bg-gray-50 relative overflow-hidden">
            <div
              class="absolute top-0 left-0 w-full h-0 bg-green-500
                     group-hover:h-full transition-all duration-700"
            ></div>
          </div>

          <!-- SDG LOGO -->
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
            class="w-40 lg:w-80
                   transition-all duration-700 ease-out
                   group-hover:scale-105 group-hover:translate-y-1"
            alt="SDGs Logo"
          />
        </div>

        <!-- TEXT -->
        <p
          class="text-center font-roboto font-semibold
                 text-green-900
                 text-sm lg:text-2xl
                 tracking-wide
                 transition-all duration-700
                 group-hover:text-green-700"
        >
          La Salle University supports the Sustainable Development Goals.
        </p>

        <!-- MINIMAL CTA -->
        <div
          class="flex items-center gap-2 text-green-800 text-xs lg:text-sm
                 opacity-0 group-hover:opacity-100
                 transition-all duration-700"
        >
          <span class="uppercase tracking-widest">Explore SDGs</span>
          <span class="transform transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </a>
  </div>
</template>
