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
      <AboutSideMenu />
    </div>
    <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3">
      <div>
        <div class="text-center mx-auto mb-8">
          <h2 class="font-bold lg:text-2xl text-xl text-green-800 mb-4">
            The Hymn
          </h2>
          <p class="text-xs lg:w-8/12 mx-auto w-11/12">
            Alma Mater Song
          </p>
        </div>

        <div class="block mx-auto lg:w-11/12 w-11/12">
          <!-- Hymn Lyrics and Video -->
          <div class="bg-white shadow-lg rounded-lg p-8 mb-8">
            <div class="text-center mb-8">
              <h3 class="font-bold text-lg text-green-800 mb-2">The Hymn (Alma Mater Song)</h3>
            </div>

            <div class="lg:flex lg:gap-8">
              <!-- Hymn Lyrics Column -->
              <div class="lg:w-1/2 w-full mb-6 lg:mb-0 flex items-center justify-center">
                <div class="bg-green-50 p-8 rounded-lg w-full">
                  <div class="text-center space-y-4">
                    <p class="text-base leading-relaxed font-semibold text-green-800">
                      Hail, Hail<br>
                      Alma Mater,<br>
                      Hail to De La Salle!<br>
                    </p>
                    <p class="text-base leading-relaxed">
                      We'll hold your banner high and bright,<br>
                      A shield of green and white,<br>
                    </p>
                    <p class="text-base leading-relaxed">
                      We'll fight to keep your glory bright,<br>
                      And never shall we fail,<br>
                    </p>
                    <p class="text-base leading-relaxed font-semibold text-green-800">
                      Hail to thee our Alma Mater!<br>
                      Hail! Hail! Hail!
                    </p>
                  </div>
                </div>
              </div>

              <!-- Video Column -->
              <div class="lg:w-1/2 w-full">
                <div class="sticky top-24">
                  <div class="aspect-video w-full">
                    <iframe
                      class="w-full h-full rounded-lg shadow-md"
                      src="https://www.youtube.com/embed/2nPuDjWDc-8"
                      title="LSU Hymn - Alma Mater Song"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <p class="text-xs text-center mt-3 text-gray-600 italic">
                    La Salle University Alma Mater Song
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-green-50 p-6 rounded-lg">
            <h3 class="font-bold text-base text-green-800 mb-4">About the Hymn</h3>
            <p class="text-xs mb-3 text-justify">
              The La Salle University Hymn embodies the spirit, values, and aspirations of the
              Lasallian community. It serves as a unifying anthem that brings together students,
              faculty, staff, and alumni in celebration of our shared identity and commitment to
              excellence in education.
            </p>
            <p class="text-xs mb-3 text-justify">
              The hymn is traditionally sung during university ceremonies, celebrations, and
              significant events, reminding us of our pledge to uphold the values of faith,
              service, and communion that define the Lasallian educational mission.
            </p>
            <p class="text-xs text-justify">
              The Green and White colors mentioned in the hymn represent the official colors of
              La Salle University, symbolizing growth, hope, and purity of purpose in our pursuit
              of knowledge and service to others.
            </p>
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
