<script setup>
const slides = ref([
  {
    id: 1,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s1.jpg",
    isChecked: true,
  },
  {
    id: 2,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s2.jpg",
    isChecked: false,
  },
  {
    id: 3,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s3.jpg",
    isChecked: false,
  },
  {
    id: 4,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s4.jpg",
    isChecked: false,
  },
  {
    id: 5,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s5.jpg",
    isChecked: false,
  },
  {
    id: 6,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s6.jpg",
    isChecked: false,
  },
  {
    id: 7,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s7.jpg",
    isChecked: false,
  },
  {
    id: 8,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s8.jpg",
    isChecked: false,
  },
  {
    id: 9,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s9.jpg",
    isChecked: false,
  },
  {
    id: 10,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s10.jpg",
    isChecked: false,
  },
  {
    id: 11,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s11.jpg",
    isChecked: false,
  },
  {
    id: 12,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s12.jpg",
    isChecked: false,
  },
  {
    id: 13,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s13.jpg",
    isChecked: false,
  },
  {
    id: 14,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s14.jpg",
    isChecked: false,
  },
  {
    id: 15,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/slides-landing-page/s15.jpg",
    isChecked: false,
  },
]);


let currentIndex = ref(0);

const nextSlide = () => {
  slides.value[currentIndex.value].isChecked = false;
  currentIndex.value = (currentIndex.value + 1) % slides.value.length;
  slides.value[currentIndex.value].isChecked = true;
};

onMounted(() => {
  setInterval(nextSlide, 5000); // Change slide every 5 seconds
});
</script>

<template>
<div class="relative"> 
  <div class="slider lg:pt-[80px] pt-[50px] bg-green-950">
    <input
      v-for="(j, i) in slides"
      :key="i"
      type="radio"
      name="testimonial"
      :id="'t-' + j.id"
      :checked="j.isChecked"
    />
    <div class="testimonials">
      <label class="item" :for="'t-' + j.id" v-for="(j, i) in slides" :key="i">
        <img :src="j.image" class="" alt="..." />
      </label>
    </div>
    <div class="dots py-3">
      <label :for="'t-' + j.id" v-for="(j, i) in slides" :key="i"></label>
    </div>
  </div>
  <div class="absolute bottom-0 w-full">
          <svg
            class="waves"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shape-rendering="auto"
          >
            <defs>
              <path
                id="gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g class="parallax">
              <use
                xlink:href="#gentle-wave"
                x="48"
                y="0"
                fill="rgba(255,255,255,0.7"
              />
              <use
                xlink:href="#gentle-wave"
                x="48"
                y="3"
                fill="rgba(255,255,255,0.5)"
              />
              <use
                xlink:href="#gentle-wave"
                x="48"
                y="5"
                fill="rgba(255,255,255,0.3)"
              />
              <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
            </g>
          </svg>
        </div>
 </div>
</template>

<style scoped>
.slider {
  width: 100%;
}
.slider input {
  display: none;
}

.testimonials {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 350px;
  perspective: 700px;
  overflow: hidden;
  z-index: 20;
}
.testimonials .item {
  width: 350px;
  height: 700px;
  border-radius: 5px;
  position: absolute;
  top: 0;
  box-sizing: border-box;
  text-align: center;
  transition: transform 0.4s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  user-select: none;
  cursor: pointer;
}

.testimonials .item p {
  color: #ddd;
}
.testimonials .item h2 {
  font-size: 14px;
}
.dots {
  display: flex;
  justify-content: center;
  align-items: center;
}

.dots label {
  height: 7px;
  width: 7px;
  border-radius: 50%;
  cursor: pointer;
  background-color: #145622;
  margin: 7px;
  transition-duration: 0.2s;
  z-index: 20;
}

#t-1:checked ~ .dots label[for="t-1"],
#t-2:checked ~ .dots label[for="t-2"],
#t-3:checked ~ .dots label[for="t-3"],
#t-4:checked ~ .dots label[for="t-4"],
#t-5:checked ~ .dots label[for="t-5"],
#t-6:checked ~ .dots label[for="t-6"],
#t-7:checked ~ .dots label[for="t-7"],
#t-8:checked ~ .dots label[for="t-8"],
#t-9:checked ~ .dots label[for="t-9"],
#t-10:checked ~ .dots label[for="t-10"],
#t-11:checked ~ .dots label[for="t-11"],
#t-12:checked ~ .dots label[for="t-12"],
#t-13:checked ~ .dots label[for="t-13"],
#t-14:checked ~ .dots label[for="t-14"],
#t-15:checked ~ .dots label[for="t-15"] {
  transform: scale(2);
  background-color: #c5de39;
}

