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

// image viewer state
const activeImage = ref(null);       // url of highlighted image
const showModal = ref(false);
const zoomLevel = ref(1);
const currentIndex = ref(0);

const userStore = useUserStore();
const endpoint = userStore.mainDevServer;

// fetch the item
onMounted(async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await $fetch(`${endpoint}/api/cms/${itemId}/`);
    item.value = res ?? null;

    // init image viewer if thumbnails exist
    if (item.value?.thumbnails && item.value.thumbnails.length) {
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

// open modal with selected image index
function openModal(index = 0) {
  if (!item.value?.thumbnails?.length) return;
  currentIndex.value = index;
  activeImage.value = item.value.thumbnails[index].url;
  showModal.value = true;
  zoomLevel.value = 1;
}

// close modal
function closeModal() {
  showModal.value = false;
  zoomLevel.value = 1;
}

// set highlight image without opening modal
function setHighlight(index) {
  if (!item.value?.thumbnails?.length) return;
  currentIndex.value = index;
  activeImage.value = item.value.thumbnails[index].url;
}

// carousel next/prev (wrap)
function nextImage() {
  if (!item.value?.thumbnails?.length) return;
  currentIndex.value = (currentIndex.value + 1) % item.value.thumbnails.length;
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

// zoom controls
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
        <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
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
    <div class="w-11/12 mx-auto lg:py-10 py-5">
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
        <!-- LEFT: Content + Highlight + Thumbnails -->
        <div class=" w-fit">
          <h2 class="lg:text-2xl font-bold mb-5 leading-tight">{{ item.title }}</h2>

          <p class=" whitespace-pre-line mb-7 leading-tight lg:text-sm text-xs">
            {{ item.description }}
          </p>

          <!-- IMAGE VIEWER -->
          <div v-if="item.thumbnails?.length" class="mb-10">
            <h3 class="text-lg font-semibold mb-3">Images</h3>

            <div class="flex flex-col lg:flex-row gap-5">
              <!-- Highlight (left on desktop) -->
              <div class="lg:w-8/12 w-full">
                <img
                  :src="activeImage || item.thumbnails[0].url"
                  @click="openModal(currentIndex)"
                  class="w-auto h-fit object-contain rounded-lg shadow cursor-pointer hover:opacity-95 transition"
                  alt="highlight"
                />
              </div>

              <!-- Thumbnails (right) -->
              <div class="lg:w-4/12 w-full grid lg:grid-cols-2 grid-cols-4 gap-3">
                <div
                  v-for="(thumb, index) in item.thumbnails"
                  :key="index"
                  class="cursor-pointer"
                  @click="setHighlight(index)"
                >
                  <img
                    :src="thumb.url"
                    :alt="thumb.name || `thumb-${index}`"
                    class="w-full lg:h-32 object-contain rounded shadow hover:ring-2 hover:ring-green-700 transition"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- fallback when no images -->
          <div v-else class="mb-6 text-gray-500">
            No images available for this post.
          </div>

          <!-- Created At -->
          <div class="text-sm text-gray-500 mt-5">
            Posted: {{ moment(item.created_at).format("MMMM DD, YYYY") }}
          </div>
        </div>

        <!-- RIGHT SIDEBAR: Optional metadata or logs (collapsed) -->
        <!-- <aside class="lg:w-4/12 w-full mt-10 lg:mt-0">
          <div class="bg-white p-4 rounded shadow-sm">
            <h3 class="font-bold mb-2">Details</h3>
            <p class="text-sm text-gray-600 mb-2">
              <strong>Title:</strong> {{ item.title || "-" }}
            </p>
            <p class="text-sm text-gray-600 mb-2">
              <strong>Created:</strong> {{ moment(item.created_at).fromNow() }}
            </p>

            <div v-if="item.logs?.length" class="mt-4">
              <h4 class="font-semibold mb-2">Status Logs</h4>
              <ul class="space-y-3 text-sm text-gray-700">
                <li v-for="(log, i) in item.logs" :key="i" class="border-b pb-2 last:border-0">
                  <div class="font-semibold">{{ log.personnel_fullname }}</div>
                  <div class="text-xs text-gray-500">{{ log.personnel_designation }} • {{ log.personnel_email }}</div>
                  <div class="mt-1">{{ log.personnel_remarks }}</div>
                  <div class="italic text-xs text-gray-500 mt-1">{{ log.status_remarks }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ moment(log.timestamp).format("MMM DD, YYYY - h:mm A") }}</div>
                </li>
              </ul>
            </div>

            <div v-else class="text-sm text-gray-500 mt-4">
              No logs available.
            </div>
          </div>
        </aside> -->
      </div>
    </div>

    <Footer />

    <!-- FULLSCREEN MODAL CAROUSEL -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
    >
      <!-- Close Button -->
      <button
        class="absolute top-5 right-5 text-white text-3xl z-60"
        @click="closeModal"
        aria-label="Close"
      >
        ✕
      </button>

      <!-- Left Arrow -->
      <button
        @click="prevImage"
        class="absolute left-5 text-white text-4xl font-bold z-60"
        aria-label="Previous"
      >
        ‹
      </button>

      <!-- Right Arrow -->
      <button
        @click="nextImage"
        class="absolute right-5 text-white text-4xl font-bold z-60"
        aria-label="Next"
      >
        ›
      </button>

      <!-- IMAGE CONTAINER WITH ZOOM -->
      <div class="relative w-full max-w-5xl h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          :src="activeImage"
          :style="{ transform: `scale(${zoomLevel})` }"
          class="max-h-full object-contain transition-transform duration-200 cursor-grab"
          draggable="false"
          alt="modal-image"
        />
      </div>

      <!-- Zoom Controls -->
      <div class="absolute bottom-10 flex gap-4 z-60">
        <button
          class="bg-white text-black px-4 py-2 rounded shadow"
          @click="zoomOut"
          aria-label="Zoom out"
        >
          -
        </button>
        <button
          class="bg-white text-black px-4 py-2 rounded shadow"
          @click="zoomIn"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* small styling helpers */
.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}

/* ensure modal controls appear above image */
.z-60 {
  z-index: 60;
}

/* make sure long text wraps in sidebar */
aside p {
  word-wrap: break-word;
}
</style>
