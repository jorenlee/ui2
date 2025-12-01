<script setup>
  const title = ["online resources", "(lrc)", "LRC", ]
  const otherFeatures = [{
    title: "Learning Resource Center",
    link: "/library",
  }, {
    title: "LRC Book Thru",
    link: "/library/LRCBookThru",
  }, {
    title: "Online Public Access Catalog",
    link: "https://lsu-opac.follettdestiny.com",
  }, {
    title: "Library Overview",
    link: "/library/overview",
  }, {
    title: "Online Library Services",
    link: "/library/new-normal",
  }, {
    title: "Library Collection",
    link: "/library/collection",
  },   
  {
    title: "Library and Information Services Month",
    link: "/library",
  },
  {
    title: "Virtual Library Programs",
    link: "/library",
  }, {
    title: "Library Gamification System",
    link: "/library",
  }, {
    title: "Library Personnel",
    link: "/library",
  }, 
    {
    title: "Webinars and Workshops",
    link: "/library",
  }, 
   {
    title: "Library Opening Hours",
    link: "/library",
  }, ];
  useHead({
    script: [{
      src: '/messenger/library/library.js',
      tagPosition: 'bodyClose',
      defer: true
    }, {
      src: '/messenger/library/fb.sdk-library.js',
      tagPosition: 'bodyClose',
      defer: true
    }, ],
  })
  const subscribedEResources = ref([
    {
        title: "Science Direct",
        description: "This database provides access to more than 18 million articles and book chapters from over 2,650 peer-reviewed journals and 42,000 e-books, including books, book series and major reference works, and digital archives that reach as far back as 1823 to help users discover more science, use their time efficiently and make decisions with the highest-quality scientific information."
    },
    {
        title: "ProQuest Central",
        description: "It is the largest single periodical resource available, bringing together complete databases across all major subject areas, including Business, Health and Medical, Language and Literature, Social Sciences, Education, Science and Technology, as well as core titles in the Performing and Visual Arts, History, Religion, Philosophy, and includes thousands of full-text newspapers from around the world."
    },
    {
        title: "Gale Cengage Learning",
        description: "It is a world leader in e-research and educational publishing for libraries, schools, and businesses. Best known for accurate and authoritative reference content as well as intelligent organization of full-text magazine and newspaper articles, Gale publishes learning resources in a variety of formats including Web portals, digital archives, print, and e-books."
    },
    {
        title: "Press Reader",
        description: "This database provides interactive, digital access to nearly 7,000 of the world’s best newspapers and magazines. Just like reading a print edition, viewers can browse articles and other key elements, including pictures, advertisements, classifieds, and notices. With the ability to perform keyword searches across all titles, and save both stories and full publications, researchers are sure to find the stories they’re looking for."
    },
    {
        title: "Philippine E-Journals (PEJ)",
        description: "PEJ is a virtual repository brimming with scholarly publications from esteemed higher education institutions and professional organizations across the Philippines. This state-of-the-art database is your portal to effortlessly uncover abstracts, full journal articles, and valuable links to related research materials."
    },
    {
        title: "SU Research Repository",
        description: "The Research Repository is an online collection of research outputs of faculties and students from different colleges and departments. Its sophisticated database allows users to easily locate abstracts and their citations."
    },
    {
        title: "Free/Open Educational Resources",
        description: "OERs are materials used for teaching, learning, and research that are freely available to the public. These resources are typically released under an open license, which allows users to access, use, adapt, and share the materials without restrictions or with minimal restrictions."
    }
  ])
