<script setup></script>

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
                <div class="w-full lg:py-5 py-2 relative overflow-y-auto">
                  <!-- Right Side: Content -->
                  <div
                    class="w-full px-5 lg:py-5 py-2 relative overflow-y-auto"
                  >
                    <!-- Intro -->
                    <p
                      class="text-sm lg:text-base text-gray-700 leading-relaxed mb-4"
                    >
                      La Salle University stands at the forefront of cultivating
                      a vibrant learning community guided by Gospel values
                      within the region. Our active engagement in societal
                      transformation is driven by a commitment to innovative
                      education, rigorous research, and robust community
                      extension services, all rooted in the rich tradition of
                      Lasallian values.
                    </p>

                    <p
                      class="text-sm lg:text-base text-gray-700 leading-relaxed mb-6"
                    >
                      We strive to improve society by imparting knowledge that
                      extends beyond academia, including the responsible
                      management and dissemination of research-generated
                      intellectual property.
                    </p>

                    <!-- Lifelong Learning -->
                    <div class="flex gap-3 mb-5">
                      <span
                        class="text-[#008028] font-extrabold text-3xl leading-none"
                        >L</span
                      >
                      <p
                        class="text-sm lg:text-base text-gray-700 leading-relaxed"
                      >
                        <span class="font-semibold text-[#008028]">
                          Lifelong learning is our passion.
                        </span>
                        We dedicate ourselves to delivering outstanding learning
                        services across all educational levels. We prioritize
                        learners’ and stakeholders’ satisfaction while ensuring
                        compliance with relevant regulations.
                      </p>
                    </div>

                    <!-- Service -->
                    <div class="flex gap-3 mb-5">
                      <span
                        class="text-[#008028] font-extrabold text-3xl leading-none"
                        >S</span
                      >
                      <p
                        class="text-sm lg:text-base text-gray-700 leading-relaxed"
                      >
                        <span class="font-semibold text-[#008028]">
                          Service to the Almighty and society is our calling.
                        </span>
                        We aim to instill a strong moral compass in our
                        students, empowering them to make meaningful
                        contributions to their communities by integrating Gospel
                        values into our educational fabric.
                      </p>
                    </div>

                    <p
                      class="text-sm lg:text-base text-gray-700 leading-relaxed mb-6"
                    >
                      Our holistic and pragmatic approach—combining academic
                      rigor with a focus on societal responsibility—positions La
                      Salle University as a trailblazer in shaping well-rounded
                      individuals poised to impact the world positively.
                    </p>

                    <!-- Unwavering Excellence -->
                    <div class="flex gap-3 mb-6">
                      <span
                        class="text-[#008028] font-extrabold text-3xl leading-none"
                        >U</span
                      >
                      <p
                        class="text-sm lg:text-base text-gray-700 leading-relaxed"
                      >
                        <span class="font-semibold text-[#008028]">
                          Unwavering excellence is our commitment.
                        </span>
                        We strive to stay abreast of relevant scientific and
                        technological developments, adhere to ethical standards
                        in educational research, and support an inclusive and
                        sustainable society.
                      </p>
                    </div>

                    <p
                      class="text-sm lg:text-base text-gray-700 leading-relaxed mb-6"
                    >
                      We shall continually improve the efficiency of our
                      management systems, including the protection and promotion
                      of intellectual property, proactive institutional risk
                      management to ensure continuity and resilience, informed
                      decision-making, and the evaluation and expansion of
                      community extension programs to ensure the consistent
                      advancement of the institution.
                    </p>

                    <!-- Footer with Document Info and Signature -->
                    <footer
                      class="flex flex-col md:flex-row justify-between items-start md:items-end mt-6 pt-4 border-t border-gray-200"
                    >
                      <div class="text-left">
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
                          ECM PO-01, REV. 02
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
    </div>
    <Footer />
  </div>
</template>

<style scoped></style>
