<script setup>
const dummy = ref([
  {
    text: 'school calendar',
    hoverImage: false,
    hoverImageBanner: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/School%20Calendar.png",
    link: "/events/calendar",
  },
  {
    text: 'monthly calendar',
    hoverImage: false,
    hoverImageBanner: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/School%20Calendar.png",
    link: "/events/calendar",
  },
  {
    text: 'LSU University Student Government',
    hoverImage: false,
    hoverImageBanner: "",
  },
  {
    text: 'LSU Sports and Wellness Center',
    hoverImage: false,
    hoverImageBanner: "",
  },
  {
    text: 'Arts and Culture Center',
    hoverImage: false,
    hoverImageBanner: "",
  },
])
const videos = ref([
  // {
  //   link: "",
  //   title: "Canvas Log-In Tutorial",
  // },
  {
    link: "https://www.youtube.com/embed/tljtkaxku9Q",
    title: "LSU Vision Mission and Seal",
  },
  {
    link: "https://www.youtube.com/embed/Yv5-Qx1_PHA",
    title: "LSU Institutional Learning Outcomes",
  },
  {
    link: "https://www.youtube.com/embed/hZvVrqnrxqY",
    title: "LSU Campus Discipline Guidelines",
  },
  {
    link: "https://www.youtube.com/embed/73yNsykXCWo",
    title: "Good Netizenship",
  },
  {
    link: "https://www.youtube.com/embed/S4lLzXFZjXk",
    title: "Lasallian Virtual Netiquette",
  },
]);

const itemsLength = ref(3);
const loadMore = () => {
  if (itemsLength.value > videos.value.length) return;
  itemsLength.value = itemsLength.value + 3;
};

let itemsLoaded = computed(() => {
  return videos.value.slice(0, itemsLength.value);
});
</script>

