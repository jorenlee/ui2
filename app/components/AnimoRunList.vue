<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const searchQuery = ref("");
const selectedCategory = ref("All");
const selectedStatus = ref("All");
const selectedParticipantType = ref("All");
const selectedRunner = ref(null);
const isDetailModalOpen = ref(false);

const runCategories = [
  { id: "3K", name: "3K Fun Run", color: "bg-emerald-500 text-white" },
  { id: "5K", name: "5K Fitness Run", color: "bg-green-600 text-white" },
  { id: "10K", name: "10K Challenge", color: "bg-teal-600 text-white" },
  { id: "21K", name: "21K Half Marathon", color: "bg-emerald-800 text-white" },
];

const registrations = ref([
  {
    id: "REG-2026-001",
    bib_number: "21K-001",
    firstname: "Juan",
    middlename: "Santos",
    lastname: "Dela Cruz",
    email: "juan.delacruz@lsu.edu.ph",
    phone: "09171234567",
    address: "Brangay Bañadero, Ozamiz City",
    birthdate: "1998-05-14",
    gender: "Male",
    participant_type: "LSU Higher Education Unit Student",
    college_course: "BSIT",
    college_year: "4th Year",
    run_category: "21K",
    fee: 1200,
    addons: ["Animo Dri-Fit Event Singlet", "Finisher Medal Custom Engraving"],
    addon_total: 500,
    grand_total: 1700,
    payment_type: "direct_payment",
    payment_status: "Confirmed",
    registration_date: "2026-07-28 10:30 AM",
    valid_id_front: "https://via.placeholder.com/400x250/10b981/ffffff?text=LSU+Student+ID+Front",
    valid_id_back: "https://via.placeholder.com/400x250/047857/ffffff?text=LSU+Student+ID+Back",
  },
  {
    id: "REG-2026-002",
    bib_number: "10K-042",
    firstname: "Maria",
    middlename: "Clara",
    lastname: "Gonzales",
    email: "maria.gonzales@gmail.com",
    phone: "09189876543",
    address: "Carangan, Ozamiz City",
    birthdate: "2001-11-20",
    gender: "Female",
    participant_type: "Non-LSU",
    organization: "Ozamiz Striders Runners Club",
    run_category: "10K",
    fee: 800,
    addons: ["LSU Animo Stainless Flask (750ml)"],
    addon_total: 250,
    grand_total: 1050,
    payment_type: "direct_payment",
    payment_status: "Confirmed",
    registration_date: "2026-07-28 02:15 PM",
    valid_id_front: "https://via.placeholder.com/400x250/10b981/ffffff?text=Driver+License+Front",
    valid_id_back: "https://via.placeholder.com/400x250/047857/ffffff?text=Driver+License+Back",
  },
  {
    id: "REG-2026-003",
    bib_number: "5K-108",
    firstname: "Mark",
    middlename: "Anthony",
    lastname: "Reyes",
    email: "mark.reyes@lsu.edu.ph",
    phone: "09205551234",
    address: "Catadman, Ozamiz City",
    birthdate: "1988-03-09",
    gender: "Male",
    participant_type: "Lasallian Partners",
    partner_office: "College of Computer Studies",
    run_category: "5K",
    fee: 500,
    addons: ["Custom Name Printed on Race Bib"],
    addon_total: 100,
    grand_total: 600,
    payment_type: "salary_deduction",
    payment_status: "Pending Approval",
    registration_date: "2026-07-29 09:05 AM",
    valid_id_front: "https://via.placeholder.com/400x250/10b981/ffffff?text=Faculty+ID+Front",
    valid_id_back: "https://via.placeholder.com/400x250/047857/ffffff?text=Faculty+ID+Back",
  },
  {
    id: "REG-2026-004",
    bib_number: "3K-015",
    firstname: "Sophia",
    middlename: "Grace",
    lastname: "Torres",
    email: "sophia.torres@gmail.com",
    phone: "09173334455",
    address: "Lam-an, Ozamiz City",
    birthdate: "2012-08-12",
    gender: "Female",
    participant_type: "LSU Basic Education Unit Student",
    beu_grade: "Grade 8 JHS",
    run_category: "3K",
    fee: 300,
    addons: [],
    addon_total: 0,
    grand_total: 300,
    payment_type: "direct_payment",
    payment_status: "Confirmed",
    registration_date: "2026-07-29 11:40 AM",
    valid_id_front: "https://via.placeholder.com/400x250/10b981/ffffff?text=BEU+ID+Front",
    valid_id_back: "https://via.placeholder.com/400x250/047857/ffffff?text=BEU+ID+Back",
  },
  {
    id: "REG-2026-005",
    bib_number: "21K-008",
    firstname: "Joseph",
    middlename: "Paul",
    lastname: "Villanueva",
    email: "joseph.v@yahoo.com",
    phone: "09998887766",
    address: "Tangub City, Misamis Occidental",
    birthdate: "1994-01-30",
    gender: "Male",
    participant_type: "Alumni",
    alumni_batch: "Batch 2016",
    run_category: "21K",
    fee: 1200,
    addons: ["Animo Dri-Fit Event Singlet", "Finisher Medal Custom Engraving", "LSU Animo Stainless Flask (750ml)"],
    addon_total: 750,
    grand_total: 1950,
    payment_type: "direct_payment",
    payment_status: "Pending Payment",
    registration_date: "2026-07-30 08:12 AM",
    valid_id_front: "https://via.placeholder.com/400x250/10b981/ffffff?text=Alumni+ID+Front",
    valid_id_back: "https://via.placeholder.com/400x250/047857/ffffff?text=Alumni+ID+Back",
  },
]);

