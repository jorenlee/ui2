<script setup>
  const title = ["About the LRC", "(lrc)", "LRC", ]
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
  const visionMissionGoals = ref(
    [
      {
        title: "vision",
        description: "LSU-LRC aims to empower lifelong learning through a dynamic and inclusive hub of resources, innovation, collaboration, and linkages."
      },
      {
        title: "mission",
        description: "LSU-LRC enables academic excellence and personal growth by offering comprehensive resources, expert assistance, and collaborative space that empower the students, faculty, staff and other stakeholders to thrive in their pursuit of knowledge and lifelong learning."
      },
      {
        title: "goals",
        description: "	LSU-LRC elevates the learning experience by continuously enhancing its offerings, accessibility, and assistance services through innovative resources, personalized support, and collaborative spaces to foster a culture of academic achievement among students, faculty, staff, and other stakeholders."
      },
    ]
  )
  const objectives = [
    {
      title: "Expand Resource Accessibility",
      description: "Increase the availability of physical and digital learning resources, ensuring diverse formats and topics to cater to the varied academic needs of students, faculty, and researchers."
    },
    {
      title: "Foster Information Literacy",
      description: "Develop and implement targeted programs that equip students with essential information literacy skills, empowering them to critically evaluate, use, and ethnically cite information from various sources."
    },
    {
      title: "Enhance Technological Proficiency",
      description: "Offer workshops and resources that assist the university community in developing proficiency with digital tools and technologies, supporting effective research, collaboration, and learning."
    },
    {
      title: "Strengthen Collaborative Spaces",
      description: "Design and maintain welcoming and adaptable collaborative spaces within the Learning Resource Center, facilitating interdisciplinary interactions, group projects, and knowledge-sharing among users."
    },
    {
      title: "Provide Expert Assistance",
      description: "Implement regular assessment strategies to gauge the effectiveness of Learning Resource Center services and resources, using feedback to make informed enhanced enhancements that align with the evolving needs of the university community."
    },
    {
      title: "Measure and Improve Impact",
      description: "Implement regular assessment strategies to gauge the effectiveness of Learning Resource Center services and resources, using feedback to make informed enhanced enhancements that align with the evolving needs of the university community."
    },
  ]
  const resources = [
    {
        imgSource: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSq1.jpg"
    },
    {
        imgSource: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSq2.jpg"
    },
    {
        imgSource: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSq3.jpg"
    },
    {
        imgSource: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSq4.jpg"
    },
    {
        imgSource: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSq5.jpg"
    },
    {
        imgSource: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSq6.jpg"
    }
  ]
  const services = [
    {
        text: "circulation and readers services",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM1.jpg",
        description: "This service involves checking out and checking in library materials, such as books, periodicals, audiovisual items, and digital resources."
    },
    {
        text: "library literacy instruction",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM2.jpg",
        description: "This service focuses on introducing the library resources and services to our students and helping them identify their information needs and develop well-defined research topics."
    },
    {
        text: "the multimedia services",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM3.jpg",
        description: "The library also maintains a collection of multimedia materials, including DVDs, CDs, Blu-rays, audio recordings, and other audiovisual resources."
    },
    {
        text: "thesis and dissertation support",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM4.jpg",
        description: "This service guides the students through the process of submitting their theses and dissertations to the university's official repository, ensuring proper management and access for future researchers."
    },
    {
        text: "reference and research assistance",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM5.jpg",
        description: "This service aims to assist students find relevant and reliable information by offering guidance on how to effectively use library’s resources and databases."
    },
    {
        text: "online databases and e-resources",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM6.jpg",
        description: "At LSU-LRC, our service goes beyond traditional books. We provide students with access to a wide range of digital resources in the library, like e-books, e-journals, e-magazines and other electronic resources."
    },
    {
        text: "archives and special collections",
        imgSrc: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/library/logoSqSM7.jpg",
        description: "This service focuses on collecting, organizing, and providing access to rare and specialized materials which are not typically found in the general circulating collection of the library"
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
                <li>
                    <i class="fas fa-caret-right mx-1.5 mt-0.5"></i>
                    <a href="/library" class=""> Learning Resource Center </a>
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

            <div class="lg:rounded-xl flex shadow-md  bg-white my-3 lg:py-7 py-3 mx-auto w-11/12 shadow-r-md text-sm text-center">
              <p class="lg:px-10 px-3 lg:text-sm text-xs">
                <span class="font-bold text-green-800">The La Salle University - Learning Resource Center</span> (LSU-LRC) is dedicated to fostering a culture of learning within the Lasallian community. Learn more about us! Scroll down below.
              </p>
            </div>
            <div class="lg:rounded-xl shadow-md  bg-white my-3 py-5 mx-auto w-11/12 text-sm">
              <ul class="grid grid-cols-3 px-10 py-5 gap-10 text-center">
                <li v-for="(j,i) in visionMissionGoals" :key="i">
                    <p class="uppercase mb-5 bg-green-800 py-1 text-white font-bold w-fit mx-auto px-5 lg:text-lg text-sm">{{ j.title }}</p>
                    <p>{{ j.description }}</p>
                </li>
              </ul>
            </div>
            <div class="lg:rounded-xl shadow-md  bg-white my-3 py-5 mx-auto w-11/12 text-sm ">
                <p class="uppercase mb-5 bg-green-800 py-1 text-white font-bold w-fit mx-auto px-5  lg:text-lg text-sm">Objectives</p>
                <ul>
                    <li v-for="(j,i) in objectives" :key="i" class="mb-5 shadow w-11/12 mx-auto">
                        <p class=" bg-green-600 py-1 text-white font-bold w-fit px-5"><span class="mr-10">{{ i + 1 }}</span> {{ j.title }}</p>
                        <p class="mx-8 py-2">{{ j.description }}</p>
                    </li>
                </ul>
            </div>
            <div class="lg:rounded-xl shadow-md  bg-white my-3 py-5 mx-auto w-11/12 text-sm ">
                <p class="uppercase mb-5 bg-green-800 py-1 text-white font-bold w-fit mx-auto px-5 lg:text-lg text-sm">Resources</p>
                <p class="lg:text-sm text-xs text-center px-10">LSU-LRC is dedicated to fostering a culture of learning within the Lasallian community. Our name reflects the pivotal role we play in facilitating access to educational resources, nurturing the acquisition of knowledge, and encouraging a lifelong commitment to learning.</p>
                <ul class="lg:grid grid-cols-3 gap-5 w-8/12 mx-auto my-5">
                    <li v-for="(j,i) in resources" :key="i">
                        <img :src="j.imgSource" class="w-10/12 mx-auto"/>
                    </li>
                </ul>
            </div>
            <div class="lg:rounded-xl shadow-md  bg-white my-3 py-5 mx-auto w-11/12 text-sm ">
                <p class="uppercase mt-5 mb-5 bg-green-800 py-1 text-white font-bold w-fit mx-auto 
                px-5 lg:text-lg text-sm">services</p>
                <p class="lg:text-sm text-xs text-center w-8/12 mx-auto mb-10">
                    LSU-LRC has evolved to be more inclusive and adaptable, encompassing a diverse range of services essential in modern education. Here are the various services that our LRC offers:
                </p>
                <div class="lg:flex w-11/12 mx-auto mt-5 gap-10">
                    <div class="flex items-center w-full">
                        <ul class="w-full">
                            <li v-for="(j,i) in services.slice(0,4)" :key="i" 
                            class="flex items-center mb-10">
                                <span class="w-9/12 text-xs">
                                    <p class=" text-right capitalize font-bold text-green-700">
                                        {{ j.text }}
                                    </p>
                                    <p class="text-right">
                                        {{ j.description }}
                                    </p>
                                </span>
                                <span class="w-3/12">
                                    <img :src="j.imgSrc" class="w-20 ml-auto"/>
                                </span>
                            </li>
                        </ul>
                    </div>
                    <div class="flex items-center w-full">
                        <ul class="w-full">
                            <li v-for="(j,i) in services.slice(4,7)" :key="i" 
                            class="flex items-center mb-10">
                                <span class="w-3/12">
                                    <img :src="j.imgSrc" class="w-20 mr-auto"/>
                                </span>
                                <span class="w-9/12 text-xs">
                                    <p class="text-left capitalize font-bold text-green-700">
                                        {{ j.text }}
                                    </p>
                                    <p class="text-left">
                                        {{ j.description }}
                                    </p>
                                </span>
                            </li>
                        </ul>
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