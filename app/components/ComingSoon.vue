<template>
  <div class="relative min-h-screen flex lg:items-center justify-center overflow-hidden bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 lg:pt-3">

    <div class="lg:-mt-28">

      <!-- Animated Background Blobs -->
      <div class="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob top-10 left-10"></div>
      <div class="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000 bottom-10 right-10"></div>

      <!-- Main Card -->
      <div class="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl lg:rounded-3xl p-10 lg:pb-10 pb-16 text-center max-w-2xl lg:mx-6 animate-fade-in">

        <!-- Logo/Icon -->
        <div class="flex justify-center lg:mb-6">
          <div class="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <i class="fa-solid fa-gear text-white text-4xl animate-spin"></i>
          </div>
        </div>

        <!-- Title -->
        <h1 class="lg:text-5xl text-3xl font-extrabold text-white drop-shadow-lg animate-slide-up">
          Coming Soon
        </h1>

        <!-- Subtitle -->
        <p class="text-white/80 lg:mt-4 mt-2 lg:text-lg animate-slide-up delay-200 tracking-tighter whitespace-nowrap">
          We're building something amazing for you.
        </p>

        <!-- Countdown -->
        <div class="grid lg:grid-cols-4 grid-cols-2 gap-4 mt-8 text-white animate-slide-up delay-300">
          <div class="border bg-[#ffffff2d] rounded-xl px-3 py-4">
            <p class="text-3xl font-bold">{{ days }}</p>
            <p class="text-sm opacity-70">Days</p>
          </div>

          <div class="border bg-[#ffffff2d] rounded-xl px-3 py-4"">
            <p class="text-3xl font-bold">{{ hours }}</p>
            <p class="text-sm opacity-70">Hours</p>
          </div>

          <div class="border bg-[#ffffff2d] rounded-xl px-3 py-4"">
            <p class="text-3xl font-bold">{{ minutes }}</p>
            <p class="text-sm opacity-70">Minutes</p>
          </div>

          <div class="border bg-[#ffffff2d] rounded-xl px-3 py-4"">
            <p class="text-3xl font-bold">{{ seconds }}</p>
            <p class="text-sm opacity-70">Seconds</p>
          </div>
        </div>

        <!-- Launch Date -->
        <!-- <p class="text-white/80 mt-6 text-sm">
          Launching on <strong>April 1, 2026</strong>
        </p> -->

        <!-- Footer -->
        <p class="text-white lg:mt-10 mt-5 text-sm animate-fade-in delay-500">
          © {{ new Date().getFullYear() }} LSU Central
        </p>

      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/* Launch Date */
const targetDate = new Date('April 1, 2026 00:00:00')

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)

let interval = null

const updateCountdown = () => {
  const now = new Date().getTime()
  const distance = targetDate.getTime() - now

  if (distance <= 0) {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
    clearInterval(interval)
    return
  }

  days.value = Math.floor(distance / (1000 * 60 * 60 * 24))
  hours.value = Math.floor((distance / (1000 * 60 * 60)) % 24)
  minutes.value = Math.floor((distance / (1000 * 60)) % 60)
  seconds.value = Math.floor((distance / 1000) % 60)
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>

/* Floating Blob Animation */
@keyframes blob {
  0%,100% { transform: translate(0px,0px) scale(1); }
  33% { transform: translate(30px,-50px) scale(1.1); }
  66% { transform: translate(-20px,20px) scale(0.9); }
}

.animate-blob {
  animation: blob 12s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 1s ease forwards;
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 1s ease forwards;
}

</style>