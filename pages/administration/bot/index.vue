<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

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

    // Matches: "BOT, 1", "Published, BOT, 12"
    const match = filters.match(/,\s*(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  };

  return info.value
    .filter((item) => {
      if (!item?.filters) return false;

      const filters = item.filters.toLowerCase();

      // must be Published
      if (!filters.includes("published")) return false;

      // MUST be Board of Trustees
      if (!filters.includes("bot")) return false;

      // exclude unwanted filters
      return !excludedFilters.some((word) => filters.includes(word));
    })
    .sort((a, b) => {
      return getOrderNumber(a.filters) - getOrderNumber(b.filters);
    });
});

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/content/list/");
    info.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Error fetching list:", error);
    errorMsg.value = "Failed to load news & updates.";
  } finally {
    loading.value = false;
  }
  await nextTick();
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
              <a href="/administration" class="mr-1">
                Board of Trustees
              </a>
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

      <!-- =========================
        BOARD OF TRUSTEES GRID
      ========================== -->
      <div class="lg:w-9/12 my-5 bg-white shadow p-5">
        <h2
          class="text-green-800 font-bold uppercase text-lg mb-4 border-b pb-2"
        >
          Board of Trustees
        </h2>

        <div v-if="loading" class="text-center py-10 text-gray-500 text-sm">
          Loading Board of Trustees...
        </div>

        <div
          v-else-if="errorMsg"
          class="text-center py-10 text-red-600 text-sm"
        >
          {{ errorMsg }}
        </div>

        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div
            v-for="(member, index) in botMembers"
            :key="index"
            class="text-center hover:shadow-lg transition shadow pb-3"
          >
            <img
              :src="member.links?.[0] || 'https://via.placeholder.com/300'"
              class="w-80 h-80 mx-auto object-cover rounded-xl"
              alt="Board of Trustee"
            />
            <h3
              class="mt-3 font-bold text-xs sm:text-sm text-gray-800 uppercase"
            >
              {{ member.title }}
            </h3>
            <p class="text-xs text-gray-600 mt-1">
              {{ member.descriptions }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>
