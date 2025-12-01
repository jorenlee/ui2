<template>
  <div
    class="relative w-full h-screen bg-gray-100 p-4 select-none overflow-x-hidden"
  >
    <!-- Top Controls -->
    <div class="flex gap-2 mb-4 items-center">
      <button
        class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        @click="addBox"
      >
        Add Box
      </button>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        @click="editMode = !editMode"
      >
        {{ editMode ? "Disable Edit Mode" : "Enable Edit Mode" }}
      </button>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        @click="saveBoxes"
      >
        Save Boxes
      </button>
      <button
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        @click="deleteAllBoxes"
      >
        Delete All Boxes
      </button>
      <div class="ml-4 flex items-center gap-2">
        Current Page:
        <input
          type="text"
          v-model="currentPage"
          class="border rounded px-1 w-32"
        />
      </div>
    </div>

    <!-- Toast -->
    <div
      v-if="toast.show"
      :class="[
        'fixed top-4 right-4 px-4 py-2 rounded shadow text-white',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600',
      ]"
    >
      {{ toast.message }}
    </div>

    <!-- BOXES -->
    <div
      v-for="b in boxesForPage"
      :key="b.cms_id"
      class="absolute border border-purple-600 rounded-md shadow-md bg-white"
      :class="b.component_design_styles"
      :style="{
        width: (b.component_width || 240) + 'px',
        height: (b.component_height || 180) + 'px',
        top: (b.component_top || 100) + 'px',
        left: (b.component_left || 100) + 'px',
        zIndex: b.zIndex || 1,
      }"
      @mousedown="bringToFront(b)"
    >
      <!-- EDIT MENU -->
      <div
        v-if="editMode"
        class="absolute -top-14 left-0 flex w-full z-50"
        @mousedown.stop
      >
        <div class="flex bg-black p-2">
          <div class="flex gap-2 items-center">
            <div
              class="px-2 py-1 bg-purple-600 text-white text-xs cursor-move rounded"
              @mousedown.stop="startDrag($event, b.cms_id)"
            >
              Drag
            </div>
            <select
              v-model="b.component_type"
              class="border rounded px-1 text-sm"
              @change="onTypeChange(b)"
            >
              <option value="text">Text</option>
              <option value="image">Image</option>
              <option value="image_link">Image Link</option>
              <option value="video">Video</option>
              <option value="file">File</option>
            </select>
          </div>

          <!-- STYLE SELECTOR -->
          <div class="flex gap-2 w-full">
            <template v-if="b.component_type === 'text'">
              <select
                v-model="b.component_design_styles_color"
                class="border rounded px-1 text-sm"
                @change="updateDesignStyles(b)"
              >
                <option value="">Default Color</option>
                <option value="text-green-600">Green</option>
                <option value="text-black">Black</option>
                <option value="text-white">White</option>
                <option value="text-gray-600">Gray</option>
              </select>
              <select
                v-model="b.component_design_styles_size"
                class="border rounded px-1 text-sm"
                @change="updateDesignStyles(b)"
              >
                <option value="">Font Size</option>
                <option value="text-2xl">Title</option>
                <option value="text-xl">Subtitle</option>
                <option value="text-base">Paragraph</option>
                <option value="text-sm">Small Caption</option>
              </select>
              <select
                v-model="b.component_design_styles_weight"
                class="border rounded px-1 text-sm"
                @change="updateDesignStyles(b)"
              >
                <option value="">Font Weight</option>
                <option value="font-light">Light</option>
                <option value="font-normal">Normal</option>
                <option value="font-bold">Bold</option>
              </select>
            </template>
            <template
              v-else-if="
                b.component_type === 'image' ||
                b.component_type === 'image_link'
              "
            >
              <select
                v-model="b.component_design_styles_shape"
                class="border rounded px-1 text-sm"
                @change="updateDesignStyles(b)"
              >
                <option value="">Default Shape</option>
                <option value="rounded-full">Round Full</option>
                <option value="rounded-sm">Round Sm</option>
                <option value="rounded-md">Round Md</option>
                <option value="rounded-lg">Round Lg</option>
                <option value="rounded-xl">Round Xl</option>
              </select>
            </template>
          </div>

          <!-- UPLOAD / LINK -->
          <input
            v-if="b.component_type === 'image' || b.component_type === 'file'"
            type="file"
            @change="handleFileUpload($event, b.cms_id)"
          />
          <input
            v-if="b.component_type === 'image_link'"
            type="url"
            v-model="b.file_url[0].url"
            class="border rounded px-1 w-40"
            placeholder="Image URL"
            @focus="ensureFileUrl(b)"
          />
          <input
            v-if="b.component_type === 'video'"
            type="url"
            :value="getVideoUrl(b)"
            @input="onVideoInput($event, b.cms_id)"
            class="border rounded px-1 w-40"
            placeholder="YouTube URL"
          />

          <input
            type="text"
            v-model="b.page_route_link_belong"
            class="border rounded px-1 text-sm w-32"
            placeholder="page1"
          />
          <button
            class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
            @click="deleteBox(b.cms_id)"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- CONTENT -->
      <div class="w-full h-auto">
        <textarea
          v-if="b.component_type === 'text'"
          v-model="b.component_content"
          class="w-full h-auto whitespace-pre-wrap"
          :readonly="!editMode || b.status === 'disabled'"
        ></textarea>
        <img
          v-if="
            ['image', 'image_link'].includes(b.component_type) &&
            b.file_url.length &&
            b.file_url[0].url
          "
          :src="b.file_url[0].url"
          class="w-full h-auto object-contain"
        />
        <iframe
          v-if="
            b.component_type === 'video' &&
            b.file_url.length &&
            b.file_url[0].url
          "
          :src="b.file_url[0].url"
          class="w-full h-64"
          frameborder="0"
          allowfullscreen
        ></iframe>
        <iframe
          v-if="
            b.component_type === 'file' &&
            b.file_url.length &&
            b.file_url[0].url
          "
          :src="b.file_url[0].url"
          class="w-full h-auto"
        ></iframe>
      </div>

      <!-- RESIZE HANDLE -->
      <div
        v-if="editMode"
        class="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 cursor-se-resize rounded-br"
        @mousedown.stop="startResize($event, b.cms_id)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import moment from "moment";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const editMode = ref(false);
