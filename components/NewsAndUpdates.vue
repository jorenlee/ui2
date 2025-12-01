<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";

// Calendar slideshow
const calendarSlides = ref([
  {
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/Monthly%20Calendar.png",
    caption: "Main Calendar",
  },
  // {
  //   image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/October.png",
  //   caption: "Main Calendar",
  // },
  {
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CalendarB1.jpg",
    caption: "Alternate Calendar",
  },
  {
    image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CalendarB2.jpg",
    caption: "Alternate Calendar",
  },
  {
    image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CalendarB3.jpg",
    caption: "Alternate Calendar",
  },
  {
    image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CalendarB4.jpg",
    caption: "Alternate Calendar",
  },
  {
    image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CalendarB5.jpg",
    caption: "Alternate Calendar",
  },
]);

const zoomModalImage = (event) => {
  const img = event.target;
  const rect = img.getBoundingClientRect();

  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  img.style.transformOrigin = `${x}% ${y}%`;
  img.style.transform = "scale(2)"; // Or 2.5, 3 etc.
};

const resetModalZoom = (event) => {
  const img = event.target;
  img.style.transform = "scale(1)";
};

const currentSlideIndex = ref(0);
const nextSlide = () => {
  currentSlideIndex.value =
    (currentSlideIndex.value + 1) % calendarSlides.value.length;
};
const prevSlide = () => {
  currentSlideIndex.value =
    currentSlideIndex.value === 0
      ? calendarSlides.value.length - 1
      : currentSlideIndex.value - 1;
};
const goToSlide = (index) => {
  currentSlideIndex.value = index;
};

// Slide interval control
let slideInterval;
const startSlideInterval = () => {
  slideInterval = setInterval(nextSlide, 5000);
};
const stopSlideInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
};

// Lifecycle
onMounted(() => {
  startSlideInterval();
});
onUnmounted(() => {
  stopSlideInterval();
});

// Modal logic
const showModal = ref(false);

const openModal = (index) => {
  currentSlideIndex.value = index;
  showModal.value = true;
  document.body.style.overflow = "hidden";

  // Lower z-index of overlapping elements
  const testimonials = document.querySelector(".testimonials");
  const menuShortcuts = document.querySelector(".menu-shortcuts");
  const mainHeader = document.querySelector(".main-header");
  const dotsLabels = document.querySelectorAll(".dots label");

  if (testimonials) testimonials.style.zIndex = "0";
  if (menuShortcuts) menuShortcuts.style.zIndex = "0";
  if (mainHeader) mainHeader.style.zIndex = "0";
  dotsLabels.forEach((label) => (label.style.zIndex = "0"));
};

const closeModal = () => {
  showModal.value = false;
  document.body.style.overflow = ""; // Restore scroll

  // Restore z-index of overlapping elements
  const testimonials = document.querySelector(".testimonials");
  const menuShortcuts = document.querySelector(".menu-shortcuts");
  const mainHeader = document.querySelector(".main-header");
  const dotsLabels = document.querySelectorAll(".dots label");

  if (testimonials) testimonials.style.zIndex = "10"; // adjust as needed
  if (menuShortcuts) menuShortcuts.style.zIndex = "30"; // from your CSS
  if (mainHeader) mainHeader.style.zIndex = "50"; // as declared in CSS
  dotsLabels.forEach((label) => (label.style.zIndex = "20"));
};

// Watch modal state to stop/resume slideshow and scroll
watch(showModal, (isOpen) => {
  if (isOpen) {
    stopSlideInterval();
    document.body.classList.add("no-scroll");
  } else {
    startSlideInterval();
    document.body.classList.remove("no-scroll");
  }
});

// Optional: show toggle (for L, S, U content if still used)
const show = reactive({
  L: false,
  S: false,
  U: false,
});
const toggle = (letter) => {
  show[letter] = !show[letter];
};
</script>

