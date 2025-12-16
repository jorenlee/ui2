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
    icon: "fa-shield",
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
];
</script>
<template>
  <footer
    class="w-full text-white relative border-t-8 border-green-800 bg-[url('https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/footer.jpg')] bg-cover bg-center"
  >
    <div class="bg-green-900/55">
      <div class="container mx-auto px-4 lg:px-8 py-12">
        <!-- Flex Wrapper -->
        <div class="lg:flex gap-10 lg:gap-5 w-full">
          <!-- Left Section -->
          <div class="w-full lg:w-8/12 text-center lg:text-left">
            <!-- Logo -->
            <div class="mb-3">
              <a href="https://lsu.edu.ph" class="inline-block">
                <img
                  src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
                  alt="LSU"
                  class="w-11/12 sm:w-3/12 md:w-6/12 lg:w-4/12 mx-auto lg:mx-0 transition-transform duration-300 hover:scale-105"
                />
              </a>
            </div>

            <!-- Address -->
            <p class="text-xs text-green-100 w-8/12 mx-auto lg:mx-0 mb-2">
              Valconcha St., Aguada, Ozamiz City, Misamis Occidental,
              Philippines 7200
            </p>

            <!-- Tagline -->
            <h1
              class="font-bold text-xl sm:text-2xl lg:text-3xl uppercase tracking-widest mb-6"
            >
              Reshaping Futures
            </h1>

            <!-- Quick Links -->
            <div
              class="border-t border-green-900 pt-6 w-full sm:w-10/12 mx-auto lg:mx-0"
            >
              <h3 class="text-sm font-bold uppercase mb-3 text-green-200">
                Quick Links
              </h3>

              <ul class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <li v-for="(link, index) in quickLinks" :key="index">
                  <a
                    :href="link.href"
                    class="group relative flex items-center justify-center lg:justify-start text-green-100 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <i :class="`fa ${link.icon} mr-2`"></i>
                    {{ link.label }}

                    <!-- underline -->
                    <span
                      class="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-green-200 transition-all duration-300 group-hover:w-full"
                    ></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right Section -->
          <div class="w-full lg:w-4/12 flex justify-center mt-10 lg:mt-0">
            <div
              class="bg-green-800/50 border-2 border-green-800 p-6 w-full sm:w-8/12 lg:w-full text-center"
            >
              <h3 class="text-sm font-bold uppercase mb-4 text-green-200">
                <i class="fa fa-share-alt mr-2"></i>Connect With Us
              </h3>

              <ul class="grid grid-cols-2 gap-4">
                <li v-for="social in socials" :key="social.name">
                  <a
                    :href="social.url"
                    :title="social.name"
                    class="group block bg-white/10 hover:bg-white/20 border border-green-900 hover:border-white p-3 transition"
                  >
                    <img
                      :src="social.icon"
                      :alt="social.name"
                      class="w-12 mx-auto transition-transform duration-300 group-hover:scale-110"
                    />
                    <p class="text-[10px] text-green-200 mt-2">
                      {{ social.name }}
                    </p>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <p class="text-sm lg:text-base text-center mt-10 mb-2">
          © {{ presentYear }} La Salle University Ozamiz, Inc.
        </p>

        <p class="text-xs text-center pb-5 w-10/12 mx-auto">
          Powered by
          <span class="font-bold">
            Network, Programs and Computerization Center (NPCC)
          </span>
        </p>
      </div>
    </div>
  </footer>
</template>
