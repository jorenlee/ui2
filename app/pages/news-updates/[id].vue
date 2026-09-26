<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import moment from "moment";

const route = useRoute();
const itemId = route.params.id;
const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;

const { data: item } = await useFetch(`${endpoint}/api/cms/content/${itemId}/`);

const showModal = ref(false);
const currentImageUrl = ref("");
const currentImageIndex = ref(0);
const imageFiles = ref([]);
const loading = ref(false);
const errorMsg = ref("");

const isImageFile = (filename) => {
  const ext = filename.toLowerCase().split(".").pop();
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
};

if (item.value) {
  const title = item.value.title || "LSU News Update";
  const description = item.value.descriptions
    ? item.value.descriptions.replace(/<[^>]*>/g, "").substring(0, 300)
    : "Latest news and updates from La Salle University - Ozamiz";

  const imageUrl =
    item.value.files && item.value.files.length > 0 && isImageFile(item.value.files[0])
      ? `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${item.value.files[0]}`
      : "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/logos/lsu-logo.png";

  const pageUrl = `https://lsu.edu.ph/news-updates/${itemId}`;

  useHead({
    title: `${title} | LSU`,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: description },
      { hid: "og:title", property: "og:title", content: `${title} | LSU` },
      { hid: "og:description", property: "og:description", content: description },
      { hid: "og:image", property: "og:image", content: imageUrl },
      { hid: "og:image:width", property: "og:image:width", content: "1200" },
      { hid: "og:image:height", property: "og:image:height", content: "630" },
      { hid: "og:url", property: "og:url", content: pageUrl },
      { hid: "og:type", property: "og:type", content: "article" },
      { hid: "og:site_name", property: "og:site_name", content: "La Salle University - Ozamiz" },
      { hid: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { hid: "twitter:title", name: "twitter:title", content: title },
      { hid: "twitter:description", name: "twitter:description", content: description },
      { hid: "twitter:image", name: "twitter:image", content: imageUrl },
      { hid: "twitter:site", name: "twitter:site", content: "@lsu_ozamiz" },
    ],
    link: [{ rel: "canonical", href: pageUrl }],
  });
}

const sdgColors = {
  1: "#e5243b", 2: "#dda63a", 3: "#4c9f38", 4: "#c5192d", 5: "#ff3a21",
  6: "#26bde2", 7: "#fcc30b", 8: "#a21942", 9: "#fd6925", 10: "#dd1367",
  11: "#fd9d24", 12: "#bf8b2e", 13: "#3f7e44", 14: "#0a97d9", 15: "#56c02b",
  16: "#00689d", 17: "#19486a",
};

const getSdgBadges = (item) => {
  if (!item?.filters) return [];
  const filters = item.filters.toLowerCase();
  const badges = [];
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`, `\\bsdg ${i}\\b`, `\\bsdg-${i}\\b`, `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`, `\\bgoal${i}\\b`, `\\bsdg${i.toString().padStart(2, "0")}\\b`,
    ];
    if (patterns.some((pattern) => new RegExp(pattern, "i").test(filters))) {
      badges.push({ number: i, color: sdgColors[i] || "#6b7280" });
    }
  }
  return badges;
};

const getSdgSlug = (sdgNumber) => {
  const sdgSlugs = [
    "no-poverty", "zero-hunger", "good-health-and-well-being", "quality-education",
    "gender-equality", "clean-water-and-sanitation", "affordable-and-clean-energy",
    "decent-work-and-economic-growth", "industry-innovation-and-infrastructure",
    "reduced-inequalities", "sustainable-cities-and-communities",
    "responsible-consumption-and-production", "climate-action", "life-below-water",
    "life-on-land", "peace-justice-and-strong-institutions", "partnerships-for-the-goals",
  ];
  return sdgSlugs[sdgNumber - 1] || "";
};

const isPdfFile = (filename) => filename.toLowerCase().endsWith(".pdf");
const isVideoFile = (filename) => {
  const ext = filename.toLowerCase().split(".").pop();
  return ["mp4", "webm", "ogg", "avi", "mov"].includes(ext);
};
const isYouTubeLink = (url) => url.includes("youtube.com") || url.includes("youtu.be");
const isReelsLink = (url) => url.includes("facebook.com/reel") || url.includes("fb.com/reel");

const convertToYouTubeEmbed = (url) => {
  try {
    const urlObj = new URL(url);
    let videoId = "";
    if (urlObj.hostname.includes("youtube.com")) videoId = urlObj.searchParams.get("v");
    else if (urlObj.hostname.includes("youtu.be")) videoId = urlObj.pathname.substring(1);
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) { console.error("Error converting YouTube URL:", error); }
  return url;
};

const convertToFacebookEmbed = (url) => {
  try {
    const reelMatch = url.match(/\/reel\/(\d+)/);
    if (reelMatch) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&t=0`;
  } catch (error) { console.error("Error converting Facebook URL:", error); }
  return url;
};

