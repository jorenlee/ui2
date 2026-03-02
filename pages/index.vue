<script setup>
const display = ref("desktop");

import { ref, onMounted, onBeforeUnmount } from "vue";

const showScrollButton = ref(false);

const handleScroll = () => {
  showScrollButton.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  nextTick(() => {
    if (window.innerWidth < 800) {
      display.value = "mobile";
    }
  });

  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="font-montserrat">
    <Header />
    <div class="relative">
      <div class="bg-[#e3e3e3] relative">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/Corporate%20Logo%20New/Corporate%20Logo-Tagline.png"
          class="absolute left-1/2 -translate-x-1/2 lg:top-24 top-16 lg:w-4/12 w-6/12"
        />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LANDSCAPE%20CROPPED.jpg"
          class="lg:pt-3 pt-14 mx-auto w-full"
        />
      </div>
      <Shortcuts class="lg:-mt-1 2xl-shadow lg:absolute bottom-0 w-full" />
    </div>

    <div class="lg:relative block z-0">
      <div class=""></div>
      <BlogPosting />
      <SDG />

      <div class="bg-[#031d03] text-white">
        <p
          class="text-center text-white lg:text-3xl text-xl font-bold tracking-wide drop-shadow-lg lg:py-5 py-2"
        >
          Announcements
        </p>
        <Slider />
      </div>
      <!-- <NewsAndUpdates /> -->
    </div>
    <div>
      <UniversityCalendar />
      <FAQs />
    </div>
    <NetworkLogo class="py-10" />
    <!-- <TingogMagazine /> -->
    <Footer />
    <!-- Floating Scroll to Top Button -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-75 translate-y-4"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-75 translate-y-4"
    >
      <button
        v-show="showScrollButton"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
        aria-label="Scroll to top"
      >
        <i class="fas fa-chevron-up text-lg group-hover:animate-bounce"></i>
      </button>
    </Transition>
  </div>
</template>

<style scoped></style>
