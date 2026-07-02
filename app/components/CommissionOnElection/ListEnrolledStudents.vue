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

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-2">Delete {{ selectedIds.length }} voter{{ selectedIds.length > 1 ? 's' : '' }}?</h3>
        <p class="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" :disabled="deleting"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button @click="deleteSelectedVoters" :disabled="deleting"
                  class="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Voter Confirmation Modal -->
    <div v-if="showResetConfirm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <i class="fa fa-rotate-left text-lg"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Reset Voter?</h3>
        </div>
        <p class="text-sm text-slate-600 mb-2">This will reset <span class="font-semibold text-slate-800">{{ resetTargetName }}</span>'s voting state:</p>
        <ul class="text-sm text-slate-500 mb-6 space-y-1 list-disc list-inside">
          <li>Set <strong>Has Voted</strong> → <span class="text-amber-600 font-semibold">No</span></li>
          <li>Remove <strong>LSU Email</strong></li>
          <li>Clear <strong>Voted Candidates</strong></li>
        </ul>
        <div class="flex justify-end gap-3">
          <button @click="showResetConfirm = false" :disabled="resetLoading"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button @click="confirmResetVoter" :disabled="resetLoading"
                  class="px-4 py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="resetLoading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ resetLoading ? 'Resetting...' : 'Yes, Reset' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Voter Modal -->
    <div v-if="showEditVoter" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-[#2E7D32] text-white py-3 px-6 flex items-center justify-between sticky top-0">
          <h3 class="text-sm font-bold uppercase tracking-wider">Edit Voter</h3>
          <button @click="closeEditVoter" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div class="p-8">
          <form @submit.prevent="submitEditVoter">
            <div class="flex flex-col gap-6 mb-6">
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Student Full Name <span class="text-red-500">*</span></label>
                <input v-model="editForm.student_name" type="text" required
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU Email <span class="text-red-500">*</span></label>
                <input v-model="editForm.lsu_email" type="email" required
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU ID Number <span class="text-red-500">*</span></label>
                <input v-model="editForm.lsu_id_number" type="text" required
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">College <span class="text-red-500">*</span></label>
                <input v-model="editForm.college" type="text" required
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Program <span class="text-red-500">*</span></label>
                <input v-model="editForm.program" type="text" required
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg">
              </div>
              <div class="relative flex items-center gap-3">
                <input v-model="editForm.has_voted" type="checkbox" id="editHasVoted"
                       class="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">
                <label for="editHasVoted" class="text-sm font-semibold text-slate-800 cursor-pointer">Has voted</label>
              </div>
            </div>

            <!-- Reset for Testing section -->
            <div class="border-t border-slate-100 pt-5 mb-6">
              <p class="text-xs text-slate-400 uppercase tracking-wide font-bold mb-3">Testing Tools</p>
              <button type="button" @click="openResetConfirm" :disabled="editLoading || resetLoading"
                      class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fa fa-rotate-left"></i>
                Reset Voter (Clear Vote, Email & Candidates)
              </button>
            </div>

            <div class="flex justify-end gap-3">
              <button type="button" @click="closeEditVoter" :disabled="editLoading"
                      class="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" :disabled="editLoading"
                      class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-2.5 rounded-lg font-bold transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed">
                {{ editLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

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
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Commission on Election</h1>
        <p class="text-lg text-slate-500">Manage Registered Student Voters and Upload CSV</p>
      </div>
    </header>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h2 class="text-2xl font-bold text-slate-900">Registered Voters</h2>
      <div class="flex items-center gap-4">
        <button @click="downloadTemplate" class="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 shrink-0">
          <i class="fa fa-file-alt"></i> Download Template
        </button>
        <input type="file" id="csvUpload" accept=".csv" @change="handleFileUpload" class="hidden">
        <label for="csvUpload" class="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 shrink-0">
          <i class="fa fa-upload"></i> Select CSV
        </label>
        <button v-if="csvFile" @click="uploadVoters" :disabled="loading"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shrink-0">
          {{ loading ? 'Uploading...' : 'Confirm Upload' }}
        </button>
      </div>
    </div>
    <p v-if="csvFile" class="text-sm text-green-600 font-semibold mb-6 -mt-4">Selected: {{ csvFile.name }}</p>

    <!-- Search Filter -->
    <div class="mb-4">
      <div class="relative max-w-md">
        <span class="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
          <i class="fa fa-search text-sm"></i>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, ID, email, program or college…"
          class="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-200 bg-white text-slate-800 placeholder-slate-400 transition-colors"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
          <i class="fa fa-times text-sm"></i>
        </button>
      </div>
      <p v-if="searchQuery && !votersLoading" class="text-xs text-slate-500 mt-1.5 ml-1">
        Showing {{ filteredVoters.length }} of {{ voters.length }} voters
      </p>
    </div>

    <!-- Bulk actions bar -->
    <div v-if="!votersLoading && filteredVoters.length" class="flex flex-wrap items-center justify-between gap-4 mb-4">
      <label class="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer select-none">
        <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
               class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">
        Select All
      </label>
      <button v-if="selectedIds.length" @click="showDeleteConfirm = true" :disabled="deleting"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shrink-0">
        <i class="fa fa-trash"></i> Delete Selected ({{ selectedIds.length }})
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="votersLoading" class="flex items-center justify-center gap-3 py-16 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      <svg class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span class="font-medium">Loading registered voters...</span>
    </div>

    <div v-else-if="filteredVoters.length" class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr>
            <th class="bg-slate-50 px-6 py-4 border-b border-slate-200 w-12">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                     class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">
            </th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Student</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">ID Number</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Program</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Email Ready</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filteredVoters" :key="v.id"
              :class="['hover:bg-slate-50 transition-colors', selectedIds.includes(v.id) ? 'bg-green-50/60' : '']">
            <td class="px-6 py-4 border-b border-slate-200">
              <input type="checkbox" :checked="selectedIds.includes(v.id)" @change="toggleSelect(v.id)"
                     class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">
            </td>
            <td class="px-6 py-4 border-b border-slate-200">
              <div>
                <div class="font-semibold text-slate-900">{{ v.student_name }}</div>
                <div class="text-sm text-slate-500">{{ v.lsu_email }}</div>
              </div>
            </td>
            <td class="px-6 py-4 border-b border-slate-200 text-slate-700">{{ v.lsu_id_number }}</td>
            <td class="px-6 py-4 border-b border-slate-200 text-slate-700">{{ v.program }}</td>
            <td class="px-6 py-4 border-b border-slate-200">
              <span :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                isVoted(v) ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
              ]">
                {{ isVoted(v) ? 'Voted' : 'Pending' }}
              </span>
            </td>
            <td class="px-6 py-4 border-b border-slate-200">
              <span :class="[
                'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                isEmailReady(v) ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
              ]" :title="isEmailReady(v) ? 'Has email on file and has voted' : 'Missing email and/or not yet voted'">
                {{ isEmailReady(v) ? 'Ready' : 'Not Ready' }}
              </span>
            </td>
            <td class="px-6 py-4 border-b border-slate-200 text-right">
              <button @click="openEditVoter(v)" class="text-slate-400 hover:text-green-600 transition-colors" title="Edit voter">
                <i class="fa fa-pen"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No results state (search returned nothing) -->
    <div v-else-if="!votersLoading && voters.length && searchQuery" class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      <div class="text-3xl mb-3">🔍</div>
      <p class="font-semibold text-slate-700">No results for "{{ searchQuery }}"</p>
      <p class="text-sm mt-1">Try a different name, ID number, or program.</p>
      <button @click="searchQuery = ''" class="mt-4 text-green-600 hover:text-green-700 text-sm font-semibold underline">Clear search</button>
    </div>

    <div v-else-if="!votersLoading" class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      No registered voters yet. Please upload a CSV.
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const config = useRuntimeConfig();
const API_BASE = `${config.public.apiUrl}/api/usg`; 

const loading = ref(false);
const voters = ref([]);
const csvFile = ref(null);

// Tracks whether the initial voters fetch is still in flight, so the table
// area can show a loading indicator instead of briefly flashing the
// "No registered voters yet" empty state before data arrives.
const votersLoading = ref(true);

// Search filter query
const searchQuery = ref('');

const toast = ref({ show: false, type: '', message: '' });
const showToast = (message, type = 'error') => {
  toast.value = { show: true, type, message };
  setTimeout(() => { toast.value.show = false; }, 5000);
};

// Normalizes the "has_voted" value coming back from the API/DB into a real
// boolean. Newly-imported voters can come through as an actual boolean
// (true/false), but depending on how the CSV importer / serializer writes
// the field it can also arrive as a string ("True"/"False", "1"/"0") or a
// number (1/0). A plain `v.has_voted ? ... : ...` check treats any non-empty
// string — including the string "False" — as truthy, which is why a brand
// new voter with has_voted = No in the DB was showing up as "Voted" in the
// table. This always reflects the actual DB value regardless of the type
// it's serialized as.
const isVoted = (v) => {
  const val = v.has_voted;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    return ['true', '1', 'yes'].includes(val.trim().toLowerCase());
  }
  return false;
};

