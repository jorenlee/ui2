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
        <p class="text-lg text-slate-500">Manage Candidate Profiles for University Student Government Election and College Student Counsels</p>
      </div>
    </header>
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h2 class="text-2xl font-bold text-slate-900">Candidate List</h2>
      <div class="flex flex-wrap items-center gap-4">
        <button @click="downloadTemplate" class="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200 px-4 py-2 rounded-lg font-semibold cursor-pointer transition-colors duration-200 flex items-center gap-2 shrink-0">
          <i class="fa fa-file-alt"></i> Download Template
        </button>
        <input type="file" id="csvCandidateUpload" accept=".csv" @change="handleFileUpload" class="hidden">
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
    <p v-if="csvFile" class="text-sm text-green-600 font-semibold mb-6 -mt-4 text-right">Selected: {{ csvFile.name }}</p>

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

    <div v-if="candidates.length" class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Name</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Position</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Category</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">College & Program</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in candidates" :key="c.id" class="hover:bg-slate-50 transition-colors">
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
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      No candidates found.
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

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
  }
};

const submitCandidate = async () => {
  loading.value = true;
  
  const formData = new FormData();
  Object.keys(candidateForm.value).forEach(key => {
    if (key !== 'student_candidate_profile_image') {
      formData.append(key, candidateForm.value[key]);
    }
  });

  if (profileImageFile.value) {
    formData.append('student_candidate_profile_image', profileImageFile.value);
  }

  try {
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

const handleFileUpload = (e) => {
  csvFile.value = e.target.files[0];
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
      csvFile.value = null;
      await fetchCandidates();
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

onMounted(() => {
  fetchCandidates();
});
</script>
