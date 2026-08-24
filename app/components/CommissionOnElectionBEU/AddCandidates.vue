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
                  Zeros out all candidate votes and resets all voters to "Not Voted". <strong>Preserves</strong> your list of candidates and enrolled voters.
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
        <h3 class="text-lg font-bold text-slate-900 mb-2">Delete {{ selectedIds.length }} candidate{{ selectedIds.length > 1 ? 's' : '' }}?</h3>
        <p class="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" :disabled="deleting"
                  class="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
            Cancel
          </button>
          <button @click="deleteSelectedCandidates" :disabled="deleting"
                  class="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Candidate Modal -->
    <div v-if="showEditCandidate" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-[#087830] text-white py-3 px-6 flex items-center justify-between sticky top-0">
          <h3 class="text-sm font-bold uppercase tracking-wider">Edit BEU Candidate</h3>
          <button @click="closeEditCandidate" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div class="p-8 sm:p-10">
          <form @submit.prevent="submitEditCandidate">
            <div class="flex flex-col gap-6 mb-8">
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Last, First, M.I Name <span class="text-red-500">*</span></label>
                <input v-model="editForm.student_name" type="text" required placeholder="e.g. Ang, Temperance Ianne, T."
                       class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU ID Number</label>
                  <input v-model="editForm.lsu_id_number" type="text" placeholder="e.g. 221123265"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU Email</label>
                  <input v-model="editForm.lsu_email" type="email" placeholder="e.g. candidate@lsu.edu.ph"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Grade & Section <span class="text-red-500">*</span></label>
                <input v-model="editForm.grade_and_section" type="text" required placeholder="e.g. 10- Br. Gerard Ronan FSC"
                       class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Position Running For <span class="text-red-500">*</span></label>
                  <input v-model="editForm.title_position" type="text" required placeholder="e.g. Governor, Senator"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Partylist Name <span class="text-red-500">*</span></label>
                  <input v-model="editForm.partylist" type="text" required placeholder="e.g. Sandigan Party, Spark Party, Independent"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Profile Image</label>
                <div v-if="editForm.student_candidate_profile_image && !editProfileImageFile" class="flex items-center gap-3 mb-2">
                  <img :src="getProfileImageUrl(editForm.student_candidate_profile_image)" alt="Current profile"
                       class="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" @error="handleImageError($event, editForm.student_name)">
                  <span class="text-sm text-slate-500">Current image</span>
                </div>
                <input type="file" accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png" @change="handleEditImageUpload" id="editBEUImageUpload" class="hidden">
                <label for="editBEUImageUpload" class="w-full py-2 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center gap-3 cursor-pointer hover:border-green-700 transition-colors font-medium">
                  <i class="fa fa-image text-slate-400"></i>
                  <span :class="editProfileImageFile ? 'text-slate-900' : 'text-slate-400'" class="truncate">{{ editProfileImageFile ? editProfileImageFile.name : 'Click to change profile image...' }}</span>
                </label>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Platform / Description</label>
                <textarea v-model="editForm.student_candidate_profile_desc" rows="3" placeholder="Candidate platform, advocacy or profile summary..."
                          class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium text-sm"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="closeEditCandidate" :disabled="savingEdit"
                      class="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" :disabled="savingEdit"
                      class="px-6 py-2.5 rounded-lg font-semibold text-white bg-[#087830] hover:bg-[#066327] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                <svg v-if="savingEdit" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ savingEdit ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add Candidate Modal -->
    <div v-if="showAddCandidate" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-[#087830] text-white py-3 px-6 flex items-center justify-between sticky top-0">
          <h3 class="text-sm font-bold uppercase tracking-wider">Add BEU Candidate</h3>
          <button @click="showAddCandidate = false" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div class="p-8 sm:p-10">
          <form @submit.prevent="submitAddCandidate">
            <div class="flex flex-col gap-6 mb-8">
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Last, First, M.I Name <span class="text-red-500">*</span></label>
                <input v-model="form.student_name" type="text" required placeholder="e.g. Ang, Temperance Ianne, T."
                       class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU ID Number</label>
                  <input v-model="form.lsu_id_number" type="text" placeholder="e.g. 221123265"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU Email</label>
                  <input v-model="form.lsu_email" type="email" placeholder="e.g. candidate@lsu.edu.ph"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Grade & Section <span class="text-red-500">*</span></label>
                <input v-model="form.grade_and_section" type="text" required placeholder="e.g. 10- Br. Gerard Ronan FSC"
                       class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Position Running For <span class="text-red-500">*</span></label>
                  <input v-model="form.title_position" type="text" required placeholder="e.g. Governor, Senator"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
                <div class="relative">
                  <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Partylist Name <span class="text-red-500">*</span></label>
                  <input v-model="form.partylist" type="text" required placeholder="e.g. Sandigan Party, Spark Party, Independent"
                         class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium">
                </div>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Profile Image</label>
                <input type="file" accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png" @change="handleAddImageUpload" id="addBEUImageUpload" class="hidden">
                <label for="addBEUImageUpload" class="w-full py-2 px-3 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex items-center gap-3 cursor-pointer hover:border-green-700 transition-colors font-medium">
                  <i class="fa fa-image text-slate-400"></i>
                  <span :class="profileImageFile ? 'text-slate-900' : 'text-slate-400'" class="truncate">{{ profileImageFile ? profileImageFile.name : 'Click to select profile image...' }}</span>
                </label>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Platform / Description</label>
                <textarea v-model="form.student_candidate_profile_desc" rows="3" placeholder="Candidate platform, advocacy or profile summary..."
                          class="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:border-green-700 focus:bg-white text-slate-900 font-medium text-sm"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button type="button" @click="showAddCandidate = false" :disabled="saving"
                      class="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" :disabled="saving"
                      class="px-6 py-2.5 rounded-lg font-semibold text-white bg-[#087830] hover:bg-[#066327] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                <svg v-if="saving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                {{ saving ? 'Saving...' : 'Add Candidate' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bulk Upload CSV Modal -->
    <div v-if="showBulkUpload" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-slate-900">Upload BEU Candidates (CSV)</h3>
          <button @click="showBulkUpload = false" class="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        
        <p class="text-xs text-slate-500 mb-4">
          Upload a CSV containing: <strong>student_name</strong>, <strong>grade_and_section</strong>, <strong>title_position</strong>, <strong>partylist</strong>, <em>lsu_id_number</em>, <em>lsu_email</em>, <em>student_candidate_profile_image</em>.
        </p>

        <div class="mb-4">
          <button @click="downloadCsvTemplate" type="button" class="text-xs text-[#087830] hover:underline font-semibold flex items-center gap-1">
            <i class="fa fa-download"></i> Download CSV Template
          </button>
        </div>

        <div class="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-green-600 transition-colors mb-6">
          <input type="file" accept=".csv" @change="handleCsvFile" id="beuCsvUpload" class="hidden">
          <label for="beuCsvUpload" class="cursor-pointer flex flex-col items-center gap-2">
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

    <!-- Header / Control Panel -->
    <header class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-green-50 text-[#087830] flex items-center justify-center text-lg font-bold">
            <i class="fa fa-id-card"></i>
          </div>
          <div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-900">BEU Candidates</h1>
            <p class="text-xs text-slate-500">Basic Education Unit Student Leaders & Candidates</p>
          </div>
        </div>
      </div>
      
      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <button @click="openResetElectionModal"
                class="flex-1 sm:flex-none px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 border border-red-200 shadow-sm">
          <i class="fa fa-power-off"></i>
          <span>Reset Election</span>
        </button>
        <button @click="showBulkUpload = true"
                class="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2">
          <i class="fa fa-file-upload"></i>
          <span>Import CSV</span>
        </button>
        <button @click="exportCsv"
                class="flex-1 sm:flex-none px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 border border-emerald-200 shadow-sm">
          <i class="fa fa-file-export"></i>
          <span>Export CSV</span>
        </button>
        <button @click="showAddCandidate = true"
                class="flex-1 sm:flex-none px-4 py-2 bg-[#087830] hover:bg-[#066327] text-white rounded-xl font-semibold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-2">
          <i class="fa fa-plus"></i>
          <span>Add Candidate</span>
        </button>
      </div>
    </header>

    <!-- Filters & Search Bar -->
    <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
      <div class="w-full md:w-80 relative">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input v-model="searchQuery" type="text" placeholder="Search candidate, grade, partylist..."
               class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-green-600 text-slate-800 transition">
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <select v-model="selectedPositionFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white cursor-pointer">
          <option value="">All Positions</option>
          <option v-for="pos in distinctPositions" :key="pos" :value="pos">{{ pos }}</option>
        </select>

        <select v-model="selectedPartylistFilter" class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white cursor-pointer">
          <option value="">All Partylists</option>
          <option v-for="p in distinctPartylists" :key="p" :value="p">{{ p }}</option>
        </select>

        <button v-if="selectedIds.length > 0" @click="showDeleteConfirm = true"
                class="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-1.5">
          <i class="fa fa-trash"></i>
          <span>Delete ({{ selectedIds.length }})</span>
        </button>
      </div>
    </div>

    <!-- Candidate Cards / Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <!-- Loading state -->
      <div v-if="loading" class="p-12 text-center text-slate-400">
        <div class="inline-block animate-spin text-3xl mb-3 text-[#087830]">
          <i class="fa fa-spinner"></i>
        </div>
        <p class="text-sm font-medium">Loading BEU candidates...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="filteredCandidates.length === 0" class="p-12 text-center text-slate-400">
        <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-2xl text-slate-400">
          <i class="fa fa-user-slash"></i>
        </div>
        <h4 class="font-bold text-slate-700 text-base mb-1">No BEU Candidates Found</h4>
        <p class="text-xs text-slate-400">Try adjusting your search query or add a candidate to get started.</p>
      </div>

      <!-- Candidates Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-10">
                <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                       class="rounded border-slate-300 text-[#087830] focus:ring-green-500">
              </th>
              <th class="py-3.5 px-4">Picture</th>
              <th class="py-3.5 px-4">Last, First, M.I Name</th>
              <th class="py-3.5 px-4">Grade & Section</th>
              <th class="py-3.5 px-4">Position</th>
              <th class="py-3.5 px-4">Partylist</th>
              <th class="py-3.5 px-4 text-center">Votes</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr v-for="c in paginatedCandidates" :key="c.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="py-3 px-4">
                <input type="checkbox" :value="c.id" v-model="selectedIds"
                       class="rounded border-slate-300 text-[#087830] focus:ring-green-500">
              </td>
              <td class="py-3 px-4">
                <img :src="getProfileImageUrl(c.student_candidate_profile_image)"
                     :alt="c.student_name"
                     class="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-sm"
                     @error="handleImageError($event, c.student_name)">
              </td>
              <td class="py-3 px-4">
                <div class="font-bold text-slate-800">{{ c.student_name }}</div>
                <div class="text-xs text-slate-400 font-mono" v-if="c.lsu_id_number">{{ c.lsu_id_number }}</div>
              </td>
              <td class="py-3 px-4">
                <span class="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {{ c.grade_and_section }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-[#087830] text-xs font-bold border border-emerald-200">
                  {{ c.title_position }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  {{ c.partylist || 'Independent' }}
                </span>
              </td>
              <td class="py-3 px-4 text-center">
                <span class="font-extrabold text-slate-800 text-sm">{{ c.number_of_votes || 0 }}</span>
              </td>
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button @click="openEditModal(c)" title="Edit"
                          class="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition">
                    <i class="fa fa-pencil"></i>
                  </button>
                  <button @click="openSingleDelete(c.id)" title="Delete"
                          class="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition">
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="filteredCandidates.length > 0" class="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
        <div class="text-xs text-slate-500 font-medium">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredCandidates.length) }} of {{ filteredCandidates.length }} candidates
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

const candidates = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const selectedPositionFilter = ref('');
const selectedPartylistFilter = ref('');
const selectedIds = ref([]);

const currentPage = ref(1);
const pageSize = ref(15);

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 4000);
};

// Form states
const showAddCandidate = ref(false);
const saving = ref(false);
const profileImageFile = ref(null);
const form = ref({
  student_name: '',
  lsu_id_number: '',
  lsu_email: '',
  grade_and_section: '',
  title_position: '',
  partylist: '',
  student_candidate_profile_desc: '',
});

// Edit state
const showEditCandidate = ref(false);
const savingEdit = ref(false);
const editProfileImageFile = ref(null);
const editForm = ref({});

// Delete state
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
    fetchCandidates();
  } catch (err) {
    console.error(err);
    const msg = err.data?.error || "Failed to reset election.";
    showToast(msg, "error");
  } finally {
    isResettingElection.value = false;
  }
};

