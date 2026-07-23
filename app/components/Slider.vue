<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const slides = ref([]);
const currentIndex = ref(0);
const activeRadio = ref("t-1");
const slideLimit = ref(7); // change anytime
const loading = ref(true);

let interval = null;

/* ================= FETCH DATA (client-side only — avoids SSR block) ================= */
const fetchSlides = async () => {
  try {
    let data;
    try {
      // Use the fast endpoint: server-side filter to announcements + limit to 15 records
      data = await $fetch(
        endpoint.value + "/api/cms/content/fast/?filters=announcements&limit=15"
      );
    } catch (fastError) {
      console.warn("Fast endpoint failed, falling back to list endpoint in Slider:", fastError);
      const rawData = await $fetch(endpoint.value + "/api/cms/content/list/");
      const listData = Array.isArray(rawData) ? rawData : [];
      // Filter for announcements client-side
      data = listData.filter((j) => {
        if (!j.filters) return false;
        return j.filters
          .toLowerCase()
          .split(",")
          .map((f) => f.trim())
          .includes("announcements");
      });
    }

    /* ================= IMAGE EXTENSION FILTER ================= */
    let filtered = Array.isArray(data) ? data : [];
    filtered = filtered.filter((j) => {
      const file = j.files?.[0]?.url || j.files?.[0];
      if (!file) return false;
      return /\.(jpg|jpeg|png)$/i.test(file);
    });

    /* ================= ENSURE SLIDES (CONTINUOUS LOOP) ================= */
    const baseSlides = [...filtered];

    if (baseSlides.length === 0) {
      slides.value = [];
    } else {
      while (filtered.length < slideLimit.value) {
        filtered = filtered.concat(baseSlides);
      }

      slides.value = filtered.slice(0, slideLimit.value).map((j, index) => ({
        ...j,
        radioId: `t-${index + 1}`,
      }));
    }

    /* ================= INITIAL ACTIVE ================= */
    if (slides.value.length) {
      activeRadio.value = slides.value[0].radioId;
    }
  } catch (err) {
    console.error("Slider fetch error:", err);
  } finally {
    loading.value = false;
  }
};

/* ================= AUTO SLIDE ================= */
const nextSlide = () => {
  if (!slides.value.length) return;

  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
  activeRadio.value = slides.value[currentIndex.value].radioId;
};

const prevSlide = () => {
  if (!slides.value.length) return;

  currentIndex.value =
    (currentIndex.value - 1 + slides.value.length) % slides.value.length;
  activeRadio.value = slides.value[currentIndex.value].radioId;
};

const startAutoSlide = () => {
  if (interval) clearInterval(interval);
  if (slides.value.length > 1) {
    interval = setInterval(nextSlide, 5000);
  }
};

const touchStartX = ref(0);
const touchEndX = ref(0);
const touchThreshold = 50; // px

const getClientXFromEvent = (e) => {
  if (e.touches && e.touches[0]) return e.touches[0].clientX;
  if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].clientX;
  return e.clientX || 0;
};

const onTouchStart = (e) => {
  touchStartX.value = getClientXFromEvent(e);
  touchEndX.value = touchStartX.value;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
};

const onTouchMove = (e) => {
  touchEndX.value = getClientXFromEvent(e);
};

