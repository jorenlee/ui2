<template>
  <div class="viewer-container">

    <!-- Canvas Area -->
    <div class="canvas relative w-full min-h-screen bg-gray-100">

      <!-- Render CMS Boxes -->
      <div
        v-for="box in filteredBoxes"
        :key="box.cms_id"
        class="cms-box"
        :style="{
          width: box.component_width + 'px',
          height: box.component_height + 'px',
          top: box.component_top + 'px',
          left: box.component_left + 'px',
          position: 'absolute'
        }"
      >

        <!-- TEXT -->
        <div v-if="box.component_type === 'text'" class="cms-text">
          {{ box.component_content }}
        </div>

        <!-- IMAGE -->
        <img
          v-if="['image','image_link'].includes(box.component_type) && firstFile(box)"
          :src="firstFile(box)"
          class="cms-image"
        />

        <!-- VIDEO -->
        <iframe
          v-if="box.component_type === 'video' && box.component_properties?.videoEmbed"
          :src="box.component_properties.videoEmbed"
          class="w-full h-full border-0 rounded"
          allowfullscreen
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const route = useRoute();
const pageId = route.params.id;     // "page1", "page2", etc
const boxes = ref([]);

// Safely return first available file URL
const firstFile = (box) => {
  if (!box?.file_url) return null;

  if (Array.isArray(box.file_url) && box.file_url.length)
    return box.file_url[0]?.url || null;

  if (typeof box.file_url === "string") return box.file_url;

  return null;
};

// Filter only matching route (clean normalization)
const filteredBoxes = computed(() =>
  boxes.value.filter((b) => {
    const cleanRoute = (b.page_route_link_belong || "")
      .split("/")
      .pop()          // supports: page1, /page1, control-box/page1
      .trim();

    return cleanRoute === pageId;
  })
);

onMounted(async () => {
  try {
    const res = await fetch(`${endpoint.value}/api/cms/boxes/`);

    if (!res.ok) {
      boxes.value = [];
      return;
    }

    const data = await res.json();
    const incoming = Array.isArray(data?.boxes) ? data.boxes : [];

    boxes.value = incoming.map((b) => ({
      cms_id: b.cms_id || "",
      component_width: Number(b.component_width) || 240,
      component_height: Number(b.component_height) || 180,
      component_top: Number(b.component_top) || 0,
      component_left: Number(b.component_left) || 0,
      component_type: b.component_type || "text",
      component_content: b.component_content || "",
      component_properties: b.component_properties || {},

      // Make file_url always an array
      file_url: Array.isArray(b.file_url)
        ? b.file_url
        : b.file_url
        ? [{ url: b.file_url }]
        : [],

      page_route_link_belong: b.page_route_link_belong || ""
    }));
  } catch (error) {
    console.error("Error loading CMS data:", error);
    boxes.value = [];
  }
});
</script>

<style scoped>
.viewer-container {
  width: 100%;
  min-height: 100vh;
}

.cms-box {
  position: absolute;
  overflow: hidden;
  border-radius: 6px;
}

.cms-text {
  font-size: 16px;
  padding: 6px;
  white-space: pre-wrap;
}

.cms-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
