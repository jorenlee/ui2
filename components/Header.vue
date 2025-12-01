<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const menuDetails = ref(false);
const isScrolled = ref(false);

const closeMenu = () => {
  menuDetails.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
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
                href="/directory"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Contact</a
              >
            </li>
            <li class="relative nav-dropdown">
              <a
                href="#"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >Services</a
              >
              <ul class="dropdown-menu dropdown-menu-wide">
                <li>
                  <a href="/campus-pass" class="dropdown-item">Campus Pass</a>
                </li>
                <li>
                  <a href="/registrar" class="dropdown-item">Registrar</a>
                </li>
                <li>
                  <a href="/procurement" class="dropdown-item">Procurement</a>
                </li>
                <li><a href="/library" class="dropdown-item">Library</a></li>
                <li>
                  <a href="/social-media" class="dropdown-item"
                    >Student Affairs</a
                  >
                </li>
                <li><a href="/hr" class="dropdown-item">Human Resource</a></li>
                <li>
                  <a href="/drs" class="dropdown-item">Document Reviewer</a>
                </li>
              </ul>
            </li>
            <li>
              <a
                href="/about"
                class="nav-link"
                :class="isScrolled ? 'lg:py-3.5 py-6' : 'py-6'"
                >About</a
              >
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
              <a href="/sdgs" class="mobile-menu-item border-y"
                >Sustainability</a
              >
            </li>

            <li>
              <a href="/directory" class="mobile-menu-item border-b">Contact</a>
            </li>

            <li>
              <a
                href="#"
                class="mobile-menu-item font-bold bg-gray-100 border-b text-green-950"
                >Services</a
              >
              <ul>
                <li class="bg-[#f7faf7]">
                  <a href="/campus-pass" class="mobile-submenu-item"
                    >Campus Pass</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/registrar" class="mobile-submenu-item">Registrar</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/procurement" class="mobile-submenu-item"
                    >Procurement</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/library" class="mobile-submenu-item">Library</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/social-media" class="mobile-submenu-item"
                    >Student Affairs</a
                  >
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/hr" class="mobile-submenu-item">Human Resource</a>
                </li>
                <li class="bg-[#f7faf7]">
                  <a href="/drs" class="mobile-submenu-item"
                    >Document Reviewer</a
                  >
                </li>
              </ul>
            </li>

            <li>
              <a
                href="/about"
                class="mobile-menu-item font-bold bg-gray-50 border-y text-green-950"
                >About</a
              >
            </li>
          </ul>
        </div>
      </div>
    </Transition>
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