const getAllVideos = () => {
  const videos = [];
  if (item.value?.files) {
    item.value.files.forEach((file) => {
      if (isVideoFile(file)) videos.push({ type: "file", content: file });
    });
  }
  if (item.value?.links) {
    item.value.links.forEach((link) => {
      if (isYouTubeLink(link)) videos.push({ type: "youtube", content: link });
      else if (isReelsLink(link)) videos.push({ type: "facebook", content: link });
    });
  }
  return videos;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch (error) { return dateString; }
};

const shareToFacebook = () => {
  const url = `https://lsu.edu.ph/news-updates/${itemId}`;
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
};
const shareToTwitter = () => {
  const url = `https://lsu.edu.ph/news-updates/${itemId}`;
  const title = item.value?.title || "LSU News Update";
  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}&via=lsu_ozamiz`, "_blank", "width=600,height=400");
};
const shareToLinkedIn = () => {
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://lsu.edu.ph/news-updates/" + itemId)}`, "_blank", "width=600,height=400");
};
const shareToWhatsApp = () => {
  const url = `https://lsu.edu.ph/news-updates/${itemId}`;
  const title = item.value?.title || "LSU News Update";
  window.open(`https://wa.me/?text=${encodeURIComponent(title + " - " + url)}`, "_blank");
};
const copyToClipboard = async () => {
  const url = `https://lsu.edu.ph/news-updates/${itemId}`;
  try {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Link copied to clipboard!");
  }
};

onMounted(() => {
  if (item.value?.files) {
    imageFiles.value = item.value.files.filter((file) => isImageFile(file));
  }
});

const closeModal = () => {
  showModal.value = false;
  currentImageUrl.value = "";
  document.body.style.overflow = "";
};
const openModal = (file, index) => {
  showModal.value = true;
  currentImageUrl.value = `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`;
  currentImageIndex.value = index;
  document.body.style.overflow = "hidden";
};
const nextImage = () => {
  if (imageFiles.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % imageFiles.value.length;
    currentImageUrl.value = `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${imageFiles.value[currentImageIndex.value]}`;
  }
};
const prevImage = () => {
  if (imageFiles.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value - 1 + imageFiles.value.length) % imageFiles.value.length;
    currentImageUrl.value = `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${imageFiles.value[currentImageIndex.value]}`;
  }
};

const galleryImages = computed(() => {
  if (!item.value?.files) return [];
  return item.value.files.filter((f) => isImageFile(f));
});
const featuredImage = computed(() => galleryImages.value.length > 0 ? galleryImages.value[0] : null);
const additionalImages = computed(() => galleryImages.value.slice(1));
</script>