<template>
  <div class="">
    <Header />
    <div class="">
      <div class="relative">
        <Banner />
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
          class="align-top w-full h-36 object-none lg:hidden block" />
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Events and Activities
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex flex-wrap lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="#" class="mr-1"> University Events and Activities </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a class="hover:underline mr-1" href="#"> A.Y 2024 - 2025 </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="h-full">
      <div class="">
        <h1
          class="text-center tracking-loose uppercase lg:mb-10 mt-5 mb-3 mx-auto font-bold w-11/12 lg:text-4xl leading-6 text-lg lg:pt-10 pt-4 text-green-800 lg:pb-3 pb-2">
          University Events
        </h1>
        <ul class="lg:gap-10 gap-2 lg:grid-cols-5 grid-cols-2 grid w-11/12 mx-auto">
          <li v-for="(v, i) in dummy" :key="i" @mouseover="v.hoverImage = true" @mouseleave="v.hoverImage = false">
            <a :href="v.link"
              class="text-green text-center flex items-center hover:bg-green-700 w-full lg:h-[100px] h-[50px] text-green-950 hover:text-white bg-white lg:border-green-800 rounded-sm cursor-pointer capitalize hover:p-0 lg:p-2 lg:shadow-lg"
              target="_blank">
              <span class="bg-green-700 block h-full" :class="v.hoverImage ? 'w-0': 'lg:w-2 w-1'"></span>
              <span class="hover:text-center hover:justify-center text-left lg:pl-2.5 pl-1.5 hover:p-5 w-full lg:bg-green-900 bg-green-800 hover:bg-white text-white hover:text-green-700 py-3 h-5/6 flex items-center">
                <span class="hover:leading-[22px] leading-tighter lg:text-lg text-xs">{{ v.text }}</span>
              </span>
              <span :class="v.hoverImage ? 'visible w-0': 'invisible w-1'" class="lg:bg-green-900 block h-full"></span>
            </a>
            <div class="lg:block hidden mt-5" :class="v.hoverImage ? 'visible': 'invisible'">
              <a class="lg:w-[270px] -ml-3 block shadow-md"
                :href="v.link"
                target="_blank">
                <!-- <img :src="v.hoverImageBanner" /> -->
              </a>
            </div>
          </li>
        </ul>
      </div>
      <div class="w-11/12 mx-auto">
        <!-- <div class="lg:flex gap-10">
          <div class="w-full">
            <div class="mx-auto border border-green-800 lg:my-5 lg:order-2 order-1">
              <h1
                class="font-bold lg:text-sm text-xs uppercase text-center bg-green-700 text-white py-1"
              >
                List of Academic and Sports Activities
              </h1>
              <div class="lg:flex bg-white">
                <div class="w-full lg:border-r-2 border-gray-400">
                  <h2
                    class="font-bold lg:text-sm text-xs bg-gray-800 text-white lg:p-1 p-0.5 text-center capitalize"
                  >
                    Academic Activities
                  </h2>
                  <ul class="text-center text-xs capitalize">
                    <li class="border-b lg:py-[6.9px] px-2">Debate</li>
                    <li class="border-b lg:py-[6.9px] px-2">Facebook Frame Contest</li>
                    <li class="border-b lg:py-[6.9px] px-2">
                      Video Content Making Contest
                    </li>
                    <li class="border-b lg:py-[6.9px] px-2">
                      Creative Nonfiction Writing (English and Filipino Category)
                    </li>
                    <li class="border-b lg:py-[6.9px] px-2">Essay Writing Contest</li>
                    <li class="border-b lg:py-[6.9px] px-2">Digital Photography</li>
                    <li class="border-b lg:py-[6.9px] px-2">Quiz Bowls</li>
                    <li class="lg:py-[6.9px] px-2">
                      Research Quest: Unveiling Excellence
                    </li>
                  </ul>
                </div>
                <div class="w-full">
                  <h2
                    class="font-bold lg:text-sm text-xs bg-gray-800 text-white lg:p-1 p-0.5 text-center capitalize"
                  >
                    Sports Activities
                  </h2>
                  <ul class="text-center text-xs capitalize">
                    <li class="border-b lg:py-[1px] px-2">Cheerdance Competition</li>
                    <li class="border-b lg:py-[1px] px-2">Volleyball</li>
                    <li class="border-b lg:py-[1px] px-2">Basketball</li>
                    <li class="border-b lg:py-[1px] px-2">Football</li>
                    <li class="border-b lg:py-[1px] px-2">Takraw</li>
                    <li class="border-b lg:py-[1px] px-2">Arnis</li>
                    <li class="border-b lg:py-[1px] px-2">
                      Table tennis single and double
                    </li>
                    <li class="border-b lg:py-[1px] px-2">Taekwondo</li>
                    <li class="border-b lg:py-[1px] px-2">Badminton</li>
                    <li class="border-b lg:py-[1px] px-2">Chess</li>
                    <li class="border-b lg:py-[1px] px-2">Scrabble</li>
                    <li class="border-b lg:py-[1px] px-2">Word factory</li>
                    <li class="lg:py-[1px] px-2">Dance Sports</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="lg:order-1 order-2">
              <PanaghugpongBEd />
            </div>
          </div>
          <PanaghugpongHEd class="w-full" />
        </div> -->
        <!-- <div>
          <h1 class="text-sm font-bold text-green-800">
            Previous Events <i class="fa fa-play mr-1 pl-1 lg:pt-3 pt-2 pb-2"></i>
          </h1>
          <Panaglambigit />
        </div> -->
      </div>
      <div class="w-11/12 mx-auto mb-10 border-t-4 mt-5">
        <h1 class="font-bold w-11/12 lg:text-2xl text-lg pt-2 text-green-900 lg:pb-3">
          New Student's Guidelines
        </h1>
        <div>
          <div class="lg:text-sm text-xs font-bold text-green-800 lg:pb-5 pb-3 flex items-center justify-between">
            <h1>Essentials and Tutorials <i class="fa fa-play mr-1 pl-1"></i></h1>
            <button @click="loadMore()" style="margin-right: -8px" class="rounded-lg">
              Show More Videos <i class="fa fa-plus-square"></i>
            </button>
          </div>
          <ul class="lg:grid lg:grid-cols-3 lg:gap-5 justify-left">
            <li v-for="(v, i) in itemsLoaded" :key="i" class="w-full">
              <iframe class="w-full lg:mb-0 mb-3 h-[200px]" :src="v.link" :title="v.title" frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen></iframe>
            </li>
          </ul>
          <a href="https://drive.google.com/drive/folders/1cF_h8nOjpBJ-UQX7OkSExKGA9i7toDN2"
            class="lg:flex block gap-10 justify-center lg:my-3 mx-auto lg:w-fit bg-white py-4 px-5 shadow">
            <!-- <video width="450" height="250" controls>
              <source src="/videos/student-portal.m4v" type="video/mp4" />
              Your browser does not support the video tag.
            </video> -->
            <p class="lg:my-auto lg:text-right text-center text-green-900 lg:text-base mb-3">
              Details About Student Portals
            </p>
            <div class="flex lg:gap-10 gap-5">
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/googledrive.png"
                class="lg:h-[50px] h-[35px] mx-auto" />
              <img
                src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/canvas.png"
                class="lg:h-[50px] h-[35px] mx-auto my-auto" />
            </div>
          </a>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
.tab-sched {
  border: 1px solid #969696;
  border-bottom: none;
}

.tab-sched:hover {
  border: 1px solid #969696;
  border-bottom: none;
  background: #00cc00;
  color: #000;
}

.tab-sched.active {
  background: #005e00;
  color: white !important;
  border-color: none !important;
}

button {
  padding: 6px 10px;
}

button:hover {
  background: #00cc00;
  color: #000;
}

button.active {
  background: #005e00 !important;
  color: white !important;
  border-color: none !important;
}

.usg {
  border: none;
}

.usg:hover {
  border: none;
}

.lasalle-green-header {
  background: #73f373;
}

.day-first {
  border-radius: 15px 0 0 0;
}

.day-last {
  border-radius: 0 15px 0 0;
}

.video {
  height: 900px;
}

@media only screen and (max-width: 1600px) {
  .video {
    height: 700px;
  }
}

@media only screen and (max-width: 700px) {
  .video {
    height: 500px;
  }

  .tab-sched.day-first {
    border-radius: 0;
  }

  .tab-sched.day-last {
    border-radius: 0;
  }
}</style>
