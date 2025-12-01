<script setup>
  const schedules = [
    {
      day: "Monday-Tuesday",
      Onsite: "7:00 AM - 6:00 PM",
      Online: "8:00 AM - 5:00 PM",
    },
    {
      day: "Wednesday",
      Onsite: "8:00 AM - 5:00 PM",
      Online: "8:00 AM - 5:00 PM",
    },
    {
      day: "Thursday-Friday",
      Onsite: "7:00 AM - 6:00 PM",
      Online: "8:00 AM - 5:00 PM",
    },
    {
      day: "Saturday",
      Onsite: "8:00 AM - 5:00 PM",
      Online: "8:00 AM - 5:00 PM",
    },
    {
      day: "Sunday (as per request for School of Graduates Studies)",
      Onsite: "8:00 AM - 12:00 NN | 1:00 PM - 5:00 PM",
      Online: "8:00 AM - 12:00 NN | 1:00 PM - 5:00 PM",
    },
  ]
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <div class="">
      <div class="">
        <div class="relative">
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/about.jpg"
            class="align-top w-full h-auto lg:object-fill lg:block hidden"
          />
          <img
            src="https://raw.githubusercontent.com/jorenlee/lsu-public-images/main/images/images/banners/green-tones-gradient-background_23-2148374436.png"
            class="align-top w-full h-36 object-none lg:hidden block"
          />
          <div class="pt-10 absolute top-1/2 transform -translate-y-1/2 w-full">
            <h1
              class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto"
            >
              Library Service Hours
            </h1>
          </div>
          <div class="pt-2.5 pb-3 shadow-lg">
            <ul
              class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs"
            >
              <li>
                <a href="/" class="mr-1"> Home </a>
                <i class="fas fa-caret-right mr-1"></i>
              </li>

              <li>
                <a href="/library" class="mr-1">Libraries and Media Center</a>
              </li>
              <li>
                <i class="fas fa-caret-right mr-1"></i>
                <a href="/library" class="mr-1">
                  Library Service Hours
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="mx-auto py-10">
        <div class="lg:w-10/12 w-full px-10 mx-auto">
          <div class="block m-auto w-fit text-center gap-10">
            <!-- <h2 class="text-center lasalle-green-text text-lg mt-10 font-bold">
                What is the Library Service Hours for New
                Normal?</h2> -->
            <!-- <h1 class="text-center lasalle-green-text text-lg mb-10 mt-5">
                Library Service Hours
              </h1> -->
          </div>
          <!-- <div class="lg:flex mb-10 lg:text-left md:text-center">
              <div class="lg:mr-10 lg:ml-0 mx-auto w-fit">
                <img
                  src="../../../../../assets/banners/LMCImages/Picture1.png"
                  class="w-44 h-44"
                />
              </div>
              <div>
                <h1 class="my-5 lasalle-green-text">
                  Virtual Circulation Assistance (VICA)
                </h1>
                <div class="lg:flex lg:flex-auto">
                  <div>
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">Book Thru</a >
                    <p class="text-red-600">Mondays to Fridays</p>
                    <p>9:00 AM to 11:00 AM;</p>
                    <p>2:00 AM to 4:00 PM</p>
                  </div>
                  <div class="lg:ml-20">
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">Book Drop</a>
                    <p class="text-red-600">Mondays to Fridays</p>
                    <p>8:00 AM to 5:00 PM;</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="lg:flex mb-10 lg:text-left md:text-center">
              <div class="lg:mr-10 lg:ml-0 mx-auto w-fit">
                <img
                  src="../../../../../assets/banners/LMCImages/Picture20.png"
                  class="w-44 h-44"
                />
              </div>
              <div>
                <h1 class="my-5 lasalle-green-text">
                  Remote Access to Electronic Resources
                </h1>
                <div class="lg:flex lg:flex-auto">
                  <div>
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">Library Webpage</a>
                    <p class="text-red-600">Anytime</p>
                    <p>from Monday to Sunday</p>
                  </div>
                  <div class="lg:ml-14">
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">WebOaAC</a>
                    <p class="text-red-600">Anytime</p>
                    <p>from Monday to Sunday</p>
                  </div>
                  <div class="lg:ml-36">
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">
                      Subscribed Electronic Resources
                    </a >
                    <p class="text-red-600">Anytime</p>
                    <p>from Monday to Sunday</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="lg:flex mb-10 lg:text-left md:text-center">
              <div class="lg:mr-10 lg:ml-0 mx-auto w-fit">
                <img
                  src="../../../../../assets/banners/LMCImages/Picture19.png"
                  class="w-44 h-44"
                />
              </div>
              <div>
                <h1 class="my-5 lasalle-green-text">Librarian Help Online</h1>
                <div class="lg:flex lg:flex-auto">
                  <div>
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">Chat with VIRA</a>
                    <p class="text-red-600">Monday to Friday</p>
                    <p>9:00 AM to 12:00 NN;</p>
                    <p>1:30 PM to 4:30 PM</p>
                  </div>
                  <div class="lg:ml-20">
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">
                      Chat via Facebook Page or Messenger
                    </a>
                    <p class="text-red-600">Monday to Friday</p>
                    <p>9:00 AM to 12:00 NN;</p>
                    <p>1:30 PM to 4:30 PM</p>
                  </div>
                  <div class="lg:ml-10">
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">Via Email and Phone</a>
                    <p class="text-red-600">Monday to Friday</p>
                    <p>9:00 AM to 12:00 NN;</p>
                    <p>1:30 PM to 4:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="lg:flex mb-10 lg:text-left md:text-center">
              <div class="lg:mr-10 lg:ml-0 mx-auto w-fit">
                <img
                  src="../../../../../assets/banners/LMCImages/Picture8.png"
                  class="w-44 h-44"
                />
              </div>
              <div>
                <h1 class="my-5 lasalle-green-text">
                  Online Library Instruction
                </h1>
                <div class="flex flex-auto">
                  <div>
                    <a href="http://lsu.edu.ph" target="_blank" class=" block lasalle-green-text">
                      Information Literacy Sessions
                    </a>
                    <p class="text-red-600">Monday to Friday</p>
                    <p>9:00 AM to 12:00 NN;</p>
                    <p>1:30 PM to 4:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="block m-auto w-fit text-center gap-10 mt-20">
                <h1 class="lasalle-green-text font-bold">
                  "When in doubt, go to the library."
                </h1>
                <span class="block m-auto w-fit text-center mt-5"
                  >- J.K. Rowling</span
                >
              </div>
            </div> -->
          <div>
            <table
              class="table-auto border p-3 w-full shadow-2x1 font-[Poppins] border-2 border-green-500"
            >
              <thead class="text-white">
                <tr>
                  <th class="py-3 bg-green-900 font-bold text-white text-lg">
                    Day
                  </th>
                  <th class="py-3 bg-green-900 font-bold text-white text-lg">
                    Onsite
                  </th>
                  <th class="py-3 bg-green-900 font-bold text-white text-lg">
                    Online
                  </th>
                </tr>
              </thead>
              <tbody class="text-black text-center">
                <tr
                  v-for="(s, i) in schedules"
                  :key="i"
                  class="text-center cursor-pointer duration-300"
                >
                  <td class="py-3 px-6 border border-green-600 font-sans">
                    {{ s.day }}
                  </td>
                  <td class="py-3 px-6 border border-green-600 font-sans">
                    {{ s.Onsite }}
                  </td>
                  <td class="py-3 px-6 border border-green-600 font-sans">
                    {{ s.Online }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<style scoped>
@media only screen and (max-width: 1023px) {
  .sub-header {
    background: #087830;
  }
}
@media only screen and (max-width: 2560px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 1440px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 1024px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 768px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 425px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 375px) {
  .sub-header {
    height: 170px;
  }
}
@media only screen and (max-width: 320px) {
  .sub-header {
    height: 170px;
  }
}
</style>