// A voter is "email ready" when they both have a valid, non-empty email on
// file AND have already voted — i.e. they're ready for a post-vote
// confirmation email to be sent to them.
const isEmailReady = (v) => {
  const hasEmail = typeof v.lsu_email === 'string' && v.lsu_email.trim().length > 0;
  return hasEmail && isVoted(v);
};

// Filtered voters based on the search query (name, ID, email, program, college)
const filteredVoters = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return voters.value;
  return voters.value.filter(v =>
    (v.student_name || '').toLowerCase().includes(q) ||
    (v.lsu_id_number || '').toLowerCase().includes(q) ||
    (v.lsu_email || '').toLowerCase().includes(q) ||
    (v.program || '').toLowerCase().includes(q) ||
    (v.college || '').toLowerCase().includes(q)
  );
});

const handleFileUpload = (e) => {
  csvFile.value = e.target.files[0];
};

const downloadTemplate = () => {
  const headers = 'student_name,lsu_email,lsu_id_number,college,program\n';
  const example = 'Juan Dela Cruz,juan@lsu.edu.ph,2021-0001,CCSEA,Bachelor of Science in Information Technology\n';
  const blob = new Blob([headers + example], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'voters_template.csv');
  a.click();
  window.URL.revokeObjectURL(url);
};

