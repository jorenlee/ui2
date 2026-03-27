<script setup>
import { ref, nextTick } from "vue";

// Active step
const activeStep = ref(1);

// Step references (for scroll)
const stepRefs = ref({});

// Steps data
const steps = [
  { id: 1, title: "Admissions", icon: "fa-user" },
  { id: 2, title: "Advising", icon: "fa-users" },
  { id: 3.1, title: "Payment and Verification", icon: "fa-credit-card" },
  { id: 3.2, title: "Creation of Accounts", icon: "far fa-address-card" },
];

// Scroll + activate
const scrollToStep = async (id) => {
  activeStep.value = id;
  await nextTick();
  stepRefs.value[id]?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <Header />

    <!-- Breadcrumb -->
    <Breadcrumb
      :breadcrumbItems="[{ label: 'Enrollment', url: '/enrollment' }]"
    />

    <!-- Title -->
    <div class="text-center my-6">
      <h2 class="text-2xl lg:text-3xl font-bold text-green-900">
        Enrollment Steps
      </h2>
      <div class="w-16 h-1 bg-green-700 mx-auto mt-2 rounded-full"></div>
      <p class="text-green-800 mt-2 lg:text-sm text-xs px-5">
        Admissions and Scholarships Office, SJ Building Ground Floor LSU Campus.
        Office hours: Monday to Friday 8am to 5pm, Saturday 8am to 12nn
      </p>
    </div>

    <!-- MAIN CONTENT -->
    <div class="w-11/12 mx-auto mt-10 lg:flex gap-10">
      <!-- ✅ STEPPER -->
      <div class="lg:w-3/12">
        <div class="bg-white rounded-xl shadow-md p-6 sticky top-10">
          <div class="relative lg:w-full w-fit mx-auto">
            <!-- vertical line -->
            <div
              class="absolute left-[22px] top-2 bottom-2 w-[2px] bg-green-200"
            ></div>

            <div
              v-for="step in steps"
              :key="step.id"
              @click="scrollToStep(step.id)"
              class="flex items-center gap-4 mb-8 cursor-pointer group"
            >
              <!-- circle -->
              <div
                class="z-10 flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300 pt-1"
                :class="
                  activeStep === step.id
                    ? 'bg-green-700 border-green-700 text-white shadow-md scale-110'
                    : activeStep > step.id
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-green-300 text-green-700 group-hover:border-green-500'
                "
              >
                <i :class="['fa', step.icon]"></i>
              </div>

              <!-- text -->
              <div>
                <p class="text-[11px] text-gray-400 uppercase">
                  Step {{ step.id }}
                </p>
                <p
                  class="font-semibold text-sm"
                  :class="
                    activeStep === step.id
                      ? 'text-green-800'
                      : 'text-gray-500 group-hover:text-green-700'
                  "
                >
                  {{ step.title }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Realtime Class Schedule -->
        <div class="my-5 flex justify-center">
          <a
            href="https://my.lsu.edu.ph/class_offered_stat_open.jsp"
            class="flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-md text-green-800 font-semibold hover:bg-green-800 hover:text-white transition"
          >
            <i class="fa fa-list text-xl"></i>
            Realtime Class Schedule
          </a>
        </div>
      </div>

      <!-- ✅ CONTENT (ALL STEPS VISIBLE) -->
      <div class="w-full space-y-2">
        <!-- STEP 1 -->
        <div
          :ref="(el) => (stepRefs[1] = el)"
          class="bg-white rounded-xl shadow-md px-5 py-2 transition-all duration-300 border"
          :class="
            activeStep === 1
              ? 'border-green-700 scale-[1.02] shadow-lg ring-2 ring-green-200'
              : 'border-transparent opacity-80'
          "
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="bg-green-700 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold"
            >
              1
            </div>
            <h3 class="text-xs text-green-900">Admissions</h3>
          </div>

          <div class="lg:flex items-center text-green-900 justify-between lg:text-sm text-xs">
            <div class="flex items-center gap-3">
              <div class="bg-green-100 p-2 rounded-full">
                <i class="fa fa-file text-green-600"></i>
              </div>
              <p>For <span class="font-bold text-yellow-600">NEW STUDENTS and TRANSFEREES</span> Submit Hard Copy Documents at Admissions Office</p>
            </div>

    
            <div class="flex items-center gap-3">
              <div class="bg-green-100 p-2 rounded-full">
                <i class="fa fa-users text-green-600"></i>
              </div>
              <p>
                Check
                <a href="/mylsu" class="underline font-medium">MY.LSU</a> for
                Online Enrollment for Continuing
              </p>
            </div>
          </div>
        </div>

        <!-- STEP 2 -->
        <div
          :ref="(el) => (stepRefs[2] = el)"
          class="bg-white rounded-xl shadow-md px-5 py-2 transition-all duration-300 border"
          :class="
            activeStep === 2
              ? 'border-green-700 scale-[1.02] shadow-lg ring-2 ring-green-200'
              : 'border-transparent opacity-80'
          "
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="bg-green-700 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold"
            >
              2
            </div>
            <h3 class="text-xs text-green-900">Advising</h3>
          </div>

          <div class="flex items-center gap-3 text-green-900 lg:text-sm text-xs">
            <div class="bg-green-100 p-2 rounded-full">
              <svg
                class="w-5 h-5 text-green-700"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a6.5 6.5 0 0113 0" />
              </svg>
            </div>
            <p>Visit Saint Joseph Building or College Departments for Subjects</p>
          </div>
        </div>

        <!-- STEP 3 -->
        <div
          :ref="(el) => (stepRefs[3] = el)"
          class="bg-white rounded-xl shadow-md px-5 py-2 transition-all duration-300 border"
          :class="
            activeStep === 3
              ? 'border-green-700 scale-[1.02] shadow-lg ring-2 ring-green-200'
              : 'border-transparent opacity-80'
          "
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="bg-green-700 text-white w-12 h-6 flex items-center justify-center rounded-full font-bold"
            >
              3.1
            </div>
            <h3 class="text-xs text-green-900">Payment and Verification</h3>
          </div>

          <div class="flex items-center gap-3 text-green-900 lg:text-sm text-xs">
            <div class="bg-green-100 p-2 rounded-full">
              <svg
                class="w-5 h-5 text-green-700"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <p>Proceed to Accounting Office Saint Columban Building</p>
          </div>
        </div>

        <!-- STEP 4 -->
        <div
          :ref="(el) => (stepRefs[4] = el)"
          class="bg-white rounded-xl shadow-md px-5 py-2 transition-all duration-300 border"
          :class="
            activeStep === 4
              ? 'border-green-700 scale-[1.02] shadow-lg ring-2 ring-green-200'
              : 'border-transparent opacity-80'
          "
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="bg-green-700 text-white w-12 h-6 flex items-center justify-center rounded-full font-bold"
            >
              3.2
            </div>
            <h3 class="text-xs text-green-900">Creation of Accounts : <span class="font-bold text-yellow-600">NEW STUDENTS and TRANSFEREES</span></h3>
          </div>

          <div class="flex items-center gap-3 text-green-900 lg:text-sm text-xs">
            <div class="bg-green-100 p-2 rounded-full">
              <svg
                class="w-5 h-5 text-green-700"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p>Claim the COR in Registrar Office or Via Automate Online and proceed to the NPCC Office for the LSU accounts : 2nd Floor La Salle Building.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.bg-green-10 {
  background: #003613;
}
</style>
