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
    <div class="lg:pb-5 pb-1 w-11/12 mx-auto shadow-lg lg:mb-10 mb-3">
           <div class="bg-green-800">
            <!-- <div class="h-2 w-full bg-white mx-auto my-3"></div> -->
                <h2 class="lg:tracking-widest uppercase text-white lg:py-2
                font-bold lg:text-[30px] text-center px-3 lg:mb-8 mb-4 leading-[28px] font-hk-compression">Strategic Intents</h2>
            <!-- <div class="h-2 w-full bg-white mx-auto my-3"></div> -->
           </div>
            <div class="mt-3">
                <ul class="w-11/12 mx-auto justify-center text-center">
                  <li class="lg:my-0 my-3 justify-center lg:flex items-center gap-3 mb-5">
                      <!-- <video width="100%" height="100%" controls loop controlsList="nodownload" class="shadow-xl bg-green-900 border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2">
                        <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/videos/SI1.mp4" type="video/mp4"> Your browser does not support the video tag.
                      </video> -->
                     

                      <div class="shadow-xl bg-green-900 lg:h-[240px] h-[190px] border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2">
                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/F3a5icWaz-8" title="LSU Strategic Intent 1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                      </div>



                      <div class="font-bold uppercase text-green-900  lg:text-left text-center mb-10 lg:w-8/12">
                        <p class="lg:text-3xl text-sm font-hk-compression lg:mt-0 mt-2">SI 1.0</p> 
                        <p class="font-montserrat lg:text-base text-xs">Reengineer the learning experience <br>to foster learner engagement</p>
                      </div>
                  </li>
                  <li class="lg:my-0 my-3 justify-center lg:flex items-center gap-3 mb-5">
                    

                    <div class="shadow-xl bg-green-900 lg:h-[240px] h-[190px] border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2 lg:order-2 order-1">
                      <iframe width="100%" height="100%" src="https://www.youtube.com/embed/aXtLk-a4uDs" title="LSU Strategic Intent 2" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
                      </div>



                    <!-- <video width="100%" height="100%" controls loop controlsList="nodownload" class="shadow-xl bg-green-900 border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2 lg:order-2 order-1">
                      <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/videos/SI2.mp4" type="video/mp4"> Your browser does not support the video tag.
                      </video> -->
                    <div class="font-bold uppercase text-green-900  mb-5 lg:w-8/12 lg:order-1 order-2 lg:text-right text-center">
                      <p class="lg:text-3xl text-sm font-hk-compression lg:mt-0 mt-2">SI 2.0</p> 
                      <p class="font-montserrat lg:text-base text-xs">Nurture a community of <br>lifelong learners</p>
                  </div>
                     
                  </li>
                  <li class="lg:my-0 my-3 justify-center lg:flex items-center gap-3 mb-5">
                      <div class="shadow-xl bg-green-900 lg:h-[240px] h-[190px] border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2">
                        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/QZsDGui_f7k" title="LSU Strategic Intent 3" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
                      </div>
                      <!-- <video width="100%" height="100%" controls loop controlsList="nodownload" class="shadow-xl bg-green-900 border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2">
                      <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/videos/SI3.mp4" type="video/mp4"> Your browser does not support the video tag.
                      </video> -->
                      <div class="font-bold uppercase text-green-900  lg:text-left text-center mb-10 lg:w-8/12">
                        <p class="lg:text-3xl text-sm font-hk-compression lg:mt-0 mt-2">SI 3.0</p> 
                        <p class="font-montserrat lg:text-base text-xs">Broaden participation in<br> circles of Quality Management</p>
                      </div>
                  </li>
                  <li class="lg:my-0 my-3 justify-center lg:flex items-center gap-3 mb-5">
                    <div class="shadow-xl bg-green-900 lg:h-[240px] h-[190px] border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2 lg:order-2 order-1">
                      <iframe width="100%" height="100%" src="https://www.youtube.com/embed/PnWMImaTvMA" title="LSU Strategic Intent 4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen ></iframe>
                      </div>
                    
                    
                    <!-- <video width="100%" height="100%" controls loop controlsList="nodownload" class="shadow-xl bg-green-900 border-4 border-green-900 mx-auto lg:w-4/12 lg:mb-2 lg:order-2 order-1">
                      <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/videos/SI4.mp4" type="video/mp4"> Your browser does not support the video tag.
                      </video> -->
                      <div class="font-bold uppercase text-green-900  mb-5 lg:w-8/12 lg:order-1 order-2 lg:text-right">
                        <p class="lg:text-3xl text-sm font-hk-compression lg:mt-0 mt-2">SI 4.0</p> 
                        <p class="font-montserrat lg:text-base text-xs">Contribute to the building of a<br> more sustainable community</p>
                      </div>
                  </li>
                </ul>
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
