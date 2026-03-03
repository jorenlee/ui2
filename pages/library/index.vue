<script setup>
import { ref, onMounted, computed, watch } from "vue";
import moment from "moment";

const title = ["learning resource center", "(lrc)", "LRC"];
const VMGO = [
  "The Learning Resource Center (LRC) aims to empower lifelong learning through a dynamic and inclusive hub of resources, innovation, collaboration, and linkages.",
  "The LRC enables academic excellence and personal growth by offering comprehensive resources, expert assistance, and collaborative space that empower the students, faculty, staff and other stakeholders to thrive in their pursuit of knowledge and lifelong learning.",
  "The LRC elevates the learning experience by continuously enhancing its offerings, accessibility, and assistance services through innovative resources, personalized support, and collaborative spaces to foster a culture of academic achievement among students, faculty, staff, and other stakeholders.",
  [
    "Expand Resource Accessibility: Increase the availability of physical and digital learning resources, ensuring diverse formats and topics to cater to the varied academic needs of students, faculty, and researchers.",
    "Foster Information Literacy: Develop and implement targeted programs that equip students with essential information literacy skills, empowering them to critically evaluate, use, and ethnically cite information from various sources.",
    "Enhance Technological Proficiency: Offer workshops and resources that assist the university community in developing proficiency with digital tools and technologies, supporting effective research, collaboration, and learning.",
    "Strengthen Collaborative Spaces: Design and maintain welcoming and adaptable collaborative spaces within the Learning Resource Center, facilitating interdisciplinary interactions, group projects, and knowledge-sharing among users.",
    "Provide Expert Assistance: Bolster personalzied support by recruiting skilled librarians and staff who can offer expert guidance, reference services, and assistance in navigating resources effectively.",
    "Measure and Improve Impact: Implement regular assessment strategies to gauge the effectiveness of Learning Resource Center services and resources, using feedback to make informed enhanced enhancements that align with the evolving needs of the university community.",
  ],
];

const library = ref(null);
const loading = ref(false);

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

// SDG Colors mapping
const sdgColors = {
  1: "#e5243b", // No Poverty
  2: "#dda63a", // Zero Hunger
  3: "#4c9f38", // Good Health and Well-being
  4: "#c5192d", // Quality Education
  5: "#ff3a21", // Gender Equality
  6: "#26bde2", // Clean Water and Sanitation
  7: "#fcc30b", // Affordable and Clean Energy
  8: "#a21942", // Decent Work and Economic Growth
  9: "#fd6925", // Industry, Innovation and Infrastructure
  10: "#dd1367", // Reduced Inequalities
  11: "#fd9d24", // Sustainable Cities and Communities
  12: "#bf8b2e", // Responsible Consumption and Production
  13: "#3f7e44", // Climate Action
  14: "#0a97d9", // Life Below Water
  15: "#56c02b", // Life on Land
  16: "#00689d", // Peace, Justice and Strong Institutions
  17: "#19486a", // Partnerships for the Goals
};

// Helper function to get SDG color
const getSdgColor = (sdgNumber) => {
  return sdgColors[sdgNumber] || "#6b7280"; // Default gray if not found
};

// Add computed property for SDG badges - exact matches only
const getSdgBadges = (item) => {
  if (!item?.filters) return [];

  const filters = item.filters.toLowerCase();
  const badges = [];

  // Check for exact SDG mentions using word boundaries
  for (let i = 1; i <= 17; i++) {
    const patterns = [
      `\\bsdg${i}\\b`,
      `\\bsdg ${i}\\b`,
      `\\bsdg-${i}\\b`,
      `\\bsdg_${i}\\b`,
      `\\bgoal ${i}\\b`,
      `\\bgoal${i}\\b`,
      `\\bsdg${i.toString().padStart(2, "0")}\\b`,
    ];

    if (
      patterns.some((pattern) => {
        const regex = new RegExp(pattern, "i");
        return regex.test(filters);
      })
    ) {
      badges.push({
        number: i,
        color: getSdgColor(i),
      });
    }
  }

  return badges;
};

onMounted(async () => {
  loading.value = true;
  try {
    library.value = await $fetch(endpoint.value + "/api/cms/content/list/");
  } catch (err) {
    console.error("Failed to load library content:", err);
    library.value = [];
  } finally {
    loading.value = false;
  }
});

const filteredLibrary = computed(() => {
  if (!library.value) return [];
  return library.value.filter((item) => {
    // Check if author field matches Learning Resource Center
    if (
      item.author &&
      item.author.toLowerCase().includes("learning resource center")
    ) {
      return true;
    }
    // Check if filters field includes Learning Resource Center
    if (
      item.filters &&
      item.filters.toLowerCase().includes("learning resource center")
    ) {
      return true;
    }
    return false;
  });
});