const currentPage = ref("page1");
const boxes = ref([]);
const toast = ref({ show: false, message: "", type: "success" });
let zIndexCounter = 10;

/* ----------------- TOAST ----------------- */
function showToast(message, type = "success") {
  toast.value = { show: true, message, type };
  setTimeout(() => (toast.value.show = false), 3000);
}

/* ----------------- LOAD BOXES ----------------- */
onMounted(() => loadBoxes());
async function loadBoxes() {
  try {
    const res = await fetch(
      `${endpoint.value}/api/cms/boxes/?page=${currentPage.value}`
    );
    if (!res.ok) {
      boxes.value = [];
      return;
    }
    const data = await res.json();
    const incoming = Array.isArray(data?.boxes) ? data.boxes : [];
    boxes.value = incoming.map((b) => {
      let fileUrl = Array.isArray(b.file_url)
        ? b.file_url
        : b.file_url
        ? [{ url: b.file_url }]
        : [];
      if (
        b.component_type &&
        b.component_type !== "text" &&
        (!fileUrl || !fileUrl.length) &&
        b.component_content
      ) {
        fileUrl = [{ url: String(b.component_content) }];
      }
      const designStyles = b.component_design_styles || "";
      const splitStyles = designStyles.split(" ").filter(Boolean);
      const color = splitStyles.find((s) => s.startsWith("text-")) || "";
      const size =
        splitStyles.find(
          (s) =>
            s.startsWith("text-") &&
            s !== color &&
            (s.includes("xl") || s.includes("base") || s.includes("sm"))
        ) || "";
      const weight = splitStyles.find((s) => s.startsWith("font-")) || "";
      const shape = splitStyles.find((s) => s.startsWith("rounded-")) || "";
      return {
        file_url: fileUrl,
        component_design_styles: designStyles,
        zIndex: ++zIndexCounter,
        cms_id: b.cms_id || "CMS" + moment().valueOf(),
        component_width: Number(b.component_width) || 700,
        component_height: Number(b.component_height) || 100,
        component_top: Number(b.component_top) || 100,
        component_left: Number(b.component_left) || 100,
        component_type: b.component_type || "text",
        component_content: b.component_content || "",
        page_route_link_belong: b.page_route_link_belong || currentPage.value,
        status: b.status || "",
        component_design_styles_color: color,
        component_design_styles_size: size,
        component_design_styles_weight: weight,
        component_design_styles_shape: shape,
      };
    });
  } catch (err) {
    console.error("loadBoxes error:", err);
    boxes.value = [];
  }
}

