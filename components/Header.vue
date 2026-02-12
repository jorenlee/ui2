<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import moment from "moment";

const menuDetails = ref(false);
const isScrolled = ref(false);
const showSearchModal = ref(false);
const searchQuery = ref("");
const searchResults = ref([]);
const searchLoading = ref(false);
const allContent = ref([]);
const openMobile = ref(true);

const config = useRuntimeConfig();
const endpoint = ref(config.public.apiUrl);

const closeMenu = () => {
  menuDetails.value = false;
  openMobile.value = null;
};

const toggleMobile = (label) => {
  openMobile.value = openMobile.value === label ? null : label;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const openSearchModal = () => {
  showSearchModal.value = true;
  document.body.style.overflow = "hidden";
  loadContent();
};

const closeSearchModal = () => {
  showSearchModal.value = false;
  searchQuery.value = "";
  searchResults.value = [];
  document.body.style.overflow = "auto";
};

const loadContent = async () => {
  if (allContent.value.length === 0) {
    try {
      const res = await $fetch(endpoint.value + "/api/cms/content/list/");
      allContent.value = Array.isArray(res) ? res : [];
    } catch (error) {
      console.error("Error loading content:", error);
    }
  }
};

const performSearch = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchLoading.value = true;

  setTimeout(() => {
    const query = searchQuery.value.toLowerCase().trim();

    searchResults.value = allContent.value
      .filter((item) => {
        return (
          item.title?.toLowerCase().includes(query) ||
          item.authors?.toLowerCase().includes(query) ||
          item.descriptions?.toLowerCase().includes(query) ||
          item.filters?.toLowerCase().includes(query)
        );
      })
      .slice(0, 20); // Limit to 20 results

    searchLoading.value = false;
  }, 300);
};