const fetchVoters = async () => {
  try {
    const res = await fetch(`${API_BASE}/voters/`);
    if (res.ok) {
      voters.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching voters:', err);
  } finally {
    votersLoading.value = false;
  }
};

const uploadVoters = async () => {
  if (!csvFile.value) return;
  loading.value = true;
  const formData = new FormData();
  formData.append('file', csvFile.value);

  try {
    const res = await fetch(`${API_BASE}/voters-upload/`, {
      method: 'POST',
      body: formData
    });
    if (res.ok) {
      showToast('Voters uploaded successfully!', 'success');
      csvFile.value = null;
      await fetchVoters();
    } else {
      const errorData = await res.json();
      showToast(`Upload failed: ${errorData.error}`, 'error');
    }
  } catch (err) {
    showToast('Error uploading file.', 'error');
  } finally {
    loading.value = false;
  }
};

// --- Multi-select delete ---------------------------------------------------

const selectedIds = ref([]);
const showDeleteConfirm = ref(false);
const deleting = ref(false);

const isAllSelected = computed(() =>
  filteredVoters.value.length > 0 && selectedIds.value.length === filteredVoters.value.length &&
  filteredVoters.value.every(v => selectedIds.value.includes(v.id))
);

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) {
    selectedIds.value.push(id);
  } else {
    selectedIds.value.splice(idx, 1);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    // Deselect only those in the current filtered view
    const filteredIds = new Set(filteredVoters.value.map(v => v.id));
    selectedIds.value = selectedIds.value.filter(id => !filteredIds.has(id));
  } else {
    // Add all filtered ids that aren't already selected
    const currentSet = new Set(selectedIds.value);
    filteredVoters.value.forEach(v => currentSet.add(v.id));
    selectedIds.value = [...currentSet];
  }
};

// Prunes any selected ids that no longer exist in the current voter list
// (e.g. after a refetch), so stale ids can't linger in the selection.
const pruneSelection = () => {
  const validIds = new Set(voters.value.map(v => v.id));
  selectedIds.value = selectedIds.value.filter(id => validIds.has(id));
};

