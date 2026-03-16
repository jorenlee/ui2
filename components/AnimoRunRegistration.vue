<script setup>
import { ref, computed, watch } from "vue";

const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const number_of_participants_per_group = ref(1);
const form_type = ref("Individual");

watch(
  form_type,
  (newValue) => {
    if (newValue === "Individual") {
      number_of_participants_per_group.value = 1;
    }
  },
  { immediate: true }
);
const form = ref({
  run_category: "",

  firstname: "",
  middlename: "",
  lastname: "",
  birthdate: "",

  contact_number: "",
  contact_address: "",
  contact_email: "",

  gender: "",

  participant_type: "",

  beu_grade: "",

  college_course: "",
  college_year: "",

  partner_office: "",

  alumni_batch: "",

  organization: "",
});

const validIdFront = ref(null);
const validIdBack = ref(null);

const runFees = {
  "3K": 300,
  "5K": 500,
  "10K": 800,
  "21K": 1200,
};

const detailFees = computed(() => {
  if (!form.value.run_category) return [];
  return [
    {
      fee_name: `${form.value.run_category} Registration`,
      amount: runFees[form.value.run_category],
    },
  ];
});

const grandTotal = computed(() => {
  if (!detailFees.value.length) return 0;
  return detailFees.value.reduce((a, b) => a + b.amount, 0);
});

const redirectStripe = async () => {
  alert("Stripe Checkout will open here.");
};
</script>

