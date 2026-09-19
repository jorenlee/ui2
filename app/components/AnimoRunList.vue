<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const config = useRuntimeConfig();
const endpoint = ref(config?.public?.apiUrl || "http://127.0.0.1:8000");
if (!endpoint.value || endpoint.value.includes("buang_ka_eyy")) {
  endpoint.value = "http://127.0.0.1:8000";
}

const isLoading = ref(false);
const isConfirming = ref(false);

const confirmModal = ref({
  show: false,
  runner: null,
});

const toastModal = ref({
  show: false,
  title: "Notice",
  message: "",
  type: "success",
});

const showNotice = (message, title = "Notice", type = "success") => {
  toastModal.value = {
    show: true,
    title,
    message,
    type,
  };
};

const closeNotice = () => {
  toastModal.value.show = false;
};

const searchQuery = ref("");
const selectedCategory = ref("All");
const selectedStatus = ref("All");
const selectedParticipantType = ref("All");
const selectedRunner = ref(null);
const isDetailModalOpen = ref(false);

const runCategories = [
  { id: "1K", name: "1K - EMERALD PAWS", color: "bg-sky-500 text-white" },
  { id: "3K", name: "3K — EMERALD STARTER", color: "bg-amber-500 text-white" },
  { id: "10K", name: "10K — EMERALD ENDURANCE", color: "bg-teal-600 text-white" },
  { id: "20K", name: "20K — EMERALD ULTIMATE", color: "bg-emerald-800 text-white" },
];

const registrations = ref([]);

const fetchRegistrations = async () => {
  isLoading.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/list/`);
    if (Array.isArray(res)) {
      registrations.value = res;
    }
  } catch (err) {
    console.error("Error fetching Animo Run registrations:", err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchRegistrations();
});

const getImageUrl = (val) => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (Array.isArray(val) && val.length > 0) {
    return val[0]?.url || null;
  }
  return null;
};

const filteredRegistrations = computed(() => {
  return registrations.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim();
    const fullName = `${item.firstname || ""} ${item.middlename || ""} ${item.lastname || ""}`.toLowerCase();
    const bib = (item.run_number || item.bib_number || "").toLowerCase();
    const email = (item.contact_email || item.email || "").toLowerCase();
    const phone = item.contact_number || item.phone || "";
    const regId = String(item.id || "").toLowerCase();

    const matchesQuery =
      !q ||
      fullName.includes(q) ||
      regId.includes(q) ||
      bib.includes(q) ||
      email.includes(q) ||
      phone.includes(q);

    const category = item.run_category || "";
    const matchesCategory = selectedCategory.value === "All" || category.startsWith(selectedCategory.value);
    const matchesStatus = selectedStatus.value === "All" || item.payment_status === selectedStatus.value;
    const matchesType = selectedParticipantType.value === "All" || item.participant_type === selectedParticipantType.value;

    return matchesQuery && matchesCategory && matchesStatus && matchesType;
  });
});

const stats = computed(() => {
  const totalRunners = registrations.value.length;
  const confirmed = registrations.value.filter((r) => r.payment_status === "Confirmed").length;
  const pending = registrations.value.filter((r) => r.payment_status && r.payment_status.startsWith("Pending")).length;

  return { totalRunners, confirmed, pending };
});

const openDetails = (runner) => {
  selectedRunner.value = runner;
  isDetailModalOpen.value = true;
};

const closeDetails = () => {
  isDetailModalOpen.value = false;
  selectedRunner.value = null;
};

const promptConfirmPayment = (runner) => {
  if (!runner || isConfirming.value) return;
  confirmModal.value = {
    show: true,
    runner,
  };
};

const closeConfirmModal = () => {
  confirmModal.value = {
    show: false,
    runner: null,
  };
};

const executeConfirmPayment = async () => {
  const runner = confirmModal.value.runner;
  if (!runner || isConfirming.value) return;

  isConfirming.value = true;
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/${runner.id}/confirm/`, {
      method: "POST",
      body: {
        confirmed_by: "Admin",
      },
    });

    runner.payment_status = "Confirmed";
    if (selectedRunner.value && selectedRunner.value.id === runner.id) {
      selectedRunner.value.payment_status = "Confirmed";
    }
    closeConfirmModal();
    showNotice(
      `Registration and payment confirmed successfully for ${runner.firstname} ${runner.lastname}.\n\nAn official confirmation email has been dispatched to ${runner.contact_email || runner.email} and BCC'd to calendar@lsu.edu.ph.`,
      "Payment Confirmed!",
      "success"
    );
  } catch (err) {
    console.error("Error confirming payment:", err);
    closeConfirmModal();
    showNotice(
      "Failed to confirm payment on the server. Please verify your local Django server is running on http://127.0.0.1:8000.",
      "Confirmation Failed",
      "error"
    );
  } finally {
    isConfirming.value = false;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
    case "Pending Approval":
    case "Pending Payment":
      return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300";
  }
};
</script>