<template>
  <div class="">
    <div class="lg:flex">
      <div class="lg:bg-[#ffffff] relative w-full lg:pb-5">
        <div class="">
          <div class="lg:flex lg:mt-10 lg:w-11/12 mx-auto">
            <div class="w-full justify-center flex items-center">
              <div class="lg:pr-20">
                <div
                  class="w-full max-w-7xl bg-[#fff] shadow-md lg:rounded-lg overflow-hidden relative"
                >
                  <div class="">
                    <!-- Left Side: Header and Logo -->
                    <div
                      class="w-full lg:w-3/10 flex flex-col justify-center items-center lg:py-5 py-3 relative bg-gray-50 border-gray-200"
                    >
                      <div class="relative text-center">
                        <img
                          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-c-v.png"
                          alt="La Salle University Logo"
                          class="lg:w-3/12 w-6/12 h-auto object-contain my-2 mx-auto"
                        />
                        <!-- <h1 class="text-[#008028] text-4xl font-medium my-2">La Salle University</h1> -->
                        <h2
                          class="text-[#008028] text-xl font-bold uppercase tracking-wider"
                        >
                          EDUCATION POLICY
                        </h2>
                      </div>
                      <!-- Background image overlay -->
                      <div
                        class="absolute inset-0 opacity-20 pointer-events-none"
                      ></div>
                    </div>

                    <!-- Right Side: Content -->
                    <div
                      class="w-full lg:w-7/10 px-5 lg:py-5 py-2 relative overflow-y-auto"
                    >
                      <!-- Introduction Paragraph -->
                      <p
                        class="lg:text-xs text-[10px] text-gray-800 mb-2 text-justify"
                      >
                        La Salle University stands at the forefront of
                        cultivating a vibrant learning community guided by
                        Gospel values within the region. Our active engagement
                        in societal transformation is driven by a commitment to
                        innovative education, rigorous research, and robust
                        community extension services, all rooted in the rich
                        tradition of Lasallian values. We tirelessly strive for
                        the betterment of society by imparting knowledge that
                        goes beyond the academic realm, including the
                        responsible management and dissemination of intellectual
                        property generated through research and innovation.
                      </p>

                      <div class="flex gap-x-4 mb-3">
                        <!-- L Section -->
                        <div
                          class="shadow-md text-center text-green-900 w-full cursor-pointer hover:bg-green-100"
                          @click="toggle('L')"
                        >
                          <div
                            class="lg:text-6xl text-3xl font-bold text-[#008028] leading-none flex items-start justify-center"
                          >
                            L
                          </div>
                          <i
                            class="fa fa-angle-double-down text-[10px] lg:-mt-1 mb-1 block text-gray-200"
                            aria-hidden="true"
                          ></i>
                        </div>

                        <!-- S Section -->
                        <div
                          class="shadow-md text-center text-green-900 w-full cursor-pointer hover:bg-green-100"
                          @click="toggle('S')"
                        >
                          <div
                            class="lg:text-6xl text-3xl font-bold text-[#008028] leading-none flex items-start justify-center"
                          >
                            S
                          </div>
                          <i
                            class="fa fa-angle-double-down text-[10px] lg:-mt-1 mb-1 block text-gray-200"
                            aria-hidden="true"
                          ></i>
                        </div>

                        <!-- U Section -->
                        <div
                          class="shadow-md text-center text-green-900 w-full cursor-pointer hover:bg-green-100"
                          @click="toggle('U')"
                        >
                          <div
                            class="lg:text-6xl text-3xl font-bold text-[#008028] leading-none flex items-start justify-center"
                          >
                            U
                          </div>
                          <i
                            class="fa fa-angle-double-down text-[10px] lg:-mt-1 mb-1 block text-gray-200"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>

                      <div v-show="show.L" class="flex-1 mb-3">
                        <p class="text-xs text-[#008028] text-justify m-0">
                          <span class="font-bold">L</span>ifelong learning is
                          our passion. We are dedicated to delivering
                          outstanding learning experiences across all
                          educational levels. We prioritize learners' and
                          stakeholders' satisfaction while ensuring compliance
                          with relevant regulations.
                        </p>
                      </div>
                      <div v-show="show.S" class="flex-1 mb-3">
                        <p class="text-xs text-[#008028] text-justify m-0">
                          <span class="font-bold">S</span>ervice to the Almighty
                          and society is a calling. By integrating Gospel values
                          into our educational fabric, we aim to instill a
                          strong moral compass in our students, empowering them
                          to make meaningful contributions to their communities.
                          Our holistic and pragmatic approach, combining
                          academic rigor with a focus on societal
                          responsibility, positions La Salle University as a
                          trailblazer in shaping well-rounded individuals poised
                          to impact the world positively.
                        </p>
                      </div>

                      <div v-show="show.U" class="flex-1 mb-3">
                        <p class="text-xs text-[#008028] text-justify m-0">
                          <span class="font-bold">U</span>nwavering excellence
                          is our commitment. LSU strives to be abreast with the
                          appropriate scientific and technological developments,
                          adhere to the ethical conduct of educational research,
                          and support an inclusive and sustainable society. We
                          shall continually improve the efficiency of our
                          management systems, including the processes for
                          protecting and promoting intellectual property, as
                          well as the evaluation and expansion of community
                          extension programs, ensuring the consistent
                          advancement of the institution.
                        </p>
                      </div>

                      <!-- Footer with Document Info and Signature -->
                      <footer
                        class="flex flex-col md:flex-row justify-between items-start md:items-end mt-3 lg:pt-4 pt-2 border-t border-gray-200"
                      >
                        <div class="text-left lg:mt-4 mt-2 md:mt-0">
                          <p
                            class="text-[10px] font-bold text-[#008028] whitespace-nowrap"
                          >
                            (SGD) BR. REY E. MEJIAS FSC
                          </p>
                          <p class="text-xs text-gray-700">
                            University President
                          </p>
                        </div>
                        <div class="w-full">
                          <p
                            class="text-right text-gray-500 lg:text-[10px] text-[7px]"
                          >
                            ECM PO-01, REV. 01
                          </p>
                        </div>
                      </footer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calendar Slideshow Section -->
            <div
              class="w-full lg:w-10/12 lg:border-b-0 border-b lg:pb-0 pt-2 pb-2"
            >
              <div class="w-full">
                <div class="calendar-slideshow">
                  <div class="slideshow-container shadow-2xl lg:border">
                    <div
                      v-for="(slide, index) in calendarSlides"
                      :key="index"
                      class="calendar-slide"
                      :class="{ active: index === currentSlideIndex }"
                    >
                      <img
                        :src="slide.image"
                        @click="openModal(index)"
                        class="slide-image"
                      />
                    </div>
                    <button class="prev-btn" @click="prevSlide">❮</button>
                    <button class="next-btn" @click="nextSlide">❯</button>
                  </div>
                  <div class="slide-dots">
                    <span
                      v-for="(slide, index) in calendarSlides"
                      :key="index"
                      class="dot"
                      :class="{ active: index === currentSlideIndex }"
                      @click="goToSlide(index)"
                    ></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal for Calendar Image -->
            <div
              v-if="showModal"
              class="modal fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center px-4 z-[999]"
              @click.self="closeModal"
            >
              <div
                class="bg-white rounded-lg shadow-xl max-w-5xl w-full relative px-4"
              >
                <!-- Close Button -->
                <button
                  @click="closeModal"
                  class="absolute top-2 right-2 text-gray-700 hover:text-red-600 text-2xl font-bold z-70"
                >
                  &times;
                </button>

                <!-- Slide Container -->
                <div class="relative h-5/6">
                  <img
                    :src="calendarSlides[currentSlideIndex]?.image"
                    class="zoomed-image w-full h-screen object-contain rounded"
                    alt="Slide"
                    @mousemove="zoomModalImage"
                    @mouseleave="resetModalZoom"
                  />

                  <!-- Navigation Buttons -->
                  <button
                    class="absolute left-2 top-1/2 transform -translate-y-1/2 text-3xl text-white bg-black bg-opacity-30 px-4 py-2 rounded-full hover:bg-opacity-60"
                    @click.stop="prevSlide"
                  >
                    ❮
                  </button>
                  <button
                    class="absolute right-2 top-1/2 transform -translate-y-1/2 text-3xl text-white bg-black bg-opacity-30 px-4 py-2 rounded-full hover:bg-opacity-60"
                    @click.stop="nextSlide"
                  >
                    ❯
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Your existing styles... */

