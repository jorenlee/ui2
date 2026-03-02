<template>
  <div class="hr-service">
    <div>
      HR Dashboard Analytics Coming soon, Visit the Content Form and Content List For Now for Job Posting.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";

// Define props
const props = defineProps({
  darkMode: { type: Boolean, default: false }
});

const userStore = useUserStore();
const config = useRuntimeConfig();
const endpoint = config.public.apiUrl;
</script>