// Pagination state
const currentPage = ref(1);
const pageSize = ref(9); // 3 columns x 3 rows by default

const totalPages = computed(() => {
  const total = (filteredLibrary.value || []).length;
  return total ? Math.max(1, Math.ceil(total / pageSize.value)) : 1;
});

const pagedLibrary = computed(() => {
  const items = filteredLibrary.value || [];
  const start = (currentPage.value - 1) * pageSize.value;
  return items.slice(start, start + pageSize.value);
});

// Create a derived list that memoizes SDG badges to avoid recomputing in template
const pagedWithBadges = computed(() => {
  return (pagedLibrary.value || []).map((item) => {
    return {
      ...item,
      sdgBadges: getSdgBadges(item),
    };
  });
});

// Reset/validate page when filtered data or pageSize changes
watch([filteredLibrary, pageSize], () => {
  if (currentPage.value > totalPages.value) currentPage.value = 1;
  if (currentPage.value < 1) currentPage.value = 1;
});

const goToPage = (n) => {
  const page = Number(n) || 1;
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value -= 1;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1;
};

const menuList = [
  { label: "Learning Resource Center", link: "/library" },
  { label: "LRC Book Thru", link: "/library/LRCBookThru" },
  {
    label: "Online Public Access Catalog",
    link: "https://lsu-opac.follettdestiny.com",
  },
  {
    label: "Library Overview",
    link: "/library/overview",
  },
  {
    label: "Online Library Services",
    link: "/library/new-normal",
  },
  {
    label: "Library Collection",
    link: "/library/collection",
  },
  {
    label: "Library and Information Services Month",
    link: "/library",
  },
  {
    label: "Virtual Library Programs",
    link: "/library",
  },
  {
    label: "Library Gamification System",
    link: "/library",
  },
  {
    label: "Library Personnel",
    link: "/library",
  },
  {
    label: "Webinars and Workshops",
    link: "/library",
  },
  {
    label: "Library Opening Hours",
    link: "/library",
  },
  {
    label: "Privacy Policy Statement",
    link: "/library/privacy-policy",
  },
];

