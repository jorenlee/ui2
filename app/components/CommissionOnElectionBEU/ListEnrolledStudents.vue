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

    <!-- Bulk Reset Confirmation Modal -->
    <div v-if="showBulkResetConfirm" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <i class="fa fa-rotate-left text-lg"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Reset {{ selectedIds.length }} voter{{ selectedIds.length > 1 ? 's' : '' }}?</h3>
        </div>
        <p class="text-sm text-slate-600 mb-2">This will reset the voting state for all selected BEU voters:</p>
        <ul class="text-sm text-slate-500 mb-6 space-y-1 list-disc list-inside">
          <li>Set <strong>Has Voted</strong> &rarr; <span class="text-amber-600 font-semibold">No</span></li>
          <li>Clear recorded votes and restore candidate vote counts</li>
        </ul>
        <div class="flex justify-end gap-3">
          <button @click="showBulkResetConfirm = false" :disabled="bulkResetting"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button @click="resetSelectedVoters" :disabled="bulkResetting"
                  class="px-4 py-2 rounded-lg font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="bulkResetting" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ bulkResetting ? 'Resetting...' : 'Yes, Reset All' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Election Modal -->
    <div v-if="showResetElectionModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div class="bg-red-700 px-6 py-4 text-white flex justify-between items-center">
          <div class="flex items-center gap-2 font-bold text-base">
            <i class="fa fa-triangle-exclamation"></i>
            <span>Reset BEU Election</span>
          </div>
          <button @click="showResetElectionModal = false" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div class="p-6">
          <p class="text-xs text-slate-600 mb-5 leading-relaxed">
            Choose how you want to reset the election. This action cannot be undone.
          </p>

          <div class="space-y-3 mb-5">
            <!-- Mode 1: Votes Only -->
            <label :class="[
              'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              resetElectionMode === 'votes_only' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:border-slate-300'
            ]">
              <input type="radio" value="votes_only" v-model="resetElectionMode" class="mt-1 text-amber-600 focus:ring-amber-500">
              <div>
                <div class="font-bold text-slate-800 text-xs sm:text-sm">Reset Votes & Tallies Only (Recommended)</div>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Zeros out all candidate votes and resets all voters to "Not Voted". <strong>Preserves</strong> your enrolled voters and candidates list.
                </div>
              </div>
            </label>

            <!-- Mode 2: Purge All Data -->
            <label :class="[
              'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all',
              resetElectionMode === 'all_data' ? 'border-red-600 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'
            ]">
              <input type="radio" value="all_data" v-model="resetElectionMode" class="mt-1 text-red-600 focus:ring-red-500">
              <div>
                <div class="font-bold text-red-700 text-xs sm:text-sm">Start Fresh New Election (Purge All Data)</div>
                <div class="text-[11px] text-slate-500 mt-0.5">
                  Permanently deletes all candidates, all voters, and all vote history.
                </div>
              </div>
            </label>
          </div>

          <div v-if="resetElectionMode === 'votes_only'" class="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input type="checkbox" v-model="clearVoterEmails" class="rounded text-[#087830] focus:ring-green-500">
              <span>Also clear registered voter emails</span>
            </label>
          </div>

          <div class="mb-2">
            <label class="block text-xs font-bold text-slate-700 mb-1">
              Type <span class="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">RESET</span> to confirm:
            </label>
            <input v-model="resetElectionConfirmText" type="text" placeholder="RESET"
                   class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-red-600 tracking-wider focus:bg-white focus:border-red-600">
          </div>
        </div>

        <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button @click="showResetElectionModal = false" :disabled="isResettingElection"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 text-xs transition disabled:opacity-60">
            Cancel
          </button>
          <button @click="executeElectionReset" :disabled="isResettingElection || resetElectionConfirmText.trim().toUpperCase() !== 'RESET'"
                  class="px-5 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 text-xs transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="isResettingElection" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ isResettingElection ? 'Resetting Election...' : 'Execute Reset' }}
          </button>
        </div>
      </div>
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

    <!-- Add/Edit Voter Modal -->
    <div v-if="showVoterModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        <div class="bg-[#087830] text-white py-3 px-6 flex items-center justify-between">
          <h3 class="text-sm font-bold uppercase tracking-wider">{{ isEditing ? 'Edit BEU Voter' : 'Add BEU Voter' }}</h3>
          <button @click="showVoterModal = false" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div class="p-6">
          <form @submit.prevent="submitVoterForm">
            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Student Name <span class="text-red-500">*</span></label>
                <input v-model="voterForm.student_name" type="text" required placeholder="Dela Cruz, Juan M."
                       class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-green-700 focus:bg-white text-slate-900">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">LSU ID Number <span class="text-red-500">*</span></label>
                <input v-model="voterForm.lsu_id_number" type="text" required placeholder="e.g. 221123265"
                       class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-green-700 focus:bg-white text-slate-900">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">LSU Email</label>
                <input v-model="voterForm.lsu_email" type="email" placeholder="e.g. student@lsu.edu.ph"
                       class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-green-700 focus:bg-white text-slate-900">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Grade & Section <span class="text-red-500">*</span></label>
                <input v-model="voterForm.grade_and_section" type="text" required placeholder="e.g. 10- Br. Gerard Ronan FSC"
                       class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:border-green-700 focus:bg-white text-slate-900">
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="showVoterModal = false" :disabled="savingVoter"
                      class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60 text-sm">
                Cancel
              </button>
              <button type="submit" :disabled="savingVoter"
                      class="px-5 py-2 rounded-lg font-semibold text-white bg-[#087830] hover:bg-[#066327] transition-colors shadow-sm disabled:opacity-70 text-sm flex items-center gap-2">
                <svg v-if="savingVoter" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ savingVoter ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Voter') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bulk Upload CSV Modal -->
    <div v-if="showBulkUpload" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-900">Upload BEU Enrolled Voters</h3>
          <button @click="showBulkUpload = false" class="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        
        <p class="text-xs text-slate-500 mb-4">
          Required columns: <strong>student_name</strong>, <strong>lsu_id_number</strong>, <strong>grade_and_section</strong>.<br/>
          Optional column: <strong>lsu_email</strong> — you may include it as a <code class="bg-slate-100 px-1 rounded">-</code> placeholder now. Students will fill in their official <code class="bg-slate-100 px-1 rounded">@lsu.edu.ph</code> email when they access the voting ballot.
        </p>

        <div class="mb-4">
          <button @click="downloadCsvTemplate" type="button" class="text-xs text-[#087830] hover:underline font-semibold flex items-center gap-1">
            <i class="fa fa-download"></i> Download Voter CSV Template
          </button>
        </div>

        <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-green-600 transition-colors mb-6">
          <input type="file" accept=".csv" @change="handleCsvFile" id="beuVoterCsvUpload" class="hidden">
          <label for="beuVoterCsvUpload" class="cursor-pointer flex flex-col items-center gap-2">
            <i class="fa fa-file-csv text-3xl text-[#087830]"></i>
            <span class="text-sm font-semibold text-slate-700">{{ csvFile ? csvFile.name : 'Click to select CSV file' }}</span>
            <span class="text-xs text-slate-400">Supported format: .csv</span>
          </label>
        </div>

        <div class="flex justify-end gap-3">
          <button @click="showBulkUpload = false" :disabled="uploadingCsv"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button @click="uploadCsv" :disabled="uploadingCsv || !csvFile"
                  class="px-5 py-2 rounded-lg font-semibold text-white bg-[#087830] hover:bg-[#066327] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="uploadingCsv" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {{ uploadingCsv ? 'Uploading...' : 'Process Upload' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Header Panel -->
    <header class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-green-50 text-[#087830] flex items-center justify-center text-lg font-bold">
            <i class="fa fa-users"></i>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">BEU Enrolled Voters</h1>
            <p class="text-xs text-slate-500">Basic Education Unit Student Voter Masterlist</p>
          </div>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <button @click="openResetElectionModal"
                class="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 border border-red-200 shadow-sm">
          <i class="fa fa-power-off"></i>
          <span>Reset Election</span>
        </button>
        <button @click="downloadVoterListCsv"
                class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2">
          <i class="fa fa-download"></i>
          <span>Export CSV</span>
        </button>
        <button @click="showBulkUpload = true"
                class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center gap-2">
          <i class="fa fa-file-upload"></i>
          <span>Import CSV</span>
        </button>
        <button @click="openAddVoterModal"
                class="px-4 py-2 bg-[#087830] hover:bg-[#066327] text-white rounded-xl font-semibold text-xs sm:text-sm transition shadow-sm flex items-center gap-2">
          <i class="fa fa-plus"></i>
          <span>Add Voter</span>
        </button>
      </div>
    </header>

    <!-- Stats Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
          <i class="fa fa-user-friends"></i>
        </div>
        <div>
          <div class="text-2xl font-extrabold text-slate-800">{{ voters.length }}</div>
          <div class="text-xs text-slate-400 font-semibold uppercase">Total Registered Voters</div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-[#087830] flex items-center justify-center text-xl font-bold">
          <i class="fa fa-check-circle"></i>
        </div>
        <div>
          <div class="text-2xl font-extrabold text-[#087830]">{{ totalVotedCount }}</div>
          <div class="text-xs text-slate-400 font-semibold uppercase">Votes Cast</div>
        </div>
      </div>
      <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
          <i class="fa fa-chart-pie"></i>
        </div>
        <div>
          <div class="text-2xl font-extrabold text-purple-700">{{ turnoutPercentage }}%</div>
          <div class="text-xs text-slate-400 font-semibold uppercase">BEU Voter Turnout</div>
        </div>
      </div>
    </div>

    <!-- Filters & Action Toolbar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="w-full md:w-80 relative">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input v-model="searchQuery" type="text" placeholder="Search student name, ID, grade..."
               class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-green-600 text-slate-800 transition">
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <select v-model="selectedGradeFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white cursor-pointer">
          <option value="">All Grades & Sections</option>
          <option v-for="g in distinctGrades" :key="g" :value="g">{{ g }}</option>
        </select>

        <select v-model="selectedStatusFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white cursor-pointer">
          <option value="">All Status</option>
          <option value="Yes">Voted</option>
          <option value="No">Not Voted</option>
        </select>

        <!-- Bulk Action Buttons -->
        <template v-if="selectedIds.length > 0">
          <button @click="showBulkResetConfirm = true"
                  class="px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 border border-amber-200">
            <i class="fa fa-rotate-left"></i>
            <span>Reset ({{ selectedIds.length }})</span>
          </button>
          <button @click="showDeleteConfirm = true"
                  class="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5 border border-red-200">
            <i class="fa fa-trash"></i>
            <span>Delete ({{ selectedIds.length }})</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Voters Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-12 text-center text-slate-400">
        <div class="inline-block animate-spin text-3xl mb-3 text-[#087830]">
          <i class="fa fa-spinner"></i>
        </div>
        <p class="text-sm font-medium">Loading BEU voter masterlist...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredVoters.length === 0" class="p-12 text-center text-slate-400">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl text-slate-400">
          <i class="fa fa-user-slash"></i>
        </div>
        <h4 class="font-bold text-slate-700 text-base mb-1">No BEU Voters Found</h4>
        <p class="text-xs text-slate-400">Try adjusting your filters or import a voter CSV list.</p>
      </div>

      <!-- Table content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-10">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                       class="rounded border-slate-300 text-[#087830] focus:ring-green-500">
              </th>
              <th class="py-3.5 px-4">Student Name</th>
              <th class="py-3.5 px-4">LSU ID Number</th>
              <th class="py-3.5 px-4">Email</th>
              <th class="py-3.5 px-4">Grade & Section</th>
              <th class="py-3.5 px-4 text-center">Has Voted</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="v in paginatedVoters" :key="v.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3 px-4">
                <input type="checkbox" :value="v.id" v-model="selectedIds"
                       class="rounded border-slate-300 text-[#087830] focus:ring-green-500">
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-800">{{ v.student_name }}</div>
              </td>
              <td class="py-3 px-4">
                <span class="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {{ v.lsu_id_number }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span v-if="v.lsu_email" class="text-xs text-slate-700 font-mono">{{ v.lsu_email }}</span>
                <span v-else class="inline-block text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded italic">Not yet registered</span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {{ v.grade_and_section }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span v-if="isVoted(v.has_voted)" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <i class="fa fa-check text-[10px]"></i> Yes
                </span>
                <span v-else class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                  No
                </span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="isVoted(v.has_voted)" @click="resetSingleVoter(v)" title="Reset Voting State"
                          class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition">
                    <i class="fa fa-rotate-left text-xs"></i>
                  </button>
                  <button @click="openEditModal(v)" title="Edit"
                          class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition">
                    <i class="fa fa-pencil text-xs"></i>
                  </button>
                  <button @click="openSingleDelete(v.id)" title="Delete"
                          class="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition">
                    <i class="fa fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredVoters.length > 0" class="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
        <div class="text-xs text-slate-500 font-medium">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredVoters.length) }} of {{ filteredVoters.length }} voters
        </div>
        <div class="flex items-center gap-1.5">
          <button @click="currentPage--" :disabled="currentPage === 1"
                  class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-40">
            Previous
          </button>
          <span class="px-3 py-1 text-xs font-bold text-[#087830]">Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="currentPage++" :disabled="currentPage >= totalPages"
                  class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const voters = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedGradeFilter = ref('');
const selectedStatusFilter = ref('');
const selectedIds = ref([]);

const currentPage = ref(1);
const pageSize = ref(20);

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 4000);
};

// Add/Edit Modal
const showVoterModal = ref(false);
const isEditing = ref(false);
const savingVoter = ref(false);
const voterForm = ref({
  id: null,
  student_name: '',
  lsu_id_number: '',
  lsu_email: '',
  grade_and_section: '',
});

// Bulk reset
const showBulkResetConfirm = ref(false);
const bulkResetting = ref(false);

// Delete
const showDeleteConfirm = ref(false);
const deleting = ref(false);

// Bulk upload
const showBulkUpload = ref(false);
const uploadingCsv = ref(false);
const csvFile = ref(null);

// Reset Election State
const showResetElectionModal = ref(false);
const resetElectionMode = ref('votes_only');
const clearVoterEmails = ref(false);
const resetElectionConfirmText = ref('');
const isResettingElection = ref(false);

const openResetElectionModal = () => {
  resetElectionMode.value = 'votes_only';
  clearVoterEmails.value = false;
  resetElectionConfirmText.value = '';
  showResetElectionModal.value = true;
};

const executeElectionReset = async () => {
  isResettingElection.value = true;
  try {
    const res = await $fetch(`${endpoint}/api/beu-election/reset-election/`, {
      method: 'POST',
      body: {
        mode: resetElectionMode.value,
        clear_emails: clearVoterEmails.value,
      }
    });

    showToast(res.message || "Election reset executed successfully!");
    showResetElectionModal.value = false;
    resetElectionConfirmText.value = '';
    fetchVoters();
  } catch (err) {
    console.error(err);
    const msg = err.data?.error || "Failed to reset election.";
    showToast(msg, "error");
  } finally {
    isResettingElection.value = false;
  }
};

const fetchVoters = async () => {
  loading.value = true;
  try {
    const res = await $fetch(`${endpoint}/api/beu-election/voters/`);
    voters.value = res || [];
  } catch (err) {
    console.error("Error fetching BEU voters:", err);
    showToast("Failed to fetch BEU voters", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchVoters();
});

const isVoted = (hasVoted) => {
  return hasVoted === "Yes" || hasVoted === true || hasVoted === "True" || hasVoted === 1 || hasVoted === "1";
};

const totalVotedCount = computed(() => {
  return voters.value.filter(v => isVoted(v.has_voted)).length;
});

const turnoutPercentage = computed(() => {
  if (voters.value.length === 0) return "0.0";
  return ((totalVotedCount.value / voters.value.length) * 100).toFixed(1);
});

const distinctGrades = computed(() => {
  const set = new Set();
  voters.value.forEach(v => {
    if (v.grade_and_section) set.add(v.grade_and_section.trim());
  });
  return Array.from(set).sort();
});

const filteredVoters = computed(() => {
  return voters.value.filter(v => {
    const q = searchQuery.value.toLowerCase();
    const matchesSearch = !q ||
      (v.student_name && v.student_name.toLowerCase().includes(q)) ||
      (v.lsu_id_number && v.lsu_id_number.toLowerCase().includes(q)) ||
      (v.grade_and_section && v.grade_and_section.toLowerCase().includes(q)) ||
      (v.lsu_email && v.lsu_email.toLowerCase().includes(q));

    const matchesGrade = !selectedGradeFilter.value || v.grade_and_section === selectedGradeFilter.value;
    
    let matchesStatus = true;
    if (selectedStatusFilter.value === "Yes") {
      matchesStatus = isVoted(v.has_voted);
    } else if (selectedStatusFilter.value === "No") {
      matchesStatus = !isVoted(v.has_voted);
    }

    return matchesSearch && matchesGrade && matchesStatus;
  });
});

const totalPages = computed(() => Math.ceil(filteredVoters.value.length / pageSize.value) || 1);

const paginatedVoters = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredVoters.value.slice(start, start + pageSize.value);
});

