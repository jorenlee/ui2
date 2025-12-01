<template>
  <div class="relative w-full h-screen bg-gray-100 p-4 select-none overflow-x-hidden">

    <!-- Top Controls -->
    <div class="flex gap-2 mb-4">
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
    </div>

    <!-- Boxes -->
    <div
      v-for="(b, index) in boxes"
      :key="b.id"
      class="absolute border border-purple-600 rounded-md shadow-md"
      :style="{
        width: b.width + 'px',
        height: b.height + 'px',
        top: b.top + 'px',
        left: b.left + 'px'
      }"
    >

      <!-- MENU ABOVE BOX -->
      <div
        v-if="editMode"
        class="absolute -top-14 left-0 w-full bg-white shadow-md rounded p-2 flex gap-2 items-center z-50"
        @mousedown.stop
      >
        <!-- DRAG HANDLE -->
        <div
          class="w-full p-1 bg-purple-600 text-white text-xs cursor-move flex items-center gap-1 rounded-t-md"
          @mousedown.stop="startDrag($event, index)"
        >
          <i class="fa-solid fa-arrows-up-down-left-right"></i> Drag
        </div>

        <!-- TYPE SELECT -->
        <select v-model="b.type" class="border rounded px-1 text-sm">
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="image_link">Image Link</option>
          <option value="video">Video</option>
          <option value="file">File</option>
        </select>

        <!-- TEXT OPTIONS -->
        <input v-if="b.type === 'text'" type="url" class="border rounded px-1 text-sm w-40" placeholder="Route Link" v-model="b.page_route_link_belong" />

        <select
          v-if="b.type === 'text'"
          v-model="b.textColor"
          class="border rounded px-1 text-sm"
        >
          <option value="text-black">Black</option>
          <option value="text-white">White</option>
          <option value="text-gray-700">Gray</option>
          <option value="text-green-600">Green</option>
          <option value="text-red-600">Red</option>
        </select>

        <select
          v-if="b.type === 'text'"
          v-model="b.bgColor"
          class="border rounded px-1 text-sm"
        >
          <option value="bg-white">White</option>
          <option value="bg-black">Black</option>
          <option value="bg-gray-200">Gray</option>
          <option value="bg-green-100">Green</option>
          <option value="bg-red-100">Red</option>
        </select>

        <!-- IMAGE UPLOAD -->
        <input
          v-if="b.type === 'image'"
          type="file"
          accept="image/*"
          class="text-sm"
          @change="handleFileUpload($event, index)"
        />

        <!-- IMAGE LINK INPUT -->
        <input
          v-if="b.type === 'image_link'"
          type="url"
          class="border rounded px-1 text-sm w-40"
          placeholder="Image URL"
          :value="b.fileData || ''"
          @input="onImageLinkInput($event, index)"
        />

        <!-- FILE UPLOAD -->
        <input
          v-if="b.type === 'file'"
          type="file"
          class="text-sm"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          @change="handleFileUpload($event, index)"
        />

        <!-- VIDEO URL -->
        <input
          v-if="b.type === 'video'"
          type="text"
          class="border rounded px-1 text-sm w-40"
          placeholder="YouTube link"
          @input="onVideoInput($event, index)"
        />
      </div>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="w-full h-full">

        <!-- TEXT BLOCK -->
        <div
          v-if="b.type === 'text'"
          class="w-full h-full p-2 whitespace-pre-wrap break-words"
          :class="[b.textColor, b.bgColor, editMode ? 'border rounded' : '']"
          :contenteditable="editMode"
          @input="onTextInput($event, index)"
        >
         
        </div>

        <!-- IMAGE UPLOAD -->
        <img
          v-if="b.type === 'image' && b.fileData"
          :src="b.fileData"
          class="w-full h-full object-contain cursor-move"
          @mousedown.stop="startDrag($event, index)"
        />

        <!-- IMAGE LINK -->
        <img
          v-if="b.type === 'image_link' && b.fileData"
          :src="b.fileData"
          class="w-full h-full object-contain cursor-move"
          @mousedown.stop="startDrag($event, index)"
        />

        <!-- FILE DISPLAY -->
        <div v-if="b.type === 'file' && b.fileData" class="w-full h-full p-2 overflow-auto border rounded bg-gray-50">
          <iframe
            v-if="b.fileType === 'pdf'"
            :src="b.fileData"
            class="w-full h-full"
          ></iframe>
          <iframe
            v-else-if="['doc','docx','xls','xlsx'].includes(b.fileType)"
            :src="getOfficeViewerURL(b.fileData)"
            class="w-full h-full"
          ></iframe>
          <a v-else :href="b.fileData" target="_blank" class="text-blue-600 underline">
            {{ b.fileName }}
          </a>
        </div>

        <!-- VIDEO -->
        <iframe
          v-if="b.type === 'video' && b.videoEmbed"
          :src="b.videoEmbed"
          class="w-full h-full"
          allowfullscreen
          @mousedown.stop
        ></iframe>
      </div>

      <!-- RESIZE HANDLE -->
      <div
        v-if="editMode"
        class="absolute bottom-0 right-0 w-4 h-4 bg-purple-600 cursor-se-resize rounded-br"
        @mousedown.stop="startResize($event, index)"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const editMode = ref(false);