useHead({
  script: [
    {
      src: "/messenger/library/library.js",
      tagPosition: "bodyClose",
      defer: true,
    },
    {
      src: "/messenger/library/fb.sdk-library.js",
      tagPosition: "bodyClose",
      defer: true,
    },
  ],
});
const logos = ref([
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/bsp-logo.jpg",
    title: "BSP-KNR",
  },
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/274117265_672503967321292_5393267758998166844_n.png",
    title: "DLSP Library Committee",
  },
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/14449751_1331544083522632_7574361829022173141_n.png",
    title: "ALINET",
  },
  {
    image:
      "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Picture1-1.png",
    title: "MOIMLAI",
  },
]);
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="">
        <div class="relative">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
            class="align-top w-full h-auto lg:object-fill lg:block hidden"
          />
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
            class="align-top w-full h-36 object-none lg:hidden block"
          />
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1
              class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
            >
              {{ title[0] }}
            </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <div class="w-11/12 mx-auto flex justify-between">
              <ul class="flex lasalle-green-text capitalize text-xs">
                <li>
                  <a href="/" class=""> Home </a>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-caret-right mx-1.5 mt-0.5"></i>
                  <a href="/library" class="mr-1 flex">
                    <span class="lg:flex hidden ml-1"> {{ title[0] }}</span>
                    <span class="lg:hidden flex"> {{ title[2] }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
        <div class="shadow lg:w-3/12 my-5 bg-white overflow-hidden">
          <DynamicSideMenu :items="menuList" title="Sub Pages" />
        </div>
        <div
          class="lg:w-9/12 mx-auto lg:my-5 my-3 prose max-w-full text-justify"
        >
          <div class="">
            <a
              href="https://lsu.edu.ph/library/LRCBookThru"
              class="hover:rounded-lg shadow-lg transition ease-in-out delay-150 hover:-translate-y-1 lg:mb-5 relative mx-auto bg-[#024202] lg:h-[136px] h-[51px] block"
            >
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/libraryAds.png"
                class="h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 absolute"
              />
            </a>
            <div class="flex mx-auto shadow-md bg-white">
              <div class="lg:py-7 py-5 px-5 shadow-r-md text-sm">
                <p>
                  <span class="text-green-800 font-bold"
                    >La Salle University - Learning Resource Center</span
                  >
                  is dedicated to promoting lifelong learning to our patrons
                  through a dynamic and inclusive hub of resources, innovation,
                  collaboration, and linkages. We strive to facilitate academic
                  excellence and personal growth by providing our students,
                  faculty, staff, and other stakeholders with a wide range of
                  resources, expert assistance, and collaborative spaces.
                </p>
              </div>
            </div>
            <div class="my-3 shadow-md lg:py-10 py-5 lg:px-10 px-3 bg-white">
              <div class="">
                <ul class="grid lg:grid-cols-3 lg:gap-14 gap-8">
                  <li>
                    <p class="uppercase text-green-800 font-bold text-2xl">
                      Read.
                    </p>
                    <p class="mt-5 text-sm leading-6">
                      Here at LSU-LRC, we aim to promote the
                      <span class="bg-green-700 text-white px-2 py-1 mr-0.5"
                        >importance of reading</span
                      >
                      by helping our patrons navigate the library's vast
                      collection and locate relevant materials.
                    </p>
                  </li>
                  <li>
                    <p class="uppercase text-green-800 font-bold text-2xl">
                      Learn.
                    </p>
                    <p class="mt-5 text-sm">
                      We also seek to
                      <span class="bg-green-700 text-white px-2 py-1 mx-0.5"
                        >facilitate learning</span
                      >
                      by educating our patrons on how to effectively utilize
                      research tools, databases, and academic resources
                      available in the library.
                    </p>
                  </li>
                  <li>
                    <p class="uppercase text-green-800 font-bold text-2xl">
                      Discover.
                    </p>
                    <p class="mt-5 text-sm">
                      We develop a
                      <span class="bg-green-700 text-white px-2 py-1 mx-0.5"
                        >spirit of discovery</span
                      >
                      by guiding our patrons on how to explore specialized
                      collections, archives, and innovative technologies within
                      the library, fostering a culture of intellectual curiosity
                      and lifelong learning.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
            <div
              class="lg:my-5 mt-5 mb-3 shadow-md lg:py-10 pt-7 pb-7 lg:px-10 px-2 bg-white"
            >
              <p class="text-center mb-8">
                Begin your LSU-LRC journey by
                <span class="font-bold">selecting your unit below.</span>
              </p>
              <div class="lg:gap-10 gap-2 flex w-fit mx-auto">
                <a
                  href="/library/lrc-basic-ed"
                  class="shadow-2xl bg-green-700 text-white font-bold lg:px-10 lg:w-auto w-full h-full py-2 lg:text-2xl hover:bg-white rounded-xl hover:text-green-700 border-2 border-white hover:border-green-700 leading-tight uppercase text-center px-3"
                  >Basic Education Unit</a
                >
                <a
                  href="/library/lrc-higher-ed"
                  class="shadow-2xl bg-green-700 text-white font-bold lg:px-10 lg:w-auto h-full w-full py-2 lg:text-2xl hover:bg-white rounded-xl hover:text-green-700 border-2 border-white hover:border-green-700 leading-tight uppercase text-center px-3"
                  >Higher Education Unit</a
                >
              </div>
            </div>
            <div class="text-center my-5 bg-white lg:pt-2 pt-1 shadow-md">
              <h1
                class="font-bold tracking-widest lasalle-green-text uppercase mt-5 lg:mb-12 mb-5 text-xl"
              >
                Library Network
              </h1>
              <div
                class="w-11/12 mx-auto lg:flex items-center lg:pb-10 pb-5 grid grid-cols-2 md:grid-cols-4 lg:gap-2 gap-5"
              >
                <div class="lg:w-1/4" v-for="(j, i) in logos" :key="i">
                  <div class="flex lg:h-44 h-32">
                    <img
                      :src="j.image"
                      class="lg:w-[160px] w-[140px] lg:h-44 mb-1 mx-auto object-contain"
                      :alt="j.title"
                    />
                  </div>
                  <h3
                    class="text-center uppercase lasalle-green-text text-sm leading-tight"
                  >
                    {{ j.title }}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:shadow">
            <div
              class="bg-green-900 w-full lg:pt-3 lg:pb-3 pt-2 pb-4 pr-14 pl-5 shadow-2xl lg:mb-0 mb-2"
            >
              <div class="lg:flex justify-between items-center">
                <div class="">
                  <div class="flex">
                    <i
                      class="fa fa-user lg:text-2xl text-xl text-white mr-5 ml-1.5"
                    ></i>
                    <div class="flex items-center">
                      <h5 class="text-white lg:text-sm text-xs">
                        <!-- <span class="font-bold lg:text-sm text-xs">09190053779</span><br> -->
                        <span class="font-bold lg:text-sm text-xs">
                          lsu.instructure.com/courses/1999
                        </span>
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="lg:my-2">
                  <div class="flex">
                    <i
                      class="fa fa-phone-square lg:text-2xl text-xl text-white mr-5 ml-1.5 mt-1"
                    ></i>
                    <div class="flex items-center">
                      <h5 class="text-white lg:text-sm text-xs">
                        <!-- <span class="font-bold lg:text-sm text-xs">09190053779</span><br> -->
                        <span class="font-bold lg:text-sm text-xs"
                          >(088) 521-0342</span
                        >
                        LOC 135
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="lg:my-2">
                  <div class="">
                    <a href="https://www.facebook.com/lsu.lib" class="flex">
                      <img
                        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-fb.png"
                        class="lg:w-6 w-5 mt-1 mr-5 ml-1"
                        alt="FB"
                      />
                      <div class="flex items-center">
                        <h5 class="text-white text-sm">
                          <span class="font-bold lg:text-sm text-xs"
                            >facebook.com/lsu.lib</span
                          >
                        </h5>
                      </div>
                    </a>
                  </div>
                </div>
                <div class="lg:my-2">
                  <div class="flex">
                    <i
                      class="fa fa-envelope lg:text-xl text-xl text-white mr-5 mt-1 lg:ml-1.5 ml-1"
                    ></i>
                    <div class="flex items-center">
                      <h5 class="text-white text-sm">
                        <span class="font-bold lg:text-sm text-xs"
                          >library.helpdesk@lsu.edu.ph</span
                        >
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full px-5 lg:text-left text-center">
        <div class="flex items-center mb-2">
          <h4
            class="w-full font-bold lg:text-xl text-sm lg:my-2 text-center  justify-center lg:bg-white lg:text-green-800 text-white bg-green-800 py-1"
          >
            Guide Tutorials and Library Resources
          </h4>
        </div>
        <div v-if="loading" class="flex justify-center items-center py-10">
          <svg class="animate-spin h-8 w-8 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>

        <div
          v-else-if="filteredLibrary.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <div
            v-for="lib in pagedWithBadges"
            :key="lib.id"
            class="group overflow-hidden border-b hover:shadow-sm transition card-improved"
          >
            <a
              :href="'/news-updates/' + lib.id"
              class="block group rounded-lg overflow-hidden transition-shadow duration-300 bg-white"
            >
              <div class="flex h-44">
                <!-- Image Section -->
                <div class="w-6/12 h-full overflow-hidden">
                  <img
                    v-if="lib.files?.length"
                    :src="`https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-media-styles/cms/data/uploads/${lib.files[0]}`"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    :alt="lib.title || 'library resource'"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    v-else
                    class="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400"
                  >
                    No Image
                  </div>
                </div>

                <!-- Description Section -->
                <div class="p-2 w-2/3 flex flex-col h-full">
                  <!-- Author -->
                  <div class="mb-1">
                    <div class="text-xs text-gray-500 font-medium">
                      Learning Resource Center
                    </div>
                  </div>

                  <!-- Title -->
                  <div class="mb-2">
                    <div
                      class="lg:text-sm text-xs line-clamp-3 leading-tight text-gray-800 font-semibold"
                    >
                      {{ lib.title }}
                    </div>
                  </div>

                  <!-- Spacer to push keywords + Footer to bottom -->
                  <div class="flex-1"></div>

                  <!-- SDG Badges Section -->
                  <div class="flex items-center gap-1 flex-wrap mb-2">
                    <div
                      v-for="badge in lib.sdgBadges.slice(0, 3)"
                        :key="badge.number"
                        class="inline-flex items-center whitespace-nowrap text-[10px]"
                      >
                      <span
                        class="inline-flex items-center px-2 py-1 rounded font-bold text-white shadow-sm"
                        :style="{ backgroundColor: badge.color }"
                      >
                        {{ badge.number }}
                      </span>
                    </div>

                    <span
                      v-if="lib.sdgBadges.length > 3"
                      class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-600"
                    >
                      +{{ lib.sdgBadges.length - 3 }} more
                    </span>
                  </div>

                  <!-- Footer (Date + Read More) -->
                  <div
                    class="flex items-center justify-between text-xs text-gray-500"
                  >
                    <div>
                      {{ moment(lib.date || lib.created_at).format("MMM DD") }}
                    </div>
                    <div
                      class="text-green-600 font-medium flex items-center gap-1"
                    >
                      Read More <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="!loading && filteredLibrary.length > 0" class="flex items-center justify-center mt-4 space-x-2 mb-10">
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <div class="flex items-center gap-2 overflow-x-auto">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="page === currentPage ? 'bg-green-700 text-white' : 'bg-white text-gray-700'"
              class="px-3 py-1 border rounded whitespace-nowrap"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      
      </div>
    </div>
    <div>
      <div id="fb-root"></div>
      <div id="fb-customer-chat-library" class="fb-customerchat"></div>
    </div>
    <Footer />
  </div>
</template>
<style scoped>
.sub-header {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/banners/LMC/LMCBanner.png");
  background-position: center;
  background-size: 100% 100%;
}
</style>