const fetchCandidates = async () => {
  loading.value = true;
  try {
    const res = await $fetch(`${endpoint}/api/beu-election/candidates/`);
    candidates.value = res || [];
  } catch (err) {
    console.error("Error fetching BEU candidates:", err);
    showToast("Failed to fetch BEU candidates", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCandidates();
});

const distinctPositions = computed(() => {
  const set = new Set();
  candidates.value.forEach(c => {
    if (c.title_position) set.add(c.title_position.trim());
  });
  return Array.from(set).sort();
});

const distinctPartylists = computed(() => {
  const set = new Set();
  candidates.value.forEach(c => {
    if (c.partylist) set.add(c.partylist.trim());
  });
  return Array.from(set).sort();
});

const filteredCandidates = computed(() => {
  return candidates.value.filter(c => {
    const q = searchQuery.value.toLowerCase();
    const matchesSearch = !q ||
      (c.student_name && c.student_name.toLowerCase().includes(q)) ||
      (c.lsu_id_number && c.lsu_id_number.toLowerCase().includes(q)) ||
      (c.grade_and_section && c.grade_and_section.toLowerCase().includes(q)) ||
      (c.title_position && c.title_position.toLowerCase().includes(q)) ||
      (c.partylist && c.partylist.toLowerCase().includes(q));

    const matchesPosition = !selectedPositionFilter.value || c.title_position === selectedPositionFilter.value;
    const matchesParty = !selectedPartylistFilter.value || c.partylist === selectedPartylistFilter.value;

    return matchesSearch && matchesPosition && matchesParty;
  });
});

const totalPages = computed(() => Math.ceil(filteredCandidates.value.length / pageSize.value) || 1);

const paginatedCandidates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredCandidates.value.slice(start, start + pageSize.value);
});

