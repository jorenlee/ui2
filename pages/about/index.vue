<script setup>
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
        <div>

        </div>
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            About
            <!-- <span class="lg:text-base text-xs lg:mt-5 ml-5">A.Y. 2024-2025</span> -->
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about" class="mr-1"> About </a>
            </li>
            <!-- <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/about-lsu" class="mr-1">  </a>
            </li> -->
          </ul>
        </div>
      </div>
    </div>

    <!-- <div>
      <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/LSUOrganizationalChart.png" 
      class="lg:w-8/12 w-11/12 mx-auto my-5"/>
    </div> -->

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
  <div class="shadow lg:w-3/12 my-5 bg-white">
      <div>
        <ul class="w-full">
          <li class="w-full">
            <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
            La Salle University
            </span>
            <ul>
              <li class="">
                <a href="/about" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer ">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Mission and Vision
                </a>
              </li>
              <li class="">
                <a href="/about/core-values" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer ">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Core Values

                </a>
              </li>
              <li class="">
                <a href="/about/strategic-intents" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-xs cursor-pointer text-green-800  hover:text-white">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Strategic Intent
                 
                </a>
              </li>
              <li class="">
                <a href="/about/educational-policy" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Educational Policy
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
    <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
      <div>
        <div class="text-left mx-auto">
          <p
            class="lg:mt-7 mt-4 mb-8 text-xs lg:w-8/12 mx-auto w-11/12 lg:text-center"
          >
            La Salle University – Ozamiz is a recognized Catholic university
            established by the Brothers of the Christian Schools. Inspired by
            the charism of St. John Baptist De La Salle, the university
            community together and by association, provides quality, human,
            Christian education by teaching minds, touching hearts and
            transforming lives.
          </p>
        </div>
        <div class="block mx-auto lg:w-11/12">
          <div class="lg:flex lg:gap-10 lg:w-full w-11/12 mx-auto">
            <div class="w-full mb-12">
              <div
                class="font-bold lg:text-xl text-lg mb-3 text-center lasalle-green"
              >
                <span class="text-white px-2 py-1 tracking-widest">
                  Vision
                </span>
              </div>
              <div class="lg:w-11/12 mx-auto">
                <p class="text-left text-xs lg:mb-3 mb-2">
                  La Salle University, a member of the network of educators in
                  the Lasallian East Asia District, is a community of learners
                  that participates in the transformation of society in the
                  spirit of the Gospel through innovations in human and
                  Christian education; research; and community and institutional
                  partnerships.
                </p>
              </div>
            </div>

            <div class="w-full mb-12">
              <div
                class="font-bold lg:text-xl text-lg mb-3 text-center lasalle-green"
              >
                <span class="text-white px-2 py-1 tracking-widest">
                  Mission
                </span>
              </div>
              <div class="lg:w-11/12 mx-auto">
                <p class="text-left text-xs mb-4">
                  To create a learner-centered environment focused on (a)
                  application of knowledge from various disciplines to address
                  real world problems; (b) community-building skills; and (c)
                  nurturing passion and sense of vocation;
                </p>
                <p class="text-left text-xs mb-4">
                  To cultivate a dynamic university community committed to
                  lifelong learning by emphasizing (a) recruitment and
                  retention; training and re-skilling highly qualified
                  personnel; (b) sustainability in its processes; and (c) the
                  experience of a supportive community
                </p>
                <p class="text-left text-xs">
                  To contribute to the transformation of society by its external
                  partnerships to enhance (a) work-readiness of its learners;
                  (b) accessibility of quality education; (c) participation in
                  sustainable development initiatives.
                </p>
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

<style scoped>
/* a {
    border: 1px solid #969696;
    border-bottom: none;
  }
  a:hover {
    border: 1px solid #969696;
    border-bottom: none;
    background: #00cc00;
    color: #000;
  }
  a.active {
    background: #005e00;
    color: white !important;
    border-color: none !important;
  } */
</style>
