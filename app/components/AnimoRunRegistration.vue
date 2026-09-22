<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";

const props = defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
});

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const toastModal = ref({
  show: false,
  title: "Validation Notice",
  message: "",
  type: "warning",
});

const showNotice = (message, title = "Validation Notice", type = "warning") => {
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

const { user, init } = useAuth();

onMounted(() => {
  if (init) init();
  if (user?.value?.email && !participants.value[0].contact_email) {
    participants.value[0].contact_email = user.value.email;
  }
});

const form_type = ref("Individual");
const number_of_participants_per_group = ref(1);
const activeParticipantIndex = ref(0);

const paymentType = ref("add_to_tuition");
const nonLsuPaymentMethod = ref("qr_payment");
const receiptFile = ref(null);
const receiptPreview = ref(null);
const isSubmitting = ref(false);

const runCategories = [
  {
    id: "1K",
    categoryType: "pet",
    categoryTypeLabel: "Pet & Runner Duo",
    name: "1K — EMERALD PAWS",
    tagline: "Run together with your best furry friend.",
    fee: 1000,
    time: "5:00 AM",
    description: "Special 1KM Pet & Runner Duo race route for dogs, cats & friendly pets.",
    color: "from-sky-500 via-teal-500 to-indigo-600",
    badge: "Pet Run (1K)",
    icon: "fa-paw",
    inclusions: [
      "Pet Owner's Event Shirt",
      "Pet Bandana & Race Bib",
      "Pet Treat & Post-Meal Snack",
      "Acrylic Finisher Medal",
    ],
  },
  {
    id: "3K",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "3K — EMERALD STARTER",
    tagline: "Start your journey.",
    fee: 1000,
    time: "4:55 AM",
    description: "Perfect for beginners, families, and casual runners.",
    color: "from-amber-500 to-emerald-600",
    badge: "Starter (3K)",
    icon: "fa-running",
    inclusions: [
      "Official Event Shirt",
      "Post-Meal & Snack",
      "Race Bib with Timing",
      "Metal Finisher Medal",
    ],
  },
  {
    id: "10K",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "10K — EMERALD ENDURANCE",
    tagline: "Go farther. Go stronger.",
    fee: 1400,
    time: "4:40 AM",
    description: "For intermediate runners pushing their endurance limits.",
    color: "from-teal-600 to-emerald-700",
    badge: "Endurance (10K)",
    icon: "fa-stopwatch",
    inclusions: [
      "Official Event Shirt",
      "Post-Meal & Snack",
      "Race Bib with Timing",
      "Metal Finisher Medal",
    ],
  },
  {
    id: "20K",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "20K — EMERALD ULTIMATE",
    tagline: "Conquer the ultimate challenge.",
    fee: 1800,
    time: "4:00 AM",
    description: "The premier distance for competitive runners and veterans.",
    color: "from-emerald-700 to-green-950",
    badge: "Ultimate (20K)",
    icon: "fa-trophy",
    inclusions: [
      "Event Shirt & Finisher Shirt",
      "Post-Meal & Snack",
      "Race Bib with Timing",
      "Metal Finisher Medal",
    ],
  },
];

const tshirtSizes = [
  "4XS",
  "3XS",
  "2XS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
];

const createEmptyParticipant = (index = 1) => ({
  id: index,
  run_category: "3K",
  participant_type: "LSU Higher Education Unit Student",
  lsu_id_number: "",
  firstname: "",
  middlename: "",
  lastname: "",
  suffix: "",
  birthdate: "",
  gender: "Male",
  contact_number: "",
  contact_email: user?.value?.email || "",
  contact_address: "",
  college_course: "BSIT",
  college_year: "1st Year",
  beu_grade: "",
  partner_office: "",
  alumni_batch: "",
  organization: "",
  // Pet Run fields (active when run_category === '1K')
  pet_name: "",
  pet_type: "Dog",
  pet_breed: "",
  pet_bandana_size: "Medium",
  pet_vaccinated: true,
  tshirt_size: "M",
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

// Automatically adjust recommended paymentType when participant classification changes
watch(
  () => currentParticipant.value.participant_type,
  (newType) => {
    if (newType === "Lasallian Partners") {
      paymentType.value = "salary_deduction";
    } else if (
      newType === "LSU Higher Education Unit Student" ||
      newType === "LSU Basic Education Unit Student"
    ) {
      paymentType.value = "add_to_tuition";
    } else if (newType === "Non-LSU" || newType === "Alumni") {
      paymentType.value = "non_lsu_payment";
    }
  }
);

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

const handleReceiptUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  receiptFile.value = file;
  receiptPreview.value = URL.createObjectURL(file);
};

const removeReceipt = () => {
  receiptFile.value = null;
  receiptPreview.value = null;
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
      const shirtDesc =
        p.run_category === "1K"
          ? `Size: ${p.tshirt_size || "M"} (Owner) + Bandana (${p.pet_bandana_size || "Medium"})`
          : p.run_category === "20K"
          ? `Size: ${p.tshirt_size || "M"} (Event & Finisher Shirts)`
          : `Size: ${p.tshirt_size || "M"}`;

      items.push({
        name: `${labelPrefix}${cat.name} (${cat.id})${p.run_category === "1K" && p.pet_name ? ' - Pet: ' + p.pet_name : ''}`,
        shirt: shirtDesc,
        amount: cat.fee,
        isPet: p.run_category === "1K",
      });
    }
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
  p.lsu_id_number = r1.lsu_id_number;
};

const isSuccessModalOpen = ref(false);
const registrationResult = ref(null);

const uploadSingleFile = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await $fetch(`${endpoint.value}/api/animorun/upload/`, {
      method: "POST",
      body: formData,
    });
    return res.url;
  } catch (err) {
    console.warn("File upload to API failed or S3 unavailable:", err);
    return null;
  }
};

const resetForm = () => {
  form_type.value = "Individual";
  number_of_participants_per_group.value = 1;
  activeParticipantIndex.value = 0;
  participants.value = [createEmptyParticipant(1)];
  receiptFile.value = null;
  receiptPreview.value = null;
  isSuccessModalOpen.value = false;
  registrationResult.value = null;
};