const filteredRegistrations = computed(() => {
  return registrations.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim();
    const fullName = `${item.firstname} ${item.middlename || ""} ${item.lastname}`.toLowerCase();
    const matchesQuery =
      !q ||
      fullName.includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.bib_number.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.includes(q);

    const matchesCategory = selectedCategory.value === "All" || item.run_category === selectedCategory.value;
    const matchesStatus = selectedStatus.value === "All" || item.payment_status === selectedStatus.value;
    const matchesType = selectedParticipantType.value === "All" || item.participant_type === selectedParticipantType.value;

    return matchesQuery && matchesCategory && matchesStatus && matchesType;
  });
});

const stats = computed(() => {
  const totalRunners = registrations.value.length;
  const confirmed = registrations.value.filter((r) => r.payment_status === "Confirmed").length;
  const pending = registrations.value.filter((r) => r.payment_status.startsWith("Pending")).length;
  const totalRevenue = registrations.value
    .filter((r) => r.payment_status === "Confirmed")
    .reduce((sum, r) => sum + r.grand_total, 0);

  return { totalRunners, confirmed, pending, totalRevenue };
});

const openDetails = (runner) => {
  selectedRunner.value = runner;
  isDetailModalOpen.value = true;
};

const closeDetails = () => {
  isDetailModalOpen.value = false;
  selectedRunner.value = null;
};

const updateStatus = (runner, newStatus) => {
  runner.payment_status = newStatus;
  if (selectedRunner.value && selectedRunner.value.id === runner.id) {
    selectedRunner.value.payment_status = newStatus;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
    case "Pending Approval":
    case "Pending Payment":
      return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    case "Cancelled":
      return "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300";
  }
};
</script>