<template>
  <div class="">
    <div class="my-10 w-11/12 mx-auto bg-white shadow-2xl rounded-2xl">
      <!-- HEADER -->
      <div class="p-8 text-center shadow mb-2">
        <!-- Logo -->
        <div class="mx-auto w-24 sm:w-32 mb-4">
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/lsu-corporate-logo-green.png"
            alt="LSU Logo"
            class="w-full h-auto"
          />
        </div>

        <!-- Title -->
        <h1
          class="text-3xl sm:text-4xl font-extrabold text-green-700 mb-2 flex items-center justify-center gap-2"
        >
          🏃 Animo Run Registration
        </h1>

        <!-- Subtitle -->
        <p class="text-gray-600 text-xs capitalize">
          Fill out Registration Form
        </p>
      </div>

      <div class="flex items-center w-full p-5 bg-white shadow-md">
        <h2 class="text-2xl font-semibold text-green-800 whitespace-nowrap text-center pr-10">
          Select as
        </h2>

        <!-- Radio Options -->
        <div class="gap-4 w-full">
          <div class="lg:flex gap-x-5">
            <label
              class="flex w-full border rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <div class="flex items-center gap-3 p-4">
                <input
                  type="radio"
                  name="form_type"
                  value="Individual"
                  v-model="form_type"
                  class="w-5 h-5 accent-indigo-600"
                />
                <span class="text-gray-700 font-medium">Individual</span>
              </div>
            </label>

            <label
              class="flex w-full border rounded-lg cursor-pointer hover:bg-gray-50 transition"
            >
              <div class="flex items-center gap-3 p-4">
                <input
                  type="radio"
                  name="form_type"
                  value="Group"
                  v-model="form_type"
                  class="w-5 h-5 accent-indigo-600"
                />
                <span class="text-gray-700 font-medium">Group</span>
              </div>

              <div class="flex items-center w-full">
                <div
                  v-if="form_type === 'Group'"
                  class="flex items-center w-fit mx-auto"
                >
                  <label class="block text-sm text-gray-600 mr-3">
                    Participants:
                  </label>

                  <input
                    type="number"
                    min="1"
                    v-model="number_of_participants_per_group"
                    placeholder="0"
                    class="mt-1 w-20 text-center border rounded-lg px-1 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </label>
          </div>

          <!-- <div class="w-full flex justify-center my-5">
      
            <button
              @click="generateForms"
              class="w-fit mx-auto px-5 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
            >
              <i class="fa fa-list mr-3"></i> Generate Fillout Form
            </button>
          </div> -->
        </div>
      </div>

      <div class="p-5">
        <div v-for="i in number_of_participants_per_group" class="shadow-lg px-5 pt-5 pb-5 border-y-4 border-green-700">
          <div v-if="form_type === 'Group'">
            <p class="text-center flex font-bold w-full justify-center">
              Form #{{ i }}
            </p>
          </div>
          <!-- RUN CATEGORY -->
          <div class="mb-12">
            <h2 class="section-title mt-2">Run Category</h2>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="category in ['3K', '5K', '10K', '21K']"
                :key="category"
                class="category-card"
              >
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    :value="category"
                    v-model="form.run_category"
                    class="accent-green-600"
                  />

                  <span class="font-semibold text-gray-800">
                    {{ category }}
                  </span>
                </label>

                <div
                  class="mt-3 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-sm"
                >
                  Banner
                </div>
              </div>
            </div>
          </div>

          <!-- PARTICIPANT TYPE -->
          <div class="mb-12">
            <h2 class="section-title">Participant Classification</h2>

            <div class="space-y-6">
              <!-- HEU -->
              <div class="card flex">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="LSU Higher Education Unit Student"
                    v-model="form.participant_type"
                  />

                  <span> LSU Higher Education Unit Student </span>
                </label>

                <div class="grid md:grid-cols-2 gap-4 mt-4 ml-6">
                  <div>
                    <label class="label">Course</label>
                    <select v-model="form.college_course" class="input">
                      <option value="">Select Course</option>
                      <option>BSIT</option>
                      <option>BSCS</option>
                      <option>BSEd</option>
                    </select>
                  </div>

                  <div>
                    <label class="label">Year Level</label>
                    <select v-model="form.college_year" class="input">
                      <option value="">Select Year</option>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                      <option>5th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- BEU -->
              <div class="card flex">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="LSU Basic Education Unit Student"
                    v-model="form.participant_type"
                  />

                  <span> LSU Basic Education Unit Student </span>
                </label>

                <div class="mt-4 ml-6">
                  <label class="label">Grade Level</label>

                  <select v-model="form.beu_grade" class="input">
                    <option value="">Select Grade</option>
                    <option>Pre-School</option>
                    <option>Kinder 1</option>
                    <option>Kinder 2</option>
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                    <option>Grade 7 JHS</option>
                    <option>Grade 8 JHS</option>
                    <option>Grade 9 JHS</option>
                    <option>Grade 10 JHS</option>
                    <option>Grade 11 SHS</option>
                    <option>Grade 12 SHS</option>
                  </select>
                </div>
              </div>

              <!-- PARTNERS -->
              <div class="card flex">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="Lasallian Partners"
                    v-model="form.participant_type"
                  />

                  <span> Lasallian Partners </span>
                </label>

                <div class="mt-4 ml-6">
                  <label class="label"> Center / Office </label>

                  <select v-model="form.partner_office" class="input">
                    <option value="">Select Office</option>
                    <option>Center Office 1</option>
                    <option>Center Office 2</option>
                    <option>Center Office 3</option>
                  </select>
                </div>
              </div>

              <!-- ALUMNI -->
              <div class="card flex">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="Alumni"
                    v-model="form.participant_type"
                  />

                  <span> Alumni </span>
                </label>

                <div class="mt-4 ml-6">
                  <label class="label"> Batch Year </label>

                  <input
                    type="text"
                    v-model="form.alumni_batch"
                    class="input"
                    placeholder="Example: 2015"
                  />
                </div>
              </div>

              <!-- NON LSU -->
              <div class="card flex">
                <label class="radio-label">
                  <input
                    type="radio"
                    value="Non-LSU"
                    v-model="form.participant_type"
                  />

                  <span> Non-LSU </span>
                </label>

                <div class="mt-4 ml-6">
                  <label class="label"> Organization / Company </label>

                  <input
                    type="text"
                    v-model="form.organization"
                    class="input"
                    placeholder="Running Club"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- PERSONAL INFORMATION -->
          <div class="mb-12">
            <h2 class="section-title">Personal Information</h2>

            <div class="grid md:grid-cols-4 gap-4">
              <!-- First Name -->
              <div>
                <label class="label">First Name</label>
                <input
                  v-model="form.firstname"
                  class="input"
                  placeholder="Juan"
                />
              </div>

              <!-- Middle Name -->
              <div>
                <label class="label">Middle Name</label>
                <input
                  v-model="form.middlename"
                  class="input"
                  placeholder="Santos"
                />
              </div>

              <!-- Last Name -->
              <div>
                <label class="label">Last Name</label>
                <input
                  v-model="form.lastname"
                  class="input"
                  placeholder="Dela Cruz"
                />
              </div>

              <!-- Suffix -->
              <div>
                <label class="label">Suffix</label>

                <select v-model="form.suffix" class="input">
                  <option value="">None</option>
                  <option>Jr.</option>
                  <option>Sr.</option>
                  <option>II</option>
                  <option>III</option>
                  <option>IV</option>
                </select>
              </div>
            </div>

            <div class="flex">
              <!-- Date of Birth -->
              <div class="mt-6">
                <label class="label"> Date of Birth </label>

                <input type="date" v-model="form.birthdate" class="input" />
              </div>

              <!-- Gender -->
              <div class="mt-6">
                <label class="label mb-2 block"> Gender </label>

                <div class="flex gap-4">
                  <label class="gender-card">
                    <input type="radio" value="Male" v-model="form.gender" />
                    Male
                  </label>

                  <label class="gender-card">
                    <input type="radio" value="Female" v-model="form.gender" />
                    Female
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- CONTACT DETAILS -->
          <div class="mb-12">
            <h2 class="section-title">Contact Details</h2>

            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="label">Contact Number</label>
                <input v-model="form.contact_number" class="input" />
              </div>

              <div>
                <label class="label">Contact Email</label>
                <input v-model="form.contact_email" class="input" />
              </div>

              <div class="md:col-span-2">
                <label class="label">Contact Address</label>
                <input v-model="form.contact_address" class="input" />
              </div>
            </div>
          </div>

          <!-- VALID ID -->
          <div class="mb-12">
            <h2 class="section-title">Valid ID Upload</h2>

            <div class="grid md:grid-cols-2 gap-6">
              <div class="upload-box">
                <label>ID Front</label>

                <input
                  type="file"
                  @change="(e) => (validIdFront = e.target.files[0])"
                />
              </div>

              <div class="upload-box">
                <label>ID Back</label>

                <input
                  type="file"
                  @change="(e) => (validIdBack = e.target.files[0])"
                />
              </div>
            </div>
          </div>

          <div>
            Add-ons
          </div>

          <!-- PAYMENT SUMMARY -->

          <div class="payment-box">
            <h2 class="font-bold text-lg mb-4">Payment Summary</h2>

            <div
              v-for="(fee, i) in detailFees"
              :key="i"
              class="flex justify-between text-sm mb-2"
            >
              <span>
                {{ fee.fee_name }}
              </span>

              <span> ₱ {{ fee.amount }} </span>
            </div>

            <div class="border-t pt-4 mt-4 flex justify-between font-bold">
              <span>Total</span>

              <span> ₱ {{ grandTotal }} </span>
            </div>
          </div>

          <div class="">
            <div>
              <label class="text-lg font-semibold text-gray-800"
                >Payment Type</label
              >
            </div>
            <div class="flex gap-4">
              <div class="flex flex-col gap-3">
                <!-- Salary Deduction Option -->
                <label
                  class="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 transition"
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="salary_deduction"
                    v-model="paymentType"
                    class="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span class="text-gray-800 font-medium"
                    >Via Salary Deduction</span
                  >
                </label>
              </div>

              <div class="mt-4 flex flex-col gap-2">
                <label class="text-gray-800 font-semibold">
                 Wait For The Admin to Confirm , you will receive a 2 emails, submission email then completed registration.
                </label>
                
              </div>
            </div>

            <div class="flex">
              <div>
                <label
                  class="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-indigo-50 transition"
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="direct_payment"
                    v-model="paymentType"
                    class="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span class="text-gray-800 font-medium"
                    >Via Direct Payment</span
                  >
                </label>
              </div>

              <div class="flex-1 flex items-end">
                <button
                  @click="redirectStripe"
                  class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl text-lg font-semibold transition"
                >
                  Proceed to Payment (Stripe)
                </button>
              </div>
            </div>
          </div>

          <div class="block pt-10">
            <button
              class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  @apply text-xl font-bold text-gray-800 mb-4;
}

.input {
  @apply w-full border rounded-lg p-2 mt-1;
}

.label {
  @apply text-sm font-medium text-gray-700;
}

.card {
  @apply border rounded-xl p-5 hover:bg-green-50 transition;
}

.radio-label {
  @apply flex items-center gap-3 font-medium text-gray-800 cursor-pointer;
}

.gender-card {
  @apply border rounded-xl px-6 py-3 cursor-pointer hover:bg-green-50 flex items-center gap-2;
}

.category-card {
  @apply border rounded-xl p-4 hover:bg-green-50 transition cursor-pointer;
}

.upload-box {
  @apply border rounded-xl p-5 bg-gray-50;
}

.payment-box {
  @apply mt-12 border rounded-xl p-6 bg-gray-50;
}
</style>
