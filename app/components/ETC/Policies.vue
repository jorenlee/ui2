<script setup>
import { ref } from 'vue';

const activePolicy = ref('hours');

const policyTabs = [
  { id: 'hours', label: 'Office Hours & Duty Policy' },
  { id: 'booking', label: 'Daily Booking Policy' },
  { id: 'borrowing', label: 'Equipment Borrowing Policy' },
  { id: 'privacy', label: 'Media Release & Data Privacy' },
];
</script>

<template>
  <section id="etc-policies" class="pb-12 px-4 sm:px-6">
    <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-green-900/10 shadow-sm p-6 sm:p-10">
      <!-- Header -->
      <div class="mb-6 pb-6 border-b border-slate-100">
        <div class="inline-flex items-center gap-2.5 mb-2">
          <span class="w-1.5 h-5 rounded-full bg-[#14532d]"></span>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-[#14532d]">Guidelines &amp; Compliance</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ETC <span class="text-[#14532d]">Policies &amp; Schedule</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 mt-1.5">
          Important office hours, booking rules, borrowing guidelines, sanctions, and data privacy authorization.
        </p>
      </div>

      <!-- Policy Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="tab in policyTabs"
          :key="tab.id"
          type="button"
          class="px-4 py-2 rounded-xl text-xs font-bold border transition-colors"
          :class="activePolicy === tab.id
            ? 'bg-[#14532d] text-white border-[#14532d]'
            : 'bg-[#f5f7f4] text-[#14532d] border-green-900/15 hover:border-[#14532d]'"
          @click="activePolicy = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab 1: Office Hours & Duty Policy -->
      <div v-if="activePolicy === 'hours'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="p-6 rounded-2xl bg-[#14532d] text-white">
          <h3 class="text-base font-extrabold mb-4">ETC Office Hours</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between gap-2 pb-2 border-b border-white/15">
              <span class="font-bold">Monday – Friday</span>
              <span class="text-green-100">8:00 AM – 5:00 PM</span>
            </div>
            <div class="flex justify-between gap-2">
              <span class="font-bold">Saturday</span>
              <span class="text-green-100">8:00 AM – 12:00 PM</span>
            </div>
          </div>
          <p class="text-xs text-green-100/90 mt-5 leading-relaxed">
            Room LS208, 2nd Floor of the LS Building, near the Mac Laboratory.
          </p>
        </div>

        <div class="lg:col-span-2 p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h3 class="text-base font-extrabold text-[#14532d]">
            Policy Statement on Client Requests for Services Beyond Official Duty Hours
          </h3>
          <p>
            The Educational Technology Center (ETC) is committed to providing high-quality services during official working hours. Requests outside these hours may be considered only under exceptional circumstances and require approval from the Human Resource Development Center, the Chancellor, the ETC Director, and depend on personnel availability.
          </p>
          <p>
            Individuals must submit a formal written request in advance outlining the purpose, urgency, and expected duration of the service. Approved requests may be subject to schedule adjustments, overtime arrangements, or applicable service fees in accordance with institutional policies and HRDC labor regulations.
          </p>
        </div>
      </div>

      <!-- Tab 2: Daily Booking Policy -->
      <div v-else-if="activePolicy === 'booking'" class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-4">
        <h3 class="text-base font-extrabold text-[#14532d]">
          Booking Policy — Multi-Day Events
        </h3>
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed">
          <strong>NOTE:</strong> For an activity/event that lasts more than a day, book the equipment on a <strong>daily basis</strong>. For example, if the event lasts 3 days (8:00 AM to 5:00 PM), fill out the form three times (First Entry for Day 1, Second Entry for Day 2, Third Entry for Day 3) so the system can accurately account for borrowing frequency.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 rounded-xl bg-white border border-green-900/10 text-xs">
            <p class="font-extrabold text-[#14532d] mb-1">First Entry</p>
            <p class="text-slate-600">Date of Day 1 · 8:00 AM – 5:00 PM</p>
          </div>
          <div class="p-4 rounded-xl bg-white border border-green-900/10 text-xs">
            <p class="font-extrabold text-[#14532d] mb-1">Second Entry</p>
            <p class="text-slate-600">Date of Day 2 · 8:00 AM – 5:00 PM</p>
          </div>
          <div class="p-4 rounded-xl bg-white border border-green-900/10 text-xs">
            <p class="font-extrabold text-[#14532d] mb-1">Third Entry</p>
            <p class="text-slate-600">Date of Day 3 · 8:00 AM – 5:00 PM</p>
          </div>
        </div>
      </div>

      <!-- Tab 3: Borrowing Policy & Sanctions -->
      <div v-else-if="activePolicy === 'borrowing'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-3">
          <h3 class="text-base font-extrabold text-[#14532d]">Reservation, Collection &amp; Return</h3>
          <ul class="space-y-2 list-disc pl-5">
            <li><strong>Lead Time:</strong> Submit the request form at least <strong>two (2) working days</strong> before use via <a href="https://bit.ly/ETCServicesForm" target="_blank" class="text-[#14532d] font-bold underline">bit.ly/ETCServicesForm</a>.</li>
            <li><strong>Receiving &amp; Returning:</strong> Complete the BPPME Receiving and Returning Form upon release and return; equipment is inspected with ETC staff.</li>
            <li><strong>Cancellation:</strong> Reply to your confirmation email at least <strong>1 hour</strong> before the reservation slot.</li>
            <li><strong>Early Collection &amp; Return:</strong> Pick up at least <strong>30 minutes</strong> before the event and return promptly within <strong>30 minutes</strong> after it concludes.</li>
            <li><strong>Extensions / Renewal:</strong> Subject to approval and availability; submit a new form at least 1 hour before the slot ends.</li>
          </ul>
        </div>

        <div class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-3">
          <h3 class="text-base font-extrabold text-[#14532d]">Offenses, Sanctions &amp; Liability</h3>
          <p class="font-semibold text-slate-800">Considered Offenses:</p>
          <ol class="list-decimal pl-5 space-y-1">
            <li>Failure to cancel a reservation</li>
            <li>Late return</li>
            <li>Failure to extend or renew</li>
            <li>Damaged or Lost Equipment (automatically treated as 3rd Offense)</li>
          </ol>
          <p class="font-semibold text-slate-800 pt-2">Sanctions:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li><strong>1st Offense:</strong> Oral reprimand from ETC staff (borrower &amp; organizing team).</li>
            <li><strong>2nd Offense:</strong> Written reprimand with notice sent to the organization or department.</li>
            <li><strong>3rd Offense:</strong> Borrowing rights suspended for <strong>one (1) semester</strong>, plus replacement/repair responsibility at fair market value for lost/damaged items.</li>
          </ul>
        </div>
      </div>

      <!-- Tab 4: Media Release & Data Privacy -->
      <div v-else class="p-6 rounded-2xl bg-[#f5f7f4] border border-green-900/10 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h3 class="text-base font-extrabold text-[#14532d]">
          La Salle University's Media Release Form &amp; Authorization (RA 10173)
        </h3>
        <p>
          La Salle University Ozamiz upholds Republic Act No. 10173 (Data Privacy Act of 2012). Personal data, photos, videos, and audio collected during ETC requests are used strictly for school-related publications, service processing, and legitimate institutional or regulatory reporting, and are handled with utmost confidentiality.
        </p>
        <p class="text-xs font-bold text-[#14532d]">
          Note: Authorization consent is completed as part of the ETC Services request process before submitting your request.
        </p>
      </div>
    </div>
  </section>
</template>
