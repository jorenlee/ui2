<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useUserStore } from "@/stores/user";

const info = ref([]);
const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

let intervalId = null;

/* ======================================
   BOARD OF TRUSTEES (BOT ONLY)
====================================== */
const botMembers = computed(() => {
  const excludedFilters = [
    "programs",
    "organizational chart",
    "college",
    "oer",
  ];

  const getOrderNumber = (filters) => {
    if (!filters) return Number.MAX_SAFE_INTEGER;

    const match = filters.match(/,\s*(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  };

  return info.value
    .filter((item) => {
      if (!item?.filters) return false;
      const filters = item.filters.toLowerCase();
      if (!filters.includes("published")) return false;
      if (!filters.includes("bot")) return false;
      return !excludedFilters.some((word) => filters.includes(word));
    })
    .sort((a, b) => getOrderNumber(a.filters) - getOrderNumber(b.filters));
});

/* ======================================
   SILENT REAL-TIME FETCH
====================================== */
const fetchBOT = async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    // Only update if data changed
    if (JSON.stringify(res) !== JSON.stringify(info.value)) {
      info.value = Array.isArray(res) ? res : [];
    }
  } catch (error) {
    console.error("Silent fetch error:", error);
  }
};

onMounted(() => {
  // initial fetch
  fetchBOT();

  // silent auto-refresh every 1 second
  intervalId = setInterval(fetchBOT, 1000);
});

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <div class="bg-gray-50">
    <Header />

    <div>
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />

        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Administration
            <span class="lg:text-base text-xs lg:mt-5 ml-5">
              A.Y. 2025-2026
            </span>
          </h1>
        </div>

        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/administration" class="mr-1"> Administration </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/administration" class="mr-1"> Board of Trustees </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- LEFT SIDEBAR -->
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <ul class="w-full">
          <li class="w-full">
            <span
              class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base"
            >
              LSU Administration
            </span>
            <ul>
              <li>
                <a
                  href="/administration"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs bg-gray-300"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Organizational Chart
                </a>
              </li>
              <li>
                <a
                  href="/administration/bot"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Board of Trustees and Officers
                </a>
              </li>
              <li>
                <a
                  href="/administration/op-ovp"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  President and Vice Presidents
                </a>
              </li>
              <li>
                <a
                  href="/administration/oc-cd"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Chancellor and Deans
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div
        class="lg:w-9/12 my-8 bg-white border border-green-100 rounded-xl shadow-sm p-6"
      >
        <!-- HEADER -->
        <div class="mb-6">
          <h2
            class="text-green-800 font-extrabold uppercase text-lg tracking-wide border-b-2 border-green-600 pb-2"
          >
            Board of Trustees
          </h2>
          <p class="text-xs text-gray-500 mt-1">
            Leadership and governance of the institution
          </p>
        </div>

        <!-- LOADING -->
        <div v-if="loading" class="text-center py-14 text-gray-500 text-sm">
          Loading Board of Trustees…
        </div>

        <!-- ERROR -->
        <div
          v-else-if="errorMsg"
          class="text-center py-14 text-red-600 text-sm font-medium"
        >
          {{ errorMsg }}
        </div>

        <!-- GRID -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <div
            v-for="(member, index) in botMembers"
            :key="index"
            class="group bg-white border-4 border-green-50 rounded-xl overflow-hidden shadow-xl hover:shadow-md transition duration-300"
          >
            <!-- IMAGE -->
            <div class="relative overflow-hidden pt-7">
              <img
                :src="member.links?.[0] || 'https://via.placeholder.com/300'"
                class="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                alt="Board of Trustee"
              />
              <div
                class="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/10 transition"
              ></div>
            </div>

            <!-- INFO -->
            <div class="p-4 text-center">
              <h3
                class="font-bold text-sm text-green-900 uppercase leading-tight"
              >
                {{ member.title }}
              </h3>
              <p class="text-xs text-gray-600 mt-1">
                {{ member.descriptions }}
              </p>

              <!-- ACCENT LINE -->
              <div
                class="mt-3 h-0.5 w-10 mx-auto bg-green-600 rounded-full"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
