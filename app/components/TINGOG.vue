<template>
  <section id="tingog" class="relative bg-black pt-5">
    <div>

      <!-- Section Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8 w-9/12 mx-auto">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <span class="w-1 h-6 rounded-full bg-gradient-to-b from-emerald-700 to-green-500"></span>
            <span class="text-xs font-bold uppercase tracking-[0.18em] text-white">University Publication</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            LSU <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">Tingog</span>
          </h2>
          <p class="text-white text-xs sm:text-sm mt-1 max-w-lg">
            Browse the latest issue of the official La Salle University research and literary publication.
          </p>
        </div>

        <!-- External link badge -->
        <a
          href="https://heyzine.com/flip-book/e895492985.html"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-xs font-bold text-emerald-700 transition-all duration-200 group shrink-0"
        >
          <i class="fas fa-external-link-alt text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"></i>
          <span>Open Full Screen</span>
        </a>
      </div>

      <!-- Flipbook Embed -->
      <div class="w-full overflow-hidden shadow-lg shadow-emerald-950/5 bg-slate-100">
        <iframe
          src="https://heyzine.com/flip-book/e895492985.html"
          title="LSU Tingog - Interactive Flipbook"
          class="w-full h-screen border-0"
          allowfullscreen
          loading="lazy"
          allow="clipboard-write"
        ></iframe>
      </div>

    </div>
  </section>
</template>
