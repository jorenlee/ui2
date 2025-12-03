<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useUserStore } from "@/stores/user";
import _ from "lodash";

const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/list/");
    // console.log("res", res);
    info.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching list:", error);
    errorMsg.value = "Failed to load news & updates.";
  } finally {
    loading.value = false;
  }

  await nextTick();

  if (window.innerWidth < 800) {
    display.value = "mobile";
  }
});
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div></div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Contribute
          </h1>
        </div>

        <div class="shadow-lg text-green-700">
          <div
            class="lg:flex justify-between border-b border-gray-200 lg:pl-5 py-1"
          >
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/new-updates" class="mx-2 hover:underline lg:h-10"
                  >Contribute</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="w-full lg:py-10 py-5 relative">
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        ></div>
        <div class="relative z-10 lg:px-10 mx-auto">
          <div class="flex justify-between">
            <div class="w-fit mx-auto">
              <form class="space-y-5 w-full max-w-2xl">
                <!-- Title -->
                <div>
                  <label class="block font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    class="w-full border rounded-md p-2 focus:ring-green-600 focus:border-green-600"
                    placeholder="Enter title"
                  />
                </div>

                <!-- Subject / Keywords -->
                <div>
                  <label class="block font-semibold mb-1"
                    >Subject / Keywords</label
                  >
                  <input
                    type="text"
                    class="w-full border rounded-md p-2"
                    placeholder="Enter keywords (comma separated)"
                  />
                </div>

                <!-- Description / Summary -->
                <div>
                  <label class="block font-semibold mb-1"
                    >Description / Summary</label
                  >
                  <textarea
                    rows="3"
                    class="w-full border rounded-md p-2"
                    placeholder="Short description..."
                  ></textarea>
                </div>

                <!-- Content -->
                <div>
                  <label class="block font-semibold mb-1">Content</label>
                  <textarea
                    rows="6"
                    class="w-full border rounded-md p-2"
                    placeholder="Main content here..."
                  ></textarea>
                </div>

                <!-- Creator / Author -->
                <div>
                  <label class="block font-semibold mb-1"
                    >Creator / Author</label
                  >
                  <input
                    type="text"
                    class="w-full border rounded-md p-2"
                    placeholder="Enter author name"
                  />
                </div>

                <!-- Contributor -->
                <div>
                  <label class="block font-semibold mb-1">Contributor</label>
                  <input
                    type="text"
                    class="w-full border rounded-md p-2"
                    placeholder="Enter contributor name"
                  />
                </div>

                <!-- Date -->
                <div>
                  <label class="block font-semibold mb-1">Date</label>
                  <input type="date" class="w-full border rounded-md p-2" />
                </div>

                <!-- Format -->
                <div>
                  <label class="block font-semibold mb-1">Format</label>
                  <select class="w-full border rounded-md p-2">
                    <option value="">Select format</option>
                    <option>Article</option>
                    <option>Document</option>
                    <option>Image</option>
                    <option>Video</option>
                    <option>Audio</option>
                  </select>
                </div>

                <!-- Language -->
                <div>
                  <label class="block font-semibold mb-1">Language</label>
                  <select class="w-full border rounded-md p-2">
                    <option value="">Select language</option>
                    <option>English</option>
                    <option>Filipino</option>
                    <option>Cebuano</option>
                    <option>Other</option>
                  </select>
                </div>

                <!-- Image Upload -->
                <div>
                  <label class="block font-semibold mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    class="w-full border rounded-md p-2"
                  />
                </div>

                <!-- Video Upload -->
                <div>
                  <label class="block font-semibold mb-1">Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    class="w-full border rounded-md p-2"
                  />
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  class="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-800 transition"
                >
                  Submit Contribution
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.bg {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.glass-effect {
  /* Glassmorphism effect */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);

  /* Floating effect */
  transform: translateY(-10px);
  transition: all 0.3s ease;
}

.glass-effect:hover {
  transform: translateY(-15px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

/* Modal Styles */
.modal-overlay {
  animation: modalFadeIn 0.3s ease-out;
}

.modal-content {
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(5px);
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Prevent body scroll when modal is open */
.modal-open {
  overflow: hidden;
}

/* Enhanced modal backdrop */
.modal-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  pointer-events: none;
}

/* Text stroke styles */
.font-peace-sans {
  font-family: "Peace Sans", "font-peace-sans", sans-serif;
}

.text-stroke-white {
  -webkit-text-stroke: 2px white;
  -webkit-text-fill-color: #ffffff;
  paint-order: stroke fill;
  text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white,
    1px 1px 0 white, -2px -2px 0 white, 2px -2px 0 white, -2px 2px 0 white,
    2px 2px 0 white;
}

/* Custom text shadow for enhanced depth and floating effect */
.custom-text-shadow {
  text-shadow:
    /* Primary dark shadows for depth */ 0 4px 8px
      rgba(138, 125, 125, 0.8),
    0 6px 12px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4),
    0 10px 20px rgba(0, 0, 0, 0.3),
    /* Secondary gray shadows for floating effect */ 0 12px 24px
      rgba(128, 128, 128, 0.5),
    0 16px 32px rgba(128, 128, 128, 0.3), 0 20px 40px rgba(128, 128, 128, 0.2),
    0 24px 48px rgba(128, 128, 128, 0.1),
    /* Subtle glow effect for prominence */ 0 0 10px rgba(255, 255, 255, 0.4),
    0 0 20px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1),
    /* Sharp definition shadows for clarity */ 1px 1px 2px rgba(0, 0, 0, 0.9),
    2px 2px 4px rgba(0, 0, 0, 0.8), 3px 3px 6px rgba(0, 0, 0, 0.6),
    4px 4px 8px rgba(0, 0, 0, 0.4);

  /* Additional effects */
  font-weight: 100 !important;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
}
</style>
