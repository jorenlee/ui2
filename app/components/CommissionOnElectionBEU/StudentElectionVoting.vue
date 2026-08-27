<template>
  <div class="animate-[fadeIn_0.4s_ease-out] relative max-w-5xl mx-auto">

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

    <!-- Official Ballot Receipt Modal -->
    <div v-if="showReceiptModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out] max-h-[90vh] flex flex-col mx-auto">
        <div class="bg-[#087830] px-6 py-5 text-center text-white shrink-0">
          <div class="text-4xl mb-1">🧾</div>
          <h3 class="text-lg font-extrabold uppercase tracking-wide">Official BEU Ballot Receipt</h3>
          <p class="text-xs opacity-80 mt-1">Your vote has been securely recorded</p>
        </div>

        <div class="p-6 overflow-y-auto" id="receiptContent">
          <div class="text-xs border-b border-dashed border-slate-300 pb-4 mb-4 space-y-1.5 font-medium">
            <div class="flex justify-between">
              <span class="text-slate-400">Voter:</span>
              <span class="font-bold text-slate-800">{{ currentVoter?.student_name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">LSU ID:</span>
              <span class="font-bold text-slate-800 font-mono">{{ currentVoter?.lsu_id_number }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Email:</span>
              <span class="font-bold text-slate-800 font-mono">{{ currentVoter?.lsu_email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Grade & Section:</span>
              <span class="font-bold text-slate-800">{{ currentVoter?.grade_and_section }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Date/Time:</span>
              <span class="font-bold text-slate-800">{{ receiptDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Receipt No:</span>
              <span class="font-bold text-[#087830] font-mono">{{ receiptCode }}</span>
            </div>
          </div>

          <!-- Email notification note -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mb-4 text-[11px] text-emerald-800 flex items-center gap-2">
            <i class="fa fa-envelope text-emerald-600"></i>
            <span>A copy of this receipt has been emailed to <strong>{{ currentVoter?.lsu_email }}</strong></span>
          </div>

          <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Vote Selections</h4>
          <div class="space-y-2 mb-4">
            <div v-for="item in receiptChoices" :key="item.position"
                 class="flex justify-between items-start text-xs py-1.5 border-b border-slate-100">
              <span class="text-slate-600 font-semibold pr-2">{{ item.position }}</span>
              <span :class="['font-bold text-right', item.isAbstain ? 'text-slate-400 italic' : 'text-[#087830]']">
                {{ item.candidateName }}
              </span>
            </div>
          </div>

          <div class="text-center text-[10px] text-slate-400 italic pt-2">
            La Salle University Basic Education Unit Student Election
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button @click="printReceipt"
                  class="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5">
            <i class="fa fa-print"></i>
            <span>Print Receipt</span>
          </button>
          <button @click="finishVoting"
                  class="flex-1 py-2.5 rounded-xl bg-[#087830] hover:bg-[#066327] text-white font-bold text-xs transition shadow-sm">
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Review Confirmation Modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
          <h3 class="text-base font-bold">Review Your Official Ballot</h3>
          <button @click="showConfirmModal = false" class="text-white/60 hover:text-white text-xl leading-none">&times;</button>
        </div>
        
        <div class="p-6 max-h-[65vh] overflow-y-auto">
          <p class="text-xs text-slate-500 mb-4">Please review your selections carefully before final submission. This cannot be undone.</p>
          
          <div class="space-y-3">
            <div v-for="group in filteredPositionGroups" :key="group.position"
                 class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-start text-xs gap-2">
              <span class="font-bold text-slate-700 uppercase tracking-wide shrink-0">{{ group.position }}</span>
              <span v-if="selectedVotes[group.position] === 'ABSTAIN'" class="text-slate-400 italic font-medium text-right">
                Abstained
              </span>
              <span v-else-if="isSenatorPosition(group.position) && Array.isArray(selectedVotes[group.position]) && selectedVotes[group.position].length"
                    class="font-extrabold text-[#087830] text-right">
                {{ selectedVotes[group.position].map(id => getCandidateNameById(id)).join(', ') }}
              </span>
              <span v-else-if="selectedVotes[group.position] && !isSenatorPosition(group.position)" class="font-extrabold text-[#087830] text-right">
                {{ getCandidateNameById(selectedVotes[group.position]) }}
              </span>
              <span v-else class="text-red-500 font-bold text-right">
                Not Selected
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button @click="showConfirmModal = false" :disabled="submittingVote"
                  class="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 text-xs sm:text-sm transition disabled:opacity-60">
            Back to Ballot
          </button>
          <button @click="submitFinalVote" :disabled="submittingVote"
                  class="px-6 py-2.5 rounded-xl font-bold text-white bg-[#087830] hover:bg-[#066327] text-xs sm:text-sm transition shadow-md disabled:opacity-70 flex items-center gap-2">
            <svg v-if="submittingVote" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ submittingVote ? 'Submitting Ballot...' : 'Confirm & Cast Vote' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Header Section -->
    <header class="mb-6 text-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
      <div class="flex justify-center mb-3">
        <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
             alt="LSU Logo" class="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-[#087830] tracking-tight">
        BEU Student Election Voting Portal
      </h1>
      <p class="text-xs sm:text-sm text-slate-500 font-medium mt-1">
        La Salle University Basic Education Unit
      </p>
    </header>

    <!-- STEP 1: Student Verification (University Email & LSU ID Number - Same as HEU) -->
    <div v-if="!currentVoter" class="flex justify-center px-4">
      <div class="w-full sm:w-4/5 md:w-1/2 lg:w-5/12 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
        <!-- Green Top Accent -->
        <div class="h-2 bg-[#087830]"></div>

        <div class="p-6 sm:p-8">
          <!-- Icon -->
          <div class="w-16 h-16 rounded-2xl bg-green-50 text-[#087830] flex items-center justify-center mx-auto mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm7 9v-1a5 5 0 00-5-5H10a5 5 0 00-5 5v1m13-9h1a2 2 0 002-2V6a2 2 0 00-2-2h-1" />
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-center text-slate-900">
            Voter Authentication
          </h2>

          <p class="text-center text-slate-500 mb-8 text-xs sm:text-sm">
            Verify your identity with your LSU Email and ID Number before accessing your ballot.
          </p>

          <form @submit.prevent="verifyStudent">
            <!-- Email -->
            <div class="mb-5">
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">University Email</label>
              <input v-model="emailInput" type="email" required placeholder="name@lsu.edu.ph"
                     class="w-full border-b-2 text-sm shadow-sm border-green-800 px-4 py-3 focus:border-[#087830] focus:ring-4 focus:ring-green-100 outline-none transition rounded-t-lg bg-slate-50/50" />
              <p class="text-[11px] text-slate-400 mt-1">Must be an active @lsu.edu.ph email address</p>
            </div>

            <!-- LSU ID -->
            <div class="mb-8">
              <label class="block text-xs font-bold text-slate-700 uppercase mb-1.5">LSU ID Number</label>
              <input v-model="voterIdInput" type="text" required placeholder="e.g. 221123265"
                     class="w-full border-b-2 text-sm shadow-sm border-green-800 px-4 py-3 focus:border-[#087830] focus:ring-4 focus:ring-green-100 outline-none transition rounded-t-lg bg-slate-50/50" />
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="verifying || !voterIdInput.trim() || !emailInput.trim()"
                    class="w-full rounded-xl bg-[#087830] hover:bg-[#066327] text-white py-3.5 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed uppercase shadow-md flex items-center justify-center gap-2">
              <svg v-if="verifying" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ verifying ? "Verifying Identity..." : "Access Ballot" }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- LOCK SCREEN (ALREADY VOTED - SAME AS HEU) -->
    <div v-else-if="currentVoter.has_voted === 'Yes' || currentVoter.has_voted === true" class="animate-[fadeIn_0.4s_ease-out]">
      <div class="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-10 text-center max-w-3xl mx-auto">
        <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fa fa-check text-4xl"></i>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          Thank You For Voting!
        </h2>
        <p class="text-sm sm:text-base text-slate-600 mb-2">
          Your official ballot has been recorded,
          <strong class="text-slate-900">{{ currentVoter.student_name }}</strong>.
        </p>
        <p class="text-xs text-slate-400 mb-8">
          A receipt was sent to <strong>{{ currentVoter.lsu_email }}</strong>
        </p>

        <div v-if="currentVoter.voted_candidates_details && currentVoter.voted_candidates_details.length" class="text-left mt-6">
          <h3 class="text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">
            Your Selected Candidates
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="(c, idx) in currentVoter.voted_candidates_details" :key="idx"
                 class="flex items-center gap-3 p-3 border border-slate-200 bg-slate-50 rounded-xl">
              <img :src="getProfileImageUrl(c.student_candidate_profile_image)"
                   :alt="c.student_name"
                   class="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-white"
                   @error="handleImageError($event, c.student_name)" />
              <div class="min-w-0 flex-1">
                <div class="font-bold text-slate-900 text-sm truncate">{{ c.student_name }}</div>
                <div class="text-xs text-slate-500 font-semibold truncate">{{ c.title_position }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-3">
          <button @click="openReceiptFromRecord" type="button"
                  class="bg-[#087830] hover:bg-[#066327] text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition inline-flex items-center gap-2 shadow-sm">
            🧾 View Official Ballot Receipt
          </button>
          <button @click="logoutVoter" type="button"
                  class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm transition inline-flex items-center gap-2">
            Back to Login
          </button>
        </div>
      </div>
    </div>

    <!-- STEP 2 & 3: Official Ballot Presentation -->
    <div v-else class="space-y-6">
      
      <!-- Voter Info Banner -->
      <div class="bg-emerald-900 text-white p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div class="text-[11px] uppercase tracking-widest text-emerald-300 font-bold">Authorized Voter &bull; Verified</div>
          <h2 class="text-xl font-extrabold">{{ currentVoter.student_name }}</h2>
          <div class="text-xs text-emerald-100 flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span><strong>ID:</strong> {{ currentVoter.lsu_id_number }}</span>
            <span><strong>Email:</strong> {{ currentVoter.lsu_email }}</span>
            <span><strong>Grade & Section:</strong> {{ currentVoter.grade_and_section }}</span>
          </div>
        </div>
        <button @click="logoutVoter"
                class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition border border-white/20">
          Cancel & Exit
        </button>
      </div>

      <!-- Voting Instructions -->
      <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 flex items-start gap-3">
        <i class="fa fa-info-circle text-base text-blue-600 mt-0.5"></i>
        <div>
          <strong>Instructions:</strong> Select one candidate for each position, or choose <em>Abstain</em> if you choose not to vote for that position. Once done, click <strong>Review & Submit Ballot</strong> at the bottom. Your ballot receipt will also be automatically emailed to <strong>{{ currentVoter.lsu_email }}</strong>.
        </div>
      </div>

      <!-- Position Ballot Cards -->
      <div v-for="group in filteredPositionGroups" :key="group.position"
           class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        <div class="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 class="text-base font-extrabold text-slate-800 uppercase tracking-wide">{{ group.position }}</h3>
            <p class="text-xs text-slate-500">
              <template v-if="isSenatorPosition(group.position)">
                Select up to {{ group.candidates.length }} candidates or Abstain
              </template>
              <template v-else>Select 1 candidate or Abstain</template>
            </p>
          </div>
          <span v-if="isPositionSelected(group.position)"
                class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <i class="fa fa-check text-[10px]"></i>
            <template v-if="isSenatorPosition(group.position) && Array.isArray(selectedVotes[group.position]) && selectedVotes[group.position].length > 0">
              {{ selectedVotes[group.position].length }} Selected
            </template>
            <template v-else>Selected</template>
          </span>
          <span v-else class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            Pending
          </span>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            
            <!-- Candidate Card -->
            <div v-for="c in group.candidates" :key="c.id"
                 @click="selectCandidate(group.position, c.id)"
                 :class="[
                   'cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col justify-between select-none relative',
                   isCandidateSelected(group.position, c.id)
                     ? 'border-[#087830] bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                     : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                 ]">
              
              <div class="flex items-start gap-3 mb-3">
                <img :src="getProfileImageUrl(c.student_candidate_profile_image)"
                     :alt="c.student_name"
                     class="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0 shadow-sm"
                     @error="handleImageError($event, c.student_name)">
                
                <div class="min-w-0 flex-1">
                  <h4 class="font-bold text-slate-800 text-sm leading-snug truncate">{{ c.student_name }}</h4>
                  <div class="text-xs text-slate-500 mt-0.5 truncate">{{ c.grade_and_section }}</div>
                  <div class="mt-1">
                    <span :class="[
                      'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                      c.partylist?.toLowerCase().includes('sandigan') ? 'bg-amber-100 text-amber-800' :
                      c.partylist?.toLowerCase().includes('spark') ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-700'
                    ]">
                      {{ c.partylist || 'Independent' }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span class="text-xs font-semibold" :class="isCandidateSelected(group.position, c.id) ? 'text-[#087830]' : 'text-slate-400'">
                  {{ isCandidateSelected(group.position, c.id) ? 'Selected' : 'Click to select' }}
                </span>
                <!-- Checkbox for senators, radio for others -->
                <div v-if="isSenatorPosition(group.position)" :class="[
                  'w-5 h-5 rounded border-2 flex items-center justify-center text-xs transition-colors',
                  isCandidateSelected(group.position, c.id) ? 'bg-[#087830] border-[#087830] text-white' : 'border-slate-300 bg-white'
                ]">
                  <i v-if="isCandidateSelected(group.position, c.id)" class="fa fa-check text-[10px]"></i>
                </div>
                <div v-else :class="[
                  'w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-colors',
                  isCandidateSelected(group.position, c.id) ? 'bg-[#087830] border-[#087830] text-white' : 'border-slate-300 bg-white'
                ]">
                  <i v-if="isCandidateSelected(group.position, c.id)" class="fa fa-check text-[10px]"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Abstain Option -->
          <div @click="selectAbstain(group.position)"
               :class="[
                 'cursor-pointer p-3 rounded-xl border-2 transition-all flex items-center justify-between select-none',
                 selectedVotes[group.position] === 'ABSTAIN'
                   ? 'border-slate-600 bg-slate-100 text-slate-900 shadow-sm'
                   : 'border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50'
               ]">
            <div class="flex items-center gap-2">
              <i class="fa fa-ban text-sm"></i>
              <span class="text-xs font-bold uppercase tracking-wide">Abstain from voting for {{ group.position }}</span>
            </div>
            <div :class="[
              'w-5 h-5 rounded-full border flex items-center justify-center text-xs',
              selectedVotes[group.position] === 'ABSTAIN' ? 'bg-slate-700 border-slate-700 text-white' : 'border-slate-300 bg-white'
            ]">
              <i v-if="selectedVotes[group.position] === 'ABSTAIN'" class="fa fa-check text-[10px]"></i>
            </div>
          </div>

          <!-- Senator checkbox hint -->
          <p v-if="isSenatorPosition(group.position) && selectedVotes[group.position] !== 'ABSTAIN'"
             class="text-[11px] text-blue-600 mt-2 flex items-center gap-1">
            <i class="fa fa-info-circle"></i>
            You can select multiple candidates. Checked candidates are highlighted.
          </p>
        </div>
      </div>

      <!-- Submit Action Bar -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-4">
        <div class="text-xs text-slate-500">
          Positions chosen: <strong class="text-slate-800">{{ chosenCount }} / {{ filteredPositionGroups.length }}</strong>
        </div>
        <button @click="openReviewModal" :disabled="chosenCount < filteredPositionGroups.length"
                class="w-full sm:w-auto px-8 py-3 bg-[#087830] hover:bg-[#066327] text-white rounded-xl font-extrabold text-sm transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span>Review & Submit Ballot</span>
          <i class="fa fa-arrow-right text-xs"></i>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const voterIdInput = ref('');
const emailInput = ref('');
const verifying = ref(false);
const currentVoter = ref(null);
const candidates = ref([]);
const selectedVotes = ref({}); // { [position]: candidateId | 'ABSTAIN' }

const showConfirmModal = ref(false);
const submittingVote = ref(false);

const showReceiptModal = ref(false);
const receiptCode = ref('');
const receiptDate = ref('');
const receiptChoices = ref([]);

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 4000);
};

const fetchCandidates = async () => {
  try {
    const res = await $fetch(`${endpoint}/api/beu-election/candidates/summary/`);
    candidates.value = res || [];
  } catch (err) {
    console.error("Error fetching candidates:", err);
  }
};

onMounted(() => {
  fetchCandidates();
});

// Known strand keywords for BEU (add more as needed)
const STRAND_KEYWORDS = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'ARTS', 'ICT', 'HE'];

// Extract leading grade number from grade_and_section, e.g. "11- STEM HS - Br. X" → "11"
const getGradeLevel = (gradeAndSection) => {
  if (!gradeAndSection) return null;
  const match = gradeAndSection.toString().trim().match(/^(\d+)/);
  return match ? match[1] : null;
};

// Extract strand keyword from grade_and_section, e.g. "12- STEM MED Br. X" → "STEM"
const getStrand = (gradeAndSection) => {
  if (!gradeAndSection) return null;
  const upper = gradeAndSection.toString().toUpperCase();
  for (const strand of STRAND_KEYWORDS) {
    // Match as a whole word (bounded by non-alphanumeric)
    const regex = new RegExp(`(?<![A-Z])${strand}(?![A-Z])`);
    if (regex.test(upper)) return strand;
  }
  return null;
};

const voterGradeLevel = computed(() => getGradeLevel(currentVoter.value?.grade_and_section));
const voterStrand = computed(() => getStrand(currentVoter.value?.grade_and_section));

const positionGroups = computed(() => {
  const map = {};
  candidates.value.forEach(c => {
    const pos = (c.title_position || 'Other Position').trim();
    if (!map[pos]) map[pos] = [];
    map[pos].push(c);
  });

  const result = [];
  for (const pos in map) {
    result.push({
      position: pos,
      candidates: map[pos]
    });
  }
  return result;
});

// Filtered groups:
// - Senators: school-wide — no grade or strand filter
// - Governor (and other strand-specific positions): filter by BOTH grade level AND strand
const filteredPositionGroups = computed(() => {
  return positionGroups.value.map(group => {
    if (isSenatorPosition(group.position)) {
      // Senators are school-wide — no grade/strand filter
      return group;
    }
    const filtered = group.candidates.filter(c => {
      const candidateGrade = getGradeLevel(c.grade_and_section);
      const candidateStrand = getStrand(c.grade_and_section);

      // Grade must match voter's grade
      const gradeMatch = !voterGradeLevel.value || candidateGrade === voterGradeLevel.value;

      // If the voter has a detected strand AND the candidate also has a strand,
      // they must match (e.g. STEM voter only sees STEM Governor).
      // If either side has no detectable strand, fall back to grade-only filtering.
      const strandMatch =
        !voterStrand.value || !candidateStrand || candidateStrand === voterStrand.value;

      return gradeMatch && strandMatch;
    });
    return { ...group, candidates: filtered };
  }).filter(group => group.candidates.length > 0);
});

const chosenCount = computed(() => {
  let count = 0;
  filteredPositionGroups.value.forEach(g => {
    const sel = selectedVotes.value[g.position];
    if (isSenatorPosition(g.position)) {
      // For senators: count as chosen if ABSTAIN or at least 1 candidate selected
      if (sel === 'ABSTAIN' || (Array.isArray(sel) && sel.length > 0)) count++;
    } else {
      if (sel) count++;
    }
  });
  return count;
});

// Returns true if the position name contains 'senator' (case-insensitive)
const isSenatorPosition = (position) => {
  return position?.toLowerCase().includes('senator');
};

// Returns true if a candidate is selected for the given position
const isCandidateSelected = (position, candidateId) => {
  const sel = selectedVotes.value[position];
  if (isSenatorPosition(position)) {
    return Array.isArray(sel) && sel.includes(candidateId);
  }
  return sel === candidateId;
};

// Returns true if ANY selection has been made for the position
const isPositionSelected = (position) => {
  const sel = selectedVotes.value[position];
  if (isSenatorPosition(position)) {
    return sel === 'ABSTAIN' || (Array.isArray(sel) && sel.length > 0);
  }
  return !!sel;
};

const verifyStudent = async () => {
  if (!voterIdInput.value.trim() || !emailInput.value.trim()) return;

  const email = emailInput.value.trim().toLowerCase();
  if (!email.endsWith('@lsu.edu.ph')) {
    showToast("Please enter a valid @lsu.edu.ph email address", "error");
    return;
  }
// ---------------------------------------------------------------------------
// Normalize the voter object received from the API.
// The API stores votes as `voted_candidates` (a flat JSON array of objects).
// The template and receipt logic expect `voted_candidates_details` and
// `abstained_list` — so we derive them here.
// ---------------------------------------------------------------------------
const normalizeVoter = (voter) => {
  if (!voter) return voter;
  const raw = Array.isArray(voter.voted_candidates) ? voter.voted_candidates : [];

  // Real voted candidates (exclude ABSTAIN sentinels and TIMESTAMP entries)
  const details = raw.filter(
    v => v.lsu_id_number !== 'ABSTAIN' && v.student_name !== 'TIMESTAMP'
  );

  // Abstained positions
  const abstains = raw
    .filter(v => v.lsu_id_number === 'ABSTAIN')
    .map(v => ({ position: v.title_position }));

  // Extract voted_at from the embedded TIMESTAMP entry (if present)
  const timestampEntry = raw.find(v => v.student_name === 'TIMESTAMP');
  const voted_at = timestampEntry?.lsu_id_number || voter.voted_at || null;

  return {
    ...voter,
    voted_candidates_details: details,
    abstained_list: abstains,
    voted_at,
  };
};

  verifying.value = true;
  try {
    const res = await $fetch(`${endpoint}/api/beu-election/validate-voter/`, {
      method: 'POST',
      body: {
        lsu_id_number: voterIdInput.value.trim(),
        lsu_email: email,
      }
    });

    if (res.valid && res.voter) {
      currentVoter.value = normalizeVoter(res.voter);
      selectedVotes.value = {};
      showToast(`Welcome, ${res.voter.student_name}!`);
    }
  } catch (err) {
    console.error(err);
    if (err.data?.has_voted && err.data?.voter) {
      currentVoter.value = normalizeVoter(err.data.voter);
      showToast("You have already voted in this election.", "error");
    } else {
      const msg = err.data?.error || "Voter verification failed. Please check your LSU ID and Email.";
      showToast(msg, "error");
    }
  } finally {
    verifying.value = false;
  }
};

const openReceiptFromRecord = () => {
  if (!currentVoter.value) return;

  // Prefer pre-normalized details; fall back to parsing raw voted_candidates
  const details = currentVoter.value.voted_candidates_details
    ?? (Array.isArray(currentVoter.value.voted_candidates)
        ? currentVoter.value.voted_candidates.filter(
            v => v.lsu_id_number !== 'ABSTAIN' && v.student_name !== 'TIMESTAMP'
          )
        : []);
  const abstains = currentVoter.value.abstained_list
    ?? (Array.isArray(currentVoter.value.voted_candidates)
        ? currentVoter.value.voted_candidates
            .filter(v => v.lsu_id_number === 'ABSTAIN')
            .map(v => ({ position: v.title_position }))
        : []);

  const choices = [];
  details.forEach(d => {
    choices.push({
      position: d.title_position,
      candidateName: d.student_name,
      isAbstain: false
    });
  });
  abstains.forEach(a => {
    choices.push({
      position: a.position,
      candidateName: 'Abstained',
      isAbstain: true
    });
  });

  receiptCode.value = `LSU-BEU-${currentVoter.value.lsu_id_number}`;
  receiptDate.value = currentVoter.value.voted_at ? new Date(currentVoter.value.voted_at).toLocaleString() : 'Recorded';
  receiptChoices.value = choices;
  showReceiptModal.value = true;
};

const logoutVoter = () => {
  currentVoter.value = null;
  voterIdInput.value = '';
  emailInput.value = '';
  selectedVotes.value = {};
};

const selectCandidate = (position, candidateId) => {
  if (isSenatorPosition(position)) {
    // Toggle multi-select for senators
    const current = Array.isArray(selectedVotes.value[position]) ? selectedVotes.value[position] : [];
    const idx = current.indexOf(candidateId);
    if (idx === -1) {
      selectedVotes.value[position] = [...current, candidateId];
    } else {
      const updated = current.filter(id => id !== candidateId);
      // If nothing left, remove the key so it counts as unselected
      selectedVotes.value[position] = updated.length ? updated : undefined;
    }
  } else {
    selectedVotes.value[position] = candidateId;
  }
};

const selectAbstain = (position) => {
  selectedVotes.value[position] = 'ABSTAIN';
};

const getCandidateNameById = (id) => {
  const c = candidates.value.find(cand => cand.id === id);
  return c ? c.student_name : 'Unknown Candidate';
};

const openReviewModal = () => {
  showConfirmModal.value = true;
};

const submitFinalVote = async () => {
  submittingVote.value = true;
  try {
    const candidateIds = [];
    const abstainedPositions = [];
    const choices = [];

    for (const group of filteredPositionGroups.value) {
      const selection = selectedVotes.value[group.position];
      if (selection === 'ABSTAIN') {
        abstainedPositions.push(group.position);
        choices.push({
          position: group.position,
          candidateName: 'Abstained',
          isAbstain: true
        });
      } else if (isSenatorPosition(group.position) && Array.isArray(selection) && selection.length) {
        // Multi-select: push each senator ID separately
        selection.forEach(id => candidateIds.push(id));
        choices.push({
          position: group.position,
          candidateName: selection.map(id => getCandidateNameById(id)).join(', '),
          isAbstain: false
        });
      } else if (selection) {
        candidateIds.push(selection);
        choices.push({
          position: group.position,
          candidateName: getCandidateNameById(selection),
          isAbstain: false
        });
      }
    }

    const res = await $fetch(`${endpoint}/api/beu-election/cast-vote/`, {
      method: 'POST',
      body: {
        lsu_id_number: currentVoter.value.lsu_id_number,
        candidate_ids: candidateIds,
        abstained_positions: abstainedPositions
      }
    });

    receiptCode.value = res.receipt_code;
    receiptDate.value = new Date(res.voted_at || Date.now()).toLocaleString();
    receiptChoices.value = choices;

    showConfirmModal.value = false;
    showReceiptModal.value = true;
    showToast(res.message || "Your official vote has been recorded!");
  } catch (err) {
    console.error(err);
    const msg = err.data?.error || "Failed to submit vote";
    showToast(msg, "error");
  } finally {
    submittingVote.value = false;
  }
};

const printReceipt = () => {
  window.print();
};

const finishVoting = () => {
  showReceiptModal.value = false;
  logoutVoter();
};

const getProfileImageUrl = (img) => {
  const fallback = "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg";
  if (!img) return fallback;

  // Trim whitespace
  let cleaned = img.toString().trim();
  if (!cleaned) return fallback;

  // Strip S3 pre-signed query parameters (e.g. ?X-Amz-Algorithm=...&X-Amz-Signature=...)
  // Keep only the path up to and including the file extension (.png, .jpg, etc.)
  const qIndex = cleaned.indexOf('?');
  if (qIndex !== -1) cleaned = cleaned.substring(0, qIndex);

  // Already a full URL — return as-is (without query string)
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;

  // Relative path: ensure exactly one leading slash, then prepend API endpoint
  const relativePath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  // Collapse any accidental double-slashes in the path portion
  const safePath = relativePath.replace(/\/\/+/g, '/');
  // Remove trailing slash from endpoint to avoid double-slash at join point
  const baseUrl = (endpoint || '').toString().replace(/\/+$/, '');
  return `${baseUrl}${safePath}`;
};

const handleImageError = (event, name) => {
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'BEU Candidate')}&background=087830&color=fff&size=128`;
};
</script>