const boxesForPage = computed(() =>
  boxes.value.filter((b) => b.page_route_link_belong === currentPage.value)
);

/* ----------------- ADD BOX ----------------- */
function addBox() {
  boxes.value.push({
    cms_id: "CMS" + moment().valueOf(),
    component_width: 700,
    component_height: 100,
    component_top: 100,
    component_left: 100,
    component_type: "text",
    component_content: "",
    component_design_styles: "",
    file_url: [],
    page_route_link_belong: currentPage.value,
    zIndex: ++zIndexCounter,
    status: "",
    component_design_styles_color: "",
    component_design_styles_size: "",
    component_design_styles_weight: "",
    component_design_styles_shape: "",
  });
}

/* ----------------- FILE UPLOAD ----------------- */
function ensureFileUrl(b) {
  if (!Array.isArray(b.file_url) || !b.file_url.length)
    b.file_url = [{ url: "" }];
}
async function handleFileUpload(e, id) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("file", file);
  try {
    const res = await fetch(`${endpoint.value}/api/cms/upload-file/`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    const i = boxes.value.findIndex((b) => b.cms_id === id);
    if (i === -1) return;
    ensureFileUrl(boxes.value[i]);
    boxes.value[i].file_url[0].url = data.storage_url || data.url || "";
    boxes.value[i].file_url[0].name = data.name || file.name;
  } catch (err) {
    console.error("upload error", err);
    showToast("File upload failed", "error");
  }
}

/* ----------------- VIDEO ----------------- */
function onVideoInput(e, id) {
  const url = e.target.value;
  const i = boxes.value.findIndex((b) => b.cms_id === id);
  if (i === -1) return;
  try {
    const u = new URL(url);
    let vid = "";
    if (u.hostname.includes("youtube.com")) vid = u.searchParams.get("v");
    else if (u.hostname.includes("youtu.be")) vid = u.pathname.substring(1);
    ensureFileUrl(boxes.value[i]);
    boxes.value[i].file_url[0].url = vid
      ? `https://www.youtube.com/embed/${vid}`
      : url;
    boxes.value[i].file_url[0].name = vid ? `youtube-${vid}` : "video";
    boxes.value[i].component_type = "video";
    boxes.value[i].component_content = "";
  } catch {
    ensureFileUrl(boxes.value[i]);
    boxes.value[i].file_url[0].url = url;
    boxes.value[i].file_url[0].name = "video";
    boxes.value[i].component_type = "video";
    boxes.value[i].component_content = "";
  }
}
function getVideoUrl(b) {
  return (b.file_url && b.file_url[0] && b.file_url[0].url) || "";
}

/* ----------------- SAVE ----------------- */
async function saveBoxes() {
  const payload = boxes.value.map((b) => {
    const isText = b.component_type === "text";
    const file_url = Array.isArray(b.file_url)
      ? b.file_url
      : b.file_url
      ? [{ url: b.file_url }]
      : [];
    return {
      cms_id: b.cms_id,
      component_width: String(b.component_width || ""),
      component_height: String(b.component_height || ""),
      component_top: String(b.component_top || ""),
      component_left: String(b.component_left || ""),
      component_type: b.component_type || "text",
      component_content: isText ? b.component_content || "" : "",
      component_design_styles:
        b.component_design_styles ||
        [
          b.component_design_styles_color,
          b.component_design_styles_size,
          b.component_design_styles_weight,
          b.component_design_styles_shape,
        ]
          .filter(Boolean)
          .join(" "),
      file_url: isText ? [] : file_url,
      page_route_link_belong: b.page_route_link_belong || currentPage.value,
    };
  });
  try {
    const res = await fetch(`${endpoint.value}/api/cms/boxes/save/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(await res.text());
      showToast("Save failed", "error");
      return;
    }
    const data = await res.json();
    showToast(data.message || "Saved successfully!");
    loadBoxes();
  } catch (err) {
    console.error(err);
    showToast("Save failed", "error");
  }
}

/* ----------------- DELETE ----------------- */
async function deleteBox(id) {
  const i = boxes.value.findIndex((b) => b.cms_id === id);
  if (i === -1) return;
  const box = boxes.value.splice(i, 1)[0];
  try {
    const res = await fetch(`${endpoint.value}/api/cms/boxes/delete/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cms_id: id }),
    });
    if (!res.ok) boxes.value.push(box);
    showToast("Box deleted");
  } catch (err) {
    console.error(err);
    boxes.value.push(box);
    showToast("Delete failed", "error");
  }
}

