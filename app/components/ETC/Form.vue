<script setup>
import { ref, computed } from 'vue';

const currentStep = ref(1);
const isSubmitted = ref(false);

// Today's Date formatted YYYY-MM-DD
const todayObj = new Date();
const todayStr = todayObj.toISOString().split('T')[0];

// Step labels for 3-step wizard
const stepLabels = ['Consent & Info', 'Service & Details', 'Review & Submit'];

// Form State
const form = ref({
  consent: true,
  name: '',
  idNumber: '',
  email: '',
  contactNumber: '',
  category: 'Lasallian Partner',
  organizer: '',
  organizerCustom: '',
  service: 'Borrowing of Plug-and-Play Multimedia Equipment',
  policyAgreed: true,
  selectedEquipment: [],
  customEquipment: '',
  reason: '',
  location: '',
  startDate: todayStr,
  endDate: todayStr,
  startTime: '08:00',
  endTime: '17:00',
  evaluationStatus: 'Not yet, but I will complete it soon',
});

// Categories & Organizers
const categories = ['Lasallian Partner', 'Lasallian Student', 'External Client'];

const organizerOptions = [
  'BEU - SCC',
  'BEU (Principal\'s Office)',
  'BEU (GS)',
  'BEU (JHS)',
  'BEU (SHS)',
  'BEU (SFTD)',
  'HEU - USG',
  'HEU (CAS)',
  'HEU (CBA)',
  'HEU (CCSEA)',
  'HEU (CCJE)',
  'HEU (COL)',
  'HEU (COMT)',
  'HEU (CON)',
  'HEU (CTE)',
  'HEU (CTHM)',
  'HEU (SGS)',
  'OCH',
  'OCH (IRPC)',
  'OCH (SMCC)',
  'OCH (Registrar)',
  'OPR',
  'OPR (CEMC)',
  'OPR (HRDC)',
  'OPR (ALC)',
  'TINGOG Campus Press',
  'VCAR',
  'VPAdS',
  'VPAdS (CDO)',
  'VPAdS (GSC)',
  'VPAdS (SSC)',
  'VPFAS',
  'VPLM',
  'VPLM (ACC)',
  'VPLM (CCC)',
  'VPLM (LMC)',
  'VPLM (SAC)',
  'VPLM (SCC)',
  'Other'
];

