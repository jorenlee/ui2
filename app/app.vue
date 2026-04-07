<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup>
// Global meta tags for social sharing fallback
useHead({
  htmlAttrs: {
    lang: 'en'
  },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    
    // Default Open Graph tags
    { property: 'og:site_name', content: 'La Salle University - Ozamiz' },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:type', content: 'website' },
    
    // Default Twitter tags
    { name: 'twitter:site', content: '@lsu_ozamiz' },
    { name: 'twitter:creator', content: '@lsu_ozamiz' }
  ]
});
</script>