/* Calendar Slideshow Styles */
.calendar-slideshow {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  overflow: hidden;
}

.slideshow-caption {
  text-align: left;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  color: #333;
}

.slideshow-container {
  position: relative;
  width: 100%;
  height: 500px;
  // border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.calendar-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;

  &.active {
    opacity: 1;
  }
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.slide-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  width: auto;
}

.prev-btn,
.next-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 16px 10px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
}

.prev-btn {
  left: 0;
  border-radius: 0 3px 3px 0;
}

.next-btn {
  right: 0;
  border-radius: 3px 0 0 3px;
}

.slide-dots {
  text-align: center;
  margin-top: 15px;
}

.dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin: 0 5px;
  background-color: #bbb;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s;

  &.active,
  &:hover {
    background-color: #006633;
  }
}

.calendar-slide {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.6s ease;

  &.active {
    opacity: 1;
  }
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

@media (max-width: 768px) {
  .slideshow-container {
    height: 350px;
  }

  .slideshow-caption {
    font-size: 1.2rem;
  }

  .prev-btn,
  .next-btn {
    padding: 12px 8px;
    font-size: 16px;
  }
}
.no-scroll {
  overflow: hidden;
}

.zoomed-image {
  transition: transform 0.2s ease;
  transform-origin: center center;
  cursor: crosshair;
}
</style>