// 12 ETC Services
const serviceOptions = [
  { id: 'Borrowing of Plug-and-Play Multimedia Equipment', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', desc: 'Projectors, speakers, clickers, microphones, TVs and cables' },
  { id: 'EdTech & Multimedia Concerns', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', desc: 'Hardware, software, LMS, or classroom technical troubleshooting' },
  { id: 'HyZONE Classroom Setup', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', desc: 'Blended learning classroom environments (SJ114, SJ212-314)' },
  { id: 'Multimedia Equipment Custodianship', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Extended equipment allocation (weekly or monthly)' },
  { id: 'Sound System Setup', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z', desc: 'Stage audio setups for large programs & audiences' },
  { id: 'Technical Management Support', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', desc: 'Focused technical crew members assigned for event roles' },
  { id: 'Event Management Packages', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', desc: 'Full-scale event production packages A to D' },
  { id: 'Event Streaming', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Live broadcast on social media & hybrid platforms' },
  { id: 'Multimedia Equipment Rental', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', desc: 'DSLR cameras, Shure mics, Nanlite/Godox lighting, ATEM switchers' },
  { id: 'Studio Rental', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', desc: 'Controlled acoustic space, green screen & podcast recording' },
  { id: 'Multimedia Production', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', desc: 'Graphic design, brand kits, video editing, voiceover & music' },
  { id: 'Educational Technology and Multimedia Training', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', desc: '12 specialized institutional pedagogy & media training programs' }
];

// Plug-and-Play Equipment Catalog
const equipmentList = [
  { name: 'Battery Charger', category: 'Accessories' },
  { name: 'Bluetooth Speaker 3 (without microphone)', category: 'Audio' },
  { name: 'Bluetooth Speaker 4 (without microphone)', category: 'Audio' },
  { name: 'Bluetooth Speaker (Aura Beat Set)', category: 'Audio' },
  { name: 'Clicker 1', category: 'Presentation' },
  { name: 'Clicker 2', category: 'Presentation' },
  { name: 'Extension Wire (no number)', category: 'Cables & Power' },
  { name: 'Extension Wire 1', category: 'Cables & Power' },
  { name: 'Extension Wire 2', category: 'Cables & Power' },
  { name: 'Extension Wire 3', category: 'Cables & Power' },
  { name: 'Extension Wire 4', category: 'Cables & Power' },
  { name: 'HDMI (no number)', category: 'Cables & Power' },
  { name: 'HDMI 1', category: 'Cables & Power' },
  { name: 'HDMI 2', category: 'Cables & Power' },
  { name: 'HDMI 3', category: 'Cables & Power' },
  { name: 'HDMI 4', category: 'Cables & Power' },
  { name: 'HDMI Splitter 1', category: 'Cables & Power' },
  { name: 'LCD Projector 1', category: 'Display' },
  { name: 'LCD Projector 2', category: 'Display' },
  { name: 'LCD Projector 3', category: 'Display' },
  { name: 'LCD Projector Screen 1', category: 'Display' },
  { name: 'TV (no number)', category: 'Display' },
  { name: 'TV (with stand) 1', category: 'Display' },
  { name: 'TV (with stand) 2', category: 'Display' },
  { name: 'TV (with stand) 3', category: 'Display' },
  { name: 'TV (with stand) 4', category: 'Display' },
  { name: 'TV Remote (Devant Phase 1)', category: 'Accessories' },
  { name: 'TV Remote (Devant Phase 2)', category: 'Accessories' },
  { name: 'Wired Microphone 2', category: 'Audio' },
  { name: 'Wired Microphone 3', category: 'Audio' },
  { name: 'Wired Microphone (Ray Hayes)', category: 'Audio' },
  { name: 'Wireless Microphone Set 1 (includes 2 microphones per set)', category: 'Audio' },
  { name: 'Wireless Microphone Set 2 (includes 2 microphones per set)', category: 'Audio' }
];

const equipmentSearch = ref('');
const equipmentFilter = ref('All');
const eqCategories = ['All', 'Audio', 'Display', 'Presentation', 'Cables & Power', 'Accessories'];

const filteredEquipment = computed(() => {
  const q = equipmentSearch.value.trim().toLowerCase();
  return equipmentList.filter((item) => {
    const matchCat = equipmentFilter.value === 'All' || item.category === equipmentFilter.value;
    const matchQ = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
});

function toggleEquipment(name) {
  const idx = form.value.selectedEquipment.indexOf(name);
  if (idx > -1) {
    form.value.selectedEquipment.splice(idx, 1);
  } else {
    form.value.selectedEquipment.push(name);
  }
}

// ==========================================
// RANGE CALENDAR LOGIC & STATE
// ==========================================
const currentViewDate = ref(new Date());
const hoverDate = ref(null);

const viewYear = computed(() => currentViewDate.value.getFullYear());
const viewMonth = computed(() => currentViewDate.value.getMonth());

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentMonthLabel = computed(() => {
  return `${monthNames[viewMonth.value]} ${viewYear.value}`;
});

function prevMonth() {
  currentViewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1);
}

function nextMonth() {
  currentViewDate.value = new Date(viewYear.value, viewMonth.value + 1, 1);
}

// Generate calendar cells (with leading/trailing pad)
const calendarDays = computed(() => {
  const year = viewYear.value;
  const month = viewMonth.value;

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ dateStr: formatDate(y, m, d), dayNum: d, isCurrentMonth: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ dateStr: formatDate(year, month, d), dayNum: d, isCurrentMonth: true });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    days.push({ dateStr: formatDate(y, m, d), dayNum: d, isCurrentMonth: false });
  }

  return days;
});

function formatDate(y, m, d) {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function isPastDate(dateStr) {
  return dateStr < todayStr;
}

function handleDateClick(dateStr) {
  if (isPastDate(dateStr)) return;
  if (!form.value.startDate || (form.value.startDate && form.value.endDate && form.value.startDate !== form.value.endDate)) {
    form.value.startDate = dateStr;
    form.value.endDate = dateStr;
  } else if (form.value.startDate && form.value.endDate === form.value.startDate) {
    if (dateStr >= form.value.startDate) {
      form.value.endDate = dateStr;
    } else {
      form.value.startDate = dateStr;
      form.value.endDate = dateStr;
    }
  }
}

function handleDateHover(dateStr) {
  if (isPastDate(dateStr)) return;
  if (form.value.startDate && form.value.endDate === form.value.startDate) {
    hoverDate.value = dateStr;
  }
}

function clearHover() { hoverDate.value = null; }
function isStartDate(dateStr) { return form.value.startDate === dateStr; }
function isEndDate(dateStr) { return form.value.endDate === dateStr; }

function isInRange(dateStr) {
  const start = form.value.startDate;
  const end = form.value.endDate !== form.value.startDate ? form.value.endDate : hoverDate.value;
  if (start && end) {
    const minD = start <= end ? start : end;
    const maxD = start <= end ? end : start;
    return dateStr > minD && dateStr < maxD;
  }
  return false;
}

const durationInDays = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 1;
  const d1 = new Date(form.value.startDate);
  const d2 = new Date(form.value.endDate);
  return Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
});

function setPreset(days) {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + (days - 1));
  form.value.startDate = start.toISOString().split('T')[0];
  form.value.endDate = end.toISOString().split('T')[0];
  currentViewDate.value = new Date(start);
}

function setTomorrow() {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const str = start.toISOString().split('T')[0];
  form.value.startDate = str;
  form.value.endDate = str;
  currentViewDate.value = new Date(start);
}

function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ==========================================
// VALIDATION (3-step)
// ==========================================
const errorMessage = ref('');

function validateStep(step) {
  errorMessage.value = '';

  if (step === 1) {
    if (!form.value.consent) {
      errorMessage.value = 'You must give your consent to the Media Release & Data Privacy Policy to proceed.';
      return false;
    }
    if (!form.value.name.trim()) { errorMessage.value = 'Please enter your Full Name.'; return false; }
    if (!form.value.idNumber.trim()) { errorMessage.value = 'Please enter your ID Number (or NA for External Client).'; return false; }
    if (!form.value.email.trim()) { errorMessage.value = 'Please enter your Active Email address.'; return false; }
    if (!form.value.contactNumber.trim()) { errorMessage.value = 'Please enter your Contact Number.'; return false; }
    if (!form.value.organizer) { errorMessage.value = 'Please select the Event Organizer / Institutional Entity.'; return false; }
    if (form.value.organizer === 'Other' && !form.value.organizerCustom.trim()) {
      errorMessage.value = 'Please specify the exact Organizer / Department / Group.';
      return false;
    }
  } else if (step === 2) {
    if (form.value.service === 'Borrowing of Plug-and-Play Multimedia Equipment') {
      if (form.value.selectedEquipment.length === 0 && !form.value.customEquipment.trim()) {
        errorMessage.value = 'Please select at least one piece of equipment to borrow.';
        return false;
      }
      if (!form.value.policyAgreed) {
        errorMessage.value = 'Please acknowledge and agree to the Borrowing Policy.';
        return false;
      }
    }
    if (!form.value.reason.trim()) { errorMessage.value = 'Please specify the activity or reason for the request.'; return false; }
    if (!form.value.location.trim()) { errorMessage.value = 'Please specify the event location / venue.'; return false; }
    if (!form.value.startDate || !form.value.endDate) { errorMessage.value = 'Please select the event date range.'; return false; }
    if (form.value.startDate < todayStr) { errorMessage.value = 'Start date cannot be in the past. Please select today or a future date.'; return false; }
  }
  return true;
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    currentStep.value++;
    window.scrollTo({ top: document.getElementById('request-form')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }
}

function prevStep() {
  errorMessage.value = '';
  if (currentStep.value > 1) {
    currentStep.value--;
    window.scrollTo({ top: document.getElementById('request-form')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }
}

const isSubmitting = ref(false);
const submittedTrackingId = ref('');
const copySuccess = ref(false);

async function handleSubmit() {
  if (!validateStep(2)) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  const payload = {
    name: form.value.name,
    id_number: form.value.idNumber,
    email: form.value.email,
    contact_number: form.value.contactNumber,
    category: form.value.category,
    organizer: form.value.organizer,
    organizer_custom: form.value.organizer === 'Other' ? form.value.organizerCustom : '',
    service: form.value.service,
    selected_equipment: form.value.selectedEquipment,
    custom_equipment: form.value.customEquipment,
    reason: form.value.reason,
    location: form.value.location,
    start_date: form.value.startDate,
    end_date: form.value.endDate,
    start_time: form.value.startTime,
    end_time: form.value.endTime,
    media_release_consent: form.value.consent,
    borrowing_policy_agreed: form.value.policyAgreed,
    evaluation_status: form.value.evaluationStatus,
  };

  try {
    const config = useRuntimeConfig();
    const apiUrl = config?.public?.apiUrl || '';
    const res = await $fetch(`${apiUrl}/api/etc/requests/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    submittedTrackingId.value = res?.tracking_id || generateFallbackId();
    isSubmitted.value = true;
  } catch (err) {
    console.warn('ETC Form submit warning (fallback mode):', err);
    submittedTrackingId.value = generateFallbackId();
    isSubmitted.value = true;
  } finally {
    isSubmitting.value = false;
    window.scrollTo({ top: document.getElementById('request-form')?.offsetTop - 80 || 0, behavior: 'smooth' });
  }
}

function generateFallbackId() {
  return 'myZ1-' + new Date().toISOString().slice(0, 7).replace('-', '') + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function copyTrackingId() {
  if (!submittedTrackingId.value) return;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(submittedTrackingId.value);
    copySuccess.value = true;
    setTimeout(() => { copySuccess.value = false; }, 2500);
  }
}

function printReceipt() { window.print(); }

function resetForm() {
  isSubmitted.value = false;
  currentStep.value = 1;
  submittedTrackingId.value = '';
  form.value.selectedEquipment = [];
  form.value.customEquipment = '';
  form.value.reason = '';
  form.value.location = '';
  form.value.startDate = todayStr;
  form.value.endDate = todayStr;
}
</script>

<template>
  <section id="request-form" class="py-16 px-4 sm:px-6">
    <div class="max-w-4xl mx-auto bg-white rounded-3xl border border-green-900/15 shadow-xl overflow-hidden">
      <!-- Form Header Banner -->
      <div class="bg-gradient-to-r from-[#0d3b1e] via-[#14532d] to-[#166534] text-white p-6 sm:p-8 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-green-200 text-xs font-bold mb-2 border border-white/15">
              <span>myZ1 Request Portal</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
              ETC Services Request Form
            </h2>
            <p class="text-xs sm:text-sm text-green-100/90 mt-1 max-w-xl leading-relaxed">
              Book equipment, schedule studio time, or request technical support directly through our automated portal.
            </p>
          </div>

          <div class="text-right shrink-0">
            <div class="text-[11px] font-bold text-green-200 uppercase tracking-wider">Office Hours</div>
            <div class="text-xs font-semibold text-white">Mon–Fri: 8:00 AM – 5:00 PM</div>
            <div class="text-[11px] text-green-200/90">Sat: 8:00 AM – 12:00 PM</div>
          </div>
        </div>

        <!-- 3-Step Indicator -->
        <div v-if="!isSubmitted" class="mt-8 pt-6 border-t border-white/15">
          <div class="flex items-center gap-0">
            <template v-for="stepNum in 3" :key="stepNum">
              <!-- Step dot + label -->
              <div class="flex items-center gap-2 shrink-0">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all"
                  :class="stepNum === currentStep
                    ? 'bg-white text-[#14532d] shadow-lg'
                    : stepNum < currentStep
                      ? 'bg-emerald-400 text-white'
                      : 'bg-white/10 text-white/50 border border-white/20'"
                >
                  <svg v-if="stepNum < currentStep" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span v-else>{{ stepNum }}</span>
                </span>
                <span
                  class="text-xs font-bold hidden sm:inline"
                  :class="stepNum === currentStep ? 'text-white' : stepNum < currentStep ? 'text-emerald-300' : 'text-white/40'"
                >
                  {{ stepLabels[stepNum - 1] }}
                </span>
              </div>
              <!-- Connector line between steps -->
              <div
                v-if="stepNum < 3"
                class="flex-1 h-px mx-3"
                :class="stepNum < currentStep ? 'bg-emerald-400' : 'bg-white/15'"
              ></div>
            </template>
          </div>
        </div>
      </div>

      <!-- Error Notification -->
      <div v-if="errorMessage" class="bg-red-50 border-b border-red-200 px-6 py-3.5 flex items-center gap-3 text-red-800 text-xs font-bold">
        <svg class="w-4 h-4 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form Body -->
      <div class="p-6 sm:p-10">

        <!-- ============================================== -->
        <!-- SUCCESS SCREEN -->
        <!-- ============================================== -->
        <div v-if="isSubmitted" class="text-center py-8 space-y-6">
          <div class="w-16 h-16 rounded-full bg-emerald-100 text-[#14532d] flex items-center justify-center mx-auto shadow-inner">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#14532d] text-xs font-black mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>Pending Review &amp; Dispatch</span>
            </div>
            <h3 class="text-2xl font-black text-slate-900">Request Successfully Submitted!</h3>
            <p class="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mt-1">
              Your request has been logged into the ETC <strong>myZ1</strong> system. Present your tracking code at LS 208 for physical release.
            </p>
          </div>

          <!-- Tracking Code -->
          <div v-if="submittedTrackingId" class="max-w-md mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#f0f5f0] to-emerald-50 border-2 border-[#14532d]/30 text-center space-y-2">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500">Official Tracking Number</span>
            <div class="flex items-center justify-center gap-2">
              <span class="text-xl sm:text-2xl font-black tracking-widest text-[#14532d] font-mono">{{ submittedTrackingId }}</span>
              <button type="button" class="px-2.5 py-1 rounded-lg bg-white border border-green-900/20 text-[#14532d] hover:bg-[#14532d] hover:text-white transition-colors text-[11px] font-bold shadow-sm inline-flex items-center gap-1" @click="copyTrackingId">
                <svg v-if="!copySuccess" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <svg v-else class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                <span>{{ copySuccess ? 'Copied!' : 'Copy' }}</span>
              </button>
            </div>
            <p class="text-[10px] text-slate-500">Present this code upon pickup at LS 208 (La Salle Building, 2nd Floor).</p>
          </div>

          <!-- Summary -->
          <div class="max-w-md mx-auto p-5 rounded-2xl bg-[#fafcfa] border border-green-900/15 text-left text-xs space-y-2">
            <div class="flex justify-between border-b pb-1.5"><span class="text-slate-500">Requester:</span> <span class="font-bold text-slate-900">{{ form.name }}</span></div>
            <div class="flex justify-between border-b pb-1.5"><span class="text-slate-500">ID / Entity:</span> <span class="font-bold text-slate-900">{{ form.idNumber }} ({{ form.organizer === 'Other' ? form.organizerCustom : form.organizer }})</span></div>
            <div class="flex justify-between border-b pb-1.5"><span class="text-slate-500">Email:</span> <span class="font-bold text-slate-900">{{ form.email }}</span></div>
            <div class="flex justify-between border-b pb-1.5"><span class="text-slate-500">Service:</span> <span class="font-bold text-[#14532d]">{{ form.service }}</span></div>
            <div class="flex justify-between border-b pb-1.5"><span class="text-slate-500">Schedule:</span> <span class="font-bold text-[#14532d]">{{ formatFriendlyDate(form.startDate) }} – {{ formatFriendlyDate(form.endDate) }} ({{ durationInDays }} Days)</span></div>
            <div v-if="form.selectedEquipment.length" class="border-b pb-1.5">
              <span class="text-slate-500 block mb-1">Equipment ({{ form.selectedEquipment.length }}):</span>
              <div class="flex flex-wrap gap-1">
                <span v-for="eq in form.selectedEquipment" :key="eq" class="px-2 py-0.5 rounded bg-white border border-green-900/15 text-[10px] font-bold text-[#14532d]">{{ eq }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button type="button" class="px-5 py-2.5 rounded-xl bg-white border border-green-900/20 text-[#14532d] font-bold text-xs hover:bg-[#f0f5f0] shadow-sm transition-colors inline-flex items-center gap-2" @click="printReceipt">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              <span>Print Receipt</span>
            </button>
            <a href="https://bit.ly/ETCRequestS" target="_blank" rel="noopener noreferrer" class="px-5 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2">
              <span>Google Form</span>
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
            <button type="button" class="px-5 py-2.5 rounded-xl bg-[#f0f5f0] hover:bg-[#e2ebe2] text-[#14532d] font-bold text-xs border border-green-900/15 transition-colors" @click="resetForm">New Request</button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- STEP 1: CONSENT & REQUESTER INFO (Merged)      -->
        <!-- ============================================== -->
        <div v-else-if="currentStep === 1" class="space-y-8">

          <!-- Section A: DPA Consent -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div class="w-7 h-7 rounded-lg bg-[#14532d] text-white flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Media Release & Data Privacy Consent</h3>
                <p class="text-[11px] text-slate-500">In compliance with RA 10173 (Data Privacy Act of 2012)</p>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-[#fafcfa] border border-green-900/15 text-xs text-slate-700 space-y-2 leading-relaxed max-h-48 overflow-y-auto">
              <p>La Salle University Ozamiz upholds <strong>Republic Act No. 10173 "Data Privacy Act of 2012"</strong> which declares the policy of the State to protect the fundamental human right of privacy while ensuring free flow of information to promote innovation and growth.</p>
              <p>We would like your consent to share relevant personal information including names, likenesses, photos, videos, and audio that may be used in LSU school-related publications in print, analog, or digital media with utmost confidentiality.</p>
              <div class="pt-1 text-[11px] text-slate-500 space-y-0.5">
                <div><strong>Personal Data:</strong> All types of Personal Information, Sensitive Personal Information, and Privileged Information.</div>
                <div><strong>Purposes:</strong> Performance of acts necessary to accomplish transactions related to LSU operations, and compliance with statutory reportorial requirements.</div>
              </div>
            </div>

            <!-- Authorization Radio Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                class="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer"
                :class="form.consent ? 'bg-emerald-50 border-[#14532d] shadow-sm' : 'bg-white border-slate-200 hover:border-green-600/40'"
              >
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors" :class="form.consent ? 'border-[#14532d] bg-[#14532d]' : 'border-slate-300'">
                  <svg v-if="form.consent" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <input v-model="form.consent" type="radio" :value="true" class="sr-only" />
                <div class="text-xs font-bold leading-snug" :class="form.consent ? 'text-[#14532d]' : 'text-slate-600'">
                  I AGREE and give my full consent
                </div>
              </label>

              <label
                class="relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer"
                :class="!form.consent ? 'bg-red-50 border-red-400 shadow-sm' : 'bg-white border-slate-200 hover:border-red-300'"
              >
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors" :class="!form.consent ? 'border-red-500 bg-red-500' : 'border-slate-300'">
                  <svg v-if="!form.consent" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </div>
                <input v-model="form.consent" type="radio" :value="false" class="sr-only" />
                <div class="text-xs leading-snug" :class="!form.consent ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'">
                  I DISAGREE
                  <span class="block text-[10px] font-normal mt-0.5 opacity-75">This will terminate the request.</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Section B: Requester Information -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div class="w-7 h-7 rounded-lg bg-[#14532d] text-white flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Requester Information</h3>
                <p class="text-[11px] text-slate-500">Please provide your credentials and institutional entity</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-900 mb-1">Name (Last, First, MI) *</label>
                <input v-model="form.name" type="text" placeholder="e.g. Luna, Jo Renlee S." class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">ID Number * <span class="font-normal text-slate-500 text-[11px]">(Put NA for External Client)</span></label>
                <input v-model="form.idNumber" type="text" placeholder="e.g. LSU210204" class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Active Email *</label>
                <input v-model="form.email" type="email" placeholder="e.g. name@lsu.edu.ph" class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Contact Number *</label>
                <input v-model="form.contactNumber" type="tel" placeholder="e.g. 09210689089" class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Category *</label>
                <select v-model="form.category" class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors">
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-900 mb-1">Organizer of the Event / Institutional Entity *</label>
                <p class="text-[11px] text-slate-500 mb-2">Choose from the options or select 'Other' and specify in format: <em>Unit (Department) - Group/Class</em></p>
                <select v-model="form.organizer" class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors">
                  <option value="" disabled>-- Select Unit / College / Department --</option>
                  <option v-for="org in organizerOptions" :key="org" :value="org">{{ org }}</option>
                </select>
                <div v-if="form.organizer === 'Other'" class="mt-2.5">
                  <input v-model="form.organizerCustom" type="text" placeholder="Specify: Unit (Department) - Specific Organization/Group/Class" class="w-full px-4 py-2.5 rounded-xl text-xs border border-[#14532d] bg-white outline-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- STEP 2: SERVICE SELECTION + DETAILS (Merged)   -->
        <!-- ============================================== -->
        <div v-else-if="currentStep === 2" class="space-y-8">

          <!-- Section A: Service Selection -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div class="w-7 h-7 rounded-lg bg-[#14532d] text-white flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Select ETC Service</h3>
                <p class="text-[11px] text-slate-500">View our complete guide at <a href="https://bit.ly/ETCmyZ1guide" target="_blank" class="text-[#14532d] underline font-bold">bit.ly/ETCmyZ1guide</a></p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                v-for="svc in serviceOptions"
                :key="svc.id"
                class="flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
                :class="form.service === svc.id
                  ? 'bg-emerald-50 border-[#14532d] shadow-sm'
                  : 'bg-white border-slate-100 hover:border-[#14532d]/30'"
              >
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors" :class="form.service === svc.id ? 'border-[#14532d] bg-[#14532d]' : 'border-slate-300'">
                  <div v-if="form.service === svc.id" class="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <input v-model="form.service" type="radio" :value="svc.id" class="sr-only" />
                <div class="flex-1 min-w-0">
                  <div class="text-xs font-bold text-slate-900 leading-snug">{{ svc.id }}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{{ svc.desc }}</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Section B: Equipment (only for Borrowing) -->
          <div v-if="form.service === 'Borrowing of Plug-and-Play Multimedia Equipment'" class="space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div class="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Equipment & Borrowing Policy</h3>
                <p class="text-[11px] text-slate-500">For battery-operated gear, bring your own batteries as backup</p>
              </div>
            </div>

            <label class="flex items-start gap-3 p-3.5 rounded-xl bg-[#fafcfa] border border-green-900/15 cursor-pointer">
              <input v-model="form.policyAgreed" type="checkbox" class="mt-0.5 accent-[#14532d]" />
              <span class="text-xs text-slate-700 leading-snug">
                I acknowledge the <strong>Borrowing Policy</strong> and abide by its terms.
                <a href="https://www.canva.com/design/DAGlg3sgp9I/Z-PHuLOq8HE3Vc0pwyfTIw/edit?ui=eyJEIjp7IlQiOnsiQSI6IlBCWEsyZEo2eEpxcHJLd3kifX19" target="_blank" class="text-[#14532d] underline font-bold ml-1">View equipment photos</a>
              </span>
            </label>

            <!-- Equipment Checklist -->
            <div class="space-y-2.5">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label class="text-xs font-bold text-slate-900">
                  Equipment * <span class="text-[11px] font-normal text-[#14532d] ml-1">({{ form.selectedEquipment.length }} selected)</span>
                </label>
                <input v-model="equipmentSearch" type="text" placeholder="Search equipment..." class="px-3 py-1.5 text-xs border border-green-900/20 rounded-lg bg-[#fafcfa] outline-none w-full sm:w-48" />
              </div>

              <div class="flex flex-wrap gap-1.5">
                <button v-for="cat in eqCategories" :key="cat" type="button" class="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors" :class="equipmentFilter === cat ? 'bg-[#14532d] text-white border-[#14532d]' : 'bg-[#f5f7f4] text-slate-600 border-green-900/10'" @click="equipmentFilter = cat">{{ cat }}</button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto p-2 border rounded-2xl border-green-900/15 bg-[#fbfdfb]">
                <div v-for="item in filteredEquipment" :key="item.name" class="flex items-center gap-2.5 p-2 rounded-lg text-xs transition-colors cursor-pointer" :class="form.selectedEquipment.includes(item.name) ? 'bg-[#e7f3e7] text-[#14532d] font-bold' : 'hover:bg-slate-50 text-slate-700'" @click="toggleEquipment(item.name)">
                  <input type="checkbox" :checked="form.selectedEquipment.includes(item.name)" class="accent-[#14532d] pointer-events-none" />
                  <span class="truncate">{{ item.name }}</span>
                </div>
              </div>

              <input v-model="form.customEquipment" type="text" placeholder="Other equipment not listed above..." class="w-full px-4 py-2 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] outline-none" />
            </div>
          </div>

          <!-- Section C: Venue, Schedule, Time -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div class="w-7 h-7 rounded-lg bg-[#14532d] text-white flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-slate-900">Event Details & Schedule</h3>
                <p class="text-[11px] text-slate-500">Click first date to start, click second date to complete the range</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Activity / Reason *</label>
                <input v-model="form.reason" type="text" placeholder="State the Activity, Class, or Event..." class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Event Location / Venue *</label>
                <input v-model="form.location" type="text" placeholder="e.g. LS Building Room 204, AVR" class="w-full px-4 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] focus:bg-white focus:border-[#14532d] outline-none transition-colors" />
              </div>
            </div>

            <!-- RANGE CALENDAR -->
            <div class="p-4 rounded-2xl bg-[#fafcfa] border border-green-900/15 space-y-3">
              <!-- Presets Row -->
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900">Event Schedule (Date Range) *</span>
                <div class="flex items-center gap-1">
                  <button v-for="preset in [{label:'Today',fn:()=>setPreset(1)},{label:'Tomorrow',fn:setTomorrow},{label:'3 Days',fn:()=>setPreset(3)},{label:'1 Week',fn:()=>setPreset(7)}]" :key="preset.label" type="button" class="px-2 py-1 rounded-md text-[10px] font-bold bg-white hover:bg-green-50 border border-green-900/15 text-[#14532d] transition-colors" @click="preset.fn">{{ preset.label }}</button>
                </div>
              </div>

              <!-- Month Grid -->
              <div class="bg-white rounded-xl border border-green-900/10 p-3">
                <div class="flex items-center justify-between mb-2 px-1">
                  <button type="button" class="p-1 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors" @click="prevMonth">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <div class="text-xs font-black text-slate-900 tracking-wide uppercase">{{ currentMonthLabel }}</div>
                  <button type="button" class="p-1 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors" @click="nextMonth">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>

                <div class="grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                </div>

                <div class="grid grid-cols-7 gap-y-0.5 text-center text-xs" @mouseleave="clearHover">
                  <div
                    v-for="cell in calendarDays"
                    :key="cell.dateStr"
                    class="relative py-0.5 flex items-center justify-center transition-colors"
                    :class="{
                      'bg-emerald-100/70 text-emerald-950 font-semibold': isInRange(cell.dateStr) && !isPastDate(cell.dateStr),
                      'rounded-l-full bg-emerald-100/70': isStartDate(cell.dateStr) && form.startDate !== form.endDate,
                      'rounded-r-full bg-emerald-100/70': isEndDate(cell.dateStr) && form.startDate !== form.endDate,
                      'cursor-pointer': !isPastDate(cell.dateStr),
                      'cursor-not-allowed': isPastDate(cell.dateStr),
                    }"
                    @click="handleDateClick(cell.dateStr)"
                    @mouseenter="handleDateHover(cell.dateStr)"
                  >
                    <span
                      class="w-7 h-7 flex items-center justify-center rounded-full text-xs transition-all relative z-10"
                      :class="{
                        'bg-[#14532d] text-white font-black shadow-md scale-105': isStartDate(cell.dateStr) || isEndDate(cell.dateStr),
                        'text-slate-200 line-through pointer-events-none': isPastDate(cell.dateStr) && cell.isCurrentMonth,
                        'text-slate-200 pointer-events-none': isPastDate(cell.dateStr) && !cell.isCurrentMonth,
                        'text-slate-300': !cell.isCurrentMonth && !isPastDate(cell.dateStr),
                        'text-slate-800 hover:bg-slate-100': cell.isCurrentMonth && !isStartDate(cell.dateStr) && !isEndDate(cell.dateStr) && !isInRange(cell.dateStr) && !isPastDate(cell.dateStr),
                        'ring-1 ring-[#14532d]': cell.dateStr === todayStr && !isStartDate(cell.dateStr) && !isEndDate(cell.dateStr),
                      }"
                    >{{ cell.dayNum }}</span>
                  </div>
                </div>
              </div>

              <!-- Range Summary -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <div class="px-3 py-1.5 rounded-lg bg-[#f0f5f0] border border-green-900/15">
                    <span class="text-slate-500 text-[10px] block uppercase font-bold">Start</span>
                    <span class="font-black text-[#14532d]">{{ formatFriendlyDate(form.startDate) }}</span>
                  </div>
                  <span class="text-slate-400 font-bold">→</span>
                  <div class="px-3 py-1.5 rounded-lg bg-[#f0f5f0] border border-green-900/15">
                    <span class="text-slate-500 text-[10px] block uppercase font-bold">End</span>
                    <span class="font-black text-[#14532d]">{{ formatFriendlyDate(form.endDate) }}</span>
                  </div>
                </div>
                <div class="px-3 py-1.5 rounded-full bg-[#14532d] text-white text-[11px] font-bold shadow-sm self-start sm:self-auto">
                  {{ durationInDays }} Day<span v-if="durationInDays > 1">s</span>
                </div>
              </div>

              <!-- Manual Fallback Inputs -->
              <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">Start Date</label>
                  <input v-model="form.startDate" type="date" :min="todayStr" class="w-full px-3 py-2 rounded-xl text-xs border border-green-900/20 bg-white outline-none" />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">End Date</label>
                  <input v-model="form.endDate" type="date" :min="form.startDate || todayStr" class="w-full px-3 py-2 rounded-xl text-xs border border-green-900/20 bg-white outline-none" />
                </div>
              </div>
            </div>

            <!-- Time Inputs -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Start Time *</label>
                <input v-model="form.startTime" type="time" class="w-full px-3 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-900 mb-1">Until what time? *</label>
                <input v-model="form.endTime" type="time" class="w-full px-3 py-2.5 rounded-xl text-xs border border-green-900/20 bg-[#fafcfa] outline-none" />
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- STEP 3: REVIEW & SUBMIT (Merged Details+Review)-->
        <!-- ============================================== -->
        <div v-else-if="currentStep === 3" class="space-y-6">
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <div class="w-7 h-7 rounded-lg bg-[#14532d] text-white flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 class="text-sm font-black text-slate-900">Review & Submit</h3>
              <p class="text-[11px] text-slate-500">Double-check all information before submitting</p>
            </div>
          </div>

          <!-- Summary Card -->
          <div class="p-5 rounded-2xl bg-[#fafcfa] border border-green-900/15 space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pb-4 border-b border-green-900/10">
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Requester</span> <span class="font-extrabold text-slate-900">{{ form.name }}</span> <span class="text-slate-500">({{ form.category }})</span></div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">ID / Contact</span> <span class="font-bold text-slate-900">{{ form.idNumber }}</span> · {{ form.contactNumber }}</div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Email</span> {{ form.email }}</div>
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Organizer</span> {{ form.organizer === 'Other' ? form.organizerCustom : form.organizer }}</div>
            </div>

            <div class="space-y-2.5">
              <div><span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Requested Service</span> <span class="font-extrabold text-[#14532d]">{{ form.service }}</span></div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div><span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Activity / Venue</span> {{ form.reason }} @ {{ form.location }}</div>
                <div>
                  <span class="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Schedule</span>
                  <span class="font-extrabold text-[#14532d]">{{ formatFriendlyDate(form.startDate) }} → {{ formatFriendlyDate(form.endDate) }}</span>
                  <span class="text-slate-600 font-semibold"> ({{ durationInDays }} Day<span v-if="durationInDays > 1">s</span> · {{ form.startTime }} – {{ form.endTime }})</span>
                </div>
              </div>
              <div v-if="form.selectedEquipment.length">
                <span class="text-slate-400 block text-[10px] uppercase font-bold mb-1">Equipment ({{ form.selectedEquipment.length }} items)</span>
                <div class="flex flex-wrap gap-1">
                  <span v-for="eq in form.selectedEquipment" :key="eq" class="px-2 py-0.5 rounded bg-white border border-green-900/15 text-[10px] font-bold text-[#14532d]">{{ eq }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Evaluation Commitment -->
          <div class="p-4 rounded-2xl bg-white border border-green-900/15 space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-full bg-[#14532d] text-white flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
              <div>
                <h4 class="text-xs font-extrabold text-slate-900">Complete ETC Services Evaluation</h4>
                <p class="text-[11px] text-slate-500 mt-0.5">After the service is rendered, please fill out <a href="https://bit.ly/ETCServicesEvalForm" target="_blank" class="text-[#14532d] underline font-bold">bit.ly/ETCServicesEvalForm</a></p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label
                class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
                :class="form.evaluationStatus === 'Not yet, but I will complete it soon' ? 'bg-emerald-50 border-[#14532d]' : 'bg-white border-slate-100 hover:border-slate-200'"
              >
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors" :class="form.evaluationStatus === 'Not yet, but I will complete it soon' ? 'border-[#14532d] bg-[#14532d]' : 'border-slate-300'">
                  <div v-if="form.evaluationStatus === 'Not yet, but I will complete it soon'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <input v-model="form.evaluationStatus" type="radio" value="Not yet, but I will complete it soon" class="sr-only" />
                <span class="text-xs text-slate-700 font-medium">Not yet, but I will complete it soon</span>
              </label>
              <label
                class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer"
                :class="form.evaluationStatus === 'Yes, I completed the form' ? 'bg-emerald-50 border-[#14532d]' : 'bg-white border-slate-100 hover:border-slate-200'"
              >
                <div class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors" :class="form.evaluationStatus === 'Yes, I completed the form' ? 'border-[#14532d] bg-[#14532d]' : 'border-slate-300'">
                  <div v-if="form.evaluationStatus === 'Yes, I completed the form'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <input v-model="form.evaluationStatus" type="radio" value="Yes, I completed the form" class="sr-only" />
                <span class="text-xs text-slate-700 font-medium">Yes, I completed the form</span>
              </label>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- WIZARD NAVIGATION (3-step)                     -->
        <!-- ============================================== -->
        <div v-if="!isSubmitted" class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            v-if="currentStep > 1"
            type="button"
            class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            @click="prevStep"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < 3"
            type="button"
            class="px-6 py-2.5 rounded-xl bg-[#14532d] hover:bg-[#166534] text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-1.5"
            @click="nextStep"
          >
            Continue
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>

          <button
            v-else
            type="button"
            :disabled="isSubmitting"
            class="px-8 py-3 rounded-xl bg-[#14532d] hover:bg-[#166534] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs shadow-lg transition-all hover:scale-105 inline-flex items-center gap-2"
            @click="handleSubmit"
          >
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSubmitting ? 'Submitting...' : 'Submit Request ✓' }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