<template>
  <div
    :class="[
      'min-h-screen py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-300',
      props.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800',
    ]"
  >
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- HEADER BANNER -->
      <div
        :class="[
          'relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl transition-all',
          props.darkMode
            ? 'bg-gradient-to-r from-emerald-950 via-gray-900 to-emerald-950 border-green-800/40'
            : 'bg-gradient-to-r from-emerald-700 via-teal-700 to-green-800 border-emerald-600 text-white',
        ]"
      >
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-semibold text-emerald-200 mb-2">
              <i class="fas fa-list text-amber-300"></i> Registration Management Portal
            </div>
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Animo Run 2026 - Participant Status Checking
            </h1>
            <p class="text-xs sm:text-sm text-emerald-100 mt-1">
              Track, verify, and manage all individual and group runner registrations
            </p>
          </div>

          <button
            type="button"
            @click="$emit('refresh')"
            class="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <i class="fas fa-sync-alt"></i> Refresh Data
          </button>
        </div>
      </div>

      <!-- STATS SUMMARY CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          :class="[
            'p-5 rounded-2xl border shadow-sm transition flex items-center justify-between',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]"
        >
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Runners</p>
            <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {{ stats.totalRunners }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
            <i class="fas fa-running"></i>
          </div>
        </div>

        <div
          :class="[
            'p-5 rounded-2xl border shadow-sm transition flex items-center justify-between',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]"
        >
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed Paid</p>
            <h3 class="text-2xl font-black text-green-600 dark:text-green-400 mt-1">
              {{ stats.confirmed }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-950/80 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
            <i class="fas fa-check-circle"></i>
          </div>
        </div>

        <div
          :class="[
            'p-5 rounded-2xl border shadow-sm transition flex items-center justify-between',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]"
        >
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Action</p>
            <h3 class="text-2xl font-black text-amber-500 dark:text-amber-400 mt-1">
              {{ stats.pending }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl">
            <i class="fas fa-clock"></i>
          </div>
        </div>

        <div
          :class="[
            'p-5 rounded-2xl border shadow-sm transition flex items-center justify-between',
            props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
          ]"
        >
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed Revenue</p>
            <h3 class="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              ₱{{ stats.totalRevenue.toLocaleString() }}
            </h3>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl">
            <i class="fas fa-wallet"></i>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER TOOLBAR -->
      <div
        :class="[
          'p-5 rounded-3xl border shadow-md space-y-4 transition',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Search Input -->
          <div class="relative lg:col-span-1">
            <i class="fas fa-search absolute left-3.5 top-3.5 text-xs text-gray-400"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Name, Reg ID, Bib #, Email..."
              :class="[
                'w-full pl-9 pr-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]"
            />
          </div>

          <!-- Category Filter -->
          <div>
            <select
              v-model="selectedCategory"
              :class="[
                'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]"
            >
              <option value="All">All Distance Categories</option>
              <option value="3K">3K Fun Run</option>
              <option value="5K">5K Fitness Run</option>
              <option value="10K">10K Challenge</option>
              <option value="21K">21K Half Marathon</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              v-model="selectedStatus"
              :class="[
                'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending Approval">Pending Approval (Salary Deduction)</option>
              <option value="Pending Payment">Pending Payment</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Participant Type Filter -->
          <div>
            <select
              v-model="selectedParticipantType"
              :class="[
                'w-full px-3.5 py-2.5 rounded-2xl border text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition',
                props.darkMode ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-slate-50 border-gray-300 text-gray-800',
              ]"
            >
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
      <div
        :class="[
          'rounded-3xl border shadow-lg overflow-hidden transition',
          props.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200',
        ]"
      >
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                :class="[
                  'text-[11px] font-bold uppercase tracking-wider border-b transition',
                  props.darkMode
                    ? 'bg-gray-900/80 border-gray-700 text-gray-400'
                    : 'bg-emerald-50/60 border-slate-200 text-emerald-900',
                ]"
              >
                <th class="p-4">Reg ID & Bib</th>
                <th class="p-4">Runner Name</th>
                <th class="p-4">Classification</th>
                <th class="p-4">Category</th>
                <th class="p-4">Total Fee</th>
                <th class="p-4">Payment Option</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700/60 text-xs">
              <tr
                v-for="runner in filteredRegistrations"
                :key="runner.id"
                :class="[
                  'hover:bg-emerald-50/30 dark:hover:bg-gray-700/40 transition',
                ]"
              >
                <td class="p-4 font-mono">
                  <div class="font-bold text-emerald-600 dark:text-emerald-400">{{ runner.id }}</div>
                  <span class="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px]">
                    Bib {{ runner.bib_number }}
                  </span>
                </td>

                <td class="p-4">
                  <div class="font-bold text-gray-900 dark:text-gray-100">
                    {{ runner.firstname }} {{ runner.middlename ? runner.middlename[0] + '.' : '' }} {{ runner.lastname }}
                  </div>
                  <div class="text-[11px] text-gray-500 truncate max-w-[180px]">
                    {{ runner.email }}
                  </div>
                </td>

                <td class="p-4">
                  <span class="font-medium text-gray-700 dark:text-gray-300 block">
                    {{ runner.participant_type }}
                  </span>
                  <span class="text-[10px] text-gray-400 block mt-0.5">
                    {{ runner.college_course || runner.beu_grade || runner.partner_office || runner.alumni_batch || runner.organization || 'Individual' }}
                  </span>
                </td>

                <td class="p-4">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full font-black text-[11px] inline-block shadow-sm',
                      runCategories.find(c => c.id === runner.run_category)?.color || 'bg-gray-600 text-white',
                    ]"
                  >
                    {{ runner.run_category }}
                  </span>
                </td>

                <td class="p-4 font-bold text-gray-900 dark:text-gray-100">
                  ₱{{ runner.grand_total.toLocaleString() }}
                  <span v-if="runner.addons.length > 0" class="block text-[10px] font-normal text-emerald-600 dark:text-emerald-400">
                    +{{ runner.addons.length }} add-on(s)
                  </span>
                </td>

                <td class="p-4">
                  <span class="capitalize font-medium">
                    {{ runner.payment_type === 'salary_deduction' ? 'Salary Deduction' : 'Direct / Stripe' }}
                  </span>
                </td>

                <td class="p-4">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-xl text-[10px] font-bold border inline-block',
                      getStatusBadge(runner.payment_status),
                    ]"
                  >
                    {{ runner.payment_status }}
                  </span>
                </td>

                <td class="p-4 text-center">
                  <button
                    type="button"
                    @click="openDetails(runner)"
                    class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition inline-flex items-center gap-1"
                  >
                    <i class="fas fa-eye"></i> View
                  </button>
                </td>
              </tr>

              <tr v-if="filteredRegistrations.length === 0">
                <td colspan="8" class="p-8 text-center text-gray-500">
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
    <div
      v-if="isDetailModalOpen && selectedRunner"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        :class="[
          'relative w-full max-w-2xl rounded-3xl shadow-2xl border p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 transition',
          props.darkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-800 border-slate-200',
        ]"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b pb-4 dark:border-gray-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs">
                {{ selectedRunner.bib_number }}
              </span>
              <h2 class="text-xl font-black">Runner Registration Details</h2>
            </div>
            <p class="text-xs text-gray-500 mt-1">Ref ID: {{ selectedRunner.id }} • {{ selectedRunner.registration_date }}</p>
          </div>

          <button
            type="button"
            @click="closeDetails"
            class="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-rose-500 hover:text-white transition flex items-center justify-center font-bold"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Personal Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="font-bold text-gray-500 block">Full Name</label>
            <p class="font-semibold text-sm mt-0.5">
              {{ selectedRunner.firstname }} {{ selectedRunner.middlename }} {{ selectedRunner.lastname }}
            </p>
          </div>

          <div>
            <label class="font-bold text-gray-500 block">Gender & Birthdate</label>
            <p class="font-semibold mt-0.5">
              {{ selectedRunner.gender }} • {{ selectedRunner.birthdate }}
            </p>
          </div>

          <div>
            <label class="font-bold text-gray-500 block">Contact Phone</label>
            <p class="font-semibold mt-0.5">{{ selectedRunner.phone }}</p>
          </div>

          <div>
            <label class="font-bold text-gray-500 block">Email Address</label>
            <p class="font-semibold mt-0.5">{{ selectedRunner.email }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="font-bold text-gray-500 block">Address</label>
            <p class="font-semibold mt-0.5">{{ selectedRunner.address }}</p>
          </div>
        </div>

        <!-- Category & Addons -->
        <div
          :class="[
            'p-4 rounded-2xl border space-y-3 text-xs',
            props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-emerald-50/50 border-emerald-200',
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-emerald-800 dark:text-emerald-300">Run Category</span>
            <span class="font-black text-sm text-emerald-700 dark:text-emerald-400">
              {{ selectedRunner.run_category }} (₱{{ selectedRunner.fee }})
            </span>
          </div>

          <div v-if="selectedRunner.addons.length > 0">
            <span class="font-bold block mb-1 text-gray-600 dark:text-gray-400">Selected Add-ons:</span>
            <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li v-for="(addon, aIdx) in selectedRunner.addons" :key="aIdx">
                {{ addon }}
              </li>
            </ul>
          </div>

          <div class="border-t pt-2 dark:border-gray-700 flex justify-between font-black text-sm">
            <span>Grand Total</span>
            <span class="text-emerald-600 dark:text-emerald-400">₱{{ selectedRunner.grand_total.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Valid ID Section -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Submitted Valid ID Documents</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="border rounded-2xl p-2 text-center">
              <span class="text-[10px] font-semibold text-gray-500 block mb-1">ID Front</span>
              <img :src="selectedRunner.valid_id_front" alt="ID Front" class="w-full h-32 object-cover rounded-xl border" />
            </div>

            <div class="border rounded-2xl p-2 text-center">
              <span class="text-[10px] font-semibold text-gray-500 block mb-1">ID Back</span>
              <img :src="selectedRunner.valid_id_back" alt="ID Back" class="w-full h-32 object-cover rounded-xl border" />
            </div>
          </div>
        </div>

        <!-- Action / Status Management -->
        <div class="pt-4 border-t dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-xs font-medium">
            Status:
            <span :class="['px-2 py-0.5 rounded-lg border font-bold ml-1', getStatusBadge(selectedRunner.payment_status)]">
              {{ selectedRunner.payment_status }}
            </span>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="updateStatus(selectedRunner, 'Confirmed')"
              class="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
            >
              <i class="fas fa-check"></i> Approve / Confirm
            </button>

            <button
              type="button"
              @click="updateStatus(selectedRunner, 'Cancelled')"
              class="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs transition shadow-sm"
            >
              <i class="fas fa-ban"></i> Cancel Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
