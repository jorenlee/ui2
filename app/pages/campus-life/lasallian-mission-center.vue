<script setup>
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
          <h1 class="font-bold uppercase text-white lg:text-2xl text-lg w-11/12 mx-auto">
            Campus Life
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex lasalle-green-text capitalize w-11/12 mx-auto text-xs">
            <li>
              <a href="/" class="mr-1"> Home </a>
            </li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/campus-life" class="mr-1"> Campus Life </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <div>
          <ul class="w-full">
            <li class="w-full">
              <span class="bg-green-800 uppercase text-white px-5 py-2 font-bold flex border-b-2 text-base">
                Campus Life
              </span>
              <ul>
                <li class="">
                  <a href="/campus-life/lasallian-mission-center" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Lasallian Mission Center
                  </a>
                </li>
                <li class="">
                  <a href="/campus-life/lasallian-formation-center" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Lasallian Formation Center
                  </a>
                </li>
                <li class="">
                  <a href="/campus-life/student-activities-center" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Student Activities Center
                  </a>
                </li>
                <!-- <li class="">
                  <a href="/campus-life/activities" class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 hover:bg-green-800 text-green-800 hover:text-white text-xs cursor-pointer">
                    <i class="fa fa-chevron-circle-right mr-2"></i>
                    Activities
                  </a>
                </li> -->
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div class="justify-center lg:w-9/12 mx-auto lg:my-5 my-3">
        <!-- Lasallian Mission Section -->
        <div class="bg-white shadow-lg rounded-lg mb-8 overflow-hidden">
          <div class="bg-green-800 text-white px-6 py-4">
            <h2 class="text-xl font-bold uppercase">The Lasallian Mission</h2>
          </div>
          <div class="p-6">
            <p class="text-sm leading-relaxed mb-6">
              The Lasallian Mission at LSU is essentially the mission of all members of the University. All are invited to integrate this Mission in accordance with their specific roles and expertise; whether in administration, academics, or research, contributing their part to the University becoming a resource for Church and nation.
            </p>

            <div class="grid lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-bold text-green-800 mb-3">Vision</h3>
                <p class="text-sm leading-relaxed">
                  Recognizing that the Lasallian Mission involves all personnel and functions in La Salle University Ozamiz, the Office of the Vice President for Lasallian Mission and its constituent units exist to provide Lasallian formation for all members of the University community.
                </p>
              </div>
              <div>
                <h3 class="text-lg font-bold text-green-800 mb-3">Mission</h3>
                <p class="text-sm leading-relaxed mb-4">
                  Ultimately, the goal of its efforts towards faith formation and community engagement is to help La Salle University Ozamiz become more and more a school of and for the poor.
                </p>
                <p class="text-sm leading-relaxed mb-4">
                  La Salle University is a school of the poor in as far as the Lasallian community is committed to providing full scholarships to at least 20% of its total population.
                </p>
                <p class="text-sm leading-relaxed">
                  LSU is also a school for the poor. Academic departments integrate relevant community engagement programs into their curriculum, as well as seek, wherever possible; to use their unique expertise to conduct research on poverty, in all its forms and, seek to develop sustainable solutions towards its alleviation.
                </p>
              </div>
            </div>

            <p class="text-sm leading-relaxed mb-6">
              The Vice President for Lasallian Mission is responsible for the supervision and coordination of all Lasallian Mission constituent offices, in consonance to De La Salle Philippines (DLSP), the Lasallian East Asia District (LEAD), and the International Community of Lasallians' advocacies and initiatives.
            </p>

            <div class="grid lg:grid-cols-2 gap-6">
              <div>
                <h3 class="text-lg font-bold text-green-800 mb-3">Responsibilities</h3>
                <ul class="text-sm space-y-2">
                  <li>• Reports to the University President</li>
                  <li>• Supervises the Directors/Administrators/Officers of Lasallian Mission constituent offices:</li>
                  <div class="ml-4 space-y-1 text-xs">
                    <li>- Arts and Culture Center</li>
                    <li>- Career and Counseling Center</li>
                    <li>- Lasallian Life Formation Center</li>
                    <li>- Lasallian Pastoral Center</li>
                    <li>- Lasallian Yearbook Center</li>
                    <li>- Practicum and Placement Center</li>
                    <li>- Social Concerns Center</li>
                    <li>- Sports and Wellness Center</li>
                    <li>- Student Affairs Center</li>
                  </div>
                  <li>• Coordinates with: Chancellor, Vice President(s), Vice Chancellor(s), College Deans</li>
                  <li>• Monitors the delivery of quality services to all members of the LSU community</li>
                  <li>• Set the vision and priorities for the Lasallian Mission Unit and ensure the implementation of objectives and strategies</li>
                </ul>
              </div>
              <div>
                <h3 class="text-lg font-bold text-green-800 mb-3">Roles</h3>
                <ul class="text-sm space-y-2">
                  <li>• Supervises the Lasallian Mission (LM) constituent offices, towards the fulfillment of its vision-mission</li>
                  <li>• Conducts performance evaluation of the respective LM constituent offices' directors</li>
                  <li>• Collects, records, and publishes documentation of achievements and activities</li>
                  <li>• Makes recommendations regarding participation in formation-related activities off-campus</li>
                  <li>• Recommends approval of requests/resolutions endorsed by the Lasallian Mission Offices</li>
                  <li>• Monitors preparation, publication, and distribution of student handbook, school paper, and yearbook</li>
                  <li>• Performs other related functions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <Footer />
  </div>
</template>

<style scoped>
</style>
