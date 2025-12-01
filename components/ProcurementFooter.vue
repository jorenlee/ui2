<script setup>
  import moment from "moment";
  const presentYear = ref(moment(new Date()).format("YYYY"));
  const socialMedia = ref([
    {
      link: "https://www.facebook.com/profile.php?id=100093081690183",
      image_link: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-fb.png",
      alternative_name: "FACEBOOK"
    },
    {
      link: "https://twitter.com",
      image_link: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-twt.png",
      alternative_name: "TWITTER"
    },
    {
      link: "https://www.instagram.com",
      image_link: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-ig.png",
      alternative_name: "INSTAGRAM"
    },
    {
      link: "https://youtube.com",
      image_link: "https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/icons/icon-yt.png",
      alternative_name: "YOUTUBE"
    }
  ])

  const important_links = ref([
    {
      link: "/data-privacy",
      text: "Privacy Policy"
    },
    {
      link: "/downloads",
      text: "Downloads"
    },
    {
      link: "/directory",
      text: "Contact Us"
    },
    {
      link: "/social-media",
      text: "Social Media"
    }
  ])
</script>

<template>
  <div class="lg:flex lg:relative">
    <div
      class="footer lg:h-full w-full h-auto text-center text-white relative border-t-4 border-green-900"
    >
      <div class="lg:flex mx-auto justify-center lg:pt-10 lg:pb-12 py-11 bg-custom">
        <div class="lg:ml-10 w-full">
          <div>
            <div>
              <div>
                <a href="https://lsu.edu.ph">
                  <img
                    src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/logos/lsu-w-h.png"
                    class="lg:w-2/12 md:w-3/12 w-8/12 mx-auto"
                    alt="LSU"
                  />
                </a>
                <h1
                  class="
                    font-bold
                    lg:text-2xl
                    text-xl
                    mt-5
                    uppercase
                    tracking-widest
                  "
                >
                  Reshaping Futures
                </h1>
                <p class="lg:text-base text-sm lg:w-11/12 mx-auto">
                  © {{presentYear}} La Salle University - Ozamiz
                </p>
  
                <p class="mx-auto text-xs lg:w-full w-11/12">
                  La Salle St. Barangay Aguada Ozamiz City, Misamis Occidental,
                  Philippines
                </p>
  
                <div class="mt-5 lg:block hidden">
                  <div class="mx-auto w-fit md:text-sm text-xs">
                    <ul class="lg:flex flex-wrap text-white text-center text-xs">
                      <li
                        v-for="(l,i) in important_links"
                        class="
                          lg:px-2
                          px-2
                          whitespace-nowrap
                          leading-4
                          hover:underline
                        "
                        :class="i === important_links.length - 1 ? '' : 'lg:border-r lg:border-white'"
                      >
                        <a :href="l.link">{{ l.text }}</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- City
          La Salle St., Barangay Aguada, Ozamiz City, Misamis Occidental,
          Philippines Trunklines: (088) 521-0342 | Integrated School: (088) 521-5150 / 586-0862 -->
          <!-- <p class="lg:text-base text-sm lg:w-10/12 mx-auto">
            <a class="inverted" href="#">Privacy Policy</a> |
            <a class="inverted" href="#">Online Request for Documents</a>
          </p> -->
          <!-- <div class="text-center lg:text-xs text-xs lg:w-3/12 w-11/12 mx-auto">
            is <b>under construction</b>. Visit
            <a class="underline" href="https://old.lsu.edu.ph">old website</a>.
          </div> -->
          </div>
          <div
            class="
              lg:bg-green-900
              pt-1
              right-0
              lg:w-14
              w-8/12
              mx-auto
              px-2
              shadow-3xl
              lg:border-2 lg:border-r-0 lg:border-white
              relative
              lg:mt-0
              mt-12
            "
          >
            <ul class="lg:block flex mx-auto lg:gap-0 gap-5">
              <li class="" v-for="(j, i) in socialMedia">
                <a
                  style="
                    box-shadow: 0 5px 12px 0 rgb(0 0 0 / 20%),
                      0 3px 5px 0 rgb(0 0 0 / 19%);
                  "
                  :href="j.link"
                >
                  <img
                    :src="j.image_link"
                    class="py-2 w-16 mx-auto"
                    :alt="j.alternative_name"
                  />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

</template>

<style>
.footer {
  background: url("https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/footer.jpg");
  background-size:cover;
}
</style>