const isAllSelected = computed(() => {
  return filteredVoters.value.length > 0 && selectedIds.value.length === filteredVoters.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = filteredVoters.value.map(v => v.id);
  }
};

const openAddVoterModal = () => {
  isEditing.value = false;
  voterForm.value = {
    id: null,
    student_name: '',
    lsu_id_number: '',
    lsu_email: '',
    grade_and_section: '',
  };
  showVoterModal.value = true;
};

const openEditModal = (voter) => {
  isEditing.value = true;
  voterForm.value = { ...voter };
  showVoterModal.value = true;
};

const submitVoterForm = async () => {
  savingVoter.value = true;
  try {
    if (isEditing.value) {
      await $fetch(`${endpoint}/api/beu-election/voters/${voterForm.value.id}/`, {
        method: 'PUT',
        body: voterForm.value
      });
      showToast("BEU voter updated successfully!");
    } else {
      await $fetch(`${endpoint}/api/beu-election/voters/`, {
        method: 'POST',
        body: { ...voterForm.value, has_voted: "No" }
      });
      showToast("BEU voter added successfully!");
    }
    showVoterModal.value = false;
    fetchVoters();
  } catch (err) {
    console.error(err);
    showToast("Failed to save voter record", "error");
  } finally {
    savingVoter.value = false;
  }
};

