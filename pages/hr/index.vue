<script setup>
import { ref, onMounted, onBeforeUnmount, onBeforeMount } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";

const router = useRouter();
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);
const careers = ref([]);
const isFetching = ref(false);
const selectedImage = ref(null);
const showModal = ref(false);
let intervalId = null;

// Fetch careers silently
const fetchCareers = async () => {
  if (isFetching.value) return;
  isFetching.value = true;
  try {
    const data =
      (await $fetch(`${endpoint.value}/api/humanResource/list`).catch(
        () => null
      )) || [];
    if (data && Array.isArray(data)) {
      if (JSON.stringify(data) !== JSON.stringify(careers.value)) {
        careers.value = data;
      }
    }
  } finally {
    isFetching.value = false;
  }
};

// Handle image click
const openModal = (imgUrl) => {
  selectedImage.value = imgUrl;
  showModal.value = true;
  document.body.style.overflow = "hidden"; // prevent scrolling when modal is open
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedImage.value = null;
  document.body.style.overflow = "auto";
};

// Close on ESC key
const handleKeyDown = (e) => {
  if (e.key === "Escape" && showModal.value) closeModal();
};

// Lifecycle hooks
onMounted(() => {
  fetchCareers();
  intervalId = setInterval(fetchCareers, 1000);
  window.addEventListener("keydown", handleKeyDown);
});

onBeforeUnmount(() => {
  clearInterval(intervalId);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div>
    <Header />
    <div>
      <div class="relative">
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
          class="align-top w-full h-auto lg:object-fill lg:block hidden"
        />
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/enrollment/enrollmentbg-mobile-lower-size.png"
          class="align-top w-full min-h-40 pt-12 lg:hidden block"
        />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="lg:block hidden font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            human resource
          </h1>
        </div>
        <div class="shadow-lg">
          <div class="w-11/12 mx-auto flex justify-between">
            <ul class="flex lasalle-green-text capitalize text-xs pt-2.5 pb-3">
              <li>
                <a href="/" class="mr-1"> Home </a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/hr" class="mr-1"> human resource </a>
              </li>
            </ul>
            <ul class="flex hover:text-green-800 text-white">
              <li class="px-3 h-full flex items-center capitalize text-xs">
                <a href="/hr/login" class="flex items-center">
                  <span>Admin Login</span>
                </a>
              </li>
              <li
                class="bg-green-800 px-3 h-full flex items-center capitalize text-xs"
              >
                <a href="/hr/login" class="flex items-center">
                  <i class="fa fa-user text-white" aria-hidden="true"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Careers Section -->
      <div class="w-11/12 mx-auto lg:shadow lg:px-10 lg:py-2 lg:my-10 rounded-lg">
        <h1
          class="text-center text-green-700 font-bold lg:text-3xl text-lg capitalize mt-4 lg:mb-0 mb-3"
        >
          career opportunities
        </h1>
        <ul class="lg:grid grid-cols-3 gap-5 lg:py-10">
          <li
            v-for="(c, i) in _.orderBy(careers, 'created_at', 'desc')"
            :key="i"
          >
            <div
              v-for="(j, k) in c.image_link"
              :key="k"
              class="mb-5 cursor-zoom-in group"
              @click="openModal(j.url)"
            >
              <img
                class="mx-auto w-full border shadow-lg rounded-md transition-transform duration-300 group-hover:scale-105"
                :src="j.url"
                :alt="c.title || 'career image'"
              />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Image Modal -->
    <transition name="fade">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        @click.self="closeModal"
      >
        <div class="relative w-fit">
          <button
            class="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition"
            @click="closeModal"
          >
            <i class="fa fa-times"></i>
          </button>
          <img
            :src="selectedImage"
            alt="Zoomed career image"
            class="rounded-lg shadow-lg w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </transition>

    <Footer />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
