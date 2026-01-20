<template>
  <div class="bg-gray-50">
    <Header />

    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block"
        />
        <div></div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h2
          class="font-bold uppercase text-white lg:text-xl text-sm w-11/12 mx-auto lg:my-12 my-6"
        >
          Network, Programs and Computerization Center
        </h2>
        </div>

        <div class="shadow-lg text-green-700">
          <div class="lg:flex justify-between border-b border-gray-200 lg:pl-5">
            <div
              class="flex items-center capitalize text-xs lg:border-b-0 border-b lg:px-0 px-1.5 py-2"
            >
              <div>
                <a href="/" class="mr-2 hover:underline lg:h-10">Home</a>
              </div>
              <div>
                <i class="fas fa-caret-right"></i>
                <a href="/npcc" class="mx-2 hover:underline lg:h-10"
                  >NPCC</a
                >
              </div>
            </div>
            <div class="flex hover:text-green-800 text-white bg-white h-full">
              <div
                class="hover:bg-green-800 bg-white hover:text-white text-green-800 px-1 lg:px-4 lg:h-10 h-8 flex items-center capitalize text-xs lg:py-2 py-1 lg:w-fit w-full"
              >
                <a href="/cms/login" class="flex items-center w-fit mx-auto">
                  <i class="fa fa-user" aria-hidden="true"></i>
                  <span class="ml-3 whitespace-nowrap">Admin Login</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- MAIN CONTENT -->
    <div class="w-11/12 mx-auto lg:py-12 py-5 space-y-10">
      <!-- ABOUT + CTA -->
      <section class="grid lg:grid-cols-3 lg:gap-10 gap-2 items-start">
        <div
          class="flex flex-col h-full items-center justify-center text-center border border-green-300 p-6 bg-green-50 rounded-lg"
        >
          <p class="text-sm mb-4">In need of technical assistance?</p>

          <NuxtLink
            to="/npcc/request"
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
            of La Salle University Ozamiz, Inc. The center’s scope of
            responsibility includes the network, the ICT hardware and software,
            and the data. The office shall ensure that the ICT infrastructure
            complies with the set standards.
          </p>

          <p class="mt-4 text-sm leading-relaxed text-gray-700">
            The office operates under the Office of the President. The office is
            headed by the NPCC Director. Under the director are the IT
            Specialists, the Webmaster, the Computer Laboratory Custodians and
            the PC Clinic Technician.
          </p>
        </div>
      </section>

      <!-- MEET THE TEAM -->
      <section>
        <!-- DESKTOP CIRCULAR LAYOUT -->
        <div class="relative hidden sm:flex justify-center">
          <div class="relative w-[520px] h-[520px] lg:w-[720px] lg:h-[720px]">
            <!-- CENTER TITLE -->
            <h2
              class="absolute inset-0 flex items-center justify-center text-center font-bold text-3xl lg:text-4xl text-green-800 pointer-events-none"
            >
              Meet the Team
            </h2>

            <!-- TEAM MEMBERS -->
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
                    class="w-full h-full object-cover object-top transform scale-x-100 hover:-scale-x-100"
                  />
                </div>

                <div>
                  <p class="text-xs mt-1 text-center lasalle-green-text">
                    {{ member.name }}
                  </p>
                  <p
                    class="text-xs font-bold text-center lasalle-green-text -mt-1"
                  >
                    {{ member.designation }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MOBILE GRID (ORDER FIXED HERE) -->
        <div class="grid grid-cols-1 gap-6 sm:hidden">
          <div
            v-for="(member, index) in mobileTeam"
            :key="'m-' + index"
            class="flex flex-col items-center"
          >
            <div
              class="w-32 h-32 rounded-full border-2 border-green-600 overflow-hidden bg-gray-200"
            >
              <img
                :src="member.profile || fallbackImg"
                :alt="member.name"
                class="w-full h-full object-cover object-top scale-x-100 hover:-scale-x-100"
              />
            </div>

            <p class="text-xs mt-2 text-center font-semibold">
              {{ member.name }}
            </p>
            <p class="text-[10px] text-center text-gray-600">
              {{ member.designation }}
            </p>
          </div>
        </div>
      </section>

      <!-- QUOTE -->
      <section
        class="bg-green-50 py-6 px-4 border-t border-green-200 rounded-lg"
      >
        <p class="italic text-xs text-gray-700 text-center max-w-5xl mx-auto">
          “ICT solutions should provide value, optimize advantages and relevance
          to the institution. The ICT organization is key in the governance and
          management of ICT to achieve institutional goals, and efficiency, as
          well as institutional resiliency to emerging needs and changing
          landscapes.”
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
import { computed } from "vue";

const fallbackImg =
  "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/avatar-placeholder.png";

const team = [
  {
    designation: "IT Support",
    name: "Sir Jason",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/sirjasonweb.png",
  },
  {
    designation: "Lab Custodian - HEU",
    name: "Sir Mel",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/sirrommel.png",
  },
  {
    designation: "Lab Custodian - BEU",
    name: "Sir Roy",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/SUAREZ,%20DENZEL%20ROY%20C.png",
  },
  {
    designation: "PC Clinic",
    name: "Sir Gio",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/sirgio.png",
  },
  {
    designation: "Network Administrator",
    name: "Sir John",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/sirjohn.png",
  },
  {
    designation: "NPCC Director",
    name: "Sir Michael",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/sirmic-web.png",
  },
  {
    designation: "Webmaster",
    name: "Ms Jo",
    profile:
      "https://lsu-media-styles.sgp1.digitaloceanspaces.com/npcc/jorenlee-profile-2025.png",
  },
];

/* ✅ MOBILE ORDER ONLY */
const mobileOrder = [
  "NPCC Director",
  "Webmaster",
  "Network Administrator",
  "IT Support",
  "PC Clinic",
  "Lab Custodian - HEU",
  "Lab Custodian - BEU",
];

const mobileTeam = computed(() =>
  mobileOrder
    .map((role) => team.find((member) => member.designation === role))
    .filter(Boolean),
);

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
