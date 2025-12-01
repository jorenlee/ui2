<script setup>
  const title = ["learning resource center", "(lrc)", "LRC", ]
  const VMGO = ["The Learning Resource Center (LRC) aims to empower lifelong learning through a dynamic and inclusive hub of resources, innovation, collaboration, and linkages.", "The LRC enables academic excellence and personal growth by offering comprehensive resources, expert assistance, and collaborative space that empower the students, faculty, staff and other stakeholders to thrive in their pursuit of knowledge and lifelong learning.", "The LRC elevates the learning experience by continuously enhancing its offerings, accessibility, and assistance services through innovative resources, personalized support, and collaborative spaces to foster a culture of academic achievement among students, faculty, staff, and other stakeholders.",
    ["Expand Resource Accessibility: Increase the availability of physical and digital learning resources, ensuring diverse formats and topics to cater to the varied academic needs of students, faculty, and researchers.", "Foster Information Literacy: Develop and implement targeted programs that equip students with essential information literacy skills, empowering them to critically evaluate, use, and ethnically cite information from various sources.", "Enhance Technological Proficiency: Offer workshops and resources that assist the university community in developing proficiency with digital tools and technologies, supporting effective research, collaboration, and learning.", "Strengthen Collaborative Spaces: Design and maintain welcoming and adaptable collaborative spaces within the Learning Resource Center, facilitating interdisciplinary interactions, group projects, and knowledge-sharing among users.", "Provide Expert Assistance: Bolster personalzied support by recruiting skilled librarians and staff who can offer expert guidance, reference services, and assistance in navigating resources effectively.", "Measure and Improve Impact: Implement regular assessment strategies to gauge the effectiveness of Learning Resource Center services and resources, using feedback to make informed enhanced enhancements that align with the evolving needs of the university community."]
  ]
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
  const logos = ref(
    [
      {
        image: 'https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/bsp-logo.jpg',
        title: 'BSP-KNR'
      },
      {
        image: 'https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/274117265_672503967321292_5393267758998166844_n.png',
        title: 'DLSP Library Committee'
      },
      {
        image: 'https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/14449751_1331544083522632_7574361829022173141_n.png',
        title: 'ALINET'
      },
      {
        image: 'https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/LMCImages/Picture1-1.png',
        title: 'MOIMLAI'
      }
    ]
  )
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
          <div class="mx-auto w-11/12 lg:mt-5 lg:mb-0 mt-3 mb-2 lg:shadow">
            <div class="bg-green-900 w-full lg:p-5 px-10 py-3 lg:mb-10">
              <div class="">
                <div class="lg:my-2 my-1">
                  <div class="">
                    <a href="https://www.facebook.com/lsu.lib" class="flex">
                      <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-fb.png" class="lg:w-8 w-6 mt-1 mr-4" alt="FB" />
                      <div class="flex items-center">
                        <h5 class="text-white text-sm">
                          <span class="font-bold lg:text-sm text-xs">facebook.com/lsu.lib</span>
                        </h5>
                      </div>
                    </a>
                  </div>
                </div>
                <div class="lg:my-2 my-1">
                  <div class="flex">
                    <i class="fa fa-envelope lg:text-3xl text-xl text-white mr-5 mt-1"></i>
                    <div class="flex items-center">
                      <h5 class="text-white text-sm">
                        <span class="font-bold lg:text-sm text-xs">library.helpdesk@lsu.edu.ph</span>
                      </h5>
                    </div>
                  </div>
                </div>
                <div class="lg:my-2 my-1">
                  <div class="flex">
                    <i class="fa fa-phone-square lg:text-3xl text-xl text-white mr-5 lg:ml-1 ml-0.5 mt-1"></i>
                    <div class="flex items-center">
                      <h5 class="text-white lg:text-sm text-xs">
                        <!-- <span class="font-bold lg:text-sm text-xs">09190053779</span><br> -->
                        <span class="font-bold lg:text-sm text-xs">(088) 521-0342</span> LOC 135
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
            <div class="rounded-xl flex mx-auto shadow-md w-11/12">
              <div class="lg:py-7 py-3 mx-auto w-11/12 shadow-r-md">
                <ul>
                  <li class="lg:flex gap-20">
                    <div class="lg:w-6/12 lg:mb-0 mb-3">
                      <h1 class="lasalle-green-text font-bold text-md uppercase">Vision</h1>
                      <p class="text-xs text-green-900 text-justify">
                        {{VMGO[0]}}
                      </p>
                    </div>
                    <div class="lg:w-6/12 lg:mb-0 mb-3">
                      <h1 class="lasalle-green-text font-bold text-md uppercase">Mission</h1>
                      <p class="text-xs text-green-900 text-justify">
                        {{VMGO[1]}}
                      </p>
                    </div>
                  </li>
                  <li class="lg:mb-7 mb-3 lg:flex gap-20">
                    <div class="lg:w-full">
                      <h1 class="lasalle-green-text font-bold text-md uppercase">Goal</h1>
                      <p class="text-xs text-green-900 text-justify">
                        {{VMGO[2]}}
                      </p>
                    </div>
                  </li>
                  <li class="">
                    <h1 class="lasalle-green-text font-bold text-md uppercase">Objectives</h1>
                    <ul class="text-xs text-green-900 list-decimal lg:pl-7 pl-4">
                      <li :key="i" v-for="(items, i) in VMGO[3]" class="mb-1 pl-2">
                        {{items}}
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div class="text-center my-5 bg-white rounded-2xl w-11/12 mx-auto lg:pt-2 pt-1">
              <h1 class="font-bold tracking-widest lasalle-green-text uppercase mt-5 lg:mb-12 mb-5 text-xl">
                Library Network</h1>
              <div class="w-11/12 mx-auto lg:flex items-center lg:pb-10 pb-5 grid grid-cols-2 md:grid-cols-4 lg:gap-2 gap-5">
                <div class="lg:w-1/4" v-for="(j,i) in logos" :key="i">
                  <div class="flex lg:h-44 h-32">
                    <img :src="j.image" class="lg:w-[160px] w-[140px] lg:h-44 mb-1 mx-auto object-contain" :alt="j.title" />
                  </div>
                  <h3 class="text-center uppercase lasalle-green-text text-sm leading-tight">
                    {{j.title}}
                  </h3>
                </div>
              </div>
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