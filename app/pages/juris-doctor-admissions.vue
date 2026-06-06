<template>
  <div>
    <!-- PIN Gate -->
    <div v-if="!authenticated" class="fixed inset-0 flex flex-col z-[9999] overflow-y-auto">

      <!-- Decorative top bar -->
      <div class="h-1 w-full bg-gradient-to-r from-green-800 via-green-600 to-green-800"></div>

      <!-- Header -->
      <header class="w-full bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-sm">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
          alt="La Salle University"
          class="h-10 object-contain"
        />
        <div class="hidden md:flex items-center gap-2 text-xs text-gray-400 font-medium tracking-wider uppercase">
          <span class="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Examination Portal
        </div>
      </header>

      <!-- Main Body -->
      <main class="flex-1 flex items-center justify-center px-4 py-12">
        <div class="w-7/12 flex flex-col lg:flex-row gap-6 items-stretch">

          <!-- LEFT: Announcement Card -->
          <div class="w-full flex-1 relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <!-- Green accent top strip -->
            <div class="h-2 bg-gradient-to-r from-green-700 via-green-500 to-green-700"></div>

            <!-- Decorative circle -->
            <div class="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-5" style="background: radial-gradient(circle, #166534, transparent);"></div>
            <div class="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-5" style="background: radial-gradient(circle, #166534, transparent);"></div>

            <div class="relative p-10 lg:p-14 flex flex-col h-full">
              <!-- Badge -->
              <div class="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-8 self-start">
                <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                <span class="text-green-700 text-xs font-bold tracking-widest uppercase">Juris Doctor Program</span>
              </div>

              <!-- Title -->
              <div class="mb-8">
                <h1 class="font-black uppercase leading-none text-gray-900 mb-2" style="font-size: clamp(2.5rem, 5vw, 4rem); letter-spacing: -0.02em;">
                  Admission
                </h1>
                <h1 class="font-black uppercase leading-none mb-1" style="font-size: clamp(2.5rem, 5vw, 4rem); letter-spacing: -0.02em; -webkit-text-stroke: 2px #166534; color: transparent;">
                  Test
                </h1>
                <div class="flex items-center gap-3 mt-4">
                  <div class="h-1 w-16 bg-green-700 rounded-full"></div>
                  <div class="h-1 w-6 bg-green-300 rounded-full"></div>
                  <div class="h-1 w-3 bg-green-200 rounded-full"></div>
                </div>
              </div>

              <!-- Info blocks -->
              <div class="space-y-5 flex-1">
                <div class="flex gap-4 items-start p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-green-600 font-semibold uppercase tracking-wider mb-0.5">Date & Time</p>
                    <p class="text-gray-800 text-sm font-bold">June 6, 2026 (Saturday)</p>
                    <p class="text-gray-600 text-sm">8:30 AM to 12:00 NN</p>
                  </div>
                </div>

                <div class="flex gap-4 items-start p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-green-600 font-semibold uppercase tracking-wider mb-0.5">Venue</p>
                    <p class="text-gray-800 text-sm font-bold">JD Room 1, SC Building</p>
                  </div>
                </div>

                <div class="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div class="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-700 flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Reminder</p>
                    <p class="text-gray-700 text-sm">Arrive <span class="font-semibold">15 minutes early</span> and bring a <span class="font-semibold">valid ID</span>.</p>
                  </div>
                </div>
              </div>

              <!-- Good luck message -->
              <div class="mt-8 pt-6 border-t border-gray-100">
                <p class="text-gray-400 text-xs">Thank you, and we wish you the best in your admission test.</p>
              </div>
            </div>
          </div>

          <!-- RIGHT: PIN Card -->
          <div class="w-full lg:w-5/12 flex-shrink-0 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div class="h-2 bg-gradient-to-r from-green-700 via-green-500 to-green-700"></div>
            <div class="p-10 flex flex-col items-center justify-center h-full min-h-80">

              <!-- Unavailable state -->
              <div v-if="!isAvailable" class="text-center">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h2 class="text-gray-800 font-bold text-lg mb-2">Access Unavailable</h2>
                <p class="text-gray-400 text-sm leading-relaxed">This page is only available on<br/><span class="font-semibold text-gray-600">{{ availableScheduleDateAndTime }}</span>.</p>
              </div>

              <!-- PIN Entry -->
              <div class="text-center w-full">
                <!-- Lock icon with green glow -->
                <!-- <div class="relative w-16 h-16 mx-auto mb-6">
                  <div class="absolute inset-0 rounded-2xl bg-green-100 blur-md opacity-60"></div>
                  <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                </div>

               <h2 class="text-gray-900 font-bold text-xl mb-1">Secure Access</h2>
                <p class="text-gray-400 text-sm mb-2">Enter your 6-digit PIN to continue</p>
                 -->
                <!-- Exam Details Mini Card -->
                <!-- <div class="bg-green-50 rounded-xl px-4 py-3 mb-8 border border-green-100">
                  <p class="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">Exam Date & Time</p>
                  <p class="text-sm font-bold text-gray-800">June 6, 2026 • 8:30 AM - 12:00 NN</p>
                </div> -->

                <!-- PIN Inputs -->
                <!-- <div class="flex gap-3 justify-center mb-6">
                  <input
                    v-for="(digit, i) in pinDigits"
                    :key="i"
                    :ref="el => { if (el) pinRefs[i] = el }"
                    type="password"
                    maxlength="1"
                    inputmode="numeric"
                    class="w-12 h-16 text-center text-2xl font-bold text-gray-800 bg-gray-50 border-2 rounded-xl outline-none transition-all duration-200"
                    :class="showError
                      ? 'border-red-400 bg-red-50 animate-shake'
                      : 'border-gray-200 focus:border-green-600 focus:bg-white focus:shadow-md'"
                    :value="pinDigits[i]"
                    @input="onPinInput($event, i)"
                    @keydown="onPinKeydown($event, i)"
                    @paste="onPaste($event)"
                  />
                </div>

                <p v-if="showError" class="text-red-500 text-xs font-medium mt-2 mb-0">Incorrect PIN. Please try again.</p>

                <p class="text-gray-300 text-xs mt-8">Protected by La Salle University</p> -->
              </div>

            </div>
          </div>

        </div>
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-100 py-4 px-6 text-center">
        <p class="text-xs tracking-wide text-green-800">© 2026 La Salle University Ozamiz, Inc.<br/>Powered by Network, Programs and Computerization Center (NPCC)</p>
      </footer>
      

    </div>

    <!-- Actual Content -->
    <JurisDoctorAdmission v-if="authenticated"/>
  
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed } from 'vue'

