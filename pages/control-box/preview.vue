<template>
  <div class="relative w-full h-screen  p-4 select-none overflow-x-hidden">
    
    <!-- Top Controls -->
    <div class="flex gap-2 mb-4 items-center">
  
<!-- 
      <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" @click="editMode = !editMode">
        {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
      </button>

   -->

      <div class="ml-4 flex items-center gap-2">
        Assign Route Page:
        {{ currentPage }}
      </div>
    </div>

    <!-- BOXES -->
    <div
      v-for="b in boxesForPage"
      :key="b.cms_id"
      class="absolute rounded-md bg-white"
      :style="{ 
        width: (b.component_width || 240) + 'px', 
        height: (b.component_height || 180) + 'px',
        top: (b.component_top || 100) + 'px',
        left: (b.component_left || 100) + 'px',
        zIndex: b.zIndex || 1
      }"
      @mousedown="bringToFront(b)"
      @click="!editMode"
    >
      
      <!-- EDIT MENU -->
      <div v-if="editMode" class="absolute -top-14 left-0 w-full bg-white shadow-md rounded p-2 flex gap-2 items-center z-50" @mousedown.stop>
        <div class="px-2 py-1 bg-purple-600 text-white text-xs cursor-move rounded" @mousedown.stop="startDrag($event, b.cms_id)">
          Drag
        </div>

        <select v-model="b.component_type" class="border rounded px-1 text-sm" @change="ensureFileUrl(b)">
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="image_link">Image Link</option>
          <option value="video">Video</option>
          <option value="file">File</option>
        </select>

        <input type="text" v-model="b.page_route_link_belong" class="border rounded px-1 text-sm w-32" placeholder="page1" />

        <!-- UPLOAD -->
        <input v-if="b.component_type === 'image' || b.component_type === 'file'" type="file" @change="handleFileUpload($event, b.cms_id)" />

        <!-- SAFE IMAGE LINK -->
        <input v-if="b.component_type === 'image_link'" type="url" v-model="b.file_url[0].url" class="border rounded px-1 w-40" placeholder="Image URL" @focus="ensureFileUrl(b)" />

        <!-- VIDEO -->
        <input v-if="b.component_type === 'video'" type="url" @input="onVideoInput($event, b.cms_id)" class="border rounded px-1 w-40" placeholder="YouTube URL" />
      </div>

      <!-- CONTENT -->
      <div class="w-full h-full p-2 overflow-hidden">
        <!-- TEXT -->
        <div v-if="b.component_type === 'text'" class="w-full h-full whitespace-pre-wrap" >
        {{ b.component_content }}
        </div>

        <!-- IMAGE -->
        <img v-if="['image','image_link'].includes(b.component_type) && b.file_url.length && b.file_url[0].url" :src="b.file_url[0].url" class="w-full h-full object-contain" />

        <!-- VIDEO -->
        <iframe v-if="b.component_type === 'video' && b.component_properties.videoEmbed" :src="b.component_properties.videoEmbed" class="w-full h-64" frameborder="0" allowfullscreen />

        <!-- FILE -->
        <iframe v-if="b.component_type === 'file' && b.file_url.length && b.file_url[0].url" :src="b.file_url[0].url" class="w-full h-full" />
      </div>

      <!-- RESIZE HANDLE -->
      <div v-if="editMode" class="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 cursor-se-resize rounded-br" @mousedown.stop="startResize($event, b.cms_id)"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import moment from "moment";

const router = useRouter();
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const editMode = ref(false);
const currentPage = ref("page1"); // <-- no leading slash
const boxes = ref([]);
let zIndexCounter = 10;

/* ----------------- LOAD BOXES ----------------- */
onMounted(() => loadBoxes());

async function loadBoxes() {
  try {
    const res = await fetch(`${endpoint.value}/api/cms/boxes/`);
    if (!res.ok) {
      boxes.value = [];
      return;
    }
    const data = await res.json();
    const incoming = Array.isArray(data?.boxes) ? data.boxes : [];
    boxes.value = incoming.map((b) => ({
      file_url: Array.isArray(b.file_url) ? b.file_url : (b.file_url ? [{ url: b.file_url }] : []),
      component_properties: b.component_properties || {},
      zIndex: ++zIndexCounter,
      cms_id: b.cms_id || "CMS" + moment().valueOf(),
      component_width: Number(b.component_width) || 240,
      component_height: Number(b.component_height) || 180,
      component_top: Number(b.component_top) || 100,
      component_left: Number(b.component_left) || 100,
      component_type: b.component_type || "text",
      component_content: b.component_content || "",
      page_route_link_belong: b.page_route_link_belong || currentPage.value
    }));
  } catch (err) {
    console.error("loadBoxes error:", err);
    boxes.value = [];
  }
}

const boxesForPage = computed(() =>
  boxes.value.filter(b => b.page_route_link_belong === currentPage.value)
);





</script>