const submitRegistration = async () => {
  // Validate participant name & contact
  for (let i = 0; i < participants.value.length; i++) {
    const p = participants.value[i];
    if (!p.firstname?.trim() || !p.lastname?.trim()) {
      showNotice(
        `Please provide the First Name and Last Name for Runner #${i + 1}.`,
        "Participant Name Required",
        "warning"
      );
      activeParticipantIndex.value = i;
      return;
    }
    if (!p.contact_number?.trim()) {
      showNotice(
        `Please provide a valid Contact Number for Runner #${i + 1}.`,
        "Contact Number Required",
        "warning"
      );
      activeParticipantIndex.value = i;
      return;
    }
    if (!p.contact_email?.trim() && !user?.value?.email) {
      showNotice(
        `Please provide an Email Address for Runner #${i + 1} to receive your confirmation receipt.`,
        "Email Address Required",
        "warning"
      );
      activeParticipantIndex.value = i;
      return;
    }
  }

  // Validate non-LSU ID upload
  const hasNonLsuWithoutId = participants.value.some(
    (p) => p.participant_type === "Non-LSU" && !p.validIdFront
  );
  if (hasNonLsuWithoutId) {
    showNotice(
      "Please upload a Valid ID (Front) for Non-LSU participant(s) before submitting.",
      "Valid ID Required",
      "warning"
    );
    return;
  }

  // Validate Pet Name if 1K Pet Run category is selected
  const hasPetWithoutName = participants.value.some(
    (p) => p.run_category === "1K" && !p.pet_name?.trim()
  );
  if (hasPetWithoutName) {
    showNotice(
      "Please provide your Pet's Name for the 1K Emerald Paws Pet Run category.",
      "Pet Name Required",
      "warning"
    );
    return;
  }

  // Validate Pet vaccination assurance
  const hasPetWithoutVaccine = participants.value.some(
    (p) => p.run_category === "1K" && !p.pet_vaccinated
  );
  if (hasPetWithoutVaccine) {
    showNotice(
      "Please confirm the Pet Safety and Anti-Rabies Vaccination assurance for the 1K Pet Run.",
      "Pet Safety Assurance Required",
      "warning"
    );
    return;
  }

  // Validate LSU ID Number for salary deduction / add to tuition
  if (paymentType.value === "salary_deduction") {
    if (!currentParticipant.value.lsu_id_number?.trim()) {
      showNotice(
        "Please provide your LSU Employee ID Number for Salary Deduction verification.",
        "LSU Employee ID Required",
        "warning"
      );
      return;
    }
  } else if (paymentType.value === "add_to_tuition") {
    if (!currentParticipant.value.lsu_id_number?.trim()) {
      showNotice(
        "Please provide your LSU Student ID Number for Add to Tuition verification.",
        "LSU Student ID Required",
        "warning"
      );
      return;
    }
  } else if (paymentType.value === "non_lsu_payment") {
    if (!receiptFile.value) {
      showNotice(
        "Please upload your proof of payment or deposit transfer screenshot before submitting.",
        "Payment Receipt Required",
        "warning"
      );
      return;
    }
  }

  isSubmitting.value = true;

  try {
    // 1. Upload receipt file if present
    let receiptUrl = "";
    if (receiptFile.value) {
      receiptUrl = await uploadSingleFile(receiptFile.value);
    }

    // 2. Upload participant valid IDs if present
    for (const p of participants.value) {
      if (p.validIdFront instanceof File) {
        p.valid_id_front_url = await uploadSingleFile(p.validIdFront);
      }
      if (p.validIdBack instanceof File) {
        p.valid_id_back_url = await uploadSingleFile(p.validIdBack);
      }
      if (!p.contact_email?.trim() && user?.value?.email) {
        p.contact_email = user.value.email;
      }
    }

    // 3. Prepare payload and dispatch to Django API
    const effectivePaymentType =
      paymentType.value === "non_lsu_payment"
        ? nonLsuPaymentMethod.value || "qr_payment"
        : paymentType.value;

    let res;
    if (form_type.value === "Group") {
      const payload = {
        participants: participants.value.map((p) => ({
          firstname: p.firstname,
          middlename: p.middlename,
          lastname: p.lastname,
          suffix: p.suffix,
          run_category: p.run_category,
          participant_type: p.participant_type,
          lsu_id_number: p.lsu_id_number,
          birthdate: p.birthdate,
          gender: p.gender,
          contact_number: p.contact_number,
          contact_email: p.contact_email || user?.value?.email || "",
          contact_address: p.contact_address,
          college_course: p.college_course,
          college_year: p.college_year,
          beu_grade: p.beu_grade,
          partner_office: p.partner_office,
          alumni_batch: p.alumni_batch,
          organization: p.organization,
          tshirt_size: p.tshirt_size,
          pet_name: p.pet_name,
          pet_type: p.pet_type,
          pet_breed: p.pet_breed,
          pet_bandana_size: p.pet_bandana_size,
          pet_vaccinated: p.pet_vaccinated,
          valid_id_front: p.valid_id_front_url ? [{ name: "ID Front", url: p.valid_id_front_url }] : [],
          valid_id_back: p.valid_id_back_url ? [{ name: "ID Back", url: p.valid_id_back_url }] : [],
        })),
        form_type: "Group",
        payment_type: effectivePaymentType,
        proof_of_payment: receiptUrl || "",
        grand_total_payment: grandTotal.value,
        detail_fees: itemizedFees.value,
      };

      res = await $fetch(`${endpoint.value}/api/animorun/create/`, {
        method: "POST",
        body: payload,
      });
    } else {
      const p = participants.value[0];
      const payload = {
        firstname: p.firstname,
        middlename: p.middlename,
        lastname: p.lastname,
        suffix: p.suffix,
        run_category: p.run_category,
        participant_type: p.participant_type,
        lsu_id_number: p.lsu_id_number,
        birthdate: p.birthdate,
        gender: p.gender,
        contact_number: p.contact_number,
        contact_email: p.contact_email || user?.value?.email || "",
        contact_address: p.contact_address,
        college_course: p.college_course,
        college_year: p.college_year,
        beu_grade: p.beu_grade,
        partner_office: p.partner_office,
        alumni_batch: p.alumni_batch,
        organization: p.organization,
        tshirt_size: p.tshirt_size,
        pet_name: p.pet_name,
        pet_type: p.pet_type,
        pet_breed: p.pet_breed,
        pet_bandana_size: p.pet_bandana_size,
        pet_vaccinated: p.pet_vaccinated,
        form_type: "Individual",
        payment_type: effectivePaymentType,
        proof_of_payment: receiptUrl || "",
        grand_total_payment: grandTotal.value,
        detail_fees: itemizedFees.value,
        valid_id_front: p.valid_id_front_url ? [{ name: "ID Front", url: p.valid_id_front_url }] : [],
        valid_id_back: p.valid_id_back_url ? [{ name: "ID Back", url: p.valid_id_back_url }] : [],
      };

      res = await $fetch(`${endpoint.value}/api/animorun/create/`, {
        method: "POST",
        body: payload,
      });
    }

    registrationResult.value = res;
    isSuccessModalOpen.value = true;
  } catch (error) {
    console.error("Registration submission error:", error);
    showNotice(
      "We were unable to process your registration. Please check your network connection or try again in a few moments.",
      "Submission Error",
      "error"
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div :class="[
    'min-h-screen py-2 px-2 sm:px-4 lg:px-8 transition-colors duration-300',
    props.darkMode ? 'bg-gray-900 text-gray-100' : 'bg-slate-50 text-gray-800',
  ]">
    <div class="">
      <!-- HERO / HEADER -->
      <div :class="[
        'relative overflow-hidden rounded-2xl shadow-xl mb-2 border transition-all duration-300',
        props.darkMode
          ? 'bg-gradient-to-br from-green-950 via-emerald-900 to-gray-900 border-green-800/40'
          : 'bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800 border-green-600 text-white',
      ]">
        <!-- Background decorative elements -->
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="relative px-4 py-3 sm:px-8 sm:py-5">
          <!-- Mobile: compact row layout -->
          <div class="flex items-center gap-3 sm:gap-5">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo%20White.png"
              alt="LSU Logo" class="w-11 sm:w-16 h-auto object-contain shrink-0" />
            <div class="flex-1 min-w-0">
              <h1 class="text-base sm:text-2xl font-black text-white tracking-wide leading-tight flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span>ANIMO RUN 2026</span>
                <span class="text-emerald-200 font-semibold text-xs sm:text-base">· THE EMERALD RUN</span>
              </h1>
              <!-- Badges - scrollable on mobile -->
              <div class="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none text-[10px] sm:text-xs flex-nowrap sm:flex-wrap">
                <span class="px-2 py-1 bg-black/20 backdrop-blur border border-white/10 rounded-lg text-emerald-200 font-medium whitespace-nowrap shrink-0">
                  <i class="fas fa-calendar-alt mr-1 text-amber-300"></i> Annual University Run
                </span>
                <span class="px-2 py-1 bg-black/20 backdrop-blur border border-white/10 rounded-lg text-emerald-200 font-medium whitespace-nowrap shrink-0">
                  <i class="fas fa-map-marker-alt mr-1 text-rose-300"></i> LSU Main Campus
                </span>
                <span class="px-2 py-1 bg-black/20 backdrop-blur border border-white/10 rounded-lg text-emerald-200 font-medium whitespace-nowrap shrink-0">
                  <i class="fas fa-medal mr-1 text-yellow-300"></i> Finisher Medals & Shirts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN CONTAINER -->
      <div :class="[
        'rounded-3xl shadow-xl border overflow-hidden transition-all duration-300',
        props.darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-slate-200',
      ]">
        <!-- REGISTRATION TYPE SELECTOR -->
        <div :class="[
          'p-3 sm:p-5 border-b transition-colors duration-300',
          props.darkMode
            ? 'bg-gray-800/80 border-gray-700'
            : 'bg-gradient-to-r from-emerald-50/60 to-slate-50 border-slate-200',
        ]">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-5">
            <div>
              <h2 class="text-base sm:text-lg font-bold flex items-center gap-2">
                <i class="fas fa-users text-emerald-600"></i>
                Select Registration Type
              </h2>
              <p class="text-xs text-gray-500 mt-0.5">
                Choose whether you are registering for yourself or a team/group
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <!-- Individual / Group Radio Cards -->
              <div class="grid grid-cols-2 gap-3 w-full sm:w-auto">
                <div @click="form_type = 'Individual'" :class="[
                  'flex items-center justify-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border font-semibold text-sm transition-all duration-200 shadow-sm',
                  form_type === 'Individual'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                    : props.darkMode
                      ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50',
                ]">
                  <input type="radio" name="form_type" value="Individual" v-model="form_type" class="sr-only" />
                  <i class="fas fa-user text-xs"></i>
                  <span>Individual</span>
                </div>

                <div @click="form_type = 'Group'" :class="[
                  'flex items-center justify-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border font-semibold text-sm transition-all duration-200 shadow-sm',
                  form_type === 'Group'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-emerald-600/30'
                    : props.darkMode
                      ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50',
                ]">
                  <input type="radio" name="form_type" value="Group" v-model="form_type" class="sr-only" />
                  <i class="fas fa-users-cog text-xs"></i>
                  <span>Group</span>
                </div>
              </div>

              <!-- Group Participant Stepper -->
              <div v-if="form_type === 'Group'" :class="[
                'flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border w-full sm:w-auto',
                props.darkMode
                  ? 'bg-gray-900/80 border-gray-700'
                  : 'bg-white border-emerald-200 shadow-sm',
              ]">
                <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  Participants:
                </span>

                <div class="flex items-center gap-2">
                  <button type="button"
                    @click="number_of_participants_per_group = Math.max(1, number_of_participants_per_group - 1)"
                    class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-200 transition flex items-center justify-center text-sm">
                    -
                  </button>

                  <input type="number" min="1" max="50" v-model="number_of_participants_per_group"
                    class="w-12 text-center font-bold text-base bg-transparent focus:outline-none" />

                  <button type="button" @click="addParticipant"
                    class="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition flex items-center justify-center text-sm shadow-sm">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Participant Tabs for Group Mode -->
          <div v-if="form_type === 'Group'" class="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button v-for="(p, pIdx) in participants" :key="pIdx" type="button" @click="activeParticipantIndex = pIdx"
              :class="[
                'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all duration-200 border',
                activeParticipantIndex === pIdx
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-bold'
                  : props.darkMode
                    ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-100',
              ]">
              <i class="fas fa-running text-xs"></i>
              <span>Runner #{{ pIdx + 1 }}</span>
              <span v-if="p.firstname" class="max-w-[90px] truncate text-[11px] opacity-90">
                ({{ p.firstname }})
              </span>
              <span v-if="participants.length > 1" @click.stop="removeParticipant(pIdx)"
                class="ml-1 hover:text-rose-300 p-0.5 rounded-full" title="Remove runner">
                <i class="fas fa-times"></i>
              </span>
            </button>

            <button type="button" @click="addParticipant"
              class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-dashed border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition whitespace-nowrap">
              <i class="fas fa-plus text-xs"></i> Add Runner
            </button>
          </div>
        </div>

        <!-- FORM CONTENT AREA -->
        <div class="p-3 sm:p-5 space-y-6 sm:space-y-8">

          <!-- GROUP HELPER TOOLBAR -->
          <div v-if="form_type === 'Group' && activeParticipantIndex > 0" :class="[
            'p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3',
            props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-emerald-50/70 border-emerald-200',
          ]">
            <div class="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-info-circle text-emerald-600 text-sm"></i>
              <span>Filling details for Runner #{{ activeParticipantIndex + 1 }}</span>
            </div>

            <button type="button" @click="copyRunnerOneInfo"
              class="px-3 py-1.5 bg-white dark:bg-gray-800 border border-emerald-300 dark:border-gray-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5">
              <i class="fas fa-copy text-xs"></i> Copy Contact/Classification from Runner #1
            </button>
          </div>

          <!-- SECTION 1: RUN CATEGORY (3 MAIN DISTANCES) -->
          <section>
            <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 class="text-base sm:text-lg font-bold flex items-center gap-2">
                  <span
                    class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
                  Run Category
                </h3>
                <p class="text-xs text-gray-500 ml-9">
                  Choose race distance for Runner #{{ activeParticipantIndex + 1 }}
                </p>
              </div>

              <div>
                <span
                  v-if="currentParticipant.run_category === '1K'"
                  class="text-xs font-bold px-3 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1.5 shadow-xs">
                  <i class="fas fa-paw text-sky-500"></i> Selected: 1K (₱1,000)
                </span>
                <span
                  v-else
                  class="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5 shadow-xs">
                  <i class="fas fa-running text-emerald-600"></i> Selected: {{ currentParticipant.run_category }} (₱{{ runCategories.find(c => c.id === currentParticipant.run_category)?.fee?.toLocaleString() || 0 }})
                </span>
              </div>
            </div>

            <!-- Mobile Quick Category Selector Pills -->
            <div class="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
              <button
                v-for="cat in runCategories"
                :key="'pill-' + cat.id"
                type="button"
                @click="currentParticipant.run_category = cat.id"
                :class="[
                  'px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer',
                  currentParticipant.run_category === cat.id
                    ? (cat.categoryType === 'pet' ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/30' : 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30')
                    : props.darkMode ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700' : 'bg-white text-gray-700 border-slate-200 hover:bg-emerald-50/50'
                ]"
              >
                <i :class="['fas text-[11px]', cat.icon]"></i>
                <span>{{ cat.id }}</span>
                <span class="opacity-80 font-normal">₱{{ cat.fee.toLocaleString() }}</span>
                <span v-if="cat.categoryType === 'pet'" class="text-[9px] bg-sky-400/30 text-sky-100 px-1 py-0.5 rounded uppercase font-extrabold">Pet</span>
              </button>
            </div>

            <!-- RACE CARDS CONTAINER -->
            <!-- Mobile: Horizontal swipe snap container; Desktop: flex row with sidebar -->
            <div class="flex lg:flex-row gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none items-stretch -mx-2 px-2 sm:mx-0 sm:px-0">

              <!-- ── PET RUN CARD ─────────────────────────────────── -->
              <div
                :class="[
                  'relative rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all duration-300 overflow-hidden select-none flex flex-col justify-between w-[84vw] max-w-[320px] lg:w-[26%] shrink-0 snap-center',
                  currentParticipant.run_category === '1K'
                    ? 'border-sky-500 bg-gradient-to-b from-sky-50/90 to-white dark:from-sky-950/50 dark:to-gray-800/90 shadow-xl shadow-sky-500/20 ring-2 ring-sky-400/40 scale-[1.01]'
                    : props.darkMode
                      ? 'border-sky-800/50 bg-sky-950/20 hover:border-sky-500/60 hover:bg-sky-950/30 shadow-md'
                      : 'border-sky-200 bg-sky-50/40 hover:border-sky-400 hover:bg-sky-50/70 shadow-sm shadow-sky-200/60'
                ]"
                @click="currentParticipant.run_category = '1K'">

                <!-- Watermark -->
                <div class="absolute -right-4 -bottom-4 text-8xl text-sky-400/5 pointer-events-none select-none">
                  <i class="fas fa-paw"></i>
                </div>

                <div>
                  <!-- Badge row -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-gradient-to-r from-sky-500 via-teal-500 to-indigo-600 shadow-sm flex items-center gap-1">
                      <i class="fas fa-paw text-[9px]"></i> Pet Run
                    </span>
                    <div :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition shrink-0',
                      currentParticipant.run_category === '1K'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 text-transparent'
                    ]">
                      <i class="fas fa-check"></i>
                    </div>
                  </div>

                  <!-- Distance & Fee -->
                  <div class="flex items-baseline justify-between pt-1">
                    <h4 class="text-2xl font-black tracking-tight text-sky-700 dark:text-sky-400">1K</h4>
                    <span class="text-xl font-black text-gray-900 dark:text-gray-100">₱1,000</span>
                  </div>

                  <!-- Sub-label -->
                  <div class="mt-1">
                    <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60">
                      <i class="fas fa-dog text-[9px]"></i> Pet Run Category
                    </span>
                  </div>

                  <p class="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">1K — EMERALD PAWS</p>
                  <p class="text-[11px] italic font-medium text-sky-700 dark:text-sky-400 mt-0.5">"Run together with your best furry friend."</p>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">Special 1KM Pet &amp; Runner Duo race route for dogs, cats &amp; friendly pets.</p>

                  <!-- Inclusions -->
                  <div class="mt-4 pt-3 border-t border-sky-200 dark:border-sky-800/60">
                    <p class="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 text-sky-800 dark:text-sky-300">
                      <i class="fas fa-paw text-sky-500"></i> Inclusions:
                    </p>
                    <ul class="space-y-1.5">
                      <li v-for="inc in ['Pet Owner\'s Event Shirt','Pet Bandana & Race Bib','Pet Treat & Post-Meal Snack','Acrylic Finisher Medal']" :key="inc"
                        class="text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <i class="fas fa-paw text-sky-500 text-[10px]"></i><span>{{ inc }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Gun Time -->
                <div class="mt-5 pt-3 border-t border-sky-200 dark:border-sky-800/60 flex items-center justify-between text-xs text-gray-500">
                  <span class="font-medium flex items-center gap-1"><i class="fas fa-clock text-sky-600"></i> Gun Time:</span>
                  <span class="font-black text-sky-600 dark:text-sky-400">5:00 AM</span>
                </div>
              </div>

              <!-- ── VERTICAL DIVIDER (Desktop only) ──────────────── -->
              <div class="hidden lg:flex flex-col items-center justify-center px-3 shrink-0">
                <div class="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                <div :class="[
                  'my-2 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm shrink-0 flex flex-col items-center gap-1',
                  props.darkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-400 shadow-gray-100/80'
                ]" style="writing-mode: vertical-rl; text-orientation: mixed;">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mb-1"></span>
                  Human
                  <span class="my-0.5 opacity-30">·</span>
                  Pet
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block mt-1"></span>
                </div>
                <div class="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              </div>

              <!-- ── HUMAN RUN CARDS ──────────────────────────────── -->
              <!-- Mobile: siblings in flex snap row via contents; Desktop: 3-column grid -->
              <div class="contents lg:flex lg:flex-1 lg:grid lg:grid-cols-3 lg:gap-4">
                <div
                  v-for="cat in runCategories.filter(c => c.categoryType === 'human')"
                  :key="cat.id"
                  @click="currentParticipant.run_category = cat.id"
                  :class="[
                    'relative rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden select-none w-[84vw] max-w-[320px] lg:w-auto shrink-0 snap-center lg:shrink',
                    currentParticipant.run_category === cat.id
                      ? 'border-emerald-600 bg-gradient-to-b from-emerald-50/70 to-white dark:from-emerald-950/40 dark:to-gray-800/90 shadow-xl shadow-emerald-600/10 ring-2 ring-emerald-500/40 scale-[1.02]'
                      : props.darkMode
                        ? 'border-gray-700 bg-gray-800/60 hover:border-emerald-500/60 hover:bg-gray-800'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20'
                  ]">

                  <!-- Watermark -->
                  <div class="absolute -right-3 -bottom-3 text-7xl text-emerald-500/5 pointer-events-none">
                    <i :class="['fas', cat.icon]"></i>
                  </div>

                  <div>
                    <!-- Badge row -->
                    <div class="flex items-center justify-between mb-3 gap-2">
                      <span :class="[
                        'text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-gradient-to-r shadow-xs flex items-center gap-1',
                        cat.color
                      ]">
                        <i :class="['fas text-[9px]', cat.icon]"></i> {{ cat.badge }}
                      </span>
                      <div :class="[
                        'w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold transition shrink-0',
                        currentParticipant.run_category === cat.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'border-gray-300 dark:border-gray-600 text-transparent'
                      ]">
                        <i class="fas fa-check"></i>
                      </div>
                    </div>

                    <!-- Distance & Fee -->
                    <div class="flex items-baseline justify-between pt-1">
                      <h4 class="text-2xl font-black tracking-tight text-emerald-700 dark:text-emerald-400">{{ cat.id }}</h4>
                      <span class="text-xl font-black text-gray-900 dark:text-gray-100">₱{{ cat.fee.toLocaleString() }}</span>
                    </div>

                    <!-- Sub-label -->
                    <div class="mt-1">
                      <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                        <i class="fas fa-user text-[9px]"></i> Human Category
                      </span>
                    </div>

                    <p class="text-xs font-bold text-gray-800 dark:text-gray-200 mt-2">{{ cat.name }}</p>
                    <p class="text-[11px] italic font-medium text-emerald-700 dark:text-emerald-400 mt-1">"{{ cat.tagline }}"</p>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{{ cat.description }}</p>

                    <!-- Inclusions -->
                    <div class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700/60">
                      <p class="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                        <i class="fas fa-check-circle text-emerald-500"></i> Inclusions:
                      </p>
                      <ul class="space-y-1.5">
                        <li v-for="(inc, incIdx) in cat.inclusions" :key="incIdx"
                          class="text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <i class="fas fa-check text-emerald-500 text-[10px]"></i>
                          <span>{{ inc }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Gun Time -->
                  <div class="mt-5 pt-3 border-t border-gray-200 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500">
                    <span class="font-medium flex items-center gap-1"><i class="fas fa-flag-checkered text-emerald-600"></i> Gun Time:</span>
                    <span class="font-black text-emerald-600 dark:text-emerald-400">{{ cat.time }}</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Mobile Swipe Hint -->
            <div class="lg:hidden flex items-center justify-center gap-1.5 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
              <i class="fas fa-arrows-left-right text-[10px]"></i>
              <span>Swipe cards horizontally to explore all race distances</span>
            </div>


            <!-- INTEGRATED PET COMPANION DETAILS (ACTIVATED AUTOMATICALLY WHEN 1K PET RUN IS SELECTED) -->
            <div
              v-if="currentParticipant.run_category === '1K'"
              :class="[
                'mt-6 rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 relative overflow-hidden',
                props.darkMode
                  ? 'bg-gray-800/95 border-sky-800/80 shadow-lg shadow-sky-950/20'
                  : 'bg-gradient-to-br from-sky-50/90 via-white to-emerald-50/40 border-sky-300 shadow-md shadow-sky-500/10',
              ]">
              <!-- Paw Watermark Background -->
              <div class="absolute -right-6 -bottom-6 text-9xl text-sky-500/5 pointer-events-none">
                <i class="fas fa-paw"></i>
              </div>

              <!-- Header -->
              <div class="flex items-center justify-between flex-wrap gap-3 mb-5 pb-3.5 border-b border-sky-200 dark:border-sky-800/80">
                <div class="flex items-center gap-3">
                  <div
                    class="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-sky-500/25 shrink-0">
                    <i class="fas fa-paw"></i>
                  </div>
                  <div>
                    <h4 class="text-sm sm:text-base font-black text-sky-950 dark:text-sky-300 flex items-center gap-2 flex-wrap">
                      <span>1K EMERALD PAWS — Pet Companion Registration</span>
                      <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-600 text-white shadow-2xs">
                        Runner + Pet Duo
                      </span>
                    </h4>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      Please provide your pet companion's information for race bib issuance, bandana sizing, and marshaling coordination.
                    </p>
                  </div>
                </div>

                <span class="text-xs font-bold px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700 shadow-2xs">
                  <i class="fas fa-check-circle text-sky-500 mr-1"></i> Standalone Race Category
                </span>
              </div>

              <!-- Pet Form Fields -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Pet's Name <span class="text-rose-500">*</span>
                  </label>
                  <input
                    v-model="currentParticipant.pet_name"
                    placeholder="e.g. Milo / Barkley / Brownie"
                    :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pet Species / Type</label>
                  <select
                    v-model="currentParticipant.pet_type"
                    :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]">
                    <option value="Dog">Dog 🐕</option>
                    <option value="Cat">Cat 🐈</option>
                    <option value="Other">Other Friendly Pet Companion</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pet Breed</label>
                  <input
                    v-model="currentParticipant.pet_breed"
                    placeholder="e.g. Golden Retriever / Aspin / Shih Tzu"
                    :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]" />
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pet Bandana Size</label>
                  <select
                    v-model="currentParticipant.pet_bandana_size"
                    :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]">
                    <option value="Small">Small (Puppy / Cat / Small Breed)</option>
                    <option value="Medium">Medium (Regular Breed / Beagle / Corgi)</option>
                    <option value="Large">Large (Golden Retriever / Husky / Large Breed)</option>
                  </select>
                </div>
              </div>

              <!-- Pet Safety Assurance -->
              <div
                class="mt-4 p-3.5 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-sky-200 dark:border-sky-900/60 flex items-start gap-3 text-xs text-gray-700 dark:text-gray-300 shadow-2xs">
                <input
                  type="checkbox"
                  v-model="currentParticipant.pet_vaccinated"
                  class="mt-0.5 accent-sky-600 w-4 h-4 rounded cursor-pointer shrink-0"
                  :id="'pet_vac_' + activeParticipantIndex" />
                <label :for="'pet_vac_' + activeParticipantIndex" class="cursor-pointer select-none leading-relaxed">
                  <strong class="text-sky-950 dark:text-sky-300">Pet Safety & Vaccination Assurance:</strong> I confirm my pet has updated anti-rabies vaccination, is friendly and non-aggressive with other runners and pets, and will remain on a secure leash at all times throughout the 1K run route.
                </label>
              </div>
            </div>
          </section>

          <!-- SECTION 2: PARTICIPANT CLASSIFICATION -->
          <section v-if="currentParticipant.run_category !== '1K'">
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
                Participant Classification
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Select category affiliation for university verification and payment options
              </p>
            </div>

            <div class="space-y-3">
              <!-- HEU Student -->
              <div @click="currentParticipant.participant_type = 'LSU Higher Education Unit Student'" :class="[
                'rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left',
                currentParticipant.participant_type === 'LSU Higher Education Unit Student'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/40'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200',
              ]">
                <div class="flex items-center gap-3.5 w-full">
                  <div :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    currentParticipant.participant_type === 'LSU Higher Education Unit Student'
                      ? 'border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                  ]">
                    <div v-if="currentParticipant.participant_type === 'LSU Higher Education Unit Student'"
                      class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <input type="radio" value="LSU Higher Education Unit Student"
                    v-model="currentParticipant.participant_type" class="sr-only" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
                        LSU Higher Education Unit Student (College)
                      </span>
                    </div>
                    <span class="text-xs text-gray-500 block mt-0.5">Enrolled College / Graduate School Students of La
                      Salle University</span>
                  </div>
                </div>

                <div v-if="currentParticipant.participant_type === 'LSU Higher Education Unit Student'" @click.stop
                  class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700">
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Course / Program
                      *</label>
                    <select v-model="currentParticipant.college_course" :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                    ]">
                      <option value="">Select Course</option>
                      <option value="BSIT">BS Information Technology (BSIT)</option>
                      <option value="BSCS">BS Computer Science (BSCS)</option>
                      <option value="BSEd">BS Secondary Education (BSEd)</option>
                      <option value="BSN">BS Nursing (BSN)</option>
                      <option value="BSBA">BS Business Administration (BSBA)</option>
                      <option value="BSA">BS Accountancy (BSA)</option>
                      <option value="BSCrim">BS Criminology (BSCrim)</option>
                      <option value="BSTM">BS Tourism Management (BSTM)</option>
                      <option value="BSHM">BS Hospitality Management (BSHM)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Year Level
                      *</label>
                    <select v-model="currentParticipant.college_year" :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                    ]">
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
              <div @click="currentParticipant.participant_type = 'LSU Basic Education Unit Student'" :class="[
                'rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left',
                currentParticipant.participant_type === 'LSU Basic Education Unit Student'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/40'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200',
              ]">
                <div class="flex items-center gap-3.5 w-full">
                  <div :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    currentParticipant.participant_type === 'LSU Basic Education Unit Student'
                      ? 'border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                  ]">
                    <div v-if="currentParticipant.participant_type === 'LSU Basic Education Unit Student'"
                      class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <input type="radio" value="LSU Basic Education Unit Student"
                    v-model="currentParticipant.participant_type" class="sr-only" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
                        LSU Basic Education Unit Student (Grade School / JHS / SHS)
                      </span>

                    </div>
                    <span class="text-xs text-gray-500 block mt-0.5">Grade School, Junior High School, or Senior High
                      School</span>
                  </div>
                </div>

                <div v-if="currentParticipant.participant_type === 'LSU Basic Education Unit Student'" @click.stop
                  class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 max-w-md">
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Grade Level *</label>
                  <select v-model="currentParticipant.beu_grade" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]">
                    <option value="">Select Grade Level</option>
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
              <div @click="currentParticipant.participant_type = 'Lasallian Partners'" :class="[
                'rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left',
                currentParticipant.participant_type === 'Lasallian Partners'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/40'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200',
              ]">
                <div class="flex items-center gap-3.5 w-full">
                  <div :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    currentParticipant.participant_type === 'Lasallian Partners'
                      ? 'border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                  ]">
                    <div v-if="currentParticipant.participant_type === 'Lasallian Partners'"
                      class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <input type="radio" value="Lasallian Partners" v-model="currentParticipant.participant_type"
                    class="sr-only" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
                        LSU Employees / Lasallian Partners (Faculty / Personnel / Admin Staff)
                      </span>
                    </div>
                    <span class="text-xs text-gray-500 block mt-0.5">Faculty, Staff, Administrators, and University
                      Employees</span>
                  </div>
                </div>

                <div v-if="currentParticipant.participant_type === 'Lasallian Partners'" @click.stop
                  class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 max-w-md">
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Center / Office /
                    Department *</label>
                  <select v-model="currentParticipant.partner_office" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]">
                    <option value="">Select Office / Department</option>
                    <option value="Office of the Chancellor">Office of the Chancellor</option>
                    <option value="College of Computer Studies">College of Computer Studies</option>
                    <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                    <option value="College of Business and Accountancy">College of Business and Accountancy</option>
                    <option value="College of Education">College of Education</option>
                    <option value="College of Nursing">College of Nursing</option>
                    <option value="College of Law">College of Law</option>
                    <option value="General Services Office">General Services Office</option>
                    <option value="University Registrar">University Registrar</option>
                    <option value="Human Resource Center">Human Resource Center</option>
                    <option value="Accounting Office">Accounting Office</option>
                  </select>
                </div>
              </div>

              <!-- Alumni -->
              <div @click="currentParticipant.participant_type = 'Alumni'" :class="[
                'rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left',
                currentParticipant.participant_type === 'Alumni'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/40'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200',
              ]">
                <div class="flex items-center gap-3.5 w-full">
                  <div :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    currentParticipant.participant_type === 'Alumni'
                      ? 'border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                  ]">
                    <div v-if="currentParticipant.participant_type === 'Alumni'" class="w-2 h-2 rounded-full bg-white">
                    </div>
                  </div>
                  <input type="radio" value="Alumni" v-model="currentParticipant.participant_type" class="sr-only" />
                  <div class="flex-1 min-w-0">
                    <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                      Lasallian Alumni
                    </span>
                    <span class="text-xs text-gray-500 block mt-0.5">Graduates & Alumni of La Salle University /
                      ICC</span>
                  </div>
                </div>

                <div v-if="currentParticipant.participant_type === 'Alumni'" @click.stop
                  class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 max-w-md">
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Batch / Graduation
                    Year</label>
                  <input type="text" v-model="currentParticipant.alumni_batch"
                    placeholder="e.g. Batch 2018 / High School 2014" :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                    ]" />
                </div>
              </div>

              <!-- Non-LSU -->
              <div @click="currentParticipant.participant_type = 'Non-LSU'" :class="[
                'rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left',
                currentParticipant.participant_type === 'Non-LSU'
                  ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-500/40'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-800/40 hover:bg-gray-800 hover:border-gray-600'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200',
              ]">
                <div class="flex items-center gap-3.5 w-full">
                  <div :class="[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    currentParticipant.participant_type === 'Non-LSU'
                      ? 'border-emerald-600 bg-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
                  ]">
                    <div v-if="currentParticipant.participant_type === 'Non-LSU'" class="w-2 h-2 rounded-full bg-white">
                    </div>
                  </div>
                  <input type="radio" value="Non-LSU" v-model="currentParticipant.participant_type" class="sr-only" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100">
                        Non-LSU / Guest Runner / Running Club
                      </span>
                      <span
                        class="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                        *Requires Valid ID Upload below
                      </span>
                    </div>
                    <span class="text-xs text-gray-500 block mt-0.5">Open to public runners, community enthusiasts, and
                      visiting teams</span>
                  </div>
                </div>

                <div v-if="currentParticipant.participant_type === 'Non-LSU'" @click.stop
                  class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 max-w-md">
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Organization /
                    Running Club / Company</label>
                  <input type="text" v-model="currentParticipant.organization"
                    placeholder="e.g. Ozamiz Lifestyle Runners Club" :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                    ]" />
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 3: PERSONAL INFORMATION -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
                <span>{{ currentParticipant.run_category === '1K' ? 'Pet Owner / Runner Personal Information' : 'Personal Information' }}</span>
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                {{ currentParticipant.run_category === '1K' ? 'Personal details of the pet owner / runner' : `Personal details for Runner #${activeParticipantIndex + 1}` }}
              </p>
            </div>

            <div class="">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input v-model="currentParticipant.firstname" placeholder="Juan" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Middle Name</label>
                  <input v-model="currentParticipant.middlename" placeholder="Santos" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]" />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input v-model="currentParticipant.lastname" placeholder="Dela Cruz" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Suffix</label>
                  <select v-model="currentParticipant.suffix" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]">
                    <option value="">None</option>
                    <option value="Jr.">Jr.</option>
                    <option value="Sr.">Sr.</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </div>

                <!-- Date of Birth (1/4 column) -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Date of Birth
                    *</label>
                  <input type="date" v-model="currentParticipant.birthdate" :class="[
                    'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                  ]" />
                </div>

                <!-- Gender (1/4 column) -->
                <div>
                  <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Gender *</label>
                  <div class="grid grid-cols-2 gap-2">
                    <div @click="currentParticipant.gender = 'Male'" :class="[
                      'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border cursor-pointer font-semibold text-xs transition select-none',
                      currentParticipant.gender === 'Male'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : props.darkMode
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-slate-50',
                    ]">
                      <input type="radio" value="Male" v-model="currentParticipant.gender" class="sr-only" />
                      <i class="fas fa-mars"></i> Male
                    </div>

                    <div @click="currentParticipant.gender = 'Female'" :class="[
                      'flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border cursor-pointer font-semibold text-xs transition select-none',
                      currentParticipant.gender === 'Female'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : props.darkMode
                          ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-slate-50',
                    ]">
                      <input type="radio" value="Female" v-model="currentParticipant.gender" class="sr-only" />
                      <i class="fas fa-venus"></i> Female
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 4: CONTACT DETAILS -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
                Contact Details
              </h3>
              <p class="text-xs text-gray-500 ml-9">
                Used for registration confirmation and race notifications
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="w-full">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address *</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs text-gray-400">
                    <i class="fas fa-envelope"></i>
                  </span>
                  <input v-model="currentParticipant.contact_email" placeholder="runner@lsu.edu.ph" :class="[
                    'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]" />
                </div>
              </div>

              <div class="w-full">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Contact Phone Number
                  *</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs text-gray-400">
                    <i class="fas fa-phone"></i>
                  </span>
                  <input v-model="currentParticipant.contact_number" placeholder="0917 123 4567" :class="[
                    'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]" />
                </div>
              </div>

              <div class="w-full">
                <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Complete
                  Address</label>
                <div class="relative">
                  <span class="absolute left-3.5 top-3 text-xs text-gray-400">
                    <i class="fas fa-map-marker-alt"></i>
                  </span>
                  <input v-model="currentParticipant.contact_address" placeholder="Barangay, City, Province" :class="[
                    'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300',
                  ]" />
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 5: VALID ID UPLOAD - for non LSU only -->
          <section v-if="currentParticipant.participant_type === 'Non-LSU'">
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold flex items-center gap-2">
                  <span
                    class="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-black">5</span>
                  Valid ID Upload
                </h3>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Required for Non-LSU
                </span>
              </div>
              <p class="text-xs text-gray-500 ml-9">
                Upload Government ID or Valid ID for identity verification of Non-LSU runners
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- ID Front Dropzone -->
              <div :class="[
                'rounded-2xl border-2 border-dashed p-4 text-center transition-all relative overflow-hidden',
                currentParticipant.validIdFrontPreview
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
              ]">
                <div v-if="!currentParticipant.validIdFrontPreview">
                  <i class="fas fa-id-card text-3xl text-emerald-500 mb-2"></i>
                  <p class="text-xs font-bold mb-1">Upload ID Front *</p>
                  <p class="text-[10px] text-gray-400 mb-3">PNG, JPG, or PDF up to 5MB</p>
                  <label
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm">
                    <i class="fas fa-upload"></i> Browse File
                    <input type="file" accept="image/*" class="hidden"
                      @change="(e) => handleFileUpload(e, 'front', activeParticipantIndex)" />
                  </label>
                </div>

                <div v-else class="relative group">
                  <img :src="currentParticipant.validIdFrontPreview" alt="ID Front Preview"
                    class="h-32 w-full object-cover rounded-xl border" />
                  <div class="mt-2 flex items-center justify-between text-xs">
                    <span class="truncate max-w-[150px] font-medium text-emerald-600 dark:text-emerald-400">
                      <i class="fas fa-check-circle"></i> {{ currentParticipant.validIdFront?.name || 'ID Front' }}
                    </span>
                    <button type="button" @click="removeFile('front', activeParticipantIndex)"
                      class="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <!-- ID Back Dropzone -->
              <div :class="[
                'rounded-2xl border-2 border-dashed p-4 text-center transition-all relative overflow-hidden',
                currentParticipant.validIdBackPreview
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                    : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
              ]">
                <div v-if="!currentParticipant.validIdBackPreview">
                  <i class="fas fa-address-card text-3xl text-emerald-500 mb-2"></i>
                  <p class="text-xs font-bold mb-1">Upload ID Back (Optional)</p>
                  <p class="text-[10px] text-gray-400 mb-3">PNG, JPG, or PDF up to 5MB</p>
                  <label
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-sm">
                    <i class="fas fa-upload"></i> Browse File
                    <input type="file" accept="image/*" class="hidden"
                      @change="(e) => handleFileUpload(e, 'back', activeParticipantIndex)" />
                  </label>
                </div>

                <div v-else class="relative group">
                  <img :src="currentParticipant.validIdBackPreview" alt="ID Back Preview"
                    class="h-32 w-full object-cover rounded-xl border" />
                  <div class="mt-2 flex items-center justify-between text-xs">
                    <span class="truncate max-w-[150px] font-medium text-emerald-600 dark:text-emerald-400">
                      <i class="fas fa-check-circle"></i> {{ currentParticipant.validIdBack?.name || 'ID Back' }}
                    </span>
                    <button type="button" @click="removeFile('back', activeParticipantIndex)"
                      class="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- SECTION 6: T-SHIRT SIZE -->
          <section v-if="currentParticipant.run_category !== '1K'">
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold flex items-center gap-2">
                  <span
                    class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">6</span>
                  Size Tshirt
                </h3>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Selected: <span class="font-black">{{ currentParticipant.tshirt_size || 'M' }}</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 ml-9">
                Select official event race shirt size for Runner #{{ activeParticipantIndex + 1 }} (Available from 3XS
                to 10XL)
              </p>
            </div>

            <!-- Radio Button Group for Sizes from 3XS to 10XL -->
            <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
              <label v-for="size in tshirtSizes" :key="size" @click="currentParticipant.tshirt_size = size" :class="[
                'relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-center',
                currentParticipant.tshirt_size === size
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.03] font-black ring-2 ring-emerald-500/30'
                  : props.darkMode
                    ? 'border-gray-700 bg-gray-800/60 text-gray-300 hover:border-emerald-500 hover:bg-gray-800'
                    : 'border-slate-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50/40',
              ]">
                <input type="radio" name="tshirt_size" :value="size" v-model="currentParticipant.tshirt_size"
                  class="sr-only" />
                <i :class="[
                  'fas fa-tshirt mb-1 text-sm transition',
                  currentParticipant.tshirt_size === size
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-emerald-600',
                ]"></i>
                <span class="text-xs font-bold">{{ size }}</span>
              </label>
            </div>

            <!-- Size note -->
            <div
              class="mt-3 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-info-circle text-emerald-600 shrink-0"></i>
              <span>
                {{ currentParticipant.run_category === '1K' ? 'Includes official Pet Owner\'s Event Shirt in your chosen size + Pet Bandana & Pet Treat kit from the 1K Emerald Paws Pet Run.' : currentParticipant.run_category === '20K' ? 'Includes both Event Shirt and Finisher Shirt in your chosen size.' : 'Includes official Animo Run Event Shirt in your chosen size.' }}
              </span>
            </div>
          </section>

          <!-- SECTION 7: PAYMENT SUMMARY & OPTIONS -->
          <section :class="[
            'rounded-2xl p-4 sm:p-6 border shadow-lg transition-all',
            props.darkMode
              ? 'bg-gray-900/90 border-gray-700'
              : 'bg-gradient-to-br from-slate-50 to-emerald-50/40 border-emerald-200',
          ]">
            <h3 class="text-xl font-black mb-4 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-receipt text-emerald-600"></i>
              Payment & Checkout Summary
            </h3>

            <!-- Itemized breakdown list -->
            <div class="space-y-2.5 mb-6 text-xs border-b pb-4 dark:border-gray-700">
              <div v-for="(item, i) in itemizedFees" :key="i" class="flex items-center justify-between font-medium">
                <div>
                  <span class="text-gray-700 dark:text-gray-300 font-semibold">{{ item.name }}</span>
                  <span class="ml-2 text-[11px] text-emerald-600 dark:text-emerald-400">({{ item.shirt }})</span>
                </div>
                <span class="font-bold text-gray-900 dark:text-gray-100">₱{{ item.amount.toLocaleString() }}</span>
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
            <div class="space-y-4 mb-8">
              <label class="block text-xs font-bold uppercase tracking-wider text-gray-500">
                Select Payment Option
              </label>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- 1. LSU Employees - Salary Deduction -->
                <div @click="paymentType = 'salary_deduction'" :class="[
                  'p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left relative',
                  paymentType === 'salary_deduction'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-sm'
                    : props.darkMode
                      ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                ]">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span
                        class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        LSU Employees
                      </span>
                      <div :class="[
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        paymentType === 'salary_deduction'
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300 dark:border-gray-600',
                      ]">
                        <div v-if="paymentType === 'salary_deduction'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <input type="radio" name="paymentType" value="salary_deduction" v-model="paymentType"
                        class="sr-only" />
                    </div>
                    <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                      Salary Deduction
                    </span>
                    <p class="text-xs text-gray-500 mt-1">
                      Exclusive for LSU Faculty & Staff. Subject to HR & Payroll verification.
                    </p>
                  </div>
                </div>

                <!-- 2. LSU Students - Add to Tuition -->
                <div @click="paymentType = 'add_to_tuition'" :class="[
                  'p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left relative',
                  paymentType === 'add_to_tuition'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-sm'
                    : props.darkMode
                      ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                ]">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span
                        class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        LSU Students
                      </span>
                      <div :class="[
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        paymentType === 'add_to_tuition'
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300 dark:border-gray-600',
                      ]">
                        <div v-if="paymentType === 'add_to_tuition'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <input type="radio" name="paymentType" value="add_to_tuition" v-model="paymentType"
                        class="sr-only" />
                    </div>
                    <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                      Add to Tuition
                    </span>
                    <p class="text-xs text-gray-500 mt-1">
                      Billed directly to student school account & tuition ledger.
                    </p>
                  </div>
                </div>

                <!-- 3. Non-LSU Payment -->
                <div @click="paymentType = 'non_lsu_payment'" :class="[
                  'p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left relative',
                  paymentType === 'non_lsu_payment'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-2 ring-emerald-500/40 shadow-sm'
                    : props.darkMode
                      ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                ]">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span
                        class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Non-LSU / Guests
                      </span>
                      <div :class="[
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                        paymentType === 'non_lsu_payment'
                          ? 'border-emerald-600 bg-emerald-600'
                          : 'border-gray-300 dark:border-gray-600',
                      ]">
                        <div v-if="paymentType === 'non_lsu_payment'" class="w-1.5 h-1.5 rounded-full bg-white"></div>
                      </div>
                      <input type="radio" name="paymentType" value="non_lsu_payment" v-model="paymentType"
                        class="sr-only" />
                    </div>
                    <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block">
                      OTC / QR / Weekend Cash
                    </span>
                    <p class="text-xs text-gray-500 mt-1">
                      Accounting OTC, QR Payment, or Cash at Ozamiz Lifestyle Runners.
                    </p>
                  </div>
                </div>
              </div>

              <!-- 1. LSU EMPLOYEE INSTITUTIONAL VERIFICATION (SALARY DEDUCTION) -->
              <div v-if="paymentType === 'salary_deduction'"
                class="mt-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-emerald-300 dark:border-emerald-800/60 space-y-4 shadow-sm">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
                      <i class="fas fa-id-badge"></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">
                        LSU Employee Institutional Verification
                      </h4>
                      <p class="text-xs text-gray-500">
                        No receipt upload required. Verified through your LSU Account and Employee ID.
                      </p>
                    </div>
                  </div>

                  <span
                    class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                    <i class="fas fa-check-circle text-emerald-500"></i> No Receipt Needed
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <!-- Verified LSU Email -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Authenticated LSU Email Address
                    </label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-2.5 text-xs text-emerald-600">
                        <i class="fas fa-envelope-circle-check"></i>
                      </span>
                      <input type="email"
                        :value="user?.email || currentParticipant.contact_email || 'runner@lsu.edu.ph'" readonly
                        class="w-full pl-9 pr-24 py-2.5 rounded-xl border text-xs font-semibold bg-gray-50 dark:bg-gray-900/60 border-emerald-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed" />
                      <span
                        class="absolute right-2.5 top-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        <i class="fas fa-lock text-[9px] mr-1"></i> Verified
                      </span>
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">LSU Google Workspace credentials from your active
                      dashboard session</p>
                  </div>

                  <!-- LSU Employee ID Number -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      LSU Employee ID Number *
                    </label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-2.5 text-xs text-gray-400">
                        <i class="fas fa-address-card"></i>
                      </span>
                      <input type="text" v-model="currentParticipant.lsu_id_number"
                        placeholder="e.g. EMP-2024-0012 or 2018-0421" :class="[
                          'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                          props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                        ]" />
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">Enter your official LSU Faculty / Staff Employee ID Number
                    </p>
                  </div>
                </div>

                <!-- Payroll Authorization Notice -->
                <div
                  class="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                  <i class="fas fa-file-signature text-emerald-600 text-sm mt-0.5 shrink-0"></i>
                  <div class="leading-relaxed">
                    <strong>Salary Deduction Authorization:</strong> By submitting, you authorize the LSU Human Resource
                    Center and Accounting Office to process the total registration fee of <strong>₱{{
                      grandTotal.toLocaleString() }}</strong> via automatic payroll salary deduction.
                  </div>
                </div>
              </div>

              <!-- 2. LSU STUDENT INSTITUTIONAL VERIFICATION (ADD TO TUITION) -->
              <div v-if="paymentType === 'add_to_tuition'"
                class="mt-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800/90 border border-blue-300 dark:border-blue-800/60 space-y-4 shadow-sm">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
                      <i class="fas fa-graduation-cap"></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">
                        LSU Student Account Verification
                      </h4>
                      <p class="text-xs text-gray-500">
                        No receipt upload required. Fee is charged directly to your student tuition assessment ledger.
                      </p>
                    </div>
                  </div>

                  <span
                    class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
                    <i class="fas fa-check-circle text-blue-500"></i> No Receipt Needed
                  </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <!-- Verified LSU Student Email -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Authenticated LSU Student Email
                    </label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-2.5 text-xs text-blue-600">
                        <i class="fas fa-envelope-circle-check"></i>
                      </span>
                      <input type="email"
                        :value="user?.email || currentParticipant.contact_email || 'student@lsu.edu.ph'" readonly
                        class="w-full pl-9 pr-24 py-2.5 rounded-xl border text-xs font-semibold bg-gray-50 dark:bg-gray-900/60 border-blue-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 cursor-not-allowed" />
                      <span
                        class="absolute right-2.5 top-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        <i class="fas fa-lock text-[9px] mr-1"></i> Verified
                      </span>
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">LSU Student Google Workspace credentials from your active
                      dashboard session</p>
                  </div>

                  <!-- LSU Student ID Number -->
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      LSU Student ID Number *
                    </label>
                    <div class="relative">
                      <span class="absolute left-3.5 top-2.5 text-xs text-gray-400">
                        <i class="fas fa-id-card"></i>
                      </span>
                      <input type="text" v-model="currentParticipant.lsu_id_number" placeholder="e.g. 2023-10452"
                        :class="[
                          'w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none',
                          props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                        ]" />
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1">Enter your official LSU Student ID Number</p>
                  </div>
                </div>

                <!-- Student Ledger Notice -->
                <div
                  class="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                  <i class="fas fa-receipt text-blue-600 text-sm mt-0.5 shrink-0"></i>
                  <div class="leading-relaxed">
                    <strong>Student Account Billing:</strong> The registration fee of <strong>₱{{
                      grandTotal.toLocaleString() }}</strong> will be charged directly to your student ledger upon
                    verification. You may settle this together with your semester tuition fees.
                  </div>
                </div>
              </div>

              <!-- 3. NON-LSU / GENERAL PAYMENT SUB-OPTIONS & DETAILS WITH RECEIPT UPLOAD -->
              <div v-if="paymentType === 'non_lsu_payment'"
                class="mt-4 p-5 rounded-2xl bg-white dark:bg-gray-800/90 border border-emerald-200 dark:border-gray-700 space-y-4">
                <div class="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Select Non-LSU Payment Method:
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- QR Payment -->
                  <div @click="nonLsuPaymentMethod = 'qr_payment'" :class="[
                    'p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold flex items-center gap-2.5',
                    nonLsuPaymentMethod === 'qr_payment'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ]">
                    <i class="fas fa-qrcode text-emerald-600 text-base shrink-0"></i>
                    <div>
                      <div class="font-bold">QR Payment Option</div>
                      <div class="text-[10px] font-normal text-gray-500">GCash / Maya / Online Bank</div>
                    </div>
                  </div>

                  <!-- Accounting OTC -->
                  <div @click="nonLsuPaymentMethod = 'accounting_otc'" :class="[
                    'p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold flex items-center gap-2.5',
                    nonLsuPaymentMethod === 'accounting_otc'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ]">
                    <i class="fas fa-university text-emerald-600 text-base shrink-0"></i>
                    <div>
                      <div class="font-bold">Accounting OTC</div>
                      <div class="text-[10px] font-normal text-gray-500">LSU Accounting Window</div>
                    </div>
                  </div>

                  <!-- Weekend Cash -->
                  <div @click="nonLsuPaymentMethod = 'weekend_cash'" :class="[
                    'p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold flex items-center gap-2.5',
                    nonLsuPaymentMethod === 'weekend_cash'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ]">
                    <i class="fas fa-running text-emerald-600 text-base shrink-0"></i>
                    <div>
                      <div class="font-bold">Weekend Cash</div>
                      <div class="text-[10px] font-normal text-gray-500">Ozamiz Lifestyle Runners Organizers</div>
                    </div>
                  </div>
                </div>

                <!-- Method Guidance -->
                <div
                  class="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-xs">
                  <div v-if="nonLsuPaymentMethod === 'qr_payment'" class="flex items-start gap-3">
                    <i class="fas fa-mobile-alt text-emerald-600 text-lg mt-0.5 shrink-0"></i>
                    <div>
                      <p class="font-bold text-gray-800 dark:text-gray-200">GCash / Maya / QR Payment</p>
                      <p class="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                        Scan or send payment for <strong>₱{{ grandTotal.toLocaleString() }}</strong> to LSU Animo Run Official Account. Please take a screenshot and upload your receipt below.
                      </p>
                    </div>
                  </div>

                  <div v-else-if="nonLsuPaymentMethod === 'accounting_otc'" class="flex items-start gap-3">
                    <i class="fas fa-cash-register text-emerald-600 text-lg mt-0.5 shrink-0"></i>
                    <div>
                      <p class="font-bold text-gray-800 dark:text-gray-200">LSU Accounting Office (Over-the-Counter)</p>
                      <p class="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                        Visit the LSU Accounting Office window (Mon-Fri 8:00 AM - 5:00 PM). State payment for
                        <strong>Animo Run 2026</strong> and upload the official receipt slip below.
                      </p>
                    </div>
                  </div>

                  <div v-else class="flex items-start gap-3">
                    <i class="fas fa-map-pin text-emerald-600 text-lg mt-0.5 shrink-0"></i>
                    <div>
                      <p class="font-bold text-gray-800 dark:text-gray-200">CASH at Ozamiz Lifestyle Runner Organizers
                      </p>
                      <p class="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                        Pay cash directly at the Ozamiz Lifestyle Runner Organizers booth every weekend during scheduled
                        fun runs / meetups. Upload your organizer acknowledgment receipt below.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- UPLOAD RECEIPT SECTION (FOR NON-LSU ONLY) -->
                <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <h4 class="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <i class="fas fa-file-invoice-dollar text-emerald-600"></i>
                        Upload Receipt / Proof of Payment
                      </h4>
                      <p class="text-xs text-gray-500 mt-0.5">
                        Animo Run Admin will verify the Payment before issuing race bib and confirmation
                      </p>
                    </div>

                    <span
                      class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      <i class="fas fa-shield-alt mr-1"></i> Admin Verification
                    </span>
                  </div>

                  <!-- Receipt Dropzone -->
                  <div :class="[
                    'rounded-2xl border-2 border-dashed p-4 text-center transition-all relative overflow-hidden',
                    receiptPreview
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : props.darkMode
                        ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                        : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
                  ]">
                    <div v-if="!receiptPreview">
                      <i class="fas fa-cloud-upload-alt text-3xl text-emerald-500 mb-2"></i>
                      <p class="text-xs font-bold mb-1">Upload Receipt or Deposit / Transfer Screenshot</p>
                      <p class="text-[10px] text-gray-400 mb-3">PNG, JPG, or PDF up to 1MB</p>
                      <label
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md transition">
                        <i class="fas fa-upload"></i> Browse Receipt File
                        <input type="file" accept="image/*,.pdf" class="hidden" @change="handleReceiptUpload" />
                      </label>
                    </div>

                    <div v-else class="relative group max-w-sm mx-auto">
                      <img :src="receiptPreview" alt="Receipt Preview"
                        class="h-40 w-full object-cover rounded-xl border shadow-sm" />
                      <div class="mt-2 flex items-center justify-between text-xs">
                        <span class="truncate max-w-[200px] font-medium text-emerald-600 dark:text-emerald-400">
                          <i class="fas fa-check-circle"></i> {{ receiptFile?.name || 'Payment Receipt' }}
                        </span>
                        <button type="button" @click="removeReceipt"
                          class="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition cursor-pointer">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Admin verification badge -->
                  <div
                    class="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                    <i class="fas fa-user-check text-amber-600 text-base shrink-0"></i>
                    <span>
                      <strong>Verification Notice:</strong> Animo Run Admin will verify the Payment and validate your
                      registration details before final approval.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit / Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-4">
              <button type="button" @click="submitRegistration" :disabled="isSubmitting"
                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-base cursor-pointer">
                <i v-if="!isSubmitting" class="fas fa-check-circle text-lg"></i>
                <i v-else class="fas fa-spinner fa-spin text-lg"></i>
                <span>{{ isSubmitting ? 'Submitting Registration...' : 'Submit Registration (₱' +
                  grandTotal.toLocaleString() + ')' }}</span>
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- SUCCESS CONFIRMATION MODAL -->
    <div
      v-if="isSuccessModalOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        :class="[
          'w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all text-center space-y-5',
          props.darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-200 text-gray-800'
        ]"
      >
        <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-inner">
          <i class="fas fa-check"></i>
        </div>

        <div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
            Registration Successful
          </span>
          <h2 class="text-2xl font-black mt-2">
            Registration Submitted!
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ form_type === 'Group' ? `Successfully registered ${number_of_participants_per_group} runner(s).` : `Thank you, ${participants[0].firstname}! Your registration has been received.` }}
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-2.5">
          <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <i class="fas fa-envelope-circle-check text-emerald-600 text-base"></i>
            <span>Confirmation Receipt Sent!</span>
          </div>
          <p class="text-emerald-700 dark:text-emerald-400">
            A confirmation receipt with your registration details and payment instructions has been sent to:
          </p>
          <div class="bg-white dark:bg-gray-900 px-3.5 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-2 font-medium">
              <i class="fas fa-envelope text-emerald-600"></i>
              <span>{{ participants[0].contact_email || user?.email }}</span>
            </div>
            <span class="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-md font-semibold">Sent</span>
          </div>
          <p class="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 italic">
            * An official copy has also been sent to <strong>animorun@lsu.edu.ph</strong> for event records.
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-gray-700 text-left text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
          <p class="font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
            <i class="fas fa-info-circle text-emerald-600"></i> Next Steps & Verification:
          </p>
          <p v-if="paymentType === 'salary_deduction'">
            • Your salary deduction authorization will be verified by LSU HR & Accounting for payroll processing.
          </p>
          <p v-else-if="paymentType === 'add_to_tuition'">
            • Your registration fee will be billed to your LSU student account by the LSU Accounting Office.
          </p>
          <p v-else>
            • The Animo Run Committee will verify your uploaded payment receipt.
          </p>
          <p class="text-gray-500 dark:text-gray-400 pt-1">
            Once verified by the event admin, you will receive your <strong>Official Race Confirmation Email</strong> containing your assigned bib number and kit claiming instructions.
          </p>
        </div>

        <button
          type="button"
          @click="resetForm"
          class="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <i class="fas fa-check"></i> Done & Register Another Runner
        </button>
      </div>
    </div>

    <!-- TOAST / VALIDATION NOTIFICATION MODAL (REPLACES BROWSER ALERT) -->
    <div
      v-if="toastModal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="closeNotice"
    >
      <div
        :class="[
          'w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all text-center space-y-4 relative overflow-hidden',
          props.darkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-slate-200'
        ]"
      >
        <div
          :class="[
            'absolute top-0 left-0 right-0 h-1.5',
            toastModal.type === 'error'
              ? 'bg-rose-500'
              : toastModal.type === 'success'
              ? 'bg-emerald-500'
              : 'bg-amber-500'
          ]"
        ></div>

        <div
          :class="[
            'w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl shadow-sm mt-2',
            toastModal.type === 'error'
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : toastModal.type === 'success'
              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
          ]"
        >
          <i
            :class="[
              toastModal.type === 'error'
                ? 'fas fa-exclamation-circle'
                : toastModal.type === 'success'
                ? 'fas fa-check-circle'
                : 'fas fa-exclamation-triangle'
            ]"
          ></i>
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
          <button
            type="button"
            @click="closeNotice"
            :class="[
              'w-full py-3 px-5 rounded-2xl font-bold text-xs transition shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-white',
              toastModal.type === 'error'
                ? 'bg-rose-600 hover:bg-rose-700'
                : toastModal.type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            ]"
          >
            <span>Understood</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="radio"],
input[type="checkbox"] {
  margin: 0 !important;
}

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

.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
