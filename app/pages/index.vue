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

const scrollDown = () => {
  const target = document.getElementById("news-and-updates-title");
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
  }
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
        <!-- <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20&%20Theme%20with%20Corp%20Logo%20Green.png"
          class="absolute left-1/2 -translate-x-1/2 lg:w-2/12 w-6/12"
        />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/LANDSCAPE%20CROPPED.jpg"
          class="mx-auto w-full"
        /> -->
        <video
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/WELCOME%20Lasallians!.mp4"
          class="w-full mx-auto"
          autoplay
          muted
          loop
          playsinline
        ></video>
        <div class="lg:block hidden absolute bottom-6 lg:bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-14 h-14">
          <span class="absolute inline-flex h-full w-full rounded-full bg-[#014421]/30"></span>
          <button
            @click="scrollDown"
            class="relative flex items-center justify-center bg-gray-200 hover:bg-green-50 border-2 border-[#014421] w-full h-full rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group focus:outline-none cursor-pointer"
            aria-label="Scroll down"
          >
            <svg
              class="w-8 h-15 text-[#014421] animate-pulse mt-0.5"
              fill="none"
              stroke="currentColor"
              stroke-width="10"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
      <Shortcuts class="lg:-mt-1 2xl-shadow lg:absolute bottom-0 w-full" />
    </div>
    <div id="main-content" class="lg:relative block z-0">
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