const boxes = ref([]);
let boxId = 1;

// ADD BOX
function addBox() {
  boxes.value.push({
    id: boxId++,
    width: 240,
    height: 180,
    top: 100,
    left: 100,
    type: "text",
    content: "Sample Text",
    textColor: "text-black",
    bgColor: "bg-white",
    fileData: null,
    fileName: "",
    fileType: "",
    videoEmbed: null,
    page_route_link_belong: "/control-box/page1"
  });
}

// DRAGGING
let drag = null;
function startDrag(e, index) {
  if (!editMode.value) return;
  drag = {
    index,
    startX: e.clientX,
    startY: e.clientY,
    startTop: boxes.value[index].top,
    startLeft: boxes.value[index].left
  };
  document.addEventListener("mousemove", moveDrag);
  document.addEventListener("mouseup", stopDrag);
}
function moveDrag(e) {
  if (!drag) return;
  const box = boxes.value[drag.index];
  box.top = drag.startTop + (e.clientY - drag.startY);
  box.left = drag.startLeft + (e.clientX - drag.startX);
}
function stopDrag() {
  drag = null;
  document.removeEventListener("mousemove", moveDrag);
  document.removeEventListener("mouseup", stopDrag);
}

// RESIZE
let resize = null;
function startResize(e, index) {
  resize = {
    index,
    startX: e.clientX,
    startY: e.clientY,
    startW: boxes.value[index].width,
    startH: boxes.value[index].height
  };
  document.addEventListener("mousemove", moveResize);
  document.addEventListener("mouseup", stopResize);
}
function moveResize(e) {
  if (!resize) return;
  const box = boxes.value[resize.index];
  box.width = resize.startW + (e.clientX - resize.startX);
  box.height = resize.startH + (e.clientY - resize.startY);
}
function stopResize() {
  resize = null;
  document.removeEventListener("mousemove", moveResize);
  document.removeEventListener("mouseup", stopResize);
}

// TEXT INPUT
function onTextInput(e, index) {
  boxes.value[index].content = e.target.innerText;
}

// IMAGE LINK INPUT
function onImageLinkInput(e, index) {
  boxes.value[index].fileData = e.target.value;
}

// IMAGE/FILE UPLOAD
function handleFileUpload(event, index) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    boxes.value[index].fileData = reader.result;
    boxes.value[index].fileName = file.name;

    const ext = file.name.split('.').pop().toLowerCase();
    boxes.value[index].fileType = ext;
  };
  reader.readAsDataURL(file);
}

// OFFICE VIEWER
function getOfficeViewerURL(fileData) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileData)}`;
}

// VIDEO INPUT (YouTube)
function onVideoInput(event, index) {
  const url = event.target.value;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const embed = convertYouTubeLink(url);
    boxes.value[index].videoEmbed = embed;
  }
}
function convertYouTubeLink(url) {
  let id = "";
  if (url.includes("v=")) id = url.split("v=")[1].split("&")[0];
  else if (url.includes("youtu.be")) id = url.split(".be/")[1];
  return "https://www.youtube.com/embed/" + id;
}
</script>

<style scoped></style>
