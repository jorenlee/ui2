<script setup>
  import moment from "moment";
  const presentYear = ref(moment(new Date()).format("YYYY"));
</script>

<template>
  <div class="font-montserrat">
    <div class="footer w-full text-white relative border-t-8 border-green-800">
      <div class="bg-green-900/95">
        <div class="container mx-auto px-4 lg:px-8">
          <div class="lg:grid lg:grid-cols-12 lg:gap-8 py-10">

            <!-- Main Content Section (Left) -->
            <div class="lg:col-span-8 text-center lg:text-left">
              <!-- Logo -->
              <div class="mb-6">
                <a href="https://lsu.edu.ph" class="inline-block">
                  <img
                    src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
                    class="w-48 mx-auto lg:mx-0"
                    alt="LSU"
                  />
                </a>
              </div>

              <!-- Tagline -->
              <h1 class="font-bold text-2xl lg:text-3xl uppercase tracking-widest mb-4">
                Reshaping Futures
              </h1>

              <!-- Copyright -->
              <p class="text-sm mb-3">
                © {{ presentYear }} La Salle University - Ozamiz
              </p>

              <!-- Address -->
              <p class="text-xs mb-6 text-green-100">
                La Salle St. Barangay Aguada, Ozamiz City, Misamis Occidental, Philippines
              </p>

              <!-- Quick Links -->
              <div class="border-t border-green-700 pt-6">
                <h3 class="text-sm font-bold uppercase mb-3 text-green-200">Quick Links</h3>
                <ul class="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <li>
                    <a href="/data-privacy" class="hover:text-green-300 transition flex items-center justify-center lg:justify-start">
                      <i class="fa fa-shield mr-2"></i>Data Privacy
                    </a>
                  </li>
                  <li>
                    <a href="/downloads" class="hover:text-green-300 transition flex items-center justify-center lg:justify-start">
                      <i class="fa fa-download mr-2"></i>Downloads
                    </a>
                  </li>
                  <li>
                    <a href="/directory" class="hover:text-green-300 transition flex items-center justify-center lg:justify-start">
                      <i class="fa fa-phone mr-2"></i>Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="/social-media" class="hover:text-green-300 transition flex items-center justify-center lg:justify-start">
                      <i class="fa fa-share-alt mr-2"></i>Social Media
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Social Media Section (Right) -->
            <div class="lg:col-span-4 mt-10 lg:mt-0">
              <div class="bg-green-800/50 border-2 border-green-700 p-6">
                <h3 class="text-sm font-bold uppercase mb-4 text-center text-green-200">
                  <i class="fa fa-share-alt mr-2"></i>Connect With Us
                </h3>
                <ul class="grid grid-cols-2 gap-4">
                  <li>
                    <a
                      href="https://www.facebook.com/lsu.edu.ph/"
                      class="block bg-white/10 hover:bg-white/20 p-3 transition border border-green-600 hover:border-white group"
                      title="Facebook"
                    >
                      <img
                        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-fb.png"
                        class="w-12 mx-auto group-hover:scale-110 transition"
                        alt="Facebook"
                      />
                      <p class="text-[10px] text-center mt-2 text-green-200">Facebook</p>
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://www.instagram.com/lsuozamiz/"
                      class="block bg-white/10 hover:bg-white/20 p-3 transition border border-green-600 hover:border-white group"
                      title="Instagram"
                    >
                      <img
                        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-ig.png"
                        class="w-12 mx-auto group-hover:scale-110 transition"
                        alt="Instagram"
                      />
                      <p class="text-[10px] text-center mt-2 text-green-200">Instagram</p>
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://youtube.com/channel/UCf24gxcXGxisXPT7Oj_CyOw"
                      class="block bg-white/10 hover:bg-white/20 p-3 transition border border-green-600 hover:border-white group"
                      title="YouTube"
                    >
                      <img
                        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-yt.png"
                        class="w-12 mx-auto group-hover:scale-110 transition"
                        alt="YouTube"
                      />
                      <p class="text-[10px] text-center mt-2 text-green-200">YouTube</p>
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://twitter.com/lsuozamiz"
                      class="block bg-white/10 hover:bg-white/20 p-3 transition border border-green-600 hover:border-white group"
                      title="Twitter"
                    >
                      <img
                        src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/icon-twt.png"
                        class="w-12 mx-auto group-hover:scale-110 transition"
                        alt="Twitter"
                      />
                      <p class="text-[10px] text-center mt-2 text-green-200">Twitter</p>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.footer {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/footer.jpg");
  background-size:cover;
}
</style>