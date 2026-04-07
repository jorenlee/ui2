import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBoxesStore = defineStore('boxes', () => {
  const boxes = ref([]);
  let boxId = ref(1);

  function addBox() {
    const pageId = `page${boxId.value}`;
    boxes.value.push({
      id: boxId.value++,
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
      page_route_link_belong: pageId
    });
  }

  return { boxes, addBox };
});
