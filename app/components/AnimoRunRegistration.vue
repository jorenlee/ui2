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
    id: "1KM",
    categoryType: "pet",
    categoryTypeLabel: "Pet & Runner Duo",
    name: "1 KM",
    tagline: "Run together with your best furry friend.",
    fee: 1000,
    time: "5:00 AM",
    description: "Special 1KM Pet & Runner Duo race route for dogs, cats & friendly pets.",
    badge: "Pet Run (1K)",
    icon: "fa-paw",
    colors: {
      primary: "#02857D",
      secondary: "#035751",
      accent: "#2D9F98",
      highlight: "#93CAC5",
      dark: "#0B0A09",
      text: "#FFFFFF",
      cardBg: "#f0fbfa",
      cardBorder: "#93CAC5",
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
    id: "3KM",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "3 KM",
    tagline: "Start your journey.",
    fee: 1000,
    time: "4:55 AM",
    description: "Perfect for beginners, families, and casual runners.",
    badge: "Starter (3KM)",
    icon: "fa-running",
    colors: {
      primary: "#C62216",
      secondary: "#8E100B",
      accent: "#D93625",
      dark: "#160B0A",
      light: "#F4F4F2",
      neutral: "#A3A3A3",
      cardBg: "#fff5f5",
      cardBorder: "#C62216",
      ringColor: "rgba(198,34,22,0.25)",
    },
    inclusions: [
      "Event Shirt or Singlet",
      "Post-Meal",
      "Race Bib",
      "Acrylic Finisher Medal",
    ],
  },
  {
    id: "10KM",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "10 KM",
    tagline: "Go farther. Go stronger.",
    fee: 1400,
    time: "4:40 AM",
    description: "For intermediate runners pushing their endurance limits.",
    badge: "Endurance (10KM)",
    icon: "fa-running",
    colors: {
      primary: "#C45A19",
      secondary: "#9E3D12",
      accent: "#D87828",
      dark: "#35120A",
      highlight: "#E9C98E",
      text: "#F3F1E9",
      cardBg: "#fff8f0",
      cardBorder: "#C45A19",
      ringColor: "rgba(196,90,25,0.25)",
    },
    inclusions: [
      "Event Shirt or Singlet",
      "Post-Meal",
      "Race Bib",
      "Metal Finisher Medal",
    ],
  },
  {
    id: "20KM",
    categoryType: "human",
    categoryTypeLabel: "Human Category",
    name: "20 KM",
    tagline: "Conquer the ultimate challenge.",
    fee: 1800,
    time: "4:00 AM",
    description: "The premier distance for competitive runners and veterans.",
    badge: "Ultimate (20KM)",
    icon: "fa-running",
    colors: {
      primary: "#075F86",
      secondary: "#0B1C2E",
      accent: "#0788B5",
      dark: "#080D15",
      highlight: "#10AFC5",
      lighthl: "#B9E5E8",
      text: "#F1F3F2",
      cardBg: "#f0f8ff",
      cardBorder: "#075F86",
      ringColor: "rgba(7,95,134,0.25)",
    },
    inclusions: [
      "Event Shirt or Singlet",
      "Finisher Shirt",
      "Post-Meal",
      "Race Bib",
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

  const selected = participant.shirt_type === "singlet" ? "Singlet" : "Event Shirt";
  const raceShirtSize = participant.shirt_type === "singlet"
    ? (participant.singlet_size || participant.tshirt_size || "M")
    : (participant.event_shirt_size || participant.tshirt_size || "M");

  if (participant.run_category === "20KM") {
    const finisherSize = participant.finisher_shirt_size || "M";
    return `${selected}: ${raceShirtSize}; Finisher Shirt: ${finisherSize};`;
  }

  return `${selected}: ${raceShirtSize};`;
};

const isPetCategory = (category) => category === "1KM" || category === "1K";

const formatPhoneNumberInput = (event, participant) => {
  let val = event?.target?.value || "";
  // Strip all non-digits
  let digits = val.replace(/\D/g, "");

  // If user pasted with leading country code 63 or leading 0, strip it
  if (digits.startsWith("63") && digits.length > 10) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  // Max 10 digits
  digits = digits.slice(0, 10);

  // Format cleanly as 9XX-XXX-XXXX
  let formatted = "";
  if (digits.length > 0) {
    formatted = digits.slice(0, 3);
    if (digits.length > 3) {
      formatted += "-" + digits.slice(3, 6);
    }
    if (digits.length > 6) {
      formatted += "-" + digits.slice(6, 10);
    }
  }

  participant.contact_number = formatted;
};

const createEmptyParticipant = (index = 1) => ({
  id: index,
  run_category: "",
  participantGroup: null, // null | 'LSU' | 'Open'
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
  // Alumni ID upload — front & back
  alumni_id_front_file: null,
  alumni_id_front_preview: null,
  alumni_id_back_file: null,
  alumni_id_back_preview: null,
  organization: "",
  shirt_type: "event_shirt",
  selected_shirt_tab: "event_shirt",
  tshirt_size: "Event Shirt: M;",
  event_shirt_size: "M",
  singlet_size: "M",
  finisher_shirt_size: "M",
  // Pet Run fields (active when run_category === '1KM' or '1K')
  pet_name: "",
  pet_type: "",
  pet_other_type: "",
  pet_bandana_size: "Standard",
  pet_vaccinated: true,
  pet_vaccine_record_file: null,
  pet_vaccine_record_preview: null,
  pet_consent_agreed: true,
  pet_consent_files: [], // array of { file, name, preview, isPdf }
});

const selectParticipantGroup = (participant, group) => {
  participant.participantGroup = group;
  if (group === "Open") {
    participant.participant_type = "Open Category";
  } else if (group === "LSU") {
    if (!participant.participant_type || participant.participant_type === "Open Category") {
      participant.participant_type = "Currently Enrolled Students";
    }
  }
};

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

// Automatically adjust recommended paymentType when participant classification or category changes
watch(
  [() => currentParticipant.value?.participant_type, () => currentParticipant.value?.run_category],
  ([newType, newCat]) => {
    if (newCat === "1KM" || newCat === "1K") {
      paymentType.value = "non_lsu_payment";
    } else if (newType === "Employees") {
      paymentType.value = "salary_deduction";
    } else if (newType === "Currently Enrolled Students") {
      paymentType.value = "add_to_tuition";
    } else if (newType === "Open Category" || newType === "Alumni") {
      paymentType.value = "non_lsu_payment";
    }
  },
  { immediate: true }
);

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const checkFileSize = (file, label = "File") => {
  if (file && file.size > MAX_FILE_SIZE_BYTES) {
    showNotice(
      `${label} exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB}MB. Please compress or resize the file before uploading.`,
      "File Too Large",
      "error"
    );
    return false;
  }
  return true;
};

const handleReceiptUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!checkFileSize(file, "Payment receipt")) {
    event.target.value = "";
    return;
  }
  receiptFile.value = file;
  receiptPreview.value = URL.createObjectURL(file);
};

const removeReceipt = () => {
  receiptFile.value = null;
  receiptPreview.value = null;
};

// ── Alumni ID upload handlers (per-participant, front & back) ──────────────
const handleAlumniIdUpload = (event, participant, side) => {
  const file = event.target.files[0];
  if (!file) return;
  const sideLabel = side === 'front' ? 'Alumni ID (Front)' : 'Alumni ID (Back)';
  if (!checkFileSize(file, sideLabel)) {
    event.target.value = "";
    return;
  }
  const preview = URL.createObjectURL(file);
  if (side === 'front') {
    participant.alumni_id_front_file = file;
    participant.alumni_id_front_preview = preview;
  } else {
    participant.alumni_id_back_file = file;
    participant.alumni_id_back_preview = preview;
  }
};

const removeAlumniId = (participant, side) => {
  if (side === 'front') {
    participant.alumni_id_front_file = null;
    participant.alumni_id_front_preview = null;
  } else {
    participant.alumni_id_back_file = null;
    participant.alumni_id_back_preview = null;
  }
};

// ── Pet Vaccine Record Upload ─────────────────────────────────────────────
const handlePetVaccineUpload = (event, participant) => {
  const file = event.target.files[0];
  if (!file) return;
  if (!checkFileSize(file, "Pet vaccine record")) {
    event.target.value = "";
    return;
  }
  participant.pet_vaccine_record_file = file;
  participant.pet_vaccine_record_preview = URL.createObjectURL(file);
};

const removePetVaccine = (participant) => {
  participant.pet_vaccine_record_file = null;
  participant.pet_vaccine_record_preview = null;
};

// ── Pet Consent Documents Upload (Multi-Upload) ───────────────────────────
const handlePetConsentUpload = (event, participant) => {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  if (!participant.pet_consent_files) {
    participant.pet_consent_files = [];
  }
  const oversized = files.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
  if (oversized.length) {
    showNotice(
      `The following file(s) exceed ${MAX_FILE_SIZE_MB}MB and were not added: ${oversized.map((f) => f.name).join(", ")}. Please compress or resize them before uploading.`,
      "File Too Large",
      "error"
    );
    event.target.value = "";
    return;
  }
  files.forEach((f) => {
    participant.pet_consent_files.push({
      file: f,
      name: f.name,
      preview: URL.createObjectURL(f),
      isPdf: f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"),
    });
  });
  event.target.value = "";
};

const removePetConsentDoc = (participant, index) => {
  if (participant.pet_consent_files && participant.pet_consent_files[index]) {
    participant.pet_consent_files.splice(index, 1);
  }
};

