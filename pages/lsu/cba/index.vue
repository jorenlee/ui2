<template>
  <div class="relative w-full h-screen bg-gray-100 p-4 select-none overflow-x-hidden">
    
    <!-- Top Controls -->
    <div class="flex gap-2 mb-4 items-center">
      <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700" @click="addBox">
        Add Box
      </button>

      <button class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" @click="editMode = !editMode">
        {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
      </button>

      <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" @click="saveBoxes">
        Save Boxes
      </button>

      <div class="ml-4 flex items-center gap-2">
        Current Page:
        <input type="text" v-model="currentPage" class="border rounded px-1 w-32" />
      </div>
    </div>

    <!-- BOXES -->
    <div
      v-for="b in boxesForPage"
      :key="b.cms_id"
      class="absolute border border-purple-600 rounded-md shadow-md bg-white"
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
        <textarea v-if="b.component_type === 'text'" v-model="b.component_content" class="w-full h-full whitespace-pre-wrap" >
        
        </textarea>

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
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);


const router = useRouter();
// const endpoint = ref("http://127.0.0.1:8000");

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

/* ----------------- SAFE FILE_URL ----------------- */
function ensureFileUrl(b) {
  if (!Array.isArray(b.file_url) || !b.file_url.length) {
    b.file_url = [{ url: "" }];
  }
}

/* ----------------- ADD BOX ----------------- */
function addBox() {
  const newBox = {
    cms_id: "CMS" + moment().valueOf(),
    component_width: 200,
    component_height: 200,
    component_top: 100,
    component_left: 100,
    component_type: "text",
    component_content: "",
    component_properties: {},
    file_url: [],
    page_route_link_belong: currentPage.value
  };
  boxes.value.push(newBox);
}

/* ----------------- FRONT / EDIT ----------------- */
function bringToFront(b) {
  if (!editMode.value) return;
  b.zIndex = ++zIndexCounter;
}

/* ----------------- FIND BOX INDEX ----------------- */
function findIndex(id) {
  return boxes.value.findIndex(b => b.cms_id === id);
}

/* ----------------- FILE UPLOAD ----------------- */
async function handleFileUpload(e, id) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(`${endpoint.value}/api/cms/upload-file/`, { method: "POST", body: fd });
    const data = await res.json();
    const i = findIndex(id);
    if (i === -1) return;
    ensureFileUrl(boxes.value[i]);
    boxes.value[i].file_url[0].url = data.storage_url || data.url || "";
    boxes.value[i].file_url[0].name = data.name || file.name;
  } catch (err) {
    console.error("upload error", err);
  }
}

/* ----------------- TEXT ----------------- */
function onTextInput(e, id) {
  const i = findIndex(id);
  if (i === -1) return;
  boxes.value[i].component_content = e.target.innerText;
}

/* ----------------- VIDEO ----------------- */
function onVideoInput(e, id) {
  const url = e.target.value;
  const i = findIndex(id);
  if (i === -1) return;
  try {
    const u = new URL(url);
    let vid = "";
    if (u.hostname.includes("youtube.com")) vid = u.searchParams.get("v");
    else if (u.hostname.includes("youtu.be")) vid = u.pathname.substring(1);
    if (vid) boxes.value[i].component_properties.videoEmbed = `https://www.youtube.com/embed/${vid}`;
  } catch (err) {
    console.warn("invalid video url", err);
  }
}

/* ----------------- SAVE BOXES ----------------- */
async function saveBoxes() {
  const payload = boxes.value.map(b => ({
    cms_id: b.cms_id,
    component_width: String(b.component_width || ""),
    component_height: String(b.component_height || ""),
    component_top: String(b.component_top || ""),
    component_left: String(b.component_left || ""),
    component_type: b.component_type || "text",
    component_content: b.component_content || "",
    component_properties: b.component_properties || {},
    file_url: Array.isArray(b.file_url) ? b.file_url : (b.file_url ? [{ url: b.file_url }] : []),
    page_route_link_belong: b.page_route_link_belong || currentPage.value
  }));

  try {
    const res = await fetch(`${endpoint.value}/api/cms/boxes/save/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      console.error("save error", res.status, txt);
      alert("Save failed. See console.");
      return;
    }
    const data = await res.json();
    alert(data.message || "Saved!");
    await loadBoxes();
  } catch (err) {
    console.error("saveBoxes error", err);
    alert("Save failed — check console.");
  }
}

/* ----------------- NAV ----------------- */
// function openDynamicPage(id) {
//   router.push(`/control-box/${id}`);
// }

/* ----------------- DRAG ----------------- */
let dragId = null, offsetX = 0, offsetY = 0;

function startDrag(e, id) {
  dragId = id;
  const box = boxes.value.find(b => b.cms_id === id);
  offsetX = e.clientX - (Number(box.component_left) || 0);
  offsetY = e.clientY - (Number(box.component_top) || 0);
  window.addEventListener("mousemove", dragMove);
  window.addEventListener("mouseup", dragStop);
}

function dragMove(e) {
  if (!dragId) return;
  const box = boxes.value.find(b => b.cms_id === dragId);
  box.component_left = e.clientX - offsetX;
  box.component_top = e.clientY - offsetY;
}

function dragStop() {
  dragId = null;
  window.removeEventListener("mousemove", dragMove);
  window.removeEventListener("mouseup", dragStop);
}

/* ----------------- RESIZE ----------------- */
let resizeId = null, startW = 0, startH = 0, startX = 0, startY = 0;

function startResize(e, id) {
  resizeId = id;
  const box = boxes.value.find(b => b.cms_id === id);
  startW = Number(box.component_width) || 0;
  startH = Number(box.component_height) || 0;
  startX = e.clientX;
  startY = e.clientY;
  window.addEventListener("mousemove", resizeMove);
  window.addEventListener("mouseup", resizeStop);
}

function resizeMove(e) {
  if (!resizeId) return;
  const box = boxes.value.find(b => b.cms_id === resizeId);
  box.component_width = Math.max(40, startW + (e.clientX - startX));
  box.component_height = Math.max(40, startH + (e.clientY - startY));
}

function resizeStop() {
  resizeId = null;
  window.removeEventListener("mousemove", resizeMove);
  window.removeEventListener("mouseup", resizeStop);
}
</script>
