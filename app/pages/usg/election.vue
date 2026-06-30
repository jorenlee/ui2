<template>
    <div> 
           <!-- Decorative top bar -->
      <div class="h-1 w-full bg-gradient-to-r from-green-800 via-green-600 to-green-800"></div>

      <!-- Header -->
<header
  class="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8 py-4"
>
  <div
    class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3"
  >
    <!-- Logo -->
    <img
      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
      alt="La Salle University"
      class="h-10 sm:h-12 w-auto object-contain"
    />

    <!-- Status -->
    <div
      class="flex items-center justify-center lg:justify-end gap-2 text-[11px] sm:text-xs text-gray-500 font-medium tracking-wider uppercase text-center lg:text-right"
    >
      <span
        class="lg:inline-block hidden w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"
      ></span>

      <span>
        Official Voting System of La Salle University
      </span>
    </div>
  </div>
</header>
        <CommissionOnElectionStudentElectionVoting />
    </div>
</template>