const resetSingleVoter = async (voter) => {
  if (!confirm(`Reset voting state for ${voter.student_name}?`)) return;
  try {
    await $fetch(`${endpoint}/api/beu-election/voters/${voter.id}/reset/`, {
      method: 'POST'
    });
    showToast(`Reset vote for ${voter.student_name}`);
    fetchVoters();
  } catch (err) {
    console.error(err);
    showToast("Failed to reset voter", "error");
  }
};

const resetSelectedVoters = async () => {
  bulkResetting.value = true;
  try {
    for (const id of selectedIds.value) {
      await $fetch(`${endpoint}/api/beu-election/voters/${id}/reset/`, {
        method: 'POST'
      });
    }
    showToast(`Reset ${selectedIds.value.length} voter(s) successfully!`);
    selectedIds.value = [];
    showBulkResetConfirm.value = false;
    fetchVoters();
  } catch (err) {
    console.error(err);
    showToast("Failed to reset voters", "error");
  } finally {
    bulkResetting.value = false;
  }
};

const openSingleDelete = (id) => {
  selectedIds.value = [id];
  showDeleteConfirm.value = true;
};

const deleteSelectedVoters = async () => {
  deleting.value = true;
  try {
    for (const id of selectedIds.value) {
      await $fetch(`${endpoint}/api/beu-election/voters/${id}/`, {
        method: 'DELETE'
      });
    }
    showToast(`Deleted ${selectedIds.value.length} voter(s) successfully!`);
    selectedIds.value = [];
    showDeleteConfirm.value = false;
    fetchVoters();
  } catch (err) {
    console.error(err);
    showToast("Failed to delete voters", "error");
  } finally {
    deleting.value = false;
  }
};

