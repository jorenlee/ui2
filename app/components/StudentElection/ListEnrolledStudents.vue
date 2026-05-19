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

    <div v-if="voters.length" class="overflow-x-auto rounded-xl border border-slate-200">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Student</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">ID Number</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Program</th>
            <th class="bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in voters" :key="v.id" class="hover:bg-slate-50 transition-colors">
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
                v.has_voted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-700'
              ]">
                {{ v.has_voted ? 'Voted' : 'Pending' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
      No registered voters yet. Please upload a CSV.
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const config = useRuntimeConfig();
const API_BASE = `${config.public.apiUrl}/api/usg`; 

const loading = ref(false);
const voters = ref([]);
const csvFile = ref(null);

const toast = ref({ show: false, type: '', message: '' });
const showToast = (message, type = 'error') => {
  toast.value = { show: true, type, message };
  setTimeout(() => { toast.value.show = false; }, 5000);
};

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

onMounted(() => {
  fetchVoters();
});
</script>
