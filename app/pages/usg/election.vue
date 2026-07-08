<template>
  <div>
    <div
      class="h-1 w-full bg-gradient-to-r from-green-800 via-green-600 to-green-800"
    ></div>
    <header
      class="w-full bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 lg:px-8 py-4"
    >
      <div
        class="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3"
      >
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
          alt="La Salle University"
          class="h-10 sm:h-12 w-auto object-contain"
        />
        <div
          class="flex items-center justify-center lg:justify-end gap-2 text-[11px] sm:text-xs text-gray-500 font-medium tracking-wider uppercase text-center lg:text-right"
        >
          <span
            class="lg:inline-block hidden w-2 h-2 rounded-full"
            :class="votingClosed ? 'bg-red-500' : 'bg-green-500 animate-pulse'"
          ></span>
          <span>Official Voting System of La Salle University</span>
        </div>
      </div>
    </header>

    <!-- Voting closed message -->
    <div
      v-if="votingClosed"
      class="max-w-3xl mx-auto mt-16 mb-16 px-4 text-center"
    >
      <div
        class="bg-white border border-red-100 shadow-sm rounded-2xl px-6 py-12 sm:px-12"
      >
        <div
          class="mx-auto mb-6 flex items-center justify-center w-16 h-16 rounded-full bg-red-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Voting is Already Closed
        </h1>
        <p class="text-gray-500 text-sm sm:text-base leading-relaxed">
          The voting period for the Commission on Elections Student Election
          ended on
          <span class="font-semibold text-gray-700"
            >July 8, 2026, 11:59 PM</span
          >. Thank you to everyone who participated.
        </p>
      </div>
    </div>

    <!-- Voting component (hidden once closed) -->
    <CommissionOnElectionStudentElectionVoting v-else />

       <!-- Footer -->
    <footer class="mt-10 border-t border-slate-200 bg-white">
      <div class="max-w-6xl mx-auto px-6 lg:py-3 py-3">
        <div class="flex flex-col items-center justify-center text-center">
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20with%20Theme%20-%20Green.png"
            alt="La Salle University" class="w-12 h-12 object-contain opacity-90 lg:mb-3" />

          <p class="lg:text-sm text-xs tracking-tighter font-semibold text-green-700">
            © 2026 La Salle University Ozamiz, Inc.
          </p>

          <p class="lg:text-sm text-xs tracking-tighter text-slate-500">
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
import { ref, onMounted, onUnmounted } from "vue";

const votingClosed = ref(false);
const VOTING_DEADLINE = new Date("2026-07-08T23:59:59");

let intervalId = null;

function checkVotingStatus() {
  votingClosed.value = new Date() >= VOTING_DEADLINE;
}

onMounted(() => {
  checkVotingStatus();
  // Re-check every 30 seconds in case the page is left open across the deadline
  intervalId = setInterval(checkVotingStatus, 30000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>