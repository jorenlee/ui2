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
    name: "1 KM EMERALD PAWS",
    tagline: "Run together with your best furry friend.",
    fee: 1000,
    time: "5:00 AM",
    description: "Special 1KM Pet & Runner Duo race route for dogs, cats & friendly pets.",
    badge: "Pet Run (1K)",
    icon: "fa-paw",
    colors: {
      primary:   "#02857D",
      secondary: "#035751",
      accent:    "#2D9F98",
      highlight: "#93CAC5",
      dark:      "#0B0A09",
      text:      "#FFFFFF",
      cardBg:    "#f0fbfa",
      cardBorder:"#93CAC5",
      ringColor: "rgba(45,159,152,0.35)",
    },
    inclusions: [
      "Pet Owner's Event Shirt",
      "Pet Bandana",
      "Race Bib",
      "Post Meal",
      "Pet Treat",
      "Acrylic Finisher Medal",
    ],
  },
  {
    id: "3K",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "3 KM",
    tagline: "Start your journey.",
    fee: 1000,
    time: "4:55 AM",
    description: "Perfect for beginners, families, and casual runners.",
    badge: "Starter (3K)",
    icon: "fa-running",
    colors: {
      primary:   "#C62216",
      secondary: "#8E100B",
      accent:    "#D93625",
      dark:      "#160B0A",
      light:     "#F4F4F2",
      neutral:   "#A3A3A3",
      cardBg:    "#fff5f5",
      cardBorder:"#C62216",
      ringColor: "rgba(198,34,22,0.25)",
    },
    inclusions: [
      "Event Shirt",
      "Singlet",
      "Post-Meal",
      "Race Bib",
      "Acrylic Finisher Medal",
    ],
  },
  {
    id: "10K",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "10 KM",
    tagline: "Go farther. Go stronger.",
    fee: 1400,
    time: "4:40 AM",
    description: "For intermediate runners pushing their endurance limits.",
    badge: "Endurance (10K)",
    icon: "fa-running",
    colors: {
      primary:   "#C45A19",
      secondary: "#9E3D12",
      accent:    "#D87828",
      dark:      "#35120A",
      highlight: "#E9C98E",
      text:      "#F3F1E9",
      cardBg:    "#fff8f0",
      cardBorder:"#C45A19",
      ringColor: "rgba(196,90,25,0.25)",
    },
    inclusions: [
      "Event Shirt",
      "Singlet",
      "Post-Meal",
      "Race Bib",
      "Acrylic Finisher Medal",
    ],
  },
  {
    id: "20K",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "20 KM",
    tagline: "Conquer the ultimate challenge.",
    fee: 1800,
    time: "4:00 AM",
    description: "The premier distance for competitive runners and veterans.",
    badge: "Ultimate (20K)",
    icon: "fa-running",
    colors: {
      primary:   "#075F86",
      secondary: "#0B1C2E",
      accent:    "#0788B5",
      dark:      "#080D15",
      highlight: "#10AFC5",
      lighthl:   "#B9E5E8",
      text:      "#F1F3F2",
      cardBg:    "#f0f8ff",
      cardBorder:"#075F86",
      ringColor: "rgba(7,95,134,0.25)",
    },
    inclusions: [
      "Event Shirt",
      "Singlet",
      "Finisher Shirt",
      "Post-Meal",
      "Race Bib",
      "Acrylic Finisher Medal",
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

const shirtTypeOptions = [
  { value: "singlet", label: "Singlet", icon: "fas fa-tshirt" },
  { value: "event_shirt", label: "Event Shirt", icon: "fas fa-shirt" },
];

const getShirtTypeLabel = (shirtType) => {
  if (shirtType === "singlet") return "Singlet";
  return "Event Shirt";
};

const buildShirtSizeSummary = (participant) => {
  if (!participant) return "Event Shirt: M;";

  if (participant.run_category === "20K") {
    const eventSize = participant.event_shirt_size || "M";
    const singletSize = participant.singlet_size || "M";
    const finisherSize = participant.finisher_shirt_size || "M";
    return `Event Shirt: ${eventSize}; Singlet: ${singletSize}; Finisher Shirt: ${finisherSize};`;
  }

  const selected = participant.shirt_type === "singlet" ? "Singlet" : "Event Shirt";
  const size = participant.shirt_type === "singlet"
    ? participant.singlet_size || participant.tshirt_size || "M"
    : participant.event_shirt_size || participant.tshirt_size || "M";

  return `${selected}: ${size};`;
};

const createEmptyParticipant = (index = 1) => ({
  id: index,
  run_category: "",
  participant_type: "",
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
  alumni_id_preview: null,
  organization: "",
  participantGroup: null, // null | 'LSU' | 'Open'
  shirt_type: "event_shirt",
  selected_shirt_tab: "event_shirt",
  tshirt_size: "Event Shirt: M;",
  event_shirt_size: "M",
  singlet_size: "M",
  finisher_shirt_size: "M",
  // Pet Run fields (active when run_category === '1K')
  pet_name: "",
  pet_type: "Dog",
  pet_breed: "N/A",
  pet_bandana_size: "Standard",
  pet_vaccinated: true,
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
          ? buildShirtSizeSummary(p)
          : `Size: ${buildShirtSizeSummary(p)}`;

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
  p.shirt_type = r1.shirt_type || "event_shirt";
  p.selected_shirt_tab = r1.selected_shirt_tab || p.shirt_type || "event_shirt";
  p.event_shirt_size = r1.event_shirt_size || r1.tshirt_size || "M";
  p.singlet_size = r1.singlet_size || "M";
  p.finisher_shirt_size = r1.finisher_shirt_size || "M";
  p.tshirt_size = buildShirtSizeSummary(p);
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

    // Ensure email is set
    for (const p of participants.value) {
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
          shirt_type: p.shirt_type,
          tshirt_size: buildShirtSizeSummary(p),
          pet_name: p.pet_name,
          pet_type: p.pet_type,
          pet_breed: p.pet_breed,
          pet_bandana_size: p.pet_bandana_size,
          pet_vaccinated: p.pet_vaccinated,
          valid_id_front: [],
          valid_id_back: [],
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
        shirt_type: p.shirt_type,
        tshirt_size: buildShirtSizeSummary(p),
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
        valid_id_front: [],
        valid_id_back: [],
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
              <h1 class="text-base sm:text-2xl font-black text-white tracking-wide leading-tight flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>THE EMERALD RUN 2026</span>
                <span class="text-emerald-200 font-semibold text-xs sm:text-base">ANIMO RUN</span>
              </h1>
             
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

             <div>
              <h2 class="text-base sm:text-lg font-bold flex items-center gap-2">
                <i class="fas fa-users text-emerald-600"></i>
                Select Registration Type
              </h2>
              <p class="text-xs text-gray-500 mt-0.5">
                Choose whether you are registering for yourself or a team/group
              </p>
            </div>

             <!-- Individual / Group Radio Cards -->
              <div class="grid grid-cols-2 gap-3 w-full sm:w-auto mt-5"   v-if="currentParticipant.run_category !== '1K'">
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
           </div>



            <div class="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
             

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
                  class="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border"
                  :style="{ background: '#e8faf9', color: '#035751', borderColor: '#2D9F98' }">
                  <i class="fas fa-paw" :style="{ color: '#02857D' }"></i> Selected: 1K (PHP 1,000)
                </span>
                <span
                  v-else
                  class="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border"
                  :style="{
                    background: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.cardBg || '#f5f5f5',
                    color: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.secondary || '#333',
                    borderColor: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.primary || '#999'
                  }">
                  <i class="fas fa-running" :style="{ color: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.primary }"></i>
                  Selected: {{ currentParticipant.run_category }} (PHP {{ runCategories.find(c => c.id === currentParticipant.run_category)?.fee?.toLocaleString() || 0 }})
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
                class="px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 select-none cursor-pointer"
                :style="currentParticipant.run_category === cat.id
                  ? { background: cat.colors.primary, color: '#fff', borderColor: cat.colors.primary, boxShadow: `0 4px 12px ${cat.colors.ringColor}` }
                  : props.darkMode
                    ? { background: '#1f2937', color: '#d1d5db', borderColor: '#374151' }
                    : { background: '#fff', color: '#374151', borderColor: '#e2e8f0' }"
              >
                <i :class="['fas text-[11px]', cat.icon]"></i>
                <span>{{ cat.id }}</span>
                <span class="opacity-80 font-normal">PHP {{ cat.fee.toLocaleString() }}</span>
                <span v-if="cat.categoryType === 'pet'" class="text-[9px] px-1 py-0.5 rounded uppercase font-extrabold" style="background:rgba(255,255,255,0.25)">Pet</span>
              </button>
            </div>

            <!-- RACE CARDS CONTAINER -->
            <!-- Mobile: Horizontal swipe snap container; Desktop: flex row with sidebar -->
            <div class="flex lg:flex-row gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none items-stretch -mx-2 px-2 sm:mx-0 sm:px-0">



              <!-- HUMAN RUN CARDS -->
                          <div class="contents lg:flex-1 lg:grid lg:grid-cols-3 lg:gap-4">
                <div
                  v-for="cat in runCategories.filter(c => c.categoryType === 'human')"
                  :key="cat.id"
                  @click="currentParticipant.run_category = cat.id"
                  class="relative rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden select-none w-full lg:w-auto shrink-0 snap-center lg:shrink"
                  :style="currentParticipant.run_category === cat.id
                    ? {
                        background: `linear-gradient(145deg, ${cat.colors.secondary}, ${cat.colors.primary})`,
                        borderColor: cat.colors.accent,
                        boxShadow: `0 10px 40px ${cat.colors.ringColor}, 0 0 0 3px ${cat.colors.ringColor}`,
                        transform: 'scale(1.03)',
                      }
                    : {
                        background: `linear-gradient(145deg, ${cat.colors.dark}, ${cat.colors.secondary})`,
                        borderColor: cat.colors.primary + '55',
                        opacity: '0.92',
                      }">

                  <!-- Watermark -->
                  <div class="absolute -right-3 -bottom-3 text-8xl pointer-events-none" :style="{ color: 'rgba(255,255,255,0.06)' }">
                    <i :class="['fas', cat.icon]"></i>
                  </div>

                  <div>
                    <!-- Check circle + Distance -->
                    <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
  <div
                        class="w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition shrink-0"
                        :style="currentParticipant.run_category === cat.id
                          ? { background: '#fff', color: cat.colors.primary, borderColor: '#fff' }
                          : { background: 'transparent', color: 'transparent', borderColor: 'rgba(255,255,255,0.35)' }">
                        <i class="fas fa-check"></i>
                      </div>

                      <!-- Distance label -->
                      <h2
                        class="text-5xl font-black tracking-tight lg:pl-4"
                        :style="{ color: currentParticipant.run_category === cat.id ? '#fff' : 'rgba(255,255,255,0.7)' }">
                        {{ cat.id }}
                      </h2>



                  </div>
                         <div>
                            <!-- Fee -->
                    <span class="text-xl font-black mt-1 block"
                      :style="{ color: currentParticipant.run_category === cat.id ? cat.colors.highlight || '#fff' : 'rgba(255,255,255,0.55)' }">
                      PHP {{ cat.fee.toLocaleString() }}
                    </span>
                          </div>

                    </div>

               
                    <!-- Inclusions -->
                    <div class="mt-4 pt-3 border-t" :style="{ borderColor: 'rgba(255,255,255,0.15)' }">
                      <p class="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                        :style="{ color: cat.colors.highlight || cat.colors.accent || 'rgba(255,255,255,0.7)' }">
                        <i class="fas fa-check-circle"></i> Inclusions:
                      </p>
                      <ul class="space-y-1.5">
                        <li v-for="(inc, incIdx) in cat.inclusions" :key="incIdx"
                          class="text-[11px] flex items-center gap-2"
                          style="color: rgba(255,255,255,0.8)">
                          <i class="fas fa-check text-[10px]" :style="{ color: cat.colors.highlight || cat.colors.accent }" ></i>
                          <span>{{ inc }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Gun Time -->
                  <div class="mt-5 pt-3 border-t flex items-center justify-between text-xs"
                    :style="{ borderColor: 'rgba(255,255,255,0.15)' }">
                    <span class="font-medium flex items-center gap-1" style="color: rgba(255,255,255,0.6)">
                      <i class="fas fa-flag-checkered" :style="{ color: cat.colors.highlight || cat.colors.accent }"></i> Gun Time:
                    </span>
                    <span class="font-black" :style="{ color: cat.colors.highlight || '#fff' }">{{ cat.time }}</span>
                  </div>
                </div>
              </div>



 <!-- VERTICAL DIVIDER (Desktop only) -->
              <div class="hidden lg:flex flex-col items-center justify-center px-3 shrink-0">
                <div class="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                <div :class="[
                  'my-2 px-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm shrink-0 flex flex-col items-center gap-1',
                  props.darkMode ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-white border-gray-200 text-gray-400 shadow-gray-100/80'
                ]" style="writing-mode: vertical-rl; text-orientation: mixed;">
                   <span class="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block mt-1"></span>

                    Pet

                  <span class="my-0.5 opacity-30">·</span>
                 


                 
                  Human
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mb-1"></span>
                </div>
                <div class="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
              </div>


             <!-- PET RUN CARD -->
              <div
                class="relative rounded-2xl p-4 sm:p-5 border-2 cursor-pointer transition-all duration-300 overflow-hidden select-none flex flex-col justify-between w-[84vw] max-w-[320px] lg:w-[26%] shrink-0 snap-center"
                :style="currentParticipant.run_category === '1K'
                  ? {
                      background: 'linear-gradient(145deg, #035751, #02857D)',
                      borderColor: '#2D9F98',
                      boxShadow: '0 10px 40px rgba(45,159,152,0.4), 0 0 0 3px rgba(45,159,152,0.3)',
                      transform: 'scale(1.03)',
                    }
                  : {
                      background: 'linear-gradient(145deg, #0B0A09, #035751)',
                      borderColor: 'rgba(2,133,125,0.4)',
                    }"
                @click="currentParticipant.run_category = '1K'">

                <!-- Watermark -->
                <div class="absolute -right-4 -bottom-4 text-8xl pointer-events-none select-none" style="color: rgba(255,255,255,0.05)">
                  <i class="fas fa-paw"></i>
                </div>

                <div>
                  <!-- Badge row -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
                      style="background: rgba(255,255,255,0.15); color: #93CAC5; border: 1px solid rgba(147,202,197,0.4)">
                      <i class="fas fa-paw text-[9px]"></i> Pet Run
                    </span>
                    <div
                      class="w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition shrink-0"
                      :style="currentParticipant.run_category === '1K'
                        ? { background: '#fff', color: '#02857D', borderColor: '#fff' }
                        : { background: 'transparent', color: 'transparent', borderColor: 'rgba(255,255,255,0.35)' }">
                      <i class="fas fa-check"></i>
                    </div>
                  </div>

                  <!-- Distance & Fee -->
                  <div class="flex items-baseline justify-between pt-1">
                    <h2 class="text-6xl font-black tracking-tight"
                      :style="{ color: currentParticipant.run_category === '1K' ? '#fff' : 'rgba(255,255,255,0.7)' }">PETS</h2>
                    <span class="text-xl font-black"
                      :style="{ color: currentParticipant.run_category === '1K' ? '#93CAC5' : 'rgba(255,255,255,0.5)' }">PHP 1,000</span>
                  </div>

                  <!-- Inclusions -->
                  <div class="mt-4 pt-3 border-t" style="border-color: rgba(255,255,255,0.15)">
                    <p class="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1" style="color: #93CAC5">
                      <i class="fas fa-paw" style="color: #2D9F98"></i> Inclusions:
                    </p>
                    <ul class="space-y-1.5">
                      <li v-for="inc in ['Pet Owner\'s Event Shirt','Pet Bandana & Race Bib','Pet Treat & Post-Meal Snack','Acrylic Finisher Medal']" :key="inc"
                        class="text-[11px] flex items-center gap-2"
                        style="color: rgba(255,255,255,0.8)">
                        <i class="fas fa-paw text-[10px]" style="color: #2D9F98"></i><span>{{ inc }}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Gun Time -->
                <div class="mt-5 pt-3 border-t flex items-center justify-between text-xs"
                  style="border-color: rgba(255,255,255,0.15)">
                  <span class="font-medium flex items-center gap-1" style="color: rgba(255,255,255,0.6)">
                    <i class="fas fa-clock" style="color: #93CAC5"></i> Gun Time:
                  </span>
                  <span class="font-black" style="color: #93CAC5">5:00 AM</span>
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
              class="mt-6 rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 relative overflow-hidden"
              :style="props.darkMode
                ? { background: 'rgba(3,87,81,0.15)', borderColor: '#035751', boxShadow: '0 4px 20px rgba(3,87,81,0.2)' }
                : { background: 'linear-gradient(135deg, #f0fbfa 0%, #ffffff 60%, #f0faf9 100%)', borderColor: '#2D9F98', boxShadow: '0 4px 16px rgba(45,159,152,0.12)' }">
              <!-- Paw Watermark Background -->
              <div class="absolute -right-6 -bottom-6 text-9xl pointer-events-none" style="color: rgba(2,133,125,0.05)">
                <i class="fas fa-paw"></i>
              </div>

              <!-- Header -->
              <div class="flex items-center justify-between flex-wrap gap-3 mb-5 pb-3.5 border-b" style="border-color: rgba(147,202,197,0.6)">
                <div class="flex items-center gap-3">
                  <div
                    class="w-11 h-11 rounded-2xl text-white flex items-center justify-center text-xl shadow-md shrink-0"
                    style="background: linear-gradient(135deg, #02857D, #2D9F98); box-shadow: 0 4px 12px rgba(2,133,125,0.3)">
                    <i class="fas fa-paw"></i>
                  </div>
                  <div>
                    <h4 class="text-sm sm:text-base font-black flex items-center gap-2 flex-wrap" style="color: #035751">
                      <span>1K EMERALD PAWS: Pet Companion Registration</span>
                      <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-2xs"
                        style="background: #02857D">
                        Runner + Pet Duo
                      </span>
                    </h4>
                    <p class="text-xs mt-0.5" :style="{ color: props.darkMode ? '#9ca3af' : '#4b5563' }">
                      Please provide your pet companion's information for race bib issuance, bandana sizing, and marshaling coordination.
                    </p>
                  </div>
                </div>

                <span class="text-xs font-bold px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1"
                  :style="{ background: props.darkMode ? '#1f2937' : 'rgba(255,255,255,0.9)', color: '#035751', borderColor: '#2D9F98' }">
                  <i class="fas fa-check-circle" style="color: #02857D"></i> Standalone Race Category
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
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none pet-name-input',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]"
                    />
                </div>

                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Pet Species / Type</label>
                  <select
                    v-model="currentParticipant.pet_type"
                    :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other Friendly Pet Companion</option>
                  </select>
                </div>

                
              </div>

              <!-- Pet Safety Assurance -->
              <div
                class="mt-4 p-3.5 rounded-2xl border flex items-start gap-3 text-xs text-gray-700 dark:text-gray-300 shadow-2xs"
                :style="{ background: props.darkMode ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)', borderColor: 'rgba(147,202,197,0.7)' }">
                <input
                  type="checkbox"
                  v-model="currentParticipant.pet_vaccinated"
                  class="mt-0.5 w-4 h-4 rounded cursor-pointer shrink-0"
                  style="accent-color: #02857D"
                  :id="'pet_vac_' + activeParticipantIndex" />
                <label :for="'pet_vac_' + activeParticipantIndex" class="cursor-pointer select-none leading-relaxed">
                  <strong style="color: #035751">Pet Safety & Vaccination Assurance:</strong> I confirm my pet has updated anti-rabies vaccination, is friendly and non-aggressive with other runners and pets, and will remain on a secure leash at all times throughout the 1K run route.
                </label>
              </div>
            </div>
          </section>

          <!-- UNLOCK HINT: shown when no run category is selected yet -->
          <div v-if="!currentParticipant.run_category"
            class="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <div class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl">
              <i class="fas fa-running"></i>
            </div>
            <div>
              <p class="font-black text-base text-gray-800 dark:text-gray-200">Select a Race Category above</p>
              <p class="text-xs text-gray-500 mt-1">Your registration form will appear once you pick a category.</p>
            </div>
            <div class="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-bounce mt-1">
              <i class="fas fa-chevron-up text-[10px]"></i> Choose Category
            </div>
          </div>



          <!-- SECTION 2: PERSONAL INFORMATION -->
          <section v-if="currentParticipant.run_category">
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
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

          <!-- SECTION 3: CONTACT DETAILS -->
          <section v-if="currentParticipant.run_category">
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
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

          <!-- SECTION 4: SHIRT TYPE & SIZE -->
          <section v-if="currentParticipant.run_category && currentParticipant.run_category !== '1K'">
            <div class="mb-4">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold flex items-center gap-2">
                  <span
                    class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
                  Shirt Selection
                </h3>
                <span
                  class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Selected: <span class="font-black">{{ currentParticipant.selected_shirt_tab ? (currentParticipant.selected_shirt_tab === 'singlet' ? 'Singlet' : currentParticipant.selected_shirt_tab === 'finisher_shirt' ? 'Finisher Shirt' : 'Event Shirt') : 'Event Shirt' }}</span>
                </span>
              </div>
              <p class="text-xs text-gray-500 ml-9">
                Prioritize your preferred shirt type and size for Runner #{{ activeParticipantIndex + 1 }}
              </p>
            </div>

            <div
              :class="[
                'grid gap-3 mb-5',
                currentParticipant.run_category === '20K' ? 'grid-cols-3' : 'grid-cols-2'
              ]"
            >
              <button
                v-if="currentParticipant.run_category === '20K' || currentParticipant.run_category === '3K' || currentParticipant.run_category === '10K'"
                type="button"
                @click="currentParticipant.selected_shirt_tab = 'event_shirt'; currentParticipant.shirt_type = 'event_shirt'"
                :class="[
                  'flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200',
                  currentParticipant.selected_shirt_tab === 'event_shirt'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : props.darkMode
                      ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-emerald-500 hover:bg-gray-700'
                      : 'border-slate-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50',
                ]"
              >
                <i class="fas fa-shirt"></i>
                <span>Event Shirt</span>
              </button>

              <button
                type="button"
                @click="currentParticipant.selected_shirt_tab = 'singlet'; currentParticipant.shirt_type = 'singlet'"
                :class="[
                  'flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200',
                  currentParticipant.selected_shirt_tab === 'singlet'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : props.darkMode
                      ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-emerald-500 hover:bg-gray-700'
                      : 'border-slate-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50',
                ]"
              >
                <i class="fas fa-tshirt"></i>
                <span>Singlet</span>
              </button>

              <button
                v-if="currentParticipant.run_category === '20K'"
                type="button"
                @click="currentParticipant.selected_shirt_tab = 'finisher_shirt'"
                :class="[
                  'flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all duration-200',
                  currentParticipant.selected_shirt_tab === 'finisher_shirt'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : props.darkMode
                      ? 'border-gray-700 bg-gray-800 text-gray-300 hover:border-emerald-500 hover:bg-gray-700'
                      : 'border-slate-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50',
                ]"
              >
                <i class="fas fa-medal"></i>
                <span>Finisher Shirt</span>
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {{ currentParticipant.selected_shirt_tab === 'finisher_shirt' ? 'Finisher Shirt' : currentParticipant.selected_shirt_tab === 'singlet' ? 'Singlet' : 'Event Shirt' }} Size
                  </h4>
                  <span class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    {{ currentParticipant.selected_shirt_tab === 'finisher_shirt' ? (currentParticipant.finisher_shirt_size || 'M') : currentParticipant.selected_shirt_tab === 'singlet' ? (currentParticipant.singlet_size || 'M') : (currentParticipant.event_shirt_size || 'M') }}
                  </span>
                </div>

                <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-2.5">
                  <label
                    v-for="size in tshirtSizes"
                    :key="currentParticipant.selected_shirt_tab + '-' + size"
                    @click="
                      if (currentParticipant.selected_shirt_tab === 'finisher_shirt') {
                        currentParticipant.finisher_shirt_size = size;
                      } else if (currentParticipant.selected_shirt_tab === 'singlet') {
                        currentParticipant.singlet_size = size;
                        currentParticipant.shirt_type = 'singlet';
                      } else {
                        currentParticipant.event_shirt_size = size;
                        currentParticipant.shirt_type = 'event_shirt';
                      }
                      currentParticipant.tshirt_size = buildShirtSizeSummary(currentParticipant)
                    "
                    :class="[
                      'relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-center',
                      (currentParticipant.selected_shirt_tab === 'finisher_shirt' ? currentParticipant.finisher_shirt_size === size : currentParticipant.selected_shirt_tab === 'singlet' ? currentParticipant.singlet_size === size : currentParticipant.event_shirt_size === size)
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.03] font-black ring-2 ring-emerald-500/30'
                        : props.darkMode
                          ? 'border-gray-700 bg-gray-800/60 text-gray-300 hover:border-emerald-500 hover:bg-gray-800'
                          : 'border-slate-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-emerald-50/40',
                    ]"
                  >
                    <input
                      type="radio"
                      :name="'shirt_size_' + currentParticipant.selected_shirt_tab"
                      :value="size"
                      :checked="currentParticipant.selected_shirt_tab === 'finisher_shirt' ? currentParticipant.finisher_shirt_size === size : currentParticipant.selected_shirt_tab === 'singlet' ? currentParticipant.singlet_size === size : currentParticipant.event_shirt_size === size"
                      class="sr-only"
                    />
                    <i :class="[
                      'mb-1 text-sm transition',
                      currentParticipant.selected_shirt_tab === 'finisher_shirt' ? (currentParticipant.finisher_shirt_size === size ? 'fas fa-medal text-white' : 'fas fa-medal text-gray-400') : (currentParticipant.selected_shirt_tab === 'singlet' ? (currentParticipant.singlet_size === size ? 'fas fa-tshirt text-white' : 'fas fa-tshirt text-gray-400') : (currentParticipant.event_shirt_size === size ? 'fas fa-shirt text-white' : 'fas fa-shirt text-gray-400'))
                    ]"></i>
                    <span class="text-xs font-bold">{{ size }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div
              class="mt-4 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-info-circle text-emerald-600 shrink-0"></i>
              <span>
                {{ currentParticipant.run_category === '20K' ? 'Your 20K registration includes the event shirt, singlet, and finisher shirt sizes listed above.' : 'Includes your selected shirt type in the size above.' }}
              </span>
            </div>
          </section>

                    <!-- SECTION 5: PARTICIPANT CLASSIFICATION -->
          <section v-if="currentParticipant.run_category && currentParticipant.run_category !== '1K'">
            <div class="mb-4">
              <h3 class="text-lg font-bold flex items-center gap-2">
                <span
                  class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">5</span>
                Participant Classification
              </h3>
            </div>

            <div class="space-y-2">

              <!-- STEP 1: GROUP SELECTOR -->
              <div v-if="!currentParticipant.participantGroup" class="grid grid-cols-2 gap-3">

                <!-- LSU Exclusive Button -->
                <button type="button"
                  @click="currentParticipant.participantGroup = 'LSU'"
                  :class="[
                    'group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 text-center',
                    props.darkMode
                      ? 'border-gray-700 bg-gray-800/50 hover:border-emerald-500 hover:bg-emerald-950/30'
                      : 'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 shadow-sm hover:shadow-emerald-100',
                  ]">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg transition-transform group-hover:scale-110">
                    <i class="fas fa-university"></i>
                  </div>
                  <div>
                    <p class="font-black text-sm text-gray-900 dark:text-gray-100">LSU Exclusive</p>
                    <p class="text-[10px] text-gray-500 mt-0.5">Students, Employees &amp; Alumni</p>
                  </div>
                  <div class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-emerald-500 transition-colors"></div>
                </button>

                <!-- Open Category Button -->
                <button type="button"
                  @click="currentParticipant.participantGroup = 'Open'; currentParticipant.participant_type = 'Non-LSU'"
                  :class="[
                    'group relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-200 text-center',
                    props.darkMode
                      ? 'border-gray-700 bg-gray-800/50 hover:border-emerald-500 hover:bg-emerald-950/30'
                      : 'border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 shadow-sm hover:shadow-emerald-100',
                  ]">
                  <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg transition-transform group-hover:scale-110">
                    <i class="fas fa-globe-asia"></i>
                  </div>
                  <div>
                    <p class="font-black text-sm text-gray-900 dark:text-gray-100">Open Category</p>
                    <p class="text-[10px] text-gray-500 mt-0.5">Public runners &amp; guests</p>
                  </div>
                  <div class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-emerald-500 transition-colors"></div>
                </button>

              </div>

              <!-- STEP 5A: LSU EXCLUSIVE -->
              <div v-if="currentParticipant.participantGroup === 'LSU'" class="space-y-2">

                <button type="button"
                  @click="currentParticipant.participantGroup = null; currentParticipant.participant_type = ''"
                  class="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-1">
                  <i class="fas fa-chevron-left text-[10px]"></i> Change category group
                </button>

                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 px-1 pb-1">
                  <i class="fas fa-university mr-1"></i> LSU Exclusive
                </p>

                <!-- Currently Enrolled Students -->
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
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block">Currently Enrolled Students</span>
                      <span class="text-xs text-gray-500 block mt-0.5">College / Graduate School - Grade School / JHS / SHS</span>
                    </div>
                  </div>
                  <div v-if="currentParticipant.participant_type === 'LSU Higher Education Unit Student'" @click.stop
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700">
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Course / Program *</label>
                      <select v-model="currentParticipant.college_course" :class="[
                        'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                        props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                      ]">
                        <option value="">Select Course / Level</option>
                        <option value="BSIT">BS Information Technology (BSIT)</option>
                        <option value="BSCS">BS Computer Science (BSCS)</option>
                        <option value="BSEd">BS Secondary Education (BSEd)</option>
                        <option value="BSN">BS Nursing (BSN)</option>
                        <option value="BSBA">BS Business Administration (BSBA)</option>
                        <option value="BSA">BS Accountancy (BSA)</option>
                        <option value="BSCrim">BS Criminology (BSCrim)</option>
                        <option value="BSTM">BS Tourism Management (BSTM)</option>
                        <option value="BSHM">BS Hospitality Management (BSHM)</option>
                        <option value="Grade School">Grade School</option>
                        <option value="JHS">Junior High School (JHS)</option>
                        <option value="SHS">Senior High School (SHS)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Year / Grade Level *</label>
                      <select v-model="currentParticipant.college_year" :class="[
                        'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                        props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                      ]">
                        <option value="">Select Level</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                        <option value="Grade 1">Grade 1</option>
                        <option value="Grade 2">Grade 2</option>
                        <option value="Grade 3">Grade 3</option>
                        <option value="Grade 4">Grade 4</option>
                        <option value="Grade 5">Grade 5</option>
                        <option value="Grade 6">Grade 6</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Employees -->
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
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block">Employees</span>
                      <span class="text-xs text-gray-500 block mt-0.5">Faculty, Staff, Administrators, and University Employees</span>
                    </div>
                  </div>
                  <div v-if="currentParticipant.participant_type === 'Lasallian Partners'" @click.stop
                    class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 max-w-md">
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Office / Department *</label>
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
                      <div v-if="currentParticipant.participant_type === 'Alumni'" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <input type="radio" value="Alumni" v-model="currentParticipant.participant_type" class="sr-only" />
                    <div class="flex-1 min-w-0">
                      <span class="font-bold text-sm text-gray-900 dark:text-gray-100 block"> <i class="fas fa-graduation-cap mr-1"></i> Alumni</span>
                      <span class="text-xs text-gray-500 block mt-0.5">Graduates of LSU / ICC</span>
                    </div>
                  </div>
                  <div v-if="currentParticipant.participant_type === 'Alumni'" @click.stop
                    class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 space-y-4">
                    <div class="max-w-md">
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Batch / Graduation Year</label>
                      <input type="text" v-model="currentParticipant.alumni_batch"
                        placeholder="e.g. Batch 2024 / 2023" :class="[
                          'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                          props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                        ]" />
                    </div>
                    <div class="max-w-md">
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        <i class="fas fa-id-card text-emerald-600 mr-1"></i>
                        Alumni ID Upload <span class="text-red-500">*</span>
                      </label>
                      <div :class="[
                        'relative rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 cursor-pointer',
                        props.darkMode
                          ? 'border-gray-600 bg-gray-800/40 hover:border-emerald-500 hover:bg-gray-800'
                          : 'border-gray-300 bg-gray-50 hover:border-emerald-500 hover:bg-emerald-50/30',
                      ]" @click="$refs.alumniIdInput.click()">
                        <input ref="alumniIdInput" type="file" accept="image/*,.pdf"
                          @change="e => currentParticipant.alumni_id_preview = e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : null"
                          class="sr-only" />
                        <div v-if="!currentParticipant.alumni_id_preview" class="flex flex-col items-center gap-1.5 py-1">
                          <i class="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
                          <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">Click to upload Alumni ID</span>
                          <span class="text-[10px] text-gray-400">JPG, PNG or PDF accepted</span>
                        </div>
                        <div v-else class="flex items-center gap-3 text-left">
                          <img :src="currentParticipant.alumni_id_preview" class="w-12 h-12 object-cover rounded-lg border border-emerald-200" />
                          <div>
                            <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-400">ID uploaded</p>
                            <p class="text-[10px] text-gray-500">Tap to replace</p>
                          </div>
                        </div>
                      </div>
                      <p class="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-start gap-1">
                        <i class="fas fa-info-circle mt-0.5 shrink-0"></i>
                        <span>Valid Alumni ID required - must be within 1 year of issue or fresh graduate. ID will be verified before kit claiming.</span>
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <!-- STEP 5B: OPEN CATEGORY -->
              <div v-if="currentParticipant.participantGroup === 'Open'" class="space-y-2">

                <button type="button"
                  @click="currentParticipant.participantGroup = null; currentParticipant.participant_type = ''"
                  class="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mb-1">
                  <i class="fas fa-chevron-left text-[10px]"></i> Change category group
                </button>

                <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 px-1 pb-1">
                  <i class="fas fa-globe-asia mr-1"></i> Open Category
                </p>

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
                      <div v-if="currentParticipant.participant_type === 'Non-LSU'" class="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                    <input type="radio" value="Non-LSU" v-model="currentParticipant.participant_type" class="sr-only" />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between gap-2 flex-wrap">
                        <span class="font-bold text-sm text-gray-900 dark:text-gray-100">Open Category</span>
                        <span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          Physical ID upon kit claiming
                        </span>
                      </div>
                      <span class="text-xs text-gray-500 block mt-0.5">Open to public runners, community enthusiasts, and visiting teams</span>
                    </div>
                  </div>
                  <div v-if="currentParticipant.participant_type === 'Non-LSU'" @click.stop
                    class="mt-4 pl-8 pt-3.5 border-t border-emerald-200/80 dark:border-gray-700 max-w-md">
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Organization / Running Club / Company</label>
                    <input type="text" v-model="currentParticipant.organization"
                      placeholder="e.g. Ozamiz Lifestyle Runners Club" :class="[
                        'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                        props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                      ]" />
                  </div>
                  <div v-if="currentParticipant.participant_type === 'Non-LSU'" class="mt-3 pl-8">
                    <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                      <i class="fas fa-id-card text-amber-600 text-xs mt-0.5 shrink-0"></i>
                      <span><strong>Physical ID Verification:</strong> No online ID upload required. Present a valid physical ID when claiming your race bib and event kit.</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>
        

          <!-- SECTION 6: PAYMENT SUMMARY & OPTIONS -->
          <section v-if="currentParticipant.run_category" :class="[
            'rounded-2xl p-4 sm:p-6 border shadow-lg transition-all',
            props.darkMode
              ? 'bg-gray-900/90 border-gray-700'
              : 'bg-gradient-to-br from-slate-50 to-emerald-50/40 border-emerald-200',
          ]">
            <h3 class="text-xl font-black mb-4 flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <i class="fas fa-receipt text-emerald-600"></i>
              Payment & Checkout Summary
            </h3>

           

            <!-- Total -->
            <div class="flex items-center justify-between text-base sm:text-lg font-black mb-8">
              <span class="text-gray-800 dark:text-gray-200">Grand Total Fee</span>
              <span class="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                PHP {{ grandTotal.toLocaleString() }}
              </span>
            </div>

            <!-- Payment Type Selection -->
            <div class="space-y-4 mb-8 ">
             <div>
               <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
                Select Payment Option
              </label>

              <!-- Dynamic payment option grid -->
              <div :class="[
                '',
                currentParticipant.participant_type === 'Non-LSU' || currentParticipant.participant_type === 'Alumni'
                  ? ''
                  : ''
              ]">

                <!-- 1. LSU Employees - Salary Deduction (only for Lasallian Partners) -->
                <div v-if="currentParticipant.participant_type === 'Lasallian Partners'"
                  @click="paymentType = 'salary_deduction'" :class="[
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
                   
                  </div>
                </div>

                <!-- 2. LSU Students - Add to Tuition (only for enrolled students) -->
                <div v-if="currentParticipant.participant_type === 'LSU Higher Education Unit Student'"
                  @click="paymentType = 'add_to_tuition'" :class="[
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
                  
                  </div>
                </div>

                <!-- 3. OTC / QR / Cash (for Non-LSU, Alumni, 1K Pet Run, and any unclassified) -->
                <div v-if="currentParticipant.participant_type === 'Non-LSU' || currentParticipant.participant_type === 'Alumni' || currentParticipant.run_category === '1K' || !currentParticipant.participant_type"
                  @click="paymentType = 'non_lsu_payment'" :class="[
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
                        {{ currentParticipant.participant_type === 'Alumni' ? 'Alumni' : 'Open / External' }}
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
                      Over The Counter / QR / Weekend Cash
                    </span>
                    <p class="text-xs text-gray-500 mt-1">
                      Accounting Over The Counter, QR Payment, or Cash at Ozamiz Lifestyle Runners.
                    </p>
                  </div>
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
                    Center and Accounting Office to process the total registration fee of <strong>PHP {{
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
                    <strong>Student Account Billing:</strong> The registration fee of <strong>PHP {{
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
  <div
    @click="nonLsuPaymentMethod = 'qr_payment'"
    :class="[
      'p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold',
      nonLsuPaymentMethod === 'qr_payment'
        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    ]"
  >
    <div class="flex items-center gap-2.5">
      <i class="fas fa-qrcode text-emerald-600 text-base shrink-0"></i>
      <div>
        <div class="font-bold">QR Payment</div>
        <div class="text-[10px] font-normal text-gray-500">
          GCash / Maya / Online Bank
        </div>
      </div>
    </div>

    <!-- Guidance -->
    <div
      v-if="nonLsuPaymentMethod === 'qr_payment'"
      class="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800"
    >
      <p class="font-bold text-gray-800 dark:text-gray-200 text-[11px]">
        <i class="fas fa-mobile-alt text-emerald-600 mr-1"></i>
        GCash / Maya / QR Payment
      </p>
      <p class="text-gray-500 dark:text-gray-400 text-[10px] font-normal leading-relaxed mt-1">
        Pay <strong>PHP {{ grandTotal.toLocaleString() }}</strong> to
        The Emerald Run Official Account. Take a screenshot and upload
        your receipt below.
      </p>
    </div>
  </div>

  <!-- Accounting Over The Counter -->
  <div
    @click="nonLsuPaymentMethod = 'accounting_otc'"
    :class="[
      'p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold',
      nonLsuPaymentMethod === 'accounting_otc'
        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    ]"
  >
    <div class="flex items-center gap-2.5">
      <i class="fas fa-university text-emerald-600 text-base shrink-0"></i>
      <div>
        <div class="font-bold">Accounting Over The Counter</div>
        <div class="text-[10px] font-normal text-gray-500">
          LSU Accounting Window
        </div>
      </div>
    </div>

    <!-- Guidance -->
    <div
      v-if="nonLsuPaymentMethod === 'accounting_otc'"
      class="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800"
    >
      <p class="font-bold text-gray-800 dark:text-gray-200 text-[11px]">
        <i class="fas fa-cash-register text-emerald-600 mr-1"></i>
        LSU Accounting Office
      </p>
      <p class="text-gray-500 dark:text-gray-400 text-[10px] font-normal leading-relaxed mt-1">
        Visit the LSU Accounting Office
        <strong>Mon-Fri, 8:00 AM - 5:00 PM</strong>. State that the
        payment is for <strong>The Emerald Run 2026</strong> and upload
        the official receipt slip below.
      </p>
    </div>
  </div>

  <!-- Weekend Cash -->
  <div
    @click="nonLsuPaymentMethod = 'weekend_cash'"
    :class="[
      'p-3.5 rounded-xl border cursor-pointer transition text-xs font-semibold',
      nonLsuPaymentMethod === 'weekend_cash'
        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    ]"
  >
    <div class="flex items-center gap-2.5">
      <i class="fas fa-running text-emerald-600 text-base shrink-0"></i>
      <div>
        <div class="font-bold">Weekend Cash</div>
        <div class="text-[10px] font-normal text-gray-500">
          Ozamiz Lifestyle Runners Organizers
        </div>
      </div>
    </div>

    <!-- Guidance -->
    <div
      v-if="nonLsuPaymentMethod === 'weekend_cash'"
      class="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800"
    >
      <p class="font-bold text-gray-800 dark:text-gray-200 text-[11px]">
        <i class="fas fa-map-pin text-emerald-600 mr-1"></i>
        Cash Payment
      </p>
      <p class="text-gray-500 dark:text-gray-400 text-[10px] font-normal leading-relaxed mt-1">
        Pay directly at the Ozamiz Lifestyle Runners booth every weekend
        during scheduled fun runs or meetups. Upload your organizer
        acknowledgment receipt below.
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
                        The Emerald Run Committee will verify the Payment before issuing race bib and confirmation
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
                      <strong>Verification Notice:</strong> The Emerald Run Committee will verify the Payment and validate your
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
                <span>{{ isSubmitting ? 'Submitting Registration...' : 'Submit Registration (PHP ' +
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
            • The Emerald Run Committee will verify your uploaded payment receipt.
          </p>
          <p class="text-gray-500 dark:text-gray-400 pt-1">
            Once verified by the event admin, you will receive your <strong>Official Race Confirmation Email</strong> containing your assigned bib number and kit claiming instructions. <em>Please bring and present a physical Valid ID when claiming your race bib and event kit.</em>
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

.pet-name-input:focus {
  box-shadow: 0 0 0 2px rgba(2, 133, 125, 0.25);
  border-color: #02857D !important;}
</style>
