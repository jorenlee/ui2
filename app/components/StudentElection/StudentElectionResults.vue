<template>
  <section class="animate-[fadeIn_0.4s_ease-out]">
    <header class="mb-10 pb-8 border-b-2 border-slate-100">
      <div class="flex flex-col items-center justify-center w-full mb-8 gap-6">
        <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-corporate-logo-green.png" alt="LSU Logo" class="h-20 sm:h-24 object-contain drop-shadow-sm" />
        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOA.jpg" alt="COA" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOE.jpg" alt="COE" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCSO.png" alt="CSO" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-contain bg-white shadow-md border-2 border-white p-1" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUSAC.jpg" alt="SAC" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSG.jpg" alt="USG" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSGJA.jpg" alt="USGJA" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md border-2 border-white" />
        </div>
      </div>
      <div class="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-center sm:text-left">
        <div class="w-full sm:w-auto text-center sm:text-left">
          <h1 class="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Commission on Election</h1>
          <p class="text-lg text-slate-500">Live Real-time Student Election Results</p>
        </div>
        <button class="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-lg font-semibold transition-colors shrink-0" @click="fetchCandidates">
          Refresh Results
        </button>
      </div>
    </header>

    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-slate-900">Current Standings</h2>
    </div>

    <div v-if="candidates.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="c in candidates" :key="c.id" class="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
        <div class="flex items-center gap-4">
          <div v-if="c.student_candidate_profile_image" class="w-14 h-14 rounded-full shrink-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
            <img :src="getProfileImageUrl(c.student_candidate_profile_image)" alt="Profile" class="w-full h-full object-cover" @error="handleImageError($event, c.student_name)" />
          </div>
          <div class="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-2xl shrink-0" v-else>
            {{ c.student_name.charAt(0) }}
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900 m-0">{{ c.student_name }}</h3>
            <span class="block text-sm text-slate-500 mt-1">{{ c.title_position }} ({{ c.category }})</span>
            <span class="block text-xs font-semibold text-slate-400 mt-0.5">{{ c.college }}<template v-if="c.program"> - {{ c.program }}</template></span>
          </div>
        </div>
        
        <div class="mt-6">
          <div class="flex justify-between items-baseline mb-1">
            <span :class="[
              'text-4xl font-black tracking-tight',
              c.category && c.category.toLowerCase() === 'all colleges' ? 'text-green-600' : 'text-emerald-600'
            ]">
              {{ getCandidateVoteStats(c).percentString }}%
            </span>
            <span class="text-xs font-bold text-slate-400">
              {{ getCandidateVoteStats(c).votes }} {{ getCandidateVoteStats(c).votes === 1 ? 'vote' : 'votes' }}
            </span>
          </div>
          
          <!-- Progress Bar Level Indicator -->
          <div class="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden mb-2">
            <div :class="[
              'h-full rounded-full transition-all duration-500 ease-out',
              c.category && c.category.toLowerCase() === 'all colleges' ? 'bg-green-600' : 'bg-emerald-600'
            ]" :style="{ width: `${getCandidateVoteStats(c).percent}%` }"></div>
          </div>
          
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {{ getCandidateVoteStats(c).label }}
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <div class="text-5xl mb-4">📊</div>
      <h3 class="text-xl font-bold text-slate-700 mb-2">No Results Available</h3>
      <p class="text-slate-500">There are currently no candidates registered for the election.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const config = useRuntimeConfig();
const API_BASE = `${config.public.apiUrl || 'http://localhost:8000'}/api/usg`; 

const getProfileImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
  const base = (config.public.apiUrl || 'http://localhost:8000').replace(/\/$/, '');
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}${path}`;
};

const handleImageError = (e, candidateName) => {
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateName)}&background=dcfce7&color=166534`;
};

const candidates = ref([]);
const voterStats = ref({ total_voters: 0, colleges: {} });
let pollInterval = null;

const fetchCandidates = async () => {
  try {
    const res = await fetch(`${API_BASE}/candidates/`);
    if (res.ok) {
      candidates.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching candidates:', err);
  }
};

const fetchVoterStats = async () => {
  try {
    const res = await fetch(`${API_BASE}/voters/stats/`);
    if (res.ok) {
      voterStats.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching voter stats:', err);
  }
};

const getCandidateVoteStats = (c) => {
  const votes = c.number_of_votes || 0;
  let total = 0;
  let label = '';
  
  if (c.category && c.category.toLowerCase() === 'all colleges') {
    total = voterStats.value.total_voters || 0;
    label = `of ${total} total registered students`;
  } else {
    const collegeKey = (c.college || '').toUpperCase();
    total = voterStats.value.colleges[collegeKey] || 0;
    label = `of ${total} registered ${collegeKey} students`;
  }
  
  const percent = total > 0 ? (votes / total) * 100 : 0;
  const percentString = percent.toFixed(1);
  
  return {
    percent,
    percentString,
    votes,
    total,
    label
  };
};

const refreshData = async () => {
  await Promise.all([fetchCandidates(), fetchVoterStats()]);
};

onMounted(() => {
  refreshData();
  // Poll every 5 seconds for real-time updates
  pollInterval = setInterval(refreshData, 5000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>
