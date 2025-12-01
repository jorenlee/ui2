<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const route = useRoute();
const itemId = route.params.id;

const loading = ref(true);
const errorMsg = ref("");
const item = ref(null);

// image viewer states
const activeImage = ref(null);
const showModal = ref(false);
const zoomLevel = ref(1);
const currentIndex = ref(0);

// ref to main highlight image (for mobile scrolling)
const highlightRef = ref(null);

const userStore = useUserStore();
const endpoint = userStore.mainDevServer;

// ----------------------------
// MOBILE FOCUS ON MAIN IMAGE
// ----------------------------
function focusHighlightMobile() {
  if (window.innerWidth < 1024 && highlightRef.value) {
    const elementTop =
      highlightRef.value.getBoundingClientRect().top + window.scrollY - 100;

    window.scrollTo({
      top: elementTop,
      behavior: "smooth",
    });
  }
}

// ----------------------------
// FETCH ITEM
// ----------------------------
onMounted(async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await $fetch(`${endpoint}/api/cms/7/`);
    item.value = res ?? null;

    if (item.value?.thumbnails?.length) {
      currentIndex.value = 0;
      activeImage.value = item.value.thumbnails[0].url;
    } else {
      activeImage.value = null;
    }
  } catch (error) {
    console.error("Error fetching item:", error);
    errorMsg.value = "Failed to load details.";
  } finally {
    loading.value = false;
  }
});

// ----------------------------
// OPEN MODAL VIEWER
// ----------------------------
function openModal(index = 0) {
  if (!item.value?.thumbnails?.length) return;

  currentIndex.value = index;
  activeImage.value = item.value.thumbnails[index].url;

  showModal.value = true;
  zoomLevel.value = 1;
}

// ----------------------------
// CLOSE MODAL
// ----------------------------
function closeModal() {
  showModal.value = false;
  zoomLevel.value = 1;
}

// ----------------------------
// UPDATE MAIN IMAGE (THUMB CLICK)
// ----------------------------
function setHighlight(index) {
  if (!item.value?.thumbnails?.length) return;

  currentIndex.value = index;
  activeImage.value = item.value.thumbnails[index].url;

  // Scroll main image into view on mobile
  focusHighlightMobile();
}

// ----------------------------
// CAROUSEL NEXT/PREV
// ----------------------------
function nextImage() {
  if (!item.value?.thumbnails?.length) return;

  currentIndex.value =
    (currentIndex.value + 1) % item.value.thumbnails.length;
  activeImage.value = item.value.thumbnails[currentIndex.value].url;
  zoomLevel.value = 1;
}
function prevImage() {
  if (!item.value?.thumbnails?.length) return;

  currentIndex.value =
    (currentIndex.value - 1 + item.value.thumbnails.length) %
    item.value.thumbnails.length;
  activeImage.value = item.value.thumbnails[currentIndex.value].url;
  zoomLevel.value = 1;
}

// ----------------------------
// ZOOM
// ----------------------------
function zoomIn() {
  zoomLevel.value = +(zoomLevel.value + 0.25).toFixed(2);
}
function zoomOut() {
  zoomLevel.value = +(Math.max(1, zoomLevel.value - 0.25)).toFixed(2);
}
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <Header />

    <!-- HEADER / BANNER -->
    <div class="relative">
      <Banner />

      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="align-top w-full h-36 object-none lg:hidden block"
        alt="banner"
      />

      <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
        <h1
          class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
        >
          News and Updates
        </h1>
      </div>

      <div class="pt-2.5 pb-3 shadow-lg">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li><a href="/" class="mr-1">Home</a></li>
          <li class="flex items-center">
            <i class="fas fa-caret-right mx-1"></i>
            <a href="/news-updates" class="mr-1">News and Updates</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="w-11/12 mx-auto py-10">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-10 text-gray-600">
        Loading...
      </div>

      <!-- Error -->
      <div v-if="errorMsg && !loading" class="text-center text-red-600 py-10">
        {{ errorMsg }}
      </div>

      <!-- CONTENT -->
      <div v-if="item && !loading" class="lg:flex gap-10">
        <!-- LEFT CONTENT -->
        <div class="w-fit">
          <h2 class="text-2xl font-bold mb-5">{{ item.title }}</h2>

          <p class="leading-0 whitespace-pre-line mb-7">
            {{ item.description }}
          </p>

          <!-- IMAGE VIEWER -->
          <div v-if="item.thumbnails?.length" class="mb-10">
            <h3 class="text-lg font-semibold mb-3">Images</h3>

            <div class="flex flex-col lg:flex-row gap-5">
              <!-- MAIN IMAGE -->
              <div class="lg:w-8/12 w-full">
                <img
                  ref="highlightRef"
                  :src="activeImage || item.thumbnails[0].url"
                  @click="openModal(currentIndex)"
                  class="w-auto h-auto object-contain rounded-lg shadow cursor-pointer hover:opacity-95 transition"
                  alt="highlight"
                />
              </div>

              <!-- THUMBNAILS -->
              <div class="lg:w-4/12 w-full grid lg:grid-cols-2 grid-cols-4 gap-3">
                <div
                  v-for="(thumb, index) in item.thumbnails"
                  :key="index"
                  class="cursor-pointer"
                  @click="setHighlight(index)"
                >
                  <img
                    :src="thumb.url"
                    class="w-full lg:h-32 object-contain rounded shadow hover:ring-2 hover:ring-green-700 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- NO IMAGES -->
          <div v-else class="mb-6 text-gray-500">
            No images available for this post.
          </div>

          <!-- DATE -->
          <div class="text-sm text-gray-500 mt-5">
            Posted: {{ moment(item.created_at).format("MMMM DD, YYYY") }}
          </div>
        </div>
      </div>
    </div>

    <Footer />

    <!-- FULLSCREEN MODAL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <button
        class="absolute top-5 right-5 text-white text-3xl z-60"
        @click="closeModal"
      >
        ✕
      </button>

      <button
        @click="prevImage"
        class="absolute left-5 text-white text-4xl font-bold z-60"
      >
        ‹
      </button>

      <button
        @click="nextImage"
        class="absolute right-5 text-white text-4xl font-bold z-60"
      >
        ›
      </button>

      <div
        class="relative w-full max-w-5xl h-[80vh] flex items-center justify-center overflow-hidden"
      >
        <img
          :src="activeImage"
          :style="{ transform: `scale(${zoomLevel})` }"
          class="max-h-full object-contain transition-transform duration-200 cursor-grab"
          draggable="false"
        />
      </div>

      <div class="absolute bottom-10 flex gap-4 z-60">
        <button class="bg-white px-4 py-2 rounded shadow" @click="zoomOut">
          -
        </button>
        <button class="bg-white px-4 py-2 rounded shadow" @click="zoomIn">
          +
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}
.z-60 {
  z-index: 60;
}
</style>
