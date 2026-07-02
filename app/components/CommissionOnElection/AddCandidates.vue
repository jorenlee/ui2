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
      <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="bg-[#2E7D32] text-white py-3 px-6 flex items-center justify-between sticky top-0">
          <h3 class="text-sm font-bold uppercase tracking-wider">Edit Candidate</h3>
          <button @click="closeEditCandidate" class="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
        <div class="p-8 sm:p-10">
          <form @submit.prevent="submitEditCandidate">
            <div class="flex flex-col gap-8 mb-10">
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Student Full Name <span class="text-red-500">*</span></label>
                <input v-model="editForm.student_name" type="text" required placeholder="Juan Dela Cruz"
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU Email <span class="text-red-500">*</span></label>
                <input v-model="editForm.lsu_email" type="email" required placeholder="juan@lsu.edu.ph"
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU ID Number <span class="text-red-500">*</span></label>
                <input v-model="editForm.lsu_id_number" type="text" required placeholder="LSU ID (e.g. 221123265)"
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">College <span class="text-red-500">*</span></label>
                <select v-model="editForm.college" required
                        class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg cursor-pointer">
                  <option value="" disabled>Select a college...</option>
                  <option v-for="college in colleges" :key="college.value" :value="college.value">
                    {{ college.label }}
                  </option>
                </select>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Program <span class="text-red-500">*</span></label>
                <input v-model="editForm.program" type="text" required placeholder="Bachelor of Science in Information Technology"
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Category <span class="text-red-500">*</span></label>
                <input v-model="editForm.category" type="text" required placeholder="e.g. LSU-USG, SC-CCSEA, ABO-JPIA"
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Title / Position <span class="text-red-500">*</span></label>
                <input v-model="editForm.title_position" type="text" required placeholder="President"
                       class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Profile Image</label>
                <div v-if="editForm.student_candidate_profile_image && !editProfileImageFile" class="flex items-center gap-3 mb-2">
                  <img :src="getProfileImageUrl(editForm.student_candidate_profile_image)" alt="Current profile"
                       class="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0" @error="handleImageError($event, editForm.student_name)">
                  <span class="text-sm text-slate-500">Current image — pick a new file below to replace it.</span>
                </div>
                <input type="file" accept="image/*" @change="handleEditImageUpload" id="editProfileImageUpload" class="hidden">
                <label for="editProfileImageUpload" class="w-full py-2 bg-transparent border-0 border-b-2 border-slate-300 flex items-center gap-3 cursor-pointer hover:border-green-700 transition-colors font-medium text-lg">
                  <i class="fa fa-image text-slate-400"></i>
                  <span :class="editProfileImageFile ? 'text-slate-900' : 'text-slate-300'" class="truncate">{{ editProfileImageFile ? editProfileImageFile.name : 'Click to select a new image file...' }}</span>
                </label>
              </div>
              <div class="relative">
                <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Profile Description</label>
                <textarea v-model="editForm.student_candidate_profile_desc" rows="3" placeholder="Platform and background..."
                          class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg resize-y"></textarea>
              </div>
            </div>
            <div class="flex justify-end gap-3">
              <button type="button" @click="closeEditCandidate" :disabled="editLoading"
                      class="px-5 py-2.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" :disabled="editLoading"
                      class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 px-12 rounded shadow-md font-bold text-lg tracking-wide transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
                <i class="fa fa-paper-plane"></i> {{ editLoading ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <header class="mb-10 pb-8 border-b-2 border-slate-100">


        <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-5">
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOA.jpg" alt="COA" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover " />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCOE.jpg" alt="COE" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover " />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUCSO.png" alt="CSO" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover " />
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg" alt="LSU Logo" class="h-20 sm:h-24 object-contain drop-shadow-sm" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUSAC.jpg" alt="SAC" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-lg p-1" />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSG.jpg" alt="USG" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover " />
          <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LSU%20Student%20Election/LSUUSGJA.jpg" alt="USGJA" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover " />
       
      </div>

      
      <div class="text-center">
        <h1 class="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Commission on Election</h1>
        <p class="text-lg text-slate-500">Manage Candidate Profiles for University Student Government Election and College Student Counsels</p>
      </div>
    </header>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h2 class="text-2xl font-bold text-slate-900">Candidate List</h2>
      <div class="flex flex-wrap items-center gap-4">
        <button @click="downloadTemplate" class="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 px-4 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 shrink-0">
          <i class="fa fa-file-alt"></i> Download Template
        </button>
        <input ref="csvInputRef" type="file" id="csvCandidateUpload" accept=".csv,text/csv" @change="handleFileUpload" @click="resetInputValueOnClick" class="hidden">
        <label for="csvCandidateUpload" class="bg-transparent border-2 border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 shrink-0">
          <i class="fa fa-upload"></i> Upload CSV
        </label>
        <button v-if="csvFile" @click="uploadCandidates" :disabled="loading" class="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shrink-0">
          {{ loading ? 'Uploading...' : 'Confirm Upload' }}
        </button>
        <button class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shrink-0" @click="showAddCandidate = !showAddCandidate">
          {{ showAddCandidate ? 'Cancel' : '+ Add New Candidate' }}
        </button>
      </div>
    </div>
    <p v-if="csvFile" class="text-sm text-green-600 font-semibold mb-6 -mt-4 text-right">
      Selected: {{ csvFile.name }}
      <button @click="clearCsvFile" type="button" class="ml-2 text-slate-400 hover:text-red-500 font-normal underline">remove</button>
    </p>

    <div v-if="showAddCandidate" class="bg-white rounded-xl shadow-md border-2 border-[#2E7D32] mb-10 max-w-3xl mx-auto overflow-hidden">
      <div class="bg-[#2E7D32] text-white py-3 px-6 text-center">
        <h3 class="text-sm font-bold uppercase tracking-wider">Candidate Information</h3>
      </div>
      <div class="p-8 sm:p-10">
        <form @submit.prevent="submitCandidate">
          <div class="flex flex-col gap-8 mb-10">
            <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Student Full Name <span class="text-red-500">*</span></label>
            <input v-model="candidateForm.student_name" type="text" required placeholder="Juan Dela Cruz"
                   class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU Email <span class="text-red-500">*</span></label>
            <input v-model="candidateForm.lsu_email" type="email" required placeholder="juan@lsu.edu.ph"
                   class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">LSU ID Number <span class="text-red-500">*</span></label>
            <input v-model="candidateForm.lsu_id_number" type="text" required placeholder="LSU ID (e.g. 221123265)"
                   class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">College <span class="text-red-500">*</span></label>
            <select v-model="candidateForm.college" required
                    class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors font-medium text-lg cursor-pointer">
              <option value="" disabled>Select a college...</option>
              <option v-for="college in colleges" :key="college.value" :value="college.value">
                {{ college.label }}
              </option>
            </select>
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Program <span class="text-red-500">*</span></label>
            <input v-model="candidateForm.program" type="text" required placeholder="Bachelor of Science in Information Technology"
                   class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Category <span class="text-red-500">*</span></label>
            <input v-model="candidateForm.category" type="text" required placeholder="e.g. LSU-USG, SC-CCSEA, ABO-JPIA"
                   class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Title / Position <span class="text-red-500">*</span></label>
            <input v-model="candidateForm.title_position" type="text" required placeholder="President"
                   class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg">
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Profile Image</label>
            <input type="file" accept="image/*" @change="handleImageUpload" id="profileImageUpload" class="hidden">
            <label for="profileImageUpload" class="w-full py-2 bg-transparent border-0 border-b-2 border-slate-300 flex items-center gap-3 cursor-pointer hover:border-green-700 transition-colors font-medium text-lg">
              <i class="fa fa-image text-slate-400"></i>
              <span :class="profileImageFile ? 'text-slate-900' : 'text-slate-300'" class="truncate">{{ profileImageFile ? profileImageFile.name : 'Click to select image file...' }}</span>
            </label>
          </div>
          <div class="relative">
            <label class="block text-xs font-bold text-slate-800 mb-1 uppercase tracking-wide">Profile Description</label>
            <textarea v-model="candidateForm.student_candidate_profile_desc" rows="3" placeholder="Platform and background..."
                      class="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-slate-300 focus:border-green-700 focus:ring-0 text-slate-900 transition-colors placeholder-slate-300 font-medium text-lg resize-y"></textarea>
          </div>
        </div>
          <div class="text-center">
            <button type="submit" :disabled="loading"
                    class="bg-[#2E7D32] hover:bg-[#1B5E20] text-white py-3 px-12 rounded shadow-md font-bold text-lg tracking-wide transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2">
              <i class="fa fa-paper-plane"></i> {{ loading ? 'Submitting...' : 'Submit' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Search + bulk actions bar -->
    <div v-if="!candidatesLoading && candidates.length" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
      <div class="relative w-full sm:max-w-xs">
        <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input v-model="searchQuery" type="text" placeholder="Search candidates..."
               class="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-300 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none text-sm text-slate-900 placeholder-slate-400 transition-colors">
        <button v-if="searchQuery" @click="searchQuery = ''" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm leading-none">
          &times;
        </button>
      </div>
      <div class="flex items-center gap-4">
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
    </div>
    <p v-if="!candidatesLoading && candidates.length && searchQuery" class="text-sm text-slate-500 mb-4 -mt-2">
      {{ filteredCandidates.length }} result{{ filteredCandidates.length === 1 ? '' : 's' }} for "{{ searchQuery }}"
    </p>

    <!-- Loading state -->
    <div v-if="candidatesLoading" class="flex items-center justify-center gap-3 py-16 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      <svg class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span class="font-medium">Loading candidates...</span>
    </div>

    <div v-else-if="filteredCandidates.length" class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr>
            <th class="bg-slate-50 px-6 py-4 border-b border-slate-200 w-12">
              <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll"
                     class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">
            </th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Name</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Position</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Category</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">College & Program</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filteredCandidates" :key="c.id"
              :class="['hover:bg-slate-50 transition-colors', selectedIds.includes(c.id) ? 'bg-green-50/60' : '']">
            <td class="px-6 py-4 border-b border-slate-200">
              <input type="checkbox" :checked="selectedIds.includes(c.id)" @change="toggleSelect(c.id)"
                     class="w-4 h-4 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer">
            </td>
            <td class="px-6 py-4 border-b border-slate-200">
              <div class="flex items-center gap-4">
                <div v-if="c.student_candidate_profile_image" class="w-10 h-10 rounded-full shrink-0 overflow-hidden shadow-sm border border-slate-200 bg-white">
                  <img :src="getProfileImageUrl(c.student_candidate_profile_image)" alt="Profile" class="w-full h-full object-cover" @error="handleImageError($event, c.student_name)" />
                </div>
                <div v-else class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xl shrink-0">
                  {{ c.student_name.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-slate-900">{{ c.student_name }}</div>
                  <div class="text-sm text-slate-500">{{ c.lsu_email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 border-b border-slate-200 text-slate-700">{{ c.title_position }}</td>
            <td class="px-6 py-4 border-b border-slate-200">
              <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{{ c.category }}</span>
            </td>
            <td class="px-6 py-4 border-b border-slate-200 text-slate-700">{{ c.college }}<span v-if="c.program"> - {{ c.program }}</span></td>
            <td class="px-6 py-4 border-b border-slate-200 text-right">
              <button @click="openEditCandidate(c)" class="text-slate-400 hover:text-green-600 transition-colors" title="Edit candidate">
                <i class="fa fa-pen"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="candidates.length && searchQuery" class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      No candidates match "{{ searchQuery }}".
      <button @click="searchQuery = ''" type="button" class="text-green-600 hover:text-green-700 font-semibold underline ml-1">Clear search</button>
    </div>
    <div v-else class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      No candidates found.
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

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

const loading = ref(false);
const candidates = ref([]);
const showAddCandidate = ref(false);
const csvFile = ref(null);
const csvInputRef = ref(null);

// Tracks whether the initial candidates fetch is still in flight, so the
// list area can show a loading indicator instead of briefly flashing the
// "No candidates found" empty state before data arrives.
const candidatesLoading = ref(true);

// --- Search -----------------------------------------------------------

const searchQuery = ref('');

// Filters candidates client-side across the fields visible in the table
// (name, email, position, category, college, program), case-insensitively.
const filteredCandidates = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return candidates.value;

  return candidates.value.filter(c => {
    const haystack = [
      c.student_name,
      c.lsu_email,
      c.lsu_id_number,
      c.title_position,
      c.category,
      c.college,
      c.program
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
});

const colleges = [
  { value: 'CAS', label: 'College of Arts and Sciences CAS' },
  { value: 'CBA', label: 'College of Business and Accountancy CBA' },
  { value: 'CCJE', label: 'College of Criminal Justice Education CCJE' },
  { value: 'CCSEA', label: 'College of Computer Studies, Engineering, and Architecture CCSEA' },
  { value: 'CON', label: 'College of Nursing CON' },
  { value: 'CTE', label: 'College of Teacher Education CTE' },
  { value: 'CTHM', label: 'College of Tourism and Hospitality Management CTHM' }
];

const toast = ref({ show: false, type: '', message: '' });
const showToast = (message, type = 'error') => {
  toast.value = { show: true, type, message };
  setTimeout(() => { toast.value.show = false; }, 5000);
};

const candidateForm = ref({
  lsu_email: '',
  student_name: '',
  lsu_id_number: '',
  college: '',
  program: '',
  category: '',
  title_position: '',
  student_candidate_profile_desc: '',
  student_candidate_profile_image: ''
});

const profileImageFile = ref(null);

const handleImageUpload = (e) => {
  if (e.target.files && e.target.files[0]) {
    profileImageFile.value = e.target.files[0];
  }
};

const downloadTemplate = () => {
  const headers = 'student_name,lsu_email,lsu_id_number,college,program,category,title_position,student_candidate_profile_desc,student_candidate_profile_image\n';
  const example = 'Juan Dela Cruz,juan@lsu.edu.ph,1234567,CCSEA,Bachelor of Science in Information Technology,SC-CCSEA,President,Platform description here...,https://example.com/image.jpg\n';
  const blob = new Blob([headers + example], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'candidates_template.csv');
  a.click();
  window.URL.revokeObjectURL(url);
};

const fetchCandidates = async () => {
  try {
    const res = await fetch(`${API_BASE}/candidates/`);
    if (res.ok) {
      candidates.value = await res.json();
    }
  } catch (err) {
    console.error('Error fetching candidates:', err);
  } finally {
    candidatesLoading.value = false;
  }
};

// Uploads a single image file to the FileUploadModel-backed endpoint and
// returns the resulting public URL (a string), or '' if no file was given.
const uploadProfileImage = async (file) => {
  if (!file) return '';

  const imageFormData = new FormData();
  imageFormData.append('file', file);

  const uploadRes = await fetch(`${API_BASE}/upload-image/`, {
    method: 'POST',
    body: imageFormData
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(errText || 'Image upload failed.');
  }

  const uploadData = await uploadRes.json();
  return uploadData.url;
};

const submitCandidate = async () => {
  loading.value = true;

  try {
    // Step 1: upload the image first (if one was selected) and get back a URL string.
    // student_candidate_profile_image on the backend is a CharField, so it can only
    // ever accept a URL string here — never the raw File object.
    let uploadedImageUrl = '';
    try {
      uploadedImageUrl = await uploadProfileImage(profileImageFile.value);
    } catch (uploadErr) {
      showToast(`Image upload failed: ${uploadErr.message}`, 'error');
      loading.value = false;
      return;
    }

    // Step 2: submit the candidate with the image URL as a plain string.
    const formData = new FormData();
    Object.keys(candidateForm.value).forEach(key => {
      if (key !== 'student_candidate_profile_image') {
        formData.append(key, candidateForm.value[key]);
      }
    });
    formData.append('student_candidate_profile_image', uploadedImageUrl);

    const res = await fetch(`${API_BASE}/candidates/`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      await fetchCandidates();
      showAddCandidate.value = false;
      candidateForm.value = { lsu_email: '', student_name: '', lsu_id_number: '', college: '', program: '', category: '', title_position: '', student_candidate_profile_desc: '', student_candidate_profile_image: '' };
      profileImageFile.value = null;
      showToast('Candidate added successfully!', 'success');
    } else {
      const errorText = await res.text();
      console.error('Failed to add candidate response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = Object.entries(errorJson)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        showToast(errorMsg || 'Failed to add candidate.', 'error');
      } catch {
        showToast(errorText || 'Failed to add candidate.', 'error');
      }
    }
  } catch (err) {
    showToast('Failed to add candidate.', 'error');
  } finally {
    loading.value = false;
  }
};

// --- Multi-select delete ---------------------------------------------------

const selectedIds = ref([]);
const showDeleteConfirm = ref(false);
const deleting = ref(false);

// "Select All" operates on the currently filtered/visible set, so searching
// then selecting all doesn't silently select candidates hidden by the search.
const isAllSelected = computed(() =>
  filteredCandidates.value.length > 0 &&
  filteredCandidates.value.every(c => selectedIds.value.includes(c.id))
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
  const visibleIds = filteredCandidates.value.map(c => c.id);
  if (isAllSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !visibleIds.includes(id));
  } else {
    const merged = new Set([...selectedIds.value, ...visibleIds]);
    selectedIds.value = [...merged];
  }
};

// Prunes any selected ids that no longer exist in the current candidate list
// (e.g. after a refetch), so stale ids can't linger in the selection.
const pruneSelection = () => {
  const validIds = new Set(candidates.value.map(c => c.id));
  selectedIds.value = selectedIds.value.filter(id => validIds.has(id));
};

const deleteSelectedCandidates = async () => {
  if (!selectedIds.value.length) return;
  deleting.value = true;

  const idsToDelete = [...selectedIds.value];

  try {
    const results = await Promise.allSettled(
      idsToDelete.map(id =>
        fetch(`${API_BASE}/candidates/${id}/`, { method: 'DELETE' }).then(res => {
          if (!res.ok) throw new Error(`Failed to delete candidate ${id}`);
          return id;
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;

    await fetchCandidates();
    pruneSelection();

    showDeleteConfirm.value = false;

    if (failed === 0) {
      showToast(`${succeeded} candidate${succeeded > 1 ? 's' : ''} deleted successfully!`, 'success');
    } else if (succeeded === 0) {
      showToast(`Failed to delete ${failed} candidate${failed > 1 ? 's' : ''}.`, 'error');
    } else {
      showToast(`Deleted ${succeeded}, but ${failed} failed. Please try again.`, 'error');
    }
  } catch (err) {
    console.error('Error deleting candidates:', err);
    showToast('Failed to delete selected candidates.', 'error');
  } finally {
    deleting.value = false;
  }
};

// --- Edit candidate ---------------------------------------------------------

const showEditCandidate = ref(false);
const editLoading = ref(false);
const editingCandidateId = ref(null);
const editProfileImageFile = ref(null);
const editForm = ref({
  lsu_email: '',
  student_name: '',
  lsu_id_number: '',
  college: '',
  program: '',
  category: '',
  title_position: '',
  student_candidate_profile_desc: '',
  student_candidate_profile_image: ''
});

const handleEditImageUpload = (e) => {
  if (e.target.files && e.target.files[0]) {
    editProfileImageFile.value = e.target.files[0];
  }
};

const openEditCandidate = (c) => {
  editingCandidateId.value = c.id;
  editForm.value = {
    lsu_email: c.lsu_email || '',
    student_name: c.student_name || '',
    lsu_id_number: c.lsu_id_number || '',
    college: c.college || '',
    program: c.program || '',
    category: c.category || '',
    title_position: c.title_position || '',
    student_candidate_profile_desc: c.student_candidate_profile_desc || '',
    student_candidate_profile_image: c.student_candidate_profile_image || ''
  };
  editProfileImageFile.value = null;
  showEditCandidate.value = true;
};

const closeEditCandidate = () => {
  showEditCandidate.value = false;
  editingCandidateId.value = null;
  editProfileImageFile.value = null;
};

const submitEditCandidate = async () => {
  if (!editingCandidateId.value) return;
  editLoading.value = true;

  try {
    // If a new image was picked, upload it and use the new URL; otherwise
    // keep whatever URL was already on the candidate (student_candidate_profile_image
    // is a CharField on the backend, so it always needs to be a URL string, never
    // a raw File object).
    let imageUrl = editForm.value.student_candidate_profile_image;
    if (editProfileImageFile.value) {
      try {
        imageUrl = await uploadProfileImage(editProfileImageFile.value);
      } catch (uploadErr) {
        showToast(`Image upload failed: ${uploadErr.message}`, 'error');
        editLoading.value = false;
        return;
      }
    }

    const formData = new FormData();
    Object.keys(editForm.value).forEach(key => {
      if (key !== 'student_candidate_profile_image') {
        formData.append(key, editForm.value[key]);
      }
    });
    formData.append('student_candidate_profile_image', imageUrl);

    const res = await fetch(`${API_BASE}/candidates/${editingCandidateId.value}/`, {
      method: 'PATCH',
      body: formData
    });

    if (res.ok) {
      await fetchCandidates();
      showToast('Candidate updated successfully!', 'success');
      closeEditCandidate();
    } else {
      const errorText = await res.text();
      console.error('Failed to update candidate response:', errorText);
      try {
        const errorJson = JSON.parse(errorText);
        const errorMsg = Object.entries(errorJson)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        showToast(errorMsg || 'Failed to update candidate.', 'error');
      } catch {
        showToast(errorText || 'Failed to update candidate.', 'error');
      }
    }
  } catch (err) {
    console.error('Error updating candidate:', err);
    showToast('Failed to update candidate.', 'error');
  } finally {
    editLoading.value = false;
  }
};

// --- CSV upload -----------------------------------------------------------

// Extracts a readable message from a failed fetch Response, regardless of
// whether the backend returned JSON ({error}/{detail}/{message}/field errors),
// plain text, or an HTML error page (e.g. from a 500/502 behind a proxy).
const extractErrorMessage = async (res) => {
  const rawText = await res.text();

  if (!rawText) {
    return `Request failed (${res.status} ${res.statusText}).`;
  }

  try {
    const data = JSON.parse(rawText);

    if (typeof data === 'string') return data;
    if (data.error) return data.error;
    if (data.detail) return data.detail;
    if (data.message) return data.message;

    // Fall back to formatting field-level validation errors, same style
    // used for the "Add Candidate" form.
    if (typeof data === 'object') {
      const formatted = Object.entries(data)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
        .join(' | ');
      if (formatted) return formatted;
    }
  } catch {
    // Not JSON (e.g. HTML error page or plain text) — fall through.
  }

  // Avoid dumping a full HTML error page into the toast.
  if (/<html/i.test(rawText)) {
    return `Request failed (${res.status} ${res.statusText}).`;
  }

  return rawText;
};

const clearCsvFile = () => {
  csvFile.value = null;
  if (csvInputRef.value) csvInputRef.value.value = '';
};

// Some browsers won't fire @change if the same file is picked twice in a row
// (e.g. retrying an upload after fixing the CSV). Clearing the input's value
// on click ensures a fresh @change event every time, even for the same file.
const resetInputValueOnClick = (e) => {
  e.target.value = '';
};

const handleFileUpload = (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const isCsv = file.name.toLowerCase().endsWith('.csv') ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel';

  if (!isCsv) {
    showToast('Please select a valid .csv file.', 'error');
    clearCsvFile();
    return;
  }

  csvFile.value = file;
};

const uploadCandidates = async () => {
  if (!csvFile.value) return;
  loading.value = true;
  const formData = new FormData();
  formData.append('file', csvFile.value);

  try {
    const res = await fetch(`${API_BASE}/candidates-upload/`, {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      showToast('Candidates uploaded successfully!', 'success');
      clearCsvFile();
      await fetchCandidates();
    } else {
      const errorMsg = await extractErrorMessage(res);
      console.error('CSV upload failed:', errorMsg);
      showToast(`Upload failed: ${errorMsg}`, 'error');
    }
  } catch (err) {
    console.error('Error uploading CSV:', err);
    showToast(`Error uploading file: ${err.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCandidates();
});
</script>