const deleteSelectedVoters = async () => {
  if (!selectedIds.value.length) return;
  deleting.value = true;

  const idsToDelete = [...selectedIds.value];

  try {
    const results = await Promise.allSettled(
      idsToDelete.map(id =>
        fetch(`${API_BASE}/voters/${id}/`, { method: 'DELETE' }).then(res => {
          if (!res.ok) throw new Error(`Failed to delete voter ${id}`);
          return id;
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;

    await fetchVoters();
    pruneSelection();

    showDeleteConfirm.value = false;

    if (failed === 0) {
      showToast(`${succeeded} voter${succeeded > 1 ? 's' : ''} deleted successfully!`, 'success');
    } else if (succeeded === 0) {
      showToast(`Failed to delete ${failed} voter${failed > 1 ? 's' : ''}.`, 'error');
    } else {
      showToast(`Deleted ${succeeded}, but ${failed} failed. Please try again.`, 'error');
    }
  } catch (err) {
    console.error('Error deleting voters:', err);
    showToast('Failed to delete selected voters.', 'error');
  } finally {
    deleting.value = false;
  }
};

// --- Edit voter --------------------------------------------------------

const showEditVoter = ref(false);
const editLoading = ref(false);
const editingVoterId = ref(null);
const editForm = ref({
  student_name: '',
  lsu_email: '',
  lsu_id_number: '',
  college: '',
  program: '',
  has_voted: false
});

const openEditVoter = (v) => {
  editingVoterId.value = v.id;
  editForm.value = {
    student_name: v.student_name || '',
    lsu_email: v.lsu_email || '',
    lsu_id_number: v.lsu_id_number || '',
    college: v.college || '',
    program: v.program || '',
    has_voted: isVoted(v)
  };
  showEditVoter.value = true;
};

const closeEditVoter = () => {
  showEditVoter.value = false;
  editingVoterId.value = null;
};

const submitEditVoter = async () => {
  if (!editingVoterId.value) return;
  editLoading.value = true;

  try {
    const res = await fetch(`${API_BASE}/voters/${editingVoterId.value}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    });

    if (res.ok) {
      await fetchVoters();
      showToast('Voter updated successfully!', 'success');
      closeEditVoter();
    } else {
      const errorText = await res.text();
      console.error('Failed to update voter response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = Object.entries(errorJson)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        showToast(errorMsg || 'Failed to update voter.', 'error');
      } catch {
        showToast(errorText || 'Failed to update voter.', 'error');
      }
    }
  } catch (err) {
    console.error('Error updating voter:', err);
    showToast('Failed to update voter.', 'error');
  } finally {
    editLoading.value = false;
  }
};

// --- Reset voter (for testing) ------------------------------------------

const showResetConfirm = ref(false);
const resetLoading = ref(false);
const resetTargetId = ref(null);
const resetTargetName = ref('');

const openResetConfirm = () => {
  // Uses the currently-open edit modal's voter
  resetTargetId.value = editingVoterId.value;
  resetTargetName.value = editForm.value.student_name || 'this voter';
  showResetConfirm.value = true;
};

const confirmResetVoter = async () => {
  if (!resetTargetId.value) return;
  resetLoading.value = true;

  try {
    const res = await fetch(`${API_BASE}/voters/${resetTargetId.value}/reset/`, {
      method: 'POST',
    });

    if (res.ok) {
      await fetchVoters();
      showToast(`${resetTargetName.value} has been reset successfully.`, 'success');
      showResetConfirm.value = false;
      // Update the edit form to reflect the reset state
      const voter = voters.value.find(v => v.id === resetTargetId.value);
      if (voter) {
        editForm.value = {
          student_name: voter.student_name || '',
          lsu_email: voter.lsu_email || '',
          lsu_id_number: voter.lsu_id_number || '',
          college: voter.college || '',
          program: voter.program || '',
          has_voted: isVoted(voter)
        };
      }
    } else {
      const errorData = await res.json().catch(() => ({}));
      showToast(errorData.error || 'Failed to reset voter.', 'error');
    }
  } catch (err) {
    console.error('Error resetting voter:', err);
    showToast('Failed to reset voter.', 'error');
  } finally {
    resetLoading.value = false;
  }
};

onMounted(() => {
  fetchVoters();
});
</script>