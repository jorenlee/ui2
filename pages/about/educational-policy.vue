<script setup>

// Optional: show toggle (for L, S, U content if still used)
const show = reactive({
  L: false,
  S: false,
  U: false,
});
const toggle = (letter) => {
  show[letter] = !show[letter];
};

</script>

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
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            About
            <!-- <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2024-2025</span> -->
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about" class="mr-1"> About </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <AboutSideMenu />
      </div>
      <div class="my-5">
        <div class="w-full justify-center flex items-center">
              <div class="">
                <div
                  class="w-full max-w-7xl bg-[#fff] shadow-md lg:rounded-lg overflow-hidden relative"
                >
                  <div class="">
                    <!-- Left Side: Header and Logo -->
                    <div
                      class="w-full lg:w-3/10 flex flex-col justify-center items-center lg:py-5 py-3 relative bg-gray-50 border-gray-200"
                    >
                      <div class="relative text-center">
                        <img
                          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/lsu-c-v.png"
                          alt="La Salle University Logo"
                          class="lg:w-3/12 w-6/12 h-auto object-contain my-2 mx-auto"
                        />
                        <!-- <h1 class="text-[#008028] text-4xl font-medium my-2">La Salle University</h1> -->
                        <h2
                          class="text-[#008028] text-xl font-bold uppercase tracking-wider"
                        >
                          EDUCATION POLICY
                        </h2>
                      </div>
                      <!-- Background image overlay -->
                      <div
                        class="absolute inset-0 opacity-20 pointer-events-none"
                      ></div>
                    </div>

                    <!-- Right Side: Content -->
                    <div
                      class="w-full px-5 lg:py-5 py-2 relative overflow-y-auto"
                    >
                      <!-- Introduction Paragraph -->
                      <p
                        class="lg:text-xs text-[10px] text-gray-800 mb-2 text-justify"
                      >
                        La Salle University stands at the forefront of
                        cultivating a vibrant learning community guided by
                        Gospel values within the region. Our active engagement
                        in societal transformation is driven by a commitment to
                        innovative education, rigorous research, and robust
                        community extension services, all rooted in the rich
                        tradition of Lasallian values. We tirelessly strive for
                        the betterment of society by imparting knowledge that
                        goes beyond the academic realm, including the
                        responsible management and dissemination of intellectual
                        property generated through research and innovation.
                      </p>

                      <div class="flex gap-x-4 mb-3">
                        <!-- L Section -->
                        <div
                          class="shadow-md text-center text-green-900 w-full cursor-pointer hover:bg-green-100"
                          @click="toggle('L')"
                        >
                          <div
                            class="lg:text-6xl text-3xl font-bold text-[#008028] leading-none flex items-start justify-center"
                          >
                            L
                          </div>
                          <i
                            class="fa fa-angle-double-down text-[10px] lg:-mt-1 mb-1 block text-gray-200"
                            aria-hidden="true"
                          ></i>
                        </div>

                        <!-- S Section -->
                        <div
                          class="shadow-md text-center text-green-900 w-full cursor-pointer hover:bg-green-100"
                          @click="toggle('S')"
                        >
                          <div
                            class="lg:text-6xl text-3xl font-bold text-[#008028] leading-none flex items-start justify-center"
                          >
                            S
                          </div>
                          <i
                            class="fa fa-angle-double-down text-[10px] lg:-mt-1 mb-1 block text-gray-200"
                            aria-hidden="true"
                          ></i>
                        </div>

                        <!-- U Section -->
                        <div
                          class="shadow-md text-center text-green-900 w-full cursor-pointer hover:bg-green-100"
                          @click="toggle('U')"
                        >
                          <div
                            class="lg:text-6xl text-3xl font-bold text-[#008028] leading-none flex items-start justify-center"
                          >
                            U
                          </div>
                          <i
                            class="fa fa-angle-double-down text-[10px] lg:-mt-1 mb-1 block text-gray-200"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>

                      <div v-show="show.L" class="flex-1 mb-3">
                        <p class="text-xs text-[#008028] text-justify m-0">
                          <span class="font-bold">L</span>ifelong learning is
                          our passion. We are dedicated to delivering
                          outstanding learning experiences across all
                          educational levels. We prioritize learners' and
                          stakeholders' satisfaction while ensuring compliance
                          with relevant regulations.
                        </p>
                      </div>
                      <div v-show="show.S" class="flex-1 mb-3">
                        <p class="text-xs text-[#008028] text-justify m-0">
                          <span class="font-bold">S</span>ervice to the Almighty
                          and society is a calling. By integrating Gospel values
                          into our educational fabric, we aim to instill a
                          strong moral compass in our students, empowering them
                          to make meaningful contributions to their communities.
                          Our holistic and pragmatic approach, combining
                          academic rigor with a focus on societal
                          responsibility, positions La Salle University as a
                          trailblazer in shaping well-rounded individuals poised
                          to impact the world positively.
                        </p>
                      </div>

                      <div v-show="show.U" class="flex-1 mb-3">
                        <p class="text-xs text-[#008028] text-justify m-0">
                          <span class="font-bold">U</span>nwavering excellence
                          is our commitment. LSU strives to be abreast with the
                          appropriate scientific and technological developments,
                          adhere to the ethical conduct of educational research,
                          and support an inclusive and sustainable society. We
                          shall continually improve the efficiency of our
                          management systems, including the processes for
                          protecting and promoting intellectual property, as
                          well as the evaluation and expansion of community
                          extension programs, ensuring the consistent
                          advancement of the institution.
                        </p>
                      </div>

                      <!-- Footer with Document Info and Signature -->
                      <footer
                        class="flex flex-col md:flex-row justify-between items-start md:items-end mt-3 lg:pt-4 pt-2 border-t border-gray-200"
                      >
                        <div class="text-left lg:mt-4 mt-2 md:mt-0">
                          <p
                            class="text-[10px] font-bold text-[#008028] whitespace-nowrap"
                          >
                            (SGD) BR. REY E. MEJIAS FSC
                          </p>
                          <p class="text-xs text-gray-700">
                            University President
                          </p>
                        </div>
                        <div class="w-full">
                          <p
                            class="text-right text-gray-500 lg:text-[10px] text-[7px]"
                          >
                            ECM PO-01, REV. 01
                          </p>
                        </div>
                      </footer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>
