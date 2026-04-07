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
            Metau: LSU OER <span class="text-[10px] capitalize font-light">Powered By NPCC</span>
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
              <a href="/oer" class="mr-1"> Metau: LSU OER </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="font-montserrat bg-gray-50">
      <section
        class="relative bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white"
      >
        <div class="px-6 flex flex-col lg:flex-row items-center gap-10">
          <div
            class="w-full items-center lg:items-start text-center lg:text-left z-10 py-2 rounded-lg hero-banner-content-with-bg"
          >
            <div class="w-9/12 mx-auto py-6">
              <h1 class="text-xl font-extrabold mt-14 mb-4">
                Welcome to <span class="text-yellow-300">Metau</span>
              </h1>
              <p
                class="text-sm opacity-90 leading-relaxed mt-[150px] mb-8 w-8/12"
              >
                LSU’s Open Educational Resource platform — fostering
                collaboration, inclusivity, and lifelong learning through free,
                high-quality materials.
              </p>
              <div class="mt-8 mb-8 w-fit ml-auto mr-0">
                <a
                  href="/oer/submission"
                  class="inline-flex items-center gap-3 bg-white text-green-800 font-bold px-8 py-1 rounded-xl shadow hover:bg-green-100 transition"
                >
                  <i class="fa fa-upload text-lg"></i> Contribute Now
                </a>
              </div>
            </div>
          </div>

          <div class="w-full mt-8 gap-4">
            <div class="w-9/12 mx-auto py-6">
              <!-- <div class="flex flex-col gap-4 w-full mb-10">
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  class="px-4 py-2 rounded-lg text-gray-800 focus:outline-none w-full"
                />
                <select
                  class="px-4 py-2 rounded-lg text-gray-800 focus:outline-none w-full"
                >
                  <option>Subject</option>
                </select>
                <select
                  class="px-4 py-2 rounded-lg text-gray-800 focus:outline-none w-full"
                >
                  <option>Education Level</option>
                </select>
                <select
                  class="px-4 py-2 rounded-lg text-gray-800 focus:outline-none w-full"
                >
                  <option>Standard</option>
                </select>
              </div> -->
              <button
                class="bg-green-800 text-white font-bold px-6 py-2 rounded-lg shadow hover:bg-green-900 transition w-full"
              >
                Coming Soon
              </button>
              
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <div class="w-11/12 mx-auto my-10 bg-white shadow-lg rounded-2xl p-8">
        <h2>
          <span
            class="text-green-700 text-2xl block text-left mb-6 font-bold border-l-4 border-green-700 pl-3"
          >
            About Metau: LSU OER
          </span>
        </h2>
        <p class="mb-5 text-gray-700 leading-relaxed">
          La Salle University’s Open Educational Resources (OER) initiative,
          branded as <span class="font-semibold">Metau</span>—a Subanen word
          meaning “knowledgeable”—advances our commitment to making quality
          education accessible to all. Guided by Strategic Intent 1, Goal 1.1.2,
          Metau provides a platform for faculty, students, and partners to
          create and share free, high-quality learning materials that benefit
          local, national, and global communities.
        </p>
        <p class="mb-3 text-gray-700 leading-relaxed">
          Anchored on the UNESCO Recommendation on OER (2019) and aligned with
          the UN Sustainable Development Goals—especially SDG 4 (Quality
          Education), SDG 10 (Reduced Inequalities), and SDG 17 (Partnerships
          for the Goals)—Metau fosters inclusivity, collaboration, and lifelong
          learning. By contributing to Metau, the LSU community joins a global
          movement of open knowledge that empowers learners and strengthens
          education for all.
        </p>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped>
.hero-banner-content-with-bg {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' rx='24' fill='url(%23grad)' opacity='0.15'%3E%3C/rect%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23166534'%3E%3C/stop%3E%3Cstop offset='100%25' stop-color='%23facc15'%3E%3C/stop%3E%3C/linearGradient%3E%3C/defs%3E%3Cg transform='translate%28100,100%29'%3E%3Crect x='0' y='0' width='160' height='30' rx='6' fill='%23166534'%3E%3C/rect%3E%3Crect x='0' y='0' width='160' height='30' rx='6' stroke='%230f3d1e' stroke-width='2' fill='none'%3E%3C/rect%3E%3Crect x='20' y='40' width='180' height='30' rx='6' fill='%23facc15'%3E%3C/rect%3E%3Crect x='20' y='40' width='180' height='30' rx='6' stroke='%23ca8a04' stroke-width='2' fill='none'%3E%3C/rect%3E%3Crect x='40' y='80' width='200' height='30' rx='6' fill='%2315803d'%3E%3C/rect%3E%3Crect x='40' y='80' width='200' height='30' rx='6' stroke='%23064e2e' stroke-width='2' fill='none'%3E%3C/rect%3E%3C/g%3E%3Cg transform='translate%28400,120%29'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23facc15' stroke='%23ca8a04' stroke-width='4'%3E%3C/circle%3E%3Cline x1='50' y1='90' x2='50' y2='120' stroke='%23facc15' stroke-width='6' stroke-linecap='round'%3E%3C/line%3E%3Crect x='35' y='120' width='30' height='20' rx='4' fill='%23166534'%3E%3C/rect%3E%3C/g%3E%3Ccircle cx='420' cy='70' r='6' fill='%23facc15'%3E%3C/circle%3E%3Ccircle cx='470' cy='50' r='8' fill='%2315803d'%3E%3C/circle%3E%3Ccircle cx='500' cy='100' r='5' fill='%23facc15'%3E%3C/circle%3E%3C/svg%3E");
  background-size: 600px 600px;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
