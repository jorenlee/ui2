<script setup>
const router = useRouter();
import tertiaryJSON from "../tertiary.json";
const tertiary = ref(tertiaryJSON.tertiary);

const underGrad = ref(true);
const gradStud = ref(false);

const schoolToggle = () => {
 router.push("/academics/tertiary-education")
}
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
        <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
          <h1
            class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
          >
            Tertiary Education
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul
            class="flex flex-wrap lasalle-green-text capitalize w-11/12 mx-auto text-xs"
          >
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a  href="/academics/tertiary-education" class="mr-1"> Academics </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a  href="/academics/tertiary-education" class="hover:underline mr-1"> Tertiary Education </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a  href="/academics/tertiary-education" class="flex-wrap capitalize mr-1"> degree programs </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
<div class=" flex"> 




<div class="font-montserrat w-full mx-auto my-5 px-5"> 
  <div class=" py-5 px-5 shadow">

  
    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/cthm.png" 
    class="w-32 mx-auto my-3 rounded-full" />

    <h1 class="text-center mt-0 text-lg"> COLLEGE OF TOURISM AND
      HOSPITALITY MANAGEMENT </h1>
<h2 class="text-center mt-5 text-md bg-green-700 text-white py-2"> BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT </h2>
<p class="text-sm text-center py-5" >BS Hospitality Management is a 4-year degree program that provides students
with globally-competent courses handled by the Certified Hospitality
Professionals issued by the Institute of Tourism and Hospitality Professionals - UK
(ITHP-UK), trained in the Hotel Property Management Systems - Micros Opera in
partnership with the De La Salle - College of Saint Benilde and current industry
practitioners who excel in the Hospitality industry. The program sends the
students to luxury hotels and resorts in the United States of America through
the International Practicum Training program for more than 10 years. It also
offers high-end educational hotel virtual training that includes immersions and
several webinars conducted by the industry partners abroad. With diverse
functions of business and management, the curriculum also provides the future
hospitality professionals to become critical thinkers with practical learning
experiences. In addition, it has designed an outcomes-based curriculum through
collaboration across disciplines on social-environmental reality. </p>

    <h2 class="text-center mt-5 text-md bg-green-700 text-white py-2"> BACHELOR OF SCIENCE IN TOURISM MANAGEMENT </h2>
<p class="text-sm text-center py-5" >The bachelor of Science in Tourism Management is specially designed for future
tourism planners, transportation managers and tourism ambassadors. It
provides students with a deeper analytical understanding of the social, political,
technological, environmental, historical, and cultural impacts of the tourism
industry. To produce graduates ready to work in diverse international
environments, students are trained in different foreign languages and are
expected to communicate in a multilingual manner.</p>

</div>
</div>

<div class="lg:w-4/12 pt-3 bg-gray-50 border-r shadow-lg"> 
  <div class="lg:w-11/12 mx-auto w-full mb-3  px-2 pt-2">
            <div v-for="(t, i) in tertiary" class="" :key="i">
              <div v-for="(tu, i) in t.under_grad" class="mb-2 border-l-4 bg-white shadow border-green-900" :key="i" @click="schoolToggle()">
                <div class="flex lg:text-sm text-xs py-2 text-center hover:bg-green-900 cursor-pointer text-green-900 hover:text-white ">

                  <i class="fa fa-caret-right px-3 pt-1"></i>
                
                  <span class="tracking-widest w-full flex px-3">
                    {{ tu.title }}
                  </span>

                

                </div>
              </div>
              <div v-for="(tu, i) in t.grad_stud" :key="i" class="border-l-4 bg-white shadow border-green-900" @click="schoolToggle()">
                <div class="flex lg:text-sm text-xs py-2 text-center hover:bg-green-900 cursor-pointer text-green-900 hover:text-white ">

                  <i class="fa fa-caret-right px-3 pt-1"></i>
                 
                  <span class="tracking-widest w-full flex px-3">
                    {{ tu.title }}
                  </span>

                 
                </div>
              </div>
            </div>
          </div>
</div>

</div>
    <Footer />
  </div>
</template>

<style></style>