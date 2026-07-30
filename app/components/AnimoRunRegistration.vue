<script setup>
import { ref, computed, watch } from "vue";const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const form_type = ref("Individual");
const number_of_participants_per_group = ref(1);
const activeParticipantIndex = ref(0);

const paymentType = ref("direct_payment");
const isSubmitting = ref(false);

const runCategories = [
  {
    id: "3K",
    name: "3K Fun Run",
    fee: 300,
    time: "6:00 AM",
    description: "Great for beginners, kids, and casual runners.",
    color: "from-emerald-500 to-teal-600",
    badge: "Popular",
    icon: "fa-running",
  },
  {
    id: "5K",
    name: "5K Fitness Run",
    fee: 500,
    time: "5:45 AM",
    description: "A classic distance to test your speed and endurance.",
    color: "from-green-600 to-emerald-700",
    badge: "Featured",
    icon: "fa-bolt",
  },
  {
    id: "10K",
    name: "10K Challenge",
    fee: 800,
    time: "5:15 AM",
    description: "For experienced runners aiming for a new personal record.",
    color: "from-teal-600 to-cyan-700",
    badge: "Pro",
    icon: "fa-stopwatch",
  },
  {
    id: "21K",
    name: "21K Half Marathon",
    fee: 1200,
    time: "4:30 AM",
    description: "The ultimate endurance run through scenic Ozamiz routes.",
    color: "from-emerald-700 to-green-900",
    badge: "Elite",
    icon: "fa-trophy",
  },
];

const availableAddons = [
  {
    id: "singlet",
    name: "Animo Dri-Fit Event Singlet",
    fee: 350,
    icon: "fa-tshirt",
    desc: "Premium moisture-wicking green singlet",
  },
  {
    id: "bottle",
    name: "LSU Animo Stainless Flask (750ml)",
    fee: 250,
    icon: "fa-tint",
    desc: "Insulated eco-friendly water flask",
  },
  {
    id: "engraving",
    name: "Finisher Medal Custom Engraving",
    fee: 150,
    icon: "fa-award",
    desc: "Personalized name & finish time on medal",
  },
  {
    id: "bib_name",
    name: "Custom Name Printed on Race Bib",
    fee: 100,
    icon: "fa-id-badge",
    desc: "Custom runner nick or handle on your bib",
  },
];

const createEmptyParticipant = (index = 1) => ({
  id: index,
  run_category: "5K",
  participant_type: "LSU Higher Education Unit Student",
  firstname: "",
  middlename: "",
  lastname: "",
  suffix: "",
  birthdate: "",
  gender: "Male",
  contact_number: "",
  contact_email: "",
  contact_address: "",
  college_course: "BSIT",
  college_year: "1st Year",
  beu_grade: "",
  partner_office: "",
  alumni_batch: "",
  organization: "",
  selectedAddons: [],
  validIdFront: null,
  validIdFrontPreview: null,
  validIdBack: null,
  validIdBackPreview: null,
});

const participants = ref([createEmptyParticipant(1)]);

watch(form_type, (newVal) => {
  if (newVal === "Individual") {
    number_of_participants_per_group.value = 1;
    participants.value = [participants.value[0] || createEmptyParticipant(1)];
    activeParticipantIndex.value = 0;
  }
});

watch(number_of_participants_per_group, (newCount) => {
  const count = Math.max(1, parseInt(newCount) || 1);
  number_of_participants_per_group.value = count;

  while (participants.value.length < count) {
    participants.value.push(
      createEmptyParticipant(participants.value.length + 1)
    );
  }
  if (participants.value.length > count) {
    participants.value = participants.value.slice(0, count);
  }
  if (activeParticipantIndex.value >= count) {
    activeParticipantIndex.value = count - 1;
  }
});

const addParticipant = () => {
  number_of_participants_per_group.value++;
  activeParticipantIndex.value = participants.value.length - 1;
};

const removeParticipant = (index) => {
  if (participants.value.length <= 1) return;
  participants.value.splice(index, 1);
  number_of_participants_per_group.value = participants.value.length;
  if (activeParticipantIndex.value >= participants.value.length) {
    activeParticipantIndex.value = participants.value.length - 1;
  }
};

const currentParticipant = computed(() => {
  return (
    participants.value[activeParticipantIndex.value] || participants.value[0]
  );
});

