<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from "vue";

// Calendar slideshow
const calendarSlides = ref([
  {
    image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/Monthly%20Calendar.png",
    caption: "Main Calendar",
  },
  // {
  //   image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/October.png",
  //   caption: "Main Calendar",
  // },
  {
    image:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CalendarB1.jpg",
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
</script>

<template>
  <div class="">
    <div class="lg:flex">
      <div class="lg:bg-[#ffffff] relative w-full lg:pb-5">
        <div class="">
          <div class="lg:flex lg:mt-10 lg:w-11/12 mx-auto">
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
