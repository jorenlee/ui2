<template>
  <div>
    <div class="h-1 w-full bg-gradient-to-r from-green-800 via-green-600 to-green-800"></div>
    <header class="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8 py-4">
      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
          alt="La Salle University"
          class="h-10 sm:h-12 w-auto object-contain"
        />
        <div class="flex items-center justify-center lg:justify-end gap-2 text-[11px] sm:text-xs text-gray-500 font-medium tracking-wider uppercase text-center lg:text-right">
          <span class="lg:inline-block hidden w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Official BEU Voting System of La Salle University</span>
        </div>
      </div>
    </header>

    <div class="p-4 sm:p-6 lg:p-8">
      <CommissionOnElectionBEUStudentElectionVoting />
    </div>

    <!-- Footer -->
    <footer class="mt-10 border-t border-slate-200 bg-white">
      <div class="max-w-6xl mx-auto px-6 py-4">
        <div class="flex flex-col items-center justify-center text-center">
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20with%20Theme%20-%20Green.png"
            alt="La Salle University" class="w-12 h-12 object-contain opacity-90 mb-2" />

          <p class="text-xs sm:text-sm font-semibold text-green-700">
            © 2026 La Salle University Ozamiz, Inc. &bull; Basic Education Unit
          </p>

          <p class="text-xs text-slate-500 mt-1">
            Powered by
            <span class="font-semibold text-[#087830]">
              Network, Programs and Computerization Center (NPCC)
            </span>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
useHead({
  title: 'BEU Student Election - La Salle University',
  meta: [
    { name: 'description', content: 'Official Basic Education Unit Student Election Voting Portal at La Salle University.' }
  ]
});
</script>
