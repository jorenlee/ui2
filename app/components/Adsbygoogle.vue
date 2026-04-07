<template>
  <div class="ad-container">
    <ins
      ref="adsRef"
      class="adsbygoogle"
      style="display:block"
      :data-ad-client="adClient"
      :data-ad-slot="adSlot"
      :data-ad-format="adFormat || 'auto'"
      :data-full-width-responsive="fullWidthResponsive || 'true'"
    ></ins>
  </div>
</template>

<script setup>
const props = defineProps({
  adSlot: {
    type: String,
    required: true
  },
  adClient: {
    type: String,
    default: 'ca-pub-5434839287765657'
  },
  adFormat: {
    type: String,
    default: 'auto'
  },
  fullWidthResponsive: {
    type: String,
    default: 'true'
  }
});

const adsRef = ref(null);
let adInitialized = false;

const initializeAd = () => {
  if (process.client && window.adsbygoogle && adsRef.value && !adInitialized) {
    try {
      // Check if this ad slot is already initialized
      const isAlreadyInitialized = adsRef.value.getAttribute('data-adsbygoogle-status');
      
      if (!isAlreadyInitialized) {
        window.adsbygoogle.push({});
        adInitialized = true;
      }
    } catch (error) {
      console.warn('AdSense initialization error:', error.message);
    }
  }
};

onMounted(() => {
  // Wait for AdSense script to load
  const checkAdSense = () => {
    if (window.adsbygoogle) {
      initializeAd();
    } else {
      setTimeout(checkAdSense, 100);
    }
  };
  
  checkAdSense();
});

// Reinitialize on route change
const route = useRoute();
watch(() => route.path, () => {
  adInitialized = false;
  nextTick(() => {
    initializeAd();
  });
});
</script>