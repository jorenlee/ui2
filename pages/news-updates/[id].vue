<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const route = useRoute();
const itemId = route.params.id;

const loading = ref(true);
const errorMsg = ref("");
const item = ref(null);

// Modal state for images
const showModal = ref(false);
const currentImageUrl = ref("");
const currentImageIndex = ref(0);
const imageFiles = ref([]);

const userStore = useUserStore();
const endpoint = userStore.mainDevServer;

// SDG Colors mapping
const sdgColors = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a"
};

// Helper function to get SDG color
const getSdgColor = (sdgNumber) => {
  return sdgColors[sdgNumber] || "#6b7280";
};

// Add computed property for SDG badges
const getSdgBadges = (item) => {
  if (!item?.filters) return [];
  
  const filters = item.filters.toLowerCase();
  const badges = [];
  
  // Check for exact SDG mentions using word boundaries
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`, `\\bsdg ${i}\\b`, `\\bsdg-${i}\\b`, `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`, `\\bgoal${i}\\b`, `\\bsdg${i.toString().padStart(2, '0')}\\b`
    ];
    
    if (patterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(filters);
    })) {
      badges.push({ 
        number: i,
        color: sdgColors[i] || "#6b7280"
      });
    }
  }
  
  return badges;
};

// File type detection helpers
const isImageFile = (filename) => {
  const ext = filename.toLowerCase().split(".").pop();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
};

const isPdfFile = (filename) => {
  return filename.toLowerCase().endsWith(".pdf");
};

const isVideoFile = (filename) => {
  const ext = filename.toLowerCase().split(".").pop();
  return ["mp4", "webm", "ogg", "avi", "mov"].includes(ext);
};

// Video link detection helpers
const isYouTubeLink = (url) => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const isReelsLink = (url) => {
  return url.includes("facebook.com/reel") || url.includes("fb.com/reel");
};

const convertToYouTubeEmbed = (url) => {
  try {
    const urlObj = new URL(url);
    let videoId = "";

    if (urlObj.hostname.includes("youtube.com")) {
      videoId = urlObj.searchParams.get("v");
    } else if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.substring(1);
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (error) {
    console.error("Error converting YouTube URL:", error);
  }
  return url;
};

const convertToFacebookEmbed = (url) => {
  try {
    const reelMatch = url.match(/\/reel\/(\d+)/);
    if (reelMatch) {
      return `https://www.facebook.com/plugins/video.php?height=476&href=${encodeURIComponent(
        url
      )}&show_text=false&width=267&t=0`;
    }
  } catch (error) {
    console.error("Error converting Facebook URL:", error);
  }
  return url;
};

// Combine all videos into a single numbered array
const getAllVideos = () => {
  const videos = [];

  // Add video files
  if (item.value?.files) {
    item.value.files.forEach((file) => {
      if (isVideoFile(file)) {
        videos.push({
          type: "file",
          content: file,
        });
      }
    });
  }

  // Add video links
  if (item.value?.links) {
    item.value.links.forEach((link) => {
      if (isYouTubeLink(link)) {
        videos.push({
          type: "youtube",
          content: link,
        });
      } else if (isReelsLink(link)) {
        videos.push({
          type: "facebook",
          content: link,
        });
      }
    });
  }

  return videos;
};

// Add formatDate function
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// fetch the item
onMounted(async () => {
  loading.value = true;
  errorMsg.value = "";
  try {
    const res = await $fetch(`${endpoint}/api/cms/content/${itemId}/`);
    item.value = res ?? null;

    // Filter image files for modal navigation
    if (item.value?.files) {
      imageFiles.value = item.value.files.filter((file) => isImageFile(file));
      console.log("Image files found:", imageFiles.value);
      console.log("All files:", item.value.files);
    }

    console.log("Fetched item:", item.value);
  } catch (error) {
    console.error("Error fetching item:", error);
    errorMsg.value = "Failed to load details.";
  } finally {
    loading.value = false;
  }
});

const closeModal = () => {
  showModal.value = false;
  currentImageUrl.value = "";
  document.body.style.overflow = "";
};

const nextImage = () => {
  if (imageFiles.value.length > 1) {
    currentImageIndex.value =
      (currentImageIndex.value + 1) % imageFiles.value.length;
    currentImageUrl.value = `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${
      imageFiles.value[currentImageIndex.value]
    }`;
  }
};

const prevImage = () => {
  if (imageFiles.value.length > 1) {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + imageFiles.value.length) %
      imageFiles.value.length;
    currentImageUrl.value = `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${
      imageFiles.value[currentImageIndex.value]
    }`;
  }
};
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

      <div class="pt-2.5 pb-3 shadow-lg bg-white">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li><a href="/" class="mr-1 hover:underline">Home</a></li>
          <li class="flex items-center">
            <i class="fas fa-caret-right mx-1"></i>
            <a href="/news-updates" class="mr-1 hover:underline"
              >News and Updates</a
            >
          </li>
          <li class="flex items-center">
            <i class="fas fa-caret-right mx-1"></i>
            <span class="text-gray-600">{{ item?.title || "Loading..." }}</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="w-11/12 mx-auto lg:py-10 py-5">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-green-800 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">Loading article...</p>
      </div>

      <!-- Error -->
      <div v-if="errorMsg && !loading" class="text-center py-20">
        <div
          class="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto"
        >
          <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">
            Error Loading Article
          </h3>
          <p class="text-red-600">{{ errorMsg }}</p>
          <button
            @click="$router.go(-1)"
            class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>

      <!-- CONTENT -->
      <div v-if="item && !loading" class="max-w-6xl mx-auto">
        <!-- Article Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-6">
          <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div class="flex-1">
              <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {{ item.title }}
              </h1>
              
              <!-- SDG Badges -->
              <div v-if="getSdgBadges(item).length > 0" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="badge in getSdgBadges(item)"
                  :key="badge.number"
                  class="inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium"
                  :style="{ backgroundColor: badge.color }"
                >
                  <i class="fas fa-check-circle mr-1"></i>
                  SDG {{ badge.number }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div class="flex items-center">
                  <i class="fas fa-user mr-2 text-green-600"></i>
                  <span class="font-medium">{{ item.authors }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-calendar mr-2 text-green-600"></i>
                  <span>{{ formatDate(item.date) }}</span>
                </div>
                <div class="flex items-center">
                  <i class="fas fa-tag mr-2 text-green-600"></i>
                  <span>{{ item.content_id }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Article Description -->
          <div v-if="item.descriptions" class="prose max-w-none">
            <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ item.descriptions }}
            </div>
          </div>
        </div>

        <!-- Image Modal -->
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center"
          style="z-index: 9999"
          @click.self="closeModal"
        >
          <div class="relative w-fit max-w-[90vw] max-h-[90vh]">
            <!-- Close Button -->
            <button
              class="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
              style="z-index: 10000"
              @click="closeModal"
            >
              <i class="fa fa-times"></i>
            </button>

            <!-- Previous Button -->
            <button
              v-if="imageFiles.length > 1"
              class="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
              style="z-index: 10000"
              @click="prevImage"
            >
              <i class="fa fa-chevron-left"></i>
            </button>

            <!-- Next Button -->
            <button
              v-if="imageFiles.length > 1"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
              style="z-index: 10000"
              @click="nextImage"
            >
              <i class="fa fa-chevron-right"></i>
            </button>

            <!-- Image -->
            <img
              :src="currentImageUrl"
              alt="Full size image"
              class="rounded-lg shadow-lg w-full max-h-[80vh] object-contain"
            />

            <!-- Image Counter -->
            <div
              v-if="imageFiles.length > 1"
              class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm"
            >
              {{ currentImageIndex + 1 }} / {{ imageFiles.length }}
            </div>
          </div>
        </div>

        <!-- MEDIA GALLERY -->
        <div
          v-if="item.files && item.files.length"
          class="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-6"
        >
          <h2
            class="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center"
          >
            <i class="fas fa-images mr-2 text-green-600"></i>
            Gallery
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(file, index) in item.files"
              :key="index"
              class="space-y-2"
              @click="
                showModal = true;
                currentImageUrl = `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`;
                currentImageIndex = index;
              "
            >
              <!-- Image Files -->
              <div
                v-if="isImageFile(file)"
                class="relative group cursor-pointer"
              >
                <img
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                  :alt="`Image ${index + 1}`"
                  class="w-full h-64 object-cover rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center"
                >
                  <i
                    class="fas fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  ></i>
                </div>
              </div>

              <!-- PDF Files -->
              <div
                v-else-if="isPdfFile(file)"
                class="bg-red-50 border border-red-200 rounded-lg p-4 text-center"
              >
                <i class="fas fa-file-pdf text-red-600 text-4xl mb-2"></i>
                <p class="text-sm text-gray-700 mb-2 break-all">{{ file }}</p>
                <a
                  :href="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                  target="_blank"
                  class="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                  <i class="fas fa-download mr-1"></i>
                  View PDF
                </a>
              </div>

              <!-- Video Files -->
              <div v-else-if="isVideoFile(file)" class="relative">
                <video
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                  controls
                  class="w-full h-32 object-cover rounded-lg shadow-lg"
                >
                  Your browser does not support the video tag.
                </video>
                <div
                  class="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded"
                >
                  {{ file }}
                </div>
              </div>

              <!-- Other Files -->
              <div
                v-else
                class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
              >
                <i class="fas fa-file text-gray-600 text-4xl mb-2"></i>
                <p class="text-sm text-gray-700 mb-2 break-all">{{ file }}</p>
                <a
                  :href="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                  target="_blank"
                  class="inline-flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                >
                  <i class="fas fa-download mr-1"></i>
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
        <!-- Video List or GALLERY -->
        <div
          v-if="
            (item.files && item.files.some((file) => isVideoFile(file))) ||
            (item.links &&
              item.links.some(
                (link) => isYouTubeLink(link) || isReelsLink(link)
              ))
          "
        >
          <h2
            class="text-xl lg:text-2xl font-bold text-gray-900 mb-6 flex items-center"
          >
            <i class="fas fa-video mr-2 text-green-600"></i>
            Video List
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Combined Video Files and Links with numbering -->
            <div
              v-for="(video, index) in getAllVideos()"
              :key="`video-${index}`"
              class="relative bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <!-- Video Number Badge -->
              <div
                class="absolute top-2 left-2 z-10 bg-green-600 text-white text-sm font-bold px-2 py-1 rounded-full"
              >
                {{ index + 1 }}
              </div>

              <!-- Video Content -->
              <div class="relative">
                <!-- Video Files -->
                <div v-if="video.type === 'file'" class="relative">
                  <video
                    :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${video.content}`"
                    controls
                    class="w-full h-48 object-cover"
                    :poster="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${video.content}`"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                <!-- YouTube Videos -->
                <div v-else-if="video.type === 'youtube'" class="relative">
                  <iframe
                    :src="convertToYouTubeEmbed(video.content)"
                    class="w-full h-48"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>

                <!-- Facebook Reels -->
                <div v-else-if="video.type === 'facebook'" class="relative">
                  <iframe
                    :src="convertToFacebookEmbed(video.content)"
                    class="w-full h-48"
                    frameborder="0"
                    scrolling="no"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>

              <!-- Video Info -->
              <div class="p-3">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600 capitalize">
                    {{
                      video.type === "file"
                        ? "Video File"
                        : video.type === "youtube"
                        ? "YouTube"
                        : "Facebook Reel"
                    }}
                  </span>
                  <div class="flex items-center text-xs text-gray-500">
                    <i class="fas fa-play-circle mr-1"></i>
                    Video {{ index + 1 }}
                  </div>
                </div>

                <!-- Video title/filename -->
                <div class="mt-1 text-sm text-gray-800 truncate">
                  {{ video.type === "file" ? video.content : "External Video" }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Media Fallback -->
        <div v-else class="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-6">
          <div class="text-center py-12 text-gray-500">
            <i class="fas fa-image text-4xl mb-4 text-gray-300"></i>
            <p class="text-lg">No media files available for this article</p>
          </div>
        </div>

        <!-- Back Button -->
        <div class="text-center">
          <button
            @click="$router.push('/news-updates')"
            class="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
          >
            <i class="fas fa-arrow-left mr-2"></i>
            Back to News & Updates
          </button>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style>
.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}
</style>
