<template>
  <div class="max-w-7xl mx-auto p-8 bg-transparent text-slate-800 min-h-screen font-sans">
    <header class="mb-8">
      <div>
        <h1 class="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Commission on Election</h1>
        <p class="text-lg text-slate-500">Manage University Student Government Elections</p>
      </div>
      <div class="flex gap-4 mt-8 border-b-2 border-slate-200 pb-4 overflow-x-auto">
        <button v-for="tab in tabs" :key="tab.id" 
                :class="[
                  'px-6 py-3 text-base font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap',
                  activeTab === tab.id ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 bg-transparent'
                ]"
                @click="activeTab = tab.id">
          <span>{{ tab.icon }}</span>
          {{ tab.name }}
        </button>
      </div>
    </header>

    <main class="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 min-h-[500px]">
      <AddCandidates v-if="activeTab === 'candidates'" />
      <ListEnrolledStudents v-if="activeTab === 'voters'" />
      <StudentElectionResults v-if="activeTab === 'results'" />
      <StudentElectionVoting v-if="activeTab === 'voting'" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AddCandidates from './AddCandidates.vue';
import ListEnrolledStudents from './ListEnrolledStudents.vue';
import StudentElectionResults from './StudentElectionResults.vue';
import StudentElectionVoting from './StudentElectionVoting.vue';

const tabs = [
  { id: 'candidates', name: 'Add Candidates', icon: '👤' },
  { id: 'voters', name: 'Registered Students', icon: '👥' },
  { id: 'results', name: 'Election Results', icon: '📊' },
  { id: 'voting', name: 'Student Voting', icon: '🗳️' }
];

const activeTab = ref('candidates');

// Optional: listen to the success event from the voting component to auto-switch tabs
const handleVoteSuccess = () => {
  activeTab.value = 'results';
};

onMounted(() => {
  window.addEventListener('vote-cast-success', handleVoteSuccess);
});

onUnmounted(() => {
  window.removeEventListener('vote-cast-success', handleVoteSuccess);
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
