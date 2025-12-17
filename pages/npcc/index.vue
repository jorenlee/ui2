<template>
  <div class="bg-gray-50">
    <Header />

    <!-- BANNER -->
    <div class="relative pt-14">
      <Banner />

      <!-- Mobile Banner Image -->
      <img
        src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
        class="w-full h-36 object-cover lg:hidden block"
      />

      <!-- Title -->
      <div class="absolute inset-0 flex items-center">
        <h1
          class="font-bold uppercase text-white lg:text-xl text-sm w-11/12 mx-auto mt-12"
        >
          Network, Programs and Computerization Center
        </h1>
      </div>

      <!-- Breadcrumb -->
      <div class="bg-white shadow-lg py-3">
        <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
          <li>
            <a href="/" class="mr-1">Home</a>
          </li>
          <li>
            <i class="fas fa-caret-right mx-1"></i>
            <span>NPCC</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="w-11/12 mx-auto py-12 space-y-20">

      <!-- ABOUT + CTA -->
      <section class="grid lg:grid-cols-3 gap-10 items-start">
        <!-- CTA -->
        <div
          class="flex flex-col h-full items-center justify-center text-center border border-green-300 p-6 bg-green-50 rounded-lg"
        >
          <p class="text-sm mb-4">In need of technical assistance?</p>

          <NuxtLink
            to="/npcc/tech-support"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition"
          >
            <i class="fas fa-desktop"></i>
            NPCC Tech Support
          </NuxtLink>
        </div>

        <div
          class="lg:col-span-2 bg-white p-6 border border-green-200 rounded-lg"
        >
          <h2 class="font-bold text-lg mb-4 lasalle-green-text">
            About the Center
          </h2>

          <p class="text-sm leading-relaxed text-gray-700">
            The
            <strong>Network, Programs and Computerization Center (NPCC)</strong>
            is responsible for managing and maintaining the ICT infrastructure
            of La Salle University Ozamiz, Inc.
          </p>

          <p class="mt-4 text-sm leading-relaxed text-gray-700">
            The office operates under the Office of the President and is headed
            by the NPCC Director.
          </p>
        </div>
      </section>

      <!-- MEET THE TEAM -->
      <section>
        <h2 class="text-center font-bold text-4xl mb-5 text-green-800">
          Meet the Team
        </h2>

        <!-- DESKTOP CIRCULAR LAYOUT -->
        <div class="relative hidden sm:flex justify-center">
          <div class="relative w-[520px] h-[520px] lg:w-[720px] lg:h-[720px]">
            <div
              v-for="(member, index) in team"
              :key="index"
              class="absolute top-1/2 left-1/2"
              :style="getPosition(index, team.length)"
            >
              <div class="flex flex-col items-center">
                <div
                  class="w-32 h-32 lg:w-44 lg:h-44 rounded-full border-2 border-green-600 overflow-hidden bg-gray-200 shadow-xl"
                >
                  <img
                    :src="member.profile || fallbackImg"
                    :alt="member.name"
                    class="w-full h-full object-cover object-top  transform -scale-x-100 hover:scale-x-100"
                    style="object-position: center top"
                  />
                </div>

                <div>
                  <p
                    class="text-xs mt-1 leading-tight text-center lasalle-green-text"
                  >
                    {{ member.name }}
                  </p>
                  <p
                    class="text-xs font-bold leading-tight text-center lasalle-green-text"
                  >
                    {{ member.designation }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MOBILE GRID -->
        <div class="grid grid-cols-2 gap-6 sm:hidden">
          <div
            v-for="(member, index) in team"
            :key="'m-' + index"
            class="flex flex-col items-center"
          >
            <div
              class="w-20 h-20 rounded-full border-2 border-green-600 overflow-hidden bg-gray-200"
            >
              <img
                :src="member.profile || fallbackImg"
                :alt="member.name"
                class="w-full h-full object-cover object-top flip-x"
                style="object-position: center center"
              />
            </div>
            <p class="text-xs mt-2 text-center font-semibold">
              {{ member.name }}
            </p>
          </div>
        </div>
      </section>

      <!-- QUOTE -->
      <section
        class="bg-green-50 py-6 px-4 border-t border-green-200 rounded-lg"
      >
        <p
          class="italic text-xs text-gray-700 text-center leading-relaxed max-w-5xl mx-auto"
        >
          “ICT solutions should provide value, optimize advantages and relevance
          to the institution.”
        </p>

        <p class="text-xs text-center mt-2 font-semibold">
          — DLSP Modern Conduct of Schools
        </p>
      </section>
    </div>

    <Footer />
  </div>
</template>

<script setup>
const fallbackImg =
  "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/avatar-placeholder.png";

const team = [
  {
    designation: "IT Support",
    name: "Sir Jason",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/YAP,%20JASON%20%20IMG_9057.jpg",
  },
  {
    designation: "Lab Custodian - HEU",
    name: "Sir Mel",
    profile: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/spinthewheellogo.jpeg",
  },
  {
    designation: "Lab Custodian - BEU",
    name: "Sir Roy",
    profile: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/spinthewheellogo.jpeg",
  },
  {
    designation: "PC Clinic",
    name: "Sir Gio",
    profile: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/spinthewheellogo.jpeg",
  },
  {
    designation: "Network Administrator",
    name: "Sir John",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/Gonzaga,%20Flourence%20John%20S-2274.JPG",
  },
  {
    designation: "NPCC Director",
    name: "Sir Michael",
    profile: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/sirmic.jpg",
  },
  {
    designation: "Webmaster",
    name: "Ms Jo",
    profile: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/jorenlee-web.jpg",
  },
];

const getPosition = (index, total) => {
  const angle = (360 / total) * index;
  const radius = 250;

  return {
    transform: `
      translate(-50%, -50%)
      rotate(${angle}deg)
      translate(${radius}px)
      rotate(-${angle}deg)
    `,
  };
};
</script>

<style scoped>
.lasalle-green-text {
  color: #0b6b3a;
}
</style>
