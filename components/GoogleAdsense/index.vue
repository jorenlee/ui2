<template>
  <div v-if="isClient">
    <!-- Use the reusable Adsbygoogle component which waits for the AdSense script to load -->
    <Adsbygoogle ad-slot="1745428489" class="mb-5"/>
     <Adsbygoogle ad-slot="2306527650" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Adsbygoogle from '../Adsbygoogle.vue';

const isClient = ref(false);
onMounted(() => {
  isClient.value = true;
});
</script>