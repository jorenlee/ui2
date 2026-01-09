<script setup>
const sections = [
  {
    logos: [
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/Lasallian%20East%20Asia%20District.jpg",
        href: "https://www.lasalle.org",
        title: "Affiliation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/DLSP.jpg",
        href: "https://www.dlsu.edu.ph",
        title: "Affiliation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/CHED.png",
        href: "https://ched.gov.ph",
        title: "Affiliation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/DepEd.jpg",
        href: "https://www.deped.gov.ph",
        title: "Affiliation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PAASCU-Reaccredited.png",
        href: "https://paascu.org.ph",
        title: "Accreditation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSU-ISO-Cert-Mark.jpg",
        href: "https://www.bureauveritas.com",
        title: "Accreditation",
        wide: true,
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PCNC.png",
        href: "https://pcnc.com.ph",
        title: "Accreditation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/PEAC.png",
        href: "https://peac.org.ph",
        title: "Accreditation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/partners/Philnitslogo.jpg",
        href: "https://philnits.org",
        title: "Linkage",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/partners/MikrotikAcademy.jpg",
        href: "https://mikrotik.com",
        title: "Linkage",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/GlobeBusiness.png",
        href: "https://www.globe.com.ph/business",
        title: "Linkage",
      },
    ],
  },
];
</script>

<template>
  <section class="bg-white py-20 space-y-24">
    <div v-for="(section, sIndex) in sections" :key="sIndex" class="space-y-10">
      <!-- MARQUEE CONTAINER -->
      <div class="relative overflow-hidden group">
        <!-- Fade edges -->
        <div
          class="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent z-10"
        ></div>
        <div
          class="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent z-10"
        ></div>

        <!-- MARQUEE -->
        <div
          class="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]"
        >
          <!-- TRACK A -->
          <div class="flex shrink-0">
            <a
              v-for="(logo, index) in section.logos"
              :key="'a' + index"
              :href="logo.href"
              target="_blank"
              class="text-center justify-center px-7"
            >
              <img
                :src="logo.src"
                class="h-10 mx-auto object-contain opacity-80 hover:opacity-100 transition"
                :class="logo.wide ? 'lg:h-16' : ''"
                alt="logo"
              />
              <span
                class="text-[9px] text-gray-300 hover:text-black text-center"
                >{{ logo.title }}</span
              >
            </a>
          </div>

          <!-- TRACK B (CLONE) -->
          <div class="flex shrink-0">
            <a
              v-for="(logo, index) in section.logos"
              :key="'b' + index"
              :href="logo.href"
              target="_blank"
              class="text-center justify-center px-7"
            >
              <img
                :src="logo.src"
                class="h-10 mx-auto object-contain opacity-80 hover:opacity-100 transition"
                :class="logo.wide ? 'lg:h-16' : ''"
                alt="logo"
              />
              <span
                class="text-[9px] text-gray-300 hover:text-black text-center"
                >{{ logo.title }}</span
              >
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation: marquee 35s linear infinite;
}
</style>