const goToArticle = (id) => {
  closeSearchModal();
  window.location.href = `/news-updates/${id}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getSdgBadges = (item) => {
  if (!item?.filters) return [];

  const filters = item.filters.toLowerCase();
  const badges = [];

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
      badges.push({ number: i });
    }
  }

  return badges;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && showSearchModal.value) {
      closeSearchModal();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

/* -------------------- NAV DATA -------------------- */
const desktopNav = [
  {
    label: "Academics",
    href: "#",
    children: [
      { label: "Tertiary Education", href: "/academics/tertiary-education" },
      { label: "Basic Education", href: "/academics/basic-education" },
      { label: "Career and Counseling Center", href: "/ccc" },
    ],
  },
  { label: "Administration", href: "/administration" },
  {
    label: "Research",
    href: "/research",
    children: [
      {
        label: "Institutional Research & Publication Office",
        href: "/research",
      },
      { label: "Research Publications", href: "/research/publications" },
      { label: "E-journals", href: "/research/e-journals" },
    ],
  },
  { label: "Sustainability", href: "/sdgs" },
  { label: "Social Actions", href: "/social-actions" },
  {
    label: "Campus Life",
    href: "/campus-life",
    children: [
      {
        label: "Lasallian Mission Center",
        href: "/campus-life/lasallian-mission-center",
      },
      {
        label: "Lasallian Formation Center",
        href: "/campus-life/lasallian-formation-center",
      },
      {
        label: "Student Activities Center",
        href: "/campus-life/student-activities-center",
      },
      { label: "Activities", href: "/campus-life/activities" },
    ],
  },
  { label: "Campus Dev", href: "/campus/dev" },
  {
    label: "Services",
    href: "#",
    children: [
      { label: "Campus Pass", href: "/campus-pass" },
      { label: "Registrar", href: "/registrar" },
      { label: "Procurement", href: "/procurement" },
      { label: "Library", href: "/library" },
      { label: "Student Affairs", href: "/social-media" },
      { label: "Human Resource", href: "/hr" },
      { label: "Document Reviewer", href: "/drs" },
      { label: "News and Updates", href: "/news-updates" },
        { label: "IT Services", href: "/npcc" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "LSU", href: "/about" },
      { label: "The Founder's Life", href: "/about/founders-life" },
      { label: "Vocations", href: "/about/vocations" },
      { label: "Contact", href: "/about/contact" },
      { label: "The Hymn", href: "/about/hymn" },
      { label: "Lasallian Prayer", href: "/about/lasallian-prayer" },
    ],
  },
];
</script>

<template>
  <div
    class="fixed z-50 w-full font-montserrat border-b-4 border-green-800 transition-all duration-300"
    :class="
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white'
    "
  >
    <div class="container mx-auto lg:px-4 px-2">
      <div class="flex justify-between items-center">
        <!-- Logo + Search -->
        <div class="flex items-center gap-4">
          <a href="/" class="flex items-center hover:opacity-90 transition">
            <img
              src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/lsu-logotype-green.png"
              class="transition-all duration-300"
              :class="isScrolled ? 'w-48' : 'lg:w-60 w-48'"
              alt="La Salle University"
            />
          </a>

          <!-- Search Button -->
          <button
            @click="openSearchModal"
            aria-label="Search"
            class="group flex items-center gap-2 rounded-full bg-green-900 pl-3 px-1.5 py-2 text-white shadow-xl transition hover:bg-green-800"
          >
            <i class="fa fa-search text-xl"></i>
            <input
              readonly
              placeholder="Search..."
              class="w-0 opacity-0 bg-transparent text-sm placeholder-green-200 outline-none transition-all duration-300 group-hover:w-32 group-hover:opacity-100"
            />
          </button>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden lg:block">
          <ul class="flex items-center gap-1">
            <li
              class="relative group"
              v-for="item in desktopNav"
              :key="item.label"
            >
              <a
                :href="item.href || '#'"
                class="block whitespace-nowrap px-2 text-sm font-medium text-green-900 transition hover:bg-green-700 hover:text-white"
                :class="isScrolled ? 'lg:py-5 py-6' : 'lg:py-7 py-6'"
              >
                {{ item.label }}
              </a>

              <ul
                v-if="item.children"
                class="invisible absolute right-0 top-full z-50 min-w-[220px] border-t-4 border-green-900 bg-white shadow-xl opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
              >
                <li v-for="child in item.children" :key="child.label">
                  <a
                    :href="child.href"
                    class="block border-b border-gray-100 px-5 py-3 text-sm text-gray-800 transition hover:bg-green-50 hover:text-green-900"
                  >
                    {{ child.label }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        <!-- Mobile Toggle -->
        <button
          @click="menuDetails = !menuDetails"
          class="lg:hidden p-2 text-green-900 transition hover:text-green-700"
          aria-label="Toggle menu"
        >
          <i
            class="fa text-3xl"
            :class="menuDetails ? 'fa-times' : 'fa-bars'"
          ></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu (Accordion) -->
    <transition
      enter-active-class="transition-all duration-300"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-screen opacity-100"
      leave-active-class="transition-all duration-300"
      leave-from-class="max-h-screen opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-if="menuDetails"
        class="fixed left-0 w-full overflow-y-auto border-t-2 border-green-800 bg-white shadow-2xl"
        style="max-height: calc(100vh - 86px)"
      >
        <ul class="pb-20">
          <li v-for="item in desktopNav" :key="item.label" class="border-b">
            <button
              v-if="item.children"
              @click="toggleMobile(item.label)"
              class="flex w-full items-center justify-between bg-gray-100 px-5 py-4 font-bold text-green-950"
            >
              {{ item.label }}
            </button>

            <a
              v-else
              :href="item.href"
              class="block px-5 py-4 text-green-900 transition hover:bg-green-50"
            >
              {{ item.label }}
            </a>

            <ul
              v-if="item.children"
              class="bg-[#f7faf7]"
            >
              <li v-for="child in item.children" :key="child.label">
                <a
                  :href="child.href"
                  class="block border-b border-gray-100 px-8 py-3 text-sm text-gray-700 transition hover:bg-white hover:text-green-900"
                >
                  {{ child.label }}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </transition>
  </div>

  

  <!-- Search Modal -->
  <div
    v-if="showSearchModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    @click="closeSearchModal"
  >
    <div
      class="w-11/12 max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
      @click.stop
    >
      <div class="flex items-center justify-between border-b p-4">
        <h3 class="text-lg font-semibold text-green-800">
          Search News & Updates
        </h3>
        <button
          @click="closeSearchModal"
          class="text-gray-500 hover:text-gray-700"
        >
          <i class="fa fa-times text-xl"></i>
        </button>
      </div>

      <div class="border-b p-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            @input="performSearch"
            placeholder="Search by title, author, or content..."
            class="w-full rounded-md border px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <i
            class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          ></i>
        </div>
      </div>

      <div class="max-h-96 overflow-y-auto p-4">
        <div v-if="searchLoading" class="py-8 text-center">
          <i class="fa fa-spinner fa-spin text-2xl text-green-600"></i>
          <p class="mt-2 text-gray-600">Searching...</p>
        </div>

        <div
          v-else-if="searchResults.length === 0 && searchQuery"
          class="py-8 text-center"
        >
          <i class="fa fa-search text-3xl text-gray-400"></i>
          <p class="mt-2 text-gray-600">
            No results found for "{{ searchQuery }}"
          </p>
        </div>

        <div v-else-if="searchResults.length" class="space-y-3">
          <div
            v-for="item in searchResults"
            :key="item.id"
            @click="goToArticle(item.id)"
            class="cursor-pointer rounded-lg border p-3 transition hover:bg-gray-50"
          >
            <h4 class="mb-1 font-semibold text-green-800">{{ item.title }}</h4>
            <p class="mb-2 text-sm text-gray-600">{{ item.authors }}</p>
            <p class="line-clamp-2 text-xs text-gray-500">
              {{ item.descriptions }}
            </p>
            <div class="mt-2 flex items-center justify-between">
              <span class="text-xs text-gray-400">{{
                formatDate(item.date)
              }}</span>
              <div class="flex gap-1">
                <span
                  v-for="badge in getSdgBadges(item).slice(0, 3)"
                  :key="badge.number"
                  class="rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800"
                >
                  SDG {{ badge.number }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-8 text-center text-gray-500">
          <i class="fa fa-search text-3xl"></i>
          <p class="mt-2">Start typing to search news & updates</p>
        </div>
      </div>
    </div>
  </div>
</template>
