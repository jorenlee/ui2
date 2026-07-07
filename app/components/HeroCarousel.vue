<script setup>
import { ref, onMounted, nextTick, computed, watch } from "vue";
import moment from "moment";

const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

// Carousel state
const currentSlide = ref(0);
const itemsPerSlide = ref(5); // Default for desktop

// Only include items whose filters explicitly contain "hero carousel"
// AND that actually have video content (a video file or a video link)
const heroCarouselNews = computed(() => {
  return info.value
    .filter((item) => {
      if (!item?.filters) return false;

      const filters = item.filters.toLowerCase();

      // must be Published
      if (!filters.includes("published")) return false;

      // must be tagged Hero Carousel
      if (!filters.includes("hero carousel")) return false;

      // must have actual video content (file or link)
      return hasVideoContent(item);
    })
    .sort((a, b) => {
      const dateA = moment(a.date);
      const dateB = moment(b.date);

      if (!dateA.isValid() && !dateB.isValid()) return 0;
      if (!dateA.isValid()) return 1;
      if (!dateB.isValid()) return -1;

      // latest to oldest
      return dateB.valueOf() - dateA.valueOf();
    });
});

const videoExtensions = [
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".mkv",
];

// Helper function to check if item has video content
const hasVideoContent = (item) => {
  if (item.files && item.files.some((file) => isVideoFile(file))) {
    return true;
  }

  if (
    item.links &&
    item.links.some(
      (link) =>
        link.includes("youtube.com") ||
        link.includes("youtu.be") ||
        link.includes("facebook.com/reel") ||
        isVideoFile(link),
    )
  ) {
    return true;
  }

  return false;
};

// Matches by extension, so it works whether `str` is a bare filename
// (e.g. "clip.mp4") or a full URL to an .mp4 hosted anywhere
// (e.g. "https://.../optimized_something.mp4").
const isVideoFile = (str) => {
  const clean = str.split("?")[0].split("#")[0].toLowerCase();
  return videoExtensions.some((ext) => clean.includes(ext));
};

// Returns the uploaded video filename for an item, if any
const getVideoFile = (item) => {
  if (!item.files) return null;
  return item.files.find((file) => isVideoFile(file)) || null;
};

// Builds the direct URL for an uploaded video file
const getVideoFileUrl = (filename) => {
  return `https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${filename}`;
};

// Returns the first video link for an item, if any: YouTube, Facebook
// reel, or a direct URL to a video file (.mp4, .webm, etc) hosted anywhere.
const getVideoLink = (item) => {
  if (!item.links) return null;
  return (
    item.links.find(
      (link) =>
        link.includes("youtube.com") ||
        link.includes("youtu.be") ||
        link.includes("facebook.com/reel") ||
        isVideoFile(link),
    ) || null
  );
};

// Converts a YouTube watch/short URL into an embeddable URL.
// controls=0 hides the play bar, modestbranding/rel/iv_load_policy strip the
// logo, end-screen suggestions and annotation icons, and loop+playlist make
// a single video loop seamlessly instead of showing a replay button.
const getYoutubeEmbedUrl = (url) => {
  let videoId = null;

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);

  if (shortMatch) videoId = shortMatch[1];
  else if (watchMatch) videoId = watchMatch[1];
  else if (shortsMatch) videoId = shortsMatch[1];

  if (!videoId) return url;

  const params = new URLSearchParams({
    controls: "0",
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    showinfo: "0",
    playsinline: "1",
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

// Facebook only honors autoplay when the video is rendered through its own
// JS SDK (XFBML), not when you just hit the plugin URL directly in a bare
// iframe — which is why autoplay was being ignored. The SDK is loaded once
// and reused for every fb-video element on the page.
let fbSdkPromise = null;
const loadFacebookSdk = () => {
  if (fbSdkPromise) return fbSdkPromise;

  fbSdkPromise = new Promise((resolve) => {
    if (window.FB) {
      resolve(window.FB);
      return;
    }

    if (!document.getElementById("fb-root")) {
      const fbRoot = document.createElement("div");
      fbRoot.id = "fb-root";
      document.body.appendChild(fbRoot);
    }

    const previousInit = window.fbAsyncInit;
    window.fbAsyncInit = () => {
      if (typeof previousInit === "function") previousInit();
      window.FB.init({ xfbml: false, version: "v19.0" });
      resolve(window.FB);
    };

    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);
    }
  });

  return fbSdkPromise;
};

// Facebook's plugin has no "loop" flag, so true looping is done manually:
// once XFBML renders a video, we subscribe to its player and, when it
// finishes, seek back to 0 and play again.
const parseFacebookVideos = async () => {
  const FB = await loadFacebookSdk();

  FB.Event.subscribe("xfbml.ready", (msg) => {
    if (msg.type !== "video") return;
    const player = msg.instance;

    try {
      // Don't rely only on the declarative data-autoplay flag — call play()
      // directly on the player as soon as it's ready. This runs inside
      // Facebook's own script context (not ours), so it isn't blocked by
      // the browser's "no autoplay without a user gesture" rule the way a
      // call from our page's JS would be.
      player.mute();
      player.play();

      player.subscribe("finishedPlaying", () => {
        player.seek(0);
        player.play();
      });
    } catch (err) {
      console.error("Facebook video player API error:", err);
    }
  });

  await nextTick();
  FB.XFBML.parse();
};