<template>
  <div class="bg-gray-50 min-h-screen font-sans">
    <Header />

    <!-- HERO BANNER -->
    <div class="relative overflow-hidden" style="background: linear-gradient(135deg, #1a3d2b 0%, #1f4d35 40%, #2d6a4a 100%)">
      <!-- Desktop height spacer -->
      <div class="w-full lg:block hidden h-[148px]"></div>
      <!-- Mobile height spacer -->
      <div class="w-full lg:hidden block h-32"></div>

      <!-- Radial depth glows -->
      <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(ellipse at 75% 50%, rgba(255,255,255,0.06) 0%, transparent 55%), radial-gradient(ellipse at 10% 50%, rgba(0,0,0,0.15) 0%, transparent 60%)"></div>

      <!-- Content overlay -->
      <div class="absolute inset-0 flex items-center">
        <div class="w-11/12 mx-auto flex items-center justify-between gap-6 relative z-10">

          <!-- LEFT: title + subtitle -->
          <div class="flex-1 min-w-0">
            <h1 class="font-extrabold uppercase text-white lg:text-[28px] text-xl tracking-tight leading-none mb-2">
              News and Updates
            </h1>
            <p class="text-white/60 text-xs lg:text-sm hidden lg:block font-normal">
              Stories, announcements, and milestones from La Salle University - Ozamiz.
            </p>
          </div>

          <!-- RIGHT: UN Agenda 2030 widget -->
          <div class="flex-shrink-0 hidden lg:block">
            <NuxtLink
              to="/sdgs"
              class="group flex items-center gap-3 px-4 py-2.5 transition-all duration-300 rounded-full"
              style="background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.18); backdrop-filter: blur(8px);"
            >
              <div class="flex-shrink-0 w-9 h-9 overflow-hidden">
                <img
                  src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDG.jpg"
                  alt="UN SDGs"
                  class="w-full h-full object-contain bg-white rounded-full"
                />
              </div>
              <div class="min-w-0">
                <p class="text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5" style="color: rgba(255,255,255,0.55)">UN Agenda 2030</p>
                <p class="text-[11px] font-bold text-white leading-tight">1/ SDGs Integrated Curriculum</p>
                <p class="text-[10px] font-semibold mt-1 flex items-center gap-1 group-hover:gap-2 transition-all" style="color: #86efac">
                  Explore Sustainability &rarr;
                </p>
              </div>
            </NuxtLink>
          </div>

        </div>
      </div>
    </div>

    <!-- BREADCRUMB -->
    <div class="bg-white border-b border-gray-100 shadow-sm">
      <div class="w-11/12 mx-auto py-2.5">
        <nav aria-label="breadcrumb">
          <ul class="flex items-center flex-wrap text-xs gap-0">
            <li>
              <a href="/" class="lasalle-green-text hover:underline transition-colors">Home</a>
            </li>
            <li class="flex items-center">
              <i class="fas fa-caret-right mx-1.5 text-gray-300 text-[10px]"></i>
              <a href="/news-updates" class="lasalle-green-text hover:underline transition-colors">News and Updates</a>
            </li>
            <li class="flex items-center">
              <i class="fas fa-caret-right mx-1.5 text-gray-300 text-[10px]"></i>
              <span class="text-gray-800 font-bold truncate max-w-[200px] lg:max-w-md">{{ item?.title || "Loading..." }}</span>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- MAIN BODY -->
    <div class="w-11/12 mx-auto py-8">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-24">
        <div class="animate-spin rounded-full h-14 w-14 border-4 border-green-800 border-t-transparent mx-auto mb-4"></div>
        <p class="text-gray-500 text-sm">Loading article...</p>
      </div>

      <!-- Error -->
      <div v-if="errorMsg && !loading" class="text-center py-20">
        <div class="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <i class="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
          <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Article</h3>
          <p class="text-red-600 text-sm">{{ errorMsg }}</p>
        </div>
      </div>

      <!-- CONTENT -->
      <div v-if="item && !loading">

        <!-- TWO-COLUMN LAYOUT -->
        <div class="flex flex-col lg:flex-row gap-8">

          <!-- LEFT: Article Content -->
          <div class="flex-1 min-w-0 space-y-6 lg:w-8/12">

            <!-- Article Card -->
            <article class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="h-1.5 w-full bg-gradient-to-r from-green-700 via-green-500 to-teal-400"></div>
              <div class="p-6 lg:p-8">

                <!-- Meta row -->
                <div class="flex flex-wrap items-center gap-3 mb-5 text-xs text-gray-500">
                  <span class="inline-flex items-center gap-1.5 bg-green-50 text-green-700 font-semibold px-3 py-1 rounded-full border border-green-100">
                    <i class="fas fa-newspaper text-green-500"></i>
                    News &amp; Updates
                  </span>
                  <span class="flex items-center gap-1.5">
                    <i class="fas fa-calendar-alt text-green-600"></i>
                    {{ formatDate(item.date) }}
                  </span>
                  <span v-if="item.authors" class="flex items-center gap-1.5">
                    <i class="fas fa-user-circle text-green-600"></i>
                    {{ item.authors }}
                  </span>
                </div>

                <!-- Title -->
                <h1 class="text-2xl lg:text-3xl font-extrabold text-gray-900 leading-tight mb-6">
                  {{ item.title }}
                </h1>

                <!-- SDG IMAGE BADGES -->
                <div v-if="getSdgBadges(item).length > 0" class="mb-6">
                  <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <img
                      src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/E_SDG_logo_Square_WEB.png.png"
                      alt="SDGs"
                      class="h-5 object-contain"
                    />
                    Sustainable Development Goals
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink
                      v-for="badge in getSdgBadges(item)"
                      :key="badge.number"
                      :to="`/sdgs/${getSdgSlug(badge.number)}`"
                      :title="`SDG ${badge.number}`"
                      class="group relative block w-10 h-10 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                      :style="{ outline: `2px solid ${badge.color}` }"
                    >
                      <img
                        :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${badge.number}.png`"
                        :alt="`SDG ${badge.number}`"
                        class="w-full h-full object-cover"
                      />
                      <div
                        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                        :style="{ backgroundColor: badge.color + 'CC' }"
                      >
                        <span class="text-white text-[9px] font-bold text-center leading-tight px-0.5">{{ badge.number }}</span>
                      </div>
                    </NuxtLink>
                  </div>
                </div>

                

                <!-- Body -->
                <div v-if="item.descriptions" class="prose prose-green max-w-none">
                  <div class="text-black leading-relaxed text-base whitespace-pre-wrap text-justify">
                    {{ item.descriptions }}
                  </div>
                </div>

                <!-- Related Links -->
                <div v-if="item.links && item.links.length > 0" class="mt-8 pt-6 border-t border-gray-100">
                  <h3 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <i class="fas fa-link text-green-600"></i>
                    Related Links
                  </h3>
                  <div class="space-y-2">
                    <div v-for="(link, index) in item.links" :key="index">
                      <a :href="link" target="_blank"
                        class="inline-flex items-center gap-2 text-green-600 hover:text-green-800 hover:underline transition-colors duration-200 text-sm truncate max-w-full"
                        :title="link"
                      >
                        <i class="fas fa-external-link-alt text-xs flex-shrink-0"></i>
                        <span class="truncate">{{ link }}</span>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </article>

            <!-- VIDEOS -->
            <div
              v-if="(item.files && item.files.some((f) => isVideoFile(f))) || (item.links && item.links.some((l) => isYouTubeLink(l) || isReelsLink(l)))"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="h-1.5 w-full bg-gradient-to-r from-green-700 via-green-500 to-teal-400"></div>
              <div class="p-6 lg:p-8">
                <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-lg">
                    <i class="fas fa-play text-xs"></i>
                  </span>
                  Videos
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div
                    v-for="(video, index) in getAllVideos()"
                    :key="`video-${index}`"
                    class="relative rounded-xl overflow-hidden shadow-sm bg-black"
                  >
                    <div class="absolute top-2 left-2 z-10 bg-green-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                      {{ index + 1 }}
                    </div>
                    <div class="relative w-full aspect-video">
                      <div v-if="video.type === 'file'" class="w-full h-full">
                        <video :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${video.content}`" controls class="w-full h-full object-contain">
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      <div v-else-if="video.type === 'youtube'" class="w-full h-full">
                        <iframe :src="convertToYouTubeEmbed(video.content)" class="w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                      </div>
                      <div v-else-if="video.type === 'facebook'" class="w-full h-full">
                        <iframe :src="convertToFacebookEmbed(video.content)" class="w-full h-full" frameborder="0" scrolling="no" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SHARE -->
            <div v-if="item" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="h-1.5 w-full bg-gradient-to-r from-green-700 via-green-500 to-teal-400"></div>
              <div class="p-6 lg:p-8">
                <h3 class="text-sm font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i class="fas fa-share-alt text-green-600"></i>
                  Share this Article
                </h3>
                <div class="flex flex-wrap gap-2.5">
                  <button @click="shareToFacebook" class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm">
                    <i class="fab fa-facebook-f"></i> Facebook
                  </button>
                  <button @click="shareToTwitter" class="flex items-center gap-2 bg-sky-400 hover:bg-sky-500 text-white text-sm px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm">
                    <i class="fab fa-twitter"></i> Twitter
                  </button>
                  <button @click="shareToLinkedIn" class="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white text-sm px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm">
                    <i class="fab fa-linkedin-in"></i> LinkedIn
                  </button>
                  <button @click="shareToWhatsApp" class="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                  </button>
                  <button @click="copyToClipboard" class="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-xl transition-colors duration-200 shadow-sm">
                    <i class="fas fa-link"></i> Copy Link
                  </button>
                </div>
                <p class="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
                  <i class="fas fa-info-circle"></i>
                  Share this news with your network to spread awareness.
                </p>
              </div>
            </div>

          </div>
          <!-- end LEFT -->

          <!-- RIGHT: Sidebar -->
          <aside class="lg:w-4/12 flex-shrink-0 space-y-5">

            <!-- Gallery Card -->
            <div
              v-if="galleryImages.length > 0"
              class="bg-white shadow-sm overflow-hidden sticky top-24"
            >
              <div class="h-1.5 w-full"></div>

              <!-- Featured image -->
              <div class="relative cursor-pointer group overflow-hidden" @click="openModal(galleryImages[0], 0)">
                <img
                  :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${galleryImages[0]}`"
                  alt="Featured image"
                  class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div class="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                    <i class="fas fa-expand text-green-700 text-sm"></i>
                  </div>
                </div>
                <div v-if="galleryImages.length > 1" class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
                  <i class="fas fa-images mr-1"></i>{{ galleryImages.length }} photos
                </div>
              </div>

              <!-- Header -->
              <div class="px-4 pt-4 pb-2 flex items-center justify-between">
                <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <i class="fas fa-images text-green-600"></i> Photo Gallery
                </h2>
                <span class="text-xs text-gray-400">{{ galleryImages.length }} image{{ galleryImages.length !== 1 ? "s" : "" }}</span>
              </div>

              <!-- Thumbnails -->
              <div v-if="additionalImages.length > 0" class="px-4 pb-4">
                <div class="grid grid-cols-3 gap-1.5">
                  <div
                    v-for="(file, idx) in additionalImages.slice(0, 9)"
                    :key="idx"
                    class="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                    @click="openModal(file, idx + 1)"
                  >
                    <img
                      :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                      :alt="`Photo ${idx + 2}`"
                      class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      @error="(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gray-100'); }"
                    />
                    <!-- +N overlay on the last visible thumbnail when there are hidden images -->
                    <div
                      v-if="idx === 8 && additionalImages.length > 9"
                      class="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center"
                    >
                      <span class="text-white text-2xl font-bold">+{{ additionalImages.length - 9 }}</span>
                    </div>
                    <div
                      v-else
                      class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-lg flex items-center justify-center"
                    >
                      <i class="fas fa-search-plus text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- PDFs in gallery card -->
              <div v-if="item.files && item.files.some(f => isPdfFile(f))" class="px-4 pb-4 space-y-2">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <i class="fas fa-file-pdf text-red-500"></i> Documents
                </p>
                <div v-for="(file, index) in item.files.filter(f => isPdfFile(f))" :key="index">
                  <a
                    :href="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                    target="_blank"
                    class="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors duration-200"
                  >
                    <i class="fas fa-file-pdf text-red-600 text-lg flex-shrink-0"></i>
                    <span class="truncate text-gray-700 text-xs">{{ file }}</span>
                    <i class="fas fa-download text-red-400 text-xs flex-shrink-0 ml-auto"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- Fallback: PDFs only -->
            <div
              v-else-if="item.files && item.files.some(f => isPdfFile(f))"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div class="h-1.5 w-full bg-gradient-to-r from-green-700 via-green-500 to-teal-400"></div>
              <div class="p-5">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <i class="fas fa-file-pdf text-red-500"></i> Documents
                </p>
                <div v-for="(file, index) in item.files.filter(f => isPdfFile(f))" :key="index" class="mb-2">
                  <a
                    :href="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${file}`"
                    target="_blank"
                    class="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors duration-200"
                  >
                    <i class="fas fa-file-pdf text-red-600 text-lg flex-shrink-0"></i>
                    <span class="truncate text-gray-700 text-xs">{{ file }}</span>
                    <i class="fas fa-download text-red-400 text-xs flex-shrink-0 ml-auto"></i>
                  </a>
                </div>
              </div>
            </div>



            <!-- Article Meta -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="h-1.5 w-full bg-gradient-to-r from-green-700 via-green-500 to-teal-400"></div>
              <div class="p-5">
                <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Article Info</p>
                <div class="space-y-3">
                  <div v-if="item.date" class="flex items-start gap-3">
                    <span class="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-green-50 rounded-lg">
                      <i class="fas fa-calendar-alt text-green-600 text-xs"></i>
                    </span>
                    <div>
                      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Published</p>
                      <p class="font-medium text-gray-800 text-xs">{{ formatDate(item.date) }}</p>
                    </div>
                  </div>
                  <div v-if="item.authors" class="flex items-start gap-3">
                    <span class="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-green-50 rounded-lg">
                      <i class="fas fa-user text-green-600 text-xs"></i>
                    </span>
                    <div>
                      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Author</p>
                      <p class="font-medium text-gray-800 text-xs">{{ item.authors }}</p>
                    </div>
                  </div>
                  <div v-if="item.content_id" class="flex items-start gap-3">
                    <span class="w-7 h-7 flex-shrink-0 flex items-center justify-center bg-green-50 rounded-lg">
                      <i class="fas fa-tag text-green-600 text-xs"></i>
                    </span>
                    <div>
                      <p class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Category</p>
                      <p class="font-medium text-gray-800 text-xs">{{ item.content_id }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>

    <!-- IMAGE MODAL -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          style="z-index: 9999"
          @click.self="closeModal"
        >
          <div class="relative w-fit max-w-[92vw] max-h-[92vh]">
            <button
              class="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all shadow-lg"
              @click="closeModal"
            >
              <i class="fas fa-times text-sm"></i>
            </button>
            <button
              v-if="imageFiles.length > 1"
              class="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
              @click="prevImage"
            >
              <i class="fas fa-chevron-left text-sm"></i>
            </button>
            <button
              v-if="imageFiles.length > 1"
              class="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
              @click="nextImage"
            >
              <i class="fas fa-chevron-right text-sm"></i>
            </button>
            <img :src="currentImageUrl" alt="Full size" class="rounded-2xl shadow-2xl max-h-[85vh] object-contain" />
            <div
              v-if="imageFiles.length > 1"
              class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full"
            >
              {{ currentImageIndex + 1 }} / {{ imageFiles.length }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Footer />
  </div>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