async function deleteAllBoxes() {
  const toDelete = boxes.value.filter(
    (b) => b.page_route_link_belong === currentPage.value
  );
  if (!toDelete.length) return;
  boxes.value = boxes.value.filter(
    (b) => b.page_route_link_belong !== currentPage.value
  );
  const cms_ids = toDelete.map((b) => b.cms_id);
  try {
    const res = await fetch(
      `${endpoint.value}/api/cms/boxes/delete-multiple/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cms_ids }),
      }
    );
    if (!res.ok) boxes.value.push(...toDelete);
    showToast("All boxes deleted");
  } catch (err) {
    console.error(err);
    boxes.value.push(...toDelete);
    showToast("Delete failed", "error");
  }
}

/* ----------------- DRAG ----------------- */
let dragId = null,
  offsetX = 0,
  offsetY = 0;

function startDrag(e, id) {
  dragId = id;
  const box = boxes.value.find((b) => b.cms_id === id);
  offsetX = e.clientX - (Number(box.component_left) || 0);
  offsetY = e.clientY - (Number(box.component_top) || 0);
  window.addEventListener("mousemove", dragMove);
  window.addEventListener("mouseup", dragStop);
}

function dragMove(e) {
  if (!dragId) return;
  const box = boxes.value.find((b) => b.cms_id === dragId);
  box.component_left = e.clientX - offsetX;
  box.component_top = e.clientY - offsetY;
}

function dragStop() {
  dragId = null;
  window.removeEventListener("mousemove", dragMove);
  window.removeEventListener("mouseup", dragStop);
}

/* ----------------- RESIZE ----------------- */
let resizeId = null,
  startW = 0,
  startH = 0,
  startX = 0,
  startY = 0;
function startResize(e, id) {
  resizeId = id;
  const box = boxes.value.find((b) => b.cms_id === id);
  startW = Number(box.component_width) || 0;
  startH = Number(box.component_height) || 0;
  startX = e.clientX;
  startY = e.clientY;
  window.addEventListener("mousemove", resizeMove);
  window.addEventListener("mouseup", resizeStop);
}
function resizeMove(e) {
  if (!resizeId) return;
  const box = boxes.value.find((b) => b.cms_id === resizeId);
  box.component_width = Math.max(40, startW + (e.clientX - startX));
  box.component_height = Math.max(40, startH + (e.clientY - startY));
}
function resizeStop() {
  resizeId = null;
  window.removeEventListener("mousemove", resizeMove);
  window.removeEventListener("mouseup", resizeStop);
}

/* ----------------- Z-INDEX ----------------- */
function bringToFront(b) {
  if (!editMode.value) return;
  b.zIndex = ++zIndexCounter;
}

/* ----------------- HELPERS ----------------- */
function onTypeChange(b) {
  if (b.component_type === "text") return;
  ensureFileUrl(b);
  if (
    (!b.file_url || !b.file_url.length || !b.file_url[0].url) &&
    b.component_content
  ) {
    b.file_url[0].url = b.component_content;
    b.file_url[0].name = "migrated";
  }
  b.component_content = "";
}

function updateDesignStyles(b) {
  const parts = [
    b.component_design_styles_color,
    b.component_design_styles_size,
    b.component_design_styles_weight,
    b.component_design_styles_shape,
  ].filter(Boolean);
  b.component_design_styles = parts.join(" ");
}
</script>
