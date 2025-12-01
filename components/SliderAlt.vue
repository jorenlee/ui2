<script setup>
const slides = ref([
  {
    id: 1,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/president.jpg",
    isChecked: false,
  },
  {
    id: 2,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/invitation.jpg",
    isChecked: false,
  },
  {
    id: 3,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/campus-dev.jpg",
    isChecked: true,
  },
  {
    id: 4,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/program-flow.jpg",
    isChecked: false,
  },
  {
    id: 5,
    image: "https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/president.jpg",
    isChecked: false,
  },
]);
</script>

<template>
  <div class="slider lg:pt-[80px] pt-[50px] bg-white">
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
        <img :src="j.image" class="bg-white" alt="..." />
      </label>
    </div>
    <div class="dots py-3">
      <label :for="'t-' + j.id" v-for="(j, i) in slides" :key="i"></label>
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
  min-height: 500px;
  perspective: 1000px;
  overflow: hidden;
}
.testimonials .item {
  width: 500px;
  height: 1000px;
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
  background-color: #413b52;
  margin: 7px;
  transition-duration: 0.2s;
}

#t-1:checked ~ .dots label[for="t-1"],
#t-2:checked ~ .dots label[for="t-2"],
#t-3:checked ~ .dots label[for="t-3"],
#t-4:checked ~ .dots label[for="t-4"],
#t-5:checked ~ .dots label[for="t-5"] {
  transform: scale(2);
  background-color: #fff;
}
#t-1:checked ~ .dots label[for="t-2"],
#t-2:checked ~ .dots label[for="t-1"],
#t-2:checked ~ .dots label[for="t-3"],
#t-3:checked ~ .dots label[for="t-2"],
#t-3:checked ~ .dots label[for="t-4"],
#t-4:checked ~ .dots label[for="t-3"],
#t-4:checked ~ .dots label[for="t-5"],
#t-5:checked ~ .dots label[for="t-4"] {
  transform: scale(1.5);
}
#t-1:checked ~ .testimonials label[for="t-5"] {
  transform: translate3d(1200px, 0, -360px) rotateY(-45deg);
}
#t-1:checked ~ .testimonials label[for="t-4"],
#t-2:checked ~ .testimonials label[for="t-5"] {
  transform: translate3d(900px, 0, -270px) rotateY(-35deg);
  z-index: 1;
}
#t-1:checked ~ .testimonials label[for="t-3"],
#t-2:checked ~ .testimonials label[for="t-4"],
#t-3:checked ~ .testimonials label[for="t-5"] {
  transform: translate3d(600px, 0, -180px) rotateY(-25deg);
  z-index: 2;
}
#t-1:checked ~ .testimonials label[for="t-2"],
#t-2:checked ~ .testimonials label[for="t-3"],
#t-3:checked ~ .testimonials label[for="t-4"],
#t-4:checked ~ .testimonials label[for="t-5"] {
  transform: translate3d(300px, 0, -90px) rotateY(-15deg);
  z-index: 3;
}
#t-2:checked ~ .testimonials label[for="t-1"],
#t-3:checked ~ .testimonials label[for="t-2"],
#t-4:checked ~ .testimonials label[for="t-3"],
#t-5:checked ~ .testimonials label[for="t-4"] {
  transform: translate3d(-300px, 0, -90px) rotateY(15deg);
  z-index: 3;
}
#t-3:checked ~ .testimonials label[for="t-1"],
#t-4:checked ~ .testimonials label[for="t-2"],
#t-5:checked ~ .testimonials label[for="t-3"] {
  transform: translate3d(-600px, 0, -180px) rotateY(25deg);
}
#t-5:checked ~ .testimonials label[for="t-2"],
#t-4:checked ~ .testimonials label[for="t-1"] {
  transform: translate3d(-900px, 0, -270px) rotateY(35deg);
}
#t-5:checked ~ .testimonials label[for="t-1"] {
  transform: translate3d(-1200px, 0, -360px) rotateY(45deg);
}
#t-1:checked ~ .testimonials label[for="t-1"],
#t-2:checked ~ .testimonials label[for="t-2"],
#t-3:checked ~ .testimonials label[for="t-3"],
#t-4:checked ~ .testimonials label[for="t-4"],
#t-5:checked ~ .testimonials label[for="t-4"],
#t-5:checked ~ .testimonials label[for="t-5"] {
  z-index: 4;
}
</style>