#t-1:checked ~ .dots label[for="t-2"],
#t-2:checked ~ .dots label[for="t-1"],
#t-2:checked ~ .dots label[for="t-3"],
#t-3:checked ~ .dots label[for="t-2"],
#t-3:checked ~ .dots label[for="t-4"],
#t-4:checked ~ .dots label[for="t-3"],
#t-4:checked ~ .dots label[for="t-5"],
#t-5:checked ~ .dots label[for="t-4"],
#t-5:checked ~ .dots label[for="t-6"],
#t-6:checked ~ .dots label[for="t-5"],
#t-6:checked ~ .dots label[for="t-7"],
#t-7:checked ~ .dots label[for="t-6"],
#t-7:checked ~ .dots label[for="t-8"],
#t-8:checked ~ .dots label[for="t-7"],
#t-8:checked ~ .dots label[for="t-9"],
#t-9:checked ~ .dots label[for="t-8"],
#t-9:checked ~ .dots label[for="t-10"],
#t-10:checked ~ .dots label[for="t-9"],
#t-10:checked ~ .dots label[for="t-11"],
#t-11:checked ~ .dots label[for="t-10"],
#t-11:checked ~ .dots label[for="t-12"],
#t-12:checked ~ .dots label[for="t-11"],
#t-12:checked ~ .dots label[for="t-13"],
#t-13:checked ~ .dots label[for="t-12"],
#t-13:checked ~ .dots label[for="t-14"],
#t-14:checked ~ .dots label[for="t-13"],
#t-14:checked ~ .dots label[for="t-15"],
#t-15:checked ~ .dots label[for="t-14"],
#t-1:checked ~ .dots label[for="t-15"],
#t-15:checked ~ .dots label[for="t-1"] {
  transform: scale(1.5);
}

/* === Active testimonial z-index === */
#t-1:checked ~ .testimonials label[for="t-1"],
#t-2:checked ~ .testimonials label[for="t-2"],
#t-3:checked ~ .testimonials label[for="t-3"],
#t-4:checked ~ .testimonials label[for="t-4"],
#t-5:checked ~ .testimonials label[for="t-5"],
#t-6:checked ~ .testimonials label[for="t-6"],
#t-7:checked ~ .testimonials label[for="t-7"],
#t-8:checked ~ .testimonials label[for="t-8"],
#t-9:checked ~ .testimonials label[for="t-9"],
#t-10:checked ~ .testimonials label[for="t-10"],
#t-11:checked ~ .testimonials label[for="t-11"],
#t-12:checked ~ .testimonials label[for="t-12"],
#t-13:checked ~ .testimonials label[for="t-13"],
#t-14:checked ~ .testimonials label[for="t-14"],
#t-15:checked ~ .testimonials label[for="t-15"] {
  z-index: 3;
}

/* === Position +1 === */
#t-1:checked ~ .testimonials label[for="t-2"],
#t-2:checked ~ .testimonials label[for="t-3"],
#t-3:checked ~ .testimonials label[for="t-4"],
#t-4:checked ~ .testimonials label[for="t-5"],
#t-5:checked ~ .testimonials label[for="t-6"],
#t-6:checked ~ .testimonials label[for="t-7"],
#t-7:checked ~ .testimonials label[for="t-8"],
#t-8:checked ~ .testimonials label[for="t-9"],
#t-9:checked ~ .testimonials label[for="t-10"],
#t-10:checked ~ .testimonials label[for="t-11"],
#t-11:checked ~ .testimonials label[for="t-12"],
#t-12:checked ~ .testimonials label[for="t-13"],
#t-13:checked ~ .testimonials label[for="t-14"],
#t-14:checked ~ .testimonials label[for="t-15"],
#t-15:checked ~ .testimonials label[for="t-1"] {
  transform: translate3d(300px, 0, -90px) rotateY(-15deg);
  z-index: 2;
}

/* === Position +2 === */
#t-1:checked ~ .testimonials label[for="t-3"],
#t-2:checked ~ .testimonials label[for="t-4"],
#t-3:checked ~ .testimonials label[for="t-5"],
#t-4:checked ~ .testimonials label[for="t-6"],
#t-5:checked ~ .testimonials label[for="t-7"],
#t-6:checked ~ .testimonials label[for="t-8"],
#t-7:checked ~ .testimonials label[for="t-9"],
#t-8:checked ~ .testimonials label[for="t-10"],
#t-9:checked ~ .testimonials label[for="t-11"],
#t-10:checked ~ .testimonials label[for="t-12"],
#t-11:checked ~ .testimonials label[for="t-13"],
#t-12:checked ~ .testimonials label[for="t-14"],
#t-13:checked ~ .testimonials label[for="t-15"],
#t-14:checked ~ .testimonials label[for="t-1"],
#t-15:checked ~ .testimonials label[for="t-2"] {
  transform: translate3d(600px, 0, -180px) rotateY(-25deg);
  z-index: 1;
}