const itemizedFees = computed(() => {
  const items = [];
  participants.value.forEach((p, idx) => {
    const labelPrefix =
      form_type.value === "Group"
        ? `Runner #${idx + 1} (${p.firstname || "Unnamed"}): `
        : "";
    const cat = runCategories.find((c) => c.id === p.run_category || (p.run_category === '1K' && c.id === '1KM'));
    if (cat) {
      const isPet = isPetCategory(p.run_category);
      const shirtDesc = isPet
        ? `Size: ${p.tshirt_size || "M"} (Owner) + Bandana (${p.pet_bandana_size || "Standard"})`
        : p.run_category === "20KM"
          ? buildShirtSizeSummary(p)
          : `Size: ${buildShirtSizeSummary(p)}`;

      items.push({
        name: `${labelPrefix}${cat.name} (${cat.id})${isPet && p.pet_name ? ' - Pet: ' + p.pet_name : ''}`,
        shirt: shirtDesc,
        amount: cat.fee,
        isPet: isPet,
      });
    }
  });
  return items;
});

const grandTotal = computed(() => {
  return itemizedFees.value.reduce((sum, item) => sum + item.amount, 0);
});

const paymentMethodLabel = computed(() => {
  if (paymentType.value === "salary_deduction") return "Salary Deduction";
  if (paymentType.value === "add_to_tuition") return "Add to Tuition";
  if (nonLsuPaymentMethod.value === "qr_payment") return "QR Payment";
  if (nonLsuPaymentMethod.value === "accounting_otc") return "Accounting OTC";
  return "Weekend Cash";
});

const registrationSummary = computed(() => {
  const runnerSummaries = participants.value.map((participant, index) => {
    const category = runCategories.find(
      (item) => item.id === (participant.run_category === "1K" ? "1KM" : participant.run_category)
    );

    return {
      name: [participant.firstname, participant.lastname].filter(Boolean).join(" ") || `Runner ${index + 1}`,
      category: category ? `${category.name} (${category.id})` : participant.run_category || "Not selected",
      classification:
        participant.participantGroup === "LSU"
          ? participant.participant_type || "LSU Exclusive"
          : "Open Category",
      payment: paymentMethodLabel.value,
      fee: category?.fee || 0,
    };
  });

  return {
    runners: runnerSummaries,
    total: grandTotal.value,
    payment: paymentMethodLabel.value,
  };
});