const handleCsvFile = (e) => {
  if (e.target.files && e.target.files[0]) {
    csvFile.value = e.target.files[0];
  }
};

const downloadCsvTemplate = () => {
  const headers = "student_name,lsu_id_number,grade_and_section,lsu_email\n";
  const sample = '"Dela Cruz, Juan M.",22110001,10- Br. Gerard Ronan FSC,-\n"Santos, Maria C.",22110002,11- STEM HS - Br. Norberto Jose FSC,-';
  const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "beu_voters_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const uploadCsv = async () => {
  if (!csvFile.value) return;
  uploadingCsv.value = true;
  try {
    const fd = new FormData();
    fd.append('file', csvFile.value);

    const res = await $fetch(`${endpoint}/api/beu-election/voters-upload/`, {
      method: 'POST',
      body: fd
    });

    showToast(res.message || "Voters CSV processed successfully!");
    showBulkUpload.value = false;
    csvFile.value = null;
    fetchVoters();
  } catch (err) {
    console.error(err);
    const msg = err.data?.error || "Failed to process CSV file";
    showToast(msg, "error");
  } finally {
    uploadingCsv.value = false;
  }
};

const downloadVoterListCsv = () => {
  if (voters.value.length === 0) return;
  const headers = "student_name,lsu_id_number,lsu_email,grade_and_section,has_voted\n";
  const rows = voters.value.map(v => 
    `"${v.student_name || ''}","${v.lsu_id_number || ''}","${v.lsu_email || ''}","${v.grade_and_section || ''}","${v.has_voted || 'No'}"`
  ).join("\n");
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "beu_enrolled_voters.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