const handleFileUpload = (event, type, pIndex) => {
  const file = event.target.files[0];
  if (!file) return;
  const participant = participants.value[pIndex];
  if (type === "front") {
    participant.validIdFront = file;
    participant.validIdFrontPreview = URL.createObjectURL(file);
  } else {
    participant.validIdBack = file;
    participant.validIdBackPreview = URL.createObjectURL(file);
  }
};

const removeFile = (type, pIndex) => {
  const participant = participants.value[pIndex];
  if (type === "front") {
    participant.validIdFront = null;
    participant.validIdFrontPreview = null;
  } else {
    participant.validIdBack = null;
    participant.validIdBackPreview = null;
  }
};

const toggleAddon = (pIndex, addonId) => {
  const p = participants.value[pIndex];
  const idx = p.selectedAddons.indexOf(addonId);
  if (idx > -1) {
    p.selectedAddons.splice(idx, 1);
  } else {
    p.selectedAddons.push(addonId);
  }
};

const itemizedFees = computed(() => {
  const items = [];
  participants.value.forEach((p, idx) => {
    const labelPrefix =
      form_type.value === "Group"
        ? `Runner #${idx + 1} (${p.firstname || "Unnamed"}): `
        : "";
    const cat = runCategories.find((c) => c.id === p.run_category);
    if (cat) {
      items.push({
        name: `${labelPrefix}${cat.name}`,
        amount: cat.fee,
      });
    }
    p.selectedAddons.forEach((addonId) => {
      const addon = availableAddons.find((a) => a.id === addonId);
      if (addon) {
        items.push({
          name: `${labelPrefix}Add-on - ${addon.name}`,
          amount: addon.fee,
        });
      }
    });
  });
  return items;
});

const grandTotal = computed(() => {
  return itemizedFees.value.reduce((sum, item) => sum + item.amount, 0);
});

const copyRunnerOneInfo = () => {
  if (participants.value.length < 2) return;
  const r1 = participants.value[0];
  const p = currentParticipant.value;
  p.contact_number = r1.contact_number;
  p.contact_email = r1.contact_email;
  p.contact_address = r1.contact_address;
  p.participant_type = r1.participant_type;
  p.college_course = r1.college_course;
  p.college_year = r1.college_year;
  p.beu_grade = r1.beu_grade;
  p.partner_office = r1.partner_office;
  p.alumni_batch = r1.alumni_batch;
  p.organization = r1.organization;
};

const redirectStripe = async () => {
  alert(
    `Proceeding to Stripe Payment Checkout for ₱${grandTotal.value.toLocaleString()}`
  );
};

const submitRegistration = () => {
  isSubmitting.value = true;
  setTimeout(() => {
    isSubmitting.value = false;
    alert(
      "✅ Animo Run registration submitted successfully! Check your email for confirmation."
    );
  }, 1000);
};
</script>