const copyRunnerOneInfo = () => {
  if (participants.value.length < 2) return;
  const r1 = participants.value[0];
  const p = currentParticipant.value;
  p.contact_number = r1.contact_number;
  p.contact_email = r1.contact_email;
  p.contact_address = r1.contact_address;
  p.participantGroup = r1.participantGroup;
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
  p.pet_type = r1.pet_type;
  p.pet_other_type = r1.pet_other_type;
  p.pet_bandana_size = r1.pet_bandana_size;
  p.pet_vaccinated = r1.pet_vaccinated;
  p.pet_consent_agreed = r1.pet_consent_agreed;
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

    // Phone number validation: must be 10 digits starting with 9
    const rawDigits = (p.contact_number || "").replace(/\D/g, "");
    if (rawDigits.length !== 10 || !rawDigits.startsWith("9")) {
      showNotice(
        `Please provide a valid 10-digit Philippine Mobile Number (e.g. 917-123-4567) starting with 9 for Runner #${i + 1}.`,
        "Valid Contact Number Required",
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

    // Validate Participant Classification for non-pet categories
    if (!isPetCategory(p.run_category)) {
      if (!p.participantGroup) {
        showNotice(
          `Please select your Participant Classification (LSU Exclusive or Open Category) for Runner #${i + 1}.`,
          "Classification Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
      if (p.participantGroup === "LSU" && !p.participant_type) {
        showNotice(
          `Please select an LSU Exclusive category (Students, Employees, or Alumni) for Runner #${i + 1}.`,
          "LSU Category Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
    }

    // Validate Pet fields if Pet Run is selected
    if (isPetCategory(p.run_category)) {
      if (!p.pet_name?.trim()) {
        showNotice(
          `Please provide your Pet's Name for Runner #${i + 1}.`,
          "Pet Name Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
      if (p.pet_type === "Other" && !p.pet_other_type?.trim()) {
        showNotice(
          `Please specify your Pet's Species / Type for Runner #${i + 1}.`,
          "Pet Species Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
      if (!p.pet_vaccine_record_file) {
        showNotice(
          `Please upload your pet's Valid Vaccination Record / Updated 6-Month Anti-Rabies Certificate for Runner #${i + 1}.`,
          "Pet Vaccine Record Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
      if (!p.pet_vaccinated) {
        showNotice(
          `Please confirm the Pet Safety & Anti-Rabies Vaccination assurance for Runner #${i + 1}.`,
          "Pet Safety Assurance Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
      if (!p.pet_consent_agreed) {
        showNotice(
          `Please agree to the Non-Liability Clause and Pet Owner Responsibility Waiver for Runner #${i + 1}.`,
          "Non-Liability Consent Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
    }

    // Validate Alumni ID (front only, up to 5MB) for Alumni participants
    if (p.participant_type === 'Alumni') {
      if (!p.alumni_id_front_file) {
        showNotice(
          `Please upload the front side of your Alumni ID for Runner #${i + 1}.`,
          "Alumni ID Required",
          "warning"
        );
        activeParticipantIndex.value = i;
        return;
      }
    }
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
    if (nonLsuPaymentMethod.value === "qr_payment" && !receiptFile.value) {
      showNotice(
        "Please upload your proof of payment or deposit transfer screenshot before submitting.",
        "Payment Receipt Required",
        "warning"
      );
      return;
    }
  }

  // Final guard: ensure no uploaded file exceeds 1MB before submitting
  if (receiptFile.value && receiptFile.value.size > MAX_FILE_SIZE_BYTES) {
    showNotice(
      `Your payment receipt exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB}MB. Please compress or resize the file and re-upload.`,
      "File Too Large",
      "error"
    );
    return;
  }
  for (let i = 0; i < participants.value.length; i++) {
    const p = participants.value[i];
    if (p.alumni_id_front_file && p.alumni_id_front_file.size > MAX_FILE_SIZE_BYTES) {
      showNotice(`Alumni ID (Front) for Runner #${i + 1} exceeds ${MAX_FILE_SIZE_MB}MB. Please re-upload a smaller file.`, "File Too Large", "error");
      activeParticipantIndex.value = i;
      return;
    }
    if (p.pet_vaccine_record_file && p.pet_vaccine_record_file.size > MAX_FILE_SIZE_BYTES) {
      showNotice(`Pet vaccine record for Runner #${i + 1} exceeds ${MAX_FILE_SIZE_MB}MB. Please re-upload a smaller file.`, "File Too Large", "error");
      activeParticipantIndex.value = i;
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
        participants: await Promise.all(participants.value.map(async (p) => {
          // Upload Alumni ID front if present (up to 5MB)
          let idFrontUrl = "";
          let idBackUrl = "";
          if (p.participant_type === 'Alumni') {
            if (p.alumni_id_front_file) idFrontUrl = await uploadSingleFile(p.alumni_id_front_file) || "";
          }

          // Upload Pet Vaccine Record if present
          let vaccineUrl = "";
          if (p.pet_vaccine_record_file) {
            vaccineUrl = await uploadSingleFile(p.pet_vaccine_record_file) || "";
          }

          // Upload Pet Consent Documents if present
          let consentDocs = [];
          if (p.pet_consent_files && p.pet_consent_files.length) {
            for (const doc of p.pet_consent_files) {
              const url = await uploadSingleFile(doc.file);
              if (url) {
                consentDocs.push({ name: doc.name || 'pet_consent_form', url });
              }
            }
          }

          const resolvedPetType = p.pet_type === "Other" && p.pet_other_type?.trim()
            ? `Other: ${p.pet_other_type.trim()}`
            : p.pet_type;

          const formattedPhone = p.contact_number ? `+63 ${p.contact_number}` : "";

          return {
            firstname: p.firstname,
            middlename: p.middlename,
            lastname: p.lastname,
            suffix: p.suffix,
            run_category: p.run_category === "1K" ? "1KM" : p.run_category,
            participant_type: p.participant_type,
            lsu_id_number: p.lsu_id_number,
            birthdate: p.birthdate,
            gender: p.gender,
            contact_number: formattedPhone,
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
            pet_type: resolvedPetType,
            pet_bandana_size: p.pet_bandana_size,
            pet_vaccinated: p.pet_vaccinated,
            valid_id_front: idFrontUrl ? [{ name: 'alumni_id_front', url: idFrontUrl }] : [],
            valid_id_back: idBackUrl ? [{ name: 'alumni_id_back', url: idBackUrl }] : [],
            pet_vaccine_record: vaccineUrl ? [{ name: 'pet_vaccine_record', url: vaccineUrl }] : [],
            pet_consent_documents: consentDocs,
          };
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

      // Upload Alumni ID front if participant is Alumni (up to 5MB)
      let idFrontUrl = "";
      let idBackUrl = "";
      if (p.participant_type === 'Alumni') {
        if (p.alumni_id_front_file) idFrontUrl = await uploadSingleFile(p.alumni_id_front_file) || "";
      }

      // Upload Pet Vaccine Record if present
      let vaccineUrl = "";
      if (p.pet_vaccine_record_file) {
        vaccineUrl = await uploadSingleFile(p.pet_vaccine_record_file) || "";
      }

      // Upload Pet Consent Documents if present
      let consentDocs = [];
      if (p.pet_consent_files && p.pet_consent_files.length) {
        for (const doc of p.pet_consent_files) {
          const url = await uploadSingleFile(doc.file);
          if (url) {
            consentDocs.push({ name: doc.name || 'pet_consent_form', url });
          }
        }
      }

      const resolvedPetType = p.pet_type === "Other" && p.pet_other_type?.trim()
        ? `Other: ${p.pet_other_type.trim()}`
        : p.pet_type;

      const formattedPhone = p.contact_number ? `+63 ${p.contact_number}` : "";

      const payload = {
        firstname: p.firstname,
        middlename: p.middlename,
        lastname: p.lastname,
        suffix: p.suffix,
        run_category: p.run_category === "1K" ? "1KM" : p.run_category,
        participant_type: p.participant_type,
        lsu_id_number: p.lsu_id_number,
        birthdate: p.birthdate,
        gender: p.gender,
        contact_number: formattedPhone,
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
        pet_type: resolvedPetType,
        pet_bandana_size: p.pet_bandana_size,
        pet_vaccinated: p.pet_vaccinated,
        form_type: "Individual",
        payment_type: effectivePaymentType,
        proof_of_payment: receiptUrl || "",
        grand_total_payment: grandTotal.value,
        detail_fees: itemizedFees.value,
        valid_id_front: idFrontUrl ? [{ name: 'alumni_id_front', url: idFrontUrl }] : [],
        valid_id_back: idBackUrl ? [{ name: 'alumni_id_back', url: idBackUrl }] : [],
        pet_vaccine_record: vaccineUrl ? [{ name: 'pet_vaccine_record', url: vaccineUrl }] : [],
        pet_consent_documents: consentDocs,
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
        <div class="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none">
        </div>
        <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none">
        </div>

        <div class="relative px-4 py-3 sm:px-8 sm:py-5">
          <!-- Mobile: compact row layout -->
          <div class="flex items-center gap-3 sm:gap-5">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo%20White.png"
              alt="LSU Logo" class="w-auto lg:h-12 h-10 object-contain shrink-0" />
            <div class="flex-1 min-w-0">
              <h1
                class="text-base sm:text-2xl font-black text-white tracking-wide leading-tight flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>THE EMERALD RUN</span>
                <span class="text-emerald-500">ANIMO RUN 2026</span>
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
          <div class=" items-start sm:items-center gap-3 sm:gap-5 lg:w-fit">



            <!-- Title & Description -->
            <div class="flex-1 min-w-0 mb-3">
              <h2 class="text-base sm:text-lg font-bold flex items-center gap-2">
                <i class="fas fa-users text-emerald-600"></i>
                Select Registration Type
              </h2>
              <p class="text-xs text-gray-500 mt-0.5">
                Choose whether you are registering for yourself or a team/group
              </p>
            </div>

            <!-- Individual / Group Radio Cards — LEFTMOST -->
            <div class="flex gap-2 shrink-0" v-if="currentParticipant.run_category !== '1K'">
              <div @click="form_type = 'Individual'" :class="[
                'lg:w-fit w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border font-semibold text-sm transition-all duration-200 shadow-sm',
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
                'lg:w-fit w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl cursor-pointer border font-semibold text-sm transition-all duration-200 shadow-sm',
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
        </div>

        <!-- FORM CONTENT AREA -->
        <div class="lg:flex">




          <!-- Vertical Participant Sidebar for Group Mode -->
          <div v-if="form_type === 'Group'" :class="[
            'flex flex-col gap-2 p-3 border-r shrink-0 w-full lg:min-w-[120px] lg:max-w-[300px]',
            props.darkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-emerald-50/40 border-slate-200',
          ]" style="min-height: 100%;">
            <div class="text-[10px] font-bold uppercase tracking-widest mb-1 px-1"
              :class="props.darkMode ? 'text-emerald-400' : 'text-emerald-700'">
              Runners
            </div>


            <!-- Group Participant Stepper -->
            <div v-if="form_type === 'Group'" :class="[
              'flex items-center justify-between gap-3 px-4 py-2 rounded-2xl border shrink-0',
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


            <button v-for="(p, pIdx) in participants" :key="pIdx" type="button" @click="activeParticipantIndex = pIdx"
              :class="[
                'flex flex-col items-start gap-0.5 w-full px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 border text-left',
                activeParticipantIndex === pIdx
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-bold'
                  : props.darkMode
                    ? 'bg-gray-700/60 text-gray-300 border-gray-600 hover:bg-gray-700'
                    : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-100',
              ]">
              <div class="flex items-center justify-between w-full gap-1">
                <span class="flex items-center text-[10px] gap-1.5 whitespace-nowrap">
                  <i class="fas fa-running"></i>
                  <!-- runner: -->
                  <span>#{{ pIdx + 1 }}</span>
                </span>
                <span v-if="p.firstname" class="truncate w-full flex text-xs uppercase opacity-80 pl-1">
                  {{ p.firstname }} {{ p.lastname }}
                </span>
                <span v-if="participants.length > 1" @click.stop="removeParticipant(pIdx)"
                  class="hover:text-rose-300 p-0.5 rounded-full" title="Remove runner">
                  <i class="fas fa-times text-[10px]"></i>
                </span>
              </div>
            </button>

            <button type="button" @click="addParticipant" :class="[
              'flex items-center justify-center gap-1 w-full px-3 py-2 rounded-xl border border-dashed font-semibold text-xs transition',
              props.darkMode
                ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-950/40'
                : 'border-emerald-400 text-emerald-600 hover:bg-emerald-50',
            ]">
              <i class="fas fa-plus text-xs"></i> Add
            </button>
          </div>

          <!-- Actual Form Content -->
          <div class="flex-1 p-3 sm:p-5 space-y-6 sm:space-y-8 min-w-0">

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
                  <span v-if="currentParticipant.run_category === '1K'"
                    class="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border"
                    :style="{ background: '#e8faf9', color: '#035751', borderColor: '#2D9F98' }">
                    <i class="fas fa-paw" :style="{ color: '#02857D' }"></i> Selected: 1K (PHP 1,000)
                  </span>
                  <span v-else
                    class="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs border"
                    :style="{
                      background: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.cardBg || '#f5f5f5',
                      color: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.secondary || '#333',
                      borderColor: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.primary || '#999'
                    }">
                    <i class="fas fa-running"
                      :style="{ color: runCategories.find(c => c.id === currentParticipant.run_category)?.colors?.primary }"></i>
                    Selected: {{ currentParticipant.run_category }} (PHP {{runCategories.find(c => c.id ===
                      currentParticipant.run_category)?.fee?.toLocaleString() || 0}})
                  </span>
                </div>
              </div>



              <!-- RACE CARDS CONTAINER -->
              <!-- Mobile: Horizontal swipe snap container; Desktop: flex row with sidebar -->
              <div
                class="flex lg:flex-row gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none items-stretch -mx-2 px-2 sm:mx-0 sm:px-0">



                <!-- HUMAN RUN CARDS -->
                <div class="contents lg:flex-1 lg:grid lg:grid-cols-3 lg:gap-4">
                  <div v-for="cat in runCategories.filter(c => c.categoryType === 'human')" :key="cat.id"
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
                    <div class="absolute -right-3 -bottom-3 text-8xl pointer-events-none"
                      :style="{ color: 'rgba(255,255,255,0.06)' }">
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
                          <h2 class="text-4xl font-black tracking-tight whitespace-nowrap"
                            :style="{ color: currentParticipant.run_category === cat.id ? '#fff' : 'rgba(255,255,255,0.7)' }">
                            {{ cat.name }}
                          </h2>



                        </div>
                        <!-- Fee -->
                        <!-- <div>
                        
                          <span class="text-xl font-black mt-1 block whitespace-nowrap"
                            :style="{ color: currentParticipant.run_category === cat.id ? cat.colors.highlight || '#fff' : 'rgba(255,255,255,0.55)' }">
                            PHP {{ cat.fee.toLocaleString() }}
                          </span>
                        </div> -->

                      </div>


                      <!-- Inclusions -->
                      <div class="mt-4 pt-3 border-t" :style="{ borderColor: 'rgba(255,255,255,0.15)' }">
                        <p class="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                          :style="{ color: cat.colors.highlight || cat.colors.accent || 'rgba(255,255,255,0.7)' }">
                          <i class="fas fa-check-circle"></i> Inclusions:
                        </p>
                        <ul class="space-y-1.5">
                          <li v-for="(inc, incIdx) in cat.inclusions" :key="incIdx"
                            class="text-[11px] flex items-center gap-2" style="color: rgba(255,255,255,0.8)">
                            <i class="fas fa-check text-[10px]"
                              :style="{ color: cat.colors.highlight || cat.colors.accent }"></i>
                            <span>{{ inc }}</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Price -->
                    <div class="mt-5 pt-3 border-t flex items-center justify-between text-xs"
                      :style="{ borderColor: 'rgba(255,255,255,0.15)' }">
                      <!-- <span class="font-medium flex items-center gap-1" style="color: rgba(255,255,255,0.6)">
                        <i class="fas fa-flag-checkered"
                          :style="{ color: cat.colors.highlight || cat.colors.accent }"></i> Gun Time:
                      </span> -->
                      <span class="font-black" :style="{ color: cat.colors.highlight || '#fff' }">PHP {{
                        cat.fee.toLocaleString() }}</span>
                    </div>
                  </div>
                </div>



                <!-- VERTICAL DIVIDER (Desktop only) -->
                <div class="hidden lg:flex flex-col items-center justify-center px-3 shrink-0">
                  <div
                    class="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent">
                  </div>
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
                  <div
                    class="w-px flex-1 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent">
                  </div>
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
                    }" @click="currentParticipant.run_category = '1K'">

                  <!-- Watermark -->
                  <div class="absolute -right-4 -bottom-4 text-8xl pointer-events-none select-none"
                    style="color: rgba(255,255,255,0.05)">
                    <i class="fas fa-paw"></i>
                  </div>

                  <div>
                    <!-- Badge row -->
                    <div class="flex items-center justify-between mb-3">
                      <span
                        class="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm"
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
                      <h2 class="text-3xl font-black tracking-tight"
                        :style="{ color: currentParticipant.run_category === '1K' ? '#fff' : 'rgba(255,255,255,0.7)' }">
                        PETS</h2>
                      <span class="text-xl font-black"
                        :style="{ color: currentParticipant.run_category === '1K' ? '#93CAC5' : 'rgba(255,255,255,0.5)' }">PHP
                        1,000</span>
                    </div>

                    <!-- Inclusions -->
                    <div class="mt-4 pt-3 border-t" style="border-color: rgba(255,255,255,0.15)">
                      <p class="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                        style="color: #93CAC5">
                        <i class="fas fa-paw" style="color: #2D9F98"></i> Inclusions:
                      </p>
                      <ul class="space-y-1.5">
                        <li v-for="(inc, incIdx) in runCategories[0].inclusions" :key="incIdx"
                          class="text-[11px] flex items-center gap-2" style="color: rgba(255,255,255,0.8)">
                          <i class="fas fa-paw text-[10px]" style="color: #2D9F98"></i><span>{{ inc }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- Gun Time -->
                  <!-- <div class="mt-5 pt-3 border-t flex items-center justify-between text-xs"
                    style="border-color: rgba(255,255,255,0.15)">
                    <span class="font-medium flex items-center gap-1" style="color: rgba(255,255,255,0.6)">
                      <i class="fas fa-clock" style="color: #93CAC5"></i> Gun Time:
                    </span>
                    <span class="font-black" style="color: #93CAC5">5:00 AM</span>
                  </div> -->
                </div>




              </div>

              <!-- Mobile Swipe Hint -->
              <div
                class="lg:hidden flex items-center justify-center gap-1.5 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                <i class="fas fa-arrows-left-right text-[10px]"></i>
                <span>Swipe cards horizontally to explore all race distances</span>
              </div>


              <!-- INTEGRATED PET COMPANION DETAILS (ACTIVATED AUTOMATICALLY WHEN 1K PET RUN IS SELECTED) -->
              <div v-if="isPetCategory(currentParticipant.run_category)"
                class="mt-6 rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 relative overflow-hidden"
                :style="props.darkMode
                  ? { background: 'rgba(3,87,81,0.15)', borderColor: '#035751', boxShadow: '0 4px 20px rgba(3,87,81,0.2)' }
                  : { background: 'linear-gradient(135deg, #f0fbfa 0%, #ffffff 60%, #f0faf9 100%)', borderColor: '#2D9F98', boxShadow: '0 4px 16px rgba(45,159,152,0.12)' }">
                <!-- Paw Watermark Background -->
                <div class="absolute -right-6 -bottom-6 text-9xl pointer-events-none"
                  style="color: rgba(2,133,125,0.05)">
                  <i class="fas fa-paw"></i>
                </div>

                <!-- Header -->
                <div class="flex items-center justify-between flex-wrap gap-3 mb-5 pb-3.5 border-b"
                  style="border-color: rgba(147,202,197,0.6)">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-11 h-11 rounded-2xl text-white flex items-center justify-center text-xl shadow-md shrink-0"
                      style="background: linear-gradient(135deg, #02857D, #2D9F98); box-shadow: 0 4px 12px rgba(2,133,125,0.3)">
                      <i class="fas fa-paw"></i>
                    </div>
                    <div>

                      <h4 class="text-sm sm:text-base font-black flex items-center gap-2 flex-wrap"
                        style="color: #035751">
                        <span>1 KM Pet Registration</span>
                        <span class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white shadow-2xs"
                          style="background: #02857D">
                          Runner + Pet Duo
                        </span>
                      </h4>
                      <p class="text-xs mt-0.5" :style="{ color: props.darkMode ? '#9ca3af' : '#4b5563' }">
                        Please provide your pet companion's details, vaccination records, and signed liability consent.
                      </p>
                    </div>
                  </div>

                  <span class="text-xs font-bold px-3 py-1 rounded-full border shadow-2xs flex items-center gap-1"
                    :style="{ background: props.darkMode ? '#1f2937' : 'rgba(255,255,255,0.9)', color: '#035751', borderColor: '#2D9F98' }">
                    <i class="fas fa-check-circle" style="color: #02857D"></i> Standalone Race Category
                  </span>
                </div>

                <!-- Pet Basic Form Fields -->
                <div :class="[
                  'grid gap-4 mb-4',
                  currentParticipant.pet_type === 'Other' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                ]">
                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Pet's Name <span class="text-rose-500">*</span>
                    </label>
                    <input v-model="currentParticipant.pet_name" placeholder="e.g. Milo / Barkley / Brownie" :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none pet-name-input',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]" />
                  </div>

                  <div>
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Pet Species / Type <span class="text-rose-500">*</span>
                    </label>
                    <select v-model="currentParticipant.pet_type" :class="[
                      'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none',
                      props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                    ]">
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Other">Other Pet Companion (Specify)</option>
                    </select>
                  </div>

                  <div v-if="currentParticipant.pet_type === 'Other'">
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Specify Pet Species / Type <span class="text-rose-500">*</span>
                    </label>
                    <input v-model="currentParticipant.pet_other_type" placeholder="e.g. Rabbit, Guinea Pig, Hamster"
                      :class="[
                        'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none pet-name-input',
                        props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                      ]" />
                  </div>
                </div>

                <!-- Pet Document Uploads: Vaccine Record + Consent Documents -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t"
                  style="border-color: rgba(147,202,197,0.4)">

                  <!-- 1. Vaccine Record Upload -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <i class="fas fa-syringe text-emerald-600"></i>
                        <span>Updated Vaccination Record<span class="text-rose-500">*</span></span>
                      </label>
                      <span v-if="currentParticipant.pet_vaccine_record_preview"
                        class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <i class="fas fa-check-circle"></i> Uploaded
                      </span>
                    </div>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400">
                      Anti-Rabies and 5-in-1 Vaccine.
                    </p>

                    <label :for="'pet_vax_' + activeParticipantIndex" :class="[
                      'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden group',
                      currentParticipant.pet_vaccine_record_preview
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 h-36'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 h-24 py-2',
                      props.darkMode ? 'bg-gray-800/40 hover:bg-gray-800' : 'bg-white hover:bg-emerald-50/30',
                    ]">
                      <input :id="'pet_vax_' + activeParticipantIndex" type="file" accept="image/*,.pdf" class="sr-only"
                        @change="handlePetVaccineUpload($event, currentParticipant)" />
                      <template v-if="currentParticipant.pet_vaccine_record_preview">
                        <img :src="currentParticipant.pet_vaccine_record_preview"
                          class="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-60 transition"
                          alt="Vaccine Record Preview" />
                        <div
                          class="absolute inset-0 flex flex-col items-center justify-end pb-2 bg-gradient-to-t from-black/60 to-transparent">
                          <button type="button" @click.prevent="removePetVaccine(currentParticipant)"
                            class="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold flex items-center gap-1 shadow z-10">
                            <i class="fas fa-trash-alt"></i> Remove Record
                          </button>
                        </div>
                      </template>
                      <template v-else>
                        <div class="flex flex-col items-center gap-1 py-3 px-2 text-center pointer-events-none">
                          <i class="fas fa-file-medical text-2xl text-emerald-500 group-hover:scale-110 transition"></i>
                          <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Upload Vaccine Record</span>
                          <span class="text-[10px] text-gray-400">JPG, PNG, or PDF up to 5MB</span>
                        </div>
                      </template>
                    </label>
                  </div>

                  <!-- 2. Non-Liability Clause & Consent Multi-Document Upload -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <i class="fas fa-file-signature text-emerald-600"></i>
                        <span>Consent Form / Waiver Documents</span>
                      </label>
                      <span v-if="currentParticipant.pet_consent_files && currentParticipant.pet_consent_files.length"
                        class="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <i class="fas fa-check-circle"></i> {{ currentParticipant.pet_consent_files.length }} file(s)
                      </span>
                    </div>
                    <p class="text-[11px] text-gray-500 dark:text-gray-400">
                      Upload signed consent form, waiver, or veterinary clearance (multi-upload supported).
                    </p>

                    <label :for="'pet_consent_' + activeParticipantIndex" :class="[
                      'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-3.5 text-center group',
                      'border-gray-300 dark:border-gray-600 hover:border-emerald-500',
                      props.darkMode ? 'bg-gray-800/40 hover:bg-gray-800' : 'bg-white hover:bg-emerald-50/30',
                    ]">
                      <input :id="'pet_consent_' + activeParticipantIndex" type="file" accept="image/*,.pdf" multiple
                        class="sr-only" @change="handlePetConsentUpload($event, currentParticipant)" />
                      <i class="fas fa-cloud-arrow-up text-2xl text-teal-600 group-hover:scale-110 transition mb-1"></i>
                      <span class="text-xs font-bold text-gray-700 dark:text-gray-300">Add Consent / Waiver
                        Document(s)</span>
                      <span class="text-[10px] text-gray-400">Select multiple JPG, PNG, or PDF files</span>
                    </label>

                    <!-- Uploaded Files List -->
                    <div v-if="currentParticipant.pet_consent_files && currentParticipant.pet_consent_files.length"
                      class="space-y-1.5 max-h-28 overflow-y-auto">
                      <div v-for="(doc, dIdx) in currentParticipant.pet_consent_files" :key="'consent-doc-' + dIdx"
                        class="flex items-center justify-between p-2 rounded-xl border bg-white/80 dark:bg-gray-800/80 border-emerald-200 dark:border-gray-700 text-xs shadow-2xs">
                        <div class="flex items-center gap-2 min-w-0">
                          <i
                            :class="doc.isPdf ? 'fas fa-file-pdf text-rose-500' : 'fas fa-file-image text-emerald-500'"></i>
                          <span
                            class="truncate max-w-[180px] font-semibold text-[11px] text-gray-700 dark:text-gray-300">{{
                              doc.name
                            }}</span>
                        </div>
                        <button type="button" @click="removePetConsentDoc(currentParticipant, dIdx)"
                          class="text-rose-500 hover:text-rose-700 text-xs px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Remove file">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                <!-- Pet Safety & Non-Liability Clause Assurance Checkbox -->
                <div class="mt-4 p-4 rounded-2xl border space-y-3 text-xs text-gray-700 dark:text-gray-300 shadow-2xs"
                  :style="{ background: props.darkMode ? 'rgba(31,41,55,0.9)' : 'rgba(255,255,255,0.9)', borderColor: 'rgba(147,202,197,0.7)' }">

                  <div class="flex items-start gap-3">
                    <input type="checkbox" v-model="currentParticipant.pet_vaccinated"
                      class="mt-1 w-4 h-4 rounded cursor-pointer shrink-0" style="accent-color: #02857D"
                      :id="'pet_vac_' + activeParticipantIndex" />
                    <label :for="'pet_vac_' + activeParticipantIndex"
                      class="cursor-pointer select-none leading-relaxed">
                      <strong style="color: #035751">Pet Safety &amp; Anti-Rabies Vaccination Assurance:</strong> I
                      confirm my pet has
                      updated anti-rabies vaccination (within the last 6 months), is friendly and non-aggressive with
                      other runners and
                      pets, and will remain on a secure leash at all times throughout the 1K run route.
                    </label>
                  </div>

                  <div class="flex items-start gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <input type="checkbox" v-model="currentParticipant.pet_consent_agreed"
                      class="mt-1 w-4 h-4 rounded cursor-pointer shrink-0" style="accent-color: #02857D"
                      :id="'pet_consent_agree_' + activeParticipantIndex" />
                    <label :for="'pet_consent_agree_' + activeParticipantIndex"
                      class="cursor-pointer select-none leading-relaxed">
                      <strong style="color: #035751">Non-Liability Clause &amp; Owner Consent:</strong> I voluntarily
                      assume all risks
                      and full responsibility for my pet's actions, safety, and health during the event. I hereby
                      release and hold
                      harmless La Salle University, event organizers, and volunteers from any liabilities, damages, or
                      claims arising
                      from my pet's participation.
                    </label>
                  </div>
                </div>
              </div>
            </section>

            <!-- UNLOCK HINT: shown when no run category is selected yet -->
            <div v-if="!currentParticipant.run_category"
              class="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div
                class="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-2xl">
                <i class="fas fa-running"></i>
              </div>
              <div>
                <p class="font-black text-base text-gray-800 dark:text-gray-200">Select a Race Category above</p>
                <p class="text-xs text-gray-500 mt-1">Your registration form will appear once you pick a category.</p>
              </div>
              <div
                class="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-bounce mt-1">
                <i class="fas fa-chevron-up text-[10px]"></i> Choose Category
              </div>
            </div>

            <!-- SECTION 2: PERSONAL INFORMATION -->
            <section v-if="currentParticipant.run_category">
              <div class="mb-4">
                <h3 class="text-lg font-bold flex items-center gap-2">
                  <span
                    class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
                  <span>{{ currentParticipant.run_category === '1K' ? 'Pet Owner / Runner Personal Information':'Personal Information' }}</span>
                </h3>
                <p class="text-xs text-gray-500 ml-9">
                  {{ currentParticipant.run_category === '1K' ? 'Personal details of the pet owner / runner' : `Personal details for Runner #${activeParticipantIndex + 1}` }}
                </p>
              </div>

              <div class="">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">First Name
                      *</label>
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
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email Address
                    *</label>
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

                <!-- Locked +63 Contact Phone Number -->
                <div class="w-full">
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Contact Phone Number *
                  </label>
                  <div :class="[
                    'flex items-center rounded-xl border transition overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500',
                    props.darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                  ]">
                    <span :class="[
                      'flex items-center gap-1 px-3 py-2.5 text-xs font-bold border-r select-none shrink-0',
                      props.darkMode ? 'bg-gray-700/80 text-emerald-400 border-gray-600' : 'bg-slate-100 text-emerald-700 border-gray-300'
                    ]">
                      <span>🇵🇭 +63</span>
                    </span>
                    <input type="tel" :value="currentParticipant.contact_number"
                      @input="formatPhoneNumberInput($event, currentParticipant)" placeholder="917-123-4567"
                      maxlength="12" :class="[
                        'w-full px-3.5 py-2.5 text-sm font-semibold tracking-wide bg-transparent focus:outline-none',
                        props.darkMode ? 'text-gray-100 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                      ]" />
                  </div>
                  <p class="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <i class="fas fa-lock text-[9px] text-emerald-600"></i>
                    <span>Format: 9XX-XXX-XXXX (10 digits starting with 9)</span>
                  </p>
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
            <section v-if="currentParticipant.run_category" class="space-y-3">
              <div class="mb-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-bold flex items-center gap-2">
                    <span
                      class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
                    Size Selection
                  </h3>
                  <span
                    class="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    <span v-if="currentParticipant.run_category === '20KM'" class="font-black">2 Shirts</span>
                    <span v-else class="font-black">1 Shirt</span>
                  </span>
                </div>
                <p class="text-xs text-gray-500 ml-9">
                  <span v-if="currentParticipant.run_category === '20KM'">Select your Race Shirt (Singlet or Event
                    Shirt) and
                    Finisher Shirt sizes</span>
                  <span v-else>Choose your shirt type and size</span>
                </p>
              </div>

              <!-- ── 1. Race Shirt Choice (Singlet or Event Shirt) + Size ── -->
              <div :class="[
                'flex flex-wrap items-center gap-3 p-3 rounded-2xl border',
                props.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'
              ]">
                <!-- Shirt type toggle -->
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button"
                    @click="currentParticipant.shirt_type = 'singlet'; currentParticipant.selected_shirt_tab = 'singlet'; currentParticipant.tshirt_size = buildShirtSizeSummary(currentParticipant)"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-150',
                      currentParticipant.shirt_type === 'singlet'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : props.darkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-slate-100',
                    ]">
                    <i class="fas fa-tshirt text-[11px]"></i> Singlet
                  </button>
                  <button type="button"
                    @click="currentParticipant.shirt_type = 'event_shirt'; currentParticipant.selected_shirt_tab = 'event_shirt'; currentParticipant.tshirt_size = buildShirtSizeSummary(currentParticipant)"
                    :class="[
                      'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-150',
                      currentParticipant.shirt_type === 'event_shirt'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : props.darkMode
                          ? 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-slate-100',
                    ]">
                    <i class="fas fa-shirt text-[11px]"></i> Event Shirt
                  </button>
                </div>

                <!-- Divider -->
                <div :class="['w-px h-6 shrink-0', props.darkMode ? 'bg-gray-600' : 'bg-slate-300']"></div>

                <!-- Size dropdown -->
                <div class="flex items-center gap-2 min-w-0">
                  <label class="text-xs font-semibold shrink-0"
                    :class="props.darkMode ? 'text-gray-400' : 'text-gray-500'">
                    {{ currentParticipant.shirt_type === 'singlet' ? 'Singlet Size' : 'Event Shirt Size' }}
                  </label>
                  <select
                    :value="currentParticipant.shirt_type === 'singlet' ? (currentParticipant.singlet_size || 'M') : (currentParticipant.event_shirt_size || 'M')"
                    @change="(e) => {
                      if (currentParticipant.shirt_type === 'singlet') {
                        currentParticipant.singlet_size = e.target.value;
                      } else {
                        currentParticipant.event_shirt_size = e.target.value;
                      }
                      currentParticipant.tshirt_size = buildShirtSizeSummary(currentParticipant);
                    }" :class="[
                      'px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer',
                      props.darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800'
                    ]">
                    <option v-for="size in tshirtSizes" :key="size" :value="size">{{ size }}</option>
                  </select>
                </div>

                <!-- Summary badge -->
                <span
                  class="ml-auto text-[11px] font-black px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                  {{ currentParticipant.shirt_type === 'singlet' ? 'Singlet' : 'Event Shirt' }} · {{
                    currentParticipant.shirt_type === 'singlet' ? (currentParticipant.singlet_size || 'M') :
                      (currentParticipant.event_shirt_size || 'M')
                  }}
                </span>
              </div>

              <!-- ── 2. Finisher Shirt Selection (FOR 20KM ONLY) ── -->
              <div v-if="currentParticipant.run_category === '20KM'" :class="[
                'flex flex-wrap items-center gap-3 p-3 rounded-2xl border',
                props.darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-slate-50 border-slate-200'
              ]">
                <div class="flex items-center gap-2">
                  <i class="fas fa-medal text-amber-500 text-sm shrink-0"></i>
                  <span class="text-xs font-bold text-gray-800 dark:text-gray-200">Finisher Shirt</span>
                </div>

                <div :class="['w-px h-6 shrink-0', props.darkMode ? 'bg-gray-600' : 'bg-slate-300']"></div>

                <div class="flex items-center gap-2">
                  <label class="text-xs font-semibold shrink-0"
                    :class="props.darkMode ? 'text-gray-400' : 'text-gray-500'">Finisher
                    Size</label>
                  <select v-model="currentParticipant.finisher_shirt_size"
                    @change="currentParticipant.tshirt_size = buildShirtSizeSummary(currentParticipant)" :class="[
                      'px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer',
                      props.darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800'
                    ]">
                    <option v-for="size in tshirtSizes" :key="'fn-' + size" :value="size">{{ size }}</option>
                  </select>
                </div>

                <span
                  class="ml-auto text-[11px] font-black px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 shrink-0">
                  Finisher Shirt · {{ currentParticipant.finisher_shirt_size || 'M' }}
                </span>
              </div>
            </section>

            <!-- SECTION 5: CLASSIFICATION & PAYMENT OPTION (COMBINED & MINIMAL) -->
            <section v-if="currentParticipant.run_category" class="space-y-4">
              <!-- Section Header -->
              <div class="mb-2">
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <h3 class="text-base sm:text-lg font-bold flex items-center gap-2">
                    <span
                      class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">5</span>
                    <span>Classification & Payment Option</span>
                  </h3>
                  <span
                    class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40">
                    {{ isPetCategory(currentParticipant.run_category) ? 'Pet Run Direct Payment' : (currentParticipant.participantGroup === 'LSU' ? (currentParticipant.participant_type || 'LSU Exclusive') : 'Open Category') }} • {{ paymentMethodLabel }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 ml-9 mt-0.5">
                  Select participant category to configure available payment options
                </p>
              </div>

              <!-- FOR HUMAN RUN CATEGORIES (3KM, 10KM, 20KM) -->
              <div v-if="!isPetCategory(currentParticipant.run_category)" class="space-y-4">

                <!-- PRIMARY 2 CATEGORY CARDS (LSU EXCLUSIVE vs OPEN CATEGORY) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <!-- OPTION 1: LSU EXCLUSIVE -->
                  <div @click="selectParticipantGroup(currentParticipant, 'LSU')" :class="[
                    'rounded-2xl border-2 p-3 sm:p-3.5 cursor-pointer transition-all duration-200 text-left relative flex items-center justify-between gap-3',
                    currentParticipant.participantGroup === 'LSU'
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xs'
                      : props.darkMode
                        ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                  ]">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-base font-bold shrink-0">
                        <i class="fas fa-university"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">
                            LSU Exclusive
                          </h4>
                          <span
                            class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                            Students · Staff · Alumni
                          </span>
                        </div>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          Enrolled students, university employees, and alumni
                        </p>
                      </div>
                    </div>
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      currentParticipant.participantGroup === 'LSU'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-gray-300 dark:border-gray-600'
                    ]">
                      <div v-if="currentParticipant.participantGroup === 'LSU'" class="w-2 h-2 rounded-full bg-white">
                      </div>
                    </div>
                  </div>

                  <!-- OPTION 2: OPEN CATEGORY -->
                  <div @click="selectParticipantGroup(currentParticipant, 'Open')" :class="[
                    'rounded-2xl border-2 p-3 sm:p-3.5 cursor-pointer transition-all duration-200 text-left relative flex items-center justify-between gap-3',
                    currentParticipant.participantGroup === 'Open'
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-xs'
                      : props.darkMode
                        ? 'border-gray-700 bg-gray-800/40 hover:border-gray-600 hover:bg-gray-800'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50'
                  ]">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div
                        class="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center text-base font-bold shrink-0">
                        <i class="fas fa-globe-asia"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <h4 class="font-bold text-sm text-gray-900 dark:text-gray-100">
                            Open Category
                          </h4>
                          <span
                            class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            General Public
                          </span>
                        </div>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          Public runners, running clubs, and visiting enthusiasts
                        </p>
                      </div>
                    </div>
                    <div :class="[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      currentParticipant.participantGroup === 'Open'
                        ? 'border-emerald-600 bg-emerald-600'
                        : 'border-gray-300 dark:border-gray-600'
                    ]">
                      <div v-if="currentParticipant.participantGroup === 'Open'" class="w-2 h-2 rounded-full bg-white">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- INTEGRATED LSU EXCLUSIVE AFFILIATION & PAYMENT FORM -->
                <div v-if="currentParticipant.participantGroup === 'LSU'"
                  class="p-3.5 sm:p-4 rounded-2xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/60 space-y-4 transition-all duration-300">
                  <!-- 3-Button Segmented Affiliation Selector -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label
                        class="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                        <i class="fas fa-list-check"></i>
                        <span>Select Your LSU Affiliation:</span>
                      </label>
                      <span class="text-[11px] text-gray-500 dark:text-gray-400">Choose one</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <!-- 1. Students Button -->
                      <button type="button" @click="currentParticipant.participant_type = 'Currently Enrolled Students'"
                        :class="[
                          'px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
                          currentParticipant.participant_type === 'Currently Enrolled Students'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500'
                            : props.darkMode
                              ? 'bg-gray-800/90 text-gray-300 border-gray-700 hover:bg-gray-700'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                        ]">
                        <i class="fas fa-user-graduate text-sm"></i>
                        <span>Enrolled Students</span>
                      </button>

                      <!-- 2. Employees Button -->
                      <button type="button" @click="currentParticipant.participant_type = 'Employees'" :class="[
                        'px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
                        currentParticipant.participant_type === 'Employees'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500'
                          : props.darkMode
                            ? 'bg-gray-800/90 text-gray-300 border-gray-700 hover:bg-gray-700'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                      ]">
                        <i class="fas fa-briefcase text-sm"></i>
                        <span>Employees</span>
                      </button>

                      <!-- 3. Alumni Button -->
                      <button type="button" @click="currentParticipant.participant_type = 'Alumni'" :class="[
                        'px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer',
                        currentParticipant.participant_type === 'Alumni'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500'
                          : props.darkMode
                            ? 'bg-gray-800/90 text-gray-300 border-gray-700 hover:bg-gray-700'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                      ]">
                        <i class="fas fa-graduation-cap text-sm"></i>
                        <span>LSU / ICC Alumni</span>
                      </button>
                    </div>
                  </div>

                  <!-- 1. Enrolled Students Form + Integrated Add-to-Tuition Payment -->
                  <div v-if="currentParticipant.participant_type === 'Currently Enrolled Students'"
                    class="pt-3 border-t border-emerald-200/80 dark:border-gray-700 space-y-3">
                    <div
                      class="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                      <div class="flex items-center gap-2 font-bold">
                        <i class="fas fa-file-invoice-dollar text-blue-600"></i>
                        <span>Payment Method: Add to Tuition</span>
                      </div>
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">LSU
                        Student Account</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Course /
                          Program *</label>
                        <select v-model="currentParticipant.college_course" :class="[
                          'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
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
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Year / Grade
                          Level
                          *</label>
                        <select v-model="currentParticipant.college_year" :class="[
                          'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
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

                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">LSU Student ID
                          Number
                          *</label>
                        <div class="relative">
                          <span class="absolute left-3 top-2.5 text-xs text-gray-400">
                            <i class="fas fa-id-card"></i>
                          </span>
                          <input type="text" v-model="currentParticipant.lsu_id_number" placeholder="e.g. 240945593"
                            :class="[
                              'w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none',
                              props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                            ]" />
                        </div>
                      </div>
                    </div>

                    <!-- Running Club / Organization (Students) -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Running Club / Organization <span class="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input type="text" v-model="currentParticipant.organization"
                        placeholder="e.g. Ozamiz Lifestyle Runners Club" :class="[
                          'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                          props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                        ]" />
                    </div>
                  </div>

                  <!-- 2. Employees Form + Integrated Salary Deduction Payment -->
                  <div v-if="currentParticipant.participant_type === 'Employees'"
                    class="pt-3 border-t border-emerald-200/80 dark:border-gray-700 space-y-3">
                    <div
                      class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                      <div class="flex items-center gap-2 font-bold">
                        <i class="fas fa-money-check-alt text-emerald-600"></i>
                        <span>Payment Method: Payroll Salary Deduction</span>
                      </div>
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">Employee
                        Payroll</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Office /
                          Department
                          *</label>
                        <select v-model="currentParticipant.partner_office" :class="[
                          'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                          props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                        ]">
                          <option value="">Select Office / Department</option>
                          <option value="Office of the Chancellor">Office of the Chancellor</option>
                          <option value="College of Computer Studies">College of Computer Studies</option>
                          <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                          <option value="College of Business and Accountancy">College of Business and Accountancy
                          </option>
                          <option value="College of Education">College of Education</option>
                          <option value="College of Nursing">College of Nursing</option>
                          <option value="College of Law">College of Law</option>
                          <option value="General Services Office">General Services Office</option>
                          <option value="University Registrar">University Registrar</option>
                          <option value="Human Resource Center">Human Resource Center</option>
                          <option value="Accounting Office">Accounting Office</option>
                        </select>
                      </div>

                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">LSU Employee ID
                          Number
                          *</label>
                        <div class="relative">
                          <span class="absolute left-3 top-2.5 text-xs text-gray-400">
                            <i class="fas fa-address-card"></i>
                          </span>
                          <input type="text" v-model="currentParticipant.lsu_id_number" placeholder="e.g. LSU210201"
                            :class="[
                              'w-full pl-8 pr-3 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                              props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-800',
                            ]" />
                        </div>
                      </div>
                    </div>

                    <!-- Running Club / Organization (Employees) -->
                    <div>
                      <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Running Club / Organization <span class="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input type="text" v-model="currentParticipant.organization"
                        placeholder="e.g. Ozamiz Lifestyle Runners Club" :class="[
                          'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                          props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                        ]" />
                    </div>
                  </div>

                  <!-- 3. Alumni Form + Integrated Direct Payment -->
                  <div v-if="currentParticipant.participant_type === 'Alumni'"
                    class="pt-3 border-t border-emerald-200/80 dark:border-gray-700 space-y-3">
                    <div
                      class="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-800 dark:text-purple-300">
                      <div class="flex items-center gap-2 font-bold">
                        <i class="fas fa-wallet text-purple-600"></i>
                        <span>Payment Method: Direct Payment (QR / OTC / Cash)</span>
                      </div>
                      <span
                        class="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">Alumni
                        Direct</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Batch /
                          Graduation
                          Year</label>
                        <input type="text" v-model="currentParticipant.alumni_batch"
                          placeholder="e.g. Batch 2024 / 2023" :class="[
                            'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                            props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                          ]" />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Running Club / Organization <span class="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input type="text" v-model="currentParticipant.organization"
                          placeholder="e.g. Ozamiz Lifestyle Runners Club" :class="[
                            'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                            props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                          ]" />
                      </div>
                    </div>

                    <!-- Alumni ID Upload: Front Only (Up to 5MB) -->
                    <div>
                      <div class="flex items-center justify-between gap-1.5 mb-1.5">
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <i class="fas fa-id-card text-emerald-600"></i>
                          <span>Alumni ID — Front <span class="text-rose-500">*</span></span>
                        </label>
                        <span class="text-[10px] text-gray-500 dark:text-gray-400">Within 1 year of issue or fresh grad
                          • Max 5
                          MB</span>
                      </div>

                      <div class="max-w-md">
                        <p
                          class="text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-between">
                          <span><i class="fas fa-id-badge text-[10px] text-emerald-600 mr-0.5"></i> Front Side</span>
                          <span v-if="currentParticipant.alumni_id_front_preview"
                            class="text-emerald-600 dark:text-emerald-400 font-semibold">
                            <i class="fas fa-check-circle text-[9px]"></i> Uploaded
                          </span>
                        </p>
                        <label :for="'alumni_front_' + activeParticipantIndex" :class="[
                          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden group',
                          currentParticipant.alumni_id_front_preview ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 h-28' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500 h-20',
                          props.darkMode ? 'bg-gray-800/40 hover:bg-gray-800' : 'bg-white hover:bg-emerald-50/30',
                        ]">
                          <input :id="'alumni_front_' + activeParticipantIndex" type="file" accept="image/*,.pdf"
                            class="sr-only" @change="handleAlumniIdUpload($event, currentParticipant, 'front')" />
                          <template v-if="currentParticipant.alumni_id_front_preview">
                            <img :src="currentParticipant.alumni_id_front_preview"
                              class="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80 group-hover:opacity-60 transition"
                              alt="Alumni ID Front" />
                            <div
                              class="absolute inset-0 flex flex-col items-center justify-end pb-1.5 bg-gradient-to-t from-black/50 to-transparent">
                              <button type="button" @click.prevent="removeAlumniId(currentParticipant, 'front')"
                                class="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shadow z-10">
                                <i class="fas fa-trash-alt"></i> Remove
                              </button>
                            </div>
                          </template>
                          <template v-else>
                            <div class="flex flex-col items-center gap-0.5 py-2 px-2 text-center pointer-events-none">
                              <i
                                class="fas fa-cloud-upload-alt text-lg text-gray-400 group-hover:text-emerald-500 transition"></i>
                              <span class="text-xs font-bold text-gray-600 dark:text-gray-300">Upload Front of Alumni
                                ID</span>
                              <span class="text-[10px] text-gray-400">JPG, PNG, PDF up to 5MB</span>
                            </div>
                          </template>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- INTEGRATED OPEN CATEGORY DETAILS & PAYMENT FORM -->
                <div v-if="currentParticipant.participantGroup === 'Open'"
                  class="p-3.5 sm:p-4 rounded-2xl border bg-slate-50 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 space-y-3 transition-all duration-300">
                  <div
                    class="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-gray-700">
                    <span
                      class="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <i class="fas fa-running text-teal-600"></i>
                      <span>Open Category Details</span>
                    </span>
                    <span
                      class="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                      Direct Payment (QR / OTC / Cash)
                    </span>
                  </div>

                  <div class="max-w-md">
                    <label class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Organization / Running Club / Company <span class="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input type="text" v-model="currentParticipant.organization"
                      placeholder="e.g. Ozamiz Lifestyle Runners Club" :class="[
                        'w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none',
                        props.darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800',
                      ]" />
                  </div>
                </div>

                <!-- DIRECT PAYMENT METHODS & RECEIPT UPLOAD (For Open Category & Alumni) -->
                <div v-if="paymentType === 'non_lsu_payment'"
                  class="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-emerald-200 dark:border-gray-700 space-y-4">
                  <div class="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Select Non-LSU Payment Method:
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <!-- QR Payment -->
                    <div @click="nonLsuPaymentMethod = 'qr_payment'" :class="[
                      'p-3 rounded-xl border cursor-pointer transition text-xs font-semibold',
                      nonLsuPaymentMethod === 'qr_payment'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-qrcode text-emerald-600 text-base shrink-0"></i>
                        <div>
                          <div class="font-bold text-xs">QR Payment: GCash / Maya</div>
                        
                          <div>
                            Pay <strong>PHP {{ grandTotal.toLocaleString() }}</strong> via QR and upload your transfer
                        receipt
                        screenshot below.
                          </div>
                        </div>
                      </div>

                    </div>

                    <!-- Accounting Over The Counter -->
                    <div @click="nonLsuPaymentMethod = 'accounting_otc'" :class="[
                      'p-3 rounded-xl border cursor-pointer transition text-xs font-semibold',
                      nonLsuPaymentMethod === 'accounting_otc'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-university text-emerald-600 text-base shrink-0"></i>
                        <div>
                          <div class="font-bold text-xs">Accounting OTC: LSU Accounting Window</div>
                      
                          <div>
                             Visit LSU Accounting Window (Mon-Fri, 8AM-5PM). 
                          </div>
                        </div>
                      </div>

                    
                    </div>

                    <!-- Weekend Cash -->
                    <div @click="nonLsuPaymentMethod = 'weekend_cash'" :class="[
                      'p-3 rounded-xl border cursor-pointer transition text-xs font-semibold',
                      nonLsuPaymentMethod === 'weekend_cash'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-running text-emerald-600 text-base shrink-0"></i>
                        <div>
                          <div class="font-bold text-xs">Weekend Cash : Lifestyle Runners</div>
                        
                          <div>
                             Pay at Ozamiz Lifestyle Runners weekend booth. 
                          </div>
                        </div>
                      </div>

                  
                    </div>
                  </div>

                  <!-- RECEIPT DROPZONE (Only for QR Payment) -->
                  <div v-if="nonLsuPaymentMethod === 'qr_payment'" class="pt-2">
                    <div :class="[
                      'rounded-2xl border-2 border-dashed p-3 text-center transition-all relative overflow-hidden',
                      receiptPreview
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : props.darkMode
                          ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                          : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
                    ]">
                      <div v-if="!receiptPreview">
                        <i class="fas fa-cloud-upload-alt text-2xl text-emerald-500 mb-1"></i>
                        <p class="text-xs font-bold mb-0.5">Upload Receipt or Deposit Transfer Screenshot *</p>
                        <p class="text-[10px] text-gray-400 mb-2">PNG, JPG, or PDF up to 1MB</p>
                        <label
                          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md transition">
                          <i class="fas fa-upload text-xs"></i> Browse Receipt File
                          <input type="file" accept="image/*,.pdf" class="hidden" @change="handleReceiptUpload" />
                        </label>
                      </div>

                      <div v-else class="relative group max-w-xs mx-auto">
                        <img :src="receiptPreview" alt="Receipt Preview"
                          class="h-32 w-full object-cover rounded-xl border shadow-sm" />
                        <div class="mt-2 flex items-center justify-between text-xs">
                          <span
                            class="truncate max-w-[160px] font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">
                            <i class="fas fa-check-circle"></i> {{ receiptFile?.name || 'Payment Receipt' }}
                          </span>
                          <button type="button" @click="removeReceipt"
                            class="px-2 py-0.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600 transition cursor-pointer">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TEXT INSTRUCTION (For Accounting OTC & Weekend Cash) -->
                  <div v-else
                    class="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div class="font-bold flex items-center gap-1.5">
                      <i class="fas fa-clock text-amber-600"></i> Payment Instruction
                    </div>
                    <p class="text-[11px] leading-relaxed">
                      <span v-if="nonLsuPaymentMethod === 'accounting_otc'">
                        Please proceed to the LSU Accounting window to settle your fee of <strong>PHP {{
                          grandTotal.toLocaleString()
                          }}</strong>.
                      </span>
                      <span v-else>
                        Please proceed to the Ozamiz Lifestyle Runners weekend booth to settle your fee of <strong>PHP
                          {{
                          grandTotal.toLocaleString() }}</strong>.
                      </span>
                      <strong class="text-amber-700 dark:text-amber-300 block mt-0.5">Please wait for the confirmation
                        to be paid
                        and confirmed by the admin.</strong>
                    </p>
                  </div>
                </div>

              </div>

              <!-- FOR PET RUN RUNNERS (1KM PET RUN DIRECT PAYMENT) -->
              <div v-else class="space-y-4">
                <div
                  class="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-emerald-200 dark:border-gray-700 space-y-4">
                  <div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <span
                      class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <i class="fas fa-paw text-emerald-600"></i>
                      <span>1 KM Direct Payment</span>
                    </span>
                    <span
                      class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      QR / OTC / Cash
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <!-- QR Payment -->
                    <div @click="nonLsuPaymentMethod = 'qr_payment'" :class="[
                      'p-3 rounded-xl border cursor-pointer transition text-xs font-semibold',
                      nonLsuPaymentMethod === 'qr_payment'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-qrcode text-emerald-600 text-base shrink-0"></i>
                        <div>
                          <div class="font-bold text-xs">QR Payment</div>
                          <div class="text-[10px] font-normal text-gray-500">GCash / Maya</div>
                        </div>
                      </div>
                    </div>

                    <!-- Accounting OTC -->
                    <div @click="nonLsuPaymentMethod = 'accounting_otc'" :class="[
                      'p-3 rounded-xl border cursor-pointer transition text-xs font-semibold',
                      nonLsuPaymentMethod === 'accounting_otc'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-university text-emerald-600 text-base shrink-0"></i>
                        <div>
                          <div class="font-bold text-xs">Accounting OTC</div>
                          <div class="text-[10px] font-normal text-gray-500">LSU Accounting</div>
                        </div>
                      </div>
                    </div>

                    <!-- Weekend Cash -->
                    <div @click="nonLsuPaymentMethod = 'weekend_cash'" :class="[
                      'p-3 rounded-xl border cursor-pointer transition text-xs font-semibold',
                      nonLsuPaymentMethod === 'weekend_cash'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                    ]">
                      <div class="flex items-center gap-2">
                        <i class="fas fa-running text-emerald-600 text-base shrink-0"></i>
                        <div>
                          <div class="font-bold text-xs">Weekend Cash</div>
                          <div class="text-[10px] font-normal text-gray-500">Lifestyle Runners</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- RECEIPT DROPZONE (Only for QR Payment) -->
                  <div v-if="nonLsuPaymentMethod === 'qr_payment'" class="pt-2">
                    <div :class="[
                      'rounded-2xl border-2 border-dashed p-3 text-center transition-all relative overflow-hidden',
                      receiptPreview
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                        : props.darkMode
                          ? 'border-gray-700 bg-gray-900/40 hover:border-emerald-500'
                          : 'border-slate-300 bg-slate-50 hover:border-emerald-400',
                    ]">
                      <div v-if="!receiptPreview">
                        <i class="fas fa-cloud-upload-alt text-2xl text-emerald-500 mb-1"></i>
                        <p class="text-xs font-bold mb-0.5">Upload Receipt or Deposit Transfer Screenshot *</p>
                        <p class="text-[10px] text-gray-400 mb-2">PNG, JPG, or PDF up to 1MB</p>
                        <label
                          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md transition">
                          <i class="fas fa-upload text-xs"></i> Browse Receipt File
                          <input type="file" accept="image/*,.pdf" class="hidden" @change="handleReceiptUpload" />
                        </label>
                      </div>

                      <div v-else class="relative group max-w-xs mx-auto">
                        <img :src="receiptPreview" alt="Receipt Preview"
                          class="h-32 w-full object-cover rounded-xl border shadow-sm" />
                        <div class="mt-2 flex items-center justify-between text-xs">
                          <span
                            class="truncate max-w-[160px] font-medium text-emerald-600 dark:text-emerald-400 text-[11px]">
                            <i class="fas fa-check-circle"></i> {{ receiptFile?.name || 'Payment Receipt' }}
                          </span>
                          <button type="button" @click="removeReceipt"
                            class="px-2 py-0.5 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600 transition cursor-pointer">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- TEXT INSTRUCTION (For Accounting OTC & Weekend Cash) -->
                  <div v-else
                    class="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div class="font-bold flex items-center gap-1.5">
                      <i class="fas fa-clock text-amber-600"></i> Payment Instruction
                    </div>
                    <p class="text-[11px] leading-relaxed">
                      <span v-if="nonLsuPaymentMethod === 'accounting_otc'">
                        Please proceed to the LSU Accounting window to settle your fee of <strong>PHP {{
                          grandTotal.toLocaleString()
                          }}</strong>.
                      </span>
                      <span v-else>
                        Please proceed to the Ozamiz Lifestyle Runners weekend booth to settle your fee of <strong>PHP
                          {{
                          grandTotal.toLocaleString() }}</strong>.
                      </span>
                      <strong class="text-amber-700 dark:text-amber-300 block mt-0.5">Please wait for the confirmation
                        to be paid
                        and confirmed by the admin.</strong>
                    </p>
                  </div>
                </div>
              </div>

              <!-- CHECKOUT SUMMARY & SUBMIT BUTTON -->
              <div :class="[
                'rounded-2xl p-4 sm:p-5 border shadow-md transition-all mt-4',
                props.darkMode
                  ? 'bg-gray-900/90 border-gray-700'
                  : 'bg-gradient-to-br from-slate-50 to-emerald-50/50 border-emerald-200',
              ]">
                <div class="flex items-center justify-between text-base sm:text-lg font-black mb-4">
                  <span class="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <i class="fas fa-receipt text-emerald-600"></i> Grand Total Fee
                  </span>
                  <span class="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    PHP {{ grandTotal.toLocaleString() }}
                  </span>
                </div>

                <button type="button" @click="submitRegistration" :disabled="isSubmitting"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 lg:text-base text-sm cursor-pointer">
                  <i v-if="!isSubmitting" class="fas fa-check-circle text-lg"></i>
                  <i v-else class="fas fa-spinner fa-spin text-lg"></i>
                  <span>{{ isSubmitting ? 'Submitting Registration...' : 'Submit Registration (PHP ' +
                    grandTotal.toLocaleString() + ')' }}</span>
                </button>
              </div>
            </section>

          </div><!-- end actual form content -->
        </div><!-- end flex row -->
      </div>
    </div>
























