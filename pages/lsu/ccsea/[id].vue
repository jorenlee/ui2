<template>
  <div class="viewer-container">

    <!-- Render CMS Boxes -->
    <div class="canvas relative w-full h-screen">
      <div
        v-for="box in filteredBoxes"
        :key="box.cms_id"
        class="cms-box"
        :style="{
          width: (box.component_width || 240) + 'px',
          height: (box.component_height || 180) + 'px',
          top: (box.component_top || 0) + 'px',
          left: (box.component_left || 0) + 'px',
          position: 'absolute'
        }"
      >
        <!-- TEXT -->
        <div v-if="box.component_type === 'text'" class="cms-text">
          {{ box.component_content }}
        </div>

        <!-- IMAGE -->
        <img
          v-if="['image','image_link'].includes(box.component_type) && box.file_url.length && box.file_url[0].url"
          :src="box.file_url[0].url"
          class="cms-image"
        />

        <!-- VIDEO -->
        <iframe
          v-if="box.component_type === 'video' && box.component_properties?.videoEmbed"
          :src="box.component_properties.videoEmbed"
          class="w-full h-full"
          frameborder="0"
          allowfullscreen
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const endpoint = "http://127.0.0.1:8000";

const pageId = route.params.id; // e.g., "page1"
const boxes = ref([]);

// Get first file URL safely
const firstFile = (box) => {
  if (!box.file_url) return null;
  if (Array.isArray(box.file_url) && box.file_url.length) return box.file_url[0].url || null;
  if (typeof box.file_url === "string") return box.file_url;
  return null;
};

// Filter boxes for this page only
const filteredBoxes = computed(() =>
  boxes.value.filter(b => b.page_route_link_belong === pageId)
);

onMounted(async () => {
  try {
    const res = await fetch(`${endpoint}/api/cms/boxes/`);
    if (!res.ok) {
      boxes.value = [];
      return;
    }
    const data = await res.json();
    const incoming = Array.isArray(data?.boxes) ? data.boxes : [];

    boxes.value = incoming.map(b => ({
      cms_id: b.cms_id || "",
      component_width: Number(b.component_width) || 240,
      component_height: Number(b.component_height) || 180,
      component_top: Number(b.component_top) || 0,
      component_left: Number(b.component_left) || 0,
      component_type: b.component_type || "text",
      component_content: b.component_content || "",
      component_properties: b.component_properties || {},
      file_url: Array.isArray(b.file_url) ? b.file_url : (b.file_url ? [{ url: b.file_url }] : []),
      page_route_link_belong: b.page_route_link_belong || ""
    }));
  } catch (err) {
    console.error("Failed to load CMS boxes:", err);
    boxes.value = [];
  }
});
</script>

<style>
.viewer-container { position: relative; width: 100%; min-height: 100vh; background: #f8f8f8; }
.cms-box { position: absolute; overflow: hidden; }
.cms-text { font-size: 16px; padding: 6px; }
.cms-image { width: 100%; height: 100%; object-fit: contain; }
</style>