<template>
  <div
    :class="[
      'min-h-screen py-8 px-3 sm:px-6 lg:px-8 transition-colors duration-300',
      props.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800',
    ]"
  >
    <div class="max-w-5xl mx-auto">
      <!-- HERO / HEADER -->
      <div
        :class="[
          'relative overflow-hidden rounded-3xl shadow-xl mb-8 border transition-all duration-300',
          props.darkMode
            ? 'bg-gradient-to-br from-green-950 via-emerald-900 to-gray-900 border-green-800/40'
            : 'bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 border-green-600 text-white',
        ]"
      >
        <!-- Background decorative elements -->
        <div
          class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"
        ></div>

        <div class="relative p-6 sm:p-10 text-center flex flex-col items-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-200 mb-4 shadow-sm">
            <i class="fas fa-running text-amber-400 animate-pulse"></i>
            La Salle University Official Event
          </div>

          <div class="w-20 h-20 sm:w-24 sm:h-24 p-2 bg-white rounded-2xl shadow-lg mb-4 flex items-center justify-center transform hover:scale-105 transition">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
              alt="LSU Logo"
              class="w-full h-auto object-contain"
            />
          </div>

          <h1 class="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2 flex items-center justify-center gap-3">
            <span>ANIMO RUN 2026</span>
          </h1>

          <p class="text-emerald-100 text-sm sm:text-base max-w-xl font-medium">
            Run for a Cause • Unite Lasallian Community • Race to Excellence
          </p>

          <!-- Badges -->
          <div class="mt-6 flex flex-wrap justify-center gap-3 text-xs">
            <span class="px-3 py-1 bg-black/20 backdrop-blur border border-white/10 rounded-lg text-emerald-200 font-medium">
              <i class="fas fa-calendar-alt mr-1.5 text-amber-300"></i> Annual University Run
            </span>
            <span class="px-3 py-1 bg-black/20 backdrop-blur border border-white/10 rounded-lg text-emerald-200 font-medium">
              <i class="fas fa-map-marker-alt mr-1.5 text-rose-300"></i> LSU Main Campus, Ozamiz
            </span>
            <span class="px-3 py-1 bg-black/20 backdrop-blur border border-white/10 rounded-lg text-emerald-200 font-medium">
              <i class="fas fa-medal mr-1.5 text-yellow-300"></i> Exclusive Finisher Medals
            </span>
          </div>
        </div>
      </div>

      <!-- MAIN CONTAINER -->
      <div
        :class="[
          'rounded-3xl shadow-xl border overflow-hidden transition-all duration-300',
          props.darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-slate-200',
        ]"
      >
        <!-- REGISTRATION TYPE SELECTOR -->
        <div
          :class="[
            'p-6 border-b transition-colors duration-300',
            props.darkMode
              ? 'bg-gray-800/80 border-gray-700'
              : 'bg-gradient-to-r from-emerald-50/60 to-slate-50 border-slate-200',
          ]"
        >
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 class="text-xl font-bold flex items-center gap-2">
                <i class="fas fa-users text-emerald-600"></i>
                Select Registration Type
              </h2>
              <p class="text-xs text-gray-500 mt-1">
                Choose whether you are registering for yourself or a team/group
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <!-- Individual / Group Radio Cards -->
              <div class="grid grid-cols-2 gap-3 w-full sm:w-auto">
                  <div
                  @click="form_type = 'Individual'"
                  :class="[
                    'flex items-center justify-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border font-semibold text-sm transition-all duration-200 shadow-sm',
                    form_type === 'Individual'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                      : props.darkMode
                      ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50',
                  ]"
                >
                  <input
                    type="radio"
                    name="form_type"
                    value="Individual"
                    v-model="form_type"
                    class="sr-only"
                  />
                  <i class="fas fa-user text-xs"></i>
                  <span>Individual</span>
                </div>

                <div
                  @click="form_type = 'Group'"
                  :class="[
                    'flex items-center justify-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border font-semibold text-sm transition-all duration-200 shadow-sm',
                    form_type === 'Group'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                      : props.darkMode
                      ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50',
                  ]"
                >
                  <input
                    type="radio"
                    name="form_type"
                    value="Group"
                    v-model="form_type"
                    class="sr-only"
                  />
                  <i class="fas fa-users-cog text-xs"></i>
                  <span>Group</span>
                </div>
              </div>

              <!-- Group Participant Stepper -->
              <div
                v-if="form_type === 'Group'"
                :class="[
                  'flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border w-full sm:w-auto',
                  props.darkMode
                    ? 'bg-gray-900/80 border-gray-700'
                    : 'bg-white border-emerald-200 shadow-sm',
                ]"
              >
                <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  Participants:
                </span>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="number_of_participants_per_group = Math.max(1, number_of_participants_per_group - 1)"
                    class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition flex items-center justify-center text-sm"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    min="1"
                    max="50"
                    v-model="number_of_participants_per_group"
                    class="w-12 text-center font-bold text-base bg-transparent focus:outline-none"
                  />

                  <button
                    type="button"
                    @click="addParticipant"
                    class="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center justify-center text-sm shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Participant Tabs for Group Mode -->
          <div
            v-if="form_type === 'Group'"
            class="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin"
          >
            <button
              v-for="(p, pIdx) in participants"
              :key="pIdx"
              type="button"
              @click="activeParticipantIndex = pIdx"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all duration-200 border',
                activeParticipantIndex === pIdx
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-bold'
                  : props.darkMode
                  ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                  : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-100',
              ]"
            >
              <i class="fas fa-running text-xs"></i>
              <span>Runner #{{ pIdx + 1 }}</span>
              <span
                v-if="p.firstname"
                class="max-w-[90px] truncate text-[11px] opacity-90"
              >
                ({{ p.firstname }})
              </span>
              <span
                v-if="participants.length > 1"
                @click.stop="removeParticipant(pIdx)"
                class="ml-1 hover:text-rose-300 p-0.5 rounded-full"
                title="Remove runner"
              >
                <i class="fas fa-times"></i>
              </span>
            </button>

            <button
              type="button"
              @click="addParticipant"
              class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition whitespace-nowrap"
            >
              <i class="fas fa-plus text-xs"></i> Add Runner
            </button>
          </div>
        </div>

        <!-- FORM CONTENT AREA -->
        <div class="p-6 sm:p-8 space-y-10">

          <!-- GROUP HELPER TOOLBAR -->
          <div
            v-if="form_type === 'Group' && activeParticipantIndex > 0"
            :class="[
              'p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3',
              props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-emerald-50/70 border-emerald-200',
            ]"
          >
            <div class="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-info-circle text-emerald-600 text-sm"></i>
              <span>Filling details for Runner #{{ activeParticipantIndex + 1 }}</span>
            </div>

            <button
              type="button"
              @click="copyRunnerOneInfo"
              class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-gray-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <i class="fas fa-copy text-xs"></i> Copy Contact/Classification from Runner #1
            </button>
          </div>

          <!-- SECTION 1: RUN CATEGORY -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold flex items-center gap-2">
                  <span class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
                  Run Category
                </h3>
                <p class="text-xs text-gray-500 ml-9">
                  Choose the target distance for Runner #{{ activeParticipantIndex + 1 }}
                </p>
              </div>

              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Current Fee: ₱{{ runCategories.find(c => c.id === currentParticipant.run_category)?.fee || 0 }}
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="cat in runCategories"
                :key="cat.id"
                @click="currentParticipant.run_category = cat.id"
                :class="[
                  'relative rounded-2xl p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between group',
                  currentParticipant.run_category === cat.id
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-lg shadow-emerald-600/10 ring-2 ring-emerald-500/30 scale-[1.02]'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/60 hover:border-gray-600 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50',
                ]"
              >
                <!-- Badge -->
                <div class="flex items-center justify-between mb-3">
                  <span
                    :class="[
                      'text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white bg-gradient-to-r',
                      cat.color,
                    ]"
                  >
                    {{ cat.badge }}
                  </span>
                  <div
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center border text-xs transition',
                      currentParticipant.run_category === cat.id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-300 text-transparent',
                    ]"
                  >
                    <i class="fas fa-check"></i>
                  </div>
                </div>

                <!-- Content -->
                <div>
                  <div class="flex items-baseline justify-between">
                    <h4 class="text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">
                      {{ cat.id }}
                    </h4>
                    <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
                      ₱{{ cat.fee }}
                    </span>
                  </div>

                  <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">
                    {{ cat.name }}
                  </p>
                  <p class="text-[11px] text-gray-500 mt-2 line-clamp-2">
                    {{ cat.description }}
                  </p>
                </div>

                <!-- Gun Time -->
                <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span><i class="fas fa-flag-checkered mr-1"></i> Gun Time:</span>
                  <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ cat.time }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 2: PARTICIPANT CLASSIFICATION -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
                Participant Classification
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Select category affiliation for Lasallian discounts or registration tracking
              </p>
            </div>

            <div class="space-y-3">
              <!-- HEU Student -->
              <div
                @click="currentParticipant.participant_type = 'LSU Higher Education Unit Student'"
                :class="[
                  'rounded-2xl border p-4 transition-all duration-200 cursor-pointer',
                  currentParticipant.participant_type === 'LSU Higher Education Unit Student'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/30'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center justify-start gap-3 w-full text-left">
                  <input
                    type="radio"
                    value="LSU Higher Education Unit Student"
                    v-model="currentParticipant.participant_type"
                    class="w-4 h-4 shrink-0 accent-emerald-600"
                  />
                  <span class="font-bold text-sm text-gray-900 dark:text-gray-100 text-left">
                    LSU Higher Education Unit Student (College)
                  </span>
                </div>

                <div
                  v-if="currentParticipant.participant_type === 'LSU Higher Education Unit Student'"
                  @click.stop
                  class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pl-7 pt-3 border-t border-emerald-200 dark:border-gray-700"
                >
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Course / Program</label>
                    <select
                      v-model="currentParticipant.college_course"
                      :class="[
                        'w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                        props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                      ]"
                    >
                      <option value="">Select Course</option>
                      <option value="BSIT">BS Information Technology (BSIT)</option>
                      <option value="BSCS">BS Computer Science (BSCS)</option>
                      <option value="BSEd">BS Secondary Education (BSEd)</option>
                      <option value="BSN">BS Nursing (BSN)</option>
                      <option value="BSBA">BS Business Administration (BSBA)</option>
                      <option value="BSA">BS Accountancy (BSA)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Year Level</label>
                    <select
                      v-model="currentParticipant.college_year"
                      :class="[
                        'w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                        props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                      ]"
                    >
                      <option value="">Select Year Level</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- BEU Student -->
              <div
                @click="currentParticipant.participant_type = 'LSU Basic Education Unit Student'"
                :class="[
                  'rounded-2xl border p-4 transition-all duration-200 cursor-pointer',
                  currentParticipant.participant_type === 'LSU Basic Education Unit Student'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/30'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center justify-start gap-3 w-full text-left">
                  <input
                    type="radio"
                    value="LSU Basic Education Unit Student"
                    v-model="currentParticipant.participant_type"
                    class="w-4 h-4 shrink-0 accent-emerald-600"
                  />
                  <span class="font-bold text-sm text-gray-900 dark:text-gray-100 text-left">
                    LSU Basic Education Unit Student (Grade School / JHS / SHS)
                  </span>
                </div>

                <div
                  v-if="currentParticipant.participant_type === 'LSU Basic Education Unit Student'"
                  @click.stop
                  class="mt-4 pl-7 pt-3 border-t border-emerald-200 dark:border-gray-700 max-w-md"
                >
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Grade Level</label>
                  <select
                    v-model="currentParticipant.beu_grade"
                    :class="[
                      'w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  >
                    <option value="">Select Grade</option>
                    <option value="Pre-School">Pre-School</option>
                    <option value="Kinder 1">Kinder 1</option>
                    <option value="Kinder 2">Kinder 2</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7 JHS">Grade 7 JHS</option>
                    <option value="Grade 8 JHS">Grade 8 JHS</option>
                    <option value="Grade 9 JHS">Grade 9 JHS</option>
                    <option value="Grade 10 JHS">Grade 10 JHS</option>
                    <option value="Grade 11 SHS">Grade 11 SHS</option>
                    <option value="Grade 12 SHS">Grade 12 SHS</option>
                  </select>
                </div>
              </div>

              <!-- Lasallian Partners -->
              <div
                @click="currentParticipant.participant_type = 'Lasallian Partners'"
                :class="[
                  'rounded-2xl border p-4 transition-all duration-200 cursor-pointer',
                  currentParticipant.participant_type === 'Lasallian Partners'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/30'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center justify-start gap-3 w-full text-left">
                  <input
                    type="radio"
                    value="Lasallian Partners"
                    v-model="currentParticipant.participant_type"
                    class="w-4 h-4 shrink-0 accent-emerald-600"
                  />
                  <span class="font-bold text-sm text-gray-900 dark:text-gray-100 text-left">
                    Lasallian Partners (Faculty / Personnel / Admin Staff)
                  </span>
                </div>

                <div
                  v-if="currentParticipant.participant_type === 'Lasallian Partners'"
                  @click.stop
                  class="mt-4 pl-7 pt-3 border-t border-emerald-200 dark:border-gray-700 max-w-md"
                >
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Center / Office / Department</label>
                  <select
                    v-model="currentParticipant.partner_office"
                    :class="[
                      'w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  >
                    <option value="">Select Office</option>
                    <option value="Office of the Chancellor">Office of the Chancellor</option>
                    <option value="College of Computer Studies">College of Computer Studies</option>
                    <option value="General Services Office">General Services Office</option>
                    <option value="University Registrar">University Registrar</option>
                    <option value="Human Resource Center">Human Resource Center</option>
                  </select>
                </div>
              </div>

              <!-- Alumni -->
              <div
                @click="currentParticipant.participant_type = 'Alumni'"
                :class="[
                  'rounded-2xl border p-4 transition-all duration-200 cursor-pointer',
                  currentParticipant.participant_type === 'Alumni'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/30'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center justify-start gap-3 w-full text-left">
                  <input
                    type="radio"
                    value="Alumni"
                    v-model="currentParticipant.participant_type"
                    class="w-4 h-4 shrink-0 accent-emerald-600"
                  />
                  <span class="font-bold text-sm text-gray-900 dark:text-gray-100 text-left">
                    Lasallian Alumni
                  </span>
                </div>

                <div
                  v-if="currentParticipant.participant_type === 'Alumni'"
                  @click.stop
                  class="mt-4 pl-7 pt-3 border-t border-emerald-200 dark:border-gray-700 max-w-md"
                >
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Batch / Graduation Year</label>
                  <input
                    type="text"
                    v-model="currentParticipant.alumni_batch"
                    placeholder="e.g. Batch 2018"
                    :class="[
                      'w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  />
                </div>
              </div>

              <!-- Non-LSU -->
              <div
                @click="currentParticipant.participant_type = 'Non-LSU'"
                :class="[
                  'rounded-2xl border p-4 transition-all duration-200 cursor-pointer',
                  currentParticipant.participant_type === 'Non-LSU'
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500/30'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center justify-start gap-3 w-full text-left">
                  <input
                    type="radio"
                    value="Non-LSU"
                    v-model="currentParticipant.participant_type"
                    class="w-4 h-4 shrink-0 accent-emerald-600"
                  />
                  <span class="font-bold text-sm text-gray-900 dark:text-gray-100 text-left">
                    Non-LSU Guest / Guest Runner / Running Club
                  </span>
                </div>

                <div
                  v-if="currentParticipant.participant_type === 'Non-LSU'"
                  @click.stop
                  class="mt-4 pl-7 pt-3 border-t border-emerald-200 dark:border-gray-700 max-w-md"
                >
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Organization / Running Club / Company</label>
                  <input
                    type="text"
                    v-model="currentParticipant.organization"
                    placeholder="e.g. Ozamiz Striders Running Club"
                    :class="[
                      'w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 3: PERSONAL INFORMATION -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
                Personal Information
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Personal details for Runner #{{ activeParticipantIndex + 1 }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">First Name *</label>
                <input
                  v-model="currentParticipant.firstname"
                  placeholder="Juan"
                  :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Middle Name</label>
                <input
                  v-model="currentParticipant.middlename"
                  placeholder="Santos"
                  :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Last Name *</label>
                <input
                  v-model="currentParticipant.lastname"
                  placeholder="Dela Cruz"
                  :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Suffix</label>
                <select
                  v-model="currentParticipant.suffix"
                  :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]"
                >
                  <option value="">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="Sr.">Sr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  v-model="currentParticipant.birthdate"
                  :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Gender *</label>
                <div class="grid grid-cols-2 gap-3">
                  <div
                    @click="currentParticipant.gender = 'Male'"
                    :class="[
                      'flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-semibold text-xs transition',
                      currentParticipant.gender === 'Male'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : props.darkMode
                        ? 'bg-gray-800 border-gray-600 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-slate-50',
                    ]"
                  >
                    <input type="radio" value="Male" v-model="currentParticipant.gender" class="sr-only" />
                    <i class="fas fa-mars"></i> Male
                  </div>

                  <div
                    @click="currentParticipant.gender = 'Female'"
                    :class="[
                      'flex items-center justify-center gap-2 p-2.5 rounded-xl border cursor-pointer font-semibold text-xs transition',
                      currentParticipant.gender === 'Female'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : props.darkMode
                        ? 'bg-gray-800 border-gray-600 text-gray-300'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-slate-50',
                    ]"
                  >
                    <input type="radio" value="Female" v-model="currentParticipant.gender" class="sr-only" />
                    <i class="fas fa-venus"></i> Female
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 4: CONTACT DETAILS -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
                Contact Details
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Used for registration confirmation and race notifications
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Contact Phone Number *</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs text-gray-400">
                    <i class="fas fa-phone"></i>
                  </span>
                  <input
                    v-model="currentParticipant.contact_number"
                    placeholder="0917 123 4567"
                    :class="[
                      'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address *</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs text-gray-400">
                    <i class="fas fa-envelope"></i>
                  </span>
                  <input
                    v-model="currentParticipant.contact_email"
                    placeholder="runner@lsu.edu.ph"
                    :class="[
                      'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  />
                </div>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Complete Address</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs text-gray-400">
                    <i class="fas fa-map-marker-alt"></i>
                  </span>
                  <input
                    v-model="currentParticipant.contact_address"
                    placeholder="Barangay, City, Province"
                    :class="[
                      'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                    ]"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 5: VALID ID UPLOAD -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">5</span>
                Valid ID Upload
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Upload School ID or Government ID for identity verification
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- ID Front Dropzone -->
              <div
                :class="[
                  'rounded-2xl border-2 border-dashed p-4 text-center transition-all relative overflow-hidden',
                  currentParticipant.validIdFrontPreview
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
                ]"
              >
                <div v-if="!currentParticipant.validIdFrontPreview">
                  <i class="fas fa-id-card text-3xl text-emerald-500 mb-2"></i>
                  <p class="text-xs font-bold mb-1">Upload ID Front</p>
                  <p class="text-[10px] text-gray-400 mb-3">PNG, JPG, or PDF up to 5MB</p>
                  <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm">
                    <i class="fas fa-upload"></i> Browse File
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="(e) => handleFileUpload(e, 'front', activeParticipantIndex)"
                    />
                  </label>
                </div>

                <div v-else class="relative group">
                  <img
                    :src="currentParticipant.validIdFrontPreview"
                    alt="ID Front Preview"
                    class="h-32 w-full object-cover rounded-xl border"
                  />
                  <div class="mt-2 flex items-center justify-between text-xs">
                    <span class="truncate max-w-[150px] font-medium text-emerald-600 dark:text-emerald-400">
                      <i class="fas fa-check-circle"></i> {{ currentParticipant.validIdFront?.name || 'ID Front' }}
                    </span>
                    <button
                      type="button"
                      @click="removeFile('front', activeParticipantIndex)"
                      class="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <!-- ID Back Dropzone -->
              <div
                :class="[
                  'rounded-2xl border-2 border-dashed p-4 text-center transition-all relative overflow-hidden',
                  currentParticipant.validIdBackPreview
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
                ]"
              >
                <div v-if="!currentParticipant.validIdBackPreview">
                  <i class="fas fa-address-card text-3xl text-emerald-500 mb-2"></i>
                  <p class="text-xs font-bold mb-1">Upload ID Back</p>
                  <p class="text-[10px] text-gray-400 mb-3">PNG, JPG, or PDF up to 5MB</p>
                  <label class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm">
                    <i class="fas fa-upload"></i> Browse File
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="(e) => handleFileUpload(e, 'back', activeParticipantIndex)"
                    />
                  </label>
                </div>

                <div v-else class="relative group">
                  <img
                    :src="currentParticipant.validIdBackPreview"
                    alt="ID Back Preview"
                    class="h-32 w-full object-cover rounded-xl border"
                  />
                  <div class="mt-2 flex items-center justify-between text-xs">
                    <span class="truncate max-w-[150px] font-medium text-emerald-600 dark:text-emerald-400">
                      <i class="fas fa-check-circle"></i> {{ currentParticipant.validIdBack?.name || 'ID Back' }}
                    </span>
                    <button
                      type="button"
                      @click="removeFile('back', activeParticipantIndex)"
                      class="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 6: RACE ADD-ONS -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">6</span>
                Race Add-ons & Merchandise
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Optional merchandise and personalized upgrades for Runner #{{ activeParticipantIndex + 1 }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="addon in availableAddons"
                :key="addon.id"
                @click="toggleAddon(activeParticipantIndex, addon.id)"
                :class="[
                  'p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-center justify-between',
                  currentParticipant.selectedAddons.includes(addon.id)
                    ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/30 shadow-sm ring-1 ring-emerald-500'
                    : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
                      currentParticipant.selectedAddons.includes(addon.id)
                        ? 'bg-emerald-600 text-white'
                        : props.darkMode
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-emerald-100 text-emerald-700',
                    ]"
                  >
                    <i :class="['fas', addon.icon]"></i>
                  </div>

                  <div>
                    <h4 class="text-xs font-bold text-gray-900 dark:text-gray-100">
                      {{ addon.name }}
                    </h4>
                    <p class="text-[11px] text-gray-500 mt-0.5">
                      {{ addon.desc }}
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <span class="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    +₱{{ addon.fee }}
                  </span>
                  <div class="mt-1">
                    <span
                      :class="[
                        'text-[10px] px-2 py-0.5 rounded-full font-bold',
                        currentParticipant.selectedAddons.includes(addon.id)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
                      ]"
                    >
                      {{ currentParticipant.selectedAddons.includes(addon.id) ? 'Selected' : 'Add' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 7: PAYMENT SUMMARY & OPTIONS -->
          <section
            :class="[
              'rounded-3xl p-6 sm:p-8 border shadow-lg transition-all',
              props.darkMode
                ? 'bg-gray-900/90 border-gray-700'
                : 'bg-gradient-to-br from-slate-50 to-emerald-50/40 border-emerald-200',
            ]"
          >
            <h3 class="text-xl font-black mb-4 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-receipt text-emerald-600"></i>
              Payment & Checkout Summary
            </h3>

            <!-- Itemized breakdown list -->
            <div class="space-y-2.5 mb-6 text-xs border-b pb-4 dark:border-gray-700">
              <div
                v-for="(item, i) in itemizedFees"
                :key="i"
                class="flex items-center justify-between font-medium"
              >
                <span class="text-gray-600 dark:text-gray-400">{{ item.name }}</span>
                <span class="font-bold text-gray-900 dark:text-gray-200">₱{{ item.amount }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="flex items-center justify-between text-base sm:text-lg font-black mb-8">
              <span class="text-gray-800 dark:text-gray-200">Grand Total Fee</span>
              <span class="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                ₱{{ grandTotal.toLocaleString() }}
              </span>
            </div>

            <!-- Payment Type Selection -->
            <div class="space-y-3 mb-8">
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Select Payment Option
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Salary Deduction Option -->
                <div
                  @click="paymentType = 'salary_deduction'"
                  :class="[
                    'p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 text-left justify-start',
                    paymentType === 'salary_deduction'
                      ? 'border-emerald-600 bg-emerald-600/10 ring-2 ring-emerald-500/40'
                      : props.darkMode
                      ? 'border-gray-700 bg-gray-800/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  ]"
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="salary_deduction"
                    v-model="paymentType"
                    class="mt-1 shrink-0 accent-emerald-600"
                  />
                  <div class="text-left">
                    <span class="font-bold text-sm block">Via Salary Deduction</span>
                    <span class="text-xs text-gray-500 block mt-0.5">
                      Exclusive for LSU Faculty & Staff. Pending admin approval.
                    </span>
                  </div>
                </div>

                <!-- Direct Payment Option -->
                <div
                  @click="paymentType = 'direct_payment'"
                  :class="[
                    'p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 text-left justify-start',
                    paymentType === 'direct_payment'
                      ? 'border-emerald-600 bg-emerald-600/10 ring-2 ring-emerald-500/40'
                      : props.darkMode
                      ? 'border-gray-700 bg-gray-800/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  ]"
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="direct_payment"
                    v-model="paymentType"
                    class="mt-1 shrink-0 accent-emerald-600"
                  />
                  <div class="text-left">
                    <span class="font-bold text-sm block">Via Direct Payment / Stripe</span>
                    <span class="text-xs text-gray-500 block mt-0.5">
                      Pay instantly using GCash, Maya, Credit Card, or Over-the-Counter.
                    </span>
                  </div>
                </div>
            </div>
            </div>

            <!-- Submit / Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button
                v-if="paymentType === 'direct_payment'"
                type="button"
                @click="redirectStripe"
                class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 text-base"
              >
                <i class="fas fa-credit-card"></i> Proceed to Stripe Payment (₱{{ grandTotal.toLocaleString() }})
              </button>

              <button
                type="button"
                @click="submitRegistration"
                :disabled="isSubmitting"
                class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-base"
              >
                <i v-if="!isSubmitting" class="fas fa-check-circle"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span>{{ isSubmitting ? 'Submitting Registration...' : 'Confirm Registration' }}</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 9999px;
}
</style>
