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

    <img src="https://lsu-media-styles.sgp1.digitaloceanspaces.com/lsu-public-images/banners/logo/colleges/CCJE.jpg" 
    class="w-32 mx-auto my-3 rounded-full" />

    <h1 class="text-center mt-0 text-lg"> COLLEGE OF CRIMINAL JUSTICE EDUCATION </h1>
      <h2 class="text-center mt-5 text-md bg-green-700 text-white py-2"> BACHELOR OF SCIENCE IN CRIMINOLOGY (PAASCU ACCREDITED) </h2>
      <p class="text-sm text-center py-5"> The Bachelor of Science in Criminology has produced proud alumni who hold
      various law and peace-keeping positions in the city, the province, and the
      country. As the leading Criminology program in this part of Mindanao, it seeks to
      promote responsible students through the assimilation of a noble concept of
      citizenship, leadership, moral, and legal responsibilities to their fellowmen and
      community. </p>


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