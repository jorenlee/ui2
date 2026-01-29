<script setup>
const sections = [
  {
    logos: [
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/Lasallian%20East%20Asia%20District.jpg",
        href: "https://lasalle-lead.org/",
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
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/gradeA.png",
        href: "https://securityheaders.com",
        title: "Accreditation",
      },
      {
        src: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/NPCSeal.png",
        href: "https://privacy.gov.ph/",
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
  <section class="bg-white py-12">
    <div v-for="(section, sIndex) in sections" :key="sIndex">
      <div class="relative overflow-hidden group">
        <!-- Fade edges -->
        <div class="pointer-events-none absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div class="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10"></div>

        <!-- MARQUEE TRACK -->
        <div
          class="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]"
        >
          <!-- ORIGINAL -->
          <div class="flex">
            <a
              v-for="(logo, i) in section.logos"
              :key="'a' + i"
              :href="logo.href"
              target="_blank"
              class="px-6 text-center flex flex-col items-center"
            >
              <img
                :src="logo.src"
                class="h-10 lg:h-12 object-contain opacity-80 hover:opacity-100 transition"
                :class="logo.wide ? 'lg:h-16' : ''"
                alt="logo"
              />
            </a>
          </div>

          <!-- CLONE -->
          <div class="flex">
            <a
              v-for="(logo, i) in section.logos"
              :key="'b' + i"
              :href="logo.href"
              target="_blank"
              class="px-6 text-center flex flex-col items-center"
            >
              <img
                :src="logo.src"
                class="h-10 lg:h-12 object-contain opacity-80 hover:opacity-100 transition"
                :class="logo.wide ? 'lg:h-16' : ''"
                alt="logo"
              />
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

/* MOBILE: full cycle, fast */
.animate-marquee {
  animation: marquee 15s linear infinite;
}

/* DESKTOP: smoother */
@media (min-width: 1024px) {
  .animate-marquee {
    animation-duration: 30s;
  }
}

</style>