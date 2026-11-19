<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">

    <!-- ── Header ─────────────────────────────────────────────────────── -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Higher Education From AUTOMATE MY.LSU</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Currently Enrolled Students
          <span v-if="total !== null" class="ml-1 font-semibold text-emerald-600 dark:text-emerald-400">
            ({{ total.toLocaleString() }} total)
          </span>
        </p>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap gap-2">
        <!-- Import CSV -->
        <label
          :class="isImporting ? 'opacity-70 cursor-not-allowed pointer-events-none bg-blue-500' : 'cursor-pointer hover:bg-blue-700 bg-blue-600'"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-sm font-medium transition shadow-sm select-none"
        >
          <!-- Animated Spinner during import -->
          <svg v-if="isImporting" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"/>
          </svg>
          <span>{{ isImporting ? 'Importing CSV…' : 'Import CSV' }}</span>
          <input
            type="file"
            accept=".csv"
            class="hidden"
            :disabled="isImporting"
            @change="onImportFile"
            ref="importFileRef"
          />
        </label>

        <!-- Export CSV -->
        <button
          @click="exportCSV"
          :disabled="isImporting"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 4v8m0 0l-3 3m3-3l3 3"/></svg>
          Export CSV
        </button>

        <!-- Add row -->
        <button
          @click="openAddModal"
          :disabled="isImporting"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Student
        </button>
      </div>
    </div>

    <!-- ── Importing loading banner ────────────────────────────────────── -->
    <div v-if="isImporting" class="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-sm flex items-center gap-2">
            <span>Importing CSV Data…</span>
            <span v-if="importFileName" class="text-xs font-mono font-normal opacity-75 truncate max-w-sm">({{ importFileName }})</span>
          </div>
          <p class="text-xs opacity-80 mt-0.5">Please wait while student records are being validated, parsed, and updated in the database…</p>
        </div>
      </div>
      <!-- Animated indeterminate progress bar -->
      <div class="w-full bg-blue-200 dark:bg-blue-900/60 rounded-full h-1.5 mt-3 overflow-hidden">
        <div class="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full animate-indeterminate"></div>
      </div>
    </div>

    <!-- ── Import result toast ─────────────────────────────────────────── -->
    <div v-if="importResult"
      class="mb-4 p-3 rounded-lg text-sm flex items-start gap-2"
      :class="importResult.error ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                                 : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'">
      <span class="text-base mt-0.5">{{ importResult.error ? '⚠️' : '✅' }}</span>
      <span v-if="importResult.error">{{ importResult.error }}</span>
      <span v-else>
        Import done — <b>{{ importResult.created }}</b> created,
        <b>{{ importResult.updated }}</b> updated,
        <b>{{ importResult.skipped }}</b> skipped.
      </span>
      <button @click="importResult = null" class="ml-auto opacity-50 hover:opacity-100 text-lg leading-none">×</button>
    </div>

    <!-- ── Search + Sort bar ───────────────────────────────────────────── -->
    <div class="mb-4 flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
        </svg>
        <input
          v-model="searchQuery"
          @input="onSearch"
          type="text"
          placeholder="Search by ID, Name, College, Course/Major, Email, Mobile…"
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        />
      </div>

      <select v-model="sortField" @change="fetchData(1)"
        class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
        <option value="last_name">Sort: Last Name ↑</option>
        <option value="-last_name">Sort: Last Name ↓</option>
        <option value="first_name">Sort: First Name ↑</option>
        <option value="student_id">Sort: Student ID ↑</option>
        <option value="-student_id">Sort: Student ID ↓</option>
        <option value="college">Sort: College ↑</option>
        <option value="course_major">Sort: Course/Major ↑</option>
        <option value="year">Sort: Year ↑</option>
        <option value="-created_at">Sort: Newest First</option>
        <option value="created_at">Sort: Oldest First</option>
      </select>

      <!-- Show All toggle button -->
      <button
        @click="toggleShowAll"
        type="button"
        class="px-3.5 py-2 rounded-lg border text-sm font-medium transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
        :class="showAll
          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'"
      >
        <span v-if="showAll">✓ Showing All ({{ total ?? '…' }})</span>
        <span v-else>Show All ({{ total ?? '…' }})</span>
      </button>
    </div>

    <!-- ── Table ────────────────────────────────────────────────────────── -->
    <div class="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm bg-white dark:bg-gray-900">

      <!-- Loading skeleton -->
      <div v-if="loading" class="p-8 flex justify-center items-center gap-3 text-gray-500 dark:text-gray-400">
        <svg class="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading…
      </div>

      <div v-else-if="students.length === 0" class="p-10 text-center text-gray-400 dark:text-gray-600 text-sm">
        No students found.
        <span v-if="searchQuery"> Try a different search term.</span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-[11px] tracking-wider whitespace-nowrap">
            <tr>
              <th class="px-3 py-3 font-semibold">#</th>
              <th class="px-3 py-3 font-semibold">STUDENT ID</th>
              <th class="px-3 py-3 font-semibold">LAST NAME</th>
              <th class="px-3 py-3 font-semibold">FIRST NAME</th>
              <th class="px-3 py-3 font-semibold">MIDDLE NAME</th>
              <th class="px-3 py-3 font-semibold">GENDER</th>
              <th class="px-3 py-3 font-semibold">COLLEGE</th>
              <th class="px-3 py-3 font-semibold">COURSE/Major</th>
              <th class="px-3 py-3 font-semibold">YEAR</th>
              <th class="px-3 py-3 font-semibold">STUDENT EMAIL</th>
              <th class="px-3 py-3 font-semibold">STUDENT MOBILE</th>
              <th class="px-3 py-3 font-semibold text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="(s, idx) in students" :key="s.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
              <td class="px-3 py-2 text-gray-400 dark:text-gray-600 text-xs">{{ rowNum(idx) }}</td>

              <!-- Inline edit mode -->
              <template v-if="editingId === s.id">
                <td class="px-2 py-1.5"><input v-model="editRow.student_id"     class="edit-input w-28" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.last_name"      class="edit-input w-28" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.first_name"     class="edit-input w-28" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.middle_name"    class="edit-input w-24" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.gender"         class="edit-input w-20" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.college"        class="edit-input w-32" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.course_major"   class="edit-input w-40" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.year"           class="edit-input w-20" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.student_email"  class="edit-input w-40" type="email" /></td>
                <td class="px-2 py-1.5"><input v-model="editRow.student_mobile" class="edit-input w-28" /></td>
                <td class="px-2 py-1.5 text-center whitespace-nowrap">
                  <button @click="saveEdit(s)" :disabled="savingId === s.id"
                    class="text-xs px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 mr-1 transition disabled:opacity-50">
                    {{ savingId === s.id ? '…' : 'Save' }}
                  </button>
                  <button @click="cancelEdit"
                    class="text-xs px-2.5 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    Cancel
                  </button>
                </td>
              </template>

              <!-- Read mode -->
              <template v-else>
                <td class="px-3 py-2 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ s.student_id }}</td>
                <td class="px-3 py-2 font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{{ s.last_name }}</td>
                <td class="px-3 py-2 text-gray-800 dark:text-gray-100 whitespace-nowrap">{{ s.first_name }}</td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ s.middle_name || '—' }}</td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ s.gender || '—' }}</td>
                <td class="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ s.college || '—' }}</td>
                <td class="px-3 py-2 text-gray-700 dark:text-gray-300">{{ s.course_major || '—' }}</td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ s.year || '—' }}</td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{{ s.student_email || '—' }}</td>
                <td class="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs whitespace-nowrap">{{ s.student_mobile || '—' }}</td>
                <td class="px-3 py-2 text-center whitespace-nowrap">
                  <button @click="startEdit(s)"
                    class="text-xs px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/60 mr-1 transition opacity-0 group-hover:opacity-100">
                    Edit
                  </button>
                  <button @click="confirmDelete(s)"
                    class="text-xs px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/60 transition opacity-0 group-hover:opacity-100">
                    Delete
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination / Show All Toolbar -->
      <div v-if="!loading && total > 0"
        class="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
        
        <!-- Counter & Per Page -->
        <div class="flex flex-wrap items-center gap-3">
          <span v-if="showAll" class="font-medium text-emerald-600 dark:text-emerald-400">
            Showing all {{ total }} students
          </span>
          <span v-else>
            Showing {{ ((currentPage - 1) * pageSize) + 1 }}–{{ Math.min(currentPage * pageSize, total) }} of {{ total }}
          </span>

          <span class="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>

          <!-- Per-page selector -->
          <label class="flex items-center gap-1.5 text-xs">
            <span>Rows:</span>
            <select
              v-model="pageSize"
              @change="onPageSizeChange"
              class="px-2 py-1 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs focus:ring-1 focus:ring-emerald-500"
            >
              <option :value="50">50 / page</option>
              <option :value="100">100 / page</option>
              <option :value="250">250 / page</option>
              <option :value="500">500 / page</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-2">
          <!-- Show All toggle button -->
          <button
            @click="toggleShowAll"
            type="button"
            class="px-3 py-1 text-xs rounded-md border font-medium transition"
            :class="showAll
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'"
          >
            {{ showAll ? 'Paginated View (50 / page)' : `Show All (${total})` }}
          </button>

          <!-- Prev / Next pagination (when not in showAll) -->
          <div v-if="!showAll && totalPages > 1" class="flex gap-1">
            <button @click="fetchData(currentPage - 1)" :disabled="currentPage <= 1"
              class="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition">
              ‹ Prev
            </button>
            <span class="px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800">
              {{ currentPage }} / {{ totalPages }}
            </span>
            <button @click="fetchData(currentPage + 1)" :disabled="currentPage >= totalPages"
              class="px-3 py-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 transition">
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Add / Edit Modal ────────────────────────────────────────────── -->
    <div v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="showModal = false">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-4">
          {{ modalMode === 'add' ? 'Add Student' : 'Edit Student' }}
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
          <div class="sm:col-span-2">
            <label class="form-label">STUDENT ID <span class="text-red-500">*</span></label>
            <input v-model="modalRow.student_id" class="form-input" placeholder="e.g. 2024-00001" />
          </div>
          <div>
            <label class="form-label">LAST NAME <span class="text-red-500">*</span></label>
            <input v-model="modalRow.last_name" class="form-input" />
          </div>
          <div>
            <label class="form-label">FIRST NAME <span class="text-red-500">*</span></label>
            <input v-model="modalRow.first_name" class="form-input" />
          </div>
          <div>
            <label class="form-label">MIDDLE NAME</label>
            <input v-model="modalRow.middle_name" class="form-input" />
          </div>
          <div>
            <label class="form-label">GENDER</label>
            <input v-model="modalRow.gender" class="form-input" placeholder="e.g. Male / Female" />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label">COLLEGE</label>
            <input v-model="modalRow.college" class="form-input" placeholder="e.g. College of Computer Studies" />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label">COURSE/Major</label>
            <input v-model="modalRow.course_major" class="form-input" placeholder="e.g. BS Computer Science" />
          </div>
          <div>
            <label class="form-label">YEAR</label>
            <input v-model="modalRow.year" class="form-input" placeholder="e.g. 1st Year / 4" />
          </div>
          <div>
            <label class="form-label">STUDENT MOBILE</label>
            <input v-model="modalRow.student_mobile" class="form-input" placeholder="e.g. 09123456789" />
          </div>
          <div class="sm:col-span-2">
            <label class="form-label">STUDENT EMAIL</label>
            <input v-model="modalRow.student_email" class="form-input" type="email" placeholder="student@lsu.edu.ph" />
          </div>
        </div>

        <div v-if="modalError" class="mt-3 text-sm text-red-600 dark:text-red-400">{{ modalError }}</div>

        <div class="mt-5 flex justify-end gap-2">
          <button @click="showModal = false"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Cancel
          </button>
          <button @click="submitModal" :disabled="modalSaving"
            class="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50">
            {{ modalSaving ? 'Saving…' : (modalMode === 'add' ? 'Add Student' : 'Save Changes') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm Modal ────────────────────────────────────────── -->
    <div v-if="deleteTarget"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="deleteTarget = null">
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div class="text-4xl mb-3">🗑️</div>
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-1">Delete Student?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ deleteTarget.student_id }}</span>
          — {{ deleteTarget.last_name }}, {{ deleteTarget.first_name }}
        </p>
        <div class="flex gap-2 justify-center">
          <button @click="deleteTarget = null"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Cancel
          </button>
          <button @click="doDelete" :disabled="deleting"
            class="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition disabled:opacity-50">
            {{ deleting ? 'Deleting…' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
// ── Config ─────────────────────────────────────────────────────────────────
const config  = useRuntimeConfig()
const API_URL = config.public?.apiUrl || 'https://apipdp.lsu.edu.ph/buang_ka_eyy'
const BASE    = `${API_URL}/api/csv/higher-education`

// ── State ───────────────────────────────────────────────────────────────────
const students    = ref([])
const total       = ref(null)
const loading     = ref(false)
const currentPage = ref(1)
const pageSize    = ref(50)
const showAll     = ref(false)
const searchQuery = ref('')
const sortField   = ref('last_name')

const totalPages = computed(() => {
  const size = typeof pageSize.value === 'number' ? pageSize.value : 50
  return Math.max(1, Math.ceil((total.value || 0) / size))
})
const rowNum = (idx) => showAll.value
  ? idx + 1
  : (currentPage.value - 1) * (typeof pageSize.value === 'number' ? pageSize.value : 50) + idx + 1

// Inline edit
const editingId = ref(null)
const editRow   = ref({})
const savingId  = ref(null)

// Modal (add / edit)
const showModal  = ref(false)
const modalMode  = ref('add')
const modalRow   = ref(emptyRow())
const modalError = ref('')
const modalSaving= ref(false)

// Delete
const deleteTarget = ref(null)
const deleting     = ref(false)

// Import
const isImporting    = ref(false)
const importFileName = ref('')
const importResult   = ref(null)
const importFileRef  = ref(null)

// Search debounce
let searchTimer = null

// ── Helpers ─────────────────────────────────────────────────────────────────
function emptyRow() {
  return {
    student_id: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    gender: '',
    college: '',
    course_major: '',
    year: '',
    student_email: '',
    student_mobile: '',
  }
}

// ── Fetch ────────────────────────────────────────────────────────────────────
async function fetchData(page = 1) {
  currentPage.value = page
  loading.value = true
  try {
    const params = new URLSearchParams({
      sort: sortField.value,
    })
    if (showAll.value) {
      params.set('all', 'true')
    } else {
      params.set('page', page)
      params.set('page_size', pageSize.value)
    }
    if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim())

    const data = await $fetch(`${BASE}/?${params}`)
    students.value = data.results || []
    total.value    = data.total   ?? null
  } catch (err) {
    console.error('[HigherEducation] fetch error:', err)
  } finally {
    loading.value = false
  }
}

function toggleShowAll() {
  showAll.value = !showAll.value
  if (showAll.value) {
    pageSize.value = 'all'
  } else {
    pageSize.value = 50
  }
  fetchData(1)
}

function onPageSizeChange() {
  if (pageSize.value === 'all') {
    showAll.value = true
  } else {
    showAll.value = false
  }
  fetchData(1)
}

function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchData(1), 350)
}

// ── Inline edit ──────────────────────────────────────────────────────────────
function startEdit(s) {
  editingId.value = s.id
  editRow.value   = { ...s }
}
function cancelEdit() {
  editingId.value = null
  editRow.value   = {}
}
async function saveEdit(s) {
  savingId.value = s.id
  try {
    const updated = await $fetch(`${BASE}/${s.id}/`, {
      method: 'PUT',
      body: editRow.value,
    })
    const idx = students.value.findIndex(r => r.id === s.id)
    if (idx !== -1) students.value[idx] = updated
    editingId.value = null
  } catch (err) {
    alert('Save failed: ' + (err?.data?.errors ? JSON.stringify(err.data.errors) : err.message))
  } finally {
    savingId.value = null
  }
}

// ── Add modal ────────────────────────────────────────────────────────────────
function openAddModal() {
  modalMode.value  = 'add'
  modalRow.value   = emptyRow()
  modalError.value = ''
  showModal.value  = true
}

async function submitModal() {
  modalError.value = ''
  if (!modalRow.value.student_id || !modalRow.value.first_name || !modalRow.value.last_name) {
    modalError.value = 'STUDENT ID, FIRST NAME, and LAST NAME are required.'
    return
  }
  modalSaving.value = true
  try {
    await $fetch(`${BASE}/create/`, { method: 'POST', body: modalRow.value })
    showModal.value = false
    fetchData(currentPage.value)
  } catch (err) {
    modalError.value = err?.data?.errors
      ? Object.values(err.data.errors).flat().join(' ')
      : 'Error saving. Please try again.'
  } finally {
    modalSaving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
function confirmDelete(s) { deleteTarget.value = s }
async function doDelete() {
  deleting.value = true
  try {
    await $fetch(`${BASE}/${deleteTarget.value.id}/`, { method: 'DELETE' })
    deleteTarget.value = null
    fetchData(currentPage.value)
  } catch (err) {
    alert('Delete failed.')
  } finally {
    deleting.value = false
  }
}

// ── Import CSV ────────────────────────────────────────────────────────────────
async function onImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  importResult.value = null
  isImporting.value = true
  importFileName.value = file.name

  const form = new FormData()
  form.append('file', file)

  try {
    const res = await $fetch(`${BASE}/import/`, { method: 'POST', body: form })
    importResult.value = res
    await fetchData(1)
  } catch (err) {
    importResult.value = { error: err?.data?.error || 'Import failed. Check the CSV format.' }
  } finally {
    isImporting.value = false
    importFileName.value = ''
    // Reset file input so same file can be re-imported
    if (importFileRef.value) importFileRef.value.value = ''
  }
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV() {
  const params = new URLSearchParams({ sort: sortField.value })
  if (searchQuery.value.trim()) params.set('search', searchQuery.value.trim())
  window.open(`${BASE}/export/?${params}`, '_blank')
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => fetchData(1))
</script>

<style scoped>
.edit-input {
  @apply px-2 py-1 text-sm rounded border border-emerald-400 dark:border-emerald-600
         bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
         focus:outline-none focus:ring-2 focus:ring-emerald-500;
}
.form-label {
  @apply block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 tracking-wider;
}
.form-input {
  @apply w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700
         bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm
         focus:outline-none focus:ring-2 focus:ring-emerald-500 transition;
}

@keyframes indeterminate {
  0% {
    transform: translateX(-100%);
    width: 40%;
  }
  50% {
    transform: translateX(60%);
    width: 60%;
  }
  100% {
    transform: translateX(250%);
    width: 40%;
  }
}
.animate-indeterminate {
  animation: indeterminate 1.4s infinite ease-in-out;
}
</style>