const onTouchEnd = (e) => {
  touchEndX.value = getClientXFromEvent(e);
  const dx = touchEndX.value - touchStartX.value;
  if (Math.abs(dx) > touchThreshold) {
    if (dx < 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
  // restart auto slide
  startAutoSlide();
};

onMounted(async () => {
  await fetchSlides();
  startAutoSlide();

  // inject dynamic CSS
  const style = document.createElement("style");
  style.id = "dynamic-slider-css";
  style.innerHTML = dynamicCSS.value;
  document.head.appendChild(style);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  const style = document.getElementById("dynamic-slider-css");
  if (style) style.remove();
});

/* ================= MEDIA UTILS ================= */
const MEDIA_BASE =
  "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/";

const cleanURL = (file) => {
  if (!file) return "";
  let filename = typeof file === "string" ? file : file.url;
  if (!filename) return "";
  filename = filename.split("?")[0];
  if (!/\.(jpg|jpeg|png)$/i.test(filename)) return "";
  if (filename.startsWith("http")) return filename;
  return MEDIA_BASE + filename;
};

/* ================= DYNAMIC CSS ================= */
const dynamicCSS = computed(() => {
  const n = slideLimit.value;
  let css = "";

  // Active slides & dots
  for (let i = 0; i <= n; i++) {
    css += `
      #t-${i}:checked ~ .dots label[for="t-${i}"] {
        transform: scale(2);
        background-color: #c5de39;
      }
      #t-${i}:checked ~ .testimonials label[for="t-${i}"] {
        z-index: 3;
        opacity: 1;
        visibility: visible;
      }
    `;

    // positions +1, +2, +3
    for (let p = 1; p <= 3; p++) {
      const next = ((i - 1 + p) % n) + 1;
      const z = 3 - p;
      const opacity = p === 1 ? 0.3 : p === 2 ? 0.05 : 0;
      const x = 300 * p;
      const deg = -15 * p;

      css += `
        #t-${i}:checked ~ .testimonials label[for="t-${next}"] {
          transform: translate3d(${x}px,0,${-90 * p}px) rotateY(${deg}deg);
          z-index: ${z};
          opacity: ${opacity};
          visibility: visible;
        }
      `;
    }

    // positions -1, -2, -3
    for (let p = 1; p <= 3; p++) {
      const prev = ((i - 1 - p + n) % n) + 1;
      const z = 3 - p;
      const opacity = p === 1 ? 0.3 : p === 2 ? 0.05 : 0;
      const x = -300 * p;
      const deg = 15 * p;

      css += `
        #t-${i}:checked ~ .testimonials label[for="t-${prev}"] {
          transform: translate3d(${x}px,0,${-90 * p}px) rotateY(${deg}deg);
          z-index: ${z};
          opacity: ${opacity};
          visibility: visible;
        }
      `;
    }
  }

  return css;
});

watch(dynamicCSS, (newCSS) => {
  const style = document.getElementById("dynamic-slider-css");
  if (style) style.innerHTML = newCSS;
});
</script>

<template>
  <div class="relative">
    <div class="slider pt-12">
      <!-- RADIO INPUTS -->
      <input
        v-for="j in slides"
        :key="j.radioId"
        type="radio"
        name="testimonial"
        :id="j.radioId"
        v-model="activeRadio"
        :value="j.radioId"
      />

      <!-- SLIDES -->
      <div
        class="testimonials"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onTouchStart"
        @mousemove="onTouchMove"
        @mouseup="onTouchEnd"
        @mouseleave="onTouchEnd"
      >
        <label
          v-for="j in slides"
          :key="j.radioId"
          class="item bg-white"
          :for="j.radioId"
        >
          <a :href="`/news-updates/${j.id}`">
            <img
              v-if="cleanURL(j.files?.[0])"
              :src="cleanURL(j.files?.[0])"
              alt="announcement"
            />
          </a>
        </label>
      </div>

      <!-- DOTS -->
      <div class="dots py-3">
        <label v-for="j in slides" :key="j.radioId" :for="j.radioId"></label>
      </div>
    </div>

    <!-- WAVES -->
    <!-- <div class="absolute bottom-0 w-full">
      <svg
        class="waves"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="none"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18
               58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g class="parallax">
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="0"
            fill="rgba(255,255,255,0.7)"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="3"
            fill="rgba(255,255,255,0.5)"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="5"
            fill="rgba(255,255,255,0.3)"
          />
          <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
        </g>
      </svg>
    </div> -->
  </div>
</template>

<style scoped>
.slider {
  width: 100%;
}
.slider input {
  display: none;
}

.testimonials {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 500px;
  perspective: 1000px;
  overflow: hidden;
  z-index: 20;
}
.testimonials .item {
  width: 500px;
  height: 1000px;
  border-radius: 5px;
  position: absolute;
  top: 0;
  box-sizing: border-box;
  text-align: center;
  transition: transform 0.4s, opacity 0.4s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  user-select: none;
  cursor: pointer;
  visibility: hidden;
}

.testimonials .item img {
  max-width: 100%;
  border-radius: 5px;
}

.dots {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dots label {
  height: 7px;
  width: 7px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #106b24;
  margin: 7px;
  transition-duration: 0.2s;
  z-index: 20;
}

.waves {
  position: relative;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px;
  min-height: 100px;
  max-height: 150px;
}

/* Animation */
.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }
  h1 {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .testimonials {
    min-height: 350px;
    perspective: 500px;
  }

  .testimonials .item {
    width: 350px;
    height: 500px;
  }
}
</style>
