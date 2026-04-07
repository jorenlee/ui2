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
            The Lasallian Prayer
          </h2>
          <p class="text-xs lg:w-8/12 mx-auto w-11/12">
            A Prayer of Faith and Dedication
          </p>
        </div>

        <div class="block mx-auto lg:w-11/12 w-11/12">
          <!-- Prayer Content and Video -->
          <div class="bg-white shadow-lg rounded-lg p-8 mb-8">
            <div class="lg:flex lg:gap-8">
              <!-- Prayer Text Column -->
              <div class="lg:w-1/2 w-full mb-6 lg:mb-0">
                <!-- English Version -->
                <div class="mb-8 bg-green-50 p-6 rounded-lg">
                  <h3 class="font-bold text-lg text-green-800 mb-4 text-center">
                    The Lasallian Prayer
                  </h3>
                  <div class="text-center space-y-4">
                    <p class="text-sm leading-relaxed italic">
                      Let us remember that we are in the holy presence of God.
                    </p>
                    <p class="text-sm leading-relaxed">
                      I will continue, O my God, to do all my actions for the love of You.
                    </p>
                    <p class="text-sm leading-relaxed">
                      Saint John Baptist de La Salle, pray for us.
                    </p>
                    <p class="text-sm leading-relaxed font-semibold text-green-800">
                      Live Jesus in our hearts, forever.
                    </p>
                  </div>
                </div>

                <!-- Filipino Version -->
                <div class="bg-white border-2 border-green-800 p-6 rounded-lg">
                  <h3 class="font-bold text-lg text-green-800 mb-4 text-center">
                    Ang Panalangin ng mga Lasalyano
                  </h3>
                  <div class="text-center space-y-4">
                    <p class="text-sm leading-relaxed italic">
                      Ating alalahanin na ang Diyos ay ating kapiling.
                    </p>
                    <p class="text-sm leading-relaxed">
                      Ipagpapatuloy ko, O Diyos, ang lahat ng aking gawain upang<br>
                      Ikaw ay lalong pakaibigin.
                    </p>
                    <p class="text-sm leading-relaxed">
                      San Juan Bautista de La Salle, ipanalangin mo kami.
                    </p>
                    <p class="text-sm leading-relaxed font-semibold text-green-800">
                      Mabuhay ka Hesus sa aming mga puso, magpakailanman.
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
                      src="https://www.youtube.com/embed/EO2IFmO4I7A?start=32"
                      title="Lasallian Prayer"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <p class="text-xs text-center mt-3 text-gray-600 italic">
                    The Lasallian Prayer
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-green-50 p-6 rounded-lg">
            <h3 class="font-bold text-base text-green-800 mb-4">About the Lasallian Prayer</h3>
            <p class="text-xs mb-3 text-justify">
              The Lasallian Prayer is a fundamental expression of faith that unites all members of
              the Lasallian family worldwide. It begins with the reminder of God's presence, a core
              principle taught by Saint John Baptist de La Salle, who encouraged his Brothers and
              students to be mindful of God's presence in all their actions.
            </p>
            <p class="text-xs mb-3 text-justify">
              This prayer reflects the Lasallian commitment to doing all things for the love of God
              and seeking the intercession of our Founder. It concludes with the affirmation "Live
              Jesus in our hearts, forever," expressing our desire to keep Christ at the center of
              our lives and our educational mission.
            </p>
            <p class="text-xs text-justify">
              The prayer is recited daily in Lasallian schools and institutions around the world,
              serving as a constant reminder of our identity, mission, and the spiritual foundation
              of Lasallian education.
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
