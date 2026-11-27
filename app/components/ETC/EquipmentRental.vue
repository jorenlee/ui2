<script setup>
import { ref, computed } from 'vue';

const activeTab = ref('rates');
const categoryFilter = ref('All');
const search = ref('');

const categories = ['All', 'Camera', 'Audio', 'Lighting', 'Tripods & Stabilizers', 'Streaming & Control'];

const rentalItems = [
  // Camera Equipment
  { category: 'Camera', name: 'DSLR Camera 1 (CANON 6D Mark 2)', acquired: 'Jan. 26, 2021', origPrice: '₱152,880.00', hr1: '₱3,000.00', hr3: '₱4,500.00', hr8: '₱8,000.00', day1: '₱15,000.00' },
  { category: 'Camera', name: 'DSLR Camera 2 (CANON 6D Mark 2)', acquired: 'Jan. 26, 2021', origPrice: '₱152,880.00', hr1: '₱3,000.00', hr3: '₱4,500.00', hr8: '₱8,000.00', day1: '₱15,000.00' },
  { category: 'Camera', name: 'Mirrorless Camera 1–4 (Sony A6400)', acquired: 'Jan. 26, 2021', origPrice: '₱94,080.00', hr1: '₱1,200.00', hr3: '₱1,800.00', hr8: '₱3,000.00', day1: '₱6,000.00' },

  // Audio Equipment
  { category: 'Audio', name: 'Digital Mixer (Audio RODE Digital Mixer)', acquired: 'Mar. 15, 2023', origPrice: '₱24,990.00', hr1: '₱1,000.00', hr3: '₱1,500.00', hr8: '₱3,000.00', day1: '₱5,000.00' },
  { category: 'Audio', name: 'Lavalier Mic (Dual Omni-directional)', acquired: 'Sept. 30, 2020', origPrice: '₱1,400.00', hr1: '₱50.00', hr3: '₱100.00', hr8: '₱250.00', day1: '₱500.00' },
  { category: 'Audio', name: 'Gooseneck Microphone 1 & 2 (Trident)', acquired: 'Mar. 11, 2021', origPrice: '₱2,000.00', hr1: '₱50.00', hr3: '₱100.00', hr8: '₱250.00', day1: '₱500.00' },
  { category: 'Audio', name: 'Lapel Microphone 1 & 2 (Sennheiser EW 135 P G3)', acquired: 'Jan. 26, 2021', origPrice: '₱40,320.00', hr1: '₱800.00', hr3: '₱1,200.00', hr8: '₱2,000.00', day1: '₱4,000.00' },
  { category: 'Audio', name: 'Multi-channel Audio Interface (RODEcaster Pro)', acquired: 'Jan. 26, 2021', origPrice: '₱47,040.00', hr1: '₱500.00', hr3: '₱750.00', hr8: '₱1,250.00', day1: '₱2,500.00' },
  { category: 'Audio', name: 'Boom Microphone 1 & 2 (Rode NTG4 / NTG4+)', acquired: 'Jan. 26, 2021', origPrice: '₱23,520.00', hr1: '₱500.00', hr3: '₱750.00', hr8: '₱1,200.00', day1: '₱2,500.00' },
  { category: 'Audio', name: 'Condenser Microphone 1–4 (SM7B Shure Mic)', acquired: 'Jan. 26, 2021', origPrice: '₱33,594.40', hr1: '₱500.00', hr3: '₱750.00', hr8: '₱1,200.00', day1: '₱2,500.00' },
  { category: 'Audio', name: 'Lavalier Mic 1–4 (UWMIC RX9+TX9 Saramonic)', acquired: 'Jan. 26, 2021', origPrice: '₱15,008.00', hr1: '₱300.00', hr3: '₱450.00', hr8: '₱750.00', day1: '₱1,500.00' },
  { category: 'Audio', name: 'Handy Audio Recorder 1 & 2 (Zoom H1n Black)', acquired: 'Jan. 26, 2021', origPrice: '₱7,168.00', hr1: '₱150.00', hr3: '₱250.00', hr8: '₱400.00', day1: '₱750.00' },

  // Lighting Equipment
  { category: 'Lighting', name: 'LED Light Kit 1–3 (2 LED Light/Kit)', acquired: 'Mar. 15, 2023', origPrice: '₱15,990.00', hr1: '₱350.00', hr3: '₱500.00', hr8: '₱800.00', day1: '₱1,600.00' },
  { category: 'Lighting', name: 'SMALL Light Rig 1–3 (SMALLRIG RM75)', acquired: 'Mar. 15, 2023', origPrice: '₱4,000.00', hr1: '₱80.00', hr3: '₱120.00', hr8: '₱200.00', day1: '₱400.00' },
  { category: 'Lighting', name: 'RGB Light Tube 1 & 2 (Nanlight Pavo Tube)', acquired: 'Mar. 15, 2023', origPrice: '₱34,490.00', hr1: '₱700.00', hr3: '₱1,100.00', hr8: '₱1,800.00', day1: '₱3,500.00' },
  { category: 'Lighting', name: 'Mini Flood Light Set 1–3 (4 Flood Lights/Set)', acquired: 'Sept. 30, 2020', origPrice: '₱1,500.00', hr1: '₱50.00', hr3: '₱100.00', hr8: '₱250.00', day1: '₱500.00' },
  { category: 'Lighting', name: 'Strobe Light 1 & 2 (GODOX)', acquired: 'Mar. 15, 2023', origPrice: '₱9,800.00', hr1: '₱200.00', hr3: '₱300.00', hr8: '₱500.00', day1: '₱1,000.00' },

  // Tripods & Stabilizers
  { category: 'Tripods & Stabilizers', name: 'Camera Tripod 1–6 (BENRO)', acquired: 'Jan. 26, 2021', origPrice: '₱13,428.80', hr1: '₱300.00', hr3: '₱500.00', hr8: '₱750.00', day1: '₱1,300.00' },
  { category: 'Tripods & Stabilizers', name: 'Camera Stabilizer 1 & 2 (RONIN-S)', acquired: 'Jan. 26, 2021', origPrice: '₱31,360.00', hr1: '₱700.00', hr3: '₱950.00', hr8: '₱1,500.00', day1: '₱3,200.00' },
  { category: 'Tripods & Stabilizers', name: 'Mobile Phone Gimbal (FEIYUTECH)', acquired: 'Sept. 30, 2020', origPrice: '₱7,500.00', hr1: '₱150.00', hr3: '₱230.00', hr8: '₱380.00', day1: '₱750.00' },

  // Streaming & Control Equipment
  { category: 'Streaming & Control', name: 'Video Switcher (ATEM Mini Pro Software Control)', acquired: '—', origPrice: '—', hr1: '₱1,000.00', hr3: '₱1,500.00', hr8: '₱2,500.00', day1: '₱5,000.00' },
  { category: 'Streaming & Control', name: 'Video Capture Card 1–5 (ezCapture)', acquired: '—', origPrice: '—', hr1: '₱50.00', hr3: '₱100.00', hr8: '₱250.00', day1: '₱500.00' },
];

