<script setup>
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
</script>

<template>
  <footer class="footer w-full text-white relative border-t-8 border-green-800">
    <div class="bg-green-900/95">
      <div class="container mx-auto px-4 lg:px-8 py-12">
        <div class="flex gap-x-5">

          <!-- Left Section: Logo + Tagline + Quick Links -->
          <div class="w-full text-center lg:text-left">
            <div class="mb-1">
              <a href="https://lsu.edu.ph" class="inline-block">
                <img
                  src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
                  class="w-48 mx-auto lg:mx-0 transition-transform duration-300 hover:scale-105"
                  alt="LSU"
                />
              </a>
            </div>

            <p class="text-[10px] mb-1 text-green-100">Valconcha St., Aguada, Ozamiz City</p>
            <p class="text-[10px]  text-green-100 mb-10">Misamis Occidental, Philippines 7200</p>

            <h1 class="font-bold text-2xl lg:text-3xl uppercase tracking-widest mb-6">
              Reshaping Futures
            </h1>

            <!-- Quick Links -->
            <div class="border-t border-green-700 pt-6 w-10/12">
              <h3 class="text-sm font-bold uppercase mb-3 text-green-200">Quick Links</h3>
              <ul class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <li>
                  <a href="/data-privacy" class="flex items-center justify-center lg:justify-start hover:uppercase">
                    <i class="fa fa-shield mr-2"></i>Data Privacy
                  </a>
                </li>
                <li>
                  <a href="/downloads" class="flex items-center justify-center lg:justify-start hover:uppercase">
                    <i class="fa fa-download mr-2"></i>Downloads
                  </a>
                </li>
                <li>
                  <a href="/directory" class="flex items-center justify-center lg:justify-start hover:uppercase">
                    <i class="fa fa-phone mr-2"></i>Contact Us
                  </a>
                </li>
                <li>
                  <a href="/social-media" class="flex items-center justify-center lg:justify-start hover:uppercase">
                    <i class="fa fa-share-alt mr-2"></i>Social Media
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <!-- Right Section: Social Media -->
          <div class="mt-10 lg:mt-0 flex items-center w-4/12">
            <div class="bg-green-800/50 border-2 border-green-700 p-6 lg:w-full text-center w-full">
              <h3 class="text-sm font-bold uppercase mb-4 text-green-200">
                <i class="fa fa-share-alt mr-2"></i>Connect With Us
              </h3>
              <ul class="grid grid-cols-2 gap-4">
                <li v-for="social in socials" :key="social.name">
                  <a
                    :href="social.url"
                    class="footer-social group block bg-white/10 hover:bg-white/20 p-3 transition border border-green-600 hover:border-white"
                    :title="social.name"
                  >
                    <img
                      :src="social.icon"
                      class="w-12 mx-auto group-hover:scale-110 transition-transform duration-300"
                      :alt="social.name"
                    />
                    <p class="text-[10px] text-green-200 mt-2">{{ social.name }}</p>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <p class="text-sm text-center mt-10 mb-2">
          © {{ presentYear }} La Salle University Ozamiz, Inc.
        </p>
        <p class="text-[10px] text-center pb-5">
          Powered By: <span class="font-bold">NPCC - Network, Programs and Computerization Center</span>
        </p>
      </div>
    </div>
  </footer>
</template>


<style scoped>
.footer {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/footer.jpg");
  background-size: cover;
  background-position: center;
}

/* Footer Links Hover */
.footer-link {
  @apply text-green-100 text-xs transition-all duration-300 relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: #d1fae5; /* lighter green underline */
  transition: width 0.3s ease;
}

.footer-link:hover::after {
  width: 100%;
}

.footer-link:hover {
  transform: scale(1.02);
}

/* Footer Social Hover */
.footer-social img {
  transition: transform 0.3s ease;
}

.footer-social:hover img {
  transform: scale(1.1);
}
</style>
