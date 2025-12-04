

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const id = route.params.id;

const sdgsCategory = [
  { title: "No Poverty", id: "no-poverty", color: "#ce3a43" },
  { title: "Zero Hunger", id: "zero-hunger", color: "#d4a850" },
  {
    title: "Good Health and Well-Being",
    id: "good-health-and-well-being",
    color: "#6a9e52",
  },
  { title: "Quality Education", id: "quality-education", color: "#b33335" },
  { title: "Gender Equality", id: "gender-equality", color: "#d84f39" },
  {
    title: "Clean Water and Sanitation",
    id: "clean-water-and-sanitation",
    color: "#6abbe1",
  },
  {
    title: "Affordable and Clean Energy",
    id: "affordable-and-clean-energy",
    color: "#f2c548",
  },
  {
    title: "Decent Work and Economic Growth",
    id: "decent-work-and-economic-growth",
    color: "#922a45",
  },
  {
    title: "Industry, Innovation, and Infrastructure",
    id: "industry-innovation-and-infrastructure",
    color: "#de723f",
  },
  {
    title: "Reduced Inequalities",
    id: "reduced-inequalities",
    color: "#c93281",
  },
  {
    title: "Sustainable Cities and Communities",
    id: "sustainable-cities-and-communities",
    color: "#e9a047",
  },
  {
    title: "Responsible Consumption and Production",
    id: "responsible-consumption-and-production",
    color: "#b78e40",
  },
  { title: "Climate Action", id: "climate-action", color: "#557d4c" },
  { title: "Life Below Water", id: "life-below-water", color: "#5394ce" },
  { title: "Life on Land", id: "life-on-land", color: "#7bb758" },
  {
    title: "Peace, Justice, and Strong Institutions",
    id: "peace-justice-and-strong-institutions",
    color: "#39689a",
  },
  {
    title: "Partnerships for the Goals",
    id: "partnerships-for-the-goals",
    color: "#294868",
  },
];

const sdg = sdgsCategory.find((s) => s.id === id);
if (!sdg) {
  throw createError({
    statusCode: 404,
    message: "SDG Not Found",
  });
}

// News fetching
const display = ref("desktop");
const info = ref([]);
const loading = ref(true);
const errorMsg = ref("");

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

onMounted(async () => {
  try {
    const res = await $fetch(endpoint.value + "/api/cms/list/");
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
  <div class="min-h-screen bg-white">
    <Header />

    <!-- Banner -->
    <div class="relative">
      <Banner />
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="align-top w-full h-36 object-cover lg:hidden block"
      />
      <div
        class="absolute top-1/2 left-0 w-full text-center -translate-y-1/2 mt-5"
      >
        <h1
          class="font-bold uppercase text-white lg:text-2xl text-lg text-left w-11/12 mx-auto"
        >
          Sustainability
        </h1>
      </div>
      <div class="pt-2.5 pb-3 shadow-lg">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li><a href="/" class="mr-1">Home</a></li>
          <li>
            <i class="fas fa-caret-right mr-1"></i
            ><a href="/sdgs">Sustainability</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Layout -->
    <div class="lg:flex w-11/12 mx-auto py-5 gap-6">
      <!-- Side Menu -->

  
        <div class="shadow lg:w-3/12  bg-white">
          <div>
            <ul class="w-full">
              <li class="w-full">
                <span
                  class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 lg:text-base text-sm"
                >
                  Sustainable Development Goals
                </span>
                <ul>
                  <li v-for="(item, i) in sdgsCategory" :key="i">
                    <a
                      :href="`/sdgs/${item.id}`"
                      class="whitespace-nowrap lg:pr-2 items-center green-800-white px-2 py-3 font-bold flex border-b lg:pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer"
                      :class="{ 'bg-green-200': item.id === sdg.id }"
                    >
                      <span class="px-3 font-bold"> {{ i + 1 }}</span>
                      {{ item.title }}
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      

      <!-- SDG Content -->
      <main class="lg:w-3/4 w-full">
        <h1 class="text-3xl font-bold mb-4 text-center" :style="{ color: sdg.color }">
          {{ sdg.title }}
        </h1>

        <img
          :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/SDGsV1/TheGlobalGoals_Icons_Color_Goal_${
            sdgsCategory.indexOf(sdg) + 1
          }.png`"
          class="w-44 mb-5 mx-auto"
        />

        <p class="text-lg text-gray-700 mb-10">
          This is the dynamic page for <strong>{{ sdg.title }}</strong
          >. Add details such as **Events, Targets, Actions, News, Photos**,
          etc. (Sample Content)
        </p>

        <!-- News Grid -->
        <div v-if="info.length" class="grid lg:grid-cols-4 grid-cols-2 gap-4">
          <div
            v-for="(j, i) in info.slice(0, 4)"
            :key="i"
            class="w-full shadow-green-900 rounded bg-white text-green-900 shadow-2xl overflow-hidden transition-transform hover:scale-[1.02]"
          >
            <NuxtLink
              :to="'/news-updates/' + j.id"
              class="block relative overflow-hidden"
            >
              <div
                class="lg:min-h-[70px] lg:px-3 lg:py-3 py-2 tracking-tighter leading-tight text-center font-semibold flex items-center justify-center text-[9px] lg:text-xs"
              >
                {{ j.title }}
              </div>
              <div class="border-t-4 border-t-[#ffffff] w-full">
                <img
                  :src="j.thumbnails[0]?.url"
                  class="w-full lg:h-[220px] object-cover transition-transform hover:scale-110"
                />
              </div>
            </NuxtLink>
          </div>
        </div>

        <p
          v-if="!info.length && !loading"
          class="text-center text-gray-400 mt-10"
        >
          {{ errorMsg || "No news available." }}
        </p>
      </main>
    </div>

    <Footer />
  </div>
</template>