const steps = [
  'Open ETC Services Google Form (https://bit.ly/ETCRequestS).',
  'Read La Salle University\'s Media Release Form, review authorization, and check boxes.',
  'Fill in Primary Information.',
  'In ETC Services, choose "Multimedia Equipment Rental".',
  'Read the Multimedia Equipment Rental Policy and check the agreement box.',
  'Choose the Multimedia Equipment you want to rent.',
  'Fill in Event, Equipment Rental, and Payment Details.',
  'Complete ETC Services Evaluation (bit.ly/ETCServicesEvalForm) after service rendered.',
  'Click Submit.',
];

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase();
  return rentalItems.filter((item) => {
    const matchCat = categoryFilter.value === 'All' || item.category === categoryFilter.value;
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
});
</script>

<template>
  <section id="equipment-rental" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Certified Production Gear</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multimedia Equipment <span class="text-[#14532d]">Rental</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
            Access DSLR/mirrorless cameras, audio gear, lighting kits, tripods/stabilizers, and streaming switchers (requires ETC equipment handling certification).
          </p>
        </div>

        <div class="inline-flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#f0f5f0] border border-green-900/15 self-start md:self-auto">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'rates' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'rates'"
          >
            Rental Rates
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'policy' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'policy'"
          >
            MER Policy &amp; Fees
          </button>
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="activeTab === 'steps' ? 'bg-[#14532d] text-white' : 'text-[#14532d] hover:bg-white'"
            @click="activeTab = 'steps'"
          >
            Request Steps (1–9)
          </button>
        </div>
      </div>

      <!-- Tab 1: Rental Rates -->
      <div v-if="activeTab === 'rates'" class="space-y-5">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="cat in categories"
              :key="cat"
              type="button"
              class="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors"
              :class="categoryFilter === cat
                ? 'bg-[#14532d] text-white border-[#14532d]'
                : 'bg-[#f5f7f4] text-slate-700 border-green-900/15 hover:border-[#14532d]'"
              @click="categoryFilter = cat"
            >
              {{ cat }}
            </button>
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="Search camera, light, tripod, switcher..."
            class="w-full lg:w-64 px-3.5 py-2 text-xs border border-green-900/20 rounded-xl bg-[#f5f7f4] focus:bg-white focus:border-[#14532d] outline-none"
          />
        </div>

        <div class="overflow-x-auto rounded-2xl border border-green-900/15">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-[#14532d] text-white uppercase tracking-wider">
                <th class="py-3 px-4 font-bold">Equipment</th>
                <th class="py-3 px-3 font-bold text-right">1 HR</th>
                <th class="py-3 px-3 font-bold text-right">3 HR (9–12 / 1:30–4:30)</th>
                <th class="py-3 px-3 font-bold text-right">8 HRS</th>
                <th class="py-3 px-3 font-bold text-right">1 DAY</th>
                <th class="py-3 px-4 font-bold text-right hidden md:table-cell">Original Price</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-green-900/10">
              <tr v-for="item in filteredItems" :key="item.name" class="odd:bg-[#fafcfa] even:bg-[#f0f5f0]/60">
                <td class="py-3 px-4 font-bold text-slate-900">
                  {{ item.name }}
                  <span class="block text-[10px] font-normal text-slate-500">
                    {{ item.category }} · Acq. {{ item.acquired }}
                  </span>
                </td>
                <td class="py-3 px-3 font-mono font-bold text-[#14532d] text-right">{{ item.hr1 }}</td>
                <td class="py-3 px-3 font-mono font-bold text-[#14532d] text-right">{{ item.hr3 }}</td>
                <td class="py-3 px-3 font-mono font-bold text-[#14532d] text-right">{{ item.hr8 }}</td>
                <td class="py-3 px-3 font-mono font-bold text-[#14532d] text-right">{{ item.day1 }}</td>
                <td class="py-3 px-4 font-mono text-slate-500 text-right hidden md:table-cell">{{ item.origPrice }}</td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="py-8 text-center text-xs text-slate-500">
                  No matching rental equipment found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2: MER Policy & Fees -->
      <div v-else-if="activeTab === 'policy'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-700 leading-relaxed">
        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-3">
          <h3 class="text-base font-extrabold text-[#14532d]">Eligibility, Training &amp; Deposit</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li><strong>Eligibility:</strong> Lasallian Partners, bona fide students, and external clients.</li>
            <li><strong>Training &amp; Certification:</strong> Clients must complete ETC's modular training on operation, handling, and safety guidelines before renting.</li>
            <li><strong>External Clients Deposit:</strong> <strong>50% refundable security deposit</strong> of total rental cost, refunded after inspection.</li>
            <li><strong>Early Collection:</strong> Pick up at least <strong>30 minutes</strong> before the scheduled event; return within <strong>30 minutes</strong> after conclusion.</li>
          </ul>
        </div>

        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-4">
          <h3 class="text-base font-extrabold text-[#14532d]">Inconvenience &amp; Damage Fees</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-white border border-green-900/10">
              <p class="font-extrabold text-[#14532d] mb-1">Cancellation Notice</p>
              <p>≥ 3 days: <strong>Free</strong></p>
              <p>2 days: <strong>5%</strong> · 1 day: <strong>10%</strong></p>
              <p>Same day (0): <strong>50%</strong></p>
            </div>
            <div class="p-3 rounded-xl bg-white border border-green-900/10">
              <p class="font-extrabold text-[#14532d] mb-1">Late Return</p>
              <p>≤ 30 mins: <strong>Free</strong></p>
              <p>31–60 mins: <strong>50%</strong></p>
              <p>&gt; 60 mins: <strong>Standard hourly rates</strong></p>
            </div>
          </div>
          <div class="p-3 rounded-xl bg-white border border-green-900/10">
            <p class="font-extrabold text-[#14532d] mb-1">Damage or Loss Liability</p>
            <p><strong>Reparable Damage:</strong> 30% of Original Price + Total Repair Fee</p>
            <p><strong>Irreparable Damage / Loss:</strong> 50% of Original Price + Replacement of Equipment</p>
          </div>
        </div>
      </div>

      <!-- Tab 3: Request Steps (1-9) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="(s, idx) in steps"
          :key="idx"
          class="p-4 rounded-2xl bg-[#f5f7f4] border border-green-900/10 flex items-start gap-3"
        >
          <span class="px-2 py-1 rounded-lg bg-[#14532d] text-white text-[10px] font-black shrink-0">Step {{ idx + 1 }}</span>
          <p class="text-xs text-slate-700 leading-relaxed font-medium">{{ s }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
