<script setup>
import { ref } from "vue";
import moment from "moment";
const presentYear = ref(moment(new Date()).format("YYYY"));

const socials = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/lsu.edu.ph/",
    icon: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-fb.png",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/lsuozamiz/",
    icon: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-ig.png",
  },
  {
    name: "YouTube",
    url: "https://youtube.com/channel/UCf24gxcXGxisXPT7Oj_CyOw",
    icon: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-yt.png",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/lsuozamiz",
    icon: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/icon-twt.png",
  },
];

const quickLinks = [
  {
    label: "Data Privacy",
    href: "/data-privacy",
    icon: "fa-shield-halved",
  },
  {
    label: "Downloads",
    href: "/downloads",
    icon: "fa-download",
  },
  {
    label: "Contact Us",
    href: "/directory",
    icon: "fa-phone",
  },
  {
    label: "Social Media",
    href: "/social-media",
    icon: "fa-share-alt",
  },
  {
    label: "Login",
    href: "/login",
    icon: "fa-users-gear",
  },
];
</script>

<template>
  <footer class="w-full text-slate-100 font-sans relative">
    <GoogleAdsense />
    <UniversityFeedbackWidget />

    <!-- Top Accent Gradient Line -->
    <div class="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600"></div>

    <!-- Main Footer Body with Backdrop Image -->
    <div class="relative bg-[url('https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/footer.jpg')] bg-cover bg-center overflow-hidden pt-12 sm:pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <!-- Dark Emerald Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-emerald-900/50 to-teal-950/50 pointer-events-none"></div>

      <!-- Ambient Background Glows -->
      <div class="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div class="max-w-7xl mx-auto relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          <!-- Left Section: University Branding & Info -->
          <div class="lg:col-span-7 xl:col-span-8 text-center lg:text-left">
            <!-- Logos -->
            <div class="mb-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <img
                src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/20th%20Anniversary%20Emerald%20Logos-20260618T012425Z-3-001/20th%20Anniversary%20Emerald%20Logos/Emerald%20with%20Theme%20-%20White.png"
                alt="20th Anniversary Logo"
                class="h-14 sm:h-16 object-contain"
              />
              <div class="hidden sm:block w-px h-10 bg-emerald-700/50"></div>
              <a href="https://lsu.edu.ph" class="block">
                <img
                  src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
                  alt="La Salle University Logo"
                  class="h-10 sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
                />
              </a>
            </div>

            <!-- Address -->
            <p class="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-4 flex items-center justify-center lg:justify-start gap-2">
              <i class="fas fa-map-marker-alt text-emerald-400 text-xs shrink-0"></i>
              <span>La Salle St. Aguada, Ozamiz City, Misamis Occidental, Philippines 7200</span>
            </p>

            <!-- Tagline -->
            <div class="mb-8">
              <span class="inline-block px-3.5 py-1 bg-emerald-900/80 text-emerald-300 text-xs font-bold uppercase tracking-widest rounded-md border border-emerald-700/50">
                Institutional Theme
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-widest uppercase mt-2">
                Reshaping <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">Futures</span>
              </h2>
            </div>

            <!-- Quick Links -->
            <div class="pt-6 border-t border-emerald-800/60 max-w-2xl mx-auto lg:mx-0">
              <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
                Quick Navigation
              </h3>
              <ul class="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs">
                <li v-for="(link, index) in quickLinks" :key="index">
                  <a
                    :href="link.href"
                    class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/40 text-emerald-100 hover:text-white transition-all duration-300 shadow-xs"
                  >
                    <i :class="`fa ${link.icon} text-emerald-400 text-xs`"></i>
                    <span>{{ link.label }}</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right Section: Social Media Connect Glass Card -->
          <div class="lg:col-span-5 xl:col-span-4 w-full">
            <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/30 text-center">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-200 mb-5 border border-white/10">
                <i class="fa fa-share-alt text-emerald-400 text-xs"></i>
                <span>Connect With Us</span>
              </div>

              <div class="grid grid-cols-2 gap-3 sm:gap-4">
                <a
                  v-for="social in socials"
                  :key="social.name"
                  :href="social.url"
                  :title="social.name"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 hover:border-emerald-300/50 transition-all duration-300 hover:-translate-y-1 shadow-sm"
                >
                  <img
                    :src="social.icon"
                    :alt="social.name"
                    class="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110 mb-2"
                  />
                  <span class="text-xs font-bold text-emerald-100 group-hover:text-white transition-colors">
                    {{ social.name }}
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Copyright Bottom Bar -->
        <div class="mt-12 sm:mt-16 pt-6 border-t border-emerald-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-emerald-200/80">
          <p>© {{ presentYear }} La Salle University Ozamiz, Inc. All Rights Reserved.</p>
          <a
            href="/npcc"
            class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 hover:text-white rounded-lg border border-emerald-800 transition-colors"
          >
            <span>Powered by</span>
            <strong class="font-bold text-white">NPCC</strong>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