// Resolves the embed src + type (file | youtube | facebook) for an item.
// "file" covers both an uploaded filename (prefixed with the uploads path)
// and a direct video URL pasted as a link (e.g. an .mp4 hosted elsewhere),
// which is used as-is since it's already a full URL.
const getVideoSource = (item) => {
  const file = getVideoFile(item);
  if (file) {
    return { type: "file", src: getVideoFileUrl(file) };
  }

  const link = getVideoLink(item);
  if (link) {
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      return { type: "youtube", src: getYoutubeEmbedUrl(link) };
    }
    if (link.includes("facebook.com/reel")) {
      return { type: "facebook", src: link };
    }
    if (isVideoFile(link)) {
      return { type: "file", src: link };
    }
  }

  return null;
};

// Carousel navigation
const totalSlides = computed(() => {
  return Math.ceil(heroCarouselNews.value.length / itemsPerSlide.value);
});

const canGoPrev = computed(() => currentSlide.value > 0);
const canGoNext = computed(() => currentSlide.value < totalSlides.value - 1);

const nextSlide = () => {
  if (canGoNext.value) {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (canGoPrev.value) {
    currentSlide.value--;
  }
};

const visibleNews = computed(() => {
  const start = currentSlide.value * itemsPerSlide.value;
  const end = start + itemsPerSlide.value;
  return heroCarouselNews.value.slice(start, end);
});

// Number of grid columns to render right now. Instead of always
// reserving 5 (or 2 on mobile) columns, this matches however many
// items are actually visible, so a single video fills the row
// instead of sitting in 1/5th of it.
const gridColumnCount = computed(() => {
  return Math.max(visibleNews.value.length, 1);
});

// Re-parse Facebook's XFBML whenever the visible slide changes, so videos
// that scroll into view via carousel navigation still get autoplay + the
// loop subscription wired up (not just the ones present on first render).
watch(visibleNews, (items) => {
  if (items.some((item) => getVideoSource(item)?.type === "facebook")) {
    parseFacebookVideos();
  }
});

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    info.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching list:", error);
    errorMsg.value = "Failed to load hero carousel content.";
  } finally {
    loading.value = false;
  }

  await nextTick();

  if (window.innerWidth < 800) {
    display.value = "mobile";
    itemsPerSlide.value = 2; // Show 2 items on mobile
  } else {
    itemsPerSlide.value = 5; // Show 5 items on desktop
  }

  if (visibleNews.value.some((item) => getVideoSource(item)?.type === "facebook")) {
    parseFacebookVideos();
  }
});
</script>

<template>
  <div class="w-full relative">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <p class="mt-6 text-green-700 font-semibold text-lg animate-pulse">
        Loading Hero Carousel...
      </p>
    </div>

    <!-- Carousel: full-bleed, no side padding, no card chrome -->
    <div v-else-if="heroCarouselNews.length" class="relative w-full">
      <button
        v-if="canGoPrev"
        @click="prevSlide"
        class="absolute top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 left-4"
        aria-label="Previous slide"
      >
        <i class="fas fa-chevron-left text-xl"></i>
      </button>

      <button
        v-if="canGoNext"
        @click="nextSlide"
        class="absolute top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-green-600 text-green-600 hover:text-white rounded-full w-12 h-12 flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 right-4"
        aria-label="Next slide"
      >
        <i class="fas fa-chevron-right text-xl"></i>
      </button>

      <!-- Column count matches the number of items actually shown, no gap,
           no border/shadow/hover-zoom — the video fills the full row
           edge-to-edge instead of sitting inside a bordered card. -->
      <div
        class="grid grid-cols-1 gap-0 transition-all duration-500 w-full"
        :style="display !== 'mobile' ? { gridTemplateColumns: `repeat(${gridColumnCount}, 1fr)` } : {}"
      >
        <div
          v-for="(j, i) in visibleNews"
          :key="j.id || i"
          class="overflow-hidden"
        >
          <!-- Full viewport height so the carousel reads as a true full
               height / full width hero, not a fixed 320px strip. -->
          <div class="relative w-full h-[800px] overflow-hidden bg-black">
            <!-- Uploaded video file OR a direct .mp4 (etc) URL link:
                 no native controls, autoplay muted loop -->
            <video
              v-if="getVideoSource(j)?.type === 'file'"
              :src="getVideoSource(j).src"
              class="w-full h-full object-cover"
              playsinline
              autoplay
              muted
              loop
              preload="metadata"
            ></video>

            <!-- YouTube: chrome already stripped via URL params above -->
            <iframe
              v-else-if="getVideoSource(j)?.type === 'youtube'"
              :src="getVideoSource(j).src"
              class="w-full h-full pointer-events-none"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>

            <!-- Facebook: rendered through the actual XFBML fb-video element
                 (not a bare iframe URL) because autoplay is only honored
                 when Facebook's own SDK parses the embed. Looping is done
                 manually in parseFacebookVideos() via the Video Player API,
                 since the plugin has no loop flag. The header bar (avatar,
                 page name, share icon) still can't be disabled by a flag,
                 so it's cropped out by oversizing the rendered element and
                 shifting it up/left inside an overflow-hidden mask.
                 pointer-events-none stops the hidden chrome from being
                 clickable. Tune the offsets below if your embed size
                 changes. -->
            <div
              v-else-if="getVideoSource(j)?.type === 'facebook'"
              class="absolute inset-0 overflow-hidden"
            >
              <div
                class="fb-video absolute w-[calc(100%+40px)] h-[calc(100%)] pointer-events-none"
                :data-href="getVideoSource(j).src"
                data-width="auto"
                data-show-text="false"
                data-autoplay="true"
                data-allowfullscreen="false"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="text-gray-400 py-10 text-center">
      No hero carousel content posted yet.
    </div>
  </div>
</template>