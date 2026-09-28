<template>
  <div class="relative mx-auto lg:w-9/12 min-h-5/6 lg:pb-16 overflow-hidden">
    <!-- Slides -->
    <div class="relative">
      <Transition name="fade" mode="out-in">
        <img
          :key="currentSlide"
          :src="slides[currentSlide].src"
          :alt="slides[currentSlide].alt"
          class="h-auto w-full object-contain"
        />
      </Transition>
    </div>

    <!-- Previous Button -->
    <button
      @click="prevSlide"
      aria-label="Previous slide"
      class="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
    >
      &#10094;
    </button>

    <!-- Next Button -->
    <button
      @click="nextSlide"
      aria-label="Next slide"
      class="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70"
    >
      &#10095;
    </button>

    <!-- Pagination Dots -->
    <div
      class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
    >
      <button
        v-for="(slide, index) in slides"
        :key="index"
        @click="goToSlide(index)"
        :aria-label="`Go to slide ${index + 1}`"
        :class="[
          'h-3 w-3 rounded-full transition-all',
          currentSlide === index
            ? 'scale-110 bg-white'
            : 'bg-white/50 hover:bg-white/80'
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const slides = [
  {
    src: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/SW%20PAASCU.png',
    alt: 'School of Social Work PAASCU'
  },
  {
    src: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/CON%20PAASCU.png',
    alt: 'College of Nursing PAASCU'
  }
]

const currentSlide = ref(0)
let interval = null

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length
}

const prevSlide = () => {
  currentSlide.value =
    (currentSlide.value - 1 + slides.length) % slides.length
}

const goToSlide = (index) => {
  currentSlide.value = index
}

onMounted(() => {
  interval = setInterval(nextSlide, 5000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>