/* === Position +3 === */
#t-1:checked ~ .testimonials label[for="t-4"],
#t-2:checked ~ .testimonials label[for="t-5"],
#t-3:checked ~ .testimonials label[for="t-6"],
#t-4:checked ~ .testimonials label[for="t-7"],
#t-5:checked ~ .testimonials label[for="t-8"],
#t-6:checked ~ .testimonials label[for="t-9"],
#t-7:checked ~ .testimonials label[for="t-10"],
#t-8:checked ~ .testimonials label[for="t-11"],
#t-9:checked ~ .testimonials label[for="t-12"],
#t-10:checked ~ .testimonials label[for="t-13"],
#t-11:checked ~ .testimonials label[for="t-14"],
#t-12:checked ~ .testimonials label[for="t-15"],
#t-13:checked ~ .testimonials label[for="t-1"],
#t-14:checked ~ .testimonials label[for="t-2"],
#t-15:checked ~ .testimonials label[for="t-3"] {
  transform: translate3d(900px, 0, -270px) rotateY(-30deg);
  z-index: 0;
}

/* === Position -1 === */
#t-2:checked ~ .testimonials label[for="t-1"],
#t-3:checked ~ .testimonials label[for="t-2"],
#t-4:checked ~ .testimonials label[for="t-3"],
#t-5:checked ~ .testimonials label[for="t-4"],
#t-6:checked ~ .testimonials label[for="t-5"],
#t-7:checked ~ .testimonials label[for="t-6"],
#t-8:checked ~ .testimonials label[for="t-7"],
#t-9:checked ~ .testimonials label[for="t-8"],
#t-10:checked ~ .testimonials label[for="t-9"],
#t-11:checked ~ .testimonials label[for="t-10"],
#t-12:checked ~ .testimonials label[for="t-11"],
#t-13:checked ~ .testimonials label[for="t-12"],
#t-14:checked ~ .testimonials label[for="t-13"],
#t-15:checked ~ .testimonials label[for="t-14"],
#t-1:checked ~ .testimonials label[for="t-15"] {
  transform: translate3d(-300px, 0, -90px) rotateY(15deg);
  z-index: 2;
}

/* === Position -2 === */
#t-3:checked ~ .testimonials label[for="t-1"],
#t-4:checked ~ .testimonials label[for="t-2"],
#t-5:checked ~ .testimonials label[for="t-3"],
#t-6:checked ~ .testimonials label[for="t-4"],
#t-7:checked ~ .testimonials label[for="t-5"],
#t-8:checked ~ .testimonials label[for="t-6"],
#t-9:checked ~ .testimonials label[for="t-7"],
#t-10:checked ~ .testimonials label[for="t-8"],
#t-11:checked ~ .testimonials label[for="t-9"],
#t-12:checked ~ .testimonials label[for="t-10"],
#t-13:checked ~ .testimonials label[for="t-11"],
#t-14:checked ~ .testimonials label[for="t-12"],
#t-15:checked ~ .testimonials label[for="t-13"],
#t-1:checked ~ .testimonials label[for="t-14"],
#t-2:checked ~ .testimonials label[for="t-15"] {
  transform: translate3d(-600px, 0, -180px) rotateY(25deg);
  z-index: 1;
}

/* === Position -3 === */
#t-4:checked ~ .testimonials label[for="t-1"],
#t-5:checked ~ .testimonials label[for="t-2"],
#t-6:checked ~ .testimonials label[for="t-3"],
#t-7:checked ~ .testimonials label[for="t-4"],
#t-8:checked ~ .testimonials label[for="t-5"],
#t-9:checked ~ .testimonials label[for="t-6"],
#t-10:checked ~ .testimonials label[for="t-7"],
#t-11:checked ~ .testimonials label[for="t-8"],
#t-12:checked ~ .testimonials label[for="t-9"],
#t-13:checked ~ .testimonials label[for="t-10"],
#t-14:checked ~ .testimonials label[for="t-11"],
#t-15:checked ~ .testimonials label[for="t-12"],
#t-1:checked ~ .testimonials label[for="t-13"],
#t-2:checked ~ .testimonials label[for="t-14"],
#t-3:checked ~ .testimonials label[for="t-15"] {
  transform: translate3d(-900px, 0, -270px) rotateY(30deg);
  z-index: 0;
}







.waves {
  position: relative;
  width: 100%;
  height: 15vh;
  margin-bottom: -7px;
  /*Fix for safari gap*/
  min-height: 100px;
  max-height: 150px;

}

/* Animation */
.parallax > use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

/*Shrinking for mobile*/
@media (max-width: 768px) {
  .waves {
    height: 40px;
    min-height: 40px;
  }

  .content {
    height: 30vh;
  }

  h1 {
    font-size: 24px;
  }
}
</style>