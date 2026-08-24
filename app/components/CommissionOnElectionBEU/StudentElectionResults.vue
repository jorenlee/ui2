<template>
  <section class="animate-[fadeIn_0.4s_ease-out] relative">
    
    <!-- Toast Notification -->
    <div v-if="toast.show" :class="[
      'fixed top-6 right-6 p-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 max-w-sm w-full flex items-start gap-3 border',
      toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200 border-l-4 border-l-red-500' : 'bg-green-50 text-green-800 border-green-200 border-l-4 border-l-green-500'
    ]">
      <div class="text-2xl mt-0.5">
        {{ toast.type === 'error' ? '⚠️' : '✅' }}
      </div>
      <div>
        <h4 class="font-bold text-base">{{ toast.type === 'error' ? 'Error' : 'Success' }}</h4>
        <p class="text-sm opacity-90">{{ toast.message }}</p>
      </div>
      <button @click="toast.show = false" class="ml-auto text-xl opacity-50 hover:opacity-100 leading-none">&times;</button>
    </div>

    <!-- Reset Election Modal -->
    <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-red-700 px-6 py-4 text-white flex justify-between items-center">
          <div class="flex items-center gap-2 font-bold text-base">
            <i class="fa fa-triangle-exclamation"></i>
            <span>Reset BEU Election</span>
          </div>
          <button @click="showResetModal = false" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div class="p-6">
          <p class="text-xs text-slate-600 mb-5 leading-relaxed">
            Choose how you want to reset the election. This action cannot be undone.
          </p>

          <!-- Reset Mode Options -->
          <div class="space-y-3 mb-5">
            <!-- Mode 1: Votes Only -->
            <label :class="[
              'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              resetMode === 'votes_only' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
            ]">
              <input type="radio" value="votes_only" v-model="resetMode" class="mt-1 text-amber-600 focus:ring-amber-500">
              <div>
                <div class="font-bold text-slate-800 text-xs sm:text-sm">Reset Votes & Tallies Only (Recommended)</div>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Zeros out all candidate votes and resets all voters to "Not Voted". <strong>Preserves</strong> your list of candidates and enrolled voters.
                </div>
              </div>
            </label>

            <!-- Mode 2: Purge All Data -->
            <label :class="[
              'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              resetMode === 'all_data' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'
            ]">
              <input type="radio" value="all_data" v-model="resetMode" class="mt-1 text-red-600 focus:ring-red-500">
              <div>
                <div class="font-bold text-red-700 text-xs sm:text-sm">Start Fresh New Election (Purge All Data)</div>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Permanently deletes all candidates, all voters, and all vote history. Use this to prepare for a brand new election term.
                </div>
              </div>
            </label>
          </div>

          <!-- Clear Emails checkbox if votes only -->
          <div v-if="resetMode === 'votes_only'" class="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input type="checkbox" v-model="clearEmails" class="rounded text-[#087830] focus:ring-green-500">
              <span>Also clear registered voter emails (students will re-enter their email on ballot access)</span>
            </label>
          </div>

          <!-- Security confirmation input -->
          <div class="mb-2">
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Type <span class="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">RESET</span> to confirm:
            </label>
            <input v-model="confirmText" type="text" placeholder="RESET"
                   class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-red-600 tracking-wider focus:bg-white focus:border-red-600">
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button @click="showResetModal = false" :disabled="resetting"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition disabled:opacity-60">
            Cancel
          </button>
          <button @click="executeElectionReset" :disabled="resetting || confirmText.trim().toUpperCase() !== 'RESET'"
                  class="px-5 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 text-xs transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="resetting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ resetting ? 'Resetting Election...' : 'Execute Reset' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Results Header -->
    <header class="mb-6 pb-6 border-b border-slate-100 text-center bg-white p-6 rounded-2xl shadow-sm">
      <div class="flex justify-center mb-3">
        <div class="flex items-center justify-center gap-3">
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
               alt="LSU Logo" class="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
        </div>
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-[#087830] tracking-tight">
          Basic Education Unit Student Election Results
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          La Salle University &bull; Official Real-time Live Tally
        </p>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button @click="fetchResults(true)" :disabled="refreshing"
                class="px-4 py-1.5 rounded-full border border-green-600 text-[#087830] hover:bg-green-50 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-60">
          <i :class="['fa fa-rotate-right', refreshing ? 'animate-spin' : '']"></i>
          <span>{{ refreshing ? 'Updating...' : 'Refresh Live Tally' }}</span>
        </button>

        <button @click="openResetModal"
                class="px-4 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
          <i class="fa fa-power-off"></i>
          <span>Reset Election</span>
        </button>

        <span class="text-[11px] text-slate-400 ml-1">Auto-refreshes every 20s</span>
      </div>
    </header>

    <!-- Overall Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
          <i class="fa fa-users"></i>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-800">{{ stats.total_voters || 0 }}</div>
          <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Registered BEU Voters</div>
        </div>
      </div>
      
      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-[#087830] flex items-center justify-center text-xl font-bold">
          <i class="fa fa-check-circle"></i>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-[#087830]">{{ stats.total_voted || 0 }}</div>
          <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Ballots Cast</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
          <i class="fa fa-chart-pie"></i>
        </div>
        <div>
          <div class="text-2xl sm:text-3xl font-extrabold text-purple-700">{{ turnoutPercentage }}%</div>
          <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">Voter Turnout Rate</div>
        </div>
      </div>
    </div>

    <!-- Grade & Section Turnout Breakdown -->
    <div v-if="Object.keys(stats.grade_registered || {}).length > 0" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
      <h3 class="text-sm font-extrabold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
        <i class="fa fa-graduation-cap text-[#087830]"></i>
        <span>Turnout by Grade & Section</span>
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(regCount, grade) in stats.grade_registered" :key="grade"
             class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div class="flex justify-between items-center text-xs font-bold text-slate-800 mb-1.5">
            <span class="truncate pr-2" :title="grade">{{ grade }}</span>
            <span class="text-[#087830] shrink-0 font-mono">{{ stats.grade_voted?.[grade] || 0 }} / {{ regCount }}</span>
          </div>
          <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full bg-[#087830] rounded-full transition-all duration-500"
                 :style="{ width: `${getGradePercentage(stats.grade_voted?.[grade] || 0, regCount)}%` }"></div>
          </div>
          <div class="text-[10px] text-slate-400 text-right mt-1 font-semibold">
            {{ getGradePercentage(stats.grade_voted?.[grade] || 0, regCount) }}% Voted
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading && groupedCandidates.length === 0" class="space-y-6">
      <div v-for="i in 2" :key="i" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div class="h-6 w-48 bg-slate-200 rounded mb-4"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="j in 2" :key="j" class="h-28 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="groupedCandidates.length === 0" class="bg-white p-12 rounded-2xl border border-slate-100 shadow-sm text-center">
      <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl text-slate-400">
        <i class="fa fa-inbox"></i>
      </div>
      <h3 class="text-base font-bold text-slate-700 mb-1">No Election Data Available</h3>
      <p class="text-xs text-slate-400">Candidates and results will appear once added in the system.</p>
    </div>

    <!-- Position-wise Candidates Results -->
    <div v-else class="space-y-8">
      <div v-for="group in groupedCandidates" :key="group.position"
           class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        <!-- Position Title Bar -->
        <div class="bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse"></span>
            <h2 class="text-lg font-bold tracking-wide uppercase">{{ group.position }}</h2>
          </div>
          <div class="text-xs text-emerald-100 font-medium">
            Total Votes in Position: <strong class="text-white">{{ group.totalVotes }}</strong>
            <span v-if="group.abstainCount > 0" class="ml-2 bg-emerald-900/50 px-2 py-0.5 rounded-full">
              Abstains: {{ group.abstainCount }}
            </span>
          </div>
        </div>

        <!-- Candidate Leaderboard Cards -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(candidate, rank) in group.candidates" :key="candidate.id"
                 :class="[
                   'p-4 rounded-xl border transition-all relative overflow-hidden',
                   rank === 0 && candidate.votes > 0
                     ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                     : 'bg-white border-slate-200 hover:border-slate-300'
                 ]">
              
              <!-- Rank Ribbon for Leader -->
              <div v-if="rank === 0 && candidate.votes > 0"
                   class="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-[#087830] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <i class="fa fa-trophy text-[9px] text-amber-300"></i> Leading
              </div>

              <div class="flex items-center gap-3 mb-3">
                <img :src="getProfileImageUrl(candidate.student_candidate_profile_image)"
                     :alt="candidate.student_name"
                     class="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-sm"
                     @error="handleImageError($event, candidate.student_name)">
                
                <div class="min-w-0 flex-1">
                  <h4 class="font-bold text-slate-800 text-sm sm:text-base leading-tight truncate">
                    {{ candidate.student_name }}
                  </h4>
                  <div class="text-xs text-slate-500 font-medium mt-0.5 truncate">
                    {{ candidate.grade_and_section }}
                  </div>
                  <div class="mt-1">
                    <span :class="[
                      'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                      candidate.partylist?.toLowerCase().includes('sandigan') ? 'bg-amber-100 text-amber-800' :
                      candidate.partylist?.toLowerCase().includes('spark') ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    ]">
                      {{ candidate.partylist || 'Independent' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Vote Bar & Count -->
              <div class="space-y-1">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-extrabold text-slate-800 text-sm">
                    {{ candidate.votes }} <span class="text-xs text-slate-400 font-normal">votes</span>
                  </span>
                  <span class="font-bold text-[#087830] text-xs">
                    {{ getPercentage(candidate.votes, group.totalVotes) }}%
                  </span>
                </div>
                <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-emerald-500 to-[#087830] rounded-full transition-all duration-700"
                       :style="{ width: `${getPercentage(candidate.votes, group.totalVotes)}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Abstain Summary Bar if any -->
          <div v-if="group.abstainCount > 0" class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span class="italic"><i class="fa fa-info-circle text-slate-400 mr-1"></i> Voters who abstained for {{ group.position }}:</span>
            <span class="font-bold text-slate-700">{{ group.abstainCount }} ({{ getPercentage(group.abstainCount, group.totalVotes) }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const candidates = ref([]);
const stats = ref({
  total_voters: 0,
  total_voted: 0,
  grade_registered: {},
  grade_voted: {},
  abstains: {},
});

const loading = ref(false);
const refreshing = ref(false);
let autoRefreshTimer = null;

// Reset state
const showResetModal = ref(false);
const resetMode = ref('votes_only'); // 'votes_only' | 'all_data'
const clearEmails = ref(false);
const confirmText = ref('');
const resetting = ref(false);

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 4000);
};

const openResetModal = () => {
  resetMode.value = 'votes_only';
  clearEmails.value = false;
  confirmText.value = '';
  showResetModal.value = true;
};

const executeElectionReset = async () => {
  resetting.value = true;
  try {
    const res = await $fetch(`${endpoint}/api/beu-election/reset-election/`, {
      method: 'POST',
      body: {
        mode: resetMode.value,
        clear_emails: clearEmails.value,
      }
    });

    showToast(res.message || "Election reset executed successfully!");
    showResetModal.value = false;
    confirmText.value = '';
    fetchResults();
  } catch (err) {
    console.error(err);
    const msg = err.data?.error || "Failed to reset election.";
    showToast(msg, "error");
  } finally {
    resetting.value = false;
  }
};

const fetchResults = async (isManual = false) => {
  if (isManual) refreshing.value = true;
  else if (candidates.value.length === 0) loading.value = true;

  try {
    const [candRes, statsRes] = await Promise.all([
      $fetch(`${endpoint}/api/beu-election/candidates/summary/`),
      $fetch(`${endpoint}/api/beu-election/voters/results_stats/`)
    ]);

    candidates.value = candRes || [];
    stats.value = statsRes || {
      total_voters: 0,
      total_voted: 0,
      grade_registered: {},
      grade_voted: {},
      abstains: {},
    };
  } catch (err) {
    console.error("Error fetching BEU election results:", err);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

onMounted(() => {
  fetchResults();
  autoRefreshTimer = setInterval(() => {
    fetchResults();
  }, 20000);
});

onUnmounted(() => {
  if (autoRefreshTimer) clearInterval(autoRefreshTimer);
});

const turnoutPercentage = computed(() => {
  if (!stats.value.total_voters || stats.value.total_voters === 0) return "0.0";
  return (((stats.value.total_voted || 0) / stats.value.total_voters) * 100).toFixed(1);
});

const getGradePercentage = (voted, total) => {
  if (!total || total === 0) return "0.0";
  return ((voted / total) * 100).toFixed(1);
};

const getPercentage = (votes, total) => {
  if (!total || total === 0) return "0.0";
  return ((votes / total) * 100).toFixed(1);
};

const groupedCandidates = computed(() => {
  const map = {};

  candidates.value.forEach(c => {
    const pos = (c.title_position || 'Other Position').trim();
    if (!map[pos]) {
      map[pos] = [];
    }
    map[pos].push({
      ...c,
      votes: parseInt(c.number_of_votes || '0', 10)
    });
  });

  const result = [];
  for (const pos in map) {
    const sorted = map[pos].sort((a, b) => b.votes - a.votes);
    const candidateVotes = sorted.reduce((sum, c) => sum + c.votes, 0);
    const abstainCount = stats.value.abstains?.[pos] || 0;
    const totalVotes = candidateVotes + abstainCount;

    result.push({
      position: pos,
      candidates: sorted,
      totalVotes: totalVotes,
      abstainCount: abstainCount,
    });
  }

  return result;
});

const getProfileImageUrl = (img) => {
  if (!img) return "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${endpoint}${img}`;
};

const handleImageError = (event, name) => {
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'BEU Candidate')}&background=087830&color=fff&size=128`;
};
</script>
