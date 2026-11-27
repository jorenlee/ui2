<script setup>
import { ref, computed } from 'vue';

const search = ref('');
const selectedCategory = ref('All');

const categories = ['All', 'Audio & Speakers', 'Projectors & TVs', 'Cables & Power', 'Batteries & Clickers'];

const equipmentList = [
  // Batteries & Clickers
  { category: 'Batteries & Clickers', name: 'AA+ Extra Batteries (4 pcs.)', code: 'DI#', details: 'Eneloop Rechargeable (₱270.00)' },
  { category: 'Batteries & Clickers', name: 'AAA+ Extra Batteries (4 pcs.)', code: 'DH#', details: 'Eneloop Rechargeable (₱265.00)' },
  { category: 'Batteries & Clickers', name: 'Battery Charger', code: 'DJ#', details: 'Eneloop 4 slots Charger (₱420.00)' },
  { category: 'Batteries & Clickers', name: 'Clicker 1 & 2', code: 'DG1 – DG2', details: 'Logitech (₱2,195.00 each)' },

  // Audio & Speakers
  { category: 'Audio & Speakers', name: 'Bluetooth Speaker 3 & 4 (without microphone)', code: 'DC1 – DC2', details: '(DB Audio) Astron (₱10,852.00 each)' },
  { category: 'Audio & Speakers', name: 'Wired Microphone 2 & 3', code: 'DD1 – DD2', details: '(DB Audio) Astron (₱1,200.00 each)' },
  { category: 'Audio & Speakers', name: 'Wireless Microphone Set 1 & 2 (2 mics/set)', code: 'DE1', details: '(DB Audio) Astron (₱2,142.00 per set)' },

  // Cables & Power
  { category: 'Cables & Power', name: 'Extension Wire (6 units: Main, 1–5)', code: 'DL# – DL5', details: '4 gang 5 meters Wire (₱350.00 each)' },
  { category: 'Cables & Power', name: 'HDMI (9 units: Main, 1–8)', code: 'CZ# – CZ8', details: 'Ugreen 4K, 5 meters (₱300.00 each)' },
  { category: 'Cables & Power', name: 'VGA Connector', code: 'DF#', details: 'Sotako Sota VG101 (₱95.00)' },

  // Projectors & TVs
  { category: 'Projectors & TVs', name: 'LCD Projector 2 & 3', code: 'DB1 – DB2', details: 'Epson X88V430 (₱20,800.00 each)' },
  { category: 'Projectors & TVs', name: 'TV (with stand) 1–9', code: 'CY1 – CY9', details: 'Devant 55", Smart 4K (₱20,590.00 each)' },
  { category: 'Projectors & TVs', name: 'TV (without stand)', code: 'CY#', details: 'Devant 55", Smart 4K (₱17,590.00)' },
  { category: 'Projectors & TVs', name: 'TV Remote (Devant Phase 1 & 2)', code: 'CY#', details: 'Devant TV Remote P1 (₱2,500.00 each)' },
];

const filteredEquipment = computed(() => {
  const q = search.value.trim().toLowerCase();
  return equipmentList.filter((item) => {
    const matchesCat = selectedCategory.value === 'All' || item.category === selectedCategory.value;
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });
});
</script>

<template>
  <section id="equipment-list" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div class="inline-flex items-center gap-2.5 mb-2">
            <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Plug-and-Play Inventory</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            List of <span class="text-[#14532d]">Multimedia Equipment</span>
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1.5">
            Available plug-and-play items for educational activities. <strong class="text-[#14532d]">Note:</strong> Maximum of six (6) items allowed per event.
          </p>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-72">
          <svg class="w-4 h-4 text-[#14532d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="search"
            type="text"
            placeholder="Search equipment or code..."
            class="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-green-900/20 rounded-xl bg-[#f5f7f4] focus:bg-white focus:border-[#14532d] outline-none"
          />
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          class="px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors"
          :class="selectedCategory === cat
            ? 'bg-[#14532d] text-white border-[#14532d]'
            : 'bg-[#f5f7f4] text-slate-700 border-green-900/15 hover:border-[#14532d]'"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Equipment Table -->
      <div class="overflow-x-auto rounded-2xl border border-green-900/15">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#14532d] text-white text-xs uppercase tracking-wider">
              <th class="py-3.5 px-4 font-bold">Equipment</th>
              <th class="py-3.5 px-4 font-bold">Code</th>
              <th class="py-3.5 px-4 font-bold">Details / Unit Value</th>
              <th class="py-3.5 px-4 font-bold hidden sm:table-cell">Category</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-green-900/10 text-xs sm:text-sm">
            <tr
              v-for="(item, idx) in filteredEquipment"
              :key="idx"
              class="odd:bg-[#fafcfa] even:bg-[#f0f5f0]/60 hover:bg-[#e6efe6] transition-colors"
            >
              <td class="py-3 px-4 font-bold text-slate-900">{{ item.name }}</td>
              <td class="py-3 px-4 font-mono font-bold text-[#14532d] whitespace-nowrap">{{ item.code }}</td>
              <td class="py-3 px-4 text-slate-700">{{ item.details }}</td>
              <td class="py-3 px-4 hidden sm:table-cell">
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-green-900/15 text-[#14532d]">
                  {{ item.category }}
                </span>
              </td>
            </tr>
            <tr v-if="filteredEquipment.length === 0">
              <td colspan="4" class="py-8 text-center text-xs text-slate-500">
                No matching equipment found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