</script>
<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="">
        <div class="relative">
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg" class="align-top w-full h-auto lg:object-fill lg:block hidden" />
          <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png" class="align-top w-full h-36 object-none lg:hidden block" />
          <div class="
              pt-10
              absolute
              top-1/2
              transform
              -translate-y-1/2
              w-full
            ">
            <h1 class="
                font-bold
                uppercase
                text-white
                lg:text-2xl
                text-lg
                w-11/12
                mx-auto
              ">
              {{title[0]}}
            </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <div class="w-11/12 mx-auto flex justify-between">
              <ul class="flex lasalle-green-text capitalize text-xs">
                <li>
                  <a href="/" class=""> Home </a>
                </li>
                <li class="flex items-center">
                  <i class="fas fa-caret-right mx-1.5 mt-0.5"></i>
                  <a href="/library" class="mr-1 flex">
                    <span class="lg:flex hidden ml-1"> {{title[0]}}</span>
                    <span class="lg:hidden flex"> {{title[2]}}</span>
                  </a>
                </li>
              </ul>
              <ul class="flex text-green-800 capitalize text-xs">
                <li>
                  <a href="/library/login" class="mr-1 flex items-center">
                    <i class="fa fa-user mr-2" aria-hidden="true"></i> Admin Login </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:flex">
        <div class="lg:order-2 order-1 lg:w-5/12 lg:mt-5">
          <div class="w-11/12 mx-auto lg:my-0 my-3 lg:shadow border-l-4 border-green-900">
            <h1 class="text-white bg-green-900 text-center lg:py-3 py-2 text-sm">Library Spaces</h1>
            <div class="grid lg:grid-cols-1 grid-cols-3">
              <NuxtLink v-for="(f, i) in otherFeatures" :key="i" :to="f.link" class=" hover:bg-green-800 text-green-800 hover:text-white lg:text-sm text-xs lg:py-2.5 py-2 flex items-center px-3 shadow w-full">
                <i class="fa fa-caret-right mt-1.5 lg:mr-3 mr-2 lg:flex hidden"></i> 
                  {{f.title}}
              </NuxtLink>
            </div>
          </div>
          <div class="mx-auto w-11/12 lg:mt-5 lg:mb-0 mt-3 lg:shadow">
            <div class="bg-green-900 w-full lg:pt-3 lg:pb-3 pt-2 pb-4 pr-14 pl-5 shadow-2xl lg:mb-0 mb-2">
              <div class="">
                <div class="">
                  <div class="flex">
                    <i class="fa fa-user lg:text-2xl text-xl text-white mr-5 ml-1.5 mt-2"></i>
                    <div class="flex items-center mt-3">
                      <h5 class="text-white lg:text-sm text-xs">
                        <!-- <span class="font-bold lg:text-sm text-xs">09190053779</span><br> -->
                        <span class="font-bold lg:text-sm text-xs">
                          lsu.instructure.com/courses/1999
                        </span>
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="lg:my-2">
                  <div class="flex">
                    <i class="fa fa-phone-square lg:text-2xl text-xl text-white mr-5 ml-1.5 mt-1"></i>
                    <div class="flex items-center mt-1">
                      <h5 class="text-white lg:text-sm text-xs">
                        <!-- <span class="font-bold lg:text-sm text-xs">09190053779</span><br> -->
                        <span class="font-bold lg:text-sm text-xs">(088) 521-0342</span> LOC 135
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="lg:my-2">
                  <div class="">
                    <a href="https://www.facebook.com/lsu.lib" class="flex">
                      <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-fb.png" class="lg:w-6 w-5 mt-1 mr-5 ml-1" alt="FB" />
                      <div class="flex items-center">
                        <h5 class="text-white text-sm">
                          <span class="font-bold lg:text-sm text-xs">facebook.com/lsu.lib</span>
                        </h5>
                      </div>
                    </a>
                  </div>
                </div>
                <div class="lg:my-2">
                  <div class="flex">
                    <i class="fa fa-envelope lg:text-xl text-xl text-white mr-5 mt-1 lg:ml-1.5 ml-1"></i>
                    <div class="flex items-center mt-0.5">
                      <h5 class="text-white text-sm">
                        <span class="font-bold lg:text-sm text-xs">library.helpdesk@lsu.edu.ph</span>
                      </h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="lg:order-1 order-2">
          <div class="">
            <a href="https://lsu.edu.ph/library/LRCBookThru" class="hover:rounded-lg shadow-lg transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 lg:mt-5 lg:mb-5 relative w-11/12 mx-auto bg-[#024202] lg:h-[136px] h-[51px] block">
              <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/libraryAds.png" class="h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 absolute"/>
            </a>
            <div class="rounded-xl flex mx-auto shadow-md w-11/12 bg-white my-3">
              <div class="lg:py-7 py-5 mx-auto w-11/12 shadow-r-md text-sm">
                <p>
                    At <span class="text-green-800 font-bold ">La Salle University - Learning Resource Center</span>, we remain updated on the latest advancements and innovations. This includes embracing digitization, offering online resource accessibility, implementing modern cataloging systems, and leveraging emerging technologies to enrich library services. Our commitment extends beyond conventional books. We afford students access to a diverse array of digital resources, including e-books, e-journals, e-magazines, and other electronic materials. Explore the list of online resources below awaiting your discovery!
                </p>
              </div>
            </div>
            <div class="w-11/12 mx-auto lg:my-5 my-3 rounded-xl shadow-md bg-white">
                <p class="px=10 bg-green-800 text-base font-bold text-white text-center py-2">Subscribed E-Resources</p>
                <div class="px-5 pt-0 pb-5">
                    <ul>
                        <li v-for="(j,i) in subscribedEResources" 
                            :key="i" class=""> 
                           <p class="mt-3 bg-green-700 font-bold shadow w-fit px-5 py-0.5 text-white">
                            <i class="fa fa-caret-right"></i> 
                            {{ j.title }}</p>

                           <p class="px-5 pt-3 pb-3 shadow lg:text-sm text-xs"> {{ j.description }}</p>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="w-11/12 mx-auto lg:my-5 my-3 rounded-xl shadow-md bg-white py-5 px-5">
              <p class="text-xs">
                If you encounter any difficulties or have specific questions, you can ask assistance from your librarians through our communication channels provided above.
              </p>
            </div>
          </div>
        </div>
       
      </div>
    </div>
    <div>
      <div id="fb-root"></div>
      <div id="fb-customer-chat-library" class="fb-customerchat"></div>
    </div>
    <Footer />
  </div>
</template>
<style scoped>
  .sub-header {
    background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/banners/LMC/LMCBanner.png");
    background-position: center;
    background-size: 100% 100%;
  }
</style>