const isAllSelected = computed(() => {
  return filteredCandidates.value.length > 0 && selectedIds.value.length === filteredCandidates.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = filteredCandidates.value.map(c => c.id);
  }
};

const getProfileImageUrl = (img) => {
  if (!img) return "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  return `${endpoint}${img}`;
};

const handleImageError = (event, name) => {
  event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'BEU Candidate')}&background=087830&color=fff&size=128`;
};

const handleAddImageUpload = (e) => {
  if (e.target.files && e.target.files[0]) {
    profileImageFile.value = e.target.files[0];
  }
};

const handleEditImageUpload = (e) => {
  if (e.target.files && e.target.files[0]) {
    editProfileImageFile.value = e.target.files[0];
  }
};

const uploadImageFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await $fetch(`${endpoint}/api/beu-election/upload-image/`, {
    method: 'POST',
    body: fd,
  });
  return res.url;
};

const submitAddCandidate = async () => {
  saving.value = true;
  try {
    let imageUrl = '';
    if (profileImageFile.value) {
      imageUrl = await uploadImageFile(profileImageFile.value);
    }

    const payload = {
      ...form.value,
      student_candidate_profile_image: imageUrl || null,
      number_of_votes: "0"
    };

    await $fetch(`${endpoint}/api/beu-election/candidates/`, {
      method: 'POST',
      body: payload
    });

    showToast("BEU Candidate created successfully!");
    showAddCandidate.value = false;
    form.value = {
      student_name: '',
      lsu_id_number: '',
      lsu_email: '',
      grade_and_section: '',
      title_position: '',
      partylist: '',
      student_candidate_profile_desc: '',
    };
    profileImageFile.value = null;
    fetchCandidates();
  } catch (err) {
    console.error(err);
    showToast("Failed to save candidate", "error");
  } finally {
    saving.value = false;
  }
};

const openEditModal = (candidate) => {
  editForm.value = { ...candidate };
  editProfileImageFile.value = null;
  showEditCandidate.value = true;
};

const closeEditCandidate = () => {
  showEditCandidate.value = false;
  editForm.value = {};
  editProfileImageFile.value = null;
};

const submitEditCandidate = async () => {
  savingEdit.value = true;
  try {
    let imageUrl = editForm.value.student_candidate_profile_image;
    if (editProfileImageFile.value) {
      imageUrl = await uploadImageFile(editProfileImageFile.value);
    }

    const payload = {
      ...editForm.value,
      student_candidate_profile_image: imageUrl || null
    };

    await $fetch(`${endpoint}/api/beu-election/candidates/${editForm.value.id}/`, {
      method: 'PUT',
      body: payload
    });

    showToast("BEU Candidate updated successfully!");
    closeEditCandidate();
    fetchCandidates();
  } catch (err) {
    console.error(err);
    showToast("Failed to update candidate", "error");
  } finally {
    savingEdit.value = false;
  }
};

const openSingleDelete = (id) => {
  selectedIds.value = [id];
  showDeleteConfirm.value = true;
};

const deleteSelectedCandidates = async () => {
  deleting.value = true;
  try {
    for (const id of selectedIds.value) {
      await $fetch(`${endpoint}/api/beu-election/candidates/${id}/`, {
        method: 'DELETE'
      });
    }
    showToast(`Deleted ${selectedIds.value.length} candidate(s) successfully!`);
    selectedIds.value = [];
    showDeleteConfirm.value = false;
    fetchCandidates();
  } catch (err) {
    console.error(err);
    showToast("Failed to delete candidates", "error");
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
  const headers = "student_name,grade_and_section,title_position,partylist,lsu_id_number,lsu_email,student_candidate_profile_image,student_candidate_profile_desc\n";
  const sample = '"Ang, Temperance Ianne, T.",10- Br. Gerard Ronan FSC,Governor,Independent,22110001,temperance@lsu.edu.ph,,\n"Aniban, Princess Diane, A.",11- STEM HS - Br. Norberto Jose FSC,Governor,Sandigan Party,22110002,princess@lsu.edu.ph,,';
  const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "beu_candidates_template.csv");
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

    const res = await $fetch(`${endpoint}/api/beu-election/candidates-upload/`, {
      method: 'POST',
      body: fd
    });

    showToast(res.message || "CSV processed successfully!");
    showBulkUpload.value = false;
    csvFile.value = null;
    fetchCandidates();
  } catch (err) {
    console.error(err);
    const msg = err.data?.error || "Failed to process CSV file";
    showToast(msg, "error");
  } finally {
    uploadingCsv.value = false;
  }
};

const exportCsv = () => {
  const dataToExport = filteredCandidates.value;
  if (dataToExport.length === 0) {
    showToast('No candidates to export.', 'error');
    return;
  }

  const headers = [
    'student_name',
    'lsu_id_number',
    'lsu_email',
    'grade_and_section',
    'title_position',
    'partylist',
    'number_of_votes',
    'student_candidate_profile_desc',
    'student_candidate_profile_image',
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = dataToExport.map(c =>
    headers.map(h => escapeCell(c[h])).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `beu_candidates_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  showToast(`Exported ${dataToExport.length} candidate(s) to CSV!`);
};
</script>
