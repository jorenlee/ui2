<template>
  <div class="viewer-container w-full h-screen relative bg-gray-100 overflow-hidden">
    <div class="canvas relative w-full h-full">

      <div
        v-for="box in filteredBoxes"
        :key="box.cms_id"
        class="cms-box absolute"
        :class="box.component_design_styles"
        :style="{
          width: (box.component_width || 240) + 'px',
          height: (box.component_height || 180) + 'px',
          top: (box.component_top || 0) + 'px',
          left: (box.component_left || 0) + 'px'
        }"
      >
        <!-- TEXT -->
        <div v-if="box.component_type === 'text'" class="cms-text w-full h-full whitespace-pre-wrap">
          {{ box.component_content }}
        </div>

        <!-- IMAGE / IMAGE LINK -->
        <img
          v-if="['image','image_link'].includes(box.component_type) && box.file_url.length && box.file_url[0].url"
          :src="box.file_url[0].url"
          class="cms-image w-full h-full object-cover"
        />

        <!-- VIDEO (YouTube, Vimeo, MP4, etc.) -->
        <iframe
          v-if="box.component_type === 'video' && box.file_url.length && box.file_url[0].url"
          :src="box.file_url[0].url"
          class="w-full h-full"
          frameborder="0"
          allowfullscreen
        ></iframe>

        <!-- PDF / Document Viewer -->
        <iframe
          v-if="box.component_type === 'file' && box.file_url.length && box.file_url[0].url"
          :src="box.file_url[0].url"
          class="w-full h-full"
        ></iframe>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const userStore = useUserStore();
const pageId = route.params.id;
const endpoint = userStore.mainDevServer;

const boxes = ref([]);

// Filter boxes for current page
const filteredBoxes = computed(() =>
  boxes.value.filter(b => b.page_route_link_belong === pageId)
);

// Normalize file_url
function formatFileURL(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") return [{ url: raw, name: "file" }];
  if (raw.url) return [raw];
  return [];
}

onMounted(async () => {
  try {
    const res = await fetch(`${endpoint}/api/cms/boxes/?page=${pageId}`);
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
      file_url: formatFileURL(b.file_url),
      page_route_link_belong: b.page_route_link_belong || "",
      component_design_styles: b.component_design_styles || ""
    }));
  } catch (err) {
    console.error("Failed loading CMS:", err);
    boxes.value = [];
  }
});
</script>

<style scoped>
.viewer-container {
  background-color: #f3f4f6; /* match your preview bg */
}

.cms-box {
  position: absolute;
  overflow: hidden;
}

.cms-text {
  padding: 4px;
  word-wrap: break-word;
}

.cms-image {
  display: block;
}
</style>
