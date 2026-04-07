<script setup></script>

<template>
  <div>
    <div
      class="gallery js-flickity w-8/12 mx-auto h-[390px]"
      data-flickity='{ "autoPlay": 4000 }'
    >
      <!--
  <div class="gallery-cell">
  </div>-->

      <a href="/investiture/program" class="flex">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/program-flow.png"
          class="gallery-cell hover:shadow-lg hover:border-green-600 shadow-lg border-green-900 hover:border-2 border-t border-t-gray-100"
        />
      </a>

      <a href="/investiture/president" class="flex">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/president.png"
          class="gallery-cell hover:shadow-lg hover:border-green-600 shadow-lg border-green-900 hover:border-2 border-t border-t-gray-100"
        />
      </a>

      <a href="/investiture" class="flex">
        <img
          src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/investiture/invitation.jpg"
          class="gallery-cell hover:shadow-lg hover:border-green-600 shadow-lg border-green-900 hover:border-2 border-t border-t-gray-100"
        />
      </a>

      <a href="/investiture" class="flex">
        <img
          src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/circleLSULogo.jpg"
          class="gallery-cell hover:shadow-lg hover:border-green-600 shadow-lg border-green-900 object-contain hover:border-2 border-t border-t-gray-100"
        />
      </a>
    </div>
  </div>
</template>

<style scoped>
/* external css: flickity.css */
/* 
* {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
} */

.gallery {
  background: #ffffff00;
  height: 400px;
  /* border-bottom: 30px solid green; */
}

.gallery-cell {
  width: 300px;
  height: 390px;
  margin: 0px 20px 20px 20px;
  background: #ffffff;
  counter-increment: gallery-cell;
}

/* cell number */
.gallery-cell:before {
  display: block;
  text-align: center;
  content: counter(gallery-cell);
  line-height: 390px;
  font-size: 80px;
  color: white;
}

@media only screen and (max-width: 400px) {
  .gallery {
    height: 370px;
  }
  .gallery-cell {
    width: 290px;
    height: 370px;
    margin: 0px 10px 20px 10px;
  }
}
</style>