<template>
  <div :class="[
    'min-h-screen p-2 transition-colors duration-300',
    props.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800',
  ]">
    <div class="space-y-1">
      <!-- HEADER BANNER -->
      <div :class="[
        'relative overflow-hidden rounded-md px-5 py-2 border shadow-xl transition-all',
        props.darkMode
          ? 'bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-green-800/40'
          : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 border-emerald-600 text-white',
      ]">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div class="flex items-center gap-x-3">
            <div
              class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-emerald-200">
              <i class="fas fa-list text-amber-300"></i> Registration Management Portal
            </div>
            <h1 class="text-sm  text-white tracking-tight">
              <span class="font-black">Animo Run 2026 - Participant Status Checking : </span>Track, verify, and manage
              all individual and group runner registrations
            </h1>


          </div>

          <button type="button" @click="fetchRegistrations" :disabled="isLoading"
            class="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm cursor-pointer">
            <i :class="['fas fa-sync-alt', isLoading ? 'fa-spin' : '']"></i>
            {{ isLoading ? 'Refreshing...' : 'Refresh Data' }}
          </button>
        </div>
      </div>

      <!-- STATS SUMMARY CARDS (3 COLUMNS - NO REVENUE/COST FOR DATA PRIVACY) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div :class="[
          'px-5 py-2 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Runners</p>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {{ stats.totalRunners }}
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
            <i class="fas fa-running"></i>
          </div>
        </div>

        <div :class="[
          'px-5 py-2 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed Paid</p>
            <h3 class="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
              {{ stats.confirmed }}
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>

        <div :class="[
          'px-5 py-2 rounded-2xl border shadow-sm transition flex items-center justify-between',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Action</p>
            <h3 class="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              {{ stats.pending }}
            </h3>
          </div>
          <div
            class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
            <i class="fas fa-clock"></i>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER TOOLBAR -->
      <div :class="[
        'p-3 rounded-3xl border shadow-md transition',
        props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
      ]">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Search Input -->
          <div class="relative lg:col-span-1">
            <i class="fas fa-search absolute left-3.5 top-3.5 text-xs text-gray-400"></i>
            <input v-model="searchQuery" type="text" placeholder="Search Name, Reg ID, Bib #, Email..." :class="[
              'w-full pl-9 pr-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]" />
          </div>

          <!-- Category Filter -->
          <div>
            <select v-model="selectedCategory" :class="[
              'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]">
              <option value="All">All Distance Categories</option>
              <option value="1K">1K - EMERALD PAWS (Pet Run)</option>
              <option value="3K">3K — EMERALD STARTER</option>
              <option value="10K">10K — EMERALD ENDURANCE</option>
              <option value="20K">20K — EMERALD ULTIMATE</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select v-model="selectedStatus" :class="[
              'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]">
              <option value="All">All Payment Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Approval">Pending Approval (Salary Deduction)</option>
              <option value="Pending Payment">Pending Payment</option>
            </select>
          </div>

          <!-- Participant Type Filter -->
          <div>
            <select v-model="selectedParticipantType" :class="[
              'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
              props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
            ]">
              <option value="All">All Classifications</option>
              <option value="LSU Higher Education Unit Student">LSU HEU Student (College)</option>
              <option value="LSU Basic Education Unit Student">LSU BEU Student (K-12)</option>
              <option value="Lasallian Partners">Lasallian Partners (Faculty/Staff)</option>
              <option value="Alumni">Lasallian Alumni</option>
              <option value="Non-LSU">Non-LSU Guest</option>
            </select>
          </div>
        </div>
      </div>

      <!-- PARTICIPANTS TABLE -->
      <div :class="[
        'rounded-3xl border shadow-lg overflow-hidden transition',
        props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
      ]">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr :class="[
                'text-[11px] font-bold uppercase tracking-wider border-b transition',
                props.darkMode
                  ? 'bg-gray-900/80 border-gray-700 text-gray-400'
                  : 'bg-emerald-50/60 border-slate-200 text-emerald-900',
              ]">
                <th class="p-4">Reg ID & Bib</th>
                <th class="p-4">Runner Name</th>
                <th class="p-4">Classification</th>
                <th class="p-4">Category</th>
                <th class="p-4">Payment Option</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700/60 text-xs">
              <tr v-for="runner in filteredRegistrations" :key="runner.id" :class="[
                'hover:bg-emerald-50/30 dark:hover:bg-gray-700/40 transition',
              ]">
                <td class="p-4 font-mono">
                  <div class="font-bold text-emerald-600 dark:text-emerald-400">#{{ runner.id }}</div>
                  <span
                    class="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                    RACE BIB {{ runner.run_number || runner.bib_number || ('AR-' + runner.id) }}
                  </span>
                </td>

                <td class="p-4">
                  <div class="font-bold text-gray-900 dark:text-gray-100">
                    {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname
                    }}{{ runner.suffix ? ' ' + runner.suffix : '' }}
                  </div>
                  <div class="text-[11px] text-gray-500 truncate max-w-[180px]">
                    {{ runner.contact_email || runner.email }}
                  </div>
                </td>

                <td class="p-4">
                  <span class="font-medium text-gray-700 dark:text-gray-300 block">
                    {{ runner.participant_type || 'Individual' }}
                  </span>
                  <span class="text-[10px] text-gray-400 block mt-0.5">
                    {{ runner.college_course || runner.beu_grade || runner.partner_office || runner.alumni_batch ||
                      runner.organization || 'General' }}
                  </span>
                </td>

                <td class="p-4">
                  <span :class="[
                    'px-2.5 py-1 rounded-full font-black text-[11px] inline-block shadow-sm',
                    runCategories.find(c => runner.run_category && runner.run_category.startsWith(c.id))?.color || 'bg-emerald-700 text-white',
                  ]">
                    {{ runner.run_category }}
                  </span>
                </td>

                <td class="p-4">
                  <div class="font-medium capitalize">
                    {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : runner.payment_type ===
                      'add_to_tuition' ? 'Add to Tuition' : 'Over the Counter / QR' }}
                  </div>
                  <div class="text-[10px] text-gray-400 font-bold mt-0.5">
                    ₱{{ Number(runner.grand_total_payment || runner.grand_total || 0).toLocaleString() }}
                  </div>
                </td>

                <td class="p-4">
                  <span :class="[
                    'px-2.5 py-1 rounded-xl text-[10px] font-bold border inline-block',
                    getStatusBadge(runner.payment_status),
                  ]">
                    {{ runner.payment_status }}
                  </span>
                </td>

                <td class="p-4 text-center">
                  <button type="button" @click="openDetails(runner)"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1 cursor-pointer">
                    <i class="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>

              <tr v-if="filteredRegistrations.length === 0">
                <td colspan="7" class="p-8 text-center text-gray-500">
                  <i class="fas fa-search text-3xl mb-2 text-gray-400 block"></i>
                  No registration records match your search criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- DETAIL & VERIFICATION MODAL -->
    <div v-if="isDetailModalOpen && selectedRunner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div :class="[
        'relative lg:w-8/12 w-full  rounded-3xl shadow-2xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 transition',
        props.darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200',
      ]">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs uppercase">
                Race Bib {{ selectedRunner.run_number || selectedRunner.bib_number || ('AR-' + selectedRunner.id) }}
              </span>
              <h2 class="text-xl font-black">Runner Registration Details</h2>
            </div>
            <p class="text-xs text-gray-500 mt-1">Ref ID: #{{ selectedRunner.id }} • {{
              selectedRunner.created_at_formatted || selectedRunner.registration_date }}</p>
          </div>

          <button type="button" @click="closeDetails"
            class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold cursor-pointer">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="lg:flex">
          <!-- Personal Details -->
          <div class="w-full">




            <div class="space-y-3 gap-4 text-xs">
              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Full Name</label>
                <p class="font-semibold">
                  {{ selectedRunner.firstname }} {{ selectedRunner.middlename }} {{ selectedRunner.lastname }}{{
                    selectedRunner.suffix ? ' ' + selectedRunner.suffix : '' }}
                </p>
              </div>

              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Gender & Birthdate</label>
                <p class="font-semibold">
                  {{ selectedRunner.gender || 'Not specified' }} • {{ selectedRunner.birthdate || 'N/A' }}
                </p>
              </div>

              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Contact Phone</label>
                <p class="font-semibold">{{ selectedRunner.contact_number || selectedRunner.phone || 'N/A' }}</p>
              </div>

              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Email Address</label>
                <p class="font-semibold">{{ selectedRunner.contact_email || selectedRunner.email }}</p>
              </div>

              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Classification & LSU ID</label>
                <p class="font-semibold">{{ selectedRunner.participant_type }} {{ selectedRunner.lsu_id_number ? '(' +
                  selectedRunner.lsu_id_number + ')' : '' }}</p>
              </div>

              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">T-Shirt Size</label>
                <p class="font-semibold">{{ selectedRunner.tshirt_size || 'M' }}</p>
              </div>

              <div class="lg:flex">
                <label class="font-bold text-gray-500 block lg:w-3/12 uppercase">Address</label>
                <p class="font-semibold">{{ selectedRunner.contact_address || selectedRunner.address || 'Ozamiz City' }}
                </p>
              </div>

            </div>

            <!-- Valid ID Section -->
            <div v-if="getImageUrl(selectedRunner.valid_id_front) || getImageUrl(selectedRunner.valid_id_back)">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Submitted Valid ID Documents
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-if="getImageUrl(selectedRunner.valid_id_front)"
                  class="border rounded-2xl p-2 text-center bg-slate-50 dark:bg-gray-900/40">
                  <span class="text-[10px] font-semibold text-gray-500 block mb-1">ID Front</span>
                  <img :src="getImageUrl(selectedRunner.valid_id_front)" alt="ID Front"
                    class="w-full h-32 object-cover rounded-xl border" />
                </div>

                <div v-if="getImageUrl(selectedRunner.valid_id_back)"
                  class="border rounded-2xl p-2 text-center bg-slate-50 dark:bg-gray-900/40">
                  <span class="text-[10px] font-semibold text-gray-500 block mb-1">ID Back</span>
                  <img :src="getImageUrl(selectedRunner.valid_id_back)" alt="ID Back"
                    class="w-full h-32 object-cover rounded-xl border" />
                </div>
              </div>
            </div>



          </div>

          <div class="lg:w-6/12">
            <!-- Category & Addons / Pet Details -->
            <div :class="[
              'p-4 rounded-2xl border space-y-3 text-xs',
              props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-emerald-50/50 border-emerald-200',
            ]">
              <div class="flex items-center justify-between">
                <span class="font-bold text-emerald-800 dark:text-emerald-300">Run Category</span>
                <span class="font-black text-sm text-emerald-700 dark:text-emerald-400">
                  {{ selectedRunner.run_category }}
                </span>
              </div>

              <!-- Pet details if 1K Pet Run -->
              <div v-if="selectedRunner.pet_name"
                class="p-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border space-y-1">
                <span class="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <i class="fas fa-paw"></i> Pet Runner Details:
                </span>
                <p><strong>Name:</strong> {{ selectedRunner.pet_name }} ({{ selectedRunner.pet_type || 'Dog' }}{{
                  selectedRunner.pet_breed ? ' - ' + selectedRunner.pet_breed : '' }})</p>
                <p><strong>Bandana Size:</strong> {{ selectedRunner.pet_bandana_size || 'Medium' }} |
                  <strong>Vaccinated:</strong> {{ selectedRunner.pet_vaccinated ? 'Yes' : 'No' }}</p>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-gray-700">
                <span class="font-semibold text-gray-600 dark:text-gray-400">Total Registration Fee:</span>
                <span class="font-black text-base text-emerald-600 dark:text-emerald-400">
                  ₱{{ Number(selectedRunner.grand_total_payment || selectedRunner.grand_total || 0).toLocaleString() }}
                </span>
              </div>
            </div>


            <!-- Proof of Payment Receipt (if uploaded) -->
            <div v-if="selectedRunner.proof_of_payment">

              <div
                class="border rounded-2xl lg:mt-5 p-3 bg-slate-50 dark:bg-gray-900/40 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <img :src="selectedRunner.proof_of_payment" alt="Payment Receipt"
                    class="w-16 h-16 object-cover rounded-lg border" />
                  <div>
                    <p class="font-bold text-xs">Payment Receipt</p>
                    <p class="font-bold text-xs">Proof Attached</p>
                  </div>
                </div>
                <a :href="selectedRunner.proof_of_payment" target="_blank"
                  class="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition whitespace-nowrap">
                  <i class="fas fa-external-link-alt mr-1"></i> View Receipt
                </a>
              </div>
            </div>

          </div>
        </div>
        <!-- Action / Status Management -->
        <div class="pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-medium">Status:</span>
            <span
              :class="['px-2.5 py-0.5 rounded-lg border font-bold text-xs', getStatusBadge(selectedRunner.payment_status)]">
              {{ selectedRunner.payment_status }}
            </span>
            <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium ml-1">
              <i class="fas fa-shield-alt text-emerald-600 mr-1"></i> No Refund Policy
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button v-if="selectedRunner.payment_status !== 'Confirmed'" type="button"
              @click="promptConfirmPayment(selectedRunner)" :disabled="isConfirming"
              class="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5">
              <i v-if="!isConfirming" class="fas fa-check"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span>{{ isConfirming ? 'Processing...' : 'Approve / Confirm Payment' }}</span>
            </button>
            <span v-else class="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <i class="fas fa-check-circle"></i> Registration Confirmed
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ADMIN CONFIRMATION DIALOG MODAL (REPLACES BROWSER CONFIRM) -->
    <div v-if="confirmModal.show && confirmModal.runner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeConfirmModal">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>

        <div
          class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-sm mt-2">
          <i class="fas fa-envelope-circle-check"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            Confirm Payment & Issue Bib?
          </h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You are approving registration for:
          </p>
          <div class="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-gray-900/50 border text-left text-xs space-y-1">
            <p><strong>Runner:</strong> {{ confirmModal.runner.firstname }} {{ confirmModal.runner.lastname }}</p>
            <p><strong>Bib Number:</strong> {{ confirmModal.runner.run_number || confirmModal.runner.bib_number }}</p>
            <p><strong>Category:</strong> {{ confirmModal.runner.run_category }}</p>
            <p><strong>Recipient:</strong> {{ confirmModal.runner.contact_email || confirmModal.runner.email }}</p>
          </div>
        </div>

        <div
          class="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 text-left">
          <i class="fas fa-info-circle mr-1"></i> An official registration & payment confirmation email will be
          dispatched to the runner and BCC'd to <strong>animorun@lsu.edu.ph</strong>.
        </div>

        <div class="flex items-center gap-2 pt-2">
          <button type="button" @click="closeConfirmModal" :disabled="isConfirming"
            class="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold transition cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="executeConfirmPayment" :disabled="isConfirming"
            class="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5">
            <i v-if="!isConfirming" class="fas fa-check"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            <span>{{ isConfirming ? 'Sending Email...' : 'Yes, Confirm & Send' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST NOTIFICATION MODAL (REPLACES BROWSER ALERT) -->
    <div v-if="toastModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeNotice">
      <div :class="[
        'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
        props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
      ]">
        <div :class="[
          'absolute top-0 left-0 right-0 h-1.5',
          toastModal.type === 'error'
            ? 'bg-rose-500'
            : toastModal.type === 'success'
              ? 'bg-emerald-500'
              : 'bg-amber-500'
        ]"></div>

        <div :class="[
          'w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-sm mt-2',
          toastModal.type === 'error'
            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
            : toastModal.type === 'success'
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
        ]">
          <i :class="[
            toastModal.type === 'error'
              ? 'fas fa-exclamation-circle'
              : toastModal.type === 'success'
                ? 'fas fa-check-circle'
                : 'fas fa-info-circle'
          ]"></i>
        </div>

        <div>
          <h3 class="text-lg font-black tracking-tight">
            {{ toastModal.title }}
          </h3>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line px-2">
            {{ toastModal.message }}
          </p>
        </div>

        <div class="pt-2">
          <button type="button" @click="closeNotice" :class="[
            'w-full py-3 px-5 rounded-2xl font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-white',
            toastModal.type === 'error'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          ]">
            <span>Understood</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
