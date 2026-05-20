<script setup>
import { onMounted, computed } from 'vue'

const route = useRoute()

const isExcluded = computed(() => {
  return route.path === '/ads.txt' || 
         route.path === '/sitemap.xml' || 
         (route.params.slug && (route.params.slug.includes('ads.txt') || route.params.slug.includes('sitemap.xml')))
})

// Keep UI visible, then redirect
onMounted(() => {
  if (isExcluded.value) {
    // If we're on an excluded path (like sitemap.xml) and the server didn't handle it,
    // we force a browser reload to let the server route take over.
    // We only do this if we haven't already tried to reload.
    if (!window.location.search.includes('reloaded=true')) {
      const url = new URL(window.location.href)
      url.searchParams.set('reloaded', 'true')
      window.location.replace(url.href)
    }
    return
  }

  setTimeout(() => {
    navigateTo('/', { replace: true })
  }, 1500) // adjust delay if needed
})
</script>

<template>
  <div v-if="!isExcluded" class="flex items-center justify-center min-h-screen bg-white text-center p-8">
    <div class="bg-white w-full max-w-lg p-8 md:p-12 rounded-2xl shadow-xl">
      <!-- Logo -->
      <img
        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/lsu-logotype-green.png"
        alt="La Salle University"
        class="w-[200px] md:w-[250px] mx-auto mb-8 animate-fadeIn"
      />

      <!-- Spinner (UNCHANGED - Font Awesome) -->
      <div class="text-[2.5rem] md:text-[3rem] text-[#1a5f3a] mb-6">
        <i class="fa fa-spinner fa-spin"></i>
      </div>

      <!-- Text -->
      <p class="text-base md:text-lg font-medium text-[#1a5f3a]">
        Redirecting to homepage...
      </p>
    </div>
  </div>
  <div v-else>
    <!-- Hidden or minimal view for sitemap/ads while redirecting -->
  </div>
</template>