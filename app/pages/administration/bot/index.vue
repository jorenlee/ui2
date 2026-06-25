<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";


const info = ref([]);
const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const breadcrumbs = ref([
  { label: "Home", url: "/" },
  { label: "Administration", url: "/administration" },
  { label: "Board of Trustees", url: "/administration" },
]);

const sidebarLinks = ref([
  { label: "Organizational Chart", url: "/administration" },
  { label: "Board of Trustees and Officers", url: "/administration/bot" },
  { label: "President and Vice Presidents", url: "/administration/op-ovp" },
  { label: "Chancellor and Deans", url: "/administration/oc-cd" },
]);

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
              A.Y. 2026-2027
            </span>
          </h1>
        </div>

        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li v-for="(item, index) in breadcrumbs" :key="index">
              <i v-if="index > 0" class="fas fa-caret-right mr-1"></i>
              <a :href="item.url" class="mr-1"> {{ item.label }} </a>
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
              <li v-for="(link, index) in sidebarLinks" :key="index">
                <a
                  :href="link.url"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div
        class="lg:w-9/12 my-8 bg-white border border-green-100 rounded-xl shadow-sm p-6">
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
          class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-7 gap-y-5"
        >
          <div
            v-for="(member, index) in botMembers"
            :key="index"
            class="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
          >
            <!-- IMAGE -->
            <div class="relative w-full h-56 overflow-hidden bg-gray-50">
              <img
                :src="member.links?.[0] || 'https://via.placeholder.com/300'"
                class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out"
                alt="Board of Trustee"
              />
              <div
                class="absolute inset-0 bg-green-900/0 group-hover:bg-green-900/5 transition-colors duration-500"
              ></div>
            </div>

            <!-- INFO -->
            <div class="px-1 py-5 text-center mt-auto flex flex-col items-center bg-white relative z-10">
              <h3
                class="font-bold text-sm text-green-900 uppercase tracking-wider leading-snug"
              >
                {{ member.title }}
              </h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                {{ member.descriptions }}
              </p>

              <!-- ACCENT LINE -->
              <div
                class="mt-1 h-[2px] w-8 mx-auto bg-green-700 rounded-full transition-all duration-300 group-hover:w-12 group-hover:bg-green-600"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>
