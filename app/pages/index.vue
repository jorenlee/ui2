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
      <HeroCarousel/>
      <Shortcuts class="2xl-shadow lg:absolute bottom-0 w-full" />
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