const authenticated = ref(false)
const pinDigits = reactive(['', '', '', '', '', ''])
const pinRefs = reactive([])
const showError = ref(false)

const CORRECT_PIN = '060626'
const availableScheduleDateAndTime = 'June 6, 2026 from 07:00AM to 12:00 NN (PHT)'

const isAvailable = computed(() => {
  const now = new Date()

  const year = now.getFullYear()
  const month = now.getMonth() // June = 5
  const day = now.getDate()
  const hour = now.getHours()
  const minute = now.getMinutes()

  console.log('Availability check -', { year, month, day, hour, minute })

  // Available only on June 6, 2026 from 07:00 AM to 12:00 PM
  if (
    year === 2026 &&
    month === 5 &&
    day === 6 &&
    (
      (hour >= 7 && hour < 12) ||
      (hour === 12 && minute === 0)
    )
  ) {
    return true
  }

  return false
})

// NOTE: isAvailable is a computed — do not write to it directly.

function onPinInput(event, index) {
  const val = event.target.value.replace(/\D/g, '')
  pinDigits[index] = val.charAt(0) || ''
  showError.value = false

  if (val && index < 5) {
    nextTick(() => pinRefs[index + 1]?.focus())
  }

  if (pinDigits.every(d => d !== '')) {
    checkPin()
  }
}

function onPinKeydown(event, index) {
  if (event.key === 'Backspace' && !pinDigits[index] && index > 0) {
    nextTick(() => pinRefs[index - 1]?.focus())
  }
}

function onPaste(event) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    pinDigits[i] = pasted[i] || ''
  }
  showError.value = false
  if (pasted.length === 6) {
    nextTick(() => checkPin())
  }
}

function checkPin() {
  const entered = pinDigits.join('')
  if (entered === CORRECT_PIN) {
    authenticated.value = true
  } else {
    showError.value = true
    for (let i = 0; i < 6; i++) pinDigits[i] = ''
    nextTick(() => pinRefs[0]?.focus())
  }
}

onMounted(() => {
  if (isAvailable.value) {
    nextTick(() => pinRefs[0]?.focus())
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}
.animate-shake {
  animation: shake 0.45s ease;
}
</style>