<script setup>
import teamData from "./data/team.json";
</script>

<template>
  <div class="bg-gray-50">
    <Header />
    <!-- Banner & Breadcrumb -->
    <div>
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
            Career and Counseling Center
          </h1>
        </div>
        <div class="pt-2.5 pb-3 shadow-lg">
          <ul class="flex text-white-text capitalize w-11/12 mx-auto text-xs">
            <li><a href="/" class="mr-1">Home</a></li>
            <li>
              <i class="fas fa-caret-right mr-1"></i>
              <a href="/ccc" class="mr-1">Career and Counseling Center</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="lg:flex gap-5 lg:px-5 px-2 mx-auto">
      <!-- Sidebar -->
      <div class="shadow lg:w-3/12 my-5 bg-white">
        <ul class="w-full">
          <li class="w-full">
           
            <ul>
              <li>
                <a
                  href="/ccc"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-white text-green-800 text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Career & Counseling Center
                </a>
              </li>

              <li>
                <a
                  href="/ccc/team"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-green-800 text-white text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  CCC Team
                </a>
              </li>
              <li>
                <a
                  href="/ccc/appointment/schedule"
                  class="whitespace-nowrap pr-2 items-center green-800-white px-2 py-1 font-bold flex border-b pl-5 bg-white text-green-800 text-xs cursor-pointer"
                >
                  <i class="fa fa-chevron-circle-right mr-2"></i>
                  Schedule an Appointment or Referral
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Team Section -->
      <div class="justify-center lg:w-10/12 mx-auto lg:my-5 my-3 shadow-lg">
        <main class="w-full bg-white rounded-lg shadow-lg lg:pb-0 pb-3">
          <div class="bg-green-700">
            <h2
              class="text-lg lg:text-xl font-bold text-white bg-green-700 px-2 py-1.5 text-center"
            >
              Meet the Team
            </h2>
          </div>

          <div class="lg:pb-5">
            <div class="w-full mx-auto px-8 py-2" v-if="teamData">
              <!-- Loop Members: Hierarchy Applied -->
              <div
                v-for="(member, index) in teamData.slice(0, 1)"
                :key="index"
                class="lg:w-full w-11/12 mx-auto lg:my-0 my-3 flex flex-col items-center text-center bg-gray-50 hover:bg-green-50 transition rounded-xl p-5 shadow-md hover:shadow-lg duration-300 transform hover:-translate-y-1"
              >
                <!-- Image -->
                <div class="relative mb-4">
                  <img
                    :src="member.img"
                    :alt="member.name"
                    class="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-white"
                  />
                </div>

                <!-- Info -->
                <div>
                  <h3
                    class="font-bold text-green-900 text-sm uppercase tracking-wide"
                  >
                    {{ member.name }}
                  </h3>
                  <p class="text-xs text-gray-700 font-medium mb-1">
                    {{ member.role }}
                  </p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
              </div>
            </div>

            <!-- Team Grid -->
            <div class="lg:flex w-full gap-8 lg:px-8 lg:py-2" v-if="teamData.length">
              <!-- Loop Members: Hierarchy Applied -->
              <div
                v-for="(member, index) in teamData.slice(1, 3)"
                :key="index"
                class="lg:w-full w-11/12 mx-auto lg:my-0 my-3 flex flex-col items-center text-center bg-gray-50 hover:bg-green-50 transition rounded-xl p-5 shadow-md hover:shadow-lg duration-300 transform hover:-translate-y-1"
              >
                <!-- Image -->
                <div class="relative mb-4">
                  <img
                    :src="member.img"
                    :alt="member.name"
                    class="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-white"
                  />
                </div>

                <!-- Info -->
                <div>
                  <h3
                    class="font-bold text-green-900 text-sm uppercase tracking-wide"
                  >
                    {{ member.name }}
                  </h3>
                  <p
                    class="text-xs px-4 text-green-800 py-2"
                    v-for="(j, i) in member.role.slice(0,1)"
                  >
                    {{ j }}
                  </p>
                  <p
                    class="text-[10px] px-4 text-white py-1 mb-2 rounded-lg bg-green-700 font-bold"
                    v-for="(j, i) in member.role.slice(1,5)"
                  >
                    {{ j }}
                  </p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
              </div>
            </div>

            <div
              class="lg:flex gap-8 lg:px-4 lg:py-2 w-full mx-auto"
              v-if="teamData.length"
            >
              <!-- Loop Members: Hierarchy Applied -->
              <div
                v-for="(member, index) in teamData.slice(3, 6)"
                :key="index"
                class="lg:w-full w-11/12 mx-auto lg:my-0 my-3 flex flex-col items-center text-center bg-gray-50 hover:bg-green-50 transition rounded-xl py-5 px-2 shadow-md hover:shadow-lg duration-300 transform hover:-translate-y-1"
              >
                <!-- Image -->
                <div class="relative mb-4">
                  <img
                    :src="member.img"
                    :alt="member.name"
                    class="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-white"
                  />
                </div>

                <!-- Info -->
                <div>
                  <h3
                    class="font-bold text-green-900 text-sm uppercase tracking-wide"
                  >
                    {{ member.name }}
                  </h3>
                  <p class="text-xs text-gray-700 font-medium mb-1">
                    {{ member.role }}
                  </p>
                  <p class="text-xs text-gray-500">{{ member.email }}</p>
                </div>
              </div>
            </div>

            <!-- Fallback if no team -->
            <div v-else class="text-center py-2 text-gray-500 text-sm">
              No team members found.
            </div>
          </div>
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style scoped></style>
