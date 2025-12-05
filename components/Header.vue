<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/user";
import moment from "moment";

const menuDetails = ref(false);
const isScrolled = ref(false);
const showSearchModal = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);
const allContent = ref([]);

const userStore = useUserStore();
const endpoint = ref(userStore.mainDevServer);

const closeMenu = () => {
  menuDetails.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const openSearchModal = () => {
  showSearchModal.value = true;
  document.body.style.overflow = 'hidden';
  loadContent();
};

const closeSearchModal = () => {
  showSearchModal.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  document.body.style.overflow = 'auto';
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
    
    searchResults.value = allContent.value.filter(item => {
      return (
        item.title?.toLowerCase().includes(query) ||
        item.authors?.toLowerCase().includes(query) ||
        item.descriptions?.toLowerCase().includes(query) ||
        item.filters?.toLowerCase().includes(query)
      );
    }).slice(0, 20); // Limit to 20 results
    
    searchLoading.value = false;
  }, 300);
};

const goToArticle = (id) => {
  closeSearchModal();
  window.location.href = `/news-updates/${id}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
      `\\bsdg${i.toString().padStart(2, '0')}\\b`
    ];
    
    if (patterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(filters);
    })) {
      badges.push({ number: i });
    }
  }
  
  return badges;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && showSearchModal.value) {
      closeSearchModal();
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div
    class="fixed main-header w-full font-montserrat border-b-4 border-green-800 transition-all duration-300"
    :class="
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg lg:py-1' : 'bg-white'
    "
  >
    <div class="container mx-auto lg:px-4 px-2 transition-all duration-300">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <a href="/" class="flex items-center hover:opacity-90 transition">
          <img
            src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/Logos/University%20Seal/lsu-logotype-green.png"
            class="transition-all duration-300"
            :class="isScrolled ? 'w-48' : 'lg:w-60 w-48'"
            alt="La Salle University"
          />
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:block">
          <ul class="flex items-center gap-1">
            <li class="relative nav-dropdown">
              <a
                href="#"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Academics</a
              >
              <ul class="dropdown-menu">
                <li>
                  <a href="/academics/tertiary-education" class="dropdown-item"
                    >Tertiary Education</a
                  >
                </li>
                <li>
                  <a href="/academics/basic-education" class="dropdown-item"
                    >Basic Education</a
                  >
                </li>
                <li>
                  <a href="/ccc" class="dropdown-item"
                    >Career and Counseling Center</a
                  >
                </li>
              </ul>
            </li>
            <li>
              <a
                href="/administration"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Administration</a
              >
            </li>
            <li class="relative nav-dropdown">
              <a
                href="/research"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Research</a
              >
              <ul class="dropdown-menu">
                <li>
                  <a href="/research" class="dropdown-item"
                    >Institutional Research and Publication Office</a
                  >
                </li>
                <li>
                  <a href="/research/publications" class="dropdown-item"
                    >Research Publications</a
                  >
                </li>
                <li>
                  <a href="/research/e-journals" class="dropdown-item"
                    >E-journals</a
                  >
                </li>
              </ul>
            </li>
            <li>
              <a
                href="/sdgs"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Sustainability</a
              >
            </li>
            <li>
              <a
                href="/social-actions"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Social Actions</a
              >
            </li>
            <li class="relative nav-dropdown">
              <a
                href="/campus-life"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Campus Life</a
              >
              <ul class="dropdown-menu">
                <li>
                  <a href="/campus-life/lasallian-mission-center" class="dropdown-item"
                    >Lasallian Mission Center</a
                  >
                </li>
                <li>
                  <a href="/campus-life/lasallian-formation-center" class="dropdown-item"
                    >Lasallian Formation Center</a
                  >
                </li>
                <li>
                  <a href="/campus-life/student-activities-center" class="dropdown-item"
                    >Student Activities Center</a
                  >
                </li>
                <li>
                  <a href="/campus-life/activities" class="dropdown-item"
                    >Activities</a
                  >
                </li>
              </ul>
            </li>
            <!-- <li>
              <a
                href="/campus-dev"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Campus Dev</a
              >
            </li> -->
            <li class="relative nav-dropdown">
              <a
                href="#"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Services</a
              >
              <ul class="dropdown-menu">
                <li>
                  <a href="/campus-pass" class="dropdown-item">Campus Pass</a>
                </li>
                <li>
                  <a href="/registrar" class="dropdown-item">Registrar</a>
                </li>
                <li>
                  <a href="/procurement" class="dropdown-item">Procurement</a>
                </li>
                <li>
                  <a href="/library" class="dropdown-item">Library</a>
                </li>
                <li>
                  <a href="/social-media" class="dropdown-item">Student Affairs</a>
                </li>
                <li>
                  <a href="/hr" class="dropdown-item">Human Resource</a>
                </li>
                <li>
                  <a href="/drs" class="dropdown-item">Document Reviewer</a>
                </li>
                <li>
                  <a href="/news-updates" class="dropdown-item">News and Updates</a>
                </li>
              </ul>
            </li>
            <li class="relative nav-dropdown">
              <a
                href="/about"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >About</a
              >
              <ul class="dropdown-menu">
                <li>
                  <a href="/about" class="dropdown-item"
                    >LSU</a
                  >
                </li>
                <li>
                  <a href="/about/founders-life" class="dropdown-item"
                    >The Founder's Life</a
                  >
                </li>
                <li>
                  <a href="/about/vocations" class="dropdown-item"
                    >Vocations</a
                  >
                </li>
                <li>
                  <a href="/about/contact" class="dropdown-item"
                    >Contact</a
                  >
                </li>
                <li>
                  <a href="/about/hymn" class="dropdown-item"
                    >The Hymn</a
                  >
                </li>
                <li>
                  <a href="/about/lasallian-prayer" class="dropdown-item"
                    >Lasallian Prayer</a
                  >
                </li>
              </ul>
            </li>
          
            <li> 
              <a class="nav-link cursor-pointer"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                @click="openSearchModal">
                <i class="fa fa-search"></i> Search
              </a>
            </li>
          </ul>
        </nav>

        <!-- Mobile Toggle -->
        <button
          @click="menuDetails = !menuDetails"
          class="lg:hidden text-green-900 hover:text-green-700 transition p-2"
          aria-label="Toggle menu"
        >
          <i
            class="fa text-3xl"
            :class="menuDetails ? 'fa-times' : 'fa-bars'"
          ></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu with Transition -->
    <Transition name="mobile-menu">
      <div
        v-if="menuDetails"
        class="fixed lg:top-[60px] left-0 w-full bg-white shadow-2xl z-40 border-t-2 border-green-800 overflow-y-auto"
        style="max-height: calc(100vh - 86px)"
      >
        <div class="pb-20">
          <ul class="space-y-0">
            <li>
              <a
                href="#"
                class="mobile-menu-item font-bold bg-gray-100 text-green-950"
                >Academics</a
              >
              <ul>
                <li>
                  <a
                    href="/academics/tertiary-education"
                    class="mobile-submenu-item"
                    >Tertiary Education</a
                  >
                </li>
                <li>
                  <a
                    href="/academics/basic-education"
                    class="mobile-submenu-item"
                    >Basic Education</a
                  >
                </li>
                <li>
                  <a href="/ccc" class="mobile-submenu-item"
                    >Career and Counseling Center</a
                  >
                </li>
              </ul>
            </li>

            <li>
              <a href="/administration" class="mobile-menu-item border-y"
                >Administration</a
              >
            </li>

            <li>
              <a
                href="#"
                class="mobile-menu-item font-bold bg-gray-100 border-b text-green-950"
                >Research</a
              >
              <ul>
                <li class="bg-[#f7faf7]">
                  <a href="/research/institutional-research" class="mobile-submenu-item"
                    >Institutional Research and Publication Office</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/research/publications" class="mobile-submenu-item"
                    >Research Publications</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/research/e-journals" class="mobile-submenu-item"
                    >E-journals</a
                  >
                </li>
              </ul>
            </li>

            <li>
              <a href="/sdgs" class="mobile-menu-item border-y"
                >Sustainability</a
              >
            </li>

            <li>
              <a href="/social-actions" class="mobile-menu-item border-y"
                >Social Actions</a
              >
            </li>

            <li>
              <a
                href="#"
                class="mobile-menu-item font-bold bg-gray-100 border-b text-green-950"
                >Campus Life</a
              >
              <ul>
                <li class="bg-[#f7faf7]">
                  <a href="/campus-life/lasallian-mission-center" class="mobile-submenu-item"
                    >Lasallian Mission Center</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/campus-life/lasallian-formation-center" class="mobile-submenu-item"
                    >Lasallian Formation Center</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/campus-life/student-activities-center" class="mobile-submenu-item"
                    >Student Activities Center</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/campus-life/activities" class="mobile-submenu-item"
                    >Activities</a
                  >
                </li>
              </ul>
            </li>

            <li>
              <a href="/campus-dev" class="mobile-menu-item border-y"
                >Campus Dev</a
              >
            </li>

            <li>
              <a
                href="#"
                class="mobile-menu-item font-bold bg-gray-100 border-b text-green-950"
                >Services</a
              >
              <ul>
                <li class="bg-[#f7faf7]">
                  <a href="/campus-pass" class="mobile-submenu-item">Campus Pass</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/registrar" class="mobile-submenu-item">Registrar</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/procurement" class="mobile-submenu-item">Procurement</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/library" class="mobile-submenu-item">Library</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/social-media" class="mobile-submenu-item">Student Affairs</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/hr" class="mobile-submenu-item">Human Resource</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/drs" class="mobile-submenu-item">Document Reviewer</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/news-updates" class="mobile-submenu-item">News and Updates</a>
                </li>
              </ul>
            </li>

            <li>
              <a
                href="/about"
                class="mobile-menu-item font-bold bg-gray-100 border-b text-green-950"
                >About</a
              >
              <ul>
                <li class="bg-[#f7faf7]">
                  <a href="/about" class="mobile-submenu-item"
                    >LSU</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/about/founders-life" class="mobile-submenu-item"
                    >The Founder's Life</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/about/vocations" class="mobile-submenu-item"
                    >Vocations</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/about/contact" class="mobile-submenu-item"
                    >Contact</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/about/hymn" class="mobile-submenu-item"
                    >The Hymn</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/about/lasallian-prayer" class="mobile-submenu-item"
                    >Lasallian Prayer</a
                  >
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>

  <!-- Search Modal -->
  <div v-if="showSearchModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeSearchModal">
    <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-2xl max-h-[80vh] overflow-hidden" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold text-green-800">Search News & Updates</h3>
        <button @click="closeSearchModal" class="text-gray-500 hover:text-gray-700">
          <i class="fa fa-times text-xl"></i>
        </button>
      </div>
      
      <!-- Search Input -->
      <div class="p-4 border-b">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by title, author, or content..."
            class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            @input="performSearch"
          />
          <i class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>
      
      <!-- Search Results -->
      <div class="p-4 max-h-96 overflow-y-auto">
        <div v-if="searchLoading" class="text-center py-8">
          <i class="fa fa-spinner fa-spin text-green-600 text-2xl"></i>
          <p class="mt-2 text-gray-600">Searching...</p>
        </div>
        
        <div v-else-if="searchResults.length === 0 && searchQuery" class="text-center py-8">
          <i class="fa fa-search text-gray-400 text-3xl"></i>
          <p class="mt-2 text-gray-600">No results found for "{{ searchQuery }}"</p>
        </div>
        
        <div v-else-if="searchResults.length > 0" class="space-y-3">
          <div
            v-for="item in searchResults"
            :key="item.id"
            class="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="goToArticle(item.id)"
          >
            <h4 class="font-semibold text-green-800 mb-1">{{ item.title }}</h4>
            <p class="text-sm text-gray-600 mb-2">{{ item.authors }}</p>
            <p class="text-xs text-gray-500 line-clamp-2">{{ item.descriptions }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="text-xs text-gray-400">{{ formatDate(item.date) }}</span>
              <div class="flex gap-1">
                <span
                  v-for="badge in getSdgBadges(item).slice(0, 3)"
                  :key="badge.number"
                  class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  SDG {{ badge.number }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <i class="fa fa-search text-3xl"></i>
          <p class="mt-2">Start typing to search news & updates</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scroll shrink effect handled by Tailwind classes */

/* Mobile Menu Slide Transition */
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.35s ease;
}
.mobile-menu-enter-to,
.mobile-menu-leave-from {
  max-height: calc(100vh - 86px);
  opacity: 1;
  transform: translateY(0);
}

/* Main Header */
.main-header {
  z-index: 50;
}

/* Desktop Navigation Links */
.nav-link {
  @apply text-green-900 text-sm font-medium px-2
         hover:bg-green-700 hover:text-white
         transition-all duration-200
         block whitespace-nowrap;
}

/* Dropdown Container */
.nav-dropdown {
  @apply relative;
}

.nav-dropdown:hover .dropdown-menu {
  @apply block;
}

/* Dropdown Menu */
.dropdown-menu {
  @apply hidden absolute top-full left-0
         bg-white text-gray-800
         shadow-xl border-t-2 border-green-700
         min-w-[220px] py-1 z-50;
}

.dropdown-menu-wide {
  @apply min-w-[260px];
}

/* Services and About dropdowns positioned to the right */
.nav-dropdown:nth-last-child(2) .dropdown-menu,
.nav-dropdown:last-child .dropdown-menu {
  @apply right-0 left-auto;
}

/* Dropdown Items */
.dropdown-item {
  @apply block px-5 py-3 text-sm
         hover:bg-green-50 hover:text-green-900
         transition-colors duration-150
         border-b border-gray-100;
}

.dropdown-item:last-child {
  @apply border-b-0;
}

/* Mobile Menu Items */
.mobile-menu-item {
  @apply block px-5 py-4
         text-green-900 text-base
         hover:bg-green-50 hover:text-green-700
         transition-colors duration-150;
}

.mobile-menu-header {
  @apply block px-5 py-3
         text-green-800 text-sm uppercase
         bg-gray-100;
}

.mobile-submenu-item {
  @apply block px-8 py-3 text-sm text-gray-700
         hover:bg-white hover:text-green-900
         transition-colors duration-150
         border-b border-gray-100;
}

.mobile-submenu-item:last-child {
  @apply border-b-0;
}
</style>
