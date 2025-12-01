<script setup>
  const title = ["learning resource center", "(lrc)", "LRC", ]
  const VMGO = ["The Learning Resource Center (LRC) aims to empower lifelong learning through a dynamic and inclusive hub of resources, innovation, collaboration, and linkages.", "The LRC enables academic excellence and personal growth by offering comprehensive resources, expert assistance, and collaborative space that empower the students, faculty, staff and other stakeholders to thrive in their pursuit of knowledge and lifelong learning.", "The LRC elevates the learning experience by continuously enhancing its offerings, accessibility, and assistance services through innovative resources, personalized support, and collaborative spaces to foster a culture of academic achievement among students, faculty, staff, and other stakeholders.",
    ["Expand Resource Accessibility: Increase the availability of physical and digital learning resources, ensuring diverse formats and topics to cater to the varied academic needs of students, faculty, and researchers.", "Foster Information Literacy: Develop and implement targeted programs that equip students with essential information literacy skills, empowering them to critically evaluate, use, and ethnically cite information from various sources.", "Enhance Technological Proficiency: Offer workshops and resources that assist the university community in developing proficiency with digital tools and technologies, supporting effective research, collaboration, and learning.", "Strengthen Collaborative Spaces: Design and maintain welcoming and adaptable collaborative spaces within the Learning Resource Center, facilitating interdisciplinary interactions, group projects, and knowledge-sharing among users.", "Provide Expert Assistance: Bolster personalzied support by recruiting skilled librarians and staff who can offer expert guidance, reference services, and assistance in navigating resources effectively.", "Measure and Improve Impact: Implement regular assessment strategies to gauge the effectiveness of Learning Resource Center services and resources, using feedback to make informed enhanced enhancements that align with the evolving needs of the university community."]
  ]
  const otherFeatures = [{
    title: "Services",
    link: "/library",
  }, 
  {
    title: "Resources",
    link: "/library",
  }, 
  {
    title: "Policies and Guidelines",
    link: "/library",
  }, 
  {
    title: "New Acquisitions",
    link: "/library",
  }, 
  {
    title: "Library Gamification",
    link: "/library",
  }, 
  {
    title: "Library Literacy Instruction Program (LLIP)",
    link: "/library",
  },   
  {
    title: "LRC Reports",
    link: "/library",
  },
  {
    title: "LRC Updates",
    link: "/library",
  }, 
  {
    title: "How to Contact Us?",
    link: "/library",
  }];
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
        image: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/e-resources-logo1.png',
        title: ''
      },
      {
        image: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/e-resources-logo2.png',
        title: ''
      },
      {
        image: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/e-resources-logo3.png',
        title: ''
      },
      {
        image: 'https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/e-resources-logo4.png',
        title: ''
      }
    ]
  )
  const otherLibraryPagesBasicEd = ref([
    {
      imageURL: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/lib-icon1.png",
      title: "ABOUT THE LRC",
      description: "Learn more about your library. Click here!",
      linkToPage: "/",
    },
    {
      imageURL: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/lib-icon2.png",
      title: "BOOK THRU",
      description: "Want to borrow a book? Click hereLinks to an external site. to start.",
      linkToPage: "/",
    },
    {
      imageURL: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/lib-icon3.png",
      title: "WEBOPAC",
      description: "Search available books hereLinks to an external site.!",
      linkToPage: "/",
    },
    {
      imageURL: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/lib-icon4.png",
      title: "MYLIBRARY ACCOUNT",
      description: "Keep track of your borrowed library resources. Log-in to your MyLibrary AccountLinks to an external site now!",
      linkToPage: "/",
    },
    {
      imageURL: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/lib-icon5.png",
      title: "ONLINE RESOURCES",
      description: "Explore a variety of useful online resources for your researches here!",
      linkToPage: "/",
    },
    {
      imageURL: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/lib-icon6.png",
      title: "LRC Guides",
      description: "Check out LRC tutorials and other how-to videos here!",
      linkToPage: "/",
    }
  ])
  const libraryServiceHours = [
    {
      scheduledDay: "Monday to Saturday",
      time: "07:00 AM - 6:00 PM",
      description: ""
    },
    {
      scheduledDay: "Saturday",
      time: "08:00 AM - 5:00 PM",
      description: ""
    },
    {
      scheduledDay: "Sunday",
      time: "8:00 AM - 5:00 PM",
      description: "(as per request from the School of Graduates Studies)"
    }
  ]
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
          <div class="mx-auto w-11/12 lg:mt-5 lg:mb-0 mb-2 lg:shadow">
            <div class="bg-green-900 w-full pt-3 pb-0.5 px-5 lg:mb-10 shadow-2xl">
              <h2 class="uppercase text-white font-bold text-lg text-center w-full mb-3 mt-2">Library Service Hours</h2>
              <div class="my-2 shadow pb-2 text-center" v-for="(j,i) in libraryServiceHours">
                <h5 class="text-white text-sm">
                  <span class="font-bold lg:text-sm text-xs">
                    {{ j.scheduledDay }}<br> {{ j.time }}
                  </span>
                  <span class="block text-xs w-10/12 mx-auto">{{ j.description }}</span>
                </h5>
              </div>
              <p class="text-xs text-center mb-5 text-white italic">
                Note: Access to the library's digital resources is available 24/7 via our library webpage.</p>
            </div>
          </div>
        </div>
        <div class="lg:order-1 order-2">
          <div class="">
            <a href="https://lsu.edu.ph/library/LRCBookThru" class="hover:rounded-lg shadow-lg transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 lg:mt-5 lg:mb-5 relative w-11/12 mx-auto bg-[#024202] lg:h-[136px] h-[51px] block">
              <img src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/libraryAds.png" class="h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 absolute"/>
            </a>

            <div class="lg:rounded-xl flex shadow-md  bg-white my-3 lg:py-7 py-3 mx-auto w-11/12 shadow-r-md text-sm">
              <p class="lg:px-10 px-3 lg:text-sm text-xs">
                <span class="font-bold text-green-800">The La Salle University - Learning Resource Center</span> plays a vital role in supporting your educational and research needs. Hence, we continue to deliver innovative services that will cater to your Face-to-Face, Online and BlendFlex activities. We provide access to the world of knowledge- whether online, multimedia or print- and training to fully exploit these library resources. Please utilize the links below to get started.
              </p>
            </div>
            <div class="lg:rounded-xl shadow-md  bg-white my-3 py-5 mx-auto w-11/12 shadow-r-md text-sm ">
              <h2 class="uppercase text-green-800 font-bold lg:text-2xl text-lg text-center w-full lg:mb-7 mb-4 lg:mt-2">Let's get started!</h2>
              <ul class="w-11/12 mx-auto grid lg:grid-cols-2 lg:gap-x-10 gap-x-4 lg:gap-y-5 gap-y-2">
                <li v-for="(j, i) in otherLibraryPagesBasicEd" class="flex items-center lg:gap-x-5 gap-x-1">
                  <span class="lg:w-3/12 w-4/12 hover:shadow-lg">
                    <img :src="j.imageURL" class="lg:w-[100px] lg:h-[100px] w-[80px] h-[80px]"/>
                  </span>
                  <span class="lg:w-9/12 w-8/12">
                    <p class="uppercase text-green-800 font-bold">{{ j.title }}</p>
                    <p class="lg:text-sm text-xs">{{ j.description }}</p>
                  </span>
                </li>
              </ul>
            </div>
            <div class="lg:flex text-center lg:my-5 my-2 bg-white lg:rounded-2xl w-11/12 mx-auto shadow-md gap-x-5 lg:px-5 px-2 py-2">
              <div class="w-full shadow-lg lg:my-5 mb-2 border-4 border-green-900 bg-gradient-to-t from-green-800 to-green-800 text-white">
                <p class="lg:w-10/12 mx-auto lg:px-10 text-xs tracking-tight p-2">
                  Quick Overview of the La Salle University - Learning Resource Center and its programs and services: 
                </p>
                <div class="w-full">
                  <video width="100%" controls autoplay muted>
                  <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/LRCOverview.mp4" type="video/mp4">
                  <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/LRCOverview.mp4" type="video/ogg">
                  Your browser does not support HTML video.
                </video>
                </div>
              </div>
              <div class="w-full shadow-lg lg:my-5 border-4 border-green-900 bg-gradient-to-t from-green-800 to-green-800 text-white">
                <p class="w-full lg:font-bold text-lg text-white lg:py-2.5 py-1 tracking-tight">
                  Meet the LRC Team!
                </p>
                <div class="w-full">
                <video width="100%" controls autoplay muted>
                  <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/LRCTeam.mp4" type="video/mp4">
                  <source src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/LRCTeam.mp4" type="video/ogg">
                  Your browser does not support HTML video.
                </video>
               </div>
              </div>
            </div>
            <div class="text-center lg:my-5 my-2 bg-white lg:rounded-2xl w-11/12 mx-auto lg:pt-2 pt-1 shadow-md">
              <h1 class="font-bold tracking-widest lasalle-green-text uppercase mt-5 lg:mb-12 mb-5 lg:text-xl">
                Subscribed E-Resources
              </h1>
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
            <div class="text-center bg-white w-11/12 mx-auto shadow-md lg:my-5 my-2">
              <h1 class="w-fit lg:flex block mx-auto font-bold lasalle-green-text uppercase py-2 text-xs">
               <span class="lg:flex block">"When in doubt, go to the library."</span>
               <span class="lg:flex block">- J.K. Rowling</span>
              </h1>
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