<!-- SUCCESS CONFIRMATION MODAL -->
<div
v-if="isSuccessModalOpen"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto"
>
  <div
    :class="[
      'w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border text-center',
      props.darkMode
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-slate-200 text-gray-800'
    ]"
  >
    <!-- Success Icon -->
    <div
      class="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400 shadow-inner"
    >
      <i class="fas fa-check text-2xl sm:text-3xl"></i>
    </div>

    <!-- Title -->
    <h2 class="text-xl sm:text-2xl font-black tracking-tight">
      Registration Sent!
    </h2>

    <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
      Thank you{{ participants[0]?.firstname ? `, ${participants[0].firstname}` : '' }}!
    </p>

    <!-- Short Message -->
    <div
      class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"
    >
      <div class="flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
        <i class="fas fa-envelope-circle-check"></i>
        <span>Check your email for the details.</span>
      </div>

      <p class="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
        Your registration summary and payment details have been sent to
        <strong class="text-emerald-700 dark:text-emerald-300">
          {{ participants[0]?.contact_email || user?.email }}
        </strong>.
      </p>
    </div>

    <!-- Follow Socials -->
    <div
      class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-900/50"
    >
      <p class="text-sm font-bold text-gray-800 dark:text-white">
        <i class="fas fa-bell text-emerald-600 mr-1"></i>
        Follow our socials for more info
      </p>

      <div class="mt-3 flex flex-col gap-2 text-xs font-semibold">
        <a
          href="https://www.facebook.com/lsuanimorun"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-300"
        >
          <i class="fab fa-facebook"></i>
          LSU Animo Run
        </a>

        <a
          href="https://animorun.lsu.edu.ph"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-emerald-700 shadow-sm transition hover:bg-emerald-50 dark:bg-gray-800 dark:text-emerald-300"
        >
          <i class="fas fa-globe"></i>
          animorun.lsu.edu.ph
        </a>
      </div>
    </div>

    <!-- Verification Note -->
 <p class="mt-4 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
      Once your payment is verified, you’ll receive your
      <strong class="text-gray-700 dark:text-gray-200">
        Official Confirmation Email.
      </strong>
    </p>
    <p class="text-xs">Thank you!</p>

    <!-- Done -->
    <button
      type="button"
      @click="resetForm"
      class="mt-5 w-full rounded-2xl bg-emerald-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-[0.98]"
    >
      <i class="fas fa-check mr-1.5"></i>
      Done
    </button>
  </div>
</div>
































    <!-- TOAST / VALIDATION NOTIFICATION MODAL (REPLACES BROWSER ALERT) -->
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
                : 'fas fa-exclamation-triangle'
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
              : toastModal.type === 'success'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
          ]">
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
  border-color: #02857D !important;
}
</style>
